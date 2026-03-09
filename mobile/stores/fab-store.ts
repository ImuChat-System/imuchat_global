/**
 * FAB Store (Zustand)
 *
 * Gère l'état du FloatingActionButton universel :
 * - Ouvert/fermé, actions configurées, visibilité
 * - Comportement contextuel par tab (S5)
 *
 * Sprint S4 Axe A — FAB Cœur
 * Sprint S5 Axe A — FAB Contextuel
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────

export type FabActionId =
    | 'message'
    | 'story'
    | 'post'
    | 'video'
    | 'event'
    | 'document'
    | 'call';

export type FabTabContext =
    | 'index'      // Home
    | 'chats'      // Chat
    | 'social'     // Social
    | 'watch'      // Watch / ImuFeed
    | 'calls'      // Appels
    | 'contacts'   // Contacts
    | 'default';   // Fallback / other tabs

export interface FabAction {
    id: FabActionId;
    label: string;
    icon: string;
    route: string;
    emoji: string;
    enabled: boolean;
    order: number;
}

// ─── Defaults ─────────────────────────────────────────────────

export const DEFAULT_FAB_ACTIONS: FabAction[] = [
    { id: 'message', label: 'Message', icon: 'chatbubble', route: '/chat/new', emoji: '💬', enabled: true, order: 0 },
    { id: 'story', label: 'Story', icon: 'camera', route: '/social/create-story', emoji: '📸', enabled: true, order: 1 },
    { id: 'post', label: 'Post', icon: 'create', route: '/social/create-post', emoji: '📝', enabled: true, order: 2 },
    { id: 'video', label: 'Vidéo', icon: 'videocam', route: '/imufeed/create', emoji: '🎥', enabled: true, order: 3 },
    { id: 'event', label: 'Événement', icon: 'calendar', route: '/events/create', emoji: '📅', enabled: true, order: 4 },
    { id: 'document', label: 'Document', icon: 'document-text', route: '/files/create', emoji: '📄', enabled: true, order: 5 },
    { id: 'call', label: 'Appel', icon: 'call', route: '/calls/new', emoji: '📞', enabled: true, order: 6 },
];

/**
 * Actions prioritaires par contexte de tab.
 * Les IDs listés ici sont affichés en priorité (dans cet ordre).
 * Les actions non listées restent disponibles mais apparaissent après.
 */
export const TAB_CONTEXT_PRIORITIES: Record<FabTabContext, FabActionId[]> = {
    index: ['message', 'story', 'post', 'video'],
    chats: ['message', 'call', 'document'],
    social: ['story', 'post', 'video', 'event'],
    watch: ['video', 'story'],
    calls: ['call', 'message'],
    contacts: ['message', 'call'],
    default: ['message', 'story', 'post', 'video', 'event', 'document', 'call'],
};

/** Routes où le FAB est automatiquement masqué (fullscreen/immersif) */
export const AUTO_HIDE_ROUTE_PATTERNS = [
    '/imufeed',      // ImuFeed fullscreen player
    '/watch/',       // Watch fullscreen
    '/stories/',     // Story viewer
    '/imufeed/editor', // Video editor
];

// ─── Store Interface ──────────────────────────────────────────

interface FabState {
    isOpen: boolean;
    isVisible: boolean;
    actions: FabAction[];
    activeTab: FabTabContext;

    // Actions
    toggle: () => void;
    open: () => void;
    close: () => void;
    setVisible: (visible: boolean) => void;
    setActiveTab: (tab: FabTabContext) => void;
    getEnabledActions: () => FabAction[];
    getContextualActions: () => FabAction[];
    toggleAction: (actionId: FabActionId) => void;
    reorderActions: (orderedIds: FabActionId[]) => void;
    resetActions: () => void;
}

// ─── Store ────────────────────────────────────────────────────

export const useFabStore = create<FabState>()(
    persist(
        (set, get) => ({
            isOpen: false,
            isVisible: true,
            actions: DEFAULT_FAB_ACTIONS,
            activeTab: 'default',

            toggle: () => set((s) => ({ isOpen: !s.isOpen })),
            open: () => set({ isOpen: true }),
            close: () => set({ isOpen: false }),
            setVisible: (visible) => set({ isVisible: visible }),

            setActiveTab: (tab) => set({ activeTab: tab, isOpen: false }),

            getEnabledActions: () =>
                get()
                    .actions.filter((a) => a.enabled)
                    .sort((a, b) => a.order - b.order),

            getContextualActions: () => {
                const { actions, activeTab } = get();
                const enabled = actions.filter((a) => a.enabled);
                const priorities = TAB_CONTEXT_PRIORITIES[activeTab] ?? TAB_CONTEXT_PRIORITIES.default;

                // Sort: priority actions first (in priority order), then remaining by original order
                const prioritySet = new Set(priorities);
                const prioritized = priorities
                    .map((id) => enabled.find((a) => a.id === id))
                    .filter(Boolean) as FabAction[];
                const rest = enabled
                    .filter((a) => !prioritySet.has(a.id))
                    .sort((a, b) => a.order - b.order);

                return [...prioritized, ...rest];
            },

            toggleAction: (actionId) =>
                set((s) => ({
                    actions: s.actions.map((a) =>
                        a.id === actionId ? { ...a, enabled: !a.enabled } : a,
                    ),
                })),

            reorderActions: (orderedIds) =>
                set((s) => ({
                    actions: s.actions.map((a) => ({
                        ...a,
                        order: orderedIds.indexOf(a.id),
                    })),
                })),

            resetActions: () => set({ actions: DEFAULT_FAB_ACTIONS, isOpen: false }),
        }),
        {
            name: 'fab-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                actions: state.actions,
            }),
        },
    ),
);
