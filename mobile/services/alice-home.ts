/**
 * Alice Home Service — Suggestions proactives & résumé quotidien
 *
 * Fournit les données Alice pour le Home Hub :
 * - Résumé quotidien personnalisé (messages non lus, événements)
 * - Suggestions proactives (rappels, modules oubliés, tips)
 * - Quick-chat inline (mini échange via Alice)
 * - Recommandations de modules
 *
 * Sprint S10 Axe A — Alice IA dans le Home
 */

import { AliceProvider, sendMessageToAlice } from '@/services/alice';
import { createLogger } from '@/services/logger';
import { getCurrentUser, supabase } from '@/services/supabase';

const logger = createLogger('AliceHome');

// ─── Types ────────────────────────────────────────────────────

export interface DailySummary {
    id: string;
    summaryDate: string;
    content: string;
    context: {
        unreadMessages?: number;
        upcomingEvents?: number;
        pendingTasks?: number;
        stalledModules?: string[];
    };
    createdAt: string;
}

export interface ProactiveSuggestion {
    id: string;
    type: 'event' | 'unread' | 'module' | 'reminder' | 'tip';
    title: string;
    body: string;
    metadata: Record<string, unknown>;
    isDismissed: boolean;
    expiresAt: string | null;
    createdAt: string;
}

export interface QuickChatResponse {
    reply: string;
    conversationId: string;
}

export interface ModuleRecommendation {
    moduleId: string;
    moduleName: string;
    reason: string;
    score: number;
}

// ─── Daily Summary ────────────────────────────────────────────

/**
 * Récupère le résumé quotidien pour aujourd'hui.
 * Si absent, en génère un via Alice puis le persiste.
 */
export async function getDailySummary(): Promise<DailySummary | null> {
    const user = await getCurrentUser();
    if (!user) {
        logger.warn('getDailySummary: no authenticated user');
        return null;
    }

    const today = new Date().toISOString().slice(0, 10);

    // Vérifier si un résumé existe déjà
    const { data: existing, error: fetchErr } = await supabase
        .from('alice_daily_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('summary_date', today)
        .maybeSingle();

    if (fetchErr) {
        logger.error('getDailySummary fetch error', fetchErr);
        return null;
    }

    if (existing) {
        return mapDailySummary(existing);
    }

    // Pas encore de résumé → générer via Alice
    return generateDailySummary(user.id);
}

/**
 * Génère un résumé quotidien via Alice et le persiste en base.
 */
async function generateDailySummary(userId: string): Promise<DailySummary | null> {
    try {
        const context = await gatherDailyContext(userId);

        const prompt = buildSummaryPrompt(context);

        const response = await sendMessageToAlice({
            message: prompt,
            persona: 'assistant',
            provider: AliceProvider.OPENAI,
            history: [],
        });

        const summary = response.message.content;
        const today = new Date().toISOString().slice(0, 10);

        const { data, error } = await supabase
            .from('alice_daily_summaries')
            .insert({
                user_id: userId,
                summary_date: today,
                content: summary,
                context,
            })
            .select()
            .single();

        if (error) {
            logger.error('generateDailySummary insert error', error);
            return null;
        }

        logger.info('Daily summary generated successfully');
        return mapDailySummary(data);
    } catch (err) {
        logger.error('generateDailySummary failed', err);
        return null;
    }
}

// ─── Proactive Suggestions ────────────────────────────────────

/**
 * Récupère les suggestions actives (non expirées, non ignorées).
 */
export async function getActiveSuggestions(): Promise<ProactiveSuggestion[]> {
    const user = await getCurrentUser();
    if (!user) {
        logger.warn('getActiveSuggestions: no authenticated user');
        return [];
    }

    const { data, error } = await supabase.rpc('get_active_suggestions', {
        p_user_id: user.id,
    });

    if (error) {
        logger.error('getActiveSuggestions error', error);
        return [];
    }

    return (data ?? []).map(mapProactiveSuggestion);
}

/**
 * Marque une suggestion comme ignorée.
 */
export async function dismissSuggestion(suggestionId: string): Promise<boolean> {
    const { error } = await supabase.rpc('dismiss_suggestion', {
        p_suggestion_id: suggestionId,
    });

    if (error) {
        logger.error('dismissSuggestion error', error);
        return false;
    }

    logger.debug(`Suggestion ${suggestionId} dismissed`);
    return true;
}

// ─── Quick Chat ───────────────────────────────────────────────

/**
 * Envoie un message rapide à Alice depuis le Home.
 * Conversation dédiée "home_quick_chat".
 */
export async function sendQuickChat(message: string): Promise<QuickChatResponse | null> {
    try {
        const response = await sendMessageToAlice({
            message,
            conversationId: 'home_quick_chat',
            persona: 'assistant',
            provider: AliceProvider.OPENAI,
            history: [],
        });

        return {
            reply: response.message.content,
            conversationId: response.conversationId,
        };
    } catch (err) {
        logger.error('sendQuickChat failed', err);
        return null;
    }
}

// ─── Module Recommendations ───────────────────────────────────

/**
 * Génère des recommandations de modules basées sur l'usage.
 */
export async function getModuleRecommendations(): Promise<ModuleRecommendation[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    try {
        // Récupérer l'historique d'usage
        const { data: usageData, error } = await supabase
            .from('user_module_usage')
            .select('module_id, usage_count, last_used_at')
            .eq('user_id', user.id)
            .order('usage_count', { ascending: false })
            .limit(20);

        if (error || !usageData) {
            logger.error('getModuleRecommendations fetch error', error);
            return [];
        }

        return buildRecommendations(usageData);
    } catch (err) {
        logger.error('getModuleRecommendations failed', err);
        return [];
    }
}

// ─── Helpers ──────────────────────────────────────────────────

async function gatherDailyContext(userId: string) {
    const context: DailySummary['context'] = {};

    // Messages non lus
    const { count: unread } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('read', false);
    context.unreadMessages = unread ?? 0;

    // Événements à venir (24h)
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const { count: events } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .lte('start_at', tomorrow)
        .gte('start_at', new Date().toISOString());
    context.upcomingEvents = events ?? 0;

    return context;
}

function buildSummaryPrompt(context: DailySummary['context']): string {
    const parts = ['Génère un résumé matinal court et amical pour l\'utilisateur.'];

    if (context.unreadMessages && context.unreadMessages > 0) {
        parts.push(`Il a ${context.unreadMessages} message(s) non lu(s).`);
    }
    if (context.upcomingEvents && context.upcomingEvents > 0) {
        parts.push(`Il a ${context.upcomingEvents} événement(s) aujourd'hui.`);
    }
    if (context.stalledModules && context.stalledModules.length > 0) {
        parts.push(`Modules oubliés : ${context.stalledModules.join(', ')}.`);
    }

    parts.push('Réponds en 2-3 phrases maximum, ton chaleureux et positif.');
    return parts.join(' ');
}

function buildRecommendations(
    usageData: Array<{ module_id: string; usage_count: number; last_used_at: string | null }>,
): ModuleRecommendation[] {
    const now = Date.now();
    const recommendations: ModuleRecommendation[] = [];

    for (const item of usageData) {
        const daysSinceUse = item.last_used_at
            ? (now - new Date(item.last_used_at).getTime()) / 86400000
            : 999;

        // Modules utilisés fréquemment mais pas récemment → "Redécouvrir"
        if (item.usage_count >= 3 && daysSinceUse > 7) {
            recommendations.push({
                moduleId: item.module_id,
                moduleName: item.module_id.replace(/_/g, ' '),
                reason: 'Ça fait un moment ! Envie de réessayer ?',
                score: item.usage_count * Math.min(daysSinceUse / 7, 5),
            });
        }
    }

    return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
}

function mapDailySummary(row: Record<string, unknown>): DailySummary {
    return {
        id: row.id as string,
        summaryDate: row.summary_date as string,
        content: row.content as string,
        context: (row.context ?? {}) as DailySummary['context'],
        createdAt: row.created_at as string,
    };
}

function mapProactiveSuggestion(row: Record<string, unknown>): ProactiveSuggestion {
    return {
        id: row.id as string,
        type: row.suggestion_type as ProactiveSuggestion['type'],
        title: row.title as string,
        body: row.body as string,
        metadata: (row.metadata ?? {}) as Record<string, unknown>,
        isDismissed: row.is_dismissed as boolean,
        expiresAt: row.expires_at as string | null,
        createdAt: row.created_at as string,
    };
}
