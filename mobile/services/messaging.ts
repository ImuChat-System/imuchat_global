import { getCurrentUser, supabase } from "./supabase";

// Types
export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string | null;
    media_url: string | null;
    media_type: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    is_edited: boolean;
    reply_to_id: string | null;
    forwarded_from_id?: string | null;
    metadata?: {
        forwarded_from_id?: string;
        [key: string]: unknown;
    };
    sender?: {
        id: string;
        username: string;
        avatar_url: string;
        display_name: string;
    };
    replied_message?: {
        id: string;
        content: string | null;
        sender_id: string;
        sender?: {
            username: string;
            display_name: string;
        };
    } | null;
}

export interface Conversation {
    id: string;
    created_at: string;
    updated_at: string;
    last_message_at: string | null;
    is_group: boolean;
    group_name: string | null;
    group_avatar_url: string | null;
    last_message?: Message;
    participants?: ConversationParticipant[];
    unread_count?: number;
}

export interface ConversationParticipant {
    id: string;
    conversation_id: string;
    user_id: string;
    joined_at: string;
    last_read_at: string | null;
    profile?: {
        id: string;
        username: string;
        avatar_url: string;
        display_name: string;
    };
}

/**
 * Fetch all conversations for the current user
 */
export async function getConversations() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("No authenticated user");
    }

    const { data, error } = await supabase
        .from("conversations")
        .select(`
      *,
      conversation_participants(
        user_id,
        last_read_at,
        profiles(id, username, avatar_url, display_name)
      ),
      messages(
        id,
        content,
        created_at,
        sender_id,
        profiles(id, username, avatar_url, display_name)
      )
    `)
        .order("last_message_at", { ascending: false, nullsFirst: false });

    if (error) {
        throw error;
    }

    // Get the latest message for each conversation
    const conversations = data?.map((conv: any) => {
        const messages = conv.messages || [];
        const lastMessage = messages.length > 0 ? messages[0] : null;

        return {
            ...conv,
            last_message: lastMessage,
            participants: conv.participants || [],
        };
    });

    return conversations as Conversation[];
}

/**
 * Fetch messages for a specific conversation
 */
export async function getMessages(conversationId: string, limit = 50) {
    const { data, error } = await supabase
        .from("messages")
        .select(`
      *,
      sender:profiles(id, username, avatar_url, display_name),
      replied_message:messages!reply_to_id(
        id,
        content,
        sender_id,
        sender:profiles(username, display_name)
      )
    `)
        .eq("conversation_id", conversationId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        throw error;
    }

    return (data || []).reverse() as Message[];
}

/**
 * Send a new message to a conversation
 */
export async function sendMessage(
    conversationId: string,
    content: string,
    mediaUrl?: string,
    mediaType?: string,
    replyToId?: string,
    forwardedFromId?: string
) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("No authenticated user");
    }

    const metadata = forwardedFromId ? { forwarded_from_id: forwardedFromId } : {};

    const { data, error } = await supabase
        .from("messages")
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content,
            media_url: mediaUrl || null,
            media_type: mediaType || null,
            reply_to_id: replyToId || null,
            metadata,
        })
        .select(`
      *,
      sender:profiles(id, username, avatar_url, display_name),
      replied_message:messages!reply_to_id(
        id,
        content,
        sender_id,
        sender:profiles(username, display_name)
      )
    `)
        .single();

    if (error) {
        throw error;
    }

    return data as Message;
}

/**
 * Forward a message to another conversation
 */
export async function forwardMessage(
    targetConversationId: string,
    messageText: string,
    originalMessageId: string
) {
    return sendMessage(
        targetConversationId,
        messageText,
        undefined,
        undefined,
        undefined,
        originalMessageId
    );
}

/**
 * Create a new conversation with participants
 */
export async function createConversation(
    participantIds: string[],
    isGroup = false,
    groupName?: string
) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("No authenticated user");
    }

    // Include current user in participants
    const allParticipants = [...new Set([user.id, ...participantIds])];

    // Create conversation
    const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({
            is_group: isGroup,
            group_name: groupName || null,
        })
        .select()
        .single();

    if (convError) {
        throw convError;
    }

    // Add participants
    const participantsData = allParticipants.map((userId) => ({
        conversation_id: conversation.id,
        user_id: userId,
    }));

    const { error: participantsError } = await supabase
        .from("conversation_participants")
        .insert(participantsData);

    if (participantsError) {
        throw participantsError;
    }

    return conversation as Conversation;
}

/**
 * Subscribe to new messages in a conversation
 */
export function subscribeToConversation(
    conversationId: string,
    onMessage: (message: Message) => void
) {
    const channel = supabase
        .channel(`conversation:${conversationId}`)
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "messages",
                filter: `conversation_id=eq.${conversationId}`,
            },
            async (payload) => {
                // Fetch the full message with sender profile
                const { data } = await supabase
                    .from("messages")
                    .select(`
            *,
            sender:profiles(id, username, avatar_url, display_name)
          `)
                    .eq("id", payload.new.id)
                    .single();

                if (data) {
                    onMessage(data as Message);
                }
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

/**
 * Subscribe to conversation list updates
 */
export function subscribeToConversations(
    onUpdate: () => void
) {
    const channel = supabase
        .channel("conversations-updates")
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "conversations",
            },
            () => {
                onUpdate();
            }
        )
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "messages",
            },
            () => {
                onUpdate();
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

/**
 * Mark conversation as read
 */
export async function markConversationAsRead(conversationId: string) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("No authenticated user");
    }

    const { error } = await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);

    if (error) {
        throw error;
    }
}

/**
 * Get the latest read timestamp from other participants in a conversation
 * Used to determine if messages have been read by recipients
 */
export async function getOthersLastReadAt(conversationId: string): Promise<string | null> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("No authenticated user");
    }

    const { data, error } = await supabase
        .from("conversation_participants")
        .select("last_read_at")
        .eq("conversation_id", conversationId)
        .neq("user_id", user.id)
        .order("last_read_at", { ascending: false, nullsFirst: false })
        .limit(1)
        .single();

    if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows found
        console.error("Error fetching others last read:", error);
        return null;
    }

    return data?.last_read_at || null;
}

/**
 * Send typing indicator for a conversation
 */
export async function sendTypingIndicator(
    conversationId: string,
    isTyping: boolean = true
) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("No authenticated user");
    }

    const channel = supabase.channel(`conversation:${conversationId}`);

    await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
            user_id: user.id,
            is_typing: isTyping,
            timestamp: Date.now(),
        },
    });
}

/**
 * Subscribe to typing indicators for a conversation
 */
export function subscribeToTypingIndicators(
    conversationId: string,
    onTyping: (userId: string, isTyping: boolean) => void
) {
    const channel = supabase
        .channel(`conversation:${conversationId}`)
        .on('broadcast', { event: 'typing' }, (payload: any) => {
            const { user_id, is_typing } = payload.payload;
            onTyping(user_id, is_typing);
        })
        .subscribe();

    return () => {
        channel.unsubscribe();
    };
}

/**
 * Edit a message content
 * @param messageId - The ID of the message to edit
 * @param newContent - The new content for the message
 * @returns The updated message
 */
export async function editMessage(messageId: string, newContent: string): Promise<Message> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("No authenticated user");
    }

    // First verify the user owns this message
    const { data: existing, error: fetchError } = await supabase
        .from("messages")
        .select("*")
        .eq("id", messageId)
        .single();

    if (fetchError || !existing) {
        throw new Error("Message not found");
    }

    if (existing.sender_id !== user.id) {
        throw new Error("Cannot edit someone else's message");
    }

    // Check if message is within edit time limit (15 minutes)
    const createdAt = new Date(existing.created_at).getTime();
    const now = Date.now();
    const EDIT_TIME_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

    if (now - createdAt > EDIT_TIME_LIMIT_MS) {
        throw new Error("Edit time limit exceeded (15 minutes)");
    }

    const { data, error } = await supabase
        .from("messages")
        .update({
            content: newContent,
            is_edited: true,
            updated_at: new Date().toISOString(),
        })
        .eq("id", messageId)
        .select("*")
        .single();

    if (error) {
        throw error;
    }

    return data as Message;
}

/**
 * Soft delete a message (marks as deleted, doesn't remove from DB)
 * @param messageId - The ID of the message to delete
 * @returns Success status
 */
export async function deleteMessage(messageId: string): Promise<boolean> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("No authenticated user");
    }

    // First verify the user owns this message
    const { data: existing, error: fetchError } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("id", messageId)
        .single();

    if (fetchError || !existing) {
        throw new Error("Message not found");
    }

    if (existing.sender_id !== user.id) {
        throw new Error("Cannot delete someone else's message");
    }

    const { error } = await supabase
        .from("messages")
        .update({
            deleted_at: new Date().toISOString(),
            content: null, // Clear content on delete
        })
        .eq("id", messageId);

    if (error) {
        throw error;
    }

    return true;
}

/**
 * Copy message content to clipboard
 */
export async function copyMessageToClipboard(content: string): Promise<void> {
    const { default: Clipboard } = await import('expo-clipboard');
    await Clipboard.setStringAsync(content);
}

// ============================================
// SEARCH FUNCTIONS
// ============================================

export interface SearchResult {
    conversations: Conversation[];
    messages: Message[];
}

/**
 * Search conversations by name or participant username
 */
export async function searchConversations(
    query: string,
    limit: number = 10
): Promise<Conversation[]> {
    const user = await getCurrentUser();
    if (!user) throw new Error("No authenticated user");

    const q = query.toLowerCase().trim();
    if (!q) return [];

    // Search in group names and participant usernames
    const { data, error } = await supabase
        .from("conversations")
        .select(`
            *,
            conversation_participants!inner(
                user_id,
                last_read_at,
                profiles(id, username, avatar_url, display_name)
            )
        `)
        .or(`group_name.ilike.%${q}%`)
        .limit(limit);

    if (error) {
        console.error("[searchConversations] Error:", error);
        throw error;
    }

    // Also search by participant name (client-side filter)
    const results = (data || []).filter((conv: any) => {
        // Check group name
        if (conv.group_name?.toLowerCase().includes(q)) return true;

        // Check participant names
        const participants = conv.conversation_participants || [];
        return participants.some((p: any) =>
            p.profiles?.username?.toLowerCase().includes(q) ||
            p.profiles?.display_name?.toLowerCase().includes(q)
        );
    });

    return results.map((conv: any) => ({
        ...conv,
        participants: conv.conversation_participants?.map((p: any) => ({
            ...p,
            profile: p.profiles,
        })),
    }));
}

/**
 * Search messages by content (full-text search)
 */
export async function searchMessages(
    query: string,
    options: { conversationId?: string; limit?: number } = {}
): Promise<Message[]> {
    const user = await getCurrentUser();
    if (!user) throw new Error("No authenticated user");

    const q = query.trim();
    if (!q) return [];

    const { conversationId, limit = 20 } = options;

    let queryBuilder = supabase
        .from("messages")
        .select(`
            *,
            sender:profiles!messages_sender_id_fkey(id, username, avatar_url, display_name)
        `)
        .ilike("content", `%${q}%`)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (conversationId) {
        queryBuilder = queryBuilder.eq("conversation_id", conversationId);
    }

    const { data, error } = await queryBuilder;

    if (error) {
        console.error("[searchMessages] Error:", error);
        throw error;
    }

    return (data || []).map((msg: any) => ({
        ...msg,
        sender: msg.sender,
    }));
}

/**
 * Combined search for conversations and messages
 */
export async function globalSearch(
    query: string,
    options: { conversationLimit?: number; messageLimit?: number } = {}
): Promise<SearchResult> {
    const { conversationLimit = 10, messageLimit = 20 } = options;

    const [conversations, messages] = await Promise.all([
        searchConversations(query, conversationLimit),
        searchMessages(query, { limit: messageLimit }),
    ]);

    return { conversations, messages };
}

/**
 * Archive a conversation (soft delete - marks as archived)
 * @param conversationId The conversation to archive
 */
export async function archiveConversation(conversationId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error("No authenticated user");

    // Update the participant's record to mark as archived
    const { error } = await supabase
        .from("conversation_participants")
        .update({ archived_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);

    if (error) {
        console.error("[archiveConversation] Error:", error);
        throw error;
    }

    console.log("✅ Conversation archived:", conversationId);
}

/**
 * Unarchive a conversation
 * @param conversationId The conversation to unarchive
 */
export async function unarchiveConversation(conversationId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error("No authenticated user");

    const { error } = await supabase
        .from("conversation_participants")
        .update({ archived_at: null })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);

    if (error) {
        console.error("[unarchiveConversation] Error:", error);
        throw error;
    }

    console.log("✅ Conversation unarchived:", conversationId);
}

/**
 * Mute/unmute a conversation
 * @param conversationId The conversation to mute/unmute
 * @param muted Whether to mute or unmute
 */
export async function muteConversation(conversationId: string, muted: boolean): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error("No authenticated user");

    const { error } = await supabase
        .from("conversation_participants")
        .update({ muted_until: muted ? "2099-12-31T23:59:59Z" : null })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);

    if (error) {
        console.error("[muteConversation] Error:", error);
        throw error;
    }

    console.log(`✅ Conversation ${muted ? "muted" : "unmuted"}:`, conversationId);
}

/**
 * Delete a conversation (leaves the conversation)
 * @param conversationId The conversation to delete/leave
 */
export async function deleteConversation(conversationId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error("No authenticated user");

    // Remove user from conversation participants
    const { error } = await supabase
        .from("conversation_participants")
        .delete()
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);

    if (error) {
        console.error("[deleteConversation] Error:", error);
        throw error;
    }

    console.log("✅ Left conversation:", conversationId);
}

