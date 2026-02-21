/**
 * ImuChat Mobile — Offline Message Queue (AsyncStorage)
 * 
 * Persiste les messages en attente dans AsyncStorage pour survivre
 * à la fermeture de l'app.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'imuchat-offline-queue';
const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

export interface PendingMessage {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    conversationId: string;
    type: 'text' | 'image' | 'file';
    replyToId?: string;
    mediaUrl?: string;
    mediaType?: string;
    queuedAt: number;
}

// ─── Storage Operations ────────────────────────────────────

/** Get all pending messages from storage */
async function getAllPendingMessages(): Promise<PendingMessage[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data) as PendingMessage[];
    } catch (err) {
        console.warn('[OfflineQueue] Failed to read storage:', err);
        return [];
    }
}

/** Save all pending messages to storage */
async function savePendingMessages(messages: PendingMessage[]): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (err) {
        console.warn('[OfflineQueue] Failed to write storage:', err);
    }
}

// ─── CRUD Operations ────────────────────────────────────────

/** Add a message to the persistent queue */
export async function addPendingMessage(message: PendingMessage): Promise<void> {
    const messages = await getAllPendingMessages();
    // Avoid duplicates
    const filtered = messages.filter((m) => m.id !== message.id);
    filtered.push(message);
    await savePendingMessages(filtered);
    console.log('[OfflineQueue] Message queued:', message.id);
}

/** Get all non-expired pending messages */
export async function getPendingMessages(): Promise<PendingMessage[]> {
    const messages = await getAllPendingMessages();
    const now = Date.now();
    return messages.filter((msg) => now - msg.queuedAt < MAX_AGE_MS);
}

/** Get pending messages for a specific conversation */
export async function getPendingMessagesForConversation(
    conversationId: string
): Promise<PendingMessage[]> {
    const messages = await getPendingMessages();
    return messages.filter((msg) => msg.conversationId === conversationId);
}

/** Remove a successfully sent message */
export async function removePendingMessage(id: string): Promise<void> {
    const messages = await getAllPendingMessages();
    const filtered = messages.filter((m) => m.id !== id);
    await savePendingMessages(filtered);
    console.log('[OfflineQueue] Message removed:', id);
}

/** Clean all expired messages */
export async function cleanExpiredMessages(): Promise<number> {
    const messages = await getAllPendingMessages();
    const now = Date.now();
    const valid = messages.filter((msg) => now - msg.queuedAt < MAX_AGE_MS);
    const cleaned = messages.length - valid.length;

    if (cleaned > 0) {
        await savePendingMessages(valid);
        console.log('[OfflineQueue] Cleaned', cleaned, 'expired messages');
    }

    return cleaned;
}

/** Clear all pending messages */
export async function clearAllPendingMessages(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('[OfflineQueue] Queue cleared');
}

/** Get count of pending messages */
export async function getPendingCount(): Promise<number> {
    const messages = await getPendingMessages();
    return messages.length;
}

/** Check if there are any pending messages */
export async function hasPendingMessages(): Promise<boolean> {
    const count = await getPendingCount();
    return count > 0;
}
