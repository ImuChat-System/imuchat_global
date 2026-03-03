/**
 * Tests pour le service office-api.
 *
 * Couvre : Document CRUD, Folder CRUD, Journal CRUD, PDF Management,
 *          Signatures, Export, Spreadsheet Helpers, Presentation Helpers,
 *          Formula Engine, Mock Data Generators.
 *
 * Phase — DEV-019 Module Office
 */

// ─── Mock AsyncStorage ────────────────────────────────────────

const mockStore = {};
jest.mock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: {
        getItem: jest.fn((key) => Promise.resolve(mockStore[key] || null)),
        setItem: jest.fn((key, value) => {
            mockStore[key] = value;
            return Promise.resolve();
        }),
        removeItem: jest.fn((key) => {
            delete mockStore[key];
            return Promise.resolve();
        }),
    },
}));

// ─── Mock logger ──────────────────────────────────────────────

jest.mock("@/services/logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

import {
    addPdfAnnotation,
    addPdfDocument,
    addSlide,
    createDocument,
    createEmptyPresentation,
    createEmptySpreadsheet,
    createFolder,
    createJournalEntry,
    createSignature,
    deleteDocument,
    deleteFolder,
    deleteJournalEntry,
    deletePdfDocument,
    deleteSignature,
    documentToHtml,
    documentToMarkdown,
    documentToPlainText,
    evaluateFormula,
    exportDocumentContent,
    getDocumentById,
    getDocuments,
    getExportMimeType,
    getFolders,
    getJournalEntries,
    getJournalEntriesByDate,
    getJournalEntriesByMood,
    getMockDocuments,
    getMockJournalEntries,
    getPdfDocuments,
    getSignatureRequests,
    getSignatures,
    PRESENTATION_THEMES,
    removePdfAnnotation,
    removeSlide,
    reorderSlides,
    searchDocuments,
    setDefaultSignature,
    signDocument,
    SLIDE_LAYOUTS,
    toggleFavorite,
    togglePdfBookmark,
    togglePin,
    updateDocument,
    updateJournalEntry,
    updatePdfPage,
} from "../office-api";

// ─── Helpers ──────────────────────────────────────────────────

function clearStore() {
    Object.keys(mockStore).forEach((k) => delete mockStore[k]);
}

beforeEach(() => {
    clearStore();
    jest.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════
// Document CRUD
// ═══════════════════════════════════════════════════════════════

describe("Document CRUD", () => {
    test("getDocuments returns empty array initially", async () => {
        const docs = await getDocuments();
        expect(docs).toEqual([]);
    });

    test("createDocument creates a note with correct fields", async () => {
        const doc = await createDocument("Ma note", "note", "Hello world");
        expect(doc.id).toMatch(/^off_/);
        expect(doc.title).toBe("Ma note");
        expect(doc.type).toBe("note");
        expect(doc.content).toBe("Hello world");
        expect(doc.is_favorite).toBe(false);
        expect(doc.is_pinned).toBe(false);
        expect(doc.word_count).toBe(2);
        expect(doc.blocks).toEqual([]);
        expect(doc.tags).toEqual([]);
    });

    test("createDocument uses default title when empty", async () => {
        const doc = await createDocument("", "note");
        expect(doc.title).toBe("Sans titre");
    });

    test("getDocuments returns created documents in reverse order", async () => {
        await createDocument("First", "note");
        await createDocument("Second", "note");
        const docs = await getDocuments();
        expect(docs).toHaveLength(2);
        expect(docs[0].title).toBe("Second");
        expect(docs[1].title).toBe("First");
    });

    test("updateDocument updates fields", async () => {
        const doc = await createDocument("Original", "note", "content");
        const updated = await updateDocument(doc.id, {
            title: "Updated",
            content: "new content here",
        });
        expect(updated).not.toBeNull();
        expect(updated.title).toBe("Updated");
        expect(updated.content).toBe("new content here");
        expect(updated.word_count).toBe(3);
    });

    test("updateDocument returns null for unknown id", async () => {
        const result = await updateDocument("unknown-id", { title: "X" });
        expect(result).toBeNull();
    });

    test("deleteDocument removes the document", async () => {
        const doc = await createDocument("ToDelete", "note");
        const result = await deleteDocument(doc.id);
        expect(result).toBe(true);
        const docs = await getDocuments();
        expect(docs).toHaveLength(0);
    });

    test("deleteDocument returns false for unknown id", async () => {
        const result = await deleteDocument("unknown");
        expect(result).toBe(false);
    });

    test("getDocumentById finds existing document", async () => {
        const created = await createDocument("FindMe", "note");
        const found = await getDocumentById(created.id);
        expect(found).not.toBeNull();
        expect(found.title).toBe("FindMe");
    });

    test("getDocumentById returns null for missing id", async () => {
        const found = await getDocumentById("nope");
        expect(found).toBeNull();
    });

    test("searchDocuments filters by title", async () => {
        await createDocument("Meeting Notes", "note", "work stuff");
        await createDocument("Shopping List", "note", "groceries");
        const results = await searchDocuments("meeting");
        expect(results).toHaveLength(1);
        expect(results[0].title).toBe("Meeting Notes");
    });

    test("searchDocuments filters by content", async () => {
        await createDocument("Doc A", "note", "alpha beta");
        await createDocument("Doc B", "note", "gamma delta");
        const results = await searchDocuments("gamma");
        expect(results).toHaveLength(1);
        expect(results[0].title).toBe("Doc B");
    });

    test("searchDocuments filters by tags", async () => {
        const doc = await createDocument("Tagged", "note");
        await updateDocument(doc.id, { tags: ["important", "work"] });
        const results = await searchDocuments("important");
        expect(results).toHaveLength(1);
    });

    test("searchDocuments returns all for empty query", async () => {
        await createDocument("A", "note");
        await createDocument("B", "note");
        const results = await searchDocuments("");
        expect(results).toHaveLength(2);
    });

    test("toggleFavorite toggles is_favorite", async () => {
        const doc = await createDocument("Fav", "note");
        const fav1 = await toggleFavorite(doc.id);
        expect(fav1).toBe(true);
        const fav2 = await toggleFavorite(doc.id);
        expect(fav2).toBe(false);
    });

    test("toggleFavorite returns false for unknown id", async () => {
        const result = await toggleFavorite("unknown");
        expect(result).toBe(false);
    });

    test("togglePin toggles is_pinned", async () => {
        const doc = await createDocument("Pin", "note");
        const pin1 = await togglePin(doc.id);
        expect(pin1).toBe(true);
        const pin2 = await togglePin(doc.id);
        expect(pin2).toBe(false);
    });

    test("togglePin returns false for unknown id", async () => {
        const result = await togglePin("unknown");
        expect(result).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════
// Folder CRUD
// ═══════════════════════════════════════════════════════════════

describe("Folder CRUD", () => {
    test("getFolders returns empty array initially", async () => {
        const folders = await getFolders();
        expect(folders).toEqual([]);
    });

    test("createFolder creates with defaults", async () => {
        const folder = await createFolder("Work");
        expect(folder.id).toMatch(/^off_/);
        expect(folder.name).toBe("Work");
        expect(folder.color).toBe("#4A90D9");
        expect(folder.icon).toBe("📁");
        expect(folder.parent_id).toBeNull();
    });

    test("createFolder accepts custom color and parent", async () => {
        const parent = await createFolder("Parent");
        const child = await createFolder("Child", "#FF0000", parent.id);
        expect(child.color).toBe("#FF0000");
        expect(child.parent_id).toBe(parent.id);
    });

    test("deleteFolder removes folder and orphans documents", async () => {
        const folder = await createFolder("Delete Me");
        const doc = await createDocument("In folder", "note");
        await updateDocument(doc.id, { folder_id: folder.id });
        const result = await deleteFolder(folder.id);
        expect(result).toBe(true);
        const folders = await getFolders();
        expect(folders).toHaveLength(0);
        // Document should have folder_id = null
        const updatedDoc = await getDocumentById(doc.id);
        expect(updatedDoc.folder_id).toBeNull();
    });

    test("deleteFolder returns false for unknown id", async () => {
        const result = await deleteFolder("unknown");
        expect(result).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════
// Journal CRUD
// ═══════════════════════════════════════════════════════════════

describe("Journal CRUD", () => {
    test("getJournalEntries returns empty initially", async () => {
        const entries = await getJournalEntries();
        expect(entries).toEqual([]);
    });

    test("createJournalEntry creates with correct fields", async () => {
        const entry = await createJournalEntry("Good day", "Had a great day", "great");
        expect(entry.id).toMatch(/^off_/);
        expect(entry.title).toBe("Good day");
        expect(entry.content).toBe("Had a great day");
        expect(entry.mood).toBe("great");
        expect(entry.word_count).toBe(4);
        expect(entry.tags).toEqual([]);
    });

    test("createJournalEntry defaults title and mood", async () => {
        const entry = await createJournalEntry("");
        expect(entry.title).toBe("Mon journal");
        expect(entry.mood).toBeNull();
    });

    test("updateJournalEntry updates fields", async () => {
        const entry = await createJournalEntry("Title", "Content", "good");
        const updated = await updateJournalEntry(entry.id, {
            title: "Updated title",
            mood: "neutral",
        });
        expect(updated).not.toBeNull();
        expect(updated.title).toBe("Updated title");
        expect(updated.mood).toBe("neutral");
    });

    test("updateJournalEntry returns null for unknown id", async () => {
        const result = await updateJournalEntry("unknown", { title: "X" });
        expect(result).toBeNull();
    });

    test("deleteJournalEntry removes entry", async () => {
        const entry = await createJournalEntry("Delete me");
        const result = await deleteJournalEntry(entry.id);
        expect(result).toBe(true);
        const entries = await getJournalEntries();
        expect(entries).toHaveLength(0);
    });

    test("deleteJournalEntry returns false for unknown id", async () => {
        const result = await deleteJournalEntry("unknown");
        expect(result).toBe(false);
    });

    test("getJournalEntriesByDate filters correctly", async () => {
        await createJournalEntry("Entry 1", "content");
        await createJournalEntry("Entry 2", "content");
        const today = new Date().toISOString().split("T")[0];
        const entries = await getJournalEntriesByDate(today);
        expect(entries).toHaveLength(2);
        const none = await getJournalEntriesByDate("1999-01-01");
        expect(none).toHaveLength(0);
    });

    test("getJournalEntriesByMood filters correctly", async () => {
        await createJournalEntry("Happy", "yeah", "great");
        await createJournalEntry("Neutral", "meh", "neutral");
        const great = await getJournalEntriesByMood("great");
        expect(great).toHaveLength(1);
        expect(great[0].title).toBe("Happy");
    });
});

// ═══════════════════════════════════════════════════════════════
// PDF Management
// ═══════════════════════════════════════════════════════════════

describe("PDF Management", () => {
    test("getPdfDocuments returns empty initially", async () => {
        const pdfs = await getPdfDocuments();
        expect(pdfs).toEqual([]);
    });

    test("addPdfDocument adds with correct fields", async () => {
        const pdf = await addPdfDocument("Report.pdf", "/path/report.pdf", 15, 1024);
        expect(pdf.id).toMatch(/^off_/);
        expect(pdf.title).toBe("Report.pdf");
        expect(pdf.file_uri).toBe("/path/report.pdf");
        expect(pdf.page_count).toBe(15);
        expect(pdf.current_page).toBe(1);
        expect(pdf.annotations).toEqual([]);
        expect(pdf.bookmarks).toEqual([]);
        expect(pdf.file_size).toBe(1024);
    });

    test("updatePdfPage updates current page", async () => {
        const pdf = await addPdfDocument("Test", "/path");
        await updatePdfPage(pdf.id, 5);
        const pdfs = await getPdfDocuments();
        expect(pdfs[0].current_page).toBe(5);
    });

    test("addPdfAnnotation adds annotation to pdf", async () => {
        const pdf = await addPdfDocument("Test", "/path");
        const annotation = await addPdfAnnotation(pdf.id, {
            type: "highlight",
            page: 1,
            content: "Important text",
            color: "#FFEB3B",
            position: { x: 10, y: 20, width: 100, height: 20 },
        });
        expect(annotation).not.toBeNull();
        expect(annotation.id).toMatch(/^off_/);
        expect(annotation.type).toBe("highlight");
        const pdfs = await getPdfDocuments();
        expect(pdfs[0].annotations).toHaveLength(1);
    });

    test("addPdfAnnotation returns null for unknown pdf", async () => {
        const result = await addPdfAnnotation("unknown", {
            type: "note",
            page: 1,
            content: "note",
            color: "#FF0000",
            position: { x: 0, y: 0, width: 0, height: 0 },
        });
        expect(result).toBeNull();
    });

    test("removePdfAnnotation removes annotation", async () => {
        const pdf = await addPdfDocument("Test", "/path");
        const ann = await addPdfAnnotation(pdf.id, {
            type: "note",
            page: 1,
            content: "A note",
            color: "#FF9500",
            position: { x: 0, y: 0, width: 0, height: 0 },
        });
        const result = await removePdfAnnotation(pdf.id, ann.id);
        expect(result).toBe(true);
        const pdfs = await getPdfDocuments();
        expect(pdfs[0].annotations).toHaveLength(0);
    });

    test("removePdfAnnotation returns false for unknown pdf", async () => {
        const result = await removePdfAnnotation("unknown", "ann-id");
        expect(result).toBe(false);
    });

    test("removePdfAnnotation returns false for unknown annotation", async () => {
        const pdf = await addPdfDocument("Test", "/path");
        const result = await removePdfAnnotation(pdf.id, "unknown-ann");
        expect(result).toBe(false);
    });

    test("togglePdfBookmark adds and removes bookmark", async () => {
        const pdf = await addPdfDocument("Test", "/path", 10);
        const added = await togglePdfBookmark(pdf.id, 3);
        expect(added).toBe(true);
        const pdfs1 = await getPdfDocuments();
        expect(pdfs1[0].bookmarks).toEqual([3]);
        // Add another
        await togglePdfBookmark(pdf.id, 1);
        const pdfs2 = await getPdfDocuments();
        expect(pdfs2[0].bookmarks).toEqual([1, 3]); // sorted
        // Remove
        const removed = await togglePdfBookmark(pdf.id, 3);
        expect(removed).toBe(false);
        const pdfs3 = await getPdfDocuments();
        expect(pdfs3[0].bookmarks).toEqual([1]);
    });

    test("togglePdfBookmark returns false for unknown pdf", async () => {
        const result = await togglePdfBookmark("unknown", 1);
        expect(result).toBe(false);
    });

    test("deletePdfDocument removes pdf", async () => {
        const pdf = await addPdfDocument("Delete Me", "/path");
        const result = await deletePdfDocument(pdf.id);
        expect(result).toBe(true);
        const pdfs = await getPdfDocuments();
        expect(pdfs).toHaveLength(0);
    });

    test("deletePdfDocument returns false for unknown id", async () => {
        const result = await deletePdfDocument("unknown");
        expect(result).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════
// Signatures
// ═══════════════════════════════════════════════════════════════

describe("Signatures", () => {
    test("getSignatures returns empty initially", async () => {
        const sigs = await getSignatures();
        expect(sigs).toEqual([]);
    });

    test("createSignature makes first signature default", async () => {
        const sig = await createSignature("My Sig", "M0,0 L10,10", "base64png");
        expect(sig.is_default).toBe(true);
        expect(sig.name).toBe("My Sig");
        expect(sig.svg_path).toBe("M0,0 L10,10");
    });

    test("createSignature second sig is not default", async () => {
        await createSignature("Sig 1", "path1", "png1");
        const sig2 = await createSignature("Sig 2", "path2", "png2");
        expect(sig2.is_default).toBe(false);
    });

    test("deleteSignature removes and promotes default", async () => {
        const sig1 = await createSignature("Sig 1", "p1", "");
        const sig2 = await createSignature("Sig 2", "p2", "");
        expect(sig1.is_default).toBe(true);
        expect(sig2.is_default).toBe(false);
        await deleteSignature(sig1.id);
        const sigs = await getSignatures();
        expect(sigs).toHaveLength(1);
        expect(sigs[0].is_default).toBe(true);
        expect(sigs[0].name).toBe("Sig 2");
    });

    test("deleteSignature returns false for unknown id", async () => {
        const result = await deleteSignature("unknown");
        expect(result).toBe(false);
    });

    test("setDefaultSignature switches default", async () => {
        const sig1 = await createSignature("Sig 1", "p1", "");
        const sig2 = await createSignature("Sig 2", "p2", "");
        await setDefaultSignature(sig2.id);
        const sigs = await getSignatures();
        const def = sigs.find((s) => s.is_default);
        expect(def.name).toBe("Sig 2");
        const old = sigs.find((s) => s.id === sig1.id);
        expect(old.is_default).toBe(false);
    });

    test("setDefaultSignature returns false for unknown id", async () => {
        const result = await setDefaultSignature("unknown");
        expect(result).toBe(false);
    });

    test("signDocument creates a signed request", async () => {
        const sig = await createSignature("Sig", "path", "");
        const req = await signDocument("doc-1", "Contract", "Alice", sig.id);
        expect(req.status).toBe("signed");
        expect(req.document_id).toBe("doc-1");
        expect(req.signer_name).toBe("Alice");
        const reqs = await getSignatureRequests();
        expect(reqs).toHaveLength(1);
    });
});

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════

describe("Export", () => {
    const docWithBlocks = {
        id: "test-doc",
        title: "Test Export",
        type: "note",
        content: "",
        blocks: [
            { id: "b1", type: "heading1", content: "Title", formatting: [], metadata: {} },
            { id: "b2", type: "paragraph", content: "Some text here", formatting: [], metadata: {} },
            { id: "b3", type: "quote", content: "A quote", formatting: [], metadata: {} },
            { id: "b4", type: "code", content: "const x = 1;", formatting: [], metadata: {} },
            { id: "b5", type: "bulletList", content: "Item A\nItem B", formatting: [], metadata: {} },
            { id: "b6", type: "numberedList", content: "First\nSecond", formatting: [], metadata: {} },
            { id: "b7", type: "divider", content: "", formatting: [], metadata: {} },
            { id: "b8", type: "image", content: "", formatting: [], metadata: { src: "https://img.png", alt: "Photo" } },
        ],
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
        is_favorite: false,
        is_pinned: false,
        is_encrypted: false,
        tags: [],
        word_count: 0,
        thumbnail_url: null,
        folder_id: null,
    };

    const docWithContent = {
        id: "test-simple",
        title: "Simple",
        type: "note",
        content: "Plain text content",
        blocks: [],
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
        is_favorite: false,
        is_pinned: false,
        is_encrypted: false,
        tags: [],
        word_count: 3,
        thumbnail_url: null,
        folder_id: null,
    };

    test("documentToPlainText with blocks joins content", () => {
        const text = documentToPlainText(docWithBlocks);
        expect(text).toContain("Title");
        expect(text).toContain("Some text here");
        expect(text).toContain("A quote");
    });

    test("documentToPlainText without blocks returns content", () => {
        const text = documentToPlainText(docWithContent);
        expect(text).toBe("Plain text content");
    });

    test("documentToMarkdown generates correct markdown", () => {
        const md = documentToMarkdown(docWithBlocks);
        expect(md).toContain("# Title");
        expect(md).toContain("> A quote");
        expect(md).toContain("```\nconst x = 1;\n```");
        expect(md).toContain("- Item A");
        expect(md).toContain("1. First");
        expect(md).toContain("2. Second");
        expect(md).toContain("---");
        expect(md).toContain("![Photo](https://img.png)");
    });

    test("documentToMarkdown without blocks returns content", () => {
        const md = documentToMarkdown(docWithContent);
        expect(md).toBe("Plain text content");
    });

    test("documentToHtml generates HTML document", () => {
        const html = documentToHtml(docWithBlocks);
        expect(html).toContain("<h1>Title</h1>");
        expect(html).toContain("<blockquote>A quote</blockquote>");
        expect(html).toContain("<pre><code>");
        expect(html).toContain("<ul>");
        expect(html).toContain("<ol>");
        expect(html).toContain("<hr/>");
        expect(html).toContain('<img src="https://img.png"');
        expect(html).toContain("<!DOCTYPE html>");
    });

    test("documentToHtml without blocks wraps content in p", () => {
        const html = documentToHtml(docWithContent);
        expect(html).toContain("<p>Plain text content</p>");
    });

    test("getExportMimeType returns correct types", () => {
        expect(getExportMimeType("pdf")).toBe("application/pdf");
        expect(getExportMimeType("txt")).toBe("text/plain");
        expect(getExportMimeType("md")).toBe("text/markdown");
        expect(getExportMimeType("html")).toBe("text/html");
        expect(getExportMimeType("xlsx")).toContain("spreadsheetml");
        expect(getExportMimeType("csv")).toBe("text/csv");
        expect(getExportMimeType("docx")).toContain("wordprocessingml");
        expect(getExportMimeType("pptx")).toContain("presentationml");
        expect(getExportMimeType("png")).toBe("image/png");
        expect(getExportMimeType("svg")).toBe("image/svg+xml");
    });

    test("exportDocumentContent dispatches to correct format", () => {
        const txt = exportDocumentContent(docWithContent, "txt");
        expect(txt).toBe("Plain text content");
        const md = exportDocumentContent(docWithBlocks, "md");
        expect(md).toContain("# Title");
        const html = exportDocumentContent(docWithBlocks, "html");
        expect(html).toContain("<h1>");
        const csv = exportDocumentContent(docWithContent, "csv");
        expect(csv).toBe("Plain text content");
    });

    test("exportDocumentContent falls back for complex formats", () => {
        const result = exportDocumentContent(docWithContent, "pdf");
        expect(result).toBe("Plain text content");
    });
});

// ═══════════════════════════════════════════════════════════════
// Spreadsheet Helpers
// ═══════════════════════════════════════════════════════════════

describe("Spreadsheet Helpers", () => {
    test("createEmptySpreadsheet generates correct grid", () => {
        const data = createEmptySpreadsheet(5, 3);
        expect(data.rows).toBe(5);
        expect(data.cols).toBe(3);
        expect(Object.keys(data.cells)).toHaveLength(15);
        expect(data.column_widths).toHaveLength(3);
        expect(data.row_heights).toHaveLength(5);
        expect(data.sheet_name).toBe("Feuille 1");
        // Check a specific cell
        const cell = data.cells["A1"];
        expect(cell.row).toBe(0);
        expect(cell.col).toBe(0);
        expect(cell.value).toBe("");
        expect(cell.formula).toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════
// Formula Engine
// ═══════════════════════════════════════════════════════════════

describe("evaluateFormula", () => {
    // Helper: 3x3 grid where A1=10, A2=20, A3=30, B1=5, B2=15
    function getCellValue(key) {
        const grid = {
            "A1": "10",
            "A2": "20",
            "A3": "30",
            "B1": "5",
            "B2": "15",
        };
        return grid[key] || "";
    }

    test("returns formula unchanged if no = prefix", () => {
        expect(evaluateFormula("hello", getCellValue)).toBe("hello");
    });

    test("returns formula for empty string", () => {
        expect(evaluateFormula("", getCellValue)).toBe("");
    });

    test("SUM range", () => {
        expect(evaluateFormula("=SUM(A1:A3)", getCellValue)).toBe("60");
    });

    test("SUM multi-column", () => {
        expect(evaluateFormula("=SUM(A1:B2)", getCellValue)).toBe("50");
    });

    test("AVG range", () => {
        expect(evaluateFormula("=AVG(A1:A3)", getCellValue)).toBe("20");
    });

    test("AVERAGE alias", () => {
        expect(evaluateFormula("=AVERAGE(A1:A3)", getCellValue)).toBe("20");
    });

    test("AVG returns 0 for empty range", () => {
        const emptyCellValue = () => "";
        expect(evaluateFormula("=AVG(A1:A3)", emptyCellValue)).toBe("0");
    });

    test("COUNT range", () => {
        expect(evaluateFormula("=COUNT(A1:B3)", getCellValue)).toBe("5");
    });

    test("MIN range", () => {
        expect(evaluateFormula("=MIN(A1:B2)", getCellValue)).toBe("5");
    });

    test("MIN returns 0 for empty range", () => {
        const emptyCellValue = () => "";
        expect(evaluateFormula("=MIN(A1:A1)", emptyCellValue)).toBe("0");
    });

    test("MAX range", () => {
        expect(evaluateFormula("=MAX(A1:A3)", getCellValue)).toBe("30");
    });

    test("MAX returns 0 for empty range", () => {
        const emptyCellValue = () => "";
        expect(evaluateFormula("=MAX(A1:A1)", emptyCellValue)).toBe("0");
    });

    test("cell reference", () => {
        expect(evaluateFormula("=A1", getCellValue)).toBe("10");
        expect(evaluateFormula("=B2", getCellValue)).toBe("15");
    });

    test("arithmetic addition", () => {
        expect(evaluateFormula("=A1+B1", getCellValue)).toBe("15");
    });

    test("arithmetic subtraction", () => {
        expect(evaluateFormula("=A2-B1", getCellValue)).toBe("15");
    });

    test("arithmetic multiplication", () => {
        expect(evaluateFormula("=A1*B1", getCellValue)).toBe("50");
    });

    test("arithmetic division", () => {
        expect(evaluateFormula("=A2/A1", getCellValue)).toBe("2");
    });

    test("division by zero", () => {
        const zeroCell = (key) => (key === "B1" ? "0" : "10");
        expect(evaluateFormula("=A1/B1", zeroCell)).toBe("#DIV/0");
    });

    test("arithmetic with NaN values returns #ERR", () => {
        const textCell = () => "abc";
        expect(evaluateFormula("=A1+B1", textCell)).toBe("#ERR");
    });

    test("unknown formula returns #ERR", () => {
        expect(evaluateFormula("=UNKNOWN(A1)", getCellValue)).toBe("#ERR");
    });

    test("case insensitive formula", () => {
        expect(evaluateFormula("=sum(a1:a3)", getCellValue)).toBe("60");
    });
});

// ═══════════════════════════════════════════════════════════════
// Presentation Helpers
// ═══════════════════════════════════════════════════════════════

describe("Presentation Helpers", () => {
    test("createEmptyPresentation creates valid structure", () => {
        const pres = createEmptyPresentation();
        expect(pres.slides).toHaveLength(1);
        expect(pres.slides[0].layout).toBe("title");
        expect(pres.theme.name).toBe("Default");
        expect(pres.aspect_ratio).toBe("16:9");
    });

    test("addSlide adds a new slide", () => {
        const pres = createEmptyPresentation();
        const updated = addSlide(pres, "content");
        expect(updated.slides).toHaveLength(2);
        expect(updated.slides[1].layout).toBe("content");
        expect(updated.slides[1].order).toBe(1);
    });

    test("removeSlide removes and reorders", () => {
        let pres = createEmptyPresentation();
        pres = addSlide(pres, "content");
        pres = addSlide(pres, "image");
        const firstId = pres.slides[0].id;
        const updated = removeSlide(pres, firstId);
        expect(updated.slides).toHaveLength(2);
        expect(updated.slides[0].order).toBe(0);
        expect(updated.slides[1].order).toBe(1);
    });

    test("reorderSlides moves slide correctly", () => {
        let pres = createEmptyPresentation();
        pres = addSlide(pres, "content");
        pres = addSlide(pres, "image");
        // Move first to last
        const reordered = reorderSlides(pres, 0, 2);
        expect(reordered.slides).toHaveLength(3);
        expect(reordered.slides[0].layout).toBe("content");
        expect(reordered.slides[2].layout).toBe("title");
        // Orders should be sequential
        expect(reordered.slides[0].order).toBe(0);
        expect(reordered.slides[1].order).toBe(1);
        expect(reordered.slides[2].order).toBe(2);
    });
});

// ═══════════════════════════════════════════════════════════════
// Mock Data & Constants
// ═══════════════════════════════════════════════════════════════

describe("Mock Data & Constants", () => {
    test("getMockDocuments returns 4 documents", () => {
        const docs = getMockDocuments();
        expect(docs).toHaveLength(4);
        const types = docs.map((d) => d.type);
        expect(types).toContain("note");
        expect(types).toContain("spreadsheet");
        expect(types).toContain("presentation");
    });

    test("getMockJournalEntries returns 2 entries", () => {
        const entries = getMockJournalEntries();
        expect(entries).toHaveLength(2);
        expect(entries[0].mood).toBe("great");
        expect(entries[1].mood).toBe("good");
    });

    test("PRESENTATION_THEMES has 5 themes", () => {
        expect(PRESENTATION_THEMES).toHaveLength(5);
        const names = PRESENTATION_THEMES.map((t) => t.name);
        expect(names).toContain("Classic");
        expect(names).toContain("Dark");
        expect(names).toContain("Nature");
        expect(names).toContain("Sunset");
        expect(names).toContain("Royal");
    });

    test("SLIDE_LAYOUTS has 5 layouts", () => {
        expect(SLIDE_LAYOUTS).toHaveLength(5);
        const ids = SLIDE_LAYOUTS.map((l) => l.id);
        expect(ids).toContain("title");
        expect(ids).toContain("content");
        expect(ids).toContain("two-column");
        expect(ids).toContain("image");
        expect(ids).toContain("blank");
    });
});
