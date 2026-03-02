/**
 * PdfViewerScreen — Lecteur PDF avec annotations
 *
 * Fonctionnalités :
 *  - Affichage PDF via WebView
 *  - Annotations (surlignage, notes, soulignement)
 *  - Signets (bookmarks) par page
 *  - Navigation par pages
 *  - Suivi de progression de lecture
 *
 * Phase — DEV-019 Module Office
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
import { useOfficeStore } from "@/stores/office-store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PdfViewerScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();
  const { showToast } = useToast();
  const { docId } = useLocalSearchParams<{ docId: string }>();

  const {
    pdfDocuments,
    currentPdf,
    loadPdfDocuments,
    openPdf,
    closePdf,
    updatePdfPage,
    addPdfAnnotation,
    togglePdfBookmark,
  } = useOfficeStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [showAnnotationMenu, setShowAnnotationMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Load PDF ───────────────────────────────────────────
  useEffect(() => {
    loadPdfDocuments();
  }, [loadPdfDocuments]);

  useEffect(() => {
    if (docId && pdfDocuments.length > 0) {
      openPdf(docId);
    }
    return () => {
      closePdf();
    };
  }, [docId, pdfDocuments.length, openPdf, closePdf]);

  useEffect(() => {
    if (currentPdf) {
      setCurrentPage(currentPdf.current_page || 1);
      setIsLoading(false);
    }
  }, [currentPdf]);

  // ─── Page navigation ───────────────────────────────────
  const handlePageChange = useCallback(
    async (page: number) => {
      if (!currentPdf) return;
      const clampedPage = Math.max(1, Math.min(page, currentPdf.page_count));
      setCurrentPage(clampedPage);
      await updatePdfPage(currentPdf.id, clampedPage);
    },
    [currentPdf, updatePdfPage],
  );

  // ─── Annotation ─────────────────────────────────────────
  const handleAddAnnotation = useCallback(
    async (type: "highlight" | "note" | "underline") => {
      if (!currentPdf) return;
      await addPdfAnnotation(currentPdf.id, {
        type,
        page: currentPage,
        content: type === "note" ? t("office.newAnnotation") : "",
        color:
          type === "highlight"
            ? "#FFEB3B"
            : type === "underline"
              ? "#4A90D9"
              : "#FF9500",
        position: { x: 0, y: 0, width: 100, height: 20 },
      });
      setShowAnnotationMenu(false);
      showToast(t("office.annotationAdded"), "success");
    },
    [currentPdf, currentPage, addPdfAnnotation, showToast, t],
  );

  // ─── Bookmark ───────────────────────────────────────────
  const handleToggleBookmark = useCallback(async () => {
    if (!currentPdf) return;
    await togglePdfBookmark(currentPdf.id, currentPage);
  }, [currentPdf, currentPage, togglePdfBookmark]);

  const isBookmarked = currentPdf?.bookmarks?.includes(currentPage) || false;

  const progressPercent = currentPdf
    ? Math.round((currentPage / currentPdf.page_count) * 100)
    : 0;

  // ─── Loading / No PDF ──────────────────────────────────
  if (!currentPdf) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
            <Ionicons name="document" size={48} color={colors.secondaryText} />
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              {t("office.noPdfSelected")}
            </Text>
            <TouchableOpacity
              testID="pdf-back"
              style={[styles.backBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.back()}
            >
              <Text style={{ color: "#FFF", fontWeight: "600" }}>
                {t("office.goBack")}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <View
        style={[
          styles.topBar,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity testID="pdf-nav-back" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text
            style={[styles.pdfTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {currentPdf.title}
          </Text>
          <Text style={[styles.pageIndicator, { color: colors.secondaryText }]}>
            {currentPage} / {currentPdf.page_count}
          </Text>
        </View>
        <TouchableOpacity testID="pdf-bookmark" onPress={handleToggleBookmark}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color={isBookmarked ? colors.primary : colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.primary, width: `${progressPercent}%` },
          ]}
        />
      </View>

      {/* PDF content area (placeholder — real PDF rendering needs react-native-pdf or WebView) */}
      <View style={styles.pdfContent}>
        <View
          style={[
            styles.pdfPage,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="document-text"
            size={64}
            color={colors.secondaryText}
          />
          <Text style={[styles.pageTitle, { color: colors.text }]}>
            {currentPdf.title}
          </Text>
          <Text style={[styles.pageInfo, { color: colors.secondaryText }]}>
            Page {currentPage} / {currentPdf.page_count}
          </Text>
          <Text style={[styles.pageInfo, { color: colors.secondaryText }]}>
            {currentPdf.file_size
              ? `${(currentPdf.file_size / 1024).toFixed(0)} KB`
              : ""}
          </Text>
          <Text
            style={[styles.pdfPlaceholder, { color: colors.secondaryText }]}
          >
            {t("office.pdfContentPlaceholder")}
          </Text>

          {/* Annotations for current page */}
          {currentPdf.annotations
            .filter((a) => a.page === currentPage)
            .map((ann) => (
              <View
                key={ann.id}
                style={[
                  styles.annotationBadge,
                  { backgroundColor: ann.color + "40", borderColor: ann.color },
                ]}
              >
                <Ionicons
                  name={
                    ann.type === "highlight"
                      ? "color-fill"
                      : ann.type === "note"
                        ? "chatbubble"
                        : "remove"
                  }
                  size={14}
                  color={ann.color}
                />
                <Text style={{ fontSize: 12, color: ann.color, marginLeft: 4 }}>
                  {ann.content || ann.type}
                </Text>
              </View>
            ))}
        </View>
      </View>

      {/* Bottom controls */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        {/* Page navigation */}
        <TouchableOpacity
          testID="prev-page"
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={styles.navBtn}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={currentPage <= 1 ? colors.border : colors.text}
          />
        </TouchableOpacity>

        {/* Annotation button */}
        <TouchableOpacity
          testID="annotation-menu"
          onPress={() => setShowAnnotationMenu(!showAnnotationMenu)}
          style={[styles.annotateBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="create" size={20} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          testID="next-page"
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= currentPdf.page_count}
          style={styles.navBtn}
        >
          <Ionicons
            name="chevron-forward"
            size={28}
            color={
              currentPage >= currentPdf.page_count ? colors.border : colors.text
            }
          />
        </TouchableOpacity>
      </View>

      {/* Annotation menu overlay */}
      {showAnnotationMenu && (
        <View style={styles.annotationMenuOverlay}>
          <TouchableOpacity
            style={styles.annotationMenuBackdrop}
            onPress={() => setShowAnnotationMenu(false)}
          />
          <View
            style={[
              styles.annotationMenu,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <TouchableOpacity
              testID="add-highlight"
              style={styles.annotationMenuItem}
              onPress={() => handleAddAnnotation("highlight")}
            >
              <Ionicons name="color-fill" size={20} color="#FFEB3B" />
              <Text style={[styles.annotationMenuText, { color: colors.text }]}>
                {t("office.highlight")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="add-note"
              style={styles.annotationMenuItem}
              onPress={() => handleAddAnnotation("note")}
            >
              <Ionicons name="chatbubble" size={20} color="#FF9500" />
              <Text style={[styles.annotationMenuText, { color: colors.text }]}>
                {t("office.note")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="add-underline"
              style={styles.annotationMenuItem}
              onPress={() => handleAddAnnotation("underline")}
            >
              <Ionicons name="remove" size={20} color="#4A90D9" />
              <Text style={[styles.annotationMenuText, { color: colors.text }]}>
                {t("office.underline")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyText: { fontSize: 15, textAlign: "center" },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 12,
  },
  topBarCenter: { flex: 1, alignItems: "center" },
  pdfTitle: { fontSize: 16, fontWeight: "600" },
  pageIndicator: { fontSize: 12, marginTop: 2 },
  progressBar: { height: 3 },
  progressFill: { height: 3 },
  pdfContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  pdfPage: {
    width: "100%",
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  pageTitle: { fontSize: 18, fontWeight: "600", marginTop: 12 },
  pageInfo: { fontSize: 13, marginTop: 4 },
  pdfPlaceholder: {
    fontSize: 13,
    marginTop: 16,
    textAlign: "center",
    lineHeight: 20,
  },
  annotationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  navBtn: { padding: 8 },
  annotateBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  annotationMenuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  annotationMenuBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  annotationMenu: {
    marginBottom: 80,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    minWidth: 200,
  },
  annotationMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  annotationMenuText: { fontSize: 15, fontWeight: "500" },
});
