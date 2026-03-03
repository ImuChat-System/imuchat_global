/**
 * File Manager & Storage Types (DEV-037)
 *
 * Types for the personal drive / file management module:
 *  - File & folder structures
 *  - Storage usage & quotas
 *  - Sharing & permissions
 *  - Multi-device sync
 *  - Upload queue
 *  - Trash / recycle bin
 */

// ============================================================================
// FILE SYSTEM
// ============================================================================

export type FileType =
    | "image"
    | "video"
    | "audio"
    | "document"
    | "archive"
    | "other";

export type SortBy = "name" | "date" | "size" | "type";
export type SortOrder = "asc" | "desc";

export interface FileItem {
    id: string;
    name: string;
    type: FileType;
    mimeType: string;
    sizeBytes: number;
    parentFolderId: string | null;
    createdAt: string;
    updatedAt: string;
    url: string;
    thumbnailUrl?: string;
    isFavorite: boolean;
    isShared: boolean;
    sharedWith: string[];
    deviceOrigin: string;
    /** Present only in trash */
    deletedAt?: string;
}

export interface FolderItem {
    id: string;
    name: string;
    parentFolderId: string | null;
    createdAt: string;
    updatedAt: string;
    itemCount: number;
    sizeBytes: number;
    color?: string;
    icon?: string;
}

export type FSItem =
    | (FileItem & { kind: "file" })
    | (FolderItem & { kind: "folder" });

// ============================================================================
// STORAGE
// ============================================================================

export interface StorageQuota {
    usedBytes: number;
    totalBytes: number;
    usedPercent: number;
}

export interface StorageBreakdown {
    images: number;
    videos: number;
    audio: number;
    documents: number;
    archives: number;
    other: number;
}

// ============================================================================
// SHARING
// ============================================================================

export type SharePermission = "view" | "edit" | "admin";

export interface SharedFile {
    file: FileItem;
    sharedBy: string;
    sharedByName: string;
    sharedAt: string;
    permission: SharePermission;
    expiresAt?: string;
}

export interface ShareRequest {
    fileId: string;
    targetUserId: string;
    permission: SharePermission;
    expiresAt?: string;
}

// ============================================================================
// SYNC
// ============================================================================

export type SyncStatus = "synced" | "syncing" | "pending" | "error" | "offline";

export interface SyncDevice {
    id: string;
    name: string;
    type: "mobile" | "desktop" | "web" | "tablet";
    lastSyncAt: string;
    status: SyncStatus;
    itemsSynced: number;
    itemsPending: number;
}

export interface SyncSettings {
    autoSync: boolean;
    syncOnWifiOnly: boolean;
    syncPhotos: boolean;
    syncVideos: boolean;
    syncDocuments: boolean;
    syncFrequencyMinutes: number;
}

// ============================================================================
// UPLOAD
// ============================================================================

export type UploadStatus = "queued" | "uploading" | "completed" | "failed";

export interface UploadItem {
    id: string;
    fileName: string;
    fileType: FileType;
    sizeBytes: number;
    progress: number; // 0-100
    status: UploadStatus;
    targetFolderId: string | null;
    createdAt: string;
    error?: string;
}

// ============================================================================
// STORE STATE
// ============================================================================

export interface FileManagerState {
    // Navigation
    currentFolderId: string | null;
    breadcrumbs: { id: string | null; name: string }[];

    // Content
    files: FileItem[];
    folders: FolderItem[];
    sharedFiles: SharedFile[];
    trash: FileItem[];
    favorites: FileItem[];

    // Storage
    quota: StorageQuota;
    breakdown: StorageBreakdown;

    // Sync
    devices: SyncDevice[];
    syncSettings: SyncSettings;

    // Upload
    uploads: UploadItem[];

    // UI
    sortBy: SortBy;
    sortOrder: SortOrder;
    searchQuery: string;
    loading: boolean;
    viewMode: "grid" | "list";

    // Actions
    setCurrentFolder: (folderId: string | null) => void;
    setSortBy: (sort: SortBy) => void;
    setSortOrder: (order: SortOrder) => void;
    setSearchQuery: (query: string) => void;
    setViewMode: (mode: "grid" | "list") => void;
    setLoading: (loading: boolean) => void;

    fetchFiles: (folderId?: string | null) => Promise<void>;
    fetchSharedFiles: () => Promise<void>;
    fetchTrash: () => Promise<void>;
    fetchFavorites: () => Promise<void>;
    fetchQuota: () => Promise<void>;
    fetchDevices: () => Promise<void>;

    createFolder: (name: string, parentId?: string | null) => Promise<FolderItem>;
    renameItem: (itemId: string, kind: "file" | "folder", newName: string) => void;
    deleteItem: (itemId: string, kind: "file" | "folder") => void;
    restoreItem: (fileId: string) => void;
    emptyTrash: () => void;
    toggleFavorite: (fileId: string) => void;
    shareFile: (req: ShareRequest) => void;
    revokeShare: (fileId: string, userId: string) => void;

    updateSyncSettings: (settings: Partial<SyncSettings>) => void;
    triggerSync: (deviceId: string) => void;

    addUpload: (fileName: string, fileType: FileType, sizeBytes: number, targetFolderId?: string | null) => UploadItem;
    removeUpload: (uploadId: string) => void;
    clearCompletedUploads: () => void;
}
