import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRouter, Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/providers/ThemeProvider";
import { useI18n } from "@/providers/I18nProvider";
import {
    createProject,
    DEFAULT_PROJECT_COLORS,
    DEFAULT_PROJECT_ICONS,
} from "@/services/tasks-api";
import { createLogger } from "@/services/logger";

const logger = createLogger("CreateProject");

export default function CreateProjectScreen() {
    const { theme } = useTheme();
    const { t } = useI18n();
    const router = useRouter();
    const colors = theme.colors;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedColor, setSelectedColor] = useState(DEFAULT_PROJECT_COLORS[0]);
    const [selectedIcon, setSelectedIcon] = useState(DEFAULT_PROJECT_ICONS[0]);
    const [loading, setLoading] = useState(false);

    const isValid = name.trim().length >= 2;

    const handleCreate = async () => {
        if (!isValid) return;

        setLoading(true);
        try {
            const project = await createProject({
                name: name.trim(),
                description: description.trim() || undefined,
                color: selectedColor,
                icon: selectedIcon,
            });

            logger.info("Project created:", project.id);

            // Navigate to the new project
            router.replace(`/tasks/project/${project.id}` as Href);
        } catch (error) {
            logger.error("Failed to create project:", error);
            Alert.alert(t("common.error"), t("tasks.createProjectError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* Preview */}
                <View style={[styles.preview, { backgroundColor: colors.surface }]}>
                    <View
                        style={[
                            styles.previewIcon,
                            { backgroundColor: selectedColor + "20" },
                        ]}
                    >
                        <Text style={styles.previewEmoji}>{selectedIcon}</Text>
                    </View>
                    <Text
                        style={[
                            styles.previewName,
                            {
                                color: name.trim() ? colors.text : colors.textMuted,
                            },
                        ]}
                    >
                        {name.trim() || t("tasks.projectNamePlaceholder")}
                    </Text>
                </View>

                {/* Name */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.text }]}>
                        {t("tasks.projectName")} *
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.surface,
                                color: colors.text,
                                borderColor: colors.border,
                            },
                        ]}
                        placeholder={t("tasks.projectNamePlaceholder")}
                        placeholderTextColor={colors.textMuted}
                        value={name}
                        onChangeText={setName}
                        maxLength={100}
                        autoFocus
                    />
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.text }]}>
                        {t("tasks.description")}
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            styles.textArea,
                            {
                                backgroundColor: colors.surface,
                                color: colors.text,
                                borderColor: colors.border,
                            },
                        ]}
                        placeholder={t("tasks.descriptionPlaceholder")}
                        placeholderTextColor={colors.textMuted}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                    />
                </View>

                {/* Icon picker */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.text }]}>
                        {t("tasks.icon")}
                    </Text>
                    <View style={styles.iconGrid}>
                        {DEFAULT_PROJECT_ICONS.map((icon) => (
                            <TouchableOpacity
                                key={icon}
                                style={[
                                    styles.iconOption,
                                    {
                                        backgroundColor:
                                            selectedIcon === icon
                                                ? selectedColor + "20"
                                                : colors.surface,
                                        borderColor:
                                            selectedIcon === icon
                                                ? selectedColor
                                                : colors.border,
                                    },
                                ]}
                                onPress={() => setSelectedIcon(icon)}
                            >
                                <Text style={styles.iconEmoji}>{icon}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Color picker */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.text }]}>
                        {t("tasks.color")}
                    </Text>
                    <View style={styles.colorGrid}>
                        {DEFAULT_PROJECT_COLORS.map((color) => (
                            <TouchableOpacity
                                key={color}
                                style={[
                                    styles.colorOption,
                                    { backgroundColor: color },
                                ]}
                                onPress={() => setSelectedColor(color)}
                            >
                                {selectedColor === color && (
                                    <Ionicons name="checkmark" size={20} color="#fff" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Create button */}
                <TouchableOpacity
                    style={[
                        styles.createButton,
                        {
                            backgroundColor: isValid ? colors.primary : colors.border,
                        },
                    ]}
                    onPress={handleCreate}
                    disabled={!isValid || loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark" size={20} color="#fff" />
                            <Text style={styles.createButtonText}>
                                {t("tasks.createProject")}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },

    // Preview
    preview: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    previewIcon: {
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    previewEmoji: {
        fontSize: 28,
    },
    previewName: {
        fontSize: 20,
        fontWeight: "600",
        marginLeft: 16,
        flex: 1,
    },

    // Sections
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: "top",
    },

    // Icon grid
    iconGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
    },
    iconEmoji: {
        fontSize: 22,
    },

    // Color grid
    colorGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    colorOption: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },

    // Create button
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 16,
        gap: 8,
    },
    createButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
