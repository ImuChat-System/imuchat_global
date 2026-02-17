/**
 * useChat Hook - Mobile
 * Hook React pour gérer les conversations et messages avec Supabase Realtime
 */

import {
    Conversation,
    Message,
    getConversations as fetchConversations,
    getMessages as fetchMessages,
    markConversationAsRead,
    sendMessage as sendMessageToDb,
    subscribeToConversation,
    subscribeToConversations,
} from '@/services/messaging';
import { supabase } from '@/services/supabase';
import { useCallback, useEffect, useState } from 'react';

export interface UseChatOptions {
    conversationId?: string;
    autoLoad?: boolean;
}

export function useChat(options: UseChatOptions = {}) {
    const { conversationId, autoLoad = true } = options;

    // State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
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

    // Load conversations
    const loadConversations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchConversations();
            setConversations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load conversations');
            console.error('Error loading conversations:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load messages for a conversation
    const loadMessages = useCallback(
        async (convId?: string) => {
            const targetConvId = convId || conversationId;
            if (!targetConvId) return;

            try {
                setLoading(true);
                setError(null);
                const data = await fetchMessages(targetConvId);
                setMessages(data);
                await markConversationAsRead(targetConvId);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load messages');
                console.error('Error loading messages:', err);
            } finally {
                setLoading(false);
            }
        },
        [conversationId]
    );

    // Send message
    const sendMessage = useCallback(
        async (content: string, targetConvId?: string) => {
            const convId = targetConvId || conversationId;
            if (!convId || !content.trim()) {
                return null;
            }

            try {
                setSending(true);
                setError(null);

                // Optimistic update
                const tempMessage: Message = {
                    id: `temp-${Date.now()}`,
                    conversation_id: convId,
                    sender_id: currentUserId || '',
                    content: content.trim(),
                    media_url: null,
                    media_type: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    deleted_at: null,
                    is_edited: false,
                };

                setMessages((prev) => [...prev, tempMessage]);

                // Send to backend
                const message = await sendMessageToDb(convId, content.trim());

                // Replace temp message with real one
                setMessages((prev) =>
                    prev.map((m) => (m.id === tempMessage.id ? message : m))
                );

                return message;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to send message');
                console.error('Error sending message:', err);
                // Remove temp message on error
                setMessages((prev) =>
                    prev.filter((m) => !m.id.startsWith('temp-'))
                );
                return null;
            } finally {
                setSending(false);
            }
        },
        [conversationId, currentUserId]
    );

    // Auto-load conversations on mount
    useEffect(() => {
        if (autoLoad && !conversationId) {
            loadConversations();
        }
    }, [autoLoad, conversationId, loadConversations]);

    // Auto-load messages when conversationId changes
    useEffect(() => {
        if (autoLoad && conversationId) {
            loadMessages(conversationId);
        }
    }, [autoLoad, conversationId, loadMessages]);

    // Subscribe to conversation updates
    useEffect(() => {
        if (!autoLoad) return;

        let unsubscribe: (() => void) | null = null;

        if (conversationId) {
            // Subscribe to specific conversation
            unsubscribe = subscribeToConversation(conversationId, (newMessage) => {
                setMessages((prev) => {
                    // Avoid duplicates
                    if (prev.some((m) => m.id === newMessage.id)) {
                        return prev;
                    }
                    return [...prev, newMessage];
                });
            });
        } else {
            // Subscribe to all conversations
            unsubscribe = subscribeToConversations(() => {
                loadConversations();
            });
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [conversationId, autoLoad, loadConversations]);

    return {
        // State
        conversations,
        messages,
        loading,
        sending,
        error,
        currentUserId,

        // Actions
        loadConversations,
        loadMessages,
        sendMessage,
        markAsRead: markConversationAsRead,

        // Utils
        setConversations,
        setMessages,
    };
}
