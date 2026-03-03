/**
 * Support & Assistance Types
 *
 * Types pour le module Support & Assistance :
 * - Centre d'aide (articles / catégories)
 * - FAQ interactive
 * - Tickets support
 * - Chat support humain
 * - Statut incidents plateforme
 * - Roadmap publique (votes)
 * - Feedback utilisateur
 * - Beta features toggle
 *
 * Phase 3 — DEV-031
 */

// ---------------------------------------------------------------------------
// Centre d'aide & FAQ
// ---------------------------------------------------------------------------

export type ArticleCategory =
    | "getting-started"
    | "messaging"
    | "calls"
    | "communities"
    | "privacy"
    | "payments"
    | "account"
    | "troubleshooting";

export interface HelpArticle {
    id: string;
    title: string;
    summary: string;
    /** Markdown body */
    body: string;
    category: ArticleCategory;
    tags: string[];
    helpful: number;
    notHelpful: number;
    createdAt: string;
    updatedAt: string;
}

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: ArticleCategory;
    order: number;
}

// ---------------------------------------------------------------------------
// Tickets support
// ---------------------------------------------------------------------------

export type TicketStatus = "open" | "in-progress" | "waiting" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory =
    | "bug"
    | "feature-request"
    | "account"
    | "billing"
    | "security"
    | "other";

export interface TicketAttachment {
    id: string;
    filename: string;
    url: string;
    mimeType: string;
    sizeBytes: number;
}

export interface TicketMessage {
    id: string;
    ticketId: string;
    senderId: string;
    senderName: string;
    isStaff: boolean;
    body: string;
    attachments: TicketAttachment[];
    createdAt: string;
}

export interface SupportTicket {
    id: string;
    userId: string;
    subject: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    messages: TicketMessage[];
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
}

export interface CreateTicketPayload {
    subject: string;
    category: TicketCategory;
    priority: TicketPriority;
    body: string;
    attachments?: { filename: string; base64: string; mimeType: string }[];
}

// ---------------------------------------------------------------------------
// Chat support humain
// ---------------------------------------------------------------------------

export type ChatSupportStatus = "waiting" | "connected" | "ended";

export interface SupportChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    isAgent: boolean;
    body: string;
    createdAt: string;
}

export interface SupportChatSession {
    id: string;
    userId: string;
    agentId?: string;
    agentName?: string;
    status: ChatSupportStatus;
    messages: SupportChatMessage[];
    startedAt: string;
    endedAt?: string;
    /** Satisfaction rating 1-5, set after session ends */
    rating?: number;
}

// ---------------------------------------------------------------------------
// Statut incidents plateforme
// ---------------------------------------------------------------------------

export type IncidentSeverity = "minor" | "major" | "critical";
export type IncidentStatus =
    | "investigating"
    | "identified"
    | "monitoring"
    | "resolved";

export type AffectedService =
    | "messaging"
    | "calls"
    | "media"
    | "auth"
    | "payments"
    | "api"
    | "push-notifications";

export interface IncidentUpdate {
    id: string;
    status: IncidentStatus;
    message: string;
    createdAt: string;
}

export interface PlatformIncident {
    id: string;
    title: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    affectedServices: AffectedService[];
    updates: IncidentUpdate[];
    createdAt: string;
    resolvedAt?: string;
}

// ---------------------------------------------------------------------------
// Roadmap publique
// ---------------------------------------------------------------------------

export type RoadmapItemStatus = "planned" | "in-progress" | "completed" | "cancelled";
export type RoadmapCategory =
    | "messaging"
    | "calls"
    | "communities"
    | "ai"
    | "store"
    | "security"
    | "ux"
    | "other";

export interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    category: RoadmapCategory;
    status: RoadmapItemStatus;
    votes: number;
    /** Whether current user has voted */
    hasVoted: boolean;
    targetQuarter?: string;
    createdAt: string;
}

// ---------------------------------------------------------------------------
// Feedback utilisateur
// ---------------------------------------------------------------------------

export type FeedbackType = "bug" | "feature" | "improvement" | "compliment" | "other";
export type FeedbackMood = "very-unhappy" | "unhappy" | "neutral" | "happy" | "very-happy";

export interface UserFeedback {
    id: string;
    userId: string;
    type: FeedbackType;
    mood: FeedbackMood;
    title: string;
    body: string;
    screenshotUrl?: string;
    metadata?: {
        appVersion: string;
        platform: string;
        osVersion: string;
    };
    createdAt: string;
}

export interface CreateFeedbackPayload {
    type: FeedbackType;
    mood: FeedbackMood;
    title: string;
    body: string;
    screenshotBase64?: string;
}

// ---------------------------------------------------------------------------
// Beta features
// ---------------------------------------------------------------------------

export interface BetaFeature {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    /** Whether the user can toggle it (some are forced) */
    userToggleable: boolean;
    /** Stability indicator */
    stability: "experimental" | "beta" | "stable";
    addedAt: string;
}

// ---------------------------------------------------------------------------
// Aggregate Support State
// ---------------------------------------------------------------------------

export interface SupportState {
    // Help center
    helpArticles: HelpArticle[];
    faqItems: FAQItem[];
    helpSearchQuery: string;

    // Tickets
    tickets: SupportTicket[];
    currentTicket: SupportTicket | null;

    // Chat support
    chatSession: SupportChatSession | null;

    // Incidents
    incidents: PlatformIncident[];

    // Roadmap
    roadmapItems: RoadmapItem[];

    // Feedback
    feedbackHistory: UserFeedback[];

    // Beta features
    betaFeatures: BetaFeature[];

    // UI
    loading: boolean;
    error: string | null;
}
