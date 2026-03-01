/**
 * Tests for stores/modules-store.ts
 * Zustand store tested via getState()/setState()
 */

// --- Mocks ---
jest.mock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: {
        getItem: jest.fn().mockResolvedValue(null),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock("@/services/modules-api", () => ({
    fetchModuleCatalog: jest.fn(),
    fetchUserModules: jest.fn(),
    autoInstallDefaultModules: jest.fn(),
    installModule: jest.fn(),
    uninstallModule: jest.fn(),
    setModuleActive: jest.fn(),
    searchModules: jest.fn(),
}));

jest.mock("@/services/logger", () => ({
    createLogger: () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));

import {
    installModule as apiInstallModule,
    searchModules as apiSearchModules,
    setModuleActive as apiSetModuleActive,
    uninstallModule as apiUninstallModule,
    autoInstallDefaultModules,
    fetchModuleCatalog,
    fetchUserModules,
} from "@/services/modules-api";
import { useModulesStore } from "../modules-store";

// --- Helpers ---
const makeCatalogModule = (overrides: any = {}) => ({
    id: "mod-1",
    name: "Test Module",
    description: "A test module",
    version: "1.0.0",
    icon: "🧪",
    category: "productivity",
    is_core: false,
    default_enabled: false,
    permissions: [],
    ...overrides,
});

const makeInstalledModule = (overrides: any = {}) => ({
    id: "inst-1",
    user_id: "user-1",
    module_id: "mod-1",
    is_active: true,
    installed_version: "1.0.0",
    permissions_granted: [],
    installed_at: new Date().toISOString(),
    ...overrides,
});

// --- Tests ---
describe("useModulesStore", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useModulesStore.getState().reset();
    });

    // ── Initial state ───────────────────────────
    describe("initial state", () => {
        it("should have empty catalog and installed modules", () => {
            const state = useModulesStore.getState();
            expect(state.catalog).toEqual([]);
            expect(state.installedModules).toEqual([]);
            expect(state.catalogLoading).toBe(false);
            expect(state.installedLoading).toBe(false);
            expect(state.autoInstallComplete).toBe(false);
        });
    });

    // ── fetchCatalog ────────────────────────────
    describe("fetchCatalog", () => {
        it("should fetch and store catalog", async () => {
            const modules = [makeCatalogModule(), makeCatalogModule({ id: "mod-2", name: "Mod 2" })];
            (fetchModuleCatalog as jest.Mock).mockResolvedValue(modules);

            await useModulesStore.getState().fetchCatalog();

            const state = useModulesStore.getState();
            expect(state.catalog).toHaveLength(2);
            expect(state.catalogLoading).toBe(false);
            expect(state.catalogFetchedAt).toBeTruthy();
            expect(fetchModuleCatalog).toHaveBeenCalledTimes(1);
        });

        it("should use cache if not expired", async () => {
            const modules = [makeCatalogModule()];
            (fetchModuleCatalog as jest.Mock).mockResolvedValue(modules);

            await useModulesStore.getState().fetchCatalog();
            await useModulesStore.getState().fetchCatalog(); // second call

            expect(fetchModuleCatalog).toHaveBeenCalledTimes(1);
        });

        it("should force refresh when force=true", async () => {
            const modules = [makeCatalogModule()];
            (fetchModuleCatalog as jest.Mock).mockResolvedValue(modules);

            await useModulesStore.getState().fetchCatalog();
            await useModulesStore.getState().fetchCatalog(true);

            expect(fetchModuleCatalog).toHaveBeenCalledTimes(2);
        });

        it("should handle errors gracefully", async () => {
            (fetchModuleCatalog as jest.Mock).mockRejectedValue(new Error("Network error"));

            await useModulesStore.getState().fetchCatalog();

            const state = useModulesStore.getState();
            expect(state.catalogLoading).toBe(false);
            expect(state.catalogError).toBe("Network error");
        });
    });

    // ── searchCatalog ───────────────────────────
    describe("searchCatalog", () => {
        it("should return full catalog for empty query", async () => {
            const modules = [makeCatalogModule()];
            useModulesStore.setState({ catalog: modules });

            const result = await useModulesStore.getState().searchCatalog("");
            expect(result).toEqual(modules);
        });

        it("should call API search for non-empty query", async () => {
            const results = [makeCatalogModule({ name: "Music" })];
            (apiSearchModules as jest.Mock).mockResolvedValue(results);

            const found = await useModulesStore.getState().searchCatalog("music");
            expect(found).toEqual(results);
            expect(apiSearchModules).toHaveBeenCalledWith("music");
        });

        it("should fallback to local search on API error", async () => {
            (apiSearchModules as jest.Mock).mockRejectedValue(new Error("fail"));
            useModulesStore.setState({
                catalog: [
                    makeCatalogModule({ name: "Music Player" }),
                    makeCatalogModule({ id: "mod-2", name: "Tasks" }),
                ],
            });

            const found = await useModulesStore.getState().searchCatalog("music");
            expect(found).toHaveLength(1);
            expect(found[0].name).toBe("Music Player");
        });
    });

    // ── fetchInstalled ──────────────────────────
    describe("fetchInstalled", () => {
        it("should fetch and store installed modules", async () => {
            const installed = [makeInstalledModule()];
            (fetchUserModules as jest.Mock).mockResolvedValue(installed);

            await useModulesStore.getState().fetchInstalled();

            const state = useModulesStore.getState();
            expect(state.installedModules).toHaveLength(1);
            expect(state.installedLoading).toBe(false);
        });

        it("should use cache when not expired", async () => {
            (fetchUserModules as jest.Mock).mockResolvedValue([makeInstalledModule()]);

            await useModulesStore.getState().fetchInstalled();
            await useModulesStore.getState().fetchInstalled();

            expect(fetchUserModules).toHaveBeenCalledTimes(1);
        });

        it("should handle fetch error", async () => {
            (fetchUserModules as jest.Mock).mockRejectedValue(new Error("DB error"));

            await useModulesStore.getState().fetchInstalled();

            expect(useModulesStore.getState().installedError).toBe("DB error");
        });
    });

    // ── runAutoInstall ──────────────────────────
    describe("runAutoInstall", () => {
        it("should auto-install and return count", async () => {
            (autoInstallDefaultModules as jest.Mock).mockResolvedValue(3);
            (fetchUserModules as jest.Mock).mockResolvedValue([]);

            const count = await useModulesStore.getState().runAutoInstall();

            expect(count).toBe(3);
            expect(useModulesStore.getState().autoInstallComplete).toBe(true);
        });

        it("should skip if already complete", async () => {
            useModulesStore.setState({ autoInstallComplete: true });

            const count = await useModulesStore.getState().runAutoInstall();

            expect(count).toBe(0);
            expect(autoInstallDefaultModules).not.toHaveBeenCalled();
        });

        it("should return -1 on error", async () => {
            (autoInstallDefaultModules as jest.Mock).mockRejectedValue(new Error("fail"));

            const count = await useModulesStore.getState().runAutoInstall();

            expect(count).toBe(-1);
        });
    });

    // ── install ─────────────────────────────────
    describe("install", () => {
        it("should install module and update state", async () => {
            const installed = makeInstalledModule({ module_id: "mod-x" });
            (apiInstallModule as jest.Mock).mockResolvedValue(installed);

            await useModulesStore.getState().install("mod-x", ["storage"]);

            expect(apiInstallModule).toHaveBeenCalledWith("mod-x", ["storage"]);
            expect(useModulesStore.getState().installedModules).toContainEqual(installed);
        });

        it("should use module permissions when not provided", async () => {
            const installed = makeInstalledModule({ module_id: "mod-y" });
            (apiInstallModule as jest.Mock).mockResolvedValue(installed);
            useModulesStore.setState({
                catalog: [makeCatalogModule({ id: "mod-y", permissions: ["camera"] })],
            });

            await useModulesStore.getState().install("mod-y");

            expect(apiInstallModule).toHaveBeenCalledWith("mod-y", ["camera"]);
        });

        it("should throw on install error", async () => {
            (apiInstallModule as jest.Mock).mockRejectedValue(new Error("Install failed"));

            await expect(useModulesStore.getState().install("mod-z")).rejects.toThrow("Install failed");
        });
    });

    // ── uninstall ───────────────────────────────
    describe("uninstall", () => {
        it("should uninstall and remove from state", async () => {
            (apiUninstallModule as jest.Mock).mockResolvedValue(undefined);
            useModulesStore.setState({
                installedModules: [makeInstalledModule({ module_id: "mod-1" })],
            });

            await useModulesStore.getState().uninstall("mod-1");

            expect(useModulesStore.getState().installedModules).toHaveLength(0);
        });
    });

    // ── toggleActive ────────────────────────────
    describe("toggleActive", () => {
        it("should toggle active state", async () => {
            (apiSetModuleActive as jest.Mock).mockResolvedValue(undefined);
            useModulesStore.setState({
                installedModules: [makeInstalledModule({ module_id: "mod-1", is_active: true })],
            });

            await useModulesStore.getState().toggleActive("mod-1", false);

            const mod = useModulesStore.getState().getInstalledModule("mod-1");
            expect(mod?.is_active).toBe(false);
        });
    });

    // ── Helpers ─────────────────────────────────
    describe("helpers", () => {
        it("isInstalled should return true for installed module", () => {
            useModulesStore.setState({
                installedModules: [makeInstalledModule({ module_id: "mod-1" })],
            });
            expect(useModulesStore.getState().isInstalled("mod-1")).toBe(true);
            expect(useModulesStore.getState().isInstalled("mod-99")).toBe(false);
        });

        it("isActive should return correct state", () => {
            useModulesStore.setState({
                installedModules: [makeInstalledModule({ module_id: "mod-1", is_active: true })],
            });
            expect(useModulesStore.getState().isActive("mod-1")).toBe(true);
            expect(useModulesStore.getState().isActive("mod-99")).toBe(false);
        });

        it("getCatalogModule should find by id", () => {
            useModulesStore.setState({
                catalog: [makeCatalogModule({ id: "mod-1" })],
            });
            expect(useModulesStore.getState().getCatalogModule("mod-1")?.name).toBe("Test Module");
            expect(useModulesStore.getState().getCatalogModule("mod-99")).toBeUndefined();
        });
    });

    // ── Reset ───────────────────────────────────
    describe("reset", () => {
        it("should reset all state", () => {
            useModulesStore.setState({
                catalog: [makeCatalogModule()],
                installedModules: [makeInstalledModule()],
                autoInstallComplete: true,
            });

            useModulesStore.getState().reset();

            const state = useModulesStore.getState();
            expect(state.catalog).toEqual([]);
            expect(state.installedModules).toEqual([]);
            expect(state.autoInstallComplete).toBe(false);
        });
    });
});
