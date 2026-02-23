import {
    cancelEvent,
    createEvent,
    deleteEvent,
    fetchEvent,
    fetchEventParticipants,
    fetchEvents,
    respondToEvent,
    updateEvent,
} from "../events";
import { supabase } from "../supabase";

jest.mock("../logger", () => ({
    createLogger: () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));

jest.mock("../supabase", () => ({
    supabase: {
        from: jest.fn(),
        auth: { getUser: jest.fn() },
        rpc: jest.fn(),
    },
}));

const mockUser = { id: "user-1", email: "test@test.com" };

function mockAuth(user: typeof mockUser | null = mockUser) {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user },
    });
}

describe("Events Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─────────────────────────────────────────────
    // fetchEvents
    // ─────────────────────────────────────────────
    describe("fetchEvents", () => {
        it("should return events with pagination", async () => {
            mockAuth();
            const rawEvents = [
                {
                    id: "ev-1",
                    title: "Meetup",
                    description: "A fun meetup",
                    cover_image_url: null,
                    location: "Paris",
                    location_url: null,
                    starts_at: "2025-06-01T18:00:00Z",
                    ends_at: null,
                    max_participants: null,
                    status: "published",
                    is_public: true,
                    creator_id: "u-2",
                    group_id: null,
                    going_count: 5,
                    interested_count: 3,
                    created_at: "2024-01-01T00:00:00Z",
                    organizer: { id: "u-2", username: "bob", display_name: "Bob", avatar_url: null },
                },
            ];

            const queryChain: Record<string, jest.Mock> = {};
            queryChain.select = jest.fn().mockReturnValue(queryChain);
            queryChain.eq = jest.fn().mockReturnValue(queryChain);
            queryChain.gte = jest.fn().mockReturnValue(queryChain);
            queryChain.lt = jest.fn().mockReturnValue(queryChain);
            queryChain.gt = jest.fn().mockReturnValue(queryChain);
            queryChain.limit = jest.fn().mockReturnValue(queryChain);
            queryChain.order = jest.fn().mockResolvedValue({ data: rawEvents, error: null });
            queryChain.in = jest.fn().mockReturnValue(queryChain);

            // participation status query
            const partChain: Record<string, jest.Mock> = {};
            partChain.select = jest.fn().mockReturnValue(partChain);
            partChain.eq = jest.fn().mockReturnValue(partChain);
            partChain.in = jest.fn().mockResolvedValue({ data: [{ event_id: "ev-1", status: "going" }] });

            (supabase.from as jest.Mock)
                .mockReturnValueOnce(queryChain) // events query
                .mockReturnValueOnce(partChain); // participations query

            const result = await fetchEvents();
            expect(result.events).toHaveLength(1);
            expect(result.events[0].title).toBe("Meetup");
            expect(result.events[0].myStatus).toBe("going");
            expect(result.hasMore).toBe(false);
        });

        it("should return empty on error", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        gte: jest.fn().mockReturnValue({
                            order: jest.fn().mockReturnValue({
                                limit: jest.fn().mockResolvedValue({ data: null, error: { message: "err" } }),
                            }),
                        }),
                    }),
                }),
            });
            const result = await fetchEvents();
            expect(result.events).toEqual([]);
        });
    });

    // ─────────────────────────────────────────────
    // fetchEvent
    // ─────────────────────────────────────────────
    describe("fetchEvent", () => {
        it("should return a single event with participation status", async () => {
            mockAuth();
            const raw = {
                id: "ev-1",
                title: "Party",
                description: null,
                cover_image_url: null,
                location: "Lyon",
                location_url: null,
                starts_at: "2025-06-01T20:00:00Z",
                ends_at: null,
                max_participants: 50,
                status: "published",
                is_public: true,
                creator_id: "u-2",
                group_id: null,
                going_count: 10,
                interested_count: 5,
                created_at: "2024-01-01",
                organizer: { id: "u-2", username: "bob", display_name: "Bob", avatar_url: null },
            };

            (supabase.from as jest.Mock)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: raw, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                single: jest.fn().mockResolvedValue({ data: { status: "interested" } }),
                            }),
                        }),
                    }),
                });

            const event = await fetchEvent("ev-1");
            expect(event).not.toBeNull();
            expect(event!.title).toBe("Party");
            expect(event!.myStatus).toBe("interested");
        });

        it("should return null on error", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
                    }),
                }),
            });
            const event = await fetchEvent("ev-1");
            expect(event).toBeNull();
        });
    });

    // ─────────────────────────────────────────────
    // createEvent
    // ─────────────────────────────────────────────
    describe("createEvent", () => {
        it("should create event and auto-add creator as going", async () => {
            mockAuth();
            const created = {
                id: "ev-new",
                title: "New Event",
                description: null,
                cover_image_url: null,
                location: "Paris",
                location_url: null,
                starts_at: "2025-06-01T18:00:00Z",
                ends_at: null,
                max_participants: null,
                status: "published",
                is_public: true,
                creator_id: "user-1",
                group_id: null,
                going_count: 1,
                interested_count: 0,
                created_at: "2024-01-01",
                organizer: { id: "user-1", username: "me", display_name: "Me", avatar_url: null },
            };

            (supabase.from as jest.Mock)
                .mockReturnValueOnce({
                    insert: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: created, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    insert: jest.fn().mockResolvedValue({ error: null }), // auto-add as going
                });

            const event = await createEvent({ title: "New Event", startsAt: "2025-06-01T18:00:00Z" });
            expect(event).not.toBeNull();
            expect(event!.id).toBe("ev-new");
            expect(event!.myStatus).toBe("going");
            expect(supabase.from).toHaveBeenCalledWith("event_participants");
        });

        it("should return null when not authenticated", async () => {
            mockAuth(null);
            const event = await createEvent({ title: "X", startsAt: "2025-01-01" });
            expect(event).toBeNull();
        });
    });

    // ─────────────────────────────────────────────
    // updateEvent
    // ─────────────────────────────────────────────
    describe("updateEvent", () => {
        it("should update event fields", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            });
            const result = await updateEvent("ev-1", { title: "Updated" });
            expect(result).toBe(true);
        });

        it("should return false when not authenticated", async () => {
            mockAuth(null);
            const result = await updateEvent("ev-1", { title: "X" });
            expect(result).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // cancelEvent
    // ─────────────────────────────────────────────
    describe("cancelEvent", () => {
        it("should cancel event", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            });
            const result = await cancelEvent("ev-1");
            expect(result).toBe(true);
        });
    });

    // ─────────────────────────────────────────────
    // deleteEvent
    // ─────────────────────────────────────────────
    describe("deleteEvent", () => {
        it("should delete event", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            });
            const result = await deleteEvent("ev-1");
            expect(result).toBe(true);
        });

        it("should return false when not authenticated", async () => {
            mockAuth(null);
            const result = await deleteEvent("ev-1");
            expect(result).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // respondToEvent
    // ─────────────────────────────────────────────
    describe("respondToEvent", () => {
        it("should toggle off when same status", async () => {
            mockAuth();
            // check existing participation
            (supabase.from as jest.Mock)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                single: jest.fn().mockResolvedValue({ data: { status: "going" } }),
                            }),
                        }),
                    }),
                })
                // delete participation
                .mockReturnValueOnce({
                    delete: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ error: null }),
                        }),
                    }),
                });

            (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

            const result = await respondToEvent("ev-1", "going");
            expect(result.success).toBe(true);
            expect(result.newStatus).toBeNull();
            expect(supabase.rpc).toHaveBeenCalledWith("decrement_event_going", { p_event_id: "ev-1" });
        });

        it("should change status and update counts", async () => {
            mockAuth();
            // check existing
            (supabase.from as jest.Mock)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                single: jest.fn().mockResolvedValue({ data: { status: "going" } }),
                            }),
                        }),
                    }),
                })
                // upsert
                .mockReturnValueOnce({
                    upsert: jest.fn().mockResolvedValue({ error: null }),
                });

            (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

            const result = await respondToEvent("ev-1", "interested");
            expect(result.success).toBe(true);
            expect(result.newStatus).toBe("interested");
            // Should decrement going and increment interested
            expect(supabase.rpc).toHaveBeenCalledWith("decrement_event_going", { p_event_id: "ev-1" });
            expect(supabase.rpc).toHaveBeenCalledWith("increment_event_interested", { p_event_id: "ev-1" });
        });

        it("should set new status when no prior participation", async () => {
            mockAuth();
            (supabase.from as jest.Mock)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                single: jest.fn().mockResolvedValue({ data: null }),
                            }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    upsert: jest.fn().mockResolvedValue({ error: null }),
                });

            (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

            const result = await respondToEvent("ev-1", "going");
            expect(result.success).toBe(true);
            expect(result.newStatus).toBe("going");
            expect(supabase.rpc).toHaveBeenCalledWith("increment_event_going", { p_event_id: "ev-1" });
        });

        it("should return false when not authenticated", async () => {
            mockAuth(null);
            const result = await respondToEvent("ev-1", "going");
            expect(result.success).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // fetchEventParticipants
    // ─────────────────────────────────────────────
    describe("fetchEventParticipants", () => {
        it("should return participants", async () => {
            const rawParticipants = [
                {
                    id: "ep-1",
                    user_id: "u-2",
                    status: "going",
                    responded_at: "2024-01-01",
                    user: { id: "u-2", username: "bob", display_name: "Bob", avatar_url: null },
                },
            ];

            const queryChain: Record<string, jest.Mock> = {};
            queryChain.select = jest.fn().mockReturnValue(queryChain);
            queryChain.eq = jest.fn().mockReturnValue(queryChain);
            queryChain.order = jest.fn().mockResolvedValue({ data: rawParticipants, error: null });

            (supabase.from as jest.Mock).mockReturnValue(queryChain);

            const participants = await fetchEventParticipants("ev-1");
            expect(participants).toHaveLength(1);
            expect(participants[0].status).toBe("going");
            expect(participants[0].user.username).toBe("bob");
        });

        it("should filter by status", async () => {
            const queryChain: Record<string, jest.Mock | Function> = {};
            queryChain.select = jest.fn().mockReturnValue(queryChain);
            queryChain.eq = jest.fn().mockReturnValue(queryChain);
            queryChain.order = jest.fn().mockReturnValue(queryChain);
            // Make queryChain thenable so `await query` resolves
            queryChain.then = (res: any, rej: any) =>
                Promise.resolve({ data: [], error: null }).then(res, rej);

            (supabase.from as jest.Mock).mockReturnValue(queryChain);

            await fetchEventParticipants("ev-1", "interested");
            // eq should be called for both event_id and status
            expect(queryChain.eq).toHaveBeenCalledTimes(2);
        });

        it("should return empty on error", async () => {
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue({ data: null, error: { message: "err" } }),
                    }),
                }),
            });
            const participants = await fetchEventParticipants("ev-1");
            expect(participants).toEqual([]);
        });
    });
});
