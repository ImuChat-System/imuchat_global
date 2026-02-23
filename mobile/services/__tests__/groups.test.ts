import {
    banMember,
    fetchGroupMembers,
    fetchGroupSettings,
    generateInviteLink,
    getInviteInfo,
    getMyRole,
    joinByInviteCode,
    kickMember,
    leaveGroup,
    muteMember,
    revokeInviteLink,
    transferOwnership,
    unbanMember,
    unmuteMember,
    updateGroupSettings,
    updateMemberRole,
} from "../groups";
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

/** Helper: mock supabase.auth.getUser */
function mockAuth(user: typeof mockUser | null = mockUser) {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user },
    });
}

/** Helper: chainable query builder */
function mockQuery(result: { data?: unknown; error?: unknown; count?: number } = { data: null, error: null }) {
    const chain: Record<string, jest.Mock> = {};
    const methods = ["select", "insert", "update", "delete", "eq", "neq", "in", "is", "gt", "lt", "order", "limit", "single", "maybeSingle", "head", "upsert"];
    for (const m of methods) {
        chain[m] = jest.fn().mockReturnValue(chain);
    }
    // Terminal methods resolve the result
    chain.single.mockResolvedValue(result);
    chain.order.mockResolvedValue(result);
    chain.limit.mockResolvedValue(result);
    chain.eq.mockReturnValue(chain);
    // For delete/update chains, the last eq should resolve
    const resolveChain = () => {
        // Make chain itself thenable for await supabase.from(...).delete().eq().eq()
        (chain as any).then = (resolve: any) => resolve(result);
    };
    // Override: by default, the chain is thenable
    resolveChain();
    return chain;
}

describe("Groups Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─────────────────────────────────────────────
    // fetchGroupSettings
    // ─────────────────────────────────────────────
    describe("fetchGroupSettings", () => {
        it("should return group settings", async () => {
            const raw = {
                id: "g-1",
                name: "Mon Groupe",
                description: "desc",
                rules: null,
                avatar_url: null,
                banner_url: null,
                invite_code: "ABC123",
                invite_expiry: null,
                is_public: false,
                max_members: 100,
                created_at: "2024-01-01T00:00:00Z",
                conversation_members: [{ count: 5 }],
            };
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: raw, error: null }),
                        }),
                    }),
                }),
            });

            const result = await fetchGroupSettings("g-1");
            expect(result).not.toBeNull();
            expect(result!.id).toBe("g-1");
            expect(result!.name).toBe("Mon Groupe");
            expect(result!.memberCount).toBe(5);
        });

        it("should return null on error", async () => {
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: null, error: { message: "fail" } }),
                        }),
                    }),
                }),
            });
            const result = await fetchGroupSettings("g-1");
            expect(result).toBeNull();
        });
    });

    // ─────────────────────────────────────────────
    // updateGroupSettings
    // ─────────────────────────────────────────────
    describe("updateGroupSettings", () => {
        it("should update settings when user is owner/admin", async () => {
            mockAuth();
            // membership check
            const membershipChain = {
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: { role: "owner" } }),
                        }),
                    }),
                }),
            };
            // update
            const updateChain = {
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null }),
                }),
            };
            (supabase.from as jest.Mock)
                .mockReturnValueOnce(membershipChain) // membership check
                .mockReturnValueOnce(updateChain); // update

            const result = await updateGroupSettings("g-1", { name: "New Name" });
            expect(result).toBe(true);
        });

        it("should return false when user has no permission", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: { role: "member" } }),
                        }),
                    }),
                }),
            });
            const result = await updateGroupSettings("g-1", { name: "X" });
            expect(result).toBe(false);
        });

        it("should return false when not authenticated", async () => {
            mockAuth(null);
            const result = await updateGroupSettings("g-1", { name: "X" });
            expect(result).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // fetchGroupMembers
    // ─────────────────────────────────────────────
    describe("fetchGroupMembers", () => {
        it("should return mapped members", async () => {
            const raw = [
                {
                    id: "m-1",
                    conversation_id: "g-1",
                    user_id: "u-1",
                    role: "owner",
                    is_banned: false,
                    is_muted: false,
                    muted_until: null,
                    joined_at: "2024-01-01",
                    user: { id: "u-1", username: "alice", display_name: "Alice", avatar_url: null },
                },
            ];
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            order: jest.fn().mockReturnValue({
                                order: jest.fn().mockResolvedValue({ data: raw, error: null }),
                            }),
                        }),
                    }),
                }),
            });

            const members = await fetchGroupMembers("g-1");
            expect(members).toHaveLength(1);
            expect(members[0].role).toBe("owner");
            expect(members[0].user.username).toBe("alice");
        });

        it("should return empty array on error", async () => {
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            order: jest.fn().mockReturnValue({
                                order: jest.fn().mockResolvedValue({ data: null, error: { message: "err" } }),
                            }),
                        }),
                    }),
                }),
            });
            const members = await fetchGroupMembers("g-1");
            expect(members).toEqual([]);
        });
    });

    // ─────────────────────────────────────────────
    // getMyRole
    // ─────────────────────────────────────────────
    describe("getMyRole", () => {
        it("should return the user role", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                single: jest.fn().mockResolvedValue({ data: { role: "admin" } }),
                            }),
                        }),
                    }),
                }),
            });
            const role = await getMyRole("g-1");
            expect(role).toBe("admin");
        });

        it("should return null when not authenticated", async () => {
            mockAuth(null);
            const role = await getMyRole("g-1");
            expect(role).toBeNull();
        });
    });

    // ─────────────────────────────────────────────
    // updateMemberRole
    // ─────────────────────────────────────────────
    describe("updateMemberRole", () => {
        function setupRoleCheck(actorRole: string, targetRole: string) {
            mockAuth();
            let callIndex = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
                callIndex++;
                if (callIndex === 1) {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    single: jest.fn().mockResolvedValue({ data: { role: actorRole } }),
                                }),
                            }),
                        }),
                    };
                }
                if (callIndex === 2) {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    single: jest.fn().mockResolvedValue({ data: { role: targetRole } }),
                                }),
                            }),
                        }),
                    };
                }
                // update
                return {
                    update: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ error: null }),
                        }),
                    }),
                };
            });
        }

        it("should allow owner to demote admin to member", async () => {
            setupRoleCheck("owner", "admin");
            const result = await updateMemberRole("g-1", "u-2", "member");
            expect(result).toBe(true);
        });

        it("should reject promoting to owner", async () => {
            setupRoleCheck("owner", "member");
            const result = await updateMemberRole("g-1", "u-2", "owner");
            expect(result).toBe(false);
        });

        it("should reject when actor cannot manage target", async () => {
            setupRoleCheck("admin", "owner");
            const result = await updateMemberRole("g-1", "u-2", "member");
            expect(result).toBe(false);
        });

        it("should reject when not admin/owner", async () => {
            setupRoleCheck("member", "member");
            const result = await updateMemberRole("g-1", "u-2", "moderator");
            expect(result).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // transferOwnership
    // ─────────────────────────────────────────────
    describe("transferOwnership", () => {
        it("should transfer ownership from owner to member", async () => {
            mockAuth();
            let callIndex = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
                callIndex++;
                if (callIndex === 1) {
                    // actor membership
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    single: jest.fn().mockResolvedValue({ data: { role: "owner" } }),
                                }),
                            }),
                        }),
                    };
                }
                if (callIndex === 2) {
                    // new owner membership
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    eq: jest.fn().mockReturnValue({
                                        single: jest.fn().mockResolvedValue({ data: { id: "m-2" } }),
                                    }),
                                }),
                            }),
                        }),
                    };
                }
                // update calls
                return {
                    update: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ error: null }),
                        }),
                    }),
                };
            });

            const result = await transferOwnership("g-1", "u-2");
            expect(result).toBe(true);
        });

        it("should reject when actor is not owner", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: { role: "admin" } }),
                        }),
                    }),
                }),
            });
            const result = await transferOwnership("g-1", "u-2");
            expect(result).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // kickMember
    // ─────────────────────────────────────────────
    describe("kickMember", () => {
        it("should kick a lower-role member", async () => {
            mockAuth();
            let callIndex = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
                callIndex++;
                if (callIndex <= 2) {
                    const role = callIndex === 1 ? "admin" : "member";
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    single: jest.fn().mockResolvedValue({ data: { role } }),
                                }),
                            }),
                        }),
                    };
                }
                return {
                    delete: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ error: null }),
                        }),
                    }),
                };
            });
            const result = await kickMember("g-1", "u-2");
            expect(result).toBe(true);
        });

        it("should not kick higher-role member", async () => {
            mockAuth();
            let callIndex = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
                callIndex++;
                const role = callIndex === 1 ? "member" : "admin";
                return {
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                single: jest.fn().mockResolvedValue({ data: { role } }),
                            }),
                        }),
                    }),
                };
            });
            const result = await kickMember("g-1", "u-2");
            expect(result).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // banMember / unbanMember
    // ─────────────────────────────────────────────
    describe("banMember", () => {
        it("should ban a lower-role member when actor is admin", async () => {
            mockAuth();
            let callIndex = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
                callIndex++;
                if (callIndex <= 2) {
                    const role = callIndex === 1 ? "admin" : "member";
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    single: jest.fn().mockResolvedValue({ data: { role } }),
                                }),
                            }),
                        }),
                    };
                }
                return {
                    update: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ error: null }),
                        }),
                    }),
                };
            });
            const result = await banMember("g-1", "u-2");
            expect(result).toBe(true);
        });

        it("should reject ban by moderator", async () => {
            mockAuth();
            let callIndex = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
                callIndex++;
                const role = callIndex === 1 ? "moderator" : "member";
                return {
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                single: jest.fn().mockResolvedValue({ data: { role } }),
                            }),
                        }),
                    }),
                };
            });
            const result = await banMember("g-1", "u-2");
            expect(result).toBe(false);
        });
    });

    describe("unbanMember", () => {
        it("should unban when actor is admin", async () => {
            mockAuth();
            let callIndex = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
                callIndex++;
                if (callIndex === 1) {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    single: jest.fn().mockResolvedValue({ data: { role: "admin" } }),
                                }),
                            }),
                        }),
                    };
                }
                return {
                    update: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ error: null }),
                        }),
                    }),
                };
            });
            const result = await unbanMember("g-1", "u-2");
            expect(result).toBe(true);
        });
    });

    // ─────────────────────────────────────────────
    // muteMember / unmuteMember
    // ─────────────────────────────────────────────
    describe("muteMember", () => {
        it("should mute a member with duration", async () => {
            mockAuth();
            let callIndex = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
                callIndex++;
                if (callIndex <= 2) {
                    const role = callIndex === 1 ? "moderator" : "member";
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    single: jest.fn().mockResolvedValue({ data: { role } }),
                                }),
                            }),
                        }),
                    };
                }
                return {
                    update: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ error: null }),
                        }),
                    }),
                };
            });
            const result = await muteMember("g-1", "u-2", 60);
            expect(result).toBe(true);
        });
    });

    describe("unmuteMember", () => {
        it("should unmute when actor is moderator+", async () => {
            mockAuth();
            let callIndex = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
                callIndex++;
                if (callIndex === 1) {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    single: jest.fn().mockResolvedValue({ data: { role: "moderator" } }),
                                }),
                            }),
                        }),
                    };
                }
                return {
                    update: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ error: null }),
                        }),
                    }),
                };
            });
            const result = await unmuteMember("g-1", "u-2");
            expect(result).toBe(true);
        });
    });

    // ─────────────────────────────────────────────
    // generateInviteLink
    // ─────────────────────────────────────────────
    describe("generateInviteLink", () => {
        it("should generate invite code when admin", async () => {
            mockAuth();
            let callIndex = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
                callIndex++;
                if (callIndex === 1) {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    single: jest.fn().mockResolvedValue({ data: { role: "admin" } }),
                                }),
                            }),
                        }),
                    };
                }
                return {
                    update: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                };
            });
            (supabase.rpc as jest.Mock).mockResolvedValue({ data: "TESTCODE" });

            const code = await generateInviteLink("g-1");
            expect(code).toBe("TESTCODE");
        });

        it("should return null when member", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: { role: "member" } }),
                        }),
                    }),
                }),
            });
            const code = await generateInviteLink("g-1");
            expect(code).toBeNull();
        });
    });

    // ─────────────────────────────────────────────
    // revokeInviteLink
    // ─────────────────────────────────────────────
    describe("revokeInviteLink", () => {
        it("should revoke invite link", async () => {
            mockAuth();
            let callIndex = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
                callIndex++;
                if (callIndex === 1) {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    single: jest.fn().mockResolvedValue({ data: { role: "owner" } }),
                                }),
                            }),
                        }),
                    };
                }
                return {
                    update: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                };
            });
            const result = await revokeInviteLink("g-1");
            expect(result).toBe(true);
        });
    });

    // ─────────────────────────────────────────────
    // getInviteInfo
    // ─────────────────────────────────────────────
    describe("getInviteInfo", () => {
        it("should return invite info for valid code", async () => {
            const raw = {
                id: "g-1",
                name: "Groupe",
                avatar_url: null,
                invite_code: "ABC123",
                invite_expiry: new Date(Date.now() + 86400000).toISOString(),
                conversation_members: [{ count: 3 }],
            };
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: raw, error: null }),
                        }),
                    }),
                }),
            });
            const info = await getInviteInfo("ABC123");
            expect(info).not.toBeNull();
            expect(info!.code).toBe("ABC123");
            expect(info!.memberCount).toBe(3);
        });

        it("should return null for expired invite", async () => {
            const raw = {
                id: "g-1",
                name: "X",
                avatar_url: null,
                invite_code: "ABC123",
                invite_expiry: new Date(Date.now() - 86400000).toISOString(), // expired
                conversation_members: [{ count: 1 }],
            };
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: raw, error: null }),
                        }),
                    }),
                }),
            });
            const info = await getInviteInfo("ABC123");
            expect(info).toBeNull();
        });
    });

    // ─────────────────────────────────────────────
    // joinByInviteCode
    // ─────────────────────────────────────────────
    describe("joinByInviteCode", () => {
        it("should return null when banned", async () => {
            mockAuth();
            // getInviteInfo success
            (supabase.from as jest.Mock)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                single: jest.fn().mockResolvedValue({
                                    data: {
                                        id: "g-1", name: "G", avatar_url: null, invite_code: "CODE",
                                        invite_expiry: new Date(Date.now() + 86400000).toISOString(),
                                        conversation_members: [{ count: 2 }],
                                    },
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                })
                // existing membership check
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                single: jest.fn().mockResolvedValue({
                                    data: { id: "m-1", is_banned: true },
                                }),
                            }),
                        }),
                    }),
                });

            const result = await joinByInviteCode("CODE");
            expect(result).toBeNull();
        });
    });

    // ─────────────────────────────────────────────
    // leaveGroup
    // ─────────────────────────────────────────────
    describe("leaveGroup", () => {
        it("should leave group as non-owner member", async () => {
            mockAuth();
            let callIndex = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
                callIndex++;
                if (callIndex === 1) {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    single: jest.fn().mockResolvedValue({ data: { role: "member" } }),
                                }),
                            }),
                        }),
                    };
                }
                return {
                    delete: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ error: null }),
                        }),
                    }),
                };
            });
            const result = await leaveGroup("g-1");
            expect(result).toBe(true);
        });

        it("should block owner from leaving when other members exist", async () => {
            mockAuth();
            let callIndex = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
                callIndex++;
                if (callIndex === 1) {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    single: jest.fn().mockResolvedValue({ data: { role: "owner" } }),
                                }),
                            }),
                        }),
                    };
                }
                // count query
                return {
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            neq: jest.fn().mockReturnValue({
                                eq: jest.fn().mockResolvedValue({ count: 3 }),
                            }),
                        }),
                    }),
                };
            });
            const result = await leaveGroup("g-1");
            expect(result).toBe(false);
        });

        it("should return false when not authenticated", async () => {
            mockAuth(null);
            const result = await leaveGroup("g-1");
            expect(result).toBe(false);
        });
    });
});
