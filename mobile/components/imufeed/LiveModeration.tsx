/**
 * LiveModeration — Panneau de modération du live
 *
 * Permet au host/modérateur de gérer les viewers :
 * assigner des modérateurs, muter, bannir, avertir.
 *
 * Sprint S17 — Co-host, Replay, Modération, Sondages
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { ModerationAction } from "@/types/live-streaming";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────

export interface ViewerEntry {
  userId: string;
  userName: string;
  role: "viewer" | "subscriber" | "moderator" | "cohost";
}

export interface LiveModerationProps {
  viewers: ViewerEntry[];
  moderators: string[];
  onModerate: (targetUserId: string, action: ModerationAction) => void;
  onAssignModerator: (userId: string) => void;
  onRemoveModerator: (userId: string) => void;
  onClose: () => void;
}

// ─── Action Config ────────────────────────────────────────────

const MODERATION_ACTIONS: {
  action: ModerationAction;
  icon: string;
  color: string;
  labelKey: string;
  defaultLabel: string;
}[] = [
  {
    action: "warn",
    icon: "warning",
    color: "#FFA500",
    labelKey: "live.mod.warn",
    defaultLabel: "Avertir",
  },
  {
    action: "mute",
    icon: "volume-mute",
    color: "#888",
    labelKey: "live.mod.mute",
    defaultLabel: "Muter",
  },
  {
    action: "timeout",
    icon: "timer",
    color: "#FF8800",
    labelKey: "live.mod.timeout",
    defaultLabel: "Timeout",
  },
  {
    action: "ban",
    icon: "ban",
    color: "#FF4444",
    labelKey: "live.mod.ban",
    defaultLabel: "Bannir",
  },
];

// ─── Viewer Row ───────────────────────────────────────────────

interface ViewerRowProps {
  viewer: ViewerEntry;
  isModerator: boolean;
  t: (key: string, opts?: Record<string, unknown>) => string;
  colors: ReturnType<typeof useColors>;
  onModerate: (action: ModerationAction) => void;
  onToggleMod: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const ViewerRow = React.memo(function ViewerRow({
  viewer,
  isModerator,
  t,
  colors,
  onModerate,
  onToggleMod,
  isExpanded,
  onToggleExpand,
}: ViewerRowProps) {
  return (
    <View>
      <TouchableOpacity
        testID={`viewer-row-${viewer.userId}`}
        style={styles.viewerRow}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.viewerInfo}>
          <Ionicons
            name="person-circle"
            size={28}
            color={isModerator ? "#44BB44" : colors.text}
          />
          <View>
            <Text style={[styles.viewerName, { color: colors.text }]}>
              {viewer.userName}
            </Text>
            {isModerator && (
              <Text
                testID={`mod-badge-${viewer.userId}`}
                style={styles.modBadge}
              >
                {t("live.mod.moderator", { defaultValue: "Modérateur" })}
              </Text>
            )}
          </View>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View
          testID={`viewer-actions-${viewer.userId}`}
          style={styles.actionsRow}
        >
          {/* Toggle moderator */}
          <TouchableOpacity
            testID={`toggle-mod-${viewer.userId}`}
            style={[
              styles.actionButton,
              { backgroundColor: isModerator ? "#44444420" : "#44BB4420" },
            ]}
            onPress={onToggleMod}
          >
            <Ionicons
              name={isModerator ? "shield-half" : "shield-checkmark"}
              size={16}
              color={isModerator ? "#888" : "#44BB44"}
            />
            <Text
              style={{
                color: isModerator ? "#888" : "#44BB44",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {isModerator
                ? t("live.mod.removeMod", { defaultValue: "Retirer mod" })
                : t("live.mod.makeMod", { defaultValue: "Rendre mod" })}
            </Text>
          </TouchableOpacity>

          {/* Moderation actions */}
          {MODERATION_ACTIONS.map(
            ({ action, icon, color, labelKey, defaultLabel }) => (
              <TouchableOpacity
                key={action}
                testID={`action-${action}-${viewer.userId}`}
                style={[styles.actionButton, { backgroundColor: `${color}15` }]}
                onPress={() => onModerate(action)}
              >
                <Ionicons name={icon as any} size={16} color={color} />
                <Text style={{ color, fontSize: 12, fontWeight: "600" }}>
                  {t(labelKey, { defaultValue: defaultLabel })}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      )}
    </View>
  );
});

// ─── Main Component ───────────────────────────────────────────

export default function LiveModeration({
  viewers,
  moderators,
  onModerate,
  onAssignModerator,
  onRemoveModerator,
  onClose,
}: LiveModerationProps) {
  const colors = useColors();
  const { t } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleExpand = useCallback((userId: string) => {
    setExpandedId((prev) => (prev === userId ? null : userId));
  }, []);

  const renderViewer = useCallback(
    ({ item }: { item: ViewerEntry }) => {
      const isMod = moderators.includes(item.userId);

      return (
        <ViewerRow
          viewer={item}
          isModerator={isMod}
          t={t}
          colors={colors}
          onModerate={(action) => onModerate(item.userId, action)}
          onToggleMod={() =>
            isMod
              ? onRemoveModerator(item.userId)
              : onAssignModerator(item.userId)
          }
          isExpanded={expandedId === item.userId}
          onToggleExpand={() => handleToggleExpand(item.userId)}
        />
      );
    },
    [
      moderators,
      expandedId,
      colors,
      t,
      onModerate,
      onAssignModerator,
      onRemoveModerator,
      handleToggleExpand,
    ],
  );

  const keyExtractor = useCallback((item: ViewerEntry) => item.userId, []);

  return (
    <View
      testID="moderation-panel"
      style={[styles.container, { backgroundColor: colors.card }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("live.mod.title", { defaultValue: "Modération" })}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{viewers.length}</Text>
          </View>
        </View>
        <TouchableOpacity testID="moderation-close" onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Viewer List */}
      {viewers.length === 0 ? (
        <View testID="no-viewers" style={styles.emptyContainer}>
          <Ionicons
            name="people-outline"
            size={40}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t("live.mod.noViewers", {
              defaultValue: "Aucun viewer pour le moment",
            })}
          </Text>
        </View>
      ) : (
        <FlatList
          testID="viewers-list"
          data={viewers}
          renderItem={renderViewer}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    margin: 12,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  countBadge: {
    backgroundColor: "rgba(106,84,163,0.2)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    color: "#6A54A3",
    fontSize: 12,
    fontWeight: "700",
  },
  list: {
    flexGrow: 0,
  },
  viewerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  viewerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  viewerName: {
    fontSize: 15,
    fontWeight: "600",
  },
  modBadge: {
    color: "#44BB44",
    fontSize: 11,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingVertical: 8,
    paddingLeft: 38,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
});
