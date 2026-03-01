/**
 * AliceHomeScreen — Écran principal de l'assistant IA Alice
 *
 * Sections :
 *  - Grille de personas (sélection rapide du mode d'Alice)
 *  - Liste des conversations récentes
 *  - Bouton « Nouvelle conversation »
 *  - Accès aux paramètres du fournisseur LLM
 *
 * Phase 3 — DEV-024 Module IA
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useAlice } from "@/hooks/useAlice";
import type { AliceConversation } from "@/stores/alice-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Persona Definitions (UI-only) ────────────────────────────
const PERSONAS = [
    { id: "general", icon: "sparkles", label: "Alice", color: "#8B5CF6" },
    { id: "health", icon: "heart", label: "Santé", color: "#EF4444" },
    { id: "study", icon: "school", label: "Études", color: "#3B82F6" },
    { id: "style", icon: "shirt", label: "Style", color: "#EC4899" },
    { id: "pro", icon: "briefcase", label: "Pro", color: "#F59E0B" },
    { id: "code", icon: "code-slash", label: "Code", color: "#10B981" },
    { id: "creative", icon: "color-palette", label: "Créatif", color: "#6366F1" },
] as const;

// ─── Component ────────────────────────────────────────────────
export default function AliceHomeScreen() {
    const colors = useColors();
    const spacing = useSpacing();
    const { t } = useI18n();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    const {
        conversations,
        selectedPersona,
        providerSettings,
        createConversation,
        deleteConversation,
        switchConversation,
        setPersona,
    } = useAlice();

    // Sort conversations by updatedAt desc
    const sortedConversations = useMemo(
        () =>
            [...conversations].sort(
                (a, b) =>
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime(),
            ),
        [conversations],
    );

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        // Nothing async to reload for now, but structure supports it
        setRefreshing(false);
    }, []);

    const handleNewConversation = useCallback(
        (personaId?: string) => {
            if (personaId) setPersona(personaId);
            createConversation(personaId);
            router.push("/alice/chat");
        },
        [createConversation, setPersona, router],
    );

    const handleOpenConversation = useCallback(
        (conversation: AliceConversation) => {
            switchConversation(conversation.id);
            router.push("/alice/chat");
        },
        [switchConversation, router],
    );

    const handleDeleteConversation = useCallback(
        (conversation: AliceConversation) => {
            Alert.alert(
                t("alice.deleteTitle") || "Supprimer",
                t("alice.deleteConfirm") ||
                    "Voulez-vous supprimer cette conversation ?",
                [
                    { text: t("common.cancel") || "Annuler", style: "cancel" },
                    {
                        text: t("common.delete") || "Supprimer",
                        style: "destructive",
                        onPress: () => deleteConversation(conversation.id),
                    },
                ],
            );
        },
        [deleteConversation, t],
    );

    const handleOpenSettings = useCallback(() => {
        router.push("/alice/settings");
    }, [router]);

    // ─── Provider badge ──────────────────────────────────────
    const providerLabel = useMemo(() => {
        const names: Record<string, string> = {
            openai: "OpenAI",
            anthropic: "Claude",
            google: "Gemini",
            mistral: "Mistral",
            groq: "Groq",
            custom: "Custom",
        };
        return names[providerSettings.provider] || providerSettings.provider;
    }, [providerSettings.provider]);

    // ─── Render Persona Card ─────────────────────────────────
    const renderPersonaCard = useCallback(
        (persona: (typeof PERSONAS)[number]) => {
            const isSelected = selectedPersona === persona.id;
            return (
                <TouchableOpacity
                    key={persona.id}
                    style={[
                        styles.personaCard,
                        {
                            backgroundColor: isSelected
                                ? persona.color + "25"
                                : colors.surface,
                            borderColor: isSelected
                                ? persona.color
                                : colors.border,
                        },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleNewConversation(persona.id)}
                >
                    <View
                        style={[
                            styles.personaIcon,
                            { backgroundColor: persona.color + "20" },
                        ]}
                    >
                        <Ionicons
                            name={persona.icon as keyof typeof Ionicons.glyphMap}
                            size={24}
                            color={persona.color}
                        />
                    </View>
                    <Text
                        style={[styles.personaLabel, { color: colors.text }]}
                        numberOfLines={1}
                    >
                        {persona.label}
                    </Text>
                </TouchableOpacity>
            );
        },
        [selectedPersona, colors, handleNewConversation],
    );

    // ─── Render Conversation Row ─────────────────────────────
    const renderConversation = useCallback(
        ({ item }: { item: AliceConversation }) => {
            const persona = PERSONAS.find((p) => p.id === item.persona);
            const lastMessage =
                item.messages.length > 0
                    ? item.messages[item.messages.length - 1]
                    : null;
            const timeAgo = formatTimeAgo(item.updatedAt);

            return (
                <TouchableOpacity
                    style={[
                        styles.conversationRow,
                        {
                            backgroundColor: colors.surface,
                            borderBottomColor: colors.border,
                        },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleOpenConversation(item)}
                    onLongPress={() => handleDeleteConversation(item)}
                >
                    <View
                        style={[
                            styles.conversationIcon,
                            {
                                backgroundColor:
                                    (persona?.color || "#8B5CF6") + "20",
                            },
                        ]}
                    >
                        <Ionicons
                            name={
                                (persona?.icon as keyof typeof Ionicons.glyphMap) ||
                                "sparkles"
                            }
                            size={20}
                            color={persona?.color || "#8B5CF6"}
                        />
                    </View>
                    <View style={styles.conversationContent}>
                        <Text
                            style={[
                                styles.conversationTitle,
                                { color: colors.text },
                            ]}
                            numberOfLines={1}
                        >
                            {item.title}
                        </Text>
                        {lastMessage && (
                            <Text
                                style={[
                                    styles.conversationPreview,
                                    { color: colors.textMuted },
                                ]}
                                numberOfLines={1}
                            >
                                {lastMessage.role === "assistant"
                                    ? "Alice : "
                                    : ""}
                                {lastMessage.content}
                            </Text>
                        )}
                    </View>
                    <Text
                        style={[
                            styles.conversationTime,
                            { color: colors.textMuted },
                        ]}
                    >
                        {timeAgo}
                    </Text>
                </TouchableOpacity>
            );
        },
        [colors, handleOpenConversation, handleDeleteConversation],
    );

    // ─── Empty State ─────────────────────────────────────────
    const EmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="sparkles" size={48} color={colors.textMuted} />
            <Text
                style={[styles.emptyTitle, { color: colors.text }]}
            >
                {t("alice.emptyTitle") || "Bienvenue !"}
            </Text>
            <Text
                style={[
                    styles.emptySubtitle,
                    { color: colors.textMuted },
                ]}
            >
                {t("alice.emptySubtitle") ||
                    "Choisissez un persona ci-dessus pour démarrer une conversation avec Alice."}
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: spacing.xl }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
            >
                {/* ─── Header with Provider Badge ─── */}
                <View
                    style={[styles.header, { paddingHorizontal: spacing.md }]}
                >
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            {t("alice.title") || "Alice IA"}
                        </Text>
                        <Text
                            style={[
                                styles.headerSubtitle,
                                { color: colors.textMuted },
                            ]}
                        >
                            {t("alice.subtitle") ||
                                "Votre assistante intelligente"}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.providerBadge,
                            { backgroundColor: colors.primary + "15" },
                        ]}
                        onPress={handleOpenSettings}
                    >
                        <Ionicons
                            name="settings-outline"
                            size={14}
                            color={colors.primary}
                        />
                        <Text
                            style={[
                                styles.providerBadgeText,
                                { color: colors.primary },
                            ]}
                        >
                            {providerLabel}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ─── Persona Grid ─── */}
                <View style={styles.sectionHeader}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: colors.text,
                                paddingHorizontal: spacing.md,
                            },
                        ]}
                    >
                        {t("alice.personas") || "Personas"}
                    </Text>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.personaGrid,
                        { paddingHorizontal: spacing.md },
                    ]}
                >
                    {PERSONAS.map(renderPersonaCard)}
                </ScrollView>

                {/* ─── New Conversation Button ─── */}
                <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.md }}>
                    <TouchableOpacity
                        style={[
                            styles.newConversationBtn,
                            { backgroundColor: colors.primary },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => handleNewConversation()}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.newConversationBtnText}>
                            {t("alice.newChat") || "Nouvelle conversation"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ─── Conversations List ─── */}
                <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: colors.text,
                                paddingHorizontal: spacing.md,
                            },
                        ]}
                    >
                        {t("alice.recentChats") || "Conversations récentes"}
                    </Text>
                    {sortedConversations.length > 0 && (
                        <Text
                            style={[
                                styles.sectionCount,
                                {
                                    color: colors.textMuted,
                                    paddingHorizontal: spacing.md,
                                },
                            ]}
                        >
                            {sortedConversations.length}
                        </Text>
                    )}
                </View>

                {sortedConversations.length > 0 ? (
                    <FlatList
                        data={sortedConversations}
                        keyExtractor={(item) => item.id}
                        renderItem={renderConversation}
                        scrollEnabled={false}
                    />
                ) : (
                    <EmptyState />
                )}
            </ScrollView>
        </View>
    );
}

// ─── Helpers ──────────────────────────────────────────────────
function formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    const diffHr = Math.floor(diffMs / 3_600_000);
    const diffDay = Math.floor(diffMs / 86_400_000);

    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `${diffMin}min`;
    if (diffHr < 24) return `${diffHr}h`;
    if (diffDay < 7) return `${diffDay}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: { fontSize: 28, fontWeight: "700" },
    headerSubtitle: { fontSize: 14, marginTop: 2 },

    // Provider Badge
    providerBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    providerBadgeText: { fontSize: 12, fontWeight: "600" },

    // Section
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 16,
        marginBottom: 8,
    },
    sectionTitle: { fontSize: 16, fontWeight: "600" },
    sectionCount: { fontSize: 13 },

    // Persona Grid
    personaGrid: { gap: 10, paddingVertical: 4 },
    personaCard: {
        width: 80,
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    personaIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
    },
    personaLabel: { fontSize: 12, fontWeight: "500" },

    // New Conversation Button
    newConversationBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    newConversationBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },

    // Conversation Row
    conversationRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    conversationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    conversationContent: { flex: 1, marginRight: 8 },
    conversationTitle: { fontSize: 15, fontWeight: "600" },
    conversationPreview: { fontSize: 13, marginTop: 2 },
    conversationTime: { fontSize: 12 },

    // Empty State
    emptyState: {
        alignItems: "center",
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 16 },
    emptySubtitle: { fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 },
});
