/**
 * Safe hook for calls - handles cases where Stream SDK is not available (Expo Go)
 * 
 * Usage:
 * ```tsx
 * const { 
 *   isAvailable,
 *   call, 
 *   initiateCall, 
 *   joinCall, 
 *   endCall,
 *   toggleMic,
 *   toggleCamera 
 * } = useCallsSafe();
 * ```
 */

import type { CallOptions, CallParticipant } from '@/services/calls-safe';
import { isCallsAvailable } from '@/services/calls-safe';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

export interface UseCallsSafeReturn {
    /** SDK disponible */
    isAvailable: boolean;
    /** Vérification en cours */
    isChecking: boolean;
    /** Appel en cours */
    call: any | null;
    /** ID de l'appel en cours */
    callId: string | null;
    /** Participants de l'appel */
    participants: CallParticipant[];
    /** Appel actif */
    isActive: boolean;
    /** Micro activé */
    isMicOn: boolean;
    /** Caméra activée */
    isCameraOn: boolean;
    /** En cours de connexion */
    isConnecting: boolean;
    /** Erreur */
    error: string | null;
    /** Initier un appel */
    initiateCall: (recipientId: string, isVideo?: boolean) => Promise<any | null>;
    /** Rejoindre un appel */
    joinCall: (callId: string, options?: CallOptions) => Promise<void>;
    /** Quitter l'appel */
    leaveCall: () => Promise<void>;
    /** Terminer l'appel (créateur) */
    endCall: () => Promise<void>;
    /** Toggle microphone */
    toggleMic: () => Promise<void>;
    /** Toggle caméra */
    toggleCam: () => Promise<void>;
    /** Changer de caméra */
    flipCam: () => Promise<void>;
}

/**
 * Safe hook for calls - returns no-op functions if SDK is not available
 */
export function useCallsSafe(): UseCallsSafeReturn {
    const { user } = useAuth();
    const [isAvailable, setIsAvailable] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [call, setCall] = useState<any | null>(null);
    const [callId, setCallId] = useState<string | null>(null);
    const [participants, setParticipants] = useState<CallParticipant[]>([]);
    const [isActive, setIsActive] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clientInitialized = useRef(false);
    const callsModule = useRef<typeof import('@/services/calls') | null>(null);

    // Check SDK availability on mount
    useEffect(() => {
        let mounted = true;

        async function checkAvailability() {
            try {
                const available = await isCallsAvailable();
                if (mounted) {
                    setIsAvailable(available);
                    setIsChecking(false);

                    if (available) {
                        // Pre-load the calls module
                        callsModule.current = await import('@/services/calls');
                    }
                }
            } catch (error) {
                console.error('[useCallsSafe] Error checking availability:', error);
                if (mounted) {
                    setIsAvailable(false);
                    setIsChecking(false);
                }
            }
        }

        checkAvailability();

        return () => {
            mounted = false;
        };
    }, []);

    // Initialize Stream client when available and user is logged in
    useEffect(() => {
        if (!isAvailable || !user || clientInitialized.current || !callsModule.current) return;

        async function initClient() {
            if (!user || !callsModule.current) return;

            try {
                const { generateStreamToken } = await import('@/services/stream-token');

                const userName = user.user_metadata?.display_name || user.email || 'Utilisateur';
                const userImage = user.user_metadata?.avatar_url;

                const tokenData = await generateStreamToken({
                    userId: user.id,
                    userName,
                    userImage,
                });

                await callsModule.current.initializeStreamClient(
                    {
                        id: user.id,
                        name: userName,
                        image: userImage,
                    },
                    tokenData.token
                );

                clientInitialized.current = true;
                console.log('[useCallsSafe] Stream client initialized');
            } catch (err) {
                console.error('[useCallsSafe] Error initializing Stream client:', err);
                setError('Impossible d\'initialiser le client vidéo');
            }
        }

        initClient();

        return () => {
            if (callsModule.current) {
                callsModule.current.disconnectStreamClient();
            }
            clientInitialized.current = false;
        };
    }, [isAvailable, user]);

    const initiateCall = useCallback(async (recipientId: string, isVideo = true): Promise<any | null> => {
        if (!isAvailable || !callsModule.current) {
            setError('Les appels ne sont pas disponibles dans Expo Go');
            return null;
        }

        setIsConnecting(true);
        setError(null);

        try {
            const newCallId = callsModule.current.generateCallId();
            // 'default' = video call, 'audio' = audio only
            const callType = isVideo ? 'default' : 'audio';
            const newCall = await callsModule.current.createCall(newCallId, callType, [recipientId]);

            setCall(newCall);
            setCallId(newCallId);
            setIsActive(true);

            return newCall;
        } catch (err: any) {
            console.error('[useCallsSafe] Error initiating call:', err);
            setError(err.message || 'Erreur lors de l\'initiation de l\'appel');
            return null;
        } finally {
            setIsConnecting(false);
        }
    }, [isAvailable]);

    const joinCall = useCallback(async (callIdToJoin: string, options?: CallOptions): Promise<void> => {
        if (!isAvailable || !callsModule.current) {
            setError('Les appels ne sont pas disponibles dans Expo Go');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            // First get or create the call object
            const callToJoin = await callsModule.current.getCall(callIdToJoin, 'default');
            if (!callToJoin) {
                throw new Error('Appel introuvable');
            }

            // Join with the Call object
            await callsModule.current.joinCall(callToJoin, options);

            setCall(callToJoin);
            setCallId(callIdToJoin);
            setIsActive(true);
            setIsCameraOn(options?.videoEnabled ?? true);
            setIsMicOn(options?.audioEnabled ?? true);
        } catch (err: any) {
            console.error('[useCallsSafe] Error joining call:', err);
            setError(err.message || 'Erreur lors de la connexion à l\'appel');
        } finally {
            setIsConnecting(false);
        }
    }, [isAvailable]);

    const leaveCallFn = useCallback(async (): Promise<void> => {
        if (!callsModule.current || !call) return;

        try {
            await callsModule.current.leaveCall(call);
            setCall(null);
            setCallId(null);
            setIsActive(false);
            setParticipants([]);
        } catch (err: any) {
            console.error('[useCallsSafe] Error leaving call:', err);
        }
    }, [call]);

    const endCallFn = useCallback(async (): Promise<void> => {
        if (!callsModule.current || !call) return;

        try {
            await callsModule.current.endCall(call);
            setCall(null);
            setCallId(null);
            setIsActive(false);
            setParticipants([]);
        } catch (err: any) {
            console.error('[useCallsSafe] Error ending call:', err);
        }
    }, [call]);

    const toggleMic = useCallback(async (): Promise<void> => {
        if (!callsModule.current || !call) return;

        try {
            await callsModule.current.toggleMicrophone(call);
            setIsMicOn(prev => !prev);
        } catch (err: any) {
            console.error('[useCallsSafe] Error toggling mic:', err);
        }
    }, [call]);

    const toggleCam = useCallback(async (): Promise<void> => {
        if (!callsModule.current || !call) return;

        try {
            await callsModule.current.toggleCamera(call);
            setIsCameraOn(prev => !prev);
        } catch (err: any) {
            console.error('[useCallsSafe] Error toggling camera:', err);
        }
    }, [call]);

    const flipCam = useCallback(async (): Promise<void> => {
        if (!callsModule.current || !call) return;

        try {
            await callsModule.current.flipCamera(call);
        } catch (err: any) {
            console.error('[useCallsSafe] Error flipping camera:', err);
        }
    }, [call]);

    return {
        isAvailable,
        isChecking,
        call,
        callId,
        participants,
        isActive,
        isMicOn,
        isCameraOn,
        isConnecting,
        error,
        initiateCall,
        joinCall,
        leaveCall: leaveCallFn,
        endCall: endCallFn,
        toggleMic,
        toggleCam,
        flipCam,
    };
}
