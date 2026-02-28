import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/providers/ThemeProvider";
import { useI18n } from "@/providers/I18nProvider";
import {
    createTask,
    fetchProjects,
    type Project,
    type TaskPriority,
    type TaskStatus,
    type ChecklistItem,
    TASK_PRIORITY_COLORS,
} from "@/services/tasks-api";
import { createLogger } from "@/services/logger";

const logger = createLogger("TaskCreate");

const PRIORITIES: { value: TaskPriority; label: string }[] = [
    { value: "low", label: "Basse" },
    { value: "medium", label: "Moyenne" },
    { value: "high", label: "Haute" },
    { value: "urgent", label: "Urgente" },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: "backlog", label: "Backlog" },
    { value: "todo", label: "À faire" },
    { value: "in_progress", label: "En cours" },
];

export default function TaskCreateScreen() {
    const { projectId } = useLocalSearchParams<{ projectId?: string }>();
    const { theme } = useTheme();
    const { t } = useI18n();
    const router = useRouter();
    const colors = theme.colors;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [status, setStatus] = useState<TaskStatus>("todo");
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [newChecklistItem, setNewChecklistItem] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [projectsLoading, setProjectsLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const page = await fetchProjects();
            const data = page.projects;
            setProjects(data.filter((p) => !p.isArchived));
            if (!projectId && data.length > 0) {
                setSelectedProjectId(data[0].id);
            }
        } catch (error) {
            logger.error("Failed to load projects:", error);
        } finally {
            setProjectsLoading(false);
        }
    };

    const handleAddChecklistItem = () => {
        if (!newChecklistItem.trim()) return;
        setChecklist([
            ...checklist,
            {
                id: Date.now().toString(),
                text: newChecklistItem.trim(),
                done: false,
            },
        ]);
        setNewChecklistItem("");
    };

    const handleRemoveChecklistItem = (id: string) => {
        setChecklist(checklist.filter((item) => item.id !== id));
    };

    const handleAddTag = () => {
        if (!newTag.trim() || tags.includes(newTag.trim())) return;
        setTags([...tags, newTag.trim()]);
        setNewTag("");
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert(t("common.error"), t("tasks.titleRequired"));
            return;
        }
        if (!selectedProjectId) {
            Alert.alert(t("common.error"), t("tasks.projectRequired"));
            return;
        }

        setLoading(true);

        try {
            await createTask({
                projectId: selectedProjectId,
                title: title.trim(),
                description: description.trim() || undefined,
                status,
                priority,
                dueDate: dueDate?.toISOString(),
                tags,
                checklist,
            });

            router.back();
        } catch (error) {
            logger.error("Failed to create task:", error);
            Alert.alert(t("common.error"), t("tasks.createTaskError"));
        } finally {
            setLoading(false);
        }
    };

    const selectedProject = projects.find((p) => p.id === selectedProjectId);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Stack.Screen
                    options={{
                        title: t("tasks.newTask"),
                        headerRight: () => (
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={loading || !title.trim()}
                                style={styles.saveButton}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    <Text
                                        style={[
                                            styles.saveText,
                                            {
                                                color: title.trim()
                                                    ? colors.primary
                                                    : colors.textMuted,
                                            },
                                        ]}
                                    >
                                        {t("common.save")}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ),
                    }}
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Title */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            {t("tasks.taskTitle")} *
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
                            value={title}
                            onChangeText={setTitle}
                            placeholder={t("tasks.taskTitlePlaceholder")}
                            placeholderTextColor={colors.textMuted}
                            maxLength={200}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            {t("tasks.description")}
                        </Text>
                        <TextInput
                            style={[
                                styles.textArea,
                                {
                                    backgroundColor: colors.surface,
                                    color: colors.text,
                                    borderColor: colors.border,
                                },
                            ]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder={t("tasks.descriptionPlaceholder")}
                            placeholderTextColor={colors.textMuted}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Project selector */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            {t("tasks.project")} *
                        </Text>
                        {projectsLoading ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.projectsRow}
                            >
                                {projects.map((project) => (
                                    <TouchableOpacity
                                        key={project.id}
                                        style={[
                                            styles.projectChip,
                                            {
                                                backgroundColor:
                                                    selectedProjectId === project.id
                                                        ? project.color + "30"
                                                        : colors.surface,
                                                borderColor:
                                                    selectedProjectId === project.id
                                                        ? project.color
                                                        : colors.border,
                                            },
                                        ]}
                                        onPress={() => setSelectedProjectId(project.id)}
                                    >
                                        <Text style={styles.projectEmoji}>{project.icon}</Text>
                                        <Text
                                            style={[
                                                styles.projectChipText,
                                                {
                                                    color:
                                                        selectedProjectId === project.id
                                                            ? project.color
                                                            : colors.text,
                                                },
                                            ]}
                                        >
                                            {project.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    {/* Priority */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            {t("tasks.priority")}
                        </Text>
                        <View style={styles.priorityRow}>
                            {PRIORITIES.map((p) => (
                                <TouchableOpacity
                                    key={p.value}
                                    style={[
                                        styles.priorityChip,
                                        {
                                            backgroundColor:
                                                priority === p.value
                                                    ? TASK_PRIORITY_COLORS[p.value] + "20"
                                                    : colors.surface,
                                            borderColor:
                                                priority === p.value
                                                    ? TASK_PRIORITY_COLORS[p.value]
                                                    : colors.border,
                                        },
                                    ]}
                                    onPress={() => setPriority(p.value)}
                                >
                                    <View
                                        style={[
                                            styles.priorityDot,
                                            { backgroundColor: TASK_PRIORITY_COLORS[p.value] },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.priorityText,
                                            {
                                                color:
                                                    priority === p.value
                                                        ? TASK_PRIORITY_COLORS[p.value]
                                                        : colors.text,
                                            },
                                        ]}
                                    >
                                        {p.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Status */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            {t("tasks.status")}
                        </Text>
                        <View style={styles.statusRow}>
                            {STATUS_OPTIONS.map((s) => (
                                <TouchableOpacity
                                    key={s.value}
                                    style={[
                                        styles.statusChip,
                                        {
                                            backgroundColor:
                                                status === s.value
                                                    ? colors.primary + "20"
                                                    : colors.surface,
                                            borderColor:
                                                status === s.value
                                                    ? colors.primary
                                                    : colors.border,
                                        },
                                    ]}
                                    onPress={() => setStatus(s.value)}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            {
                                                color:
                                                    status === s.value
                                                        ? colors.primary
                                                        : colors.text,
                                            },
                                        ]}
                                    >
                                        {s.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Due date */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            {t("tasks.dueDate")}
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.dateButton,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                },
                            ]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={20}
                                color={colors.textMuted}
                            />
                            <Text
                                style={[
                                    styles.dateText,
                                    {
                                        color: dueDate ? colors.text : colors.textMuted,
                                    },
                                ]}
                            >
                                {dueDate
                                    ? dueDate.toLocaleDateString()
                                    : t("tasks.selectDate")}
                            </Text>
                            {dueDate && (
                                <TouchableOpacity
                                    onPress={() => setDueDate(null)}
                                    style={styles.clearDate}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={20}
                                        color={colors.textMuted}
                                    />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>

                        {/* Date picker - simple implementation */}
                        {showDatePicker && (
                            <View style={[styles.datePickerSimple, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Text style={[styles.datePickerLabel, { color: colors.textMuted }]}>
                                    {t("tasks.selectDate")}
                                </Text>
                                {[0, 1, 3, 7, 14, 30].map((days) => {
                                    const date = new Date();
                                    date.setDate(date.getDate() + days);
                                    return (
                                        <TouchableOpacity
                                            key={days}
                                            style={[styles.dateOption, { borderColor: colors.border }]}
                                            onPress={() => {
                                                setDueDate(date);
                                                setShowDatePicker(false);
                                            }}
                                        >
                                            <Text style={{ color: colors.text }}>
                                                {days === 0 ? t("common.today") : days === 1 ? t("common.tomorrow") : `${t("common.inDays", { count: days })}`}
                                            </Text>
                                            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                                                {date.toLocaleDateString()}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                                <TouchableOpacity
                                    style={[styles.dateOption, { borderColor: colors.border }]}
                                    onPress={() => setShowDatePicker(false)}
                                >
                                    <Text style={{ color: colors.textMuted }}>{t("common.cancel")}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Tags */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            {t("tasks.tags")}
                        </Text>
                        <View style={styles.tagInputRow}>
                            <TextInput
                                style={[
                                    styles.tagInput,
                                    {
                                        backgroundColor: colors.surface,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={newTag}
                                onChangeText={setNewTag}
                                placeholder={t("tasks.addTag")}
                                placeholderTextColor={colors.textMuted}
                                onSubmitEditing={handleAddTag}
                                returnKeyType="done"
                            />
                            <TouchableOpacity
                                style={[
                                    styles.addTagButton,
                                    { backgroundColor: colors.primary },
                                ]}
                                onPress={handleAddTag}
                            >
                                <Ionicons name="add" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        {tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                                {tags.map((tag) => (
                                    <TouchableOpacity
                                        key={tag}
                                        style={[
                                            styles.tagChip,
                                            { backgroundColor: colors.primary + "20" },
                                        ]}
                                        onPress={() => handleRemoveTag(tag)}
                                    >
                                        <Text style={[styles.tagText, { color: colors.primary }]}>
                                            {tag}
                                        </Text>
                                        <Ionicons
                                            name="close"
                                            size={14}
                                            color={colors.primary}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Checklist */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            {t("tasks.checklist")}
                        </Text>
                        <View style={styles.checklistInputRow}>
                            <TextInput
                                style={[
                                    styles.checklistInput,
                                    {
                                        backgroundColor: colors.surface,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={newChecklistItem}
                                onChangeText={setNewChecklistItem}
                                placeholder={t("tasks.addChecklistItem")}
                                placeholderTextColor={colors.textMuted}
                                onSubmitEditing={handleAddChecklistItem}
                                returnKeyType="done"
                            />
                            <TouchableOpacity
                                style={[
                                    styles.addChecklistButton,
                                    { backgroundColor: colors.primary },
                                ]}
                                onPress={handleAddChecklistItem}
                            >
                                <Ionicons name="add" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        {checklist.length > 0 && (
                            <View style={styles.checklistContainer}>
                                {checklist.map((item) => (
                                    <View
                                        key={item.id}
                                        style={[
                                            styles.checklistItem,
                                            { backgroundColor: colors.surface },
                                        ]}
                                    >
                                        <Ionicons
                                            name="checkbox-outline"
                                            size={18}
                                            color={colors.textMuted}
                                        />
                                        <Text
                                            style={[
                                                styles.checklistLabel,
                                                { color: colors.text },
                                            ]}
                                        >
                                            {item.text}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => handleRemoveChecklistItem(item.id)}
                                        >
                                            <Ionicons
                                                name="trash-outline"
                                                size={16}
                                                color={colors.error || "#ef4444"}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    saveButton: {
        paddingHorizontal: 8,
    },
    saveText: {
        fontSize: 16,
        fontWeight: "600",
    },

    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        minHeight: 100,
    },

    // Projects
    projectsRow: {
        flexDirection: "row",
    },
    projectChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
        gap: 6,
    },
    projectEmoji: {
        fontSize: 16,
    },
    projectChipText: {
        fontSize: 14,
        fontWeight: "500",
    },

    // Priority
    priorityRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    priorityChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    priorityText: {
        fontSize: 14,
        fontWeight: "500",
    },

    // Status
    statusRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    statusChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 14,
        fontWeight: "500",
    },

    // Date
    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
    },
    dateText: {
        flex: 1,
        fontSize: 16,
    },
    clearDate: {
        padding: 2,
    },

    // Tags
    tagInputRow: {
        flexDirection: "row",
        gap: 8,
    },
    tagInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 16,
    },
    addTagButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 10,
    },
    tagChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 10,
        paddingRight: 6,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    tagText: {
        fontSize: 13,
        fontWeight: "500",
    },

    // Checklist
    checklistInputRow: {
        flexDirection: "row",
        gap: 8,
    },
    checklistInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 16,
    },
    addChecklistButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    checklistContainer: {
        marginTop: 10,
        gap: 6,
    },
    checklistItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 10,
    },
    checklistLabel: {
        flex: 1,
        fontSize: 14,
    },

    // Simple date picker
    datePickerSimple: {
        marginTop: 10,
        borderWidth: 1,
        borderRadius: 10,
        overflow: "hidden",
    },
    datePickerLabel: {
        padding: 12,
        fontSize: 13,
        fontWeight: "500",
    },
    dateOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
});
