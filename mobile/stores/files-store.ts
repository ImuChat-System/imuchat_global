/**
 * Files Store (Zustand + persist) — DEV-020
 *
 * Gère l'état global du module Docs & Storage :
 * - Fichiers (upload, download, preview)
 * - Dossiers hiérarchiques
 * - Partage & permissions
 * - Transferts (upload/download queue)
 * - Activité / historique
 * - Stockage utilisé
 * - Corbeille
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createLogger } from '@/services/logger';
import * as FilesAPI from '@/services/files-api';
import type {
    Breadcrumb,
    CloudFile,
    CloudFolder,
    FileActivity,
    FileCategory,
    FileShare,
    FileSortDirection,
    FileSortOption,
    FileTransfer,
    FileViewMode,
    ShareLink,
    SharePermission,
    StorageUsage,
} from '@/types/files';

const logger = createLogger('FilesStore');

// ─── Interface ──────────────────────────────────────────────

interface FilesState {
    // Data
    files: CloudFile[];
    folders: CloudFolder[];
    currentFile: CloudFile | null;
    currentFolder: CloudFolder | null;
    breadcrumbs: Breadcrumb[];

    // Shares
    shares: FileShare[];
    shareLinks: ShareLink[];

    // Transfers
    transfers: FileTransfer[];

    // Activity
    activities: FileActivity[];

    // Storage
    storageUsage: StorageUsage | null;

    // Search
    searchResults: CloudFile[];
    searchQuery: string;

    // UI State
    isLoading: boolean;
    viewMode: FileViewMode;
    sortBy: FileSortOption;
    sortDirection: FileSortDirection;
    filterCategory: FileCategory | 'all';
    showTrashed: boolean;
    selectedFileIds: string[];

    // ─── File Actions ────────────────────────────────────
    loadFiles: (folderId?: string | null) => Promise<void>;
    createFile: (name: string, mimeType: string, size: number, localUri: string, folderId?: string | null, description?: string) => Promise<CloudFile>;
    updateFile: (id: string, updates: Partial<Pick<CloudFile, 'name' | 'description' | 'tags' | 'color_label' | 'folder_id' | 'is_favorite'>>) => Promise<void>;
    moveToTrash: (id: string) => Promise<void>;
    restoreFromTrash: (id: string) => Promise<void>;
    deleteFilePermanently: (id: string) => Promise<void>;
    emptyTrash: () => Promise<void>;
    toggleFavorite: (id: string) => Promise<void>;
    moveFile: (id: string, targetFolderId: string | null) => Promise<void>;
    duplicateFile: (id: string) => Promise<void>;
    openFile: (id: string) => Promise<void>;
    closeFile: () => void;
    searchFiles: (query: string) => Promise<void>;

    // ─── Batch Actions ───────────────────────────────────
    moveFilesToFolder: (fileIds: string[], targetFolderId: string | null) => Promise<void>;
    trashFiles: (fileIds: string[]) => Promise<void>;
    tagFiles: (fileIds: string[], tags: string[]) => Promise<void>;
    toggleSelection: (fileId: string) => void;
    clearSelection: () => void;
    selectAll: () => void;

    // ─── Folder Actions ──────────────────────────────────
    loadFolders: (parentId?: string | null) => Promise<void>;
    createFolder: (name: string, parentId?: string | null, color?: string, icon?: string) => Promise<CloudFolder>;
    updateFolder: (id: string, updates: Partial<Pick<CloudFolder, 'name' | 'color' | 'icon' | 'parent_id' | 'is_favorite'>>) => Promise<void>;
    trashFolder: (id: string) => Promise<void>;
    deleteFolder: (id: string) => Promise<void>;
    navigateToFolder: (folderId: string | null) => Promise<void>;

    // ─── Share Actions ───────────────────────────────────
    loadShares: (fileId: string) => Promise<void>;
    shareFile: (fileId: string, userId: string, userName: string, permission: SharePermission) => Promise<void>;
    shareFolder: (folderId: string, userId: string, userName: string, permission: SharePermission) => Promise<void>;
    removeShare: (shareId: string) => Promise<void>;
    createShareLink: (fileId: string | null, folderId: string | null, permission: SharePermission) => Promise<ShareLink>;
    loadShareLinks: (fileId: string) => Promise<void>;
    deactivateShareLink: (linkId: string) => Promise<void>;

    // ─── Transfer Actions ────────────────────────────────
    loadTransfers: () => Promise<void>;
    clearCompletedTransfers: () => Promise<void>;

    // ─── Activity Actions ────────────────────────────────
    loadActivities: () => Promise<void>;

    // ─── Storage Actions ─────────────────────────────────
    loadStorageUsage: () => Promise<void>;

    // ─── UI Actions ──────────────────────────────────────
    setViewMode: (mode: FileViewMode) => void;
    setSortBy: (sort: FileSortOption) => void;
    setSortDirection: (dir: FileSortDirection) => void;
    setFilterCategory: (cat: FileCategory | 'all') => void;
    setShowTrashed: (show: boolean) => void;

    // ─── Helpers ─────────────────────────────────────────
    getFilteredFiles: () => CloudFile[];
    getRecentFiles: (limit?: number) => CloudFile[];
    getFavoriteFiles: () => CloudFile[];
    getFileCounts: () => Record<string, number>;
}

// ─── Sort Helper ────────────────────────────────────────────

function sortFiles(files: CloudFile[], sortBy: FileSortOption, direction: FileSortDirection): CloudFile[] {
    const sorted = [...files].sort((a, b) => {
        let result = 0;
        switch (sortBy) {
            case 'name':
                result = a.name.localeCompare(b.name);
                break;
            case 'size':
                result = a.size - b.size;
                break;
            case 'type':
                result = a.category.localeCompare(b.category);
                break;
            case 'created':
                result = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                break;
            case 'updated':
            default:
                result = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
                break;
        }
        return direction === 'desc' ? -result : result;
    });
    return sorted;
}

// ─── Store ──────────────────────────────────────────────────

export const useFilesStore = create<FilesState>()(
    persist(
        (set, get) => ({
            // Initial state
            files: [],
            folders: [],
            currentFile: null,
            currentFolder: null,
            breadcrumbs: [{ id: null, name: 'My Drive' }],
            shares: [],
            shareLinks: [],
            transfers: [],
            activities: [],
            storageUsage: null,
            searchResults: [],
            searchQuery: '',
            isLoading: false,
            viewMode: 'grid',
            sortBy: 'updated',
            sortDirection: 'desc',
            filterCategory: 'all',
            showTrashed: false,
            selectedFileIds: [],

            // ─── File Actions ────────────────────────────────────

            loadFiles: async (folderId) => {
                set({ isLoading: true });
                try {
                    let files = await FilesAPI.getFiles(folderId);
                    if (files.length === 0 && !folderId) {
                        // Load mock data for empty state
                        files = FilesAPI.getMockFiles();
                    }
                    set({ files, isLoading: false });
                } catch (error) {
                    logger.error('loadFiles failed', error);
                    set({ isLoading: false });
                }
            },

            createFile: async (name, mimeType, size, localUri, folderId, description) => {
                const file = await FilesAPI.createFile(name, mimeType, size, localUri, folderId, description);
                set(state => ({ files: [...state.files, file] }));
                return file;
            },

            updateFile: async (id, updates) => {
                const updated = await FilesAPI.updateFile(id, updates);
                if (updated) {
                    set(state => ({
                        files: state.files.map(f => f.id === id ? updated : f),
                        currentFile: state.currentFile?.id === id ? updated : state.currentFile,
                    }));
                }
            },

            moveToTrash: async (id) => {
                const trashed = await FilesAPI.moveToTrash(id);
                if (trashed) {
                    set(state => ({
                        files: state.files.filter(f => f.id !== id),
                        currentFile: state.currentFile?.id === id ? null : state.currentFile,
                        selectedFileIds: state.selectedFileIds.filter(sid => sid !== id),
                    }));
                }
            },

            restoreFromTrash: async (id) => {
                const restored = await FilesAPI.restoreFromTrash(id);
                if (restored) {
                    set(state => ({
                        files: state.files.map(f => f.id === id ? restored : f),
                    }));
                }
            },

            deleteFilePermanently: async (id) => {
                const deleted = await FilesAPI.deleteFile(id);
                if (deleted) {
                    set(state => ({
                        files: state.files.filter(f => f.id !== id),
                    }));
                }
            },

            emptyTrash: async () => {
                await FilesAPI.emptyTrash();
                set(state => ({
                    files: state.files.filter(f => !f.is_trashed),
                }));
            },

            toggleFavorite: async (id) => {
                const updated = await FilesAPI.toggleFavorite(id);
                if (updated) {
                    set(state => ({
                        files: state.files.map(f => f.id === id ? updated : f),
                        currentFile: state.currentFile?.id === id ? updated : state.currentFile,
                    }));
                }
            },

            moveFile: async (id, targetFolderId) => {
                const moved = await FilesAPI.moveFile(id, targetFolderId);
                if (moved) {
                    set(state => ({
                        files: state.files.map(f => f.id === id ? moved : f),
                    }));
                }
            },

            duplicateFile: async (id) => {
                const copy = await FilesAPI.duplicateFile(id);
                if (copy) {
                    set(state => ({ files: [...state.files, copy] }));
                }
            },

            openFile: async (id) => {
                const file = get().files.find(f => f.id === id) || null;
                set({ currentFile: file });
                if (file) {
                    await FilesAPI.updateLastAccessed(id);
                }
            },

            closeFile: () => {
                set({ currentFile: null });
            },

            searchFiles: async (query) => {
                set({ searchQuery: query });
                if (!query.trim()) {
                    set({ searchResults: [] });
                    return;
                }
                const results = await FilesAPI.searchFiles(query);
                set({ searchResults: results });
            },

            // ─── Batch Actions ───────────────────────────────────

            moveFilesToFolder: async (fileIds, targetFolderId) => {
                await FilesAPI.moveFilesToFolder(fileIds, targetFolderId);
                set(state => ({
                    files: state.files.map(f =>
                        fileIds.includes(f.id) ? { ...f, folder_id: targetFolderId } : f
                    ),
                    selectedFileIds: [],
                }));
            },

            trashFiles: async (fileIds) => {
                await FilesAPI.trashFiles(fileIds);
                set(state => ({
                    files: state.files.filter(f => !fileIds.includes(f.id)),
                    selectedFileIds: [],
                }));
            },

            tagFiles: async (fileIds, tags) => {
                await FilesAPI.tagFiles(fileIds, tags);
                set(state => ({
                    files: state.files.map(f => {
                        if (fileIds.includes(f.id)) {
                            const allTags = new Set([...f.tags, ...tags]);
                            return { ...f, tags: Array.from(allTags) };
                        }
                        return f;
                    }),
                }));
            },

            toggleSelection: (fileId) => {
                set(state => {
                    const selected = state.selectedFileIds.includes(fileId)
                        ? state.selectedFileIds.filter(id => id !== fileId)
                        : [...state.selectedFileIds, fileId];
                    return { selectedFileIds: selected };
                });
            },

            clearSelection: () => set({ selectedFileIds: [] }),

            selectAll: () => {
                set(state => ({
                    selectedFileIds: state.files.map(f => f.id),
                }));
            },

            // ─── Folder Actions ──────────────────────────────────

            loadFolders: async (parentId) => {
                try {
                    let folders = await FilesAPI.getFolders(parentId);
                    if (folders.length === 0 && !parentId) {
                        folders = FilesAPI.getMockFolders();
                    }
                    set({ folders });
                } catch (error) {
                    logger.error('loadFolders failed', error);
                }
            },

            createFolder: async (name, parentId, color, icon) => {
                const folder = await FilesAPI.createFolder(name, parentId, color, icon);
                set(state => ({ folders: [...state.folders, folder] }));
                return folder;
            },

            updateFolder: async (id, updates) => {
                const updated = await FilesAPI.updateFolder(id, updates);
                if (updated) {
                    set(state => ({
                        folders: state.folders.map(f => f.id === id ? updated : f),
                        currentFolder: state.currentFolder?.id === id ? updated : state.currentFolder,
                    }));
                }
            },

            trashFolder: async (id) => {
                await FilesAPI.trashFolder(id);
                set(state => ({
                    folders: state.folders.filter(f => f.id !== id),
                }));
            },

            deleteFolder: async (id) => {
                await FilesAPI.deleteFolder(id);
                set(state => ({
                    folders: state.folders.filter(f => f.id !== id),
                }));
            },

            navigateToFolder: async (folderId) => {
                set({ isLoading: true });
                try {
                    const breadcrumbs = await FilesAPI.getBreadcrumbs(folderId);
                    const folder = folderId ? await FilesAPI.getFolderById(folderId) : null;
                    const files = await FilesAPI.getFiles(folderId);
                    const folders = await FilesAPI.getFolders(folderId);

                    set({
                        currentFolder: folder,
                        breadcrumbs,
                        files: files.length > 0 ? files : (folderId ? [] : FilesAPI.getMockFiles()),
                        folders: folders.length > 0 ? folders : (folderId ? [] : FilesAPI.getMockFolders()),
                        isLoading: false,
                        selectedFileIds: [],
                    });
                } catch (error) {
                    logger.error('navigateToFolder failed', error);
                    set({ isLoading: false });
                }
            },

            // ─── Share Actions ───────────────────────────────────

            loadShares: async (fileId) => {
                try {
                    const shares = await FilesAPI.getSharesForFile(fileId);
                    set({ shares });
                } catch (error) {
                    logger.error('loadShares failed', error);
                }
            },

            shareFile: async (fileId, userId, userName, permission) => {
                const share = await FilesAPI.shareFile(fileId, userId, userName, permission);
                set(state => ({ shares: [...state.shares, share] }));
            },

            shareFolder: async (folderId, userId, userName, permission) => {
                const share = await FilesAPI.shareFolder(folderId, userId, userName, permission);
                set(state => ({ shares: [...state.shares, share] }));
            },

            removeShare: async (shareId) => {
                await FilesAPI.removeShare(shareId);
                set(state => ({
                    shares: state.shares.filter(s => s.id !== shareId),
                }));
            },

            createShareLink: async (fileId, folderId, permission) => {
                const link = await FilesAPI.createShareLink(fileId, folderId, permission);
                set(state => ({ shareLinks: [...state.shareLinks, link] }));
                return link;
            },

            loadShareLinks: async (fileId) => {
                try {
                    const links = await FilesAPI.getShareLinksForFile(fileId);
                    set({ shareLinks: links });
                } catch (error) {
                    logger.error('loadShareLinks failed', error);
                }
            },

            deactivateShareLink: async (linkId) => {
                await FilesAPI.deactivateShareLink(linkId);
                set(state => ({
                    shareLinks: state.shareLinks.filter(l => l.id !== linkId),
                }));
            },

            // ─── Transfer Actions ────────────────────────────────

            loadTransfers: async () => {
                try {
                    const transfers = await FilesAPI.getRecentTransfers();
                    set({ transfers });
                } catch (error) {
                    logger.error('loadTransfers failed', error);
                }
            },

            clearCompletedTransfers: async () => {
                await FilesAPI.clearCompletedTransfers();
                set(state => ({
                    transfers: state.transfers.filter(t => t.status === 'pending' || t.status === 'in_progress'),
                }));
            },

            // ─── Activity Actions ────────────────────────────────

            loadActivities: async () => {
                try {
                    const activities = await FilesAPI.getActivities();
                    set({ activities });
                } catch (error) {
                    logger.error('loadActivities failed', error);
                }
            },

            // ─── Storage Actions ─────────────────────────────────

            loadStorageUsage: async () => {
                try {
                    const usage = await FilesAPI.getStorageUsage();
                    set({ storageUsage: usage });
                } catch (error) {
                    logger.error('loadStorageUsage failed', error);
                }
            },

            // ─── UI Actions ──────────────────────────────────────

            setViewMode: (mode) => set({ viewMode: mode }),
            setSortBy: (sort) => set({ sortBy: sort }),
            setSortDirection: (dir) => set({ sortDirection: dir }),
            setFilterCategory: (cat) => set({ filterCategory: cat }),
            setShowTrashed: (show) => set({ showTrashed: show }),

            // ─── Helpers ─────────────────────────────────────────

            getFilteredFiles: () => {
                const { files, filterCategory, sortBy, sortDirection, showTrashed } = get();
                let filtered = showTrashed ? files.filter(f => f.is_trashed) : files.filter(f => !f.is_trashed);

                if (filterCategory !== 'all') {
                    filtered = filtered.filter(f => f.category === filterCategory);
                }

                return sortFiles(filtered, sortBy, sortDirection);
            },

            getRecentFiles: (limit = 10) => {
                const { files } = get();
                return files
                    .filter(f => !f.is_trashed)
                    .sort((a, b) => new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime())
                    .slice(0, limit);
            },

            getFavoriteFiles: () => {
                const { files } = get();
                return files.filter(f => f.is_favorite && !f.is_trashed);
            },

            getFileCounts: () => {
                const { files } = get();
                const active = files.filter(f => !f.is_trashed);
                const counts: Record<string, number> = { all: active.length };
                for (const file of active) {
                    counts[file.category] = (counts[file.category] || 0) + 1;
                }
                return counts;
            },
        }),
        {
            name: 'imuchat-files-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                viewMode: state.viewMode,
                sortBy: state.sortBy,
                sortDirection: state.sortDirection,
                filterCategory: state.filterCategory,
            }),
        }
    )
);
