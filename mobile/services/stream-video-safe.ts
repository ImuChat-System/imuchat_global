/**
 * @deprecated Ce fichier est DÉPRÉCIÉ. Utilisez les services suivants :
 * - `@/services/calls-safe.ts` — Wrapper safe pour appels (Expo Go compatible)
 * - `@/services/calls.ts` — Service principal pour appels audio/vidéo
 * - `@/services/stream-token.ts` — Gestion des tokens Stream depuis platform-core
 *
 * Ce fichier utilisait une clé API hardcodée et des tokens client-side fakés.
 * Toutes les fonctions redirigent vers le nouveau système.
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
 * @deprecated Utiliser `isCallsAvailable()` de `@/services/calls-safe.ts`
 */
export function isStreamVideoAvailable(): boolean {
    if (nativeModulesAvailable !== null) {
        return nativeModulesAvailable;
    }

    try {
        const isExpoGo = Constants.appOwnership === 'expo';
        if (isExpoGo) {
            nativeModulesAvailable = false;
            return false;
        }
        nativeModulesAvailable = true;
        return true;
    } catch (error) {
        nativeModulesAvailable = false;
        return false;
    }
}

/**
 * @deprecated Utiliser le dynamic import de `@stream-io/video-react-native-sdk` directement
 * ou passer par `@/services/calls-safe.ts`
 */
export async function getStreamVideoSDK(): Promise<typeof import("@stream-io/video-react-native-sdk") | null> {
    if (!isStreamVideoAvailable()) {
        return null;
    }

    try {
        const sdk = await import("@stream-io/video-react-native-sdk");
        return sdk;
    } catch (error) {
        console.warn("[StreamVideo] Failed to load SDK:", error);
        nativeModulesAvailable = false;
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

// Cached client instance
let cachedClient: StreamVideoClientInstance | null = null;

/**
 * @deprecated Utiliser `safeEnsureStreamClient()` de `@/services/calls-safe.ts`
 *
 * Safe initialization that redirects to the new system using real backend tokens.
 */
export async function safeInitializeStreamVideo(): Promise<StreamVideoClientInstance | null> {
    console.warn('[DEPRECATED] safeInitializeStreamVideo() is deprecated. Use calls-safe.ts safeEnsureStreamClient() instead.');

    if (cachedClient) {
        return cachedClient;
    }

    try {
        const { safeEnsureStreamClient } = await import('./calls-safe');
        const { supabase } = await import('./supabase');

        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (!supabaseUser) {
            console.warn("[StreamVideo] No authenticated user");
            return null;
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("username, full_name, avatar_url")
            .eq("id", supabaseUser.id)
            .single();

        const client = await safeEnsureStreamClient({
            id: supabaseUser.id,
            name: profile?.full_name || profile?.username || "User",
            image: profile?.avatar_url || undefined,
        });

        if (client) {
            cachedClient = client as unknown as StreamVideoClientInstance;
        }

        return cachedClient;
    } catch (error) {
        console.error("[StreamVideo] Initialization failed:", error);
        return null;
    }
}

/**
 * @deprecated Utiliser `safeDisconnectStreamClient()` de `@/services/calls-safe.ts`
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
