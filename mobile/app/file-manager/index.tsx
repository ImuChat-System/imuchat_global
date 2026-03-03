/**
 * File Manager Hub (DEV-037)
 *
 * Overview: storage usage, quick actions, recent files, navigation cards to sub-screens.
 */
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useFileManagerStore } from "@/stores/file-manager-store";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function FileManagerHub() {
    const colors = useColors();
    const spacing = useSpacing();
    const router = useRouter();
    const { t } = useI18n();

    const quota = useFileManagerStore((s) => s.quota);
    const breakdown = useFileManagerStore((s) => s.breakdown);
    const files = useFileManagerStore((s) => s.files);
    const fetchFiles = useFileManagerStore((s) => s.fetchFiles);
    const fetchQuota = useFileManagerStore((s) => s.fetchQuota);

    useEffect(() => {
        fetchQuota();
        fetchFiles(null);
    }, [fetchQuota, fetchFiles]);

    const navCards: { key: string; icon: string; label: string; route: string }[] = [
        { key: "my-files", icon: "folder-outline", label: t("fileManager.myFiles"), route: "/file-manager/my-files" },
        { key: "shared", icon: "share-social-outline", label: t("fileManager.shared"), route: "/file-manager/shared" },
        { key: "favorites", icon: "star-outline", label: t("fileManager.favorites"), route: "/file-manager/favorites" },
        { key: "trash", icon: "trash-outline", label: t("fileManager.trash"), route: "/file-manager/trash" },
        { key: "sync", icon: "sync-outline", label: t("fileManager.sync"), route: "/file-manager/sync" },
        { key: "upload", icon: "cloud-upload-outline", label: t("fileManager.upload"), route: "/file-manager/upload" },
    ];

    const breakdownItems = [
        { label: t("fileManager.images"), value: breakdown.images, color: "#4A90D9" },
        { label: t("fileManager.videos"), value: breakdown.videos, color: "#E67E22" },
        { label: t("fileManager.audioFiles"), value: breakdown.audio, color: "#2ECC71" },
        { label: t("fileManager.documents"), value: breakdown.documents, color: "#9B59B6" },
        { label: t("fileManager.archives"), value: breakdown.archives, color: "#E74C3C" },
        { label: t("fileManager.otherFiles"), value: breakdown.other, color: "#95A5A6" },
    ];

    const recentFiles = [...files].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

    return (
        <ScrollView
            testID="file-manager-hub"
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ padding: spacing.md }}
        >
            {/* Storage Usage */}
            <View style={[styles.card, { backgroundColor: colors.surface, padding: spacing.md }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t("fileManager.storageUsage")}
                </Text>

                <View style={styles.quotaRow}>
                    <Text style={[styles.quotaText, { color: colors.text }]}>
                        {formatBytes(quota.usedBytes)}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                        / {formatBytes(quota.totalBytes)}
                    </Text>
                </View>

                {/* Progress bar */}
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${Math.min(quota.usedPercent, 100)}%`,
                                backgroundColor: quota.usedPercent > 80 ? "#E74C3C" : "#4A90D9",
                            },
                        ]}
                    />
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                    {quota.usedPercent}% {t("fileManager.used")}
                </Text>
            </View>

            {/* Breakdown */}
            <View style={[styles.card, { backgroundColor: colors.surface, padding: spacing.md, marginTop: spacing.sm }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t("fileManager.breakdown")}
                </Text>
                {breakdownItems.map((item) => (
                    <View key={item.label} style={styles.breakdownRow}>
                        <View style={[styles.dot, { backgroundColor: item.color }]} />
                        <Text style={{ flex: 1, color: colors.text, fontSize: 14 }}>
                            {item.label}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                            {formatBytes(item.value)}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Recent Files */}
            <View style={[styles.card, { backgroundColor: colors.surface, padding: spacing.md, marginTop: spacing.sm }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t("fileManager.recentFiles")}
                </Text>
                {recentFiles.map((file) => (
                    <View key={file.id} style={styles.fileRow}>
                        <Ionicons
                            name={
                                file.type === "image"
                                    ? "image-outline"
                                    : file.type === "video"
                                      ? "videocam-outline"
                                      : file.type === "audio"
                                        ? "musical-notes-outline"
                                        : "document-outline"
                            }
                            size={20}
                            color={colors.primary}
                        />
                        <Text style={{ flex: 1, color: colors.text, fontSize: 14, marginLeft: 8 }} numberOfLines={1}>
                            {file.name}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                            {formatBytes(file.sizeBytes)}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Navigation Cards */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm }]}>
                {t("fileManager.sections")}
            </Text>
            <View style={styles.navGrid}>
                {navCards.map((card) => (
                    <TouchableOpacity
                        key={card.key}
                        style={[styles.navCard, { backgroundColor: colors.surface }]}
                        activeOpacity={0.7}
                        onPress={() => router.push(card.route as any)}
                    >
                        <Ionicons name={card.icon as any} size={28} color={colors.primary} />
                        <Text style={{ color: colors.text, fontSize: 13, marginTop: 6, textAlign: "center" }}>
                            {card.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: 12, marginBottom: 0 },
    sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
    quotaRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 8 },
    quotaText: { fontSize: 28, fontWeight: "700" },
    progressBar: { height: 8, borderRadius: 4, overflow: "hidden" },
    progressFill: { height: "100%", borderRadius: 4 },
    breakdownRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    fileRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 4 },
    navGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    navCard: {
        width: "47%",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 90,
    },
});
