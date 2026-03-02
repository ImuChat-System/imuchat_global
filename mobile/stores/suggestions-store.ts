/**
 * Suggestions Store (Zustand)
 *
 * Gère l'état global des suggestions intelligentes :
 *  - Smart Replies
 *  - Auto-complétion
 *  - Résumés de conversations
 *  - Détection de ton
 *  - Templates de messages
 *  - Préférences et statistiques
 *
 * Persistance via AsyncStorage.
 *
 * Phase 3 — Groupe 9 IA (Features 9.2 + 9.3)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createLogger } from '@/services/logger';
import {
    analyzeToneLocal,
    applyTemplateVariables,
    createTemplate as createTemplateApi,
    deleteSavedSummary,
    deleteTemplate as deleteTemplateApi,
    generateCompletionLocal,
    generateSmartRepliesLocal,
    generateSummaryLocal,
    getSavedSummaries,
    getStats,
    getTemplates,
    incrementTemplateUsage,
    recordSuggestionShown,
    recordSuggestionUsed,
    savePreferences,
    saveSummary,
    toggleTemplateFavorite
} from '@/services/suggestions-api';
import type { SuggestionsStoreState } from '@/types/suggestions';
import { SuggestionType, SummaryStatus, ToneCategory } from '@/types/suggestions';

const logger = createLogger('SuggestionsStore');

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_PREFERENCES: SuggestionsStoreState['preferences'] = {
    smart_reply_enabled: true,
    auto_completion_enabled: true,
    tone_detection_enabled: false,
    max_suggestions: 3,
    preferred_tone: ToneCategory.CASUAL,
    preferred_length: 'short',
    language: 'fr',
    use_llm: false,
    show_confidence: false,
};

const DEFAULT_STATS: SuggestionsStoreState['stats'] = {
    total_suggestions_shown: 0,
    total_suggestions_used: 0,
    acceptance_rate: 0,
    most_used_type: SuggestionType.SMART_REPLY,
    summaries_generated: 0,
    templates_used: 0,
    top_templates: [],
    daily_usage: [],
};

// ============================================================================
// STORE
// ============================================================================

export const useSuggestionsStore = create<SuggestionsStoreState>()(
    persist(
        (set, get) => ({
            // ==== State ====
            smartReplies: [],
            completions: [],
            summaries: [],
            templates: [],
            stats: null,
            preferences: { ...DEFAULT_PREFERENCES },

            // UI State
            isLoadingSuggestions: false,
            isGeneratingSummary: false,
            isAnalyzingTone: false,
            currentTone: null,
            selectedTemplateCategory: null,
            error: null,

            // ==================================================================
            // SMART REPLY ACTIONS
            // ==================================================================

            generateSmartReplies: async (context) => {
                set({ isLoadingSuggestions: true, error: null });
                try {
                    const prefs = get().preferences;
                    const replies = generateSmartRepliesLocal(context, prefs.max_suggestions);
                    set({ smartReplies: replies, isLoadingSuggestions: false });
                    await recordSuggestionShown();
                    logger.info('Smart replies generated:', replies.length);
                } catch (err) {
                    logger.error('Failed to generate smart replies', err);
                    set({
                        error: err instanceof Error ? err.message : 'Failed to generate suggestions',
                        isLoadingSuggestions: false,
                    });
                }
            },

            acceptSuggestion: (suggestionId) => {
                const replies = get().smartReplies;
                const suggestion = replies.find(r => r.id === suggestionId);
                if (suggestion) {
                    recordSuggestionUsed(suggestion.type);
                    set({ smartReplies: replies.filter(r => r.id !== suggestionId) });
                    logger.info('Suggestion accepted:', suggestionId);
                }
            },

            dismissSuggestion: (suggestionId) => {
                set({ smartReplies: get().smartReplies.filter(r => r.id !== suggestionId) });
            },

            clearSmartReplies: () => {
                set({ smartReplies: [] });
            },

            // ==================================================================
            // COMPLETION ACTIONS
            // ==================================================================

            generateCompletion: async (partialText, context) => {
                try {
                    const completions = generateCompletionLocal(partialText);
                    set({ completions });
                } catch (err) {
                    logger.error('Failed to generate completion', err);
                    set({ completions: [] });
                }
            },

            clearCompletions: () => {
                set({ completions: [] });
            },

            // ==================================================================
            // SUMMARY ACTIONS
            // ==================================================================

            generateSummary: async (conversationId, messageCount, length) => {
                set({ isGeneratingSummary: true, error: null });
                try {
                    const summary = generateSummaryLocal(
                        conversationId,
                        'Conversation',
                        messageCount,
                        length
                    );
                    summary.status = SummaryStatus.COMPLETED;

                    await saveSummary(summary);

                    const summaries = get().summaries;
                    set({
                        summaries: [summary, ...summaries],
                        isGeneratingSummary: false,
                    });

                    // Update stats (immutable)
                    const currentStats = get().stats || { ...DEFAULT_STATS };
                    set({ stats: { ...currentStats, summaries_generated: currentStats.summaries_generated + 1 } });

                    logger.info('Summary generated for:', conversationId);
                } catch (err) {
                    logger.error('Failed to generate summary', err);
                    set({
                        error: err instanceof Error ? err.message : 'Failed to generate summary',
                        isGeneratingSummary: false,
                    });
                }
            },

            loadSummaries: async () => {
                try {
                    const summaries = await getSavedSummaries();
                    set({ summaries });
                    logger.info('Summaries loaded:', summaries.length);
                } catch (err) {
                    logger.error('Failed to load summaries', err);
                }
            },

            deleteSummary: (summaryId) => {
                set({ summaries: get().summaries.filter(s => s.id !== summaryId) });
                deleteSavedSummary(summaryId);
                logger.info('Summary deleted:', summaryId);
            },

            // ==================================================================
            // TONE ACTIONS
            // ==================================================================

            analyzeTone: async (messageId, content) => {
                set({ isAnalyzingTone: true });
                try {
                    const analysis = analyzeToneLocal(messageId, content);
                    set({ currentTone: analysis, isAnalyzingTone: false });
                    logger.info('Tone analyzed:', analysis.primary_tone);
                } catch (err) {
                    logger.error('Failed to analyze tone', err);
                    set({ isAnalyzingTone: false });
                }
            },

            clearTone: () => {
                set({ currentTone: null });
            },

            // ==================================================================
            // TEMPLATE ACTIONS
            // ==================================================================

            loadTemplates: async () => {
                try {
                    const templates = await getTemplates();
                    set({ templates });
                    logger.info('Templates loaded:', templates.length);
                } catch (err) {
                    logger.error('Failed to load templates', err);
                }
            },

            createTemplate: async (title, content, category) => {
                try {
                    const template = await createTemplateApi(title, content, category);
                    set({ templates: [...get().templates, template] });
                    logger.info('Template created:', template.id);
                } catch (err) {
                    logger.error('Failed to create template', err);
                    set({
                        error: err instanceof Error ? err.message : 'Failed to create template',
                    });
                }
            },

            deleteTemplate: (templateId) => {
                set({ templates: get().templates.filter(t => t.id !== templateId) });
                deleteTemplateApi(templateId);
                logger.info('Template deleted:', templateId);
            },

            toggleFavorite: (templateId) => {
                const templates = get().templates.map(t =>
                    t.id === templateId ? { ...t, is_favorite: !t.is_favorite } : t
                );
                set({ templates });
                toggleTemplateFavorite(templateId);
            },

            useTemplate: (templateId, variables) => {
                const template = get().templates.find(t => t.id === templateId);
                if (!template) return '';

                incrementTemplateUsage(templateId);
                recordSuggestionUsed(SuggestionType.TEMPLATE);

                // Update usage count locally
                const templates = get().templates.map(t =>
                    t.id === templateId ? { ...t, usage_count: t.usage_count + 1 } : t
                );
                set({ templates });

                return applyTemplateVariables(template.content, variables);
            },

            setTemplateCategory: (category) => {
                set({ selectedTemplateCategory: category });
            },

            // ==================================================================
            // PREFERENCES ACTIONS
            // ==================================================================

            updatePreferences: (prefs) => {
                const current = get().preferences;
                const updated = { ...current, ...prefs };
                set({ preferences: updated });
                savePreferences(updated);
                logger.info('Preferences updated');
            },

            // ==================================================================
            // STATS ACTIONS
            // ==================================================================

            loadStats: async () => {
                try {
                    const stats = await getStats();
                    set({ stats });
                    logger.info('Stats loaded');
                } catch (err) {
                    logger.error('Failed to load stats', err);
                }
            },

            // ==================================================================
            // UTILITY ACTIONS
            // ==================================================================

            clearError: () => {
                set({ error: null });
            },

            reset: () => {
                set({
                    smartReplies: [],
                    completions: [],
                    summaries: [],
                    templates: [],
                    stats: null,
                    preferences: { ...DEFAULT_PREFERENCES },
                    isLoadingSuggestions: false,
                    isGeneratingSummary: false,
                    isAnalyzingTone: false,
                    currentTone: null,
                    selectedTemplateCategory: null,
                    error: null,
                });
                logger.info('Store reset');
            },
        }),
        {
            name: 'imuchat-suggestions-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                preferences: state.preferences,
                selectedTemplateCategory: state.selectedTemplateCategory,
            }),
        }
    )
);
