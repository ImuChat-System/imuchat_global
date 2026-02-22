/**
 * @deprecated Ce fichier est DÉPRÉCIÉ. Utilisez les services suivants à la place :
 * - `@/services/calls.ts` — Service principal pour appels audio/vidéo (tokens réels du backend)
 * - `@/services/calls-safe.ts` — Wrapper safe pour Expo Go
 * - `@/services/stream-token.ts` — Gestion des tokens Stream depuis platform-core
 *
 * Ce fichier utilisait une clé API hardcodée et des tokens placeholder.
 * Il est conservé uniquement pour référence. Toutes les fonctions redirigent
 * vers le nouveau système.
 */

import { StreamVideoClient } from "@stream-io/video-react-native-sdk";

// ⚠️ DÉPRÉCIÉ — Utiliser les env vars via calls.ts
const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY || '';

let client: StreamVideoClient | null = null;

/**
 * @deprecated Utiliser `initializeStreamClient()` de `@/services/calls.ts`
 */
export async function initializeStreamVideo(): Promise<StreamVideoClient> {
    console.warn('[DEPRECATED] initializeStreamVideo() is deprecated. Use calls.ts instead.');
    const { initializeStreamClient, getStreamClient } = await import('./calls');
    const { generateStreamToken } = await import('./stream-token');
    const { supabase } = await import('./supabase');

    // Check if already initialized
    const existing = getStreamClient();
    if (existing) return existing;

    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (!supabaseUser) throw new Error("No authenticated user");

    const { data: profile } = await supabase
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("id", supabaseUser.id)
        .single();

    const userName = profile?.full_name || profile?.username || "User";
    const userImage = profile?.avatar_url || undefined;

    const tokenData = await generateStreamToken({
        userId: supabaseUser.id,
        userName,
        userImage,
    });

    const newClient = await initializeStreamClient(
        { id: supabaseUser.id, name: userName, image: userImage },
        tokenData.token,
    );

    client = newClient;
    return newClient;
}

/**
 * @deprecated Utiliser `getStreamClient()` de `@/services/calls.ts`
 */
export function getStreamVideoClient(): StreamVideoClient | null {
    return client;
}

/**
 * @deprecated Utiliser `disconnectStreamClient()` de `@/services/calls.ts`
 */
export async function disconnectStreamVideo(): Promise<void> {
    if (client) {
        await client.disconnectUser();
        client = null;
    }
}

/**
 * @deprecated Utiliser `createCall()` de `@/services/calls.ts`
 */
export async function createStreamCall(
    callId: string,
    callType: "audio" | "video"
) {
    console.warn('[DEPRECATED] createStreamCall() is deprecated. Use calls.ts createCall() instead.');
    const { createCall } = await import('./calls');
    const streamCallType = callType === "video" ? "default" : "audio";
    return createCall(callId, streamCallType, []);
}

/**
 * @deprecated Utiliser `joinCall()` ou `getCall()` de `@/services/calls.ts`
 */
export async function joinStreamCall(
    callId: string,
    callType: "audio" | "video"
) {
    console.warn('[DEPRECATED] joinStreamCall() is deprecated. Use calls.ts instead.');
    const { getStreamClient } = await import('./calls');
    const streamClient = getStreamClient();
    if (!streamClient) throw new Error("Stream Video client not initialized. Use calls.ts initializeStreamClient().");

    const call = streamClient.call(callType === "video" ? "default" : "audio_room", callId);
    await call.join();
    return call;
}
