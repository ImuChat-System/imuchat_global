/**
 * DocumentationScreen — Developer Documentation Viewer (DEV-034)
 *
 * In-app documentation for developers: API refs, guides, best practices.
 * Organized in expandable sections.
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DocSection {
  id: string;
  icon: string;
  titleKey: string;
  contentKey: string;
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: "getting-started",
    icon: "🚀",
    titleKey: "devStore.doc_gettingStarted",
    contentKey: "devStore.doc_gettingStartedContent",
  },
  {
    id: "api-reference",
    icon: "📖",
    titleKey: "devStore.doc_apiReference",
    contentKey: "devStore.doc_apiReferenceContent",
  },
  {
    id: "submission-guide",
    icon: "📋",
    titleKey: "devStore.doc_submissionGuide",
    contentKey: "devStore.doc_submissionGuideContent",
  },
  {
    id: "theme-guide",
    icon: "🎨",
    titleKey: "devStore.doc_themeGuide",
    contentKey: "devStore.doc_themeGuideContent",
  },
  {
    id: "permissions",
    icon: "🔒",
    titleKey: "devStore.doc_permissions",
    contentKey: "devStore.doc_permissionsContent",
  },
  {
    id: "monetization",
    icon: "💰",
    titleKey: "devStore.doc_monetization",
    contentKey: "devStore.doc_monetizationContent",
  },
  {
    id: "best-practices",
    icon: "✨",
    titleKey: "devStore.doc_bestPractices",
    contentKey: "devStore.doc_bestPracticesContent",
  },
  {
    id: "faq",
    icon: "❓",
    titleKey: "devStore.doc_faq",
    contentKey: "devStore.doc_faqContent",
  },
];

export default function DocumentationScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <ScrollView
      testID="documentation-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.primary + "12",
            borderColor: colors.primary + "40",
          },
        ]}
      >
        <Text style={styles.headerIcon}>📚</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("devStore.docTitle")}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>
            {t("devStore.docSubtitle")}
          </Text>
        </View>
      </View>

      {/* ── Sections ───────────────────────────────────────── */}
      {DOC_SECTIONS.map((section) => {
        const isExpanded = expandedId === section.id;
        return (
          <View
            key={section.id}
            style={[styles.section, { backgroundColor: colors.surface }]}
          >
            <TouchableOpacity
              testID={`doc-${section.id}`}
              style={styles.sectionHeader}
              onPress={() => toggle(section.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <Text
                style={[styles.sectionTitle, { color: colors.text, flex: 1 }]}
              >
                {t(section.titleKey)}
              </Text>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
            {isExpanded && (
              <View
                style={[
                  styles.sectionContent,
                  { borderTopColor: colors.border },
                ]}
              >
                <Text style={[styles.contentText, { color: colors.textMuted }]}>
                  {t(section.contentKey)}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  headerIcon: { fontSize: 28 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerSub: { fontSize: 13, marginTop: 2 },
  section: { borderRadius: 12, marginBottom: 8, overflow: "hidden" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  sectionIcon: { fontSize: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "600" },
  sectionContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  contentText: { fontSize: 14, lineHeight: 22 },
});
