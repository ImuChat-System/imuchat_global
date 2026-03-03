/**
 * File Manager & Storage Store (Zustand) — DEV-037
 *
 * Manages the personal file drive:
 *  - File/folder browsing with breadcrumbs
 *  - Storage quota & breakdown
 *  - Shared files (with/by me)
 *  - Favorites / starred
 *  - Trash / recycle bin
 *  - Multi-device sync settings & status
 *  - Upload queue
 *
 * Persisted via AsyncStorage (sortBy, sortOrder, viewMode, syncSettings).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createLogger } from "@/services/logger";
import type {
    FileItem,
    FileManagerState,
    FileType,
    FolderItem,
    ShareRequest,
    SharedFile,
    StorageBreakdown,
    StorageQuota,
    SyncDevice,
    SyncSettings,
    UploadItem,
} from "@/types/file-manager";

const logger = createLogger("FileManagerStore");

// ============================================================================
// HELPERS
// ============================================================================

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack: number): string {
    const d = new Date();
    d.setDate(d.getDate() - randomInt(0, daysBack));
    return d.toISOString();
}

const FILE_NAMES: Record<FileType, string[]> = {
    image: ["photo_vacances.jpg", "screenshot_2026.png", "avatar.webp", "banner.jpg", "meme_chat.gif"],
    video: ["reunion_equipe.mp4", "demo_app.mov", "clips_voyage.mp4", "tuto_code.webm"],
    audio: ["podcast_ep12.mp3", "note_vocale.m4a", "musique_ambient.ogg", "interview.wav"],
    document: ["rapport_Q1.pdf", "notes_reunion.docx", "budget_2026.xlsx", "presentation.pptx", "readme.md"],
    archive: ["backup_photos.zip", "projet_v2.tar.gz", "assets_design.rar"],
    other: ["config.json", "database.sqlite", "data_export.csv"],
};

function generateMockFiles(folderId: string | null, count: number): FileItem[] {
    const types: FileType[] = ["image", "video", "audio", "document", "archive", "other"];
    return Array.from({ length: count }, (_, i) => {
        const type = types[i % types.length];
        const names = FILE_NAMES[type];
        return {
            id: generateId(),
            name: names[i % names.length],
            type,
            mimeType: `application/${type}`,
            sizeBytes: randomInt(1024, 50 * 1024 * 1024),
            parentFolderId: folderId,
            createdAt: randomDate(90),
            updatedAt: randomDate(30),
            url: `https://cdn.imuchat.app/files/${generateId()}`,
            thumbnailUrl: type === "image" ? `https://cdn.imuchat.app/thumbs/${generateId()}` : undefined,
            isFavorite: Math.random() > 0.7,
            isShared: Math.random() > 0.6,
            sharedWith: Math.random() > 0.6 ? ["user-1", "user-2"] : [],
            deviceOrigin: ["iPhone de Nathan", "MacBook Pro", "Web App"][randomInt(0, 2)],
        };
    });
}

function generateMockFolders(parentId: string | null): FolderItem[] {
    const names = ["Photos", "Documents", "Musique", "Projets", "Téléchargements"];
    const colors = ["#4A90D9", "#E67E22", "#2ECC71", "#9B59B6", "#E74C3C"];
    return names.map((name, i) => ({
        id: `folder-${i}-${generateId()}`,
        name,
        parentFolderId: parentId,
        createdAt: randomDate(180),
        updatedAt: randomDate(30),
        itemCount: randomInt(3, 42),
        sizeBytes: randomInt(10 * 1024 * 1024, 500 * 1024 * 1024),
        color: colors[i],
    }));
}

function generateMockSharedFiles(): SharedFile[] {
    const files = generateMockFiles(null, 5);
    const names = ["Alice", "Bob", "Charlie", "Diana", "Eve"];
    return files.map((file, i) => ({
        file,
        sharedBy: `user-${i + 10}`,
        sharedByName: names[i % names.length],
        sharedAt: randomDate(30),
        permission: (["view", "edit", "admin"] as const)[i % 3],
    }));
}

function generateMockDevices(): SyncDevice[] {
    return [
        {
            id: "dev-1",
            name: "iPhone de Nathan",
            type: "mobile",
            lastSyncAt: new Date().toISOString(),
            status: "synced",
            itemsSynced: 1234,
            itemsPending: 0,
        },
        {
            id: "dev-2",
            name: "MacBook Pro",
            type: "desktop",
            lastSyncAt: randomDate(1),
            status: "synced",
            itemsSynced: 1180,
            itemsPending: 54,
        },
        {
            id: "dev-3",
            name: "Web App",
            type: "web",
            lastSyncAt: randomDate(3),
            status: "pending",
            itemsSynced: 900,
            itemsPending: 334,
        },
    ];
}

function generateQuota(): StorageQuota {
    const used = randomInt(1, 4) * 1024 * 1024 * 1024; // 1-4 GB
    const total = 5 * 1024 * 1024 * 1024; // 5 GB
    return { usedBytes: used, totalBytes: total, usedPercent: Math.round((used / total) * 100) };
}

function generateBreakdown(): StorageBreakdown {
    return {
        images: randomInt(200, 800) * 1024 * 1024,
        videos: randomInt(500, 2000) * 1024 * 1024,
        audio: randomInt(50, 300) * 1024 * 1024,
        documents: randomInt(20, 200) * 1024 * 1024,
        archives: randomInt(10, 100) * 1024 * 1024,
        other: randomInt(5, 50) * 1024 * 1024,
    };
}

const defaultSyncSettings: SyncSettings = {
    autoSync: true,
    syncOnWifiOnly: true,
    syncPhotos: true,
    syncVideos: false,
    syncDocuments: true,
    syncFrequencyMinutes: 30,
};

// ============================================================================
// STORE
// ============================================================================

export const useFileManagerStore = create<FileManagerState>()(
    persist(
        (set, get) => ({
            // Navigation
            currentFolderId: null,
            breadcrumbs: [{ id: null, name: "Mon Drive" }],

            // Content
            files: [],
            folders: [],
            sharedFiles: [],
            trash: [],
            favorites: [],

            // Storage
            quota: { usedBytes: 0, totalBytes: 5 * 1024 * 1024 * 1024, usedPercent: 0 },
            breakdown: { images: 0, videos: 0, audio: 0, documents: 0, archives: 0, other: 0 },

            // Sync
            devices: [],
            syncSettings: defaultSyncSettings,

            // Upload
            uploads: [],

            // UI
            sortBy: "date",
            sortOrder: "desc",
            searchQuery: "",
            loading: false,
            viewMode: "list",

            // ── Navigation ─────────────────────────────
            setCurrentFolder: (folderId: string | null) => {
                const state = get();
                if (folderId === null) {
                    set({ currentFolderId: null, breadcrumbs: [{ id: null, name: "Mon Drive" }] });
                } else {
                    const folder = state.folders.find((f) => f.id === folderId);
                    const name = folder?.name ?? "Dossier";
                    const existing = state.breadcrumbs.findIndex((b) => b.id === folderId);
                    if (existing >= 0) {
                        set({ currentFolderId: folderId, breadcrumbs: state.breadcrumbs.slice(0, existing + 1) });
                    } else {
                        set({ currentFolderId: folderId, breadcrumbs: [...state.breadcrumbs, { id: folderId, name }] });
                    }
                }
                logger.info(`Navigated to folder: ${folderId ?? "root"}`);
            },

            // ── Sort / Search / View ───────────────────
            setSortBy: (sort) => {
                set({ sortBy: sort });
                logger.info(`Sort set to: ${sort}`);
            },
            setSortOrder: (order) => set({ sortOrder: order }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            setViewMode: (mode) => {
                set({ viewMode: mode });
                logger.info(`View mode: ${mode}`);
            },
            setLoading: (loading) => set({ loading }),

            // ── Fetch ──────────────────────────────────
            fetchFiles: async (folderId) => {
                set({ loading: true });
                await new Promise((r) => setTimeout(r, 300));
                const targetFolder = folderId !== undefined ? folderId : get().currentFolderId;
                const files = generateMockFiles(targetFolder ?? null, randomInt(6, 15));
                const folders = targetFolder === null ? generateMockFolders(null) : [];
                set({ files, folders, loading: false });
                logger.info(`Fetched ${files.length} files, ${folders.length} folders`);
            },

            fetchSharedFiles: async () => {
                set({ loading: true });
                await new Promise((r) => setTimeout(r, 200));
                set({ sharedFiles: generateMockSharedFiles(), loading: false });
                logger.info("Fetched shared files");
            },

            fetchTrash: async () => {
                set({ loading: true });
                await new Promise((r) => setTimeout(r, 200));
                const trashFiles = generateMockFiles(null, randomInt(3, 8)).map((f) => ({
                    ...f,
                    deletedAt: randomDate(14),
                }));
                set({ trash: trashFiles, loading: false });
                logger.info(`Fetched ${trashFiles.length} trash items`);
            },

            fetchFavorites: async () => {
                set({ loading: true });
                await new Promise((r) => setTimeout(r, 200));
                const favs = generateMockFiles(null, randomInt(3, 10)).map((f) => ({ ...f, isFavorite: true }));
                set({ favorites: favs, loading: false });
                logger.info(`Fetched ${favs.length} favorites`);
            },

            fetchQuota: async () => {
                await new Promise((r) => setTimeout(r, 100));
                set({ quota: generateQuota(), breakdown: generateBreakdown() });
                logger.info("Fetched storage quota");
            },

            fetchDevices: async () => {
                await new Promise((r) => setTimeout(r, 200));
                set({ devices: generateMockDevices() });
                logger.info("Fetched sync devices");
            },

            // ── CRUD ───────────────────────────────────
            createFolder: async (name, parentId) => {
                const folder: FolderItem = {
                    id: generateId(),
                    name,
                    parentFolderId: parentId ?? get().currentFolderId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    itemCount: 0,
                    sizeBytes: 0,
                };
                set((s) => ({ folders: [folder, ...s.folders] }));
                logger.info(`Created folder: ${name}`);
                return folder;
            },

            renameItem: (itemId, kind, newName) => {
                if (kind === "file") {
                    set((s) => ({
                        files: s.files.map((f) => (f.id === itemId ? { ...f, name: newName, updatedAt: new Date().toISOString() } : f)),
                    }));
                } else {
                    set((s) => ({
                        folders: s.folders.map((f) => (f.id === itemId ? { ...f, name: newName, updatedAt: new Date().toISOString() } : f)),
                    }));
                }
                logger.info(`Renamed ${kind} ${itemId} to ${newName}`);
            },

            deleteItem: (itemId, kind) => {
                if (kind === "file") {
                    const file = get().files.find((f) => f.id === itemId);
                    if (file) {
                        set((s) => ({
                            files: s.files.filter((f) => f.id !== itemId),
                            trash: [{ ...file, deletedAt: new Date().toISOString() }, ...s.trash],
                        }));
                    }
                } else {
                    set((s) => ({ folders: s.folders.filter((f) => f.id !== itemId) }));
                }
                logger.info(`Deleted ${kind} ${itemId}`);
            },

            restoreItem: (fileId) => {
                const file = get().trash.find((f) => f.id === fileId);
                if (file) {
                    const { deletedAt: _, ...restored } = file;
                    set((s) => ({
                        trash: s.trash.filter((f) => f.id !== fileId),
                        files: [restored, ...s.files],
                    }));
                    logger.info(`Restored file: ${fileId}`);
                }
            },

            emptyTrash: () => {
                const count = get().trash.length;
                set({ trash: [] });
                logger.info(`Emptied trash (${count} items)`);
            },

            toggleFavorite: (fileId) => {
                set((s) => {
                    const file = s.files.find((f) => f.id === fileId);
                    const wasFav = file?.isFavorite ?? false;
                    return {
                        files: s.files.map((f) => (f.id === fileId ? { ...f, isFavorite: !f.isFavorite } : f)),
                        favorites: wasFav
                            ? s.favorites.filter((f) => f.id !== fileId)
                            : file
                                ? [...s.favorites, { ...file, isFavorite: true }]
                                : s.favorites,
                    };
                });
                logger.info(`Toggled favorite: ${fileId}`);
            },

            shareFile: (req: ShareRequest) => {
                set((s) => ({
                    files: s.files.map((f) =>
                        f.id === req.fileId ? { ...f, isShared: true, sharedWith: [...f.sharedWith, req.targetUserId] } : f,
                    ),
                }));
                logger.info(`Shared file ${req.fileId} with ${req.targetUserId}`);
            },

            revokeShare: (fileId, userId) => {
                set((s) => ({
                    files: s.files.map((f) =>
                        f.id === fileId
                            ? { ...f, sharedWith: f.sharedWith.filter((u) => u !== userId), isShared: f.sharedWith.length > 1 }
                            : f,
                    ),
                }));
                logger.info(`Revoked share on ${fileId} for ${userId}`);
            },

            // ── Sync ──────────────────────────────────
            updateSyncSettings: (settings) => {
                set((s) => ({ syncSettings: { ...s.syncSettings, ...settings } }));
                logger.info("Sync settings updated");
            },

            triggerSync: (deviceId) => {
                set((s) => ({
                    devices: s.devices.map((d) => (d.id === deviceId ? { ...d, status: "syncing" as const, lastSyncAt: new Date().toISOString() } : d)),
                }));
                // Simulate sync completion
                setTimeout(() => {
                    set((s) => ({
                        devices: s.devices.map((d) =>
                            d.id === deviceId ? { ...d, status: "synced" as const, itemsPending: 0, itemsSynced: d.itemsSynced + d.itemsPending } : d,
                        ),
                    }));
                }, 2000);
                logger.info(`Triggered sync for device: ${deviceId}`);
            },

            // ── Upload ─────────────────────────────────
            addUpload: (fileName, fileType, sizeBytes, targetFolderId) => {
                const upload: UploadItem = {
                    id: generateId(),
                    fileName,
                    fileType,
                    sizeBytes,
                    progress: 0,
                    status: "queued",
                    targetFolderId: targetFolderId ?? get().currentFolderId,
                    createdAt: new Date().toISOString(),
                };
                set((s) => ({ uploads: [upload, ...s.uploads] }));
                logger.info(`Upload queued: ${fileName}`);
                return upload;
            },

            removeUpload: (uploadId) => {
                set((s) => ({ uploads: s.uploads.filter((u) => u.id !== uploadId) }));
                logger.info(`Removed upload: ${uploadId}`);
            },

            clearCompletedUploads: () => {
                set((s) => ({ uploads: s.uploads.filter((u) => u.status !== "completed") }));
                logger.info("Cleared completed uploads");
            },
        }),
        {
            name: "file-manager-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                sortBy: state.sortBy,
                sortOrder: state.sortOrder,
                viewMode: state.viewMode,
                syncSettings: state.syncSettings,
            }),
        },
    ),
);
