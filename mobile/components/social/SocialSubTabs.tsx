/**
 * SocialSubTabs — Système de sous-onglets Social
 *
 * Barre de navigation entre Feed / ImuFeed / Stories
 * avec indicateur animé et compteurs.
 *
 * Sprint S11 Axe A — Refonte Social
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import type { SocialSubTab } from "@/types/imufeed";
import React, { useCallback } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Tab definitions ──────────────────────────────────────────

interface TabDef {
  key: SocialSubTab;
  label: string;
  emoji: string;
}

const TABS: TabDef[] = [
  { key: "feed", label: "Feed", emoji: "📝" },
  { key: "imufeed", label: "ImuFeed", emoji: "🎬" },
  { key: "stories", label: "Stories", emoji: "⭐" },
];

// ─── Props ────────────────────────────────────────────────────

interface SocialSubTabsProps {
  activeTab: SocialSubTab;
  onTabChange: (tab: SocialSubTab) => void;
  /** Indicateur position animée (shared Animated.Value) */
  indicatorAnim?: Animated.Value;
}

// ─── Component ────────────────────────────────────────────────

export default function SocialSubTabs({
  activeTab,
  onTabChange,
  indicatorAnim,
}: SocialSubTabsProps) {
  const colors = useColors();
  const spacing = useSpacing();

  const tabWidth = SCREEN_WIDTH / TABS.length;
  const activeIndex = TABS.findIndex((t) => t.key === activeTab);

  const handlePress = useCallback(
    (tab: SocialSubTab) => {
      onTabChange(tab);
    },
    [onTabChange],
  );

  // Indicateur animé ou statique
  const indicatorLeft = indicatorAnim
    ? indicatorAnim.interpolate({
        inputRange: TABS.map((_, i) => i),
        outputRange: TABS.map((_, i) => i * tabWidth + tabWidth * 0.15),
      })
    : activeIndex * tabWidth + tabWidth * 0.15;

  return (
    <View
      testID="social-sub-tabs"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              testID={`social-tab-${tab.key}`}
              style={[styles.tab, { width: tabWidth }]}
              onPress={() => handlePress(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.primary : colors.textSecondary,
                    fontWeight: isActive ? "700" : "400",
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Indicateur animé */}
      <Animated.View
        testID="tab-indicator"
        style={[
          styles.indicator,
          {
            backgroundColor: colors.primary,
            width: tabWidth * 0.7,
            left: indicatorLeft,
          },
        ]}
      />
    </View>
  );
}

// ─── Exports utilitaires ──────────────────────────────────────

export { TABS };
export type { TabDef };

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
  },
  tabEmoji: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 14,
  },
  indicator: {
    height: 3,
    borderRadius: 1.5,
  },
});
