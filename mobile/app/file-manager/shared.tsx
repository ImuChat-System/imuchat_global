/**
 * Shared Files Screen (DEV-037)
 *
 * Files shared with or by the current user, with permission display.
 */
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useFileManagerStore } from "@/stores/file-manager-store";
import type { SharedFile } from "@/types/file-manager";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SharedScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const sharedFiles = useFileManagerStore((s) => s.sharedFiles);
  const loading = useFileManagerStore((s) => s.loading);
  const fetchSharedFiles = useFileManagerStore((s) => s.fetchSharedFiles);
  const revokeShare = useFileManagerStore((s) => s.revokeShare);

  useEffect(() => {
    fetchSharedFiles();
  }, [fetchSharedFiles]);

  const permissionLabel = (p: string): string => {
    switch (p) {
      case "view":
        return t("fileManager.permView");
      case "edit":
        return t("fileManager.permEdit");
      case "admin":
        return t("fileManager.permAdmin");
      default:
        return p;
    }
  };

  const permissionColor = (p: string): string => {
    switch (p) {
      case "admin":
        return "#E74C3C";
      case "edit":
        return "#E67E22";
      default:
        return "#3498DB";
    }
  };

  const renderItem = ({ item }: { item: SharedFile }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, padding: spacing.sm },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons
          name={
            item.file.type === "image"
              ? "image-outline"
              : item.file.type === "video"
                ? "videocam-outline"
                : "document-outline"
          }
          size={24}
          color={colors.primary}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text
            style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}
            numberOfLines={1}
          >
            {item.file.name}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
            {formatBytes(item.file.sizeBytes)} · {t("fileManager.sharedBy")}{" "}
            {item.sharedByName}
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: permissionColor(item.permission) + "22" },
          ]}
        >
          <Text
            style={{
              color: permissionColor(item.permission),
              fontSize: 11,
              fontWeight: "600",
            }}
          >
            {permissionLabel(item.permission)}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
          {new Date(item.sharedAt).toLocaleDateString()}
          {item.expiresAt &&
            ` · ${t("fileManager.expires")} ${new Date(item.expiresAt).toLocaleDateString()}`}
        </Text>
        <TouchableOpacity
          onPress={() => revokeShare(item.file.id, "current-user")}
          hitSlop={8}
        >
          <Ionicons
            name="close-circle-outline"
            size={18}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View
        testID="shared-screen"
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View
      testID="shared-screen"
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <FlatList
        data={sharedFiles}
        keyExtractor={(item) => item.file.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.md }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Ionicons
              name="share-social-outline"
              size={48}
              color={colors.textMuted}
            />
            <Text
              style={{ color: colors.textMuted, fontSize: 14, marginTop: 8 }}
            >
              {t("fileManager.noSharedFiles")}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
