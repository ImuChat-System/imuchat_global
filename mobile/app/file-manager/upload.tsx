/**
 * Upload Screen (DEV-037)
 *
 * Upload queue, file picker, progress display, clear completed.
 */
import { Ionicons } from "@expo/vector-icons";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useFileManagerStore } from "@/stores/file-manager-store";
import type { UploadItem } from "@/types/file-manager";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadScreen() {
    const colors = useColors();
    const spacing = useSpacing();
    const { t } = useI18n();

    const uploads = useFileManagerStore((s) => s.uploads);
    const addUpload = useFileManagerStore((s) => s.addUpload);
    const removeUpload = useFileManagerStore((s) => s.removeUpload);
    const clearCompletedUploads = useFileManagerStore((s) => s.clearCompletedUploads);

    const pickFile = () => {
        // In production this would use expo-document-picker
        addUpload({
            fileName: `file_${Date.now()}.pdf`,
            fileType: "document",
            sizeBytes: Math.floor(Math.random() * 5000000) + 100000,
            targetFolderId: null,
        });
    };

    const statusIcon = (status: string): string => {
        switch (status) {
            case "completed":
                return "checkmark-circle";
            case "error":
                return "alert-circle";
            case "uploading":
                return "cloud-upload";
            default:
                return "time-outline";
        }
    };

    const statusColor = (status: string): string => {
        switch (status) {
            case "completed":
                return "#2ECC71";
            case "error":
                return "#E74C3C";
            case "uploading":
                return "#3498DB";
            default:
                return "#95A5A6";
        }
    };

    const completedCount = uploads.filter((u) => u.status === "completed").length;

    const renderItem = ({ item }: { item: UploadItem }) => (
        <View style={[styles.row, { backgroundColor: colors.surface, padding: spacing.sm }]}>
            <Ionicons name={statusIcon(item.status) as any} size={24} color={statusColor(item.status)} />
            <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
                    {item.fileName}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
                    {formatBytes(item.sizeBytes)}
                    {item.error && ` · ${item.error}`}
                </Text>

                {/* Progress bar */}
                {item.status === "uploading" && (
                    <View style={[styles.progressBar, { backgroundColor: colors.border, marginTop: 6 }]}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${item.progress}%`, backgroundColor: "#3498DB" },
                            ]}
                        />
                    </View>
                )}
                {item.status === "uploading" && (
                    <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>
                        {item.progress}%
                    </Text>
                )}
            </View>
            <TouchableOpacity onPress={() => removeUpload(item.id)} hitSlop={8}>
                <Ionicons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View testID="upload-screen" style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Pick file button */}
            <TouchableOpacity
                style={[styles.pickButton, { backgroundColor: colors.primary, margin: spacing.md, marginBottom: 0 }]}
                onPress={pickFile}
                activeOpacity={0.7}
            >
                <Ionicons name="add-circle-outline" size={20} color="#FFF" />
                <Text style={{ color: "#FFF", fontSize: 15, fontWeight: "600", marginLeft: 8 }}>
                    {t("fileManager.pickFile")}
                </Text>
            </TouchableOpacity>

            {/* Clear completed */}
            {completedCount > 0 && (
                <TouchableOpacity
                    style={{ alignSelf: "flex-end", marginHorizontal: spacing.md, marginTop: 8 }}
                    onPress={clearCompletedUploads}
                >
                    <Text style={{ color: colors.primary, fontSize: 13 }}>
                        {t("fileManager.clearCompleted")} ({completedCount})
                    </Text>
                </TouchableOpacity>
            )}

            {/* Upload list */}
            <FlatList
                data={uploads}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: spacing.md }}
                ListEmptyComponent={
                    <View style={{ alignItems: "center", marginTop: 60 }}>
                        <Ionicons name="cloud-upload-outline" size={48} color={colors.textMuted} />
                        <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 8 }}>
                            {t("fileManager.noUploads")}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    row: { borderRadius: 12, marginBottom: 6, flexDirection: "row", alignItems: "center" },
    pickButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        borderRadius: 12,
    },
    progressBar: { height: 6, borderRadius: 3, overflow: "hidden" },
    progressFill: { height: "100%", borderRadius: 3 },
});
