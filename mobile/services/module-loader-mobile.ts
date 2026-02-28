/**
 * Module Loader Mobile — Résolution d'URL et chargement des mini-apps
 * pour react-native-webview.
 *
 * Port du loader.ts web adapté pour mobile :
 * - URL de base : EXPO_PUBLIC_MINIAPPS_CDN_URL (env var)
 * - Pas de distinction iframe/webcomponent → toujours "webview"
 * - Génère le SDK injecté (window.ImuChat) pour la mini-app
 */

import type { StoredModuleManifest } from '@/types/modules';
import { createLogger } from './logger';

const log = createLogger('ModuleLoader');

// ─── Configuration ──────────────────────────────────────────

/** URL de base pour les bundles mini-app (CDN ou Supabase Storage) */
const DEFAULT_BASE_URL =
    process.env.EXPO_PUBLIC_MINIAPPS_CDN_URL || 'https://miniapps.imuchat.com';

// ─── Public API ─────────────────────────────────────────────

/**
 * Résout l'URL d'entrée d'une mini-app.
 *   - URL absolue (http/https) → passe directement
 *   - URL relative → préfixe avec baseUrl
 */
export function resolveEntryUrl(
    manifest: StoredModuleManifest,
    baseUrl?: string,
): string {
    const { entry_url } = manifest;

    if (!entry_url) {
        log.warn(`Module ${manifest.id} has no entry_url`);
        return '';
    }

    if (entry_url.startsWith('http://') || entry_url.startsWith('https://')) {
        return entry_url;
    }

    const base = baseUrl ?? DEFAULT_BASE_URL;
    // S'assurer qu'il n'y a pas de double slash
    const separator = base.endsWith('/') || entry_url.startsWith('/') ? '' : '/';
    return `${base}${separator}${entry_url}`;
}

/**
 * Détermine le mode sandbox. Sur mobile c'est toujours "webview".
 * (Côté web il y a iframe / webcomponent / worker)
 */
export function resolveSandbox(
    _manifest: StoredModuleManifest,
): 'webview' {
    return 'webview';
}

/**
 * Prépare le chargement d'une mini-app.
 * Retourne l'URL résolue + le mode sandbox.
 */
export function loadFromStore(
    manifest: StoredModuleManifest,
    options?: { baseUrl?: string },
): { url: string; sandbox: 'webview' } {
    const url = resolveEntryUrl(manifest, options?.baseUrl);
    const sandbox = resolveSandbox(manifest);
    log.info(`Loading ${manifest.id} → ${url} (${sandbox})`);
    return { url, sandbox };
}

// ─── Injected JavaScript SDK ────────────────────────────────

/**
 * Génère le script JavaScript à injecter dans la WebView AVANT le chargement
 * de la page. Ce script fournit `window.ImuChat` — le SDK que les mini-apps
 * utilisent pour communiquer avec l'app hôte.
 *
 * Côté web, les mini-apps utilisent `@imuchat/miniapp-sdk` qui fait du
 * `parent.postMessage()`. Ici, on utilise `window.ReactNativeWebView.postMessage()`
 * (fourni automatiquement par react-native-webview) et on écoute les réponses
 * via `window.addEventListener('message')`.
 */
export function generateInjectedSDK(appId: string): string {
    return `
(function() {
    'use strict';

    // ── Pending requests (attente de réponse du bridge) ──
    var _pending = {};
    var _eventHandlers = {};

    // ── Helpers ──────────────────────────────────────────
    function generateId() {
        return 'sdk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    }

    function sendRequest(namespace, method, params) {
        return new Promise(function(resolve, reject) {
            var id = generateId();
            var message = {
                type: 'request',
                id: id,
                namespace: namespace,
                method: method,
                params: params || null,
                appId: '${appId}'
            };
            _pending[id] = { resolve: resolve, reject: reject };

            // Timeout après 15s
            setTimeout(function() {
                if (_pending[id]) {
                    delete _pending[id];
                    reject(new Error('Bridge request timeout: ' + namespace + '.' + method));
                }
            }, 15000);

            // Envoyer vers React Native
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify(message));
            } else {
                delete _pending[id];
                reject(new Error('ReactNativeWebView bridge not available'));
            }
        });
    }

    // ── Recevoir les réponses/événements du bridge hôte ──
    window.addEventListener('message', function(event) {
        var msg = event.data;

        // Accepter string ou objet
        if (typeof msg === 'string') {
            try { msg = JSON.parse(msg); } catch(e) { return; }
        }

        if (!msg || !msg.type) return;

        // Réponses
        if (msg.type === 'response' && msg.id && _pending[msg.id]) {
            var p = _pending[msg.id];
            delete _pending[msg.id];
            if (msg.error) {
                p.reject(new Error(msg.error.message || msg.error.code));
            } else {
                p.resolve(msg.result);
            }
            return;
        }

        // Événements push
        if (msg.type === 'event' && msg.method) {
            var handlers = _eventHandlers[msg.method] || [];
            for (var i = 0; i < handlers.length; i++) {
                try { handlers[i](msg.params); } catch(e) { console.error('[ImuChat SDK] Event handler error:', e); }
            }
        }
    });

    // ── SDK public : window.ImuChat ──────────────────────
    window.ImuChat = {
        appId: '${appId}',

        // Handshake (appelé automatiquement par le SDK)
        _handshake: function() {
            return sendRequest('system', 'handshake', null);
        },

        // Auth
        auth: {
            getUser: function() { return sendRequest('auth', 'getUser'); },
            isAuthenticated: function() { return sendRequest('auth', 'isAuthenticated'); },
            getAccessToken: function() { return sendRequest('auth', 'getAccessToken'); },
        },

        // Storage (isolé par mini-app)
        storage: {
            get: function(key) { return sendRequest('storage', 'get', { key: key }); },
            set: function(key, value) { return sendRequest('storage', 'set', { key: key, value: value }); },
            remove: function(key) { return sendRequest('storage', 'remove', { key: key }); },
            keys: function() { return sendRequest('storage', 'keys'); },
            clear: function() { return sendRequest('storage', 'clear'); },
        },

        // Theme
        theme: {
            getCurrent: function() { return sendRequest('theme', 'getCurrent'); },
        },

        // UI
        ui: {
            showToast: function(message, type) { return sendRequest('ui', 'showToast', { message: message, type: type || 'info' }); },
            showModal: function(opts) { return sendRequest('ui', 'showModal', opts); },
            close: function() { return sendRequest('ui', 'close'); },
            setNavBar: function(opts) { return sendRequest('ui', 'setNavBar', opts); },
        },

        // Notifications
        notifications: {
            send: function(title, body) { return sendRequest('notifications', 'send', { title: title, body: body }); },
            requestPermission: function() { return sendRequest('notifications', 'requestPermission'); },
        },

        // Wallet
        wallet: {
            getBalance: function() { return sendRequest('wallet', 'getBalance'); },
            requestPayment: function(opts) { return sendRequest('wallet', 'requestPayment', opts); },
        },

        // Chat
        chat: {
            getActiveChatId: function() { return sendRequest('chat', 'getActiveChatId'); },
            sendMessage: function(opts) { return sendRequest('chat', 'sendMessage', opts); },
            shareCard: function(opts) { return sendRequest('chat', 'shareCard', opts); },
        },

        // Events
        on: function(event, handler) {
            if (!_eventHandlers[event]) _eventHandlers[event] = [];
            _eventHandlers[event].push(handler);
        },
        off: function(event, handler) {
            if (!_eventHandlers[event]) return;
            _eventHandlers[event] = _eventHandlers[event].filter(function(h) { return h !== handler; });
        },
    };

    // Auto-handshake
    window.ImuChat._handshake().then(function(result) {
        console.log('[ImuChat SDK] Connected:', result);
    }).catch(function(err) {
        console.error('[ImuChat SDK] Handshake failed:', err);
    });
})();
true;
`;
}
