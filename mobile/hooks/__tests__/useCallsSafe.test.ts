/**
 * Tests for hooks/useCallsSafe.ts
 * Safe calls hook with Expo Go detection
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';

// Mock auth
jest.mock('../useAuth', () => ({
    useAuth: jest.fn().mockReturnValue({
        user: {
            id: 'user-1',
            email: 'test@test.com',
            user_metadata: { display_name: 'TestUser', avatar_url: 'https://img.com/a.png' },
        },
    }),
}));

// Mock calls-safe service
const mockIsCallsAvailable = jest.fn().mockResolvedValue(true);
jest.mock('@/services/calls-safe', () => ({
    isCallsAvailable: (...args: any[]) => mockIsCallsAvailable(...args),
}));

// Mock calls module (dynamically imported by the hook)
const mockCallsModule = {
    initializeStreamClient: jest.fn().mockResolvedValue({ id: 'client-1' }),
    generateCallId: jest.fn().mockReturnValue('call-id-123'),
    createCall: jest.fn().mockResolvedValue({ id: 'call-obj-1' }),
    getCall: jest.fn().mockResolvedValue({ id: 'call-obj-1' }),
    joinCall: jest.fn().mockResolvedValue(undefined),
    leaveCall: jest.fn().mockResolvedValue(undefined),
    endCall: jest.fn().mockResolvedValue(undefined),
    toggleMicrophone: jest.fn().mockResolvedValue(undefined),
    toggleCamera: jest.fn().mockResolvedValue(undefined),
    flipCamera: jest.fn().mockResolvedValue(undefined),
    disconnectStreamClient: jest.fn().mockResolvedValue(undefined),
};
jest.mock('@/services/calls', () => mockCallsModule);

// Mock stream-token
const mockGenerateStreamToken = jest.fn().mockResolvedValue({ token: 'stream-tok-123' });
jest.mock('@/services/stream-token', () => ({
    generateStreamToken: (...args: any[]) => mockGenerateStreamToken(...args),
}));

import { useAuth } from '../useAuth';
import { useCallsSafe } from '../useCallsSafe';

describe('useCallsSafe', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsCallsAvailable.mockResolvedValue(true);
        (useAuth as jest.Mock).mockReturnValue({
            user: {
                id: 'user-1',
                email: 'test@test.com',
                user_metadata: { display_name: 'TestUser', avatar_url: 'https://img.com/a.png' },
            },
        });
    });

    describe('initialization', () => {
        it('starts in checking state', () => {
            const { result } = renderHook(() => useCallsSafe());
            expect(result.current.isChecking).toBe(true);
            expect(result.current.isAvailable).toBe(false);
        });

        it('sets isAvailable true after SDK check (standalone)', async () => {
            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isChecking).toBe(false);
            });

            expect(result.current.isAvailable).toBe(true);
        });

        it('sets isAvailable false in Expo Go', async () => {
            mockIsCallsAvailable.mockResolvedValue(false);

            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isChecking).toBe(false);
            });

            expect(result.current.isAvailable).toBe(false);
        });

        it('handles check error gracefully', async () => {
            mockIsCallsAvailable.mockRejectedValue(new Error('check failed'));

            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isChecking).toBe(false);
            });

            expect(result.current.isAvailable).toBe(false);
        });

        it('initializes Stream client when available and user logged in', async () => {
            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isChecking).toBe(false);
            });

            // Wait a tick for the initClient effect
            await waitFor(() => {
                expect(mockCallsModule.initializeStreamClient).toHaveBeenCalledWith(
                    expect.objectContaining({ id: 'user-1', name: 'TestUser' }),
                    'stream-tok-123'
                );
            });
        });

        it('does not init client when user is null', async () => {
            (useAuth as jest.Mock).mockReturnValue({ user: null });

            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isChecking).toBe(false);
            });

            await new Promise(r => setTimeout(r, 50));
            expect(mockCallsModule.initializeStreamClient).not.toHaveBeenCalled();
        });
    });

    describe('initiateCall', () => {
        it('creates a call and updates state', async () => {
            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isAvailable).toBe(true);
            });

            let callResult: any;
            await act(async () => {
                callResult = await result.current.initiateCall('recipient-1', true);
            });

            expect(callResult).toEqual({ id: 'call-obj-1' });
            expect(mockCallsModule.generateCallId).toHaveBeenCalled();
            expect(mockCallsModule.createCall).toHaveBeenCalledWith(
                'call-id-123',
                'default',
                ['recipient-1']
            );
            expect(result.current.isActive).toBe(true);
            expect(result.current.callId).toBe('call-id-123');
        });

        it('creates audio call when isVideo is false', async () => {
            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isAvailable).toBe(true);
            });

            await act(async () => {
                await result.current.initiateCall('recipient-1', false);
            });

            expect(mockCallsModule.createCall).toHaveBeenCalledWith(
                'call-id-123',
                'audio',
                ['recipient-1']
            );
        });

        it('returns null and sets error when SDK unavailable', async () => {
            mockIsCallsAvailable.mockResolvedValue(false);

            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isChecking).toBe(false);
            });

            let callResult: any;
            await act(async () => {
                callResult = await result.current.initiateCall('recipient-1');
            });

            expect(callResult).toBeNull();
            expect(result.current.error).toBeTruthy();
        });

        it('handles createCall error', async () => {
            mockCallsModule.createCall.mockRejectedValueOnce(new Error('network fail'));

            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isAvailable).toBe(true);
            });

            let callResult: any;
            await act(async () => {
                callResult = await result.current.initiateCall('r-1');
            });

            expect(callResult).toBeNull();
            expect(result.current.error).toBe('network fail');
            expect(result.current.isConnecting).toBe(false);
        });
    });

    describe('joinCall', () => {
        it('joins a call and updates state', async () => {
            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isAvailable).toBe(true);
            });

            await act(async () => {
                await result.current.joinCall('call-abc', { videoEnabled: false });
            });

            expect(mockCallsModule.getCall).toHaveBeenCalledWith('call-abc', 'default');
            expect(mockCallsModule.joinCall).toHaveBeenCalledWith(
                { id: 'call-obj-1' },
                { videoEnabled: false }
            );
            expect(result.current.isActive).toBe(true);
            expect(result.current.callId).toBe('call-abc');
            expect(result.current.isCameraOn).toBe(false);
        });

        it('sets error when call not found', async () => {
            mockCallsModule.getCall.mockResolvedValueOnce(null);

            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isAvailable).toBe(true);
            });

            await act(async () => {
                await result.current.joinCall('bad-call');
            });

            expect(result.current.error).toBeTruthy();
            expect(result.current.isActive).toBe(false);
        });
    });

    describe('leaveCall', () => {
        it('leaves call and resets state', async () => {
            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isAvailable).toBe(true);
            });

            // First initiate a call
            await act(async () => {
                await result.current.initiateCall('r-1');
            });

            expect(result.current.isActive).toBe(true);

            await act(async () => {
                await result.current.leaveCall();
            });

            expect(mockCallsModule.leaveCall).toHaveBeenCalled();
            expect(result.current.isActive).toBe(false);
            expect(result.current.call).toBeNull();
            expect(result.current.callId).toBeNull();
        });

        it('no-op when no call active', async () => {
            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isAvailable).toBe(true);
            });

            await act(async () => {
                await result.current.leaveCall();
            });

            expect(mockCallsModule.leaveCall).not.toHaveBeenCalled();
        });
    });

    describe('endCall', () => {
        it('ends call and resets state', async () => {
            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isAvailable).toBe(true);
            });

            await act(async () => {
                await result.current.initiateCall('r-1');
            });

            await act(async () => {
                await result.current.endCall();
            });

            expect(mockCallsModule.endCall).toHaveBeenCalled();
            expect(result.current.isActive).toBe(false);
        });
    });

    describe('toggleMic', () => {
        it('toggles microphone and updates state', async () => {
            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isAvailable).toBe(true);
            });

            await act(async () => {
                await result.current.initiateCall('r-1');
            });

            expect(result.current.isMicOn).toBe(true);

            await act(async () => {
                await result.current.toggleMic();
            });

            expect(mockCallsModule.toggleMicrophone).toHaveBeenCalled();
            expect(result.current.isMicOn).toBe(false);
        });

        it('no-op without active call', async () => {
            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isAvailable).toBe(true);
            });

            await act(async () => {
                await result.current.toggleMic();
            });

            expect(mockCallsModule.toggleMicrophone).not.toHaveBeenCalled();
        });
    });

    describe('toggleCam', () => {
        it('toggles camera', async () => {
            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isAvailable).toBe(true);
            });

            await act(async () => {
                await result.current.initiateCall('r-1');
            });

            await act(async () => {
                await result.current.toggleCam();
            });

            expect(mockCallsModule.toggleCamera).toHaveBeenCalled();
            expect(result.current.isCameraOn).toBe(false);
        });
    });

    describe('flipCam', () => {
        it('flips camera', async () => {
            const { result } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isAvailable).toBe(true);
            });

            await act(async () => {
                await result.current.initiateCall('r-1');
            });

            await act(async () => {
                await result.current.flipCam();
            });

            expect(mockCallsModule.flipCamera).toHaveBeenCalled();
        });
    });

    describe('cleanup', () => {
        it('disconnects Stream client on unmount', async () => {
            const { result, unmount } = renderHook(() => useCallsSafe());

            await waitFor(() => {
                expect(result.current.isAvailable).toBe(true);
            });

            // Wait for client initialization
            await waitFor(() => {
                expect(mockCallsModule.initializeStreamClient).toHaveBeenCalled();
            });

            unmount();

            expect(mockCallsModule.disconnectStreamClient).toHaveBeenCalled();
        });
    });
});
