/**
 * Tests pour le office-store (Zustand).
 *
 * Couvre : Document CRUD, Folder CRUD, Journal CRUD, PDF Management,
 *          Signatures, Export, UI actions, Helpers (filtered, count, recent, favorites).
 *
 * Phase — DEV-019 Module Office
 */

import { useOfficeStore } from '../office-store';

// ─── Mocks ────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
}));

const mockGetDocuments = jest.fn(() => Promise.resolve([]));
const mockCreateDocument = jest.fn((title, type, content) =>
    Promise.resolve({
        id: 'doc-new',
        title: title || 'Sans titre',
        type,
        content: content || '',
        blocks: [],
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T10:00:00Z',
        is_favorite: false,
        is_pinned: false,
        is_encrypted: false,
        tags: [],
        word_count: 0,
        thumbnail_url: null,
        folder_id: null,
    }),
);
const mockUpdateDocument = jest.fn((id, updates) =>
    Promise.resolve({
        id,
        title: updates.title || 'Updated',
        type: 'note',
        content: updates.content || '',
        blocks: updates.blocks || [],
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T12:00:00Z',
        is_favorite: updates.is_favorite || false,
        is_pinned: updates.is_pinned || false,
        is_encrypted: false,
        tags: updates.tags || [],
        word_count: 0,
        thumbnail_url: null,
        folder_id: updates.folder_id || null,
    }),
);
const mockDeleteDocument = jest.fn(() => Promise.resolve(true));
const mockGetDocumentById = jest.fn((id) =>
    Promise.resolve({
        id,
        title: 'Found Doc',
        type: 'note',
        content: 'found content',
        blocks: [],
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T10:00:00Z',
        is_favorite: false,
        is_pinned: false,
        is_encrypted: false,
        tags: [],
        word_count: 2,
        thumbnail_url: null,
        folder_id: null,
    }),
);
const mockSearchDocuments = jest.fn(() => Promise.resolve([]));
const mockToggleFavorite = jest.fn(() => Promise.resolve(true));
const mockTogglePin = jest.fn(() => Promise.resolve(true));
const mockGetFolders = jest.fn(() => Promise.resolve([]));
const mockCreateFolder = jest.fn((name, color) =>
    Promise.resolve({ id: 'folder-new', name, parent_id: null, color: color || '#4A90D9', icon: '📁', document_count: 0, created_at: '2026-03-01' }),
);
const mockDeleteFolder = jest.fn(() => Promise.resolve(true));
const mockGetJournalEntries = jest.fn(() => Promise.resolve([]));
const mockCreateJournalEntry = jest.fn((title, content, mood) =>
    Promise.resolve({ id: 'je-new', date: '2026-03-01', title, content: content || '', blocks: [], mood: mood || null, tags: [], is_encrypted: false, weather: null, location: null, word_count: 0, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' }),
);
const mockUpdateJournalEntry = jest.fn((id, updates) =>
    Promise.resolve({ id, date: '2026-03-01', title: updates.title || 'Updated', content: updates.content || '', blocks: [], mood: updates.mood || null, tags: [], is_encrypted: false, weather: null, location: null, word_count: 0, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T12:00:00Z' }),
);
const mockDeleteJournalEntry = jest.fn(() => Promise.resolve(true));
const mockGetPdfDocuments = jest.fn(() => Promise.resolve([]));
const mockAddPdfDocument = jest.fn((title, fileUri, pageCount, fileSize) =>
    Promise.resolve({ id: 'pdf-new', title, file_uri: fileUri, page_count: pageCount || 0, current_page: 1, annotations: [], bookmarks: [], file_size: fileSize || 0 }),
);
const mockUpdatePdfPage = jest.fn(() => Promise.resolve());
const mockAddPdfAnnotation = jest.fn((pdfId, ann) =>
    Promise.resolve({ ...ann, id: 'ann-new', created_at: '2026-03-01' }),
);
const mockRemovePdfAnnotation = jest.fn(() => Promise.resolve(true));
const mockTogglePdfBookmark = jest.fn(() => Promise.resolve(true));
const mockDeletePdfDocument = jest.fn(() => Promise.resolve(true));
const mockGetSignatures = jest.fn(() => Promise.resolve([]));
const mockCreateSignature = jest.fn((name, svgPath, pngBase64) =>
    Promise.resolve({ id: 'sig-new', name, svg_path: svgPath, png_base64: pngBase64, created_at: '2026-03-01', is_default: true }),
);
const mockDeleteSignature = jest.fn(() => Promise.resolve(true));
const mockSetDefaultSignature = jest.fn(() => Promise.resolve(true));
const mockGetSignatureRequests = jest.fn(() => Promise.resolve([]));
const mockSignDocument = jest.fn((docId, docTitle, signer, sigId) =>
    Promise.resolve({ document_id: docId, document_title: docTitle, signer_name: signer, signature_id: sigId, signed_at: '2026-03-01', status: 'signed' }),
);
const mockExportDocumentContent = jest.fn(() => '# Exported');
const mockGetMockDocuments = jest.fn(() => [
    { id: 'mock-1', title: 'Mock Note', type: 'note', content: '', blocks: [], created_at: '2026-03-01', updated_at: '2026-03-01', is_favorite: false, is_pinned: false, is_encrypted: false, tags: [], word_count: 0, thumbnail_url: null, folder_id: null },
]);
const mockGetMockJournalEntries = jest.fn(() => [
    { id: 'mock-je-1', date: '2026-03-01', title: 'Mock Entry', content: '', blocks: [], mood: 'good', tags: [], is_encrypted: false, weather: null, location: null, word_count: 0, created_at: '2026-03-01', updated_at: '2026-03-01' },
]);

jest.mock('@/services/office-api', () => ({
    getDocuments: (...args) => mockGetDocuments(...args),
    createDocument: (...args) => mockCreateDocument(...args),
    updateDocument: (...args) => mockUpdateDocument(...args),
    deleteDocument: (...args) => mockDeleteDocument(...args),
    getDocumentById: (...args) => mockGetDocumentById(...args),
    searchDocuments: (...args) => mockSearchDocuments(...args),
    toggleFavorite: (...args) => mockToggleFavorite(...args),
    togglePin: (...args) => mockTogglePin(...args),
    getFolders: (...args) => mockGetFolders(...args),
    createFolder: (...args) => mockCreateFolder(...args),
    deleteFolder: (...args) => mockDeleteFolder(...args),
    getJournalEntries: (...args) => mockGetJournalEntries(...args),
    createJournalEntry: (...args) => mockCreateJournalEntry(...args),
    updateJournalEntry: (...args) => mockUpdateJournalEntry(...args),
    deleteJournalEntry: (...args) => mockDeleteJournalEntry(...args),
    getPdfDocuments: (...args) => mockGetPdfDocuments(...args),
    addPdfDocument: (...args) => mockAddPdfDocument(...args),
    updatePdfPage: (...args) => mockUpdatePdfPage(...args),
    addPdfAnnotation: (...args) => mockAddPdfAnnotation(...args),
    removePdfAnnotation: (...args) => mockRemovePdfAnnotation(...args),
    togglePdfBookmark: (...args) => mockTogglePdfBookmark(...args),
    deletePdfDocument: (...args) => mockDeletePdfDocument(...args),
    getSignatures: (...args) => mockGetSignatures(...args),
    createSignature: (...args) => mockCreateSignature(...args),
    deleteSignature: (...args) => mockDeleteSignature(...args),
    setDefaultSignature: (...args) => mockSetDefaultSignature(...args),
    getSignatureRequests: (...args) => mockGetSignatureRequests(...args),
    signDocument: (...args) => mockSignDocument(...args),
    exportDocumentContent: (...args) => mockExportDocumentContent(...args),
    getMockDocuments: (...args) => mockGetMockDocuments(...args),
    getMockJournalEntries: (...args) => mockGetMockJournalEntries(...args),
}));

jest.mock('@/services/logger', () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

// ─── Reset store between tests ────────────────────────────────

function resetStore() {
    useOfficeStore.setState({
        documents: [],
        folders: [],
        currentDocument: null,
        journalEntries: [],
        currentJournalEntry: null,
        pdfDocuments: [],
        currentPdf: null,
        signatures: [],
        signatureRequests: [],
        isLoading: false,
        searchQuery: '',
        sortBy: 'updated',
        filterType: 'all',
        currentFolderId: null,
    });
}

beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════
// Document Actions
// ═══════════════════════════════════════════════════════════════

describe('Document Actions', () => {
    test('loadDocuments sets documents from API', async () => {
        mockGetDocuments.mockResolvedValueOnce([
            { id: 'd1', title: 'Doc 1', type: 'note', is_pinned: false },
        ]);
        await useOfficeStore.getState().loadDocuments();
        expect(useOfficeStore.getState().documents).toHaveLength(1);
        expect(useOfficeStore.getState().isLoading).toBe(false);
    });

    test('loadDocuments loads mock data when empty', async () => {
        mockGetDocuments.mockResolvedValueOnce([]);
        await useOfficeStore.getState().loadDocuments();
        expect(mockGetMockDocuments).toHaveBeenCalled();
        expect(useOfficeStore.getState().documents).toHaveLength(1);
    });

    test('createDocument adds document to state', async () => {
        const doc = await useOfficeStore.getState().createDocument('Note', 'note', 'content');
        expect(doc.id).toBe('doc-new');
        expect(useOfficeStore.getState().documents).toHaveLength(1);
        expect(mockCreateDocument).toHaveBeenCalledWith('Note', 'note', 'content');
    });

    test('updateDocument updates document in state', async () => {
        useOfficeStore.setState({
            documents: [{ id: 'doc-1', title: 'Old', type: 'note', content: '' }],
        });
        await useOfficeStore.getState().updateDocument('doc-1', { title: 'New' });
        expect(mockUpdateDocument).toHaveBeenCalledWith('doc-1', { title: 'New' });
        expect(useOfficeStore.getState().documents[0].title).toBe('New');
    });

    test('updateDocument also updates currentDocument if matching', async () => {
        const doc = { id: 'doc-1', title: 'Open', type: 'note', content: '' };
        useOfficeStore.setState({
            documents: [doc],
            currentDocument: doc,
        });
        await useOfficeStore.getState().updateDocument('doc-1', { title: 'Changed' });
        expect(useOfficeStore.getState().currentDocument.title).toBe('Changed');
    });

    test('deleteDocument removes from state', async () => {
        useOfficeStore.setState({
            documents: [{ id: 'doc-1', title: 'Del', type: 'note' }],
        });
        await useOfficeStore.getState().deleteDocument('doc-1');
        expect(useOfficeStore.getState().documents).toHaveLength(0);
    });

    test('deleteDocument clears currentDocument if matching', async () => {
        const doc = { id: 'doc-1', title: 'Current', type: 'note' };
        useOfficeStore.setState({ documents: [doc], currentDocument: doc });
        await useOfficeStore.getState().deleteDocument('doc-1');
        expect(useOfficeStore.getState().currentDocument).toBeNull();
    });

    test('openDocument sets currentDocument', async () => {
        await useOfficeStore.getState().openDocument('doc-1');
        expect(mockGetDocumentById).toHaveBeenCalledWith('doc-1');
        expect(useOfficeStore.getState().currentDocument).not.toBeNull();
        expect(useOfficeStore.getState().currentDocument.title).toBe('Found Doc');
    });

    test('closeDocument clears currentDocument', () => {
        useOfficeStore.setState({ currentDocument: { id: 'x' } });
        useOfficeStore.getState().closeDocument();
        expect(useOfficeStore.getState().currentDocument).toBeNull();
    });

    test('toggleFavorite updates document in state', async () => {
        useOfficeStore.setState({
            documents: [{ id: 'doc-1', title: 'Fav', is_favorite: false }],
        });
        await useOfficeStore.getState().toggleFavorite('doc-1');
        expect(useOfficeStore.getState().documents[0].is_favorite).toBe(true);
    });

    test('togglePin updates document in state', async () => {
        useOfficeStore.setState({
            documents: [{ id: 'doc-1', title: 'Pin', is_pinned: false }],
        });
        await useOfficeStore.getState().togglePin('doc-1');
        expect(useOfficeStore.getState().documents[0].is_pinned).toBe(true);
    });

    test('searchDocuments sets results and query', async () => {
        mockSearchDocuments.mockResolvedValueOnce([
            { id: 'd1', title: 'Match' },
        ]);
        await useOfficeStore.getState().searchDocuments('Match');
        expect(useOfficeStore.getState().searchQuery).toBe('Match');
        expect(useOfficeStore.getState().documents).toHaveLength(1);
        expect(useOfficeStore.getState().isLoading).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════
// Folder Actions
// ═══════════════════════════════════════════════════════════════

describe('Folder Actions', () => {
    test('loadFolders sets folders', async () => {
        mockGetFolders.mockResolvedValueOnce([{ id: 'f1', name: 'Work' }]);
        await useOfficeStore.getState().loadFolders();
        expect(useOfficeStore.getState().folders).toHaveLength(1);
    });

    test('createFolder adds folder to state', async () => {
        const folder = await useOfficeStore.getState().createFolder('Perso', '#FF0000');
        expect(folder.id).toBe('folder-new');
        expect(useOfficeStore.getState().folders).toHaveLength(1);
    });

    test('deleteFolder removes folder', async () => {
        useOfficeStore.setState({
            folders: [{ id: 'f1', name: 'X' }],
            currentFolderId: 'f1',
        });
        await useOfficeStore.getState().deleteFolder('f1');
        expect(useOfficeStore.getState().folders).toHaveLength(0);
        expect(useOfficeStore.getState().currentFolderId).toBeNull();
    });

    test('setCurrentFolder sets folder id', () => {
        useOfficeStore.getState().setCurrentFolder('f1');
        expect(useOfficeStore.getState().currentFolderId).toBe('f1');
    });
});

// ═══════════════════════════════════════════════════════════════
// Journal Actions
// ═══════════════════════════════════════════════════════════════

describe('Journal Actions', () => {
    test('loadJournalEntries sets entries from API', async () => {
        mockGetJournalEntries.mockResolvedValueOnce([{ id: 'je-1', title: 'Entry' }]);
        await useOfficeStore.getState().loadJournalEntries();
        expect(useOfficeStore.getState().journalEntries).toHaveLength(1);
    });

    test('loadJournalEntries loads mock when empty', async () => {
        mockGetJournalEntries.mockResolvedValueOnce([]);
        await useOfficeStore.getState().loadJournalEntries();
        expect(mockGetMockJournalEntries).toHaveBeenCalled();
        expect(useOfficeStore.getState().journalEntries).toHaveLength(1);
    });

    test('createJournalEntry adds entry', async () => {
        const entry = await useOfficeStore.getState().createJournalEntry('Title', 'Content', 'great');
        expect(entry.id).toBe('je-new');
        expect(useOfficeStore.getState().journalEntries).toHaveLength(1);
    });

    test('updateJournalEntry updates entry in state', async () => {
        useOfficeStore.setState({
            journalEntries: [{ id: 'je-1', title: 'Old' }],
        });
        await useOfficeStore.getState().updateJournalEntry('je-1', { title: 'New' });
        expect(useOfficeStore.getState().journalEntries[0].title).toBe('New');
    });

    test('deleteJournalEntry removes entry', async () => {
        useOfficeStore.setState({
            journalEntries: [{ id: 'je-1', title: 'Del' }],
        });
        await useOfficeStore.getState().deleteJournalEntry('je-1');
        expect(useOfficeStore.getState().journalEntries).toHaveLength(0);
    });

    test('openJournalEntry sets currentJournalEntry', () => {
        const entry = { id: 'je-1', title: 'Open' };
        useOfficeStore.setState({ journalEntries: [entry] });
        useOfficeStore.getState().openJournalEntry('je-1');
        expect(useOfficeStore.getState().currentJournalEntry).toEqual(entry);
    });

    test('closeJournalEntry clears currentJournalEntry', () => {
        useOfficeStore.setState({ currentJournalEntry: { id: 'x' } });
        useOfficeStore.getState().closeJournalEntry();
        expect(useOfficeStore.getState().currentJournalEntry).toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════
// PDF Actions
// ═══════════════════════════════════════════════════════════════

describe('PDF Actions', () => {
    test('loadPdfDocuments sets pdfs', async () => {
        mockGetPdfDocuments.mockResolvedValueOnce([{ id: 'pdf-1', title: 'Report' }]);
        await useOfficeStore.getState().loadPdfDocuments();
        expect(useOfficeStore.getState().pdfDocuments).toHaveLength(1);
    });

    test('addPdfDocument adds pdf to state', async () => {
        const pdf = await useOfficeStore.getState().addPdfDocument('New.pdf', '/path', 10, 2048);
        expect(pdf.id).toBe('pdf-new');
        expect(useOfficeStore.getState().pdfDocuments).toHaveLength(1);
    });

    test('updatePdfPage updates page in state', async () => {
        const pdf = { id: 'pdf-1', current_page: 1, annotations: [], bookmarks: [] };
        useOfficeStore.setState({ pdfDocuments: [pdf] });
        await useOfficeStore.getState().updatePdfPage('pdf-1', 5);
        expect(useOfficeStore.getState().pdfDocuments[0].current_page).toBe(5);
    });

    test('updatePdfPage updates currentPdf if matching', async () => {
        const pdf = { id: 'pdf-1', current_page: 1, annotations: [], bookmarks: [] };
        useOfficeStore.setState({ pdfDocuments: [pdf], currentPdf: pdf });
        await useOfficeStore.getState().updatePdfPage('pdf-1', 3);
        expect(useOfficeStore.getState().currentPdf.current_page).toBe(3);
    });

    test('addPdfAnnotation adds annotation to state', async () => {
        const pdf = { id: 'pdf-1', annotations: [], bookmarks: [] };
        useOfficeStore.setState({ pdfDocuments: [pdf] });
        await useOfficeStore.getState().addPdfAnnotation('pdf-1', {
            type: 'highlight',
            page: 1,
            content: 'test',
            color: '#FFF',
            position: { x: 0, y: 0, width: 10, height: 10 },
        });
        expect(useOfficeStore.getState().pdfDocuments[0].annotations).toHaveLength(1);
    });

    test('removePdfAnnotation removes from state', async () => {
        const pdf = { id: 'pdf-1', annotations: [{ id: 'ann-1' }], bookmarks: [] };
        useOfficeStore.setState({ pdfDocuments: [pdf] });
        await useOfficeStore.getState().removePdfAnnotation('pdf-1', 'ann-1');
        expect(useOfficeStore.getState().pdfDocuments[0].annotations).toHaveLength(0);
    });

    test('deletePdfDocument removes from state', async () => {
        useOfficeStore.setState({ pdfDocuments: [{ id: 'pdf-1' }] });
        await useOfficeStore.getState().deletePdfDocument('pdf-1');
        expect(useOfficeStore.getState().pdfDocuments).toHaveLength(0);
    });

    test('openPdf sets currentPdf', () => {
        const pdf = { id: 'pdf-1', title: 'Open' };
        useOfficeStore.setState({ pdfDocuments: [pdf] });
        useOfficeStore.getState().openPdf('pdf-1');
        expect(useOfficeStore.getState().currentPdf).toEqual(pdf);
    });

    test('closePdf clears currentPdf', () => {
        useOfficeStore.setState({ currentPdf: { id: 'x' } });
        useOfficeStore.getState().closePdf();
        expect(useOfficeStore.getState().currentPdf).toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════
// Signature Actions
// ═══════════════════════════════════════════════════════════════

describe('Signature Actions', () => {
    test('loadSignatures sets signatures', async () => {
        mockGetSignatures.mockResolvedValueOnce([{ id: 's1', name: 'Sig' }]);
        await useOfficeStore.getState().loadSignatures();
        expect(useOfficeStore.getState().signatures).toHaveLength(1);
    });

    test('createSignature adds to state', async () => {
        const sig = await useOfficeStore.getState().createSignature('My Sig', 'svgpath', 'png64');
        expect(sig.id).toBe('sig-new');
        expect(useOfficeStore.getState().signatures).toHaveLength(1);
    });

    test('deleteSignature reloads signatures from API', async () => {
        useOfficeStore.setState({ signatures: [{ id: 's1' }, { id: 's2' }] });
        mockGetSignatures.mockResolvedValueOnce([{ id: 's2' }]);
        await useOfficeStore.getState().deleteSignature('s1');
        expect(mockDeleteSignature).toHaveBeenCalledWith('s1');
        expect(useOfficeStore.getState().signatures).toHaveLength(1);
    });

    test('setDefaultSignature updates all signatures in state', async () => {
        useOfficeStore.setState({
            signatures: [
                { id: 's1', is_default: true },
                { id: 's2', is_default: false },
            ],
        });
        await useOfficeStore.getState().setDefaultSignature('s2');
        const sigs = useOfficeStore.getState().signatures;
        expect(sigs.find((s) => s.id === 's1').is_default).toBe(false);
        expect(sigs.find((s) => s.id === 's2').is_default).toBe(true);
    });

    test('signDocument adds to signatureRequests', async () => {
        await useOfficeStore.getState().signDocument('doc-1', 'Contract', 'Alice', 'sig-1');
        expect(useOfficeStore.getState().signatureRequests).toHaveLength(1);
        expect(useOfficeStore.getState().signatureRequests[0].status).toBe('signed');
    });

    test('loadSignatureRequests sets requests', async () => {
        mockGetSignatureRequests.mockResolvedValueOnce([{ document_id: 'x', status: 'pending' }]);
        await useOfficeStore.getState().loadSignatureRequests();
        expect(useOfficeStore.getState().signatureRequests).toHaveLength(1);
    });
});

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════

describe('Export', () => {
    test('exportDocument calls API and returns content', () => {
        useOfficeStore.setState({
            documents: [{ id: 'doc-1', title: 'Test', type: 'note', content: 'Hello' }],
        });
        const result = useOfficeStore.getState().exportDocument('doc-1', 'md');
        expect(mockExportDocumentContent).toHaveBeenCalled();
        expect(result).toBe('# Exported');
    });

    test('exportDocument returns null for unknown doc', () => {
        const result = useOfficeStore.getState().exportDocument('unknown', 'txt');
        expect(result).toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════
// UI Actions
// ═══════════════════════════════════════════════════════════════

describe('UI Actions', () => {
    test('setSortBy updates sortBy', () => {
        useOfficeStore.getState().setSortBy('title');
        expect(useOfficeStore.getState().sortBy).toBe('title');
    });

    test('setFilterType updates filterType', () => {
        useOfficeStore.getState().setFilterType('spreadsheet');
        expect(useOfficeStore.getState().filterType).toBe('spreadsheet');
    });
});

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

describe('Helpers', () => {
    const DOC_LIST = [
        { id: 'd1', title: 'Alpha', type: 'note', is_pinned: false, is_favorite: true, folder_id: null, updated_at: '2026-03-01T10:00:00Z', created_at: '2026-03-01T10:00:00Z' },
        { id: 'd2', title: 'Beta', type: 'spreadsheet', is_pinned: true, is_favorite: false, folder_id: 'f1', updated_at: '2026-03-02T10:00:00Z', created_at: '2026-02-28T10:00:00Z' },
        { id: 'd3', title: 'Gamma', type: 'presentation', is_pinned: false, is_favorite: true, folder_id: null, updated_at: '2026-02-28T10:00:00Z', created_at: '2026-03-02T10:00:00Z' },
    ];

    test('getFilteredDocuments returns all when filter is all', () => {
        useOfficeStore.setState({ documents: DOC_LIST, filterType: 'all', sortBy: 'updated' });
        const result = useOfficeStore.getState().getFilteredDocuments();
        expect(result).toHaveLength(3);
        // Pinned first
        expect(result[0].id).toBe('d2');
    });

    test('getFilteredDocuments filters by type', () => {
        useOfficeStore.setState({ documents: DOC_LIST, filterType: 'note', sortBy: 'updated' });
        const result = useOfficeStore.getState().getFilteredDocuments();
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('note');
    });

    test('getFilteredDocuments filters by folder', () => {
        useOfficeStore.setState({ documents: DOC_LIST, filterType: 'all', sortBy: 'updated', currentFolderId: 'f1' });
        const result = useOfficeStore.getState().getFilteredDocuments();
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('d2');
    });

    test('getFilteredDocuments sorts by title', () => {
        useOfficeStore.setState({ documents: DOC_LIST, filterType: 'all', sortBy: 'title', currentFolderId: null });
        const result = useOfficeStore.getState().getFilteredDocuments();
        // Pinned first, then alphabetical among non-pinned
        expect(result[0].id).toBe('d2'); // pinned
        expect(result[1].title).toBe('Alpha');
        expect(result[2].title).toBe('Gamma');
    });

    test('getDocumentCount returns correct counts', () => {
        useOfficeStore.setState({ documents: DOC_LIST });
        const counts = useOfficeStore.getState().getDocumentCount();
        expect(counts.all).toBe(3);
        expect(counts.note).toBe(1);
        expect(counts.spreadsheet).toBe(1);
        expect(counts.presentation).toBe(1);
        expect(counts.pdf).toBe(0);
        expect(counts.journal).toBe(0);
        expect(counts.signature).toBe(0);
    });

    test('getRecentDocuments returns limited sorted docs', () => {
        useOfficeStore.setState({ documents: DOC_LIST });
        const recent = useOfficeStore.getState().getRecentDocuments(2);
        expect(recent).toHaveLength(2);
        expect(recent[0].id).toBe('d2'); // most recently updated
    });

    test('getFavoriteDocuments returns favorites only', () => {
        useOfficeStore.setState({ documents: DOC_LIST });
        const favs = useOfficeStore.getState().getFavoriteDocuments();
        expect(favs).toHaveLength(2);
        expect(favs.every((d) => d.is_favorite)).toBe(true);
    });
});
