/**
 * S18 — Moderation Queue Screen
 *
 * Dashboard admin : file d'attente de contenu signalé / flaggé IA,
 * actions rapides (warn/restrict/ban/dismiss).
 */

import { useI18n } from "@/providers/I18nProvider";
import { useContentModerationStore } from "@/stores/content-moderation-store";
import type {
  ContentModerationAction,
  ModerationQueueItem,
  ReportStatus,
} from "@/types/content-moderation";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_TABS: { key: ReportStatus; label: string }[] = [
  { key: "pending", label: "En attente" },
  { key: "reviewing", label: "En cours" },
  { key: "resolved", label: "Résolus" },
  { key: "dismissed", label: "Rejetés" },
];

const QUICK_ACTIONS: {
  action: ContentModerationAction;
  label: string;
  color: string;
}[] = [
  { action: "warn", label: "Warn", color: "#facc15" },
  { action: "restrict", label: "Restrict", color: "#f97316" },
  { action: "ban", label: "Ban", color: "#ef4444" },
];

// ─── Severity badge ─────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "#ef4444",
    high: "#f97316",
    medium: "#facc15",
    low: "#4ade80",
    none: "#888",
  };
  return (
    <View
      testID={`severity-${severity}`}
      style={{
        backgroundColor: colors[severity] ?? "#888",
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
      }}
    >
      <Text style={{ color: "#000", fontSize: 11, fontWeight: "700" }}>
        {severity.toUpperCase()}
      </Text>
    </View>
  );
}

// ─── Queue item row ─────────────────────────────────────────────────────────

function QueueRow({
  item,
  onAction,
  onDismiss,
}: {
  item: ModerationQueueItem;
  onAction: (id: string, action: ContentModerationAction) => void;
  onDismiss: (id: string) => void;
}) {
  return (
    <View
      testID={`queue-item-${item.id}`}
      style={{
        backgroundColor: "#1a1a2e",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
      }}
    >
      {/* Header row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: "#a855f7", fontWeight: "600", marginRight: 8 }}>
            {item.content_type}
          </Text>
          <SeverityBadge severity={item.severity} />
        </View>
        <Text style={{ color: "#888", fontSize: 12 }}>
          ×{item.report_count}
        </Text>
      </View>

      {/* Preview */}
      <Text
        numberOfLines={2}
        style={{ color: "#ccc", fontSize: 13, marginBottom: 8 }}
      >
        {item.content_preview || item.content_id}
      </Text>

      {/* Author & reason */}
      <Text style={{ color: "#888", fontSize: 12, marginBottom: 8 }}>
        @{item.author_username} — {item.reason}
        {item.ai_confidence != null &&
          ` (IA: ${Math.round(item.ai_confidence * 100)}%)`}
      </Text>

      {/* Actions */}
      {item.status === "pending" && (
        <View style={{ flexDirection: "row" }}>
          {QUICK_ACTIONS.map((qa) => (
            <TouchableOpacity
              key={qa.action}
              testID={`action-${qa.action}-${item.id}`}
              onPress={() => onAction(item.id, qa.action)}
              style={{
                backgroundColor: qa.color,
                borderRadius: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                marginRight: 8,
              }}
            >
              <Text style={{ color: "#000", fontWeight: "600", fontSize: 12 }}>
                {qa.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            testID={`dismiss-${item.id}`}
            onPress={() => onDismiss(item.id)}
            style={{
              backgroundColor: "#333",
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text style={{ color: "#ccc", fontSize: 12 }}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function ModerationQueueScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { queue, queueLoading, loadQueue, reviewItem, dismissItem } =
    useContentModerationStore();

  const [activeTab, setActiveTab] = useState<ReportStatus>("pending");

  useEffect(() => {
    loadQueue(activeTab);
  }, [activeTab]);

  const handleAction = async (
    itemId: string,
    action: ContentModerationAction,
  ) => {
    await reviewItem(itemId, action, `Quick action: ${action}`);
  };

  const handleDismiss = async (itemId: string) => {
    await dismissItem(itemId);
  };

  return (
    <View
      testID="moderation-queue-screen"
      style={{ flex: 1, backgroundColor: "#0d0d1a" }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 50,
          paddingHorizontal: 16,
          paddingBottom: 12,
        }}
      >
        <TouchableOpacity testID="back-btn" onPress={() => router.back()}>
          <Text style={{ color: "#a855f7", fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <Text
          style={{
            color: "#fff",
            fontSize: 20,
            fontWeight: "700",
            marginLeft: 12,
          }}
        >
          {t("moderation.queue_title", {
            defaultValue: "File de modération",
          })}
        </Text>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 12,
          marginBottom: 12,
        }}
      >
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            testID={`tab-${tab.key}`}
            onPress={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              marginHorizontal: 4,
              borderRadius: 8,
              backgroundColor: activeTab === tab.key ? "#a855f7" : "#1a1a2e",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: activeTab === tab.key ? "#fff" : "#888",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Queue list */}
      {queueLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text testID="loading-indicator" style={{ color: "#888" }}>
            {t("common.loading", { defaultValue: "Chargement..." })}
          </Text>
        </View>
      ) : (
        <FlatList
          data={queue}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <QueueRow
              item={item}
              onAction={handleAction}
              onDismiss={handleDismiss}
            />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Text
                testID="empty-queue"
                style={{ color: "#888", fontSize: 15 }}
              >
                {t("moderation.empty_queue", {
                  defaultValue: "Aucun élément à modérer",
                })}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
