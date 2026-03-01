/**
 * Tests for services/voice-recording.ts
 * Audio recording with expo-av and upload to Supabase
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

// Mock supabase
const mockUpload = jest.fn();
const mockCreateSignedUrl = jest.fn();

jest.mock('../supabase', () => ({
    getCurrentUser: jest.fn(),
    supabase: {
        storage: {
            from: jest.fn(() => ({
                upload: mockUpload,
                createSignedUrl: mockCreateSignedUrl,
            })),
        },
    },
}));

// Mock base64-arraybuffer (used via dynamic import in uploadVoiceNote)
jest.mock('base64-arraybuffer', () => ({
    decode: jest.fn(() => new ArrayBuffer(8)),
}));

import { getCurrentUser } from '../supabase';
import {
    cancelRecording,
    formatDuration,
    getRecordingStatus,
    requestPermissions,
    startRecording,
    stopRecording,
    uploadVoiceNote,
} from '../voice-recording';

// Helper to create a mock recording instance
function createMockRecording(overrides: Partial<{
    isRecording: boolean;
    durationMillis: number;
    metering: number;
    uri: string | null;
}> = {}) {
    const {
        isRecording = true,
        durationMillis = 5000,
        metering = -20,
        uri = 'file:///recording.m4a',
    } = overrides;

    return {
        prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
        startAsync: jest.fn().mockResolvedValue(undefined),
        stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
        getStatusAsync: jest.fn().mockResolvedValue({ isRecording, durationMillis, metering }),
        getURI: jest.fn().mockReturnValue(uri),
    };
}

describe('voice-recording service', () => {
    let mockRecording: ReturnType<typeof createMockRecording>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRecording = createMockRecording();

        // Mock Audio.Recording constructor
        (Audio.Recording as unknown as jest.Mock) = jest.fn(() => mockRecording);
    });

    describe('requestPermissions', () => {
        it('returns true when granted', async () => {
            (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            const result = await requestPermissions();
            expect(result).toBe(true);
        });

        it('returns false when denied', async () => {
            (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
            const result = await requestPermissions();
            expect(result).toBe(false);
        });

        it('returns false on error', async () => {
            (Audio.requestPermissionsAsync as jest.Mock).mockRejectedValue(new Error('fail'));
            const result = await requestPermissions();
            expect(result).toBe(false);
        });
    });

    describe('startRecording', () => {
        beforeEach(() => {
            (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Audio.setAudioModeAsync as jest.Mock).mockResolvedValue(undefined);
        });

        it('creates and starts a recording', async () => {
            const recording = await startRecording();
            expect(Audio.setAudioModeAsync).toHaveBeenCalledWith(
                expect.objectContaining({ allowsRecordingIOS: true })
            );
            expect(mockRecording.prepareToRecordAsync).toHaveBeenCalled();
            expect(mockRecording.startAsync).toHaveBeenCalled();
        });

        it('throws when permission denied', async () => {
            (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
            await expect(startRecording()).rejects.toThrow('Microphone permission not granted');
        });
    });

    describe('stopRecording', () => {
        beforeEach(async () => {
            (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Audio.setAudioModeAsync as jest.Mock).mockResolvedValue(undefined);
            // Start a recording first
            await startRecording();
        });

        it('stops recording and returns result', async () => {
            const result = await stopRecording();
            expect(result).not.toBeNull();
            expect(result!.uri).toBe('file:///recording.m4a');
            expect(result!.duration).toBe(5000);
            expect(result!.mimeType).toBe('audio/m4a');
            expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
        });

        it('resets audio mode after stop', async () => {
            await stopRecording();
            expect(Audio.setAudioModeAsync).toHaveBeenCalledWith(
                expect.objectContaining({ allowsRecordingIOS: false })
            );
        });

        it('returns null when no recording is active', async () => {
            await stopRecording(); // stop the first one
            const result = await stopRecording(); // no recording now
            expect(result).toBeNull();
        });

        it('returns null when URI is null', async () => {
            mockRecording.getURI.mockReturnValue(null);
            const result = await stopRecording();
            expect(result).toBeNull();
        });
    });

    describe('cancelRecording', () => {
        beforeEach(async () => {
            (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Audio.setAudioModeAsync as jest.Mock).mockResolvedValue(undefined);
            (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);
            await startRecording();
        });

        it('stops, deletes file and resets', async () => {
            await cancelRecording();
            expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
            expect(FileSystem.deleteAsync).toHaveBeenCalledWith('file:///recording.m4a', { idempotent: true });
        });

        it('does nothing when no recording active', async () => {
            await cancelRecording(); // cancel first
            jest.clearAllMocks();
            await cancelRecording(); // no-op
            expect(mockRecording.stopAndUnloadAsync).not.toHaveBeenCalled();
        });
    });

    describe('getRecordingStatus', () => {
        it('returns null when no recording active', async () => {
            const status = await getRecordingStatus();
            expect(status).toBeNull();
        });

        it('returns status when recording is active', async () => {
            (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Audio.setAudioModeAsync as jest.Mock).mockResolvedValue(undefined);
            await startRecording();

            const status = await getRecordingStatus();
            expect(status).toEqual({
                isRecording: true,
                durationMillis: 5000,
                metering: -20,
            });
        });
    });

    describe('uploadVoiceNote', () => {
        const voiceRecording = {
            uri: 'file:///recording.m4a',
            duration: 5000,
            mimeType: 'audio/m4a',
        };

        beforeEach(() => {
            (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-123' });
            (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64data');
            (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ size: 2048 });
            (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);
            mockUpload.mockResolvedValue({ error: null });
            mockCreateSignedUrl.mockResolvedValue({
                data: { signedUrl: 'https://storage.example.com/voice.m4a' },
                error: null,
            });
        });

        it('uploads and returns result', async () => {
            const result = await uploadVoiceNote(voiceRecording);
            expect(result.url).toBe('https://storage.example.com/voice.m4a');
            expect(result.duration).toBe(5000);
            expect(result.mimeType).toBe('audio/m4a');
        });

        it('throws when not authenticated', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(null);
            await expect(uploadVoiceNote(voiceRecording)).rejects.toThrow('Not authenticated');
        });

        it('calls onProgress callback', async () => {
            const onProgress = jest.fn();
            await uploadVoiceNote(voiceRecording, onProgress);
            expect(onProgress).toHaveBeenCalledWith(10);
            expect(onProgress).toHaveBeenCalledWith(30);
            expect(onProgress).toHaveBeenCalledWith(50);
            expect(onProgress).toHaveBeenCalledWith(80);
            expect(onProgress).toHaveBeenCalledWith(100);
        });

        it('throws on upload error', async () => {
            mockUpload.mockResolvedValue({ error: new Error('Upload failed') });
            await expect(uploadVoiceNote(voiceRecording)).rejects.toThrow('Upload failed');
        });

        it('throws on signed URL error', async () => {
            mockCreateSignedUrl.mockResolvedValue({ data: null, error: new Error('URL error') });
            await expect(uploadVoiceNote(voiceRecording)).rejects.toThrow('URL error');
        });

        it('cleans up local file after upload', async () => {
            await uploadVoiceNote(voiceRecording);
            expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
                'file:///recording.m4a',
                { idempotent: true }
            );
        });
    });

    describe('formatDuration', () => {
        it('formats 0ms as 0:00', () => {
            expect(formatDuration(0)).toBe('0:00');
        });

        it('formats seconds correctly', () => {
            expect(formatDuration(5000)).toBe('0:05');
        });

        it('formats minutes and seconds', () => {
            expect(formatDuration(125000)).toBe('2:05');
        });

        it('pads seconds with zero', () => {
            expect(formatDuration(60000)).toBe('1:00');
        });
    });
});
