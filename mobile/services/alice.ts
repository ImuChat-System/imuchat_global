/**
 * Service client Alice IA
 *
 * Communique avec le backend platform-core pour :
 *  - Envoyer des messages à Alice (multi-provider)
 *  - Récupérer les personas et fournisseurs
 *  - Valider la configuration d'un fournisseur
 *
 * Pour les providers locaux (Ollama, LM Studio), le client
 * communique directement avec l'endpoint local (pas de proxy backend).
 */

import { createLogger } from "./logger";
import { supabase } from "./supabase";

const log = createLogger("Alice");

const PLATFORM_CORE_URL =
    (process.env as Record<string, string | undefined>)[
    "EXPO_PUBLIC_PLATFORM_CORE_URL"
    ] || "http://localhost:8080";

// ============================================================================
// TYPES
// ============================================================================

export enum AliceProvider {
    OPENAI = "openai",
    ANTHROPIC = "anthropic",
    GOOGLE = "google",
    MISTRAL = "mistral",
    GROQ = "groq",
    CUSTOM = "custom",
}

export interface AliceMessage {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp?: string;
}

export interface AliceProviderConfig {
    apiKey?: string;
    baseUrl?: string;
    model: string;
}

export interface AliceChatRequest {
    message: string;
    conversationId?: string;
    persona?: string;
    provider: AliceProvider;
    providerConfig?: AliceProviderConfig;
    history?: AliceMessage[];
}

export interface AliceChatResponse {
    message: AliceMessage;
    conversationId: string;
    provider: AliceProvider;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface AlicePersona {
    id: string;
    name: string;
    description: string;
    icon: string;
    suggestedTemperature: number;
}

export interface AliceProviderInfo {
    id: AliceProvider;
    name: string;
    models: string[];
    requiresApiKey: boolean;
    supportsCustomUrl: boolean;
}

export interface ProviderValidationResult {
    valid: boolean;
    error?: string;
    models?: string[];
}

/** Noms lisibles côté client */
export const PROVIDER_DISPLAY_NAMES: Record<AliceProvider, string> = {
    [AliceProvider.OPENAI]: "OpenAI",
    [AliceProvider.ANTHROPIC]: "Anthropic (Claude)",
    [AliceProvider.GOOGLE]: "Google Gemini",
    [AliceProvider.MISTRAL]: "Mistral AI",
    [AliceProvider.GROQ]: "Groq",
    [AliceProvider.CUSTOM]: "Custom (OpenAI-compatible)",
};

/** Descriptions pour l'UI */
export const PROVIDER_DESCRIPTIONS: Record<AliceProvider, string> = {
    [AliceProvider.OPENAI]: "GPT-4o, GPT-4, GPT-3.5",
    [AliceProvider.ANTHROPIC]: "Claude Sonnet, Haiku, Opus",
    [AliceProvider.GOOGLE]: "Gemini 2.0, Gemini 1.5",
    [AliceProvider.MISTRAL]: "Mistral Large, Codestral",
    [AliceProvider.GROQ]: "Llama 3.3, Mixtral (ultra-rapide)",
    [AliceProvider.CUSTOM]: "Ollama, LM Studio, vLLM, etc.",
};

/** Icônes par provider */
export const PROVIDER_ICONS: Record<AliceProvider, string> = {
    [AliceProvider.OPENAI]: "logo-electron",
    [AliceProvider.ANTHROPIC]: "sparkles",
    [AliceProvider.GOOGLE]: "logo-google",
    [AliceProvider.MISTRAL]: "flash",
    [AliceProvider.GROQ]: "rocket",
    [AliceProvider.CUSTOM]: "server",
};

// ============================================================================
// AUTH
// ============================================================================

async function getAuthToken(): Promise<string | null> {
    try {
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token || null;
    } catch {
        return null;
    }
}

// ============================================================================
// API — CHAT
// ============================================================================

/**
 * Envoie un message à Alice via le backend.
 * Pour les providers locaux/custom avec une URL locale, communique directement.
 */
export async function sendMessageToAlice(
    request: AliceChatRequest,
): Promise<AliceChatResponse> {
    // Si provider custom avec URL locale → appel direct (pas de proxy backend)
    if (
        request.provider === AliceProvider.CUSTOM &&
        request.providerConfig?.baseUrl &&
        isLocalUrl(request.providerConfig.baseUrl)
    ) {
        return callLocalProvider(request);
    }

    // Sinon → proxy via backend
    return callBackendProxy(request);
}

/**
 * Appel via le backend platform-core (pour providers cloud)
 */
async function callBackendProxy(
    request: AliceChatRequest,
): Promise<AliceChatResponse> {
    const token = await getAuthToken();
    if (!token) {
        throw new Error("Not authenticated");
    }

    log.info(
        `Sending message via backend → ${request.provider}/${request.providerConfig?.model ?? "default"}`,
    );

    const response = await fetch(`${PLATFORM_CORE_URL}/api/v1/alice/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
            error.error || `Alice API error: ${response.status}`,
        );
    }

    return response.json();
}

/**
 * Appel direct vers un provider local (Ollama, LM Studio, etc.)
 * Format OpenAI-compatible
 */
async function callLocalProvider(
    request: AliceChatRequest,
): Promise<AliceChatResponse> {
    const { providerConfig, message, history = [], persona } = request;
    const baseUrl = providerConfig.baseUrl!;

    log.info(`Direct call to local provider: ${baseUrl}/${providerConfig.model}`);

    // Construire messages au format OpenAI
    const messages: Array<{ role: string; content: string }> = [];

    // System prompt pour la persona
    const PERSONA_PROMPTS: Record<string, string> = {
        general:
            "Tu es Alice, l'assistante IA d'ImuChat. Tu es amicale, précise et serviable.",
        health: "Tu es un conseiller en santé et bien-être. Rappelle de consulter un professionnel si nécessaire.",
        study: "Tu es un tuteur pédagogue. Guide l'utilisateur étape par étape.",
        style: "Tu es un conseiller en mode et style de vie, créatif et inspirant.",
        pro: "Tu es un assistant professionnel expert et structuré.",
        code: "Tu es un développeur senior. Fournis du code propre et documenté.",
        creative:
            "Tu es un écrivain créatif. Crée du contenu original et engageant.",
    };

    const systemPrompt =
        PERSONA_PROMPTS[persona || "general"] || PERSONA_PROMPTS.general;
    messages.push({ role: "system", content: systemPrompt });

    // Historique
    for (const msg of history.slice(-50)) {
        messages.push({ role: msg.role, content: msg.content });
    }

    // Nouveau message
    messages.push({ role: "user", content: message });

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(providerConfig.apiKey
                ? { Authorization: `Bearer ${providerConfig.apiKey}` }
                : {}),
        },
        body: JSON.stringify({
            model: providerConfig.model,
            messages,
            temperature: 0.7,
            max_tokens: 4096,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
            error.error?.message ||
            `Local provider error: ${response.status}`,
        );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("Empty response from local provider");
    }

    return {
        message: {
            role: "assistant",
            content,
            timestamp: new Date().toISOString(),
        },
        conversationId:
            request.conversationId ||
            `alice_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        provider: AliceProvider.CUSTOM,
        model: data.model || providerConfig.model,
        usage: data.usage
            ? {
                promptTokens: data.usage.prompt_tokens || 0,
                completionTokens: data.usage.completion_tokens || 0,
                totalTokens: data.usage.total_tokens || 0,
            }
            : undefined,
    };
}

// ============================================================================
// API — PERSONAS
// ============================================================================

/** Récupère les personas disponibles */
export async function getPersonas(): Promise<AlicePersona[]> {
    try {
        const response = await fetch(
            `${PLATFORM_CORE_URL}/api/v1/alice/personas`,
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.personas || data;
    } catch (error) {
        log.warn("Failed to fetch personas, using fallback");
        return FALLBACK_PERSONAS;
    }
}

/** Récupère les fournisseurs disponibles */
export async function getProviders(): Promise<AliceProviderInfo[]> {
    try {
        const response = await fetch(
            `${PLATFORM_CORE_URL}/api/v1/alice/providers`,
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.providers || data;
    } catch (error) {
        log.warn("Failed to fetch providers, using fallback");
        return FALLBACK_PROVIDERS;
    }
}

/** Valide la configuration d'un fournisseur */
export async function validateProvider(
    provider: AliceProvider,
    apiKey?: string,
    baseUrl?: string,
): Promise<ProviderValidationResult> {
    // Pour les providers locaux, test direct
    if (provider === AliceProvider.CUSTOM && baseUrl && isLocalUrl(baseUrl)) {
        return validateLocalProvider(baseUrl, apiKey);
    }

    const token = await getAuthToken();
    if (!token) {
        return { valid: false, error: "Not authenticated" };
    }

    try {
        const response = await fetch(
            `${PLATFORM_CORE_URL}/api/v1/alice/provider/validate`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ provider, apiKey, baseUrl }),
            },
        );

        return response.json();
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : "Validation failed",
        };
    }
}

/** Validation directe d'un endpoint local */
async function validateLocalProvider(
    baseUrl: string,
    apiKey?: string,
): Promise<ProviderValidationResult> {
    try {
        const response = await fetch(`${baseUrl}/models`, {
            headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        });

        if (!response.ok) {
            return {
                valid: false,
                error: `Cannot connect: HTTP ${response.status}`,
            };
        }

        const data = await response.json();
        const models = (data.data || data.models || []).map(
            (m: { id?: string; name?: string }) => m.id || m.name || "unknown",
        );

        return { valid: true, models };
    } catch (error) {
        return {
            valid: false,
            error:
                error instanceof Error
                    ? `Connection failed: ${error.message}`
                    : "Cannot connect to local provider",
        };
    }
}

// ============================================================================
// HELPERS
// ============================================================================

/** Détecte si une URL pointe vers un service local */
function isLocalUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();
        return (
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "0.0.0.0" ||
            hostname.startsWith("192.168.") ||
            hostname.startsWith("10.") ||
            hostname.endsWith(".local")
        );
    } catch {
        return false;
    }
}

// ============================================================================
// FALLBACKS (offline)
// ============================================================================

export const FALLBACK_PERSONAS: AlicePersona[] = [
    {
        id: "general",
        name: "Alice",
        description: "Assistante polyvalente et amicale",
        icon: "chatbubble-ellipses",
        suggestedTemperature: 0.7,
    },
    {
        id: "health",
        name: "Bien-être",
        description: "Conseiller santé & bien-être",
        icon: "heart",
        suggestedTemperature: 0.6,
    },
    {
        id: "study",
        name: "Études",
        description: "Aide aux études & apprentissage",
        icon: "school",
        suggestedTemperature: 0.5,
    },
    {
        id: "style",
        name: "Style",
        description: "Conseiller mode & style de vie",
        icon: "shirt",
        suggestedTemperature: 0.8,
    },
    {
        id: "pro",
        name: "Pro",
        description: "Assistant professionnel",
        icon: "briefcase",
        suggestedTemperature: 0.5,
    },
    {
        id: "code",
        name: "Développeur",
        description: "Expert en programmation",
        icon: "code-slash",
        suggestedTemperature: 0.3,
    },
    {
        id: "creative",
        name: "Créatif",
        description: "Écrivain & créateur de contenu",
        icon: "color-palette",
        suggestedTemperature: 0.9,
    },
];

export const FALLBACK_PROVIDERS: AliceProviderInfo[] = [
    {
        id: AliceProvider.OPENAI,
        name: "OpenAI",
        models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
        requiresApiKey: true,
        supportsCustomUrl: false,
    },
    {
        id: AliceProvider.ANTHROPIC,
        name: "Anthropic (Claude)",
        models: [
            "claude-sonnet-4-20250514",
            "claude-3-5-sonnet-20241022",
            "claude-3-5-haiku-20241022",
        ],
        requiresApiKey: true,
        supportsCustomUrl: false,
    },
    {
        id: AliceProvider.GOOGLE,
        name: "Google Gemini",
        models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
        requiresApiKey: true,
        supportsCustomUrl: false,
    },
    {
        id: AliceProvider.MISTRAL,
        name: "Mistral AI",
        models: [
            "mistral-large-latest",
            "mistral-small-latest",
            "codestral-latest",
        ],
        requiresApiKey: true,
        supportsCustomUrl: false,
    },
    {
        id: AliceProvider.GROQ,
        name: "Groq",
        models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
        requiresApiKey: true,
        supportsCustomUrl: false,
    },
    {
        id: AliceProvider.CUSTOM,
        name: "Custom (OpenAI-compatible)",
        models: [],
        requiresApiKey: false,
        supportsCustomUrl: true,
    },
];
