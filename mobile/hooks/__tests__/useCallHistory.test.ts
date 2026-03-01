/**
 * Tests for hooks/useCallHistory.ts
 * Call history management with Supabase realtime
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';

// Mock dependencies
const mockGetCallHistory = jest.fn();
const mockSubscribeToIncomingCalls = jest.fn();

jest.mock('@/services/call-signaling', () => ({
    getCallHistory: (...args: any[]) => mockGetCallHistory(...args),
    subscribeToIncomingCalls: (...args: any[]) => mockSubscribeToIncomingCalls(...args),
}));

const mockGetUser = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();

jest.mock('@/services/supabase', () => ({
    supabase: {
        auth: {
            getUser: () => mockGetUser(),
        },
        from: jest.fn(() => ({
            delete: () => {
                mockDelete();
                return { eq: mockEq };
            },
        })),
    },
}));

import { useCallHistory } from '../useCallHistory';

describe('useCallHistory', () => {
    const mockUserId = 'user-123';
    const mockCalls = [
        {
            id: 'call-1',
            caller_id: 'user-123',
            callee_id: 'user-456',
            call_type: 'video',
            status: 'ended',
            created_at: new Date().toISOString(),
            answered_at: new Date(Date.now() - 300000).toISOString(),
            ended_at: new Date().toISOString(),
            caller: { id: 'user-123', username: 'me', display_name: 'Me', avatar_url: null },
            callee: { id: 'user-456', username: 'other', display_name: 'Other', avatar_url: null },
        },
        {
            id: 'call-2',
            caller_id: 'user-456',
            callee_id: 'user-123',
            call_type: 'audio',
            status: 'missed',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            answered_at: null,
            ended_at: null,
            caller: { id: 'user-456', username: 'other', display_name: 'Other', avatar_url: null },
            callee: { id: 'user-123', username: 'me', display_name: 'Me', avatar_url: null },
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetUser.mockResolvedValue({ data: { user: { id: mockUserId } } });
        mockGetCallHistory.mockResolvedValue(mockCalls);
        mockSubscribeToIncomingCalls.mockResolvedValue(jest.fn());
    });

    it('loads call history on mount', async () => {
        const { result } = renderHook(() => useCallHistory());

        // Initially loading
        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.calls).toHaveLength(2);
        expect(mockGetCallHistory).toHaveBeenCalledWith(100);
    });

    it('transforms calls correctly — outgoing call', async () => {
        const { result } = renderHook(() => useCallHistory());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const outgoingCall = result.current.calls[0];
        expect(outgoingCall.isOutgoing).toBe(true);
        expect(outgoingCall.otherUser.id).toBe('user-456');
    });

    it('transforms calls correctly — incoming call', async () => {
        const { result } = renderHook(() => useCallHistory());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const incomingCall = result.current.calls[1];
        expect(incomingCall.isOutgoing).toBe(false);
        expect(incomingCall.otherUser.id).toBe('user-456');
    });

    it('calculates duration from answered_at and ended_at', async () => {
        const { result } = renderHook(() => useCallHistory());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Call 1 has answered_at and ended_at
        expect(result.current.calls[0].duration).toBeGreaterThan(0);
        // Call 2 was missed — no duration
        expect(result.current.calls[1].duration).toBeNull();
    });

    it('formats duration correctly', async () => {
        const { result } = renderHook(() => useCallHistory());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Missed call: 0:00
        expect(result.current.calls[1].formattedDuration).toBe('0:00');
    });

    it('handles no user scenario', async () => {
        mockGetUser.mockResolvedValue({ data: { user: null } });

        const { result } = renderHook(() => useCallHistory());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.calls).toHaveLength(0);
        expect(mockGetCallHistory).not.toHaveBeenCalled();
    });

    it('handles API errors gracefully', async () => {
        mockGetCallHistory.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useCallHistory());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Network error');
        expect(result.current.calls).toHaveLength(0);
    });

    it('subscribes to incoming calls', async () => {
        renderHook(() => useCallHistory());

        await waitFor(() => {
            expect(mockSubscribeToIncomingCalls).toHaveBeenCalled();
        });
    });

    it('adds new incoming call to top of list', async () => {
        let callbackFn: ((call: any) => void) | null = null;
        mockSubscribeToIncomingCalls.mockImplementation((cb: any) => {
            callbackFn = cb;
            return Promise.resolve(jest.fn());
        });

        const { result } = renderHook(() => useCallHistory());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Simulate incoming call
        const newCall = {
            id: 'call-3',
            caller_id: 'user-789',
            callee_id: 'user-123',
            call_type: 'video',
            status: 'ringing',
            created_at: new Date().toISOString(),
            answered_at: null,
            ended_at: null,
            caller: { id: 'user-789', username: 'new', display_name: 'New', avatar_url: null },
            callee: { id: 'user-123', username: 'me', display_name: 'Me', avatar_url: null },
        };

        act(() => {
            callbackFn!(newCall);
        });

        expect(result.current.calls).toHaveLength(3);
        expect(result.current.calls[0].id).toBe('call-3');
    });

    it('deleteCall removes call from local state', async () => {
        mockEq.mockResolvedValue({ error: null });

        const { result } = renderHook(() => useCallHistory());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.calls).toHaveLength(2);

        await act(async () => {
            await result.current.deleteCall('call-1');
        });

        expect(result.current.calls).toHaveLength(1);
        expect(result.current.calls[0].id).toBe('call-2');
    });

    it('deleteCall handles error', async () => {
        mockEq.mockResolvedValue({ error: new Error('Delete failed') });

        const { result } = renderHook(() => useCallHistory());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.deleteCall('call-1');
        });

        expect(result.current.error).toBe('Delete failed');
    });

    it('refresh reloads history', async () => {
        const { result } = renderHook(() => useCallHistory());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        mockGetCallHistory.mockResolvedValue([]);

        await act(async () => {
            await result.current.refresh();
        });

        expect(result.current.calls).toHaveLength(0);
    });

    it('unsubscribes on unmount', async () => {
        const mockUnsubscribe = jest.fn();
        mockSubscribeToIncomingCalls.mockResolvedValue(mockUnsubscribe);

        const { unmount } = renderHook(() => useCallHistory());

        await waitFor(() => {
            expect(mockSubscribeToIncomingCalls).toHaveBeenCalled();
        });

        unmount();

        // Give time for the cleanup to run
        await new Promise(r => setTimeout(r, 50));
        expect(mockUnsubscribe).toHaveBeenCalled();
    });
});
