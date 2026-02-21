/**
 * Service Stream Token - Mobile
 * Récupère les tokens d'authentification Stream depuis le backend platform-core.
 *
 * Le backend supporte les tokens Supabase (via verifyIdToken fallback).
 * En mode dev (sans STREAM_API_KEY/STREAM_SECRET_KEY), le backend retourne
 * des tokens mock.
 */

import { createLogger } from './logger';
import { supabase } from './supabase';

const logger = createLogger('StreamToken');

const PLATFORM_CORE_URL = process.env.EXPO_PUBLIC_PLATFORM_CORE_URL || 'http://localhost:8080';

export interface StreamTokenPayload {
    userId: string;
    userName?: string;
    userImage?: string;
    expiresIn?: number; // En secondes (défaut: 24h)
}

export interface StreamTokenResponse {
    token: string;
    apiKey: string;
    userId: string;
    expiresAt: number; // Timestamp ms
}

// Cache du token en mémoire
let cachedToken: StreamTokenResponse | null = null;

/**
 * Génère un token Stream pour l'utilisateur actuel
 * @param payload Données utilisateur pour le token
 * @param forceRefresh Ignorer le cache
 * @returns Token Stream avec metadata
 */
export async function generateStreamToken(
    payload: StreamTokenPayload,
    forceRefresh = false,
): Promise<StreamTokenResponse> {
    // Retourner le token en cache s'il est encore valide
    if (!forceRefresh && cachedToken && isStreamTokenValid(cachedToken.expiresAt)) {
        logger.debug('Utilisation du token Stream en cache');
        return cachedToken;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error('Session non trouvée. Veuillez vous reconnecter.');
    }

    const response = await fetch(`${PLATFORM_CORE_URL}/api/v1/stream/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error || `Erreur serveur: ${response.status}`;
        logger.error('Erreur génération token Stream', message);
        throw new Error(message);
    }

    const data: StreamTokenResponse = await response.json();
    cachedToken = data;

    logger.info('Token Stream généré avec succès');
    return data;
}

/**
 * Vérifie si un token Stream est encore valide
 * @param expiresAt Timestamp d'expiration (en secondes epoch)
 * @returns true si le token est encore valide (avec marge de 5 min)
 */
export function isStreamTokenValid(expiresAt: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    const marginSeconds = 5 * 60;
    return expiresAt - now > marginSeconds;
}

/**
 * Invalide le token Stream en cache
 */
export function clearStreamTokenCache(): void {
    cachedToken = null;
    logger.debug('Cache token Stream vidé');
}

/**
 * Récupère la clé API Stream (depuis le token en cache ou en générant un nouveau)
 */
export async function getStreamApiKey(userId: string): Promise<string> {
    if (cachedToken && isStreamTokenValid(cachedToken.expiresAt)) {
        return cachedToken.apiKey;
    }
    const response = await generateStreamToken({ userId });
    return response.apiKey;
}
