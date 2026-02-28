/**
 * Wallet API Service — Phase M4
 *
 * ImuCoin balance, transactions, send/receive, missions
 * Stubs Stripe pour le top-up / cashout (implémentation future)
 */

import { createLogger } from "./logger";
import { supabase } from "./supabase";

import type {
    CurrencyCode,
    Mission,
    Transaction,
    TransactionType,
    WalletBalance,
} from "@/types/wallet";

const logger = createLogger("WalletAPI");

// ============================================================================
// BALANCE
// ============================================================================

/**
 * Fetch wallet balance for current user
 */
export async function fetchBalance(): Promise<WalletBalance | null> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from("wallets")
            .select("user_id, imucoins, fiat_balance, fiat_currency, last_sync_at")
            .eq("user_id", user.id)
            .single();

        if (error) {
            // Wallet might not exist yet — create it
            if (error.code === "PGRST116") {
                const { data: newWallet, error: createErr } = await supabase
                    .from("wallets")
                    .insert({
                        user_id: user.id,
                        imucoins: 100, // bonus de bienvenue
                        fiat_balance: 0,
                        fiat_currency: "EUR",
                    })
                    .select()
                    .single();

                if (createErr) {
                    logger.error("Failed to create wallet", createErr);
                    return null;
                }

                return {
                    userId: newWallet.user_id,
                    imucoins: newWallet.imucoins,
                    fiatBalance: newWallet.fiat_balance,
                    fiatCurrency: newWallet.fiat_currency,
                    lastSyncAt: newWallet.last_sync_at ?? new Date().toISOString(),
                };
            }
            logger.error("Failed to fetch balance", error);
            return null;
        }

        return {
            userId: data.user_id,
            imucoins: data.imucoins,
            fiatBalance: data.fiat_balance ?? 0,
            fiatCurrency: data.fiat_currency ?? "EUR",
            lastSyncAt: data.last_sync_at ?? new Date().toISOString(),
        };
    } catch (err) {
        logger.error("fetchBalance error", err);
        return null;
    }
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

/**
 * Fetch transaction history
 */
export async function fetchTransactions(
    limit = 30,
    offset = 0,
): Promise<Transaction[]> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from("wallet_transactions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            logger.error("Failed to fetch transactions", error);
            return [];
        }

        return (data || []).map(mapTransaction);
    } catch (err) {
        logger.error("fetchTransactions error", err);
        return [];
    }
}

/**
 * Send ImuCoins to another user
 */
export async function sendImucoins(
    recipientId: string,
    amount: number,
    message?: string,
): Promise<Transaction | null> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;

        if (amount <= 0) throw new Error("Amount must be positive");

        // RPC pour atomicité: débit expéditeur + crédit destinataire + 2 transactions
        const { data, error } = await supabase.rpc("transfer_imucoins", {
            p_sender_id: user.id,
            p_recipient_id: recipientId,
            p_amount: amount,
            p_message: message || `Envoi de ${amount} IMC`,
        });

        if (error) {
            logger.error("Transfer failed", error);
            throw new Error(error.message);
        }

        logger.info(`Sent ${amount} IMC to ${recipientId}`);
        return data ? mapTransaction(data) : null;
    } catch (err) {
        logger.error("sendImucoins error", err);
        throw err;
    }
}

// ============================================================================
// MISSIONS / REWARDS
// ============================================================================

/**
 * Fetch available missions
 */
export async function fetchMissions(): Promise<Mission[]> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from("wallet_missions")
            .select("*")
            .eq("user_id", user.id)
            .in("status", ["available", "in_progress"])
            .order("created_at", { ascending: false });

        if (error) {
            logger.error("Failed to fetch missions", error);
            return [];
        }

        return (data || []).map(
            (row: Record<string, unknown>): Mission => ({
                id: row.id as string,
                title: row.title as string,
                description: row.description as string,
                reward: row.reward as number,
                currency: (row.currency as CurrencyCode) || "IMC",
                icon: (row.icon as string) || "🎯",
                progress: (row.progress as number) || 0,
                target: (row.target as number) || 1,
                status: row.status as Mission["status"],
                expiresAt: row.expires_at as string | undefined,
            }),
        );
    } catch (err) {
        logger.error("fetchMissions error", err);
        return [];
    }
}

/**
 * Claim a completed mission reward
 */
export async function claimMission(missionId: string): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase.rpc("claim_mission_reward", {
            p_user_id: user.id,
            p_mission_id: missionId,
        });

        if (error) {
            logger.error("Claim mission failed", error);
            return false;
        }

        logger.info(`Claimed mission ${missionId}`);
        return true;
    } catch (err) {
        logger.error("claimMission error", err);
        return false;
    }
}

// ============================================================================
// STRIPE STUBS (Phase future)
// ============================================================================

/**
 * Create a Stripe top-up session (stub)
 *
 * Future: Returns a Stripe checkout URL to purchase ImuCoins
 */
export async function createTopupSession(
    _amountEur: number,
): Promise<{ url: string } | null> {
    // TODO: Appel Supabase Edge Function -> Stripe checkout
    logger.warn("createTopupSession is a stub — not yet implemented");
    return null;
}

/**
 * Request a cashout to bank account (stub)
 *
 * Future: Initiates Stripe Connect payout
 */
export async function requestCashout(
    _amountImc: number,
): Promise<boolean> {
    // TODO: Appel Supabase Edge Function -> Stripe payout
    logger.warn("requestCashout is a stub — not yet implemented");
    return false;
}

// ============================================================================
// HELPERS
// ============================================================================

function mapTransaction(row: Record<string, unknown>): Transaction {
    return {
        id: row.id as string,
        userId: row.user_id as string,
        type: row.type as TransactionType,
        amount: row.amount as number,
        currency: (row.currency as CurrencyCode) || "IMC",
        status: (row.status as Transaction["status"]) || "completed",
        description: (row.description as string) || "",
        counterpartyId: row.counterparty_id as string | undefined,
        counterpartyName: row.counterparty_name as string | undefined,
        referenceId: row.reference_id as string | undefined,
        referenceType: row.reference_type as Transaction["referenceType"],
        createdAt: row.created_at as string,
        completedAt: row.completed_at as string | undefined,
    };
}
