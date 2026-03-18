/**
 * services/imufeed/video-sharing.ts — S21 · Partage DM & Chat
 *
 * Service de partage de vidéos ImuFeed dans les conversations :
 * - Récupération des données VideoCard
 * - Envoi en DM / groupe
 * - Récupération des cibles de partage
 */

import { createLogger } from "@/services/logger";
import { supabase } from "@/services/supabase";
import type {
    ShareResult,
    ShareTarget,
    VideoCardData,
} from "@/types/video-sharing";

const logger = createLogger("VideoSharing");

/**
 * Récupère les données d'une vidéo pour créer une VideoCard.
 */
export async function fetchVideoCardData(
    videoId: string,
): Promise<VideoCardData | null> {
    try {
        const { data, error } = await supabase
            .from("imufeed_videos")
            .select(
                "id, video_url, thumbnail_url, caption, duration_ms, views_count, likes_count, comments_count, profiles(username, display_name, avatar_url)",
            )
            .eq("id", videoId)
            .single();

        if (error || !data) {
            logger.error(`Failed to fetch video card data: ${error?.message}`);
            return null;
        }

        const profile = data.profiles as unknown as {
            username: string;
            display_name: string | null;
            avatar_url: string | null;
        } | null;

        return {
            videoId: data.id,
            videoUrl: data.video_url,
            thumbnailUrl: data.thumbnail_url,
            caption: data.caption,
            durationMs: data.duration_ms,
            viewsCount: data.views_count,
            likesCount: data.likes_count,
            commentsCount: data.comments_count,
            author: {
                username: profile?.username ?? "unknown",
                displayName: profile?.display_name ?? null,
                avatarUrl: profile?.avatar_url ?? null,
            },
        };
    } catch (err) {
        logger.error(`fetchVideoCardData exception: ${err}`);
        return null;
    }
}

/**
 * Récupère les conversations disponibles comme cibles de partage.
 */
export async function fetchShareTargets(): Promise<ShareTarget[]> {
    try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return [];

        const { data, error } = await supabase
            .from("conversations")
            .select(
                "id, is_group, group_name, participants:conversation_participants(user_id, profile:profiles(username, avatar_url))",
            )
            .order("last_message_at", { ascending: false })
            .limit(50);

        if (error || !data) {
            logger.error(`Failed to fetch share targets: ${error?.message}`);
            return [];
        }

        return data.map((conv: Record<string, unknown>) => {
            const isGroup = conv.is_group as boolean;
            const participants = conv.participants as Array<{
                user_id: string;
                profile: { username: string; avatar_url: string | null } | null;
            }> | null;

            // Pour un DM, trouver l'autre participant
            const otherParticipant = participants?.find(
                (p) => p.user_id !== userData.user!.id,
            );

            return {
                conversationId: conv.id as string,
                type: isGroup ? "group" : "dm",
                displayName: isGroup
                    ? (conv.group_name as string) ?? "Groupe"
                    : otherParticipant?.profile?.username ?? "Utilisateur",
                avatarUrl: isGroup
                    ? null
                    : otherParticipant?.profile?.avatar_url ?? null,
            } as ShareTarget;
        });
    } catch (err) {
        logger.error(`fetchShareTargets exception: ${err}`);
        return [];
    }
}

/**
 * Envoie un partage vidéo dans une conversation.
 * Crée un message de type "video_card" avec metadata.
 */
export async function shareVideoToConversation(
    videoCard: VideoCardData,
    conversationId: string,
): Promise<ShareResult> {
    try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
            return { success: false, messageId: null, error: "Not authenticated" };
        }

        const { data, error } = await supabase.from("messages").insert({
            conversation_id: conversationId,
            sender_id: userData.user.id,
            content: null,
            media_url: videoCard.thumbnailUrl,
            media_type: "video_card",
            metadata: {
                type: "video_card",
                video_id: videoCard.videoId,
                video_url: videoCard.videoUrl,
                thumbnail_url: videoCard.thumbnailUrl,
                caption: videoCard.caption,
                author_username: videoCard.author.username,
                author_avatar_url: videoCard.author.avatarUrl,
                duration_ms: videoCard.durationMs,
                views_count: videoCard.viewsCount,
                likes_count: videoCard.likesCount,
            },
        }).select("id").single();

        if (error) {
            logger.error(`Share video failed: ${error.message}`);
            return { success: false, messageId: null, error: error.message };
        }

        // Incrémenter le compteur de partages
        await supabase.rpc("increment_share_count", { video_id: videoCard.videoId });

        return { success: true, messageId: data?.id ?? null, error: null };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error(`shareVideoToConversation exception: ${msg}`);
        return { success: false, messageId: null, error: msg };
    }
}

/**
 * Envoie un partage vidéo à plusieurs conversations.
 */
export async function shareVideoToMultiple(
    videoCard: VideoCardData,
    targets: ShareTarget[],
): Promise<ShareResult[]> {
    const results: ShareResult[] = [];
    for (const target of targets) {
        const result = await shareVideoToConversation(videoCard, target.conversationId);
        results.push(result);
    }
    return results;
}
