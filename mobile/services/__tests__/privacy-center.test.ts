import {
    blockUser,
    exportUserData,
    getBlockedUsers,
    getMyReports,
    getPrivacyConsents,
    isUserBlocked,
    REPORT_REASONS,
    requestAccountDeletion,
    shareExportedData,
    submitReport,
    unblockUser,
    updatePrivacyConsent,
} from "../privacy-center";
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
        auth: {
            getUser: jest.fn(),
            signOut: jest.fn().mockResolvedValue({}),
        },
        rpc: jest.fn(),
    },
}));

jest.mock("expo-file-system/legacy", () => ({
    documentDirectory: "/mock/docs/",
    writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
    EncodingType: { UTF8: "utf8" },
}));

jest.mock("expo-sharing", () => ({
    isAvailableAsync: jest.fn().mockResolvedValue(true),
    shareAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockUser = { id: "user-1", email: "test@test.com" };

function mockAuth(user: typeof mockUser | null = mockUser) {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user },
    });
}

describe("Privacy Center Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─────────────────────────────────────────────
    // REPORT_REASONS constant
    // ─────────────────────────────────────────────
    describe("REPORT_REASONS", () => {
        it("should have 8 report reasons", () => {
            expect(REPORT_REASONS).toHaveLength(8);
        });

        it("should include spam and harassment", () => {
            const values = REPORT_REASONS.map((r) => r.value);
            expect(values).toContain("spam");
            expect(values).toContain("harassment");
            expect(values).toContain("hate_speech");
        });

        it("should have labelKey for each reason", () => {
            for (const reason of REPORT_REASONS) {
                expect(reason.labelKey).toBeTruthy();
                expect(reason.labelKey).toContain("privacy.reportReason");
            }
        });
    });

    // ─────────────────────────────────────────────
    // blockUser
    // ─────────────────────────────────────────────
    describe("blockUser", () => {
        it("should block a user", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockResolvedValue({ error: null }),
            });
            const result = await blockUser("u-2");
            expect(result).toBe(true);
        });

        it("should return true if already blocked (unique constraint)", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockResolvedValue({ error: { code: "23505" } }),
            });
            const result = await blockUser("u-2");
            expect(result).toBe(true);
        });

        it("should return false on other errors", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockResolvedValue({ error: { code: "500", message: "fail" } }),
            });
            const result = await blockUser("u-2");
            expect(result).toBe(false);
        });

        it("should return false when not authenticated", async () => {
            mockAuth(null);
            const result = await blockUser("u-2");
            expect(result).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // unblockUser
    // ─────────────────────────────────────────────
    describe("unblockUser", () => {
        it("should unblock a user", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            });
            const result = await unblockUser("u-2");
            expect(result).toBe(true);
        });

        it("should return false when not authenticated", async () => {
            mockAuth(null);
            const result = await unblockUser("u-2");
            expect(result).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // getBlockedUsers
    // ─────────────────────────────────────────────
    describe("getBlockedUsers", () => {
        it("should return blocked users list", async () => {
            mockAuth();
            const raw = [
                {
                    id: "b-1",
                    user_id: "user-1",
                    blocked_user_id: "u-2",
                    created_at: "2024-01-01",
                    blocked_user: { username: "troll", display_name: "Troll", avatar_url: null },
                },
            ];
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue({ data: raw, error: null }),
                    }),
                }),
            });
            const result = await getBlockedUsers();
            expect(result).toHaveLength(1);
            expect(result[0].blockedUserId).toBe("u-2");
            expect(result[0].blockedUser.username).toBe("troll");
        });

        it("should return empty array when not authenticated", async () => {
            mockAuth(null);
            const result = await getBlockedUsers();
            expect(result).toEqual([]);
        });
    });

    // ─────────────────────────────────────────────
    // isUserBlocked
    // ─────────────────────────────────────────────
    describe("isUserBlocked", () => {
        it("should return true when user is blocked", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({ data: { id: "b-1" }, error: null }),
                        }),
                    }),
                }),
            });
            const result = await isUserBlocked("u-2");
            expect(result).toBe(true);
        });

        it("should return false when user is not blocked", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                        }),
                    }),
                }),
            });
            const result = await isUserBlocked("u-2");
            expect(result).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // submitReport
    // ─────────────────────────────────────────────
    describe("submitReport", () => {
        it("should submit a report", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: { id: "rep-1" }, error: null }),
                    }),
                }),
            });
            const result = await submitReport({
                reportType: "user",
                targetId: "u-2",
                reason: "spam",
                description: "Spamming",
            });
            expect(result.success).toBe(true);
            expect(result.reportId).toBe("rep-1");
        });

        it("should return error when not authenticated", async () => {
            mockAuth(null);
            const result = await submitReport({
                reportType: "user",
                targetId: "u-2",
                reason: "harassment",
            });
            expect(result.success).toBe(false);
            expect(result.error).toBe("Not authenticated");
        });

        it("should return error on DB failure", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
                    }),
                }),
            });
            const result = await submitReport({
                reportType: "message",
                targetId: "m-1",
                reason: "violence",
            });
            expect(result.success).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // getMyReports
    // ─────────────────────────────────────────────
    describe("getMyReports", () => {
        it("should return user reports", async () => {
            mockAuth();
            const raw = [
                {
                    id: "rep-1",
                    reporter_id: "user-1",
                    report_type: "user",
                    target_id: "u-2",
                    target_user_id: "u-2",
                    reason: "spam",
                    description: null,
                    status: "pending",
                    created_at: "2024-01-01",
                    updated_at: "2024-01-01",
                },
            ];
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue({ data: raw, error: null }),
                    }),
                }),
            });
            const reports = await getMyReports();
            expect(reports).toHaveLength(1);
            expect(reports[0].reason).toBe("spam");
        });

        it("should return empty when not authenticated", async () => {
            mockAuth(null);
            const reports = await getMyReports();
            expect(reports).toEqual([]);
        });
    });

    // ─────────────────────────────────────────────
    // getPrivacyConsents
    // ─────────────────────────────────────────────
    describe("getPrivacyConsents", () => {
        it("should return consents from DB", async () => {
            mockAuth();
            const raw = [
                { id: "c-1", consent_type: "analytics", granted: true, granted_at: "2024-01-01", revoked_at: null },
                { id: "c-2", consent_type: "marketing", granted: false, granted_at: null, revoked_at: "2024-01-01" },
            ];
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ data: raw, error: null }),
                }),
            });
            const consents = await getPrivacyConsents();
            expect(consents).toHaveLength(2);
            expect(consents[0].consentType).toBe("analytics");
            expect(consents[0].granted).toBe(true);
        });

        it("should return defaults when no data", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ data: [], error: null }),
                }),
            });
            const consents = await getPrivacyConsents();
            expect(consents).toHaveLength(4);
            expect(consents[0].consentType).toBe("analytics");
            expect(consents[0].granted).toBe(true);
            expect(consents[1].consentType).toBe("marketing");
            expect(consents[1].granted).toBe(false);
        });

        it("should return defaults on error", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ data: null, error: { message: "no table" } }),
                }),
            });
            const consents = await getPrivacyConsents();
            expect(consents).toHaveLength(4);
        });
    });

    // ─────────────────────────────────────────────
    // updatePrivacyConsent
    // ─────────────────────────────────────────────
    describe("updatePrivacyConsent", () => {
        it("should upsert consent", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                upsert: jest.fn().mockResolvedValue({ error: null }),
            });
            const result = await updatePrivacyConsent("analytics", true);
            expect(result).toBe(true);
        });

        it("should return false when not authenticated", async () => {
            mockAuth(null);
            const result = await updatePrivacyConsent("analytics", true);
            expect(result).toBe(false);
        });

        it("should return false on error", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                upsert: jest.fn().mockResolvedValue({ error: { message: "fail" } }),
            });
            const result = await updatePrivacyConsent("marketing", false);
            expect(result).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // exportUserData
    // ─────────────────────────────────────────────
    describe("exportUserData", () => {
        it("should export data and return file path", async () => {
            mockAuth();
            const progressCalls: any[] = [];

            // Mock all the chained from() calls for different tables
            (supabase.from as jest.Mock).mockImplementation((table: string) => {
                if (table === "profiles") {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                single: jest.fn().mockResolvedValue({ data: { id: "user-1", username: "me" } }),
                            }),
                        }),
                    };
                }
                if (table === "conversation_members") {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ data: [], error: null }),
                        }),
                    };
                }
                if (table === "friendships") {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ data: [], error: null }),
                        }),
                    };
                }
                if (table === "stories") {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ data: [], error: null }),
                        }),
                    };
                }
                if (table === "blocked_users") {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                order: jest.fn().mockResolvedValue({ data: [], error: null }),
                            }),
                        }),
                    };
                }
                if (table === "reports") {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                order: jest.fn().mockResolvedValue({ data: [], error: null }),
                            }),
                        }),
                    };
                }
                if (table === "privacy_consents") {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ data: [], error: null }),
                        }),
                    };
                }
                return {
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
                    }),
                };
            });

            const result = await exportUserData((p) => progressCalls.push(p));
            expect(result.success).toBe(true);
            expect(result.filePath).toContain("/mock/docs/");
            expect(progressCalls.length).toBeGreaterThan(0);
            // Should end with complete
            expect(progressCalls[progressCalls.length - 1].status).toBe("complete");
        });

        it("should return error when not authenticated", async () => {
            mockAuth(null);
            const result = await exportUserData();
            expect(result.success).toBe(false);
            expect(result.error).toBe("Not authenticated");
        });
    });

    // ─────────────────────────────────────────────
    // shareExportedData
    // ─────────────────────────────────────────────
    describe("shareExportedData", () => {
        it("should share file", async () => {
            const Sharing = require("expo-sharing");
            Sharing.isAvailableAsync.mockResolvedValue(true);

            const result = await shareExportedData("/path/to/export.json");
            expect(result).toBe(true);
            expect(Sharing.shareAsync).toHaveBeenCalledWith(
                "/path/to/export.json",
                expect.objectContaining({ mimeType: "application/json" }),
            );
        });

        it("should return false when sharing not available", async () => {
            const Sharing = require("expo-sharing");
            Sharing.isAvailableAsync.mockResolvedValue(false);

            const result = await shareExportedData("/path/to/export.json");
            expect(result).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // requestAccountDeletion
    // ─────────────────────────────────────────────
    describe("requestAccountDeletion", () => {
        it("should soft-delete account and sign out", async () => {
            mockAuth();
            (supabase.from as jest.Mock)
                .mockReturnValueOnce({
                    // account_deletion_requests insert
                    insert: jest.fn().mockResolvedValue({ error: null }),
                })
                .mockReturnValueOnce({
                    // profiles update
                    update: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                });

            const result = await requestAccountDeletion("Not happy");
            expect(result.success).toBe(true);
            expect(supabase.auth.signOut).toHaveBeenCalled();
        });

        it("should return error when not authenticated", async () => {
            mockAuth(null);
            const result = await requestAccountDeletion();
            expect(result.success).toBe(false);
            expect(result.error).toBe("Not authenticated");
        });

        it("should proceed even if deletion request table fails", async () => {
            mockAuth();
            (supabase.from as jest.Mock)
                .mockReturnValueOnce({
                    insert: jest.fn().mockResolvedValue({ error: { message: "table missing" } }),
                })
                .mockReturnValueOnce({
                    update: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                });

            const result = await requestAccountDeletion();
            expect(result.success).toBe(true);
        });
    });
});
