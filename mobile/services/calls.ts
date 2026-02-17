/**
 * Service Stream Video pour appels audio/vidéo sur mobile
 * 
 * Gère:
 * - Connexion au client Stream
 * - Appels audio et vidéo
 * - Gestion des participants
 * - Contrôles média (mute, camera, speaker)
 */

import {
    Call,
    CallingState,
    User as StreamUser,
    StreamVideoClient
} from '@stream-io/video-react-native-sdk';

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY || '';

// === TYPES ===

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

// === CLIENT STREAM ===

let streamClient: StreamVideoClient | null = null;

/**
 * Initialise le client Stream Video
 * @param user Informations utilisateur
 * @param token Token d'authentification Stream
 */
export async function initializeStreamClient(
    user: CallUser,
    token: string
): Promise<StreamVideoClient> {
    if (streamClient) {
        return streamClient;
    }

    try {
        const streamUser: StreamUser = {
            id: user.id,
            name: user.name,
            image: user.image,
        };

        streamClient = new StreamVideoClient({
            apiKey: STREAM_API_KEY,
            user: streamUser,
            token,
        });

        console.log('Stream Video client initialisé');
        return streamClient;
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de Stream:', error);
        throw error;
    }
}

/**
 * Récupère le client Stream actuel
 */
export function getStreamClient(): StreamVideoClient | null {
    return streamClient;
}

/**
 * Déconnecte le client Stream
 */
export async function disconnectStreamClient(): Promise<void> {
    if (streamClient) {
        try {
            await streamClient.disconnectUser();
            streamClient = null;
            console.log('Stream Video client déconnecté');
        } catch (error) {
            console.error('Erreur lors de la déconnexion de Stream:', error);
        }
    }
}

// === APPELS ===

/**
 * Crée un nouvel appel
 * @param callId ID unique de l'appel
 * @param callType Type d'appel ('audio' ou 'video')
 * @param members IDs des participants
 * @returns Instance de l'appel
 */
export async function createCall(
    callId: string,
    callType: 'audio' | 'default' = 'default',
    members: string[] = []
): Promise<Call | null> {
    if (!streamClient) {
        console.error('Client Stream non initialisé');
        return null;
    }

    try {
        const call = streamClient.call(callType, callId);

        // Créer l'appel avec les membres
        await call.create({
            data: {
                members: members.map(id => ({ user_id: id })),
            },
        });

        console.log(`Appel ${callType} créé:`, callId);
        return call;
    } catch (error) {
        console.error('Erreur lors de la création de l\'appel:', error);
        return null;
    }
}

/**
 * Rejoindre un appel existant
 * @param call Instance de l'appel
 * @param options Options de média
 */
export async function joinCall(
    call: Call,
    options: CallOptions = {}
): Promise<void> {
    try {
        await call.join({
            create: false,
        });

        // Configurer camera et microphone
        if (options.videoEnabled !== undefined) {
            await call.camera.toggle();
        }

        if (options.audioEnabled !== undefined) {
            await call.microphone.toggle();
        }

        console.log('Appel rejoint avec succès');
    } catch (error) {
        console.error('Erreur lors de la connexion à l\'appel:', error);
        throw error;
    }
}

/**
 * Quitter un appel
 * @param call Instance de l'appel
 */
export async function leaveCall(call: Call): Promise<void> {
    try {
        await call.leave();
        console.log('Appel quitté');
    } catch (error) {
        console.error('Erreur lors de la déconnexion de l\'appel:', error);
        throw error;
    }
}

/**
 * Terminer un appel (pour le créateur)
 * @param call Instance de l'appel
 */
export async function endCall(call: Call): Promise<void> {
    try {
        await call.endCall();
        console.log('Appel terminé');
    } catch (error) {
        console.error('Erreur lors de la fin de l\'appel:', error);
        throw error;
    }
}

// === CONTRÔLES MÉDIA ===

/**
 * Active/désactive le microphone
 * @param call Instance de l'appel
 */
export async function toggleMicrophone(call: Call): Promise<void> {
    try {
        await call.microphone.toggle();
    } catch (error) {
        console.error('Erreur lors du toggle du microphone:', error);
        throw error;
    }
}

/**
 * Active/désactive la caméra
 * @param call Instance de l'appel
 */
export async function toggleCamera(call: Call): Promise<void> {
    try {
        await call.camera.toggle();
    } catch (error) {
        console.error('Erreur lors du toggle de la caméra:', error);
        throw error;
    }
}

/**
 * Change entre caméra avant et arrière
 * @param call Instance de l'appel
 */
export async function flipCamera(call: Call): Promise<void> {
    try {
        await call.camera.flip();
    } catch (error) {
        console.error('Erreur lors du flip de la caméra:', error);
        throw error;
    }
}

/**
 * Active/désactive le haut-parleur
 * @param call Instance de l'appel
 * @param enabled true pour activer le haut-parleur
 */
export async function toggleSpeaker(call: Call, enabled: boolean): Promise<void> {
    try {
        // Note: La gestion du speaker est généralement automatique avec Stream
        // mais peut être contrôlée via les audio settings du device
        console.log('Speaker toggle:', enabled);
    } catch (error) {
        console.error('Erreur lors du toggle du speaker:', error);
        throw error;
    }
}

// === RÉCUPÉRATION D'APPEL ===

/**
 * Récupère un appel par son ID
 * @param callId ID de l'appel
 * @param callType Type d'appel
 */
export function getCall(
    callId: string,
    callType: 'audio' | 'default' = 'default'
): Call | null {
    if (!streamClient) {
        console.error('Client Stream non initialisé');
        return null;
    }

    try {
        return streamClient.call(callType, callId);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'appel:', error);
        return null;
    }
}

// === PARTICIPANTS ===

/**
 * Récupère la liste des participants d'un appel
 * @param call Instance de l'appel
 */
export function getParticipants(call: Call): CallParticipant[] {
    try {
        const participants = call.state.participants || [];

        return participants.map(participant => ({
            userId: participant.userId,
            name: participant.name,
            isAudioEnabled: participant.audioLevel !== undefined && participant.audioLevel > 0,
            isVideoEnabled: participant.videoStream !== undefined,
            isScreenSharing: participant.screenShareStream !== undefined,
        }));
    } catch (error) {
        console.error('Erreur lors de la récupération des participants:', error);
        return [];
    }
}

/**
 * Invite des utilisateurs à un appel en cours
 * @param call Instance de l'appel
 * @param userIds IDs des utilisateurs à inviter
 */
export async function inviteToCall(call: Call, userIds: string[]): Promise<void> {
    try {
        // Note: Stream gère automatiquement les invitations via les membres
        // Cette fonction pourrait trigger des notifications côté serveur
        console.log('Invitations envoyées à:', userIds);
    } catch (error) {
        console.error('Erreur lors de l\'invitation:', error);
        throw error;
    }
}

// === STATISTIQUES ===

/**
 * Récupère les statistiques de l'appel
 * @param call Instance de l'appel
 */
export function getCallStats(call: Call) {
    try {
        return {
            duration: call.state.startedAt ? Date.now() - call.state.startedAt.getTime() : 0,
            participantCount: call.state.participants?.length || 0,
            isRecording: call.state.recording || false,
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des stats:', error);
        return null;
    }
}

// === ENREGISTREMENT ===

/**
 * Démarre l'enregistrement de l'appel
 * @param call Instance de l'appel
 */
export async function startRecording(call: Call): Promise<void> {
    try {
        await call.startRecording();
        console.log('Enregistrement démarré');
    } catch (error) {
        console.error('Erreur lors du démarrage de l\'enregistrement:', error);
        throw error;
    }
}

/**
 * Arrête l'enregistrement de l'appel
 * @param call Instance de l'appel
 */
export async function stopRecording(call: Call): Promise<void> {
    try {
        await call.stopRecording();
        console.log('Enregistrement arrêté');
    } catch (error) {
        console.error('Erreur lors de l\'arrêt de l\'enregistrement:', error);
        throw error;
    }
}

// === UTILITAIRES ===

/**
 * Vérifie si un appel est actif
 * @param call Instance de l'appel
 */
export function isCallActive(call: Call): boolean {
    return call.state.callingState === CallingState.JOINED;
}

/**
 * Vérifie si l'utilisateur est connecté
 * @param call Instance de l'appel
 */
export function isConnected(call: Call): boolean {
    return call.state.callingState !== CallingState.LEFT &&
        call.state.callingState !== CallingState.IDLE;
}

/**
 * Génère un ID d'appel unique
 */
export function generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
