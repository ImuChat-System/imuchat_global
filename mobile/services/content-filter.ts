/**
 * Content Filter Service — Auto-modération groupes
 *
 * Filtre de contenu local (on-device) pour analyse temps réel des messages.
 * Détecte : mots interdits, spam, flood, liens non autorisés, propos haineux.
 * Inspiré de platform-core/ModerationModule.ts, adapté pour mobile.
 *
 * Phase 3 — Groupe 9 fonc. #4 : Détection spam / toxicité
 */

import { createLogger } from '@/services/logger';
import type {
    ContentAnalysisResult,
    ContentViolation,
    ModerationBotConfig,
    UserMessageTracker,
} from '@/types/bots';
import {
    ContentViolationType,
    ModerationAction,
} from '@/types/bots';

const logger = createLogger('ContentFilter');

// ============================================================================
// PATTERNS DE DÉTECTION (miroir de platform-core/ModerationModule.ts)
// ============================================================================

/** Patterns regex pour la détection de propos toxiques (multi-langue) */
const PROFANITY_PATTERNS: RegExp[] = [
    // Français
    /\b(merde|putain|connard|salaud|enculé|bordel|foutre|nique|batard|pute)\b/i,
    // English
    /\b(fuck|shit|ass|damn|bitch|bastard|crap|dick|cunt)\b/i,
    // Japonais (katakana courants)
    /(クソ|バカ|アホ|死ね|くそ|ばか|あほ)/,
];

/** Patterns pour la détection de discours haineux */
const HATE_SPEECH_PATTERNS: RegExp[] = [
    /\b(nazis?|supremacist|genocide|ethnic\s*cleansing)\b/i,
    /\b(kill\s+all|death\s+to|exterminate)\b/i,
];

/** Pattern pour détecter des URLs */
const URL_PATTERN = /https?:\/\/[^\s]+|www\.[^\s]+/gi;

// ============================================================================
// TRACKING DES UTILISATEURS (en mémoire pour spam/flood)
// ============================================================================

/** Cache mémoire des messages par utilisateur+conversation */
const userTrackers: Map<string, UserMessageTracker> = new Map();

/** Durée de vie du tracking (5 minutes) */
const TRACKER_TTL_MS = 5 * 60 * 1000;

/**
 * Obtenir ou créer un tracker pour un utilisateur dans une conversation
 */
function getTracker(userId: string, conversationId: string): UserMessageTracker {
    const key = `${conversationId}:${userId}`;
    let tracker = userTrackers.get(key);
    if (!tracker) {
        tracker = {
            timestamps: [],
            recentContents: [],
            warningCount: 0,
        };
        userTrackers.set(key, tracker);
    }
    return tracker;
}

/**
 * Enregistrer un message pour le tracking spam/flood
 */
function recordMessage(userId: string, conversationId: string, content: string): void {
    const tracker = getTracker(userId, conversationId);
    const now = Date.now();

    // Nettoyer les anciens timestamps (garder seulement les 5 dernières minutes)
    tracker.timestamps = tracker.timestamps.filter(t => now - t < TRACKER_TTL_MS);
    tracker.timestamps.push(now);

    // Garder les 20 derniers contenus pour détection de flood
    tracker.recentContents.push(content.trim().toLowerCase());
    if (tracker.recentContents.length > 20) {
        tracker.recentContents = tracker.recentContents.slice(-20);
    }
}

/**
 * Incrémenter le compteur d'avertissements d'un utilisateur
 */
export function incrementWarnings(userId: string, conversationId: string): number {
    const tracker = getTracker(userId, conversationId);
    tracker.warningCount += 1;
    return tracker.warningCount;
}

/**
 * Obtenir le nombre d'avertissements d'un utilisateur
 */
export function getWarningCount(userId: string, conversationId: string): number {
    return getTracker(userId, conversationId).warningCount;
}

/**
 * Réinitialiser les avertissements d'un utilisateur
 */
export function resetWarnings(userId: string, conversationId: string): void {
    const tracker = getTracker(userId, conversationId);
    tracker.warningCount = 0;
}

/**
 * Nettoyer les trackers expirés (appel périodique)
 */
export function cleanupTrackers(): void {
    const now = Date.now();
    for (const [key, tracker] of userTrackers.entries()) {
        const lastActivity = tracker.timestamps[tracker.timestamps.length - 1] ?? 0;
        if (now - lastActivity > TRACKER_TTL_MS * 2) {
            userTrackers.delete(key);
        }
    }
}

// ============================================================================
// FONCTIONS DE DÉTECTION
// ============================================================================

/**
 * Vérifier les mots interdits (wordFilter)
 */
export function checkProfanity(content: string, bannedWords: string[]): ContentViolation | null {
    const lowerContent = content.toLowerCase();

    // 1. Vérifier les mots personnalisés (bannedWords)
    const matchedCustom: string[] = [];
    for (const word of bannedWords) {
        if (word.trim() === '') continue;
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(lowerContent)) {
            matchedCustom.push(word);
        }
    }

    if (matchedCustom.length > 0) {
        return {
            type: ContentViolationType.CUSTOM_WORD,
            severity: 3,
            matchedPatterns: matchedCustom,
            message: `Mot(s) interdit(s) détecté(s) : ${matchedCustom.join(', ')}`,
        };
    }

    // 2. Vérifier les patterns de profanité intégrés
    const matchedProfanity: string[] = [];
    for (const pattern of PROFANITY_PATTERNS) {
        const match = content.match(pattern);
        if (match) {
            matchedProfanity.push(match[0]);
        }
    }

    if (matchedProfanity.length > 0) {
        return {
            type: ContentViolationType.PROFANITY,
            severity: 2,
            matchedPatterns: matchedProfanity,
            message: `Langage inapproprié détecté`,
        };
    }

    return null;
}

/**
 * Vérifier le discours haineux
 */
export function checkHateSpeech(content: string): ContentViolation | null {
    const matched: string[] = [];
    for (const pattern of HATE_SPEECH_PATTERNS) {
        const match = content.match(pattern);
        if (match) {
            matched.push(match[0]);
        }
    }

    if (matched.length > 0) {
        return {
            type: ContentViolationType.HATE_SPEECH,
            severity: 5,
            matchedPatterns: matched,
            message: `Discours haineux détecté`,
        };
    }

    return null;
}

/**
 * Vérifier le spam (trop de messages par minute)
 */
export function checkSpam(
    userId: string,
    conversationId: string,
    spamLimitPerMinute: number,
): ContentViolation | null {
    const tracker = getTracker(userId, conversationId);
    const now = Date.now();
    const oneMinuteAgo = now - 60_000;

    const recentCount = tracker.timestamps.filter(t => t >= oneMinuteAgo).length;

    if (recentCount >= spamLimitPerMinute) {
        return {
            type: ContentViolationType.SPAM,
            severity: 3,
            matchedPatterns: [`${recentCount} messages/min (limite: ${spamLimitPerMinute})`],
            message: `Spam détecté : ${recentCount} messages en 1 minute (limite : ${spamLimitPerMinute})`,
        };
    }

    return null;
}

/**
 * Vérifier le flood (messages identiques répétés)
 */
export function checkFlood(
    content: string,
    userId: string,
    conversationId: string,
    floodThreshold: number,
): ContentViolation | null {
    const tracker = getTracker(userId, conversationId);
    const normalizedContent = content.trim().toLowerCase();

    // Compter les occurrences du même message dans l'historique récent
    const duplicateCount = tracker.recentContents.filter(c => c === normalizedContent).length;

    if (duplicateCount >= floodThreshold) {
        return {
            type: ContentViolationType.FLOOD,
            severity: 2,
            matchedPatterns: [`"${content.slice(0, 50)}..." ×${duplicateCount + 1}`],
            message: `Flood détecté : message identique envoyé ${duplicateCount + 1} fois`,
        };
    }

    return null;
}

/**
 * Vérifier les liens non autorisés
 */
export function checkLinks(content: string, allowedDomains: string[]): ContentViolation | null {
    const urls = content.match(URL_PATTERN);
    if (!urls || urls.length === 0) return null;

    // Si aucun domaine autorisé, tous les liens sont bloqués
    if (allowedDomains.length === 0) {
        return {
            type: ContentViolationType.LINK,
            severity: 2,
            matchedPatterns: urls,
            message: `Lien(s) non autorisé(s) détecté(s)`,
        };
    }

    // Vérifier chaque URL contre la whitelist
    const blockedUrls: string[] = [];
    for (const url of urls) {
        const isAllowed = allowedDomains.some(domain => {
            try {
                const urlObj = new URL(url.startsWith('www.') ? `https://${url}` : url);
                return urlObj.hostname.endsWith(domain);
            } catch {
                return false;
            }
        });
        if (!isAllowed) {
            blockedUrls.push(url);
        }
    }

    if (blockedUrls.length > 0) {
        return {
            type: ContentViolationType.LINK,
            severity: 2,
            matchedPatterns: blockedUrls,
            message: `Lien(s) non autorisé(s) : ${blockedUrls.join(', ')}`,
        };
    }

    return null;
}

// ============================================================================
// ANALYSE PRINCIPALE
// ============================================================================

/**
 * Déterminer la sévérité la plus haute parmi les violations
 */
function getMaxSeverity(violations: ContentViolation[]): number {
    return violations.reduce((max, v) => Math.max(max, v.severity), 0);
}

/**
 * Calculer le score de risque à partir des violations (0-100)
 */
function calculateScore(violations: ContentViolation[]): number {
    if (violations.length === 0) return 0;
    // Pondération par sévérité : severity 1=10pts, 2=20pts, 3=35pts, 4=50pts, 5=70pts
    const weights: Record<number, number> = { 1: 10, 2: 20, 3: 35, 4: 50, 5: 70 };
    const total = violations.reduce((sum, v) => sum + (weights[v.severity] ?? 10), 0);
    return Math.min(100, total);
}

/**
 * Déterminer l'action suggérée en fonction du score et de la config
 */
function determineAction(
    score: number,
    violations: ContentViolation[],
    config: ModerationBotConfig,
): ModerationAction | null {
    if (score === 0) return null;

    // Chercher l'action la plus sévère parmi les violations détectées
    for (const violation of violations) {
        switch (violation.type) {
            case ContentViolationType.CUSTOM_WORD:
            case ContentViolationType.PROFANITY:
                return config.wordFilterAction;
            case ContentViolationType.LINK:
                return config.linkFilterAction;
            case ContentViolationType.SPAM:
                return config.spamAction;
            case ContentViolationType.FLOOD:
                return config.spamAction;
            case ContentViolationType.HATE_SPEECH:
                return ModerationAction.BAN; // Toujours sévère
            case ContentViolationType.HARASSMENT:
                return ModerationAction.WARN;
        }
    }

    // Fallback basé sur le score
    if (score >= 70) return ModerationAction.BAN;
    if (score >= 50) return ModerationAction.MUTE;
    if (score >= 30) return ModerationAction.WARN;
    return ModerationAction.FLAG;
}

/**
 * Analyser un message avec la configuration de modération donnée.
 *
 * Fonction principale du filtre de contenu local.
 * Exécute tous les checks activés et retourne un résultat agrégé.
 *
 * @param content - Texte du message
 * @param config - Configuration de modération du groupe
 * @param userId - ID de l'utilisateur émetteur
 * @param conversationId - ID de la conversation/groupe
 * @returns ContentAnalysisResult avec violations, score, et action suggérée
 */
export function analyzeMessage(
    content: string,
    config: ModerationBotConfig,
    userId: string,
    conversationId: string,
): ContentAnalysisResult {
    const violations: ContentViolation[] = [];

    try {
        // 1. Enregistrer le message pour le tracking
        recordMessage(userId, conversationId, content);

        // 2. Filtre de mots (si activé)
        if (config.wordFilterEnabled) {
            const profanityResult = checkProfanity(content, config.bannedWords);
            if (profanityResult) violations.push(profanityResult);
        }

        // 3. Détection de discours haineux (toujours actif)
        const hateSpeechResult = checkHateSpeech(content);
        if (hateSpeechResult) violations.push(hateSpeechResult);

        // 4. Détection de spam (toujours actif si limite > 0)
        if (config.spamLimitPerMinute > 0) {
            const spamResult = checkSpam(userId, conversationId, config.spamLimitPerMinute);
            if (spamResult) violations.push(spamResult);
        }

        // 5. Détection de flood (si threshold > 0)
        if (config.floodThreshold > 0) {
            const floodResult = checkFlood(content, userId, conversationId, config.floodThreshold);
            if (floodResult) violations.push(floodResult);
        }

        // 6. Filtre de liens (si activé)
        if (config.linkFilterEnabled) {
            const linkResult = checkLinks(content, config.allowedDomains);
            if (linkResult) violations.push(linkResult);
        }

        // 7. Calculer le score et l'action
        const score = calculateScore(violations);
        const suggestedAction = determineAction(score, violations, config);
        const passed = violations.length === 0;

        const result: ContentAnalysisResult = {
            passed,
            violations,
            score,
            suggestedAction,
            flagged: score >= 30 && score < 50,
        };

        if (!passed) {
            logger.info('[ContentFilter] Message bloqué', {
                conversationId,
                userId,
                score,
                violations: violations.length,
                action: suggestedAction,
            });
        }

        return result;
    } catch (error) {
        logger.error('[ContentFilter] Erreur analyse:', error);
        // En cas d'erreur, laisser passer le message (fail-open)
        return {
            passed: true,
            violations: [],
            score: 0,
            suggestedAction: null,
            flagged: false,
        };
    }
}

/**
 * Vérifier si la config d'auto-modération a au moins un filtre activé
 */
export function isAutoModerationActive(config: ModerationBotConfig): boolean {
    return (
        config.wordFilterEnabled ||
        config.linkFilterEnabled ||
        config.spamLimitPerMinute > 0 ||
        config.floodThreshold > 0 ||
        config.aiModerationEnabled
    );
}

/**
 * Obtenir la configuration par défaut de l'auto-modération
 */
export function getDefaultModerationConfig(): ModerationBotConfig {
    return {
        wordFilterEnabled: false,
        bannedWords: [],
        wordFilterAction: ModerationAction.DELETE_MESSAGE,
        linkFilterEnabled: false,
        allowedDomains: [],
        linkFilterAction: ModerationAction.WARN,
        spamLimitPerMinute: 15,
        spamAction: ModerationAction.MUTE,
        floodThreshold: 5,
        muteDurationMinutes: 10,
        warnBeforeAction: true,
        maxWarnings: 3,
        aiModerationEnabled: false,
    };
}

/**
 * Réinitialiser tous les trackers (utile pour les tests ou le reset)
 */
export function resetAllTrackers(): void {
    userTrackers.clear();
}
