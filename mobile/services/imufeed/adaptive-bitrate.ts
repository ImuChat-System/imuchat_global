/**
 * services/imufeed/adaptive-bitrate.ts — S20 · Adaptive Bitrate (ABR)
 *
 * Gère la qualité vidéo adaptative :
 * - Mesure de bande passante via échantillons
 * - Moyenne glissante avec marge de sécurité
 * - Décisions de switch up/down selon les seuils
 * - Respect du mode données faibles
 */

import { createLogger } from "@/services/logger";
import type {
    AbrConfig,
    BandwidthSample,
    LowDataModeConfig,
    NetworkType,
    VideoQuality,
} from "@/types/video-performance";
import {
    DEFAULT_ABR_CONFIG,
    DEFAULT_LOW_DATA_MODE,
    QUALITY_PROFILES,
} from "@/types/video-performance";

const logger = createLogger("AdaptiveBitrate");

// ─── Ordinal pour comparaison de qualités ────────────────────

const QUALITY_ORDER: VideoQuality[] = ["360p", "480p", "720p", "1080p"];

function qualityIndex(q: VideoQuality): number {
    return QUALITY_ORDER.indexOf(q);
}

// ─── API ─────────────────────────────────────────────────────

/**
 * Calcule la bande passante moyenne à partir des échantillons récents.
 * Utilise une moyenne glissante pondérée (les derniers pèsent plus).
 */
export function computeAverageBandwidth(
    samples: BandwidthSample[],
    windowSize: number = DEFAULT_ABR_CONFIG.bandwidth_window_size,
): number {
    if (samples.length === 0) return 0;

    // Prendre les N derniers
    const recent = samples.slice(-windowSize);

    // Moyenne pondérée : poids croissant pour les plus récents
    let weightedSum = 0;
    let totalWeight = 0;
    for (let i = 0; i < recent.length; i++) {
        const weight = i + 1; // 1, 2, 3, ... N
        weightedSum += recent[i].kbps * weight;
        totalWeight += weight;
    }

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Détermine la qualité optimale en fonction de la bande passante estimée.
 *
 * Logique :
 * 1. En mode données faibles → retourner forced_quality
 * 2. Calculer la bande "effective" (moyenne × marge de sécurité)
 * 3. Choisir la meilleure qualité dont le bitrate ≤ bande effective
 * 4. Respecter min/max de la config ABR
 */
export function selectOptimalQuality(
    estimatedBandwidthKbps: number,
    currentQuality: VideoQuality,
    abrConfig: AbrConfig = DEFAULT_ABR_CONFIG,
    lowDataMode: LowDataModeConfig = DEFAULT_LOW_DATA_MODE,
    networkType: NetworkType = "wifi",
): VideoQuality {
    // Mode données faibles → qualité forcée
    if (lowDataMode.enabled) {
        return lowDataMode.forced_quality;
    }

    // ABR désactivé → garder la qualité courante
    if (!abrConfig.enabled) {
        return currentQuality;
    }

    // Offline ou connexion très faible → qualité minimum
    if (networkType === "offline") {
        return abrConfig.min_quality;
    }
    if (networkType === "2g") {
        return "360p";
    }

    const effectiveBandwidth = estimatedBandwidthKbps * abrConfig.safety_margin;
    const currentIdx = qualityIndex(currentQuality);
    const minIdx = qualityIndex(abrConfig.min_quality);
    const maxIdx = qualityIndex(abrConfig.max_quality);

    // Trouver la meilleure qualité possible
    let bestIdx = minIdx;
    for (let i = maxIdx; i >= minIdx; i--) {
        const q = QUALITY_ORDER[i];
        const profile = QUALITY_PROFILES[q];
        if (profile.bitrate_kbps <= effectiveBandwidth) {
            bestIdx = i;
            break;
        }
    }

    // Appliquer l'hystérésis pour éviter les oscillations
    if (bestIdx > currentIdx) {
        // Switch up : vérifier le seuil upswitch
        const targetQ = QUALITY_ORDER[bestIdx];
        const upThreshold = abrConfig.upswitch_threshold_kbps[targetQ];
        if (effectiveBandwidth < upThreshold) {
            return currentQuality; // Pas assez de marge pour monter
        }
    } else if (bestIdx < currentIdx) {
        // Switch down : vérifier le seuil downswitch
        const downThreshold = abrConfig.downswitch_threshold_kbps[currentQuality];
        if (effectiveBandwidth > downThreshold) {
            return currentQuality; // Bande passante encore au-dessus du seuil de descente
        }
    }

    const selected = QUALITY_ORDER[Math.max(minIdx, Math.min(maxIdx, bestIdx))];
    if (selected !== currentQuality) {
        logger.info(`ABR switch: ${currentQuality} → ${selected} (bw: ${estimatedBandwidthKbps}kbps)`);
    }
    return selected;
}

/**
 * Détermine la qualité recommandée selon le type de réseau (sans historique).
 * Utilisé comme point de départ avant d'avoir des échantillons.
 */
export function getDefaultQualityForNetwork(
    networkType: NetworkType,
    lowDataMode: LowDataModeConfig = DEFAULT_LOW_DATA_MODE,
): VideoQuality {
    if (lowDataMode.enabled) return lowDataMode.forced_quality;

    switch (networkType) {
        case "wifi":
            return "1080p";
        case "4g":
            return "720p";
        case "3g":
            return "480p";
        case "2g":
            return "360p";
        case "offline":
        case "unknown":
        default:
            return "360p";
    }
}

/**
 * Crée un échantillon de bande passante à partir d'un chargement observé.
 */
export function createBandwidthSample(
    bytesLoaded: number,
    durationMs: number,
    networkType: NetworkType,
): BandwidthSample {
    const kbps = durationMs > 0 ? Math.round((bytesLoaded * 8) / durationMs) : 0;
    return {
        timestamp: Date.now(),
        kbps,
        networkType,
    };
}

/**
 * Vérifie si la qualité sélectionnée est soutenable sur la durée.
 * Retourne false si la bande passante récente est instable (écart-type élevé).
 */
export function isBandwidthStable(
    samples: BandwidthSample[],
    windowSize: number = DEFAULT_ABR_CONFIG.bandwidth_window_size,
): boolean {
    if (samples.length < 3) return false;

    const recent = samples.slice(-windowSize);
    const values = recent.map((s) => s.kbps);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg === 0) return false;

    const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / avg;

    // Stable si le coefficient de variation < 30%
    return coefficientOfVariation < 0.3;
}
