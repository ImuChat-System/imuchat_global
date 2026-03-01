/**
 * Tests for services/tasks-api.ts
 * Tests exported constants, helpers, and core CRUD functions
 */

// --- Mocks ---
jest.mock("../supabase", () => ({
    supabase: {
        from: jest.fn(),
        auth: { getUser: jest.fn() },
        rpc: jest.fn(),
    },
}));

jest.mock("../logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

import { supabase } from "../supabase";
import {
    DEFAULT_PROJECT_COLORS,
    DEFAULT_PROJECT_ICONS,
    TASK_PRIORITY_COLORS,
    TASK_PRIORITY_LABELS,
    TASK_STATUS_LABELS,
    TASK_STATUS_ORDER,
    createProject,
    createTask,
    deleteProject,
    deleteTask,
    fetchProject,
    fetchProjects,
    fetchTask,
    fetchTasks,
    updateProject,
    updateTask,
} from "../tasks-api";

const mockFrom = supabase.from as jest.Mock;
const mockAuth = supabase.auth.getUser as jest.Mock;

const mockUser = { id: "user-1" };

function setupAuth(user: any = mockUser) {
    mockAuth.mockResolvedValue({ data: { user } });
}

function makeDbTask(overrides: any = {}) {
    return {
        id: "task-1",
        title: "Test task",
        description: null,
        status: "todo",
        priority: "medium",
        due_date: null,
        reminder_at: null,
        completed_at: null,
        project_id: null,
        creator_id: "user-1",
        assignee_id: null,
        parent_task_id: null,
        tags: [],
        position: 0,
        estimated_minutes: null,
        actual_minutes: null,
        checklist: [],
        attachments: [],
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
        ...overrides,
    };
}

function makeDbProject(overrides: any = {}) {
    return {
        id: "proj-1",
        name: "Test Project",
        description: null,
        color: "#6366f1",
        icon: "📁",
        owner_id: "user-1",
        conversation_id: null,
        member_ids: [],
        is_archived: false,
        tasks_count: 10,
        completed_tasks_count: 3,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
        ...overrides,
    };
}

beforeEach(() => jest.clearAllMocks());

describe("tasks-api", () => {
    // ── Constants ──
    describe("constants", () => {
        it("TASK_STATUS_ORDER has 6 statuses", () => {
            expect(TASK_STATUS_ORDER).toHaveLength(6);
            expect(TASK_STATUS_ORDER).toContain("todo");
            expect(TASK_STATUS_ORDER).toContain("done");
        });

        it("TASK_STATUS_LABELS has entries for all statuses", () => {
            for (const status of TASK_STATUS_ORDER) {
                expect(TASK_STATUS_LABELS[status]).toBeTruthy();
            }
        });

        it("TASK_PRIORITY_LABELS has all priorities", () => {
            expect(TASK_PRIORITY_LABELS.low).toBeTruthy();
            expect(TASK_PRIORITY_LABELS.urgent).toBeTruthy();
        });

        it("TASK_PRIORITY_COLORS has valid hex colors", () => {
            Object.values(TASK_PRIORITY_COLORS).forEach((color) => {
                expect(color).toMatch(/^#[0-9a-f]{6}$/i);
            });
        });

        it("DEFAULT_PROJECT_COLORS has 12 colors", () => {
            expect(DEFAULT_PROJECT_COLORS).toHaveLength(12);
        });

        it("DEFAULT_PROJECT_ICONS has 12 icons", () => {
            expect(DEFAULT_PROJECT_ICONS).toHaveLength(12);
        });
    });

    // ── fetchProjects ──
    describe("fetchProjects", () => {
        it("returns mapped projects", async () => {
            const dbProject = makeDbProject();
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    order: jest.fn().mockReturnValue({
                        limit: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({
                                data: [dbProject],
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const result = await fetchProjects();
            expect(result.projects).toHaveLength(1);
            expect(result.projects[0].id).toBe("proj-1");
            expect(result.projects[0].progressPercent).toBe(30); // 3/10=30%
        });

        it("throws on error", async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    order: jest.fn().mockReturnValue({
                        limit: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({
                                data: null,
                                error: { message: "DB error" },
                            }),
                        }),
                    }),
                }),
            });

            await expect(fetchProjects()).rejects.toBeTruthy();
        });
    });

    // ── fetchProject ──
    describe("fetchProject", () => {
        it("returns single project", async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: makeDbProject(),
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await fetchProject("proj-1");
            expect(result?.name).toBe("Test Project");
        });

        it("returns null when not found", async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: { code: "PGRST116", message: "Not found" },
                        }),
                    }),
                }),
            });

            expect(await fetchProject("unknown")).toBeNull();
        });
    });

    // ── createProject ──
    describe("createProject", () => {
        it("creates and returns project", async () => {
            setupAuth();
            mockFrom.mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: makeDbProject({ id: "proj-new" }),
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await createProject({ name: "New Project" });
            expect(result.id).toBe("proj-new");
        });

        it("throws when not authenticated", async () => {
            mockAuth.mockResolvedValue({ data: { user: null } });
            await expect(createProject({ name: "Fail" })).rejects.toThrow("Not authenticated");
        });
    });

    // ── updateProject ──
    describe("updateProject", () => {
        it("updates and returns project", async () => {
            mockFrom.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                                data: makeDbProject({ name: "Updated" }),
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const result = await updateProject("proj-1", { name: "Updated" });
            expect(result.name).toBe("Updated");
        });
    });

    // ── deleteProject ──
    describe("deleteProject", () => {
        it("deletes project", async () => {
            mockFrom.mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null }),
                }),
            });

            await expect(deleteProject("proj-1")).resolves.not.toThrow();
        });
    });

    // ── fetchTasks ──
    describe("fetchTasks", () => {
        it("returns mapped tasks", async () => {
            const dbTask = makeDbTask();
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    order: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                            limit: jest.fn().mockReturnValue({
                                is: jest.fn().mockResolvedValue({
                                    data: [dbTask],
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            const result = await fetchTasks();
            expect(result.tasks).toHaveLength(1);
            expect(result.tasks[0].title).toBe("Test task");
            expect(result.tasks[0].creatorId).toBe("user-1");
        });
    });

    // ── fetchTask ──
    describe("fetchTask", () => {
        it("returns single task", async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: makeDbTask(),
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await fetchTask("task-1");
            expect(result?.title).toBe("Test task");
        });

        it("returns null when not found", async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: { code: "PGRST116" },
                        }),
                    }),
                }),
            });

            expect(await fetchTask("unknown")).toBeNull();
        });
    });

    // ── createTask ──
    describe("createTask", () => {
        it("creates and returns task", async () => {
            setupAuth();
            const newTask = makeDbTask({ id: "task-new", title: "New Task" });
            mockFrom.mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: newTask,
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await createTask({ title: "New Task" });
            expect(result.title).toBe("New Task");
        });

        it("throws when not authenticated", async () => {
            mockAuth.mockResolvedValue({ data: { user: null } });
            await expect(createTask({ title: "Fail" })).rejects.toThrow("Not authenticated");
        });
    });

    // ── updateTask ──
    describe("updateTask", () => {
        it("updates and returns task", async () => {
            const updated = makeDbTask({ title: "Updated" });
            mockFrom.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                                data: updated,
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const result = await updateTask("task-1", { title: "Updated" });
            expect(result.title).toBe("Updated");
        });
    });

    // ── deleteTask ──
    describe("deleteTask", () => {
        it("deletes task", async () => {
            mockFrom.mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null }),
                }),
            });

            await expect(deleteTask("task-1")).resolves.not.toThrow();
        });

        it("throws on error", async () => {
            mockFrom.mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        error: { message: "Permission denied" },
                    }),
                }),
            });

            await expect(deleteTask("task-1")).rejects.toBeTruthy();
        });
    });
});
