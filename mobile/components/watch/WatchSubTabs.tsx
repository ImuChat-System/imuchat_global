/**
 * WatchSubTabs — Sous-onglets Watch [🎬 Vidéos / 🎧 Podcasts / 🎵 Musique]
 *
 * Barre de navigation avec indicateur animé.
 * Sprint S12 Axe A — Watch enrichi
 */

import { useColors } from "@/providers/ThemeProvider";
import type { WatchSubTab } from "@/types/watch";
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
  key: WatchSubTab;
  label: string;
  emoji: string;
}

const TABS: TabDef[] = [
  { key: "videos", label: "Vidéos", emoji: "🎬" },
  { key: "podcasts", label: "Podcasts", emoji: "🎧" },
  { key: "music", label: "Musique", emoji: "🎵" },
];

// ─── Props ────────────────────────────────────────────────────

interface WatchSubTabsProps {
  activeTab: WatchSubTab;
  onTabChange: (tab: WatchSubTab) => void;
  indicatorAnim?: Animated.Value;
}

// ─── Component ────────────────────────────────────────────────

export default function WatchSubTabs({
  activeTab,
  onTabChange,
  indicatorAnim,
}: WatchSubTabsProps) {
  const colors = useColors();

  const tabWidth = SCREEN_WIDTH / TABS.length;
  const activeIndex = TABS.findIndex((t) => t.key === activeTab);

  const handlePress = useCallback(
    (tab: WatchSubTab) => {
      onTabChange(tab);
    },
    [onTabChange],
  );

  const indicatorLeft = indicatorAnim
    ? indicatorAnim.interpolate({
        inputRange: TABS.map((_, i) => i),
        outputRange: TABS.map((_, i) => i * tabWidth + tabWidth * 0.15),
      })
    : activeIndex * tabWidth + tabWidth * 0.15;

  return (
    <View
      testID="watch-sub-tabs"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              testID={`watch-tab-${tab.key}`}
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

      <Animated.View
        testID="watch-tab-indicator"
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
