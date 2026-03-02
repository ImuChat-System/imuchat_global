/**
 * SignatureScreen — Pad de signature électronique (natif)
 *
 * Fonctionnalités :
 *  - Dessin de signature avec gestes tactiles
 *  - Sauvegarde SVG path + capture PNG
 *  - Gestion des signatures (liste, par défaut, suppression)
 *  - Demandes de signature sur documents
 *
 * Phase — DEV-019 Module Office
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
import { useOfficeStore } from "@/stores/office-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignatureScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();
  const { showToast } = useToast();

  const {
    signatures,
    signatureRequests,
    loadSignatures,
    loadSignatureRequests,
    createSignature,
    deleteSignature,
    setDefaultSignature,
  } = useOfficeStore();

  const [mode, setMode] = useState<"list" | "draw">("list");
  const [signatureName, setSignatureName] = useState("");
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");

  // ─── Load data ──────────────────────────────────────────
  useEffect(() => {
    loadSignatures();
    loadSignatureRequests();
  }, [loadSignatures, loadSignatureRequests]);

  // ─── Pan responder for drawing ──────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(`M${locationX.toFixed(1)},${locationY.toFixed(1)}`);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(
          (prev) => `${prev} L${locationX.toFixed(1)},${locationY.toFixed(1)}`,
        );
      },
      onPanResponderRelease: () => {
        if (currentPath) {
          setPaths((prev) => [...prev, currentPath]);
          setCurrentPath("");
        }
      },
    }),
  ).current;

  // ─── Actions ────────────────────────────────────────────
  const handleClear = useCallback(() => {
    setPaths([]);
    setCurrentPath("");
  }, []);

  const handleSave = useCallback(async () => {
    if (paths.length === 0) {
      showToast(t("office.drawFirst"), "error");
      return;
    }
    if (!signatureName.trim()) {
      showToast(t("office.signatureNameRequired"), "error");
      return;
    }

    const svgPath = paths.join(" ");
    // In a real app, we'd capture the view as PNG. For MVP, we store a placeholder.
    const pngBase64 = ""; // TODO: capture with react-native-view-shot

    await createSignature(signatureName, svgPath, pngBase64);
    showToast(t("office.signatureSaved"), "success");
    handleClear();
    setSignatureName("");
    setMode("list");
  }, [paths, signatureName, createSignature, showToast, t, handleClear]);

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteSignature(id);
      showToast(t("office.signatureDeleted"), "success");
    },
    [deleteSignature, showToast, t],
  );

  const handleSetDefault = useCallback(
    async (id: string) => {
      await setDefaultSignature(id);
      showToast(t("office.signatureSetDefault"), "success");
    },
    [setDefaultSignature, showToast, t],
  );

  // ─── SVG path rendering (simplified) ───────────────────
  const renderSVGPreview = (svgPath: string, width: number, height: number) => {
    // Simplified preview — in production, use react-native-svg <Path>
    return (
      <View
        style={[
          styles.svgPreview,
          {
            width,
            height,
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name="create" size={24} color={colors.primary} />
        <Text
          style={{ fontSize: 10, color: colors.secondaryText, marginTop: 4 }}
          numberOfLines={1}
        >
          {svgPath.substring(0, 30)}...
        </Text>
      </View>
    );
  };

  // ─── List mode ──────────────────────────────────────────
  if (mode === "list") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.listHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity testID="sig-back" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.listTitle, { color: colors.text }]}>
            ✍️ {t("office.signatures")}
          </Text>
          <TouchableOpacity
            testID="new-signature"
            onPress={() => setMode("draw")}
          >
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {signatures.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48 }}>✍️</Text>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              {t("office.noSignatures")}
            </Text>
            <TouchableOpacity
              testID="create-first-signature"
              style={[styles.createBtn, { backgroundColor: colors.primary }]}
              onPress={() => setMode("draw")}
            >
              <Text style={{ color: "#FFF", fontWeight: "600" }}>
                {t("office.createSignature")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={signatures}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: spacing.md,
              paddingTop: 12,
              paddingBottom: 40,
            }}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.signatureCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: item.is_default
                      ? colors.primary
                      : colors.border,
                    borderWidth: item.is_default ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.sigCardHeader}>
                  {renderSVGPreview(item.svg_path, 80, 48)}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.sigName, { color: colors.text }]}>
                      {item.name}
                    </Text>
                    <Text
                      style={[styles.sigDate, { color: colors.secondaryText }]}
                    >
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                    {item.is_default && (
                      <Text
                        style={[styles.defaultBadge, { color: colors.primary }]}
                      >
                        ★ {t("office.default")}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.sigActions}>
                  {!item.is_default && (
                    <TouchableOpacity
                      testID={`set-default-${item.id}`}
                      onPress={() => handleSetDefault(item.id)}
                      style={[
                        styles.sigActionBtn,
                        { borderColor: colors.border },
                      ]}
                    >
                      <Ionicons
                        name="star-outline"
                        size={16}
                        color={colors.primary}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.primary,
                          marginLeft: 4,
                        }}
                      >
                        {t("office.setDefault")}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    testID={`delete-sig-${item.id}`}
                    onPress={() => handleDelete(item.id)}
                    style={[styles.sigActionBtn, { borderColor: "#E53E3E40" }]}
                  >
                    <Ionicons name="trash-outline" size={16} color="#E53E3E" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        {/* Signature requests section */}
        {signatureRequests.length > 0 && (
          <View
            style={[styles.requestsSection, { borderTopColor: colors.border }]}
          >
            <Text style={[styles.requestsTitle, { color: colors.text }]}>
              📋 {t("office.signatureRequests")} ({signatureRequests.length})
            </Text>
            {signatureRequests.slice(0, 5).map((req) => (
              <View
                key={req.id}
                style={[
                  styles.requestCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Ionicons
                  name={
                    req.status === "signed"
                      ? "checkmark-circle"
                      : req.status === "rejected"
                        ? "close-circle"
                        : "time"
                  }
                  size={20}
                  color={
                    req.status === "signed"
                      ? "#34A853"
                      : req.status === "rejected"
                        ? "#E53E3E"
                        : "#FF9500"
                  }
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text
                    style={[styles.reqDocTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {req.document_title}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.secondaryText }}>
                    {req.signer_name} ·{" "}
                    {new Date(req.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  // ─── Draw mode ──────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.drawHeader,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity testID="draw-back" onPress={() => setMode("list")}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.drawTitle, { color: colors.text }]}>
          {t("office.drawSignature")}
        </Text>
        <TouchableOpacity testID="save-signature" onPress={handleSave}>
          <Text style={[styles.saveBtn, { color: colors.primary }]}>
            {t("office.save")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Signature name */}
      <TextInput
        testID="signature-name"
        style={[
          styles.nameInput,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
        placeholder={t("office.signatureNamePlaceholder")}
        placeholderTextColor={colors.secondaryText}
        value={signatureName}
        onChangeText={setSignatureName}
      />

      {/* Drawing canvas */}
      <View
        testID="signature-canvas"
        style={[
          styles.canvas,
          { backgroundColor: "#FFFFFF", borderColor: colors.border },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Render paths as dots to show something is drawn */}
        {paths.length === 0 && !currentPath && (
          <Text style={styles.canvasPlaceholder}>{t("office.signHere")}</Text>
        )}
        {paths.length > 0 && (
          <View style={styles.canvasDrawn}>
            <Ionicons name="checkmark" size={32} color="#34A853" />
            <Text style={{ color: "#333", fontSize: 13, marginTop: 4 }}>
              {paths.length} {t("office.strokes")}
            </Text>
          </View>
        )}
      </View>

      {/* Canvas actions */}
      <View style={styles.canvasActions}>
        <TouchableOpacity
          testID="clear-canvas"
          style={[styles.clearBtn, { borderColor: colors.border }]}
          onPress={handleClear}
        >
          <Ionicons name="refresh" size={20} color={colors.secondaryText} />
          <Text style={{ color: colors.secondaryText, marginLeft: 6 }}>
            {t("office.clear")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  listTitle: { fontSize: 20, fontWeight: "700" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingBottom: 80,
  },
  emptyText: { fontSize: 15, textAlign: "center" },
  createBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  signatureCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  sigCardHeader: { flexDirection: "row", alignItems: "center" },
  svgPreview: {
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sigName: { fontSize: 16, fontWeight: "600" },
  sigDate: { fontSize: 12, marginTop: 2 },
  defaultBadge: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  sigActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 8,
  },
  sigActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  requestsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  requestsTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  requestCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  reqDocTitle: { fontSize: 14, fontWeight: "500" },
  drawHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  drawTitle: { fontSize: 17, fontWeight: "600" },
  saveBtn: { fontSize: 16, fontWeight: "600" },
  nameInput: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  canvas: {
    margin: 16,
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  canvasPlaceholder: {
    fontSize: 18,
    color: "#999",
    fontStyle: "italic",
  },
  canvasDrawn: { alignItems: "center" },
  canvasActions: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 24,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
});
