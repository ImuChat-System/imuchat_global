import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/providers/ThemeProvider";
import { useI18n } from "@/providers/I18nProvider";
import {
    fetchTask,
    updateTask,
    deleteTask,
    fetchTaskComments,
    addTaskComment,
    deleteTaskComment,
    changeTaskStatus,
    type Task,
    type TaskComment,
    type TaskPriority,
    type TaskStatus,
    type ChecklistItem,
    TASK_PRIORITY_COLORS,
    TASK_STATUS_LABELS,
    TASK_STATUS_ORDER,
} from "@/services/tasks-api";
import { useUserStore } from "@/stores/user-store";
import { createLogger } from "@/services/logger";

const logger = createLogger("TaskDetail");

export default function TaskDetailScreen() {
    const { taskId } = useLocalSearchParams<{ taskId: string }>();
    const { theme } = useTheme();
    const { t } = useI18n();
    const router = useRouter();
    const colors = theme.colors;
    const profile = useUserStore((s) => s.profile);

    const [task, setTask] = useState<Task | null>(null);
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Editable fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Comments
    const [newComment, setNewComment] = useState("");
    const [postingComment, setPostingComment] = useState(false);

    const loadData = useCallback(async () => {
        if (!taskId) return;

        try {
            const [taskData, commentsData] = await Promise.all([
                fetchTask(taskId),
                fetchTaskComments(taskId),
            ]);

            setTask(taskData);
            setComments(commentsData);

            // Initialize editable fields
            if (taskData) {
                setTitle(taskData.title);
                setDescription(taskData.description || "");
                setChecklist(taskData.checklist || []);
                setPriority(taskData.priority || "medium");
                setDueDate(taskData.dueDate ? new Date(taskData.dueDate) : null);
            }
        } catch (error) {
            logger.error("Failed to load task:", error);
            Alert.alert(t("common.error"), t("tasks.loadTaskError"));
        } finally {
            setLoading(false);
        }
    }, [taskId, t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSave = async () => {
        if (!task || !title.trim()) return;

        setSaving(true);
        try {
            await updateTask(task.id, {
                title: title.trim(),
                description: description.trim() || undefined,
                checklist,
                priority,
                dueDate: dueDate?.toISOString(),
            });

            const updated = await fetchTask(task.id);
            setTask(updated);
            setIsEditing(false);
        } catch (error) {
            logger.error("Failed to save task:", error);
            Alert.alert(t("common.error"), t("tasks.saveError"));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(t("tasks.deleteTask"), t("tasks.deleteTaskConfirm"), [
            { text: t("common.cancel"), style: "cancel" },
            {
                text: t("common.delete"),
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteTask(task!.id);
                        router.back();
                    } catch (error) {
                        logger.error("Failed to delete task:", error);
                        Alert.alert(t("common.error"), t("tasks.deleteError"));
                    }
                },
            },
        ]);
    };

    const handleStatusChange = async (newStatus: TaskStatus) => {
        if (!task) return;

        try {
            await changeTaskStatus(task.id, newStatus);
            const updated = await fetchTask(task.id);
            setTask(updated);
        } catch (error) {
            logger.error("Failed to change status:", error);
            Alert.alert(t("common.error"), t("tasks.statusChangeError"));
        }
    };

    const toggleChecklistItem = (itemId: string) => {
        setChecklist((prev) =>
            prev.map((item) =>
                item.id === itemId ? { ...item, done: !item.done } : item
            )
        );
    };

    const handlePostComment = async () => {
        if (!newComment.trim() || !task) return;

        setPostingComment(true);
        try {
            await addTaskComment(task.id, newComment.trim());
            const updated = await fetchTaskComments(task.id);
            setComments(updated);
            setNewComment("");
        } catch (error) {
            logger.error("Failed to post comment:", error);
            Alert.alert(t("common.error"), t("tasks.commentError"));
        } finally {
            setPostingComment(false);
        }
    };

    const handleDeleteComment = (commentId: string) => {
        Alert.alert(
            t("tasks.deleteComment"),
            t("tasks.deleteCommentConfirm"),
            [
                { text: t("common.cancel"), style: "cancel" },
                {
                    text: t("common.delete"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteTaskComment(commentId);
                            setComments((prev) =>
                                prev.filter((c) => c.id !== commentId)
                            );
                        } catch (error) {
                            logger.error("Failed to delete comment:", error);
                        }
                    },
                },
            ]
        );
    };

    const renderStatusChips = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statusRow}
        >
            {TASK_STATUS_ORDER.filter((s) => s !== "archived").map((status) => (
                <TouchableOpacity
                    key={status}
                    style={[
                        styles.statusChip,
                        {
                            backgroundColor:
                                task?.status === status
                                    ? colors.primary + "20"
                                    : colors.surface,
                            borderColor:
                                task?.status === status
                                    ? colors.primary
                                    : colors.border,
                        },
                    ]}
                    onPress={() => handleStatusChange(status)}
                >
                    <Text
                        style={[
                            styles.statusText,
                            {
                                color:
                                    task?.status === status
                                        ? colors.primary
                                        : colors.text,
                            },
                        ]}
                    >
                        {TASK_STATUS_LABELS[status]}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderComment = ({ item }: { item: TaskComment }) => (
        <View style={[styles.commentCard, { backgroundColor: colors.surface }]}>
            <View style={styles.commentHeader}>
                <View
                    style={[
                        styles.commentAvatar,
                        { backgroundColor: colors.primary + "20" },
                    ]}
                >
                    <Text style={[styles.avatarText, { color: colors.primary }]}>
                        {item.author?.username?.charAt(0).toUpperCase() || "?"}
                    </Text>
                </View>
                <View style={styles.commentMeta}>
                    <Text style={[styles.commentAuthor, { color: colors.text }]}>
                        {item.author?.displayName || item.author?.username || "Unknown"}
                    </Text>
                    <Text
                        style={[styles.commentDate, { color: colors.textMuted }]}
                    >
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
                {item.authorId === profile?.id && (
                    <TouchableOpacity
                        onPress={() => handleDeleteComment(item.id)}
                        style={styles.deleteCommentButton}
                    >
                        <Ionicons
                            name="trash-outline"
                            size={16}
                            color={colors.error || "#ef4444"}
                        />
                    </TouchableOpacity>
                )}
            </View>
            <Text style={[styles.commentContent, { color: colors.text }]}>
                {item.content}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View
                style={[styles.loadingContainer, { backgroundColor: colors.background }]}
            >
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!task) {
        return (
            <View
                style={[styles.errorContainer, { backgroundColor: colors.background }]}
            >
                <Text style={{ color: colors.text }}>{t("tasks.taskNotFound")}</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Stack.Screen
                    options={{
                        title: isEditing ? t("tasks.editTask") : t("tasks.taskDetails"),
                        headerRight: () => (
                            <View style={styles.headerRight}>
                                {isEditing ? (
                                    <>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setIsEditing(false);
                                                // Reset fields
                                                setTitle(task.title);
                                                setDescription(task.description || "");
                                                setChecklist(task.checklist);
                                                setPriority(task.priority);
                                                setDueDate(
                                                    task.dueDate
                                                        ? new Date(task.dueDate)
                                                        : null
                                                );
                                            }}
                                            style={styles.headerButton}
                                        >
                                            <Text
                                                style={[
                                                    styles.cancelText,
                                                    { color: colors.textMuted },
                                                ]}
                                            >
                                                {t("common.cancel")}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleSave}
                                            disabled={saving}
                                            style={styles.headerButton}
                                        >
                                            {saving ? (
                                                <ActivityIndicator
                                                    size="small"
                                                    color={colors.primary}
                                                />
                                            ) : (
                                                <Text
                                                    style={[
                                                        styles.saveText,
                                                        { color: colors.primary },
                                                    ]}
                                                >
                                                    {t("common.save")}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            onPress={() => setIsEditing(true)}
                                            style={styles.headerButton}
                                        >
                                            <Ionicons
                                                name="pencil"
                                                size={20}
                                                color={colors.primary}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleDelete}
                                            style={styles.headerButton}
                                        >
                                            <Ionicons
                                                name="trash-outline"
                                                size={20}
                                                color={colors.error || "#ef4444"}
                                            />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        ),
                    }}
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Status */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                            {t("tasks.status")}
                        </Text>
                        {renderStatusChips()}
                    </View>

                    {/* Title */}
                    <View style={styles.section}>
                        {isEditing ? (
                            <TextInput
                                style={[
                                    styles.titleInput,
                                    {
                                        backgroundColor: colors.surface,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={title}
                                onChangeText={setTitle}
                                placeholder={t("tasks.taskTitle")}
                                placeholderTextColor={colors.textMuted}
                            />
                        ) : (
                            <Text style={[styles.taskTitle, { color: colors.text }]}>
                                {task.title}
                            </Text>
                        )}
                    </View>

                    {/* Priority */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                            {t("tasks.priority")}
                        </Text>
                        <View style={styles.priorityRow}>
                            {(
                                ["low", "medium", "high", "urgent"] as TaskPriority[]
                            ).map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    style={[
                                        styles.priorityChip,
                                        {
                                            backgroundColor:
                                                (isEditing ? priority : task.priority) === p
                                                    ? TASK_PRIORITY_COLORS[p] + "20"
                                                    : colors.surface,
                                            borderColor:
                                                (isEditing ? priority : task.priority) === p
                                                    ? TASK_PRIORITY_COLORS[p]
                                                    : colors.border,
                                        },
                                    ]}
                                    onPress={() => {
                                        if (isEditing) setPriority(p);
                                    }}
                                    disabled={!isEditing}
                                >
                                    <View
                                        style={[
                                            styles.priorityDot,
                                            { backgroundColor: TASK_PRIORITY_COLORS[p] },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.priorityText,
                                            {
                                                color:
                                                    (isEditing ? priority : task.priority) === p
                                                        ? TASK_PRIORITY_COLORS[p]
                                                        : colors.text,
                                            },
                                        ]}
                                    >
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Due date */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                            {t("tasks.dueDate")}
                        </Text>
                        {isEditing ? (
                            <>
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
                                                color: dueDate
                                                    ? colors.text
                                                    : colors.textMuted,
                                            },
                                        ]}
                                    >
                                        {dueDate
                                            ? dueDate.toLocaleDateString()
                                            : t("tasks.selectDate")}
                                    </Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <View style={styles.datePickerSimple}>
                                        <Text style={[styles.datePickerLabel, { color: colors.text }]}>
                                            {t("tasks.selectDate")}
                                        </Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            {[
                                                { label: t("tasks.today"), days: 0 },
                                                { label: t("tasks.tomorrow"), days: 1 },
                                                { label: `+3 ${t("tasks.days")}`, days: 3 },
                                                { label: `+7 ${t("tasks.days")}`, days: 7 },
                                                { label: `+14 ${t("tasks.days")}`, days: 14 },
                                                { label: `+30 ${t("tasks.days")}`, days: 30 },
                                            ].map((option) => {
                                                const optionDate = new Date();
                                                optionDate.setDate(optionDate.getDate() + option.days);
                                                const isSelected = dueDate?.toDateString() === optionDate.toDateString();
                                                return (
                                                    <TouchableOpacity
                                                        key={option.days}
                                                        style={[
                                                            styles.dateOption,
                                                            {
                                                                backgroundColor: isSelected ? colors.primary : colors.surface,
                                                                borderColor: isSelected ? colors.primary : colors.border,
                                                            },
                                                        ]}
                                                        onPress={() => {
                                                            setDueDate(optionDate);
                                                            setShowDatePicker(false);
                                                        }}
                                                    >
                                                        <Text style={{ color: isSelected ? "#fff" : colors.text }}>
                                                            {option.label}
                                                        </Text>
                                                        <Text style={{ color: isSelected ? "#fff" : colors.textMuted, fontSize: 10 }}>
                                                            {optionDate.toLocaleDateString()}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setDueDate(null);
                                                setShowDatePicker(false);
                                            }}
                                            style={{ marginTop: 8, alignSelf: "center" }}
                                        >
                                            <Text style={{ color: colors.textMuted }}>{t("tasks.clearDate")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        ) : (
                            <Text style={[styles.dateDisplay, { color: colors.text }]}>
                                {task.dueDate
                                    ? new Date(task.dueDate).toLocaleDateString()
                                    : t("tasks.noDueDate")}
                            </Text>
                        )}
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                            {t("tasks.description")}
                        </Text>
                        {isEditing ? (
                            <TextInput
                                style={[
                                    styles.descriptionInput,
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
                        ) : (
                            <Text style={[styles.descriptionText, { color: colors.text }]}>
                                {task.description || t("tasks.noDescription")}
                            </Text>
                        )}
                    </View>

                    {/* Checklist */}
                    {(checklist.length > 0 || isEditing) && (
                        <View style={styles.section}>
                            <Text
                                style={[styles.sectionLabel, { color: colors.textMuted }]}
                            >
                                {t("tasks.checklist")} ({checklist.filter((c) => c.done).length}/
                                {checklist.length})
                            </Text>
                            <View style={styles.checklistContainer}>
                                {checklist.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.checklistItem,
                                            { backgroundColor: colors.surface },
                                        ]}
                                        onPress={() => {
                                            if (isEditing) {
                                                toggleChecklistItem(item.id);
                                            }
                                        }}
                                        activeOpacity={isEditing ? 0.7 : 1}
                                    >
                                        <Ionicons
                                            name={
                                                item.done
                                                    ? "checkbox"
                                                    : "checkbox-outline"
                                            }
                                            size={20}
                                            color={
                                                item.done
                                                    ? colors.primary
                                                    : colors.textMuted
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.checklistLabel,
                                                {
                                                    color: colors.text,
                                                    textDecorationLine: item.done
                                                        ? "line-through"
                                                        : "none",
                                                    opacity: item.done ? 0.6 : 1,
                                                },
                                            ]}
                                        >
                                            {item.text}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Tags */}
                    {task.tags.length > 0 && (
                        <View style={styles.section}>
                            <Text
                                style={[styles.sectionLabel, { color: colors.textMuted }]}
                            >
                                {t("tasks.tags")}
                            </Text>
                            <View style={styles.tagsContainer}>
                                {task.tags.map((tag) => (
                                    <View
                                        key={tag}
                                        style={[
                                            styles.tagChip,
                                            { backgroundColor: colors.primary + "20" },
                                        ]}
                                    >
                                        <Text
                                            style={[styles.tagText, { color: colors.primary }]}
                                        >
                                            {tag}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Comments */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                            {t("tasks.comments")} ({comments.length})
                        </Text>

                        {/* Add comment */}
                        <View style={styles.addCommentRow}>
                            <TextInput
                                style={[
                                    styles.commentInput,
                                    {
                                        backgroundColor: colors.surface,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={newComment}
                                onChangeText={setNewComment}
                                placeholder={t("tasks.addComment")}
                                placeholderTextColor={colors.textMuted}
                                multiline
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    { backgroundColor: colors.primary },
                                ]}
                                onPress={handlePostComment}
                                disabled={!newComment.trim() || postingComment}
                            >
                                {postingComment ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Ionicons name="send" size={18} color="#fff" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Comments list */}
                        {comments.length > 0 && (
                            <FlatList
                                data={comments}
                                renderItem={renderComment}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                                style={styles.commentsList}
                            />
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },

    // Header
    headerRight: {
        flexDirection: "row",
        gap: 16,
    },
    headerButton: {
        padding: 4,
    },
    cancelText: {
        fontSize: 16,
    },
    saveText: {
        fontSize: 16,
        fontWeight: "600",
    },

    // Sections
    section: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: "500",
        marginBottom: 8,
        textTransform: "uppercase",
    },

    // Status
    statusRow: {
        flexDirection: "row",
    },
    statusChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    statusText: {
        fontSize: 13,
        fontWeight: "500",
    },

    // Title
    taskTitle: {
        fontSize: 22,
        fontWeight: "bold",
    },
    titleInput: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 18,
        fontWeight: "600",
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
        fontSize: 13,
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
    dateDisplay: {
        fontSize: 16,
    },

    // Description
    descriptionInput: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        minHeight: 100,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 22,
    },

    // Checklist
    checklistContainer: {
        gap: 8,
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
        fontSize: 15,
    },

    // Tags
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tagChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tagText: {
        fontSize: 13,
        fontWeight: "500",
    },

    // Comments
    addCommentRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 12,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 80,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    commentsList: {
        marginTop: 4,
    },
    commentCard: {
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
    },
    commentHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 14,
        fontWeight: "600",
    },
    commentMeta: {
        flex: 1,
        marginLeft: 10,
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: "500",
    },
    commentDate: {
        fontSize: 12,
        marginTop: 1,
    },
    deleteCommentButton: {
        padding: 4,
    },
    commentContent: {
        fontSize: 14,
        lineHeight: 20,
    },
    datePickerSimple: {
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
    },
    datePickerLabel: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 8,
    },
    dateOption: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        marginRight: 8,
        alignItems: "center",
    },
});
