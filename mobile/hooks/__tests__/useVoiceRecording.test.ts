/**
 * Tests for hooks/useVoiceRecording.ts
 * Hook wrapping voice-recording service with status polling
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';

// Mock voice-recording service
const mockRequestPermissions = jest.fn().mockResolvedValue(true);
const mockStartRecording = jest.fn().mockResolvedValue(undefined);
const mockStopRecording = jest.fn().mockResolvedValue({
    uri: 'file:///rec.m4a',
    duration: 5000,
    mimeType: 'audio/m4a',
});
const mockCancelRecording = jest.fn().mockResolvedValue(undefined);
const mockGetRecordingStatus = jest.fn().mockResolvedValue({
    isRecording: true,
    durationMillis: 3000,
    metering: -25,
});
const mockUploadVoiceNote = jest.fn().mockResolvedValue({
    url: 'https://storage.example.com/voice.m4a',
    duration: 5000,
    mimeType: 'audio/m4a',
    size: 2048,
});
const mockFormatDuration = jest.fn((ms: number) => {
    const secs = Math.floor(ms / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
});

jest.mock('@/services/voice-recording', () => ({
    requestPermissions: (...args: any[]) => mockRequestPermissions(...args),
    startRecording: (...args: any[]) => mockStartRecording(...args),
    stopRecording: (...args: any[]) => mockStopRecording(...args),
    cancelRecording: (...args: any[]) => mockCancelRecording(...args),
    getRecordingStatus: (...args: any[]) => mockGetRecordingStatus(...args),
    uploadVoiceNote: (...args: any[]) => mockUploadVoiceNote(...args),
    formatDuration: (...args: any[]) => mockFormatDuration(...args),
}));

import { useVoiceRecording } from '../useVoiceRecording';

describe('useVoiceRecording', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        mockRequestPermissions.mockResolvedValue(true);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('initialization', () => {
        it('checks permissions on mount', async () => {
            jest.useRealTimers();
            const { result } = renderHook(() => useVoiceRecording());

            await waitFor(() => {
                expect(result.current.hasPermission).toBe(true);
            });

            expect(mockRequestPermissions).toHaveBeenCalled();
        });

        it('initial state is idle', async () => {
            jest.useRealTimers();
            const { result } = renderHook(() => useVoiceRecording());
            expect(result.current.status).toBe('idle');
            expect(result.current.duration).toBe(0);
            expect(result.current.metering).toBeNull();
            expect(result.current.uploadProgress).toBe(0);
            expect(result.current.error).toBeNull();
        });

        it('sets hasPermission false when denied', async () => {
            jest.useRealTimers();
            mockRequestPermissions.mockResolvedValue(false);

            const { result } = renderHook(() => useVoiceRecording());

            await waitFor(() => {
                expect(result.current.hasPermission).toBe(false);
            });
        });
    });

    describe('requestPermission', () => {
        it('calls requestPermissions and updates state', async () => {
            jest.useRealTimers();
            const { result } = renderHook(() => useVoiceRecording());

            await waitFor(() => {
                expect(result.current.hasPermission).not.toBeNull();
            });

            mockRequestPermissions.mockResolvedValue(true);
            let granted: boolean = false;
            await act(async () => {
                granted = await result.current.requestPermission();
            });

            expect(granted).toBe(true);
            expect(result.current.hasPermission).toBe(true);
        });
    });

    describe('start', () => {
        it('starts recording and transitions to recording status', async () => {
            jest.useRealTimers();
            const { result } = renderHook(() => useVoiceRecording());

            await waitFor(() => {
                expect(result.current.hasPermission).not.toBeNull();
            });

            await act(async () => {
                await result.current.start();
            });

            expect(mockStartRecording).toHaveBeenCalled();
            expect(result.current.status).toBe('recording');
            expect(result.current.error).toBeNull();
        });

        it('sets error on failure', async () => {
            jest.useRealTimers();
            mockStartRecording.mockRejectedValueOnce(new Error('Mic busy'));

            const { result } = renderHook(() => useVoiceRecording());

            await waitFor(() => {
                expect(result.current.hasPermission).not.toBeNull();
            });

            await act(async () => {
                await result.current.start();
            });

            expect(result.current.error).toBe('Mic busy');
            expect(result.current.status).toBe('idle');
        });
    });

    describe('stop', () => {
        it('stops recording and returns result', async () => {
            jest.useRealTimers();
            const { result } = renderHook(() => useVoiceRecording());

            await waitFor(() => {
                expect(result.current.hasPermission).not.toBeNull();
            });

            await act(async () => {
                await result.current.start();
            });

            let recording: any;
            await act(async () => {
                recording = await result.current.stop();
            });

            expect(mockStopRecording).toHaveBeenCalled();
            expect(recording).toEqual({
                uri: 'file:///rec.m4a',
                duration: 5000,
                mimeType: 'audio/m4a',
            });
        });

        it('returns null when no recording', async () => {
            jest.useRealTimers();
            mockStopRecording.mockResolvedValueOnce(null);

            const { result } = renderHook(() => useVoiceRecording());

            await waitFor(() => {
                expect(result.current.hasPermission).not.toBeNull();
            });

            let recording: any;
            await act(async () => {
                recording = await result.current.stop();
            });

            expect(recording).toBeNull();
            expect(result.current.status).toBe('idle');
        });

        it('handles stop error', async () => {
            jest.useRealTimers();
            mockStopRecording.mockRejectedValueOnce(new Error('stop error'));

            const { result } = renderHook(() => useVoiceRecording());

            await waitFor(() => {
                expect(result.current.hasPermission).not.toBeNull();
            });

            await act(async () => {
                await result.current.start();
            });

            let recording: any;
            await act(async () => {
                recording = await result.current.stop();
            });

            expect(recording).toBeNull();
            expect(result.current.error).toBe('stop error');
            expect(result.current.status).toBe('idle');
        });
    });

    describe('cancel', () => {
        it('cancels recording and resets state', async () => {
            jest.useRealTimers();
            const { result } = renderHook(() => useVoiceRecording());

            await waitFor(() => {
                expect(result.current.hasPermission).not.toBeNull();
            });

            await act(async () => {
                await result.current.start();
            });

            await act(async () => {
                await result.current.cancel();
            });

            expect(mockCancelRecording).toHaveBeenCalled();
            expect(result.current.status).toBe('idle');
            expect(result.current.duration).toBe(0);
            expect(result.current.metering).toBeNull();
        });
    });

    describe('upload', () => {
        const mockRecording = {
            uri: 'file:///rec.m4a',
            duration: 5000,
            mimeType: 'audio/m4a',
        };

        it('uploads and returns result', async () => {
            jest.useRealTimers();
            const { result } = renderHook(() => useVoiceRecording());

            await waitFor(() => {
                expect(result.current.hasPermission).not.toBeNull();
            });

            let uploadResult: any;
            await act(async () => {
                uploadResult = await result.current.upload(mockRecording);
            });

            expect(mockUploadVoiceNote).toHaveBeenCalledWith(
                mockRecording,
                expect.any(Function)
            );
            expect(uploadResult).toBeTruthy();
            expect(uploadResult.url).toBe('https://storage.example.com/voice.m4a');
            // After upload, status resets to idle
            expect(result.current.status).toBe('idle');
        });

        it('handles upload error', async () => {
            jest.useRealTimers();
            mockUploadVoiceNote.mockRejectedValueOnce(new Error('Upload fail'));

            const { result } = renderHook(() => useVoiceRecording());

            await waitFor(() => {
                expect(result.current.hasPermission).not.toBeNull();
            });

            let uploadResult: any;
            await act(async () => {
                uploadResult = await result.current.upload(mockRecording);
            });

            expect(uploadResult).toBeNull();
            expect(result.current.error).toBe('Upload fail');
            expect(result.current.status).toBe('idle');
        });
    });

    describe('formattedDuration', () => {
        it('formats duration using formatDuration service', async () => {
            jest.useRealTimers();
            const { result } = renderHook(() => useVoiceRecording());

            // Default 0 duration
            expect(result.current.formattedDuration).toBe('0:00');
            expect(mockFormatDuration).toHaveBeenCalledWith(0);
        });
    });

    describe('cleanup', () => {
        it('clears polling interval on unmount when recording', async () => {
            jest.useRealTimers();
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

            const { result, unmount } = renderHook(() => useVoiceRecording());

            await waitFor(() => {
                expect(result.current.hasPermission).not.toBeNull();
            });

            // Start recording to activate the polling interval
            await act(async () => {
                await result.current.start();
            });

            clearIntervalSpy.mockClear();
            unmount();

            expect(clearIntervalSpy).toHaveBeenCalled();
            clearIntervalSpy.mockRestore();
        });
    });
});
