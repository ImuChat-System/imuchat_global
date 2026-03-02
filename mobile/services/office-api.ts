/**
 * Office API Service (DEV-019)
 *
 * Gestion locale des documents Office avec AsyncStorage pour le MVP.
 * Prêt pour migration Supabase (même signatures de fonctions).
 *
 * - CRUD documents (notes, tableur, présentation)
 * - CRUD journal privé
 * - Gestion PDF (métadonnées + annotations)
 * - Signatures électroniques
 * - Export multi-format
 * - Recherche et tri
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { createLogger } from '@/services/logger';
import type {
    CellFormat,
    ExportFormat,
    JournalEntry,
    JournalMood,
    OfficeDocument,
    OfficeDocumentType,
    OfficeFolder,
    PdfAnnotation,
    PdfDocument,
    PresentationData,
    PresentationSlide,
    SignatureData,
    SignatureRequest,
    SpreadsheetData
} from '@/types/office';

const logger = createLogger('OfficeAPI');

// ─── Storage Keys ───────────────────────────────────────────

const STORAGE_KEYS = {
    DOCUMENTS: 'imuchat-office-documents',
    FOLDERS: 'imuchat-office-folders',
    JOURNAL: 'imuchat-office-journal',
    PDFS: 'imuchat-office-pdfs',
    SIGNATURES: 'imuchat-office-signatures',
    SIGNATURE_REQUESTS: 'imuchat-office-sig-requests',
};

// ─── Helpers ─────────────────────────────────────────────────

function generateId(): string {
    return 'off_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
}

function now(): string {
    return new Date().toISOString();
}

function countWords(text: string): number {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
}

// ─── Document CRUD ──────────────────────────────────────────

export async function getDocuments(): Promise<OfficeDocument[]> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        logger.error('Failed to get documents:', error);
        return [];
    }
}

async function saveDocuments(docs: OfficeDocument[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
}

export async function createDocument(
    title: string,
    type: OfficeDocumentType,
    content?: string,
): Promise<OfficeDocument> {
    const doc: OfficeDocument = {
        id: generateId(),
        title: title || 'Sans titre',
        type,
        content: content || '',
        blocks: [],
        created_at: now(),
        updated_at: now(),
        is_favorite: false,
        is_pinned: false,
        is_encrypted: false,
        tags: [],
        word_count: countWords(content || ''),
        thumbnail_url: null,
        folder_id: null,
    };
    const docs = await getDocuments();
    docs.unshift(doc);
    await saveDocuments(docs);
    logger.info(`Document created: ${doc.id} (${type})`);
    return doc;
}

export async function updateDocument(
    id: string,
    updates: Partial<Pick<OfficeDocument, 'title' | 'content' | 'blocks' | 'tags' | 'is_favorite' | 'is_pinned' | 'is_encrypted' | 'folder_id'>>,
): Promise<OfficeDocument | null> {
    const docs = await getDocuments();
    const index = docs.findIndex(d => d.id === id);
    if (index === -1) return null;

    const updatedContent = updates.content !== undefined ? updates.content : docs[index].content;
    docs[index] = {
        ...docs[index],
        ...updates,
        word_count: countWords(updatedContent),
        updated_at: now(),
    };
    await saveDocuments(docs);
    logger.info(`Document updated: ${id}`);
    return docs[index];
}

export async function deleteDocument(id: string): Promise<boolean> {
    const docs = await getDocuments();
    const filtered = docs.filter(d => d.id !== id);
    if (filtered.length === docs.length) return false;
    await saveDocuments(filtered);
    logger.info(`Document deleted: ${id}`);
    return true;
}

export async function getDocumentById(id: string): Promise<OfficeDocument | null> {
    const docs = await getDocuments();
    return docs.find(d => d.id === id) || null;
}

export async function searchDocuments(query: string): Promise<OfficeDocument[]> {
    const docs = await getDocuments();
    if (!query.trim()) return docs;
    const lower = query.toLowerCase();
    return docs.filter(
        d =>
            d.title.toLowerCase().includes(lower) ||
            d.content.toLowerCase().includes(lower) ||
            d.tags.some(t => t.toLowerCase().includes(lower)),
    );
}

export async function toggleFavorite(id: string): Promise<boolean> {
    const docs = await getDocuments();
    const doc = docs.find(d => d.id === id);
    if (!doc) return false;
    doc.is_favorite = !doc.is_favorite;
    doc.updated_at = now();
    await saveDocuments(docs);
    return doc.is_favorite;
}

export async function togglePin(id: string): Promise<boolean> {
    const docs = await getDocuments();
    const doc = docs.find(d => d.id === id);
    if (!doc) return false;
    doc.is_pinned = !doc.is_pinned;
    doc.updated_at = now();
    await saveDocuments(docs);
    return doc.is_pinned;
}

// ─── Folder CRUD ────────────────────────────────────────────

export async function getFolders(): Promise<OfficeFolder[]> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.FOLDERS);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        logger.error('Failed to get folders:', error);
        return [];
    }
}

async function saveFolders(folders: OfficeFolder[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
}

export async function createFolder(name: string, color?: string, parentId?: string): Promise<OfficeFolder> {
    const folder: OfficeFolder = {
        id: generateId(),
        name,
        parent_id: parentId || null,
        color: color || '#4A90D9',
        icon: '📁',
        document_count: 0,
        created_at: now(),
    };
    const folders = await getFolders();
    folders.unshift(folder);
    await saveFolders(folders);
    logger.info(`Folder created: ${folder.id}`);
    return folder;
}

export async function deleteFolder(id: string): Promise<boolean> {
    const folders = await getFolders();
    const filtered = folders.filter(f => f.id !== id);
    if (filtered.length === folders.length) return false;
    // Move documents from folder back to root
    const docs = await getDocuments();
    let updated = false;
    for (const doc of docs) {
        if (doc.folder_id === id) {
            doc.folder_id = null;
            updated = true;
        }
    }
    if (updated) await saveDocuments(docs);
    await saveFolders(filtered);
    logger.info(`Folder deleted: ${id}`);
    return true;
}

// ─── Journal CRUD ───────────────────────────────────────────

export async function getJournalEntries(): Promise<JournalEntry[]> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.JOURNAL);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        logger.error('Failed to get journal entries:', error);
        return [];
    }
}

async function saveJournalEntries(entries: JournalEntry[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
}

export async function createJournalEntry(
    title: string,
    content?: string,
    mood?: JournalMood,
): Promise<JournalEntry> {
    const entry: JournalEntry = {
        id: generateId(),
        date: new Date().toISOString().split('T')[0],
        title: title || 'Mon journal',
        content: content || '',
        blocks: [],
        mood: mood || null,
        tags: [],
        is_encrypted: false,
        weather: null,
        location: null,
        word_count: countWords(content || ''),
        created_at: now(),
        updated_at: now(),
    };
    const entries = await getJournalEntries();
    entries.unshift(entry);
    await saveJournalEntries(entries);
    logger.info(`Journal entry created: ${entry.id}`);
    return entry;
}

export async function updateJournalEntry(
    id: string,
    updates: Partial<Pick<JournalEntry, 'title' | 'content' | 'blocks' | 'mood' | 'tags' | 'is_encrypted' | 'weather' | 'location'>>,
): Promise<JournalEntry | null> {
    const entries = await getJournalEntries();
    const index = entries.findIndex(e => e.id === id);
    if (index === -1) return null;

    const updatedContent = updates.content !== undefined ? updates.content : entries[index].content;
    entries[index] = {
        ...entries[index],
        ...updates,
        word_count: countWords(updatedContent),
        updated_at: now(),
    };
    await saveJournalEntries(entries);
    logger.info(`Journal entry updated: ${id}`);
    return entries[index];
}

export async function deleteJournalEntry(id: string): Promise<boolean> {
    const entries = await getJournalEntries();
    const filtered = entries.filter(e => e.id !== id);
    if (filtered.length === entries.length) return false;
    await saveJournalEntries(filtered);
    logger.info(`Journal entry deleted: ${id}`);
    return true;
}

export async function getJournalEntriesByDate(date: string): Promise<JournalEntry[]> {
    const entries = await getJournalEntries();
    return entries.filter(e => e.date === date);
}

export async function getJournalEntriesByMood(mood: JournalMood): Promise<JournalEntry[]> {
    const entries = await getJournalEntries();
    return entries.filter(e => e.mood === mood);
}

// ─── PDF Management ─────────────────────────────────────────

export async function getPdfDocuments(): Promise<PdfDocument[]> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.PDFS);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        logger.error('Failed to get PDF documents:', error);
        return [];
    }
}

async function savePdfDocuments(pdfs: PdfDocument[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.PDFS, JSON.stringify(pdfs));
}

export async function addPdfDocument(
    title: string,
    fileUri: string,
    pageCount?: number,
    fileSize?: number,
): Promise<PdfDocument> {
    const pdf: PdfDocument = {
        id: generateId(),
        title,
        file_uri: fileUri,
        page_count: pageCount || 0,
        current_page: 1,
        annotations: [],
        bookmarks: [],
        file_size: fileSize || 0,
    };
    const pdfs = await getPdfDocuments();
    pdfs.unshift(pdf);
    await savePdfDocuments(pdfs);
    logger.info(`PDF added: ${pdf.id}`);
    return pdf;
}

export async function updatePdfPage(id: string, page: number): Promise<void> {
    const pdfs = await getPdfDocuments();
    const pdf = pdfs.find(p => p.id === id);
    if (pdf) {
        pdf.current_page = page;
        await savePdfDocuments(pdfs);
    }
}

export async function addPdfAnnotation(
    pdfId: string,
    annotation: Omit<PdfAnnotation, 'id' | 'created_at'>,
): Promise<PdfAnnotation | null> {
    const pdfs = await getPdfDocuments();
    const pdf = pdfs.find(p => p.id === pdfId);
    if (!pdf) return null;

    const newAnnotation: PdfAnnotation = {
        ...annotation,
        id: generateId(),
        created_at: now(),
    };
    pdf.annotations.push(newAnnotation);
    await savePdfDocuments(pdfs);
    logger.info(`Annotation added to PDF ${pdfId}`);
    return newAnnotation;
}

export async function removePdfAnnotation(pdfId: string, annotationId: string): Promise<boolean> {
    const pdfs = await getPdfDocuments();
    const pdf = pdfs.find(p => p.id === pdfId);
    if (!pdf) return false;

    const before = pdf.annotations.length;
    pdf.annotations = pdf.annotations.filter(a => a.id !== annotationId);
    if (pdf.annotations.length === before) return false;
    await savePdfDocuments(pdfs);
    return true;
}

export async function togglePdfBookmark(pdfId: string, page: number): Promise<boolean> {
    const pdfs = await getPdfDocuments();
    const pdf = pdfs.find(p => p.id === pdfId);
    if (!pdf) return false;

    const idx = pdf.bookmarks.indexOf(page);
    if (idx >= 0) {
        pdf.bookmarks.splice(idx, 1);
    } else {
        pdf.bookmarks.push(page);
        pdf.bookmarks.sort((a, b) => a - b);
    }
    await savePdfDocuments(pdfs);
    return idx < 0; // true if bookmarked, false if unbookmarked
}

export async function deletePdfDocument(id: string): Promise<boolean> {
    const pdfs = await getPdfDocuments();
    const filtered = pdfs.filter(p => p.id !== id);
    if (filtered.length === pdfs.length) return false;
    await savePdfDocuments(filtered);
    logger.info(`PDF deleted: ${id}`);
    return true;
}

// ─── Signatures ─────────────────────────────────────────────

export async function getSignatures(): Promise<SignatureData[]> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.SIGNATURES);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        logger.error('Failed to get signatures:', error);
        return [];
    }
}

async function saveSignatures(sigs: SignatureData[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SIGNATURES, JSON.stringify(sigs));
}

export async function createSignature(
    name: string,
    svgPath: string,
    pngBase64: string,
): Promise<SignatureData> {
    const sig: SignatureData = {
        id: generateId(),
        name,
        svg_path: svgPath,
        png_base64: pngBase64,
        created_at: now(),
        is_default: false,
    };
    const sigs = await getSignatures();
    // If first signature, make it default
    if (sigs.length === 0) sig.is_default = true;
    sigs.unshift(sig);
    await saveSignatures(sigs);
    logger.info(`Signature created: ${sig.id}`);
    return sig;
}

export async function deleteSignature(id: string): Promise<boolean> {
    const sigs = await getSignatures();
    const filtered = sigs.filter(s => s.id !== id);
    if (filtered.length === sigs.length) return false;
    // If deleted was default, promote first remaining
    if (filtered.length > 0 && !filtered.some(s => s.is_default)) {
        filtered[0].is_default = true;
    }
    await saveSignatures(filtered);
    logger.info(`Signature deleted: ${id}`);
    return true;
}

export async function setDefaultSignature(id: string): Promise<boolean> {
    const sigs = await getSignatures();
    const target = sigs.find(s => s.id === id);
    if (!target) return false;
    for (const s of sigs) {
        s.is_default = s.id === id;
    }
    await saveSignatures(sigs);
    return true;
}

export async function getSignatureRequests(): Promise<SignatureRequest[]> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.SIGNATURE_REQUESTS);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        logger.error('Failed to get signature requests:', error);
        return [];
    }
}

async function saveSignatureRequests(reqs: SignatureRequest[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SIGNATURE_REQUESTS, JSON.stringify(reqs));
}

export async function signDocument(
    documentId: string,
    documentTitle: string,
    signerName: string,
    signatureId: string,
): Promise<SignatureRequest> {
    const req: SignatureRequest = {
        document_id: documentId,
        document_title: documentTitle,
        signer_name: signerName,
        signature_id: signatureId,
        signed_at: now(),
        status: 'signed',
    };
    const reqs = await getSignatureRequests();
    reqs.unshift(req);
    await saveSignatureRequests(reqs);
    logger.info(`Document signed: ${documentId}`);
    return req;
}

// ─── Export ─────────────────────────────────────────────────

export function documentToPlainText(doc: OfficeDocument): string {
    if (doc.blocks.length > 0) {
        return doc.blocks.map(b => b.content).join('\n\n');
    }
    return doc.content;
}

export function documentToMarkdown(doc: OfficeDocument): string {
    if (doc.blocks.length === 0) return doc.content;

    return doc.blocks
        .map(block => {
            switch (block.type) {
                case 'heading1':
                    return `# ${block.content}`;
                case 'heading2':
                    return `## ${block.content}`;
                case 'heading3':
                    return `### ${block.content}`;
                case 'quote':
                    return `> ${block.content}`;
                case 'code':
                    return '```\n' + block.content + '\n```';
                case 'bulletList':
                    return block.content
                        .split('\n')
                        .map(line => `- ${line}`)
                        .join('\n');
                case 'numberedList':
                    return block.content
                        .split('\n')
                        .map((line, i) => `${i + 1}. ${line}`)
                        .join('\n');
                case 'divider':
                    return '---';
                case 'image':
                    return `![${block.metadata.alt || ''}](${block.metadata.src || ''})`;
                default:
                    return block.content;
            }
        })
        .join('\n\n');
}

export function documentToHtml(doc: OfficeDocument): string {
    if (doc.blocks.length === 0) {
        return `<html><body><p>${doc.content.replace(/\n/g, '<br/>')}</p></body></html>`;
    }

    const bodyHtml = doc.blocks
        .map(block => {
            const escaped = block.content
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            switch (block.type) {
                case 'heading1':
                    return `<h1>${escaped}</h1>`;
                case 'heading2':
                    return `<h2>${escaped}</h2>`;
                case 'heading3':
                    return `<h3>${escaped}</h3>`;
                case 'quote':
                    return `<blockquote>${escaped}</blockquote>`;
                case 'code':
                    return `<pre><code>${escaped}</code></pre>`;
                case 'bulletList':
                    return '<ul>' + escaped.split('\n').map(l => `<li>${l}</li>`).join('') + '</ul>';
                case 'numberedList':
                    return '<ol>' + escaped.split('\n').map(l => `<li>${l}</li>`).join('') + '</ol>';
                case 'divider':
                    return '<hr/>';
                case 'image':
                    return `<img src="${block.metadata.src || ''}" alt="${block.metadata.alt || ''}" />`;
                default:
                    return `<p>${escaped.replace(/\n/g, '<br/>')}</p>`;
            }
        })
        .join('\n');

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${doc.title}</title></head><body>${bodyHtml}</body></html>`;
}

export function getExportMimeType(format: ExportFormat): string {
    const mimeTypes: Record<ExportFormat, string> = {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        txt: 'text/plain',
        md: 'text/markdown',
        html: 'text/html',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        csv: 'text/csv',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        png: 'image/png',
        svg: 'image/svg+xml',
    };
    return mimeTypes[format] || 'application/octet-stream';
}

export function exportDocumentContent(doc: OfficeDocument, format: ExportFormat): string {
    switch (format) {
        case 'txt':
            return documentToPlainText(doc);
        case 'md':
            return documentToMarkdown(doc);
        case 'html':
            return documentToHtml(doc);
        case 'csv': {
            // For spreadsheet type, parse content as CSV-ready
            return doc.content;
        }
        default:
            // For complex formats (pdf, docx, xlsx, pptx), return the raw content
            // Full conversion requires native modules or server-side processing
            logger.warn(`Export format ${format} requires server-side conversion`);
            return doc.content;
    }
}

// ─── Spreadsheet Helpers ────────────────────────────────────

export function createEmptySpreadsheet(rows: number, cols: number): SpreadsheetData {
    const defaultFormat: CellFormat = {
        bold: false,
        italic: false,
        textColor: null,
        bgColor: null,
        align: 'left',
        type: 'text',
    };

    const cells = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            cells.push({ row: r, col: c, value: '', formula: null, format: { ...defaultFormat } });
        }
    }

    return {
        cells,
        rows,
        cols,
        column_widths: Array(cols).fill(100),
        row_heights: Array(rows).fill(32),
        sheet_name: 'Feuille 1',
    };
}

export function evaluateFormula(formula: string, getCellValue: (row: number, col: number) => string): string {
    if (!formula || !formula.startsWith('=')) return formula;

    const expr = formula.slice(1).toUpperCase();

    // SUM(A1:A5)
    const sumMatch = expr.match(/^SUM\(([A-Z])(\d+):([A-Z])(\d+)\)$/);
    if (sumMatch) {
        const col1 = sumMatch[1].charCodeAt(0) - 65;
        const row1 = parseInt(sumMatch[2], 10) - 1;
        const col2 = sumMatch[3].charCodeAt(0) - 65;
        const row2 = parseInt(sumMatch[4], 10) - 1;
        let sum = 0;
        for (let r = row1; r <= row2; r++) {
            for (let c = col1; c <= col2; c++) {
                const val = parseFloat(getCellValue(r, c));
                if (!isNaN(val)) sum += val;
            }
        }
        return sum.toString();
    }

    // AVG / AVERAGE
    const avgMatch = expr.match(/^(?:AVG|AVERAGE)\(([A-Z])(\d+):([A-Z])(\d+)\)$/);
    if (avgMatch) {
        const col1 = avgMatch[1].charCodeAt(0) - 65;
        const row1 = parseInt(avgMatch[2], 10) - 1;
        const col2 = avgMatch[3].charCodeAt(0) - 65;
        const row2 = parseInt(avgMatch[4], 10) - 1;
        let sum = 0;
        let count = 0;
        for (let r = row1; r <= row2; r++) {
            for (let c = col1; c <= col2; c++) {
                const val = parseFloat(getCellValue(r, c));
                if (!isNaN(val)) {
                    sum += val;
                    count++;
                }
            }
        }
        return count > 0 ? (sum / count).toString() : '0';
    }

    // COUNT
    const countMatch = expr.match(/^COUNT\(([A-Z])(\d+):([A-Z])(\d+)\)$/);
    if (countMatch) {
        const col1 = countMatch[1].charCodeAt(0) - 65;
        const row1 = parseInt(countMatch[2], 10) - 1;
        const col2 = countMatch[3].charCodeAt(0) - 65;
        const row2 = parseInt(countMatch[4], 10) - 1;
        let count = 0;
        for (let r = row1; r <= row2; r++) {
            for (let c = col1; c <= col2; c++) {
                const val = getCellValue(r, c);
                if (val && val.trim() !== '') count++;
            }
        }
        return count.toString();
    }

    // MIN
    const minMatch = expr.match(/^MIN\(([A-Z])(\d+):([A-Z])(\d+)\)$/);
    if (minMatch) {
        const col1 = minMatch[1].charCodeAt(0) - 65;
        const row1 = parseInt(minMatch[2], 10) - 1;
        const col2 = minMatch[3].charCodeAt(0) - 65;
        const row2 = parseInt(minMatch[4], 10) - 1;
        let min = Infinity;
        for (let r = row1; r <= row2; r++) {
            for (let c = col1; c <= col2; c++) {
                const val = parseFloat(getCellValue(r, c));
                if (!isNaN(val) && val < min) min = val;
            }
        }
        return min === Infinity ? '0' : min.toString();
    }

    // MAX
    const maxMatch = expr.match(/^MAX\(([A-Z])(\d+):([A-Z])(\d+)\)$/);
    if (maxMatch) {
        const col1 = maxMatch[1].charCodeAt(0) - 65;
        const row1 = parseInt(maxMatch[2], 10) - 1;
        const col2 = maxMatch[3].charCodeAt(0) - 65;
        const row2 = parseInt(maxMatch[4], 10) - 1;
        let max = -Infinity;
        for (let r = row1; r <= row2; r++) {
            for (let c = col1; c <= col2; c++) {
                const val = parseFloat(getCellValue(r, c));
                if (!isNaN(val) && val > max) max = val;
            }
        }
        return max === -Infinity ? '0' : max.toString();
    }

    // Simple cell reference: A1
    const cellRef = expr.match(/^([A-Z])(\d+)$/);
    if (cellRef) {
        const c = cellRef[1].charCodeAt(0) - 65;
        const r = parseInt(cellRef[2], 10) - 1;
        return getCellValue(r, c);
    }

    // Simple arithmetic: =A1+B1, =A1*B1, etc.
    const arithMatch = expr.match(/^([A-Z])(\d+)\s*([+\-*/])\s*([A-Z])(\d+)$/);
    if (arithMatch) {
        const v1 = parseFloat(getCellValue(
            parseInt(arithMatch[2], 10) - 1,
            arithMatch[1].charCodeAt(0) - 65,
        ));
        const v2 = parseFloat(getCellValue(
            parseInt(arithMatch[5], 10) - 1,
            arithMatch[4].charCodeAt(0) - 65,
        ));
        if (isNaN(v1) || isNaN(v2)) return '#ERR';
        switch (arithMatch[3]) {
            case '+': return (v1 + v2).toString();
            case '-': return (v1 - v2).toString();
            case '*': return (v1 * v2).toString();
            case '/': return v2 === 0 ? '#DIV/0' : (v1 / v2).toString();
        }
    }

    return '#ERR';
}

// ─── Presentation Helpers ───────────────────────────────────

export function createEmptyPresentation(): PresentationData {
    return {
        slides: [
            {
                id: generateId(),
                order: 0,
                layout: 'title',
                title: 'Nouvelle présentation',
                content: 'Sous-titre',
                notes: '',
                background_color: '#FFFFFF',
                image_url: null,
            },
        ],
        theme: {
            name: 'Default',
            primary_color: '#4A90D9',
            secondary_color: '#7B8794',
            background_color: '#FFFFFF',
            text_color: '#1A1A1A',
            font_family: 'System',
        },
        aspect_ratio: '16:9',
    };
}

export function addSlide(data: PresentationData, layout: PresentationSlide['layout']): PresentationData {
    const newSlide: PresentationSlide = {
        id: generateId(),
        order: data.slides.length,
        layout,
        title: '',
        content: '',
        notes: '',
        background_color: data.theme.background_color,
        image_url: null,
    };
    return {
        ...data,
        slides: [...data.slides, newSlide],
    };
}

export function removeSlide(data: PresentationData, slideId: string): PresentationData {
    const slides = data.slides
        .filter(s => s.id !== slideId)
        .map((s, i) => ({ ...s, order: i }));
    return { ...data, slides };
}

export function reorderSlides(data: PresentationData, fromIndex: number, toIndex: number): PresentationData {
    const slides = [...data.slides];
    const [moved] = slides.splice(fromIndex, 1);
    slides.splice(toIndex, 0, moved);
    return {
        ...data,
        slides: slides.map((s, i) => ({ ...s, order: i })),
    };
}

// ─── Mock Data ──────────────────────────────────────────────

export function getMockDocuments(): OfficeDocument[] {
    return [
        {
            id: 'mock-note-1',
            title: 'Notes de réunion projet Alpha',
            type: 'note',
            content: 'Participants : Alice, Bob, Charlie\n\nPoints abordés :\n1. Avancement du sprint\n2. Revue technique\n3. Planning prochain sprint\n\nActions :\n- Alice : finaliser les maquettes\n- Bob : corriger les bugs P0\n- Charlie : préparer la démo',
            blocks: [],
            created_at: '2026-03-01T10:00:00Z',
            updated_at: '2026-03-02T14:30:00Z',
            is_favorite: true,
            is_pinned: true,
            is_encrypted: false,
            tags: ['réunion', 'projet-alpha'],
            word_count: 42,
            thumbnail_url: null,
            folder_id: null,
        },
        {
            id: 'mock-note-2',
            title: 'Liste de courses',
            type: 'note',
            content: '- Lait\n- Pain\n- Fromage\n- Fruits\n- Légumes',
            blocks: [],
            created_at: '2026-03-02T09:00:00Z',
            updated_at: '2026-03-02T09:00:00Z',
            is_favorite: false,
            is_pinned: false,
            is_encrypted: false,
            tags: ['perso'],
            word_count: 5,
            thumbnail_url: null,
            folder_id: null,
        },
        {
            id: 'mock-spreadsheet-1',
            title: 'Budget mensuel Mars 2026',
            type: 'spreadsheet',
            content: JSON.stringify(createEmptySpreadsheet(10, 5)),
            blocks: [],
            created_at: '2026-03-01T08:00:00Z',
            updated_at: '2026-03-01T08:00:00Z',
            is_favorite: false,
            is_pinned: false,
            is_encrypted: false,
            tags: ['budget', 'finance'],
            word_count: 0,
            thumbnail_url: null,
            folder_id: null,
        },
        {
            id: 'mock-pres-1',
            title: 'Présentation projet ImuChat',
            type: 'presentation',
            content: JSON.stringify(createEmptyPresentation()),
            blocks: [],
            created_at: '2026-02-28T15:00:00Z',
            updated_at: '2026-02-28T15:00:00Z',
            is_favorite: true,
            is_pinned: false,
            is_encrypted: false,
            tags: ['imuchat', 'présentation'],
            word_count: 0,
            thumbnail_url: null,
            folder_id: null,
        },
    ];
}

export function getMockJournalEntries(): JournalEntry[] {
    return [
        {
            id: 'mock-journal-1',
            date: '2026-03-02',
            title: 'Bonne journée productive',
            content: 'Aujourd\'hui j\'ai beaucoup avancé sur le projet. Le module Office prend forme. Je suis content des progrès.',
            blocks: [],
            mood: 'great',
            tags: ['productif', 'dev'],
            is_encrypted: false,
            weather: '☀️ Ensoleillé',
            location: 'Paris',
            word_count: 20,
            created_at: '2026-03-02T21:00:00Z',
            updated_at: '2026-03-02T21:00:00Z',
        },
        {
            id: 'mock-journal-2',
            date: '2026-03-01',
            title: 'Journée de planification',
            content: 'Réunion d\'équipe ce matin pour planifier le sprint. Beaucoup de choses à faire mais l\'équipe est motivée.',
            blocks: [],
            mood: 'good',
            tags: ['planification'],
            is_encrypted: false,
            weather: '🌤️ Nuageux',
            location: 'Paris',
            word_count: 20,
            created_at: '2026-03-01T20:00:00Z',
            updated_at: '2026-03-01T20:00:00Z',
        },
    ];
}

export const PRESENTATION_THEMES: PresentationData['theme'][] = [
    { name: 'Classic', primary_color: '#4A90D9', secondary_color: '#7B8794', background_color: '#FFFFFF', text_color: '#1A1A1A', font_family: 'System' },
    { name: 'Dark', primary_color: '#60A5FA', secondary_color: '#9CA3AF', background_color: '#1F2937', text_color: '#F9FAFB', font_family: 'System' },
    { name: 'Nature', primary_color: '#059669', secondary_color: '#6B7280', background_color: '#F0FDF4', text_color: '#14532D', font_family: 'System' },
    { name: 'Sunset', primary_color: '#EA580C', secondary_color: '#9CA3AF', background_color: '#FFF7ED', text_color: '#431407', font_family: 'System' },
    { name: 'Royal', primary_color: '#7C3AED', secondary_color: '#9CA3AF', background_color: '#FAF5FF', text_color: '#3B0764', font_family: 'System' },
];

export const SLIDE_LAYOUTS: Array<{ id: PresentationSlide['layout']; label: string; icon: string }> = [
    { id: 'title', label: 'Titre', icon: '🏷️' },
    { id: 'content', label: 'Contenu', icon: '📄' },
    { id: 'two-column', label: 'Deux colonnes', icon: '📊' },
    { id: 'image', label: 'Image', icon: '🖼️' },
    { id: 'blank', label: 'Vierge', icon: '⬜' },
];
