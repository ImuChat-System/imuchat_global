/**
 * Wallet Types — Phase M4
 *
 * ImuWallet avec ImuCoin (monnaie virtuelle) + Stripe (cashout futur)
 */

// ─── Currencies ───────────────────────────────────────────────────
export type CurrencyCode = "IMC" | "EUR" | "USD" | "JPY";

export interface CurrencyInfo {
    code: CurrencyCode;
    name: string;
    symbol: string;
    decimals: number;
}

// ─── Balance ──────────────────────────────────────────────────────
export interface WalletBalance {
    userId: string;
    imucoins: number;
    fiatBalance: number;
    fiatCurrency: CurrencyCode;
    lastSyncAt: string;
}

// ─── Transaction ──────────────────────────────────────────────────
export type TransactionType =
    | "earn"       // gagné (missions, récompenses, daily login)
    | "spend"      // dépensé (achats store, modules premium)
    | "send"       // envoyé à un ami
    | "receive"    // reçu d'un ami
    | "topup"      // rechargement via Stripe
    | "cashout"    // retrait vers fiat
    | "refund";    // remboursement

export type TransactionStatus = "pending" | "completed" | "failed" | "cancelled";

export interface Transaction {
    id: string;
    userId: string;
    type: TransactionType;
    amount: number;
    currency: CurrencyCode;
    status: TransactionStatus;
    description: string;
    /** ID du destinataire/expéditeur pour send/receive */
    counterpartyId?: string;
    counterpartyName?: string;
    /** Référence de module/item pour spend/earn */
    referenceId?: string;
    referenceType?: "module" | "item" | "reward" | "mission";
    createdAt: string;
    completedAt?: string;
}

// ─── Rewards / Missions ───────────────────────────────────────────
export type MissionStatus = "available" | "in_progress" | "claimed" | "expired";

export interface Mission {
    id: string;
    title: string;
    description: string;
    reward: number;
    currency: CurrencyCode;
    icon: string;
    progress: number;       // 0-100
    target: number;         // objectif (ex: 5 messages)
    status: MissionStatus;
    expiresAt?: string;
}

// ─── Store ────────────────────────────────────────────────────────
export interface WalletState {
    balance: WalletBalance | null;
    transactions: Transaction[];
    missions: Mission[];
    isLoading: boolean;
    error: string | null;
}

// ─── Wallet Screen Sections ───────────────────────────────────────
export type WalletSection =
    | "overview"
    | "transactions"
    | "send"
    | "missions"
    | "topup"
    | "subscription"
    | "payment-methods";

// ─── Payment Methods ──────────────────────────────────────────────
export type PaymentMethodType = "card" | "apple_pay" | "google_pay" | "bank_transfer";

export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "jcb" | "unionpay" | "unknown";

export interface PaymentMethod {
    id: string;
    type: PaymentMethodType;
    /** Last 4 digits for card, email for bank */
    last4?: string;
    brand?: CardBrand;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
    label: string;
    createdAt: string;
}

// ─── Top-up Packages ──────────────────────────────────────────────
export interface TopupPackage {
    id: string;
    imucoins: number;
    priceEur: number;
    priceUsd: number;
    priceJpy: number;
    bonusPercent: number;
    label: string;
    popular?: boolean;
}

// ─── Stripe Checkout ──────────────────────────────────────────────
export type CheckoutStatus = "pending" | "completed" | "failed" | "expired";

export interface CheckoutSession {
    id: string;
    url: string;
    status: CheckoutStatus;
    packageId: string;
    amount: number;
    currency: CurrencyCode;
    createdAt: string;
    expiresAt: string;
}

// ─── Subscriptions ────────────────────────────────────────────────
export type SubscriptionTier = "free" | "pro" | "premium";

export type SubscriptionStatus =
    | "active"
    | "trialing"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete";

export type BillingInterval = "month" | "year";

export interface SubscriptionPlan {
    id: string;
    tier: SubscriptionTier;
    name: string;
    description: string;
    features: string[];
    priceMonthlyEur: number;
    priceYearlyEur: number;
    priceMonthlyUsd: number;
    priceYearlyUsd: number;
    priceMonthlyJpy: number;
    priceYearlyJpy: number;
    trialDays: number;
    popular?: boolean;
}

export interface UserSubscription {
    id: string;
    planId: string;
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    interval: BillingInterval;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEnd?: string;
    createdAt: string;
}

// ─── In-App Purchases ─────────────────────────────────────────────
export type IAPItemType = "consumable" | "non_consumable" | "subscription";

export type IAPCategory = "theme" | "avatar" | "module_premium" | "sticker_pack" | "feature_unlock";

export interface InAppItem {
    id: string;
    productId: string;
    type: IAPItemType;
    category: IAPCategory;
    name: string;
    description: string;
    priceEur: number;
    priceUsd: number;
    priceJpy: number;
    icon: string;
    previewImageUrl?: string;
}

export interface PurchaseReceipt {
    id: string;
    itemId: string;
    productId: string;
    transactionId: string;
    platform: "ios" | "android" | "web";
    purchasedAt: string;
    expiresAt?: string;
    isActive: boolean;
}

// ─── Extended Wallet State ────────────────────────────────────────
export interface PaymentState {
    paymentMethods: PaymentMethod[];
    topupPackages: TopupPackage[];
    currentCheckout: CheckoutSession | null;
    subscription: UserSubscription | null;
    availablePlans: SubscriptionPlan[];
    purchasedItems: PurchaseReceipt[];
    iapCatalog: InAppItem[];
    paymentLoading: boolean;
    paymentError: string | null;
}
