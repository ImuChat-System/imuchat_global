/**
 * contrast-checker — Utilitaires WCAG AA vérification contraste
 *
 * Fournit le calcul de luminance relative et le ratio de contraste
 * entre deux couleurs. Valide les ratios WCAG AA (4.5:1 text, 3:1 large text).
 *
 * Sprint S15A — Accessibilité & Polish
 */

/**
 * Parse a hex color string (#RGB, #RRGGBB, #RRGGBBAA) into RGB 0-255.
 * Also supports common named colors as fallback.
 */
export function parseHexColor(hex: string): { r: number; g: number; b: number } {
    // Remove # prefix
    let h = hex.replace(/^#/, "");

    // Support shorthand (#RGB → #RRGGBB)
    if (h.length === 3 || h.length === 4) {
        h = h
            .split("")
            .map((c) => c + c)
            .join("");
    }

    // Strip alpha channel if present
    if (h.length === 8) {
        h = h.slice(0, 6);
    }

    const num = parseInt(h, 16);
    if (isNaN(num)) {
        return { r: 0, g: 0, b: 0 }; // fallback black
    }

    return {
        r: (num >> 16) & 0xff,
        g: (num >> 8) & 0xff,
        b: num & 0xff,
    };
}

/**
 * WCAG 2.1 relative luminance
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function relativeLuminance(hex: string): number {
    const { r, g, b } = parseHexColor(hex);

    const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
        c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * WCAG 2.1 contrast ratio between two colors.
 * Returns a value between 1 and 21.
 */
export function contrastRatio(color1: string, color2: string): number {
    const l1 = relativeLuminance(color1);
    const l2 = relativeLuminance(color2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if the contrast ratio meets WCAG AA requirements.
 *
 * @param fg - Foreground color (hex)
 * @param bg - Background color (hex)
 * @param isLargeText - Large text uses relaxed ratio (3:1 vs 4.5:1)
 */
export function meetsWCAGAA(
    fg: string,
    bg: string,
    isLargeText: boolean = false,
): boolean {
    const ratio = contrastRatio(fg, bg);
    return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
}

/**
 * Check if the contrast ratio meets WCAG AAA requirements.
 */
export function meetsWCAGAAA(
    fg: string,
    bg: string,
    isLargeText: boolean = false,
): boolean {
    const ratio = contrastRatio(fg, bg);
    return isLargeText ? ratio >= 4.5 : ratio >= 7.0;
}

/**
 * WCAG compliance level result
 */
export type WCAGLevel = "AAA" | "AA" | "fail";

/**
 * Get the WCAG compliance level for a color pair.
 */
export function getWCAGLevel(
    fg: string,
    bg: string,
    isLargeText: boolean = false,
): WCAGLevel {
    if (meetsWCAGAAA(fg, bg, isLargeText)) return "AAA";
    if (meetsWCAGAA(fg, bg, isLargeText)) return "AA";
    return "fail";
}

/**
 * Audit result for a single color pair
 */
export interface ContrastAuditEntry {
    name: string;
    fg: string;
    bg: string;
    ratio: number;
    level: WCAGLevel;
    passes: boolean;
}

/**
 * Audit a theme's critical text/background pairs for WCAG AA compliance.
 *
 * @param colors - Theme colors object with at minimum: text, textMuted, textSecondary, background, card, surface, primary
 */
export function auditThemeContrast(
    colors: Record<string, string>,
): ContrastAuditEntry[] {
    const pairs: { name: string; fg: string; bg: string; large?: boolean }[] = [
        { name: "text/background", fg: colors.text, bg: colors.background },
        { name: "text/card", fg: colors.text, bg: colors.card },
        {
            name: "textMuted/background",
            fg: colors.textMuted,
            bg: colors.background,
        },
        {
            name: "textSecondary/background",
            fg: colors.textSecondary,
            bg: colors.background,
        },
        {
            name: "textSecondary/card",
            fg: colors.textSecondary,
            bg: colors.card,
        },
        {
            name: "primary/background",
            fg: colors.primary,
            bg: colors.background,
            large: true,
        },
        {
            name: "error/background",
            fg: colors.error,
            bg: colors.background,
        },
        {
            name: "success/background",
            fg: colors.success,
            bg: colors.background,
        },
    ];

    return pairs
        .filter((p) => p.fg && p.bg) // skip missing colors
        .map((pair) => {
            const ratio = contrastRatio(pair.fg, pair.bg);
            const level = getWCAGLevel(pair.fg, pair.bg, pair.large);
            return {
                name: pair.name,
                fg: pair.fg,
                bg: pair.bg,
                ratio: Math.round(ratio * 100) / 100,
                level,
                passes: level !== "fail",
            };
        });
}
