/**
 * Favorites Screen (DEV-037)
 *
 * Starred / favorite files with unfavorite option.
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
import type { FileItem } from "@/types/file-manager";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FavoritesScreen() {
    const colors = useColors();
    const spacing = useSpacing();
    const { t } = useI18n();

    const favorites = useFileManagerStore((s) => s.favorites);
    const loading = useFileManagerStore((s) => s.loading);
    const fetchFavorites = useFileManagerStore((s) => s.fetchFavorites);
    const toggleFavorite = useFileManagerStore((s) => s.toggleFavorite);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const renderItem = ({ item }: { item: FileItem }) => (
        <View style={[styles.row, { backgroundColor: colors.surface }]}>
            <Ionicons
                name={
                    item.type === "image"
                        ? "image-outline"
                        : item.type === "video"
                          ? "videocam-outline"
                          : item.type === "audio"
                            ? "musical-notes-outline"
                            : "document-outline"
                }
                size={22}
                color={colors.primary}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
                    {formatBytes(item.sizeBytes)} · {new Date(item.updatedAt).toLocaleDateString()}
                </Text>
            </View>
            <TouchableOpacity onPress={() => toggleFavorite(item.id)} hitSlop={8}>
                <Ionicons name="star" size={20} color="#F5A623" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View testID="favorites-screen" style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    return (
        <View testID="favorites-screen" style={{ flex: 1, backgroundColor: colors.background }}>
            <FlatList
                data={favorites}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: spacing.md }}
                ListEmptyComponent={
                    <View style={{ alignItems: "center", marginTop: 60 }}>
                        <Ionicons name="star-outline" size={48} color={colors.textMuted} />
                        <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 8 }}>
                            {t("fileManager.noFavorites")}
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
});
