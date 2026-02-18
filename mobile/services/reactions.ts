/**
 * Service de gestion des réactions aux messages
 * Utilise Supabase pour stocker et récupérer les réactions emoji
 */

import { getCurrentUser, supabase } from './supabase';

// Types
export interface Reaction {
    id: string;
    message_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
    user?: {
        id: string;
        username: string;
        avatar_url: string;
    };
}

export interface ReactionGroup {
    emoji: string;
    count: number;
    users: string[];
    isOwn: boolean;
}

/**
 * Récupérer les réactions pour un message
 */
export async function getReactionsForMessage(messageId: string): Promise<Reaction[]> {
    const { data, error } = await supabase
        .from('message_reactions')
        .select(`
            id,
            message_id,
            user_id,
            emoji,
            created_at,
            user:profiles(id, username, avatar_url)
        `)
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching reactions:', error);
        throw error;
    }

    return data as unknown as Reaction[];
}

/**
 * Récupérer les réactions pour plusieurs messages (batch)
 */
export async function getReactionsForMessages(messageIds: string[]): Promise<Record<string, Reaction[]>> {
    if (messageIds.length === 0) return {};

    const { data, error } = await supabase
        .from('message_reactions')
        .select(`
            id,
            message_id,
            user_id,
            emoji,
            created_at,
            user:profiles(id, username, avatar_url)
        `)
        .in('message_id', messageIds)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching batch reactions:', error);
        throw error;
    }

    // Grouper par message_id
    const grouped: Record<string, Reaction[]> = {};
    for (const reaction of data || []) {
        if (!grouped[reaction.message_id]) {
            grouped[reaction.message_id] = [];
        }
        grouped[reaction.message_id].push(reaction as unknown as Reaction);
    }

    return grouped;
}

/**
 * Ajouter une réaction à un message
 */
export async function addReaction(messageId: string, emoji: string): Promise<Reaction> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('No authenticated user');
    }

    const { data, error } = await supabase
        .from('message_reactions')
        .insert({
            message_id: messageId,
            user_id: user.id,
            emoji,
        })
        .select(`
            id,
            message_id,
            user_id,
            emoji,
            created_at
        `)
        .single();

    if (error) {
        // Si doublon, on toggle (supprime)
        if (error.code === '23505') {
            return removeReaction(messageId, emoji);
        }
        console.error('Error adding reaction:', error);
        throw error;
    }

    return data as Reaction;
}

/**
 * Supprimer une réaction d'un message
 */
export async function removeReaction(messageId: string, emoji: string): Promise<Reaction> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('No authenticated user');
    }

    const { data, error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .select()
        .single();

    if (error) {
        console.error('Error removing reaction:', error);
        throw error;
    }

    return data as Reaction;
}

/**
 * Toggle une réaction (ajouter si n'existe pas, supprimer si existe)
 */
export async function toggleReaction(messageId: string, emoji: string): Promise<{ added: boolean; reaction?: Reaction }> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('No authenticated user');
    }

    // Vérifier si la réaction existe déjà
    const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single();

    if (existing) {
        await removeReaction(messageId, emoji);
        return { added: false };
    } else {
        const reaction = await addReaction(messageId, emoji);
        return { added: true, reaction };
    }
}

/**
 * Grouper les réactions par emoji avec compteur
 */
export function groupReactions(reactions: Reaction[], currentUserId: string): ReactionGroup[] {
    const groups: Record<string, ReactionGroup> = {};

    for (const reaction of reactions) {
        if (!groups[reaction.emoji]) {
            groups[reaction.emoji] = {
                emoji: reaction.emoji,
                count: 0,
                users: [],
                isOwn: false,
            };
        }

        groups[reaction.emoji].count++;
        if (reaction.user?.username) {
            groups[reaction.emoji].users.push(reaction.user.username);
        }
        if (reaction.user_id === currentUserId) {
            groups[reaction.emoji].isOwn = true;
        }
    }

    return Object.values(groups);
}

/**
 * Subscribe aux changements de réactions pour une conversation
 */
export function subscribeToReactions(
    conversationId: string,
    onReactionChange: (messageId: string, reactions: Reaction[]) => void
): () => void {
    const channel = supabase
        .channel(`reactions:${conversationId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'message_reactions',
            },
            async (payload) => {
                const messageId = (payload.new as any)?.message_id || (payload.old as any)?.message_id;
                if (messageId) {
                    // Recharger toutes les réactions pour ce message
                    const reactions = await getReactionsForMessage(messageId);
                    onReactionChange(messageId, reactions);
                }
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

// Emojis rapides par défaut pour ImuChat
export const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];
