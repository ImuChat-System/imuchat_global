/**
 * useTypingIndicator Hook - Mobile
 * Gère l'envoi et la réception des indicateurs de frappe via Supabase Realtime
 */

import { supabase } from "@/services/supabase";
import { useCallback, useEffect, useRef, useState } from "react";

export interface TypingUser {
    userId: string;
    userName: string;
    timestamp: number;
}

export interface UseTypingIndicatorOptions {
    /** ID de la conversation */
    conversationId: string;
    /** ID de l'utilisateur courant */
    currentUserId: string;
    /** Nom de l'utilisateur courant */
    currentUserName: string;
    /** Timeout après lequel le typing est considéré inactif (défaut: 5000ms) */
    typingTimeout?: number;
    /** Délai de debounce pour éviter le spam (défaut: 300ms) */
    debounceDelay?: number;
}

export interface UseTypingIndicatorReturn {
    /** Liste des utilisateurs en train d'écrire */
    typingUsers: TypingUser[];
    /** Noms des utilisateurs en train d'écrire (pour le composant) */
    typingUserNames: string[];
    /** Envoie un événement de frappe */
    sendTypingEvent: () => void;
    /** Arrête l'indicateur de frappe */
    stopTyping: () => void;
    /** Indique si le hook est connecté */
    isConnected: boolean;
}

export function useTypingIndicator(
    options: UseTypingIndicatorOptions
): UseTypingIndicatorReturn {
    const {
        conversationId,
        currentUserId,
        currentUserName,
        typingTimeout = 5000,
        debounceDelay = 300,
    } = options;

    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    // Refs pour les timers
    const debounceTimerRef = useRef<number | null>(null);
    const cleanupTimersRef = useRef<Map<string, number>>(new Map());
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const lastTypingEventRef = useRef<number>(0);

    // Nettoyer les utilisateurs inactifs
    const cleanupInactiveUsers = useCallback(() => {
        const now = Date.now();
        setTypingUsers((prev) =>
            prev.filter((user) => now - user.timestamp < typingTimeout)
        );
    }, [typingTimeout]);

    // Setup du channel Supabase Realtime
    useEffect(() => {
        if (!conversationId) return;

        const channelName = `typing:${conversationId}`;
        const channel = supabase.channel(channelName);

        channel
            .on("broadcast", { event: "typing" }, (payload) => {
                const { userId, userName, timestamp } = payload.payload as {
                    userId: string;
                    userName: string;
                    timestamp: number;
                };

                // Ignorer ses propres événements
                if (userId === currentUserId) return;

                setTypingUsers((prev) => {
                    // Mise à jour ou ajout de l'utilisateur
                    const existingIndex = prev.findIndex((u) => u.userId === userId);
                    if (existingIndex >= 0) {
                        const updated = [...prev];
                        updated[existingIndex] = { userId, userName, timestamp };
                        return updated;
                    }
                    return [...prev, { userId, userName, timestamp }];
                });

                // Configurer le timeout de cleanup pour cet utilisateur
                const existingTimer = cleanupTimersRef.current.get(userId);
                if (existingTimer) {
                    clearTimeout(existingTimer);
                }

                const timer = setTimeout(() => {
                    setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
                    cleanupTimersRef.current.delete(userId);
                }, typingTimeout) as unknown as number;

                cleanupTimersRef.current.set(userId, timer);
            })
            .on("broadcast", { event: "stop_typing" }, (payload) => {
                const { userId } = payload.payload as { userId: string };

                // Retirer l'utilisateur immédiatement
                setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));

                const existingTimer = cleanupTimersRef.current.get(userId);
                if (existingTimer) {
                    clearTimeout(existingTimer);
                    cleanupTimersRef.current.delete(userId);
                }
            })
            .subscribe((status) => {
                setIsConnected(status === "SUBSCRIBED");
            });

        channelRef.current = channel;

        // Cleanup
        return () => {
            channel.unsubscribe();
            channelRef.current = null;

            // Nettoyer tous les timers
            cleanupTimersRef.current.forEach((timer) => clearTimeout(timer));
            cleanupTimersRef.current.clear();

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [conversationId, currentUserId, typingTimeout]);

    // Envoyer un événement typing (avec debounce)
    const sendTypingEvent = useCallback(() => {
        const now = Date.now();

        // Debounce: ne pas envoyer si dernier envoi était il y a moins de debounceDelay
        if (now - lastTypingEventRef.current < debounceDelay) {
            return;
        }

        lastTypingEventRef.current = now;

        if (channelRef.current) {
            channelRef.current.send({
                type: "broadcast",
                event: "typing",
                payload: {
                    userId: currentUserId,
                    userName: currentUserName,
                    timestamp: now,
                },
            });
        }
    }, [currentUserId, currentUserName, debounceDelay]);

    // Arrêter le typing
    const stopTyping = useCallback(() => {
        if (channelRef.current) {
            channelRef.current.send({
                type: "broadcast",
                event: "stop_typing",
                payload: {
                    userId: currentUserId,
                },
            });
        }
    }, [currentUserId]);

    // Extraire les noms pour le composant
    const typingUserNames = typingUsers
        .filter((u) => u.userId !== currentUserId)
        .map((u) => u.userName);

    return {
        typingUsers,
        typingUserNames,
        sendTypingEvent,
        stopTyping,
        isConnected,
    };
}

export default useTypingIndicator;
