/**
 * Media API Service — Mobile (React Native)
 *
 * Service d'interaction avec les endpoints media de platform-core,
 * adapté pour React Native (URI locaux, expo-file-system, etc.).
 *
 * Flux d'upload :
 *   1. Obtenir une URL signée depuis le backend
 *   2. Lire le fichier local et l'uploader vers Supabase Storage
 *   3. Confirmer l'upload auprès du backend
 */

import * as FileSystem from 'expo-file-system/legacy';
import { getCurrentUser, supabase } from './supabase';

// === CONFIGURATION ===

const API_BASE_URL =
    (process.env as Record<string, string | undefined>)['EXPO_PUBLIC_API_URL'] || 'http://localhost:3001';

// === TYPES ===

/** Métadonnées optionnelles pour un upload */
export interface MediaMetadata {
    /** ID de la conversation cible */
    conversationId?: string;
    /** Durée en ms (notes vocales) */
    duration?: number;
    /** Largeur (images/vidéos) */
    width?: number;
    /** Hauteur (images/vidéos) */
    height?: number;
}

/** Réponse backend POST /media/upload-url */
export interface UploadUrlResponse {
    uploadUrl: string;
    publicUrl: string;
    mediaId: string;
    token: string;
}

/** Réponse backend POST /media/confirm-upload */
export interface ConfirmUploadResponse {
    success: boolean;
    mediaUrl: string;
    messageId?: string;
}

/** Résultat unifié d'un upload */
export interface UploadResult {
    mediaId: string;
    url: string;
    thumbnailUrl?: string;
    mimeType: string;
    size: number;
    fileName: string;
}

/** Métadonnées complètes côté serveur */
export interface StoredMediaMetadata {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    bucket: string;
    path: string;
    publicUrl: string;
    conversationId?: string;
    uploadedBy: string;
    status: 'pending' | 'confirmed' | 'deleted';
    createdAt: string;
    updatedAt: string;
}

/** Erreur typée du service media */
export class MediaApiError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly code?: string,
    ) {
        super(message);
        this.name = 'MediaApiError';
    }
}

// === HELPERS INTERNES ===

/**
 * Récupère le token Bearer depuis la session Supabase courante.
 */
async function getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new MediaApiError(
            'Utilisateur non authentifié. Veuillez vous connecter.',
            401,
            'UNAUTHORIZED',
        );
    }

    return session.access_token;
}

/**
 * Wrapper fetch avec gestion d'erreurs standardisée.
 */
async function apiFetch<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = await getAuthToken();

    const url = `${API_BASE_URL}${path}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options.headers as Record<string, string>),
        },
    });

    if (!response.ok) {
        let errorMessage = `Erreur serveur (${response.status})`;
        try {
            const body = await response.json();
            if (body?.error) {
                errorMessage = body.error;
            }
        } catch {
            // Corps non-JSON
        }

        throw new MediaApiError(errorMessage, response.status);
    }

    return response.json() as Promise<T>;
}

/**
 * Obtient la taille d'un fichier local en bytes.
 */
async function getFileSize(uri: string): Promise<number> {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) {
        throw new MediaApiError('Le fichier n\'existe pas', 404, 'FILE_NOT_FOUND');
    }
    return info.size || 0;
}

/**
 * Déduit le nom du fichier à partir d'une URI.
 */
function fileNameFromUri(uri: string): string {
    const segments = uri.split('/');
    return segments[segments.length - 1] || `file-${Date.now()}`;
}

// === API PUBLIQUE ===

/**
 * Demande une URL signée au backend pour uploader un fichier.
 *
 * @param fileName  - Nom du fichier avec extension
 * @param mimeType  - Type MIME (ex: image/jpeg)
 * @param fileSize  - Taille en bytes
 */
export async function getUploadUrl(
    fileName: string,
    mimeType: string,
    fileSize: number,
): Promise<UploadUrlResponse> {
    return apiFetch<UploadUrlResponse>('/api/v1/media/upload-url', {
        method: 'POST',
        body: JSON.stringify({
            fileName,
            fileType: mimeType,
            fileSize,
        }),
    });
}

/**
 * Confirme un upload et crée le message associé.
 *
 * @param mediaId         - ID obtenu de getUploadUrl
 * @param conversationId  - ID de la conversation cible
 */
export async function confirmUpload(
    mediaId: string,
    conversationId: string,
): Promise<ConfirmUploadResponse> {
    return apiFetch<ConfirmUploadResponse>('/api/v1/media/confirm-upload', {
        method: 'POST',
        body: JSON.stringify({ mediaId, conversationId }),
    });
}

/**
 * Récupère les métadonnées d'un média.
 *
 * @param mediaId - ID du média
 */
export async function getMediaMetadata(
    mediaId: string,
): Promise<StoredMediaMetadata> {
    return apiFetch<StoredMediaMetadata>(`/api/v1/media/${mediaId}`);
}

/**
 * Supprime un média du Storage et de la base de données.
 *
 * @param mediaId - ID du média à supprimer
 */
export async function deleteMedia(mediaId: string): Promise<void> {
    await apiFetch<{ success: boolean; mediaId: string }>(
        `/api/v1/media/${mediaId}`,
        { method: 'DELETE' },
    );
}

/**
 * Obtient un thumbnail pour une image ou vidéo.
 *
 * @param mediaId - ID du média
 * @returns URL du thumbnail, ou null si non disponible
 */
export async function getThumbnailUrl(
    mediaId: string,
): Promise<string | null> {
    try {
        const data = await apiFetch<{ thumbnailUrl: string }>(
            `/api/v1/media/${mediaId}/thumbnail`,
        );
        return data.thumbnailUrl;
    } catch (error) {
        if (error instanceof MediaApiError && error.statusCode === 404) {
            return null;
        }
        throw error;
    }
}

/**
 * Upload complet d'un fichier depuis une URI locale (camera, galerie, etc.).
 *
 * @param uri         - URI locale du fichier (file://, content://, etc.)
 * @param mimeType    - Type MIME du fichier
 * @param onProgress  - Callback de progression (0-100)
 * @param metadata    - Métadonnées optionnelles (conversationId, etc.)
 * @returns Résultat de l'upload
 */
export async function uploadFromUri(
    uri: string,
    mimeType: string,
    onProgress?: (percent: number) => void,
    metadata?: MediaMetadata,
): Promise<UploadResult> {
    const user = await getCurrentUser();
    if (!user) {
        throw new MediaApiError(
            'Utilisateur non authentifié',
            401,
            'UNAUTHORIZED',
        );
    }

    // Étape 1 : informations sur le fichier
    onProgress?.(5);
    const fileName = fileNameFromUri(uri);
    const fileSize = await getFileSize(uri);

    // Étape 2 : obtenir l'URL signée
    onProgress?.(10);
    const { uploadUrl, publicUrl, mediaId, token } = await getUploadUrl(
        fileName,
        mimeType,
        fileSize,
    );

    onProgress?.(20);

    // Étape 3 : uploader via FileSystem.uploadAsync
    const uploadResult = await FileSystem.uploadAsync(uploadUrl, uri, {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
            'Content-Type': mimeType,
            'x-upsert': 'false',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    onProgress?.(80);

    if (uploadResult.status < 200 || uploadResult.status >= 300) {
        throw new MediaApiError(
            `Échec de l'upload vers le storage (HTTP ${uploadResult.status})`,
            uploadResult.status,
            'STORAGE_UPLOAD_FAILED',
        );
    }

    // Étape 4 : confirmer auprès du backend si conversationId fourni
    let finalUrl = publicUrl;
    if (metadata?.conversationId) {
        const confirmation = await confirmUpload(mediaId, metadata.conversationId);
        finalUrl = confirmation.mediaUrl || publicUrl;
    }

    onProgress?.(90);

    // Étape 5 : thumbnail
    let thumbnailUrl: string | undefined;
    if (mimeType.startsWith('image/')) {
        try {
            thumbnailUrl = (await getThumbnailUrl(mediaId)) ?? undefined;
        } catch {
            // Pas critique
        }
    }

    onProgress?.(100);

    return {
        mediaId,
        url: finalUrl,
        thumbnailUrl,
        mimeType,
        size: fileSize,
        fileName,
    };
}

/**
 * Upload spécialisé pour les notes vocales depuis une URI locale.
 *
 * @param uri             - URI du fichier audio enregistré
 * @param mimeType        - Type MIME (audio/m4a, audio/webm, etc.)
 * @param duration        - Durée en millisecondes
 * @param conversationId  - ID de la conversation (optionnel)
 * @param onProgress      - Callback de progression (0-100)
 * @returns Résultat de l'upload
 */
export async function uploadVoiceNote(
    uri: string,
    mimeType: string,
    duration: number,
    conversationId?: string,
    onProgress?: (percent: number) => void,
): Promise<UploadResult> {
    return uploadFromUri(uri, mimeType, onProgress, {
        conversationId,
        duration,
    });
}

/**
 * Upload un fichier depuis une URI avec gestion de retry.
 * Retente automatiquement les erreurs réseau/serveur.
 *
 * @param uri         - URI locale du fichier
 * @param mimeType    - Type MIME
 * @param maxRetries  - Nombre max de tentatives (défaut: 3)
 * @param onProgress  - Callback de progression
 * @param metadata    - Métadonnées optionnelles
 */
export async function uploadFromUriWithRetry(
    uri: string,
    mimeType: string,
    maxRetries = 3,
    onProgress?: (percent: number) => void,
    metadata?: MediaMetadata,
): Promise<UploadResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await uploadFromUri(uri, mimeType, onProgress, metadata);
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));

            // Ne pas retenter les erreurs client (4xx) sauf réseau
            if (err instanceof MediaApiError) {
                const isRetryable =
                    err.statusCode === 0 || err.statusCode >= 500;
                if (!isRetryable) {
                    throw err;
                }
            }

            if (attempt === maxRetries) {
                throw lastError;
            }

            // Attente exponentielle
            const delay = 1000 * Math.pow(2, attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError ?? new Error('Upload échoué');
}
