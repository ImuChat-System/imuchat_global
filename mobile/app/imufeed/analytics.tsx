/**
 * Analytics Page — Dashboard créateur ImuFeed
 *
 * Route : /imufeed/analytics
 * Affiche le CreatorDashboard avec les analytics du créateur connecté.
 *
 * Sprint S13 Axe B — Dashboard Créateur & Analytics
 */

import CreatorDashboard from "@/components/imufeed/CreatorDashboard";
import { useColors } from "@/providers/ThemeProvider";
import { useUserStore } from "@/stores/user-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AnalyticsPage() {
  const colors = useColors();
  const router = useRouter();
  const userId = useUserStore((s) => s.profile?.id);

  if (!userId) {
    return (
      <View
        testID="analytics-no-user"
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <Text style={{ color: colors.textMuted }}>
          Connectez-vous pour voir vos analytics
        </Text>
      </View>
    );
  }

  return (
    <View
      testID="analytics-page"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity testID="analytics-back" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Analytics
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <CreatorDashboard userId={userId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
});
