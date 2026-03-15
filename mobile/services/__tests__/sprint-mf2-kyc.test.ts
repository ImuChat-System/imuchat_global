/**
 * Sprint M-F2 — KYC Verification Tests
 *
 * Tests:
 *   1. Type helpers (25+ functions: document labels, validation, tier config, limits, etc.)
 *   2. API functions (getKycProfile, startVerificationAttempt, uploadIdentityDocument,
 *      uploadAddressProof, submitSelfieCheck, getVerificationAttempt, getVerificationHistory,
 *      cancelVerificationAttempt, refreshAttemptStatus, getDocumentsByAttempt)
 *   3. Store actions (loadProfile, loadHistory, startVerification, uploadDocument,
 *      uploadAddress, submitSelfie, cancelAttempt, refreshStatus, loadDocuments)
 *
 * Pattern: Supabase chain mocking (jest.mock → mockFrom → select→eq→single etc.)
 */

// ── Mocks ────────────────────────────────────────────────────

jest.mock("../supabase", () => ({
    supabase: {
        from: jest.fn(),
        auth: { getUser: jest.fn() },
        rpc: jest.fn(),
        functions: { invoke: jest.fn() },
    },
    getCurrentUser: jest.fn(),
}));

jest.mock("../logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

jest.mock("@react-native-async-storage/async-storage", () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// ── Imports ──────────────────────────────────────────────────

import { useKycVerificationStore } from "@/stores/kyc-verification-store";
import type {
    VerificationAttempt,
    VerificationStepDetail
} from "@/types/kyc-verification";
import {
    ALLOWED_MIME_TYPES,
    KYC_COOLDOWN_HOURS,
    KYC_DOCUMENT_TYPE_CONFIG,
    KYC_TIER_DETAIL_CONFIG,
    MAX_ADDRESS_PROOF_AGE_DAYS,
    MAX_DOCUMENT_SIZE_BYTES,
    MAX_DOCUMENT_SIZE_MB,
    MAX_VERIFICATION_ATTEMPTS,
    MIN_AGE_YEARS,
    SELFIE_MATCH_THRESHOLD,
    SUPPORTED_COUNTRIES,
    VERIFICATION_ATTEMPT_STATUS_CONFIG,
    VERIFICATION_STEP_CONFIG,
    VERIFICATION_STEP_STATUS_CONFIG,
    areAllStepsApproved,
    calculateAge,
    canCashoutAtTier,
    canRetryVerification,
    computeVerificationProgress,
    getAddressProofLabel,
    getAttemptStatusLabel,
    getCountryByCode,
    getDailyLimitForTier,
    getDocumentTypeIcon,
    getDocumentTypeLabel,
    getDocumentTypesForCountry,
    getMonthlyLimitForTier,
    getNextPendingStep,
    getStepStatusLabel,
    getTierConfig,
    getTierLabel,
    getTierRequirements,
    getVerificationStepLabel,
    getVerificationStepOrder,
    isAddressProofTooOld,
    isAttemptExpired,
    isDocumentExpired,
    isFileSizeValid,
    isFileTypeAllowed,
    isKycRequiredForAmount,
    isOldEnoughForKyc,
    sortAttemptsByDate,
} from "@/types/kyc-verification";
import { act } from "@testing-library/react-native";
import {
    cancelVerificationAttempt,
    getDocumentsByAttempt,
    getKycProfile,
    getVerificationAttempt,
    getVerificationHistory,
    refreshAttemptStatus,
    startVerificationAttempt,
    submitSelfieCheck,
    uploadAddressProof,
    uploadIdentityDocument,
} from "../kyc-verification-api";
import { supabase } from "../supabase";

const mockAuth = supabase.auth.getUser as jest.Mock;
const mockFrom = supabase.from as jest.Mock;
const mockInvoke = supabase.functions.invoke as jest.Mock;

// ── Helpers ──────────────────────────────────────────────────

const testUser = { id: "user-kyc-42", email: "kyc@test.com" };

function setupAuth(user = testUser) {
    mockAuth.mockResolvedValue({ data: { user } });
}

function setupNoAuth() {
    mockAuth.mockResolvedValue({ data: { user: null } });
}

function makeAttempt(
    overrides?: Partial<VerificationAttempt>,
): VerificationAttempt {
    return {
        id: "attempt-1",
        userId: testUser.id,
        targetTier: 2,
        status: "pending",
        steps: [
            { step: "identity", status: "pending", documentId: null, submittedAt: null, reviewedAt: null, note: null },
            { step: "address", status: "pending", documentId: null, submittedAt: null, reviewedAt: null, note: null },
            { step: "selfie", status: "pending", documentId: null, submittedAt: null, reviewedAt: null, note: null },
            { step: "review", status: "pending", documentId: null, submittedAt: null, reviewedAt: null, note: null },
        ],
        onfidoApplicantId: null,
        onfidoCheckId: null,
        onfidoResult: null,
        startedAt: new Date().toISOString(),
        completedAt: null,
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        rejectionReason: null,
        ...overrides,
    };
}

beforeEach(() => {
    jest.clearAllMocks();
    useKycVerificationStore.setState({
        profile: null,
        currentAttempt: null,
        history: [],
        documents: [],
        currentStep: null,
        progress: 0,
        canRetry: false,
        isLoading: false,
        error: null,
    });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 1 — TYPE HELPERS
// ═══════════════════════════════════════════════════════════════

describe("kyc-verification types & helpers", () => {
    // ── Config Maps ──
    describe("config maps", () => {
        it("has 4 document types", () => {
            expect(Object.keys(KYC_DOCUMENT_TYPE_CONFIG)).toHaveLength(4);
        });

        it("has 4 verification steps", () => {
            expect(Object.keys(VERIFICATION_STEP_CONFIG)).toHaveLength(4);
        });

        it("has 5 step statuses", () => {
            expect(Object.keys(VERIFICATION_STEP_STATUS_CONFIG)).toHaveLength(5);
        });

        it("has 6 attempt statuses", () => {
            expect(Object.keys(VERIFICATION_ATTEMPT_STATUS_CONFIG)).toHaveLength(6);
        });

        it("has 4 tier configs", () => {
            expect(Object.keys(KYC_TIER_DETAIL_CONFIG)).toHaveLength(4);
        });

        it("has 10 supported countries", () => {
            expect(SUPPORTED_COUNTRIES).toHaveLength(10);
        });
    });

    // ── Label Helpers ──
    describe("label helpers", () => {
        it("getDocumentTypeLabel returns correct label", () => {
            expect(getDocumentTypeLabel("passport")).toBe("Passeport");
            expect(getDocumentTypeLabel("id_card")).toBe("Carte d'identité");
        });

        it("getDocumentTypeIcon returns an emoji", () => {
            expect(getDocumentTypeIcon("passport")).toBe("🛂");
        });

        it("getAddressProofLabel returns correct label", () => {
            expect(getAddressProofLabel("utility_bill")).toBe("Facture de service");
        });

        it("getVerificationStepLabel returns correct label", () => {
            expect(getVerificationStepLabel("identity")).toBe("Identité");
            expect(getVerificationStepLabel("selfie")).toBe("Selfie");
        });

        it("getVerificationStepOrder returns correct order", () => {
            expect(getVerificationStepOrder("identity")).toBe(1);
            expect(getVerificationStepOrder("review")).toBe(4);
        });

        it("getStepStatusLabel returns correct label", () => {
            expect(getStepStatusLabel("approved")).toBe("Approuvé");
        });

        it("getAttemptStatusLabel returns correct label", () => {
            expect(getAttemptStatusLabel("processing")).toBe("Traitement");
        });

        it("getTierConfig returns config object", () => {
            const config = getTierConfig(2);
            expect(config.label).toBe("Vérifié");
            expect(config.canCashout).toBe(true);
        });

        it("getTierLabel returns tier name", () => {
            expect(getTierLabel(0)).toBe("Non vérifié");
            expect(getTierLabel(3)).toBe("Premium");
        });
    });

    // ── Document Validation ──
    describe("document validation", () => {
        it("isDocumentExpired returns false for null", () => {
            expect(isDocumentExpired(null)).toBe(false);
        });

        it("isDocumentExpired returns true for past date", () => {
            expect(isDocumentExpired("2020-01-01")).toBe(true);
        });

        it("isDocumentExpired returns false for future date", () => {
            expect(isDocumentExpired("2099-12-31")).toBe(false);
        });

        it("isAddressProofTooOld returns true for old document", () => {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - (MAX_ADDRESS_PROOF_AGE_DAYS + 1));
            expect(isAddressProofTooOld(oldDate.toISOString())).toBe(true);
        });

        it("isAddressProofTooOld returns false for recent document", () => {
            const recentDate = new Date();
            recentDate.setDate(recentDate.getDate() - 10);
            expect(isAddressProofTooOld(recentDate.toISOString())).toBe(false);
        });

        it("isFileSizeValid accepts valid sizes", () => {
            expect(isFileSizeValid(1024)).toBe(true);
            expect(isFileSizeValid(MAX_DOCUMENT_SIZE_BYTES)).toBe(true);
        });

        it("isFileSizeValid rejects invalid sizes", () => {
            expect(isFileSizeValid(0)).toBe(false);
            expect(isFileSizeValid(MAX_DOCUMENT_SIZE_BYTES + 1)).toBe(false);
        });

        it("isFileTypeAllowed accepts allowed types", () => {
            expect(isFileTypeAllowed("image/jpeg")).toBe(true);
            expect(isFileTypeAllowed("application/pdf")).toBe(true);
        });

        it("isFileTypeAllowed rejects unknown types", () => {
            expect(isFileTypeAllowed("application/zip")).toBe(false);
        });
    });

    // ── Verification Logic ──
    describe("verification logic", () => {
        it("canRetryVerification allows first attempt", () => {
            expect(canRetryVerification(null, 0)).toBe(true);
        });

        it("canRetryVerification blocks if max attempts reached", () => {
            expect(canRetryVerification(null, MAX_VERIFICATION_ATTEMPTS)).toBe(false);
        });

        it("canRetryVerification blocks pending attempt", () => {
            const attempt = makeAttempt({ status: "pending" });
            expect(canRetryVerification(attempt, 1)).toBe(false);
        });

        it("canRetryVerification blocks processing attempt", () => {
            const attempt = makeAttempt({ status: "processing" });
            expect(canRetryVerification(attempt, 1)).toBe(false);
        });

        it("canRetryVerification allows after cooldown", () => {
            const past = new Date(
                Date.now() - (KYC_COOLDOWN_HOURS + 1) * 60 * 60 * 1000,
            ).toISOString();
            const attempt = makeAttempt({
                status: "rejected",
                completedAt: past,
            });
            expect(canRetryVerification(attempt, 1)).toBe(true);
        });

        it("canRetryVerification blocks during cooldown", () => {
            const recent = new Date().toISOString();
            const attempt = makeAttempt({
                status: "rejected",
                completedAt: recent,
            });
            expect(canRetryVerification(attempt, 1)).toBe(false);
        });

        it("isAttemptExpired detects expired attempt", () => {
            const expired = makeAttempt({
                expiresAt: new Date(Date.now() - 1000).toISOString(),
            });
            expect(isAttemptExpired(expired)).toBe(true);
        });

        it("isAttemptExpired returns false for valid attempt", () => {
            const valid = makeAttempt();
            expect(isAttemptExpired(valid)).toBe(false);
        });
    });

    // ── Progress & Steps ──
    describe("progress & steps", () => {
        it("computeVerificationProgress returns 0 for empty steps", () => {
            expect(computeVerificationProgress([])).toBe(0);
        });

        it("computeVerificationProgress computes correctly", () => {
            const steps: VerificationStepDetail[] = [
                { step: "identity", status: "approved", documentId: null, submittedAt: null, reviewedAt: null, note: null },
                { step: "address", status: "approved", documentId: null, submittedAt: null, reviewedAt: null, note: null },
                { step: "selfie", status: "pending", documentId: null, submittedAt: null, reviewedAt: null, note: null },
                { step: "review", status: "pending", documentId: null, submittedAt: null, reviewedAt: null, note: null },
            ];
            expect(computeVerificationProgress(steps)).toBe(50);
        });

        it("computeVerificationProgress returns 100 when all approved", () => {
            const steps: VerificationStepDetail[] = [
                { step: "identity", status: "approved", documentId: null, submittedAt: null, reviewedAt: null, note: null },
                { step: "selfie", status: "approved", documentId: null, submittedAt: null, reviewedAt: null, note: null },
            ];
            expect(computeVerificationProgress(steps)).toBe(100);
        });

        it("getNextPendingStep returns first pending step by order", () => {
            const steps: VerificationStepDetail[] = [
                { step: "selfie", status: "pending", documentId: null, submittedAt: null, reviewedAt: null, note: null },
                { step: "identity", status: "pending", documentId: null, submittedAt: null, reviewedAt: null, note: null },
            ];
            expect(getNextPendingStep(steps)).toBe("identity");
        });

        it("getNextPendingStep returns null when all approved", () => {
            const steps: VerificationStepDetail[] = [
                { step: "identity", status: "approved", documentId: null, submittedAt: null, reviewedAt: null, note: null },
            ];
            expect(getNextPendingStep(steps)).toBeNull();
        });

        it("getNextPendingStep considers rejected as pending", () => {
            const steps: VerificationStepDetail[] = [
                { step: "identity", status: "approved", documentId: null, submittedAt: null, reviewedAt: null, note: null },
                { step: "address", status: "rejected", documentId: null, submittedAt: null, reviewedAt: null, note: null },
            ];
            expect(getNextPendingStep(steps)).toBe("address");
        });

        it("areAllStepsApproved returns true when all approved", () => {
            const steps: VerificationStepDetail[] = [
                { step: "identity", status: "approved", documentId: null, submittedAt: null, reviewedAt: null, note: null },
                { step: "selfie", status: "approved", documentId: null, submittedAt: null, reviewedAt: null, note: null },
            ];
            expect(areAllStepsApproved(steps)).toBe(true);
        });

        it("areAllStepsApproved returns false with pending step", () => {
            const steps: VerificationStepDetail[] = [
                { step: "identity", status: "approved", documentId: null, submittedAt: null, reviewedAt: null, note: null },
                { step: "selfie", status: "pending", documentId: null, submittedAt: null, reviewedAt: null, note: null },
            ];
            expect(areAllStepsApproved(steps)).toBe(false);
        });

        it("areAllStepsApproved returns false for empty", () => {
            expect(areAllStepsApproved([])).toBe(false);
        });
    });

    // ── Tier Limits ──
    describe("tier limits", () => {
        it("getDailyLimitForTier returns correct limits", () => {
            expect(getDailyLimitForTier(0)).toBe(5_000);
            expect(getDailyLimitForTier(1)).toBe(50_000);
            expect(getDailyLimitForTier(2)).toBe(500_000);
            expect(getDailyLimitForTier(3)).toBe(2_000_000);
        });

        it("getMonthlyLimitForTier returns correct limits", () => {
            expect(getMonthlyLimitForTier(0)).toBe(20_000);
            expect(getMonthlyLimitForTier(3)).toBe(10_000_000);
        });

        it("canCashoutAtTier returns false for tier 0-1", () => {
            expect(canCashoutAtTier(0)).toBe(false);
            expect(canCashoutAtTier(1)).toBe(false);
        });

        it("canCashoutAtTier returns true for tier 2-3", () => {
            expect(canCashoutAtTier(2)).toBe(true);
            expect(canCashoutAtTier(3)).toBe(true);
        });

        it("isKycRequiredForAmount detects over-limit", () => {
            expect(isKycRequiredForAmount(3_000, 0)).toBe(true);
        });

        it("isKycRequiredForAmount allows under-limit", () => {
            expect(isKycRequiredForAmount(1_000, 0)).toBe(false);
        });
    });

    // ── Age & Requirements ──
    describe("age & requirements", () => {
        it("calculateAge computes correctly", () => {
            const dob = new Date();
            dob.setFullYear(dob.getFullYear() - 18);
            expect(calculateAge(dob.toISOString())).toBe(18);
        });

        it("isOldEnoughForKyc returns true for 13+", () => {
            const dob = new Date();
            dob.setFullYear(dob.getFullYear() - 14);
            expect(isOldEnoughForKyc(dob.toISOString())).toBe(true);
        });

        it("isOldEnoughForKyc returns false for under 13", () => {
            const dob = new Date();
            dob.setFullYear(dob.getFullYear() - 12);
            expect(isOldEnoughForKyc(dob.toISOString())).toBe(false);
        });

        it("getTierRequirements returns correct reqs for tier 1", () => {
            const reqs = getTierRequirements(1);
            expect(reqs).toHaveLength(2);
            expect(reqs[0].step).toBe("email");
            expect(reqs[1].step).toBe("phone");
        });

        it("getTierRequirements returns 4 reqs for tier 2", () => {
            const reqs = getTierRequirements(2);
            expect(reqs).toHaveLength(4);
        });

        it("getTierRequirements returns 5 reqs for tier 3", () => {
            const reqs = getTierRequirements(3);
            expect(reqs).toHaveLength(5);
        });
    });

    // ── Country ──
    describe("country helpers", () => {
        it("getCountryByCode finds France", () => {
            const fr = getCountryByCode("FR");
            expect(fr?.name).toBe("France");
            expect(fr?.documentTypesAllowed).toContain("passport");
        });

        it("getCountryByCode returns undefined for unknown", () => {
            expect(getCountryByCode("ZZ")).toBeUndefined();
        });

        it("getDocumentTypesForCountry returns allowed types", () => {
            const types = getDocumentTypesForCountry("CM");
            expect(types).toEqual(["passport", "id_card"]);
        });

        it("getDocumentTypesForCountry defaults to passport for unknown", () => {
            expect(getDocumentTypesForCountry("XX")).toEqual(["passport"]);
        });

        it("sortAttemptsByDate sorts descending", () => {
            const a1 = makeAttempt({ id: "a1", startedAt: "2025-01-01T00:00:00Z" });
            const a2 = makeAttempt({ id: "a2", startedAt: "2025-06-01T00:00:00Z" });
            const sorted = sortAttemptsByDate([a1, a2]);
            expect(sorted[0].id).toBe("a2");
        });
    });

    // ── Constants ──
    describe("constants", () => {
        it("MAX_DOCUMENT_SIZE_MB is 10", () => {
            expect(MAX_DOCUMENT_SIZE_MB).toBe(10);
        });

        it("MAX_DOCUMENT_SIZE_BYTES matches MB", () => {
            expect(MAX_DOCUMENT_SIZE_BYTES).toBe(10 * 1024 * 1024);
        });

        it("SELFIE_MATCH_THRESHOLD is 0.85", () => {
            expect(SELFIE_MATCH_THRESHOLD).toBe(0.85);
        });

        it("MIN_AGE_YEARS is 13", () => {
            expect(MIN_AGE_YEARS).toBe(13);
        });

        it("ALLOWED_MIME_TYPES has 4 entries", () => {
            expect(ALLOWED_MIME_TYPES).toHaveLength(4);
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 2 — API FUNCTIONS
// ═══════════════════════════════════════════════════════════════

describe("kyc-verification-api", () => {
    // ── getKycProfile ──
    describe("getKycProfile", () => {
        it("returns profile on success", async () => {
            setupAuth();
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: {
                                user_id: testUser.id,
                                current_tier: 1,
                                email: "kyc@test.com",
                                email_verified: true,
                                phone_number: null,
                                phone_verified: false,
                                full_name: "Test User",
                                date_of_birth: "2000-01-01",
                                nationality: "FR",
                                address: null,
                                documents: [],
                                address_proofs: [],
                                selfie_checks: [],
                                last_attempt: null,
                                tier_upgraded_at: null,
                                created_at: "2025-01-01T00:00:00Z",
                            },
                            error: null,
                        }),
                    }),
                }),
            });

            const profile = await getKycProfile();
            expect(profile).not.toBeNull();
            expect(profile!.userId).toBe(testUser.id);
            expect(profile!.currentTier).toBe(1);
            expect(profile!.fullName).toBe("Test User");
        });

        it("returns null when not authenticated", async () => {
            setupNoAuth();
            const profile = await getKycProfile();
            expect(profile).toBeNull();
        });

        it("returns null on error", async () => {
            setupAuth();
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: "DB error" },
                        }),
                    }),
                }),
            });

            const profile = await getKycProfile();
            expect(profile).toBeNull();
        });
    });

    // ── startVerificationAttempt ──
    describe("startVerificationAttempt", () => {
        it("starts attempt via edge function", async () => {
            setupAuth();
            const mockAttempt = {
                id: "attempt-new",
                user_id: testUser.id,
                target_tier: 2,
                status: "pending",
                steps: [],
                onfido_applicant_id: null,
                onfido_check_id: null,
                onfido_result: null,
                started_at: "2025-06-01T00:00:00Z",
                completed_at: null,
                expires_at: "2025-06-04T00:00:00Z",
                rejection_reason: null,
            };
            mockInvoke.mockResolvedValue({ data: mockAttempt, error: null });

            const result = await startVerificationAttempt(2);
            expect(result).not.toBeNull();
            expect(result!.id).toBe("attempt-new");
            expect(result!.targetTier).toBe(2);
            expect(mockInvoke).toHaveBeenCalledWith("kyc-start-verification", {
                body: { userId: testUser.id, targetTier: 2 },
            });
        });

        it("returns null when not authenticated", async () => {
            setupNoAuth();
            const result = await startVerificationAttempt(2);
            expect(result).toBeNull();
        });
    });

    // ── uploadIdentityDocument ──
    describe("uploadIdentityDocument", () => {
        it("uploads via edge function", async () => {
            setupAuth();
            const mockDoc = {
                id: "doc-1",
                user_id: testUser.id,
                document_type: "passport",
                file_name: "passport.jpg",
                file_url: "https://storage/passport.jpg",
                file_size: 5000,
                mime_type: "image/jpeg",
                issuing_country: "FR",
                expiration_date: "2030-01-01",
                uploaded_at: "2025-06-01T00:00:00Z",
                status: "submitted",
                rejection_reason: null,
            };
            mockInvoke.mockResolvedValue({ data: mockDoc, error: null });

            const result = await uploadIdentityDocument({
                attemptId: "attempt-1",
                documentType: "passport",
                fileUri: "file:///tmp/passport.jpg",
                fileName: "passport.jpg",
                mimeType: "image/jpeg",
                issuingCountry: "FR",
                expirationDate: "2030-01-01",
            });

            expect(result).not.toBeNull();
            expect(result!.documentType).toBe("passport");
        });

        it("returns null when not authenticated", async () => {
            setupNoAuth();
            const result = await uploadIdentityDocument({
                attemptId: "x",
                documentType: "passport",
                fileUri: "file:///tmp/x.jpg",
                fileName: "x.jpg",
                mimeType: "image/jpeg",
                issuingCountry: "FR",
            });
            expect(result).toBeNull();
        });
    });

    // ── uploadAddressProof ──
    describe("uploadAddressProof", () => {
        it("uploads via edge function", async () => {
            setupAuth();
            const mockDoc = {
                id: "proof-1",
                user_id: testUser.id,
                document_type: "utility_bill",
                file_name: "bill.pdf",
                file_url: "https://storage/bill.pdf",
                file_size: 3000,
                mime_type: "application/pdf",
                issuing_country: "FR",
                expiration_date: null,
                uploaded_at: "2025-06-01T00:00:00Z",
                status: "submitted",
                rejection_reason: null,
            };
            mockInvoke.mockResolvedValue({ data: mockDoc, error: null });

            const result = await uploadAddressProof({
                attemptId: "attempt-1",
                proofType: "utility_bill",
                fileUri: "file:///tmp/bill.pdf",
                fileName: "bill.pdf",
                mimeType: "application/pdf",
                issuedDate: "2025-05-01",
            });

            expect(result).not.toBeNull();
            expect(result!.fileName).toBe("bill.pdf");
        });
    });

    // ── submitSelfieCheck ──
    describe("submitSelfieCheck", () => {
        it("submits via edge function", async () => {
            setupAuth();
            mockInvoke.mockResolvedValue({
                data: { success: true, match_score: 0.92 },
                error: null,
            });

            const result = await submitSelfieCheck({
                attemptId: "attempt-1",
                imageUri: "file:///tmp/selfie.jpg",
            });

            expect(result).not.toBeNull();
            expect(result!.success).toBe(true);
            expect(result!.matchScore).toBe(0.92);
        });

        it("returns null when not authenticated", async () => {
            setupNoAuth();
            const result = await submitSelfieCheck({
                attemptId: "x",
                imageUri: "file:///tmp/x.jpg",
            });
            expect(result).toBeNull();
        });
    });

    // ── getVerificationAttempt ──
    describe("getVerificationAttempt", () => {
        it("fetches single attempt", async () => {
            setupAuth();
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                                data: {
                                    id: "attempt-1",
                                    user_id: testUser.id,
                                    target_tier: 2,
                                    status: "processing",
                                    steps: [],
                                    onfido_applicant_id: null,
                                    onfido_check_id: null,
                                    onfido_result: null,
                                    started_at: "2025-06-01T00:00:00Z",
                                    completed_at: null,
                                    expires_at: "2025-06-04T00:00:00Z",
                                    rejection_reason: null,
                                },
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const result = await getVerificationAttempt("attempt-1");
            expect(result).not.toBeNull();
            expect(result!.status).toBe("processing");
        });
    });

    // ── getVerificationHistory ──
    describe("getVerificationHistory", () => {
        it("returns history list", async () => {
            setupAuth();
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue({
                            data: [
                                {
                                    id: "a1",
                                    user_id: testUser.id,
                                    target_tier: 1,
                                    status: "approved",
                                    steps: [],
                                    onfido_applicant_id: null,
                                    onfido_check_id: null,
                                    onfido_result: null,
                                    started_at: "2025-01-01T00:00:00Z",
                                    completed_at: "2025-01-02T00:00:00Z",
                                    expires_at: "2025-01-04T00:00:00Z",
                                    rejection_reason: null,
                                },
                            ],
                            error: null,
                        }),
                    }),
                }),
            });

            const history = await getVerificationHistory();
            expect(history).toHaveLength(1);
            expect(history[0].status).toBe("approved");
        });

        it("returns empty when not authenticated", async () => {
            setupNoAuth();
            const history = await getVerificationHistory();
            expect(history).toEqual([]);
        });
    });

    // ── cancelVerificationAttempt ──
    describe("cancelVerificationAttempt", () => {
        it("cancels pending attempt", async () => {
            setupAuth();
            mockFrom.mockReturnValueOnce({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ error: null }),
                        }),
                    }),
                }),
            });

            const success = await cancelVerificationAttempt("attempt-1");
            expect(success).toBe(true);
        });

        it("returns false when not authenticated", async () => {
            setupNoAuth();
            const success = await cancelVerificationAttempt("attempt-1");
            expect(success).toBe(false);
        });
    });

    // ── refreshAttemptStatus ──
    describe("refreshAttemptStatus", () => {
        it("refreshes via edge function", async () => {
            setupAuth();
            mockInvoke.mockResolvedValue({
                data: {
                    id: "attempt-1",
                    user_id: testUser.id,
                    target_tier: 2,
                    status: "approved",
                    steps: [],
                    onfido_applicant_id: null,
                    onfido_check_id: null,
                    onfido_result: "clear",
                    started_at: "2025-06-01T00:00:00Z",
                    completed_at: "2025-06-02T00:00:00Z",
                    expires_at: "2025-06-04T00:00:00Z",
                    rejection_reason: null,
                },
                error: null,
            });

            const result = await refreshAttemptStatus("attempt-1");
            expect(result).not.toBeNull();
            expect(result!.status).toBe("approved");
        });
    });

    // ── getDocumentsByAttempt ──
    describe("getDocumentsByAttempt", () => {
        it("returns documents list", async () => {
            setupAuth();
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            order: jest.fn().mockResolvedValue({
                                data: [
                                    {
                                        id: "doc-1",
                                        user_id: testUser.id,
                                        document_type: "passport",
                                        file_name: "pass.jpg",
                                        file_url: "https://url",
                                        file_size: 5000,
                                        mime_type: "image/jpeg",
                                        issuing_country: "FR",
                                        expiration_date: null,
                                        uploaded_at: "2025-06-01T00:00:00Z",
                                        status: "submitted",
                                        rejection_reason: null,
                                    },
                                ],
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const docs = await getDocumentsByAttempt("attempt-1");
            expect(docs).toHaveLength(1);
            expect(docs[0].documentType).toBe("passport");
        });

        it("returns empty when not authenticated", async () => {
            setupNoAuth();
            const docs = await getDocumentsByAttempt("attempt-1");
            expect(docs).toEqual([]);
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 3 — STORE ACTIONS
// ═══════════════════════════════════════════════════════════════

describe("kyc-verification-store", () => {
    // ── loadProfile ──
    describe("loadProfile", () => {
        it("loads profile and derives state", async () => {
            setupAuth();
            const steps = [
                { step: "identity", status: "approved", documentId: null, submittedAt: null, reviewedAt: null, note: null },
                { step: "selfie", status: "pending", documentId: null, submittedAt: null, reviewedAt: null, note: null },
            ];
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: {
                                user_id: testUser.id,
                                current_tier: 1,
                                email: "test@test.com",
                                email_verified: true,
                                phone_number: null,
                                phone_verified: false,
                                full_name: "KYC User",
                                date_of_birth: "2000-01-01",
                                nationality: "FR",
                                address: null,
                                documents: [],
                                address_proofs: [],
                                selfie_checks: [],
                                last_attempt: {
                                    id: "att-1",
                                    user_id: testUser.id,
                                    target_tier: 2,
                                    status: "pending",
                                    steps,
                                    onfido_applicant_id: null,
                                    onfido_check_id: null,
                                    onfido_result: null,
                                    started_at: "2025-06-01T00:00:00Z",
                                    completed_at: null,
                                    expires_at: "2025-06-04T00:00:00Z",
                                    rejection_reason: null,
                                },
                                tier_upgraded_at: null,
                                created_at: "2025-01-01T00:00:00Z",
                            },
                            error: null,
                        }),
                    }),
                }),
            });

            await act(async () => {
                await useKycVerificationStore.getState().loadProfile();
            });

            const state = useKycVerificationStore.getState();
            expect(state.profile).not.toBeNull();
            expect(state.profile!.currentTier).toBe(1);
            expect(state.currentAttempt).not.toBeNull();
            expect(state.progress).toBe(50);
            expect(state.currentStep).toBe("selfie");
            expect(state.isLoading).toBe(false);
        });

        it("sets profile null when API returns null", async () => {
            setupAuth();
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: "DB error" },
                        }),
                    }),
                }),
            });

            await act(async () => {
                await useKycVerificationStore.getState().loadProfile();
            });

            const state = useKycVerificationStore.getState();
            expect(state.profile).toBeNull();
            expect(state.isLoading).toBe(false);
        });
    });

    // ── startVerification ──
    describe("startVerification", () => {
        it("starts and updates state", async () => {
            setupAuth();
            mockInvoke.mockResolvedValue({
                data: {
                    id: "new-attempt",
                    user_id: testUser.id,
                    target_tier: 2,
                    status: "pending",
                    steps: [
                        { step: "identity", status: "pending", documentId: null, submittedAt: null, reviewedAt: null, note: null },
                    ],
                    onfido_applicant_id: null,
                    onfido_check_id: null,
                    onfido_result: null,
                    started_at: "2025-06-01T00:00:00Z",
                    completed_at: null,
                    expires_at: "2025-06-04T00:00:00Z",
                    rejection_reason: null,
                },
                error: null,
            });

            let result: VerificationAttempt | null = null;
            await act(async () => {
                result = await useKycVerificationStore
                    .getState()
                    .startVerification(2);
            });

            expect(result).not.toBeNull();
            expect(result!.id).toBe("new-attempt");

            const state = useKycVerificationStore.getState();
            expect(state.currentAttempt?.id).toBe("new-attempt");
            expect(state.currentStep).toBe("identity");
            expect(state.isLoading).toBe(false);
        });
    });

    // ── cancelAttempt ──
    describe("cancelAttempt", () => {
        it("cancels and resets state", async () => {
            setupAuth();
            useKycVerificationStore.setState({
                currentAttempt: makeAttempt(),
                currentStep: "identity",
                progress: 25,
            });

            mockFrom.mockReturnValueOnce({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ error: null }),
                        }),
                    }),
                }),
            });

            let success = false;
            await act(async () => {
                success = await useKycVerificationStore
                    .getState()
                    .cancelAttempt("attempt-1");
            });

            expect(success).toBe(true);
            const state = useKycVerificationStore.getState();
            expect(state.currentAttempt).toBeNull();
            expect(state.currentStep).toBeNull();
            expect(state.progress).toBe(0);
        });
    });

    // ── uploadDocument ──
    describe("uploadDocument", () => {
        it("adds document to state", async () => {
            setupAuth();
            mockInvoke.mockResolvedValue({
                data: {
                    id: "doc-new",
                    user_id: testUser.id,
                    document_type: "id_card",
                    file_name: "id.jpg",
                    file_url: "https://url/id.jpg",
                    file_size: 4000,
                    mime_type: "image/jpeg",
                    issuing_country: "FR",
                    expiration_date: null,
                    uploaded_at: "2025-06-01T00:00:00Z",
                    status: "submitted",
                    rejection_reason: null,
                },
                error: null,
            });

            await act(async () => {
                await useKycVerificationStore.getState().uploadDocument({
                    attemptId: "attempt-1",
                    documentType: "id_card",
                    fileUri: "file:///tmp/id.jpg",
                    fileName: "id.jpg",
                    mimeType: "image/jpeg",
                    issuingCountry: "FR",
                });
            });

            const state = useKycVerificationStore.getState();
            expect(state.documents).toHaveLength(1);
            expect(state.documents[0].documentType).toBe("id_card");
        });
    });

    // ── submitSelfie ──
    describe("submitSelfie", () => {
        it("returns selfie result", async () => {
            setupAuth();
            mockInvoke.mockResolvedValue({
                data: { success: true, match_score: 0.95 },
                error: null,
            });

            let result: { success: boolean; matchScore: number } | null = null;
            await act(async () => {
                result = await useKycVerificationStore
                    .getState()
                    .submitSelfie({ attemptId: "attempt-1", imageUri: "file:///tmp/selfie.jpg" });
            });

            expect(result).not.toBeNull();
            expect(result!.success).toBe(true);
            expect(result!.matchScore).toBe(0.95);
        });
    });

    // ── refreshStatus ──
    describe("refreshStatus", () => {
        it("updates attempt via edge function", async () => {
            setupAuth();
            mockInvoke.mockResolvedValue({
                data: {
                    id: "attempt-1",
                    user_id: testUser.id,
                    target_tier: 2,
                    status: "approved",
                    steps: [
                        { step: "identity", status: "approved", documentId: null, submittedAt: null, reviewedAt: null, note: null },
                        { step: "selfie", status: "approved", documentId: null, submittedAt: null, reviewedAt: null, note: null },
                    ],
                    onfido_applicant_id: null,
                    onfido_check_id: null,
                    onfido_result: "clear",
                    started_at: "2025-06-01T00:00:00Z",
                    completed_at: "2025-06-02T00:00:00Z",
                    expires_at: "2025-06-04T00:00:00Z",
                    rejection_reason: null,
                },
                error: null,
            });

            await act(async () => {
                await useKycVerificationStore.getState().refreshStatus("attempt-1");
            });

            const state = useKycVerificationStore.getState();
            expect(state.currentAttempt?.status).toBe("approved");
            expect(state.progress).toBe(100);
            expect(state.currentStep).toBeNull();
        });
    });

    // ── clearError ──
    describe("clearError", () => {
        it("clears error state", () => {
            useKycVerificationStore.setState({ error: "some error" });
            useKycVerificationStore.getState().clearError();
            expect(useKycVerificationStore.getState().error).toBeNull();
        });
    });
});
