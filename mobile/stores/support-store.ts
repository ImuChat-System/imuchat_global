/**
 * Support & Assistance Store (Zustand + AsyncStorage persist)
 *
 * Gère le module Support & Assistance :
 * - Centre d'aide & FAQ (articles, recherche)
 * - Tickets support (CRUD, messages)
 * - Chat support humain (session temps réel)
 * - Statut incidents plateforme
 * - Roadmap publique (items + votes)
 * - Feedback utilisateur
 * - Beta features toggle
 *
 * Phase 3 — DEV-031
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
    BetaFeature,
    ChatSupportStatus,
    FAQItem,
    HelpArticle,
    IncidentStatus,
    PlatformIncident,
    RoadmapItem,
    SupportChatMessage,
    SupportChatSession,
    SupportTicket,
    TicketMessage,
    TicketStatus,
    UserFeedback
} from "@/types/support";

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

export interface SupportStoreState {
    // ── Help Center & FAQ ───────────────────────────────────────────
    helpArticles: HelpArticle[];
    faqItems: FAQItem[];
    helpSearchQuery: string;

    // ── Tickets ─────────────────────────────────────────────────────
    tickets: SupportTicket[];
    currentTicket: SupportTicket | null;

    // ── Chat support ────────────────────────────────────────────────
    chatSession: SupportChatSession | null;

    // ── Incidents ───────────────────────────────────────────────────
    incidents: PlatformIncident[];

    // ── Roadmap ─────────────────────────────────────────────────────
    roadmapItems: RoadmapItem[];

    // ── Feedback ────────────────────────────────────────────────────
    feedbackHistory: UserFeedback[];

    // ── Beta features ───────────────────────────────────────────────
    betaFeatures: BetaFeature[];

    // ── UI state ────────────────────────────────────────────────────
    loading: boolean;
    error: string | null;

    // ── Help Center actions ─────────────────────────────────────────
    setHelpArticles: (articles: HelpArticle[]) => void;
    setFaqItems: (items: FAQItem[]) => void;
    setHelpSearchQuery: (query: string) => void;

    // ── Ticket actions ──────────────────────────────────────────────
    setTickets: (tickets: SupportTicket[]) => void;
    addTicket: (ticket: SupportTicket) => void;
    updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
    setCurrentTicket: (ticket: SupportTicket | null) => void;
    addTicketMessage: (ticketId: string, message: TicketMessage) => void;
    removeTicket: (ticketId: string) => void;

    // ── Chat support actions ────────────────────────────────────────
    startChatSession: (session: SupportChatSession) => void;
    addChatMessage: (message: SupportChatMessage) => void;
    setChatStatus: (status: ChatSupportStatus) => void;
    setChatRating: (rating: number) => void;
    endChatSession: () => void;

    // ── Incident actions ────────────────────────────────────────────
    setIncidents: (incidents: PlatformIncident[]) => void;
    addIncident: (incident: PlatformIncident) => void;
    updateIncidentStatus: (id: string, status: IncidentStatus) => void;

    // ── Roadmap actions ─────────────────────────────────────────────
    setRoadmapItems: (items: RoadmapItem[]) => void;
    toggleVote: (itemId: string) => void;

    // ── Feedback actions ────────────────────────────────────────────
    setFeedbackHistory: (feedbacks: UserFeedback[]) => void;
    addFeedback: (feedback: UserFeedback) => void;

    // ── Beta feature actions ────────────────────────────────────────
    setBetaFeatures: (features: BetaFeature[]) => void;
    toggleBetaFeature: (featureId: string) => void;

    // ── UI actions ──────────────────────────────────────────────────
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // ── Reset ───────────────────────────────────────────────────────
    resetSupport: () => void;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState = {
    helpArticles: [] as HelpArticle[],
    faqItems: [] as FAQItem[],
    helpSearchQuery: "",
    tickets: [] as SupportTicket[],
    currentTicket: null as SupportTicket | null,
    chatSession: null as SupportChatSession | null,
    incidents: [] as PlatformIncident[],
    roadmapItems: [] as RoadmapItem[],
    feedbackHistory: [] as UserFeedback[],
    betaFeatures: [] as BetaFeature[],
    loading: false,
    error: null as string | null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSupportStore = create<SupportStoreState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ── Help Center actions ───────────────────────────────────────
            setHelpArticles: (articles) => set({ helpArticles: articles }),
            setFaqItems: (items) => set({ faqItems: items }),
            setHelpSearchQuery: (query) => set({ helpSearchQuery: query }),

            // ── Ticket actions ────────────────────────────────────────────
            setTickets: (tickets) => set({ tickets }),
            addTicket: (ticket) =>
                set((s) => ({ tickets: [ticket, ...s.tickets] })),
            updateTicketStatus: (ticketId, status) =>
                set((s) => ({
                    tickets: s.tickets.map((t) =>
                        t.id === ticketId
                            ? {
                                ...t,
                                status,
                                updatedAt: new Date().toISOString(),
                                ...(status === "resolved" ? { resolvedAt: new Date().toISOString() } : {}),
                            }
                            : t
                    ),
                    currentTicket:
                        s.currentTicket?.id === ticketId
                            ? {
                                ...s.currentTicket,
                                status,
                                updatedAt: new Date().toISOString(),
                                ...(status === "resolved" ? { resolvedAt: new Date().toISOString() } : {}),
                            }
                            : s.currentTicket,
                })),
            setCurrentTicket: (ticket) => set({ currentTicket: ticket }),
            addTicketMessage: (ticketId, message) =>
                set((s) => ({
                    tickets: s.tickets.map((t) =>
                        t.id === ticketId
                            ? { ...t, messages: [...t.messages, message], updatedAt: new Date().toISOString() }
                            : t
                    ),
                    currentTicket:
                        s.currentTicket?.id === ticketId
                            ? {
                                ...s.currentTicket,
                                messages: [...s.currentTicket.messages, message],
                                updatedAt: new Date().toISOString(),
                            }
                            : s.currentTicket,
                })),
            removeTicket: (ticketId) =>
                set((s) => ({
                    tickets: s.tickets.filter((t) => t.id !== ticketId),
                    currentTicket: s.currentTicket?.id === ticketId ? null : s.currentTicket,
                })),

            // ── Chat support actions ──────────────────────────────────────
            startChatSession: (session) => set({ chatSession: session }),
            addChatMessage: (message) =>
                set((s) => ({
                    chatSession: s.chatSession
                        ? { ...s.chatSession, messages: [...s.chatSession.messages, message] }
                        : null,
                })),
            setChatStatus: (status) =>
                set((s) => ({
                    chatSession: s.chatSession ? { ...s.chatSession, status } : null,
                })),
            setChatRating: (rating) =>
                set((s) => ({
                    chatSession: s.chatSession ? { ...s.chatSession, rating } : null,
                })),
            endChatSession: () =>
                set((s) => ({
                    chatSession: s.chatSession
                        ? { ...s.chatSession, status: "ended" as const, endedAt: new Date().toISOString() }
                        : null,
                })),

            // ── Incident actions ──────────────────────────────────────────
            setIncidents: (incidents) => set({ incidents }),
            addIncident: (incident) =>
                set((s) => ({ incidents: [incident, ...s.incidents] })),
            updateIncidentStatus: (id, status) =>
                set((s) => ({
                    incidents: s.incidents.map((inc) =>
                        inc.id === id
                            ? {
                                ...inc,
                                status,
                                ...(status === "resolved" ? { resolvedAt: new Date().toISOString() } : {}),
                            }
                            : inc
                    ),
                })),

            // ── Roadmap actions ───────────────────────────────────────────
            setRoadmapItems: (items) => set({ roadmapItems: items }),
            toggleVote: (itemId) =>
                set((s) => ({
                    roadmapItems: s.roadmapItems.map((item) =>
                        item.id === itemId
                            ? {
                                ...item,
                                hasVoted: !item.hasVoted,
                                votes: item.hasVoted ? item.votes - 1 : item.votes + 1,
                            }
                            : item
                    ),
                })),

            // ── Feedback actions ──────────────────────────────────────────
            setFeedbackHistory: (feedbacks) => set({ feedbackHistory: feedbacks }),
            addFeedback: (feedback) =>
                set((s) => ({ feedbackHistory: [feedback, ...s.feedbackHistory] })),

            // ── Beta feature actions ──────────────────────────────────────
            setBetaFeatures: (features) => set({ betaFeatures: features }),
            toggleBetaFeature: (featureId) =>
                set((s) => ({
                    betaFeatures: s.betaFeatures.map((f) =>
                        f.id === featureId && f.userToggleable ? { ...f, enabled: !f.enabled } : f
                    ),
                })),

            // ── UI actions ────────────────────────────────────────────────
            setLoading: (loading) => set({ loading }),
            setError: (error) => set({ error }),

            // ── Reset ─────────────────────────────────────────────────────
            resetSupport: () => set(initialState),
        }),
        {
            name: "imuchat-support",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                // Only persist beta feature preferences locally
                betaFeatures: state.betaFeatures,
                // Tickets & feedback are server-sourced, not persisted locally
            }),
        }
    )
);
