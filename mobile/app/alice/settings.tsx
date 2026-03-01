/**
 * AliceSettingsScreen — Configuration du fournisseur LLM
 *
 * Permet à l'utilisateur de :
 *  - Choisir un fournisseur LLM (OpenAI, Anthropic, Google, Mistral, Groq, Custom)
 *  - Saisir sa clé API personnelle
 *  - Configurer un endpoint personnalisé (Ollama, LM Studio, vLLM, etc.)
 *  - Sélectionner un modèle
 *  - Tester la connexion
 *  - Gérer les préférences Alice (historique, streaming)
 *
 * Phase 3 — DEV-024 Module IA
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useAlice } from "@/hooks/useAlice";
import {
    PROVIDER_DISPLAY_NAMES,
    PROVIDER_DESCRIPTIONS,
    PROVIDER_ICONS,
    type AliceProvider,
} from "@/services/alice";
import { useAliceStore } from "@/stores/alice-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Provider Definitions (UI) ────────────────────────────────
interface ProviderOption {
    id: AliceProvider;
    name: string;
    description: string;
    icon: string;
    color: string;
    requiresApiKey: boolean;
    supportsCustomUrl: boolean;
    models: string[];
}

const PROVIDERS: ProviderOption[] = [
    {
        id: "openai" as AliceProvider,
        name: "OpenAI",
        description: "GPT-4o, GPT-4, GPT-3.5",
        icon: "flash",
        color: "#10A37F",
        requiresApiKey: true,
        supportsCustomUrl: false,
        models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
    },
    {
        id: "anthropic" as AliceProvider,
        name: "Anthropic",
        description: "Claude 4, Claude 3.5 Sonnet/Haiku",
        icon: "bulb",
        color: "#D97757",
        requiresApiKey: true,
        supportsCustomUrl: false,
        models: [
            "claude-sonnet-4-20250514",
            "claude-3-5-sonnet-20241022",
            "claude-3-5-haiku-20241022",
            "claude-3-haiku-20240307",
        ],
    },
    {
        id: "google" as AliceProvider,
        name: "Google Gemini",
        description: "Gemini 2.0 Flash, Gemini Pro",
        icon: "diamond",
        color: "#4285F4",
        requiresApiKey: true,
        supportsCustomUrl: false,
        models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    },
    {
        id: "mistral" as AliceProvider,
        name: "Mistral AI",
        description: "Mistral Large, Small, Codestral",
        icon: "wind",
        color: "#FF7000",
        requiresApiKey: true,
        supportsCustomUrl: false,
        models: [
            "mistral-large-latest",
            "mistral-small-latest",
            "codestral-latest",
            "open-mistral-nemo",
        ],
    },
    {
        id: "groq" as AliceProvider,
        name: "Groq",
        description: "LLaMA 3, Mixtral — Ultra rapide",
        icon: "rocket",
        color: "#F55036",
        requiresApiKey: true,
        supportsCustomUrl: false,
        models: [
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768",
        ],
    },
    {
        id: "custom" as AliceProvider,
        name: "Fournisseur personnalisé",
        description: "Ollama, LM Studio, vLLM, ou tout endpoint compatible OpenAI",
        icon: "server",
        color: "#6366F1",
        requiresApiKey: false,
        supportsCustomUrl: true,
        models: ["default"],
    },
];

// ─── Component ────────────────────────────────────────────────
export default function AliceSettingsScreen() {
    const colors = useColors();
    const spacing = useSpacing();
    const { t } = useI18n();

    const { providerSettings, updateProvider, testProviderConnection, isLoading, error } =
        useAlice();
    const { streamResponses, saveHistory, setStreamResponses, setSaveHistory, clearAllConversations } =
        useAliceStore();

    const [apiKeyInput, setApiKeyInput] = useState(providerSettings.apiKey);
    const [baseUrlInput, setBaseUrlInput] = useState(providerSettings.baseUrl);
    const [showApiKey, setShowApiKey] = useState(false);
    const [validationResult, setValidationResult] = useState<
        "success" | "error" | null
    >(null);

    const currentProvider = useMemo(
        () =>
            PROVIDERS.find((p) => p.id === providerSettings.provider) ||
            PROVIDERS[0],
        [providerSettings.provider],
    );

    // ─── Handlers ────────────────────────────────────────────

    const handleSelectProvider = useCallback(
        (provider: ProviderOption) => {
            updateProvider({ provider: provider.id });
            setApiKeyInput("");
            setBaseUrlInput(
                provider.id === ("custom" as AliceProvider)
                    ? "http://localhost:11434/v1"
                    : "",
            );
            setValidationResult(null);
        },
        [updateProvider],
    );

    const handleSelectModel = useCallback(
        (model: string) => {
            updateProvider({ model });
        },
        [updateProvider],
    );

    const handleSaveApiKey = useCallback(() => {
        updateProvider({ apiKey: apiKeyInput });
        setValidationResult(null);
    }, [apiKeyInput, updateProvider]);

    const handleSaveBaseUrl = useCallback(() => {
        updateProvider({ baseUrl: baseUrlInput });
        setValidationResult(null);
    }, [baseUrlInput, updateProvider]);

    const handleTestConnection = useCallback(async () => {
        // Save current inputs first
        updateProvider({ apiKey: apiKeyInput, baseUrl: baseUrlInput });
        setValidationResult(null);

        const success = await testProviderConnection();
        setValidationResult(success ? "success" : "error");
    }, [apiKeyInput, baseUrlInput, updateProvider, testProviderConnection]);

    const handleClearHistory = useCallback(() => {
        Alert.alert(
            t("alice.clearHistoryTitle") || "Effacer l'historique",
            t("alice.clearHistoryConfirm") ||
                "Voulez-vous supprimer toutes les conversations avec Alice ?",
            [
                { text: t("common.cancel") || "Annuler", style: "cancel" },
                {
                    text: t("common.delete") || "Supprimer",
                    style: "destructive",
                    onPress: clearAllConversations,
                },
            ],
        );
    }, [clearAllConversations, t]);

    // ─── Provider Card ───────────────────────────────────────
    const renderProviderCard = useCallback(
        (provider: ProviderOption) => {
            const isSelected = providerSettings.provider === provider.id;
            return (
                <TouchableOpacity
                    key={provider.id}
                    style={[
                        styles.providerCard,
                        {
                            backgroundColor: isSelected
                                ? provider.color + "15"
                                : colors.surface,
                            borderColor: isSelected
                                ? provider.color
                                : colors.border,
                        },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleSelectProvider(provider)}
                >
                    <View
                        style={[
                            styles.providerIcon,
                            { backgroundColor: provider.color + "20" },
                        ]}
                    >
                        <Ionicons
                            name={provider.icon as keyof typeof Ionicons.glyphMap}
                            size={20}
                            color={provider.color}
                        />
                    </View>
                    <View style={styles.providerInfo}>
                        <Text
                            style={[
                                styles.providerName,
                                { color: colors.text },
                            ]}
                        >
                            {provider.name}
                        </Text>
                        <Text
                            style={[
                                styles.providerDesc,
                                { color: colors.textMuted },
                            ]}
                            numberOfLines={1}
                        >
                            {provider.description}
                        </Text>
                    </View>
                    {isSelected && (
                        <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color={provider.color}
                        />
                    )}
                </TouchableOpacity>
            );
        },
        [providerSettings.provider, colors, handleSelectProvider],
    );

    // ─── Model Pill ──────────────────────────────────────────
    const renderModelPill = useCallback(
        (model: string) => {
            const isSelected = providerSettings.model === model;
            return (
                <TouchableOpacity
                    key={model}
                    style={[
                        styles.modelPill,
                        {
                            backgroundColor: isSelected
                                ? currentProvider.color + "20"
                                : colors.surface,
                            borderColor: isSelected
                                ? currentProvider.color
                                : colors.border,
                        },
                    ]}
                    onPress={() => handleSelectModel(model)}
                >
                    <Text
                        style={[
                            styles.modelPillText,
                            {
                                color: isSelected
                                    ? currentProvider.color
                                    : colors.text,
                                fontWeight: isSelected ? "600" : "400",
                            },
                        ]}
                    >
                        {model}
                    </Text>
                </TouchableOpacity>
            );
        },
        [providerSettings.model, currentProvider, colors, handleSelectModel],
    );

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={{ paddingBottom: 48 }}
        >
            {/* ═══ Provider Selection ═══ */}
            <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t("alice.selectProvider") || "Fournisseur LLM"}
                </Text>
                <Text
                    style={[
                        styles.sectionSubtitle,
                        { color: colors.textMuted },
                    ]}
                >
                    {t("alice.selectProviderDesc") ||
                        "Choisissez votre fournisseur d'IA ou connectez votre propre serveur."}
                </Text>
                {PROVIDERS.map(renderProviderCard)}
            </View>

            {/* ═══ API Key ═══ */}
            {currentProvider.requiresApiKey && (
                <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t("alice.apiKey") || "Clé API"}
                    </Text>
                    <Text
                        style={[
                            styles.sectionSubtitle,
                            { color: colors.textMuted },
                        ]}
                    >
                        {t("alice.apiKeyDesc") ||
                            "Votre clé reste stockée localement sur votre appareil."}
                    </Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={[
                                styles.textInput,
                                {
                                    backgroundColor: colors.surface,
                                    color: colors.text,
                                    borderColor: colors.border,
                                },
                            ]}
                            value={apiKeyInput}
                            onChangeText={setApiKeyInput}
                            placeholder="sk-..."
                            placeholderTextColor={colors.textMuted}
                            secureTextEntry={!showApiKey}
                            autoCorrect={false}
                            autoCapitalize="none"
                            onBlur={handleSaveApiKey}
                        />
                        <TouchableOpacity
                            style={styles.eyeBtn}
                            onPress={() => setShowApiKey((v) => !v)}
                        >
                            <Ionicons
                                name={showApiKey ? "eye-off" : "eye"}
                                size={20}
                                color={colors.textMuted}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* ═══ Custom Base URL ═══ */}
            {(currentProvider.supportsCustomUrl ||
                currentProvider.id === ("custom" as AliceProvider)) && (
                <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t("alice.customUrl") || "Endpoint personnalisé"}
                    </Text>
                    <Text
                        style={[
                            styles.sectionSubtitle,
                            { color: colors.textMuted },
                        ]}
                    >
                        {t("alice.customUrlDesc") ||
                            "URL du serveur compatible OpenAI (Ollama, LM Studio, vLLM…)"}
                    </Text>
                    <TextInput
                        style={[
                            styles.textInput,
                            {
                                backgroundColor: colors.surface,
                                color: colors.text,
                                borderColor: colors.border,
                            },
                        ]}
                        value={baseUrlInput}
                        onChangeText={setBaseUrlInput}
                        placeholder="http://localhost:11434/v1"
                        placeholderTextColor={colors.textMuted}
                        autoCorrect={false}
                        autoCapitalize="none"
                        keyboardType="url"
                        onBlur={handleSaveBaseUrl}
                    />
                    {/* Common local endpoints helper */}
                    <View style={styles.helperRow}>
                        {[
                            { label: "Ollama", url: "http://localhost:11434/v1" },
                            { label: "LM Studio", url: "http://localhost:1234/v1" },
                            { label: "vLLM", url: "http://localhost:8000/v1" },
                        ].map((preset) => (
                            <TouchableOpacity
                                key={preset.label}
                                style={[
                                    styles.helperChip,
                                    { backgroundColor: colors.surface, borderColor: colors.border },
                                ]}
                                onPress={() => {
                                    setBaseUrlInput(preset.url);
                                    updateProvider({ baseUrl: preset.url });
                                }}
                            >
                                <Text
                                    style={[
                                        styles.helperChipText,
                                        { color: colors.textMuted },
                                    ]}
                                >
                                    {preset.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* ═══ Model Selection ═══ */}
            <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t("alice.model") || "Modèle"}
                </Text>
                <View style={styles.modelGrid}>
                    {currentProvider.models.map(renderModelPill)}
                </View>
                {/* Custom model input for custom provider */}
                {currentProvider.id === ("custom" as AliceProvider) && (
                    <TextInput
                        style={[
                            styles.textInput,
                            {
                                backgroundColor: colors.surface,
                                color: colors.text,
                                borderColor: colors.border,
                                marginTop: 8,
                            },
                        ]}
                        value={providerSettings.model}
                        onChangeText={(m) => updateProvider({ model: m })}
                        placeholder="llama3.1, codellama, mistral…"
                        placeholderTextColor={colors.textMuted}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                )}
            </View>

            {/* ═══ Test Connection ═══ */}
            <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
                <TouchableOpacity
                    style={[
                        styles.testBtn,
                        {
                            backgroundColor: currentProvider.color,
                            opacity: isLoading ? 0.6 : 1,
                        },
                    ]}
                    onPress={handleTestConnection}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="wifi" size={18} color="#fff" />
                    )}
                    <Text style={styles.testBtnText}>
                        {t("alice.testConnection") || "Tester la connexion"}
                    </Text>
                </TouchableOpacity>

                {validationResult === "success" && (
                    <View style={[styles.resultBanner, { backgroundColor: "#10B981" + "20" }]}>
                        <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                        <Text style={[styles.resultText, { color: "#10B981" }]}>
                            {t("alice.connectionSuccess") || "Connexion réussie !"}
                        </Text>
                    </View>
                )}
                {validationResult === "error" && (
                    <View style={[styles.resultBanner, { backgroundColor: "#EF4444" + "20" }]}>
                        <Ionicons name="close-circle" size={18} color="#EF4444" />
                        <Text style={[styles.resultText, { color: "#EF4444" }]}>
                            {error || t("alice.connectionError") || "Connexion échouée"}
                        </Text>
                    </View>
                )}
            </View>

            {/* ═══ Preferences ═══ */}
            <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t("alice.preferences") || "Préférences"}
                </Text>

                <View
                    style={[
                        styles.prefRow,
                        { borderBottomColor: colors.border },
                    ]}
                >
                    <View style={styles.prefInfo}>
                        <Text style={[styles.prefLabel, { color: colors.text }]}>
                            {t("alice.saveHistory") || "Sauvegarder l'historique"}
                        </Text>
                        <Text
                            style={[
                                styles.prefDesc,
                                { color: colors.textMuted },
                            ]}
                        >
                            {t("alice.saveHistoryDesc") ||
                                "Les conversations sont stockées localement."}
                        </Text>
                    </View>
                    <Switch
                        value={saveHistory}
                        onValueChange={setSaveHistory}
                        trackColor={{ true: currentProvider.color }}
                    />
                </View>

                <TouchableOpacity
                    style={[
                        styles.dangerBtn,
                        { borderColor: "#EF4444" + "40" },
                    ]}
                    onPress={handleClearHistory}
                >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    <Text style={styles.dangerBtnText}>
                        {t("alice.clearHistory") || "Effacer toutes les conversations"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ═══ Info Footer ═══ */}
            <View style={[styles.footer, { paddingHorizontal: spacing.md }]}>
                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                    {t("alice.securityNote") ||
                        "🔒 Vos clés API sont stockées uniquement sur votre appareil et ne sont jamais sauvegardées sur nos serveurs."}
                </Text>
                <Text
                    style={[
                        styles.footerText,
                        { color: colors.textMuted, marginTop: 8 },
                    ]}
                >
                    {t("alice.customProviderNote") ||
                        "💡 Vous pouvez connecter n'importe quel serveur compatible avec l'API OpenAI (Ollama, LM Studio, vLLM, text-generation-webui, etc.)"}
                </Text>
            </View>
        </ScrollView>
    );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },

    // Section
    section: { marginTop: 24 },
    sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
    sectionSubtitle: { fontSize: 13, marginBottom: 12, lineHeight: 18 },

    // Provider Card
    providerCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        marginBottom: 8,
    },
    providerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    providerInfo: { flex: 1 },
    providerName: { fontSize: 15, fontWeight: "600" },
    providerDesc: { fontSize: 12, marginTop: 2 },

    // Input
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    textInput: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 14,
        fontSize: 14,
    },
    eyeBtn: { marginLeft: 8, padding: 8 },

    // Helper chips (Ollama, LM Studio, etc.)
    helperRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
    },
    helperChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
    },
    helperChipText: { fontSize: 12 },

    // Model Grid
    modelGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    modelPill: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
    },
    modelPillText: { fontSize: 13 },

    // Test Connection
    testBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    testBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },

    resultBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
    },
    resultText: { fontSize: 13, fontWeight: "500" },

    // Preferences
    prefRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    prefInfo: { flex: 1, marginRight: 12 },
    prefLabel: { fontSize: 15, fontWeight: "500" },
    prefDesc: { fontSize: 12, marginTop: 2 },

    // Danger
    dangerBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        marginTop: 16,
    },
    dangerBtnText: { color: "#EF4444", fontSize: 14, fontWeight: "500" },

    // Footer
    footer: { marginTop: 32, marginBottom: 16 },
    footerText: { fontSize: 12, lineHeight: 18 },
});
