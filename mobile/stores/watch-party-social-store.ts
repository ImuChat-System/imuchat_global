/**
 * Store Watch Party Social — Sprint S22
 * Zustand store : watch party ImuFeed, queue, cross-post, thread, story republish.
 */

import {
    addVideoToQueue,
    createVideoThread,
    crossPostVideo,
    fetchCrossPostTargets,
    fetchPartyQueue,
    joinWatchParty,
    leaveWatchParty,
    republishVideoAsStory,
    voteQueueItem as voteQueueItemAPI,
} from "@/services/imufeed/watch-party-social";
import type {
    CrossPostTarget,
    QueueItem,
    SyncPlayback,
    WatchPartyReactionEvent,
    WatchPartySocialStoreState
} from "@/types/watch-party-social";
import { create } from "zustand";

/** État initial (exporté pour les tests) */
export const initialWatchPartySocialState: Omit<
    WatchPartySocialStoreState,
    | "joinParty"
    | "leaveParty"
    | "updateSyncPlayback"
    | "sendReaction"
    | "clearReactions"
    | "loadQueue"
    | "addToQueue"
    | "removeFromQueue"
    | "voteQueueItem"
    | "reorderQueue"
    | "loadCrossPostTargets"
    | "crossPost"
    | "clearCrossPostResults"
    | "createThreadFromVideo"
    | "setRepublishOptions"
    | "republishAsStory"
    | "resetWatchPartySocial"
> = {
    currentParty: null,
    participants: [],
    syncPlayback: null,
    reactions: [],
    queue: [],
    isLoadingQueue: false,
    crossPostTargets: [],
    isLoadingTargets: false,
    crossPostResults: [],
    createdThreads: [],
    republishOptions: null,
    isRepublishing: false,
    error: null,
};

export const useWatchPartySocialStore = create<WatchPartySocialStoreState>(
    (set, get) => ({
        ...initialWatchPartySocialState,

        // ─── Watch Party ────────────────────────────────────────

        joinParty: async (partyId) => {
            try {
                set({ error: null });
                const userId = "current-user"; // placeholder — resolved via auth context at runtime
                const { participants } = await joinWatchParty(partyId, userId);
                set({ participants });
            } catch (err) {
                set({ error: (err as Error).message });
            }
        },

        leaveParty: () => {
            const party = get().currentParty;
            if (party) {
                leaveWatchParty(party.id, "current-user").catch(() => { });
            }
            set({
                currentParty: null,
                participants: [],
                syncPlayback: null,
                reactions: [],
                queue: [],
            });
        },

        updateSyncPlayback: (partial) => {
            const current = get().syncPlayback;
            if (current) {
                set({ syncPlayback: { ...current, ...partial } });
            } else {
                set({ syncPlayback: partial as SyncPlayback });
            }
        },

        sendReaction: (reaction) => {
            const event: WatchPartyReactionEvent = {
                userId: "current-user",
                reaction,
                timestamp: new Date().toISOString(),
            };
            set({ reactions: [...get().reactions, event].slice(-100) });
        },

        clearReactions: () => set({ reactions: [] }),

        // ─── Queue ──────────────────────────────────────────────

        loadQueue: async (partyId) => {
            set({ isLoadingQueue: true, error: null });
            try {
                const queue = await fetchPartyQueue(partyId);
                set({ queue, isLoadingQueue: false });
            } catch (err) {
                set({ error: (err as Error).message, isLoadingQueue: false });
            }
        },

        addToQueue: async (partyId, video) => {
            const result = await addVideoToQueue(partyId, video, "current-user", "current-username");
            if (result.success && result.item) {
                set({ queue: [...get().queue, result.item] });
            }
            return result;
        },

        removeFromQueue: (itemId) => {
            set({ queue: get().queue.filter((q) => q.id !== itemId) });
        },

        voteQueueItem: (itemId) => {
            const queue = get().queue.map((q) =>
                q.id === itemId ? { ...q, upvotes: q.upvotes + 1, hasVoted: true } : q,
            );
            // Re-sort by upvotes desc
            queue.sort((a, b) => b.upvotes - a.upvotes);
            set({ queue });
            voteQueueItemAPI(itemId).catch(() => { });
        },

        reorderQueue: (queue: QueueItem[]) => set({ queue }),

        // ─── Cross-post ─────────────────────────────────────────

        loadCrossPostTargets: async () => {
            set({ isLoadingTargets: true, error: null });
            try {
                const targets = await fetchCrossPostTargets();
                set({ crossPostTargets: targets, isLoadingTargets: false });
            } catch (err) {
                set({ error: (err as Error).message, isLoadingTargets: false });
            }
        },

        crossPost: async (videoId, targets) => {
            set({ error: null });
            const results = await Promise.all(
                targets.map((t: CrossPostTarget) => crossPostVideo(videoId, t)),
            );
            set({ crossPostResults: [...get().crossPostResults, ...results] });
            return results;
        },

        clearCrossPostResults: () => set({ crossPostResults: [] }),

        // ─── Thread ─────────────────────────────────────────────

        createThreadFromVideo: async (videoId, channelId) => {
            set({ error: null });
            const result = await createVideoThread(videoId, channelId, "current-user");
            if (result.success && result.thread) {
                set({ createdThreads: [...get().createdThreads, result.thread] });
            }
            return result;
        },

        // ─── Story republish ────────────────────────────────────

        setRepublishOptions: (options) => set({ republishOptions: options }),

        republishAsStory: async () => {
            const options = get().republishOptions;
            if (!options) return { success: false, error: "No options set" };
            set({ isRepublishing: true, error: null });
            try {
                const result = await republishVideoAsStory(options, "current-user");
                set({ isRepublishing: false, republishOptions: null });
                return result;
            } catch (err) {
                set({ isRepublishing: false, error: (err as Error).message });
                return { success: false, error: (err as Error).message };
            }
        },

        // ─── Reset ──────────────────────────────────────────────

        resetWatchPartySocial: () => set(initialWatchPartySocialState),
    }),
);
