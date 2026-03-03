/**
 * Help Center Screen — Base de connaissances intégrée
 *
 * Features:
 * - Search bar for articles
 * - Category filter chips
 * - Article list with title, summary, helpful count
 * - Article detail view (markdown body)
 *
 * Phase 3 — DEV-031
 */

import { useSupport } from "@/hooks/useSupport";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { ArticleCategory } from "@/types/support";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CATEGORIES: { key: ArticleCategory; emoji: string }[] = [
  { key: "getting-started", emoji: "🚀" },
  { key: "messaging", emoji: "💬" },
  { key: "calls", emoji: "📞" },
  { key: "communities", emoji: "👥" },
  { key: "privacy", emoji: "🔒" },
  { key: "payments", emoji: "💳" },
  { key: "account", emoji: "👤" },
  { key: "troubleshooting", emoji: "🔧" },
];

export default function HelpCenterScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { filteredArticles, helpSearchQuery, setHelpSearchQuery } =
    useSupport();
  const [selectedCategory, setSelectedCategory] =
    useState<ArticleCategory | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const displayArticles = selectedCategory
    ? filteredArticles.filter((a) => a.category === selectedCategory)
    : filteredArticles;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t("support.searchArticles")}
          placeholderTextColor={colors.textMuted}
          value={helpSearchQuery}
          onChangeText={setHelpSearchQuery}
        />
        {helpSearchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setHelpSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        contentContainerStyle={{ gap: 8, paddingRight: 16 }}
      >
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor:
                selectedCategory === null ? colors.primary : colors.surface,
            },
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.chipText,
              { color: selectedCategory === null ? "#fff" : colors.text },
            ]}
          >
            {t("support.allCategories")}
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.chip,
              {
                backgroundColor:
                  selectedCategory === cat.key
                    ? colors.primary
                    : colors.surface,
              },
            ]}
            onPress={() =>
              setSelectedCategory(selectedCategory === cat.key ? null : cat.key)
            }
          >
            <Text style={styles.chipEmoji}>{cat.emoji}</Text>
            <Text
              style={[
                styles.chipText,
                { color: selectedCategory === cat.key ? "#fff" : colors.text },
              ]}
            >
              {t(`support.category.${cat.key}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Articles */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        {t("support.articlesCount", { count: displayArticles.length })}
      </Text>

      {displayArticles.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Text style={{ fontSize: 32 }}>📭</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("support.noArticles")}
          </Text>
        </View>
      ) : (
        displayArticles.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={[styles.articleCard, { backgroundColor: colors.surface }]}
            onPress={() =>
              setExpandedArticle(
                expandedArticle === article.id ? null : article.id,
              )
            }
            activeOpacity={0.7}
          >
            <View style={styles.articleHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.articleTitle, { color: colors.text }]}>
                  {article.title}
                </Text>
                <Text
                  style={[styles.articleSummary, { color: colors.textMuted }]}
                  numberOfLines={expandedArticle === article.id ? undefined : 2}
                >
                  {expandedArticle === article.id
                    ? article.body
                    : article.summary}
                </Text>
              </View>
              <Ionicons
                name={
                  expandedArticle === article.id ? "chevron-up" : "chevron-down"
                }
                size={18}
                color={colors.textMuted}
              />
            </View>

            {/* Tags & helpful */}
            <View style={styles.articleFooter}>
              <View style={styles.tagRow}>
                {article.tags.slice(0, 3).map((tag) => (
                  <View
                    key={tag}
                    style={[styles.tag, { backgroundColor: colors.background }]}
                  >
                    <Text style={[styles.tagText, { color: colors.textMuted }]}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.helpfulRow}>
                <Ionicons
                  name="thumbs-up-outline"
                  size={14}
                  color={colors.textMuted}
                />
                <Text style={[styles.helpfulText, { color: colors.textMuted }]}>
                  {article.helpful}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  chipRow: { flexGrow: 0, marginVertical: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  chipEmoji: { fontSize: 14 },
  chipText: { fontSize: 13, fontWeight: "500" },
  sectionLabel: { fontSize: 13, fontWeight: "600", marginTop: 4 },
  emptyCard: {
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyText: { fontSize: 14, textAlign: "center" },
  articleCard: {
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  articleHeader: { flexDirection: "row", gap: 10 },
  articleTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  articleSummary: { fontSize: 13, lineHeight: 18 },
  articleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagRow: { flexDirection: "row", gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  tagText: { fontSize: 11 },
  helpfulRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  helpfulText: { fontSize: 12 },
});
