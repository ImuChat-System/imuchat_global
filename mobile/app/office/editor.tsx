/**
 * EditorScreen — Éditeur de texte riche (natif)
 *
 * Fonctionnalités :
 *  - Édition par blocs (paragraphe, titres, listes, citations, code)
 *  - Barre d'outils de mise en forme
 *  - Sauvegarde automatique
 *  - Tags et organisation par dossiers
 *  - Export multi-format
 *
 * Phase — DEV-019 Module Office
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
import * as OfficeAPI from "@/services/office-api";
import { useOfficeStore } from "@/stores/office-store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { TextBlock, TextFormatting } from "@/types/office";

// ─── Helpers ────────────────────────────────────────────────

function generateBlockId(): string {
  return (
    "blk_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
  );
}

function createBlock(type: TextBlock["type"], content: string): TextBlock {
  return {
    id: generateBlockId(),
    type,
    content,
    formatting: [],
    metadata: {},
  };
}

export default function EditorScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();
  const { showToast } = useToast();
  const { docId, isNew } = useLocalSearchParams<{
    docId?: string;
    isNew?: string;
  }>();

  const {
    currentDocument,
    openDocument,
    closeDocument,
    createDocument,
    updateDocument,
  } = useOfficeStore();

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<TextBlock[]>([
    createBlock("paragraph", ""),
  ]);
  const [activeBlockIdx, setActiveBlockIdx] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [docIdState, setDocIdState] = useState<string | null>(docId || null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Load document on mount ─────────────────────────────
  useEffect(() => {
    if (docId && !isNew) {
      openDocument(docId);
    }
    return () => {
      closeDocument();
    };
  }, [docId, isNew, openDocument, closeDocument]);

  // ─── Populate fields from current document ──────────────
  useEffect(() => {
    if (currentDocument && !isNew) {
      setTitle(currentDocument.title);
      if (currentDocument.blocks && currentDocument.blocks.length > 0) {
        setBlocks(currentDocument.blocks);
      } else if (currentDocument.content) {
        setBlocks([createBlock("paragraph", currentDocument.content)]);
      }
      setDocIdState(currentDocument.id);
    }
  }, [currentDocument, isNew]);

  // ─── Auto-save (debounced) ──────────────────────────────
  const scheduleAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      const contentText = blocks.map((b) => b.content).join("\n");
      const wordCount = OfficeAPI.countWords(contentText);

      if (docIdState) {
        await updateDocument(docIdState, {
          title: title || t("office.untitled"),
          content: contentText,
          blocks,
        });
      } else {
        const doc = await createDocument(
          title || t("office.untitled"),
          "note",
          contentText,
        );
        setDocIdState(doc.id);
      }
      setHasChanges(false);
    }, 1500);
  }, [blocks, title, docIdState, updateDocument, createDocument, t]);

  useEffect(() => {
    if (hasChanges) {
      scheduleAutoSave();
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [hasChanges, scheduleAutoSave]);

  // ─── Block operations ───────────────────────────────────

  const updateBlockContent = useCallback((idx: number, content: string) => {
    setBlocks((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], content };
      return next;
    });
    setHasChanges(true);
  }, []);

  const addBlockAfter = useCallback((idx: number) => {
    const newBlock = createBlock("paragraph", "");
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    setActiveBlockIdx(idx + 1);
    setHasChanges(true);
  }, []);

  const deleteBlock = useCallback(
    (idx: number) => {
      if (blocks.length <= 1) return;
      setBlocks((prev) => prev.filter((_, i) => i !== idx));
      setActiveBlockIdx(Math.max(0, idx - 1));
      setHasChanges(true);
    },
    [blocks.length],
  );

  const changeBlockType = useCallback(
    (idx: number, type: TextBlock["type"]) => {
      setBlocks((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], type };
        return next;
      });
      setHasChanges(true);
    },
    [],
  );

  const toggleFormatting = useCallback(
    (fmt: TextFormatting) => {
      setBlocks((prev) => {
        const next = [...prev];
        const block = next[activeBlockIdx];
        const existing = block.formatting || [];
        const hasFormat = existing.includes(fmt);
        next[activeBlockIdx] = {
          ...block,
          formatting: hasFormat
            ? existing.filter((f) => f !== fmt)
            : [...existing, fmt],
        };
        return next;
      });
      setHasChanges(true);
    },
    [activeBlockIdx],
  );

  // ─── Export ─────────────────────────────────────────────
  const handleExport = useCallback(
    (format: "txt" | "md" | "html") => {
      if (!docIdState) return;
      const store = useOfficeStore.getState();
      const result = store.exportDocument(docIdState, format);
      if (result) {
        showToast(t("office.exported"), "success");
      }
    },
    [docIdState, showToast, t],
  );

  // ─── Block style helper ─────────────────────────────────
  const getBlockStyle = (block: TextBlock) => {
    switch (block.type) {
      case "heading1":
        return { fontSize: 28, fontWeight: "800" as const };
      case "heading2":
        return { fontSize: 22, fontWeight: "700" as const };
      case "heading3":
        return { fontSize: 18, fontWeight: "600" as const };
      case "quote":
        return {
          fontSize: 15,
          fontStyle: "italic" as const,
          borderLeftWidth: 3,
          borderLeftColor: colors.primary,
          paddingLeft: 12,
        };
      case "code":
        return {
          fontSize: 14,
          fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
          backgroundColor: colors.card,
          padding: 8,
          borderRadius: 6,
        };
      case "bulletList":
        return { fontSize: 15, paddingLeft: 16 };
      case "numberedList":
        return { fontSize: 15, paddingLeft: 16 };
      default:
        return { fontSize: 15 };
    }
  };

  const getBlockPrefix = (block: TextBlock, index: number): string => {
    if (block.type === "bulletList") return "• ";
    if (block.type === "numberedList") {
      // Count consecutive numbered list blocks before this one
      let count = 1;
      for (let i = index - 1; i >= 0; i--) {
        if (blocks[i].type === "numberedList") count++;
        else break;
      }
      return `${count}. `;
    }
    return "";
  };

  // ─── Formatting toolbar ─────────────────────────────────
  const renderToolbar = () => {
    const formatButtons: Array<{
      format?: TextFormatting;
      icon: string;
      label: string;
    }> = [
      { format: "bold", icon: "text", label: "B" },
      { format: "italic", icon: "text", label: "I" },
      { format: "underline", icon: "text", label: "U" },
    ];

    const blockTypeButtons: Array<{
      type: TextBlock["type"];
      icon: string;
    }> = [
      { type: "paragraph", icon: "text" },
      { type: "heading1", icon: "text" },
      { type: "heading2", icon: "text" },
      { type: "bulletList", icon: "list" },
      { type: "numberedList", icon: "list" },
      { type: "quote", icon: "chatbox-ellipses" },
      { type: "code", icon: "code-slash" },
    ];

    const activeBlock = blocks[activeBlockIdx];
    const activeFormats = activeBlock?.formatting || [];

    return (
      <View
        style={[
          styles.toolbar,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Format buttons */}
          {formatButtons.map((btn) => {
            const isActive = btn.format && activeFormats.includes(btn.format);
            return (
              <TouchableOpacity
                key={btn.label}
                testID={`fmt-${btn.label}`}
                style={[
                  styles.toolbarBtn,
                  isActive && { backgroundColor: colors.primary + "30" },
                ]}
                onPress={() => btn.format && toggleFormatting(btn.format)}
              >
                <Text
                  style={[
                    styles.toolbarBtnText,
                    { color: isActive ? colors.primary : colors.text },
                    btn.label === "B" && { fontWeight: "800" },
                    btn.label === "I" && { fontStyle: "italic" },
                    btn.label === "U" && { textDecorationLine: "underline" },
                  ]}
                >
                  {btn.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View
            style={[styles.toolbarDivider, { backgroundColor: colors.border }]}
          />

          {/* Block type buttons */}
          {blockTypeButtons.map((btn) => {
            const isActive = activeBlock?.type === btn.type;
            return (
              <TouchableOpacity
                key={btn.type}
                testID={`block-${btn.type}`}
                style={[
                  styles.toolbarBtn,
                  isActive && { backgroundColor: colors.primary + "30" },
                ]}
                onPress={() => changeBlockType(activeBlockIdx, btn.type)}
              >
                <Ionicons
                  name={btn.icon as any}
                  size={18}
                  color={isActive ? colors.primary : colors.secondaryText}
                />
              </TouchableOpacity>
            );
          })}

          <View
            style={[styles.toolbarDivider, { backgroundColor: colors.border }]}
          />

          {/* Add block */}
          <TouchableOpacity
            testID="add-block"
            style={styles.toolbarBtn}
            onPress={() => addBlockAfter(activeBlockIdx)}
          >
            <Ionicons name="add-circle" size={20} color={colors.primary} />
          </TouchableOpacity>

          {/* Delete block */}
          <TouchableOpacity
            testID="delete-block"
            style={styles.toolbarBtn}
            onPress={() => deleteBlock(activeBlockIdx)}
          >
            <Ionicons name="trash" size={18} color="#E53E3E" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header bar */}
      <View
        style={[
          styles.headerBar,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          testID="back-button"
          onPress={() => router.back()}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {hasChanges && (
            <Text style={[styles.savingBadge, { color: colors.secondaryText }]}>
              {t("office.saving")}
            </Text>
          )}
          {!hasChanges && docIdState && (
            <Text style={[styles.savedBadge, { color: colors.primary }]}>
              ✓ {t("office.saved")}
            </Text>
          )}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            testID="export-md"
            onPress={() => handleExport("md")}
            style={styles.headerBtn}
          >
            <Ionicons name="share-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title input */}
      <TextInput
        testID="editor-title"
        style={[styles.titleInput, { color: colors.text }]}
        placeholder={t("office.titlePlaceholder")}
        placeholderTextColor={colors.secondaryText}
        value={title}
        onChangeText={(val) => {
          setTitle(val);
          setHasChanges(true);
        }}
        maxLength={200}
      />

      {/* Blocks editor */}
      <ScrollView
        style={styles.blocksContainer}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {blocks.map((block, idx) => {
          const blockStyle = getBlockStyle(block);
          const prefix = getBlockPrefix(block, idx);
          const isActive = idx === activeBlockIdx;

          return (
            <View
              key={block.id}
              style={[
                styles.blockWrapper,
                isActive && {
                  borderLeftWidth: 2,
                  borderLeftColor: colors.primary,
                },
              ]}
            >
              {block.type === "divider" ? (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              ) : (
                <View style={styles.blockRow}>
                  {prefix.length > 0 && (
                    <Text style={[{ color: colors.text }, blockStyle]}>
                      {prefix}
                    </Text>
                  )}
                  <TextInput
                    testID={`block-${idx}`}
                    style={[
                      styles.blockInput,
                      { color: colors.text },
                      blockStyle,
                    ]}
                    value={block.content}
                    onChangeText={(text) => updateBlockContent(idx, text)}
                    onFocus={() => setActiveBlockIdx(idx)}
                    multiline
                    placeholder={
                      block.type === "code"
                        ? "// code..."
                        : t("office.blockPlaceholder")
                    }
                    placeholderTextColor={colors.secondaryText + "80"}
                    onSubmitEditing={() => addBlockAfter(idx)}
                    blurOnSubmit={false}
                  />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Formatting toolbar */}
      {renderToolbar()}
    </KeyboardAvoidingView>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 6 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerActions: { flexDirection: "row", gap: 8 },
  savingBadge: { fontSize: 12 },
  savedBadge: { fontSize: 12, fontWeight: "600" },
  titleInput: {
    fontSize: 24,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  blocksContainer: { flex: 1, paddingHorizontal: 16 },
  blockWrapper: {
    marginBottom: 4,
    paddingLeft: 8,
    borderLeftWidth: 0,
    borderLeftColor: "transparent",
  },
  blockRow: { flexDirection: "row", alignItems: "flex-start" },
  blockInput: {
    flex: 1,
    paddingVertical: 4,
    lineHeight: 22,
  },
  divider: { height: 1, marginVertical: 12 },
  toolbar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  toolbarBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  toolbarBtnText: { fontSize: 16, fontWeight: "600" },
  toolbarDivider: { width: 1, marginHorizontal: 6, alignSelf: "stretch" },
});
