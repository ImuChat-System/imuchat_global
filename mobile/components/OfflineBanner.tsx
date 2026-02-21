/**
 * OfflineBanner Component
 * Shows a banner when the device is offline
 */

import { useNetworkState } from "@/hooks/useNetworkState";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

interface OfflineBannerProps {
  showPendingCount?: number;
}

export function OfflineBanner({ showPendingCount }: OfflineBannerProps) {
  const { isConnected, isInternetReachable } = useNetworkState();
  const { t } = useI18n();
  const colors = useColors();
  const slideAnim = useRef(new Animated.Value(-50)).current;

  const isOffline = isConnected === false || isInternetReachable === false;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOffline ? 0 : -50,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  }, [isOffline, slideAnim]);

  if (!isOffline && !showPendingCount) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isOffline ? colors.error : colors.warning,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Ionicons
        name={isOffline ? "cloud-offline" : "time-outline"}
        size={16}
        color="#fff"
      />
      <Text style={styles.text}>
        {isOffline
          ? t("offline.noConnection")
          : t("offline.pendingMessages", { count: showPendingCount })}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
});

export default OfflineBanner;
