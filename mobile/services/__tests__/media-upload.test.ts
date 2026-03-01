/**
 * Tests for services/media-upload.ts
 * Media picking and Supabase storage uploads
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

// Mock supabase
const mockUpload = jest.fn();
const mockCreateSignedUrl = jest.fn();
const mockRemove = jest.fn();
const mockGetPublicUrl = jest.fn();

jest.mock('../supabase', () => ({
    getCurrentUser: jest.fn(),
    supabase: {
        storage: {
            from: jest.fn(() => ({
                upload: mockUpload,
                createSignedUrl: mockCreateSignedUrl,
                remove: mockRemove,
                getPublicUrl: mockGetPublicUrl,
            })),
        },
    },
}));

// Mock base64-arraybuffer
jest.mock('base64-arraybuffer', () => ({
    decode: jest.fn(() => new ArrayBuffer(8)),
}));

import {
    deleteMedia,
    getAvatarUrl,
    pickImage,
    pickMedia,
    pickVideo,
    requestCameraPermissions,
    requestMediaPermissions,
    takePhoto,
    takeVideo,
    uploadAvatar,
    uploadMedia,
    uploadMediaToSupabase,
} from '../media-upload';
import { getCurrentUser } from '../supabase';

describe('media-upload service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // === Permissions ===

    describe('requestMediaPermissions', () => {
        it('returns true when permission granted', async () => {
            (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            const result = await requestMediaPermissions();
            expect(result).toBe(true);
        });

        it('returns false when permission denied', async () => {
            (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'denied',
            });
            const result = await requestMediaPermissions();
            expect(result).toBe(false);
        });
    });

    describe('requestCameraPermissions', () => {
        it('returns true when permission granted', async () => {
            (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            const result = await requestCameraPermissions();
            expect(result).toBe(true);
        });

        it('returns false when permission denied', async () => {
            (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'denied',
            });
            const result = await requestCameraPermissions();
            expect(result).toBe(false);
        });
    });

    // === Picker functions ===

    describe('pickImage', () => {
        beforeEach(() => {
            (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
        });

        it('returns PickerResult on successful pick', async () => {
            (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
                canceled: false,
                assets: [{
                    uri: 'file:///photo.jpg',
                    mimeType: 'image/jpeg',
                    fileName: 'photo.jpg',
                }],
            });

            const result = await pickImage();
            expect(result).not.toBeNull();
            expect(result!.uri).toBe('file:///photo.jpg');
            expect(result!.mimeType).toBe('image/jpeg');
            expect(result!.type).toBe('image');
        });

        it('returns null when user cancels', async () => {
            (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
                canceled: true,
                assets: [],
            });

            const result = await pickImage();
            expect(result).toBeNull();
        });

        it('throws when permission denied', async () => {
            (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'denied',
            });

            await expect(pickImage()).rejects.toThrow('Media library permission denied');
        });

        it('uses default mimeType when not provided', async () => {
            (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
                canceled: false,
                assets: [{ uri: 'file:///photo.jpg', mimeType: undefined, fileName: null }],
            });

            const result = await pickImage();
            expect(result!.mimeType).toBe('image/jpeg');
        });
    });

    describe('pickVideo', () => {
        beforeEach(() => {
            (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
        });

        it('returns PickerResult for video', async () => {
            (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
                canceled: false,
                assets: [{
                    uri: 'file:///video.mp4',
                    mimeType: 'video/mp4',
                    fileName: 'video.mp4',
                }],
            });

            const result = await pickVideo();
            expect(result).not.toBeNull();
            expect(result!.type).toBe('video');
            expect(result!.mimeType).toBe('video/mp4');
        });

        it('returns null when canceled', async () => {
            (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
                canceled: true,
                assets: [],
            });

            const result = await pickVideo();
            expect(result).toBeNull();
        });
    });

    describe('takePhoto', () => {
        beforeEach(() => {
            (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
        });

        it('launches camera and returns result', async () => {
            (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
                canceled: false,
                assets: [{
                    uri: 'file:///camera-photo.jpg',
                    mimeType: 'image/jpeg',
                }],
            });

            const result = await takePhoto();
            expect(result).not.toBeNull();
            expect(result!.uri).toBe('file:///camera-photo.jpg');
            expect(result!.type).toBe('image');
            expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith(
                expect.objectContaining({ allowsEditing: true, quality: 0.8 })
            );
        });

        it('throws when camera permission denied', async () => {
            (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'denied',
            });

            await expect(takePhoto()).rejects.toThrow('Camera permission denied');
        });

        it('returns null when user cancels', async () => {
            (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
                canceled: true,
                assets: [],
            });
            const result = await takePhoto();
            expect(result).toBeNull();
        });
    });

    describe('takeVideo', () => {
        beforeEach(() => {
            (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
        });

        it('launches camera for video with max duration', async () => {
            (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
                canceled: false,
                assets: [{
                    uri: 'file:///camera-video.mp4',
                    mimeType: 'video/mp4',
                }],
            });

            const result = await takeVideo();
            expect(result).not.toBeNull();
            expect(result!.type).toBe('video');
            expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith(
                expect.objectContaining({ videoMaxDuration: 30 })
            );
        });
    });

    describe('pickMedia', () => {
        beforeEach(() => {
            (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
        });

        it('returns correct type for image', async () => {
            (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
                canceled: false,
                assets: [{
                    uri: 'file:///pic.png',
                    mimeType: 'image/png',
                    fileName: 'pic.png',
                }],
            });

            const result = await pickMedia();
            expect(result!.type).toBe('image');
        });

        it('returns correct type for video', async () => {
            (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
                canceled: false,
                assets: [{
                    uri: 'file:///vid.mp4',
                    mimeType: 'video/mp4',
                    fileName: 'vid.mp4',
                }],
            });

            const result = await pickMedia();
            expect(result!.type).toBe('video');
        });

        it('returns file type for unknown mimeType', async () => {
            (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
                canceled: false,
                assets: [{
                    uri: 'file:///doc.pdf',
                    mimeType: 'application/pdf',
                    fileName: 'doc.pdf',
                }],
            });

            const result = await pickMedia();
            expect(result!.type).toBe('file');
        });
    });

    // === Upload ===

    describe('uploadMedia', () => {
        const pickerResult = {
            uri: 'file:///photo.jpg',
            mimeType: 'image/jpeg',
            fileName: 'photo.jpg',
            type: 'image' as const,
        };

        beforeEach(() => {
            (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-123' });
            (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
                exists: true,
                size: 1024,
            });
            (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64data');
            mockUpload.mockResolvedValue({ data: { path: 'user-123/photo.jpg' }, error: null });
            mockCreateSignedUrl.mockResolvedValue({
                data: { signedUrl: 'https://storage.example.com/signed/photo.jpg' },
                error: null,
            });
        });

        it('uploads file and returns result', async () => {
            const result = await uploadMedia(pickerResult);
            expect(result.url).toBe('https://storage.example.com/signed/photo.jpg');
            expect(result.type).toBe('image');
            expect(result.size).toBe(1024);
        });

        it('throws when not authenticated', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(null);
            await expect(uploadMedia(pickerResult)).rejects.toThrow('Not authenticated');
        });

        it('throws when file does not exist', async () => {
            (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
            await expect(uploadMedia(pickerResult)).rejects.toThrow('File does not exist');
        });

        it('throws when file is too large (image > 10MB)', async () => {
            (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
                exists: true,
                size: 11 * 1024 * 1024,
            });
            await expect(uploadMedia(pickerResult)).rejects.toThrow(/File too large/);
        });

        it('throws when file is too large (video > 50MB)', async () => {
            const videoResult = { ...pickerResult, type: 'video' as const };
            (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
                exists: true,
                size: 51 * 1024 * 1024,
            });
            await expect(uploadMedia(videoResult)).rejects.toThrow(/File too large/);
        });

        it('calls onProgress callback', async () => {
            const onProgress = jest.fn();
            await uploadMedia(pickerResult, 'messages-media', onProgress);
            expect(onProgress).toHaveBeenCalledWith(10);
            expect(onProgress).toHaveBeenCalledWith(40);
            expect(onProgress).toHaveBeenCalledWith(60);
            expect(onProgress).toHaveBeenCalledWith(90);
            expect(onProgress).toHaveBeenCalledWith(100);
        });

        it('throws on upload error', async () => {
            mockUpload.mockResolvedValue({ data: null, error: new Error('Upload failed') });
            await expect(uploadMedia(pickerResult)).rejects.toThrow('Upload failed');
        });

        it('throws on signed URL error', async () => {
            mockCreateSignedUrl.mockResolvedValue({ data: null, error: new Error('URL failed') });
            await expect(uploadMedia(pickerResult)).rejects.toThrow('URL failed');
        });
    });

    // === Delete ===

    describe('deleteMedia', () => {
        it('deletes file from storage', async () => {
            mockRemove.mockResolvedValue({ error: null });
            await deleteMedia('user-123/photo.jpg');
            expect(mockRemove).toHaveBeenCalledWith(['user-123/photo.jpg']);
        });

        it('throws on delete error', async () => {
            mockRemove.mockResolvedValue({ error: new Error('Delete failed') });
            await expect(deleteMedia('path')).rejects.toThrow('Delete failed');
        });
    });

    // === Avatar ===

    describe('getAvatarUrl', () => {
        it('returns public URL', () => {
            mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/avatar.jpg' } });
            const url = getAvatarUrl('user-123/avatar.jpg');
            expect(url).toBe('https://example.com/avatar.jpg');
        });
    });

    describe('uploadAvatar', () => {
        beforeEach(() => {
            (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-123' });
            (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64data');
            mockUpload.mockResolvedValue({ error: null });
            mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/avatar.jpg' } });
        });

        it('uploads avatar and returns public URL', async () => {
            const result = await uploadAvatar({
                uri: 'file:///avatar.jpg',
                mimeType: 'image/jpeg',
                fileName: 'avatar.jpg',
                type: 'image',
            });
            expect(result).toBe('https://example.com/avatar.jpg');
            expect(mockUpload).toHaveBeenCalledWith(
                'user-123/avatar.jpeg',
                expect.any(ArrayBuffer),
                expect.objectContaining({ contentType: 'image/jpeg', upsert: true })
            );
        });

        it('throws when not authenticated', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(null);
            await expect(
                uploadAvatar({ uri: 'x', mimeType: 'image/jpeg', fileName: 'a', type: 'image' })
            ).rejects.toThrow('Not authenticated');
        });
    });

    // === uploadMediaToSupabase ===

    describe('uploadMediaToSupabase', () => {
        beforeEach(() => {
            (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-123' });
            (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
            (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64data');
            mockUpload.mockResolvedValue({ error: null });
            mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/story.jpg' } });
        });

        it('uploads media and returns public URL', async () => {
            const url = await uploadMediaToSupabase('file:///story.jpg', 'stories');
            expect(url).toBe('https://example.com/story.jpg');
        });

        it('throws when not authenticated', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(null);
            await expect(uploadMediaToSupabase('file:///x.jpg')).rejects.toThrow('Not authenticated');
        });

        it('throws when file does not exist', async () => {
            (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
            await expect(uploadMediaToSupabase('file:///x.jpg')).rejects.toThrow('File does not exist');
        });

        it('throws on upload error', async () => {
            mockUpload.mockResolvedValue({ error: new Error('Storage error') });
            await expect(uploadMediaToSupabase('file:///x.jpg')).rejects.toThrow('Storage error');
        });

        it('detects MIME type from extension', async () => {
            await uploadMediaToSupabase('file:///video.mp4', 'stories');
            expect(mockUpload).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(ArrayBuffer),
                expect.objectContaining({ contentType: 'video/mp4' })
            );
        });
    });
});
