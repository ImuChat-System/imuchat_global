/**
 * Service Stream Token - Mobile
 * Récupère les tokens d'authentification Stream depuis le backend platform-core
 */

import { supabase } from './supabase';

const PLATFORM_CORE_URL = process.env.EXPO_PUBLIC_PLATFORM_CORE_URL || 'http://localhost:8080';

export interface StreamTokenPayload {
    userId: string;
    userName?: string;
    userImage?: string;
    expiresIn?: number; // En secondes (défaut: 24h)
}

export interface StreamTokenResponse {
    token: string;
    userId: string;
    expiresAt: string;
}

/**
 * Génère un token Stream pour l'utilisateur actuel
 * @param payload Données utilisateur pour le token
 * @returns Token Stream avec metadata
 */
export async function generateStreamToken(
    payload: StreamTokenPayload
): Promise<StreamTokenResponse> {
    try {
        // Récupérer le token Firebase de l'utilisateur connecté
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
            throw new Error('Session non trouvée. Veuillez vous reconnecter.');
        }

        // Appeler le backend platform-core
        const response = await fetch(`${PLATFORM_CORE_URL}/api/v1/stream/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.error || `Erreur serveur: ${response.status}`
            );
        }

        const data: StreamTokenResponse = await response.json();

        console.log('✅ Token Stream généré avec succès');
        return data;
    } catch (error) {
        console.error('❌ Erreur génération token Stream:', error);
        throw error;
    }
}

/**
 * Vérifie si un token Stream est encore valide
 * @param expiresAt Date d'expiration du token (ISO string)
 * @returns true si le token est encore valide
 */
export function isStreamTokenValid(expiresAt: string): boolean {
    const expirationDate = new Date(expiresAt);
    const now = new Date();

    // Ajouter une marge de 5 minutes
    const marginMs = 5 * 60 * 1000;
    return expirationDate.getTime() - now.getTime() > marginMs;
}
