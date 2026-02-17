import { supabase } from "./supabase";

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
    sender?: {
        id: string;
        username: string;
        avatar_url: string;
        full_name: string;
    };
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
        full_name: string;
    };
}

/**
 * Fetch all conversations for the current user
 */
export async function getConversations() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("No authenticated user");
    }

    const { data, error } = await supabase
        .from("conversations")
        .select(`
      *,
      participants:conversation_participants(
        *,
        profile:profiles(id, username, avatar_url, full_name)
      ),
      messages(
        id,
        content,
        created_at,
        sender_id,
        sender:profiles(id, username, avatar_url, full_name)
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
      sender:profiles(id, username, avatar_url, full_name)
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
    mediaType?: string
) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("No authenticated user");
    }

    const { data, error } = await supabase
        .from("messages")
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content,
            media_url: mediaUrl || null,
            media_type: mediaType || null,
        })
        .select(`
      *,
      sender:profiles(id, username, avatar_url, full_name)
    `)
        .single();

    if (error) {
        throw error;
    }

    return data as Message;
}

/**
 * Create a new conversation with participants
 */
export async function createConversation(
    participantIds: string[],
    isGroup = false,
    groupName?: string
) {
    const { data: { user } } = await supabase.auth.getUser();

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
            sender:profiles(id, username, avatar_url, full_name)
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
    const { data: { user } } = await supabase.auth.getUser();

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
 * Send typing indicator for a conversation
 */
export async function sendTypingIndicator(
    conversationId: string,
    isTyping: boolean = true
) {
    const { data: { user } } = await supabase.auth.getUser();

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
