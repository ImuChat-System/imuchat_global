/**
 * Sync Screen (DEV-037)
 *
 * Device list, sync status, and sync settings toggles.
 */
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useFileManagerStore } from "@/stores/file-manager-store";

export default function SyncScreen() {
    const colors = useColors();
    const spacing = useSpacing();
    const { t } = useI18n();

    const devices = useFileManagerStore((s) => s.devices);
    const syncSettings = useFileManagerStore((s) => s.syncSettings);
    const loading = useFileManagerStore((s) => s.loading);
    const fetchDevices = useFileManagerStore((s) => s.fetchDevices);
    const updateSyncSettings = useFileManagerStore((s) => s.updateSyncSettings);
    const triggerSync = useFileManagerStore((s) => s.triggerSync);

    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    const deviceIcon = (type: string): string => {
        switch (type) {
            case "mobile":
                return "phone-portrait-outline";
            case "desktop":
                return "desktop-outline";
            case "tablet":
                return "tablet-portrait-outline";
            default:
                return "hardware-chip-outline";
        }
    };

    const statusColor = (status: string): string => {
        switch (status) {
            case "synced":
                return "#2ECC71";
            case "syncing":
                return "#3498DB";
            case "pending":
                return "#E67E22";
            case "error":
                return "#E74C3C";
            default:
                return "#95A5A6";
        }
    };

    const statusLabel = (status: string): string => {
        switch (status) {
            case "synced":
                return t("fileManager.syncStatusSynced");
            case "syncing":
                return t("fileManager.syncStatusSyncing");
            case "pending":
                return t("fileManager.syncStatusPending");
            case "error":
                return t("fileManager.syncStatusError");
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <View testID="sync-screen" style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            testID="sync-screen"
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ padding: spacing.md }}
        >
            {/* Sync Now Button */}
            <TouchableOpacity
                style={[styles.syncButton, { backgroundColor: colors.primary }]}
                onPress={triggerSync}
                activeOpacity={0.7}
            >
                <Ionicons name="sync" size={20} color="#FFF" />
                <Text style={{ color: "#FFF", fontSize: 15, fontWeight: "600", marginLeft: 8 }}>
                    {t("fileManager.syncNow")}
                </Text>
            </TouchableOpacity>

            {/* Devices */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.md }]}>
                {t("fileManager.devices")}
            </Text>
            {devices.map((device) => (
                <View key={device.id} style={[styles.card, { backgroundColor: colors.surface, padding: spacing.sm }]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name={deviceIcon(device.type) as any} size={28} color={colors.primary} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>
                                {device.name}
                            </Text>
                            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                                {t("fileManager.lastSync")}: {new Date(device.lastSyncAt).toLocaleString()}
                            </Text>
                        </View>
                        <View style={[styles.statusDot, { backgroundColor: statusColor(device.status) }]} />
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                            {statusLabel(device.status)}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                            {device.itemsSynced}/{device.itemsSynced + device.itemsPending} {t("fileManager.items")}
                        </Text>
                    </View>
                </View>
            ))}

            {devices.length === 0 && (
                <View style={{ alignItems: "center", marginTop: 30 }}>
                    <Ionicons name="desktop-outline" size={40} color={colors.textMuted} />
                    <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 8 }}>
                        {t("fileManager.noDevices")}
                    </Text>
                </View>
            )}

            {/* Sync Settings */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.lg }]}>
                {t("fileManager.syncSettings")}
            </Text>
            <View style={[styles.card, { backgroundColor: colors.surface, padding: spacing.sm }]}>
                <View style={styles.settingRow}>
                    <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>
                        {t("fileManager.autoSync")}
                    </Text>
                    <Switch
                        value={syncSettings.autoSync}
                        onValueChange={(v) => updateSyncSettings({ autoSync: v })}
                        trackColor={{ true: colors.primary }}
                    />
                </View>
                <View style={styles.settingRow}>
                    <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>
                        {t("fileManager.syncOnWifi")}
                    </Text>
                    <Switch
                        value={syncSettings.syncOnWifiOnly}
                        onValueChange={(v) => updateSyncSettings({ syncOnWifiOnly: v })}
                        trackColor={{ true: colors.primary }}
                    />
                </View>
                <View style={styles.settingRow}>
                    <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>
                        {t("fileManager.syncPhotos")}
                    </Text>
                    <Switch
                        value={syncSettings.syncPhotos}
                        onValueChange={(v) => updateSyncSettings({ syncPhotos: v })}
                        trackColor={{ true: colors.primary }}
                    />
                </View>
                <View style={styles.settingRow}>
                    <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>
                        {t("fileManager.syncVideos")}
                    </Text>
                    <Switch
                        value={syncSettings.syncVideos}
                        onValueChange={(v) => updateSyncSettings({ syncVideos: v })}
                        trackColor={{ true: colors.primary }}
                    />
                </View>
                <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                    <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>
                        {t("fileManager.syncDocuments")}
                    </Text>
                    <Switch
                        value={syncSettings.syncDocuments}
                        onValueChange={(v) => updateSyncSettings({ syncDocuments: v })}
                        trackColor={{ true: colors.primary }}
                    />
                </View>
            </View>

            {/* Frequency */}
            <View style={[styles.card, { backgroundColor: colors.surface, padding: spacing.sm, marginTop: spacing.sm }]}>
                <Text style={{ color: colors.text, fontSize: 14, marginBottom: 6 }}>
                    {t("fileManager.syncFrequency")}
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    {[15, 30, 60].map((min) => (
                        <TouchableOpacity
                            key={min}
                            style={[
                                styles.freqChip,
                                {
                                    backgroundColor:
                                        syncSettings.syncFrequencyMinutes === min
                                            ? colors.primary
                                            : colors.surface,
                                    borderColor: colors.primary,
                                },
                            ]}
                            onPress={() => updateSyncSettings({ syncFrequencyMinutes: min })}
                        >
                            <Text
                                style={{
                                    color: syncSettings.syncFrequencyMinutes === min ? "#FFF" : colors.primary,
                                    fontSize: 13,
                                    fontWeight: "600",
                                }}
                            >
                                {min} min
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
    card: { borderRadius: 12, marginBottom: 8 },
    syncButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        borderRadius: 12,
    },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    settingRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E0E0E0",
    },
    freqChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
});
