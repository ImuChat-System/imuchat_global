/**
 * ImuAI Gateway Client — Service mobile
 *
 * Client HTTP pour l'ImuAI Gateway (platform-core).
 * Abstraction complète : le mobile ne connaît pas le provider LLM utilisé.
 *
 * Le Gateway gère :
 * - Routing intelligent (coût / latence / complexité)
 * - Cache (traductions, résumés, réponses similaires)
 * - Fallback automatique entre providers
 * - Cost tracking
 *
 * Endpoints utilisés :
 *   POST /api/v1/ai/process    — Requête générique
 *   POST /api/v1/ai/chat       — Chat conversationnel
 *   POST /api/v1/ai/translate   — Traduction
 *   POST /api/v1/ai/summarize   — Résumé
 *   POST /api/v1/ai/moderate    — Modération
 *   POST /api/v1/ai/classify    — Classification
 *   POST /api/v1/ai/sentiment   — Analyse de sentiment
 */

import { createLogger } from './logger';
import { supabase } from './supabase';

const log = createLogger('AIGateway');

const PLATFORM_CORE_URL =
    (process.env as Record<string, string | undefined>)[
    'EXPO_PUBLIC_PLATFORM_CORE_URL'
    ] || 'http://localhost:8080';

// ============================================================================
// TYPES
// ============================================================================

/** Types de tâches IA (miroir du backend) */
export enum AITaskType {
    CHAT = 'chat',
    TRANSLATION = 'translation',
    SUMMARY = 'summary',
    MODERATION = 'moderation',
    CLASSIFICATION = 'classification',
    COMPLETION = 'completion',
    CREATIVE = 'creative',
    SENTIMENT = 'sentiment',
}

/** Complexité de la tâche */
export enum AITaskComplexity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

/** Priorité de routage */
export enum RoutingPriority {
    COST = 'cost',
    LATENCY = 'latency',
    QUALITY = 'quality',
    PRIVACY = 'privacy',
}

/** Réponse du Gateway */
export interface GatewayResponse {
    success: boolean;
    content: string;
    provider: string;
    model: string;
    taskType: string;
    complexity: string;
    cached: boolean;
    conversationId?: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    estimatedCost?: number;
    latencyMs: number;
    metadata?: Record<string, unknown>;
}

/** Statistiques du Gateway */
export interface GatewayStats {
    totalRequests: number;
    totalCost: number;
    cacheHits: number;
    cacheMisses: number;
    cacheHitRate: number;
    requestsByProvider: Record<string, number>;
    requestsByTaskType: Record<string, number>;
    averageLatencyMs: number;
    currentPhase: string;
}

/** Message de conversation */
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
}

// ============================================================================
// AUTH HELPER
// ============================================================================

async function getAuthToken(): Promise<string | null> {
    try {
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token ?? null;
    } catch {
        return null;
    }
}

async function makeAuthHeaders(): Promise<Record<string, string>> {
    const token = await getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Appel générique au Gateway IA.
 * Le Gateway route automatiquement vers le meilleur provider.
 */
export async function processAI(request: {
    taskType: AITaskType;
    content: string;
    complexity?: AITaskComplexity;
    routingPriority?: RoutingPriority;
    forceProvider?: string;
    forceModel?: string;
    persona?: string;
    conversationId?: string;
    history?: ChatMessage[];
    sourceLanguage?: string;
    targetLanguage?: string;
    summaryLength?: 'short' | 'medium' | 'long';
    options?: {
        temperature?: number;
        maxTokens?: number;
        useCache?: boolean;
        cacheTtlSeconds?: number;
    };
}): Promise<GatewayResponse> {
    const headers = await makeAuthHeaders();

    const response = await fetch(`${PLATFORM_CORE_URL}/api/v1/ai/process`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `AI Gateway error: ${response.status}`);
    }

    return response.json();
}

// ============================================================================
// CONVENIENCE METHODS
// ============================================================================

/**
 * Traduction via le Gateway.
 * Le provider est auto-sélectionné. Les résultats sont cachés côté serveur.
 */
export async function translateViaGateway(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string,
): Promise<GatewayResponse> {
    const headers = await makeAuthHeaders();

    const response = await fetch(`${PLATFORM_CORE_URL}/api/v1/ai/translate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text, targetLanguage, sourceLanguage }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Translation failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Résumé via le Gateway.
 * Routing intelligent : textes courts → modèle léger, longs → premium.
 */
export async function summarizeViaGateway(
    text: string,
    length: 'short' | 'medium' | 'long' = 'medium',
): Promise<GatewayResponse> {
    const headers = await makeAuthHeaders();

    const response = await fetch(`${PLATFORM_CORE_URL}/api/v1/ai/summarize`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text, length }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Summarization failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Modération de contenu via le Gateway.
 * Tâche légère → provider le moins cher.
 */
export async function moderateViaGateway(text: string): Promise<GatewayResponse> {
    const headers = await makeAuthHeaders();

    const response = await fetch(`${PLATFORM_CORE_URL}/api/v1/ai/moderate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Moderation failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Chat via le Gateway.
 * Le routing dépend de la complexité (historique, longueur).
 */
export async function chatViaGateway(
    message: string,
    options?: {
        persona?: string;
        conversationId?: string;
        provider?: string;
        model?: string;
        /** Mode mémoire : 'short' (défaut, 6 msgs), 'long' (opt-in, 30 msgs), 'full', ou nombre */
        memoryMode?: 'short' | 'long' | 'full' | number;
        history?: ChatMessage[];
    },
): Promise<GatewayResponse> {
    const headers = await makeAuthHeaders();

    const response = await fetch(`${PLATFORM_CORE_URL}/api/v1/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            message,
            persona: options?.persona,
            conversationId: options?.conversationId,
            provider: options?.provider,
            model: options?.model,
            memoryMode: options?.memoryMode,
            history: options?.history,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Chat failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Classification de texte via le Gateway.
 */
export async function classifyViaGateway(text: string): Promise<GatewayResponse> {
    const headers = await makeAuthHeaders();

    const response = await fetch(`${PLATFORM_CORE_URL}/api/v1/ai/classify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Classification failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Analyse de sentiment via le Gateway.
 */
export async function analyzeSentimentViaGateway(text: string): Promise<GatewayResponse> {
    const headers = await makeAuthHeaders();

    const response = await fetch(`${PLATFORM_CORE_URL}/api/v1/ai/sentiment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Sentiment analysis failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Statistiques du Gateway (admin).
 */
export async function getGatewayStats(): Promise<GatewayStats> {
    const headers = await makeAuthHeaders();

    const response = await fetch(`${PLATFORM_CORE_URL}/api/v1/ai/stats`, {
        headers,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
    }

    return response.json();
}

/**
 * Phase stratégique actuelle du Gateway.
 */
export async function getGatewayPhase(): Promise<{
    currentPhase: string;
    phases: Record<string, string>;
}> {
    const headers = await makeAuthHeaders();

    const response = await fetch(`${PLATFORM_CORE_URL}/api/v1/ai/phase`, {
        headers,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch phase: ${response.status}`);
    }

    return response.json();
}
