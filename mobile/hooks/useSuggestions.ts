/**
 * useSuggestions Hook
 *
 * Hook React pour les suggestions intelligentes :
 *  - Smart Replies contextuelles
 *  - Auto-complétion en temps réel
 *  - Résumé de conversations
 *  - Détection de ton
 *  - Templates de messages
 *
 * Phase 3 — Groupe 9 IA (Features 9.2 + 9.3)
 */

import { useSuggestionsStore } from '@/stores/suggestions-store';
import type { MessageContext } from '@/types/suggestions';
import { SummaryLength } from '@/types/suggestions';
import { useCallback, useEffect, useMemo } from 'react';

// ============================================================================
// HOOK
// ============================================================================

export function useSuggestions() {
    const store = useSuggestionsStore();

    // Auto-load templates and stats on mount
    useEffect(() => {
        if (store.templates.length === 0) {
            store.loadTemplates();
        }
        if (!store.stats) {
            store.loadStats();
        }
    }, []);

    // ========================
    // SMART REPLY
    // ========================

    const getSmartReplies = useCallback(
        async (context: MessageContext) => {
            if (!store.preferences.smart_reply_enabled) return;
            await store.generateSmartReplies(context);
        },
        [store.preferences.smart_reply_enabled]
    );

    const acceptReply = useCallback(
        (suggestionId: string) => {
            const suggestion = store.smartReplies.find(r => r.id === suggestionId);
            store.acceptSuggestion(suggestionId);
            return suggestion?.text || '';
        },
        [store.smartReplies]
    );

    const dismissReply = useCallback(
        (suggestionId: string) => {
            store.dismissSuggestion(suggestionId);
        },
        []
    );

    // ========================
    // AUTO-COMPLETION
    // ========================

    const getCompletions = useCallback(
        async (partialText: string, context: MessageContext) => {
            if (!store.preferences.auto_completion_enabled) return;
            if (!partialText || partialText.length < 3) {
                store.clearCompletions();
                return;
            }
            await store.generateCompletion(partialText, context);
        },
        [store.preferences.auto_completion_enabled]
    );

    // ========================
    // SUMMARY
    // ========================

    const generateSummary = useCallback(
        async (conversationId: string, messageCount: number, length?: SummaryLength) => {
            await store.generateSummary(conversationId, messageCount, length || SummaryLength.MEDIUM);
        },
        []
    );

    // ========================
    // TONE
    // ========================

    const analyzeTone = useCallback(
        async (messageId: string, content: string) => {
            if (!store.preferences.tone_detection_enabled) return null;
            await store.analyzeTone(messageId, content);
            return useSuggestionsStore.getState().currentTone;
        },
        [store.preferences.tone_detection_enabled]
    );

    // ========================
    // TEMPLATES
    // ========================

    const filteredTemplates = useMemo(() => {
        if (!store.selectedTemplateCategory) return store.templates;
        return store.templates.filter(t => t.category === store.selectedTemplateCategory);
    }, [store.templates, store.selectedTemplateCategory]);

    const favoriteTemplates = useMemo(() => {
        return store.templates.filter(t => t.is_favorite);
    }, [store.templates]);

    const applyTemplate = useCallback(
        (templateId: string, variables?: Record<string, string>) => {
            return store.useTemplate(templateId, variables || {});
        },
        [store.templates]
    );

    // ========================
    // DERIVED VALUES
    // ========================

    const hasSmartReplies = store.smartReplies.length > 0;
    const hasCompletions = store.completions.length > 0;
    const hasSummaries = store.summaries.length > 0;
    const templateCount = store.templates.length;
    const summaryCount = store.summaries.length;

    const acceptanceRate = useMemo(() => {
        if (!store.stats || store.stats.total_suggestions_shown === 0) return 0;
        return Math.round(store.stats.acceptance_rate * 100);
    }, [store.stats]);

    // ========================
    // RETURN
    // ========================

    return {
        // Smart Replies
        smartReplies: store.smartReplies,
        hasSmartReplies,
        isLoadingSuggestions: store.isLoadingSuggestions,
        getSmartReplies,
        acceptReply,
        dismissReply,
        clearSmartReplies: store.clearSmartReplies,

        // Auto-completion
        completions: store.completions,
        hasCompletions,
        getCompletions,
        clearCompletions: store.clearCompletions,

        // Summaries
        summaries: store.summaries,
        hasSummaries,
        summaryCount,
        isGeneratingSummary: store.isGeneratingSummary,
        generateSummary,
        loadSummaries: store.loadSummaries,
        deleteSummary: store.deleteSummary,

        // Tone
        currentTone: store.currentTone,
        isAnalyzingTone: store.isAnalyzingTone,
        analyzeTone,
        clearTone: store.clearTone,

        // Templates
        templates: store.templates,
        filteredTemplates,
        favoriteTemplates,
        templateCount,
        selectedCategory: store.selectedTemplateCategory,
        loadTemplates: store.loadTemplates,
        createTemplate: store.createTemplate,
        deleteTemplate: store.deleteTemplate,
        toggleFavorite: store.toggleFavorite,
        applyTemplate,
        setTemplateCategory: store.setTemplateCategory,

        // Preferences
        preferences: store.preferences,
        updatePreferences: store.updatePreferences,

        // Stats
        stats: store.stats,
        acceptanceRate,
        loadStats: store.loadStats,

        // Utilities
        error: store.error,
        clearError: store.clearError,
        reset: store.reset,
    };
}
