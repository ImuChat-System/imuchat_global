/**
 * useMemoryMonitor — Utilitaire de monitoring mémoire
 *
 * Fournit des outils pour détecter les fuites mémoire,
 * tracker les montages / démontages de composants,
 * et monitorer la pression mémoire.
 *
 * Sprint S14A — Memory Profiling
 */

import { useEffect, useRef, useState } from "react";

export interface MemorySnapshot {
    timestamp: number;
    componentCount: number;
    mountEvents: number;
    unmountEvents: number;
    leakSuspects: string[];
}

export interface UseMemoryMonitorReturn {
    /** Snapshot actuel */
    snapshot: MemorySnapshot;
    /** Enregistre un montage de composant */
    trackMount: (componentName: string) => void;
    /** Enregistre un démontage de composant */
    trackUnmount: (componentName: string) => void;
    /** Vérifie les fuites (montages sans démontages) */
    checkLeaks: () => string[];
    /** Réinitialise les compteurs */
    reset: () => void;
}

// Registry global partagé entre toutes les instances
const mountRegistry = new Map<string, number>();
let totalMounts = 0;
let totalUnmounts = 0;

export function useMemoryMonitor(): UseMemoryMonitorReturn {
    const [snapshot, setSnapshot] = useState<MemorySnapshot>({
        timestamp: Date.now(),
        componentCount: mountRegistry.size,
        mountEvents: totalMounts,
        unmountEvents: totalUnmounts,
        leakSuspects: [],
    });

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Refresh snapshot every 5 seconds
        intervalRef.current = setInterval(() => {
            const leaks = getLeakSuspects();
            setSnapshot({
                timestamp: Date.now(),
                componentCount: mountRegistry.size,
                mountEvents: totalMounts,
                unmountEvents: totalUnmounts,
                leakSuspects: leaks,
            });
        }, 5000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const trackMount = (componentName: string) => {
        const count = mountRegistry.get(componentName) || 0;
        mountRegistry.set(componentName, count + 1);
        totalMounts++;
    };

    const trackUnmount = (componentName: string) => {
        const count = mountRegistry.get(componentName) || 0;
        if (count <= 1) {
            mountRegistry.delete(componentName);
        } else {
            mountRegistry.set(componentName, count - 1);
        }
        totalUnmounts++;
    };

    const checkLeaks = (): string[] => {
        return getLeakSuspects();
    };

    const reset = () => {
        mountRegistry.clear();
        totalMounts = 0;
        totalUnmounts = 0;
        setSnapshot({
            timestamp: Date.now(),
            componentCount: 0,
            mountEvents: 0,
            unmountEvents: 0,
            leakSuspects: [],
        });
    };

    return { snapshot, trackMount, trackUnmount, checkLeaks, reset };
}

function getLeakSuspects(): string[] {
    const suspects: string[] = [];
    mountRegistry.forEach((count, name) => {
        if (count > 10) {
            suspects.push(`${name} (${count} instances)`);
        }
    });
    return suspects;
}

/**
 * useComponentLifecycle — Tracker automatique de montage/démontage
 *
 * Usage : useComponentLifecycle("MonComposant");
 */
export function useComponentLifecycle(componentName: string): void {
    useEffect(() => {
        const count = mountRegistry.get(componentName) || 0;
        mountRegistry.set(componentName, count + 1);
        totalMounts++;

        return () => {
            const c = mountRegistry.get(componentName) || 0;
            if (c <= 1) {
                mountRegistry.delete(componentName);
            } else {
                mountRegistry.set(componentName, c - 1);
            }
            totalUnmounts++;
        };
    }, [componentName]);
}

// Exports for testing
export { getLeakSuspects, mountRegistry };
export const _getCounters = () => ({ totalMounts, totalUnmounts });
export const _resetGlobals = () => {
    mountRegistry.clear();
    totalMounts = 0;
    totalUnmounts = 0;
};

export default useMemoryMonitor;
