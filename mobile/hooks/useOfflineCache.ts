/**
 * useOfflineCache — Cache offline pour le Home Hub
 *
 * Persiste les données Home dans AsyncStorage et les restaure
 * quand l'appareil est offline. Utilise useNetworkState.
 *
 * Sprint S14A — Offline Home
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

import { useNetworkState } from "./useNetworkState";

const CACHE_PREFIX = "offline_cache:";
const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes

export interface OfflineCacheOptions {
    /** Clé de cache unique */
    key: string;
    /** TTL en ms (défaut: 30 min) */
    ttlMs?: number;
}

export interface UseOfflineCacheReturn<T> {
    /** Données actuelles (live ou cache) */
    data: T | null;
    /** True si les données viennent du cache offline */
    isOffline: boolean;
    /** True si le réseau est connecté */
    isConnected: boolean;
    /** True pendant le chargement initial du cache */
    isLoadingCache: boolean;
    /** Timestamp du dernier cache */
    cachedAt: number | null;
    /** Sauvegarder des données dans le cache */
    cacheData: (data: T) => Promise<void>;
    /** Effacer le cache */
    clearCache: () => Promise<void>;
    /** Restaurer depuis le cache */
    restoreFromCache: () => Promise<T | null>;
}

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export function useOfflineCache<T>(
    options: OfflineCacheOptions,
): UseOfflineCacheReturn<T> {
    const { key, ttlMs = DEFAULT_TTL_MS } = options;
    const network = useNetworkState();
    const cacheKey = `${CACHE_PREFIX}${key}`;

    const [data, setData] = useState<T | null>(null);
    const [isOffline, setIsOffline] = useState(false);
    const [isLoadingCache, setIsLoadingCache] = useState(true);
    const [cachedAt, setCachedAt] = useState<number | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Auto-restore from cache when going offline
    useEffect(() => {
        if (network.isConnected === false) {
            restoreFromCache();
        } else {
            setIsOffline(false);
        }
    }, [network.isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

    // Load cache on mount
    useEffect(() => {
        restoreFromCache().finally(() => {
            if (mountedRef.current) setIsLoadingCache(false);
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const cacheData = useCallback(
        async (newData: T): Promise<void> => {
            const entry: CacheEntry<T> = {
                data: newData,
                timestamp: Date.now(),
            };
            await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
            if (mountedRef.current) {
                setData(newData);
                setCachedAt(entry.timestamp);
                setIsOffline(false);
            }
        },
        [cacheKey],
    );

    const clearCache = useCallback(async (): Promise<void> => {
        await AsyncStorage.removeItem(cacheKey);
        if (mountedRef.current) {
            setData(null);
            setCachedAt(null);
        }
    }, [cacheKey]);

    const restoreFromCache = useCallback(async (): Promise<T | null> => {
        try {
            const raw = await AsyncStorage.getItem(cacheKey);
            if (!raw) return null;

            const entry: CacheEntry<T> = JSON.parse(raw);

            // Check TTL
            if (Date.now() - entry.timestamp > ttlMs) {
                await AsyncStorage.removeItem(cacheKey);
                return null;
            }

            if (mountedRef.current) {
                setData(entry.data);
                setCachedAt(entry.timestamp);
                setIsOffline(network.isConnected === false);
            }
            return entry.data;
        } catch {
            return null;
        }
    }, [cacheKey, ttlMs, network.isConnected]);

    return {
        data,
        isOffline,
        isConnected: network.isConnected ?? true,
        isLoadingCache,
        cachedAt,
        cacheData,
        clearCache,
        restoreFromCache,
    };
}

export default useOfflineCache;
