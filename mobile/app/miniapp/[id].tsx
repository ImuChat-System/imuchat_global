/**
 * MiniAppScreen — Route dynamique pour charger un module mini-app.
 *
 * Phase M2 : intégration react-native-webview + MiniAppHostMobile + MobileBridge.
 *
 * Flux :
 * - Si le module est installé ET a un entry_url → charge MiniAppHostMobile (WebView)
 * - Si le module n'est pas installé → affiche un écran d'installation
 * - Si le module n'a pas d'entry_url → affiche un message (module core natif)
 */

import MiniAppHostMobile from "@/components/miniapps/MiniAppHostMobile";
import { useNetworkState } from "@/hooks/useNetworkState";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing, useTheme } from "@/providers/ThemeProvider";
import { useModulesStore } from "@/stores/modules-store";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MiniAppScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const spacing = useSpacing();
  const { theme: themeCtx } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { isConnected: isOnline } = useNetworkState();

  const {
    catalog,
    fetchCatalog,
    isInstalled,
    getInstalledModule,
    getCatalogModule,
    install,
  } = useModulesStore();

  const [installing, setInstalling] = useState(false);

  // Fetch catalog if not already loaded
  useEffect(() => {
    if (catalog.length === 0) {
      fetchCatalog();
    }
  }, [catalog.length, fetchCatalog]);

  // Find the module
  const module = useMemo(
    () => catalog.find((m) => m.id === id) ?? null,
    [catalog, id],
  );

  const installed = id ? isInstalled(id) : false;
  const userModule = id ? getInstalledModule(id) : undefined;

  // Build theme object for the bridge
  const bridgeTheme = useMemo(
    () => ({
      mode: themeCtx.mode,
      primaryColor: colors.primary,
      backgroundColor: colors.background,
      textColor: colors.text,
    }),
    [themeCtx.mode, colors.primary, colors.background, colors.text],
  );

  // ─── Callbacks ─────────────────────────────────────────────

  const handleReady = useCallback(() => {
    // Mini-app prête — le status overlay disparaît dans MiniAppHostMobile
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleError = useCallback((error: Error) => {
    if (__DEV__) {
      console.warn("[MiniApp Error]", error.message);
    }
  }, []);

  const handleInstall = useCallback(async () => {
    if (!module) return;
    setInstalling(true);
    try {
      await install(module.id, module.permissions);
    } catch (e) {
      Alert.alert(
        t("store.installFailed"),
        e instanceof Error ? e.message : String(e),
      );
    } finally {
      setInstalling(false);
    }
  }, [module, install, t]);

  // ─── Not found ─────────────────────────────────────────────
  if (catalog.length > 0 && !module) {
    return (
      <>
        <Stack.Screen options={{ title: t("miniapp.notFound") }} />
        <View
          style={[
            styles.container,
            styles.centered,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            {t("miniapp.notFound")}
          </Text>
          <Text style={[styles.errorDesc, { color: colors.textMuted }]}>
            {t("miniapp.notFoundDesc")}
          </Text>
          <TouchableOpacity
            style={[styles.backBtn, { borderColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backBtnText, { color: colors.primary }]}>
              {t("common.back")}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  // ─── Loading catalog ───────────────────────────────────────
  if (!module) {
    return (
      <>
        <Stack.Screen options={{ title: "..." }} />
        <View
          style={[
            styles.container,
            styles.centered,
            { backgroundColor: colors.background },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  // ─── Module found but NOT installed → Invite à installer ──
  if (!installed) {
    return (
      <>
        <Stack.Screen
          options={{
            title: module.name,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
        <View
          style={[
            styles.container,
            styles.centered,
            { backgroundColor: colors.background, padding: spacing.lg },
          ]}
        >
          <Text style={styles.bigIcon}>{module.icon || "📦"}</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {module.name}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            v{module.version} · {module.author}
          </Text>
          <Text
            style={[styles.desc, { color: colors.textMuted, marginBottom: 24 }]}
          >
            {module.description}
          </Text>

          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.statusIcon}>⚠️</Text>
            <Text style={[styles.statusText, { color: colors.text }]}>
              {t("miniapp.notInstalled")}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.installBtn,
              { backgroundColor: colors.primary },
              (installing || isOnline === false) && { opacity: 0.6 },
            ]}
            onPress={handleInstall}
            disabled={installing || isOnline === false}
          >
            {installing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.installBtnText}>
                {isOnline === false
                  ? t("store.offlineInstall")
                  : t("miniapp.installAndOpen")}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.backBtn, { borderColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backBtnText, { color: colors.primary }]}>
              {t("common.back")}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  // ─── Module installed but no entry_url (core / native) ────
  if (!module.entry_url) {
    return (
      <>
        <Stack.Screen
          options={{
            title: module.name,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
        <View
          style={[
            styles.container,
            styles.centered,
            { backgroundColor: colors.background, padding: spacing.lg },
          ]}
        >
          <Text style={styles.bigIcon}>{module.icon || "📦"}</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {module.name}
          </Text>
          <Text
            style={[
              styles.desc,
              { color: colors.textMuted, textAlign: "center" },
            ]}
          >
            {t("miniapp.coreNative")}
          </Text>
          <TouchableOpacity
            style={[
              styles.backBtn,
              { borderColor: colors.primary, marginTop: 24 },
            ]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backBtnText, { color: colors.primary }]}>
              {t("common.back")}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  // ─── Module installed + has entry_url → LOAD WebView ──────
  return (
    <>
      <Stack.Screen
        options={{
          title: module.name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <MiniAppHostMobile
          manifest={module}
          grantedPermissions={
            userModule?.granted_permissions ?? module.permissions
          }
          onReady={handleReady}
          onClose={handleClose}
          onError={handleError}
          theme={bridgeTheme}
        />

        {/* Dev info strip */}
        {__DEV__ && (
          <View style={[styles.devStrip, { backgroundColor: colors.surface }]}>
            <Text style={[styles.devLabel, { color: colors.textMuted }]}>
              🛠 {module.id} · {module.entry_url}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },

  // Info screens
  bigIcon: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 12 },
  desc: { fontSize: 14, lineHeight: 20 },

  // Status
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
    gap: 10,
    alignSelf: "stretch",
  },
  statusIcon: { fontSize: 20 },
  statusText: { fontSize: 14, fontWeight: "600", flex: 1 },

  // Install button
  installBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 200,
    alignItems: "center",
  },
  installBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // Error
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  errorDesc: { fontSize: 14, textAlign: "center", marginBottom: 20 },

  // Back button
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  backBtnText: { fontSize: 14, fontWeight: "600" },

  // Dev strip
  devStrip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  devLabel: { fontSize: 10, fontFamily: "monospace" },
});
