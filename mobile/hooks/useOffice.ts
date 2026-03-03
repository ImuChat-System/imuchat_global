/**
 * useOffice Hook
 *
 * Fournit une interface unifiée pour le module Office :
 *  - Documents (notes, tableurs, présentations)
 *  - Journal privé avec suivi d'humeur
 *  - PDF viewer avec annotations & favoris
 *  - Signatures électroniques
 *  - Dossiers et navigation
 *  - Export multi-format
 *
 * Usage :
 *   const { documents, createDocument, openDocument, ... } = useOffice();
 *
 * Phase — DEV-019 Module Office
 */

import { useCallback, useEffect, useState } from 'react';

import type { OfficeState } from '@/stores/office-store';
import { useOfficeStore } from '@/stores/office-store';
import type {
    DocumentSortOption,
    ExportFormat,
    JournalMood,
    OfficeDocument,
    OfficeDocumentType,
    OfficeFolder,
    PdfAnnotation,
} from '@/types/office';

// ============================================================================
// TYPES
// ============================================================================

export interface UseOfficeReturn {
    // --- Documents ---
    documents: OfficeDocument[];
    filteredDocuments: OfficeDocument[];
    recentDocuments: OfficeDocument[];
    favoriteDocuments: OfficeDocument[];
    currentDocument: OfficeState['currentDocument'];
    documentCounts: Record<OfficeDocumentType | 'all', number>;

    // --- Folders ---
    folders: OfficeFolder[];
    currentFolderId: string | null;

    // --- Journal ---
    journalEntries: OfficeState['journalEntries'];
    currentJournalEntry: OfficeState['currentJournalEntry'];

    // --- PDF ---
    pdfDocuments: OfficeState['pdfDocuments'];
    currentPdf: OfficeState['currentPdf'];

    // --- Signatures ---
    signatures: OfficeState['signatures'];
    signatureRequests: OfficeState['signatureRequests'];
    defaultSignature: OfficeState['signatures'][number] | null;

    // --- UI ---
    isLoading: boolean;
    searchQuery: string;
    sortBy: DocumentSortOption;
    filterType: OfficeDocumentType | 'all';
    isInitialized: boolean;

    // --- Document Actions ---
    loadAll: () => Promise<void>;
    createDocument: (title: string, type: OfficeDocumentType, content?: string) => Promise<OfficeDocument>;
    updateDocument: (id: string, updates: Partial<Pick<OfficeDocument, 'title' | 'content' | 'blocks' | 'tags' | 'is_favorite' | 'is_pinned' | 'is_encrypted' | 'folder_id'>>) => Promise<void>;
    deleteDocument: (id: string) => Promise<void>;
    openDocument: (id: string) => Promise<void>;
    closeDocument: () => void;
    toggleFavorite: (id: string) => Promise<void>;
    togglePin: (id: string) => Promise<void>;
    searchDocuments: (query: string) => Promise<void>;

    // --- Folder Actions ---
    createFolder: (name: string, color?: string) => Promise<OfficeFolder>;
    deleteFolder: (id: string) => Promise<void>;
    setCurrentFolder: (folderId: string | null) => void;

    // --- Journal Actions ---
    createJournalEntry: (title: string, content?: string, mood?: JournalMood) => Promise<OfficeState['journalEntries'][number]>;
    updateJournalEntry: (id: string, updates: Partial<Pick<OfficeState['journalEntries'][number], 'title' | 'content' | 'blocks' | 'mood' | 'tags'>>) => Promise<void>;
    deleteJournalEntry: (id: string) => Promise<void>;
    openJournalEntry: (id: string) => void;
    closeJournalEntry: () => void;

    // --- PDF Actions ---
    addPdfDocument: (title: string, fileUri: string, pageCount?: number, fileSize?: number) => Promise<OfficeState['pdfDocuments'][number]>;
    updatePdfPage: (id: string, page: number) => Promise<void>;
    addPdfAnnotation: (pdfId: string, annotation: Omit<PdfAnnotation, 'id' | 'created_at'>) => Promise<void>;
    removePdfAnnotation: (pdfId: string, annotationId: string) => Promise<void>;
    togglePdfBookmark: (pdfId: string, page: number) => Promise<void>;
    deletePdfDocument: (id: string) => Promise<void>;
    openPdf: (id: string) => void;
    closePdf: () => void;

    // --- Signature Actions ---
    createSignature: (name: string, svgPath: string, pngBase64: string) => Promise<OfficeState['signatures'][number]>;
    deleteSignature: (id: string) => Promise<void>;
    setDefaultSignature: (id: string) => Promise<void>;
    signDocument: (documentId: string, documentTitle: string, signerName: string, signatureId: string) => Promise<void>;

    // --- Export ---
    exportDocument: (id: string, format: ExportFormat) => string | null;

    // --- UI Actions ---
    setSortBy: (sort: DocumentSortOption) => void;
    setFilterType: (filter: OfficeDocumentType | 'all') => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useOffice(): UseOfficeReturn {
    const store = useOfficeStore();
    const [isInitialized, setIsInitialized] = useState(false);

    // --- Derived values ---
    const filteredDocuments = store.getFilteredDocuments();
    const recentDocuments = store.getRecentDocuments(5);
    const favoriteDocuments = store.getFavoriteDocuments();
    const documentCounts = store.getDocumentCount();
    const defaultSignature = store.signatures.find(s => s.is_default) || null;

    // --- Load all data on mount ---
    const loadAll = useCallback(async () => {
        await Promise.all([
            store.loadDocuments(),
            store.loadFolders(),
            store.loadJournalEntries(),
            store.loadPdfDocuments(),
            store.loadSignatures(),
            store.loadSignatureRequests(),
        ]);
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (!isInitialized) {
            loadAll();
        }
    }, [isInitialized, loadAll]);

    return {
        // Documents
        documents: store.documents,
        filteredDocuments,
        recentDocuments,
        favoriteDocuments,
        currentDocument: store.currentDocument,
        documentCounts,

        // Folders
        folders: store.folders,
        currentFolderId: store.currentFolderId,

        // Journal
        journalEntries: store.journalEntries,
        currentJournalEntry: store.currentJournalEntry,

        // PDF
        pdfDocuments: store.pdfDocuments,
        currentPdf: store.currentPdf,

        // Signatures
        signatures: store.signatures,
        signatureRequests: store.signatureRequests,
        defaultSignature,

        // UI
        isLoading: store.isLoading,
        searchQuery: store.searchQuery,
        sortBy: store.sortBy,
        filterType: store.filterType,
        isInitialized,

        // Document Actions
        loadAll,
        createDocument: store.createDocument,
        updateDocument: store.updateDocument,
        deleteDocument: store.deleteDocument,
        openDocument: store.openDocument,
        closeDocument: store.closeDocument,
        toggleFavorite: store.toggleFavorite,
        togglePin: store.togglePin,
        searchDocuments: store.searchDocuments,

        // Folder Actions
        createFolder: store.createFolder,
        deleteFolder: store.deleteFolder,
        setCurrentFolder: store.setCurrentFolder,

        // Journal Actions
        createJournalEntry: store.createJournalEntry,
        updateJournalEntry: store.updateJournalEntry,
        deleteJournalEntry: store.deleteJournalEntry,
        openJournalEntry: store.openJournalEntry,
        closeJournalEntry: store.closeJournalEntry,

        // PDF Actions
        addPdfDocument: store.addPdfDocument,
        updatePdfPage: store.updatePdfPage,
        addPdfAnnotation: store.addPdfAnnotation,
        removePdfAnnotation: store.removePdfAnnotation,
        togglePdfBookmark: store.togglePdfBookmark,
        deletePdfDocument: store.deletePdfDocument,
        openPdf: store.openPdf,
        closePdf: store.closePdf,

        // Signature Actions
        createSignature: store.createSignature,
        deleteSignature: store.deleteSignature,
        setDefaultSignature: store.setDefaultSignature,
        signDocument: store.signDocument,

        // Export
        exportDocument: store.exportDocument,

        // UI Actions
        setSortBy: store.setSortBy,
        setFilterType: store.setFilterType,
    };
}
