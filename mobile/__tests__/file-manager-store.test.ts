/**
 * File Manager Store — Tests (DEV-037)
 *
 * 30 tests covering all store actions, navigation, CRUD, sync, uploads.
 */
import { useFileManagerStore } from "../stores/file-manager-store";

// ── helpers ───────────────────────────────────────────────
function resetStore() {
    useFileManagerStore.setState({
        currentFolderId: null,
        breadcrumbs: [{ id: null, name: "Mon Drive" }],
        files: [],
        folders: [],
        sharedFiles: [],
        trash: [],
        favorites: [],
        quota: { usedBytes: 0, totalBytes: 0, usedPercent: 0 },
        breakdown: { images: 0, videos: 0, audio: 0, documents: 0, archives: 0, other: 0 },
        devices: [],
        syncSettings: {
            autoSync: true,
            syncOnWifiOnly: true,
            syncPhotos: true,
            syncVideos: false,
            syncDocuments: true,
            syncFrequencyMinutes: 30,
        },
        uploads: [],
        sortBy: "name",
        sortOrder: "asc",
        searchQuery: "",
        loading: false,
        viewMode: "list",
    });
}

beforeEach(resetStore);
const getState = () => useFileManagerStore.getState();

// ============================================================================
// NAVIGATION
// ============================================================================

describe("FileManagerStore — navigation", () => {
    it("starts at root (null) with one breadcrumb", () => {
        expect(getState().currentFolderId).toBeNull();
        expect(getState().breadcrumbs).toHaveLength(1);
        expect(getState().breadcrumbs[0].name).toBe("Mon Drive");
    });

    it("setCurrentFolder to null resets breadcrumbs to root", async () => {
        // First, fetch some folders so we can navigate
        await getState().fetchFiles(null);
        const folder = getState().folders[0];
        if (folder) {
            getState().setCurrentFolder(folder.id);
            expect(getState().currentFolderId).toBe(folder.id);
        }
        getState().setCurrentFolder(null);
        expect(getState().currentFolderId).toBeNull();
        expect(getState().breadcrumbs).toHaveLength(1);
    });
});

// ============================================================================
// SORT / SEARCH / VIEW
// ============================================================================

describe("FileManagerStore — sort/search/view", () => {
    it("sets sort by", () => {
        getState().setSortBy("date");
        expect(getState().sortBy).toBe("date");
    });

    it("sets sort order", () => {
        getState().setSortOrder("desc");
        expect(getState().sortOrder).toBe("desc");
    });

    it("sets search query", () => {
        getState().setSearchQuery("photo");
        expect(getState().searchQuery).toBe("photo");
    });

    it("toggles view mode", () => {
        getState().setViewMode("grid");
        expect(getState().viewMode).toBe("grid");
        getState().setViewMode("list");
        expect(getState().viewMode).toBe("list");
    });
});

// ============================================================================
// FETCH
// ============================================================================

describe("FileManagerStore — fetch", () => {
    it("fetchFiles populates files and folders", async () => {
        await getState().fetchFiles(null);
        expect(getState().files.length).toBeGreaterThan(0);
        expect(getState().folders.length).toBeGreaterThan(0);
        expect(getState().loading).toBe(false);
    });

    it("fetchSharedFiles populates sharedFiles", async () => {
        await getState().fetchSharedFiles();
        expect(getState().sharedFiles.length).toBeGreaterThan(0);
        expect(getState().sharedFiles[0]).toHaveProperty("file");
        expect(getState().sharedFiles[0]).toHaveProperty("sharedByName");
    });

    it("fetchTrash populates trash", async () => {
        await getState().fetchTrash();
        expect(getState().trash.length).toBeGreaterThan(0);
        expect(getState().trash[0]).toHaveProperty("deletedAt");
    });

    it("fetchFavorites populates favorites", async () => {
        await getState().fetchFavorites();
        expect(getState().favorites.length).toBeGreaterThan(0);
        expect(getState().favorites.every((f) => f.isFavorite)).toBe(true);
    });

    it("fetchQuota returns valid quota + breakdown", async () => {
        await getState().fetchQuota();
        const { quota, breakdown } = getState();
        expect(quota.totalBytes).toBeGreaterThan(0);
        expect(quota.usedBytes).toBeGreaterThan(0);
        expect(quota.usedPercent).toBeGreaterThanOrEqual(0);
        expect(breakdown.images).toBeGreaterThanOrEqual(0);
    });

    it("fetchDevices populates devices", async () => {
        await getState().fetchDevices();
        expect(getState().devices.length).toBeGreaterThan(0);
        expect(getState().devices[0]).toHaveProperty("name");
        expect(getState().devices[0]).toHaveProperty("type");
        expect(getState().devices[0]).toHaveProperty("status");
    });
});

// ============================================================================
// CRUD — Folders
// ============================================================================

describe("FileManagerStore — folders", () => {
    it("createFolder adds a folder", async () => {
        await getState().fetchFiles(null);
        const before = getState().folders.length;
        await getState().createFolder("New Folder", null);
        expect(getState().folders.length).toBe(before + 1);
    });

    it("renameItem renames a folder", async () => {
        await getState().fetchFiles(null);
        const folder = getState().folders[0];
        getState().renameItem(folder.id, "folder", "Renamed Folder");
        expect(getState().folders.find((f) => f.id === folder.id)?.name).toBe("Renamed Folder");
    });
});

// ============================================================================
// CRUD — Files
// ============================================================================

describe("FileManagerStore — files", () => {
    it("renameItem renames a file", async () => {
        await getState().fetchFiles(null);
        const file = getState().files[0];
        getState().renameItem(file.id, "file", "renamed.pdf");
        expect(getState().files.find((f) => f.id === file.id)?.name).toBe("renamed.pdf");
    });

    it("deleteItem moves file to trash", async () => {
        await getState().fetchFiles(null);
        const file = getState().files[0];
        const id = file.id;
        getState().deleteItem(id, "file");
        expect(getState().files.find((f) => f.id === id)).toBeUndefined();
        expect(getState().trash.find((f) => f.id === id)).toBeDefined();
    });

    it("deleteItem removes folder", async () => {
        await getState().fetchFiles(null);
        const folder = getState().folders[0];
        getState().deleteItem(folder.id, "folder");
        expect(getState().folders.find((f) => f.id === folder.id)).toBeUndefined();
    });

    it("toggleFavorite toggles file favorite", async () => {
        await getState().fetchFiles(null);
        const file = getState().files[0];
        const wasFav = file.isFavorite;
        getState().toggleFavorite(file.id);
        expect(getState().files.find((f) => f.id === file.id)?.isFavorite).toBe(!wasFav);
    });
});

// ============================================================================
// TRASH
// ============================================================================

describe("FileManagerStore — trash", () => {
    it("restoreItem removes from trash", async () => {
        await getState().fetchTrash();
        const item = getState().trash[0];
        getState().restoreItem(item.id);
        expect(getState().trash.find((f) => f.id === item.id)).toBeUndefined();
    });

    it("emptyTrash clears all trash", async () => {
        await getState().fetchTrash();
        expect(getState().trash.length).toBeGreaterThan(0);
        getState().emptyTrash();
        expect(getState().trash).toHaveLength(0);
    });
});

// ============================================================================
// SHARING
// ============================================================================

describe("FileManagerStore — sharing", () => {
    it("shareFile adds shared entry", async () => {
        await getState().fetchFiles(null);
        const file = getState().files[0];
        getState().shareFile({
            fileId: file.id,
            targetUserId: "user-123",
            permission: "view",
        });
        const f = getState().files.find((fi) => fi.id === file.id);
        expect(f?.isShared).toBe(true);
        expect(f?.sharedWith).toContain("user-123");
    });

    it("revokeShare removes userId from sharedWith", async () => {
        await getState().fetchFiles(null);
        const file = getState().files[0];
        getState().shareFile({ fileId: file.id, targetUserId: "user-abc", permission: "edit" });
        getState().revokeShare(file.id, "user-abc");
        const updated = getState().files.find((fi) => fi.id === file.id);
        expect(updated?.sharedWith).not.toContain("user-abc");
    });
});

// ============================================================================
// SYNC
// ============================================================================

describe("FileManagerStore — sync", () => {
    it("updateSyncSettings updates settings", () => {
        getState().updateSyncSettings({ autoSync: false, syncFrequencyMinutes: 60 });
        expect(getState().syncSettings.autoSync).toBe(false);
        expect(getState().syncSettings.syncFrequencyMinutes).toBe(60);
    });

    it("triggerSync sets device to syncing then synced", async () => {
        await getState().fetchDevices();
        const device = getState().devices[0];
        jest.useFakeTimers();
        getState().triggerSync(device.id);
        expect(getState().devices.find((d) => d.id === device.id)?.status).toBe("syncing");
        jest.advanceTimersByTime(2500);
        expect(getState().devices.find((d) => d.id === device.id)?.status).toBe("synced");
        jest.useRealTimers();
    });
});

// ============================================================================
// UPLOADS
// ============================================================================

describe("FileManagerStore — uploads", () => {
    it("addUpload creates an upload item", () => {
        getState().addUpload("test.pdf", "document", 1000, null);
        expect(getState().uploads).toHaveLength(1);
        expect(getState().uploads[0].fileName).toBe("test.pdf");
        expect(getState().uploads[0].status).toBe("queued");
    });

    it("removeUpload removes an upload", () => {
        getState().addUpload("a.png", "image", 500, null);
        const id = getState().uploads[0].id;
        getState().removeUpload(id);
        expect(getState().uploads).toHaveLength(0);
    });

    it("clearCompletedUploads removes completed only", () => {
        getState().addUpload("a.png", "image", 500, null);
        getState().addUpload("b.png", "image", 500, null);
        // Manually set first to completed
        const id = getState().uploads[0].id;
        useFileManagerStore.setState((s) => ({
            uploads: s.uploads.map((u) => (u.id === id ? { ...u, status: "completed" as const } : u)),
        }));
        getState().clearCompletedUploads();
        expect(getState().uploads).toHaveLength(1);
    });
});
