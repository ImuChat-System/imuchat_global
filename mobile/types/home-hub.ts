/**
 * Home Hub Types
 *
 * Définitions pour le système de sections configurables du Home :
 * - HomeSectionConfig : configuration d'une section (ordre, visibilité, priorité)
 * - QuickAction : action rapide dans la grille 3×3
 * - HomeWidget : widget contextuel
 *
 * Sprint S1 Axe A — Home Hub Foundation
 */

// ─── Section IDs ──────────────────────────────────────────────

/** Identifiants des sections disponibles sur le Home */
export type HomeSectionId =
    | 'search_bar'
    | 'hero_carousel'
    | 'stories'
    | 'social_activity'
    | 'quick_actions'
    | 'my_modules'
    | 'trending'
    | 'friends_card'
    | 'feed_preview'
    | 'imufeed_preview'
    | 'explorer_grid'
    | 'podcast_widget'
    | 'music_player'
    | 'mini_apps'
    | 'notifications_summary'
    | 'gamification_badge'
    | 'wallet_summary'
    | 'weather_widget'
    | 'calendar_widget';

// ─── Section Config ───────────────────────────────────────────

export interface HomeSectionConfig {
    /** ID unique de la section */
    id: HomeSectionId;
    /** Titre i18n clé */
    titleKey: string;
    /** Position dans le feed (plus petit = plus haut) */
    order: number;
    /** Section visible */
    visible: boolean;
    /** Priorité de rendu (1=critique, 2=normal, 3=optionnel) */
    priority: 1 | 2 | 3;
    /** Hauteur minimale estimée (pour skeleton) */
    minHeight?: number;
    /** Nécessite authentification */
    requiresAuth: boolean;
    /** Icône (Ionicons name) */
    icon: string;
}

// ─── Quick Actions ────────────────────────────────────────────

/** Action rapide dans la grille 3×3 */
export interface QuickAction {
    /** ID unique */
    id: string;
    /** Clé i18n pour le label */
    labelKey: string;
    /** Icône (Ionicons name) */
    icon: string;
    /** Couleur de fond de l'icône */
    color: string;
    /** Route cible (expo-router) */
    route: string;
    /** Badge (nombre de notifications, etc.) */
    badge?: number;
    /** Nécessite authentification */
    requiresAuth: boolean;
    /** Position dans la grille (0-8 pour grille 3×3) */
    position: number;
    /** Activé par défaut */
    enabled: boolean;
}

// ─── Widget ───────────────────────────────────────────────────

/** 12 types de widgets disponibles sur le Home */
export type WidgetType =
    | 'agenda'
    | 'weather'
    | 'tasks'
    | 'wallet'
    | 'arena'
    | 'music'
    | 'ai_tips'
    | 'packages'
    | 'gaming'
    | 'screen_time'
    | 'friends_online'
    | 'recap';

/** Taille d'un widget (mappage grille : small=1×1, medium=2×1, large=2×2) */
export type WidgetSize = '1x1' | '2x1' | '2x2';

export interface HomeWidget {
    id: string;
    type: WidgetType;
    titleKey: string;
    size: WidgetSize;
    icon: string;
    order: number;
    visible: boolean;
    /** Données dynamiques fournies par le data provider */
    data?: Record<string, unknown>;
}

// ─── Home Layout ──────────────────────────────────────────────

/** Configuration complète du layout Home */
export interface HomeLayout {
    /** Version du schéma (pour migrations futures) */
    version: number;
    /** Sections ordonnées */
    sections: HomeSectionConfig[];
    /** Actions rapides (grille 3×3) */
    quickActions: QuickAction[];
    /** Widgets supplémentaires */
    widgets: HomeWidget[];
    /** Dernière modification */
    updatedAt: string;
}

// ─── Defaults ─────────────────────────────────────────────────

/** Sections par défaut du Home */
export const DEFAULT_SECTIONS: HomeSectionConfig[] = [
    {
        id: 'search_bar',
        titleKey: 'home.search',
        order: 0,
        visible: true,
        priority: 1,
        minHeight: 60,
        requiresAuth: false,
        icon: 'search',
    },
    {
        id: 'hero_carousel',
        titleKey: 'home.hero',
        order: 1,
        visible: true,
        priority: 1,
        minHeight: 200,
        requiresAuth: false,
        icon: 'sparkles',
    },
    {
        id: 'stories',
        titleKey: 'home.stories',
        order: 2,
        visible: true,
        priority: 1,
        minHeight: 100,
        requiresAuth: false,
        icon: 'ellipse-outline',
    },
    {
        id: 'social_activity',
        titleKey: 'home.socialActivity',
        order: 3,
        visible: true,
        priority: 2,
        minHeight: 180,
        requiresAuth: false,
        icon: 'people-circle',
    },
    {
        id: 'quick_actions',
        titleKey: 'home.quickActions',
        order: 4,
        visible: true,
        priority: 1,
        minHeight: 180,
        requiresAuth: false,
        icon: 'grid',
    },
    {
        id: 'my_modules',
        titleKey: 'home.myModules',
        order: 5,
        visible: true,
        priority: 2,
        minHeight: 100,
        requiresAuth: true,
        icon: 'cube',
    },
    {
        id: 'trending',
        titleKey: 'home.trending',
        order: 6,
        visible: true,
        priority: 2,
        minHeight: 140,
        requiresAuth: false,
        icon: 'trending-up',
    },
    {
        id: 'friends_card',
        titleKey: 'home.friends',
        order: 7,
        visible: true,
        priority: 2,
        minHeight: 120,
        requiresAuth: true,
        icon: 'people',
    },
    {
        id: 'feed_preview',
        titleKey: 'home.feed',
        order: 8,
        visible: true,
        priority: 2,
        minHeight: 200,
        requiresAuth: false,
        icon: 'newspaper',
    },
    {
        id: 'imufeed_preview',
        titleKey: 'home.imufeed',
        order: 9,
        visible: true,
        priority: 2,
        minHeight: 180,
        requiresAuth: false,
        icon: 'videocam',
    },
    {
        id: 'explorer_grid',
        titleKey: 'home.explorer',
        order: 10,
        visible: true,
        priority: 2,
        minHeight: 160,
        requiresAuth: false,
        icon: 'compass',
    },
    {
        id: 'podcast_widget',
        titleKey: 'home.podcasts',
        order: 11,
        visible: true,
        priority: 3,
        minHeight: 140,
        requiresAuth: false,
        icon: 'headset',
    },
    {
        id: 'music_player',
        titleKey: 'home.music',
        order: 12,
        visible: false,
        priority: 3,
        minHeight: 80,
        requiresAuth: false,
        icon: 'musical-notes',
    },
    {
        id: 'mini_apps',
        titleKey: 'home.miniApps',
        order: 13,
        visible: true,
        priority: 2,
        minHeight: 120,
        requiresAuth: false,
        icon: 'apps',
    },
    {
        id: 'notifications_summary',
        titleKey: 'home.notifications',
        order: 14,
        visible: false,
        priority: 3,
        minHeight: 80,
        requiresAuth: true,
        icon: 'notifications',
    },
    {
        id: 'gamification_badge',
        titleKey: 'home.gamification',
        order: 15,
        visible: true,
        priority: 3,
        minHeight: 100,
        requiresAuth: true,
        icon: 'trophy',
    },
    {
        id: 'wallet_summary',
        titleKey: 'home.wallet',
        order: 16,
        visible: false,
        priority: 3,
        minHeight: 80,
        requiresAuth: true,
        icon: 'wallet',
    },
    {
        id: 'weather_widget',
        titleKey: 'home.weather',
        order: 17,
        visible: false,
        priority: 3,
        minHeight: 100,
        requiresAuth: false,
        icon: 'partly-sunny',
    },
    {
        id: 'calendar_widget',
        titleKey: 'home.calendar',
        order: 18,
        visible: false,
        priority: 3,
        minHeight: 100,
        requiresAuth: true,
        icon: 'calendar',
    },
];

/** Actions rapides par défaut (grille 3×3) */
export const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
    {
        id: 'qa_chat',
        labelKey: 'home.qa.chat',
        icon: 'chatbubble-ellipses',
        color: '#6C5CE7',
        route: '/(tabs)/chats',
        requiresAuth: true,
        position: 0,
        enabled: true,
    },
    {
        id: 'qa_alice',
        labelKey: 'home.qa.alice',
        icon: 'sparkles',
        color: '#00B894',
        route: '/alice',
        requiresAuth: false,
        position: 1,
        enabled: true,
    },
    {
        id: 'qa_feed',
        labelKey: 'home.qa.feed',
        icon: 'videocam',
        color: '#E17055',
        route: '/imufeed',
        requiresAuth: false,
        position: 2,
        enabled: true,
    },
    {
        id: 'qa_worlds',
        labelKey: 'home.qa.worlds',
        icon: 'globe',
        color: '#0984E3',
        route: '/worlds',
        requiresAuth: false,
        position: 3,
        enabled: true,
    },
    {
        id: 'qa_music',
        labelKey: 'home.qa.music',
        icon: 'musical-notes',
        color: '#FDCB6E',
        route: '/music',
        requiresAuth: false,
        position: 4,
        enabled: true,
    },
    {
        id: 'qa_store',
        labelKey: 'home.qa.store',
        icon: 'storefront',
        color: '#E84393',
        route: '/(tabs)/store',
        requiresAuth: false,
        position: 5,
        enabled: true,
    },
    {
        id: 'qa_games',
        labelKey: 'home.qa.games',
        icon: 'game-controller',
        color: '#00CEC9',
        route: '/games',
        requiresAuth: false,
        position: 6,
        enabled: true,
    },
    {
        id: 'qa_office',
        labelKey: 'home.qa.office',
        icon: 'briefcase',
        color: '#636E72',
        route: '/office',
        requiresAuth: true,
        position: 7,
        enabled: true,
    },
    {
        id: 'qa_wallet',
        labelKey: 'home.qa.wallet',
        icon: 'wallet',
        color: '#A29BFE',
        route: '/wallet',
        requiresAuth: true,
        position: 8,
        enabled: true,
    },
];

// ─── Default Widgets ──────────────────────────────────────────

/** 4 widgets initiaux activés par défaut (Sprint S6) */
export const DEFAULT_WIDGETS: HomeWidget[] = [
    { id: 'w_wallet', type: 'wallet', titleKey: 'widget.wallet', size: '1x1', icon: 'wallet', order: 0, visible: true },
    { id: 'w_friends', type: 'friends_online', titleKey: 'widget.friends_online', size: '2x1', icon: 'people', order: 1, visible: true },
    { id: 'w_recap', type: 'recap', titleKey: 'widget.recap', size: '2x1', icon: 'notifications', order: 2, visible: true },
    { id: 'w_ai_tips', type: 'ai_tips', titleKey: 'widget.ai_tips', size: '1x1', icon: 'sparkles', order: 3, visible: true },
];

/** Catalogue complet des 12 types de widgets */
export const WIDGET_CATALOG: HomeWidget[] = [
    { id: 'w_wallet', type: 'wallet', titleKey: 'widget.wallet', size: '1x1', icon: 'wallet', order: 0, visible: true },
    { id: 'w_music', type: 'music', titleKey: 'widget.music', size: '2x1', icon: 'musical-notes', order: 1, visible: false },
    { id: 'w_friends', type: 'friends_online', titleKey: 'widget.friends_online', size: '2x1', icon: 'people', order: 2, visible: true },
    { id: 'w_recap', type: 'recap', titleKey: 'widget.recap', size: '2x1', icon: 'notifications', order: 3, visible: true },
    { id: 'w_screen_time', type: 'screen_time', titleKey: 'widget.screen_time', size: '1x1', icon: 'time', order: 4, visible: false },
    { id: 'w_ai_tips', type: 'ai_tips', titleKey: 'widget.ai_tips', size: '1x1', icon: 'sparkles', order: 5, visible: true },
    { id: 'w_agenda', type: 'agenda', titleKey: 'widget.agenda', size: '2x1', icon: 'calendar', order: 6, visible: false },
    { id: 'w_weather', type: 'weather', titleKey: 'widget.weather', size: '1x1', icon: 'cloudy', order: 7, visible: false },
    { id: 'w_tasks', type: 'tasks', titleKey: 'widget.tasks', size: '2x1', icon: 'checkbox', order: 8, visible: false },
    { id: 'w_arena', type: 'arena', titleKey: 'widget.arena', size: '2x1', icon: 'trophy', order: 9, visible: false },
    { id: 'w_packages', type: 'packages', titleKey: 'widget.packages', size: '1x1', icon: 'cube', order: 10, visible: false },
    { id: 'w_gaming', type: 'gaming', titleKey: 'widget.gaming', size: '2x1', icon: 'game-controller', order: 11, visible: false },
];

/** Layout Home par défaut */
export const DEFAULT_HOME_LAYOUT: HomeLayout = {
    version: 1,
    sections: DEFAULT_SECTIONS,
    quickActions: DEFAULT_QUICK_ACTIONS,
    widgets: DEFAULT_WIDGETS,
    updatedAt: new Date().toISOString(),
};
