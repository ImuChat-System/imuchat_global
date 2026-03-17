/**
 * useLazySection — Chargement différé de sections
 *
 * Permet de charger les sections Home / Feed uniquement
 * quand elles deviennent visibles ou après un délai.
 *
 * Sprint S14A — Lazy Loading
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface LazySectionOptions {
    /** Délai en ms avant chargement automatique (fallback) */
    delayMs?: number;
    /** Si true, charge immédiatement sans attendre la visibilité */
    eager?: boolean;
    /** Priorité (les sections haute priorité chargent d'abord) */
    priority?: "high" | "medium" | "low";
}

export interface UseLazySectionReturn {
    /** Si la section doit être rendue */
    shouldRender: boolean;
    /** Si la section est en cours de chargement */
    isLoading: boolean;
    /** Déclenche le chargement manuellement */
    triggerLoad: () => void;
    /** Indique que le contenu a fini de charger */
    markLoaded: () => void;
}

const PRIORITY_DELAYS: Record<string, number> = {
    high: 100,
    medium: 500,
    low: 1500,
};

export function useLazySection(
    options: LazySectionOptions = {}
): UseLazySectionReturn {
    const {
        delayMs,
        eager = false,
        priority = "medium",
    } = options;

    const [shouldRender, setShouldRender] = useState(eager);
    const [isLoading, setIsLoading] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mountedRef = useRef(true);

    const effectiveDelay = delayMs ?? PRIORITY_DELAYS[priority] ?? 500;

    useEffect(() => {
        mountedRef.current = true;

        if (!eager) {
            timerRef.current = setTimeout(() => {
                if (mountedRef.current) {
                    setShouldRender(true);
                    setIsLoading(true);
                }
            }, effectiveDelay);
        } else {
            setIsLoading(true);
        }

        return () => {
            mountedRef.current = false;
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [eager, effectiveDelay]);

    const triggerLoad = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (mountedRef.current) {
            setShouldRender(true);
            setIsLoading(true);
        }
    }, []);

    const markLoaded = useCallback(() => {
        if (mountedRef.current) {
            setIsLoading(false);
        }
    }, []);

    return { shouldRender, isLoading, triggerLoad, markLoaded };
}

/**
 * useLazySectionGroup — Chargement séquentiel de sections par priorité
 *
 * Charge d'abord les sections "high", puis "medium", puis "low"
 */
export interface SectionConfig {
    key: string;
    priority: "high" | "medium" | "low";
}

export function useLazySectionGroup(sections: SectionConfig[]): Record<string, boolean> {
    const [loaded, setLoaded] = useState<Record<string, boolean>>({});

    // Stabilize sections reference to avoid infinite re-render loops
    const sectionsKey = JSON.stringify(sections);
    const stableSections = useMemo(() => sections, [sectionsKey]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const grouped = {
            high: stableSections.filter((s) => s.priority === "high"),
            medium: stableSections.filter((s) => s.priority === "medium"),
            low: stableSections.filter((s) => s.priority === "low"),
        };

        const timers: ReturnType<typeof setTimeout>[] = [];

        // High = immédiat
        grouped.high.forEach((s) => {
            setLoaded((prev) => ({ ...prev, [s.key]: true }));
        });

        // Medium = 300ms
        if (grouped.medium.length > 0) {
            timers.push(
                setTimeout(() => {
                    setLoaded((prev) => {
                        const next = { ...prev };
                        grouped.medium.forEach((s) => { next[s.key] = true; });
                        return next;
                    });
                }, 300)
            );
        }

        // Low = 800ms
        if (grouped.low.length > 0) {
            timers.push(
                setTimeout(() => {
                    setLoaded((prev) => {
                        const next = { ...prev };
                        grouped.low.forEach((s) => { next[s.key] = true; });
                        return next;
                    });
                }, 800)
            );
        }

        return () => timers.forEach(clearTimeout);
    }, [stableSections]);

    return loaded;
}

export default useLazySection;
