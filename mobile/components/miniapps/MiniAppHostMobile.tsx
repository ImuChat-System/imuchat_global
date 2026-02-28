/**
 * MiniAppHostMobile — Composant React Native qui charge une mini-app
 * dans une WebView sandboxée via react-native-webview.
 *
 * Port du MiniAppHost.tsx web adapté pour mobile :
 * - WebView remplace iframe
 * - MobileBridge remplace HostBridge
 * - AsyncStorage remplace localStorage
 * - Expo Notifications remplace browser Notification API
 * - Alert.alert remplace CustomEvent dispatch pour le toast/modal
 *
 * Cycle de vie :
 * 1. WebView charge l'URL d'entrée + SDK injecté (window.ImuChat)
 * 2. Le SDK fait un handshake automatique
 * 3. MobileBridge reçoit le handshake → status = 'ready'
 * 4. Les requêtes API sont routées via handleRequest
 * 5. Les événements système (thème, visibilité) sont poussés
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { createLogger } from "@/services/logger";
import { MobileBridge, type RequestHandler } from "@/services/mobile-bridge";
import {
  generateInjectedSDK,
  resolveEntryUrl,
} from "@/services/module-loader-mobile";
import { getCurrentUser } from "@/services/supabase";
import type { StoredModuleManifest } from "@/types/modules";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

const log = createLogger("MiniAppHost");

// ─── Types ──────────────────────────────────────────────────

export interface MiniAppHostMobileProps {
  /** Manifest du module (depuis la DB) */
  manifest: StoredModuleManifest;
  /** Permissions accordées par l'utilisateur */
  grantedPermissions: string[];
  /** URL de base pour les bundles (optionnel) */
  baseUrl?: string;
  /** Callback quand la mini-app est prête */
  onReady?: () => void;
  /** Callback quand la mini-app demande à fermer */
  onClose?: () => void;
  /** Callback sur erreur */
  onError?: (error: Error) => void;
  /** Données utilisateur (pré-fetched pour éviter les appels async dans le render) */
  user?: {
    id: string;
    email?: string;
  } | null;
  /** Thème actuel */
  theme?: {
    mode: "light" | "dark";
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
}

type HostStatus = "loading" | "connecting" | "ready" | "error";

const HANDSHAKE_TIMEOUT_MS = 10_000;

// ─── Component ──────────────────────────────────────────────

export default function MiniAppHostMobile({
  manifest,
  grantedPermissions,
  baseUrl,
  onReady,
  onClose,
  onError,
  user,
  theme,
}: MiniAppHostMobileProps) {
  const webViewRef = useRef<WebView>(null);
  const bridgeRef = useRef<MobileBridge | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<HostStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const colors = useColors();
  const { t } = useI18n();

  // Résoudre l'URL d'entrée
  const entryUrl = resolveEntryUrl(manifest, baseUrl);

  // SDK JavaScript injecté avant le chargement de la page
  const injectedJS = generateInjectedSDK(manifest.id);

  // ─── Request Handler (miroir du MiniAppHost web) ────────

  const handleRequest: RequestHandler = useCallback(
    async (namespace, method, params, _appId) => {
      switch (namespace) {
        // ── Auth ──────────────────────────────
        case "auth": {
          switch (method) {
            case "getUser":
              return user ?? (await getCurrentUser()) ?? null;
            case "isAuthenticated":
              return !!(user ?? (await getCurrentUser()));
            case "getAccessToken":
              return {
                token: `miniapp_${manifest.id}_${Date.now()}`,
                expiresIn: 3600,
              };
            default:
              throw new Error(`Unknown auth method: ${method}`);
          }
        }

        // ── Storage (isolé par mini-app via AsyncStorage) ──
        case "storage": {
          const storageKey = (params as Record<string, string>)?.key;
          const prefix = `miniapp:${manifest.id}:`;

          switch (method) {
            case "get": {
              const val = await AsyncStorage.getItem(prefix + storageKey);
              return val ?? null;
            }
            case "set": {
              const value = (params as Record<string, string>)?.value;
              await AsyncStorage.setItem(
                prefix + storageKey,
                typeof value === "string" ? value : JSON.stringify(value),
              );
              return true;
            }
            case "remove": {
              await AsyncStorage.removeItem(prefix + storageKey);
              return true;
            }
            case "keys": {
              const allKeys = await AsyncStorage.getAllKeys();
              return allKeys
                .filter((k) => k.startsWith(prefix))
                .map((k) => k.slice(prefix.length));
            }
            case "clear": {
              const all = await AsyncStorage.getAllKeys();
              const toRemove = all.filter((k) => k.startsWith(prefix));
              if (toRemove.length > 0) {
                await AsyncStorage.multiRemove(toRemove);
              }
              return true;
            }
            default:
              throw new Error(`Unknown storage method: ${method}`);
          }
        }

        // ── Theme ─────────────────────────────
        case "theme": {
          switch (method) {
            case "getCurrent":
              return (
                theme ?? {
                  mode: "dark",
                  primaryColor: colors.primary,
                  backgroundColor: colors.background,
                  textColor: colors.text,
                }
              );
            default:
              throw new Error(`Unknown theme method: ${method}`);
          }
        }

        // ── UI ────────────────────────────────
        case "ui": {
          switch (method) {
            case "showToast": {
              const toastData = params as {
                message: string;
                type?: string;
              };
              // Sur mobile, on utilise Alert comme fallback.
              // Un vrai toast system sera branché sur le provider global.
              Alert.alert(manifest.name, toastData.message);
              return true;
            }
            case "showModal": {
              const modalData = params as {
                title?: string;
                message?: string;
              };
              Alert.alert(
                modalData.title ?? manifest.name,
                modalData.message ?? "",
              );
              return true;
            }
            case "close":
              onClose?.();
              return true;
            case "setNavBar":
              // TODO: intégrer avec le header Expo Router
              return true;
            default:
              throw new Error(`Unknown ui method: ${method}`);
          }
        }

        // ── Notifications ─────────────────────
        case "notifications": {
          switch (method) {
            case "send": {
              // TODO: Utiliser expo-notifications pour les notifs locales
              const notif = params as {
                title: string;
                body: string;
              };
              log.info(`Notification from ${manifest.id}: ${notif.title}`);
              return true;
            }
            case "requestPermission":
              // TODO: expo-notifications requestPermissionsAsync
              return true;
            default:
              throw new Error(`Unknown notifications method: ${method}`);
          }
        }

        // ── Wallet ────────────────────────────
        case "wallet": {
          switch (method) {
            case "getBalance":
              return {
                amount: 0,
                currency: "IMU",
                formatted: "0 IMU",
              };
            case "requestPayment":
              throw new Error("Payment not yet implemented");
            default:
              throw new Error(`Unknown wallet method: ${method}`);
          }
        }

        // ── Chat ──────────────────────────────
        case "chat": {
          switch (method) {
            case "getActiveChatId":
              return null;
            case "sendMessage":
              throw new Error("Chat send not yet implemented");
            case "shareCard":
              throw new Error("Share card not yet implemented");
            default:
              throw new Error(`Unknown chat method: ${method}`);
          }
        }

        default:
          throw new Error(`Unknown API namespace: ${namespace}`);
      }
    },
    [manifest.id, manifest.name, user, theme, colors, onClose],
  );

  // ─── Bridge lifecycle ────────────────────────────────────

  /**
   * Appelé quand la WebView finit de charger l'URL.
   */
  const handleWebViewLoad = useCallback(() => {
    log.info(`WebView loaded for ${manifest.id}`);
    setStatus("connecting");

    const bridge = new MobileBridge({
      appId: manifest.id,
      webViewRef: webViewRef as React.RefObject<WebView>,
      grantedPermissions,
      onRequest: handleRequest,
      onReady: () => {
        log.info(`MiniApp ${manifest.id} ready`);
        setStatus("ready");
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        onReady?.();
      },
    });

    bridgeRef.current = bridge;

    // Handshake timeout
    timeoutRef.current = setTimeout(() => {
      if (!bridge.connected) {
        log.warn(`Handshake timeout for ${manifest.id}`);
        setStatus("error");
        setErrorMessage(t("miniapp.handshakeTimeout"));
        onError?.(new Error("MiniApp handshake timeout"));
      }
    }, HANDSHAKE_TIMEOUT_MS);
  }, [manifest.id, grantedPermissions, handleRequest, onReady, onError, t]);

  /**
   * WebView.onMessage — reçoit les messages du SDK injecté.
   */
  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    bridgeRef.current?.handleMessage(event.nativeEvent.data);
  }, []);

  // Transmettre les changements de thème
  useEffect(() => {
    if (theme && bridgeRef.current?.connected) {
      bridgeRef.current.sendEvent("theme:changed", theme);
    }
  }, [theme]);

  // Transmettre les changements de visibilité (AppState)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      bridgeRef.current?.sendEvent("visibility:changed", {
        visible: state === "active",
      });
    });
    return () => sub.remove();
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      bridgeRef.current?.disconnect();
      bridgeRef.current = null;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // ─── Retry ───────────────────────────────────────────────

  const handleRetry = useCallback(() => {
    setStatus("loading");
    setErrorMessage("");
    bridgeRef.current?.disconnect();
    bridgeRef.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Force reload de la WebView
    webViewRef.current?.reload();
  }, []);

  // ─── Render ──────────────────────────────────────────────

  if (!entryUrl) {
    return (
      <View style={[styles.overlay, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorIcon]}>⚠️</Text>
        <Text style={[styles.errorText, { color: colors.text }]}>
          {t("miniapp.noEntryUrl")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Loading / Connecting overlay */}
      {(status === "loading" || status === "connecting") && (
        <View style={[styles.overlay, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.overlayText, { color: colors.textMuted }]}>
            {status === "loading"
              ? t("miniapp.loadingApp")
              : t("miniapp.connecting")}
          </Text>
        </View>
      )}

      {/* Error overlay */}
      {status === "error" && (
        <View style={[styles.overlay, { backgroundColor: colors.background }]}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {errorMessage || t("miniapp.loadError")}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            onPress={handleRetry}
          >
            <Text style={styles.retryBtnText}>{t("miniapp.retry")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: entryUrl }}
        style={[styles.webview, status === "error" && styles.hidden]}
        // SDK injecté avant le chargement de la page
        injectedJavaScriptBeforeContentLoaded={injectedJS}
        // Recevoir les messages du SDK
        onMessage={handleWebViewMessage}
        // Quand la page a fini de charger
        onLoadEnd={handleWebViewLoad}
        // Erreurs de chargement
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          log.error(`WebView error: ${nativeEvent.description}`);
          setStatus("error");
          setErrorMessage(nativeEvent.description || t("miniapp.loadError"));
          onError?.(new Error(nativeEvent.description));
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          log.error(
            `WebView HTTP error: ${nativeEvent.statusCode} ${nativeEvent.url}`,
          );
          if (nativeEvent.statusCode >= 400) {
            setStatus("error");
            setErrorMessage(`HTTP ${nativeEvent.statusCode}`);
          }
        }}
        // Sécurité
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Isolation : pas d'accès aux cookies/storage de l'app principale
        thirdPartyCookiesEnabled={false}
        sharedCookiesEnabled={false}
        // Performance
        cacheEnabled={true}
        // User agent custom pour identifier les requests mini-app côté serveur
        applicationNameForUserAgent={`ImuChatMobile/${manifest.id}`}
        // Désactiver le zoom pour les mini-apps
        scalesPageToFit={false}
        // Android: autoriser le JS alert()
        setSupportMultipleWindows={false}
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  webview: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
    height: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  overlayText: {
    fontSize: 14,
    marginTop: 8,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
