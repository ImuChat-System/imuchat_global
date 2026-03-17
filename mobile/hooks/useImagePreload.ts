/**
 * useImagePreload — Préchargement d'images pour performances
 *
 * Utilise Image.prefetch de React Native pour preload
 * les images critiques (avatars, hero banners, thumbnails).
 *
 * Sprint S14A — Image Preloading
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Image } from "react-native";

export interface ImagePreloadStatus {
    /** URLs ayant réussi le préchargement */
    loaded: string[];
    /** URLs ayant échoué */
    failed: string[];
    /** URLs en cours de chargement */
    pending: string[];
    /** Progression (0 à 1) */
    progress: number;
    /** Si tout est terminé */
    isComplete: boolean;
}

export interface UseImagePreloadOptions {
    /** URLs à précharger */
    urls: string[];
    /** Charger immédiatement au montage */
    immediate?: boolean;
    /** Nombre max de préchargements parallèles */
    concurrency?: number;
}

export function useImagePreload(
    options: UseImagePreloadOptions
): ImagePreloadStatus & { preload: () => Promise<void> } {
    const { urls, immediate = true, concurrency = 3 } = options;

    // Stabilize urls reference to avoid infinite re-render loops
    const urlsRef = useRef(urls);
    urlsRef.current = urls;

    const [loaded, setLoaded] = useState<string[]>([]);
    const [failed, setFailed] = useState<string[]>([]);
    const [pending, setPending] = useState<string[]>([]);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const preloadSingle = useCallback(async (url: string): Promise<boolean> => {
        if (!url || typeof url !== "string") return false;
        try {
            await Image.prefetch(url);
            return true;
        } catch {
            return false;
        }
    }, []);

    const preload = useCallback(async () => {
        const validUrls = urlsRef.current.filter((u) => u && typeof u === "string");
        if (validUrls.length === 0) return;

        if (mountedRef.current) {
            setPending(validUrls);
            setLoaded([]);
            setFailed([]);
        }

        // Preload en batches de `concurrency`
        for (let i = 0; i < validUrls.length; i += concurrency) {
            const batch = validUrls.slice(i, i + concurrency);
            const results = await Promise.allSettled(
                batch.map((url) => preloadSingle(url).then((ok) => ({ url, ok })))
            );

            if (!mountedRef.current) return;

            results.forEach((result) => {
                if (result.status === "fulfilled") {
                    const { url, ok } = result.value;
                    if (ok) {
                        setLoaded((prev) => [...prev, url]);
                    } else {
                        setFailed((prev) => [...prev, url]);
                    }
                    setPending((prev) => prev.filter((u) => u !== url));
                }
            });
        }
    }, [concurrency, preloadSingle]);

    useEffect(() => {
        if (immediate && urls.length > 0) {
            preload();
        }
    }, [immediate, preload, urls.length]);

    const total = urls.filter((u) => u && typeof u === "string").length;
    const doneCount = loaded.length + failed.length;
    const progress = total > 0 ? doneCount / total : 1;
    const isComplete = total > 0 ? doneCount >= total : true;

    return { loaded, failed, pending, progress, isComplete, preload };
}

/**
 * Utilitaire : précharge une liste d'images (non-hook, pour usage ponctuel)
 */
export async function prefetchImages(urls: string[]): Promise<{ loaded: string[]; failed: string[] }> {
    const loaded: string[] = [];
    const failed: string[] = [];

    await Promise.allSettled(
        urls
            .filter((u) => u && typeof u === "string")
            .map(async (url) => {
                try {
                    await Image.prefetch(url);
                    loaded.push(url);
                } catch {
                    failed.push(url);
                }
            })
    );

    return { loaded, failed };
}

export default useImagePreload;
