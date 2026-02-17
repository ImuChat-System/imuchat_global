/**
 * Hook React pour les appels vidéo/audio avec Stream Video sur mobile
 * 
 * Usage:
 * ```tsx
 * const { 
 *   call, 
 *   initiateCall, 
 *   joinCall, 
 *   endCall,
 *   toggleMic,
 *   toggleCamera 
 * } = useCalls();
 * ```
 */

import {
    createCall,
    disconnectStreamClient,
    endCall as endCallService,
    flipCamera,
    generateCallId,
    getParticipants,
    initializeStreamClient,
    isCallActive,
    joinCall as joinCallService,
    leaveCall,
    toggleCamera,
    toggleMicrophone,
    type CallOptions,
    type CallParticipant,
} from '@/services/calls';
import { generateStreamToken } from '@/services/stream-token';
import type { Call } from '@stream-io/video-react-native-sdk';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

export interface UseCallsReturn {
    /** Appel en cours */
    call: Call | null;
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
    initiateCall: (recipientId: string, isVideo?: boolean) => Promise<Call | null>;
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
 * Hook pour gérer les appels vidéo/audio
 */
export function useCalls(): UseCallsReturn {
    const { user } = useAuth();
    const [call, setCall] = useState<Call | null>(null);
    const [callId, setCallId] = useState<string | null>(null);
    const [participants, setParticipants] = useState<CallParticipant[]>([]);
    const [isActive, setIsActive] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const clientInitialized = useRef(false);

    // Initialiser le client Stream
    useEffect(() => {
        if (!user || clientInitialized.current) return;

        async function initClient() {
            if (!user) return;

            try {
                // Récupérer le token Stream depuis le backend platform-core
                const userName = user.user_metadata?.display_name || user.email || 'Utilisateur';
                const userImage = user.user_metadata?.avatar_url;

                const tokenData = await generateStreamToken({
                    userId: user.id,
                    userName,
                    userImage,
                });

                await initializeStreamClient(
                    {
                        id: user.id,
                        name: userName,
                        image: userImage,
                    },
                    tokenData.token
                );

                clientInitialized.current = true;
                console.log('✅ Client Stream initialisé avec token backend');
            } catch (err) {
                console.error('❌ Erreur lors de l\'initialisation du client Stream:', err);
                setError('Impossible d\'initialiser le client vidéo');
            }
        }

        initClient();

        return () => {
            disconnectStreamClient();
            clientInitialized.current = false;
        };
    }, [user]);

    // Mettre à jour les participants quand l'appel change
    useEffect(() => {
        if (!call) {
            setParticipants([]);
            return;
        }

        // Observer les changements de participants
        const updateParticipants = () => {
            const currentParticipants = getParticipants(call);
            setParticipants(currentParticipants);
            setIsActive(isCallActive(call));
        };

        // Mise à jour initiale
        updateParticipants();

        // Observer les changements
        const interval = setInterval(updateParticipants, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [call]);

    // Initier un appel
    const initiateCall = useCallback(async (
        recipientId: string,
        isVideo: boolean = true
    ): Promise<Call | null> => {
        if (!user) {
            setError('Utilisateur non connecté');
            return null;
        }

        try {
            setIsConnecting(true);
            setError(null);

            const newCallId = generateCallId();
            const callType = isVideo ? 'default' : 'audio';

            const newCall = await createCall(
                newCallId,
                callType,
                [user.id, recipientId]
            );

            if (newCall) {
                await joinCallService(newCall, {
                    videoEnabled: isVideo,
                    audioEnabled: true,
                });

                setCall(newCall);
                setCallId(newCallId);
                setIsCameraOn(isVideo);
                setIsMicOn(true);
            }

            return newCall;
        } catch (err) {
            console.error('Erreur lors de l\'initiation de l\'appel:', err);
            setError('Impossible de démarrer l\'appel');
            return null;
        } finally {
            setIsConnecting(false);
        }
    }, [user]);

    // Rejoindre un appel
    const joinCall = useCallback(async (
        incomingCallId: string,
        options: CallOptions = {}
    ): Promise<void> => {
        if (!user) {
            setError('Utilisateur non connecté');
            return;
        }

        try {
            setIsConnecting(true);
            setError(null);

            // Récupérer l'appel existant
            // const existingCall = getCall(incomingCallId);
            // Note: getCall nécessite le type d'appel, qui n'est pas disponible ici
            // Il faudrait stocker cette info ailleurs ou la passer en paramètre

            // Pour le moment, on crée un nouvel appel
            const callType = options.videoEnabled !== false ? 'default' : 'audio';
            const newCall = await createCall(incomingCallId, callType, [user.id]);

            if (newCall) {
                await joinCallService(newCall, options);

                setCall(newCall);
                setCallId(incomingCallId);
                setIsCameraOn(options.videoEnabled !== false);
                setIsMicOn(options.audioEnabled !== false);
            }
        } catch (err) {
            console.error('Erreur lors de la connexion à l\'appel:', err);
            setError('Impossible de rejoindre l\'appel');
        } finally {
            setIsConnecting(false);
        }
    }, [user]);

    // Quitter l'appel
    const leaveCallHandler = useCallback(async (): Promise<void> => {
        if (!call) return;

        try {
            await leaveCall(call);
            setCall(null);
            setCallId(null);
            setParticipants([]);
            setIsActive(false);
        } catch (err) {
            console.error('Erreur lors de la déconnexion de l\'appel:', err);
            setError('Impossible de quitter l\'appel');
        }
    }, [call]);

    // Terminer l'appel
    const endCallHandler = useCallback(async (): Promise<void> => {
        if (!call) return;

        try {
            await endCallService(call);
            setCall(null);
            setCallId(null);
            setParticipants([]);
            setIsActive(false);
        } catch (err) {
            console.error('Erreur lors de la fin de l\'appel:', err);
            setError('Impossible de terminer l\'appel');
        }
    }, [call]);

    // Toggle microphone
    const toggleMic = useCallback(async (): Promise<void> => {
        if (!call) return;

        try {
            await toggleMicrophone(call);
            setIsMicOn(!isMicOn);
        } catch (err) {
            console.error('Erreur lors du toggle du microphone:', err);
            setError('Impossible de changer l\'état du microphone');
        }
    }, [call, isMicOn]);

    // Toggle caméra
    const toggleCam = useCallback(async (): Promise<void> => {
        if (!call) return;

        try {
            await toggleCamera(call);
            setIsCameraOn(!isCameraOn);
        } catch (err) {
            console.error('Erreur lors du toggle de la caméra:', err);
            setError('Impossible de changer l\'état de la caméra');
        }
    }, [call, isCameraOn]);

    // Changer de caméra
    const flipCam = useCallback(async (): Promise<void> => {
        if (!call) return;

        try {
            await flipCamera(call);
        } catch (err) {
            console.error('Erreur lors du changement de caméra:', err);
            setError('Impossible de changer de caméra');
        }
    }, [call]);

    return {
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
        leaveCall: leaveCallHandler,
        endCall: endCallHandler,
        toggleMic,
        toggleCam,
        flipCam,
    };
}
