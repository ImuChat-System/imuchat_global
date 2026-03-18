/**
 * services/imufeed/alice-video.ts — S19 · Alice Résumé & Recherche Vidéo
 *
 * Intègre Alice IA dans ImuFeed :
 * - Résumé automatique d'une vidéo longue en texte
 * - Recherche naturelle ("trouve-moi des vidéos de cuisine japonaise")
 */

import { createLogger } from "@/services/logger";
import { supabase } from "@/services/supabase";
import type {
    AliceVideoSearchQuery,
    AliceVideoSearchResult,
    AliceVideoSummary,
} from "@/types/recommendation";

const logger = createLogger("AliceVideo");

/**
 * Demande à Alice (via edge function) un résumé texte d'une vidéo.
 */
export async function summarizeVideo(
    videoId: string,
): Promise<{ data: AliceVideoSummary | null; error: string | null }> {
    const { data, error } = await supabase.functions.invoke("alice-summarize-video", {
        body: { video_id: videoId },
    });

    if (error) {
        logger.warn("summarizeVideo invoke failed", error.message);
        return { data: null, error: error.message };
    }

    if (!data || !data.summary) {
        return { data: null, error: "Empty response from Alice" };
    }

    const summary: AliceVideoSummary = {
        video_id: videoId,
        summary: data.summary as string,
        key_points: (data.key_points as string[]) ?? [],
        original_duration_ms: (data.original_duration_ms as number) ?? 0,
        read_time_ms: (data.read_time_ms as number) ?? 0,
        language: (data.language as string) ?? "fr",
        generated_at: new Date().toISOString(),
    };

    return { data: summary, error: null };
}

/**
 * Recherche de vidéos via Alice en langage naturel.
 * Appelle une edge function qui utilise l'embedding de la requête
 * pour trouver des vidéos pertinentes.
 */
export async function searchVideos(
    query: AliceVideoSearchQuery,
): Promise<{ data: AliceVideoSearchResult[]; error: string | null }> {
    const { data, error } = await supabase.functions.invoke("alice-search-videos", {
        body: {
            query: query.query,
            category: query.category ?? null,
            max_duration_ms: query.max_duration_ms ?? null,
            limit: query.limit,
        },
    });

    if (error) {
        logger.warn("searchVideos invoke failed", error.message);
        return { data: [], error: error.message };
    }

    if (!data || !Array.isArray(data.results)) {
        return { data: [], error: null };
    }

    const results: AliceVideoSearchResult[] = (
        data.results as Array<Record<string, unknown>>
    ).map((r) => ({
        video_id: r.video_id as string,
        relevance_score: (r.relevance_score as number) ?? 0,
        match_excerpt: (r.match_excerpt as string) ?? "",
        title: (r.title as string) ?? "",
        author_username: (r.author_username as string) ?? "",
        thumbnail_url: (r.thumbnail_url as string) ?? null,
        category: (r.category as string) ?? "other",
    }));

    return { data: results, error: null };
}
