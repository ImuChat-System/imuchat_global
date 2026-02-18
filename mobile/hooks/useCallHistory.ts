/**
 * Hook pour l'historique des appels
 * Récupère et gère l'historique des appels avec realtime updates
 */

import {
    CallEvent,
    getCallHistory,
    subscribeToIncomingCalls,
} from '@/services/call-signaling';
import { supabase } from '@/services/supabase';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface CallHistoryItem extends CallEvent {
    isOutgoing: boolean;
    otherUser: {
        id: string;
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    };
    duration: number | null; // in seconds
    formattedDuration: string;
    formattedTime: string;
}

export interface UseCallHistoryReturn {
    calls: CallHistoryItem[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    deleteCall: (callId: string) => Promise<void>;
}

/**
 * Format call duration as mm:ss or hh:mm:ss
 */
function formatDuration(seconds: number | null): string {
    if (!seconds || seconds <= 0) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format timestamp as relative or absolute time
 */
function formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) {
        return date.toLocaleDateString('fr-FR', { weekday: 'long' });
    }
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
    });
}

/**
 * Calculate call duration from answered_at and ended_at
 */
function calculateDuration(answeredAt: string | null, endedAt: string | null): number | null {
    if (!answeredAt || !endedAt) return null;

    const start = new Date(answeredAt).getTime();
    const end = new Date(endedAt).getTime();

    return Math.floor((end - start) / 1000);
}

/**
 * Hook pour l'historique des appels
 */
export function useCallHistory(): UseCallHistoryReturn {
    const [calls, setCalls] = useState<CallHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const loadedRef = useRef(false);

    // Transform call event to history item
    const transformCall = useCallback(
        (call: CallEvent, userId: string): CallHistoryItem => {
            const isOutgoing = call.caller_id === userId;
            const otherUser = isOutgoing ? call.callee : call.caller;
            const duration = calculateDuration(call.answered_at, call.ended_at);

            return {
                ...call,
                isOutgoing,
                otherUser: otherUser || {
                    id: isOutgoing ? call.callee_id : call.caller_id,
                    username: null,
                    full_name: null,
                    avatar_url: null,
                },
                duration,
                formattedDuration: formatDuration(duration),
                formattedTime: formatTime(call.created_at),
            };
        },
        []
    );

    // Load call history
    const loadHistory = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const history = await getCallHistory(100);
            const transformed = history.map((c) => transformCall(c, user.id));
            setCalls(transformed);
            setCurrentUserId(user.id);
        } catch (err) {
            console.error('Error loading call history:', err);
            setError(err instanceof Error ? err.message : 'Failed to load call history');
        } finally {
            setLoading(false);
        }
    }, [transformCall]);

    // Initial load - only once
    useEffect(() => {
        if (!loadedRef.current) {
            loadedRef.current = true;
            loadHistory();
        }
    }, [loadHistory]);

    // Subscribe to new calls
    useEffect(() => {
        if (!currentUserId) return;

        let unsubscribe: (() => void) | null = null;

        subscribeToIncomingCalls((newCall) => {
            // Add new call to top of list
            const transformed = transformCall(newCall, currentUserId);
            setCalls((prev) => [transformed, ...prev]);
        }).then((unsub) => {
            unsubscribe = unsub;
        });

        return () => {
            unsubscribe?.();
        };
    }, [currentUserId, transformCall]);

    // Delete a call from history
    const deleteCall = useCallback(async (callId: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('call_events')
                .delete()
                .eq('id', callId);

            if (deleteError) throw deleteError;

            // Remove from local state
            setCalls((prev) => prev.filter((c) => c.id !== callId));
        } catch (err) {
            console.error('Error deleting call:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete call');
        }
    }, []);

    return {
        calls,
        loading,
        error,
        refresh: loadHistory,
        deleteCall,
    };
}
