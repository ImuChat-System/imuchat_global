/**
 * Security Service
 *
 * Handles:
 * - Biometric authentication (FaceID/TouchID)
 * - 2FA/MFA via TOTP (Supabase MFA)
 * - Session management (list, revoke)
 * - Secure storage for security preferences
 */

import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { createLogger } from "./logger";
import { supabase } from "./supabase";

const logger = createLogger("Security");

// ============================================================================
// TYPES
// ============================================================================

export interface BiometricStatus {
    isAvailable: boolean;
    biometryType: "fingerprint" | "faceId" | "iris" | "none";
    isEnabled: boolean;
}

export interface ActiveSession {
    id: string;
    deviceInfo: string;
    ipAddress: string | null;
    lastActiveAt: string;
    createdAt: string;
    isCurrent: boolean;
    userAgent: string | null;
}

export interface MfaFactor {
    id: string;
    type: "totp";
    friendlyName: string | null;
    createdAt: string;
    status: "verified" | "unverified";
}

export interface MfaEnrollment {
    id: string;
    type: "totp";
    totpUri: string;
    qrCode: string;
    secret: string;
}

// ============================================================================
// SECURE STORAGE KEYS
// ============================================================================

const SECURE_KEYS = {
    BIOMETRIC_ENABLED: "imuchat_biometric_enabled",
    BIOMETRIC_SESSION_TOKEN: "imuchat_biometric_session_token",
    MFA_ENABLED: "imuchat_mfa_enabled",
} as const;

// ============================================================================
// BIOMETRIC AUTHENTICATION
// ============================================================================

/**
 * Check if biometric authentication is available on this device
 */
export async function checkBiometricAvailability(): Promise<BiometricStatus> {
    try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const supportedTypes =
            await LocalAuthentication.supportedAuthenticationTypesAsync();

        let biometryType: BiometricStatus["biometryType"] = "none";
        if (
            supportedTypes.includes(
                LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
            )
        ) {
            biometryType = "faceId";
        } else if (
            supportedTypes.includes(
                LocalAuthentication.AuthenticationType.FINGERPRINT,
            )
        ) {
            biometryType = "fingerprint";
        } else if (
            supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)
        ) {
            biometryType = "iris";
        }

        const isAvailable = hasHardware && isEnrolled;
        const storedEnabled = await SecureStore.getItemAsync(
            SECURE_KEYS.BIOMETRIC_ENABLED,
        );
        const isEnabled = storedEnabled === "true";

        return {
            isAvailable,
            biometryType,
            isEnabled: isAvailable && isEnabled,
        };
    } catch (error) {
        logger.warn("Failed to check biometric availability", error);
        return {
            isAvailable: false,
            biometryType: "none",
            isEnabled: false,
        };
    }
}

/**
 * Prompt user for biometric authentication
 */
export async function authenticateWithBiometrics(
    promptMessage = "Authentifiez-vous pour continuer",
): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage,
            fallbackLabel: "Utiliser le code PIN",
            disableDeviceFallback: false,
            cancelLabel: "Annuler",
        });

        if (result.success) {
            logger.info("Biometric authentication successful");
            return { success: true };
        }

        if (result.error === "user_cancel") {
            return { success: false, error: "Authentification annulée" };
        }

        return {
            success: false,
            error: result.error || "Échec de l'authentification",
        };
    } catch (error) {
        logger.error("Biometric authentication error", error);
        return { success: false, error: "Erreur biométrique" };
    }
}

/**
 * Enable or disable biometric authentication for app lock
 */
export async function setBiometricEnabled(enabled: boolean): Promise<boolean> {
    try {
        if (enabled) {
            // Verify biometrics first before enabling
            const authResult = await authenticateWithBiometrics(
                "Activez l'authentification biométrique",
            );
            if (!authResult.success) {
                return false;
            }
        }

        await SecureStore.setItemAsync(
            SECURE_KEYS.BIOMETRIC_ENABLED,
            enabled ? "true" : "false",
        );

        logger.info(`Biometric authentication ${enabled ? "enabled" : "disabled"}`);
        return true;
    } catch (error) {
        logger.error("Failed to set biometric enabled", error);
        return false;
    }
}

/**
 * Check if biometric is enabled
 */
export async function isBiometricEnabled(): Promise<boolean> {
    try {
        const stored = await SecureStore.getItemAsync(SECURE_KEYS.BIOMETRIC_ENABLED);
        return stored === "true";
    } catch {
        return false;
    }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Get list of active sessions for the current user
 * Uses Supabase auth sessions (via management API if available)
 */
export async function getActiveSessions(): Promise<ActiveSession[]> {
    try {
        // Supabase doesn't expose multiple sessions directly in the client SDK
        // We'll get the current session and mock device info from user agent
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession();

        if (error || !session) {
            logger.warn("Failed to get session", error);
            return [];
        }

        // Parse user agent for device info
        const userAgent =
            typeof navigator !== "undefined" ? navigator.userAgent : "Mobile App";
        const deviceInfo = parseDeviceInfo(userAgent);

        // Current session
        const currentSession: ActiveSession = {
            id: session.access_token.slice(-12), // Use last 12 chars as ID
            deviceInfo,
            ipAddress: null, // Not available in client SDK
            lastActiveAt: new Date().toISOString(),
            createdAt: new Date(session.expires_at! * 1000 - 3600 * 1000).toISOString(), // Approximate
            isCurrent: true,
            userAgent,
        };

        // In a full implementation, you would call a backend API
        // that uses Supabase Admin SDK to list all sessions
        // For now, return just the current session
        return [currentSession];
    } catch (error) {
        logger.error("Failed to get active sessions", error);
        return [];
    }
}

/**
 * Revoke a specific session (sign out from that device)
 */
export async function revokeSession(sessionId: string): Promise<boolean> {
    try {
        // For revoking other sessions, you need a backend endpoint
        // that uses Supabase Admin SDK: supabase.auth.admin.signOut(userId, scope)
        // For now, we can only sign out the current session

        logger.info(`Revoking session ${sessionId}`);

        // If it's the current session, sign out
        const sessions = await getActiveSessions();
        const targetSession = sessions.find((s) => s.id === sessionId);

        if (targetSession?.isCurrent) {
            const { error } = await supabase.auth.signOut({ scope: "local" });
            if (error) {
                logger.error("Failed to sign out", error);
                return false;
            }
            return true;
        }

        // For other sessions, call backend API
        // TODO: Implement backend endpoint for remote session revocation
        logger.warn(
            "Remote session revocation requires backend implementation",
        );
        return false;
    } catch (error) {
        logger.error("Failed to revoke session", error);
        return false;
    }
}

/**
 * Sign out from all devices
 */
export async function revokeAllSessions(): Promise<boolean> {
    try {
        const { error } = await supabase.auth.signOut({ scope: "global" });
        if (error) {
            logger.error("Failed to sign out globally", error);
            return false;
        }
        logger.info("Signed out from all devices");
        return true;
    } catch (error) {
        logger.error("Failed to revoke all sessions", error);
        return false;
    }
}

// ============================================================================
// 2FA / MFA (TOTP)
// ============================================================================

/**
 * Check if MFA is enrolled for the current user
 */
export async function getMfaFactors(): Promise<MfaFactor[]> {
    try {
        const { data, error } = await supabase.auth.mfa.listFactors();

        if (error) {
            logger.warn("Failed to list MFA factors", error);
            return [];
        }

        return (data?.totp || []).map((factor) => ({
            id: factor.id,
            type: "totp" as const,
            friendlyName: factor.friendly_name ?? null,
            createdAt: factor.created_at,
            status: factor.status as "verified" | "unverified",
        }));
    } catch (error) {
        logger.error("Failed to get MFA factors", error);
        return [];
    }
}

/**
 * Check if MFA is enabled (has a verified factor)
 */
export async function isMfaEnabled(): Promise<boolean> {
    const factors = await getMfaFactors();
    return factors.some((f) => f.status === "verified");
}

/**
 * Start MFA enrollment - returns QR code for authenticator app
 */
export async function enrollMfa(
    friendlyName?: string,
): Promise<{ success: true; enrollment: MfaEnrollment } | { success: false; error: string }> {
    try {
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: "totp",
            friendlyName: friendlyName || "ImuChat Mobile",
        });

        if (error) {
            logger.error("MFA enrollment failed", error);
            return { success: false, error: error.message };
        }

        return {
            success: true,
            enrollment: {
                id: data.id,
                type: "totp",
                totpUri: data.totp.uri,
                qrCode: data.totp.qr_code,
                secret: data.totp.secret,
            },
        };
    } catch (error) {
        logger.error("MFA enrollment error", error);
        return { success: false, error: "Erreur lors de l'activation 2FA" };
    }
}

/**
 * Verify MFA enrollment with a TOTP code
 */
export async function verifyMfaEnrollment(
    factorId: string,
    totpCode: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data, error } = await supabase.auth.mfa.challengeAndVerify({
            factorId,
            code: totpCode,
        });

        if (error) {
            logger.warn("MFA verification failed", error);
            return { success: false, error: error.message };
        }

        // Store that MFA is enabled
        await SecureStore.setItemAsync(SECURE_KEYS.MFA_ENABLED, "true");

        logger.info("MFA enrollment verified successfully");
        return { success: true };
    } catch (error) {
        logger.error("MFA verification error", error);
        return { success: false, error: "Code invalide" };
    }
}

/**
 * Verify MFA challenge during login
 */
export async function verifyMfaChallenge(
    factorId: string,
    totpCode: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data: challenge, error: challengeError } =
            await supabase.auth.mfa.challenge({ factorId });

        if (challengeError) {
            return { success: false, error: challengeError.message };
        }

        const { data, error: verifyError } = await supabase.auth.mfa.verify({
            factorId,
            challengeId: challenge.id,
            code: totpCode,
        });

        if (verifyError) {
            return { success: false, error: verifyError.message };
        }

        return { success: true };
    } catch (error) {
        logger.error("MFA challenge verification error", error);
        return { success: false, error: "Erreur de vérification" };
    }
}

/**
 * Unenroll MFA factor
 */
export async function unenrollMfa(factorId: string): Promise<boolean> {
    try {
        const { error } = await supabase.auth.mfa.unenroll({ factorId });

        if (error) {
            logger.error("MFA unenroll failed", error);
            return false;
        }

        // Check if any factors remain
        const remainingFactors = await getMfaFactors();
        if (remainingFactors.length === 0) {
            await SecureStore.setItemAsync(SECURE_KEYS.MFA_ENABLED, "false");
        }

        logger.info("MFA factor unenrolled");
        return true;
    } catch (error) {
        logger.error("MFA unenroll error", error);
        return false;
    }
}

// ============================================================================
// HELPERS
// ============================================================================

function parseDeviceInfo(userAgent: string): string {
    // Simple device info parsing
    if (userAgent.includes("iPhone")) return "iPhone";
    if (userAgent.includes("iPad")) return "iPad";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Linux")) return "Linux";
    return "Appareil inconnu";
}

/**
 * Get a human-readable biometry type label
 */
export function getBiometryLabel(
    biometryType: BiometricStatus["biometryType"],
): string {
    switch (biometryType) {
        case "faceId":
            return "Face ID";
        case "fingerprint":
            return "Touch ID / Empreinte";
        case "iris":
            return "Iris";
        default:
            return "Biométrie";
    }
}
