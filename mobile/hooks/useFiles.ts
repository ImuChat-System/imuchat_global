/**
 * useFiles Hook — DEV-020
 *
 * Hook principal pour le module Docs & Storage.
 * Auto-charge les fichiers et dossiers au montage.
 * Expose l'état, les actions, et les valeurs dérivées.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    formatFileSize,
    getFileColor,
    getFileIcon,
    isPreviewable,
} from '@/services/files-api';
import { useFilesStore } from '@/stores/files-store';
import type {
    CloudFile,
    CloudFolder,
    FileCategory,
    FileSortDirection,
    FileSortOption,
    FileViewMode,
    SharePermission,
    StorageUsage,
} from '@/types/files';

// ─── Return Type ────────────────────────────────────────────

interface UseFilesReturn {
    // State
    files: CloudFile[];
    folders: CloudFolder[];
    currentFile: CloudFile | null;
    currentFolder: CloudFolder | null;
    breadcrumbs: { id: string | null; name: string }[];
    storageUsage: StorageUsage | null;
    isLoading: boolean;
    isInitialized: boolean;
    searchQuery: string;
    searchResults: CloudFile[];
    selectedFileIds: string[];
    hasSelection: boolean;
    selectionCount: number;

    // UI
    viewMode: FileViewMode;
    sortBy: FileSortOption;
    sortDirection: FileSortDirection;
    filterCategory: FileCategory | 'all';
    showTrashed: boolean;

    // Derived
    filteredFiles: CloudFile[];
    recentFiles: CloudFile[];
    favoriteFiles: CloudFile[];
    fileCounts: Record<string, number>;
    usagePercentage: number;
    usageFormatted: string;

    // File Actions
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

    // Batch
    moveFilesToFolder: (fileIds: string[], targetFolderId: string | null) => Promise<void>;
    trashFiles: (fileIds: string[]) => Promise<void>;
    tagFiles: (fileIds: string[], tags: string[]) => Promise<void>;
    toggleSelection: (fileId: string) => void;
    clearSelection: () => void;
    selectAll: () => void;

    // Folder Actions
    createFolder: (name: string, parentId?: string | null, color?: string) => Promise<CloudFolder>;
    updateFolder: (id: string, updates: Partial<Pick<CloudFolder, 'name' | 'color' | 'icon' | 'parent_id' | 'is_favorite'>>) => Promise<void>;
    trashFolder: (id: string) => Promise<void>;
    deleteFolder: (id: string) => Promise<void>;
    navigateToFolder: (folderId: string | null) => Promise<void>;

    // Share
    shareFile: (fileId: string, userId: string, userName: string, permission: SharePermission) => Promise<void>;
    shareFolder: (folderId: string, userId: string, userName: string, permission: SharePermission) => Promise<void>;
    removeShare: (shareId: string) => Promise<void>;
    createShareLink: (fileId: string | null, folderId: string | null, permission: SharePermission) => Promise<{ token: string }>;
    deactivateShareLink: (linkId: string) => Promise<void>;

    // UI Actions
    setViewMode: (mode: FileViewMode) => void;
    setSortBy: (sort: FileSortOption) => void;
    setSortDirection: (dir: FileSortDirection) => void;
    setFilterCategory: (cat: FileCategory | 'all') => void;
    setShowTrashed: (show: boolean) => void;

    // Utilities
    formatFileSize: (bytes: number) => string;
    getFileIcon: (category: FileCategory) => string;
    getFileColor: (category: FileCategory) => string;
    isPreviewable: (category: FileCategory) => boolean;
}

export function useFiles(): UseFilesReturn {
    const store = useFilesStore();
    const [isInitialized, setIsInitialized] = useState(false);

    // Auto-load on mount
    useEffect(() => {
        async function loadAll() {
            await Promise.all([
                store.loadFiles(),
                store.loadFolders(),
                store.loadStorageUsage(),
                store.loadActivities(),
            ]);
            setIsInitialized(true);
        }
        loadAll();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Derived values
    const filteredFiles = useMemo(() => store.getFilteredFiles(), [store.files, store.filterCategory, store.sortBy, store.sortDirection, store.showTrashed]);
    const recentFiles = useMemo(() => store.getRecentFiles(8), [store.files]);
    const favoriteFiles = useMemo(() => store.getFavoriteFiles(), [store.files]);
    const fileCounts = useMemo(() => store.getFileCounts(), [store.files]);

    const usagePercentage = useMemo(() => {
        if (!store.storageUsage) return 0;
        return Math.round((store.storageUsage.used / store.storageUsage.total) * 100);
    }, [store.storageUsage]);

    const usageFormatted = useMemo(() => {
        if (!store.storageUsage) return '0 B / 5 GB';
        return `${formatFileSize(store.storageUsage.used)} / ${formatFileSize(store.storageUsage.total)}`;
    }, [store.storageUsage]);

    const hasSelection = store.selectedFileIds.length > 0;
    const selectionCount = store.selectedFileIds.length;

    const createShareLinkWrapped = useCallback(async (
        fileId: string | null,
        folderId: string | null,
        permission: SharePermission
    ) => {
        const link = await store.createShareLink(fileId, folderId, permission);
        return { token: link.token };
    }, [store.createShareLink]);

    return {
        // State
        files: store.files,
        folders: store.folders,
        currentFile: store.currentFile,
        currentFolder: store.currentFolder,
        breadcrumbs: store.breadcrumbs,
        storageUsage: store.storageUsage,
        isLoading: store.isLoading,
        isInitialized,
        searchQuery: store.searchQuery,
        searchResults: store.searchResults,
        selectedFileIds: store.selectedFileIds,
        hasSelection,
        selectionCount,

        // UI
        viewMode: store.viewMode,
        sortBy: store.sortBy,
        sortDirection: store.sortDirection,
        filterCategory: store.filterCategory,
        showTrashed: store.showTrashed,

        // Derived
        filteredFiles,
        recentFiles,
        favoriteFiles,
        fileCounts,
        usagePercentage,
        usageFormatted,

        // File Actions
        createFile: store.createFile,
        updateFile: store.updateFile,
        moveToTrash: store.moveToTrash,
        restoreFromTrash: store.restoreFromTrash,
        deleteFilePermanently: store.deleteFilePermanently,
        emptyTrash: store.emptyTrash,
        toggleFavorite: store.toggleFavorite,
        moveFile: store.moveFile,
        duplicateFile: store.duplicateFile,
        openFile: store.openFile,
        closeFile: store.closeFile,
        searchFiles: store.searchFiles,

        // Batch
        moveFilesToFolder: store.moveFilesToFolder,
        trashFiles: store.trashFiles,
        tagFiles: store.tagFiles,
        toggleSelection: store.toggleSelection,
        clearSelection: store.clearSelection,
        selectAll: store.selectAll,

        // Folder
        createFolder: store.createFolder,
        updateFolder: store.updateFolder,
        trashFolder: store.trashFolder,
        deleteFolder: store.deleteFolder,
        navigateToFolder: store.navigateToFolder,

        // Share
        shareFile: store.shareFile,
        shareFolder: store.shareFolder,
        removeShare: store.removeShare,
        createShareLink: createShareLinkWrapped,
        deactivateShareLink: store.deactivateShareLink,

        // UI Actions
        setViewMode: store.setViewMode,
        setSortBy: store.setSortBy,
        setSortDirection: store.setSortDirection,
        setFilterCategory: store.setFilterCategory,
        setShowTrashed: store.setShowTrashed,

        // Utilities
        formatFileSize,
        getFileIcon,
        getFileColor,
        isPreviewable,
    };
}
