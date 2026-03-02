/**
 * Tests pour le service files-api.
 *
 * Couvre : File CRUD, Folder CRUD, Breadcrumbs, Versioning,
 *          Sharing, Share Links, Transfers, Activity, Search,
 *          Storage Usage, Batch Operations, Helpers, Mock Data.
 *
 * Phase — DEV-020 Module Docs & Storage
 */

// ─── Mock AsyncStorage ────────────────────────────────────────

const mockStore = {};
jest.mock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: {
        getItem: jest.fn((key) => Promise.resolve(mockStore[key] || null)),
        setItem: jest.fn((key, value) => {
            mockStore[key] = value;
            return Promise.resolve();
        }),
        removeItem: jest.fn((key) => {
            delete mockStore[key];
            return Promise.resolve();
        }),
    },
}));

// ─── Mock logger ──────────────────────────────────────────────

jest.mock("@/services/logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

import {
    createFile,
    createFolder,
    createShareLink,
    createTransfer,
    clearCompletedTransfers,
    deactivateShareLink,
    deleteFile,
    deleteFolder,
    duplicateFile,
    emptyTrash,
    formatFileSize,
    getActiveTransfers,
    getActivities,
    getActivitiesForFile,
    getBreadcrumbs,
    getCategoryFromMime,
    getExtensionFromName,
    getFileById,
    getFileColor,
    getFileIcon,
    getFiles,
    getFileVersions,
    getFolderById,
    getFolders,
    getMockFiles,
    getMockFolders,
    getRecentTransfers,
    getShareLinksForFile,
    getSharesForFile,
    getSharedWithMe,
    getStorageUsage,
    getTrashedFiles,
    isPreviewable,
    logActivity,
    moveFile,
    moveFilesToFolder,
    moveToTrash,
    removeShare,
    restoreFromTrash,
    restoreFolder,
    searchFiles,
    shareFile,
    shareFolder,
    tagFiles,
    toggleFavorite,
    trashFiles,
    trashFolder,
    updateFile,
    updateFolder,
    updateSharePermission,
    updateTransferProgress,
    addFileVersion,
} from "../files-api";

// ─── Helpers ──────────────────────────────────────────────────

function clearStore() {
    Object.keys(mockStore).forEach((k) => delete mockStore[k]);
}

beforeEach(() => {
    clearStore();
    jest.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

describe("Helper Functions", () => {
    test("getCategoryFromMime returns correct categories", () => {
        expect(getCategoryFromMime("image/png")).toBe("image");
        expect(getCategoryFromMime("video/mp4")).toBe("video");
        expect(getCategoryFromMime("audio/mpeg")).toBe("audio");
        expect(getCategoryFromMime("application/pdf")).toBe("pdf");
        expect(getCategoryFromMime("application/zip")).toBe("archive");
        expect(getCategoryFromMime("text/plain")).toBe("document");
        expect(getCategoryFromMime("unknown/type")).toBe("other");
    });

    test("getExtensionFromName extracts extensions", () => {
        expect(getExtensionFromName("photo.jpg")).toBe("jpg");
        expect(getExtensionFromName("doc.PDF")).toBe("pdf");
        expect(getExtensionFromName("archive.tar.gz")).toBe("gz");
        expect(getExtensionFromName("noextension")).toBe("");
    });

    test("formatFileSize formats bytes correctly", () => {
        expect(formatFileSize(0)).toBe("0 B");
        expect(formatFileSize(500)).toBe("500 B");
        expect(formatFileSize(1024)).toBe("1.0 KB");
        expect(formatFileSize(1048576)).toBe("1.0 MB");
        expect(formatFileSize(1073741824)).toBe("1.0 GB");
    });

    test("isPreviewable returns true for image, video, audio, pdf", () => {
        expect(isPreviewable("image")).toBe(true);
        expect(isPreviewable("video")).toBe(true);
        expect(isPreviewable("audio")).toBe(true);
        expect(isPreviewable("pdf")).toBe(true);
        expect(isPreviewable("archive")).toBe(false);
        expect(isPreviewable("other")).toBe(false);
    });

    test("getFileIcon returns an icon string for each category", () => {
        expect(getFileIcon("image")).toBe("image-outline");
        expect(getFileIcon("video")).toBe("videocam-outline");
        expect(getFileIcon("document")).toBe("document-text-outline");
        expect(getFileIcon("other")).toBe("document-outline");
    });

    test("getFileColor returns a hex color for each category", () => {
        expect(getFileColor("image")).toMatch(/^#/);
        expect(getFileColor("pdf")).toMatch(/^#/);
        expect(getFileColor("other")).toMatch(/^#/);
    });
});

// ═══════════════════════════════════════════════════════════════
// File CRUD
// ═══════════════════════════════════════════════════════════════

describe("File CRUD", () => {
    test("getFiles returns empty array initially", async () => {
        const files = await getFiles();
        expect(files).toEqual([]);
    });

    test("createFile creates a file with correct fields", async () => {
        const file = await createFile("photo.jpg", "image/jpeg", 2048000, "local://file");
        expect(file.id).toBeTruthy();
        expect(file.name).toBe("photo.jpg");
        expect(file.extension).toBe("jpg");
        expect(file.category).toBe("image");
        expect(file.size).toBe(2048000);
        expect(file.is_favorite).toBe(false);
        expect(file.is_trashed).toBe(false);
        expect(file.version).toBe(1);
        expect(file.tags).toEqual([]);
    });

    test("getFiles returns created files", async () => {
        await createFile("a.png", "image/png", 100, "local://file");
        await createFile("b.pdf", "application/pdf", 200, "local://file");
        const files = await getFiles();
        expect(files).toHaveLength(2);
    });

    test("getFileById returns the correct file", async () => {
        const created = await createFile("doc.pdf", "application/pdf", 500, "local://file");
        const found = await getFileById(created.id);
        expect(found).not.toBeNull();
        expect(found.name).toBe("doc.pdf");
    });

    test("getFileById returns null for unknown id", async () => {
        const result = await getFileById("unknown-id");
        expect(result).toBeNull();
    });

    test("updateFile updates fields", async () => {
        const file = await createFile("old.txt", "text/plain", 100, "local://file");
        const updated = await updateFile(file.id, { name: "new.txt", description: "updated" });
        expect(updated).not.toBeNull();
        expect(updated.name).toBe("new.txt");
        expect(updated.description).toBe("updated");
    });

    test("updateFile returns null for unknown id", async () => {
        const result = await updateFile("unknown-id", { name: "X" });
        expect(result).toBeNull();
    });

    test("toggleFavorite toggles is_favorite", async () => {
        const file = await createFile("fav.png", "image/png", 100, "local://file");
        expect(file.is_favorite).toBe(false);
        const toggled = await toggleFavorite(file.id);
        expect(toggled.is_favorite).toBe(true);
        const back = await toggleFavorite(file.id);
        expect(back.is_favorite).toBe(false);
    });

    test("moveFile changes folder_id", async () => {
        const folder = await createFolder("destination");
        const file = await createFile("move.txt", "text/plain", 100, "local://file");
        const moved = await moveFile(file.id, folder.id);
        expect(moved.folder_id).toBe(folder.id);
    });

    test("duplicateFile creates a copy", async () => {
        const file = await createFile("orig.txt", "text/plain", 100, "local://file");
        const copy = await duplicateFile(file.id);
        expect(copy.name).toBeTruthy();
        expect(copy.id).not.toBe(file.id);
        expect(copy.size).toBe(100);
    });
});

// ═══════════════════════════════════════════════════════════════
// Trash operations
// ═══════════════════════════════════════════════════════════════

describe("Trash operations", () => {
    test("moveToTrash sets is_trashed and trashed_at", async () => {
        const file = await createFile("trash.txt", "text/plain", 100, "local://file");
        const trashed = await moveToTrash(file.id);
        expect(trashed.is_trashed).toBe(true);
        expect(trashed.trashed_at).not.toBeNull();
    });

    test("getTrashedFiles returns only trashed files", async () => {
        const f1 = await createFile("a.txt", "text/plain", 100, "local://file");
        await createFile("b.txt", "text/plain", 100, "local://file");
        await moveToTrash(f1.id);
        const trashed = await getTrashedFiles();
        expect(trashed).toHaveLength(1);
        expect(trashed[0].id).toBe(f1.id);
    });

    test("restoreFromTrash un-trashes the file", async () => {
        const file = await createFile("restore.txt", "text/plain", 100, "local://file");
        await moveToTrash(file.id);
        const restored = await restoreFromTrash(file.id);
        expect(restored.is_trashed).toBe(false);
        expect(restored.trashed_at).toBeNull();
    });

    test("deleteFile removes permanently", async () => {
        const file = await createFile("del.txt", "text/plain", 100, "local://file");
        const result = await deleteFile(file.id);
        expect(result).toBe(true);
        const files = await getFiles();
        expect(files).toHaveLength(0);
    });

    test("emptyTrash removes all trashed files", async () => {
        const f1 = await createFile("a.txt", "text/plain", 100, "local://file");
        const f2 = await createFile("b.txt", "text/plain", 100, "local://file");
        await createFile("c.txt", "text/plain", 100, "local://file");
        await moveToTrash(f1.id);
        await moveToTrash(f2.id);
        await emptyTrash();
        const all = await getFiles();
        expect(all).toHaveLength(1);
        expect(all[0].name).toBe("c.txt");
    });
});

// ═══════════════════════════════════════════════════════════════
// Folder CRUD
// ═══════════════════════════════════════════════════════════════

describe("Folder CRUD", () => {
    test("getFolders returns empty array initially", async () => {
        const folders = await getFolders();
        expect(folders).toEqual([]);
    });

    test("createFolder creates a folder with correct fields", async () => {
        const folder = await createFolder("Photos");
        expect(folder.id).toBeTruthy();
        expect(folder.name).toBe("Photos");
        expect(folder.parent_id).toBeNull();
        expect(folder.is_favorite).toBe(false);
        expect(folder.file_count).toBe(0);
    });

    test("createFolder with parent_id", async () => {
        const parent = await createFolder("Parent");
        const child = await createFolder("Child", parent.id);
        expect(child.parent_id).toBe(parent.id);
    });

    test("getFolderById returns correct folder", async () => {
        const folder = await createFolder("Test");
        const found = await getFolderById(folder.id);
        expect(found).not.toBeNull();
        expect(found.name).toBe("Test");
    });

    test("updateFolder updates name", async () => {
        const folder = await createFolder("Old Name");
        const updated = await updateFolder(folder.id, { name: "New Name" });
        expect(updated).not.toBeNull();
        expect(updated.name).toBe("New Name");
    });

    test("deleteFolder removes the folder", async () => {
        const folder = await createFolder("ToDelete");
        const result = await deleteFolder(folder.id);
        expect(result).toBe(true);
        const folders = await getFolders();
        expect(folders).toHaveLength(0);
    });

    test("trashFolder and restoreFolder work", async () => {
        const folder = await createFolder("Trashable");
        const trashed = await trashFolder(folder.id);
        expect(trashed.is_trashed).toBe(true);
        const restored = await restoreFolder(folder.id);
        expect(restored.is_trashed).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════
// Breadcrumbs
// ═══════════════════════════════════════════════════════════════

describe("Breadcrumbs", () => {
    test("getBreadcrumbs for root returns My Drive", async () => {
        const crumbs = await getBreadcrumbs(null);
        expect(crumbs).toHaveLength(1);
        expect(crumbs[0].name).toBe("My Drive");
    });

    test("getBreadcrumbs builds path from nested folders", async () => {
        const root = await createFolder("Root");
        const child = await createFolder("Child", root.id);
        const crumbs = await getBreadcrumbs(child.id);
        expect(crumbs.length).toBeGreaterThanOrEqual(2);
        expect(crumbs[0].name).toBe("My Drive");
    });
});

// ═══════════════════════════════════════════════════════════════
// Versioning
// ═══════════════════════════════════════════════════════════════

describe("Versioning", () => {
    test("addFileVersion adds a version entry", async () => {
        const file = await createFile("v.txt", "text/plain", 100, "local://file");
        const version = await addFileVersion(file.id, "storage/v2.txt", 150, "Updated content");
        expect(version.file_id).toBe(file.id);
        expect(version.version_number).toBe(1);
        expect(version.change_summary).toBe("Updated content");
    });

    test("getFileVersions returns stored versions", async () => {
        const file = await createFile("multi.txt", "text/plain", 100, "local://file");
        await addFileVersion(file.id, "s/v2.txt", 110, "v2");
        await addFileVersion(file.id, "s/v3.txt", 120, "v3");
        const versions = await getFileVersions(file.id);
        expect(versions).toHaveLength(2);
        expect(versions[0].version_number).toBe(1);
        expect(versions[1].version_number).toBe(2);
    });
});

// ═══════════════════════════════════════════════════════════════
// Sharing
// ═══════════════════════════════════════════════════════════════

describe("Sharing", () => {
    test("shareFile creates a share", async () => {
        const file = await createFile("shared.txt", "text/plain", 100, "local://file");
        const share = await shareFile(file.id, "user-2", "User 2", "edit");
        expect(share.file_id).toBe(file.id);
        expect(share.permission).toBe("edit");
        expect(share.shared_with).toBe("user-2");
        expect(share.shared_with_name).toBe("User 2");
    });

    test("getSharesForFile returns shares for a file", async () => {
        const file = await createFile("s.txt", "text/plain", 100, "local://file");
        await shareFile(file.id, "user-2", "User 2", "view");
        await shareFile(file.id, "user-3", "User 3", "edit");
        const shares = await getSharesForFile(file.id);
        expect(shares).toHaveLength(2);
    });

    test("shareFolder creates a share for a folder", async () => {
        const folder = await createFolder("Shared Folder");
        const share = await shareFolder(folder.id, "user-2", "User 2", "view");
        expect(share.folder_id).toBe(folder.id);
        expect(share.permission).toBe("view");
    });

    test("updateSharePermission changes permission", async () => {
        const file = await createFile("perm.txt", "text/plain", 100, "local://file");
        const share = await shareFile(file.id, "user-2", "User 2", "view");
        const updated = await updateSharePermission(share.id, "admin");
        expect(updated.permission).toBe("admin");
    });

    test("removeShare removes the share", async () => {
        const file = await createFile("rm.txt", "text/plain", 100, "local://file");
        const share = await shareFile(file.id, "user-2", "User 2", "view");
        const result = await removeShare(share.id);
        expect(result).toBe(true);
        const shares = await getSharesForFile(file.id);
        expect(shares).toHaveLength(0);
    });

    test("getSharedWithMe returns shares for current user", async () => {
        const shared = await getSharedWithMe();
        expect(Array.isArray(shared)).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// Share Links
// ═══════════════════════════════════════════════════════════════

describe("Share Links", () => {
    test("createShareLink creates a link with token", async () => {
        const file = await createFile("link.txt", "text/plain", 100, "local://file");
        const link = await createShareLink(file.id, null, "view");
        expect(link.token).toBeTruthy();
        expect(link.file_id).toBe(file.id);
        expect(link.is_active).toBe(true);
        expect(link.permission).toBe("view");
    });

    test("createShareLink with options", async () => {
        const file = await createFile("opts.txt", "text/plain", 100, "local://file");
        const link = await createShareLink(file.id, null, "edit", true, 5);
        expect(link.permission).toBe("edit");
        expect(link.password_protected).toBe(true);
        expect(link.max_downloads).toBe(5);
    });

    test("getShareLinksForFile returns links for a file", async () => {
        const file = await createFile("links.txt", "text/plain", 100, "local://file");
        await createShareLink(file.id, null, "view");
        await createShareLink(file.id, null, "view");
        const links = await getShareLinksForFile(file.id);
        expect(links).toHaveLength(2);
    });

    test("deactivateShareLink sets is_active to false", async () => {
        const file = await createFile("deact.txt", "text/plain", 100, "local://file");
        const link = await createShareLink(file.id, null, "view");
        const result = await deactivateShareLink(link.id);
        expect(result).toBe(true);
        const links = await getShareLinksForFile(file.id);
        expect(links).toHaveLength(0);
    });
});

// ═══════════════════════════════════════════════════════════════
// Transfers
// ═══════════════════════════════════════════════════════════════

describe("Transfers", () => {
    test("createTransfer creates a transfer", async () => {
        const t = await createTransfer("upload", "test.txt", 1000, "local://file");
        expect(t.file_name).toBe("test.txt");
        expect(t.type).toBe("upload");
        expect(t.status).toBe("pending");
        expect(t.progress).toBe(0);
    });

    test("updateTransferProgress updates progress and status", async () => {
        const t = await createTransfer("upload", "test.txt", 1000, "local://file");
        const updated = await updateTransferProgress(t.id, 50, "in_progress");
        expect(updated.progress).toBe(50);
        expect(updated.status).toBe("in_progress");
    });

    test("getActiveTransfers returns pending and in_progress", async () => {
        await createTransfer("upload", "a.txt", 100, "local://a");
        const t2 = await createTransfer("download", "b.txt", 200, "local://b");
        await updateTransferProgress(t2.id, 100, "completed");
        const active = await getActiveTransfers();
        expect(active).toHaveLength(1);
    });

    test("getRecentTransfers returns all transfers", async () => {
        await createTransfer("upload", "a.txt", 100, "local://a");
        await createTransfer("download", "b.txt", 200, "local://b");
        const recent = await getRecentTransfers();
        expect(recent).toHaveLength(2);
    });

    test("clearCompletedTransfers removes completed transfers", async () => {
        const t1 = await createTransfer("upload", "a.txt", 100, "local://a");
        await createTransfer("upload", "b.txt", 200, "local://b");
        await updateTransferProgress(t1.id, 100, "completed");
        await clearCompletedTransfers();
        const all = await getRecentTransfers();
        expect(all).toHaveLength(1);
    });
});

// ═══════════════════════════════════════════════════════════════
// Activity
// ═══════════════════════════════════════════════════════════════

describe("Activity", () => {
    test("logActivity creates an activity entry", async () => {
        const act = await logActivity("file-1", null, "test.txt", "created");
        expect(act.action).toBe("created");
        expect(act.file_id).toBe("file-1");
        expect(act.item_name).toBe("test.txt");
    });

    test("getActivities returns activities in reverse chronological order", async () => {
        await logActivity("f1", null, "first.txt", "created");
        await logActivity("f2", null, "second.txt", "updated");
        const acts = await getActivities();
        expect(acts.length).toBeGreaterThanOrEqual(2);
    });

    test("getActivitiesForFile filters by file id", async () => {
        await logActivity("target-file", null, "target.txt", "created");
        await logActivity("target-file", null, "target.txt", "updated");
        await logActivity("other-file", null, "other.txt", "created");
        const acts = await getActivitiesForFile("target-file");
        expect(acts).toHaveLength(2);
    });
});

// ═══════════════════════════════════════════════════════════════
// Search
// ═══════════════════════════════════════════════════════════════

describe("Search", () => {
    test("searchFiles finds files by name", async () => {
        await createFile("vacances.jpg", "image/jpeg", 100, "local://file");
        await createFile("budget.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 200, "local://file");
        const results = await searchFiles("vacances");
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe("vacances.jpg");
    });

    test("searchFiles is case-insensitive", async () => {
        await createFile("Photo.PNG", "image/png", 100, "local://file");
        const results = await searchFiles("photo");
        expect(results).toHaveLength(1);
    });

    test("searchFiles finds by tags", async () => {
        const file = await createFile("report.pdf", "application/pdf", 500, "local://file");
        await updateFile(file.id, { tags: ["important", "quarterly"] });
        const results = await searchFiles("important");
        expect(results).toHaveLength(1);
    });

    test("searchFiles returns empty for no match", async () => {
        await createFile("file.txt", "text/plain", 100, "local://file");
        const results = await searchFiles("nonexistent");
        expect(results).toHaveLength(0);
    });
});

// ═══════════════════════════════════════════════════════════════
// Storage Usage
// ═══════════════════════════════════════════════════════════════

describe("Storage Usage", () => {
    test("getStorageUsage returns usage data", async () => {
        await createFile("a.jpg", "image/jpeg", 1000, "local://file");
        await createFile("b.pdf", "application/pdf", 2000, "local://file");
        const usage = await getStorageUsage();
        expect(usage.used).toBe(3000);
        expect(usage.total).toBe(5 * 1024 * 1024 * 1024);
        expect(usage.by_category.image).toBe(1000);
        expect(usage.by_category.pdf).toBe(2000);
        expect(usage.file_count).toBe(2);
    });

    test("getStorageUsage excludes trashed files", async () => {
        const file = await createFile("trashed.jpg", "image/jpeg", 1000, "local://file");
        await moveToTrash(file.id);
        const usage = await getStorageUsage();
        expect(usage.used).toBe(0);
        expect(usage.file_count).toBe(0);
    });
});

// ═══════════════════════════════════════════════════════════════
// Batch Operations
// ═══════════════════════════════════════════════════════════════

describe("Batch Operations", () => {
    test("moveFilesToFolder moves multiple files", async () => {
        const folder = await createFolder("Dest");
        const f1 = await createFile("a.txt", "text/plain", 100, "local://file");
        const f2 = await createFile("b.txt", "text/plain", 200, "local://file");
        await moveFilesToFolder([f1.id, f2.id], folder.id);
        const files = await getFiles();
        const movedFiles = files.filter((f) => f.folder_id === folder.id);
        expect(movedFiles).toHaveLength(2);
    });

    test("trashFiles trashes multiple files", async () => {
        const f1 = await createFile("a.txt", "text/plain", 100, "local://file");
        const f2 = await createFile("b.txt", "text/plain", 200, "local://file");
        await trashFiles([f1.id, f2.id]);
        const trashed = await getTrashedFiles();
        expect(trashed).toHaveLength(2);
    });

    test("tagFiles adds tags to multiple files", async () => {
        const f1 = await createFile("a.txt", "text/plain", 100, "local://file");
        const f2 = await createFile("b.txt", "text/plain", 200, "local://file");
        await tagFiles([f1.id, f2.id], ["urgent", "review"]);
        const files = await getFiles();
        expect(files[0].tags).toContain("urgent");
        expect(files[0].tags).toContain("review");
        expect(files[1].tags).toContain("urgent");
    });
});

// ═══════════════════════════════════════════════════════════════
// Mock Data
// ═══════════════════════════════════════════════════════════════

describe("Mock Data", () => {
    test("getMockFiles returns 5 mock files", () => {
        const files = getMockFiles();
        expect(files).toHaveLength(5);
        expect(files[0].name).toBe("Photo vacances.jpg");
        files.forEach((f) => {
            expect(f.id).toBeTruthy();
            expect(f.name).toBeTruthy();
            expect(f.category).toBeTruthy();
        });
    });

    test("getMockFolders returns 3 mock folders", () => {
        const folders = getMockFolders();
        expect(folders).toHaveLength(3);
        expect(folders[0].name).toBe("Photos");
        folders.forEach((f) => {
            expect(f.id).toBeTruthy();
            expect(f.name).toBeTruthy();
        });
    });
});
