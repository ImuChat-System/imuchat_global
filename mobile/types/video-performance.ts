/**
 * types/video-performance.ts — S20 · Scalabilité & Performance
 *
 * Types pour :
 * - Préchargement vidéo (preloader)
 * - Adaptive bitrate (ABR)
 * - Mode données faibles
 * - Picture-in-Picture (PiP)
 * - Cache HLS
 */

// ─── Qualité vidéo ───────────────────────────────────────────

/** Résolution disponible pour le streaming */
export type VideoQuality = "360p" | "480p" | "720p" | "1080p";

/** Profil bitrate pour chaque qualité */
export interface QualityProfile {
    quality: VideoQuality;
    /** Bitrate vidéo en kbps */
    bitrate_kbps: number;
    /** Résolution (largeur) */
    width: number;
    /** Résolution (hauteur) */
    height: number;
    /** Label affiché dans les settings */
    label: string;
}

/** Profils par défaut */
export const QUALITY_PROFILES: Record<VideoQuality, QualityProfile> = {
    "360p": {
        quality: "360p",
        bitrate_kbps: 800,
        width: 360,
        height: 640,
        label: "360p — Économie",
    },
    "480p": {
        quality: "480p",
        bitrate_kbps: 1500,
        width: 480,
        height: 854,
        label: "480p — Standard",
    },
    "720p": {
        quality: "720p",
        bitrate_kbps: 3000,
        width: 720,
        height: 1280,
        label: "720p — HD",
    },
    "1080p": {
        quality: "1080p",
        bitrate_kbps: 5000,
        width: 1080,
        height: 1920,
        label: "1080p — Full HD",
    },
};

// ─── Preloader ───────────────────────────────────────────────

/** Statut de préchargement d'une vidéo */
export type PreloadStatus =
    | "idle"
    | "preloading_metadata"
    | "preloading_segment"
    | "ready"
    | "error";

/** Élément dans la file de préchargement */
export interface PreloadItem {
    videoId: string;
    videoUrl: string;
    status: PreloadStatus;
    /** Taille estimée en octets (si connue) */
    estimatedBytes: number | null;
    /** Timestamp de début de préchargement */
    startedAt: number | null;
    /** Qualité ciblée pour le préchargement */
    targetQuality: VideoQuality;
}

/** Configuration du préchargeur */
export interface PreloaderConfig {
    /** Nombre de vidéos N+1 à précharger (segment HLS) */
    preload_next_count: number;
    /** Nombre de vidéos N+2 à précharger (metadata seulement) */
    metadata_prefetch_count: number;
    /** Taille max du cache preload en octets */
    max_cache_bytes: number;
    /** Désactiver le préchargement auto (mode données faibles) */
    disabled: boolean;
}

/** Valeurs par défaut du préchargeur */
export const DEFAULT_PRELOADER_CONFIG: PreloaderConfig = {
    preload_next_count: 2,
    metadata_prefetch_count: 3,
    max_cache_bytes: 50 * 1024 * 1024, // 50 MB
    disabled: false,
};

// ─── Adaptive Bitrate (ABR) ──────────────────────────────────

/** Type de connexion réseau */
export type NetworkType = "wifi" | "4g" | "3g" | "2g" | "offline" | "unknown";

/** Mesure de bande passante */
export interface BandwidthSample {
    /** Timestamp de la mesure */
    timestamp: number;
    /** Bande passante estimée en kbps */
    kbps: number;
    /** Type de connexion lors de la mesure */
    networkType: NetworkType;
}

/** Configuration ABR */
export interface AbrConfig {
    /** Activer l'adaptation automatique */
    enabled: boolean;
    /** Qualité max autorisée */
    max_quality: VideoQuality;
    /** Qualité min autorisée */
    min_quality: VideoQuality;
    /** Nombre d'échantillons pour la moyenne glissante */
    bandwidth_window_size: number;
    /** Marge de sécurité (0-1, ex: 0.8 = utiliser 80% de la bande estimée) */
    safety_margin: number;
    /** Seuils de switch en kbps (descente) */
    downswitch_threshold_kbps: Record<VideoQuality, number>;
    /** Seuils de switch en kbps (montée) */
    upswitch_threshold_kbps: Record<VideoQuality, number>;
}

/** Valeurs par défaut ABR */
export const DEFAULT_ABR_CONFIG: AbrConfig = {
    enabled: true,
    max_quality: "1080p",
    min_quality: "360p",
    bandwidth_window_size: 5,
    safety_margin: 0.8,
    downswitch_threshold_kbps: {
        "360p": 0,
        "480p": 600,
        "720p": 1200,
        "1080p": 2500,
    },
    upswitch_threshold_kbps: {
        "360p": 1000,
        "480p": 1800,
        "720p": 3500,
        "1080p": 6000,
    },
};

// ─── Mode données faibles ────────────────────────────────────

/** Configuration du mode données faibles */
export interface LowDataModeConfig {
    /** Activé (force 360p, désactive preload, réduit metadata) */
    enabled: boolean;
    /** Qualité forcée en mode faible */
    forced_quality: VideoQuality;
    /** Désactiver autoplay */
    disable_autoplay: boolean;
    /** Précharger uniquement les métadonnées (pas de segments) */
    metadata_only_preload: boolean;
    /** Afficher les thumbnails basse résolution */
    low_res_thumbnails: boolean;
}

/** Valeurs par défaut du mode données faibles */
export const DEFAULT_LOW_DATA_MODE: LowDataModeConfig = {
    enabled: false,
    forced_quality: "360p",
    disable_autoplay: false,
    metadata_only_preload: true,
    low_res_thumbnails: true,
};

// ─── Picture-in-Picture (PiP) ────────────────────────────────

/** Statut PiP */
export type PipStatus = "inactive" | "activating" | "active" | "closing";

/** Position du PiP overlay */
export type PipPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** État du PiP */
export interface PipState {
    status: PipStatus;
    /** Vidéo actuellement en PiP */
    videoId: string | null;
    videoUrl: string | null;
    /** Position dans la lecture (ms) */
    positionMs: number;
    /** Position de l'overlay */
    position: PipPosition;
    /** Muet en PiP */
    isMuted: boolean;
}

/** Configuration PiP */
export interface PipConfig {
    /** Activer le PiP */
    enabled: boolean;
    /** Taille de la fenêtre PiP (proportion de l'écran) */
    size_ratio: number;
    /** Auto-PiP quand on quitte ImuFeed avec vidéo en cours */
    auto_pip_on_leave: boolean;
}

/** Valeurs par défaut PiP */
export const DEFAULT_PIP_CONFIG: PipConfig = {
    enabled: true,
    size_ratio: 0.28,
    auto_pip_on_leave: true,
};

// ─── Cache HLS ───────────────────────────────────────────────

/** Entrée du cache HLS */
export interface HlsCacheEntry {
    videoId: string;
    segmentUrl: string;
    /** Taille en octets */
    sizeBytes: number;
    /** Qualité du segment mis en cache */
    quality: VideoQuality;
    /** Timestamp du cache */
    cachedAt: number;
    /** Dernière utilisation */
    lastAccessedAt: number;
}

/** Statistiques du cache */
export interface HlsCacheStats {
    /** Nombre d'entrées en cache */
    entryCount: number;
    /** Taille totale en octets */
    totalBytes: number;
    /** Taux de hit (0-1) */
    hitRate: number;
    /** Nombre de hits depuis le dernier reset */
    hits: number;
    /** Nombre de misses depuis le dernier reset */
    misses: number;
}

/** Valeurs par défaut du cache */
export const DEFAULT_HLS_CACHE_STATS: HlsCacheStats = {
    entryCount: 0,
    totalBytes: 0,
    hitRate: 0,
    hits: 0,
    misses: 0,
};

// ─── Store State ─────────────────────────────────────────────

/** État global du store video-performance */
export interface VideoPerformanceStoreState {
    // --- Config ---
    preloaderConfig: PreloaderConfig;
    abrConfig: AbrConfig;
    lowDataMode: LowDataModeConfig;
    pipConfig: PipConfig;

    // --- Runtime State ---
    preloadQueue: PreloadItem[];
    currentQuality: VideoQuality;
    bandwidthSamples: BandwidthSample[];
    estimatedBandwidthKbps: number;
    networkType: NetworkType;
    pip: PipState;
    cacheStats: HlsCacheStats;

    // --- Actions ---
    updatePreloaderConfig: (config: Partial<PreloaderConfig>) => void;
    triggerPreload: (currentIndex: number, videoIds: Array<{ id: string; video_url: string }>) => Promise<void>;
    updateAbrConfig: (config: Partial<AbrConfig>) => void;
    recordBandwidth: (bytesLoaded: number, durationMs: number) => void;
    selectQuality: () => VideoQuality;
    setCurrentQuality: (quality: VideoQuality) => void;
    setNetworkType: (type: NetworkType) => void;
    updateLowDataMode: (config: Partial<LowDataModeConfig>) => void;
    activatePip: (videoId: string, videoUrl: string, positionMs: number) => void;
    closePip: () => void;
    movePip: (position: PipPosition) => void;
    togglePipMute: () => void;
    updatePipPosition: (positionMs: number) => void;
    updatePipConfig: (config: Partial<PipConfig>) => void;
    refreshCacheStats: () => void;
    clearAllCaches: () => void;
    resetPerformanceStore: () => void;
}
