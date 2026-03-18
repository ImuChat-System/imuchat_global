/**
 * stores/video-performance-store.ts — S20 · Zustand store Scalabilité & Performance
 *
 * Unifie : préchargement, adaptive-bitrate, mode données faibles, PiP, cache HLS.
 */

import {
    computeAverageBandwidth,
    createBandwidthSample,
    getDefaultQualityForNetwork,
    selectOptimalQuality,
} from "@/services/imufeed/adaptive-bitrate";
import {
    buildPreloadQueue,
    clearPreloadCache,
    getPreloadCacheStats,
    preloadMetadata,
    preloadSegment,
} from "@/services/imufeed/preloader";
import { createLogger } from "@/services/logger";
import type {
    AbrConfig,
    LowDataModeConfig,
    NetworkType,
    PipConfig,
    PipPosition,
    PreloaderConfig,
    VideoPerformanceStoreState,
    VideoQuality
} from "@/types/video-performance";
import {
    DEFAULT_ABR_CONFIG,
    DEFAULT_HLS_CACHE_STATS,
    DEFAULT_LOW_DATA_MODE,
    DEFAULT_PIP_CONFIG,
    DEFAULT_PRELOADER_CONFIG,
} from "@/types/video-performance";
import { create } from "zustand";

const logger = createLogger("VideoPerformanceStore");

export const initialVideoPerformanceState: Omit<
    VideoPerformanceStoreState,
    | "updatePreloaderConfig"
    | "triggerPreload"
    | "updateAbrConfig"
    | "recordBandwidth"
    | "selectQuality"
    | "setNetworkType"
    | "updateLowDataMode"
    | "activatePip"
    | "closePip"
    | "movePip"
    | "togglePipMute"
    | "updatePipPosition"
    | "updatePipConfig"
    | "refreshCacheStats"
    | "clearAllCaches"
    | "resetPerformanceStore"
    | "setCurrentQuality"
> = {
    preloaderConfig: DEFAULT_PRELOADER_CONFIG,
    preloadQueue: [],
    abrConfig: DEFAULT_ABR_CONFIG,
    currentQuality: "720p",
    bandwidthSamples: [],
    estimatedBandwidthKbps: 0,
    networkType: "unknown",
    lowDataMode: DEFAULT_LOW_DATA_MODE,
    pip: { status: "inactive", videoId: null, videoUrl: null, positionMs: 0, position: "bottom-right", isMuted: false },
    pipConfig: DEFAULT_PIP_CONFIG,
    cacheStats: DEFAULT_HLS_CACHE_STATS,
};

export const useVideoPerformanceStore = create<VideoPerformanceStoreState>()(
    (set, get) => ({
        // ─── State ─────────────────────────────────────────
        ...initialVideoPerformanceState,

        // ─── Preloader ─────────────────────────────────────

        updatePreloaderConfig: (partial: Partial<PreloaderConfig>) => {
            set((s) => ({
                preloaderConfig: { ...s.preloaderConfig, ...partial },
            }));
        },

        triggerPreload: async (currentIndex: number, videoIds: Array<{ id: string; video_url: string }>) => {
            const { preloaderConfig, currentQuality } = get();
            const queue = buildPreloadQueue(currentIndex, videoIds, preloaderConfig, currentQuality);
            set({ preloadQueue: queue });

            for (const item of queue) {
                if (item.status === "idle" && item.videoUrl) {
                    if (item.estimatedBytes === 0) {
                        // Metadata-only preload
                        await preloadMetadata(item.videoId);
                    } else {
                        await preloadSegment(item.videoId, item.videoUrl, preloaderConfig);
                    }
                }
            }
        },

        // ─── ABR ───────────────────────────────────────────

        updateAbrConfig: (partial: Partial<AbrConfig>) => {
            set((s) => ({
                abrConfig: { ...s.abrConfig, ...partial },
            }));
        },

        recordBandwidth: (bytesLoaded: number, durationMs: number) => {
            const { networkType, bandwidthSamples, abrConfig } = get();
            const sample = createBandwidthSample(bytesLoaded, durationMs, networkType);
            const updatedSamples = [...bandwidthSamples, sample].slice(-20); // garder 20 max
            const estimated = computeAverageBandwidth(updatedSamples, abrConfig.bandwidth_window_size);
            set({
                bandwidthSamples: updatedSamples,
                estimatedBandwidthKbps: estimated,
            });
        },

        selectQuality: () => {
            const { estimatedBandwidthKbps, currentQuality, abrConfig, lowDataMode, networkType } = get();
            const optimal = selectOptimalQuality(
                estimatedBandwidthKbps,
                currentQuality,
                abrConfig,
                lowDataMode,
                networkType,
            );
            if (optimal !== currentQuality) {
                set({ currentQuality: optimal });
            }
            return optimal;
        },

        setCurrentQuality: (quality: VideoQuality) => {
            set({ currentQuality: quality });
        },

        setNetworkType: (type: NetworkType) => {
            const { lowDataMode } = get();
            const defaultQ = getDefaultQualityForNetwork(type, lowDataMode);
            set({ networkType: type });

            // Si on n'a pas encore d'échantillons, utiliser la qualité par défaut
            const { bandwidthSamples } = get();
            if (bandwidthSamples.length === 0) {
                set({ currentQuality: defaultQ });
            }
        },

        // ─── Low Data Mode ─────────────────────────────────

        updateLowDataMode: (partial: Partial<LowDataModeConfig>) => {
            set((s) => {
                const updated = { ...s.lowDataMode, ...partial };
                const newState: Partial<VideoPerformanceStoreState> = { lowDataMode: updated };
                if (updated.enabled) {
                    newState.currentQuality = updated.forced_quality;
                }
                return newState;
            });
        },

        // ─── PiP ───────────────────────────────────────────

        activatePip: (videoId: string, videoUrl: string, positionMs: number) => {
            set({
                pip: {
                    status: "active",
                    videoId,
                    videoUrl,
                    positionMs,
                    position: get().pip.position,
                    isMuted: get().pip.isMuted,
                },
            });
        },

        closePip: () => {
            set({
                pip: {
                    status: "inactive",
                    videoId: null,
                    videoUrl: null,
                    positionMs: 0,
                    position: get().pip.position,
                    isMuted: false,
                },
            });
        },

        movePip: (position: PipPosition) => {
            set((s) => ({
                pip: { ...s.pip, position },
            }));
        },

        togglePipMute: () => {
            set((s) => ({
                pip: { ...s.pip, isMuted: !s.pip.isMuted },
            }));
        },

        updatePipPosition: (positionMs: number) => {
            set((s) => ({
                pip: { ...s.pip, positionMs },
            }));
        },

        updatePipConfig: (partial: Partial<PipConfig>) => {
            set((s) => ({
                pipConfig: { ...s.pipConfig, ...partial },
            }));
        },

        // ─── Cache ─────────────────────────────────────────

        refreshCacheStats: () => {
            const stats = getPreloadCacheStats();
            set({
                cacheStats: {
                    entryCount: stats.segmentCount + stats.metadataCount,
                    totalBytes: stats.totalBytes,
                    hitRate: 0,
                    hits: 0,
                    misses: 0,
                },
            });
        },

        clearAllCaches: () => {
            clearPreloadCache();
            set({ cacheStats: DEFAULT_HLS_CACHE_STATS, preloadQueue: [] });
        },

        // ─── Reset ─────────────────────────────────────────

        resetPerformanceStore: () => {
            clearPreloadCache();
            set({ ...initialVideoPerformanceState });
        },
    }),
);
