/**
 * Privacy Center Service
 *
 * RGPD/GDPR compliance features:
 * - Data export (JSON)
 * - Account deletion request
 * - User blocking
 * - Content/user reporting
 * - Privacy consents management
 */

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { createLogger } from "./logger";
import { supabase } from "./supabase";

const logger = createLogger("PrivacyCenter");

// ============================================================================
// TYPES
// ============================================================================

export interface BlockedUser {
    id: string;
    userId: string;
    blockedUserId: string;
    blockedAt: string;
    blockedUser: {
        username: string | null;
        displayName: string | null;
        avatarUrl: string | null;
    };
}

export interface Report {
    id: string;
    reporterId: string;
    reportType: "user" | "message" | "story" | "content";
    targetId: string;
    targetUserId: string | null;
    reason: ReportReason;
    description: string | null;
    status: "pending" | "reviewed" | "resolved" | "dismissed";
    createdAt: string;
    updatedAt: string;
}

export type ReportReason =
    | "spam"
    | "harassment"
    | "hate_speech"
    | "violence"
    | "nudity"
    | "false_info"
    | "impersonation"
    | "other";

export interface PrivacyConsent {
    id: string;
    consentType: "analytics" | "marketing" | "ai_processing" | "third_party";
    granted: boolean;
    grantedAt: string | null;
    revokedAt: string | null;
}

export interface DataExportProgress {
    status: "idle" | "exporting" | "complete" | "error";
    progress: number;
    currentStep: string;
    error?: string;
}

export interface ExportedData {
    profile: Record<string, unknown>;
    conversations: Record<string, unknown>[];
    messages: Record<string, unknown>[];
    friends: Record<string, unknown>[];
    stories: Record<string, unknown>[];
    blockedUsers: Record<string, unknown>[];
    reports: Record<string, unknown>[];
    settings: Record<string, unknown>;
    exportedAt: string;
}

// ============================================================================
// USER BLOCKING
// ============================================================================

/**
 * Block a user
 */
export async function blockUser(blockedUserId: string): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            logger.warn("Cannot block user: not authenticated");
            return false;
        }

        const { error } = await supabase.from("blocked_users").insert({
            user_id: user.id,
            blocked_user_id: blockedUserId,
        });

        if (error) {
            // Check if already blocked (unique constraint violation)
            if (error.code === "23505") {
                logger.info("User already blocked");
                return true;
            }
            logger.error("Failed to block user", error);
            return false;
        }

        logger.info(`User ${blockedUserId} blocked`);
        return true;
    } catch (error) {
        logger.error("Block user error", error);
        return false;
    }
}

/**
 * Unblock a user
 */
export async function unblockUser(blockedUserId: string): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from("blocked_users")
            .delete()
            .eq("user_id", user.id)
            .eq("blocked_user_id", blockedUserId);

        if (error) {
            logger.error("Failed to unblock user", error);
            return false;
        }

        logger.info(`User ${blockedUserId} unblocked`);
        return true;
    } catch (error) {
        logger.error("Unblock user error", error);
        return false;
    }
}

/**
 * Get list of blocked users
 */
export async function getBlockedUsers(): Promise<BlockedUser[]> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from("blocked_users")
            .select(
                `
        id,
        user_id,
        blocked_user_id,
        created_at,
        blocked_user:profiles!blocked_user_id (
          username,
          display_name,
          avatar_url
        )
      `,
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            logger.error("Failed to get blocked users", error);
            return [];
        }

        return (data || []).map((row: Record<string, unknown>) => ({
            id: row.id as string,
            userId: row.user_id as string,
            blockedUserId: row.blocked_user_id as string,
            blockedAt: row.created_at as string,
            blockedUser: {
                username: (row.blocked_user as Record<string, unknown>)?.username as string | null,
                displayName: (row.blocked_user as Record<string, unknown>)?.display_name as string | null,
                avatarUrl: (row.blocked_user as Record<string, unknown>)?.avatar_url as string | null,
            },
        }));
    } catch (error) {
        logger.error("Get blocked users error", error);
        return [];
    }
}

/**
 * Check if a user is blocked
 */
export async function isUserBlocked(targetUserId: string): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from("blocked_users")
            .select("id")
            .eq("user_id", user.id)
            .eq("blocked_user_id", targetUserId)
            .maybeSingle();

        if (error) {
            logger.error("Failed to check blocked status", error);
            return false;
        }

        return !!data;
    } catch (error) {
        return false;
    }
}

// ============================================================================
// REPORTING
// ============================================================================

/**
 * Report a user or content
 */
export async function submitReport(params: {
    reportType: Report["reportType"];
    targetId: string;
    targetUserId?: string;
    reason: ReportReason;
    description?: string;
}): Promise<{ success: boolean; reportId?: string; error?: string }> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const { data, error } = await supabase
            .from("reports")
            .insert({
                reporter_id: user.id,
                report_type: params.reportType,
                target_id: params.targetId,
                target_user_id: params.targetUserId || null,
                reason: params.reason,
                description: params.description || null,
                status: "pending",
            })
            .select("id")
            .single();

        if (error) {
            logger.error("Failed to submit report", error);
            return { success: false, error: error.message };
        }

        logger.info(`Report submitted: ${data.id}`);
        return { success: true, reportId: data.id };
    } catch (error) {
        logger.error("Submit report error", error);
        return { success: false, error: "Failed to submit report" };
    }
}

/**
 * Get user's submitted reports
 */
export async function getMyReports(): Promise<Report[]> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from("reports")
            .select("*")
            .eq("reporter_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            logger.error("Failed to get reports", error);
            return [];
        }

        return (data || []).map((row: Record<string, unknown>) => ({
            id: row.id as string,
            reporterId: row.reporter_id as string,
            reportType: row.report_type as Report["reportType"],
            targetId: row.target_id as string,
            targetUserId: row.target_user_id as string | null,
            reason: row.reason as ReportReason,
            description: row.description as string | null,
            status: row.status as Report["status"],
            createdAt: row.created_at as string,
            updatedAt: row.updated_at as string,
        }));
    } catch (error) {
        logger.error("Get reports error", error);
        return [];
    }
}

// ============================================================================
// PRIVACY CONSENTS
// ============================================================================

/**
 * Get current privacy consents
 */
export async function getPrivacyConsents(): Promise<PrivacyConsent[]> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from("privacy_consents")
            .select("*")
            .eq("user_id", user.id);

        if (error) {
            logger.warn("Failed to get privacy consents", error);
            // Return default consents if table doesn't exist
            return getDefaultConsents();
        }

        if (!data || data.length === 0) {
            return getDefaultConsents();
        }

        return (data || []).map((row: Record<string, unknown>) => ({
            id: row.id as string,
            consentType: row.consent_type as PrivacyConsent["consentType"],
            granted: row.granted as boolean,
            grantedAt: row.granted_at as string | null,
            revokedAt: row.revoked_at as string | null,
        }));
    } catch (error) {
        logger.error("Get consents error", error);
        return getDefaultConsents();
    }
}

function getDefaultConsents(): PrivacyConsent[] {
    return [
        {
            id: "analytics",
            consentType: "analytics",
            granted: true,
            grantedAt: null,
            revokedAt: null,
        },
        {
            id: "marketing",
            consentType: "marketing",
            granted: false,
            grantedAt: null,
            revokedAt: null,
        },
        {
            id: "ai_processing",
            consentType: "ai_processing",
            granted: false,
            grantedAt: null,
            revokedAt: null,
        },
        {
            id: "third_party",
            consentType: "third_party",
            granted: false,
            grantedAt: null,
            revokedAt: null,
        },
    ];
}

/**
 * Update a privacy consent
 */
export async function updatePrivacyConsent(
    consentType: PrivacyConsent["consentType"],
    granted: boolean,
): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        const now = new Date().toISOString();

        const { error } = await supabase.from("privacy_consents").upsert(
            {
                user_id: user.id,
                consent_type: consentType,
                granted,
                granted_at: granted ? now : null,
                revoked_at: granted ? null : now,
                updated_at: now,
            },
            {
                onConflict: "user_id,consent_type",
            },
        );

        if (error) {
            logger.error("Failed to update consent", error);
            return false;
        }

        logger.info(`Consent ${consentType} set to ${granted}`);
        return true;
    } catch (error) {
        logger.error("Update consent error", error);
        return false;
    }
}

// ============================================================================
// DATA EXPORT (RGPD Article 20)
// ============================================================================

/**
 * Export all user data as JSON
 */
export async function exportUserData(
    onProgress?: (progress: DataExportProgress) => void,
): Promise<{ success: boolean; filePath?: string; error?: string }> {
    const updateProgress = (
        status: DataExportProgress["status"],
        progress: number,
        currentStep: string,
        error?: string,
    ) => {
        onProgress?.({ status, progress, currentStep, error });
    };

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        updateProgress("exporting", 0, "Préparation...");

        const exportData: ExportedData = {
            profile: {},
            conversations: [],
            messages: [],
            friends: [],
            stories: [],
            blockedUsers: [],
            reports: [],
            settings: {},
            exportedAt: new Date().toISOString(),
        };

        // 1. Profile
        updateProgress("exporting", 10, "Export du profil...");
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
        exportData.profile = profile || {};

        // 2. Conversations & Members
        updateProgress("exporting", 25, "Export des conversations...");
        const { data: conversations } = await supabase
            .from("conversation_members")
            .select(
                `
        conversation_id,
        role,
        joined_at,
        conversations (
          id, type, name, created_at
        )
      `,
            )
            .eq("user_id", user.id);
        exportData.conversations = conversations || [];

        // 3. Messages (limit to 10000 for performance)
        updateProgress("exporting", 40, "Export des messages...");
        const conversationIds = (conversations || [])
            .map((c: Record<string, unknown>) => c.conversation_id as string)
            .filter(Boolean);

        if (conversationIds.length > 0) {
            const { data: messages } = await supabase
                .from("messages")
                .select("id, content, created_at, conversation_id, message_type")
                .eq("sender_id", user.id)
                .in("conversation_id", conversationIds)
                .order("created_at", { ascending: false })
                .limit(10000);
            exportData.messages = messages || [];
        }

        // 4. Friends
        updateProgress("exporting", 55, "Export des amis...");
        const { data: friends } = await supabase
            .from("friendships")
            .select(
                `
        id, status, created_at,
        friend:profiles!friendships_friend_id_fkey (username, display_name)
      `,
            )
            .eq("user_id", user.id);
        exportData.friends = friends || [];

        // 5. Stories
        updateProgress("exporting", 70, "Export des stories...");
        const { data: stories } = await supabase
            .from("stories")
            .select("id, media_url, caption, created_at, expires_at, visibility")
            .eq("user_id", user.id);
        exportData.stories = stories || [];

        // 6. Blocked users
        updateProgress("exporting", 80, "Export des utilisateurs bloqués...");
        const blockedUsers = await getBlockedUsers();
        exportData.blockedUsers = blockedUsers as unknown as Record<string, unknown>[];

        // 7. Reports
        updateProgress("exporting", 90, "Export des signalements...");
        const reports = await getMyReports();
        exportData.reports = reports as unknown as Record<string, unknown>[];

        // 8. Settings from profile
        exportData.settings = {
            privacy_show_online: (profile as Record<string, unknown>)?.privacy_show_online,
            privacy_show_last_seen: (profile as Record<string, unknown>)?.privacy_show_last_seen,
            privacy_read_receipts: (profile as Record<string, unknown>)?.privacy_read_receipts,
            privacy_search_phone: (profile as Record<string, unknown>)?.privacy_search_phone,
            language: (profile as Record<string, unknown>)?.language,
            theme: (profile as Record<string, unknown>)?.theme,
        };

        // Write to file
        updateProgress("exporting", 95, "Écriture du fichier...");
        const fileName = `imuchat_data_export_${new Date().toISOString().split("T")[0]}.json`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.writeAsStringAsync(
            filePath,
            JSON.stringify(exportData, null, 2),
            { encoding: FileSystem.EncodingType.UTF8 },
        );

        updateProgress("complete", 100, "Terminé !");
        logger.info(`Data exported to ${filePath}`);

        return { success: true, filePath };
    } catch (error) {
        logger.error("Export data error", error);
        updateProgress("error", 0, "Erreur", (error as Error).message);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Share exported data file
 */
export async function shareExportedData(filePath: string): Promise<boolean> {
    try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
            logger.warn("Sharing not available on this device");
            return false;
        }

        await Sharing.shareAsync(filePath, {
            mimeType: "application/json",
            dialogTitle: "Exporter mes données ImuChat",
        });

        return true;
    } catch (error) {
        logger.error("Share export error", error);
        return false;
    }
}

// ============================================================================
// ACCOUNT DELETION REQUEST
// ============================================================================

/**
 * Request account deletion (RGPD Article 17)
 */
export async function requestAccountDeletion(
    reason?: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Insert deletion request
        const { error } = await supabase.from("account_deletion_requests").insert({
            user_id: user.id,
            reason: reason || null,
            status: "pending",
            requested_at: new Date().toISOString(),
        });

        if (error) {
            // Table might not exist, log but proceed with direct deletion
            logger.warn("Could not create deletion request", error);
        }

        // For immediate deletion (if policy allows):
        // await supabase.auth.admin.deleteUser(user.id);

        // For soft deletion (mark as deleted):
        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                username: `deleted_${user.id.slice(0, 8)}`,
                display_name: "Compte supprimé",
                avatar_url: null,
                bio: null,
                status: "deleted",
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        if (updateError) {
            logger.error("Failed to mark profile as deleted", updateError);
            return { success: false, error: updateError.message };
        }

        // Sign out
        await supabase.auth.signOut();

        logger.info("Account deletion request submitted");
        return { success: true };
    } catch (error) {
        logger.error("Account deletion error", error);
        return { success: false, error: (error as Error).message };
    }
}

// ============================================================================
// REPORT REASONS (for UI)
// ============================================================================

export const REPORT_REASONS: { value: ReportReason; labelKey: string }[] = [
    { value: "spam", labelKey: "privacy.reportReasonSpam" },
    { value: "harassment", labelKey: "privacy.reportReasonHarassment" },
    { value: "hate_speech", labelKey: "privacy.reportReasonHateSpeech" },
    { value: "violence", labelKey: "privacy.reportReasonViolence" },
    { value: "nudity", labelKey: "privacy.reportReasonNudity" },
    { value: "false_info", labelKey: "privacy.reportReasonFalseInfo" },
    { value: "impersonation", labelKey: "privacy.reportReasonImpersonation" },
    { value: "other", labelKey: "privacy.reportReasonOther" },
];
