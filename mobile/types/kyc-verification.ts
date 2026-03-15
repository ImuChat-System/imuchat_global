/**
 * KYC Verification Types — Sprint M-F2
 *
 * Types pour la vérification d'identité multi-niveaux (0→3).
 * Adapté du desktop kyc-verification-service.ts (S45) pour React Native / Expo.
 */

// ── Types ────────────────────────────────────────────────────

export type KycDocumentType =
    | "passport"
    | "id_card"
    | "driver_license"
    | "residence_permit";

export type AddressProofType =
    | "utility_bill"
    | "bank_statement"
    | "tax_notice"
    | "official_letter";

export type VerificationStep = "identity" | "address" | "selfie" | "review";

export type VerificationStepStatus =
    | "pending"
    | "in_progress"
    | "submitted"
    | "approved"
    | "rejected";

export type VerificationAttemptStatus =
    | "pending"
    | "processing"
    | "approved"
    | "rejected"
    | "expired"
    | "cancelled";

export type OnfidoCheckResult =
    | "clear"
    | "consider"
    | "unidentified"
    | "caution"
    | "rejected";

export type KycTier = 0 | 1 | 2 | 3;

export type SelfieLivenessResult = "passed" | "failed" | "inconclusive";

// ── Interfaces ───────────────────────────────────────────────

export interface VerificationDocument {
    id: string;
    userId: string;
    documentType: KycDocumentType;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    issuingCountry: string;
    expirationDate: string | null;
    uploadedAt: string;
    status: VerificationStepStatus;
    rejectionReason: string | null;
}

export interface AddressProofDocument {
    id: string;
    userId: string;
    proofType: AddressProofType;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    issuedDate: string;
    uploadedAt: string;
    status: VerificationStepStatus;
    rejectionReason: string | null;
}

export interface SelfieCheck {
    id: string;
    userId: string;
    imageUrl: string;
    livenessResult: SelfieLivenessResult;
    matchScore: number;
    submittedAt: string;
    status: VerificationStepStatus;
    rejectionReason: string | null;
}

export interface VerificationStepDetail {
    step: VerificationStep;
    status: VerificationStepStatus;
    documentId: string | null;
    submittedAt: string | null;
    reviewedAt: string | null;
    note: string | null;
}

export interface VerificationAttempt {
    id: string;
    userId: string;
    targetTier: KycTier;
    status: VerificationAttemptStatus;
    steps: VerificationStepDetail[];
    onfidoApplicantId: string | null;
    onfidoCheckId: string | null;
    onfidoResult: OnfidoCheckResult | null;
    startedAt: string;
    completedAt: string | null;
    expiresAt: string;
    rejectionReason: string | null;
}

export interface KycAddress {
    line1: string;
    line2: string | null;
    city: string;
    postalCode: string;
    state: string | null;
    country: string;
}

export interface KycProfile {
    userId: string;
    currentTier: KycTier;
    email: string | null;
    emailVerified: boolean;
    phoneNumber: string | null;
    phoneVerified: boolean;
    fullName: string | null;
    dateOfBirth: string | null;
    nationality: string | null;
    address: KycAddress | null;
    documents: VerificationDocument[];
    addressProofs: AddressProofDocument[];
    selfieChecks: SelfieCheck[];
    lastAttempt: VerificationAttempt | null;
    tierUpgradedAt: string | null;
    createdAt: string;
}

export interface KycTierConfig {
    tier: KycTier;
    label: string;
    icon: string;
    color: string;
    description: string;
    dailyLimitIc: number;
    monthlyLimitIc: number;
    singleTransactionLimitIc: number;
    canCashout: boolean;
    canP2PFiat: boolean;
    canUseCards: boolean;
    requirements: string[];
}

export interface KycRequirement {
    id: string;
    label: string;
    description: string;
    completed: boolean;
    step: VerificationStep | "email" | "phone";
}

export interface KycCountry {
    code: string;
    name: string;
    documentTypesAllowed: KycDocumentType[];
    requiresAddressProof: boolean;
}

// ── Config Maps ──────────────────────────────────────────────

export const KYC_DOCUMENT_TYPE_CONFIG: Record<
    KycDocumentType,
    { label: string; icon: string; description: string }
> = {
    passport: {
        label: "Passeport",
        icon: "🛂",
        description: "Passeport valide avec photo et MRZ lisible",
    },
    id_card: {
        label: "Carte d'identité",
        icon: "🪪",
        description: "CNI recto-verso en cours de validité",
    },
    driver_license: {
        label: "Permis de conduire",
        icon: "🚗",
        description: "Permis avec photo recto-verso",
    },
    residence_permit: {
        label: "Titre de séjour",
        icon: "📄",
        description: "Titre de séjour en cours de validité",
    },
};

export const ADDRESS_PROOF_TYPE_CONFIG: Record<
    AddressProofType,
    { label: string; icon: string; description: string }
> = {
    utility_bill: {
        label: "Facture de service",
        icon: "💡",
        description: "Facture eau, électricité ou gaz de moins de 3 mois",
    },
    bank_statement: {
        label: "Relevé bancaire",
        icon: "🏦",
        description: "Relevé bancaire avec adresse de moins de 3 mois",
    },
    tax_notice: {
        label: "Avis d'imposition",
        icon: "📋",
        description: "Avis d'imposition de l'année en cours ou précédente",
    },
    official_letter: {
        label: "Courrier officiel",
        icon: "✉️",
        description: "Courrier officiel avec adresse de moins de 3 mois",
    },
};

export const VERIFICATION_STEP_CONFIG: Record<
    VerificationStep,
    { label: string; icon: string; description: string; order: number }
> = {
    identity: {
        label: "Identité",
        icon: "🪪",
        description: "Téléchargez un document d'identité valide",
        order: 1,
    },
    address: {
        label: "Adresse",
        icon: "🏠",
        description: "Fournissez un justificatif de domicile",
        order: 2,
    },
    selfie: {
        label: "Selfie",
        icon: "🤳",
        description: "Prenez un selfie pour la vérification de vivacité",
        order: 3,
    },
    review: {
        label: "Vérification",
        icon: "🔍",
        description: "Vos documents sont en cours de vérification",
        order: 4,
    },
};

export const VERIFICATION_STEP_STATUS_CONFIG: Record<
    VerificationStepStatus,
    { label: string; color: string; icon: string }
> = {
    pending: { label: "En attente", color: "#94a3b8", icon: "⏳" },
    in_progress: { label: "En cours", color: "#3b82f6", icon: "🔄" },
    submitted: { label: "Soumis", color: "#f59e0b", icon: "📤" },
    approved: { label: "Approuvé", color: "#22c55e", icon: "✅" },
    rejected: { label: "Refusé", color: "#ef4444", icon: "❌" },
};

export const VERIFICATION_ATTEMPT_STATUS_CONFIG: Record<
    VerificationAttemptStatus,
    { label: string; color: string; icon: string }
> = {
    pending: { label: "En attente", color: "#94a3b8", icon: "⏳" },
    processing: { label: "Traitement", color: "#3b82f6", icon: "🔄" },
    approved: { label: "Approuvé", color: "#22c55e", icon: "✅" },
    rejected: { label: "Refusé", color: "#ef4444", icon: "❌" },
    expired: { label: "Expiré", color: "#f97316", icon: "⌛" },
    cancelled: { label: "Annulé", color: "#94a3b8", icon: "🚫" },
};

export const KYC_TIER_DETAIL_CONFIG: Record<KycTier, KycTierConfig> = {
    0: {
        tier: 0,
        label: "Non vérifié",
        icon: "⚪",
        color: "#94a3b8",
        description: "Compte basique avec fonctionnalités limitées",
        dailyLimitIc: 5_000,
        monthlyLimitIc: 20_000,
        singleTransactionLimitIc: 2_000,
        canCashout: false,
        canP2PFiat: false,
        canUseCards: false,
        requirements: ["Email vérifié"],
    },
    1: {
        tier: 1,
        label: "Basique",
        icon: "🟢",
        color: "#22c55e",
        description: "Vérification email + téléphone — limites augmentées",
        dailyLimitIc: 50_000,
        monthlyLimitIc: 200_000,
        singleTransactionLimitIc: 20_000,
        canCashout: false,
        canP2PFiat: false,
        canUseCards: false,
        requirements: ["Email vérifié", "Téléphone vérifié"],
    },
    2: {
        tier: 2,
        label: "Vérifié",
        icon: "🔵",
        color: "#3b82f6",
        description: "Identité vérifiée — cashout et P2P fiat débloqués",
        dailyLimitIc: 500_000,
        monthlyLimitIc: 2_000_000,
        singleTransactionLimitIc: 200_000,
        canCashout: true,
        canP2PFiat: true,
        canUseCards: true,
        requirements: [
            "Email vérifié",
            "Téléphone vérifié",
            "Document d'identité",
            "Selfie vivant",
        ],
    },
    3: {
        tier: 3,
        label: "Premium",
        icon: "💎",
        color: "#8b5cf6",
        description: "Vérification complète — limites maximum, cartes physiques",
        dailyLimitIc: 2_000_000,
        monthlyLimitIc: 10_000_000,
        singleTransactionLimitIc: 1_000_000,
        canCashout: true,
        canP2PFiat: true,
        canUseCards: true,
        requirements: [
            "Email vérifié",
            "Téléphone vérifié",
            "Document d'identité",
            "Selfie vivant",
            "Justificatif de domicile",
        ],
    },
};

// ── Constants ────────────────────────────────────────────────

export const MAX_DOCUMENT_SIZE_MB = 10;
export const MAX_DOCUMENT_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;
export const MAX_VERIFICATION_ATTEMPTS = 5;
export const VERIFICATION_ATTEMPT_EXPIRY_HOURS = 72;
export const KYC_COOLDOWN_HOURS = 24;
export const SELFIE_MATCH_THRESHOLD = 0.85;
export const MAX_ADDRESS_PROOF_AGE_DAYS = 90;
export const MIN_AGE_YEARS = 13;
export const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
] as const;

export const SUPPORTED_COUNTRIES: KycCountry[] = [
    {
        code: "FR",
        name: "France",
        documentTypesAllowed: ["passport", "id_card", "driver_license", "residence_permit"],
        requiresAddressProof: true,
    },
    {
        code: "BE",
        name: "Belgique",
        documentTypesAllowed: ["passport", "id_card", "driver_license"],
        requiresAddressProof: true,
    },
    {
        code: "CH",
        name: "Suisse",
        documentTypesAllowed: ["passport", "id_card", "driver_license", "residence_permit"],
        requiresAddressProof: true,
    },
    {
        code: "DE",
        name: "Allemagne",
        documentTypesAllowed: ["passport", "id_card", "driver_license"],
        requiresAddressProof: true,
    },
    {
        code: "US",
        name: "États-Unis",
        documentTypesAllowed: ["passport", "driver_license"],
        requiresAddressProof: true,
    },
    {
        code: "GB",
        name: "Royaume-Uni",
        documentTypesAllowed: ["passport", "driver_license"],
        requiresAddressProof: true,
    },
    {
        code: "JP",
        name: "Japon",
        documentTypesAllowed: ["passport", "residence_permit"],
        requiresAddressProof: true,
    },
    {
        code: "CM",
        name: "Cameroun",
        documentTypesAllowed: ["passport", "id_card"],
        requiresAddressProof: false,
    },
    {
        code: "SN",
        name: "Sénégal",
        documentTypesAllowed: ["passport", "id_card"],
        requiresAddressProof: false,
    },
    {
        code: "CI",
        name: "Côte d'Ivoire",
        documentTypesAllowed: ["passport", "id_card"],
        requiresAddressProof: false,
    },
];

// ── Helpers ──────────────────────────────────────────────────

export function getDocumentTypeLabel(type: KycDocumentType): string {
    return KYC_DOCUMENT_TYPE_CONFIG[type].label;
}

export function getDocumentTypeIcon(type: KycDocumentType): string {
    return KYC_DOCUMENT_TYPE_CONFIG[type].icon;
}

export function getAddressProofLabel(type: AddressProofType): string {
    return ADDRESS_PROOF_TYPE_CONFIG[type].label;
}

export function getVerificationStepLabel(step: VerificationStep): string {
    return VERIFICATION_STEP_CONFIG[step].label;
}

export function getVerificationStepOrder(step: VerificationStep): number {
    return VERIFICATION_STEP_CONFIG[step].order;
}

export function getStepStatusLabel(status: VerificationStepStatus): string {
    return VERIFICATION_STEP_STATUS_CONFIG[status].label;
}

export function getAttemptStatusLabel(
    status: VerificationAttemptStatus,
): string {
    return VERIFICATION_ATTEMPT_STATUS_CONFIG[status].label;
}

export function getTierConfig(tier: KycTier): KycTierConfig {
    return KYC_TIER_DETAIL_CONFIG[tier];
}

export function getTierLabel(tier: KycTier): string {
    return KYC_TIER_DETAIL_CONFIG[tier].label;
}

export function isDocumentExpired(expirationDate: string | null): boolean {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
}

export function isAddressProofTooOld(issuedDate: string): boolean {
    const issued = new Date(issuedDate);
    const now = new Date();
    const diffDays = Math.floor(
        (now.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays > MAX_ADDRESS_PROOF_AGE_DAYS;
}

export function isFileSizeValid(sizeBytes: number): boolean {
    return sizeBytes > 0 && sizeBytes <= MAX_DOCUMENT_SIZE_BYTES;
}

export function isFileTypeAllowed(mimeType: string): boolean {
    return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function canRetryVerification(
    lastAttempt: VerificationAttempt | null,
    totalAttempts: number,
): boolean {
    if (totalAttempts >= MAX_VERIFICATION_ATTEMPTS) return false;
    if (!lastAttempt) return true;
    if (
        lastAttempt.status === "pending" ||
        lastAttempt.status === "processing"
    )
        return false;
    if (
        lastAttempt.status === "rejected" ||
        lastAttempt.status === "expired" ||
        lastAttempt.status === "cancelled"
    ) {
        const completedAt = lastAttempt.completedAt
            ? new Date(lastAttempt.completedAt)
            : new Date(lastAttempt.startedAt);
        const cooldownEnd = new Date(
            completedAt.getTime() + KYC_COOLDOWN_HOURS * 60 * 60 * 1000,
        );
        return new Date() >= cooldownEnd;
    }
    return true;
}

export function isAttemptExpired(attempt: VerificationAttempt): boolean {
    return new Date(attempt.expiresAt) < new Date();
}

export function computeVerificationProgress(
    steps: VerificationStepDetail[],
): number {
    if (steps.length === 0) return 0;
    const approved = steps.filter((s) => s.status === "approved").length;
    return Math.round((approved / steps.length) * 100);
}

export function getNextPendingStep(
    steps: VerificationStepDetail[],
): VerificationStep | null {
    const sorted = [...steps].sort(
        (a, b) =>
            getVerificationStepOrder(a.step) - getVerificationStepOrder(b.step),
    );
    const next = sorted.find(
        (s) => s.status === "pending" || s.status === "rejected",
    );
    return next ? next.step : null;
}

export function areAllStepsApproved(steps: VerificationStepDetail[]): boolean {
    return steps.length > 0 && steps.every((s) => s.status === "approved");
}

export function isKycRequiredForAmount(
    amount: number,
    currentTier: KycTier,
): boolean {
    const config = KYC_TIER_DETAIL_CONFIG[currentTier];
    return amount > config.singleTransactionLimitIc;
}

export function getDailyLimitForTier(tier: KycTier): number {
    return KYC_TIER_DETAIL_CONFIG[tier].dailyLimitIc;
}

export function getMonthlyLimitForTier(tier: KycTier): number {
    return KYC_TIER_DETAIL_CONFIG[tier].monthlyLimitIc;
}

export function canCashoutAtTier(tier: KycTier): boolean {
    return KYC_TIER_DETAIL_CONFIG[tier].canCashout;
}

export function calculateAge(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate()))
        age--;
    return age;
}

export function isOldEnoughForKyc(dateOfBirth: string): boolean {
    return calculateAge(dateOfBirth) >= MIN_AGE_YEARS;
}

export function getTierRequirements(tier: KycTier): KycRequirement[] {
    const reqs: KycRequirement[] = [];
    if (tier >= 1) {
        reqs.push({
            id: "email",
            label: "Email vérifié",
            description: "Confirmez votre adresse email",
            completed: false,
            step: "email",
        });
        reqs.push({
            id: "phone",
            label: "Téléphone vérifié",
            description: "Confirmez votre numéro de téléphone",
            completed: false,
            step: "phone",
        });
    }
    if (tier >= 2) {
        reqs.push({
            id: "identity",
            label: "Document d'identité",
            description: "Téléchargez un document officiel avec photo",
            completed: false,
            step: "identity",
        });
        reqs.push({
            id: "selfie",
            label: "Selfie vivant",
            description: "Prenez un selfie pour vérifier votre identité",
            completed: false,
            step: "selfie",
        });
    }
    if (tier >= 3) {
        reqs.push({
            id: "address",
            label: "Justificatif de domicile",
            description: "Fournissez une preuve de résidence récente",
            completed: false,
            step: "address",
        });
    }
    return reqs;
}

export function getCountryByCode(code: string): KycCountry | undefined {
    return SUPPORTED_COUNTRIES.find((c) => c.code === code);
}

export function getDocumentTypesForCountry(
    countryCode: string,
): KycDocumentType[] {
    const country = getCountryByCode(countryCode);
    return country ? country.documentTypesAllowed : ["passport"];
}

export function sortAttemptsByDate(
    attempts: VerificationAttempt[],
): VerificationAttempt[] {
    return [...attempts].sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
}
