/**
 * FAQ Interactive Screen
 *
 * Features:
 * - Expandable Q&A accordion
 * - Category filter
 * - Search within questions
 *
 * Phase 3 — DEV-031
 */

import { useSupport } from "@/hooks/useSupport";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { ArticleCategory } from "@/types/support";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function FAQScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { faqItems } = useSupport();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<ArticleCategory | null>(null);

  const filteredFAQ = useMemo(() => {
    let items = faqItems;
    if (selectedCategory) {
      items = items.filter((f) => f.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q),
      );
    }
    return items.sort((a, b) => a.order - b.order);
  }, [faqItems, selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set(faqItems.map((f) => f.category));
    return Array.from(cats);
  }, [faqItems]);

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
          placeholder={t("support.searchFAQ")}
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          style={{ flexGrow: 0 }}
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
              style={{
                color: selectedCategory === null ? "#fff" : colors.text,
                fontSize: 13,
              }}
            >
              {t("support.allCategories")}
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    selectedCategory === cat ? colors.primary : colors.surface,
                },
              ]}
              onPress={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
            >
              <Text
                style={{
                  color: selectedCategory === cat ? "#fff" : colors.text,
                  fontSize: 13,
                }}
              >
                {t(`support.category.${cat}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* FAQ items */}
      <Text style={[styles.countLabel, { color: colors.textMuted }]}>
        {t("support.faqCount", { count: filteredFAQ.length })}
      </Text>

      {filteredFAQ.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Text style={{ fontSize: 32 }}>🤔</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("support.noFAQ")}
          </Text>
        </View>
      ) : (
        filteredFAQ.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.faqCard, { backgroundColor: colors.surface }]}
            onPress={() =>
              setExpandedId(expandedId === item.id ? null : item.id)
            }
            activeOpacity={0.7}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.faqQuestion, { color: colors.text }]}>
                {item.question}
              </Text>
              <Ionicons
                name={expandedId === item.id ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.textMuted}
              />
            </View>
            {expandedId === item.id && (
              <Text style={[styles.faqAnswer, { color: colors.textMuted }]}>
                {item.answer}
              </Text>
            )}
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
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  countLabel: { fontSize: 13, fontWeight: "600" },
  emptyCard: {
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyText: { fontSize: 14, textAlign: "center" },
  faqCard: {
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  faqQuestion: { fontSize: 14, fontWeight: "600", flex: 1 },
  faqAnswer: { fontSize: 13, lineHeight: 20, paddingTop: 4 },
});
