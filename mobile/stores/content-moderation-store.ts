/**
 * S18 — Content Moderation Store (Zustand)
 *
 * État pour la file de modération admin, le journal,
 * les paramètres créateur et les signalements.
 */

import { moderationAPI } from "@/services/imufeed/moderation-api";
import type {
    CommentMode,
    ContentAnalysisResult,
    ContentModerationAction,
    ContentModerationStoreState,
    ReportableContentType,
    ReportReason,
    ReportStatus
} from "@/types/content-moderation";
import { DEFAULT_CREATOR_SETTINGS } from "@/types/content-moderation";
import { create } from "zustand";

export const useContentModerationStore = create<ContentModerationStoreState>(
    (set, get) => ({
        // ── State ──────────────────────────────────────────────────
        queue: [],
        queueLoading: false,
        log: [],
        logLoading: false,
        creatorSettings: { ...DEFAULT_CREATOR_SETTINGS },
        creatorSettingsLoading: false,

        // ── Queue ──────────────────────────────────────────────────

        loadQueue: async (status: ReportStatus = "pending") => {
            set({ queueLoading: true });
            const { data } = await moderationAPI.getQueue(status);
            set({ queue: data, queueLoading: false });
        },

        reviewItem: async (
            itemId: string,
            action: ContentModerationAction,
            reason: string,
        ) => {
            await moderationAPI.reviewItem(itemId, action, reason);
            set((s) => ({
                queue: s.queue.filter((q) => q.id !== itemId),
            }));
        },

        dismissItem: async (itemId: string) => {
            await moderationAPI.dismissItem(itemId);
            set((s) => ({
                queue: s.queue.filter((q) => q.id !== itemId),
            }));
        },

        // ── Log ────────────────────────────────────────────────────

        loadLog: async (limit = 50) => {
            set({ logLoading: true });
            const { data } = await moderationAPI.getLog(limit);
            set({ log: data, logLoading: false });
        },

        // ── Report ─────────────────────────────────────────────────

        reportContent: async (
            contentId: string,
            contentType: ReportableContentType,
            reason: ReportReason,
            description: string,
        ) => {
            await moderationAPI.reportContent({
                content_id: contentId,
                content_type: contentType,
                reason,
                description,
            });
        },

        // ── Creator settings ───────────────────────────────────────

        loadCreatorSettings: async () => {
            set({ creatorSettingsLoading: true });
            const currentSettings = get().creatorSettings;
            const { data } = await moderationAPI.getCreatorSettings(
                currentSettings.user_id,
            );
            if (data) {
                set({ creatorSettings: data, creatorSettingsLoading: false });
            } else {
                set({ creatorSettingsLoading: false });
            }
        },

        updateBlockedKeywords: (keywords: string[]) => {
            set((s) => ({
                creatorSettings: { ...s.creatorSettings, blocked_keywords: keywords },
            }));
        },

        addBlockedUser: async (userId: string) => {
            const settings = get().creatorSettings;
            if (settings.blocked_users.includes(userId)) return;
            await moderationAPI.blockUser(settings.user_id, userId);
            set((s) => ({
                creatorSettings: {
                    ...s.creatorSettings,
                    blocked_users: [...s.creatorSettings.blocked_users, userId],
                },
            }));
        },

        removeBlockedUser: async (userId: string) => {
            const settings = get().creatorSettings;
            await moderationAPI.unblockUser(settings.user_id, userId);
            set((s) => ({
                creatorSettings: {
                    ...s.creatorSettings,
                    blocked_users: s.creatorSettings.blocked_users.filter(
                        (id) => id !== userId,
                    ),
                },
            }));
        },

        setCommentMode: (mode: CommentMode) => {
            set((s) => ({
                creatorSettings: { ...s.creatorSettings, comment_mode: mode },
            }));
        },

        toggleAutoFilter: () => {
            set((s) => ({
                creatorSettings: {
                    ...s.creatorSettings,
                    auto_filter_enabled: !s.creatorSettings.auto_filter_enabled,
                },
            }));
        },

        saveCreatorSettings: async () => {
            const settings = get().creatorSettings;
            await moderationAPI.saveCreatorSettings(settings);
        },

        // ── IA ─────────────────────────────────────────────────────

        analyzeContent: async (
            contentId: string,
            contentType: ReportableContentType,
        ): Promise<ContentAnalysisResult | null> => {
            const { data } = await moderationAPI.analyzeContent(
                contentId,
                contentType,
            );
            return data;
        },
    }),
);
