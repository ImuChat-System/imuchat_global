/**
 * Hook useSupport — Façade React pour le module Support & Assistance
 *
 * Expose l'état du store et des actions mémorisées (useCallback)
 * pour éviter les re-renders inutiles.
 *
 * Usage:
 * ```tsx
 * const {
 *   helpArticles, tickets, incidents, roadmapItems,
 *   addTicket, toggleVote, ...
 * } = useSupport();
 * ```
 *
 * Phase 3 — DEV-031
 */

import { useSupportStore } from "@/stores/support-store";
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
    UserFeedback,
} from "@/types/support";
import { useCallback, useMemo } from "react";

export function useSupport() {
    const store = useSupportStore();

    // ─── Help Center actions ─────────────────────────────────────
    const setHelpArticles = useCallback(
        (articles: HelpArticle[]) => store.setHelpArticles(articles),
        [store.setHelpArticles]
    );
    const setFaqItems = useCallback(
        (items: FAQItem[]) => store.setFaqItems(items),
        [store.setFaqItems]
    );
    const setHelpSearchQuery = useCallback(
        (query: string) => store.setHelpSearchQuery(query),
        [store.setHelpSearchQuery]
    );

    // ─── Ticket actions ──────────────────────────────────────────
    const setTickets = useCallback(
        (tickets: SupportTicket[]) => store.setTickets(tickets),
        [store.setTickets]
    );
    const addTicket = useCallback(
        (ticket: SupportTicket) => store.addTicket(ticket),
        [store.addTicket]
    );
    const updateTicketStatus = useCallback(
        (ticketId: string, status: TicketStatus) =>
            store.updateTicketStatus(ticketId, status),
        [store.updateTicketStatus]
    );
    const setCurrentTicket = useCallback(
        (ticket: SupportTicket | null) => store.setCurrentTicket(ticket),
        [store.setCurrentTicket]
    );
    const addTicketMessage = useCallback(
        (ticketId: string, message: TicketMessage) =>
            store.addTicketMessage(ticketId, message),
        [store.addTicketMessage]
    );
    const removeTicket = useCallback(
        (ticketId: string) => store.removeTicket(ticketId),
        [store.removeTicket]
    );

    // ─── Chat support actions ────────────────────────────────────
    const startChatSession = useCallback(
        (session: SupportChatSession) => store.startChatSession(session),
        [store.startChatSession]
    );
    const addChatMessage = useCallback(
        (message: SupportChatMessage) => store.addChatMessage(message),
        [store.addChatMessage]
    );
    const setChatStatus = useCallback(
        (status: ChatSupportStatus) => store.setChatStatus(status),
        [store.setChatStatus]
    );
    const setChatRating = useCallback(
        (rating: number) => store.setChatRating(rating),
        [store.setChatRating]
    );
    const endChatSession = useCallback(
        () => store.endChatSession(),
        [store.endChatSession]
    );

    // ─── Incident actions ────────────────────────────────────────
    const setIncidents = useCallback(
        (incidents: PlatformIncident[]) => store.setIncidents(incidents),
        [store.setIncidents]
    );
    const updateIncidentStatus = useCallback(
        (id: string, status: IncidentStatus) =>
            store.updateIncidentStatus(id, status),
        [store.updateIncidentStatus]
    );

    // ─── Roadmap actions ─────────────────────────────────────────
    const setRoadmapItems = useCallback(
        (items: RoadmapItem[]) => store.setRoadmapItems(items),
        [store.setRoadmapItems]
    );
    const toggleVote = useCallback(
        (itemId: string) => store.toggleVote(itemId),
        [store.toggleVote]
    );

    // ─── Feedback actions ────────────────────────────────────────
    const addFeedback = useCallback(
        (feedback: UserFeedback) => store.addFeedback(feedback),
        [store.addFeedback]
    );
    const setFeedbackHistory = useCallback(
        (feedbacks: UserFeedback[]) => store.setFeedbackHistory(feedbacks),
        [store.setFeedbackHistory]
    );

    // ─── Beta feature actions ────────────────────────────────────
    const setBetaFeatures = useCallback(
        (features: BetaFeature[]) => store.setBetaFeatures(features),
        [store.setBetaFeatures]
    );
    const toggleBetaFeature = useCallback(
        (featureId: string) => store.toggleBetaFeature(featureId),
        [store.toggleBetaFeature]
    );

    // ─── UI actions ──────────────────────────────────────────────
    const setLoading = useCallback(
        (loading: boolean) => store.setLoading(loading),
        [store.setLoading]
    );
    const setError = useCallback(
        (error: string | null) => store.setError(error),
        [store.setError]
    );
    const resetSupport = useCallback(
        () => store.resetSupport(),
        [store.resetSupport]
    );

    // ─── Computed values ─────────────────────────────────────────
    const openTicketsCount = useMemo(
        () => store.tickets.filter((t) => t.status === "open" || t.status === "in-progress").length,
        [store.tickets]
    );

    const activeIncidentsCount = useMemo(
        () => store.incidents.filter((i) => i.status !== "resolved").length,
        [store.incidents]
    );

    const enabledBetaCount = useMemo(
        () => store.betaFeatures.filter((f) => f.enabled).length,
        [store.betaFeatures]
    );

    const filteredArticles = useMemo(() => {
        if (!store.helpSearchQuery.trim()) return store.helpArticles;
        const q = store.helpSearchQuery.toLowerCase();
        return store.helpArticles.filter(
            (a) =>
                a.title.toLowerCase().includes(q) ||
                a.summary.toLowerCase().includes(q) ||
                a.tags.some((tag) => tag.toLowerCase().includes(q))
        );
    }, [store.helpArticles, store.helpSearchQuery]);

    const isChatActive = useMemo(
        () => store.chatSession?.status === "connected" || store.chatSession?.status === "waiting",
        [store.chatSession]
    );

    return {
        // State
        helpArticles: store.helpArticles,
        faqItems: store.faqItems,
        helpSearchQuery: store.helpSearchQuery,
        tickets: store.tickets,
        currentTicket: store.currentTicket,
        chatSession: store.chatSession,
        incidents: store.incidents,
        roadmapItems: store.roadmapItems,
        feedbackHistory: store.feedbackHistory,
        betaFeatures: store.betaFeatures,
        loading: store.loading,
        error: store.error,

        // Help center
        setHelpArticles,
        setFaqItems,
        setHelpSearchQuery,
        filteredArticles,

        // Tickets
        setTickets,
        addTicket,
        updateTicketStatus,
        setCurrentTicket,
        addTicketMessage,
        removeTicket,

        // Chat
        startChatSession,
        addChatMessage,
        setChatStatus,
        setChatRating,
        endChatSession,
        isChatActive,

        // Incidents
        setIncidents,
        updateIncidentStatus,

        // Roadmap
        setRoadmapItems,
        toggleVote,

        // Feedback
        addFeedback,
        setFeedbackHistory,

        // Beta features
        setBetaFeatures,
        toggleBetaFeature,

        // UI
        setLoading,
        setError,
        resetSupport,

        // Computed
        openTicketsCount,
        activeIncidentsCount,
        enabledBetaCount,
    };
}
