/**
 * Podcast API Service
 *
 * Fournit l'accès au catalogue de podcasts via iTunes Search API (gratuit).
 * Gestion du parsing RSS pour les épisodes, recherche, et fallback offline.
 *
 * Phase M5 — Module Podcasts
 */

import { createLogger } from '@/services/logger';
import type {
    PodcastCategory,
    PodcastChapter,
    PodcastEpisode,
    PodcastSearchResult,
    PodcastShow,
} from '@/types/podcast';

const logger = createLogger('PodcastAPI');

// ─── Configuration ────────────────────────────────────────────

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';
const ITUNES_LOOKUP_URL = 'https://itunes.apple.com/lookup';
const REQUEST_TIMEOUT = 10000;

// ─── Mock / Fallback data ─────────────────────────────────────

export const MOCK_SHOWS: PodcastShow[] = [
    {
        id: 'ps1',
        title: 'Tech Daily',
        author: 'ImuChat Media',
        description: 'L\'actualité tech décryptée chaque jour en 15 minutes.',
        artwork_url: 'https://cdn.imuchat.app/podcasts/tech-daily.jpg',
        feed_url: 'https://feeds.imuchat.app/tech-daily',
        category: 'technology',
        episode_count: 240,
        is_subscribed: true,
        last_updated: '2026-02-18T08:00:00Z',
    },
    {
        id: 'ps2',
        title: 'Science Pop',
        author: 'Dr. Marie',
        description: 'La science expliquée simplement, avec humour.',
        artwork_url: 'https://cdn.imuchat.app/podcasts/science-pop.jpg',
        feed_url: 'https://feeds.imuchat.app/science-pop',
        category: 'science',
        episode_count: 85,
        is_subscribed: true,
        last_updated: '2026-02-15T14:00:00Z',
    },
    {
        id: 'ps3',
        title: 'Gaming Universe',
        author: 'PixelTeam',
        description: 'Toute l\'actualité jeux vidéo et e-sport.',
        artwork_url: 'https://cdn.imuchat.app/podcasts/gaming-universe.jpg',
        feed_url: 'https://feeds.imuchat.app/gaming-universe',
        category: 'gaming',
        episode_count: 150,
        is_subscribed: false,
        last_updated: '2026-02-17T10:00:00Z',
    },
    {
        id: 'ps4',
        title: 'Anime Talk JP',
        author: 'Sakura Radio',
        description: 'Les dernières sorties anime, manga et culture japonaise.',
        artwork_url: 'https://cdn.imuchat.app/podcasts/anime-talk.jpg',
        feed_url: 'https://feeds.imuchat.app/anime-talk',
        category: 'anime',
        episode_count: 95,
        is_subscribed: false,
        last_updated: '2026-02-16T16:00:00Z',
    },
    {
        id: 'ps5',
        title: 'Histoires du Soir',
        author: 'Contes & Cie',
        description: 'Des histoires captivantes à écouter avant de dormir, pour petits et grands.',
        artwork_url: 'https://cdn.imuchat.app/podcasts/histoires-soir.jpg',
        feed_url: 'https://feeds.imuchat.app/histoires-soir',
        category: 'storytelling',
        episode_count: 200,
        is_subscribed: true,
        last_updated: '2026-02-18T20:00:00Z',
    },
];

export const MOCK_EPISODES: PodcastEpisode[] = [
    {
        id: 'ep1',
        show_id: 'ps1',
        title: 'IA Générative : où en est-on ?',
        description: 'Tour d\'horizon des dernières avancées en intelligence artificielle.',
        audio_url: 'https://cdn.imuchat.app/podcasts/tech-daily/ep240.mp3',
        artwork_url: null,
        duration_ms: 900000, // 15 min
        published_at: '2026-02-18T08:00:00Z',
        is_played: false,
        play_position_ms: 0,
        is_downloaded: false,
        episode_number: 240,
        season_number: null,
    },
    {
        id: 'ep2',
        show_id: 'ps1',
        title: 'Les smartphones en 2026',
        description: 'Quelles innovations attendre des prochains flagships ?',
        audio_url: 'https://cdn.imuchat.app/podcasts/tech-daily/ep239.mp3',
        artwork_url: null,
        duration_ms: 840000, // 14 min
        published_at: '2026-02-17T08:00:00Z',
        is_played: true,
        play_position_ms: 840000,
        is_downloaded: false,
        episode_number: 239,
        season_number: null,
    },
    {
        id: 'ep3',
        show_id: 'ps2',
        title: 'Les trous noirs démystifiés',
        description: 'Comprendre les singularités en 20 minutes.',
        audio_url: 'https://cdn.imuchat.app/podcasts/science-pop/ep85.mp3',
        artwork_url: null,
        duration_ms: 1200000, // 20 min
        published_at: '2026-02-15T14:00:00Z',
        is_played: false,
        play_position_ms: 600000,
        is_downloaded: true,
        episode_number: 85,
        season_number: 3,
    },
    {
        id: 'ep4',
        show_id: 'ps3',
        title: 'Preview : les jeux les plus attendus de 2026',
        description: 'Notre sélection des titres à ne pas manquer cette année.',
        audio_url: 'https://cdn.imuchat.app/podcasts/gaming-universe/ep150.mp3',
        artwork_url: null,
        duration_ms: 2400000, // 40 min
        published_at: '2026-02-17T10:00:00Z',
        is_played: false,
        play_position_ms: 0,
        is_downloaded: false,
        episode_number: 150,
        season_number: null,
    },
    {
        id: 'ep5',
        show_id: 'ps5',
        title: 'Le Voyage de Luna',
        description: 'Une petite fille découvre un monde magique caché derrière la lune.',
        audio_url: 'https://cdn.imuchat.app/podcasts/histoires-soir/ep200.mp3',
        artwork_url: null,
        duration_ms: 1500000, // 25 min
        published_at: '2026-02-18T20:00:00Z',
        is_played: false,
        play_position_ms: 0,
        is_downloaded: true,
        episode_number: 200,
        season_number: 5,
    },
];

// ─── API Functions ────────────────────────────────────────────

/**
 * Recherche des podcasts via l'iTunes Search API.
 */
export async function searchPodcasts(
    query: string,
    limit: number = 20,
): Promise<PodcastSearchResult[]> {
    if (!query.trim()) return [];

    try {
        const url = `${ITUNES_SEARCH_URL}?term=${encodeURIComponent(query)}&media=podcast&limit=${limit}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            logger.warn(`iTunes search failed: ${response.status}`);
            return [];
        }

        const data = await response.json();
        const results: PodcastSearchResult[] = (data.results || []).map((item: any) => ({
            id: String(item.collectionId || item.trackId),
            title: item.collectionName || item.trackName || 'Sans titre',
            author: item.artistName || 'Inconnu',
            artwork_url: item.artworkUrl600 || item.artworkUrl100 || null,
            feed_url: item.feedUrl || '',
            genre: item.primaryGenreName || 'Podcast',
            episode_count: item.trackCount || 0,
        }));

        logger.info(`Search "${query}" → ${results.length} results`);
        return results;
    } catch (error) {
        logger.error('searchPodcasts failed:', error);
        return [];
    }
}

/**
 * Récupère les détails d'un podcast via iTunes Lookup.
 */
export async function getShowDetails(itunesId: string): Promise<PodcastShow | null> {
    try {
        const url = `${ITUNES_LOOKUP_URL}?id=${itunesId}&entity=podcast`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) return null;

        const data = await response.json();
        const item = data.results?.[0];
        if (!item) return null;

        return {
            id: String(item.collectionId),
            title: item.collectionName || 'Sans titre',
            author: item.artistName || 'Inconnu',
            description: item.description || '',
            artwork_url: item.artworkUrl600 || item.artworkUrl100 || null,
            feed_url: item.feedUrl || '',
            category: mapItunesGenre(item.primaryGenreName),
            episode_count: item.trackCount || 0,
            is_subscribed: false,
            last_updated: item.releaseDate || new Date().toISOString(),
        };
    } catch (error) {
        logger.error('getShowDetails failed:', error);
        return null;
    }
}

/**
 * Parse un flux RSS pour extraire les épisodes.
 * Fonctionne en mode simplifié (regex) pour éviter une dépendance XML parser.
 */
export async function fetchEpisodesFromFeed(
    feedUrl: string,
    showId: string,
    limit: number = 50,
): Promise<PodcastEpisode[]> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const response = await fetch(feedUrl, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            logger.warn(`Feed fetch failed: ${response.status}`);
            return MOCK_EPISODES.filter((e) => e.show_id === showId);
        }

        const xml = await response.text();
        const episodes = parseRssItems(xml, showId, limit);

        logger.info(`Feed ${feedUrl} → ${episodes.length} episodes`);
        return episodes;
    } catch (error) {
        logger.error('fetchEpisodesFromFeed failed:', error);
        // Fallback mock
        return MOCK_EPISODES.filter((e) => e.show_id === showId);
    }
}

/**
 * Parse les items <item> d'un flux RSS podcast.
 * Extraction simplifiée via regex (pas de dépendance XML parser).
 */
export function parseRssItems(
    xml: string,
    showId: string,
    limit: number = 50,
): PodcastEpisode[] {
    const episodes: PodcastEpisode[] = [];
    const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
    let match = itemRegex.exec(xml);
    let index = 0;

    while (match && index < limit) {
        const block = match[1];
        const title = extractTag(block, 'title');
        const description = extractTag(block, 'description') || extractTag(block, 'itunes:summary') || '';
        const audioUrl = extractEnclosureUrl(block);
        const pubDate = extractTag(block, 'pubDate');
        const durationStr = extractTag(block, 'itunes:duration');
        const episodeNum = extractTag(block, 'itunes:episode');
        const seasonNum = extractTag(block, 'itunes:season');
        const imageUrl = extractItunesImage(block);

        if (title && audioUrl) {
            episodes.push({
                id: `${showId}-ep${index}`,
                show_id: showId,
                title,
                description: cleanHtml(description),
                audio_url: audioUrl,
                artwork_url: imageUrl,
                duration_ms: parseDuration(durationStr),
                published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                is_played: false,
                play_position_ms: 0,
                is_downloaded: false,
                episode_number: episodeNum ? parseInt(episodeNum, 10) : null,
                season_number: seasonNum ? parseInt(seasonNum, 10) : null,
            });
            index++;
        }

        match = itemRegex.exec(xml);
    }

    return episodes;
}

/**
 * Extraire les chapitres d'un épisode (format Podcasting 2.0 ou déduit).
 */
export function parseChapters(xml: string): PodcastChapter[] {
    const chapters: PodcastChapter[] = [];
    const chapterRegex = /<psc:chapter[^>]*start="([^"]*)"[^>]*title="([^"]*)"[^>]*\/?>/gi;
    let match = chapterRegex.exec(xml);

    while (match) {
        const startMs = parseTimestamp(match[1]);
        chapters.push({
            id: `ch-${chapters.length}`,
            title: match[2],
            start_ms: startMs,
            end_ms: 0, // Will be set after parsing all
        });
        match = chapterRegex.exec(xml);
    }

    // Fix end_ms
    for (let i = 0; i < chapters.length - 1; i++) {
        chapters[i].end_ms = chapters[i + 1].start_ms;
    }
    if (chapters.length > 0) {
        chapters[chapters.length - 1].end_ms = chapters[chapters.length - 1].start_ms + 600000; // 10 min placeholder
    }

    return chapters;
}

/**
 * Retourne les émissions mock (catalogue offline).
 */
export function getMockShows(): PodcastShow[] {
    return MOCK_SHOWS;
}

/**
 * Retourne les épisodes mock pour une émission.
 */
export function getMockEpisodes(showId: string): PodcastEpisode[] {
    return MOCK_EPISODES.filter((e) => e.show_id === showId);
}

/**
 * Retourne toutes les catégories disponibles.
 */
export function getCategories(): PodcastCategory[] {
    return [
        'technology', 'science', 'education', 'comedy', 'news',
        'culture', 'music', 'sports', 'health', 'business',
        'society', 'storytelling', 'gaming', 'anime', 'other',
    ];
}

// ─── Helpers internes ─────────────────────────────────────────

function extractTag(xml: string, tag: string): string {
    // Gère CDATA et contenu normal
    const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
    const cdataMatch = cdataRegex.exec(xml);
    if (cdataMatch) return cdataMatch[1].trim();

    const simpleRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
    const simpleMatch = simpleRegex.exec(xml);
    return simpleMatch ? simpleMatch[1].trim() : '';
}

function extractEnclosureUrl(xml: string): string {
    const encRegex = /url="([^"]+)"/i;
    const enclosureBlock = /<enclosure[^>]*>/i.exec(xml);
    if (enclosureBlock) {
        const urlMatch = encRegex.exec(enclosureBlock[0]);
        if (urlMatch) return urlMatch[1];
    }
    return '';
}

function extractItunesImage(xml: string): string | null {
    const imgRegex = /<itunes:image[^>]*href="([^"]*)"[^>]*\/?>/i;
    const match = imgRegex.exec(xml);
    return match ? match[1] : null;
}

function cleanHtml(text: string): string {
    return text.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
}

/**
 * Parse une durée iTunes (formats : "HH:MM:SS", "MM:SS", ou secondes brutes).
 */
export function parseDuration(str: string | null | undefined): number {
    if (!str) return 0;

    const parts = str.split(':').map(Number);
    if (parts.length === 3) {
        return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
    }
    if (parts.length === 2) {
        return (parts[0] * 60 + parts[1]) * 1000;
    }
    // Secondes brutes
    const secs = parseInt(str, 10);
    return isNaN(secs) ? 0 : secs * 1000;
}

/**
 * Parse un timestamp HH:MM:SS.mmm en millisecondes.
 */
function parseTimestamp(ts: string): number {
    const parts = ts.split(':').map(Number);
    if (parts.length === 3) {
        return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
    }
    if (parts.length === 2) {
        return (parts[0] * 60 + parts[1]) * 1000;
    }
    return parseInt(ts, 10) * 1000 || 0;
}

function mapItunesGenre(genre: string | undefined): PodcastCategory {
    if (!genre) return 'other';
    const map: Record<string, PodcastCategory> = {
        'Technology': 'technology',
        'Science': 'science',
        'Education': 'education',
        'Comedy': 'comedy',
        'News': 'news',
        'Arts': 'culture',
        'Music': 'music',
        'Sports': 'sports',
        'Health & Fitness': 'health',
        'Business': 'business',
        'Society & Culture': 'society',
        'Fiction': 'storytelling',
        'Leisure': 'gaming',
    };
    return map[genre] || 'other';
}
