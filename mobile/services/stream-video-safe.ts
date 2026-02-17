/**
 * Safe wrapper for Stream Video SDK
 * Handles cases where native modules are not available (Expo Go)
 */

import Constants from 'expo-constants';

// Types from Stream Video SDK (re-exported for compatibility)
export interface User {
    id: string;
    name?: string;
    image?: string;
}

export interface StreamVideoClientInstance {
    disconnectUser: () => Promise<void>;
    call: (type: string, id: string) => any;
}

// Flag to track if native modules are available
let nativeModulesAvailable: boolean | null = null;

/**
 * Check if Stream Video native modules are available
 * In Expo Go, always returns false to prevent crashes
 */
export function isStreamVideoAvailable(): boolean {
    if (nativeModulesAvailable !== null) {
        return nativeModulesAvailable;
    }

    try {
        // Check if running in Expo Go
        const isExpoGo = Constants.appOwnership === 'expo';

        if (isExpoGo) {
            console.log('[StreamVideo] Running in Expo Go - SDK disabled');
            nativeModulesAvailable = false;
            return false;
        }

        // In development builds, assume native modules are available
        console.log('[StreamVideo] Development build - SDK enabled');
        nativeModulesAvailable = true;
        return true;
    } catch (error) {
        console.warn("[StreamVideo] Error checking environment:", error);
        nativeModulesAvailable = false;
        return false;
    }
}

/**
 * Lazy-load Stream Video SDK
 * Returns null if native modules are not available or running in Expo Go
 */
export async function getStreamVideoSDK(): Promise<typeof import("@stream-io/video-react-native-sdk") | null> {
    // Check availability first without importing
    if (!isStreamVideoAvailable()) {
        console.log('[StreamVideo] SDK not available - skipping import');
        return null;
    }

    try {
        // Dynamic import to avoid loading at module initialization
        const sdk = await import("@stream-io/video-react-native-sdk");
        return sdk;
    } catch (error) {
        console.warn("[StreamVideo] Failed to load SDK:", error);
        nativeModulesAvailable = false; // Update flag
        return null;
    }
}

// Re-export a mock for when SDK is not available
export const MockStreamVideoClient = {
    disconnectUser: async () => { },
    call: () => ({
        join: async () => { },
        leave: async () => { },
    }),
};

// Stream API Key - same as in stream-video.ts
const STREAM_API_KEY = "mmhfdzb5evj2";

// Cached client instance
let cachedClient: StreamVideoClientInstance | null = null;

/**
 * Generate a client-side token for development
 * In production, use a server-side Edge Function
 */
function generateClientToken(userId: string): string {
    // Simple dev token - in production use server-generated tokens
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(
        JSON.stringify({
            user_id: userId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h
        })
    );
    return `${header}.${payload}.dev_signature`;
}

/**
 * Safe initialization that won't crash in Expo Go
 * Implements initialization logic inline to avoid importing stream-video.ts
 */
export async function safeInitializeStreamVideo(): Promise<StreamVideoClientInstance | null> {
    // Return cached client if available
    if (cachedClient) {
        return cachedClient;
    }

    // Try to load the SDK dynamically
    const sdk = await getStreamVideoSDK();
    if (!sdk) {
        console.warn("[StreamVideo] SDK not available - calls will be disabled");
        return null;
    }

    try {
        // Import supabase dynamically to get user info
        const { supabase } = await import("./supabase");

        const { data: { user: supabaseUser } } = await supabase.auth.getUser();

        if (!supabaseUser) {
            console.warn("[StreamVideo] No authenticated user");
            return null;
        }

        // Fetch user profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("username, full_name, avatar_url")
            .eq("id", supabaseUser.id)
            .single();

        const streamUser = {
            id: supabaseUser.id,
            name: profile?.full_name || profile?.username || "User",
            image: profile?.avatar_url || undefined,
        };

        // Generate token
        const token = generateClientToken(supabaseUser.id);

        // Create client using the dynamically loaded SDK
        const client = new sdk.StreamVideoClient({
            apiKey: STREAM_API_KEY,
            user: streamUser,
            token,
        });

        cachedClient = client as unknown as StreamVideoClientInstance;
        console.log("[StreamVideo] Client initialized successfully");
        return cachedClient;
    } catch (error) {
        console.error("[StreamVideo] Initialization failed:", error);
        return null;
    }
}

/**
 * Disconnect and cleanup
 */
export async function safeDisconnectStreamVideo(): Promise<void> {
    if (cachedClient) {
        try {
            await cachedClient.disconnectUser();
        } catch (error) {
            console.warn("[StreamVideo] Disconnect error:", error);
        }
        cachedClient = null;
    }
}
