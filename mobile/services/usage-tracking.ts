/**
 * Usage Tracking Service
 *
 * Suit l'utilisation des modules pour la personnalisation :
 * - Incrément atomique via RPC Supabase
 * - Détection des modules "oubliés" (>7j)
 * - Suggestions "Redécouvrir"
 *
 * Sprint S9 Axe A — Moteur de Personnalisation
 */

import { createLogger } from '@/services/logger';
import { getCurrentUser, supabase } from '@/services/supabase';

const logger = createLogger('UsageTracking');

// ─── Types ────────────────────────────────────────────────────

export interface StaleModule {
    module_id: string;
    module_name: string;
    last_used_at: string | null;
    usage_count: number;
}

export interface ModuleUsageInfo {
    module_id: string;
    usage_count: number;
    last_used_at: string | null;
}

// ─── Track Module Usage ───────────────────────────────────────

/**
 * Incrémente le compteur d'usage d'un module pour l'utilisateur courant.
 * Appel RPC atomique côté serveur.
 */
export async function trackModuleUsage(moduleId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) {
        logger.warn('trackModuleUsage: no authenticated user');
        return;
    }

    const { error } = await supabase.rpc('increment_module_usage', {
        p_user_id: user.id,
        p_module_id: moduleId,
    });

    if (error) {
        logger.error(`Failed to track usage for ${moduleId}:`, error.message);
        // Non-bloquant : on ne throw pas pour ne pas casser l'UX
        return;
    }

    logger.debug(`Usage tracked for module ${moduleId}`);
}

// ─── Stale Modules (Redécouvrir) ──────────────────────────────

/**
 * Récupère les modules actifs non utilisés depuis N jours.
 * Utilisé pour les suggestions "Redécouvrir".
 */
export async function fetchStaleModules(days: number = 7): Promise<StaleModule[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase.rpc('get_stale_modules', {
        p_user_id: user.id,
        p_days: days,
    });

    if (error) {
        logger.error('Failed to fetch stale modules:', error.message);
        return [];
    }

    return (data ?? []) as StaleModule[];
}

// ─── Fetch Usage Stats (local enrichment) ─────────────────────

/**
 * Récupère les stats d'usage des modules installés de l'utilisateur.
 * Sert à trier la liste "Mes Modules" par fréquence.
 */
export async function fetchModuleUsageStats(): Promise<ModuleUsageInfo[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('user_modules')
        .select('module_id, usage_count, last_used_at')
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false });

    if (error) {
        logger.error('Failed to fetch usage stats:', error.message);
        return [];
    }

    return (data ?? []) as ModuleUsageInfo[];
}
