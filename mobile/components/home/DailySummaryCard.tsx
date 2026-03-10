/**
 * DailySummaryCard — Résumé quotidien Alice
 *
 * Carte de résumé matinal : messages non lus, événements du jour,
 * modules à redécouvrir, le tout formulé par Alice de façon amicale.
 *
 * Sprint S10 Axe A — Alice IA dans le Home
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import type { DailySummary } from "@/services/alice-home";
import { getDailySummary } from "@/services/alice-home";
import { createLogger } from "@/services/logger";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const logger = createLogger("DailySummaryCard");

// ─── Component ────────────────────────────────────────────────

interface DailySummaryCardProps {
  onRefresh?: () => void;
}

export default function DailySummaryCard({ onRefresh }: DailySummaryCardProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    setLoading(true);
    try {
      const data = await getDailySummary();
      setSummary(data);
    } catch (err) {
      logger.error("loadSummary failed", err);
    } finally {
      setLoading(false);
    }
  }

  function handleRefresh() {
    loadSummary();
    onRefresh?.();
  }

  if (loading) {
    return (
      <View
        testID="daily-summary-loading"
        style={[
          styles.container,
          { backgroundColor: colors.card, margin: spacing.md },
        ]}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!summary) return null;

  return (
    <View
      testID="daily-summary-card"
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          margin: spacing.md,
        },
      ]}
    >
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setCollapsed(!collapsed)}
        testID="daily-summary-toggle"
      >
        <Ionicons name="sunny-outline" size={20} color="#F39C12" />
        <Text style={[styles.title, { color: colors.text }]}>
          Bonjour ! Voici ton résumé
        </Text>
        <Ionicons
          name={collapsed ? "chevron-down" : "chevron-up"}
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Body */}
      {!collapsed && (
        <View style={styles.body}>
          <Text style={[styles.content, { color: colors.text }]}>
            {summary.content}
          </Text>

          {/* Context badges */}
          <View style={styles.badges}>
            {summary.context.unreadMessages != null &&
              summary.context.unreadMessages > 0 && (
                <View
                  testID="badge-unread"
                  style={[styles.badge, { backgroundColor: "#E74C3C20" }]}
                >
                  <Ionicons name="chatbubble" size={12} color="#E74C3C" />
                  <Text style={[styles.badgeText, { color: "#E74C3C" }]}>
                    {summary.context.unreadMessages} non lus
                  </Text>
                </View>
              )}
            {summary.context.upcomingEvents != null &&
              summary.context.upcomingEvents > 0 && (
                <View
                  testID="badge-events"
                  style={[styles.badge, { backgroundColor: "#4A90D920" }]}
                >
                  <Ionicons name="calendar" size={12} color="#4A90D9" />
                  <Text style={[styles.badgeText, { color: "#4A90D9" }]}>
                    {summary.context.upcomingEvents} événement(s)
                  </Text>
                </View>
              )}
          </View>

          {/* Refresh */}
          <TouchableOpacity
            testID="daily-summary-refresh"
            style={styles.refreshBtn}
            onPress={handleRefresh}
          >
            <Ionicons name="refresh" size={14} color={colors.primary} />
            <Text style={[styles.refreshText, { color: colors.primary }]}>
              Actualiser
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
  },
  body: {
    marginTop: 12,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
    alignSelf: "flex-end",
  },
  refreshText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
