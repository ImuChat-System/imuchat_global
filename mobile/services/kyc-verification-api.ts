/**
 * KYC Verification API — Sprint M-F2
 *
 * Service API pour la vérification KYC mobile.
 * Adapté du desktop kyc-verification-service.ts (S45) pour React Native (Expo).
 * Utilise expo-image-picker & expo-file-system pour l'upload de documents,
 * et expo-camera pour la capture selfie.
 */

import type {
    KycProfile,
    KycTier,
    VerificationAttempt,
    VerificationDocument,
} from "@/types/kyc-verification";
import { createLogger } from "./logger";
import { supabase } from "./supabase";

const log = createLogger("kyc-verification-api");

// ── Auth Helper ──────────────────────────────────────────────

async function requireUser(): Promise<string | null> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
}

// ── Mappers ──────────────────────────────────────────────────

function mapKycProfile(row: Record<string, unknown>): KycProfile {
    return {
        userId: row.user_id as string,
        currentTier: (row.current_tier as KycTier) ?? 0,
        email: (row.email as string) ?? null,
        emailVerified: (row.email_verified as boolean) ?? false,
        phoneNumber: (row.phone_number as string) ?? null,
        phoneVerified: (row.phone_verified as boolean) ?? false,
        fullName: (row.full_name as string) ?? null,
        dateOfBirth: (row.date_of_birth as string) ?? null,
        nationality: (row.nationality as string) ?? null,
        address: row.address
            ? (row.address as KycProfile["address"])
            : null,
        documents: ((row.documents as unknown[]) ?? []).map(mapDocument),
        addressProofs: (row.address_proofs as KycProfile["addressProofs"]) ?? [],
        selfieChecks: (row.selfie_checks as KycProfile["selfieChecks"]) ?? [],
        lastAttempt: row.last_attempt
            ? mapVerificationAttempt(row.last_attempt as Record<string, unknown>)
            : null,
        tierUpgradedAt: (row.tier_upgraded_at as string) ?? null,
        createdAt: row.created_at as string,
    };
}

function mapVerificationAttempt(
    row: Record<string, unknown>,
): VerificationAttempt {
    return {
        id: row.id as string,
        userId: row.user_id as string,
        targetTier: (row.target_tier as KycTier) ?? 1,
        status: row.status as VerificationAttempt["status"],
        steps: (row.steps as VerificationAttempt["steps"]) ?? [],
        onfidoApplicantId: (row.onfido_applicant_id as string) ?? null,
        onfidoCheckId: (row.onfido_check_id as string) ?? null,
        onfidoResult: (row.onfido_result as VerificationAttempt["onfidoResult"]) ?? null,
        startedAt: row.started_at as string,
        completedAt: (row.completed_at as string) ?? null,
        expiresAt: row.expires_at as string,
        rejectionReason: (row.rejection_reason as string) ?? null,
    };
}

function mapDocument(row: unknown): VerificationDocument {
    const r = row as Record<string, unknown>;
    return {
        id: r.id as string,
        userId: r.user_id as string,
        documentType: r.document_type as VerificationDocument["documentType"],
        fileName: r.file_name as string,
        fileUrl: r.file_url as string,
        fileSize: (r.file_size as number) ?? 0,
        mimeType: (r.mime_type as string) ?? "image/jpeg",
        issuingCountry: (r.issuing_country as string) ?? "",
        expirationDate: (r.expiration_date as string) ?? null,
        uploadedAt: r.uploaded_at as string,
        status: r.status as VerificationDocument["status"],
        rejectionReason: (r.rejection_reason as string) ?? null,
    };
}

// ── Get KYC Profile ──────────────────────────────────────────

export async function getKycProfile(): Promise<KycProfile | null> {
    const userId = await requireUser();
    if (!userId) return null;

    try {
        const { data, error } = await supabase
            .from("user_kyc_profiles")
            .select(
                "*, documents:kyc_documents(*), address_proofs:kyc_address_proofs(*), selfie_checks:kyc_selfie_checks(*), last_attempt:kyc_verification_attempts(*)",
            )
            .eq("user_id", userId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;
        return mapKycProfile(data as Record<string, unknown>);
    } catch (err) {
        log.error("getKycProfile failed", err);
        return null;
    }
}

// ── Start Verification Attempt ───────────────────────────────

export async function startVerificationAttempt(
    targetTier: KycTier,
): Promise<VerificationAttempt | null> {
    const userId = await requireUser();
    if (!userId) return null;

    try {
        const { data, error } = await supabase.functions.invoke(
            "kyc-start-verification",
            { body: { userId, targetTier } },
        );
        if (error) throw error;
        return mapVerificationAttempt(data as Record<string, unknown>);
    } catch (err) {
        log.error("startVerificationAttempt failed", err);
        return null;
    }
}

// ── Upload Identity Document ─────────────────────────────────

export async function uploadIdentityDocument(params: {
    attemptId: string;
    documentType: string;
    fileUri: string;
    fileName: string;
    mimeType: string;
    issuingCountry: string;
    expirationDate?: string;
}): Promise<VerificationDocument | null> {
    const userId = await requireUser();
    if (!userId) return null;

    try {
        const { data, error } = await supabase.functions.invoke(
            "kyc-upload-document",
            {
                body: {
                    userId,
                    attemptId: params.attemptId,
                    documentType: params.documentType,
                    fileUri: params.fileUri,
                    fileName: params.fileName,
                    mimeType: params.mimeType,
                    issuingCountry: params.issuingCountry,
                    expirationDate: params.expirationDate ?? null,
                },
            },
        );
        if (error) throw error;
        return mapDocument(data);
    } catch (err) {
        log.error("uploadIdentityDocument failed", err);
        return null;
    }
}

// ── Upload Address Proof ─────────────────────────────────────

export async function uploadAddressProof(params: {
    attemptId: string;
    proofType: string;
    fileUri: string;
    fileName: string;
    mimeType: string;
    issuedDate: string;
}): Promise<VerificationDocument | null> {
    const userId = await requireUser();
    if (!userId) return null;

    try {
        const { data, error } = await supabase.functions.invoke(
            "kyc-upload-address-proof",
            {
                body: {
                    userId,
                    attemptId: params.attemptId,
                    proofType: params.proofType,
                    fileUri: params.fileUri,
                    fileName: params.fileName,
                    mimeType: params.mimeType,
                    issuedDate: params.issuedDate,
                },
            },
        );
        if (error) throw error;
        return mapDocument(data);
    } catch (err) {
        log.error("uploadAddressProof failed", err);
        return null;
    }
}

// ── Submit Selfie Check ──────────────────────────────────────

export async function submitSelfieCheck(params: {
    attemptId: string;
    imageUri: string;
}): Promise<{ success: boolean; matchScore: number } | null> {
    const userId = await requireUser();
    if (!userId) return null;

    try {
        const { data, error } = await supabase.functions.invoke(
            "kyc-submit-selfie",
            {
                body: {
                    userId,
                    attemptId: params.attemptId,
                    imageUri: params.imageUri,
                },
            },
        );
        if (error) throw error;
        const result = data as Record<string, unknown>;
        return {
            success: (result.success as boolean) ?? false,
            matchScore: (result.match_score as number) ?? 0,
        };
    } catch (err) {
        log.error("submitSelfieCheck failed", err);
        return null;
    }
}

// ── Get Verification Attempt ─────────────────────────────────

export async function getVerificationAttempt(
    attemptId: string,
): Promise<VerificationAttempt | null> {
    const userId = await requireUser();
    if (!userId) return null;

    try {
        const { data, error } = await supabase
            .from("kyc_verification_attempts")
            .select("*")
            .eq("id", attemptId)
            .eq("user_id", userId)
            .single();

        if (error) throw error;
        return mapVerificationAttempt(data as Record<string, unknown>);
    } catch (err) {
        log.error("getVerificationAttempt failed", err);
        return null;
    }
}

// ── Get Verification History ─────────────────────────────────

export async function getVerificationHistory(): Promise<
    VerificationAttempt[]
> {
    const userId = await requireUser();
    if (!userId) return [];

    try {
        const { data, error } = await supabase
            .from("kyc_verification_attempts")
            .select("*")
            .eq("user_id", userId)
            .order("started_at", { ascending: false });

        if (error) throw error;
        return (data ?? []).map((row) =>
            mapVerificationAttempt(row as Record<string, unknown>),
        );
    } catch (err) {
        log.error("getVerificationHistory failed", err);
        return [];
    }
}

// ── Cancel Verification Attempt ──────────────────────────────

export async function cancelVerificationAttempt(
    attemptId: string,
): Promise<boolean> {
    const userId = await requireUser();
    if (!userId) return false;

    try {
        const { error } = await supabase
            .from("kyc_verification_attempts")
            .update({ status: "cancelled", completed_at: new Date().toISOString() })
            .eq("id", attemptId)
            .eq("user_id", userId)
            .eq("status", "pending");

        if (error) throw error;
        return true;
    } catch (err) {
        log.error("cancelVerificationAttempt failed", err);
        return false;
    }
}

// ── Refresh Attempt Status ───────────────────────────────────

export async function refreshAttemptStatus(
    attemptId: string,
): Promise<VerificationAttempt | null> {
    const userId = await requireUser();
    if (!userId) return null;

    try {
        const { data, error } = await supabase.functions.invoke(
            "kyc-refresh-status",
            { body: { userId, attemptId } },
        );
        if (error) throw error;
        return mapVerificationAttempt(data as Record<string, unknown>);
    } catch (err) {
        log.error("refreshAttemptStatus failed", err);
        return null;
    }
}

// ── Get Documents By Attempt ─────────────────────────────────

export async function getDocumentsByAttempt(
    attemptId: string,
): Promise<VerificationDocument[]> {
    const userId = await requireUser();
    if (!userId) return [];

    try {
        const { data, error } = await supabase
            .from("kyc_documents")
            .select("*")
            .eq("attempt_id", attemptId)
            .eq("user_id", userId)
            .order("uploaded_at", { ascending: false });

        if (error) throw error;
        return (data ?? []).map(mapDocument);
    } catch (err) {
        log.error("getDocumentsByAttempt failed", err);
        return [];
    }
}
