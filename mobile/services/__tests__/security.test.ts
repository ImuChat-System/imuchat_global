/**
 * Tests for services/security.ts
 * Biometric, MFA (Supabase auth.mfa), sessions, secure storage
 */

// --- Mocks ---
jest.mock("expo-local-authentication", () => ({
    hasHardwareAsync: jest.fn(),
    isEnrolledAsync: jest.fn(),
    supportedAuthenticationTypesAsync: jest.fn(),
    authenticateAsync: jest.fn(),
    AuthenticationType: {
        FINGERPRINT: 1,
        FACIAL_RECOGNITION: 2,
        IRIS: 3,
    },
}));

jest.mock("expo-secure-store", () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
}));

jest.mock("../supabase", () => ({
    supabase: {
        auth: {
            getSession: jest.fn(),
            signOut: jest.fn(),
            mfa: {
                listFactors: jest.fn(),
                enroll: jest.fn(),
                challengeAndVerify: jest.fn(),
                challenge: jest.fn(),
                verify: jest.fn(),
                unenroll: jest.fn(),
            },
        },
    },
}));

jest.mock("../logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import {
    authenticateWithBiometrics,
    checkBiometricAvailability,
    enrollMfa,
    getActiveSessions,
    getBiometryLabel,
    getMfaFactors,
    isBiometricEnabled,
    isMfaEnabled,
    revokeAllSessions,
    setBiometricEnabled,
    unenrollMfa,
    verifyMfaChallenge,
    verifyMfaEnrollment,
} from "../security";
import { supabase } from "../supabase";

beforeEach(() => jest.clearAllMocks());

describe("security", () => {
    // ── Biometric ──
    describe("checkBiometricAvailability", () => {
        it("returns faceId when available + enrolled + enabled", async () => {
            (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
            (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
            (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([2]); // FACIAL_RECOGNITION
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("true");

            const result = await checkBiometricAvailability();
            expect(result.isAvailable).toBe(true);
            expect(result.biometryType).toBe("faceId");
            expect(result.isEnabled).toBe(true);
        });

        it("returns fingerprint type", async () => {
            (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
            (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
            (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([1]); // FINGERPRINT
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("false");

            const result = await checkBiometricAvailability();
            expect(result.biometryType).toBe("fingerprint");
            expect(result.isEnabled).toBe(false);
        });

        it("returns not available when no hardware", async () => {
            (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);
            (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);
            (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([]);
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

            const result = await checkBiometricAvailability();
            expect(result.isAvailable).toBe(false);
            expect(result.biometryType).toBe("none");
        });

        it("handles errors gracefully", async () => {
            (LocalAuthentication.hasHardwareAsync as jest.Mock).mockRejectedValue(new Error("fail"));

            const result = await checkBiometricAvailability();
            expect(result.isAvailable).toBe(false);
        });
    });

    describe("authenticateWithBiometrics", () => {
        it("returns success on successful auth", async () => {
            (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
                success: true,
            });

            const result = await authenticateWithBiometrics();
            expect(result.success).toBe(true);
        });

        it("returns cancelled error", async () => {
            (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
                success: false,
                error: "user_cancel",
            });

            const result = await authenticateWithBiometrics();
            expect(result.success).toBe(false);
            expect(result.error).toContain("annulée");
        });

        it("returns error on failure", async () => {
            (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
                success: false,
                error: "unknown",
            });

            const result = await authenticateWithBiometrics();
            expect(result.success).toBe(false);
        });

        it("handles exception", async () => {
            (LocalAuthentication.authenticateAsync as jest.Mock).mockRejectedValue(
                new Error("crash")
            );

            const result = await authenticateWithBiometrics();
            expect(result.success).toBe(false);
        });
    });

    describe("setBiometricEnabled", () => {
        it("enables biometric after successful auth", async () => {
            (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
                success: true,
            });

            const result = await setBiometricEnabled(true);
            expect(result).toBe(true);
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                "imuchat_biometric_enabled",
                "true"
            );
        });

        it("returns false when auth fails during enable", async () => {
            (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
                success: false,
                error: "user_cancel",
            });

            expect(await setBiometricEnabled(true)).toBe(false);
        });

        it("disables without auth prompt", async () => {
            const result = await setBiometricEnabled(false);
            expect(result).toBe(true);
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                "imuchat_biometric_enabled",
                "false"
            );
            expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled();
        });
    });

    describe("isBiometricEnabled", () => {
        it("returns true when stored as 'true'", async () => {
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("true");
            expect(await isBiometricEnabled()).toBe(true);
        });

        it("returns false when null", async () => {
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
            expect(await isBiometricEnabled()).toBe(false);
        });
    });

    // ── Sessions ──
    describe("getActiveSessions", () => {
        it("returns current session", async () => {
            (supabase.auth.getSession as jest.Mock).mockResolvedValue({
                data: {
                    session: {
                        access_token: "abcdef123456789012",
                        expires_at: Math.floor(Date.now() / 1000) + 3600,
                    },
                },
                error: null,
            });

            const sessions = await getActiveSessions();
            expect(sessions).toHaveLength(1);
            expect(sessions[0].isCurrent).toBe(true);
        });

        it("returns empty on error", async () => {
            (supabase.auth.getSession as jest.Mock).mockResolvedValue({
                data: { session: null },
                error: { message: "No session" },
            });

            expect(await getActiveSessions()).toEqual([]);
        });
    });

    describe("revokeAllSessions", () => {
        it("signs out globally", async () => {
            (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });
            expect(await revokeAllSessions()).toBe(true);
        });

        it("returns false on error", async () => {
            (supabase.auth.signOut as jest.Mock).mockResolvedValue({
                error: { message: "fail" },
            });
            expect(await revokeAllSessions()).toBe(false);
        });
    });

    // ── MFA ──
    describe("getMfaFactors", () => {
        it("returns mapped TOTP factors", async () => {
            (supabase.auth.mfa.listFactors as jest.Mock).mockResolvedValue({
                data: {
                    totp: [
                        {
                            id: "f-1",
                            friendly_name: "My Phone",
                            created_at: "2026-01-01",
                            status: "verified",
                        },
                    ],
                },
                error: null,
            });

            const factors = await getMfaFactors();
            expect(factors).toHaveLength(1);
            expect(factors[0].id).toBe("f-1");
            expect(factors[0].status).toBe("verified");
        });

        it("returns empty on error", async () => {
            (supabase.auth.mfa.listFactors as jest.Mock).mockResolvedValue({
                data: null,
                error: { message: "fail" },
            });

            expect(await getMfaFactors()).toEqual([]);
        });
    });

    describe("isMfaEnabled", () => {
        it("returns true when verified factor exists", async () => {
            (supabase.auth.mfa.listFactors as jest.Mock).mockResolvedValue({
                data: { totp: [{ id: "f-1", status: "verified", created_at: "x" }] },
                error: null,
            });

            expect(await isMfaEnabled()).toBe(true);
        });

        it("returns false when no factors", async () => {
            (supabase.auth.mfa.listFactors as jest.Mock).mockResolvedValue({
                data: { totp: [] },
                error: null,
            });

            expect(await isMfaEnabled()).toBe(false);
        });
    });

    describe("enrollMfa", () => {
        it("returns enrollment on success", async () => {
            (supabase.auth.mfa.enroll as jest.Mock).mockResolvedValue({
                data: {
                    id: "f-new",
                    totp: {
                        uri: "otpauth://...",
                        qr_code: "data:image/svg...",
                        secret: "SECRET123",
                    },
                },
                error: null,
            });

            const result = await enrollMfa("Test");
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.enrollment.secret).toBe("SECRET123");
            }
        });

        it("returns error on failure", async () => {
            (supabase.auth.mfa.enroll as jest.Mock).mockResolvedValue({
                data: null,
                error: { message: "Already enrolled" },
            });

            const result = await enrollMfa();
            expect(result.success).toBe(false);
        });
    });

    describe("verifyMfaEnrollment", () => {
        it("returns success and stores flag", async () => {
            (supabase.auth.mfa.challengeAndVerify as jest.Mock).mockResolvedValue({
                data: {},
                error: null,
            });

            const result = await verifyMfaEnrollment("f-1", "123456");
            expect(result.success).toBe(true);
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                "imuchat_mfa_enabled",
                "true"
            );
        });

        it("returns error on invalid code", async () => {
            (supabase.auth.mfa.challengeAndVerify as jest.Mock).mockResolvedValue({
                data: null,
                error: { message: "Invalid code" },
            });

            const result = await verifyMfaEnrollment("f-1", "000000");
            expect(result.success).toBe(false);
        });
    });

    describe("verifyMfaChallenge", () => {
        it("challenges then verifies", async () => {
            (supabase.auth.mfa.challenge as jest.Mock).mockResolvedValue({
                data: { id: "c-1" },
                error: null,
            });
            (supabase.auth.mfa.verify as jest.Mock).mockResolvedValue({
                data: {},
                error: null,
            });

            const result = await verifyMfaChallenge("f-1", "123456");
            expect(result.success).toBe(true);
        });

        it("returns error when challenge fails", async () => {
            (supabase.auth.mfa.challenge as jest.Mock).mockResolvedValue({
                data: null,
                error: { message: "Challenge failed" },
            });

            const result = await verifyMfaChallenge("f-1", "123456");
            expect(result.success).toBe(false);
        });
    });

    describe("unenrollMfa", () => {
        it("unenrolls and clears MFA flag when no factors remain", async () => {
            (supabase.auth.mfa.unenroll as jest.Mock).mockResolvedValue({
                error: null,
            });
            (supabase.auth.mfa.listFactors as jest.Mock).mockResolvedValue({
                data: { totp: [] },
                error: null,
            });

            expect(await unenrollMfa("f-1")).toBe(true);
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                "imuchat_mfa_enabled",
                "false"
            );
        });

        it("returns false on error", async () => {
            (supabase.auth.mfa.unenroll as jest.Mock).mockResolvedValue({
                error: { message: "fail" },
            });

            expect(await unenrollMfa("f-1")).toBe(false);
        });
    });

    // ── Helpers ──
    describe("getBiometryLabel", () => {
        it("returns correct labels", () => {
            expect(getBiometryLabel("faceId")).toBe("Face ID");
            expect(getBiometryLabel("fingerprint")).toBe("Touch ID / Empreinte");
            expect(getBiometryLabel("iris")).toBe("Iris");
            expect(getBiometryLabel("none")).toBe("Biométrie");
        });
    });
});
