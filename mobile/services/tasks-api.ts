/**
 * Tasks & Projects Service (Productivity Hub)
 *
 * DEV-018: Module Productivity Hub (/tasks)
 * - CRUD projets et tâches
 * - Vue Kanban avec drag & drop
 * - Sous-tâches et checklists
 * - Rappels et notifications
 * - Intégration avec groupes/conversations
 *
 * Réf: MOBILE_TODO_TRACKER.md - Groupe 6, Fonc. 1
 */

import { createLogger } from "./logger";
import { supabase } from "./supabase";

const logger = createLogger("Tasks");

// ============================================================================
// TYPES
// ============================================================================

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus =
    | "backlog"
    | "todo"
    | "in_progress"
    | "review"
    | "done"
    | "archived";

export interface ChecklistItem {
    id: string;
    text: string;
    done: boolean;
}

export interface TaskAuthor {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
}

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
    reminderAt: string | null;
    completedAt: string | null;
    projectId: string | null;
    creatorId: string;
    assigneeId: string | null;
    parentTaskId: string | null;
    tags: string[];
    position: number;
    estimatedMinutes: number | null;
    actualMinutes: number | null;
    checklist: ChecklistItem[];
    attachments: string[];
    createdAt: string;
    updatedAt: string;
    // Relations jointes
    creator?: TaskAuthor;
    assignee?: TaskAuthor | null;
    project?: ProjectSummary | null;
    subtasksCount?: number;
    completedSubtasksCount?: number;
}

export interface Project {
    id: string;
    name: string;
    description: string | null;
    color: string;
    icon: string;
    ownerId: string;
    conversationId: string | null;
    memberIds: string[];
    isArchived: boolean;
    tasksCount: number;
    completedTasksCount: number;
    createdAt: string;
    updatedAt: string;
    // Calculé
    progressPercent: number;
    // Relations jointes
    owner?: TaskAuthor;
    members?: TaskAuthor[];
}

export interface ProjectSummary {
    id: string;
    name: string;
    color: string;
    icon: string;
}

export interface TaskComment {
    id: string;
    taskId: string;
    authorId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author?: TaskAuthor;
}

export interface TaskActivityLog {
    id: string;
    taskId: string;
    userId: string;
    action: string;
    oldValue: Record<string, unknown> | null;
    newValue: Record<string, unknown> | null;
    createdAt: string;
    user?: TaskAuthor;
}

// Paramètres de création/mise à jour
export interface CreateProjectParams {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    conversationId?: string;
    memberIds?: string[];
}

export interface UpdateProjectParams {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    memberIds?: string[];
    isArchived?: boolean;
}

export interface CreateTaskParams {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
    reminderAt?: string;
    projectId?: string;
    assigneeId?: string;
    parentTaskId?: string;
    tags?: string[];
    estimatedMinutes?: number;
    checklist?: ChecklistItem[];
}

export interface UpdateTaskParams {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
    reminderAt?: string | null;
    assigneeId?: string | null;
    tags?: string[];
    position?: number;
    estimatedMinutes?: number | null;
    actualMinutes?: number | null;
    checklist?: ChecklistItem[];
    attachments?: string[];
}

// Kanban
export interface KanbanColumn {
    status: TaskStatus;
    tasks: Task[];
}

// Pagination
export interface TasksPage {
    tasks: Task[];
    nextCursor: string | null;
    hasMore: boolean;
}

export interface ProjectsPage {
    projects: Project[];
    nextCursor: string | null;
    hasMore: boolean;
}

const PAGE_SIZE = 20;

// ============================================================================
// CONSTANTES
// ============================================================================

export const TASK_STATUS_ORDER: TaskStatus[] = [
    "backlog",
    "todo",
    "in_progress",
    "review",
    "done",
    "archived",
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
    backlog: "Backlog",
    todo: "À faire",
    in_progress: "En cours",
    review: "En revue",
    done: "Terminé",
    archived: "Archivé",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
    low: "Basse",
    medium: "Moyenne",
    high: "Haute",
    urgent: "Urgente",
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
    low: "#94a3b8", // slate-400
    medium: "#3b82f6", // blue-500
    high: "#f97316", // orange-500
    urgent: "#ef4444", // red-500
};

export const DEFAULT_PROJECT_COLORS = [
    "#6366f1", // indigo-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#f43f5e", // rose-500
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#eab308", // yellow-500
    "#22c55e", // green-500
    "#14b8a6", // teal-500
    "#06b6d4", // cyan-500
    "#3b82f6", // blue-500
    "#64748b", // slate-500
];

export const DEFAULT_PROJECT_ICONS = [
    "📁",
    "🚀",
    "💼",
    "🎯",
    "📊",
    "🔧",
    "💡",
    "🎨",
    "📝",
    "🏠",
    "🎮",
    "📚",
];

// ============================================================================
// HELPERS
// ============================================================================

function mapTaskFromDb(row: Record<string, unknown>): Task {
    return {
        id: row.id as string,
        title: row.title as string,
        description: row.description as string | null,
        status: row.status as TaskStatus,
        priority: row.priority as TaskPriority,
        dueDate: row.due_date as string | null,
        reminderAt: row.reminder_at as string | null,
        completedAt: row.completed_at as string | null,
        projectId: row.project_id as string | null,
        creatorId: row.creator_id as string,
        assigneeId: row.assignee_id as string | null,
        parentTaskId: row.parent_task_id as string | null,
        tags: (row.tags as string[]) || [],
        position: row.position as number,
        estimatedMinutes: row.estimated_minutes as number | null,
        actualMinutes: row.actual_minutes as number | null,
        checklist: (row.checklist as ChecklistItem[]) || [],
        attachments: (row.attachments as string[]) || [],
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
        // Relations optionnelles
        creator: row.creator ? mapAuthorFromDb(row.creator as Record<string, unknown>) : undefined,
        assignee: row.assignee
            ? mapAuthorFromDb(row.assignee as Record<string, unknown>)
            : undefined,
        project: row.project
            ? mapProjectSummaryFromDb(row.project as Record<string, unknown>)
            : undefined,
    };
}

function mapProjectFromDb(row: Record<string, unknown>): Project {
    const tasksCount = (row.tasks_count as number) || 0;
    const completedTasksCount = (row.completed_tasks_count as number) || 0;

    return {
        id: row.id as string,
        name: row.name as string,
        description: row.description as string | null,
        color: (row.color as string) || "#6366f1",
        icon: (row.icon as string) || "📁",
        ownerId: row.owner_id as string,
        conversationId: row.conversation_id as string | null,
        memberIds: (row.member_ids as string[]) || [],
        isArchived: (row.is_archived as boolean) || false,
        tasksCount,
        completedTasksCount,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
        progressPercent:
            tasksCount > 0
                ? Math.round((completedTasksCount / tasksCount) * 100)
                : 0,
        // Relations optionnelles
        owner: row.owner ? mapAuthorFromDb(row.owner as Record<string, unknown>) : undefined,
    };
}

function mapProjectSummaryFromDb(row: Record<string, unknown>): ProjectSummary {
    return {
        id: row.id as string,
        name: row.name as string,
        color: (row.color as string) || "#6366f1",
        icon: (row.icon as string) || "📁",
    };
}

function mapAuthorFromDb(row: Record<string, unknown>): TaskAuthor {
    return {
        id: row.id as string,
        username: row.username as string | null,
        displayName: (row.display_name as string | null) || (row.username as string | null),
        avatarUrl: row.avatar_url as string | null,
    };
}

function mapCommentFromDb(row: Record<string, unknown>): TaskComment {
    return {
        id: row.id as string,
        taskId: row.task_id as string,
        authorId: row.author_id as string,
        content: row.content as string,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
        author: row.author ? mapAuthorFromDb(row.author as Record<string, unknown>) : undefined,
    };
}

function mapActivityFromDb(row: Record<string, unknown>): TaskActivityLog {
    return {
        id: row.id as string,
        taskId: row.task_id as string,
        userId: row.user_id as string,
        action: row.action as string,
        oldValue: row.old_value as Record<string, unknown> | null,
        newValue: row.new_value as Record<string, unknown> | null,
        createdAt: row.created_at as string,
        user: row.user ? mapAuthorFromDb(row.user as Record<string, unknown>) : undefined,
    };
}

// ============================================================================
// PROJECTS CRUD
// ============================================================================

/**
 * Récupère les projets de l'utilisateur
 */
export async function fetchProjects(options?: {
    includeArchived?: boolean;
    cursor?: string;
}): Promise<ProjectsPage> {
    try {
        const { includeArchived = false, cursor } = options || {};

        let query = supabase
            .from("projects")
            .select(
                `
                *,
                owner:profiles!owner_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                )
            `
            )
            .order("updated_at", { ascending: false })
            .limit(PAGE_SIZE + 1);

        if (!includeArchived) {
            query = query.eq("is_archived", false);
        }

        if (cursor) {
            query = query.lt("updated_at", cursor);
        }

        const { data, error } = await query;

        if (error) {
            logger.error("fetchProjects error:", error);
            throw error;
        }

        const projects = (data || []).slice(0, PAGE_SIZE).map(mapProjectFromDb);
        const hasMore = (data || []).length > PAGE_SIZE;
        const nextCursor = hasMore
            ? projects[projects.length - 1]?.updatedAt
            : null;

        return { projects, nextCursor, hasMore };
    } catch (error) {
        logger.error("fetchProjects failed:", error);
        throw error;
    }
}

/**
 * Récupère un projet par son ID
 */
export async function fetchProject(projectId: string): Promise<Project | null> {
    try {
        const { data, error } = await supabase
            .from("projects")
            .select(
                `
                *,
                owner:profiles!owner_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                )
            `
            )
            .eq("id", projectId)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null; // Not found
            logger.error("fetchProject error:", error);
            throw error;
        }

        return mapProjectFromDb(data);
    } catch (error) {
        logger.error("fetchProject failed:", error);
        throw error;
    }
}

/**
 * Crée un nouveau projet
 */
export async function createProject(
    params: CreateProjectParams
): Promise<Project> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from("projects")
            .insert({
                name: params.name,
                description: params.description || null,
                color: params.color || DEFAULT_PROJECT_COLORS[0],
                icon: params.icon || DEFAULT_PROJECT_ICONS[0],
                owner_id: user.id,
                conversation_id: params.conversationId || null,
                member_ids: params.memberIds || [],
            })
            .select(
                `
                *,
                owner:profiles!owner_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                )
            `
            )
            .single();

        if (error) {
            logger.error("createProject error:", error);
            throw error;
        }

        logger.info("Project created:", data.id);
        return mapProjectFromDb(data);
    } catch (error) {
        logger.error("createProject failed:", error);
        throw error;
    }
}

/**
 * Met à jour un projet
 */
export async function updateProject(
    projectId: string,
    params: UpdateProjectParams
): Promise<Project> {
    try {
        const updateData: Record<string, unknown> = {};

        if (params.name !== undefined) updateData.name = params.name;
        if (params.description !== undefined)
            updateData.description = params.description;
        if (params.color !== undefined) updateData.color = params.color;
        if (params.icon !== undefined) updateData.icon = params.icon;
        if (params.memberIds !== undefined)
            updateData.member_ids = params.memberIds;
        if (params.isArchived !== undefined)
            updateData.is_archived = params.isArchived;

        const { data, error } = await supabase
            .from("projects")
            .update(updateData)
            .eq("id", projectId)
            .select(
                `
                *,
                owner:profiles!owner_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                )
            `
            )
            .single();

        if (error) {
            logger.error("updateProject error:", error);
            throw error;
        }

        logger.info("Project updated:", projectId);
        return mapProjectFromDb(data);
    } catch (error) {
        logger.error("updateProject failed:", error);
        throw error;
    }
}

/**
 * Supprime un projet (et toutes ses tâches)
 */
export async function deleteProject(projectId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from("projects")
            .delete()
            .eq("id", projectId);

        if (error) {
            logger.error("deleteProject error:", error);
            throw error;
        }

        logger.info("Project deleted:", projectId);
    } catch (error) {
        logger.error("deleteProject failed:", error);
        throw error;
    }
}

/**
 * Archive/désarchive un projet
 */
export async function toggleProjectArchive(
    projectId: string,
    archive: boolean
): Promise<Project> {
    return updateProject(projectId, { isArchived: archive });
}

/**
 * Ajoute un membre au projet
 */
export async function addProjectMember(
    projectId: string,
    userId: string
): Promise<Project> {
    try {
        // Récupérer le projet actuel
        const project = await fetchProject(projectId);
        if (!project) throw new Error("Project not found");

        // Ajouter le membre s'il n'est pas déjà présent
        const newMembers = project.memberIds.includes(userId)
            ? project.memberIds
            : [...project.memberIds, userId];

        return updateProject(projectId, { memberIds: newMembers });
    } catch (error) {
        logger.error("addProjectMember failed:", error);
        throw error;
    }
}

/**
 * Retire un membre du projet
 */
export async function removeProjectMember(
    projectId: string,
    userId: string
): Promise<Project> {
    try {
        const project = await fetchProject(projectId);
        if (!project) throw new Error("Project not found");

        const newMembers = project.memberIds.filter((id) => id !== userId);

        return updateProject(projectId, { memberIds: newMembers });
    } catch (error) {
        logger.error("removeProjectMember failed:", error);
        throw error;
    }
}

// ============================================================================
// TASKS CRUD
// ============================================================================

/**
 * Récupère les tâches d'un projet
 */
export async function fetchTasks(options?: {
    projectId?: string;
    status?: TaskStatus | TaskStatus[];
    assigneeId?: string;
    creatorId?: string;
    includeSubtasks?: boolean;
    cursor?: string;
}): Promise<TasksPage> {
    try {
        const {
            projectId,
            status,
            assigneeId,
            creatorId,
            includeSubtasks = false,
            cursor,
        } = options || {};

        let query = supabase
            .from("tasks")
            .select(
                `
                *,
                creator:profiles!creator_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                ),
                assignee:profiles!assignee_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                ),
                project:projects!project_id (
                    id,
                    name,
                    color,
                    icon
                )
            `
            )
            .order("position", { ascending: true })
            .order("created_at", { ascending: false })
            .limit(PAGE_SIZE + 1);

        if (projectId) {
            query = query.eq("project_id", projectId);
        }

        if (status) {
            if (Array.isArray(status)) {
                query = query.in("status", status);
            } else {
                query = query.eq("status", status);
            }
        }

        if (assigneeId) {
            query = query.eq("assignee_id", assigneeId);
        }

        if (creatorId) {
            query = query.eq("creator_id", creatorId);
        }

        if (!includeSubtasks) {
            query = query.is("parent_task_id", null);
        }

        if (cursor) {
            query = query.lt("created_at", cursor);
        }

        const { data, error } = await query;

        if (error) {
            logger.error("fetchTasks error:", error);
            throw error;
        }

        const tasks = (data || []).slice(0, PAGE_SIZE).map(mapTaskFromDb);
        const hasMore = (data || []).length > PAGE_SIZE;
        const nextCursor = hasMore ? tasks[tasks.length - 1]?.createdAt : null;

        return { tasks, nextCursor, hasMore };
    } catch (error) {
        logger.error("fetchTasks failed:", error);
        throw error;
    }
}

/**
 * Récupère les tâches pour la vue Kanban
 */
export async function fetchKanbanTasks(
    projectId: string
): Promise<KanbanColumn[]> {
    try {
        const { data, error } = await supabase.rpc("get_tasks_kanban", {
            p_project_id: projectId,
        });

        if (error) {
            logger.error("fetchKanbanTasks error:", error);
            throw error;
        }

        // Mapper les données vers le format attendu
        const columnsMap = new Map<TaskStatus, Task[]>();
        TASK_STATUS_ORDER.forEach((status) => columnsMap.set(status, []));

        (data || []).forEach((row: { status: TaskStatus; tasks: unknown[] }) => {
            const tasks = (row.tasks || []).map((t) =>
                mapTaskFromDb(t as Record<string, unknown>)
            );
            columnsMap.set(row.status, tasks);
        });

        return TASK_STATUS_ORDER.filter((s) => s !== "archived").map(
            (status) => ({
                status,
                tasks: columnsMap.get(status) || [],
            })
        );
    } catch (error) {
        logger.error("fetchKanbanTasks failed:", error);
        throw error;
    }
}

/**
 * Récupère une tâche par son ID
 */
export async function fetchTask(taskId: string): Promise<Task | null> {
    try {
        const { data, error } = await supabase
            .from("tasks")
            .select(
                `
                *,
                creator:profiles!creator_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                ),
                assignee:profiles!assignee_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                ),
                project:projects!project_id (
                    id,
                    name,
                    color,
                    icon
                )
            `
            )
            .eq("id", taskId)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null;
            logger.error("fetchTask error:", error);
            throw error;
        }

        return mapTaskFromDb(data);
    } catch (error) {
        logger.error("fetchTask failed:", error);
        throw error;
    }
}

/**
 * Récupère les sous-tâches d'une tâche
 */
export async function fetchSubtasks(parentTaskId: string): Promise<Task[]> {
    try {
        const { data, error } = await supabase
            .from("tasks")
            .select(
                `
                *,
                creator:profiles!creator_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                ),
                assignee:profiles!assignee_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                )
            `
            )
            .eq("parent_task_id", parentTaskId)
            .order("position", { ascending: true });

        if (error) {
            logger.error("fetchSubtasks error:", error);
            throw error;
        }

        return (data || []).map(mapTaskFromDb);
    } catch (error) {
        logger.error("fetchSubtasks failed:", error);
        throw error;
    }
}

/**
 * Crée une nouvelle tâche
 */
export async function createTask(params: CreateTaskParams): Promise<Task> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from("tasks")
            .insert({
                title: params.title,
                description: params.description || null,
                status: params.status || "todo",
                priority: params.priority || "medium",
                due_date: params.dueDate || null,
                reminder_at: params.reminderAt || null,
                project_id: params.projectId || null,
                creator_id: user.id,
                assignee_id: params.assigneeId || null,
                parent_task_id: params.parentTaskId || null,
                tags: params.tags || [],
                estimated_minutes: params.estimatedMinutes || null,
                checklist: params.checklist || [],
            })
            .select(
                `
                *,
                creator:profiles!creator_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                ),
                assignee:profiles!assignee_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                ),
                project:projects!project_id (
                    id,
                    name,
                    color,
                    icon
                )
            `
            )
            .single();

        if (error) {
            logger.error("createTask error:", error);
            throw error;
        }

        logger.info("Task created:", data.id);
        return mapTaskFromDb(data);
    } catch (error) {
        logger.error("createTask failed:", error);
        throw error;
    }
}

/**
 * Met à jour une tâche
 */
export async function updateTask(
    taskId: string,
    params: UpdateTaskParams
): Promise<Task> {
    try {
        const updateData: Record<string, unknown> = {};

        if (params.title !== undefined) updateData.title = params.title;
        if (params.description !== undefined)
            updateData.description = params.description;
        if (params.status !== undefined) updateData.status = params.status;
        if (params.priority !== undefined) updateData.priority = params.priority;
        if (params.dueDate !== undefined) updateData.due_date = params.dueDate;
        if (params.reminderAt !== undefined)
            updateData.reminder_at = params.reminderAt;
        if (params.assigneeId !== undefined)
            updateData.assignee_id = params.assigneeId;
        if (params.tags !== undefined) updateData.tags = params.tags;
        if (params.position !== undefined) updateData.position = params.position;
        if (params.estimatedMinutes !== undefined)
            updateData.estimated_minutes = params.estimatedMinutes;
        if (params.actualMinutes !== undefined)
            updateData.actual_minutes = params.actualMinutes;
        if (params.checklist !== undefined)
            updateData.checklist = params.checklist;
        if (params.attachments !== undefined)
            updateData.attachments = params.attachments;

        const { data, error } = await supabase
            .from("tasks")
            .update(updateData)
            .eq("id", taskId)
            .select(
                `
                *,
                creator:profiles!creator_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                ),
                assignee:profiles!assignee_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                ),
                project:projects!project_id (
                    id,
                    name,
                    color,
                    icon
                )
            `
            )
            .single();

        if (error) {
            logger.error("updateTask error:", error);
            throw error;
        }

        logger.info("Task updated:", taskId);
        return mapTaskFromDb(data);
    } catch (error) {
        logger.error("updateTask failed:", error);
        throw error;
    }
}

/**
 * Supprime une tâche
 */
export async function deleteTask(taskId: string): Promise<void> {
    try {
        const { error } = await supabase.from("tasks").delete().eq("id", taskId);

        if (error) {
            logger.error("deleteTask error:", error);
            throw error;
        }

        logger.info("Task deleted:", taskId);
    } catch (error) {
        logger.error("deleteTask failed:", error);
        throw error;
    }
}

/**
 * Change le statut d'une tâche (raccourci)
 */
export async function changeTaskStatus(
    taskId: string,
    status: TaskStatus
): Promise<Task> {
    return updateTask(taskId, { status });
}

/**
 * Assigne une tâche à un utilisateur
 */
export async function assignTask(
    taskId: string,
    assigneeId: string | null
): Promise<Task> {
    return updateTask(taskId, { assigneeId });
}

/**
 * Met à jour la position d'une tâche (pour drag & drop Kanban)
 */
export async function moveTask(
    taskId: string,
    newStatus: TaskStatus,
    newPosition: number
): Promise<Task> {
    return updateTask(taskId, { status: newStatus, position: newPosition });
}

/**
 * Met à jour la checklist d'une tâche
 */
export async function updateTaskChecklist(
    taskId: string,
    checklist: ChecklistItem[]
): Promise<Task> {
    return updateTask(taskId, { checklist });
}

/**
 * Toggle un item de checklist
 */
export async function toggleChecklistItem(
    taskId: string,
    itemId: string
): Promise<Task> {
    const task = await fetchTask(taskId);
    if (!task) throw new Error("Task not found");

    const updatedChecklist = task.checklist.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
    );

    return updateTaskChecklist(taskId, updatedChecklist);
}

// ============================================================================
// TASK COMMENTS
// ============================================================================

/**
 * Récupère les commentaires d'une tâche
 */
export async function fetchTaskComments(taskId: string): Promise<TaskComment[]> {
    try {
        const { data, error } = await supabase
            .from("task_comments")
            .select(
                `
                *,
                author:profiles!author_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                )
            `
            )
            .eq("task_id", taskId)
            .order("created_at", { ascending: true });

        if (error) {
            logger.error("fetchTaskComments error:", error);
            throw error;
        }

        return (data || []).map(mapCommentFromDb);
    } catch (error) {
        logger.error("fetchTaskComments failed:", error);
        throw error;
    }
}

/**
 * Ajoute un commentaire à une tâche
 */
export async function addTaskComment(
    taskId: string,
    content: string
): Promise<TaskComment> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from("task_comments")
            .insert({
                task_id: taskId,
                author_id: user.id,
                content,
            })
            .select(
                `
                *,
                author:profiles!author_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                )
            `
            )
            .single();

        if (error) {
            logger.error("addTaskComment error:", error);
            throw error;
        }

        logger.info("Comment added to task:", taskId);
        return mapCommentFromDb(data);
    } catch (error) {
        logger.error("addTaskComment failed:", error);
        throw error;
    }
}

/**
 * Supprime un commentaire
 */
export async function deleteTaskComment(commentId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from("task_comments")
            .delete()
            .eq("id", commentId);

        if (error) {
            logger.error("deleteTaskComment error:", error);
            throw error;
        }

        logger.info("Comment deleted:", commentId);
    } catch (error) {
        logger.error("deleteTaskComment failed:", error);
        throw error;
    }
}

// ============================================================================
// TASK ACTIVITY LOG
// ============================================================================

/**
 * Récupère l'historique d'activité d'une tâche
 */
export async function fetchTaskActivity(
    taskId: string
): Promise<TaskActivityLog[]> {
    try {
        const { data, error } = await supabase
            .from("task_activity_log")
            .select(
                `
                *,
                user:profiles!user_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                )
            `
            )
            .eq("task_id", taskId)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) {
            logger.error("fetchTaskActivity error:", error);
            throw error;
        }

        return (data || []).map(mapActivityFromDb);
    } catch (error) {
        logger.error("fetchTaskActivity failed:", error);
        throw error;
    }
}

// ============================================================================
// HELPER FUNCTIONS (Pour l'UI)
// ============================================================================

/**
 * Récupère les tâches dues prochainement
 */
export async function fetchUpcomingTasks(
    days: number = 7
): Promise<
    {
        id: string;
        title: string;
        dueDate: string;
        projectName: string | null;
        projectColor: string | null;
        priority: TaskPriority;
    }[]
> {
    try {
        const { data, error } = await supabase.rpc("get_upcoming_tasks", {
            p_days: days,
        });

        if (error) {
            logger.error("fetchUpcomingTasks error:", error);
            throw error;
        }

        return (data || []).map(
            (row: Record<string, unknown>) => ({
                id: row.id as string,
                title: row.title as string,
                dueDate: row.due_date as string,
                projectName: row.project_name as string | null,
                projectColor: row.project_color as string | null,
                priority: row.priority as TaskPriority,
            })
        );
    } catch (error) {
        logger.error("fetchUpcomingTasks failed:", error);
        throw error;
    }
}

/**
 * Récupère le résumé des projets (pour la vue liste)
 */
export async function fetchProjectsSummary(): Promise<
    {
        id: string;
        name: string;
        color: string;
        icon: string;
        tasksCount: number;
        completedTasksCount: number;
        progressPercent: number;
        updatedAt: string;
    }[]
> {
    try {
        const { data, error } = await supabase.rpc("get_my_projects_summary");

        if (error) {
            logger.error("fetchProjectsSummary error:", error);
            throw error;
        }

        return (data || []).map(
            (row: Record<string, unknown>) => ({
                id: row.id as string,
                name: row.name as string,
                color: row.color as string,
                icon: row.icon as string,
                tasksCount: row.tasks_count as number,
                completedTasksCount: row.completed_tasks_count as number,
                progressPercent: Number(row.progress_percent),
                updatedAt: row.updated_at as string,
            })
        );
    } catch (error) {
        logger.error("fetchProjectsSummary failed:", error);
        throw error;
    }
}

/**
 * Récupère le nombre de tâches par statut pour l'utilisateur
 */
export async function fetchTasksCountByStatus(): Promise<
    Record<TaskStatus, number>
> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from("tasks")
            .select("status")
            .or(`creator_id.eq.${user.id},assignee_id.eq.${user.id}`);

        if (error) {
            logger.error("fetchTasksCountByStatus error:", error);
            throw error;
        }

        const counts: Record<TaskStatus, number> = {
            backlog: 0,
            todo: 0,
            in_progress: 0,
            review: 0,
            done: 0,
            archived: 0,
        };

        (data || []).forEach((row) => {
            const status = row.status as TaskStatus;
            if (counts[status] !== undefined) {
                counts[status]++;
            }
        });

        return counts;
    } catch (error) {
        logger.error("fetchTasksCountByStatus failed:", error);
        throw error;
    }
}

/**
 * Génère un nouvel ID unique pour un item de checklist
 */
export function generateChecklistItemId(): string {
    return `cl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Crée un nouvel item de checklist
 */
export function createChecklistItem(text: string): ChecklistItem {
    return {
        id: generateChecklistItemId(),
        text,
        done: false,
    };
}
