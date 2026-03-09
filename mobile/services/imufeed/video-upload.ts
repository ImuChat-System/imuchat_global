/**
 * Service d'upload vidéo mobile — ImuFeed
 *
 * Gère la compression locale, l'upload vers Supabase Storage
 * avec progression, et la publication.
 *
 * Sprint S3 Axe B — Upload Vidéo
 */

import { uploadVideo as publishToApi } from '@/services/imufeed-api';
import { createLogger } from '@/services/logger';
import type {
    UploadProgress,
    VideoCategory,
    VideoUploadData,
    VideoVisibility,
} from '@/types/imufeed';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

const logger = createLogger('VideoUpload');

// ─── Constants ────────────────────────────────────────────────

/** Durées autorisées (secondes) */
export const ALLOWED_DURATIONS = [15, 30, 60, 180] as const;
export type VideoDuration = (typeof ALLOWED_DURATIONS)[number];

/** Taille max d'upload en octets (500 MB) */
const MAX_FILE_SIZE = 500 * 1024 * 1024;

/** Extensions vidéo acceptées */
const ACCEPTED_EXTENSIONS = ['mp4', 'mov', 'webm', 'avi'];

// ─── Types ────────────────────────────────────────────────────

export interface VideoPickResult {
    uri: string;
    width: number;
    height: number;
    duration: number; // en secondes
    fileSize: number; // en octets
    mimeType: string;
}

export interface PublishParams {
    caption: string;
    category: VideoCategory;
    visibility: VideoVisibility;
    hashtags: string[];
    allow_comments: boolean;
    allow_duet: boolean;
    sound_id?: string;
    thumbnail_uri?: string;
}

// ─── Media Permissions ────────────────────────────────────────

/** Demande la permission caméra */
export async function requestCameraPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
        logger.warn('Camera permission denied');
        return false;
    }
    return true;
}

/** Demande la permission galerie */
export async function requestMediaPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        logger.warn('Media library permission denied');
        return false;
    }
    return true;
}

// ─── Pick / Capture ───────────────────────────────────────────

/** Ouvre la caméra pour enregistrer une vidéo */
export async function captureVideo(
    maxDuration: VideoDuration = 60,
): Promise<VideoPickResult | null> {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        videoMaxDuration: maxDuration,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
        allowsEditing: true,
    });

    if (result.canceled || !result.assets?.[0]) return null;

    const asset = result.assets[0];
    return mapAssetToResult(asset);
}

/** Ouvre la galerie pour importer une vidéo */
export async function pickVideoFromGallery(): Promise<VideoPickResult | null> {
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        videoMaxDuration: 180,
        quality: 0.8,
        allowsEditing: true,
    });

    if (result.canceled || !result.assets?.[0]) return null;

    const asset = result.assets[0];
    return mapAssetToResult(asset);
}

function mapAssetToResult(
    asset: ImagePicker.ImagePickerAsset,
): VideoPickResult {
    return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        duration: (asset.duration ?? 0) / 1000, // ms → s
        fileSize: asset.fileSize ?? 0,
        mimeType: asset.mimeType ?? 'video/mp4',
    };
}

// ─── Validation ───────────────────────────────────────────────

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/** Valide un fichier vidéo avant upload */
export async function validateVideo(
    video: VideoPickResult,
): Promise<ValidationResult> {
    // Check duration
    if (video.duration > 180) {
        return { valid: false, error: 'Vidéo trop longue (max 3 minutes)' };
    }

    if (video.duration < 1) {
        return { valid: false, error: 'Vidéo trop courte (min 1 seconde)' };
    }

    // Check file size
    let fileSize = video.fileSize;
    if (!fileSize && video.uri) {
        try {
            const info = await FileSystem.getInfoAsync(video.uri);
            if (info.exists && 'size' in info) {
                fileSize = info.size;
            }
        } catch {
            logger.warn('Could not check file size');
        }
    }

    if (fileSize > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `Fichier trop volumineux (${Math.round(fileSize / 1024 / 1024)} MB, max 500 MB)`,
        };
    }

    // Check extension
    const ext = video.uri.split('.').pop()?.toLowerCase();
    if (ext && !ACCEPTED_EXTENSIONS.includes(ext)) {
        return { valid: false, error: `Format non supporté: .${ext}` };
    }

    return { valid: true };
}

// ─── Upload Pipeline ──────────────────────────────────────────

/** Pipeline complet : validation → upload → publication */
export async function uploadAndPublish(
    video: VideoPickResult,
    params: PublishParams,
    onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
    logger.info('uploadAndPublish', { duration: video.duration, category: params.category });

    // 1. Validation
    const validation = await validateVideo(video);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // 2. Préparer les données d'upload
    const uploadData: VideoUploadData = {
        uri: video.uri,
        caption: params.caption,
        category: params.category,
        visibility: params.visibility,
        hashtags: params.hashtags,
        sound_id: params.sound_id,
        allow_comments: params.allow_comments,
        allow_duet: params.allow_duet,
        thumbnail_uri: params.thumbnail_uri,
    };

    // 3. Upload + publication via le service API existant
    const result = await publishToApi(uploadData, onProgress);

    logger.info('uploadAndPublish complete', { videoId: result.id });
    return result.id;
}

// ─── Hashtag Helpers ──────────────────────────────────────────

/** Extrait les hashtags depuis un texte de caption */
export function extractHashtags(text: string): string[] {
    const matches = text.match(/#[\w\u00C0-\u024F]+/g);
    if (!matches) return [];
    return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
}

/** Formate les hashtags pour l'affichage (ajoute le #) */
export function formatHashtag(tag: string): string {
    return tag.startsWith('#') ? tag : `#${tag}`;
}
