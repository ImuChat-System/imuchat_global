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
    sendTypingIndicator as sendTypingIndicatorToServer,
    subscribeToConversation,
    subscribeToConversations,
    subscribeToTypingIndicators,
} from '@/services/messaging';
import { supabase } from '@/services/supabase';
import { useCallback, useEffect, useRef, useState } from 'react';

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
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

    // Ref for typing timeout
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        async (content: string, mediaUrl?: string, mediaType?: string, targetConvId?: string) => {
            const convId = targetConvId || conversationId;
            const hasContent = content && content.trim().length > 0;
            const hasMedia = !!mediaUrl;

            if (!convId || (!hasContent && !hasMedia)) {
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
                    content: hasContent ? content.trim() : null,
                    media_url: mediaUrl || null,
                    media_type: mediaType || null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    deleted_at: null,
                    is_edited: false,
                };

                setMessages((prev) => [...prev, tempMessage]);

                // Send to backend
                const message = await sendMessageToDb(
                    convId,
                    hasContent ? content.trim() : '',
                    mediaUrl,
                    mediaType
                );

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
        let unsubscribeTyping: (() => void) | null = null;

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

            // Subscribe to typing indicators
            unsubscribeTyping = subscribeToTypingIndicators(
                conversationId,
                (userId, isTyping) => {
                    // Don't show typing indicator for current user
                    if (userId === currentUserId) return;

                    setTypingUsers((prev) => {
                        const newSet = new Set(prev);
                        if (isTyping) {
                            newSet.add(userId);
                        } else {
                            newSet.delete(userId);
                        }
                        return newSet;
                    });

                    // Auto-remove typing indicator after 5 seconds
                    if (isTyping) {
                        setTimeout(() => {
                            setTypingUsers((prev) => {
                                const newSet = new Set(prev);
                                newSet.delete(userId);
                                return newSet;
                            });
                        }, 5000);
                    }
                }
            );
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
            if (unsubscribeTyping) {
                unsubscribeTyping();
            }
        };
    }, [conversationId, autoLoad, loadConversations, currentUserId]);

    // Send typing indicator (debounced)
    const sendTypingIndicator = useCallback(() => {
        if (!conversationId) return;

        // Send "typing" signal
        sendTypingIndicatorToServer(conversationId, true);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to send "not typing" after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingIndicatorToServer(conversationId, false);
        }, 3000);
    }, [conversationId]);

    return {
        // State
        conversations,
        messages,
        loading,
        sending,
        error,
        currentUserId,
        typingUsers,

        // Actions
        loadConversations,
        loadMessages,
        sendMessage,
        markAsRead: markConversationAsRead,
        sendTypingIndicator,

        // Utils
        setConversations,
        setMessages,
    };
}
