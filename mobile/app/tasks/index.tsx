import { useI18n } from "@/providers/I18nProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
import { createLogger } from "@/services/logger";
import {
  fetchProjectsSummary,
  fetchTasksCountByStatus,
  fetchUpcomingTasks,
  TASK_PRIORITY_COLORS,
  type TaskPriority,
  type TaskStatus,
} from "@/services/tasks-api";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const logger = createLogger("TasksIndex");

interface ProjectSummary {
  id: string;
  name: string;
  color: string;
  icon: string;
  tasksCount: number;
  completedTasksCount: number;
  progressPercent: number;
  updatedAt: string;
}

interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  projectName: string | null;
  projectColor: string | null;
  priority: TaskPriority;
}

export default function TasksIndexScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { showToast } = useToast();
  const colors = theme.colors;

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [taskCounts, setTaskCounts] = useState<Record<
    TaskStatus,
    number
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [projectsData, tasksData, countsData] = await Promise.all([
        fetchProjectsSummary(),
        fetchUpcomingTasks(7),
        fetchTasksCountByStatus(),
      ]);
      setProjects(projectsData);
      setUpcomingTasks(tasksData);
      setTaskCounts(countsData);
    } catch (error) {
      logger.error("Failed to load tasks data:", error);
      showToast(t("tasks.loadError"), "error");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleProjectPress = (projectId: string) => {
    router.push(`/tasks/project/${projectId}` as Href);
  };

  const handleCreateProject = () => {
    router.push("/tasks/project/create" as Href);
  };

  const handleCreateTask = () => {
    router.push("/tasks/task/create" as Href);
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return t("tasks.overdue");
    if (days === 0) return t("tasks.dueToday");
    if (days === 1) return t("tasks.dueTomorrow");
    if (days <= 7) return t("tasks.dueInDays", { count: days });
    return date.toLocaleDateString();
  };

  const renderProjectCard = ({ item }: { item: ProjectSummary }) => (
    <TouchableOpacity
      style={[styles.projectCard, { backgroundColor: colors.surface }]}
      onPress={() => handleProjectPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.projectHeader}>
        <View
          style={[styles.projectIcon, { backgroundColor: item.color + "20" }]}
        >
          <Text style={styles.projectEmoji}>{item.icon}</Text>
        </View>
        <View style={styles.projectInfo}>
          <Text
            style={[styles.projectName, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={[styles.projectStats, { color: colors.textMuted }]}>
            {item.completedTasksCount}/{item.tasksCount}{" "}
            {t("tasks.tasksCompleted")}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: item.color,
              width: `${item.progressPercent}%`,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );

  const renderUpcomingTask = ({ item }: { item: UpcomingTask }) => (
    <TouchableOpacity
      style={[styles.upcomingTask, { backgroundColor: colors.surface }]}
      onPress={() => router.push(`/tasks/task/${item.id}` as Href)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.priorityDot,
          { backgroundColor: TASK_PRIORITY_COLORS[item.priority] },
        ]}
      />
      <View style={styles.taskInfo}>
        <Text
          style={[styles.taskTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <View style={styles.taskMeta}>
          {item.projectName && (
            <View style={styles.taskProject}>
              <View
                style={[
                  styles.projectDot,
                  { backgroundColor: item.projectColor || colors.primary },
                ]}
              />
              <Text
                style={[styles.projectLabel, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {item.projectName}
              </Text>
            </View>
          )}
          <Text style={[styles.dueDate, { color: colors.textMuted }]}>
            {formatDueDate(item.dueDate)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStatsCard = () => {
    if (!taskCounts) return null;

    const stats = [
      {
        label: t("tasks.status.todo"),
        count: taskCounts.todo,
        color: "#3b82f6",
      },
      {
        label: t("tasks.status.inProgress"),
        count: taskCounts.in_progress,
        color: "#f97316",
      },
      {
        label: t("tasks.status.review"),
        count: taskCounts.review,
        color: "#8b5cf6",
      },
      {
        label: t("tasks.status.done"),
        count: taskCounts.done,
        color: "#22c55e",
      },
    ];

    return (
      <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("tasks.myTasks")}
        </Text>
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={[styles.statCount, { color: stat.color }]}>
                {stat.count}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Stats */}
      {renderStatsCard()}

      {/* Upcoming tasks */}
      {upcomingTasks.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("tasks.upcoming")}
          </Text>
          {upcomingTasks.slice(0, 5).map((task) => (
            <View key={task.id}>{renderUpcomingTask({ item: task })}</View>
          ))}
        </View>
      )}

      {/* Projects header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("tasks.projects")}
        </Text>
        <TouchableOpacity
          onPress={handleCreateProject}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-open-outline" size={64} color={colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {t("tasks.noProjects")}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
        {t("tasks.noProjectsHint")}
      </Text>
      <TouchableOpacity
        onPress={handleCreateProject}
        style={[styles.createButton, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.createButtonText}>{t("tasks.createProject")}</Text>
      </TouchableOpacity>
    </View>
  );

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={projects}
        renderItem={renderProjectCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />

      {/* FAB pour créer une tâche rapide */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  // Stats card
  statsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statCount: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },

  // Project card
  projectCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  projectIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  projectEmoji: {
    fontSize: 22,
  },
  projectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600",
  },
  projectStats: {
    fontSize: 13,
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },

  // Upcoming task
  upcomingTask: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 12,
  },
  taskProject: {
    flexDirection: "row",
    alignItems: "center",
  },
  projectDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  projectLabel: {
    fontSize: 12,
  },
  dueDate: {
    fontSize: 12,
  },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    paddingTop: 40,
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
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
