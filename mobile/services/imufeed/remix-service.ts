/**
 * remix-service — Duo, Remix & Green Screen
 *
 * Logique métier pour les modes de co-création vidéo :
 * - Duo (split-screen côte à côte)
 * - Remix (PiP + audio source)
 * - Green Screen (fond vidéo)
 * + Effets post-production (flou, stabilisation, correction lumière)
 *
 * Sprint S11 Axe B — Éditeur Avancé
 */

import { createLogger } from "@/services/logger";
import { supabase } from "@/services/supabase";
import type {
    AdvancedCreationMetadata,
    AppliedPostEffect,
    DuoLayout,
    GreenScreenConfig,
    PostEffectType,
    RemixConfig,
    VideoCreationMode,
} from "@/types/imufeed";

const logger = createLogger("RemixService");

// ─── Valeurs par défaut ───────────────────────────────────────

export const DEFAULT_DUO_LAYOUT: DuoLayout = {
    orientation: "vertical",
    sourceRatio: 0.5,
    sourceFirst: true,
};

export const DEFAULT_REMIX_CONFIG: RemixConfig = {
    thumbnailScale: 0.3,
    thumbnailPosition: "top-right",
    useSourceAudio: true,
    sourceAudioVolume: 0.5,
};

export const DEFAULT_GREEN_SCREEN_CONFIG: GreenScreenConfig = {
    tolerance: 0.4,
    smoothing: 0.5,
};

// ─── Post Effects Catalog ─────────────────────────────────────

export interface PostEffectDefinition {
    type: PostEffectType;
    name: string;
    description: string;
    icon: string;
    defaultIntensity: number;
    isPremium: boolean;
}

export const POST_EFFECTS_CATALOG: PostEffectDefinition[] = [
    {
        type: "blur_bg",
        name: "Flou arrière-plan",
        description: "Détection IA du sujet + flou du fond",
        icon: "eye-off-outline",
        defaultIntensity: 0.6,
        isPremium: false,
    },
    {
        type: "stabilization",
        name: "Stabilisation",
        description: "Réduit les tremblements de la vidéo",
        icon: "hand-left-outline",
        defaultIntensity: 0.8,
        isPremium: false,
    },
    {
        type: "light_correction",
        name: "Correction lumière",
        description: "Ajustement auto de luminosité et contraste",
        icon: "sunny-outline",
        defaultIntensity: 0.5,
        isPremium: false,
    },
    {
        type: "color_grade",
        name: "Étalonnage couleurs",
        description: "Correction avancée des couleurs",
        icon: "color-palette-outline",
        defaultIntensity: 0.5,
        isPremium: true,
    },
];

// ─── Fonctions utilitaires ────────────────────────────────────

/**
 * Retourne la config par défaut selon le mode.
 */
export function getDefaultMetadata(
    mode: VideoCreationMode,
    sourceVideoId?: string,
): AdvancedCreationMetadata {
    return {
        mode,
        sourceVideoId: sourceVideoId ?? null,
        duoLayout: mode === "duo" ? DEFAULT_DUO_LAYOUT : null,
        remixConfig: mode === "remix" ? DEFAULT_REMIX_CONFIG : null,
        greenScreenConfig: mode === "green_screen" ? DEFAULT_GREEN_SCREEN_CONFIG : null,
        postEffects: [],
    };
}

/**
 * Obtient la définition d'un effet par son type.
 */
export function getEffectDefinition(
    effectType: PostEffectType,
): PostEffectDefinition | undefined {
    return POST_EFFECTS_CATALOG.find((e) => e.type === effectType);
}

/**
 * Ajoute ou met à jour un effet dans la liste.
 */
export function toggleEffect(
    effects: AppliedPostEffect[],
    effectType: PostEffectType,
): AppliedPostEffect[] {
    const existing = effects.findIndex((e) => e.effectType === effectType);
    if (existing >= 0) {
        // Retirer l'effet
        return effects.filter((_, i) => i !== existing);
    }
    // Ajouter l'effet
    const def = getEffectDefinition(effectType);
    return [
        ...effects,
        {
            effectType,
            intensity: def?.defaultIntensity ?? 0.5,
            params: {},
        },
    ];
}

/**
 * Met à jour l'intensité d'un effet.
 */
export function updateEffectIntensity(
    effects: AppliedPostEffect[],
    effectType: PostEffectType,
    intensity: number,
): AppliedPostEffect[] {
    return effects.map((e) =>
        e.effectType === effectType
            ? { ...e, intensity: Math.max(0, Math.min(1, intensity)) }
            : e,
    );
}

/**
 * Vérifie si une vidéo source autorise le duo/remix.
 */
export async function canRemixVideo(
    videoId: string,
): Promise<{ allowed: boolean; reason?: string }> {
    try {
        const { data, error } = await supabase
            .from("imufeed_videos")
            .select("allow_duet, status")
            .eq("id", videoId)
            .single();

        if (error || !data) {
            return { allowed: false, reason: "Vidéo introuvable" };
        }

        if (data.status !== "published") {
            return { allowed: false, reason: "Vidéo non publiée" };
        }

        if (!data.allow_duet) {
            return { allowed: false, reason: "Le créateur a désactivé les duos/remixes" };
        }

        return { allowed: true };
    } catch (err) {
        logger.error("canRemixVideo error", err);
        return { allowed: false, reason: "Erreur de vérification" };
    }
}

/**
 * Récupère les remixes/duos d'une vidéo source.
 */
export async function getVideoRemixes(
    videoId: string,
    limit = 20,
): Promise<Array<{ id: string; creation_mode: VideoCreationMode; caption: string }>> {
    try {
        const { data, error } = await supabase.rpc("get_video_remixes", {
            p_video_id: videoId,
            p_limit: limit,
        });

        if (error) {
            logger.error("getVideoRemixes error", error);
            return [];
        }

        return data ?? [];
    } catch (err) {
        logger.error("getVideoRemixes failed", err);
        return [];
    }
}

// ─── Mode Labels (pour l'UI) ──────────────────────────────────

export const MODE_LABELS: Record<VideoCreationMode, string> = {
    normal: "Normal",
    duo: "Duo",
    remix: "Remix",
    green_screen: "Fond vert",
};

export const MODE_ICONS: Record<VideoCreationMode, string> = {
    normal: "videocam-outline",
    duo: "git-compare-outline",
    remix: "musical-notes-outline",
    green_screen: "image-outline",
};
