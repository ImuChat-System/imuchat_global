import { useI18n } from "@/providers/I18nProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
import { createLogger } from "@/services/logger";
import {
  changeTaskStatus,
  deleteProject,
  fetchKanbanTasks,
  fetchProject,
  type KanbanColumn,
  type Project,
  type Task,
  TASK_PRIORITY_COLORS,
  TASK_STATUS_LABELS,
  TASK_STATUS_ORDER,
  type TaskStatus,
} from "@/services/tasks-api";
import { Ionicons } from "@expo/vector-icons";
import { Href, Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const logger = createLogger("ProjectDetail");

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_WIDTH = SCREEN_WIDTH * 0.75;

export default function ProjectDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { showToast } = useToast();
  const colors = theme.colors;

  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  const loadData = useCallback(async () => {
    if (!projectId) return;

    try {
      const [projectData, kanbanData] = await Promise.all([
        fetchProject(projectId),
        fetchKanbanTasks(projectId),
      ]);

      setProject(projectData);
      setColumns(kanbanData);
    } catch (error) {
      logger.error("Failed to load project:", error);
      showToast(t("tasks.loadError"), "error");
    } finally {
      setLoading(false);
    }
  }, [projectId, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleTaskPress = (taskId: string) => {
    router.push(`/tasks/task/${taskId}` as Href);
  };

  const handleCreateTask = () => {
    router.push({
      pathname: "/tasks/task/create" as Href,
      params: { projectId },
    } as Href);
  };

  const handleMoveTask = async (
    taskId: string,
    currentStatus: TaskStatus,
    direction: "left" | "right",
  ) => {
    const currentIndex = TASK_STATUS_ORDER.indexOf(currentStatus);
    const newIndex =
      direction === "left"
        ? Math.max(0, currentIndex - 1)
        : Math.min(TASK_STATUS_ORDER.length - 2, currentIndex + 1); // -2 to exclude archived

    if (currentIndex === newIndex) return;

    const newStatus = TASK_STATUS_ORDER[newIndex];

    try {
      await changeTaskStatus(taskId, newStatus);
      // Refresh data
      const kanbanData = await fetchKanbanTasks(projectId!);
      setColumns(kanbanData);
    } catch (error) {
      logger.error("Failed to move task:", error);
      showToast(t("tasks.moveTaskError"), "error");
    }
  };

  const handleDeleteProject = () => {
    Alert.alert(t("tasks.deleteProject"), t("tasks.deleteProjectConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProject(projectId!);
            router.back();
          } catch (error) {
            logger.error("Failed to delete project:", error);
            showToast(t("tasks.deleteError"), "error");
          }
        },
      },
    ]);
  };

  const renderTaskCard = (task: Task, showMoveButtons: boolean = true) => (
    <TouchableOpacity
      key={task.id}
      style={[styles.taskCard, { backgroundColor: colors.surface }]}
      onPress={() => handleTaskPress(task.id)}
      activeOpacity={0.7}
    >
      <View style={styles.taskHeader}>
        <View
          style={[
            styles.priorityIndicator,
            { backgroundColor: TASK_PRIORITY_COLORS[task.priority] },
          ]}
        />
        <Text
          style={[styles.taskTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
      </View>

      {task.description && (
        <Text
          style={[styles.taskDescription, { color: colors.textMuted }]}
          numberOfLines={2}
        >
          {task.description}
        </Text>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {task.tags.slice(0, 3).map((tag) => (
            <View
              key={tag}
              style={[styles.tag, { backgroundColor: colors.border }]}
            >
              <Text style={[styles.tagText, { color: colors.textMuted }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.taskFooter}>
        {task.dueDate && (
          <View style={styles.dueDateBadge}>
            <Ionicons
              name="calendar-outline"
              size={12}
              color={colors.textMuted}
            />
            <Text style={[styles.dueText, { color: colors.textMuted }]}>
              {new Date(task.dueDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        {task.checklist.length > 0 && (
          <View style={styles.checklistBadge}>
            <Ionicons
              name="checkbox-outline"
              size={12}
              color={colors.textMuted}
            />
            <Text style={[styles.checklistText, { color: colors.textMuted }]}>
              {task.checklist.filter((c) => c.done).length}/
              {task.checklist.length}
            </Text>
          </View>
        )}

        {showMoveButtons && viewMode === "kanban" && (
          <View style={styles.moveButtons}>
            {task.status !== "backlog" && (
              <TouchableOpacity
                style={[styles.moveButton, { borderColor: colors.border }]}
                onPress={() => handleMoveTask(task.id, task.status, "left")}
              >
                <Ionicons
                  name="chevron-back"
                  size={16}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
            {task.status !== "done" && (
              <TouchableOpacity
                style={[styles.moveButton, { borderColor: colors.border }]}
                onPress={() => handleMoveTask(task.id, task.status, "right")}
              >
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderKanbanColumn = ({ item }: { item: KanbanColumn }) => (
    <View style={[styles.kanbanColumn, { backgroundColor: colors.background }]}>
      <View style={styles.columnHeader}>
        <Text style={[styles.columnTitle, { color: colors.text }]}>
          {TASK_STATUS_LABELS[item.status] || item.status}
        </Text>
        <View style={[styles.columnCount, { backgroundColor: colors.surface }]}>
          <Text style={[styles.columnCountText, { color: colors.textMuted }]}>
            {item.tasks.length}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.columnContent}
        showsVerticalScrollIndicator={false}
      >
        {item.tasks.map((task) => renderTaskCard(task))}

        {item.tasks.length === 0 && (
          <View style={styles.emptyColumn}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t("tasks.noTasksInColumn")}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderListView = () => {
    const allTasks = columns.flatMap((col) => col.tasks);

    return (
      <FlatList
        data={allTasks}
        renderItem={({ item }) => renderTaskCard(item, false)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Ionicons
              name="clipboard-outline"
              size={48}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t("tasks.noTasks")}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {t("tasks.noTasksHint")}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!project) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Text style={{ color: colors.text }}>{t("tasks.projectNotFound")}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: project.name,
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() =>
                  setViewMode(viewMode === "kanban" ? "list" : "kanban")
                }
                style={styles.headerButton}
              >
                <Ionicons
                  name={viewMode === "kanban" ? "list" : "grid"}
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteProject}
                style={styles.headerButton}
              >
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color={colors.error || "#ef4444"}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* Project header */}
      <View style={[styles.projectHeader, { backgroundColor: colors.surface }]}>
        <View
          style={[
            styles.projectIcon,
            { backgroundColor: project.color + "20" },
          ]}
        >
          <Text style={styles.projectEmoji}>{project.icon}</Text>
        </View>
        <View style={styles.projectInfo}>
          <Text style={[styles.projectName, { color: colors.text }]}>
            {project.name}
          </Text>
          <View style={styles.progressRow}>
            <View
              style={[styles.progressBar, { backgroundColor: colors.border }]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: project.color,
                    width: `${project.progressPercent}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textMuted }]}>
              {project.progressPercent}%
            </Text>
          </View>
        </View>
      </View>

      {/* Kanban or List view */}
      {viewMode === "kanban" ? (
        <FlatList
          data={columns}
          renderItem={renderKanbanColumn}
          keyExtractor={(item) => item.status}
          horizontal
          pagingEnabled={false}
          snapToInterval={COLUMN_WIDTH + 16}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kanbanContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      ) : (
        renderListView()
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: project.color }]}
        onPress={handleCreateTask}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
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

  // Header
  headerRight: {
    flexDirection: "row",
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },

  // Project header
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  projectIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  projectEmoji: {
    fontSize: 24,
  },
  projectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "600",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Kanban
  kanbanContainer: {
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  kanbanColumn: {
    width: COLUMN_WIDTH,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  columnHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
  },
  columnTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  columnCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  columnCountText: {
    fontSize: 12,
    fontWeight: "500",
  },
  columnContent: {
    flex: 1,
    paddingHorizontal: 8,
    paddingBottom: 100,
  },
  emptyColumn: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
  },

  // Task card
  taskCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  priorityIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
    marginTop: 2,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  taskDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    marginLeft: 12,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
    marginLeft: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
  },
  taskFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginLeft: 12,
    gap: 12,
  },
  dueDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dueText: {
    fontSize: 11,
  },
  checklistBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  checklistText: {
    fontSize: 11,
  },
  moveButtons: {
    flexDirection: "row",
    marginLeft: "auto",
    gap: 4,
  },
  moveButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // List view
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyList: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
