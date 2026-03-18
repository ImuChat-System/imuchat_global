/**
 * Service Watch Party Social — Sprint S22
 * API calls : watch party ImuFeed, file d'attente, cross-post, thread, story republish.
 */

import { supabase } from "@/services/supabase";
import type { ImuFeedVideo } from "@/types/imufeed";
import type {
    CrossPostResult,
    CrossPostTarget,
    QueueAddResult,
    QueueItem,
    StoryRepublishOptions,
    StoryRepublishResult,
    VideoThread,
    VideoThreadCreateResult,
    WatchPartyParticipant,
} from "@/types/watch-party-social";

// ─── Watch Party ────────────────────────────────────────────

/** Rejoindre une Watch Party et récupérer les participants */
export async function joinWatchParty(
    partyId: string,
    userId: string,
): Promise<{ participants: WatchPartyParticipant[] }> {
    // Inscrit le user comme participant
    const { error: joinError } = await supabase
        .from("watch_party_participants")
        .upsert({ party_id: partyId, user_id: userId, joined_at: new Date().toISOString() });

    if (joinError) throw new Error(joinError.message);

    // Récupère la liste à jour
    const { data, error } = await supabase
        .from("watch_party_participants")
        .select("user_id, username, avatar_url, joined_at, is_host, is_co_host")
        .eq("party_id", partyId)
        .order("joined_at", { ascending: true });

    if (error) throw new Error(error.message);

    return {
        participants: (data ?? []).map((p) => ({
            userId: p.user_id,
            username: p.username,
            avatarUrl: p.avatar_url,
            joinedAt: p.joined_at,
            isHost: p.is_host ?? false,
            isCoHost: p.is_co_host ?? false,
        })),
    };
}

/** Quitter une Watch Party */
export async function leaveWatchParty(
    partyId: string,
    userId: string,
): Promise<void> {
    const { error } = await supabase
        .from("watch_party_participants")
        .delete()
        .eq("party_id", partyId)
        .eq("user_id", userId);

    if (error) throw new Error(error.message);
}

// ─── File d'attente collaborative ───────────────────────────

/** Charger la file d'attente d'une watch party */
export async function fetchPartyQueue(partyId: string): Promise<QueueItem[]> {
    const { data, error } = await supabase
        .from("watch_party_queue")
        .select("id, video_id, added_by, added_by_username, added_at, upvotes, video:imufeed_videos(*)")
        .eq("party_id", partyId)
        .order("upvotes", { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((item) => ({
        id: item.id,
        video: item.video as unknown as ImuFeedVideo,
        addedBy: item.added_by,
        addedByUsername: item.added_by_username,
        addedAt: item.added_at,
        upvotes: item.upvotes ?? 0,
        hasVoted: false,
    }));
}

/** Ajouter une vidéo à la file */
export async function addVideoToQueue(
    partyId: string,
    video: ImuFeedVideo,
    userId: string,
    username: string,
): Promise<QueueAddResult> {
    const { data, error } = await supabase
        .from("watch_party_queue")
        .insert({
            party_id: partyId,
            video_id: video.id,
            added_by: userId,
            added_by_username: username,
        })
        .select("id, added_at")
        .single();

    if (error) return { success: false, error: error.message };

    return {
        success: true,
        item: {
            id: data.id,
            video,
            addedBy: userId,
            addedByUsername: username,
            addedAt: data.added_at,
            upvotes: 0,
            hasVoted: false,
        },
    };
}

/** Voter pour un item de la queue */
export async function voteQueueItem(itemId: string): Promise<void> {
    const { error } = await supabase.rpc("increment_queue_upvote", {
        p_item_id: itemId,
    });
    if (error) throw new Error(error.message);
}

// ─── Cross-post communauté ──────────────────────────────────

/** Récupérer les guildes/communautés disponibles pour cross-post */
export async function fetchCrossPostTargets(): Promise<CrossPostTarget[]> {
    const { data, error } = await supabase
        .from("guilds")
        .select("id, name, icon_url, member_count")
        .order("member_count", { ascending: false })
        .limit(50);

    if (error) throw new Error(error.message);

    return (data ?? []).map((g) => ({
        id: g.id,
        name: g.name,
        type: "guild" as const,
        iconUrl: g.icon_url,
        memberCount: g.member_count ?? 0,
    }));
}

/** Cross-poster une vidéo vers une cible */
export async function crossPostVideo(
    videoId: string,
    target: CrossPostTarget,
): Promise<CrossPostResult> {
    const { data, error } = await supabase
        .from("cross_posts")
        .insert({
            video_id: videoId,
            target_id: target.id,
            target_type: target.type,
        })
        .select("id")
        .single();

    if (error) {
        return { success: false, targetId: target.id, targetType: target.type, error: error.message };
    }

    return { success: true, postId: data.id, targetId: target.id, targetType: target.type };
}

// ─── Vidéo → Thread ─────────────────────────────────────────

/** Créer un thread de discussion à partir des commentaires d'une vidéo */
export async function createVideoThread(
    videoId: string,
    channelId: string,
    userId: string,
): Promise<VideoThreadCreateResult> {
    const { data, error } = await supabase
        .from("video_threads")
        .insert({
            video_id: videoId,
            channel_id: channelId,
            created_by: userId,
        })
        .select("id, video_id, title, channel_id, message_count, created_at, created_by")
        .single();

    if (error) return { success: false, error: error.message };

    const thread: VideoThread = {
        id: data.id,
        videoId: data.video_id,
        title: data.title,
        channelId: data.channel_id,
        messageCount: data.message_count ?? 0,
        createdAt: data.created_at,
        createdBy: data.created_by,
    };

    return { success: true, thread };
}

// ─── Story republish ────────────────────────────────────────

/** Republier un extrait de vidéo ImuFeed en Story */
export async function republishVideoAsStory(
    options: StoryRepublishOptions,
    userId: string,
): Promise<StoryRepublishResult> {
    const { data, error } = await supabase
        .from("stories")
        .insert({
            user_id: userId,
            source_video_id: options.videoId,
            clip_start_ms: options.clipStartMs,
            clip_end_ms: options.clipEndMs,
            overlay_text: options.overlayText ?? null,
            sticker: options.sticker ?? null,
            type: "video_republish",
        })
        .select("id")
        .single();

    if (error) return { success: false, error: error.message };

    return { success: true, storyId: data.id };
}
