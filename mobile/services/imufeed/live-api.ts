/**
 * LiveStreamingService — API Live Streaming ImuFeed
 *
 * Gère la création/fin des lives, le chat realtime via Supabase
 * channels, les réactions flottantes, et les donations live.
 *
 * Sprint S15B — Infrastructure Live Streaming
 */

import { supabase } from "@/services/supabase";
import type {
    LiveCategory,
    LiveChatMessage,
    LiveDonation,
    LiveReaction,
    LiveReactionType,
    LiveStream,
    LiveStreamSettings,
    LiveStreamStatus,
    ModerationAction
} from "@/types/live-streaming";
import { getDonationTier } from "@/types/live-streaming";

// ─── Default settings ─────────────────────────────────────────

const DEFAULT_SETTINGS: LiveStreamSettings = {
    donationsEnabled: true,
    chatEnabled: true,
    subscribersOnlyChat: false,
    slowModeSeconds: 0,
    autoRecord: true,
    maxCoHosts: 3,
};

// ─── Service ──────────────────────────────────────────────────

export class LiveStreamingService {
    // ── Create / Manage ───────────────────────────────────────

    /**
     * Create a new live stream (status: scheduled or live)
     */
    async createLive(params: {
        title: string;
        description?: string;
        category: LiveCategory;
        tags?: string[];
        settings?: Partial<LiveStreamSettings>;
        scheduledAt?: string | null;
        isAdultOnly?: boolean;
    }): Promise<{ data: LiveStream | null; error: string | null }> {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) {
            return { data: null, error: "Not authenticated" };
        }

        const { data, error } = await supabase
            .from("imufeed_lives")
            .insert({
                host_id: user.user.id,
                title: params.title,
                description: params.description || "",
                category: params.category,
                status: params.scheduledAt ? "scheduled" : "live",
                tags: params.tags || [],
                settings: { ...DEFAULT_SETTINGS, ...params.settings },
                scheduled_at: params.scheduledAt || null,
                started_at: params.scheduledAt ? null : new Date().toISOString(),
                is_adult_only: params.isAdultOnly ?? false,
            })
            .select()
            .single();

        if (error) return { data: null, error: error.message };
        return { data: this.mapLiveRow(data), error: null };
    }

    /**
     * End a live stream
     */
    async endLive(liveId: string): Promise<{ error: string | null }> {
        const { error } = await supabase
            .from("imufeed_lives")
            .update({
                status: "ended" as LiveStreamStatus,
                ended_at: new Date().toISOString(),
            })
            .eq("id", liveId);

        return { error: error?.message || null };
    }

    /**
     * Get a live by ID
     */
    async getLive(
        liveId: string,
    ): Promise<{ data: LiveStream | null; error: string | null }> {
        const { data, error } = await supabase
            .from("imufeed_lives")
            .select()
            .eq("id", liveId)
            .single();

        if (error) return { data: null, error: error.message };
        return { data: this.mapLiveRow(data), error: null };
    }

    /**
     * Get active (currently live) streams
     */
    async getActiveLives(params?: {
        category?: LiveCategory;
        limit?: number;
    }): Promise<{ data: LiveStream[]; error: string | null }> {
        let query = supabase
            .from("imufeed_lives")
            .select()
            .eq("status", "live")
            .order("viewer_count", { ascending: false })
            .limit(params?.limit ?? 20);

        if (params?.category) {
            query = query.eq("category", params.category);
        }

        const { data, error } = await query;

        if (error) return { data: [], error: error.message };
        return { data: (data || []).map(this.mapLiveRow), error: null };
    }

    // ── Chat ──────────────────────────────────────────────────

    /**
     * Send a chat message in a live
     */
    async sendChatMessage(
        liveId: string,
        content: string,
    ): Promise<{ error: string | null }> {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) return { error: "Not authenticated" };

        const { error } = await supabase.from("imufeed_live_chat").insert({
            live_id: liveId,
            user_id: user.user.id,
            type: "text",
            content,
        });

        return { error: error?.message || null };
    }

    /**
     * Get recent chat messages for a live
     */
    async getChatMessages(
        liveId: string,
        limit: number = 50,
    ): Promise<{ data: LiveChatMessage[]; error: string | null }> {
        const { data, error } = await supabase
            .from("imufeed_live_chat")
            .select("*, profiles:user_id(display_name, avatar_url)")
            .eq("live_id", liveId)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) return { data: [], error: error.message };

        const messages: LiveChatMessage[] = (data || []).map((row: any) => ({
            id: row.id,
            liveId: row.live_id,
            userId: row.user_id,
            userName: row.profiles?.display_name || "Unknown",
            userAvatar: row.profiles?.avatar_url || null,
            type: row.type,
            content: row.content,
            donationAmount: row.donation_amount,
            role: row.role || "viewer",
            createdAt: row.created_at,
            isPinned: row.is_pinned || false,
        }));

        return { data: messages.reverse(), error: null };
    }

    /**
     * Subscribe to realtime chat for a live stream
     */
    subscribeToChatChannel(
        liveId: string,
        onMessage: (msg: LiveChatMessage) => void,
    ): () => void {
        const channel = supabase
            .channel(`live-chat:${liveId}`)
            .on(
                "broadcast",
                { event: "chat_message" },
                (payload) => {
                    onMessage(payload.payload as LiveChatMessage);
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }

    // ── Reactions ─────────────────────────────────────────────

    /**
     * Send a floating reaction
     */
    async sendReaction(
        liveId: string,
        type: LiveReactionType,
    ): Promise<void> {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) return;

        const channel = supabase.channel(`live-reactions:${liveId}`);
        await channel.send({
            type: "broadcast",
            event: "reaction",
            payload: {
                userId: user.user.id,
                type,
                createdAt: new Date().toISOString(),
            },
        });
    }

    /**
     * Subscribe to realtime reactions
     */
    subscribeToReactions(
        liveId: string,
        onReaction: (reaction: LiveReaction) => void,
    ): () => void {
        const channel = supabase
            .channel(`live-reactions:${liveId}`)
            .on(
                "broadcast",
                { event: "reaction" },
                (payload) => {
                    onReaction(payload.payload as LiveReaction);
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }

    // ── Donations ─────────────────────────────────────────────

    /**
     * Send a live donation (tip)
     */
    async sendDonation(params: {
        liveId: string;
        amount: number;
        message?: string;
    }): Promise<{ data: LiveDonation | null; error: string | null }> {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) return { data: null, error: "Not authenticated" };

        const { data, error } = await supabase
            .from("imufeed_live_donations")
            .insert({
                live_id: params.liveId,
                user_id: user.user.id,
                amount: params.amount,
                message: params.message || null,
            })
            .select("*, profiles:user_id(display_name, avatar_url)")
            .single();

        if (error) return { data: null, error: error.message };

        const donation: LiveDonation = {
            id: data.id,
            liveId: data.live_id,
            userId: data.user_id,
            userName: data.profiles?.display_name || "Anonymous",
            userAvatar: data.profiles?.avatar_url || null,
            amount: data.amount,
            message: data.message,
            tier: getDonationTier(data.amount),
            createdAt: data.created_at,
        };

        return { data: donation, error: null };
    }

    /**
     * Get donations for a live stream
     */
    async getLiveDonations(
        liveId: string,
        limit: number = 50,
    ): Promise<{ data: LiveDonation[]; error: string | null }> {
        const { data, error } = await supabase
            .from("imufeed_live_donations")
            .select("*, profiles:user_id(display_name, avatar_url)")
            .eq("live_id", liveId)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) return { data: [], error: error.message };

        return {
            data: (data || []).map((row: any) => ({
                id: row.id,
                liveId: row.live_id,
                userId: row.user_id,
                userName: row.profiles?.display_name || "Anonymous",
                userAvatar: row.profiles?.avatar_url || null,
                amount: row.amount,
                message: row.message,
                tier: getDonationTier(row.amount),
                createdAt: row.created_at,
            })),
            error: null,
        };
    }

    // ── Viewers ───────────────────────────────────────────────

    /**
     * Join a live stream as viewer (presence)
     */
    joinAsViewer(
        liveId: string,
        userId: string,
        userName: string,
    ): () => void {
        const channel = supabase.channel(`live-presence:${liveId}`, {
            config: { presence: { key: userId } },
        });

        channel
            .on("presence", { event: "sync" }, () => {
                // Presence sync handled by store
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({
                        userId,
                        userName,
                        joinedAt: new Date().toISOString(),
                    });
                }
            });

        return () => {
            channel.untrack();
            supabase.removeChannel(channel);
        };
    }

    // ── Co-host ───────────────────────────────────────────────

    /**
     * Invite a user to co-host
     */
    async inviteCoHost(
        liveId: string,
        targetUserId: string,
    ): Promise<{ error: string | null }> {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) return { error: "Not authenticated" };

        const { error } = await supabase
            .from("imufeed_live_cohosts")
            .insert({
                live_id: liveId,
                from_user_id: user.user.id,
                to_user_id: targetUserId,
                status: "pending",
            });

        return { error: error?.message || null };
    }

    /**
     * Respond to a co-host invitation
     */
    async respondToCoHostInvite(
        requestId: string,
        accept: boolean,
    ): Promise<{ error: string | null }> {
        const { error } = await supabase
            .from("imufeed_live_cohosts")
            .update({ status: accept ? "accepted" : "declined" })
            .eq("id", requestId);

        return { error: error?.message || null };
    }

    // ── Moderation ────────────────────────────────────────────

    /**
     * Take moderation action on a viewer
     */
    async moderateViewer(params: {
        liveId: string;
        targetUserId: string;
        action: ModerationAction;
        reason?: string;
        duration?: number;
    }): Promise<{ error: string | null }> {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) return { error: "Not authenticated" };

        const { error } = await supabase
            .from("imufeed_live_moderation")
            .insert({
                live_id: params.liveId,
                moderator_id: user.user.id,
                target_user_id: params.targetUserId,
                action: params.action,
                reason: params.reason || null,
                duration: params.duration || null,
            });

        return { error: error?.message || null };
    }

    // ── Helpers ───────────────────────────────────────────────

    private mapLiveRow(row: any): LiveStream {
        return {
            id: row.id,
            hostId: row.host_id,
            hostName: row.host_name || "",
            hostAvatar: row.host_avatar || null,
            title: row.title,
            description: row.description || "",
            category: row.category,
            status: row.status,
            streamUrl: row.stream_url || null,
            thumbnailUrl: row.thumbnail_url || null,
            viewerCount: row.viewer_count || 0,
            peakViewerCount: row.peak_viewer_count || 0,
            likeCount: row.like_count || 0,
            totalDonations: row.total_donations || 0,
            coHosts: row.co_hosts || [],
            settings: row.settings || DEFAULT_SETTINGS,
            tags: row.tags || [],
            scheduledAt: row.scheduled_at,
            startedAt: row.started_at,
            endedAt: row.ended_at,
            createdAt: row.created_at,
            replayUrl: row.replay_url || null,
            hasReplay: row.has_replay || false,
            isAdultOnly: row.is_adult_only || false,
        };
    }
}

// Singleton export
export const liveStreamingService = new LiveStreamingService();

export default liveStreamingService;
