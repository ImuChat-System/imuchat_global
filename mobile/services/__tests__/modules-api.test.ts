/**
 * Tests for services/modules-api.ts
 * Supabase chain mock pattern
 */

// --- Mocks ---
jest.mock("../supabase", () => ({
    supabase: {
        from: jest.fn(),
        rpc: jest.fn(),
    },
    getCurrentUser: jest.fn(),
}));

jest.mock("@/services/logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

import {
    fetchCoreModules,
    fetchDefaultEnabledModules,
    fetchModuleById,
    fetchModuleCatalog,
    fetchModulesByCategory,
    fetchUserModules,
    installModule,
    isModuleInstalled,
    searchModules,
    setModuleActive,
    uninstallModule,
    updateModulePermissions,
    updateModuleSettings,
} from "../modules-api";
import { getCurrentUser, supabase } from "../supabase";

const mockFrom = supabase.from as jest.Mock;
const mockRpc = supabase.rpc as jest.Mock;
const mockGetCurrentUser = getCurrentUser as jest.Mock;

// ── Helpers ──
function makeModule(overrides: any = {}) {
    return {
        id: "mod-1",
        name: "Test Module",
        version: "1.0.0",
        category: "social",
        is_published: true,
        is_core: false,
        default_enabled: false,
        download_count: 100,
        rating: 4.5,
        permissions: ["camera"],
        ...overrides,
    };
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("modules-api", () => {
    // ── fetchModuleCatalog ──
    describe("fetchModuleCatalog", () => {
        it("returns published modules sorted by downloads", async () => {
            const modules = [makeModule(), makeModule({ id: "mod-2" })];
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue({
                            data: modules,
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await fetchModuleCatalog();
            expect(result).toEqual(modules);
            expect(mockFrom).toHaveBeenCalledWith("modules");
        });

        it("throws on error", async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: "DB error" },
                        }),
                    }),
                }),
            });

            await expect(fetchModuleCatalog()).rejects.toThrow("Failed to fetch module catalog");
        });
    });

    // ── fetchModuleById ──
    describe("fetchModuleById", () => {
        it("returns module when found", async () => {
            const mod = makeModule();
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: mod,
                            error: null,
                        }),
                    }),
                }),
            });

            expect(await fetchModuleById("mod-1")).toEqual(mod);
        });

        it("returns null for PGRST116 (not found)", async () => {
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

            expect(await fetchModuleById("unknown")).toBeNull();
        });

        it("throws on other errors", async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: { code: "OTHER", message: "Server error" },
                        }),
                    }),
                }),
            });

            await expect(fetchModuleById("mod-1")).rejects.toThrow();
        });
    });

    // ── fetchModulesByCategory ──
    describe("fetchModulesByCategory", () => {
        it("returns modules filtered by category", async () => {
            const modules = [makeModule({ category: "social" })];
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            order: jest.fn().mockResolvedValue({
                                data: modules,
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            expect(await fetchModulesByCategory("social")).toEqual(modules);
        });
    });

    // ── searchModules ──
    describe("searchModules", () => {
        it("searches by name with ilike", async () => {
            const modules = [makeModule({ name: "Music Player" })];
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        ilike: jest.fn().mockReturnValue({
                            order: jest.fn().mockReturnValue({
                                limit: jest.fn().mockResolvedValue({
                                    data: modules,
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            expect(await searchModules("Music")).toEqual(modules);
        });
    });

    // ── fetchCoreModules ──
    describe("fetchCoreModules", () => {
        it("returns core published modules", async () => {
            const coreModules = [makeModule({ is_core: true })];
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({
                            data: coreModules,
                            error: null,
                        }),
                    }),
                }),
            });

            expect(await fetchCoreModules()).toEqual(coreModules);
        });
    });

    // ── fetchDefaultEnabledModules ──
    describe("fetchDefaultEnabledModules", () => {
        it("returns default_enabled non-core modules", async () => {
            const defaults = [makeModule({ default_enabled: true })];
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({
                                data: defaults,
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            expect(await fetchDefaultEnabledModules()).toEqual(defaults);
        });
    });

    // ── fetchUserModules ──
    describe("fetchUserModules", () => {
        it("returns user installed modules with join", async () => {
            const installed = [
                { id: "um-1", module_id: "mod-1", module: makeModule() },
            ];
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({
                        data: installed,
                        error: null,
                    }),
                }),
            });

            expect(await fetchUserModules()).toEqual(installed);
        });
    });

    // ── isModuleInstalled ──
    describe("isModuleInstalled", () => {
        it("returns true when count > 0", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ count: 1, error: null }),
                    }),
                }),
            });

            expect(await isModuleInstalled("mod-1")).toBe(true);
        });

        it("returns false when no user", async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            expect(await isModuleInstalled("mod-1")).toBe(false);
        });
    });

    // ── installModule ──
    describe("installModule", () => {
        it("installs and returns user module", async () => {
            // fetchModuleById
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: makeModule(),
                            error: null,
                        }),
                    }),
                }),
            });
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
            // upsert
            mockFrom.mockReturnValueOnce({
                upsert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { id: "um-1", module_id: "mod-1" },
                            error: null,
                        }),
                    }),
                }),
            });
            // increment_download_count
            mockRpc.mockReturnValue({ match: jest.fn() });

            const result = await installModule("mod-1", ["camera"]);
            expect(result.module_id).toBe("mod-1");
        });

        it("throws when module not found", async () => {
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

            await expect(installModule("unknown", [])).rejects.toThrow('not found');
        });
    });

    // ── uninstallModule ──
    describe("uninstallModule", () => {
        it("deletes user module", async () => {
            // fetchModuleById (non-core)
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: makeModule({ is_core: false }),
                            error: null,
                        }),
                    }),
                }),
            });
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
            // delete
            mockFrom.mockReturnValueOnce({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            });

            await expect(uninstallModule("mod-1")).resolves.not.toThrow();
        });

        it("throws when trying to uninstall core module", async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: makeModule({ is_core: true }),
                            error: null,
                        }),
                    }),
                }),
            });
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });

            await expect(uninstallModule("core-mod")).rejects.toThrow("Cannot uninstall core");
        });
    });

    // ── setModuleActive ──
    describe("setModuleActive", () => {
        it("updates is_active", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
            mockFrom.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            });

            await expect(setModuleActive("mod-1", false)).resolves.not.toThrow();
        });
    });

    // ── updateModulePermissions ──
    describe("updateModulePermissions", () => {
        it("updates granted_permissions", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
            mockFrom.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            });

            await expect(
                updateModulePermissions("mod-1", ["camera", "storage"])
            ).resolves.not.toThrow();
        });
    });

    // ── updateModuleSettings ──
    describe("updateModuleSettings", () => {
        it("updates settings", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
            mockFrom.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            });

            await expect(
                updateModuleSettings("mod-1", { theme: "dark" })
            ).resolves.not.toThrow();
        });
    });
});
