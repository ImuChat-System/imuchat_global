/**
 * Types pour le Module Office (DEV-019)
 *
 * Suite bureautique hybride :
 * - Natif RN : éditeur texte riche, journal privé, viewer PDF, signatures
 * - WebView : tableur, présentations
 */

// ─── Document Types ─────────────────────────────────────────

export type OfficeDocumentType =
    | 'note'
    | 'spreadsheet'
    | 'presentation'
    | 'pdf'
    | 'journal'
    | 'signature';

export type DocumentSortOption = 'updated' | 'created' | 'title' | 'type';

// ─── Rich Text Formatting ───────────────────────────────────

export type TextFormatting =
    | 'bold'
    | 'italic'
    | 'underline'
    | 'strikethrough'
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'bulletList'
    | 'numberedList'
    | 'quote'
    | 'code'
    | 'link';

export interface TextBlock {
    id: string;
    type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberedList' | 'quote' | 'code' | 'image' | 'divider';
    content: string;
    formatting: TextFormatting[];
    metadata: Record<string, string>;
}

// ─── Core Document Interface ────────────────────────────────

export interface OfficeDocument {
    id: string;
    title: string;
    type: OfficeDocumentType;
    content: string;
    blocks: TextBlock[];
    created_at: string;
    updated_at: string;
    is_favorite: boolean;
    is_pinned: boolean;
    is_encrypted: boolean;
    tags: string[];
    word_count: number;
    thumbnail_url: string | null;
    folder_id: string | null;
}

// ─── Folder ─────────────────────────────────────────────────

export interface OfficeFolder {
    id: string;
    name: string;
    parent_id: string | null;
    color: string;
    icon: string;
    document_count: number;
    created_at: string;
}

// ─── Spreadsheet ────────────────────────────────────────────

export interface SpreadsheetCell {
    row: number;
    col: number;
    value: string;
    formula: string | null;
    format: CellFormat;
}

export interface CellFormat {
    bold: boolean;
    italic: boolean;
    textColor: string | null;
    bgColor: string | null;
    align: 'left' | 'center' | 'right';
    type: 'text' | 'number' | 'currency' | 'percent' | 'date';
}

export interface SpreadsheetData {
    cells: Record<string, SpreadsheetCell>;
    rows: number;
    cols: number;
    /** Alias for cols — used in some UI components */
    columns?: number;
    column_widths: number[];
    row_heights: number[];
    sheet_name: string;
}

// ─── Presentation ───────────────────────────────────────────

export type SlideLayout = 'title' | 'content' | 'two-column' | 'image' | 'blank';

export interface PresentationSlide {
    id: string;
    order: number;
    layout: SlideLayout;
    title: string;
    content: string;
    notes: string;
    background_color: string;
    image_url: string | null;
}

export interface PresentationData {
    slides: PresentationSlide[];
    theme: PresentationTheme;
    aspect_ratio: '16:9' | '4:3';
}

export interface PresentationTheme {
    name: string;
    primary_color: string;
    secondary_color: string;
    background_color: string;
    text_color: string;
    font_family: string;
    /** Convenience aliases used by UI components */
    colors?: {
        background: string;
        text: string;
        accent: string;
    };
    fontFamily?: string;
}

// ─── PDF ────────────────────────────────────────────────────

export interface PdfAnnotation {
    id: string;
    page: number;
    type: 'highlight' | 'note' | 'underline' | 'drawing';
    content: string;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    color: string;
    created_at: string;
}

export interface PdfDocument {
    id: string;
    title: string;
    file_uri: string;
    page_count: number;
    current_page: number;
    annotations: PdfAnnotation[];
    bookmarks: number[];
    file_size: number;
}

// ─── Journal ────────────────────────────────────────────────

export type JournalMood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

export interface JournalEntry {
    id: string;
    date: string;
    title: string;
    content: string;
    blocks: TextBlock[];
    mood: JournalMood | null;
    tags: string[];
    is_encrypted: boolean;
    weather: string | null;
    location: string | null;
    word_count: number;
    created_at: string;
    updated_at: string;
}

// ─── Signature ──────────────────────────────────────────────

export interface SignatureData {
    id: string;
    name: string;
    svg_path: string;
    png_base64: string;
    created_at: string;
    is_default: boolean;
}

export interface SignatureRequest {
    id: string;
    document_id: string;
    document_title: string;
    signer_name: string;
    signature_id: string | null;
    signed_at: string | null;
    status: 'pending' | 'signed' | 'rejected';
    created_at: string;
}

// ─── Export ─────────────────────────────────────────────────

export type ExportFormat = 'pdf' | 'docx' | 'txt' | 'md' | 'html' | 'xlsx' | 'csv' | 'pptx' | 'png' | 'svg';

export interface ExportOptions {
    format: ExportFormat;
    include_metadata: boolean;
    include_annotations: boolean;
    quality: 'draft' | 'standard' | 'high';
}

// ─── Office Store State ─────────────────────────────────────

export interface OfficeStoreState {
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
}
