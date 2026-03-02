/**
 * Tests pour le files-store (Zustand).
 *
 * Couvre : File CRUD, Folder CRUD, Trash, Search, Share, Transfer,
 *          Activity, Storage, Batch, UI actions, Helpers.
 *
 * Phase — DEV-020 Module Docs & Storage
 */

import { useFilesStore } from '../files-store';

// ─── Mocks ────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
}));

const mockGetFiles = jest.fn(() => Promise.resolve([]));
const mockCreateFile = jest.fn((data) =>
    Promise.resolve({
        id: 'file-new',
        name: data.name || 'Untitled',
        extension: 'txt',
        mime_type: data.mime_type || 'text/plain',
        category: 'document',
        size: data.size || 0,
        folder_id: data.folder_id || null,
        owner_id: 'me',
        storage_path: null,
        local_uri: null,
        thumbnail_url: null,
        is_favorite: false,
        is_trashed: false,
        trashed_at: null,
        tags: [],
        description: '',
        color_label: null,
        version: 1,
        versions: [],
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T10:00:00Z',
        last_accessed_at: null,
    }),
);
const mockUpdateFile = jest.fn((id, updates) =>
    Promise.resolve({
        id,
        name: updates.name || 'Updated',
        extension: 'txt',
        mime_type: 'text/plain',
        category: 'document',
        size: 100,
        folder_id: updates.folder_id || null,
        owner_id: 'me',
        storage_path: null,
        local_uri: null,
        thumbnail_url: null,
        is_favorite: updates.is_favorite !== undefined ? updates.is_favorite : false,
        is_trashed: false,
        trashed_at: null,
        tags: updates.tags || [],
        description: updates.description || '',
        color_label: null,
        version: 1,
        versions: [],
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T12:00:00Z',
        last_accessed_at: null,
    }),
);
const mockDeleteFile = jest.fn(() => Promise.resolve(true));
const mockMoveToTrash = jest.fn((id) =>
    Promise.resolve({
        id,
        name: 'Trashed',
        extension: 'txt',
        mime_type: 'text/plain',
        category: 'document',
        size: 100,
        folder_id: null,
        owner_id: 'me',
        storage_path: null,
        local_uri: null,
        thumbnail_url: null,
        is_favorite: false,
        is_trashed: true,
        trashed_at: '2026-03-01T10:00:00Z',
        tags: [],
        description: '',
        color_label: null,
        version: 1,
        versions: [],
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T12:00:00Z',
        last_accessed_at: null,
    }),
);
const mockRestoreFromTrash = jest.fn((id) =>
    Promise.resolve({
        id,
        name: 'Restored',
        extension: 'txt',
        mime_type: 'text/plain',
        category: 'document',
        size: 100,
        folder_id: null,
        owner_id: 'me',
        storage_path: null,
        local_uri: null,
        thumbnail_url: null,
        is_favorite: false,
        is_trashed: false,
        trashed_at: null,
        tags: [],
        description: '',
        color_label: null,
        version: 1,
        versions: [],
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T12:00:00Z',
        last_accessed_at: null,
    }),
);
const mockEmptyTrash = jest.fn(() => Promise.resolve());
const mockToggleFavorite = jest.fn((id) =>
    Promise.resolve({
        id,
        name: 'Fav',
        extension: 'txt',
        mime_type: 'text/plain',
        category: 'document',
        size: 100,
        folder_id: null,
        owner_id: 'me',
        storage_path: null,
        local_uri: null,
        thumbnail_url: null,
        is_favorite: true,
        is_trashed: false,
        trashed_at: null,
        tags: [],
        description: '',
        color_label: null,
        version: 1,
        versions: [],
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T12:00:00Z',
        last_accessed_at: null,
    }),
);
const mockMoveFile = jest.fn((id, folderId) =>
    Promise.resolve({
        id,
        name: 'Moved',
        extension: 'txt',
        mime_type: 'text/plain',
        category: 'document',
        size: 100,
        folder_id: folderId,
        owner_id: 'me',
        storage_path: null,
        local_uri: null,
        thumbnail_url: null,
        is_favorite: false,
        is_trashed: false,
        trashed_at: null,
        tags: [],
        description: '',
        color_label: null,
        version: 1,
        versions: [],
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T12:00:00Z',
        last_accessed_at: null,
    }),
);
const mockDuplicateFile = jest.fn((id) =>
    Promise.resolve({
        id: 'file-dup',
        name: 'Copy',
        extension: 'txt',
        mime_type: 'text/plain',
        category: 'document',
        size: 100,
        folder_id: null,
        owner_id: 'me',
        storage_path: null,
        local_uri: null,
        thumbnail_url: null,
        is_favorite: false,
        is_trashed: false,
        trashed_at: null,
        tags: [],
        description: '',
        color_label: null,
        version: 1,
        versions: [],
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T10:00:00Z',
        last_accessed_at: null,
    }),
);
const mockSearchFiles = jest.fn(() => Promise.resolve([]));
const mockGetMockFiles = jest.fn(() => [
    { id: 'mock-1', name: 'Photo.jpg', extension: 'jpg', mime_type: 'image/jpeg', category: 'image', size: 2000, folder_id: null, owner_id: 'me', storage_path: null, local_uri: null, thumbnail_url: null, is_favorite: false, is_trashed: false, trashed_at: null, tags: [], description: '', color_label: null, version: 1, versions: [], created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z', last_accessed_at: null },
]);
const mockGetFolders = jest.fn(() => Promise.resolve([]));
const mockCreateFolder = jest.fn((name) =>
    Promise.resolve({ id: 'folder-new', name, parent_id: null, owner_id: 'me', color: '#4A90D9', icon: 'folder-outline', is_favorite: false, is_trashed: false, file_count: 0, total_size: 0, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' }),
);
const mockUpdateFolder = jest.fn((id, updates) =>
    Promise.resolve({ id, name: updates.name || 'Updated', parent_id: null, owner_id: 'me', color: '#4A90D9', icon: 'folder-outline', is_favorite: false, is_trashed: false, file_count: 0, total_size: 0, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T12:00:00Z' }),
);
const mockDeleteFolder = jest.fn(() => Promise.resolve(true));
const mockTrashFolder = jest.fn((id) =>
    Promise.resolve({ id, name: 'Trashed', parent_id: null, owner_id: 'me', color: '#4A90D9', icon: 'folder-outline', is_favorite: false, is_trashed: true, file_count: 0, total_size: 0, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T12:00:00Z' }),
);
const mockGetMockFolders = jest.fn(() => [
    { id: 'mf-1', name: 'Photos', parent_id: null, owner_id: 'me', color: '#4FC3F7', icon: 'images-outline', is_favorite: false, is_trashed: false, file_count: 3, total_size: 15000, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
]);
const mockGetBreadcrumbs = jest.fn(() => Promise.resolve([{ id: null, name: 'Mon Drive' }]));
const mockShareFile = jest.fn((fileId, userId, perm) =>
    Promise.resolve({ id: 'share-new', file_id: fileId, folder_id: null, shared_by_id: 'me', shared_by_name: 'Me', shared_with_id: userId, shared_with_email: null, permission: perm, can_reshare: false, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' }),
);
const mockRemoveShare = jest.fn(() => Promise.resolve(true));
const mockGetSharesForFile = jest.fn(() => Promise.resolve([]));
const mockCreateShareLink = jest.fn((fileId) =>
    Promise.resolve({ id: 'link-new', file_id: fileId, token: 'abc123', permission: 'view', is_active: true, created_by: 'me', password: null, expires_at: null, max_downloads: null, download_count: 0, created_at: '2026-03-01T10:00:00Z' }),
);
const mockDeactivateShareLink = jest.fn((id) =>
    Promise.resolve({ id, file_id: 'f1', token: 'abc123', permission: 'view', is_active: false, created_by: 'me', password: null, expires_at: null, max_downloads: null, download_count: 0, created_at: '2026-03-01T10:00:00Z' }),
);
const mockGetShareLinksForFile = jest.fn(() => Promise.resolve([]));
const mockGetActiveTransfers = jest.fn(() => Promise.resolve([]));
const mockClearCompletedTransfers = jest.fn(() => Promise.resolve());
const mockGetActivities = jest.fn(() => Promise.resolve([]));
const mockGetStorageUsage = jest.fn(() =>
    Promise.resolve({ used: 5000, total: 5368709120, by_category: { image: 3000, document: 2000 }, file_count: 2, folder_count: 1 }),
);
const mockMoveFilesToFolder = jest.fn(() => Promise.resolve());
const mockTrashFilesApi = jest.fn(() => Promise.resolve());
const mockTagFiles = jest.fn(() => Promise.resolve());
const mockShareFolder = jest.fn((folderId, userId, perm) =>
    Promise.resolve({ id: 'share-folder', file_id: null, folder_id: folderId, shared_by_id: 'me', shared_by_name: 'Me', shared_with_id: userId, shared_with_email: null, permission: perm, can_reshare: false, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' }),
);

jest.mock('@/services/files-api', () => ({
    getFiles: (...args) => mockGetFiles(...args),
    createFile: (...args) => mockCreateFile(...args),
    updateFile: (...args) => mockUpdateFile(...args),
    deleteFile: (...args) => mockDeleteFile(...args),
    moveToTrash: (...args) => mockMoveToTrash(...args),
    restoreFromTrash: (...args) => mockRestoreFromTrash(...args),
    emptyTrash: (...args) => mockEmptyTrash(...args),
    toggleFavorite: (...args) => mockToggleFavorite(...args),
    moveFile: (...args) => mockMoveFile(...args),
    duplicateFile: (...args) => mockDuplicateFile(...args),
    searchFiles: (...args) => mockSearchFiles(...args),
    getMockFiles: (...args) => mockGetMockFiles(...args),
    getFolders: (...args) => mockGetFolders(...args),
    createFolder: (...args) => mockCreateFolder(...args),
    updateFolder: (...args) => mockUpdateFolder(...args),
    deleteFolder: (...args) => mockDeleteFolder(...args),
    trashFolder: (...args) => mockTrashFolder(...args),
    getMockFolders: (...args) => mockGetMockFolders(...args),
    getBreadcrumbs: (...args) => mockGetBreadcrumbs(...args),
    getSharesForFile: (...args) => mockGetSharesForFile(...args),
    shareFile: (...args) => mockShareFile(...args),
    shareFolder: (...args) => mockShareFolder(...args),
    removeShare: (...args) => mockRemoveShare(...args),
    createShareLink: (...args) => mockCreateShareLink(...args),
    getShareLinksForFile: (...args) => mockGetShareLinksForFile(...args),
    deactivateShareLink: (...args) => mockDeactivateShareLink(...args),
    getActiveTransfers: (...args) => mockGetActiveTransfers(...args),
    clearCompletedTransfers: (...args) => mockClearCompletedTransfers(...args),
    getActivities: (...args) => mockGetActivities(...args),
    getStorageUsage: (...args) => mockGetStorageUsage(...args),
    moveFilesToFolder: (...args) => mockMoveFilesToFolder(...args),
    trashFiles: (...args) => mockTrashFilesApi(...args),
    tagFiles: (...args) => mockTagFiles(...args),
    getFileById: jest.fn(() => Promise.resolve(null)),
    updateLastAccessed: jest.fn(() => Promise.resolve(null)),
    getSharesForFolder: jest.fn(() => Promise.resolve([])),
    getSharedWithMe: jest.fn(() => Promise.resolve([])),
    getRecentTransfers: jest.fn(() => Promise.resolve([])),
    getActivitiesForFile: jest.fn(() => Promise.resolve([])),
    getTrashedFiles: jest.fn(() => Promise.resolve([])),
    restoreFolder: jest.fn(() => Promise.resolve({})),
}));

// ─── Helpers ──────────────────────────────────────────────────

function resetStore() {
    const store = useFilesStore.getState();
    useFilesStore.setState({
        files: [],
        folders: [],
        currentFile: null,
        currentFolder: null,
        breadcrumbs: [{ id: null, name: 'Mon Drive' }],
        shares: [],
        shareLinks: [],
        transfers: [],
        activities: [],
        storageUsage: null,
        searchResults: [],
        searchQuery: '',
        isLoading: false,
        isInitialized: false,
        error: null,
        viewMode: 'grid',
        sortBy: 'updated',
        sortDirection: 'desc',
        filterCategory: 'all',
        showTrashed: false,
        selectedFileIds: [],
    });
}

beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════
// File CRUD
// ═══════════════════════════════════════════════════════════════

describe('File CRUD', () => {
    test('loadFiles loads from API', async () => {
        mockGetFiles.mockResolvedValueOnce([
            { id: 'f1', name: 'A.txt', extension: 'txt', mime_type: 'text/plain', category: 'document', size: 100, folder_id: null, owner_id: 'me', storage_path: null, local_uri: null, thumbnail_url: null, is_favorite: false, is_trashed: false, trashed_at: null, tags: [], description: '', color_label: null, version: 1, versions: [], created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z', last_accessed_at: null },
        ]);
        await useFilesStore.getState().loadFiles();
        expect(useFilesStore.getState().files).toHaveLength(1);
        expect(useFilesStore.getState().isLoading).toBe(false);
    });

    test('loadFiles falls back to mock when empty', async () => {
        mockGetFiles.mockResolvedValueOnce([]);
        await useFilesStore.getState().loadFiles();
        expect(mockGetMockFiles).toHaveBeenCalled();
        expect(useFilesStore.getState().files).toHaveLength(1); // 1 mock file
    });

    test('createFile adds file to store', async () => {
        await useFilesStore.getState().createFile({ name: 'new.txt', mime_type: 'text/plain', size: 500 });
        expect(mockCreateFile).toHaveBeenCalled();
        expect(useFilesStore.getState().files).toHaveLength(1);
        expect(useFilesStore.getState().files[0].id).toBe('file-new');
    });

    test('updateFile updates file in store', async () => {
        useFilesStore.setState({
            files: [{ id: 'f1', name: 'Old', extension: 'txt', mime_type: 'text/plain', category: 'document', size: 100, folder_id: null, owner_id: 'me', storage_path: null, local_uri: null, thumbnail_url: null, is_favorite: false, is_trashed: false, trashed_at: null, tags: [], description: '', color_label: null, version: 1, versions: [], created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z', last_accessed_at: null }],
        });
        await useFilesStore.getState().updateFile('f1', { name: 'New' });
        expect(mockUpdateFile).toHaveBeenCalledWith('f1', { name: 'New' });
        expect(useFilesStore.getState().files[0].name).toBe('New');
    });

    test('moveToTrash removes file from store', async () => {
        useFilesStore.setState({
            files: [{ id: 'f1', name: 'A', extension: 'txt', mime_type: 'text/plain', category: 'document', size: 100, folder_id: null, owner_id: 'me', storage_path: null, local_uri: null, thumbnail_url: null, is_favorite: false, is_trashed: false, trashed_at: null, tags: [], description: '', color_label: null, version: 1, versions: [], created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z', last_accessed_at: null }],
        });
        await useFilesStore.getState().moveToTrash('f1');
        expect(useFilesStore.getState().files).toHaveLength(0);
    });

    test('restoreFromTrash un-trashes file', async () => {
        useFilesStore.setState({
            files: [{ id: 'f1', name: 'A', extension: 'txt', mime_type: 'text/plain', category: 'document', size: 100, folder_id: null, owner_id: 'me', storage_path: null, local_uri: null, thumbnail_url: null, is_favorite: false, is_trashed: true, trashed_at: '2026-03-01T10:00:00Z', tags: [], description: '', color_label: null, version: 1, versions: [], created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z', last_accessed_at: null }],
        });
        await useFilesStore.getState().restoreFromTrash('f1');
        const file = useFilesStore.getState().files.find((f) => f.id === 'f1');
        expect(file.is_trashed).toBe(false);
    });

    test('deleteFilePermanently removes from store', async () => {
        useFilesStore.setState({
            files: [{ id: 'f1', name: 'A', extension: 'txt', mime_type: 'text/plain', category: 'document', size: 100, folder_id: null, owner_id: 'me', storage_path: null, local_uri: null, thumbnail_url: null, is_favorite: false, is_trashed: true, trashed_at: '2026-03-01T10:00:00Z', tags: [], description: '', color_label: null, version: 1, versions: [], created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z', last_accessed_at: null }],
        });
        await useFilesStore.getState().deleteFilePermanently('f1');
        expect(useFilesStore.getState().files).toHaveLength(0);
    });

    test('emptyTrash removes all trashed', async () => {
        useFilesStore.setState({
            files: [
                { id: 'f1', name: 'Trashed', extension: 'txt', mime_type: 'text/plain', category: 'document', size: 100, folder_id: null, owner_id: 'me', storage_path: null, local_uri: null, thumbnail_url: null, is_favorite: false, is_trashed: true, trashed_at: '2026-03-01', tags: [], description: '', color_label: null, version: 1, versions: [], created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z', last_accessed_at: null },
                { id: 'f2', name: 'Active', extension: 'txt', mime_type: 'text/plain', category: 'document', size: 100, folder_id: null, owner_id: 'me', storage_path: null, local_uri: null, thumbnail_url: null, is_favorite: false, is_trashed: false, trashed_at: null, tags: [], description: '', color_label: null, version: 1, versions: [], created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z', last_accessed_at: null },
            ],
        });
        await useFilesStore.getState().emptyTrash();
        expect(useFilesStore.getState().files).toHaveLength(1);
        expect(useFilesStore.getState().files[0].id).toBe('f2');
    });

    test('toggleFavorite updates file', async () => {
        useFilesStore.setState({
            files: [{ id: 'f1', name: 'A', extension: 'txt', mime_type: 'text/plain', category: 'document', size: 100, folder_id: null, owner_id: 'me', storage_path: null, local_uri: null, thumbnail_url: null, is_favorite: false, is_trashed: false, trashed_at: null, tags: [], description: '', color_label: null, version: 1, versions: [], created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z', last_accessed_at: null }],
        });
        await useFilesStore.getState().toggleFavorite('f1');
        expect(useFilesStore.getState().files[0].is_favorite).toBe(true);
    });

    test('moveFile changes folder_id', async () => {
        useFilesStore.setState({
            files: [{ id: 'f1', name: 'A', extension: 'txt', mime_type: 'text/plain', category: 'document', size: 100, folder_id: null, owner_id: 'me', storage_path: null, local_uri: null, thumbnail_url: null, is_favorite: false, is_trashed: false, trashed_at: null, tags: [], description: '', color_label: null, version: 1, versions: [], created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z', last_accessed_at: null }],
        });
        await useFilesStore.getState().moveFile('f1', 'folder-1');
        expect(useFilesStore.getState().files[0].folder_id).toBe('folder-1');
    });

    test('duplicateFile adds copy to store', async () => {
        useFilesStore.setState({
            files: [{ id: 'f1', name: 'A', extension: 'txt', mime_type: 'text/plain', category: 'document', size: 100, folder_id: null, owner_id: 'me', storage_path: null, local_uri: null, thumbnail_url: null, is_favorite: false, is_trashed: false, trashed_at: null, tags: [], description: '', color_label: null, version: 1, versions: [], created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z', last_accessed_at: null }],
        });
        await useFilesStore.getState().duplicateFile('f1');
        expect(useFilesStore.getState().files).toHaveLength(2);
    });
});

// ═══════════════════════════════════════════════════════════════
// Folder CRUD
// ═══════════════════════════════════════════════════════════════

describe('Folder CRUD', () => {
    test('loadFolders loads from API', async () => {
        mockGetFolders.mockResolvedValueOnce([
            { id: 'fo1', name: 'Photos', parent_id: null, owner_id: 'me', color: '#4FC3F7', icon: 'images-outline', is_favorite: false, is_trashed: false, file_count: 3, total_size: 15000, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
        ]);
        await useFilesStore.getState().loadFolders();
        expect(useFilesStore.getState().folders).toHaveLength(1);
    });

    test('createFolder adds folder', async () => {
        await useFilesStore.getState().createFolder('New Folder');
        expect(mockCreateFolder).toHaveBeenCalled();
        expect(useFilesStore.getState().folders).toHaveLength(1);
    });

    test('updateFolder updates in store', async () => {
        useFilesStore.setState({
            folders: [{ id: 'fo1', name: 'Old', parent_id: null, owner_id: 'me', color: '#4A90D9', icon: 'folder-outline', is_favorite: false, is_trashed: false, file_count: 0, total_size: 0, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' }],
        });
        await useFilesStore.getState().updateFolder('fo1', { name: 'Renamed' });
        expect(useFilesStore.getState().folders[0].name).toBe('Renamed');
    });

    test('deleteFolder removes from store', async () => {
        useFilesStore.setState({
            folders: [{ id: 'fo1', name: 'Del', parent_id: null, owner_id: 'me', color: '#4A90D9', icon: 'folder-outline', is_favorite: false, is_trashed: false, file_count: 0, total_size: 0, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' }],
        });
        await useFilesStore.getState().deleteFolder('fo1');
        expect(useFilesStore.getState().folders).toHaveLength(0);
    });

    test('trashFolder removes folder from store', async () => {
        useFilesStore.setState({
            folders: [{ id: 'fo1', name: 'Trash', parent_id: null, owner_id: 'me', color: '#4A90D9', icon: 'folder-outline', is_favorite: false, is_trashed: false, file_count: 0, total_size: 0, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' }],
        });
        await useFilesStore.getState().trashFolder('fo1');
        expect(useFilesStore.getState().folders).toHaveLength(0);
    });

    test('navigateToFolder updates breadcrumbs and currentFolder', async () => {
        await useFilesStore.getState().navigateToFolder('folder-1');
        expect(mockGetBreadcrumbs).toHaveBeenCalledWith('folder-1');
    });
});

// ═══════════════════════════════════════════════════════════════
// Search
// ═══════════════════════════════════════════════════════════════

describe('Search', () => {
    test('searchFiles updates searchQuery and searchResults', async () => {
        mockSearchFiles.mockResolvedValueOnce([
            { id: 'f1', name: 'Result.txt', extension: 'txt', mime_type: 'text/plain', category: 'document', size: 100, folder_id: null, owner_id: 'me', storage_path: null, local_uri: null, thumbnail_url: null, is_favorite: false, is_trashed: false, trashed_at: null, tags: [], description: '', color_label: null, version: 1, versions: [], created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z', last_accessed_at: null },
        ]);
        await useFilesStore.getState().searchFiles('Result');
        expect(useFilesStore.getState().searchQuery).toBe('Result');
        expect(useFilesStore.getState().searchResults).toHaveLength(1);
    });

    test('searchFiles clears results for empty query', async () => {
        useFilesStore.setState({ searchQuery: 'old', searchResults: [{ id: 'x' }] });
        await useFilesStore.getState().searchFiles('');
        expect(useFilesStore.getState().searchQuery).toBe('');
        expect(useFilesStore.getState().searchResults).toHaveLength(0);
    });
});

// ═══════════════════════════════════════════════════════════════
// Share actions
// ═══════════════════════════════════════════════════════════════

describe('Share actions', () => {
    test('shareFile adds share to store', async () => {
        await useFilesStore.getState().shareFile('f1', 'user-2', 'edit');
        expect(mockShareFile).toHaveBeenCalledWith('f1', 'user-2', 'edit', undefined);
        expect(useFilesStore.getState().shares).toHaveLength(1);
    });

    test('shareFolder adds share to store', async () => {
        await useFilesStore.getState().shareFolder('fo1', 'user-2', 'view');
        expect(mockShareFolder).toHaveBeenCalledWith('fo1', 'user-2', 'view', undefined);
        expect(useFilesStore.getState().shares).toHaveLength(1);
    });

    test('removeShare removes from store', async () => {
        useFilesStore.setState({
            shares: [{ id: 'share-1', file_id: 'f1', folder_id: null, shared_by_id: 'me', shared_by_name: 'Me', shared_with_id: 'u2', shared_with_email: null, permission: 'view', can_reshare: false, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' }],
        });
        await useFilesStore.getState().removeShare('share-1');
        expect(useFilesStore.getState().shares).toHaveLength(0);
    });

    test('createShareLink adds link to store', async () => {
        await useFilesStore.getState().createShareLink('f1');
        expect(useFilesStore.getState().shareLinks).toHaveLength(1);
        expect(useFilesStore.getState().shareLinks[0].token).toBe('abc123');
    });

    test('deactivateShareLink removes link from store', async () => {
        useFilesStore.setState({
            shareLinks: [{ id: 'link-1', file_id: 'f1', token: 'abc123', permission: 'view', is_active: true, created_by: 'me', password: null, expires_at: null, max_downloads: null, download_count: 0, created_at: '2026-03-01T10:00:00Z' }],
        });
        await useFilesStore.getState().deactivateShareLink('link-1');
        expect(useFilesStore.getState().shareLinks).toHaveLength(0);
    });
});

// ═══════════════════════════════════════════════════════════════
// Transfer / Activity / Storage
// ═══════════════════════════════════════════════════════════════

describe('Transfer / Activity / Storage', () => {
    test('loadTransfers populates transfers', async () => {
        const mockGetRecentTransfers = jest.fn(() => Promise.resolve([
            { id: 't1', file_name: 'a.txt', file_size: 100, type: 'upload', progress: 50, status: 'in_progress', started_at: '2026-03-01T10:00:00Z', completed_at: null, local_uri: 'local://a', storage_path: null, error_message: null },
        ]));
        jest.spyOn(require('@/services/files-api'), 'getRecentTransfers').mockImplementation(mockGetRecentTransfers);
        await useFilesStore.getState().loadTransfers();
        expect(useFilesStore.getState().transfers).toHaveLength(1);
    });

    test('loadActivities populates activities', async () => {
        mockGetActivities.mockResolvedValueOnce([
            { id: 'a1', action: 'created', file_id: 'f1', file_name: 'test.txt', folder_id: null, folder_name: null, actor_id: 'me', actor_name: 'Me', details: null, timestamp: '2026-03-01T10:00:00Z' },
        ]);
        await useFilesStore.getState().loadActivities();
        expect(useFilesStore.getState().activities).toHaveLength(1);
    });

    test('loadStorageUsage populates storage', async () => {
        await useFilesStore.getState().loadStorageUsage();
        const usage = useFilesStore.getState().storageUsage;
        expect(usage).not.toBeNull();
        expect(usage.used).toBe(5000);
        expect(usage.file_count).toBe(2);
    });

    test('clearCompletedTransfers calls api', async () => {
        await useFilesStore.getState().clearCompletedTransfers();
        expect(mockClearCompletedTransfers).toHaveBeenCalled();
    });
});

// ═══════════════════════════════════════════════════════════════
// Selection
// ═══════════════════════════════════════════════════════════════

describe('Selection', () => {
    test('toggleSelection adds/removes file ids', () => {
        useFilesStore.getState().toggleSelection('f1');
        expect(useFilesStore.getState().selectedFileIds).toEqual(['f1']);
        useFilesStore.getState().toggleSelection('f1');
        expect(useFilesStore.getState().selectedFileIds).toEqual([]);
    });

    test('clearSelection clears all', () => {
        useFilesStore.setState({ selectedFileIds: ['f1', 'f2'] });
        useFilesStore.getState().clearSelection();
        expect(useFilesStore.getState().selectedFileIds).toEqual([]);
    });

    test('selectAll selects all file ids', () => {
        useFilesStore.setState({
            files: [
                { id: 'f1', name: 'A', is_trashed: false },
                { id: 'f2', name: 'B', is_trashed: false },
                { id: 'f3', name: 'C', is_trashed: true },
            ],
        });
        useFilesStore.getState().selectAll();
        expect(useFilesStore.getState().selectedFileIds).toEqual(['f1', 'f2', 'f3']);
    });
});

// ═══════════════════════════════════════════════════════════════
// Batch Operations
// ═══════════════════════════════════════════════════════════════

describe('Batch Operations', () => {
    test('moveFilesToFolder calls API and reloads', async () => {
        await useFilesStore.getState().moveFilesToFolder(['f1', 'f2'], 'folder-1');
        expect(mockMoveFilesToFolder).toHaveBeenCalledWith(['f1', 'f2'], 'folder-1');
    });

    test('trashFiles calls API and reloads', async () => {
        await useFilesStore.getState().trashFiles(['f1', 'f2']);
        expect(mockTrashFilesApi).toHaveBeenCalledWith(['f1', 'f2']);
    });

    test('tagFiles calls API and reloads', async () => {
        await useFilesStore.getState().tagFiles(['f1'], ['urgent']);
        expect(mockTagFiles).toHaveBeenCalledWith(['f1'], ['urgent']);
    });
});

// ═══════════════════════════════════════════════════════════════
// UI Actions
// ═══════════════════════════════════════════════════════════════

describe('UI Actions', () => {
    test('setViewMode changes view', () => {
        useFilesStore.getState().setViewMode('list');
        expect(useFilesStore.getState().viewMode).toBe('list');
    });

    test('setSortBy changes sort option', () => {
        useFilesStore.getState().setSortBy('name');
        expect(useFilesStore.getState().sortBy).toBe('name');
    });

    test('setSortDirection changes direction', () => {
        useFilesStore.getState().setSortDirection('asc');
        expect(useFilesStore.getState().sortDirection).toBe('asc');
    });

    test('setFilterCategory changes filter', () => {
        useFilesStore.getState().setFilterCategory('image');
        expect(useFilesStore.getState().filterCategory).toBe('image');
    });

    test('setShowTrashed toggles trashed view', () => {
        useFilesStore.getState().setShowTrashed(true);
        expect(useFilesStore.getState().showTrashed).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

describe('Helpers', () => {
    const baseFile = {
        extension: 'txt',
        mime_type: 'text/plain',
        category: 'document',
        folder_id: null,
        owner_id: 'me',
        storage_path: null,
        local_uri: null,
        thumbnail_url: null,
        trashed_at: null,
        tags: [],
        description: '',
        color_label: null,
        version: 1,
        versions: [],
        last_accessed_at: null,
    };

    test('getFilteredFiles filters by category', () => {
        useFilesStore.setState({
            files: [
                { ...baseFile, id: 'f1', name: 'A.txt', size: 100, is_favorite: false, is_trashed: false, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
                { ...baseFile, id: 'f2', name: 'B.jpg', category: 'image', size: 200, is_favorite: false, is_trashed: false, created_at: '2026-03-02T10:00:00Z', updated_at: '2026-03-02T10:00:00Z' },
            ],
            filterCategory: 'image',
        });
        const filtered = useFilesStore.getState().getFilteredFiles();
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('f2');
    });

    test('getFilteredFiles excludes trashed', () => {
        useFilesStore.setState({
            files: [
                { ...baseFile, id: 'f1', name: 'Active', size: 100, is_favorite: false, is_trashed: false, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
                { ...baseFile, id: 'f2', name: 'Trashed', size: 200, is_favorite: false, is_trashed: true, created_at: '2026-03-02T10:00:00Z', updated_at: '2026-03-02T10:00:00Z' },
            ],
            filterCategory: 'all',
            showTrashed: false,
        });
        const filtered = useFilesStore.getState().getFilteredFiles();
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('f1');
    });

    test('getRecentFiles returns max 8 recent', () => {
        const files = Array.from({ length: 12 }, (_, i) => ({
            ...baseFile,
            id: `f${i}`,
            name: `File ${i}`,
            size: 100,
            is_favorite: false,
            is_trashed: false,
            created_at: `2026-03-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
            updated_at: `2026-03-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
        }));
        useFilesStore.setState({ files });
        const recent = useFilesStore.getState().getRecentFiles(8);
        expect(recent).toHaveLength(8);
    });

    test('getFavoriteFiles returns only favorites', () => {
        useFilesStore.setState({
            files: [
                { ...baseFile, id: 'f1', name: 'Fav', size: 100, is_favorite: true, is_trashed: false, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
                { ...baseFile, id: 'f2', name: 'NotFav', size: 200, is_favorite: false, is_trashed: false, created_at: '2026-03-02T10:00:00Z', updated_at: '2026-03-02T10:00:00Z' },
            ],
        });
        const favs = useFilesStore.getState().getFavoriteFiles();
        expect(favs).toHaveLength(1);
        expect(favs[0].id).toBe('f1');
    });

    test('getFileCounts returns counts by category', () => {
        useFilesStore.setState({
            files: [
                { ...baseFile, id: 'f1', name: 'A', category: 'document', size: 100, is_favorite: false, is_trashed: false, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
                { ...baseFile, id: 'f2', name: 'B', category: 'image', size: 200, is_favorite: false, is_trashed: false, created_at: '2026-03-02T10:00:00Z', updated_at: '2026-03-02T10:00:00Z' },
                { ...baseFile, id: 'f3', name: 'C', category: 'image', size: 300, is_favorite: false, is_trashed: false, created_at: '2026-03-03T10:00:00Z', updated_at: '2026-03-03T10:00:00Z' },
            ],
        });
        const counts = useFilesStore.getState().getFileCounts();
        expect(counts.all).toBe(3);
        expect(counts.document).toBe(1);
        expect(counts.image).toBe(2);
    });
});

// ═══════════════════════════════════════════════════════════════
// Open/Close File
// ═══════════════════════════════════════════════════════════════

describe('Open/Close File', () => {
    test('openFile sets currentFile', async () => {
        useFilesStore.setState({
            files: [{ id: 'f1', name: 'Open', extension: 'txt', mime_type: 'text/plain', category: 'document', size: 100, folder_id: null, owner_id: 'me', storage_path: null, local_uri: null, thumbnail_url: null, is_favorite: false, is_trashed: false, trashed_at: null, tags: [], description: '', color_label: null, version: 1, versions: [], created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z', last_accessed_at: null }],
        });
        await useFilesStore.getState().openFile('f1');
        expect(useFilesStore.getState().currentFile).not.toBeNull();
        expect(useFilesStore.getState().currentFile.id).toBe('f1');
    });

    test('closeFile clears currentFile', () => {
        useFilesStore.setState({ currentFile: { id: 'f1', name: 'X' } });
        useFilesStore.getState().closeFile();
        expect(useFilesStore.getState().currentFile).toBeNull();
    });
});
