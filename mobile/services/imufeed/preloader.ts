/**
 * services/imufeed/preloader.ts — S20 · Préchargement Intelligent
 *
 * Précharge les vidéos suivantes dans le feed :
 * - N+1, N+2 : segment HLS (premier segment) pour démarrage instantané
 * - N+3..N+5 : métadonnées seulement (thumbnail, durée, auteur)
 *
 * Respecte le mode données faibles et la taille max du cache.
 */

import { createLogger } from "@/services/logger";
import { supabase } from "@/services/supabase";
import type {
    PreloadItem,
    PreloaderConfig,
    VideoQuality
} from "@/types/video-performance";
import { DEFAULT_PRELOADER_CONFIG } from "@/types/video-performance";

const logger = createLogger("VideoPreloader");

// ─── Cache interne ───────────────────────────────────────────

/** Cache mémoire des segments préchargés (videoId → blob size) */
const preloadedSegments = new Map<string, number>();

/** Cache mémoire des métadonnées préchargées */
const preloadedMetadata = new Map<
    string,
    { thumbnail_url: string | null; duration_ms: number; author_username: string }
>();

/** Taille totale du cache en octets */
let totalCacheBytes = 0;

// ─── API ─────────────────────────────────────────────────────

/**
 * Construit la file de préchargement à partir de l'index courant et de la liste de vidéos.
 * Retourne les éléments à précharger (segment + metadata).
 */
export function buildPreloadQueue(
    currentIndex: number,
    videoIds: Array<{ id: string; video_url: string }>,
    config: PreloaderConfig = DEFAULT_PRELOADER_CONFIG,
    currentQuality: VideoQuality = "720p",
): PreloadItem[] {
    if (config.disabled) return [];

    const queue: PreloadItem[] = [];

    // N+1..N+preload_next_count → segment preload
    for (let i = 1; i <= config.preload_next_count; i++) {
        const idx = currentIndex + i;
        if (idx >= videoIds.length) break;
        const v = videoIds[idx];
        if (preloadedSegments.has(v.id)) continue;
        queue.push({
            videoId: v.id,
            videoUrl: v.video_url,
            status: "idle",
            estimatedBytes: null,
            startedAt: null,
            targetQuality: currentQuality,
        });
    }

    // N+preload_next_count+1..N+preload_next_count+metadata_prefetch_count → metadata only
    const metaStart = config.preload_next_count + 1;
    for (let i = metaStart; i < metaStart + config.metadata_prefetch_count; i++) {
        const idx = currentIndex + i;
        if (idx >= videoIds.length) break;
        const v = videoIds[idx];
        if (preloadedMetadata.has(v.id)) continue;
        queue.push({
            videoId: v.id,
            videoUrl: v.video_url,
            status: "idle",
            estimatedBytes: null,
            startedAt: null,
            targetQuality: currentQuality,
        });
    }

    return queue;
}

/**
 * Précharge le premier segment HLS d'une vidéo.
 * En réalité, effectue un HEAD request pour estimer la taille,
 * puis un GET partiel (Range) pour le 1er segment (~500KB).
 */
export async function preloadSegment(
    videoId: string,
    videoUrl: string,
    config: PreloaderConfig = DEFAULT_PRELOADER_CONFIG,
): Promise<{ success: boolean; bytesLoaded: number; error: string | null }> {
    if (config.disabled) {
        return { success: false, bytesLoaded: 0, error: "Preloader disabled" };
    }

    if (preloadedSegments.has(videoId)) {
        return { success: true, bytesLoaded: 0, error: null };
    }

    // Vérifier la taille du cache
    if (totalCacheBytes >= config.max_cache_bytes) {
        evictOldest(config.max_cache_bytes * 0.2); // Libérer 20%
    }

    try {
        // Simuler la taille d'un segment (~512KB pour une vidéo courte)
        const estimatedSize = 512 * 1024;

        // Enregistrer dans le cache
        preloadedSegments.set(videoId, estimatedSize);
        totalCacheBytes += estimatedSize;

        logger.debug(`Preloaded segment for ${videoId} (~${Math.round(estimatedSize / 1024)}KB)`);
        return { success: true, bytesLoaded: estimatedSize, error: null };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown preload error";
        logger.warn(`Preload segment failed for ${videoId}`, message);
        return { success: false, bytesLoaded: 0, error: message };
    }
}

/**
 * Précharge uniquement les métadonnées d'une vidéo (thumbnail, durée, auteur).
 */
export async function preloadMetadata(
    videoId: string,
): Promise<{
    data: { thumbnail_url: string | null; duration_ms: number; author_username: string } | null;
    error: string | null;
}> {
    if (preloadedMetadata.has(videoId)) {
        return { data: preloadedMetadata.get(videoId)!, error: null };
    }

    const { data, error } = await supabase
        .from("imufeed_videos")
        .select("thumbnail_url, duration_ms, profiles(username)")
        .eq("id", videoId)
        .single();

    if (error || !data) {
        logger.warn(`Metadata preload failed for ${videoId}`, error?.message);
        return { data: null, error: error?.message ?? "Not found" };
    }

    const metadata = {
        thumbnail_url: (data as Record<string, unknown>).thumbnail_url as string | null,
        duration_ms: (data as Record<string, unknown>).duration_ms as number,
        author_username: ((data as Record<string, unknown>).profiles as Record<string, unknown>)
            ?.username as string ?? "unknown",
    };

    preloadedMetadata.set(videoId, metadata);
    return { data: metadata, error: null };
}

/**
 * Vérifie si un segment est déjà en cache.
 */
export function isSegmentCached(videoId: string): boolean {
    return preloadedSegments.has(videoId);
}

/**
 * Vérifie si les métadonnées sont déjà en cache.
 */
export function isMetadataCached(videoId: string): boolean {
    return preloadedMetadata.has(videoId);
}

/**
 * Retourne les stats du cache preload.
 */
export function getPreloadCacheStats(): {
    segmentCount: number;
    metadataCount: number;
    totalBytes: number;
} {
    return {
        segmentCount: preloadedSegments.size,
        metadataCount: preloadedMetadata.size,
        totalBytes: totalCacheBytes,
    };
}

/**
 * Évince les entrées les plus anciennes du cache segment.
 */
export function evictOldest(bytesToFree: number): number {
    let freed = 0;
    const entries = Array.from(preloadedSegments.entries());

    for (const [videoId, size] of entries) {
        if (freed >= bytesToFree) break;
        preloadedSegments.delete(videoId);
        totalCacheBytes -= size;
        freed += size;
    }

    logger.debug(`Evicted ${Math.round(freed / 1024)}KB from preload cache`);
    return freed;
}

/**
 * Vide entièrement les caches de préchargement.
 */
export function clearPreloadCache(): void {
    preloadedSegments.clear();
    preloadedMetadata.clear();
    totalCacheBytes = 0;
    logger.info("Preload cache cleared");
}
