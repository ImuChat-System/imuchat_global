/**
 * Office Store (Zustand + persist) — DEV-019
 *
 * Gère l'état global du module Office :
 * - Documents (notes, tableurs, présentations)
 * - Journal privé
 * - PDF (métadonnées + annotations)
 * - Signatures électroniques
 * - UI state (recherche, tri, filtres)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createLogger } from '@/services/logger';
import * as OfficeAPI from '@/services/office-api';
import type {
    DocumentSortOption,
    ExportFormat,
    JournalEntry,
    JournalMood,
    OfficeDocument,
    OfficeDocumentType,
    OfficeFolder,
    PdfAnnotation,
    PdfDocument,
    SignatureData,
    SignatureRequest,
} from '@/types/office';

const logger = createLogger('OfficeStore');

// ─── Interfaces ─────────────────────────────────────────────

interface OfficeState {
    // Documents
    documents: OfficeDocument[];
    folders: OfficeFolder[];
    currentDocument: OfficeDocument | null;

    // Journal
    journalEntries: JournalEntry[];
    currentJournalEntry: JournalEntry | null;

    // PDF
    pdfDocuments: PdfDocument[];
    currentPdf: PdfDocument | null;

    // Signatures
    signatures: SignatureData[];
    signatureRequests: SignatureRequest[];

    // UI State
    isLoading: boolean;
    searchQuery: string;
    sortBy: DocumentSortOption;
    filterType: OfficeDocumentType | 'all';
    currentFolderId: string | null;

    // ─── Document Actions ───────────────────────────────
    loadDocuments: () => Promise<void>;
    createDocument: (title: string, type: OfficeDocumentType, content?: string) => Promise<OfficeDocument>;
    updateDocument: (id: string, updates: Partial<Pick<OfficeDocument, 'title' | 'content' | 'blocks' | 'tags' | 'is_favorite' | 'is_pinned' | 'is_encrypted' | 'folder_id'>>) => Promise<void>;
    deleteDocument: (id: string) => Promise<void>;
    openDocument: (id: string) => Promise<void>;
    closeDocument: () => void;
    toggleFavorite: (id: string) => Promise<void>;
    togglePin: (id: string) => Promise<void>;
    searchDocuments: (query: string) => Promise<void>;

    // ─── Folder Actions ─────────────────────────────────
    loadFolders: () => Promise<void>;
    createFolder: (name: string, color?: string) => Promise<OfficeFolder>;
    deleteFolder: (id: string) => Promise<void>;
    setCurrentFolder: (folderId: string | null) => void;

    // ─── Journal Actions ────────────────────────────────
    loadJournalEntries: () => Promise<void>;
    createJournalEntry: (title: string, content?: string, mood?: JournalMood) => Promise<JournalEntry>;
    updateJournalEntry: (id: string, updates: Partial<Pick<JournalEntry, 'title' | 'content' | 'blocks' | 'mood' | 'tags'>>) => Promise<void>;
    deleteJournalEntry: (id: string) => Promise<void>;
    openJournalEntry: (id: string) => void;
    closeJournalEntry: () => void;

    // ─── PDF Actions ────────────────────────────────────
    loadPdfDocuments: () => Promise<void>;
    addPdfDocument: (title: string, fileUri: string, pageCount?: number, fileSize?: number) => Promise<PdfDocument>;
    updatePdfPage: (id: string, page: number) => Promise<void>;
    addPdfAnnotation: (pdfId: string, annotation: Omit<PdfAnnotation, 'id' | 'created_at'>) => Promise<void>;
    removePdfAnnotation: (pdfId: string, annotationId: string) => Promise<void>;
    togglePdfBookmark: (pdfId: string, page: number) => Promise<void>;
    deletePdfDocument: (id: string) => Promise<void>;
    openPdf: (id: string) => void;
    closePdf: () => void;

    // ─── Signature Actions ──────────────────────────────
    loadSignatures: () => Promise<void>;
    createSignature: (name: string, svgPath: string, pngBase64: string) => Promise<SignatureData>;
    deleteSignature: (id: string) => Promise<void>;
    setDefaultSignature: (id: string) => Promise<void>;
    signDocument: (documentId: string, documentTitle: string, signerName: string, signatureId: string) => Promise<void>;
    loadSignatureRequests: () => Promise<void>;

    // ─── Export ─────────────────────────────────────────
    exportDocument: (id: string, format: ExportFormat) => string | null;

    // ─── UI Actions ─────────────────────────────────────
    setSortBy: (sort: DocumentSortOption) => void;
    setFilterType: (filter: OfficeDocumentType | 'all') => void;

    // ─── Helpers ────────────────────────────────────────
    getFilteredDocuments: () => OfficeDocument[];
    getDocumentCount: () => Record<OfficeDocumentType | 'all', number>;
    getRecentDocuments: (limit?: number) => OfficeDocument[];
    getFavoriteDocuments: () => OfficeDocument[];
}

// ─── Initial State ──────────────────────────────────────────

const initialState = {
    documents: [] as OfficeDocument[],
    folders: [] as OfficeFolder[],
    currentDocument: null as OfficeDocument | null,
    journalEntries: [] as JournalEntry[],
    currentJournalEntry: null as JournalEntry | null,
    pdfDocuments: [] as PdfDocument[],
    currentPdf: null as PdfDocument | null,
    signatures: [] as SignatureData[],
    signatureRequests: [] as SignatureRequest[],
    isLoading: false,
    searchQuery: '',
    sortBy: 'updated' as DocumentSortOption,
    filterType: 'all' as OfficeDocumentType | 'all',
    currentFolderId: null as string | null,
};

// ─── Sort Helper ────────────────────────────────────────────

function sortDocuments(docs: OfficeDocument[], sortBy: DocumentSortOption): OfficeDocument[] {
    const sorted = [...docs];
    switch (sortBy) {
        case 'updated':
            sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            break;
        case 'created':
            sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            break;
        case 'title':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'type':
            sorted.sort((a, b) => a.type.localeCompare(b.type));
            break;
    }
    // Pinned first
    sorted.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
    return sorted;
}

// ─── Store ──────────────────────────────────────────────────

export const useOfficeStore = create<OfficeState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ─── Document Actions ─────────────────────────────

            loadDocuments: async () => {
                set({ isLoading: true });
                try {
                    let docs = await OfficeAPI.getDocuments();
                    if (docs.length === 0) {
                        // Load mock data on first launch
                        docs = OfficeAPI.getMockDocuments();
                    }
                    set({ documents: docs, isLoading: false });
                    logger.info(`Loaded ${docs.length} documents`);
                } catch (error) {
                    logger.error('Failed to load documents:', error);
                    set({ isLoading: false });
                }
            },

            createDocument: async (title, type, content) => {
                const doc = await OfficeAPI.createDocument(title, type, content);
                set(state => ({ documents: [doc, ...state.documents] }));
                return doc;
            },

            updateDocument: async (id, updates) => {
                const updated = await OfficeAPI.updateDocument(id, updates);
                if (updated) {
                    set(state => ({
                        documents: state.documents.map(d => (d.id === id ? updated : d)),
                        currentDocument: state.currentDocument?.id === id ? updated : state.currentDocument,
                    }));
                }
            },

            deleteDocument: async (id) => {
                await OfficeAPI.deleteDocument(id);
                set(state => ({
                    documents: state.documents.filter(d => d.id !== id),
                    currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
                }));
            },

            openDocument: async (id) => {
                const doc = await OfficeAPI.getDocumentById(id);
                if (doc) {
                    set({ currentDocument: doc });
                }
            },

            closeDocument: () => {
                set({ currentDocument: null });
            },

            toggleFavorite: async (id) => {
                const isFav = await OfficeAPI.toggleFavorite(id);
                set(state => ({
                    documents: state.documents.map(d =>
                        d.id === id ? { ...d, is_favorite: isFav } : d,
                    ),
                }));
            },

            togglePin: async (id) => {
                const isPinned = await OfficeAPI.togglePin(id);
                set(state => ({
                    documents: state.documents.map(d =>
                        d.id === id ? { ...d, is_pinned: isPinned } : d,
                    ),
                }));
            },

            searchDocuments: async (query) => {
                set({ searchQuery: query, isLoading: true });
                try {
                    const results = await OfficeAPI.searchDocuments(query);
                    set({ documents: results, isLoading: false });
                } catch (error) {
                    logger.error('Search failed:', error);
                    set({ isLoading: false });
                }
            },

            // ─── Folder Actions ───────────────────────────────

            loadFolders: async () => {
                try {
                    const folders = await OfficeAPI.getFolders();
                    set({ folders });
                } catch (error) {
                    logger.error('Failed to load folders:', error);
                }
            },

            createFolder: async (name, color) => {
                const folder = await OfficeAPI.createFolder(name, color);
                set(state => ({ folders: [folder, ...state.folders] }));
                return folder;
            },

            deleteFolder: async (id) => {
                await OfficeAPI.deleteFolder(id);
                set(state => ({
                    folders: state.folders.filter(f => f.id !== id),
                    currentFolderId: state.currentFolderId === id ? null : state.currentFolderId,
                }));
            },

            setCurrentFolder: (folderId) => {
                set({ currentFolderId: folderId });
            },

            // ─── Journal Actions ──────────────────────────────

            loadJournalEntries: async () => {
                try {
                    let entries = await OfficeAPI.getJournalEntries();
                    if (entries.length === 0) {
                        entries = OfficeAPI.getMockJournalEntries();
                    }
                    set({ journalEntries: entries });
                    logger.info(`Loaded ${entries.length} journal entries`);
                } catch (error) {
                    logger.error('Failed to load journal entries:', error);
                }
            },

            createJournalEntry: async (title, content, mood) => {
                const entry = await OfficeAPI.createJournalEntry(title, content, mood);
                set(state => ({ journalEntries: [entry, ...state.journalEntries] }));
                return entry;
            },

            updateJournalEntry: async (id, updates) => {
                const updated = await OfficeAPI.updateJournalEntry(id, updates);
                if (updated) {
                    set(state => ({
                        journalEntries: state.journalEntries.map(e => (e.id === id ? updated : e)),
                        currentJournalEntry: state.currentJournalEntry?.id === id ? updated : state.currentJournalEntry,
                    }));
                }
            },

            deleteJournalEntry: async (id) => {
                await OfficeAPI.deleteJournalEntry(id);
                set(state => ({
                    journalEntries: state.journalEntries.filter(e => e.id !== id),
                    currentJournalEntry: state.currentJournalEntry?.id === id ? null : state.currentJournalEntry,
                }));
            },

            openJournalEntry: (id) => {
                const entry = get().journalEntries.find(e => e.id === id) || null;
                set({ currentJournalEntry: entry });
            },

            closeJournalEntry: () => {
                set({ currentJournalEntry: null });
            },

            // ─── PDF Actions ──────────────────────────────────

            loadPdfDocuments: async () => {
                try {
                    const pdfs = await OfficeAPI.getPdfDocuments();
                    set({ pdfDocuments: pdfs });
                } catch (error) {
                    logger.error('Failed to load PDFs:', error);
                }
            },

            addPdfDocument: async (title, fileUri, pageCount, fileSize) => {
                const pdf = await OfficeAPI.addPdfDocument(title, fileUri, pageCount, fileSize);
                set(state => ({ pdfDocuments: [pdf, ...state.pdfDocuments] }));
                return pdf;
            },

            updatePdfPage: async (id, page) => {
                await OfficeAPI.updatePdfPage(id, page);
                set(state => ({
                    pdfDocuments: state.pdfDocuments.map(p =>
                        p.id === id ? { ...p, current_page: page } : p,
                    ),
                    currentPdf: state.currentPdf?.id === id
                        ? { ...state.currentPdf, current_page: page }
                        : state.currentPdf,
                }));
            },

            addPdfAnnotation: async (pdfId, annotation) => {
                const newAnnotation = await OfficeAPI.addPdfAnnotation(pdfId, annotation);
                if (newAnnotation) {
                    set(state => ({
                        pdfDocuments: state.pdfDocuments.map(p =>
                            p.id === pdfId ? { ...p, annotations: [...p.annotations, newAnnotation] } : p,
                        ),
                        currentPdf: state.currentPdf?.id === pdfId
                            ? { ...state.currentPdf, annotations: [...state.currentPdf.annotations, newAnnotation] }
                            : state.currentPdf,
                    }));
                }
            },

            removePdfAnnotation: async (pdfId, annotationId) => {
                const removed = await OfficeAPI.removePdfAnnotation(pdfId, annotationId);
                if (removed) {
                    set(state => ({
                        pdfDocuments: state.pdfDocuments.map(p =>
                            p.id === pdfId
                                ? { ...p, annotations: p.annotations.filter(a => a.id !== annotationId) }
                                : p,
                        ),
                        currentPdf: state.currentPdf?.id === pdfId
                            ? { ...state.currentPdf, annotations: state.currentPdf.annotations.filter(a => a.id !== annotationId) }
                            : state.currentPdf,
                    }));
                }
            },

            togglePdfBookmark: async (pdfId, page) => {
                await OfficeAPI.togglePdfBookmark(pdfId, page);
                // Reload the PDF to get updated bookmarks
                const pdfs = await OfficeAPI.getPdfDocuments();
                const pdf = pdfs.find(p => p.id === pdfId);
                if (pdf) {
                    set(state => ({
                        pdfDocuments: state.pdfDocuments.map(p => (p.id === pdfId ? pdf : p)),
                        currentPdf: state.currentPdf?.id === pdfId ? pdf : state.currentPdf,
                    }));
                }
            },

            deletePdfDocument: async (id) => {
                await OfficeAPI.deletePdfDocument(id);
                set(state => ({
                    pdfDocuments: state.pdfDocuments.filter(p => p.id !== id),
                    currentPdf: state.currentPdf?.id === id ? null : state.currentPdf,
                }));
            },

            openPdf: (id) => {
                const pdf = get().pdfDocuments.find(p => p.id === id) || null;
                set({ currentPdf: pdf });
            },

            closePdf: () => {
                set({ currentPdf: null });
            },

            // ─── Signature Actions ────────────────────────────

            loadSignatures: async () => {
                try {
                    const sigs = await OfficeAPI.getSignatures();
                    set({ signatures: sigs });
                } catch (error) {
                    logger.error('Failed to load signatures:', error);
                }
            },

            createSignature: async (name, svgPath, pngBase64) => {
                const sig = await OfficeAPI.createSignature(name, svgPath, pngBase64);
                set(state => ({ signatures: [sig, ...state.signatures] }));
                return sig;
            },

            deleteSignature: async (id) => {
                await OfficeAPI.deleteSignature(id);
                const sigs = await OfficeAPI.getSignatures();
                set({ signatures: sigs });
            },

            setDefaultSignature: async (id) => {
                await OfficeAPI.setDefaultSignature(id);
                set(state => ({
                    signatures: state.signatures.map(s => ({ ...s, is_default: s.id === id })),
                }));
            },

            signDocument: async (documentId, documentTitle, signerName, signatureId) => {
                const req = await OfficeAPI.signDocument(documentId, documentTitle, signerName, signatureId);
                set(state => ({ signatureRequests: [req, ...state.signatureRequests] }));
            },

            loadSignatureRequests: async () => {
                try {
                    const reqs = await OfficeAPI.getSignatureRequests();
                    set({ signatureRequests: reqs });
                } catch (error) {
                    logger.error('Failed to load signature requests:', error);
                }
            },

            // ─── Export ───────────────────────────────────────

            exportDocument: (id, format) => {
                const doc = get().documents.find(d => d.id === id);
                if (!doc) return null;
                return OfficeAPI.exportDocumentContent(doc, format);
            },

            // ─── UI Actions ───────────────────────────────────

            setSortBy: (sort) => {
                set({ sortBy: sort });
            },

            setFilterType: (filter) => {
                set({ filterType: filter });
            },

            // ─── Helpers ──────────────────────────────────────

            getFilteredDocuments: () => {
                const { documents, filterType, currentFolderId, sortBy } = get();
                let filtered = documents;

                if (filterType !== 'all') {
                    filtered = filtered.filter(d => d.type === filterType);
                }

                if (currentFolderId) {
                    filtered = filtered.filter(d => d.folder_id === currentFolderId);
                }

                return sortDocuments(filtered, sortBy);
            },

            getDocumentCount: () => {
                const docs = get().documents;
                return {
                    all: docs.length,
                    note: docs.filter(d => d.type === 'note').length,
                    spreadsheet: docs.filter(d => d.type === 'spreadsheet').length,
                    presentation: docs.filter(d => d.type === 'presentation').length,
                    pdf: docs.filter(d => d.type === 'pdf').length,
                    journal: docs.filter(d => d.type === 'journal').length,
                    signature: docs.filter(d => d.type === 'signature').length,
                };
            },

            getRecentDocuments: (limit = 5) => {
                const docs = [...get().documents];
                docs.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
                return docs.slice(0, limit);
            },

            getFavoriteDocuments: () => {
                return get().documents.filter(d => d.is_favorite);
            },
        }),
        {
            name: 'imuchat-office-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                sortBy: state.sortBy,
                filterType: state.filterType,
            }),
        },
    ),
);
