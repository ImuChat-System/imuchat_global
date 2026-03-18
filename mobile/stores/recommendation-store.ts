/**
 * stores/recommendation-store.ts — S19 · Store Recommandation Avancée
 *
 * État : cold start, onboarding catégories, diversité, Alice résumé/recherche.
 */

import * as aliceVideo from "@/services/imufeed/alice-video";
import * as recEngine from "@/services/imufeed/recommendation-engine";
import type {
    ColdStartStatus,
    NegativeFeedbackReason,
    RecommendationStoreState
} from "@/types/recommendation";
import {
    DEFAULT_DIVERSITY_CONFIG,
    DEFAULT_RERANK_CONFIG,
} from "@/types/recommendation";
import { create } from "zustand";

export const useRecommendationStore = create<RecommendationStoreState>(
    (set, get) => ({
        coldStartStatus: "ready" as ColdStartStatus,
        onboardingCategories: [],
        availableCategories: [],
        diversityConfig: DEFAULT_DIVERSITY_CONFIG,
        rerankConfig: DEFAULT_RERANK_CONFIG,
        currentSummary: null,
        summaryLoading: false,
        searchResults: [],
        searchLoading: false,

        loadColdStartStatus: async () => {
            const { data: userData } = await (
                await import("@/services/supabase")
            ).supabase.auth.getUser();
            const userId = userData?.user?.id;
            if (!userId) return;
            const status = await recEngine.getColdStartStatus(userId);
            set({ coldStartStatus: status });
        },

        selectOnboardingCategory: (categoryId: string) => {
            const current = get().onboardingCategories;
            if (!current.includes(categoryId) && current.length < 8) {
                set({ onboardingCategories: [...current, categoryId] });
            }
        },

        removeOnboardingCategory: (categoryId: string) => {
            set({
                onboardingCategories: get().onboardingCategories.filter(
                    (c) => c !== categoryId,
                ),
            });
        },

        completeOnboarding: async () => {
            const { data: userData } = await (
                await import("@/services/supabase")
            ).supabase.auth.getUser();
            const userId = userData?.user?.id;
            if (!userId) return;

            const categories = get().onboardingCategories;
            await recEngine.saveOnboardingCategories(userId, categories);
            set({ coldStartStatus: "warming" });
        },

        loadAvailableCategories: async () => {
            const categories = await recEngine.getOnboardingCategories();
            set({ availableCategories: categories });
        },

        submitFeedback: async (
            videoId: string,
            reason: NegativeFeedbackReason,
        ) => {
            await recEngine.recordFeedback(videoId, reason);
        },

        summarizeVideo: async (videoId: string) => {
            set({ summaryLoading: true, currentSummary: null });
            const { data } = await aliceVideo.summarizeVideo(videoId);
            set({ currentSummary: data, summaryLoading: false });
        },

        searchVideos: async (query: string) => {
            set({ searchLoading: true, searchResults: [] });
            const { data } = await aliceVideo.searchVideos({
                query,
                limit: 20,
            });
            set({ searchResults: data, searchLoading: false });
        },
    }),
);
