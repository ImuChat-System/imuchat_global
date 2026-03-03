/**
 * Tests pour support-store (Zustand)
 *
 * Couvre : help center, FAQ, tickets (CRUD + messages),
 *          chat sessions, incidents, roadmap (vote), feedback,
 *          beta features (toggle), UI state, reset.
 *
 * Support & Assistance — 8 domaines
 */

import { useSupportStore } from "../support-store";

// ─── Mocks ────────────────────────────────────────────────────

jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
}));

// ─── Helpers ──────────────────────────────────────────────────

function resetStore() {
    useSupportStore.getState().resetSupport();
}

function makeTicket(overrides: Record<string, any> = {}) {
    return {
        id: `t-${Date.now()}`,
        userId: "user1",
        subject: "Test ticket",
        category: "bug" as const,
        priority: "medium" as const,
        status: "open" as const,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
    };
}

function makeIncident(overrides: Record<string, any> = {}) {
    return {
        id: `inc-${Date.now()}`,
        title: "API down",
        severity: "major" as const,
        status: "investigating" as const,
        affectedServices: ["messaging" as const],
        updates: [],
        startedAt: new Date().toISOString(),
        ...overrides,
    };
}

// ═══════════════════════════════════════════════════════════════
// Test suites
// ═══════════════════════════════════════════════════════════════

describe("support-store", () => {
    beforeEach(resetStore);

    // ─── Initial State ────────────────────────────────────────
    describe("initial state", () => {
        it("starts with empty collections", () => {
            const s = useSupportStore.getState();
            expect(s.helpArticles).toEqual([]);
            expect(s.faqItems).toEqual([]);
            expect(s.tickets).toEqual([]);
            expect(s.incidents).toEqual([]);
            expect(s.roadmapItems).toEqual([]);
            expect(s.feedbackHistory).toEqual([]);
            expect(s.betaFeatures).toEqual([]);
        });

        it("has no active chat session", () => {
            const s = useSupportStore.getState();
            expect(s.chatSession).toBeNull();
        });

        it("starts not loading and no error", () => {
            const s = useSupportStore.getState();
            expect(s.loading).toBe(false);
            expect(s.error).toBeNull();
        });

        it("has empty search query", () => {
            const s = useSupportStore.getState();
            expect(s.helpSearchQuery).toBe("");
        });
    });

    // ─── Help Center ──────────────────────────────────────────
    describe("help center", () => {
        it("sets help articles", () => {
            const articles = [
                {
                    id: "a1",
                    title: "Getting started",
                    summary: "How to start",
                    body: "Full body",
                    category: "getting-started" as const,
                    tags: ["start"],
                    helpfulCount: 5,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ];
            useSupportStore.getState().setHelpArticles(articles);
            expect(useSupportStore.getState().helpArticles).toEqual(articles);
        });

        it("sets FAQ items", () => {
            const items = [
                {
                    id: "fq1",
                    question: "How?",
                    answer: "Like this",
                    category: "messaging" as const,
                    order: 0,
                },
            ];
            useSupportStore.getState().setFaqItems(items);
            expect(useSupportStore.getState().faqItems).toEqual(items);
        });

        it("sets help search query", () => {
            useSupportStore.getState().setHelpSearchQuery("test");
            expect(useSupportStore.getState().helpSearchQuery).toBe("test");
        });
    });

    // ─── Tickets ──────────────────────────────────────────────
    describe("tickets", () => {
        it("sets tickets array", () => {
            const tickets = [makeTicket({ id: "t1" })];
            useSupportStore.getState().setTickets(tickets);
            expect(useSupportStore.getState().tickets).toHaveLength(1);
        });

        it("adds a ticket", () => {
            const ticket = makeTicket({ id: "t-new" });
            useSupportStore.getState().addTicket(ticket);
            expect(useSupportStore.getState().tickets).toHaveLength(1);
            expect(useSupportStore.getState().tickets[0].id).toBe("t-new");
        });

        it("updates ticket status", () => {
            const ticket = makeTicket({ id: "t-upd" });
            useSupportStore.getState().addTicket(ticket);
            useSupportStore.getState().updateTicketStatus("t-upd", "resolved");
            const t = useSupportStore.getState().tickets[0];
            expect(t.status).toBe("resolved");
        });

        it("sets current ticket", () => {
            const ticket = makeTicket({ id: "t-cur" });
            useSupportStore.getState().setCurrentTicket(ticket);
            expect(useSupportStore.getState().currentTicket?.id).toBe("t-cur");
        });

        it("adds a message to a ticket", () => {
            const ticket = makeTicket({ id: "t-msg" });
            useSupportStore.getState().addTicket(ticket);
            useSupportStore.getState().addTicketMessage("t-msg", {
                id: "m1",
                ticketId: "t-msg",
                senderId: "user1",
                senderRole: "user",
                body: "Hello",
                createdAt: new Date().toISOString(),
            });
            const t = useSupportStore.getState().tickets.find(
                (tc) => tc.id === "t-msg"
            );
            expect(t?.messages).toHaveLength(1);
            expect(t?.messages[0].body).toBe("Hello");
        });

        it("removes a ticket", () => {
            useSupportStore.getState().addTicket(makeTicket({ id: "t-rm" }));
            expect(useSupportStore.getState().tickets).toHaveLength(1);
            useSupportStore.getState().removeTicket("t-rm");
            expect(useSupportStore.getState().tickets).toHaveLength(0);
        });

        it("does not crash when updating non-existent ticket", () => {
            useSupportStore.getState().updateTicketStatus("nope", "closed");
            expect(useSupportStore.getState().tickets).toHaveLength(0);
        });
    });

    // ─── Chat Support ─────────────────────────────────────────
    describe("chat support", () => {
        it("starts a chat session", () => {
            useSupportStore.getState().startChatSession({
                id: "cs1",
                userId: "u1",
                status: "waiting",
                messages: [],
                startedAt: new Date().toISOString(),
            });
            expect(useSupportStore.getState().chatSession).not.toBeNull();
            expect(useSupportStore.getState().chatSession?.id).toBe("cs1");
        });

        it("adds a chat message", () => {
            useSupportStore.getState().startChatSession({
                id: "cs2",
                userId: "u1",
                status: "connected",
                messages: [],
                startedAt: new Date().toISOString(),
            });
            useSupportStore.getState().addChatMessage({
                id: "cm1",
                sender: "user",
                body: "Hi",
                timestamp: new Date().toISOString(),
            });
            expect(useSupportStore.getState().chatSession?.messages).toHaveLength(1);
        });

        it("sets chat status", () => {
            useSupportStore.getState().startChatSession({
                id: "cs3",
                userId: "u1",
                status: "waiting",
                messages: [],
                startedAt: new Date().toISOString(),
            });
            useSupportStore.getState().setChatStatus("connected");
            expect(useSupportStore.getState().chatSession?.status).toBe("connected");
        });

        it("sets chat rating", () => {
            useSupportStore.getState().startChatSession({
                id: "cs4",
                userId: "u1",
                status: "connected",
                messages: [],
                startedAt: new Date().toISOString(),
            });
            useSupportStore.getState().setChatRating(5);
            expect(useSupportStore.getState().chatSession?.rating).toBe(5);
        });

        it("ends chat session", () => {
            useSupportStore.getState().startChatSession({
                id: "cs5",
                userId: "u1",
                status: "connected",
                messages: [],
                startedAt: new Date().toISOString(),
            });
            useSupportStore.getState().endChatSession();
            const session = useSupportStore.getState().chatSession;
            expect(session?.status).toBe("ended");
            expect(session?.endedAt).toBeDefined();
        });

        it("does not crash when adding message without session", () => {
            useSupportStore.getState().addChatMessage({
                id: "cm-no",
                sender: "user",
                body: "orphan",
                timestamp: new Date().toISOString(),
            });
            expect(useSupportStore.getState().chatSession).toBeNull();
        });
    });

    // ─── Incidents ────────────────────────────────────────────
    describe("incidents", () => {
        it("sets incidents", () => {
            const incidents = [makeIncident({ id: "i1" })];
            useSupportStore.getState().setIncidents(incidents);
            expect(useSupportStore.getState().incidents).toHaveLength(1);
        });

        it("adds an incident", () => {
            useSupportStore.getState().addIncident(makeIncident({ id: "i-add" }));
            expect(useSupportStore.getState().incidents).toHaveLength(1);
        });

        it("updates incident status", () => {
            useSupportStore.getState().addIncident(makeIncident({ id: "i-upd" }));
            useSupportStore.getState().updateIncidentStatus("i-upd", "resolved");
            const i = useSupportStore.getState().incidents[0];
            expect(i.status).toBe("resolved");
        });
    });

    // ─── Roadmap ──────────────────────────────────────────────
    describe("roadmap", () => {
        it("sets roadmap items", () => {
            const items = [
                {
                    id: "r1",
                    title: "Dark mode",
                    description: "Add dark mode",
                    category: "ux" as const,
                    status: "planned" as const,
                    votes: 42,
                    hasVoted: false,
                },
            ];
            useSupportStore.getState().setRoadmapItems(items);
            expect(useSupportStore.getState().roadmapItems).toHaveLength(1);
        });

        it("toggleVote increments and flips hasVoted", () => {
            useSupportStore.getState().setRoadmapItems([
                {
                    id: "r-v",
                    title: "Feature",
                    description: "Desc",
                    category: "ai" as const,
                    status: "planned" as const,
                    votes: 10,
                    hasVoted: false,
                },
            ]);
            useSupportStore.getState().toggleVote("r-v");
            const item = useSupportStore.getState().roadmapItems[0];
            expect(item.votes).toBe(11);
            expect(item.hasVoted).toBe(true);
        });

        it("toggleVote decrements and unflips hasVoted", () => {
            useSupportStore.getState().setRoadmapItems([
                {
                    id: "r-uv",
                    title: "Feature",
                    description: "Desc",
                    category: "ai" as const,
                    status: "planned" as const,
                    votes: 10,
                    hasVoted: true,
                },
            ]);
            useSupportStore.getState().toggleVote("r-uv");
            const item = useSupportStore.getState().roadmapItems[0];
            expect(item.votes).toBe(9);
            expect(item.hasVoted).toBe(false);
        });
    });

    // ─── Feedback ─────────────────────────────────────────────
    describe("feedback", () => {
        it("sets feedback history", () => {
            const fb = [
                {
                    id: "fb1",
                    userId: "u1",
                    type: "bug" as const,
                    mood: "unhappy" as const,
                    title: "Bug report",
                    body: "Something broke",
                    createdAt: new Date().toISOString(),
                },
            ];
            useSupportStore.getState().setFeedbackHistory(fb);
            expect(useSupportStore.getState().feedbackHistory).toHaveLength(1);
        });

        it("adds feedback", () => {
            useSupportStore.getState().addFeedback({
                id: "fb-new",
                userId: "u1",
                type: "feature" as const,
                mood: "happy" as const,
                title: "Nice feature",
                body: "I love it",
                createdAt: new Date().toISOString(),
            });
            expect(useSupportStore.getState().feedbackHistory).toHaveLength(1);
        });
    });

    // ─── Beta Features ────────────────────────────────────────
    describe("beta features", () => {
        it("sets beta features", () => {
            const features = [
                {
                    id: "bf1",
                    name: "AI Chat",
                    description: "AI powered chat",
                    enabled: false,
                    stability: "experimental" as const,
                    userToggleable: true,
                    addedAt: new Date().toISOString(),
                },
            ];
            useSupportStore.getState().setBetaFeatures(features);
            expect(useSupportStore.getState().betaFeatures).toHaveLength(1);
        });

        it("toggles a beta feature on", () => {
            useSupportStore.getState().setBetaFeatures([
                {
                    id: "bf-t",
                    name: "AI Chat",
                    description: "AI powered",
                    enabled: false,
                    stability: "beta" as const,
                    userToggleable: true,
                    addedAt: new Date().toISOString(),
                },
            ]);
            useSupportStore.getState().toggleBetaFeature("bf-t");
            expect(useSupportStore.getState().betaFeatures[0].enabled).toBe(true);
        });

        it("toggles a beta feature off", () => {
            useSupportStore.getState().setBetaFeatures([
                {
                    id: "bf-off",
                    name: "AI Chat",
                    description: "AI powered",
                    enabled: true,
                    stability: "beta" as const,
                    userToggleable: true,
                    addedAt: new Date().toISOString(),
                },
            ]);
            useSupportStore.getState().toggleBetaFeature("bf-off");
            expect(useSupportStore.getState().betaFeatures[0].enabled).toBe(false);
        });

        it("does not toggle non-toggleable feature", () => {
            useSupportStore.getState().setBetaFeatures([
                {
                    id: "bf-lock",
                    name: "Forced",
                    description: "Locked",
                    enabled: true,
                    stability: "stable" as const,
                    userToggleable: false,
                    addedAt: new Date().toISOString(),
                },
            ]);
            useSupportStore.getState().toggleBetaFeature("bf-lock");
            // should remain unchanged
            expect(useSupportStore.getState().betaFeatures[0].enabled).toBe(true);
        });
    });

    // ─── UI State ─────────────────────────────────────────────
    describe("UI state", () => {
        it("sets loading", () => {
            useSupportStore.getState().setLoading(true);
            expect(useSupportStore.getState().loading).toBe(true);
            useSupportStore.getState().setLoading(false);
            expect(useSupportStore.getState().loading).toBe(false);
        });

        it("sets error", () => {
            useSupportStore.getState().setError("Something went wrong");
            expect(useSupportStore.getState().error).toBe("Something went wrong");
        });

        it("clears error with null", () => {
            useSupportStore.getState().setError("err");
            useSupportStore.getState().setError(null);
            expect(useSupportStore.getState().error).toBeNull();
        });
    });

    // ─── Reset ────────────────────────────────────────────────
    describe("reset", () => {
        it("resets all state to defaults", () => {
            // Populate various parts
            useSupportStore.getState().addTicket(makeTicket({ id: "t-reset" }));
            useSupportStore.getState().addIncident(makeIncident({ id: "i-reset" }));
            useSupportStore.getState().addFeedback({
                id: "fb-reset",
                userId: "u1",
                type: "bug" as const,
                mood: "neutral" as const,
                title: "Reset test",
                body: "body",
                createdAt: new Date().toISOString(),
            });
            useSupportStore.getState().setLoading(true);
            useSupportStore.getState().setError("err");
            useSupportStore.getState().setHelpSearchQuery("query");

            // Reset
            useSupportStore.getState().resetSupport();

            const s = useSupportStore.getState();
            expect(s.tickets).toEqual([]);
            expect(s.incidents).toEqual([]);
            expect(s.feedbackHistory).toEqual([]);
            expect(s.loading).toBe(false);
            expect(s.error).toBeNull();
            expect(s.helpSearchQuery).toBe("");
            expect(s.chatSession).toBeNull();
        });
    });
});
