/**
 * useReactions Hook - Mobile
 * Hook React pour gérer les réactions aux messages
 */

import {
    QUICK_REACTIONS,
    Reaction,
    ReactionGroup,
    getReactionsForMessages,
    groupReactions,
    subscribeToReactions,
    toggleReaction,
} from '@/services/reactions';
import { supabase } from '@/services/supabase';
import { useCallback, useEffect, useState } from 'react';

export interface UseReactionsOptions {
    conversationId: string;
    messageIds: string[];
}

export interface UseReactionsReturn {
    /** Réactions groupées par message */
    reactionsByMessage: Record<string, ReactionGroup[]>;
    /** Toggle une réaction */
    toggle: (messageId: string, emoji: string) => Promise<void>;
    /** Chargement en cours */
    loading: boolean;
    /** Erreur */
    error: string | null;
    /** Emojis rapides disponibles */
    quickReactions: string[];
}

/**
 * Hook pour gérer les réactions aux messages
 */
export function useReactions(options: UseReactionsOptions): UseReactionsReturn {
    const { conversationId, messageIds } = options;

    const [reactionsByMessage, setReactionsByMessage] = useState<Record<string, ReactionGroup[]>>({});
    const [rawReactionsByMessage, setRawReactionsByMessage] = useState<Record<string, Reaction[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Get current user
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setCurrentUserId(user.id);
            }
        });
    }, []);

    // Load reactions when message IDs change
    useEffect(() => {
        if (messageIds.length === 0 || !currentUserId) return;

        async function loadReactions() {
            try {
                setLoading(true);
                setError(null);

                const reactions = await getReactionsForMessages(messageIds);
                setRawReactionsByMessage(reactions);

                // Grouper les réactions
                const grouped: Record<string, ReactionGroup[]> = {};
                for (const [msgId, msgReactions] of Object.entries(reactions)) {
                    grouped[msgId] = groupReactions(msgReactions, currentUserId ?? '');
                }
                setReactionsByMessage(grouped);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load reactions');
                console.error('Error loading reactions:', err);
            } finally {
                setLoading(false);
            }
        }

        loadReactions();
    }, [messageIds.join(','), currentUserId]);

    // Subscribe to reaction changes
    useEffect(() => {
        if (!conversationId || !currentUserId) return;

        const unsubscribe = subscribeToReactions(conversationId, (messageId, reactions) => {
            setRawReactionsByMessage((prev) => ({
                ...prev,
                [messageId]: reactions,
            }));

            setReactionsByMessage((prev) => ({
                ...prev,
                [messageId]: groupReactions(reactions, currentUserId),
            }));
        });

        return unsubscribe;
    }, [conversationId, currentUserId]);

    // Toggle reaction
    const toggle = useCallback(async (messageId: string, emoji: string) => {
        if (!currentUserId) return;

        try {
            setError(null);

            // Optimistic update
            setReactionsByMessage((prev) => {
                const current = prev[messageId] || [];
                const existingGroup = current.find((g) => g.emoji === emoji);

                if (existingGroup?.isOwn) {
                    // Remove own reaction
                    return {
                        ...prev,
                        [messageId]: current
                            .map((g) =>
                                g.emoji === emoji
                                    ? { ...g, count: g.count - 1, isOwn: false }
                                    : g
                            )
                            .filter((g) => g.count > 0),
                    };
                } else if (existingGroup) {
                    // Add to existing group
                    return {
                        ...prev,
                        [messageId]: current.map((g) =>
                            g.emoji === emoji
                                ? { ...g, count: g.count + 1, isOwn: true }
                                : g
                        ),
                    };
                } else {
                    // Create new group
                    return {
                        ...prev,
                        [messageId]: [...current, { emoji, count: 1, users: [], isOwn: true }],
                    };
                }
            });

            // API call
            await toggleReaction(messageId, emoji);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle reaction');
            console.error('Error toggling reaction:', err);

            // Revert on error - reload reactions
            const reactions = await getReactionsForMessages([messageId]);
            if (reactions[messageId]) {
                setReactionsByMessage((prev) => ({
                    ...prev,
                    [messageId]: groupReactions(reactions[messageId], currentUserId!),
                }));
            }
        }
    }, [currentUserId]);

    return {
        reactionsByMessage,
        toggle,
        loading,
        error,
        quickReactions: QUICK_REACTIONS,
    };
}
