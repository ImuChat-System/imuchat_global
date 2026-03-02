/**
 * Types pour le Module Bots de Groupe — DEV-025
 *
 * Framework bots modulaire : modération, quiz, animation, utilitaire.
 * Bots exécutés côté serveur (platform-core) ou localement (pattern-based).
 *
 * Phase 3 — Groupe 9 IA (fonc. 5/5)
 */

// ============================================================================
// ENUMS
// ============================================================================

/** Catégorie de bot */
export enum BotCategory {
    MODERATION = 'moderation',
    QUIZ = 'quiz',
    ANIMATION = 'animation',
    UTILITY = 'utility',
    GAMING = 'gaming',
    EDUCATION = 'education',
    BUSINESS = 'business',
    CUSTOM = 'custom',
}

/** Statut d'un bot dans un groupe */
export enum BotStatus {
    ACTIVE = 'active',
    PAUSED = 'paused',
    DISABLED = 'disabled',
    ERROR = 'error',
}

/** Mode d'exécution du bot */
export enum BotExecutionMode {
    /** Exécuté côté serveur (platform-core) */
    SERVER = 'server',
    /** Exécuté localement via patterns/règles */
    LOCAL = 'local',
    /** Bot IA via le Gateway */
    AI_GATEWAY = 'ai_gateway',
}

/** Type d'action de modération */
export enum ModerationAction {
    WARN = 'warn',
    MUTE = 'mute',
    KICK = 'kick',
    BAN = 'ban',
    DELETE_MESSAGE = 'delete_message',
    FLAG = 'flag',
}

/** Type de question dans un quiz */
export enum QuizQuestionType {
    MULTIPLE_CHOICE = 'multiple_choice',
    TRUE_FALSE = 'true_false',
    OPEN_ENDED = 'open_ended',
    POLL = 'poll',
}

/** Statut d'une session de quiz */
export enum QuizSessionStatus {
    WAITING = 'waiting',
    IN_PROGRESS = 'in_progress',
    FINISHED = 'finished',
    CANCELLED = 'cancelled',
}

/** Niveau de permission requis pour configurer un bot */
export enum BotPermissionLevel {
    OWNER = 'owner',
    ADMIN = 'admin',
    MODERATOR = 'moderator',
    MEMBER = 'member',
}

// ============================================================================
// INTERFACES — Core
// ============================================================================

/** Définition d'un bot */
export interface BotDefinition {
    id: string;
    name: string;
    description: string;
    /** Icône (nom Ionicons) */
    icon: string;
    /** Catégorie principale */
    category: BotCategory;
    /** Tags pour la recherche */
    tags: string[];
    /** Version du bot */
    version: string;
    /** Auteur */
    author: string;
    /** Mode d'exécution */
    executionMode: BotExecutionMode;
    /** Commandes supportées (ex: /quiz, /mute, /poll) */
    commands: BotCommand[];
    /** Configuration par défaut */
    defaultConfig: Record<string, unknown>;
    /** Permissions minimum pour installer */
    minPermission: BotPermissionLevel;
    /** Bot officiel ImuChat ? */
    isOfficial: boolean;
    /** Nombre d'installations */
    installCount: number;
    /** Note moyenne (1-5) */
    rating: number;
    /** Date de création */
    createdAt: string;
    /** Date de dernière mise à jour */
    updatedAt: string;
}

/** Commande supportée par un bot */
export interface BotCommand {
    /** Nom de la commande (ex: "quiz", "mute") */
    name: string;
    /** Description */
    description: string;
    /** Syntaxe d'utilisation (ex: "/quiz start [topic]") */
    usage: string;
    /** Paramètres attendus */
    params: BotCommandParam[];
    /** Permission requise pour exécuter */
    permission: BotPermissionLevel;
    /** Cooldown en secondes entre deux exécutions */
    cooldownSeconds?: number;
}

/** Paramètre d'une commande bot */
export interface BotCommandParam {
    name: string;
    description: string;
    type: 'string' | 'number' | 'boolean' | 'user' | 'duration';
    required: boolean;
    defaultValue?: string | number | boolean;
    choices?: string[];
}

/** Instance d'un bot installé dans un groupe */
export interface BotInstance {
    id: string;
    /** Référence vers la définition */
    botId: string;
    /** Groupe où le bot est installé */
    conversationId: string;
    /** Configuration personnalisée pour ce groupe */
    config: Record<string, unknown>;
    /** Statut actuel */
    status: BotStatus;
    /** Utilisateur ayant installé le bot */
    installedBy: string;
    /** Date d'installation */
    installedAt: string;
    /** Dernière activité */
    lastActiveAt: string;
    /** Nombre de commandes exécutées */
    commandsExecuted: number;
}

// ============================================================================
// INTERFACES — Modération
// ============================================================================

/** Configuration du bot de modération */
export interface ModerationBotConfig {
    /** Filtrer les mots interdits */
    wordFilterEnabled: boolean;
    /** Liste de mots/expressions interdits */
    bannedWords: string[];
    /** Action par défaut pour un mot interdit */
    wordFilterAction: ModerationAction;
    /** Filtrer les liens */
    linkFilterEnabled: boolean;
    /** Domaines autorisés (whitelist) */
    allowedDomains: string[];
    /** Action pour les liens non autorisés */
    linkFilterAction: ModerationAction;
    /** Anti-spam : limite de messages par minute */
    spamLimitPerMinute: number;
    /** Action pour le spam */
    spamAction: ModerationAction;
    /** Anti-flood : messages identiques max */
    floodThreshold: number;
    /** Durée du mute en minutes (si action = mute) */
    muteDurationMinutes: number;
    /** Envoyer un avertissement avant l'action */
    warnBeforeAction: boolean;
    /** Nombre max d'avertissements avant action */
    maxWarnings: number;
    /** Utiliser l'IA Gateway pour la modération de contenu */
    aiModerationEnabled: boolean;
}

/** Log d'action de modération */
export interface ModerationLog {
    id: string;
    botInstanceId: string;
    conversationId: string;
    /** Utilisateur ciblé */
    targetUserId: string;
    targetUserName: string;
    /** Action effectuée */
    action: ModerationAction;
    /** Raison */
    reason: string;
    /** Message déclencheur (si applicable) */
    triggerMessage?: string;
    /** Date */
    createdAt: string;
    /** Exécuté automatiquement ou manuellement */
    isAutomatic: boolean;
}

// ============================================================================
// INTERFACES — Quiz
// ============================================================================

/** Configuration du bot quiz */
export interface QuizBotConfig {
    /** Durée par défaut d'une question (secondes) */
    defaultTimeLimitSeconds: number;
    /** Points par bonne réponse */
    pointsPerCorrectAnswer: number;
    /** Points bonus pour réponse rapide */
    speedBonusEnabled: boolean;
    /** Nombre max de participants */
    maxParticipants: number;
    /** Afficher le classement après chaque question */
    showLeaderboardAfterEach: boolean;
    /** Récompense ImuCoin pour le gagnant */
    rewardImuCoins: number;
}

/** Question de quiz */
export interface QuizQuestion {
    id: string;
    text: string;
    type: QuizQuestionType;
    options?: string[];
    correctAnswer: string;
    /** Explication affichée après la réponse */
    explanation?: string;
    /** Durée (override la config par défaut) */
    timeLimitSeconds?: number;
    /** Difficulté (1-5) */
    difficulty: number;
    /** Catégorie thématique */
    topic: string;
}

/** Session de quiz en cours */
export interface QuizSession {
    id: string;
    botInstanceId: string;
    conversationId: string;
    /** Questions du quiz */
    questions: QuizQuestion[];
    /** Index de la question actuelle */
    currentQuestionIndex: number;
    /** Scores des participants */
    scores: Record<string, QuizParticipantScore>;
    /** Statut */
    status: QuizSessionStatus;
    /** Créé par */
    createdBy: string;
    /** Topic du quiz */
    topic: string;
    /** Début */
    startedAt: string;
    /** Fin */
    finishedAt?: string;
}

/** Score d'un participant */
export interface QuizParticipantScore {
    userId: string;
    userName: string;
    score: number;
    correctAnswers: number;
    totalAnswered: number;
    averageResponseTimeMs: number;
}

// ============================================================================
// INTERFACES — Animation
// ============================================================================

/** Configuration du bot animation */
export interface AnimationBotConfig {
    /** GIFs aléatoires activés */
    randomGifsEnabled: boolean;
    /** Fréquence des GIFs (en messages) — un GIF tous les N messages */
    gifFrequency: number;
    /** Blagues activées */
    jokesEnabled: boolean;
    /** Faits du jour activés */
    dailyFactsEnabled: boolean;
    /** Heure du fait du jour (HH:MM) */
    dailyFactTime: string;
    /** Polls automatiques */
    autoPollsEnabled: boolean;
    /** Thèmes de GIFs (tags GIPHY) */
    gifThemes: string[];
}

// ============================================================================
// INTERFACES — Bot Messages & Events
// ============================================================================

/** Message envoyé par un bot dans un groupe */
export interface BotMessage {
    id: string;
    botInstanceId: string;
    conversationId: string;
    /** Contenu du message */
    content: string;
    /** Type de contenu */
    contentType: 'text' | 'image' | 'gif' | 'embed' | 'quiz_question' | 'poll' | 'leaderboard';
    /** Métadonnées (quiz question, poll options, etc.) */
    metadata?: Record<string, unknown>;
    /** Commande ayant déclenché ce message */
    triggerCommand?: string;
    /** Date */
    createdAt: string;
}

/** Événement bot (pour le log d'activité) */
export interface BotEvent {
    id: string;
    botInstanceId: string;
    /** Type d'événement */
    type: 'command_executed' | 'auto_action' | 'error' | 'config_changed' | 'installed' | 'uninstalled';
    /** Description */
    description: string;
    /** Métadonnées */
    metadata?: Record<string, unknown>;
    /** Date */
    createdAt: string;
}

// ============================================================================
// INTERFACES — State
// ============================================================================

/** État global du module bots */
export interface BotsState {
    /** Catalogue des bots disponibles */
    catalog: BotDefinition[];
    /** Bots installés dans les groupes de l'utilisateur */
    installedBots: BotInstance[];
    /** Session de quiz en cours (s'il y en a une) */
    activeQuizSession: QuizSession | null;
    /** Logs de modération récents */
    recentModerationLogs: ModerationLog[];
    /** Chargement en cours */
    isLoading: boolean;
    /** Erreur */
    error: string | null;
}

/** Section de navigation dans le module bots */
export type BotsSection = 'catalog' | 'installed' | 'marketplace';

/** Résultat d'exécution d'une commande bot */
export interface BotCommandResult {
    success: boolean;
    /** Message de retour (affiché dans le chat) */
    response?: string;
    /** Action effectuée */
    action?: string;
    /** Données supplémentaires */
    data?: Record<string, unknown>;
    /** Erreur */
    error?: string;
}
