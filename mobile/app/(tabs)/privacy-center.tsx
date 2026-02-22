/**
 * Privacy Center Screen — Mobile
 *
 * RGPD/GDPR Compliance Center:
 * - Data Export (Article 20)
 * - Blocked Users Management
 * - AI Consent Settings
 * - Report History
 */

import { useI18n } from "@/providers/I18nProvider";
import { useTheme } from "@/providers/ThemeProvider";
import {
  BlockedUser,
  DataExportProgress,
  exportUserData,
  getBlockedUsers,
  getMyReports,
  getPrivacyConsents,
  PrivacyConsent,
  Report,
  shareExportedData,
  unblockUser,
  updatePrivacyConsent,
} from "@/services/privacy-center";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ---------------------------------------------------------------------------
// Privacy Center Screen
// ---------------------------------------------------------------------------

export default function PrivacyCenterScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [consents, setConsents] = useState<PrivacyConsent[]>([]);
  const [exportProgress, setExportProgress] = useState<DataExportProgress>({
    status: "idle",
    progress: 0,
    currentStep: "",
  });
  const [exportedFilePath, setExportedFilePath] = useState<string | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [blocked, reportsList, consentsList] = await Promise.all([
        getBlockedUsers(),
        getMyReports(),
        getPrivacyConsents(),
      ]);
      setBlockedUsers(blocked);
      setReports(reportsList);
      setConsents(consentsList);
    } catch (error) {
      console.error("Failed to load privacy data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Handlers
  const handleExportData = async () => {
    setExportProgress({ status: "exporting", progress: 0, currentStep: "..." });
    const result = await exportUserData(setExportProgress);

    if (result.success && result.filePath) {
      setExportedFilePath(result.filePath);
      Alert.alert(
        t("privacy.exportSuccess"),
        t("privacy.exportSuccessMessage"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("privacy.shareExport"),
            onPress: () => shareExportedData(result.filePath!),
          },
        ],
      );
    } else {
      Alert.alert(t("common.error"), result.error || t("privacy.exportError"));
    }
  };

  const handleUnblockUser = async (userId: string, username: string | null) => {
    Alert.alert(
      t("privacy.unblockUser"),
      t("privacy.unblockUserConfirm", { username: username || userId }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("privacy.unblock"),
          style: "destructive",
          onPress: async () => {
            const success = await unblockUser(userId);
            if (success) {
              setBlockedUsers((prev) =>
                prev.filter((u) => u.blockedUserId !== userId),
              );
            }
          },
        },
      ],
    );
  };

  const handleToggleConsent = async (
    consentType: PrivacyConsent["consentType"],
    newValue: boolean,
  ) => {
    const success = await updatePrivacyConsent(consentType, newValue);
    if (success) {
      setConsents((prev) =>
        prev.map((c) =>
          c.consentType === consentType ? { ...c, granted: newValue } : c,
        ),
      );
    }
  };

  const getReportStatusColor = (status: Report["status"]) => {
    switch (status) {
      case "pending":
        return theme.colors.warning || "#f59e0b";
      case "reviewed":
        return theme.colors.primary;
      case "resolved":
        return theme.colors.success || "#22c55e";
      case "dismissed":
        return theme.colors.textMuted;
      default:
        return theme.colors.text;
    }
  };

  const getConsentLabel = (type: PrivacyConsent["consentType"]) => {
    switch (type) {
      case "analytics":
        return t("privacy.consentAnalytics");
      case "marketing":
        return t("privacy.consentMarketing");
      case "ai_processing":
        return t("privacy.consentAi");
      case "third_party":
        return t("privacy.consentThirdParty");
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t("privacy.title")}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {/* ===== DATA EXPORT (RGPD Art. 20) ===== */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t("privacy.dataExport")}
      </Text>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.description, { color: theme.colors.textMuted }]}>
          {t("privacy.dataExportDescription")}
        </Text>

        {exportProgress.status === "exporting" ? (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text
              style={[styles.progressText, { color: theme.colors.textMuted }]}
            >
              {exportProgress.currentStep} ({exportProgress.progress}%)
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.exportButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleExportData}
          >
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.exportButtonText}>
              {t("privacy.exportMyData")}
            </Text>
          </TouchableOpacity>
        )}

        {exportedFilePath && exportProgress.status === "complete" && (
          <TouchableOpacity
            style={[styles.shareButton, { borderColor: theme.colors.primary }]}
            onPress={() => shareExportedData(exportedFilePath)}
          >
            <Ionicons
              name="share-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.shareButtonText, { color: theme.colors.primary }]}
            >
              {t("privacy.shareExport")}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ===== AI CONSENT ===== */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t("privacy.aiConsent")}
      </Text>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {consents.map((consent, idx) => (
          <View key={consent.consentType}>
            <View style={styles.consentRow}>
              <Text style={[styles.consentLabel, { color: theme.colors.text }]}>
                {getConsentLabel(consent.consentType)}
              </Text>
              <Switch
                value={consent.granted}
                onValueChange={(val) =>
                  handleToggleConsent(consent.consentType, val)
                }
                trackColor={{ false: "#767577", true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>
            {idx < consents.length - 1 && (
              <View
                style={[
                  styles.divider,
                  { backgroundColor: theme.colors.border },
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* ===== BLOCKED USERS ===== */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t("privacy.blockedUsers")} ({blockedUsers.length})
      </Text>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {blockedUsers.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {t("privacy.noBlockedUsers")}
          </Text>
        ) : (
          blockedUsers.map((blocked, idx) => (
            <View key={blocked.id}>
              <View style={styles.blockedUserRow}>
                <View style={styles.blockedUserInfo}>
                  <Text
                    style={[
                      styles.blockedUsername,
                      { color: theme.colors.text },
                    ]}
                  >
                    {blocked.blockedUser.displayName ||
                      blocked.blockedUser.username ||
                      t("privacy.unknownUser")}
                  </Text>
                  <Text
                    style={[
                      styles.blockedDate,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    {new Date(blocked.blockedAt).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    handleUnblockUser(
                      blocked.blockedUserId,
                      blocked.blockedUser.username,
                    )
                  }
                  style={[
                    styles.unblockBtn,
                    { borderColor: theme.colors.error },
                  ]}
                >
                  <Text style={{ color: theme.colors.error }}>
                    {t("privacy.unblock")}
                  </Text>
                </TouchableOpacity>
              </View>
              {idx < blockedUsers.length - 1 && (
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
              )}
            </View>
          ))
        )}
      </View>

      {/* ===== REPORTS HISTORY ===== */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t("privacy.myReports")} ({reports.length})
      </Text>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {reports.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {t("privacy.noReports")}
          </Text>
        ) : (
          reports.slice(0, 10).map((report, idx) => (
            <View key={report.id}>
              <View style={styles.reportRow}>
                <View style={styles.reportInfo}>
                  <Text
                    style={[styles.reportType, { color: theme.colors.text }]}
                  >
                    {t(`privacy.reportType_${report.reportType}`)}
                  </Text>
                  <Text
                    style={[
                      styles.reportReason,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    {t(`privacy.reportReason_${report.reason}`)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.reportStatus,
                    {
                      backgroundColor:
                        getReportStatusColor(report.status) + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.reportStatusText,
                      { color: getReportStatusColor(report.status) },
                    ]}
                  >
                    {t(`privacy.reportStatus_${report.status}`)}
                  </Text>
                </View>
              </View>
              {idx < Math.min(reports.length, 10) - 1 && (
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
              )}
            </View>
          ))
        )}
      </View>

      {/* ===== LEGAL LINKS ===== */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t("privacy.legalInfo")}
      </Text>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.legalRow}
          onPress={() => Linking.openURL("https://imuchat.app/privacy")}
        >
          <Ionicons
            name="document-text-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={[styles.legalText, { color: theme.colors.text }]}>
            {t("privacy.privacyPolicy")}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>

        <View
          style={[styles.divider, { backgroundColor: theme.colors.border }]}
        />

        <TouchableOpacity
          style={styles.legalRow}
          onPress={() => Linking.openURL("https://imuchat.app/terms")}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={[styles.legalText, { color: theme.colors.text }]}>
            {t("privacy.termsOfService")}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>

        <View
          style={[styles.divider, { backgroundColor: theme.colors.border }]}
        />

        <TouchableOpacity
          style={styles.legalRow}
          onPress={() => Linking.openURL("mailto:dpo@imuchat.app")}
        >
          <Ionicons
            name="mail-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={[styles.legalText, { color: theme.colors.text }]}>
            {t("privacy.contactDpo")}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Spacer */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  progressText: {
    fontSize: 14,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  exportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  consentLabel: {
    fontSize: 15,
    flex: 1,
    marginRight: 16,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  blockedUserRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  blockedUserInfo: {
    flex: 1,
  },
  blockedUsername: {
    fontSize: 15,
    fontWeight: "500",
  },
  blockedDate: {
    fontSize: 12,
    marginTop: 2,
  },
  unblockBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 8,
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  reportInfo: {
    flex: 1,
  },
  reportType: {
    fontSize: 15,
    fontWeight: "500",
  },
  reportReason: {
    fontSize: 12,
    marginTop: 2,
  },
  reportStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  reportStatusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  legalText: {
    flex: 1,
    fontSize: 15,
  },
});
