/**
 * Markdown Light Renderer pour MessageBubble
 *
 * Parse un sous-ensemble de Markdown couramment utilisé en messagerie :
 * - **gras**
 * - *italique*
 * - `code inline`
 * - ~~barré~~
 * - [lien](url)
 *
 * Retourne un tableau de segments typés que le composant React Native consomme.
 */

export type SegmentType = "text" | "bold" | "italic" | "code" | "strikethrough" | "link";

export interface TextSegment {
    type: SegmentType;
    content: string;
    url?: string; // uniquement pour type "link"
}

/**
 * Regex combiné qui capture les patterns Markdown dans l'ordre de priorité.
 *
 * Groupes nommés :
 *   1. link       → [texte](url)
 *   2. bold       → **texte** ou __texte__
 *   3. italic     → *texte* ou _texte_
 *   4. code       → `code`
 *   5. strike     → ~~texte~~
 */
const MD_REGEX =
    /\[(?<linkText>[^\]]+)\]\((?<linkUrl>[^)]+)\)|(?:\*\*|__)(?<bold>.+?)(?:\*\*|__)|(?:\*|_)(?<italic>.+?)(?:\*|_)|`(?<code>[^`]+)`|~~(?<strike>.+?)~~/g;

/**
 * Parse un texte contenant du Markdown léger en segments typés.
 *
 * @param text - Texte brut potentiellement formaté
 * @returns Tableau de segments
 */
export function parseMarkdown(text: string): TextSegment[] {
    const segments: TextSegment[] = [];
    let lastIndex = 0;

    // Réinitialiser le regex (global flag)
    MD_REGEX.lastIndex = 0;

    let match: RegExpExecArray | null;

    while ((match = MD_REGEX.exec(text)) !== null) {
        // Texte brut avant le match
        if (match.index > lastIndex) {
            segments.push({
                type: "text",
                content: text.slice(lastIndex, match.index),
            });
        }

        const groups = match.groups!;

        if (groups.linkText && groups.linkUrl) {
            segments.push({
                type: "link",
                content: groups.linkText,
                url: groups.linkUrl,
            });
        } else if (groups.bold) {
            segments.push({ type: "bold", content: groups.bold });
        } else if (groups.italic) {
            segments.push({ type: "italic", content: groups.italic });
        } else if (groups.code) {
            segments.push({ type: "code", content: groups.code });
        } else if (groups.strike) {
            segments.push({ type: "strikethrough", content: groups.strike });
        }

        lastIndex = match.index + match[0].length;
    }

    // Texte restant après le dernier match
    if (lastIndex < text.length) {
        segments.push({ type: "text", content: text.slice(lastIndex) });
    }

    // Aucun match → retourner le texte brut complet
    if (segments.length === 0) {
        segments.push({ type: "text", content: text });
    }

    return segments;
}

/**
 * Vérifie rapidement si un texte contient potentiellement du Markdown.
 * Permet d'éviter le parsing coûteux sur des messages simples.
 */
export function hasMarkdown(text: string): boolean {
    return /[*_`~\[]/.test(text);
}
