import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { getCurrentUser, supabase } from './supabase';

// Types
export type MediaType = 'image' | 'video' | 'voice' | 'file';

export interface UploadResult {
    url: string;
    type: MediaType;
    mimeType: string;
    size: number;
    fileName: string;
}

export interface PickerResult {
    uri: string;
    mimeType: string;
    fileName: string;
    type: MediaType;
}

// Supported MIME types
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const AUDIO_TYPES = ['audio/m4a', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm'];

// Max file sizes (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Request media library permissions
 */
export async function requestMediaPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
}

/**
 * Request camera permissions
 */
export async function requestCameraPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
}

/**
 * Get media type from MIME type
 */
function getMediaType(mimeType: string): MediaType {
    if (IMAGE_TYPES.includes(mimeType)) return 'image';
    if (VIDEO_TYPES.includes(mimeType)) return 'video';
    if (AUDIO_TYPES.includes(mimeType)) return 'voice';
    return 'file';
}

/**
 * Generate unique file name
 */
function generateFileName(originalName: string, mimeType: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = mimeType.split('/')[1] || 'bin';
    const baseName = originalName?.replace(/\.[^/.]+$/, '') || 'file';
    return `${baseName}_${timestamp}_${random}.${extension}`;
}

/**
 * Pick image from library
 */
export async function pickImage(): Promise<PickerResult | null> {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) {
        throw new Error('Media library permission denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
    });

    if (result.canceled || !result.assets?.[0]) {
        return null;
    }

    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'image/jpeg';

    return {
        uri: asset.uri,
        mimeType,
        fileName: asset.fileName || generateFileName('image', mimeType),
        type: 'image',
    };
}

/**
 * Pick video from library
 */
export async function pickVideo(): Promise<PickerResult | null> {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) {
        throw new Error('Media library permission denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
    });

    if (result.canceled || !result.assets?.[0]) {
        return null;
    }

    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'video/mp4';

    return {
        uri: asset.uri,
        mimeType,
        fileName: asset.fileName || generateFileName('video', mimeType),
        type: 'video',
    };
}

/**
 * Take photo with camera
 */
export async function takePhoto(): Promise<PickerResult | null> {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
        throw new Error('Camera permission denied');
    }

    const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
        return null;
    }

    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'image/jpeg';

    return {
        uri: asset.uri,
        mimeType,
        fileName: generateFileName('photo', mimeType),
        type: 'image',
    };
}

/**
 * Pick any media (image or video)
 */
export async function pickMedia(): Promise<PickerResult | null> {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) {
        throw new Error('Media library permission denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
        return null;
    }

    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'image/jpeg';
    const mediaType = getMediaType(mimeType);

    return {
        uri: asset.uri,
        mimeType,
        fileName: asset.fileName || generateFileName(mediaType, mimeType),
        type: mediaType,
    };
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadMedia(
    pickerResult: PickerResult,
    bucket: 'messages-media' | 'voice-notes' = 'messages-media',
    onProgress?: (progress: number) => void
): Promise<UploadResult> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Not authenticated');
    }

    // Read file info
    const fileInfo = await FileSystem.getInfoAsync(pickerResult.uri);
    if (!fileInfo.exists) {
        throw new Error('File does not exist');
    }

    const fileSize = fileInfo.size || 0;

    // Validate file size
    const maxSize = pickerResult.type === 'video' ? MAX_VIDEO_SIZE :
        pickerResult.type === 'voice' ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;

    if (fileSize > maxSize) {
        const maxMB = maxSize / (1024 * 1024);
        throw new Error(`File too large. Maximum size is ${maxMB}MB`);
    }

    // Generate storage path: {userId}/{timestamp}_{filename}
    const fileName = generateFileName(pickerResult.fileName, pickerResult.mimeType);
    const storagePath = `${user.id}/${fileName}`;

    // Read file as base64
    onProgress?.(10);
    const base64Data = await FileSystem.readAsStringAsync(pickerResult.uri, {
        encoding: FileSystem.EncodingType.Base64,
    });
    onProgress?.(40);

    // Convert to ArrayBuffer
    const arrayBuffer = decode(base64Data);
    onProgress?.(60);

    // Upload to Supabase
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, arrayBuffer, {
            contentType: pickerResult.mimeType,
            upsert: false,
        });

    if (error) {
        throw error;
    }
    onProgress?.(90);

    // Get signed URL (for private buckets)
    const { data: urlData, error: urlError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // 1 year

    if (urlError) {
        throw urlError;
    }
    onProgress?.(100);

    return {
        url: urlData.signedUrl,
        type: pickerResult.type,
        mimeType: pickerResult.mimeType,
        size: fileSize,
        fileName: pickerResult.fileName,
    };
}

/**
 * Delete uploaded media
 */
export async function deleteMedia(
    filePath: string,
    bucket: 'messages-media' | 'voice-notes' = 'messages-media'
): Promise<void> {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

    if (error) {
        throw error;
    }
}

/**
 * Get public URL for avatars (public bucket)
 */
export function getAvatarUrl(path: string): string {
    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

    return data.publicUrl;
}

/**
 * Upload avatar
 */
export async function uploadAvatar(pickerResult: PickerResult): Promise<string> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Not authenticated');
    }

    // Read file as base64
    const base64Data = await FileSystem.readAsStringAsync(pickerResult.uri, {
        encoding: FileSystem.EncodingType.Base64,
    });

    const arrayBuffer = decode(base64Data);
    const fileName = `${user.id}/avatar.${pickerResult.mimeType.split('/')[1]}`;

    const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
            contentType: pickerResult.mimeType,
            upsert: true,
        });

    if (error) {
        throw error;
    }

    return getAvatarUrl(fileName);
}
