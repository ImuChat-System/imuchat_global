/**
 * Safe wrapper for Calls functionality
 * Handles cases where native modules are not available (Expo Go)
 * 
 * All Stream SDK imports are done dynamically to avoid crashes at module load time.
 */

import Constants from 'expo-constants';

// === TYPES (re-exported without SDK dependency) ===

export interface CallUser {
    id: string;
    name?: string;
    image?: string;
}

export interface CallOptions {
    videoEnabled?: boolean;
    audioEnabled?: boolean;
    cameraDirection?: 'front' | 'back';
}

export interface CallParticipant {
    userId: string;
    name?: string;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    isScreenSharing: boolean;
}

export interface CallState {
    isActive: boolean;
    isMicOn: boolean;
    isCameraOn: boolean;
    participants: CallParticipant[];
}

// === SDK AVAILABILITY CHECK ===

let sdkAvailable: boolean | null = null;
let sdkCheckPromise: Promise<boolean> | null = null;

/**
 * Check if Stream Video SDK is available (async)
 * In Expo Go, always returns false to prevent native module crashes
 */
export async function isCallsAvailable(): Promise<boolean> {
    if (sdkAvailable !== null) {
        return sdkAvailable;
    }

    if (sdkCheckPromise) {
        return sdkCheckPromise;
    }

    sdkCheckPromise = (async () => {
        try {
            // Check if running in Expo Go
            const isExpoGo = Constants.appOwnership === 'expo';

            if (isExpoGo) {
                console.log('[Calls] Running in Expo Go - Stream SDK disabled');
                sdkAvailable = false;
                return false;
            }

            // In development builds, assume SDK is available
            // The actual import will happen when needed
            console.log('[Calls] Development build detected - Stream SDK enabled');
            sdkAvailable = true;
            return true;
        } catch (error) {
            console.warn('[Calls] Error checking environment:', error);
            sdkAvailable = false;
            return false;
        }
    })();

    return sdkCheckPromise;
}

// === SAFE CALLS SERVICE (LAZY-LOADED) ===

let callsModule: typeof import('./calls') | null = null;
let loadingPromise: Promise<typeof import('./calls') | null> | null = null;

/**
 * Safely get the calls module
 * Returns null if SDK is not available
 */
async function getCallsModule(): Promise<typeof import('./calls') | null> {
    if (callsModule) return callsModule;
    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
        const available = await isCallsAvailable();
        if (!available) {
            return null;
        }

        try {
            callsModule = await import('./calls');
            return callsModule;
        } catch (error) {
            console.error('[Calls] Failed to load calls module:', error);
            return null;
        }
    })();

    return loadingPromise;
}

// === SAFE WRAPPERS FOR CALLS FUNCTIONS ===

/**
 * Initialize Stream client safely
 */
export async function safeInitializeStreamClient(
    user: CallUser,
    token: string
): Promise<any | null> {
    const module = await getCallsModule();
    if (!module) {
        console.warn('[Calls] Cannot initialize - SDK not available');
        return null;
    }
    return module.initializeStreamClient(user, token);
}

/**
 * Create a call safely
 * @param callId Unique call ID
 * @param callType 'audio' or 'default' (for video)
 * @param members Optional list of member IDs
 */
export async function safeCreateCall(
    callId: string,
    callType: 'audio' | 'default' = 'default',
    members: string[] = []
): Promise<any | null> {
    const module = await getCallsModule();
    if (!module) {
        console.warn('[Calls] Cannot create call - SDK not available');
        return null;
    }
    return module.createCall(callId, callType, members);
}

/**
 * Join a call safely
 * @param call The Call instance to join
 * @param options Call options (video, audio enabled)
 */
export async function safeJoinCall(
    call: any,
    options?: CallOptions
): Promise<void> {
    const module = await getCallsModule();
    if (!module) {
        console.warn('[Calls] Cannot join call - SDK not available');
        return;
    }
    return module.joinCall(call, options);
}

/**
 * Leave a call safely
 * @param call The Call instance to leave
 */
export async function safeLeaveCall(call: any): Promise<void> {
    const module = await getCallsModule();
    if (!module || !call) {
        return;
    }
    return module.leaveCall(call);
}

/**
 * End a call safely (creator only)
 * @param call The Call instance to end
 */
export async function safeEndCall(call: any): Promise<void> {
    const module = await getCallsModule();
    if (!module || !call) {
        return;
    }
    return module.endCall(call);
}

/**
 * Toggle microphone safely
 * @param call The Call instance
 */
export async function safeToggleMicrophone(call: any): Promise<void> {
    const module = await getCallsModule();
    if (!module || !call) {
        return;
    }
    return module.toggleMicrophone(call);
}

/**
 * Toggle camera safely
 * @param call The Call instance
 */
export async function safeToggleCamera(call: any): Promise<void> {
    const module = await getCallsModule();
    if (!module || !call) {
        return;
    }
    return module.toggleCamera(call);
}

/**
 * Flip camera safely
 * @param call The Call instance
 */
export async function safeFlipCamera(call: any): Promise<void> {
    const module = await getCallsModule();
    if (!module || !call) {
        return;
    }
    return module.flipCamera(call);
}

/**
 * Get a call by ID safely
 * @param callId The call ID
 * @param callType 'audio' or 'default'
 */
export async function safeGetCall(
    callId: string,
    callType: 'audio' | 'default' = 'default'
): Promise<any | null> {
    const module = await getCallsModule();
    if (!module) {
        return null;
    }
    return module.getCall(callId, callType);
}

/**
 * Disconnect Stream client safely
 */
export async function safeDisconnectStreamClient(): Promise<void> {
    const module = await getCallsModule();
    if (!module) {
        return;
    }
    return module.disconnectStreamClient();
}

/**
 * Ensure Stream client is initialized with a real backend token.
 * Handles the full flow: check SDK availability → get token from backend → init client.
 * Returns the StreamVideoClient instance or null if unavailable.
 * 
 * @param user User info (id, name, image)
 * @returns StreamVideoClient or null
 */
export async function safeEnsureStreamClient(
    user: CallUser,
): Promise<any | null> {
    const available = await isCallsAvailable();
    if (!available) return null;

    const module = await getCallsModule();
    if (!module) return null;

    // Check if already initialized
    const existingClient = module.getStreamClient();
    if (existingClient) return existingClient;

    // Initialize with real token from platform-core backend
    try {
        const { generateStreamToken } = await import('./stream-token');
        const tokenData = await generateStreamToken({
            userId: user.id,
            userName: user.name,
            userImage: user.image,
        });

        return module.initializeStreamClient(user, tokenData.token);
    } catch (error) {
        console.error('[Calls] Failed to ensure Stream client:', error);
        return null;
    }
}

/**
 * Get the current Stream Video client safely
 * Returns null if SDK is not available or client not initialized
 */
export async function safeGetStreamClient(): Promise<any | null> {
    const module = await getCallsModule();
    if (!module) return null;
    return module.getStreamClient();
}

/**
 * Generate a unique call ID safely
 */
export async function safeGenerateCallId(): Promise<string> {
    const module = await getCallsModule();
    if (!module) {
        // Fallback call ID generation
        return `call-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    }
    return module.generateCallId();
}
