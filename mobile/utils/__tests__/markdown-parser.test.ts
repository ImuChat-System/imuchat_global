import { hasMarkdown, parseMarkdown } from "../markdown-parser";

describe("parseMarkdown", () => {
    it("returns plain text for a simple string", () => {
        const result = parseMarkdown("Hello world");
        expect(result).toEqual([{ type: "text", content: "Hello world" }]);
    });

    it("returns plain text for empty string", () => {
        const result = parseMarkdown("");
        expect(result).toEqual([{ type: "text", content: "" }]);
    });

    // ─── Bold ────────────────────────────────────────────

    it("parses **bold** with double asterisks", () => {
        const result = parseMarkdown("Hello **world**");
        expect(result).toEqual([
            { type: "text", content: "Hello " },
            { type: "bold", content: "world" },
        ]);
    });

    it("parses __bold__ with double underscores", () => {
        const result = parseMarkdown("__bold__ text");
        expect(result).toEqual([
            { type: "bold", content: "bold" },
            { type: "text", content: " text" },
        ]);
    });

    it("parses bold in the middle of text", () => {
        const result = parseMarkdown("Start **middle** end");
        expect(result).toEqual([
            { type: "text", content: "Start " },
            { type: "bold", content: "middle" },
            { type: "text", content: " end" },
        ]);
    });

    // ─── Italic ──────────────────────────────────────────

    it("parses *italic* with single asterisks", () => {
        const result = parseMarkdown("This is *italic* text");
        expect(result).toEqual([
            { type: "text", content: "This is " },
            { type: "italic", content: "italic" },
            { type: "text", content: " text" },
        ]);
    });

    it("parses _italic_ with single underscores", () => {
        const result = parseMarkdown("_emphasis_ here");
        expect(result).toEqual([
            { type: "italic", content: "emphasis" },
            { type: "text", content: " here" },
        ]);
    });

    // ─── Code ────────────────────────────────────────────

    it("parses `code` inline", () => {
        const result = parseMarkdown("Run `npm install` please");
        expect(result).toEqual([
            { type: "text", content: "Run " },
            { type: "code", content: "npm install" },
            { type: "text", content: " please" },
        ]);
    });

    // ─── Strikethrough ───────────────────────────────────

    it("parses ~~strikethrough~~", () => {
        const result = parseMarkdown("This is ~~deleted~~ text");
        expect(result).toEqual([
            { type: "text", content: "This is " },
            { type: "strikethrough", content: "deleted" },
            { type: "text", content: " text" },
        ]);
    });

    // ─── Links ───────────────────────────────────────────

    it("parses [link](url)", () => {
        const result = parseMarkdown("Visit [Google](https://google.com) now");
        expect(result).toEqual([
            { type: "text", content: "Visit " },
            { type: "link", content: "Google", url: "https://google.com" },
            { type: "text", content: " now" },
        ]);
    });

    // ─── Combined ────────────────────────────────────────

    it("parses multiple markdown types in one message", () => {
        const result = parseMarkdown("**bold** and *italic* and `code`");
        expect(result).toHaveLength(5);
        expect(result[0]).toEqual({ type: "bold", content: "bold" });
        expect(result[1]).toEqual({ type: "text", content: " and " });
        expect(result[2]).toEqual({ type: "italic", content: "italic" });
        expect(result[3]).toEqual({ type: "text", content: " and " });
        expect(result[4]).toEqual({ type: "code", content: "code" });
    });

    it("handles consecutive bold segments", () => {
        const result = parseMarkdown("**a** **b**");
        expect(result).toEqual([
            { type: "bold", content: "a" },
            { type: "text", content: " " },
            { type: "bold", content: "b" },
        ]);
    });

    // ─── Edge cases ──────────────────────────────────────

    it("does not parse unmatched markers", () => {
        const result = parseMarkdown("This has no *closing marker");
        // With greedy regex, unmatched single * won't form a segment
        expect(result.length).toBeGreaterThanOrEqual(1);
        // First segment should contain the raw text
        expect(result.some((s) => s.content.includes("no"))).toBe(true);
    });

    it("handles text with only special characters", () => {
        const result = parseMarkdown("***");
        expect(result.length).toBeGreaterThanOrEqual(1);
    });
});

describe("hasMarkdown", () => {
    it("returns true for text with bold markers", () => {
        expect(hasMarkdown("**hello**")).toBe(true);
    });

    it("returns true for text with italic markers", () => {
        expect(hasMarkdown("*hello*")).toBe(true);
    });

    it("returns true for text with code markers", () => {
        expect(hasMarkdown("`code`")).toBe(true);
    });

    it("returns true for text with strikethrough markers", () => {
        expect(hasMarkdown("~~text~~")).toBe(true);
    });

    it("returns true for text with link markers", () => {
        expect(hasMarkdown("[link](url)")).toBe(true);
    });

    it("returns false for plain text", () => {
        expect(hasMarkdown("Hello world")).toBe(false);
    });

    it("returns false for empty string", () => {
        expect(hasMarkdown("")).toBe(false);
    });

    it("returns false for numbers only", () => {
        expect(hasMarkdown("12345")).toBe(false);
    });
});
