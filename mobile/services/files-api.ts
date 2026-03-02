/**
 * Files API Service (DEV-020)
 *
 * Drive cloud intégré avec AsyncStorage (métadonnées) + Supabase Storage (fichiers).
 * Pour le MVP, les fichiers sont stockés localement via expo-file-system
 * et les métadonnées dans AsyncStorage. Prêt pour migration full Supabase.
 *
 * - CRUD fichiers & dossiers
 * - Upload / download avec progression
 * - Versionning
 * - Partage avec permissions
 * - Recherche plein texte
 * - Corbeille & restauration
 * - Activité / historique
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { createLogger } from '@/services/logger';
import type {
    ActivityAction,
    Breadcrumb,
    CloudFile,
    CloudFolder,
    FileActivity,
    FileCategory,
    FileShare,
    FileTransfer,
    FileVersion,
    ShareLink,
    SharePermission,
    StorageUsage,
    TransferStatus,
} from '@/types/files';

const logger = createLogger('FilesAPI');

// ─── Storage Keys ───────────────────────────────────────────

const STORAGE_KEYS = {
    FILES: 'imuchat-files-data',
    FOLDERS: 'imuchat-files-folders',
    SHARES: 'imuchat-files-shares',
    SHARE_LINKS: 'imuchat-files-share-links',
    TRANSFERS: 'imuchat-files-transfers',
    ACTIVITIES: 'imuchat-files-activities',
};

// ─── Constants ──────────────────────────────────────────────

const MAX_STORAGE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB quota
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB per file
const TRASH_RETENTION_DAYS = 30;
const MAX_VERSIONS = 10;

// ─── MIME → Category mapping ────────────────────────────────

const CATEGORY_MAP: Record<string, FileCategory> = {
    'image/jpeg': 'image',
    'image/png': 'image',
    'image/gif': 'image',
    'image/webp': 'image',
    'image/svg+xml': 'image',
    'video/mp4': 'video',
    'video/quicktime': 'video',
    'video/webm': 'video',
    'audio/mpeg': 'audio',
    'audio/mp3': 'audio',
    'audio/wav': 'audio',
    'audio/m4a': 'audio',
    'audio/ogg': 'audio',
    'application/pdf': 'pdf',
    'application/msword': 'document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
    'text/plain': 'document',
    'text/markdown': 'document',
    'text/html': 'document',
    'application/vnd.ms-excel': 'spreadsheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
    'text/csv': 'spreadsheet',
    'application/vnd.ms-powerpoint': 'presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',
    'application/zip': 'archive',
    'application/x-rar-compressed': 'archive',
    'application/gzip': 'archive',
    'application/x-tar': 'archive',
    'text/javascript': 'code',
    'application/json': 'code',
    'text/typescript': 'code',
    'text/css': 'code',
    'text/xml': 'code',
};

// ─── Helpers ─────────────────────────────────────────────────

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

function now(): string {
    return new Date().toISOString();
}

export function getCategoryFromMime(mimeType: string): FileCategory {
    return CATEGORY_MAP[mimeType] || 'other';
}

export function getExtensionFromName(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function isPreviewable(category: FileCategory): boolean {
    return ['image', 'video', 'audio', 'pdf', 'document', 'code'].includes(category);
}

export function getFileIcon(category: FileCategory): string {
    const icons: Record<FileCategory, string> = {
        image: 'image-outline',
        video: 'videocam-outline',
        audio: 'musical-notes-outline',
        document: 'document-text-outline',
        spreadsheet: 'grid-outline',
        presentation: 'easel-outline',
        pdf: 'reader-outline',
        archive: 'archive-outline',
        code: 'code-slash-outline',
        other: 'document-outline',
    };
    return icons[category];
}

export function getFileColor(category: FileCategory): string {
    const colors: Record<FileCategory, string> = {
        image: '#4CAF50',
        video: '#F44336',
        audio: '#9C27B0',
        document: '#2196F3',
        spreadsheet: '#4CAF50',
        presentation: '#FF9800',
        pdf: '#E91E63',
        archive: '#795548',
        code: '#607D8B',
        other: '#9E9E9E',
    };
    return colors[category];
}

// ─── File CRUD ──────────────────────────────────────────────

async function getStoredFiles(): Promise<CloudFile[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.FILES);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        logger.error('Failed to load files', error);
        return [];
    }
}

async function saveFiles(files: CloudFile[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
}

export async function getFiles(folderId?: string | null): Promise<CloudFile[]> {
    const files = await getStoredFiles();
    const active = files.filter(f => !f.is_trashed);
    if (folderId === undefined) return active;
    return active.filter(f => f.folder_id === folderId);
}

export async function getTrashedFiles(): Promise<CloudFile[]> {
    const files = await getStoredFiles();
    return files.filter(f => f.is_trashed);
}

export async function getFileById(id: string): Promise<CloudFile | null> {
    const files = await getStoredFiles();
    return files.find(f => f.id === id) || null;
}

export async function createFile(
    name: string,
    mimeType: string,
    size: number,
    localUri: string,
    folderId?: string | null,
    description?: string
): Promise<CloudFile> {
    const files = await getStoredFiles();
    const extension = getExtensionFromName(name);
    const category = getCategoryFromMime(mimeType);
    const timestamp = now();
    const id = generateId();

    const file: CloudFile = {
        id,
        name,
        extension,
        mime_type: mimeType,
        category,
        size,
        folder_id: folderId || null,
        owner_id: 'current-user',
        storage_path: `files/${id}/${name}`,
        local_uri: localUri,
        thumbnail_url: category === 'image' ? localUri : null,
        is_favorite: false,
        is_trashed: false,
        trashed_at: null,
        tags: [],
        description: description || '',
        color_label: null,
        version: 1,
        versions: [],
        created_at: timestamp,
        updated_at: timestamp,
        last_accessed_at: timestamp,
    };

    files.push(file);
    await saveFiles(files);
    await logActivity(file.id, null, name, 'created');
    logger.info(`File created: ${name}`);
    return file;
}

export async function updateFile(
    id: string,
    updates: Partial<Pick<CloudFile, 'name' | 'description' | 'tags' | 'color_label' | 'folder_id' | 'is_favorite'>>
): Promise<CloudFile | null> {
    const files = await getStoredFiles();
    const index = files.findIndex(f => f.id === id);
    if (index === -1) return null;

    const oldName = files[index].name;
    files[index] = {
        ...files[index],
        ...updates,
        updated_at: now(),
    };

    if (updates.name && updates.name !== oldName) {
        files[index].extension = getExtensionFromName(updates.name);
    }

    await saveFiles(files);
    logger.info(`File updated: ${files[index].name}`);
    return files[index];
}

export async function deleteFile(id: string): Promise<boolean> {
    const files = await getStoredFiles();
    const file = files.find(f => f.id === id);
    if (!file) return false;

    const filtered = files.filter(f => f.id !== id);
    await saveFiles(filtered);
    await logActivity(id, null, file.name, 'deleted');
    logger.info(`File permanently deleted: ${file.name}`);
    return true;
}

export async function moveToTrash(id: string): Promise<CloudFile | null> {
    const files = await getStoredFiles();
    const index = files.findIndex(f => f.id === id);
    if (index === -1) return null;

    files[index].is_trashed = true;
    files[index].trashed_at = now();
    files[index].updated_at = now();

    await saveFiles(files);
    await logActivity(id, null, files[index].name, 'deleted');
    logger.info(`File trashed: ${files[index].name}`);
    return files[index];
}

export async function restoreFromTrash(id: string): Promise<CloudFile | null> {
    const files = await getStoredFiles();
    const index = files.findIndex(f => f.id === id);
    if (index === -1) return null;

    files[index].is_trashed = false;
    files[index].trashed_at = null;
    files[index].updated_at = now();

    await saveFiles(files);
    await logActivity(id, null, files[index].name, 'restored');
    logger.info(`File restored: ${files[index].name}`);
    return files[index];
}

export async function emptyTrash(): Promise<number> {
    const files = await getStoredFiles();
    const trashedCount = files.filter(f => f.is_trashed).length;
    const active = files.filter(f => !f.is_trashed);
    await saveFiles(active);
    logger.info(`Trash emptied: ${trashedCount} files removed`);
    return trashedCount;
}

export async function toggleFavorite(id: string): Promise<CloudFile | null> {
    const files = await getStoredFiles();
    const index = files.findIndex(f => f.id === id);
    if (index === -1) return null;

    files[index].is_favorite = !files[index].is_favorite;
    files[index].updated_at = now();
    await saveFiles(files);
    return files[index];
}

export async function moveFile(id: string, targetFolderId: string | null): Promise<CloudFile | null> {
    const files = await getStoredFiles();
    const index = files.findIndex(f => f.id === id);
    if (index === -1) return null;

    files[index].folder_id = targetFolderId;
    files[index].updated_at = now();
    await saveFiles(files);
    await logActivity(id, null, files[index].name, 'moved');
    logger.info(`File moved: ${files[index].name}`);
    return files[index];
}

export async function duplicateFile(id: string): Promise<CloudFile | null> {
    const file = await getFileById(id);
    if (!file) return null;

    const copy = await createFile(
        `${file.name.replace(/\.[^/.]+$/, '')} (copy).${file.extension}`,
        file.mime_type,
        file.size,
        file.local_uri || '',
        file.folder_id,
        file.description
    );
    copy.tags = [...file.tags];
    const files = await getStoredFiles();
    const index = files.findIndex(f => f.id === copy.id);
    if (index !== -1) {
        files[index] = copy;
        await saveFiles(files);
    }
    return copy;
}

export async function updateLastAccessed(id: string): Promise<void> {
    const files = await getStoredFiles();
    const index = files.findIndex(f => f.id === id);
    if (index !== -1) {
        files[index].last_accessed_at = now();
        await saveFiles(files);
    }
}

// ─── Folder CRUD ────────────────────────────────────────────

async function getStoredFolders(): Promise<CloudFolder[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.FOLDERS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        logger.error('Failed to load folders', error);
        return [];
    }
}

async function saveFolders(folders: CloudFolder[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
}

export async function getFolders(parentId?: string | null): Promise<CloudFolder[]> {
    const folders = await getStoredFolders();
    const active = folders.filter(f => !f.is_trashed);
    if (parentId === undefined) return active;
    return active.filter(f => f.parent_id === parentId);
}

export async function getFolderById(id: string): Promise<CloudFolder | null> {
    const folders = await getStoredFolders();
    return folders.find(f => f.id === id) || null;
}

export async function createFolder(
    name: string,
    parentId?: string | null,
    color?: string,
    icon?: string
): Promise<CloudFolder> {
    const folders = await getStoredFolders();
    const timestamp = now();
    const id = generateId();

    const folder: CloudFolder = {
        id,
        name,
        parent_id: parentId || null,
        owner_id: 'current-user',
        color: color || '#2196F3',
        icon: icon || 'folder-outline',
        is_favorite: false,
        is_trashed: false,
        trashed_at: null,
        file_count: 0,
        total_size: 0,
        created_at: timestamp,
        updated_at: timestamp,
    };

    folders.push(folder);
    await saveFolders(folders);
    logger.info(`Folder created: ${name}`);
    return folder;
}

export async function updateFolder(
    id: string,
    updates: Partial<Pick<CloudFolder, 'name' | 'color' | 'icon' | 'parent_id' | 'is_favorite'>>
): Promise<CloudFolder | null> {
    const folders = await getStoredFolders();
    const index = folders.findIndex(f => f.id === id);
    if (index === -1) return null;

    folders[index] = {
        ...folders[index],
        ...updates,
        updated_at: now(),
    };

    await saveFolders(folders);
    logger.info(`Folder updated: ${folders[index].name}`);
    return folders[index];
}

export async function deleteFolder(id: string): Promise<boolean> {
    const folders = await getStoredFolders();
    const filtered = folders.filter(f => f.id !== id);
    if (filtered.length === folders.length) return false;

    await saveFolders(filtered);

    // Also move files in that folder to root
    const files = await getStoredFiles();
    let moved = false;
    for (let i = 0; i < files.length; i++) {
        if (files[i].folder_id === id) {
            files[i].folder_id = null;
            moved = true;
        }
    }
    if (moved) await saveFiles(files);

    logger.info(`Folder deleted: ${id}`);
    return true;
}

export async function trashFolder(id: string): Promise<CloudFolder | null> {
    const folders = await getStoredFolders();
    const index = folders.findIndex(f => f.id === id);
    if (index === -1) return null;

    folders[index].is_trashed = true;
    folders[index].trashed_at = now();
    folders[index].updated_at = now();

    await saveFolders(folders);
    logger.info(`Folder trashed: ${folders[index].name}`);
    return folders[index];
}

export async function restoreFolder(id: string): Promise<CloudFolder | null> {
    const folders = await getStoredFolders();
    const index = folders.findIndex(f => f.id === id);
    if (index === -1) return null;

    folders[index].is_trashed = false;
    folders[index].trashed_at = null;
    folders[index].updated_at = now();

    await saveFolders(folders);
    return folders[index];
}

// ─── Breadcrumbs ────────────────────────────────────────────

export async function getBreadcrumbs(folderId: string | null): Promise<Breadcrumb[]> {
    if (!folderId) return [{ id: null, name: 'My Drive' }];

    const folders = await getStoredFolders();
    const crumbs: Breadcrumb[] = [];
    let current: string | null = folderId;

    while (current) {
        const folder = folders.find(f => f.id === current);
        if (!folder) break;
        crumbs.unshift({ id: folder.id, name: folder.name });
        current = folder.parent_id;
    }

    crumbs.unshift({ id: null, name: 'My Drive' });
    return crumbs;
}

// ─── Versioning ─────────────────────────────────────────────

export async function addFileVersion(
    fileId: string,
    newLocalUri: string,
    newSize: number,
    changeSummary: string
): Promise<FileVersion | null> {
    const files = await getStoredFiles();
    const index = files.findIndex(f => f.id === fileId);
    if (index === -1) return null;

    const file = files[index];
    const versionId = generateId();
    const timestamp = now();

    const version: FileVersion = {
        id: versionId,
        file_id: fileId,
        version_number: file.version,
        storage_path: file.storage_path,
        size: file.size,
        change_summary: changeSummary,
        created_by: 'current-user',
        created_at: timestamp,
    };

    // Keep only last N versions
    const versions = [...file.versions, version];
    if (versions.length > MAX_VERSIONS) {
        versions.splice(0, versions.length - MAX_VERSIONS);
    }

    files[index] = {
        ...file,
        version: file.version + 1,
        versions,
        size: newSize,
        local_uri: newLocalUri,
        storage_path: `files/${fileId}/${file.name}`,
        updated_at: timestamp,
    };

    await saveFiles(files);
    await logActivity(fileId, null, file.name, 'updated');
    logger.info(`File version ${file.version + 1} created for: ${file.name}`);
    return version;
}

export async function getFileVersions(fileId: string): Promise<FileVersion[]> {
    const file = await getFileById(fileId);
    return file ? file.versions : [];
}

// ─── Sharing ────────────────────────────────────────────────

async function getStoredShares(): Promise<FileShare[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.SHARES);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        logger.error('Failed to load shares', error);
        return [];
    }
}

async function saveShares(shares: FileShare[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SHARES, JSON.stringify(shares));
}

export async function getSharesForFile(fileId: string): Promise<FileShare[]> {
    const shares = await getStoredShares();
    return shares.filter(s => s.file_id === fileId);
}

export async function getSharesForFolder(folderId: string): Promise<FileShare[]> {
    const shares = await getStoredShares();
    return shares.filter(s => s.folder_id === folderId);
}

export async function getSharedWithMe(): Promise<FileShare[]> {
    const shares = await getStoredShares();
    return shares.filter(s => s.shared_with === 'current-user');
}

export async function shareFile(
    fileId: string,
    userId: string,
    userName: string,
    permission: SharePermission,
    canReshare?: boolean,
    expiresAt?: string
): Promise<FileShare> {
    const shares = await getStoredShares();
    const timestamp = now();
    const id = generateId();

    const share: FileShare = {
        id,
        file_id: fileId,
        folder_id: null,
        shared_by: 'current-user',
        shared_with: userId,
        shared_with_name: userName,
        shared_with_avatar: null,
        permission,
        can_reshare: canReshare || false,
        expires_at: expiresAt || null,
        created_at: timestamp,
    };

    shares.push(share);
    await saveShares(shares);

    const file = await getFileById(fileId);
    if (file) {
        await logActivity(fileId, null, file.name, 'shared');
    }
    logger.info(`File shared with ${userName}`);
    return share;
}

export async function shareFolder(
    folderId: string,
    userId: string,
    userName: string,
    permission: SharePermission
): Promise<FileShare> {
    const shares = await getStoredShares();
    const timestamp = now();
    const id = generateId();

    const share: FileShare = {
        id,
        file_id: null,
        folder_id: folderId,
        shared_by: 'current-user',
        shared_with: userId,
        shared_with_name: userName,
        shared_with_avatar: null,
        permission,
        can_reshare: false,
        expires_at: null,
        created_at: timestamp,
    };

    shares.push(share);
    await saveShares(shares);
    logger.info(`Folder shared with ${userName}`);
    return share;
}

export async function updateSharePermission(
    shareId: string,
    permission: SharePermission
): Promise<FileShare | null> {
    const shares = await getStoredShares();
    const index = shares.findIndex(s => s.id === shareId);
    if (index === -1) return null;

    shares[index].permission = permission;
    await saveShares(shares);
    return shares[index];
}

export async function removeShare(shareId: string): Promise<boolean> {
    const shares = await getStoredShares();
    const filtered = shares.filter(s => s.id !== shareId);
    if (filtered.length === shares.length) return false;
    await saveShares(filtered);
    return true;
}

// ─── Share Links ────────────────────────────────────────────

async function getStoredShareLinks(): Promise<ShareLink[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.SHARE_LINKS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        logger.error('Failed to load share links', error);
        return [];
    }
}

async function saveShareLinks(links: ShareLink[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SHARE_LINKS, JSON.stringify(links));
}

export async function createShareLink(
    fileId: string | null,
    folderId: string | null,
    permission: SharePermission,
    passwordProtected?: boolean,
    maxDownloads?: number,
    expiresAt?: string
): Promise<ShareLink> {
    const links = await getStoredShareLinks();
    const id = generateId();
    const token = generateId() + generateId(); // longer token

    const link: ShareLink = {
        id,
        file_id: fileId,
        folder_id: folderId,
        token,
        permission,
        password_protected: passwordProtected || false,
        max_downloads: maxDownloads || null,
        download_count: 0,
        expires_at: expiresAt || null,
        is_active: true,
        created_at: now(),
    };

    links.push(link);
    await saveShareLinks(links);
    logger.info(`Share link created: ${token.substring(0, 8)}...`);
    return link;
}

export async function getShareLinksForFile(fileId: string): Promise<ShareLink[]> {
    const links = await getStoredShareLinks();
    return links.filter(l => l.file_id === fileId && l.is_active);
}

export async function deactivateShareLink(linkId: string): Promise<boolean> {
    const links = await getStoredShareLinks();
    const index = links.findIndex(l => l.id === linkId);
    if (index === -1) return false;

    links[index].is_active = false;
    await saveShareLinks(links);
    return true;
}

// ─── Transfers ──────────────────────────────────────────────

async function getStoredTransfers(): Promise<FileTransfer[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSFERS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        logger.error('Failed to load transfers', error);
        return [];
    }
}

async function saveTransfers(transfers: FileTransfer[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
}

export async function createTransfer(
    type: 'upload' | 'download',
    fileName: string,
    fileSize: number,
    localUri: string
): Promise<FileTransfer> {
    const transfers = await getStoredTransfers();
    const id = generateId();

    const transfer: FileTransfer = {
        id,
        type,
        file_name: fileName,
        file_size: fileSize,
        progress: 0,
        status: 'pending',
        error_message: null,
        local_uri: localUri,
        storage_path: null,
        started_at: now(),
        completed_at: null,
    };

    transfers.push(transfer);
    await saveTransfers(transfers);
    return transfer;
}

export async function updateTransferProgress(
    id: string,
    progress: number,
    status?: TransferStatus,
    errorMessage?: string
): Promise<FileTransfer | null> {
    const transfers = await getStoredTransfers();
    const index = transfers.findIndex(t => t.id === id);
    if (index === -1) return null;

    transfers[index].progress = progress;
    if (status) transfers[index].status = status;
    if (errorMessage) transfers[index].error_message = errorMessage;
    if (status === 'completed' || status === 'failed') {
        transfers[index].completed_at = now();
    }

    await saveTransfers(transfers);
    return transfers[index];
}

export async function getActiveTransfers(): Promise<FileTransfer[]> {
    const transfers = await getStoredTransfers();
    return transfers.filter(t => t.status === 'pending' || t.status === 'in_progress');
}

export async function getRecentTransfers(limit: number = 20): Promise<FileTransfer[]> {
    const transfers = await getStoredTransfers();
    return transfers
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
        .slice(0, limit);
}

export async function clearCompletedTransfers(): Promise<void> {
    const transfers = await getStoredTransfers();
    const active = transfers.filter(t => t.status === 'pending' || t.status === 'in_progress');
    await saveTransfers(active);
}

// ─── Activity / History ─────────────────────────────────────

async function getStoredActivities(): Promise<FileActivity[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        logger.error('Failed to load activities', error);
        return [];
    }
}

async function saveActivities(activities: FileActivity[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
}

export async function logActivity(
    fileId: string | null,
    folderId: string | null,
    itemName: string,
    action: ActivityAction,
    details?: string
): Promise<FileActivity> {
    const activities = await getStoredActivities();
    const id = generateId();

    const activity: FileActivity = {
        id,
        file_id: fileId,
        folder_id: folderId,
        item_name: itemName,
        action,
        actor_id: 'current-user',
        actor_name: 'You',
        details: details || '',
        created_at: now(),
    };

    activities.unshift(activity);

    // Keep only last 200 activities
    if (activities.length > 200) activities.length = 200;

    await saveActivities(activities);
    return activity;
}

export async function getActivities(limit: number = 50): Promise<FileActivity[]> {
    const activities = await getStoredActivities();
    return activities.slice(0, limit);
}

export async function getActivitiesForFile(fileId: string): Promise<FileActivity[]> {
    const activities = await getStoredActivities();
    return activities.filter(a => a.file_id === fileId);
}

// ─── Search ─────────────────────────────────────────────────

export async function searchFiles(query: string): Promise<CloudFile[]> {
    if (!query.trim()) return [];

    const files = await getStoredFiles();
    const q = query.toLowerCase();

    return files
        .filter(f => !f.is_trashed)
        .filter(f =>
            f.name.toLowerCase().includes(q) ||
            f.description.toLowerCase().includes(q) ||
            f.tags.some(t => t.toLowerCase().includes(q)) ||
            f.extension.toLowerCase().includes(q) ||
            f.category.toLowerCase().includes(q)
        )
        .sort((a, b) => {
            // Prioritize name matches
            const aNameMatch = a.name.toLowerCase().includes(q) ? 1 : 0;
            const bNameMatch = b.name.toLowerCase().includes(q) ? 1 : 0;
            if (aNameMatch !== bNameMatch) return bNameMatch - aNameMatch;
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
}

// ─── Storage Usage ──────────────────────────────────────────

export async function getStorageUsage(): Promise<StorageUsage> {
    const files = await getStoredFiles();
    const folders = await getStoredFolders();
    const active = files.filter(f => !f.is_trashed);

    const byCategory: Record<FileCategory, number> = {
        image: 0,
        video: 0,
        audio: 0,
        document: 0,
        spreadsheet: 0,
        presentation: 0,
        pdf: 0,
        archive: 0,
        code: 0,
        other: 0,
    };

    let totalUsed = 0;
    for (const file of active) {
        byCategory[file.category] += file.size;
        totalUsed += file.size;
    }

    return {
        used: totalUsed,
        total: MAX_STORAGE_BYTES,
        by_category: byCategory,
        file_count: active.length,
        folder_count: folders.filter(f => !f.is_trashed).length,
    };
}

// ─── Batch Operations ───────────────────────────────────────

export async function moveFilesToFolder(
    fileIds: string[],
    targetFolderId: string | null
): Promise<number> {
    const files = await getStoredFiles();
    let count = 0;

    for (const id of fileIds) {
        const index = files.findIndex(f => f.id === id);
        if (index !== -1) {
            files[index].folder_id = targetFolderId;
            files[index].updated_at = now();
            count++;
        }
    }

    await saveFiles(files);
    logger.info(`${count} files moved`);
    return count;
}

export async function trashFiles(fileIds: string[]): Promise<number> {
    const files = await getStoredFiles();
    let count = 0;
    const timestamp = now();

    for (const id of fileIds) {
        const index = files.findIndex(f => f.id === id);
        if (index !== -1) {
            files[index].is_trashed = true;
            files[index].trashed_at = timestamp;
            files[index].updated_at = timestamp;
            count++;
        }
    }

    await saveFiles(files);
    logger.info(`${count} files trashed`);
    return count;
}

export async function tagFiles(fileIds: string[], tags: string[]): Promise<number> {
    const files = await getStoredFiles();
    let count = 0;

    for (const id of fileIds) {
        const index = files.findIndex(f => f.id === id);
        if (index !== -1) {
            const allTags = new Set([...files[index].tags, ...tags]);
            files[index].tags = Array.from(allTags);
            files[index].updated_at = now();
            count++;
        }
    }

    await saveFiles(files);
    return count;
}

// ─── Mock Data ──────────────────────────────────────────────

export function getMockFiles(): CloudFile[] {
    const timestamp = now();
    return [
        {
            id: 'mock-file-1',
            name: 'Photo vacances.jpg',
            extension: 'jpg',
            mime_type: 'image/jpeg',
            category: 'image',
            size: 3_500_000,
            folder_id: 'mock-folder-1',
            owner_id: 'current-user',
            storage_path: 'files/mock-file-1/Photo vacances.jpg',
            local_uri: null,
            thumbnail_url: null,
            is_favorite: true,
            is_trashed: false,
            trashed_at: null,
            tags: ['vacances', 'été'],
            description: 'Photo de la plage',
            color_label: null,
            version: 1,
            versions: [],
            created_at: timestamp,
            updated_at: timestamp,
            last_accessed_at: timestamp,
        },
        {
            id: 'mock-file-2',
            name: 'Budget 2026.xlsx',
            extension: 'xlsx',
            mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            category: 'spreadsheet',
            size: 450_000,
            folder_id: 'mock-folder-2',
            owner_id: 'current-user',
            storage_path: 'files/mock-file-2/Budget 2026.xlsx',
            local_uri: null,
            thumbnail_url: null,
            is_favorite: false,
            is_trashed: false,
            trashed_at: null,
            tags: ['budget', 'travail'],
            description: 'Budget prévisionnel 2026',
            color_label: '#4CAF50',
            version: 3,
            versions: [],
            created_at: timestamp,
            updated_at: timestamp,
            last_accessed_at: timestamp,
        },
        {
            id: 'mock-file-3',
            name: 'Rapport final.pdf',
            extension: 'pdf',
            mime_type: 'application/pdf',
            category: 'pdf',
            size: 2_100_000,
            folder_id: null,
            owner_id: 'current-user',
            storage_path: 'files/mock-file-3/Rapport final.pdf',
            local_uri: null,
            thumbnail_url: null,
            is_favorite: false,
            is_trashed: false,
            trashed_at: null,
            tags: ['rapport'],
            description: 'Rapport de fin de projet',
            color_label: null,
            version: 1,
            versions: [],
            created_at: timestamp,
            updated_at: timestamp,
            last_accessed_at: timestamp,
        },
        {
            id: 'mock-file-4',
            name: 'Présentation Q1.pptx',
            extension: 'pptx',
            mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            category: 'presentation',
            size: 8_200_000,
            folder_id: 'mock-folder-2',
            owner_id: 'current-user',
            storage_path: 'files/mock-file-4/Présentation Q1.pptx',
            local_uri: null,
            thumbnail_url: null,
            is_favorite: true,
            is_trashed: false,
            trashed_at: null,
            tags: ['présentation', 'Q1'],
            description: 'Résultats trimestriels',
            color_label: '#FF9800',
            version: 2,
            versions: [],
            created_at: timestamp,
            updated_at: timestamp,
            last_accessed_at: timestamp,
        },
        {
            id: 'mock-file-5',
            name: 'Notes de réunion.md',
            extension: 'md',
            mime_type: 'text/markdown',
            category: 'document',
            size: 12_500,
            folder_id: null,
            owner_id: 'current-user',
            storage_path: 'files/mock-file-5/Notes de réunion.md',
            local_uri: null,
            thumbnail_url: null,
            is_favorite: false,
            is_trashed: false,
            trashed_at: null,
            tags: ['notes', 'réunion'],
            description: '',
            color_label: null,
            version: 1,
            versions: [],
            created_at: timestamp,
            updated_at: timestamp,
            last_accessed_at: timestamp,
        },
    ];
}

export function getMockFolders(): CloudFolder[] {
    const timestamp = now();
    return [
        {
            id: 'mock-folder-1',
            name: 'Photos',
            parent_id: null,
            owner_id: 'current-user',
            color: '#4CAF50',
            icon: 'images-outline',
            is_favorite: false,
            is_trashed: false,
            trashed_at: null,
            file_count: 24,
            total_size: 85_000_000,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            id: 'mock-folder-2',
            name: 'Travail',
            parent_id: null,
            owner_id: 'current-user',
            color: '#2196F3',
            icon: 'briefcase-outline',
            is_favorite: true,
            is_trashed: false,
            trashed_at: null,
            file_count: 15,
            total_size: 42_000_000,
            created_at: timestamp,
            updated_at: timestamp,
        },
        {
            id: 'mock-folder-3',
            name: 'Musique',
            parent_id: null,
            owner_id: 'current-user',
            color: '#9C27B0',
            icon: 'musical-notes-outline',
            is_favorite: false,
            is_trashed: false,
            trashed_at: null,
            file_count: 120,
            total_size: 950_000_000,
            created_at: timestamp,
            updated_at: timestamp,
        },
    ];
}
