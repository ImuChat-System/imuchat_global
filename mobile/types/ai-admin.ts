/**
 * AI Administration Types (DEV-035)
 *
 * Types for the AI administration portal:
 *  - Personas management
 *  - AI memory management
 *  - Audit logs
 *  - Tool permissions
 *  - Auto-summary settings
 *  - AI moderation configuration
 */

// ============================================================================
// PERSONAS
// ============================================================================

export interface AIPersona {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    systemPrompt: string;
    temperature: number;
    isBuiltIn: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AIPersonaFormData {
    name: string;
    description: string;
    icon: string;
    color: string;
    systemPrompt: string;
    temperature: number;
}

// ============================================================================
// MEMORY
// ============================================================================

export type MemoryCategory =
    | "preference"
    | "fact"
    | "conversation"
    | "context"
    | "instruction";

export interface AIMemoryEntry {
    id: string;
    category: MemoryCategory;
    content: string;
    source: string;
    conversationId: string | null;
    createdAt: string;
    expiresAt: string | null;
    isActive: boolean;
}

// ============================================================================
// AUDIT LOG
// ============================================================================

export type AuditAction =
    | "chat_sent"
    | "chat_received"
    | "persona_switched"
    | "memory_added"
    | "memory_deleted"
    | "provider_changed"
    | "tool_used"
    | "moderation_triggered"
    | "summary_generated"
    | "permission_changed";

export type AuditSeverity = "info" | "warning" | "error";

export interface AIAuditEntry {
    id: string;
    action: AuditAction;
    severity: AuditSeverity;
    details: string;
    metadata: Record<string, string | number | boolean>;
    provider: string | null;
    model: string | null;
    tokensUsed: number;
    timestamp: string;
}

// ============================================================================
// PERMISSIONS
// ============================================================================

export type AITool =
    | "web_search"
    | "code_execution"
    | "file_access"
    | "calendar_access"
    | "contacts_access"
    | "location_access"
    | "media_generation"
    | "translation"
    | "summarization";

export interface AIToolPermission {
    tool: AITool;
    enabled: boolean;
    requireConfirmation: boolean;
    lastUsedAt: string | null;
    usageCount: number;
}

// ============================================================================
// AUTO-SUMMARY
// ============================================================================

export type SummaryFrequency = "after_each" | "daily" | "weekly" | "manual";
export type SummaryLength = "short" | "medium" | "long";
export type SummaryLanguage = "auto" | "fr" | "en" | "ja";

export interface AutoSummarySettings {
    enabled: boolean;
    frequency: SummaryFrequency;
    length: SummaryLength;
    language: SummaryLanguage;
    includeKeyPoints: boolean;
    includeActionItems: boolean;
    notifyOnComplete: boolean;
}

// ============================================================================
// MODERATION
// ============================================================================

export type ModerationLevel = "off" | "low" | "medium" | "high" | "strict";

export type ContentCategory =
    | "hate_speech"
    | "violence"
    | "sexual_content"
    | "self_harm"
    | "dangerous_content"
    | "spam"
    | "misinformation";

export interface ModerationRule {
    category: ContentCategory;
    enabled: boolean;
    level: ModerationLevel;
    action: "warn" | "block" | "flag";
}

export interface ModerationSettings {
    globalEnabled: boolean;
    globalLevel: ModerationLevel;
    rules: ModerationRule[];
    logModerationEvents: boolean;
    notifyOnBlock: boolean;
    allowOverride: boolean;
}

// ============================================================================
// GLOBAL AI CONFIG
// ============================================================================

export interface AIAdminState {
    // Global toggle
    assistantEnabled: boolean;

    // Personas
    personas: AIPersona[];

    // Memory
    memoryEntries: AIMemoryEntry[];
    memoryEnabled: boolean;

    // Audit
    auditLog: AIAuditEntry[];
    auditEnabled: boolean;

    // Permissions
    toolPermissions: AIToolPermission[];

    // Auto-summary
    autoSummary: AutoSummarySettings;

    // Moderation
    moderation: ModerationSettings;

    // UI state
    isLoading: boolean;
}
