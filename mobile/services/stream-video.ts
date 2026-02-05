import { StreamVideoClient, User } from "@stream-io/video-react-native-sdk";
import { supabase } from "./supabase";

// Stream API Key - In production, this should come from environment variables
const STREAM_API_KEY = "mmhfdzb5evj2"; // Replace with your Stream API key

let client: StreamVideoClient | null = null;

/**
 * Initialize Stream Video client
 */
export async function initializeStreamVideo(): Promise<StreamVideoClient> {
    const {
        data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser) {
        throw new Error("No authenticated user");
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("id", supabaseUser.id)
        .single();

    const streamUser: User = {
        id: supabaseUser.id,
        name: profile?.full_name || profile?.username || "User",
        image: profile?.avatar_url || undefined,
    };

    // Generate token (for MVP, using client-side token generation)
    // In production, this should be done via a Supabase Edge Function
    const token = generateClientToken(supabaseUser.id);

    if (!client) {
        client = new StreamVideoClient({
            apiKey: STREAM_API_KEY,
            user: streamUser,
            token,
        });
    }

    return client;
}

/**
 * Get the current Stream Video client
 */
export function getStreamVideoClient(): StreamVideoClient | null {
    return client;
}

/**
 * Disconnect Stream Video client
 */
export async function disconnectStreamVideo(): Promise<void> {
    if (client) {
        await client.disconnectUser();
        client = null;
    }
}

/**
 * Generate a client-side token (FOR DEVELOPMENT ONLY)
 * In production, use a Supabase Edge Function to generate tokens securely
 */
function generateClientToken(userId: string): string {
    // This is a placeholder. In a real app, you would:
    // 1. Call a Supabase Edge Function
    // 2. The Edge Function would use Stream's server-side SDK to generate a token
    // 3. Return the token to the client

    // For now, we'll use a development token
    // You need to generate this from Stream Dashboard for testing
    console.warn(
        "Using client-side token generation. This is NOT secure for production!"
    );

    // TODO: Replace with actual token from Stream Dashboard or Edge Function
    return "DEVELOPMENT_TOKEN_HERE";
}

/**
 * Create a call
 */
export async function createStreamCall(
    callId: string,
    callType: "audio" | "video"
) {
    const client = getStreamVideoClient();
    if (!client) {
        throw new Error("Stream Video client not initialized");
    }

    const call = client.call(callType === "video" ? "default" : "audio_room", callId);
    await call.getOrCreate();

    return call;
}

/**
 * Join an existing call
 */
export async function joinStreamCall(
    callId: string,
    callType: "audio" | "video"
) {
    const client = getStreamVideoClient();
    if (!client) {
        throw new Error("Stream Video client not initialized");
    }

    const call = client.call(callType === "video" ? "default" : "audio_room", callId);
    await call.join();

    return call;
}
