/**
 * Types pour le module Suggestions Intelligentes
 *
 * Couvre :
 *  - Smart Reply : suggestions de réponses rapides contextuelles
 *  - Auto-complétion de phrases
 *  - Résumé automatisé de conversations
 *  - Détection de ton / sentiment
 *  - Templates de messages intelligents
 *
 * Phase 3 — Groupe 9 IA (Features 9.2 + 9.3)
 */

// ============================================================================
// ENUMS
// ============================================================================

/** Type de suggestion */
export enum SuggestionType {
  SMART_REPLY = 'smart_reply',
  COMPLETION = 'completion',
  TEMPLATE = 'template',
  ACTION = 'action',
}

/** Catégorie de ton émotionnel */
export enum ToneCategory {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
  QUESTION = 'question',
  URGENT = 'urgent',
  FORMAL = 'formal',
  CASUAL = 'casual',
  HUMOROUS = 'humorous',
}

/** Catégorie de template */
export enum TemplateCategory {
  GREETING = 'greeting',
  FAREWELL = 'farewell',
  THANKS = 'thanks',
  APOLOGY = 'apology',
  INVITATION = 'invitation',
  CONFIRMATION = 'confirmation',
  QUESTION_TEMPLATE = 'question',
  ANNOUNCEMENT = 'announcement',
  CONGRATULATIONS = 'congratulations',
  CUSTOM = 'custom',
}

/** Source du modèle de suggestion */
export enum SuggestionSource {
  LOCAL = 'local',
  LLM = 'llm',
  PATTERN = 'pattern',
  HISTORY = 'history',
}

/** Statut d'un résumé */
export enum SummaryStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/** Longueur du résumé */
export enum SummaryLength {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
}

// ============================================================================
// INTERFACES — SMART REPLY
// ============================================================================

/** Suggestion de réponse rapide */
export interface SmartReply {
  id: string;
  text: string;
  type: SuggestionType;
  confidence: number;
  tone: ToneCategory;
  source: SuggestionSource;
  created_at: string;
}

/** Contexte de message pour générer des suggestions */
export interface MessageContext {
  message_id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  conversation_id: string;
  is_group: boolean;
  timestamp: string;
  previous_messages: ContextMessage[];
}

/** Message de contexte simplifié */
export interface ContextMessage {
  content: string;
  sender_id: string;
  sender_name: string;
  is_own: boolean;
  timestamp: string;
}

// ============================================================================
// INTERFACES — AUTO-COMPLÉTION
// ============================================================================

/** Suggestion d'auto-complétion */
export interface CompletionSuggestion {
  id: string;
  text: string;
  full_text: string;
  confidence: number;
  source: SuggestionSource;
}

// ============================================================================
// INTERFACES — RÉSUMÉ CONVERSATION
// ============================================================================

/** Résumé d'une conversation */
export interface ConversationSummary {
  id: string;
  conversation_id: string;
  conversation_name: string;
  summary: string;
  key_points: string[];
  participants: string[];
  message_count: number;
  time_range: TimeRange;
  topics: string[];
  action_items: ActionItem[];
  sentiment: ToneCategory;
  status: SummaryStatus;
  length: SummaryLength;
  created_at: string;
  updated_at: string;
}

/** Plage temporelle */
export interface TimeRange {
  start: string;
  end: string;
}

/** Point d'action extrait */
export interface ActionItem {
  id: string;
  text: string;
  assignee: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

// ============================================================================
// INTERFACES — DÉTECTION DE TON
// ============================================================================

/** Résultat d'analyse de ton */
export interface ToneAnalysis {
  id: string;
  message_id: string;
  primary_tone: ToneCategory;
  secondary_tone: ToneCategory | null;
  confidence: number;
  emotions: EmotionScore[];
  language: string;
}

/** Score d'émotion */
export interface EmotionScore {
  emotion: string;
  score: number;
}

// ============================================================================
// INTERFACES — TEMPLATES
// ============================================================================

/** Template de message */
export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: TemplateCategory;
  language: string;
  variables: TemplateVariable[];
  usage_count: number;
  is_custom: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

/** Variable dans un template */
export interface TemplateVariable {
  name: string;
  placeholder: string;
  default_value: string;
}

// ============================================================================
// INTERFACES — PRÉFÉRENCES
// ============================================================================

/** Préférences de suggestions */
export interface SuggestionsPreferences {
  smart_reply_enabled: boolean;
  auto_completion_enabled: boolean;
  tone_detection_enabled: boolean;
  max_suggestions: number;
  preferred_tone: ToneCategory;
  preferred_length: 'short' | 'medium' | 'long';
  language: string;
  use_llm: boolean;
  show_confidence: boolean;
}

// ============================================================================
// INTERFACES — STATISTIQUES
// ============================================================================

/** Statistiques d'utilisation des suggestions */
export interface SuggestionsStats {
  total_suggestions_shown: number;
  total_suggestions_used: number;
  acceptance_rate: number;
  most_used_type: SuggestionType;
  summaries_generated: number;
  templates_used: number;
  top_templates: string[];
  daily_usage: DailyUsage[];
}

/** Usage quotidien */
export interface DailyUsage {
  date: string;
  suggestions_shown: number;
  suggestions_used: number;
}

// ============================================================================
// INTERFACES — STORE STATE
// ============================================================================

/** État du store suggestions */
export interface SuggestionsStoreState {
  // Data
  smartReplies: SmartReply[];
  completions: CompletionSuggestion[];
  summaries: ConversationSummary[];
  templates: MessageTemplate[];
  stats: SuggestionsStats | null;
  preferences: SuggestionsPreferences;

  // UI State
  isLoadingSuggestions: boolean;
  isGeneratingSummary: boolean;
  isAnalyzingTone: boolean;
  currentTone: ToneAnalysis | null;
  selectedTemplateCategory: TemplateCategory | null;
  error: string | null;

  // Actions — Smart Reply
  generateSmartReplies: (context: MessageContext) => Promise<void>;
  acceptSuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;
  clearSmartReplies: () => void;

  // Actions — Completion
  generateCompletion: (partialText: string, context: MessageContext) => Promise<void>;
  clearCompletions: () => void;

  // Actions — Summary
  generateSummary: (conversationId: string, messageCount: number, length: SummaryLength) => Promise<void>;
  loadSummaries: () => Promise<void>;
  deleteSummary: (summaryId: string) => void;

  // Actions — Tone
  analyzeTone: (messageId: string, content: string) => Promise<void>;
  clearTone: () => void;

  // Actions — Templates
  loadTemplates: () => Promise<void>;
  createTemplate: (title: string, content: string, category: TemplateCategory) => Promise<void>;
  deleteTemplate: (templateId: string) => void;
  toggleFavorite: (templateId: string) => void;
  useTemplate: (templateId: string, variables: Record<string, string>) => string;
  setTemplateCategory: (category: TemplateCategory | null) => void;

  // Actions — Preferences
  updatePreferences: (prefs: Partial<SuggestionsPreferences>) => void;

  // Actions — Stats
  loadStats: () => Promise<void>;

  // Actions — Utilities
  clearError: () => void;
  reset: () => void;
}
