/**
 * MobileBridge — Côté hôte (app mère) de la communication postMessage avec
 * les mini-apps chargées dans react-native-webview.
 *
 * Port du HostBridge web adapté à React Native :
 * - Pas de `window.addEventListener('message')` → on reçoit les messages
 *   via le callback `onMessage` de la WebView.
 * - Pas de `iframe.contentWindow.postMessage()` → on utilise
 *   `webViewRef.current.injectJavaScript()` pour poster un message.
 *
 * Le protocole BridgeMessage reste identique au web.
 */

import type { BridgeMessage } from '@/types/modules';
import type WebView from 'react-native-webview';
import { createLogger } from './logger';

const log = createLogger('MobileBridge');

// ─── Types ──────────────────────────────────────────────────

export type RequestHandler = (
    namespace: string,
    method: string,
    params: unknown,
    appId: string,
) => Promise<unknown>;

export interface MobileBridgeConfig {
    /** ID de la mini-app connectée */
    appId: string;
    /** Ref vers la WebView contenant la mini-app */
    webViewRef: React.RefObject<WebView>;
    /** Permissions accordées à cette mini-app */
    grantedPermissions: string[];
    /** Handler pour traiter les requêtes API */
    onRequest: RequestHandler;
    /** Callback quand la mini-app est prête (handshake terminé) */
    onReady?: () => void;
    /** Callback quand la mini-app envoie un log */
    onLog?: (level: string, message: string) => void;
}

// ─── Bridge ─────────────────────────────────────────────────

export class MobileBridge {
    private config: MobileBridgeConfig;
    private isConnected = false;

    constructor(config: MobileBridgeConfig) {
        this.config = config;
    }

    // ─── Public API ─────────────────────────────────────────

    /**
     * Appelé depuis la WebView.onMessage callback.
     * Parse le JSON et route vers handleRequest.
     */
    async handleMessage(rawData: string): Promise<void> {
        let message: BridgeMessage;
        try {
            message = JSON.parse(rawData) as BridgeMessage;
        } catch {
            log.warn('Message non-JSON reçu de la WebView:', rawData.slice(0, 120));
            return;
        }

        // Valider la structure minimale
        if (!message || !message.type || message.appId !== this.config.appId) {
            return;
        }

        if (message.type === 'request') {
            await this.handleRequest(message);
        }
    }

    /**
     * Envoie un événement push vers la mini-app.
     */
    sendEvent(event: string, data: unknown): void {
        this.postToWebView({
            type: 'event',
            id: this.generateId(),
            namespace: 'system',
            method: event,
            params: data,
            appId: this.config.appId,
        });
    }

    /**
     * Vérifie si une permission est accordée.
     */
    hasPermission(permission: string): boolean {
        return this.config.grantedPermissions.includes(permission);
    }

    /**
     * Nettoie et notifie la mini-app de la destruction.
     */
    disconnect(): void {
        this.isConnected = false;
        this.sendEvent('destroy', undefined);
        log.info(`Bridge disconnected for ${this.config.appId}`);
    }

    /** Le bridge est-il connecté (handshake terminé) ? */
    get connected(): boolean {
        return this.isConnected;
    }

    // ─── Private ────────────────────────────────────────────

    private async handleRequest(message: BridgeMessage): Promise<void> {
        // Handshake spécial
        if (message.namespace === 'system' && message.method === 'handshake') {
            this.isConnected = true;
            log.info(`Handshake OK for ${this.config.appId}`);

            this.postToWebView({
                type: 'response',
                id: message.id,
                namespace: 'system',
                method: 'handshake',
                result: { status: 'connected', appId: this.config.appId },
                appId: this.config.appId,
            });

            this.sendEvent('ready', undefined);
            this.config.onReady?.();
            return;
        }

        // Vérifier les permissions pour les namespaces non-system
        if (message.namespace !== 'system') {
            const requiredPermission = this.getRequiredPermission(
                message.namespace,
                message.method,
            );
            if (requiredPermission && !this.hasPermission(requiredPermission)) {
                log.warn(
                    `Permission denied: ${requiredPermission} for ${message.namespace}.${message.method}`,
                );
                this.postToWebView({
                    type: 'response',
                    id: message.id,
                    namespace: message.namespace,
                    method: message.method,
                    error: {
                        code: 'PERMISSION_DENIED',
                        message: `Permission "${requiredPermission}" not granted for ${message.namespace}.${message.method}`,
                    },
                    appId: this.config.appId,
                });
                return;
            }
        }

        // Déléguer au handler
        try {
            const result = await this.config.onRequest(
                message.namespace,
                message.method,
                message.params,
                this.config.appId,
            );

            this.postToWebView({
                type: 'response',
                id: message.id,
                namespace: message.namespace,
                method: message.method,
                result,
                appId: this.config.appId,
            });
        } catch (error) {
            log.error(`Request error ${message.namespace}.${message.method}:`, error);
            this.postToWebView({
                type: 'response',
                id: message.id,
                namespace: message.namespace,
                method: message.method,
                error: {
                    code: 'INTERNAL_ERROR',
                    message:
                        error instanceof Error ? error.message : 'Unknown error',
                },
                appId: this.config.appId,
            });
        }
    }

    /**
     * Détermine la permission requise pour un appel API donné.
     * Miroir exact de la carte côté web (host-bridge.ts).
     */
    private getRequiredPermission(
        namespace: string,
        method: string,
    ): string | null {
        const permissionMap: Record<string, Record<string, string>> = {
            auth: {
                getUser: 'auth:read',
                isAuthenticated: 'auth:read',
                getAccessToken: 'auth:read',
                getProfile: 'auth:profile',
            },
            chat: {
                getActiveChatId: 'chat:read',
                sendMessage: 'chat:send',
                shareCard: 'chat:send',
                getGroups: 'chat:groups',
            },
            wallet: {
                getBalance: 'wallet:read',
                requestPayment: 'wallet:transfer',
            },
            notifications: {
                send: 'notifications:send',
                requestPermission: 'notifications:read',
            },
            storage: {
                get: 'storage:read',
                keys: 'storage:read',
                set: 'storage:write',
                remove: 'storage:write',
                clear: 'storage:write',
            },
            ui: {
                showToast: 'ui:toast',
                showModal: 'ui:modal',
                setNavBar: 'ui:toast',
                close: 'ui:toast',
            },
            theme: {
                getCurrent: 'theme:read',
            },
        };

        return permissionMap[namespace]?.[method] ?? null;
    }

    /**
     * Envoie un message à la WebView en injectant du JS.
     * Utilise `window.dispatchEvent(new MessageEvent(...))` côté WebView
     * pour que le SDK ImuChatBridge le reçoive comme un postMessage.
     */
    private postToWebView(message: BridgeMessage): void {
        const webView = this.config.webViewRef.current;
        if (!webView) {
            log.warn('WebView ref is null, cannot post message');
            return;
        }

        const json = JSON.stringify(message);
        // injectJavaScript exécute du JS dans le contexte de la page.
        // On dispatche un MessageEvent pour que window.addEventListener('message') le capte.
        const script = `
            (function() {
                window.dispatchEvent(new MessageEvent('message', { data: ${json} }));
            })();
            true;
        `;
        webView.injectJavaScript(script);
    }

    private generateId(): string {
        return `host_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }
}
