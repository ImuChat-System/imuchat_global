/**
 * useChat Hook - Mobile
 * Hook React pour gérer les conversations et messages avec Supabase Realtime
 * Includes offline support with message queue
 */

import { useNetworkState } from '@/hooks/useNetworkState';
import {
    Conversation,
    copyMessageToClipboard,
    deleteMessage as deleteMessageInDb,
    editMessage as editMessageInDb,
    getConversations as fetchConversations,
    getMessages as fetchMessages,
    forwardMessage as forwardMessageInDb,
    getOthersLastReadAt,
    markConversationAsRead,
    Message,
    sendMessage as sendMessageToDb,
    sendTypingIndicator as sendTypingIndicatorToServer,
    subscribeToConversation,
    subscribeToConversations,
    subscribeToTypingIndicators,
} from '@/services/messaging';
import {
    addPendingMessage,
    cleanExpiredMessages,
    getPendingCount,
    getPendingMessagesForConversation,
    PendingMessage,
    removePendingMessage,
} from '@/services/offline-queue';
import { supabase } from '@/services/supabase';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseChatOptions {
    conversationId?: string;
    autoLoad?: boolean;
}

export function useChat(options: UseChatOptions = {}) {
    const { conversationId, autoLoad = true } = options;

    // Network state
    const { isConnected, isInternetReachable } = useNetworkState();
    const isOnline = isConnected !== false && isInternetReachable !== false;

    // State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
    const [pendingMessagesCount, setPendingMessagesCount] = useState(0);
    const [othersLastReadAt, setOthersLastReadAt] = useState<string | null>(null);

    // Ref for typing timeout
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wasOfflineRef = useRef(false);

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
                // Load read receipts from other participants
                const lastRead = await getOthersLastReadAt(targetConvId);
                setOthersLastReadAt(lastRead);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load messages');
                console.error('Error loading messages:', err);
            } finally {
                setLoading(false);
            }
        },
        [conversationId]
    );

    // Send message (with offline queue support)
    const sendMessage = useCallback(
        async (content: string, mediaUrl?: string, mediaType?: string, targetConvId?: string) => {
            const convId = targetConvId || conversationId;
            const hasContent = content && content.trim().length > 0;
            const hasMedia = !!mediaUrl;

            if (!convId || (!hasContent && !hasMedia)) {
                return null;
            }

            // Get reply info before clearing
            const replyingTo = replyToMessage;

            // Clear reply state
            setReplyToMessage(null);

            // Create temp/optimistic message
            const tempId = `temp-${Date.now()}`;
            const tempMessage: Message = {
                id: tempId,
                conversation_id: convId,
                sender_id: currentUserId || '',
                content: hasContent ? content.trim() : null,
                media_url: mediaUrl || null,
                media_type: mediaType || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                is_edited: false,
                reply_to_id: replyingTo?.id || null,
                replied_message: replyingTo ? {
                    id: replyingTo.id,
                    content: replyingTo.content,
                    sender_id: replyingTo.sender_id,
                    sender: replyingTo.sender ? {
                        username: replyingTo.sender.username,
                        display_name: replyingTo.sender.display_name,
                    } : undefined,
                } : null,
            };

            // Add optimistic message
            setMessages((prev) => [...prev, tempMessage]);

            // If offline, queue the message
            if (!isOnline) {
                console.log('[useChat] Offline - queuing message');
                const pendingMsg: PendingMessage = {
                    id: tempId,
                    content: hasContent ? content.trim() : '',
                    senderId: currentUserId || '',
                    senderName: '', // Will be filled by sender info
                    conversationId: convId,
                    type: mediaType?.startsWith('image') ? 'image' : mediaType ? 'file' : 'text',
                    replyToId: replyingTo?.id,
                    mediaUrl,
                    mediaType: mediaType || undefined,
                    queuedAt: Date.now(),
                };
                await addPendingMessage(pendingMsg);
                const count = await getPendingCount();
                setPendingMessagesCount(count);
                return tempMessage; // Return optimistic message
            }

            // Online - send normally
            try {
                setSending(true);
                setError(null);

                const message = await sendMessageToDb(
                    convId,
                    hasContent ? content.trim() : '',
                    mediaUrl,
                    mediaType,
                    replyingTo?.id
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
        [conversationId, currentUserId, isOnline, replyToMessage]
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

    // Edit message
    const editMessage = useCallback(
        async (messageId: string, newContent: string): Promise<boolean> => {
            try {
                setError(null);
                const updatedMessage = await editMessageInDb(messageId, newContent);

                // Update optimistically in local state
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === messageId
                            ? { ...m, content: updatedMessage.content, is_edited: true }
                            : m
                    )
                );

                return true;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to edit message');
                console.error('Error editing message:', err);
                return false;
            }
        },
        []
    );

    // Delete message
    const deleteMessage = useCallback(
        async (messageId: string): Promise<boolean> => {
            try {
                setError(null);
                await deleteMessageInDb(messageId);

                // Update optimistically in local state (soft delete state)
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === messageId
                            ? { ...m, deleted_at: new Date().toISOString(), content: null }
                            : m
                    )
                );

                return true;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete message');
                console.error('Error deleting message:', err);
                return false;
            }
        },
        []
    );

    // Copy message to clipboard
    const copyMessage = useCallback(async (content: string): Promise<boolean> => {
        try {
            await copyMessageToClipboard(content);
            return true;
        } catch (err) {
            console.error('Error copying message:', err);
            return false;
        }
    }, []);

    // Forward message to another conversation
    const forwardMessage = useCallback(async (
        targetConversationId: string,
        messageText: string,
        originalMessageId: string
    ): Promise<Message | null> => {
        try {
            setSending(true);
            setError(null);
            const message = await forwardMessageInDb(
                targetConversationId,
                messageText,
                originalMessageId
            );
            return message;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to forward message');
            console.error('Error forwarding message:', err);
            return null;
        } finally {
            setSending(false);
        }
    }, []);

    // Flush pending messages when coming back online
    const flushPendingMessages = useCallback(async () => {
        if (!conversationId) return;

        const pending = await getPendingMessagesForConversation(conversationId);
        console.log(`[useChat] Flushing ${pending.length} pending messages`);

        for (const msg of pending) {
            try {
                const sentMessage = await sendMessageToDb(
                    msg.conversationId,
                    msg.content,
                    msg.mediaUrl,
                    msg.mediaType,
                    msg.replyToId
                );

                // Replace temp message with real one
                setMessages((prev) =>
                    prev.map((m) => (m.id === msg.id ? sentMessage : m))
                );

                await removePendingMessage(msg.id);
            } catch (err) {
                console.error('[useChat] Failed to send queued message:', msg.id, err);
            }
        }

        const count = await getPendingCount();
        setPendingMessagesCount(count);
    }, [conversationId]);

    // Watch for reconnection
    useEffect(() => {
        if (isOnline && wasOfflineRef.current) {
            console.log('[useChat] Back online - flushing queue');
            flushPendingMessages();
        }
        wasOfflineRef.current = !isOnline;
    }, [isOnline, flushPendingMessages]);

    // Clean expired messages on mount
    useEffect(() => {
        cleanExpiredMessages();
        getPendingCount().then(setPendingMessagesCount);
    }, []);

    // Helper function to check if a message has been read by recipients
    const isMessageRead = useCallback(
        (message: Message): boolean => {
            if (!othersLastReadAt) return false;
            return new Date(message.created_at) <= new Date(othersLastReadAt);
        },
        [othersLastReadAt]
    );

    return {
        // State
        conversations,
        messages,
        loading,
        sending,
        error,
        currentUserId,
        typingUsers,
        replyToMessage,
        othersLastReadAt,

        // Offline state
        isOnline,
        pendingMessagesCount,

        // Actions
        loadConversations,
        loadMessages,
        sendMessage,
        markAsRead: markConversationAsRead,
        sendTypingIndicator,
        editMessage,
        deleteMessage,
        copyMessage,
        forwardMessage,
        setReplyToMessage,
        flushPendingMessages,

        // Utils
        setConversations,
        setMessages,
        isMessageRead,
    };
}
