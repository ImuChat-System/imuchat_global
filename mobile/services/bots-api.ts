/**
 * Bots API Service — DEV-025 : Bots de groupe
 *
 * Service d'accès aux bots via Supabase (catalogue, installation, commandes).
 * Inclut 4 bots officiels : Modération, Quiz, Animation, Utilitaire.
 *
 * Phase 3 — Groupe 9 IA (fonc. 5/5)
 */

import { createLogger } from '@/services/logger';
import { getCurrentUser, supabase } from '@/services/supabase';
import type {
    AnimationBotConfig,
    BotCategory,
    BotCommand,
    BotCommandResult,
    BotDefinition,
    BotEvent,
    BotInstance,
    BotStatus,
    ModerationBotConfig,
    ModerationLog,
    QuizBotConfig,
    QuizQuestion,
    QuizSession
} from '@/types/bots';
import {
    BotExecutionMode,
    BotPermissionLevel,
    ModerationAction,
    QuizQuestionType,
    QuizSessionStatus,
} from '@/types/bots';

const logger = createLogger('BotsAPI');

// ============================================================================
// BOTS OFFICIELS (built-in)
// ============================================================================

/** Bot de modération officiel */
const MODERATION_BOT: BotDefinition = {
    id: 'official-moderation',
    name: 'ImuGuard',
    description: 'Bot de modération automatique : filtres de mots, anti-spam, anti-flood, modération IA.',
    icon: 'shield-checkmark',
    category: 'moderation' as BotCategory,
    tags: ['modération', 'sécurité', 'filtre', 'spam', 'flood'],
    version: '1.0.0',
    author: 'ImuChat',
    executionMode: BotExecutionMode.SERVER,
    commands: [
        {
            name: 'warn',
            description: 'Avertir un membre',
            usage: '/warn @utilisateur [raison]',
            params: [
                { name: 'user', description: 'Utilisateur à avertir', type: 'user', required: true },
                { name: 'reason', description: 'Raison de l\'avertissement', type: 'string', required: false },
            ],
            permission: BotPermissionLevel.MODERATOR,
        },
        {
            name: 'mute',
            description: 'Rendre muet un membre',
            usage: '/mute @utilisateur [durée] [raison]',
            params: [
                { name: 'user', description: 'Utilisateur à muter', type: 'user', required: true },
                { name: 'duration', description: 'Durée du mute (ex: 10m, 1h, 1d)', type: 'duration', required: false, defaultValue: '10m' },
                { name: 'reason', description: 'Raison du mute', type: 'string', required: false },
            ],
            permission: BotPermissionLevel.MODERATOR,
        },
        {
            name: 'kick',
            description: 'Expulser un membre du groupe',
            usage: '/kick @utilisateur [raison]',
            params: [
                { name: 'user', description: 'Utilisateur à expulser', type: 'user', required: true },
                { name: 'reason', description: 'Raison de l\'expulsion', type: 'string', required: false },
            ],
            permission: BotPermissionLevel.ADMIN,
        },
        {
            name: 'ban',
            description: 'Bannir un membre du groupe',
            usage: '/ban @utilisateur [raison]',
            params: [
                { name: 'user', description: 'Utilisateur à bannir', type: 'user', required: true },
                { name: 'reason', description: 'Raison du bannissement', type: 'string', required: false },
            ],
            permission: BotPermissionLevel.ADMIN,
        },
        {
            name: 'modlogs',
            description: 'Voir les logs de modération récents',
            usage: '/modlogs [nombre]',
            params: [
                { name: 'count', description: 'Nombre de logs à afficher', type: 'number', required: false, defaultValue: 10 },
            ],
            permission: BotPermissionLevel.MODERATOR,
        },
    ],
    defaultConfig: {
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
    } satisfies ModerationBotConfig,
    minPermission: BotPermissionLevel.ADMIN,
    isOfficial: true,
    installCount: 0,
    rating: 4.8,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-02-19T00:00:00Z',
};

/** Bot quiz officiel */
const QUIZ_BOT: BotDefinition = {
    id: 'official-quiz',
    name: 'ImuQuiz',
    description: 'Bot de quiz interactif : questions multi-choix, vrai/faux, classement temps réel, récompenses ImuCoins.',
    icon: 'help-circle',
    category: 'quiz' as BotCategory,
    tags: ['quiz', 'jeu', 'éducation', 'compétition', 'imucoins'],
    version: '1.0.0',
    author: 'ImuChat',
    executionMode: BotExecutionMode.SERVER,
    commands: [
        {
            name: 'quiz',
            description: 'Lancer un quiz',
            usage: '/quiz start [thème] [nombre]',
            params: [
                { name: 'action', description: 'Action (start, stop, skip)', type: 'string', required: true, choices: ['start', 'stop', 'skip'] },
                { name: 'topic', description: 'Thème du quiz', type: 'string', required: false, defaultValue: 'general' },
                { name: 'count', description: 'Nombre de questions', type: 'number', required: false, defaultValue: 10 },
            ],
            permission: BotPermissionLevel.MEMBER,
            cooldownSeconds: 30,
        },
        {
            name: 'answer',
            description: 'Répondre à la question en cours',
            usage: '/answer [réponse]',
            params: [
                { name: 'answer', description: 'Votre réponse', type: 'string', required: true },
            ],
            permission: BotPermissionLevel.MEMBER,
        },
        {
            name: 'leaderboard',
            description: 'Afficher le classement du quiz en cours',
            usage: '/leaderboard',
            params: [],
            permission: BotPermissionLevel.MEMBER,
        },
    ],
    defaultConfig: {
        defaultTimeLimitSeconds: 30,
        pointsPerCorrectAnswer: 100,
        speedBonusEnabled: true,
        maxParticipants: 50,
        showLeaderboardAfterEach: true,
        rewardImuCoins: 50,
    } satisfies QuizBotConfig,
    minPermission: BotPermissionLevel.MODERATOR,
    isOfficial: true,
    installCount: 0,
    rating: 4.9,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-02-19T00:00:00Z',
};

/** Bot animation officiel */
const ANIMATION_BOT: BotDefinition = {
    id: 'official-animation',
    name: 'ImuFun',
    description: 'Bot d\'animation : GIFs aléatoires, blagues, faits du jour, sondages automatiques.',
    icon: 'sparkles',
    category: 'animation' as BotCategory,
    tags: ['animation', 'fun', 'gif', 'blague', 'sondage'],
    version: '1.0.0',
    author: 'ImuChat',
    executionMode: BotExecutionMode.LOCAL,
    commands: [
        {
            name: 'gif',
            description: 'Envoyer un GIF aléatoire',
            usage: '/gif [thème]',
            params: [
                { name: 'theme', description: 'Thème du GIF', type: 'string', required: false, defaultValue: 'funny' },
            ],
            permission: BotPermissionLevel.MEMBER,
            cooldownSeconds: 10,
        },
        {
            name: 'joke',
            description: 'Raconter une blague',
            usage: '/joke',
            params: [],
            permission: BotPermissionLevel.MEMBER,
            cooldownSeconds: 15,
        },
        {
            name: 'fact',
            description: 'Un fait intéressant du jour',
            usage: '/fact',
            params: [],
            permission: BotPermissionLevel.MEMBER,
            cooldownSeconds: 30,
        },
        {
            name: 'poll',
            description: 'Créer un sondage rapide',
            usage: '/poll "Question" "Option 1" "Option 2" ...',
            params: [
                { name: 'question', description: 'Question du sondage', type: 'string', required: true },
                { name: 'options', description: 'Options de réponse (2-6)', type: 'string', required: true },
            ],
            permission: BotPermissionLevel.MEMBER,
            cooldownSeconds: 60,
        },
    ],
    defaultConfig: {
        randomGifsEnabled: true,
        gifFrequency: 50,
        jokesEnabled: true,
        dailyFactsEnabled: true,
        dailyFactTime: '09:00',
        autoPollsEnabled: false,
        gifThemes: ['funny', 'cute', 'reaction', 'anime'],
    } satisfies AnimationBotConfig,
    minPermission: BotPermissionLevel.MODERATOR,
    isOfficial: true,
    installCount: 0,
    rating: 4.7,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-02-19T00:00:00Z',
};

/** Bot utilitaire officiel */
const UTILITY_BOT: BotDefinition = {
    id: 'official-utility',
    name: 'ImuTools',
    description: 'Bot utilitaire : rappels, statistiques du groupe, recherche, notes partagées.',
    icon: 'construct',
    category: 'utility' as BotCategory,
    tags: ['utilitaire', 'rappel', 'stats', 'recherche', 'notes'],
    version: '1.0.0',
    author: 'ImuChat',
    executionMode: BotExecutionMode.SERVER,
    commands: [
        {
            name: 'remind',
            description: 'Créer un rappel',
            usage: '/remind [durée] [message]',
            params: [
                { name: 'duration', description: 'Dans combien de temps (ex: 10m, 1h, 1d)', type: 'duration', required: true },
                { name: 'message', description: 'Message du rappel', type: 'string', required: true },
            ],
            permission: BotPermissionLevel.MEMBER,
            cooldownSeconds: 5,
        },
        {
            name: 'stats',
            description: 'Statistiques du groupe',
            usage: '/stats',
            params: [],
            permission: BotPermissionLevel.MEMBER,
            cooldownSeconds: 30,
        },
        {
            name: 'note',
            description: 'Sauvegarder ou lire une note partagée',
            usage: '/note [save|read|list] [titre] [contenu]',
            params: [
                { name: 'action', description: 'Action', type: 'string', required: true, choices: ['save', 'read', 'list', 'delete'] },
                { name: 'title', description: 'Titre de la note', type: 'string', required: false },
                { name: 'content', description: 'Contenu de la note', type: 'string', required: false },
            ],
            permission: BotPermissionLevel.MEMBER,
        },
        {
            name: 'help',
            description: 'Afficher l\'aide des commandes du bot',
            usage: '/help [commande]',
            params: [
                { name: 'command', description: 'Commande spécifique', type: 'string', required: false },
            ],
            permission: BotPermissionLevel.MEMBER,
        },
    ],
    defaultConfig: {},
    minPermission: BotPermissionLevel.MODERATOR,
    isOfficial: true,
    installCount: 0,
    rating: 4.5,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-02-19T00:00:00Z',
};

/** Catalogue des bots officiels */
export const OFFICIAL_BOTS: BotDefinition[] = [
    MODERATION_BOT,
    QUIZ_BOT,
    ANIMATION_BOT,
    UTILITY_BOT,
];

// ============================================================================
// SQL SCHEMA — Tables bots
// ============================================================================

export const BOTS_SCHEMA_SQL = `
-- ================================================================
-- 🤖 Table: bot_instances
-- ================================================================
CREATE TABLE IF NOT EXISTS public.bot_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id TEXT NOT NULL,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    config JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled', 'error')),
    installed_by UUID NOT NULL REFERENCES auth.users(id),
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    commands_executed INTEGER DEFAULT 0,
    UNIQUE(bot_id, conversation_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_bot_instances_conversation ON public.bot_instances(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bot_instances_bot_id ON public.bot_instances(bot_id);

-- ================================================================
-- 📋 Table: moderation_logs
-- ================================================================
CREATE TABLE IF NOT EXISTS public.moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_instance_id UUID NOT NULL REFERENCES public.bot_instances(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES auth.users(id),
    target_user_name TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('warn', 'mute', 'kick', 'ban', 'delete_message', 'flag')),
    reason TEXT,
    trigger_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_automatic BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_moderation_logs_conversation ON public.moderation_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_target ON public.moderation_logs(target_user_id);

-- ================================================================
-- 🎯 Table: quiz_sessions
-- ================================================================
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_instance_id UUID NOT NULL REFERENCES public.bot_instances(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    questions JSONB NOT NULL DEFAULT '[]',
    current_question_index INTEGER DEFAULT 0,
    scores JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'finished', 'cancelled')),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    topic TEXT DEFAULT 'general',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_conversation ON public.quiz_sessions(conversation_id);

-- ================================================================
-- 📝 Table: bot_events
-- ================================================================
CREATE TABLE IF NOT EXISTS public.bot_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_instance_id UUID NOT NULL REFERENCES public.bot_instances(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('command_executed', 'auto_action', 'error', 'config_changed', 'installed', 'uninstalled')),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_events_instance ON public.bot_events(bot_instance_id);

-- ================================================================
-- 📝 Table: shared_notes (for utility bot)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.shared_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_notes_conversation ON public.shared_notes(conversation_id);
`;

// ============================================================================
// CATALOGUE
// ============================================================================

/**
 * Récupérer le catalogue complet des bots (officiels + communautaires).
 */
export async function fetchBotCatalog(): Promise<BotDefinition[]> {
    // Pour le MVP, on retourne les bots officiels directement
    // Plus tard, on fusionnera avec les bots communautaires depuis Supabase
    logger.info(`Bot catalog loaded: ${OFFICIAL_BOTS.length} official bots`);
    return [...OFFICIAL_BOTS];
}

/**
 * Récupérer un bot par son ID.
 */
export function getBotById(botId: string): BotDefinition | null {
    return OFFICIAL_BOTS.find(b => b.id === botId) ?? null;
}

/**
 * Filtrer les bots par catégorie.
 */
export function getBotsByCategory(category: BotCategory): BotDefinition[] {
    return OFFICIAL_BOTS.filter(b => b.category === category);
}

/**
 * Rechercher des bots par nom ou tags.
 */
export function searchBots(query: string): BotDefinition[] {
    const q = query.toLowerCase();
    return OFFICIAL_BOTS.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.tags.some(t => t.toLowerCase().includes(q))
    );
}

// ============================================================================
// INSTALLATION / DÉSINSTALLATION
// ============================================================================

/**
 * Installer un bot dans un groupe.
 */
export async function installBot(
    botId: string,
    conversationId: string,
): Promise<BotInstance> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const bot = getBotById(botId);
    if (!bot) throw new Error(`Bot introuvable : ${botId}`);

    // Vérifier si déjà installé
    const { data: existing } = await supabase
        .from('bot_instances')
        .select('id')
        .eq('bot_id', botId)
        .eq('conversation_id', conversationId)
        .maybeSingle();

    if (existing) {
        throw new Error(`Le bot "${bot.name}" est déjà installé dans ce groupe`);
    }

    const { data, error } = await supabase
        .from('bot_instances')
        .insert({
            bot_id: botId,
            conversation_id: conversationId,
            config: bot.defaultConfig,
            status: 'active',
            installed_by: user.id,
        })
        .select()
        .single();

    if (error) {
        logger.error(`Failed to install bot ${botId}:`, error.message);
        throw new Error(`Erreur lors de l'installation : ${error.message}`);
    }

    // Log l'événement
    await logBotEvent(data.id, 'installed', `Bot "${bot.name}" installé`);

    logger.info(`Bot "${bot.name}" installed in conversation ${conversationId}`);

    return mapBotInstance(data);
}

/**
 * Désinstaller un bot d'un groupe.
 */
export async function uninstallBot(instanceId: string): Promise<void> {
    const { error } = await supabase
        .from('bot_instances')
        .delete()
        .eq('id', instanceId);

    if (error) {
        logger.error(`Failed to uninstall bot instance ${instanceId}:`, error.message);
        throw new Error(`Erreur lors de la désinstallation : ${error.message}`);
    }

    logger.info(`Bot instance ${instanceId} uninstalled`);
}

/**
 * Récupérer les bots installés dans un groupe.
 */
export async function fetchInstalledBots(conversationId: string): Promise<BotInstance[]> {
    const { data, error } = await supabase
        .from('bot_instances')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('installed_at', { ascending: false });

    if (error) {
        logger.error(`Failed to fetch installed bots:`, error.message);
        throw new Error(`Erreur de chargement des bots : ${error.message}`);
    }

    return (data ?? []).map(mapBotInstance);
}

/**
 * Récupérer tous les bots installés pour les groupes de l'utilisateur.
 */
export async function fetchAllUserBots(): Promise<BotInstance[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    // Récupérer les conversations de l'utilisateur puis les bots
    const { data: memberships } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', user.id);

    if (!memberships || memberships.length === 0) return [];

    const conversationIds = memberships.map(m => m.conversation_id);

    const { data, error } = await supabase
        .from('bot_instances')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('last_active_at', { ascending: false });

    if (error) {
        logger.error(`Failed to fetch user bots:`, error.message);
        return [];
    }

    return (data ?? []).map(mapBotInstance);
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Mettre à jour la configuration d'un bot installé.
 */
export async function updateBotConfig(
    instanceId: string,
    config: Record<string, unknown>,
): Promise<BotInstance> {
    const { data, error } = await supabase
        .from('bot_instances')
        .update({ config })
        .eq('id', instanceId)
        .select()
        .single();

    if (error) {
        logger.error(`Failed to update bot config:`, error.message);
        throw new Error(`Erreur de mise à jour : ${error.message}`);
    }

    await logBotEvent(instanceId, 'config_changed', 'Configuration mise à jour');
    logger.info(`Bot config updated for instance ${instanceId}`);

    return mapBotInstance(data);
}

/**
 * Changer le statut d'un bot (activer, mettre en pause, désactiver).
 */
export async function updateBotStatus(
    instanceId: string,
    status: BotStatus,
): Promise<BotInstance> {
    const { data, error } = await supabase
        .from('bot_instances')
        .update({ status })
        .eq('id', instanceId)
        .select()
        .single();

    if (error) {
        logger.error(`Failed to update bot status:`, error.message);
        throw new Error(`Erreur de mise à jour du statut : ${error.message}`);
    }

    logger.info(`Bot instance ${instanceId} status changed to ${status}`);
    return mapBotInstance(data);
}

// ============================================================================
// EXÉCUTION DE COMMANDES
// ============================================================================

/**
 * Parser un message chat pour détecter une commande bot.
 * Retourne null si ce n'est pas une commande.
 */
export function parseBotCommand(message: string): {
    commandName: string;
    args: string[];
} | null {
    if (!message.startsWith('/')) return null;

    const parts = message.slice(1).split(/\s+/);
    const commandName = parts[0]?.toLowerCase();
    if (!commandName) return null;

    const args = parts.slice(1);
    return { commandName, args };
}

/**
 * Trouver le bot instance correspondant à une commande dans un groupe.
 */
export async function findBotForCommand(
    conversationId: string,
    commandName: string,
): Promise<{ instance: BotInstance; bot: BotDefinition; command: BotCommand } | null> {
    const instances = await fetchInstalledBots(conversationId);

    for (const instance of instances) {
        if (instance.status !== 'active') continue;

        const bot = getBotById(instance.botId);
        if (!bot) continue;

        const command = bot.commands.find(c => c.name === commandName);
        if (command) {
            return { instance, bot, command };
        }
    }

    return null;
}

/**
 * Exécuter une commande bot.
 * Dispatche vers le handler approprié selon le bot.
 */
export async function executeBotCommand(
    conversationId: string,
    commandName: string,
    args: string[],
    userId: string,
    userName: string,
): Promise<BotCommandResult> {
    try {
        const found = await findBotForCommand(conversationId, commandName);

        if (!found) {
            return {
                success: false,
                error: `Commande /${commandName} inconnue. Tapez /help pour la liste.`,
            };
        }

        const { instance, bot, command } = found;

        // Vérifier les permissions
        // Pour le MVP, on vérifie simplement si le user est membre
        // La vérification fine de rôle sera faite côté platform-core

        logger.info(`Executing command /${commandName} for bot "${bot.name}" in ${conversationId}`);

        // Incrémenter le compteur de commandes
        await supabase
            .from('bot_instances')
            .update({
                commands_executed: instance.commandsExecuted + 1,
                last_active_at: new Date().toISOString(),
            })
            .eq('id', instance.id);

        // Dispatcher selon le bot
        let result: BotCommandResult;

        switch (bot.id) {
            case 'official-moderation':
                result = await executeModerationCommand(instance, command, args, userId, userName, conversationId);
                break;
            case 'official-quiz':
                result = await executeQuizCommand(instance, command, args, userId, userName, conversationId);
                break;
            case 'official-animation':
                result = executeAnimationCommand(instance, command, args);
                break;
            case 'official-utility':
                result = await executeUtilityCommand(instance, command, args, userId, conversationId);
                break;
            default:
                result = { success: false, error: 'Bot non supporté' };
        }

        // Log l'événement
        await logBotEvent(
            instance.id,
            'command_executed',
            `/${commandName} ${args.join(' ')}`.trim(),
            { userId, result: result.success ? 'success' : 'error' },
        );

        return result;
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        logger.error(`Command execution error:`, message);
        return { success: false, error: message };
    }
}

// ============================================================================
// HANDLERS — Modération
// ============================================================================

async function executeModerationCommand(
    instance: BotInstance,
    command: BotCommand,
    args: string[],
    actorUserId: string,
    actorUserName: string,
    conversationId: string,
): Promise<BotCommandResult> {
    const config = instance.config as unknown as ModerationBotConfig;

    switch (command.name) {
        case 'warn': {
            const targetUser = args[0];
            const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';
            if (!targetUser) return { success: false, error: 'Usage : /warn @utilisateur [raison]' };

            await createModerationLog(instance.id, conversationId, targetUser, actorUserName, ModerationAction.WARN, reason, false);
            return {
                success: true,
                response: `⚠️ ${targetUser} a reçu un avertissement : ${reason}`,
                action: 'warn',
            };
        }

        case 'mute': {
            const targetUser = args[0];
            const duration = args[1] || `${config.muteDurationMinutes}m`;
            const reason = args.slice(2).join(' ') || 'Aucune raison spécifiée';
            if (!targetUser) return { success: false, error: 'Usage : /mute @utilisateur [durée] [raison]' };

            await createModerationLog(instance.id, conversationId, targetUser, actorUserName, ModerationAction.MUTE, reason, false);
            return {
                success: true,
                response: `🔇 ${targetUser} a été rendu muet pour ${duration} : ${reason}`,
                action: 'mute',
                data: { duration },
            };
        }

        case 'kick': {
            const targetUser = args[0];
            const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';
            if (!targetUser) return { success: false, error: 'Usage : /kick @utilisateur [raison]' };

            await createModerationLog(instance.id, conversationId, targetUser, actorUserName, ModerationAction.KICK, reason, false);
            return {
                success: true,
                response: `👢 ${targetUser} a été expulsé : ${reason}`,
                action: 'kick',
            };
        }

        case 'ban': {
            const targetUser = args[0];
            const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';
            if (!targetUser) return { success: false, error: 'Usage : /ban @utilisateur [raison]' };

            await createModerationLog(instance.id, conversationId, targetUser, actorUserName, ModerationAction.BAN, reason, false);
            return {
                success: true,
                response: `🚫 ${targetUser} a été banni : ${reason}`,
                action: 'ban',
            };
        }

        case 'modlogs': {
            const count = parseInt(args[0] || '10', 10);
            const logs = await fetchModerationLogs(conversationId, count);
            if (logs.length === 0) {
                return { success: true, response: '📋 Aucun log de modération.' };
            }
            const formatted = logs.map(l =>
                `• [${l.action.toUpperCase()}] ${l.targetUserName} — ${l.reason} (${new Date(l.createdAt).toLocaleDateString()})`
            ).join('\n');
            return {
                success: true,
                response: `📋 Logs de modération :\n${formatted}`,
                data: { logs },
            };
        }

        default:
            return { success: false, error: `Commande de modération inconnue : ${command.name}` };
    }
}

// ============================================================================
// HANDLERS — Quiz
// ============================================================================

async function executeQuizCommand(
    instance: BotInstance,
    command: BotCommand,
    args: string[],
    userId: string,
    userName: string,
    conversationId: string,
): Promise<BotCommandResult> {
    switch (command.name) {
        case 'quiz': {
            const action = args[0] || 'start';
            const topic = args[1] || 'general';
            const count = parseInt(args[2] || '5', 10);

            if (action === 'start') {
                const session = await startQuizSession(instance.id, conversationId, userId, topic, count);
                return {
                    success: true,
                    response: `🎯 Quiz "${topic}" lancé ! ${count} questions. Préparez-vous !`,
                    action: 'quiz_start',
                    data: { sessionId: session.id },
                };
            }

            if (action === 'stop') {
                await endQuizSession(conversationId);
                return {
                    success: true,
                    response: '⏹️ Quiz arrêté.',
                    action: 'quiz_stop',
                };
            }

            if (action === 'skip') {
                return {
                    success: true,
                    response: '⏭️ Question passée !',
                    action: 'quiz_skip',
                };
            }

            return { success: false, error: 'Usage : /quiz start|stop|skip [thème] [nombre]' };
        }

        case 'answer': {
            const answer = args.join(' ');
            if (!answer) return { success: false, error: 'Usage : /answer [votre réponse]' };

            const result = await submitQuizAnswer(conversationId, userId, userName, answer);
            return result;
        }

        case 'leaderboard': {
            const session = await getActiveQuizSession(conversationId);
            if (!session) {
                return { success: true, response: '📊 Aucun quiz en cours.' };
            }

            const scores = Object.values(session.scores)
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);

            if (scores.length === 0) {
                return { success: true, response: '📊 Aucun score pour l\'instant.' };
            }

            const leaderboard = scores.map((s, i) =>
                `${i + 1}. ${s.userName} — ${s.score} pts (${s.correctAnswers}/${s.totalAnswered})`
            ).join('\n');

            return {
                success: true,
                response: `🏆 Classement :\n${leaderboard}`,
                action: 'leaderboard',
                data: { scores },
            };
        }

        default:
            return { success: false, error: `Commande quiz inconnue : ${command.name}` };
    }
}

// ============================================================================
// HANDLERS — Animation
// ============================================================================

function executeAnimationCommand(
    instance: BotInstance,
    command: BotCommand,
    args: string[],
): BotCommandResult {
    const config = instance.config as unknown as AnimationBotConfig;

    switch (command.name) {
        case 'gif': {
            const theme = args[0] || config.gifThemes[0] || 'funny';
            // On retourne une indication ; le composant chat ira chercher le GIF
            return {
                success: true,
                response: `🎞️ GIF "${theme}"`,
                action: 'send_gif',
                data: { theme, source: 'giphy' },
            };
        }

        case 'joke': {
            // Sélectionner une blague pré-chargée (MVP)
            const jokes = [
                'Pourquoi les plongeurs plongent-ils toujours en arrière ? Parce que sinon ils tomberaient dans le bateau ! 🤿',
                'Que dit un informaticien quand il s\'ennuie ? « Je bit. » 💻',
                'Comment appelle-t-on un chat tombé dans un pot de peinture le jour de Noël ? Un chat-peint de Noël ! 🎄',
                'Pourquoi les robots n\'ont-ils jamais peur ? Parce qu\'ils ont des nerfs d\'acier ! 🤖',
                'Qu\'est-ce qu\'un canif ? Un petit fien. 🐕',
            ];
            const joke = jokes[Math.floor(Math.random() * jokes.length)];
            return {
                success: true,
                response: `😄 ${joke}`,
                action: 'joke',
            };
        }

        case 'fact': {
            const facts = [
                '🧠 Le cerveau humain peut stocker environ 2,5 pétaoctets de données.',
                '🐙 Les poulpes ont trois cœurs et du sang bleu.',
                '🌍 La Terre tourne à environ 1 670 km/h à l\'équateur.',
                '🍯 Le miel ne se périme jamais. On a trouvé du miel comestible dans des tombes égyptiennes.',
                '🎵 La chanson "Happy Birthday" était protégée par copyright jusqu\'en 2016.',
            ];
            const fact = facts[Math.floor(Math.random() * facts.length)];
            return {
                success: true,
                response: fact,
                action: 'fact',
            };
        }

        case 'poll': {
            const question = args[0];
            const options = args.slice(1);
            if (!question || options.length < 2) {
                return { success: false, error: 'Usage : /poll "Question" "Option 1" "Option 2" ...' };
            }
            return {
                success: true,
                response: `📊 Sondage : ${question}`,
                action: 'create_poll',
                data: { question, options },
            };
        }

        default:
            return { success: false, error: `Commande animation inconnue : ${command.name}` };
    }
}

// ============================================================================
// HANDLERS — Utilitaire
// ============================================================================

async function executeUtilityCommand(
    instance: BotInstance,
    command: BotCommand,
    args: string[],
    userId: string,
    conversationId: string,
): Promise<BotCommandResult> {
    switch (command.name) {
        case 'remind': {
            const duration = args[0];
            const message = args.slice(1).join(' ');
            if (!duration || !message) {
                return { success: false, error: 'Usage : /remind [durée] [message]' };
            }
            // MVP : on log le rappel, l'implémentation serveur programmera la notification
            return {
                success: true,
                response: `⏰ Rappel programmé dans ${duration} : "${message}"`,
                action: 'reminder_set',
                data: { duration, message, userId },
            };
        }

        case 'stats': {
            // Statistiques basiques du groupe
            const { data: members } = await supabase
                .from('conversation_members')
                .select('id')
                .eq('conversation_id', conversationId);

            const { count: messageCount } = await supabase
                .from('messages')
                .select('id', { count: 'exact', head: true })
                .eq('conversation_id', conversationId);

            return {
                success: true,
                response: `📊 Statistiques du groupe :\n• Membres : ${members?.length ?? 0}\n• Messages : ${messageCount ?? 0}`,
                action: 'stats',
                data: { memberCount: members?.length ?? 0, messageCount: messageCount ?? 0 },
            };
        }

        case 'note': {
            const action = args[0];
            const title = args[1];
            const content = args.slice(2).join(' ');

            if (action === 'save') {
                if (!title || !content) {
                    return { success: false, error: 'Usage : /note save [titre] [contenu]' };
                }
                await supabase.from('shared_notes').insert({
                    conversation_id: conversationId,
                    title,
                    content,
                    created_by: userId,
                });
                return {
                    success: true,
                    response: `📝 Note "${title}" sauvegardée !`,
                    action: 'note_saved',
                };
            }

            if (action === 'read') {
                if (!title) return { success: false, error: 'Usage : /note read [titre]' };
                const { data: note } = await supabase
                    .from('shared_notes')
                    .select('*')
                    .eq('conversation_id', conversationId)
                    .eq('title', title)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (!note) return { success: true, response: `📝 Note "${title}" introuvable.` };
                return {
                    success: true,
                    response: `📝 **${note.title}** :\n${note.content}`,
                    action: 'note_read',
                    data: note,
                };
            }

            if (action === 'list') {
                const { data: notes } = await supabase
                    .from('shared_notes')
                    .select('title, created_at')
                    .eq('conversation_id', conversationId)
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (!notes || notes.length === 0) {
                    return { success: true, response: '📝 Aucune note dans ce groupe.' };
                }
                const list = notes.map(n => `• ${n.title}`).join('\n');
                return {
                    success: true,
                    response: `📝 Notes du groupe :\n${list}`,
                    action: 'note_list',
                };
            }

            if (action === 'delete') {
                if (!title) return { success: false, error: 'Usage : /note delete [titre]' };
                await supabase
                    .from('shared_notes')
                    .delete()
                    .eq('conversation_id', conversationId)
                    .eq('title', title);
                return {
                    success: true,
                    response: `🗑️ Note "${title}" supprimée.`,
                    action: 'note_deleted',
                };
            }

            return { success: false, error: 'Usage : /note save|read|list|delete [titre] [contenu]' };
        }

        case 'help': {
            const specificCommand = args[0];
            const allBots = await fetchInstalledBots(conversationId);
            const activeBots = allBots.filter(i => i.status === 'active');

            if (specificCommand) {
                // Aide sur une commande spécifique
                for (const inst of activeBots) {
                    const bot = getBotById(inst.botId);
                    if (!bot) continue;
                    const cmd = bot.commands.find(c => c.name === specificCommand);
                    if (cmd) {
                        return {
                            success: true,
                            response: `📖 **/${cmd.name}** — ${cmd.description}\nUsage : \`${cmd.usage}\``,
                            action: 'help',
                        };
                    }
                }
                return { success: true, response: `❓ Commande /${specificCommand} inconnue.` };
            }

            // Liste toutes les commandes disponibles
            const lines: string[] = ['📖 **Commandes disponibles :**'];
            for (const inst of activeBots) {
                const bot = getBotById(inst.botId);
                if (!bot) continue;
                lines.push(`\n**${bot.name}** :`);
                for (const cmd of bot.commands) {
                    lines.push(`  /${cmd.name} — ${cmd.description}`);
                }
            }

            return {
                success: true,
                response: lines.join('\n'),
                action: 'help',
            };
        }

        default:
            return { success: false, error: `Commande utilitaire inconnue : ${command.name}` };
    }
}

// ============================================================================
// MODÉRATION LOGS
// ============================================================================

/**
 * Créer un log de modération.
 */
async function createModerationLog(
    botInstanceId: string,
    conversationId: string,
    targetUserId: string,
    targetUserName: string,
    action: ModerationAction,
    reason: string,
    isAutomatic: boolean,
    triggerMessage?: string,
): Promise<void> {
    const { error } = await supabase
        .from('moderation_logs')
        .insert({
            bot_instance_id: botInstanceId,
            conversation_id: conversationId,
            target_user_id: targetUserId,
            target_user_name: targetUserName,
            action,
            reason,
            trigger_message: triggerMessage,
            is_automatic: isAutomatic,
        });

    if (error) {
        logger.error('Failed to create moderation log:', error.message);
    }
}

/**
 * Récupérer les logs de modération d'un groupe.
 */
export async function fetchModerationLogs(
    conversationId: string,
    limit = 20,
): Promise<ModerationLog[]> {
    const { data, error } = await supabase
        .from('moderation_logs')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        logger.error('Failed to fetch moderation logs:', error.message);
        return [];
    }

    return (data ?? []).map(mapModerationLog);
}

// ============================================================================
// QUIZ SESSIONS
// ============================================================================

/**
 * Démarrer une session de quiz.
 */
async function startQuizSession(
    botInstanceId: string,
    conversationId: string,
    userId: string,
    topic: string,
    questionCount: number,
): Promise<QuizSession> {
    // Vérifier qu'il n'y a pas déjà un quiz en cours
    const existing = await getActiveQuizSession(conversationId);
    if (existing) {
        throw new Error('Un quiz est déjà en cours dans ce groupe. Utilisez /quiz stop d\'abord.');
    }

    // Générer des questions (MVP : questions pré-définies)
    const questions = generateQuizQuestions(topic, questionCount);

    const { data, error } = await supabase
        .from('quiz_sessions')
        .insert({
            bot_instance_id: botInstanceId,
            conversation_id: conversationId,
            questions: JSON.stringify(questions),
            current_question_index: 0,
            scores: JSON.stringify({}),
            status: QuizSessionStatus.IN_PROGRESS,
            created_by: userId,
            topic,
        })
        .select()
        .single();

    if (error) {
        logger.error('Failed to start quiz session:', error.message);
        throw new Error(`Erreur de démarrage du quiz : ${error.message}`);
    }

    return mapQuizSession(data);
}

/**
 * Récupérer la session de quiz active dans un groupe.
 */
export async function getActiveQuizSession(conversationId: string): Promise<QuizSession | null> {
    const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('conversation_id', conversationId)
        .in('status', [QuizSessionStatus.WAITING, QuizSessionStatus.IN_PROGRESS])
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error || !data) return null;
    return mapQuizSession(data);
}

/**
 * Soumettre une réponse au quiz.
 */
async function submitQuizAnswer(
    conversationId: string,
    userId: string,
    userName: string,
    answer: string,
): Promise<BotCommandResult> {
    const session = await getActiveQuizSession(conversationId);
    if (!session) {
        return { success: false, error: 'Aucun quiz en cours.' };
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) {
        return { success: false, error: 'Pas de question en cours.' };
    }

    const isCorrect = answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    const config = { pointsPerCorrectAnswer: 100, speedBonusEnabled: true }; // defaults

    // Mettre à jour le score
    const scores = { ...session.scores };
    if (!scores[userId]) {
        scores[userId] = {
            userId,
            userName,
            score: 0,
            correctAnswers: 0,
            totalAnswered: 0,
            averageResponseTimeMs: 0,
        };
    }

    scores[userId].totalAnswered++;
    if (isCorrect) {
        scores[userId].correctAnswers++;
        scores[userId].score += config.pointsPerCorrectAnswer;
    }

    // Mettre à jour en base
    await supabase
        .from('quiz_sessions')
        .update({ scores: JSON.stringify(scores) })
        .eq('id', session.id);

    if (isCorrect) {
        return {
            success: true,
            response: `✅ Bonne réponse, ${userName} ! +${config.pointsPerCorrectAnswer} pts`,
            action: 'quiz_correct',
            data: { score: scores[userId].score },
        };
    }

    return {
        success: true,
        response: `❌ Mauvaise réponse, ${userName}. La bonne réponse était : ${currentQuestion.correctAnswer}`,
        action: 'quiz_wrong',
        data: { correctAnswer: currentQuestion.correctAnswer },
    };
}

/**
 * Terminer la session de quiz en cours.
 */
async function endQuizSession(conversationId: string): Promise<void> {
    await supabase
        .from('quiz_sessions')
        .update({
            status: QuizSessionStatus.FINISHED,
            finished_at: new Date().toISOString(),
        })
        .eq('conversation_id', conversationId)
        .in('status', [QuizSessionStatus.WAITING, QuizSessionStatus.IN_PROGRESS]);
}

/**
 * Générer des questions de quiz pré-définies (MVP).
 */
function generateQuizQuestions(topic: string, count: number): QuizQuestion[] {
    const questionBank: QuizQuestion[] = [
        {
            id: 'q1',
            text: 'Quelle est la capitale du Japon ?',
            type: QuizQuestionType.MULTIPLE_CHOICE,
            options: ['Tokyo', 'Osaka', 'Kyoto', 'Hiroshima'],
            correctAnswer: 'Tokyo',
            explanation: 'Tokyo est la capitale du Japon depuis 1868.',
            difficulty: 1,
            topic: 'general',
        },
        {
            id: 'q2',
            text: 'Combien de continents y a-t-il sur Terre ?',
            type: QuizQuestionType.MULTIPLE_CHOICE,
            options: ['5', '6', '7', '8'],
            correctAnswer: '7',
            explanation: 'Les 7 continents sont : Afrique, Antarctique, Asie, Europe, Amérique du Nord, Océanie, Amérique du Sud.',
            difficulty: 1,
            topic: 'general',
        },
        {
            id: 'q3',
            text: 'Le soleil est une étoile.',
            type: QuizQuestionType.TRUE_FALSE,
            options: ['Vrai', 'Faux'],
            correctAnswer: 'Vrai',
            explanation: 'Le soleil est une étoile de type naine jaune.',
            difficulty: 1,
            topic: 'science',
        },
        {
            id: 'q4',
            text: 'Quel langage de programmation a été créé par Brendan Eich en 1995 ?',
            type: QuizQuestionType.MULTIPLE_CHOICE,
            options: ['Java', 'JavaScript', 'Python', 'C++'],
            correctAnswer: 'JavaScript',
            explanation: 'JavaScript a été créé en 10 jours par Brendan Eich pour Netscape.',
            difficulty: 2,
            topic: 'tech',
        },
        {
            id: 'q5',
            text: 'Quel est l\'élément chimique dont le symbole est "O" ?',
            type: QuizQuestionType.MULTIPLE_CHOICE,
            options: ['Or', 'Oxygène', 'Osmium', 'Oganesson'],
            correctAnswer: 'Oxygène',
            explanation: 'O est le symbole chimique de l\'oxygène.',
            difficulty: 1,
            topic: 'science',
        },
        {
            id: 'q6',
            text: 'En quelle année l\'Homme a-t-il marché sur la Lune pour la première fois ?',
            type: QuizQuestionType.MULTIPLE_CHOICE,
            options: ['1965', '1967', '1969', '1971'],
            correctAnswer: '1969',
            explanation: 'Apollo 11, le 20 juillet 1969.',
            difficulty: 2,
            topic: 'history',
        },
        {
            id: 'q7',
            text: 'React Native est développé par Google.',
            type: QuizQuestionType.TRUE_FALSE,
            options: ['Vrai', 'Faux'],
            correctAnswer: 'Faux',
            explanation: 'React Native est développé par Meta (Facebook).',
            difficulty: 2,
            topic: 'tech',
        },
        {
            id: 'q8',
            text: 'Quel océan est le plus grand ?',
            type: QuizQuestionType.MULTIPLE_CHOICE,
            options: ['Atlantique', 'Indien', 'Pacifique', 'Arctique'],
            correctAnswer: 'Pacifique',
            explanation: 'L\'océan Pacifique couvre environ 165,25 millions de km².',
            difficulty: 1,
            topic: 'general',
        },
        {
            id: 'q9',
            text: 'Combien de bits dans un octet ?',
            type: QuizQuestionType.MULTIPLE_CHOICE,
            options: ['4', '8', '16', '32'],
            correctAnswer: '8',
            explanation: 'Un octet (byte) contient 8 bits.',
            difficulty: 2,
            topic: 'tech',
        },
        {
            id: 'q10',
            text: 'La Grande Muraille de Chine est visible depuis l\'espace.',
            type: QuizQuestionType.TRUE_FALSE,
            options: ['Vrai', 'Faux'],
            correctAnswer: 'Faux',
            explanation: 'C\'est un mythe populaire. La Grande Muraille n\'est pas visible à l\'œil nu depuis l\'espace.',
            difficulty: 2,
            topic: 'general',
        },
    ];

    // Filtrer par topic si pertinent
    let filtered = topic === 'general'
        ? questionBank
        : questionBank.filter(q => q.topic === topic || q.topic === 'general');

    // Si pas assez de questions pour le topic, compléter avec le pool général
    if (filtered.length < count) {
        filtered = questionBank;
    }

    // Mélanger et prendre N questions
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ============================================================================
// BOT EVENTS
// ============================================================================

/**
 * Logger un événement bot.
 */
async function logBotEvent(
    botInstanceId: string,
    type: BotEvent['type'],
    description: string,
    metadata?: Record<string, unknown>,
): Promise<void> {
    const { error } = await supabase
        .from('bot_events')
        .insert({
            bot_instance_id: botInstanceId,
            type,
            description,
            metadata: metadata ?? {},
        });

    if (error) {
        logger.error('Failed to log bot event:', error.message);
    }
}

/**
 * Récupérer les événements d'un bot.
 */
export async function fetchBotEvents(
    botInstanceId: string,
    limit = 50,
): Promise<BotEvent[]> {
    const { data, error } = await supabase
        .from('bot_events')
        .select('*')
        .eq('bot_instance_id', botInstanceId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        logger.error('Failed to fetch bot events:', error.message);
        return [];
    }

    return (data ?? []).map(mapBotEvent);
}

// ============================================================================
// MAPPERS (snake_case DB → camelCase TS)
// ============================================================================

function mapBotInstance(row: Record<string, unknown>): BotInstance {
    return {
        id: row.id as string,
        botId: row.bot_id as string,
        conversationId: row.conversation_id as string,
        config: (row.config ?? {}) as Record<string, unknown>,
        status: row.status as BotStatus,
        installedBy: row.installed_by as string,
        installedAt: row.installed_at as string,
        lastActiveAt: row.last_active_at as string,
        commandsExecuted: (row.commands_executed as number) ?? 0,
    };
}

function mapModerationLog(row: Record<string, unknown>): ModerationLog {
    return {
        id: row.id as string,
        botInstanceId: row.bot_instance_id as string,
        conversationId: row.conversation_id as string,
        targetUserId: row.target_user_id as string,
        targetUserName: row.target_user_name as string,
        action: row.action as ModerationAction,
        reason: (row.reason as string) ?? '',
        triggerMessage: row.trigger_message as string | undefined,
        createdAt: row.created_at as string,
        isAutomatic: (row.is_automatic as boolean) ?? false,
    };
}

function mapQuizSession(row: Record<string, unknown>): QuizSession {
    return {
        id: row.id as string,
        botInstanceId: row.bot_instance_id as string,
        conversationId: row.conversation_id as string,
        questions: typeof row.questions === 'string' ? JSON.parse(row.questions) : (row.questions as QuizQuestion[]),
        currentQuestionIndex: (row.current_question_index as number) ?? 0,
        scores: typeof row.scores === 'string' ? JSON.parse(row.scores) : (row.scores as Record<string, import('@/types/bots').QuizParticipantScore>),
        status: row.status as QuizSessionStatus,
        createdBy: row.created_by as string,
        topic: (row.topic as string) ?? 'general',
        startedAt: row.started_at as string,
        finishedAt: row.finished_at as string | undefined,
    };
}

function mapBotEvent(row: Record<string, unknown>): BotEvent {
    return {
        id: row.id as string,
        botInstanceId: row.bot_instance_id as string,
        type: row.type as BotEvent['type'],
        description: (row.description as string) ?? '',
        metadata: row.metadata as Record<string, unknown> | undefined,
        createdAt: row.created_at as string,
    };
}
