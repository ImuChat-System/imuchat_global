/**
 * Widget Data Provider — Fournit les données dynamiques par type de widget
 *
 * Chaque WidgetType a un fetcher dédié qui renvoie `Record<string, unknown>`.
 * Utilisé par WidgetGrid / écrans pour hydrater les widgets.
 *
 * Sprint S6 Axe A — Infrastructure Widgets
 */

import { createLogger } from '@/services/logger';
import { supabase } from '@/services/supabase';
import { useMusicStore } from '@/stores/music-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import type { WidgetType } from '@/types/home-hub';

const logger = createLogger('WidgetData');

// ─── Types ────────────────────────────────────────────────────

export type WidgetData = Record<string, unknown>;

type WidgetFetcher = (userId: string) => Promise<WidgetData>;

// ─── Helpers ──────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.round(diffMs / 60_000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.round(hours / 24)}j`;
}

// ─── Fetchers par type ────────────────────────────────────────

async function fetchWalletData(userId: string): Promise<WidgetData> {
    const { data, error } = await supabase
        .from('wallets')
        .select('balance, currency')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) logger.warn('wallet fetch failed', error.message);
    return { balance: data?.balance ?? 0, currency: data?.currency ?? 'XAF' };
}

async function fetchTasksData(userId: string): Promise<WidgetData> {
    const { count, error } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', false);

    if (error) logger.warn('tasks fetch failed', error.message);
    return { pendingCount: count ?? 0 };
}

async function fetchFriendsOnlineData(userId: string): Promise<WidgetData> {
    const { count, error } = await supabase
        .from('user_presence')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'online')
        .neq('user_id', userId);

    if (error) logger.warn('friends_online fetch failed', error.message);
    return { onlineCount: count ?? 0 };
}

async function fetchAgendaData(userId: string): Promise<WidgetData> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from('events')
        .select('id, title, start_at')
        .eq('user_id', userId)
        .gte('start_at', now)
        .order('start_at', { ascending: true })
        .limit(3);

    if (error) logger.warn('agenda fetch failed', error.message);
    return { upcoming: data ?? [] };
}

async function fetchScreenTimeData(userId: string): Promise<WidgetData> {
    // Lecture depuis la table analytics_sessions (somme du jour)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('analytics_sessions')
        .select('duration_ms')
        .eq('user_id', userId)
        .gte('started_at', todayStart.toISOString());

    if (error) {
        logger.warn('screen_time fetch failed', error.message);
        return { todayMinutes: 0 };
    }

    const totalMs = (data ?? []).reduce(
        (sum: number, row: { duration_ms: number }) => sum + (row.duration_ms ?? 0),
        0,
    );
    return { todayMinutes: Math.round(totalMs / 60_000) };
}

async function fetchRecapData(_userId: string): Promise<WidgetData> {
    const state = useNotificationsStore.getState();
    const unreadCount = state.unreadCount;
    const recent = state.notifications
        .filter((n) => !n.read)
        .slice(0, 3)
        .map((n) => ({
            id: n.id,
            title: n.title,
            icon: n.type === 'message' ? 'chatbubble-outline'
                : n.type === 'call' ? 'call-outline'
                    : n.type === 'contact' ? 'person-outline'
                        : 'notifications-outline',
            time: formatRelativeTime(n.createdAt),
        }));
    return { unreadCount, recent };
}

async function fetchWeatherData(_userId: string): Promise<WidgetData> {
    return { temp: null, condition: null };
}

async function fetchArenaData(_userId: string): Promise<WidgetData> {
    return { activeTournaments: 0 };
}

async function fetchMusicData(_userId: string): Promise<WidgetData> {
    const state = useMusicStore.getState();
    if (!state.currentTrack) return { nowPlaying: null };
    return {
        nowPlaying: {
            title: state.currentTrack.title,
            artist: state.currentTrack.artist,
            isPlaying: state.isPlaying,
        },
    };
}

async function fetchAiTipsData(_userId: string): Promise<WidgetData> {
    // Récupère un tip quotidien depuis la table alice_daily_tips
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
        .from('alice_daily_tips')
        .select('tip')
        .eq('date', today)
        .maybeSingle();

    if (error) logger.warn('ai_tips fetch failed', error.message);
    return { tip: data?.tip ?? null };
}

async function fetchPackagesData(_userId: string): Promise<WidgetData> {
    return { pendingCount: 0 };
}

async function fetchGamingData(_userId: string): Promise<WidgetData> {
    return { recentGame: null };
}

// ─── Registry ─────────────────────────────────────────────────

const FETCHERS: Record<WidgetType, WidgetFetcher> = {
    wallet: fetchWalletData,
    tasks: fetchTasksData,
    friends_online: fetchFriendsOnlineData,
    agenda: fetchAgendaData,
    screen_time: fetchScreenTimeData,
    recap: fetchRecapData,
    weather: fetchWeatherData,
    arena: fetchArenaData,
    music: fetchMusicData,
    ai_tips: fetchAiTipsData,
    packages: fetchPackagesData,
    gaming: fetchGamingData,
};

// ─── API publique ─────────────────────────────────────────────

/**
 * Récupère les données d'un widget spécifique.
 */
export async function fetchWidgetData(
    type: WidgetType,
    userId: string,
): Promise<WidgetData> {
    const fetcher = FETCHERS[type];
    if (!fetcher) {
        logger.warn(`No fetcher for widget type "${type}"`);
        return {};
    }
    try {
        return await fetcher(userId);
    } catch (err) {
        logger.error(`fetchWidgetData(${type}) failed`, err);
        return {};
    }
}

/**
 * Récupère les données de plusieurs widgets en parallèle.
 */
export async function fetchAllWidgetsData(
    types: WidgetType[],
    userId: string,
): Promise<Record<WidgetType, WidgetData>> {
    const entries = await Promise.all(
        types.map(async (type) => {
            const data = await fetchWidgetData(type, userId);
            return [type, data] as const;
        }),
    );
    return Object.fromEntries(entries) as Record<WidgetType, WidgetData>;
}
