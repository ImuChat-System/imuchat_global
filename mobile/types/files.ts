/**
 * Types pour le Module Docs & Storage (DEV-020)
 *
 * Drive cloud intégré :
 * - Fichiers (upload, download, preview)
 * - Dossiers hiérarchiques
 * - Versionning
 * - Partage avec permissions granulaires
 * - Recherche plein texte
 * - Favoris, corbeille, tags
 */

// ─── File Types ─────────────────────────────────────────────

export type FileCategory =
    | 'image'
    | 'video'
    | 'audio'
    | 'document'
    | 'spreadsheet'
    | 'presentation'
    | 'pdf'
    | 'archive'
    | 'code'
    | 'other';

export type FileSortOption = 'name' | 'updated' | 'created' | 'size' | 'type';
export type FileSortDirection = 'asc' | 'desc';
export type FileViewMode = 'grid' | 'list';

// ─── Core File Interface ────────────────────────────────────

export interface CloudFile {
    id: string;
    name: string;
    extension: string;
    mime_type: string;
    category: FileCategory;
    size: number; // bytes
    folder_id: string | null;
    owner_id: string;

    // Storage
    storage_path: string; // Supabase Storage path
    local_uri: string | null; // Local cached URI
    thumbnail_url: string | null;

    // Metadata
    is_favorite: boolean;
    is_trashed: boolean;
    trashed_at: string | null;
    tags: string[];
    description: string;
    color_label: string | null; // hex color for visual labeling

    // Versioning
    version: number;
    versions: FileVersion[];

    // Timestamps
    created_at: string;
    updated_at: string;
    last_accessed_at: string;
}

// ─── Folder Interface ───────────────────────────────────────

export interface CloudFolder {
    id: string;
    name: string;
    parent_id: string | null; // null = root
    owner_id: string;
    color: string;
    icon: string; // Ionicons name
    is_favorite: boolean;
    is_trashed: boolean;
    trashed_at: string | null;
    file_count: number;
    total_size: number; // bytes
    created_at: string;
    updated_at: string;
}

// ─── File Version ───────────────────────────────────────────

export interface FileVersion {
    id: string;
    file_id: string;
    version_number: number;
    storage_path: string;
    size: number;
    change_summary: string;
    created_by: string;
    created_at: string;
}

// ─── Sharing & Permissions ──────────────────────────────────

export type SharePermission = 'view' | 'comment' | 'edit' | 'admin';

export interface FileShare {
    id: string;
    file_id: string | null;
    folder_id: string | null;
    shared_by: string;
    shared_with: string; // user_id
    shared_with_name: string;
    shared_with_avatar: string | null;
    permission: SharePermission;
    can_reshare: boolean;
    expires_at: string | null;
    created_at: string;
}

export interface ShareLink {
    id: string;
    file_id: string | null;
    folder_id: string | null;
    token: string;
    permission: SharePermission;
    password_protected: boolean;
    max_downloads: number | null;
    download_count: number;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
}

// ─── Transfer (Upload/Download) ─────────────────────────────

export type TransferStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type TransferType = 'upload' | 'download';

export interface FileTransfer {
    id: string;
    type: TransferType;
    file_name: string;
    file_size: number;
    progress: number; // 0-100
    status: TransferStatus;
    error_message: string | null;
    local_uri: string;
    storage_path: string | null;
    started_at: string;
    completed_at: string | null;
}

// ─── Storage Usage ──────────────────────────────────────────

export interface StorageUsage {
    used: number; // bytes
    total: number; // bytes (quota)
    by_category: Record<FileCategory, number>;
    file_count: number;
    folder_count: number;
}

// ─── Recent Activity ────────────────────────────────────────

export type ActivityAction = 'created' | 'updated' | 'deleted' | 'shared' | 'moved' | 'renamed' | 'restored' | 'downloaded';

export interface FileActivity {
    id: string;
    file_id: string | null;
    folder_id: string | null;
    item_name: string;
    action: ActivityAction;
    actor_id: string;
    actor_name: string;
    details: string;
    created_at: string;
}

// ─── Search ─────────────────────────────────────────────────

export interface FileSearchResult {
    file: CloudFile;
    match_context: string; // surrounding text where match was found
    score: number;
}

// ─── Breadcrumb (navigation) ────────────────────────────────

export interface Breadcrumb {
    id: string | null; // null = root
    name: string;
}

// ─── Store State ────────────────────────────────────────────

export interface FilesStoreState {
    // Data
    files: CloudFile[];
    folders: CloudFolder[];
    currentFolder: CloudFolder | null;
    currentFile: CloudFile | null;
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
}
