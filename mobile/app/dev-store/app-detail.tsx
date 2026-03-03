/**
 * AppDetailScreen — Detailed view of a submitted app (DEV-034)
 *
 * Shows: metadata, status, versions history, reviews, revenue,
 * and actions (edit, submit for review, publish new version).
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useDevStore } from "@/stores/dev-store-store";
import type { SubmissionStatus } from "@/types/dev-store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  draft: "#888",
  pending_review: "#f5a623",
  in_review: "#3b82f6",
  approved: "#22c55e",
  rejected: "#ef4444",
  published: "#8b5cf6",
  suspended: "#ef4444",
};

export default function AppDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();

  const {
    submissions,
    versions,
    versionsLoading,
    fetchVersions,
    submitForReview,
    deleteSubmission,
  } = useDevStore();

  const app = useMemo(
    () => submissions.find((s) => s.id === id) ?? null,
    [submissions, id],
  );

  useEffect(() => {
    if (id) fetchVersions(id);
  }, [id, fetchVersions]);

  const appVersions = id ? versions[id] || [] : [];

  const handleSubmitReview = useCallback(async () => {
    if (!id) return;
    Alert.alert(t("devStore.confirmSubmit"), t("devStore.confirmSubmitMsg"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("devStore.submit"),
        onPress: async () => {
          await submitForReview(id);
        },
      },
    ]);
  }, [id, submitForReview, t]);

  const handleDelete = useCallback(async () => {
    if (!id) return;
    Alert.alert(t("devStore.confirmDelete"), t("devStore.confirmDeleteMsg"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("devStore.delete"),
        style: "destructive",
        onPress: async () => {
          await deleteSubmission(id);
          router.back();
        },
      },
    ]);
  }, [id, deleteSubmission, router, t]);

  if (!app) {
    return (
      <View
        testID="app-detail-screen"
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={styles.emptyIcon}>❌</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          {t("devStore.appNotFound")}
        </Text>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[app.status] || "#888";

  return (
    <ScrollView
      testID="app-detail-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={[styles.headerCard, { backgroundColor: colors.surface }]}>
        <Text style={styles.appIcon}>{app.icon_url || "📦"}</Text>
        <Text style={[styles.appName, { color: colors.text }]}>{app.name}</Text>
        <Text style={[styles.appMeta, { color: colors.textMuted }]}>
          v{app.version} · {app.category}
        </Text>
        <View
          style={[styles.statusPill, { backgroundColor: statusColor + "20" }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {t(`devStore.status_${app.status}`)}
          </Text>
        </View>
      </View>

      {/* ── Description ────────────────────────────────────── */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("devStore.description")}
        </Text>
        <Text style={[styles.descText, { color: colors.textMuted }]}>
          {app.description || t("devStore.noDescription")}
        </Text>
      </View>

      {/* ── Permissions ────────────────────────────────────── */}
      {app.permissions.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("devStore.permissions")}
          </Text>
          <View style={styles.permsRow}>
            {app.permissions.map((perm) => (
              <View
                key={perm}
                style={[
                  styles.permBadge,
                  { backgroundColor: colors.primary + "15" },
                ]}
              >
                <Text style={{ fontSize: 12, color: colors.primary }}>
                  {perm}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Rejection reasons ──────────────────────────────── */}
      {app.rejection_reasons.length > 0 && (
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.error + "10",
              borderColor: colors.error + "40",
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.error }]}>
            {t("devStore.rejectionReasons")}
          </Text>
          {app.rejection_reasons.map((reason, i) => (
            <Text
              key={i}
              style={[styles.rejectionItem, { color: colors.error }]}
            >
              • {reason.message}
            </Text>
          ))}
        </View>
      )}

      {/* ── Versions ───────────────────────────────────────── */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("devStore.versions")}
        </Text>
        {versionsLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : appVersions.length === 0 ? (
          <Text style={[styles.emptyVersions, { color: colors.textMuted }]}>
            {t("devStore.noVersions")}
          </Text>
        ) : (
          appVersions.map((v) => (
            <View
              key={v.id}
              style={[styles.versionRow, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.versionName, { color: colors.text }]}>
                v{v.version}
              </Text>
              <Text style={[styles.versionDate, { color: colors.textMuted }]}>
                {new Date(v.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* ── Actions ────────────────────────────────────────── */}
      <View style={styles.actionsContainer}>
        {app.status === "draft" && (
          <TouchableOpacity
            testID="btn-submit-review"
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={handleSubmitReview}
          >
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>
              {t("devStore.submitForReview")}
            </Text>
          </TouchableOpacity>
        )}

        {(app.status === "draft" || app.status === "rejected") && (
          <TouchableOpacity
            testID="btn-delete-app"
            style={[styles.actionBtn, { backgroundColor: colors.error }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>{t("devStore.delete")}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: "center", justifyContent: "center" },
  headerCard: {
    alignItems: "center",
    padding: 20,
    borderRadius: 14,
    marginBottom: 14,
  },
  appIcon: { fontSize: 48, marginBottom: 8 },
  appName: { fontSize: 22, fontWeight: "800" },
  appMeta: { fontSize: 13, marginTop: 4 },
  statusPill: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: { fontSize: 13, fontWeight: "600" },
  section: { borderRadius: 12, padding: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  descText: { fontSize: 14, lineHeight: 20 },
  permsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  permBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  rejectionItem: { fontSize: 13, marginBottom: 4 },
  emptyVersions: { fontSize: 13 },
  versionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  versionName: { fontSize: 14, fontWeight: "600" },
  versionDate: { fontSize: 12 },
  actionsContainer: { gap: 10, marginTop: 16 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  actionBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
});
