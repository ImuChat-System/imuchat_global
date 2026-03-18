/**
 * stores/video-sharing-store.ts — S21 · Zustand store Partage DM & Chat
 *
 * Gère : sélection vidéo à partager, cibles, envoi, preview inline.
 */

import { shareVideoToMultiple } from "@/services/imufeed/video-sharing";
import { createLogger } from "@/services/logger";
import type {
    InlinePreviewConfig,
    InlinePreviewState,
    ShareResult,
    ShareTarget,
    VideoCardData,
    VideoSharingStoreState
} from "@/types/video-sharing";
import { DEFAULT_INLINE_PREVIEW_CONFIG } from "@/types/video-sharing";
import { create } from "zustand";

const logger = createLogger("VideoSharingStore");

const initialInlinePreview: InlinePreviewState = {
    messageId: null,
    videoId: null,
    isPlaying: false,
    isMuted: true,
    positionMs: 0,
};

export const initialVideoSharingState: Omit<
    VideoSharingStoreState,
    | "startShare"
    | "cancelShare"
    | "toggleTarget"
    | "clearTargets"
    | "confirmShare"
    | "setInlinePreview"
    | "playInlinePreview"
    | "pauseInlinePreview"
    | "toggleInlinePreviewMute"
    | "closeInlinePreview"
    | "updateInlinePreviewPosition"
    | "updateInlinePreviewConfig"
    | "resetVideoSharing"
> = {
    inlinePreviewConfig: DEFAULT_INLINE_PREVIEW_CONFIG,
    shareStatus: "idle",
    selectedTargets: [],
    videoToShare: null,
    inlinePreview: initialInlinePreview,
    recentShares: [],
};

export const useVideoSharingStore = create<VideoSharingStoreState>()(
    (set, get) => ({
        ...initialVideoSharingState,

        // ─── Partage ───────────────────────────────────────

        startShare: (video: VideoCardData) => {
            set({
                shareStatus: "selecting",
                videoToShare: video,
                selectedTargets: [],
            });
        },

        cancelShare: () => {
            set({
                shareStatus: "idle",
                videoToShare: null,
                selectedTargets: [],
            });
        },

        toggleTarget: (target: ShareTarget) => {
            set((s) => {
                const exists = s.selectedTargets.some(
                    (t) => t.conversationId === target.conversationId,
                );
                return {
                    selectedTargets: exists
                        ? s.selectedTargets.filter(
                            (t) => t.conversationId !== target.conversationId,
                        )
                        : [...s.selectedTargets, target],
                };
            });
        },

        clearTargets: () => {
            set({ selectedTargets: [] });
        },

        confirmShare: async (): Promise<ShareResult[]> => {
            const { videoToShare, selectedTargets } = get();
            if (!videoToShare || selectedTargets.length === 0) {
                return [{ success: false, messageId: null, error: "Nothing to share" }];
            }

            set({ shareStatus: "sharing" });

            try {
                const results = await shareVideoToMultiple(videoToShare, selectedTargets);
                const allSuccess = results.every((r) => r.success);

                // Enregistrer dans les partages récents
                const now = Date.now();
                const newRecent = selectedTargets.map((t) => ({
                    videoId: videoToShare.videoId,
                    conversationId: t.conversationId,
                    sharedAt: now,
                }));

                set((s) => ({
                    shareStatus: allSuccess ? "success" : "error",
                    recentShares: [...newRecent, ...s.recentShares].slice(0, 50),
                    videoToShare: null,
                    selectedTargets: [],
                }));

                return results;
            } catch (err) {
                logger.error(`confirmShare failed: ${err}`);
                set({ shareStatus: "error" });
                return [{ success: false, messageId: null, error: String(err) }];
            }
        },

        // ─── Inline Preview ────────────────────────────────

        setInlinePreview: (messageId: string, videoId: string) => {
            set({
                inlinePreview: {
                    messageId,
                    videoId,
                    isPlaying: get().inlinePreviewConfig.autoplay,
                    isMuted: get().inlinePreviewConfig.defaultMuted,
                    positionMs: 0,
                },
            });
        },

        playInlinePreview: () => {
            set((s) => ({
                inlinePreview: { ...s.inlinePreview, isPlaying: true },
            }));
        },

        pauseInlinePreview: () => {
            set((s) => ({
                inlinePreview: { ...s.inlinePreview, isPlaying: false },
            }));
        },

        toggleInlinePreviewMute: () => {
            set((s) => ({
                inlinePreview: { ...s.inlinePreview, isMuted: !s.inlinePreview.isMuted },
            }));
        },

        closeInlinePreview: () => {
            set({ inlinePreview: initialInlinePreview });
        },

        updateInlinePreviewPosition: (positionMs: number) => {
            set((s) => ({
                inlinePreview: { ...s.inlinePreview, positionMs },
            }));
        },

        // ─── Config ────────────────────────────────────────

        updateInlinePreviewConfig: (partial: Partial<InlinePreviewConfig>) => {
            set((s) => ({
                inlinePreviewConfig: { ...s.inlinePreviewConfig, ...partial },
            }));
        },

        resetVideoSharing: () => {
            set({ ...initialVideoSharingState });
        },
    }),
);
