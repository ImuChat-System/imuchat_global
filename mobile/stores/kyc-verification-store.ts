/**
 * KYC Verification Store — Sprint M-F2
 *
 * Zustand store pour le parcours KYC.
 * Gère : profil KYC, tentative en cours, documents, progression.
 */

import {
    cancelVerificationAttempt,
    getDocumentsByAttempt,
    getKycProfile,
    getVerificationHistory,
    refreshAttemptStatus,
    startVerificationAttempt,
    submitSelfieCheck,
    uploadAddressProof,
    uploadIdentityDocument,
} from "@/services/kyc-verification-api";
import type {
    KycProfile,
    KycTier,
    VerificationAttempt,
    VerificationDocument,
    VerificationStep,
} from "@/types/kyc-verification";
import {
    canRetryVerification,
    computeVerificationProgress,
    getNextPendingStep,
} from "@/types/kyc-verification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ── State ────────────────────────────────────────────────────

interface KycVerificationState {
    // Data
    profile: KycProfile | null;
    currentAttempt: VerificationAttempt | null;
    history: VerificationAttempt[];
    documents: VerificationDocument[];

    // Progression
    currentStep: VerificationStep | null;
    progress: number;
    canRetry: boolean;

    // UI
    isLoading: boolean;
    error: string | null;

    // Actions
    loadProfile: () => Promise<void>;
    loadHistory: () => Promise<void>;
    startVerification: (targetTier: KycTier) => Promise<VerificationAttempt | null>;
    uploadDocument: (params: {
        attemptId: string;
        documentType: string;
        fileUri: string;
        fileName: string;
        mimeType: string;
        issuingCountry: string;
        expirationDate?: string;
    }) => Promise<VerificationDocument | null>;
    uploadAddress: (params: {
        attemptId: string;
        proofType: string;
        fileUri: string;
        fileName: string;
        mimeType: string;
        issuedDate: string;
    }) => Promise<VerificationDocument | null>;
    submitSelfie: (params: {
        attemptId: string;
        imageUri: string;
    }) => Promise<{ success: boolean; matchScore: number } | null>;
    cancelAttempt: (attemptId: string) => Promise<boolean>;
    refreshStatus: (attemptId: string) => Promise<void>;
    loadDocuments: (attemptId: string) => Promise<void>;
    clearError: () => void;
}

// ── Store ────────────────────────────────────────────────────

export const useKycVerificationStore = create<KycVerificationState>()(
    persist(
        (set, get) => ({
            // Initial state
            profile: null,
            currentAttempt: null,
            history: [],
            documents: [],
            currentStep: null,
            progress: 0,
            canRetry: false,
            isLoading: false,
            error: null,

            // ── loadProfile ──
            loadProfile: async () => {
                set({ isLoading: true, error: null });
                try {
                    const profile = await getKycProfile();
                    const currentAttempt = profile?.lastAttempt ?? null;
                    const steps = currentAttempt?.steps ?? [];
                    set({
                        profile,
                        currentAttempt,
                        currentStep: getNextPendingStep(steps),
                        progress: computeVerificationProgress(steps),
                        canRetry: canRetryVerification(
                            currentAttempt,
                            get().history.length,
                        ),
                        isLoading: false,
                    });
                } catch {
                    set({ error: "Impossible de charger le profil KYC", isLoading: false });
                }
            },

            // ── loadHistory ──
            loadHistory: async () => {
                try {
                    const history = await getVerificationHistory();
                    set({
                        history,
                        canRetry: canRetryVerification(
                            get().currentAttempt,
                            history.length,
                        ),
                    });
                } catch {
                    set({ error: "Impossible de charger l'historique" });
                }
            },

            // ── startVerification ──
            startVerification: async (targetTier: KycTier) => {
                set({ isLoading: true, error: null });
                try {
                    const attempt = await startVerificationAttempt(targetTier);
                    if (attempt) {
                        set({
                            currentAttempt: attempt,
                            currentStep: getNextPendingStep(attempt.steps),
                            progress: computeVerificationProgress(attempt.steps),
                            isLoading: false,
                        });
                    } else {
                        set({ isLoading: false });
                    }
                    return attempt;
                } catch {
                    set({ error: "Impossible de démarrer la vérification", isLoading: false });
                    return null;
                }
            },

            // ── uploadDocument ──
            uploadDocument: async (params) => {
                set({ isLoading: true, error: null });
                try {
                    const doc = await uploadIdentityDocument(params);
                    if (doc) {
                        set((state) => ({
                            documents: [...state.documents, doc],
                            isLoading: false,
                        }));
                    } else {
                        set({ isLoading: false });
                    }
                    return doc;
                } catch {
                    set({
                        error: "Impossible d'uploader le document",
                        isLoading: false,
                    });
                    return null;
                }
            },

            // ── uploadAddress ──
            uploadAddress: async (params) => {
                set({ isLoading: true, error: null });
                try {
                    const doc = await uploadAddressProof(params);
                    if (doc) {
                        set((state) => ({
                            documents: [...state.documents, doc],
                            isLoading: false,
                        }));
                    } else {
                        set({ isLoading: false });
                    }
                    return doc;
                } catch {
                    set({
                        error: "Impossible d'uploader le justificatif",
                        isLoading: false,
                    });
                    return null;
                }
            },

            // ── submitSelfie ──
            submitSelfie: async (params) => {
                set({ isLoading: true, error: null });
                try {
                    const result = await submitSelfieCheck(params);
                    set({ isLoading: false });
                    return result;
                } catch {
                    set({ error: "Impossible de soumettre le selfie", isLoading: false });
                    return null;
                }
            },

            // ── cancelAttempt ──
            cancelAttempt: async (attemptId: string) => {
                set({ isLoading: true, error: null });
                try {
                    const success = await cancelVerificationAttempt(attemptId);
                    if (success) {
                        set({
                            currentAttempt: null,
                            currentStep: null,
                            progress: 0,
                            isLoading: false,
                        });
                    } else {
                        set({ isLoading: false });
                    }
                    return success;
                } catch {
                    set({ error: "Impossible d'annuler la vérification", isLoading: false });
                    return false;
                }
            },

            // ── refreshStatus ──
            refreshStatus: async (attemptId: string) => {
                set({ isLoading: true, error: null });
                try {
                    const attempt = await refreshAttemptStatus(attemptId);
                    if (attempt) {
                        set({
                            currentAttempt: attempt,
                            currentStep: getNextPendingStep(attempt.steps),
                            progress: computeVerificationProgress(attempt.steps),
                            isLoading: false,
                        });
                    } else {
                        set({ isLoading: false });
                    }
                } catch {
                    set({ error: "Impossible de rafraîchir le statut", isLoading: false });
                }
            },

            // ── loadDocuments ──
            loadDocuments: async (attemptId: string) => {
                try {
                    const documents = await getDocumentsByAttempt(attemptId);
                    set({ documents });
                } catch {
                    set({ error: "Impossible de charger les documents" });
                }
            },

            // ── clearError ──
            clearError: () => set({ error: null }),
        }),
        {
            name: "kyc-verification-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                profile: state.profile,
                currentAttempt: state.currentAttempt,
                progress: state.progress,
            }),
        },
    ),
);
