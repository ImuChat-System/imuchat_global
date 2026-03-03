/**
 * AI Administration Store (Zustand) — DEV-035
 *
 * Manages the AI admin portal state:
 *  - Global assistant toggle
 *  - Personas CRUD
 *  - AI memory entries (view / delete)
 *  - Audit log
 *  - Tool permissions
 *  - Auto-summary settings
 *  - Moderation configuration
 *
 * Persisted via AsyncStorage.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createLogger } from "@/services/logger";
import type {
    AIAdminState,
    AIAuditEntry,
    AIMemoryEntry,
    AIPersona,
    AIPersonaFormData,
    AITool,
    AIToolPermission,
    AuditAction,
    AuditSeverity,
    AutoSummarySettings,
    ContentCategory,
    ModerationRule,
    ModerationSettings
} from "@/types/ai-admin";

const logger = createLogger("AIAdminStore");

// ============================================================================
// HELPERS
// ============================================================================

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const BUILT_IN_PERSONAS: AIPersona[] = [
    {
        id: "general",
        name: "Alice",
        description: "Assistante polyvalente et amicale",
        icon: "sparkles",
        color: "#8B5CF6",
        systemPrompt: "Tu es Alice, l'assistante IA d'ImuChat.",
        temperature: 0.7,
        isBuiltIn: true,
        isActive: true,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
    },
    {
        id: "health",
        name: "Bien-être",
        description: "Conseiller santé & bien-être",
        icon: "heart",
        color: "#EF4444",
        systemPrompt: "Tu es un conseiller en santé et bien-être.",
        temperature: 0.6,
        isBuiltIn: true,
        isActive: true,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
    },
    {
        id: "study",
        name: "Études",
        description: "Aide aux études & apprentissage",
        icon: "school",
        color: "#3B82F6",
        systemPrompt: "Tu es un tuteur pédagogue et patient.",
        temperature: 0.5,
        isBuiltIn: true,
        isActive: true,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
    },
    {
        id: "style",
        name: "Style",
        description: "Conseiller mode & style de vie",
        icon: "shirt",
        color: "#EC4899",
        systemPrompt: "Tu es un conseiller en mode et style de vie.",
        temperature: 0.8,
        isBuiltIn: true,
        isActive: true,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
    },
    {
        id: "pro",
        name: "Pro",
        description: "Assistant professionnel",
        icon: "briefcase",
        color: "#F59E0B",
        systemPrompt: "Tu es un assistant professionnel expert.",
        temperature: 0.5,
        isBuiltIn: true,
        isActive: true,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
    },
    {
        id: "code",
        name: "Développeur",
        description: "Expert en programmation",
        icon: "code-slash",
        color: "#10B981",
        systemPrompt: "Tu es un développeur senior expert.",
        temperature: 0.3,
        isBuiltIn: true,
        isActive: true,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
    },
    {
        id: "creative",
        name: "Créatif",
        description: "Écrivain & créateur de contenu",
        icon: "color-palette",
        color: "#6366F1",
        systemPrompt: "Tu es un écrivain créatif talentueux.",
        temperature: 0.9,
        isBuiltIn: true,
        isActive: true,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
    },
];

const DEFAULT_TOOL_PERMISSIONS: AIToolPermission[] = [
    { tool: "web_search", enabled: true, requireConfirmation: false, lastUsedAt: null, usageCount: 0 },
    { tool: "code_execution", enabled: false, requireConfirmation: true, lastUsedAt: null, usageCount: 0 },
    { tool: "file_access", enabled: false, requireConfirmation: true, lastUsedAt: null, usageCount: 0 },
    { tool: "calendar_access", enabled: false, requireConfirmation: true, lastUsedAt: null, usageCount: 0 },
    { tool: "contacts_access", enabled: false, requireConfirmation: true, lastUsedAt: null, usageCount: 0 },
    { tool: "location_access", enabled: false, requireConfirmation: true, lastUsedAt: null, usageCount: 0 },
    { tool: "media_generation", enabled: true, requireConfirmation: false, lastUsedAt: null, usageCount: 0 },
    { tool: "translation", enabled: true, requireConfirmation: false, lastUsedAt: null, usageCount: 0 },
    { tool: "summarization", enabled: true, requireConfirmation: false, lastUsedAt: null, usageCount: 0 },
];

const DEFAULT_MODERATION_RULES: ModerationRule[] = [
    { category: "hate_speech", enabled: true, level: "high", action: "block" },
    { category: "violence", enabled: true, level: "medium", action: "warn" },
    { category: "sexual_content", enabled: true, level: "high", action: "block" },
    { category: "self_harm", enabled: true, level: "strict", action: "block" },
    { category: "dangerous_content", enabled: true, level: "high", action: "block" },
    { category: "spam", enabled: true, level: "medium", action: "flag" },
    { category: "misinformation", enabled: true, level: "low", action: "flag" },
];

const DEFAULT_AUTO_SUMMARY: AutoSummarySettings = {
    enabled: false,
    frequency: "daily",
    length: "medium",
    language: "auto",
    includeKeyPoints: true,
    includeActionItems: true,
    notifyOnComplete: false,
};

const DEFAULT_MODERATION: ModerationSettings = {
    globalEnabled: true,
    globalLevel: "medium",
    rules: DEFAULT_MODERATION_RULES,
    logModerationEvents: true,
    notifyOnBlock: true,
    allowOverride: false,
};

// ============================================================================
// STORE INTERFACE
// ============================================================================

export interface AIAdminActions {
    // Global
    toggleAssistant: (enabled: boolean) => void;

    // Personas
    addPersona: (data: AIPersonaFormData) => AIPersona;
    updatePersona: (id: string, data: Partial<AIPersonaFormData>) => void;
    deletePersona: (id: string) => void;
    togglePersona: (id: string, active: boolean) => void;

    // Memory
    toggleMemory: (enabled: boolean) => void;
    deleteMemoryEntry: (id: string) => void;
    deleteMemoryByCategory: (category: string) => void;
    clearAllMemory: () => void;
    addMemoryEntry: (entry: Omit<AIMemoryEntry, "id" | "createdAt">) => void;

    // Audit
    toggleAudit: (enabled: boolean) => void;
    addAuditEntry: (action: AuditAction, severity: AuditSeverity, details: string, meta?: Record<string, string | number | boolean>) => void;
    clearAuditLog: () => void;

    // Permissions
    toggleToolPermission: (tool: AITool, enabled: boolean) => void;
    setToolConfirmation: (tool: AITool, require: boolean) => void;

    // Auto-summary
    updateAutoSummary: (settings: Partial<AutoSummarySettings>) => void;

    // Moderation
    updateModeration: (settings: Partial<ModerationSettings>) => void;
    updateModerationRule: (category: ContentCategory, update: Partial<ModerationRule>) => void;

    // Loading
    setLoading: (loading: boolean) => void;
}

export type AIAdminStore = AIAdminState & AIAdminActions;

// ============================================================================
// STORE
// ============================================================================

export const useAIAdminStore = create<AIAdminStore>()(
    persist(
        (set, get) => ({
            // ── State ───────────────────────────────────────────────
            assistantEnabled: true,
            personas: [...BUILT_IN_PERSONAS],
            memoryEntries: [],
            memoryEnabled: true,
            auditLog: [],
            auditEnabled: true,
            toolPermissions: [...DEFAULT_TOOL_PERMISSIONS],
            autoSummary: { ...DEFAULT_AUTO_SUMMARY },
            moderation: { ...DEFAULT_MODERATION },
            isLoading: false,

            // ── Global ──────────────────────────────────────────────
            toggleAssistant: (enabled) => {
                logger.info(`Assistant ${enabled ? "enabled" : "disabled"}`);
                set({ assistantEnabled: enabled });
            },

            // ── Personas ────────────────────────────────────────────
            addPersona: (data) => {
                const now = new Date().toISOString();
                const persona: AIPersona = {
                    id: generateId(),
                    ...data,
                    isBuiltIn: false,
                    isActive: true,
                    createdAt: now,
                    updatedAt: now,
                };
                logger.info(`Persona added: ${persona.name}`);
                set((s) => ({ personas: [...s.personas, persona] }));
                return persona;
            },

            updatePersona: (id, data) => {
                set((s) => ({
                    personas: s.personas.map((p) =>
                        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p,
                    ),
                }));
            },

            deletePersona: (id) => {
                const persona = get().personas.find((p) => p.id === id);
                if (persona?.isBuiltIn) {
                    logger.warn("Cannot delete built-in persona");
                    return;
                }
                logger.info(`Persona deleted: ${id}`);
                set((s) => ({ personas: s.personas.filter((p) => p.id !== id) }));
            },

            togglePersona: (id, active) => {
                set((s) => ({
                    personas: s.personas.map((p) =>
                        p.id === id ? { ...p, isActive: active, updatedAt: new Date().toISOString() } : p,
                    ),
                }));
            },

            // ── Memory ──────────────────────────────────────────────
            toggleMemory: (enabled) => {
                logger.info(`Memory ${enabled ? "enabled" : "disabled"}`);
                set({ memoryEnabled: enabled });
            },

            addMemoryEntry: (entry) => {
                const full: AIMemoryEntry = {
                    ...entry,
                    id: generateId(),
                    createdAt: new Date().toISOString(),
                };
                set((s) => ({ memoryEntries: [...s.memoryEntries, full] }));
            },

            deleteMemoryEntry: (id) => {
                set((s) => ({ memoryEntries: s.memoryEntries.filter((m) => m.id !== id) }));
            },

            deleteMemoryByCategory: (category) => {
                logger.info(`Clearing memory category: ${category}`);
                set((s) => ({
                    memoryEntries: s.memoryEntries.filter((m) => m.category !== category),
                }));
            },

            clearAllMemory: () => {
                logger.info("All memory cleared");
                set({ memoryEntries: [] });
            },

            // ── Audit ───────────────────────────────────────────────
            toggleAudit: (enabled) => {
                set({ auditEnabled: enabled });
            },

            addAuditEntry: (action, severity, details, meta = {}) => {
                if (!get().auditEnabled) return;
                const entry: AIAuditEntry = {
                    id: generateId(),
                    action,
                    severity,
                    details,
                    metadata: meta,
                    provider: null,
                    model: null,
                    tokensUsed: 0,
                    timestamp: new Date().toISOString(),
                };
                set((s) => ({
                    auditLog: [entry, ...s.auditLog].slice(0, 500), // Keep last 500
                }));
            },

            clearAuditLog: () => {
                logger.info("Audit log cleared");
                set({ auditLog: [] });
            },

            // ── Permissions ─────────────────────────────────────────
            toggleToolPermission: (tool, enabled) => {
                set((s) => ({
                    toolPermissions: s.toolPermissions.map((tp) =>
                        tp.tool === tool ? { ...tp, enabled } : tp,
                    ),
                }));
            },

            setToolConfirmation: (tool, require) => {
                set((s) => ({
                    toolPermissions: s.toolPermissions.map((tp) =>
                        tp.tool === tool ? { ...tp, requireConfirmation: require } : tp,
                    ),
                }));
            },

            // ── Auto-summary ───────────────────────────────────────
            updateAutoSummary: (settings) => {
                set((s) => ({
                    autoSummary: { ...s.autoSummary, ...settings },
                }));
            },

            // ── Moderation ─────────────────────────────────────────
            updateModeration: (settings) => {
                set((s) => ({
                    moderation: { ...s.moderation, ...settings },
                }));
            },

            updateModerationRule: (category, update) => {
                set((s) => ({
                    moderation: {
                        ...s.moderation,
                        rules: s.moderation.rules.map((r) =>
                            r.category === category ? { ...r, ...update } : r,
                        ),
                    },
                }));
            },

            // ── Loading ─────────────────────────────────────────────
            setLoading: (loading) => set({ isLoading: loading }),
        }),
        {
            name: "ai-admin-storage",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                assistantEnabled: state.assistantEnabled,
                personas: state.personas,
                memoryEntries: state.memoryEntries,
                memoryEnabled: state.memoryEnabled,
                auditLog: state.auditLog,
                auditEnabled: state.auditEnabled,
                toolPermissions: state.toolPermissions,
                autoSummary: state.autoSummary,
                moderation: state.moderation,
            }),
        },
    ),
);
