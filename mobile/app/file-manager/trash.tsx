/**
 * Trash Screen (DEV-037)
 *
 * Deleted files with restore and "empty trash" actions.
 */
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useFileManagerStore } from "@/stores/file-manager-store";
import type { FileItem } from "@/types/file-manager";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TrashScreen() {
    const colors = useColors();
    const spacing = useSpacing();
    const { t } = useI18n();

    const trash = useFileManagerStore((s) => s.trash);
    const loading = useFileManagerStore((s) => s.loading);
    const fetchTrash = useFileManagerStore((s) => s.fetchTrash);
    const restoreItem = useFileManagerStore((s) => s.restoreItem);
    const emptyTrash = useFileManagerStore((s) => s.emptyTrash);

    useEffect(() => {
        fetchTrash();
    }, [fetchTrash]);

    const confirmEmptyTrash = () => {
        Alert.alert(
            t("fileManager.emptyTrashTitle"),
            t("fileManager.emptyTrashConfirm"),
            [
                { text: t("fileManager.cancel"), style: "cancel" },
                { text: t("fileManager.confirm"), style: "destructive", onPress: emptyTrash },
            ]
        );
    };

    const renderItem = ({ item }: { item: FileItem }) => (
        <View style={[styles.row, { backgroundColor: colors.surface }]}>
            <Ionicons name="document-outline" size={22} color={colors.textMuted} />
            <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ color: colors.text, fontSize: 14 }} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
                    {formatBytes(item.sizeBytes)}
                    {item.deletedAt && ` · ${t("fileManager.deletedOn")} ${new Date(item.deletedAt).toLocaleDateString()}`}
                </Text>
            </View>
            <TouchableOpacity
                style={[styles.restoreButton, { borderColor: colors.primary }]}
                onPress={() => restoreItem(item.id)}
            >
                <Ionicons name="refresh-outline" size={14} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 12, marginLeft: 4 }}>
                    {t("fileManager.restore")}
                </Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View testID="trash-screen" style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    return (
        <View testID="trash-screen" style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Empty trash button */}
            {trash.length > 0 && (
                <TouchableOpacity
                    style={[styles.emptyButton, { backgroundColor: "#E74C3C22", margin: spacing.md, marginBottom: 0 }]}
                    onPress={confirmEmptyTrash}
                >
                    <Ionicons name="trash" size={16} color="#E74C3C" />
                    <Text style={{ color: "#E74C3C", fontSize: 13, fontWeight: "600", marginLeft: 6 }}>
                        {t("fileManager.emptyTrashAction")}
                    </Text>
                </TouchableOpacity>
            )}

            <FlatList
                data={trash}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: spacing.md }}
                ListEmptyComponent={
                    <View style={{ alignItems: "center", marginTop: 60 }}>
                        <Ionicons name="trash-outline" size={48} color={colors.textMuted} />
                        <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 8 }}>
                            {t("fileManager.trashEmpty")}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, marginBottom: 6 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    restoreButton: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    emptyButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        borderRadius: 10,
    },
});
