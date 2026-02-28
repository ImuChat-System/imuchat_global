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
    | "topup";
