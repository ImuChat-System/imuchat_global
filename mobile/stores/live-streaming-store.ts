/**
 * Live Streaming Store — Zustand store for live streaming UI state
 *
 * Manages current live, chat messages, viewers, reactions,
 * donations queue, and connection status.
 *
 * Sprint S15B — Infrastructure Live Streaming
 */

import type {
    CoHostRequest,
    LiveChatMessage,
    LiveDonation,
    LivePoll,
    LiveReaction,
    LiveStream,
    LiveStreamStoreState,
} from "@/types/live-streaming";
import { create } from "zustand";

// ─── Constants ────────────────────────────────────────────────

const MAX_CHAT_MESSAGES = 200;
const MAX_REACTIONS_QUEUE = 30;
const MAX_DONATION_QUEUE = 10;

// ─── Store ────────────────────────────────────────────────────

interface LiveStreamingStoreActions {
    // Live lifecycle
    setCurrentLive: (live: LiveStream | null) => void;
    updateLive: (updates: Partial<LiveStream>) => void;

    // Chat
    addChatMessage: (message: LiveChatMessage) => void;
    clearChat: () => void;
    pinMessage: (messageId: string) => void;
    unpinMessage: () => void;

    // Viewers
    updateViewerCount: (count: number) => void;
    setPeakViewerCount: (count: number) => void;

    // Reactions
    addReaction: (reaction: LiveReaction) => void;
    removeReaction: (reactionId: string) => void;

    // Donations
    addDonation: (donation: LiveDonation) => void;
    shiftDonation: () => void;

    // Connection
    setConnectionStatus: (status: LiveStreamStoreState["connectionStatus"]) => void;
    setIsHosting: (isHosting: boolean) => void;

    // Polls
    setActivePoll: (poll: LivePoll | null) => void;
    voteOnPoll: (optionIndex: number) => void;
    updatePollResults: (options: LivePoll["options"], totalVotes: number) => void;

    // Co-host
    addCoHostRequest: (request: CoHostRequest) => void;
    updateCoHostRequest: (requestId: string, status: CoHostRequest["status"]) => void;
    setActiveCoHosts: (userIds: string[]) => void;
    addActiveCoHost: (userId: string) => void;
    removeActiveCoHost: (userId: string) => void;

    // Moderation
    setModerators: (userIds: string[]) => void;
    addModerator: (userId: string) => void;
    removeModerator: (userId: string) => void;

    // Reset
    reset: () => void;
}

type LiveStreamingStore = LiveStreamStoreState & LiveStreamingStoreActions;

const initialState: LiveStreamStoreState = {
    currentLive: null,
    chatMessages: [],
    viewerCount: 0,
    peakViewerCount: 0,
    isHosting: false,
    connectionStatus: "disconnected",
    pinnedMessage: null,
    reactionQueue: [],
    donationQueue: [],
    activePoll: null,
    coHostRequests: [],
    activeCoHosts: [],
    moderators: [],
};

export const useLiveStreamingStore = create<LiveStreamingStore>((set, get) => ({
    ...initialState,

    // ── Live lifecycle ─────────────────────────────────────

    setCurrentLive: (live) =>
        set({
            currentLive: live,
            viewerCount: live?.viewerCount || 0,
            peakViewerCount: live?.peakViewerCount || 0,
        }),

    updateLive: (updates) =>
        set((state) => ({
            currentLive: state.currentLive
                ? { ...state.currentLive, ...updates }
                : null,
        })),

    // ── Chat ──────────────────────────────────────────────

    addChatMessage: (message) =>
        set((state) => {
            const messages = [...state.chatMessages, message];
            // Keep only the last N messages to avoid memory bloat
            if (messages.length > MAX_CHAT_MESSAGES) {
                return { chatMessages: messages.slice(-MAX_CHAT_MESSAGES) };
            }
            return { chatMessages: messages };
        }),

    clearChat: () => set({ chatMessages: [], pinnedMessage: null }),

    pinMessage: (messageId) =>
        set((state) => {
            const msg = state.chatMessages.find((m) => m.id === messageId);
            return { pinnedMessage: msg || null };
        }),

    unpinMessage: () => set({ pinnedMessage: null }),

    // ── Viewers ───────────────────────────────────────────

    updateViewerCount: (count) =>
        set((state) => ({
            viewerCount: count,
            peakViewerCount: Math.max(state.peakViewerCount, count),
        })),

    setPeakViewerCount: (count) => set({ peakViewerCount: count }),

    // ── Reactions ─────────────────────────────────────────

    addReaction: (reaction) =>
        set((state) => {
            const queue = [...state.reactionQueue, reaction];
            if (queue.length > MAX_REACTIONS_QUEUE) {
                return { reactionQueue: queue.slice(-MAX_REACTIONS_QUEUE) };
            }
            return { reactionQueue: queue };
        }),

    removeReaction: (reactionId) =>
        set((state) => ({
            reactionQueue: state.reactionQueue.filter((r) => r.id !== reactionId),
        })),

    // ── Donations ─────────────────────────────────────────

    addDonation: (donation) =>
        set((state) => {
            const queue = [...state.donationQueue, donation];
            if (queue.length > MAX_DONATION_QUEUE) {
                return { donationQueue: queue.slice(-MAX_DONATION_QUEUE) };
            }
            return { donationQueue: queue };
        }),

    shiftDonation: () =>
        set((state) => ({
            donationQueue: state.donationQueue.slice(1),
        })),

    // ── Connection ────────────────────────────────────────

    setConnectionStatus: (status) => set({ connectionStatus: status }),
    setIsHosting: (isHosting) => set({ isHosting }),

    // ── Polls ─────────────────────────────────────────────

    setActivePoll: (poll) => set({ activePoll: poll }),

    voteOnPoll: (optionIndex) =>
        set((state) => {
            if (!state.activePoll || state.activePoll.hasVoted) return state;
            const options = state.activePoll.options.map((opt, i) =>
                i === optionIndex ? { ...opt, voteCount: opt.voteCount + 1 } : opt,
            );
            return {
                activePoll: {
                    ...state.activePoll,
                    options,
                    totalVotes: state.activePoll.totalVotes + 1,
                    hasVoted: true,
                    votedOptionIndex: optionIndex,
                },
            };
        }),

    updatePollResults: (options, totalVotes) =>
        set((state) => {
            if (!state.activePoll) return state;
            return {
                activePoll: { ...state.activePoll, options, totalVotes },
            };
        }),

    // ── Co-host ───────────────────────────────────────────

    addCoHostRequest: (request) =>
        set((state) => ({
            coHostRequests: [...state.coHostRequests, request],
        })),

    updateCoHostRequest: (requestId, status) =>
        set((state) => ({
            coHostRequests: state.coHostRequests.map((r) =>
                r.id === requestId ? { ...r, status } : r,
            ),
        })),

    setActiveCoHosts: (userIds) => set({ activeCoHosts: userIds }),

    addActiveCoHost: (userId) =>
        set((state) => ({
            activeCoHosts: state.activeCoHosts.includes(userId)
                ? state.activeCoHosts
                : [...state.activeCoHosts, userId],
        })),

    removeActiveCoHost: (userId) =>
        set((state) => ({
            activeCoHosts: state.activeCoHosts.filter((id) => id !== userId),
        })),

    // ── Moderation ────────────────────────────────────────

    setModerators: (userIds) => set({ moderators: userIds }),

    addModerator: (userId) =>
        set((state) => ({
            moderators: state.moderators.includes(userId)
                ? state.moderators
                : [...state.moderators, userId],
        })),

    removeModerator: (userId) =>
        set((state) => ({
            moderators: state.moderators.filter((id) => id !== userId),
        })),

    // ── Reset ─────────────────────────────────────────────

    reset: () => set(initialState),
}));

export default useLiveStreamingStore;
