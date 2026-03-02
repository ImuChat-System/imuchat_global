/**
 * PresentationScreen — Présentations WebView
 *
 * Architecture hybride :
 *  - Slides rendus en HTML/CSS dans une WebView
 *  - Éditeur de contenu natif (TextInput)
 *  - Thèmes et layouts depuis office-api
 *  - Navigation slide par slide
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
import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import type {
  PresentationData,
  PresentationSlide,
  PresentationTheme,
} from "@/types/office";

// ─── WebView HTML for a single slide ─────────────────────────

function generateSlideHTML(
  slide: PresentationSlide,
  theme: PresentationTheme,
): string {
  const bg = theme.colors.background;
  const text = theme.colors.text;
  const accent = theme.colors.accent;

  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: ${theme.fontFamily}, -apple-system, sans-serif;
    background: ${bg};
    color: ${text};
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 24px;
  }
  .slide {
    width: 100%;
    max-width: 640px;
    aspect-ratio: 16/9;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 32px;
    gap: 16px;
  }
  .slide-title { font-size: 28px; font-weight: 700; line-height: 1.2; }
  .slide-content { font-size: 18px; line-height: 1.6; opacity: 0.85; }
  .accent { color: ${accent}; }
  .layout-title .slide-title { font-size: 36px; }
  .layout-two-column .content-area { display: flex; gap: 24px; width: 100%; }
  .layout-two-column .column { flex: 1; text-align: left; }
</style>
</head>
<body>
<div class="slide layout-${slide.layout}">
  <div class="slide-title">${slide.title}</div>
  ${slide.content ? `<div class="slide-content">${slide.content.replace(/\n/g, "<br>")}</div>` : ""}
  ${slide.notes ? `<div style="position:absolute;bottom:8px;right:12px;font-size:11px;opacity:0.4;">📝 Notes</div>` : ""}
</div>
</body>
</html>`;
}

export default function PresentationScreen() {
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

  const [presentationData, setPresentationData] = useState<PresentationData>(
    OfficeAPI.createEmptyPresentation(),
  );
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [title, setTitle] = useState(t("office.newPresentation"));
  const [docIdState, setDocIdState] = useState<string | null>(docId || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editSlideTitle, setEditSlideTitle] = useState("");
  const [editSlideContent, setEditSlideContent] = useState("");
  const [selectedThemeIdx, setSelectedThemeIdx] = useState(0);

  const themes = OfficeAPI.PRESENTATION_THEMES;
  const currentTheme = themes[selectedThemeIdx] || themes[0];

  // ─── Load ───────────────────────────────────────────────
  useEffect(() => {
    if (docId && !isNew) {
      openDocument(docId);
    }
    return () => closeDocument();
  }, [docId, isNew, openDocument, closeDocument]);

  useEffect(() => {
    if (currentDocument && currentDocument.type === "presentation") {
      setTitle(currentDocument.title);
      try {
        const parsed = JSON.parse(currentDocument.content || "{}");
        if (parsed.slides) {
          setPresentationData(parsed);
        }
      } catch {
        // ignore
      }
      setDocIdState(currentDocument.id);
    }
  }, [currentDocument]);

  const currentSlide = presentationData.slides[currentSlideIdx];

  // ─── Slide navigation ──────────────────────────────────
  const goToSlide = useCallback(
    (idx: number) => {
      const clamped = Math.max(
        0,
        Math.min(idx, presentationData.slides.length - 1),
      );
      setCurrentSlideIdx(clamped);
      setIsEditing(false);
    },
    [presentationData.slides.length],
  );

  // ─── Edit slide ─────────────────────────────────────────
  const handleEditSlide = useCallback(() => {
    if (currentSlide) {
      setEditSlideTitle(currentSlide.title);
      setEditSlideContent(currentSlide.content || "");
      setIsEditing(true);
    }
  }, [currentSlide]);

  const handleSaveSlide = useCallback(() => {
    setPresentationData((prev) => {
      const slides = [...prev.slides];
      slides[currentSlideIdx] = {
        ...slides[currentSlideIdx],
        title: editSlideTitle,
        content: editSlideContent,
      };
      return { ...prev, slides };
    });
    setIsEditing(false);
  }, [currentSlideIdx, editSlideTitle, editSlideContent]);

  // ─── Add / Remove slides ───────────────────────────────
  const handleAddSlide = useCallback(() => {
    const updated = OfficeAPI.addSlide(presentationData, "content");
    setPresentationData(updated);
    setCurrentSlideIdx(updated.slides.length - 1);
  }, [presentationData]);

  const handleRemoveSlide = useCallback(() => {
    if (presentationData.slides.length <= 1) return;
    const updated = OfficeAPI.removeSlide(presentationData, currentSlide.id);
    setPresentationData(updated);
    setCurrentSlideIdx(Math.max(0, currentSlideIdx - 1));
  }, [presentationData, currentSlide, currentSlideIdx]);

  // ─── Theme switch ──────────────────────────────────────
  const handleThemeSwitch = useCallback(() => {
    setSelectedThemeIdx((prev) => (prev + 1) % themes.length);
  }, [themes.length]);

  // ─── Save ───────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const content = JSON.stringify(presentationData);
    if (docIdState) {
      await updateDocument(docIdState, { title, content });
    } else {
      const doc = await createDocument(title, "presentation", content);
      setDocIdState(doc.id);
    }
    showToast(t("office.saved"), "success");
  }, [
    presentationData,
    title,
    docIdState,
    updateDocument,
    createDocument,
    showToast,
    t,
  ]);

  const slideHTML = currentSlide
    ? generateSlideHTML(currentSlide, currentTheme)
    : "<html><body><p>No slide</p></body></html>";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          testID="presentation-back"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <TextInput
          testID="presentation-title"
          style={[styles.titleInput, { color: colors.text }]}
          value={title}
          onChangeText={setTitle}
          placeholder={t("office.presentationTitle")}
          placeholderTextColor={colors.secondaryText}
        />
        <TouchableOpacity testID="presentation-save" onPress={handleSave}>
          <Ionicons name="save" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Slide viewer (WebView) */}
      <View style={styles.slideViewer}>
        <WebView
          testID="presentation-webview"
          source={{ html: slideHTML }}
          style={styles.webView}
          originWhitelist={["*"]}
          scrollEnabled={false}
        />
      </View>

      {/* Slide editor overlay */}
      {isEditing && (
        <View
          style={[
            styles.editOverlay,
            { backgroundColor: colors.background + "F0" },
          ]}
        >
          <View
            style={[
              styles.editPanel,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.editLabel, { color: colors.text }]}>
              {t("office.editSlide")} {currentSlideIdx + 1}
            </Text>
            <TextInput
              testID="slide-title-input"
              style={[
                styles.slideInput,
                { color: colors.text, borderColor: colors.border },
              ]}
              value={editSlideTitle}
              onChangeText={setEditSlideTitle}
              placeholder={t("office.slideTitlePlaceholder")}
              placeholderTextColor={colors.secondaryText}
            />
            <TextInput
              testID="slide-content-input"
              style={[
                styles.slideContentInput,
                { color: colors.text, borderColor: colors.border },
              ]}
              value={editSlideContent}
              onChangeText={setEditSlideContent}
              placeholder={t("office.slideContentPlaceholder")}
              placeholderTextColor={colors.secondaryText}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                testID="cancel-edit"
                onPress={() => setIsEditing(false)}
                style={[styles.editBtn, { borderColor: colors.border }]}
              >
                <Text style={{ color: colors.text }}>{t("office.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="save-slide"
                onPress={handleSaveSlide}
                style={[styles.editBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: "#FFF", fontWeight: "600" }}>
                  {t("office.save")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Bottom controls */}
      <View
        style={[
          styles.controls,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        {/* Slide thumbnails */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailRow}
        >
          {presentationData.slides.map((slide, idx) => (
            <TouchableOpacity
              key={slide.id}
              testID={`slide-thumb-${idx}`}
              style={[
                styles.thumbnail,
                {
                  borderColor:
                    idx === currentSlideIdx ? colors.primary : colors.border,
                  borderWidth: idx === currentSlideIdx ? 2 : 1,
                  backgroundColor: colors.card,
                },
              ]}
              onPress={() => goToSlide(idx)}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: colors.text,
                  textAlign: "center",
                }}
                numberOfLines={2}
              >
                {slide.title}
              </Text>
              <Text style={{ fontSize: 8, color: colors.secondaryText }}>
                {idx + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            testID="prev-slide"
            onPress={() => goToSlide(currentSlideIdx - 1)}
          >
            <Ionicons
              name="chevron-back"
              size={26}
              color={currentSlideIdx > 0 ? colors.text : colors.border}
            />
          </TouchableOpacity>

          <TouchableOpacity testID="edit-slide" onPress={handleEditSlide}>
            <Ionicons name="create" size={22} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity testID="add-slide" onPress={handleAddSlide}>
            <Ionicons name="add-circle" size={22} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity testID="remove-slide" onPress={handleRemoveSlide}>
            <Ionicons name="trash" size={20} color="#E53E3E" />
          </TouchableOpacity>

          <TouchableOpacity testID="theme-switch" onPress={handleThemeSwitch}>
            <Ionicons name="color-palette" size={22} color={colors.primary} />
          </TouchableOpacity>

          <Text style={[styles.slideCounter, { color: colors.secondaryText }]}>
            {currentSlideIdx + 1}/{presentationData.slides.length}
          </Text>

          <TouchableOpacity
            testID="next-slide"
            onPress={() => goToSlide(currentSlideIdx + 1)}
          >
            <Ionicons
              name="chevron-forward"
              size={26}
              color={
                currentSlideIdx < presentationData.slides.length - 1
                  ? colors.text
                  : colors.border
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 10,
  },
  titleInput: { flex: 1, fontSize: 16, fontWeight: "600" },
  slideViewer: { flex: 1, margin: 8, borderRadius: 8, overflow: "hidden" },
  webView: { flex: 1, borderRadius: 8 },
  editOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  editPanel: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  editLabel: { fontSize: 18, fontWeight: "700", marginBottom: 14 },
  slideInput: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  slideContentInput: {
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    marginBottom: 16,
  },
  editActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  editBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  controls: { borderTopWidth: 1, paddingBottom: 20 },
  thumbnailRow: { paddingHorizontal: 8, paddingVertical: 8 },
  thumbnail: {
    width: 80,
    height: 52,
    borderRadius: 6,
    marginRight: 6,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  slideCounter: { fontSize: 13, fontWeight: "600" },
});
