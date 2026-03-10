/**
 * Home Config Store (Zustand)
 *
 * Gère la configuration personnalisable du Home :
 * - Ordre et visibilité des sections
 * - Grille d'actions rapides 3×3
 * - Widgets contextuels
 * - Persistance locale (l'utilisateur retrouve son layout)
 *
 * Sprint S1 Axe A — Home Hub Foundation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getTimePeriod, TIME_BASED_PRIORITIES, TIME_BASED_WIDGETS } from '@/hooks/useTimeOfDay';
import { createLogger } from '@/services/logger';
import type {
    HomeLayout,
    HomeSectionConfig,
    HomeSectionId,
    HomeWidget,
    QuickAction,
} from '@/types/home-hub';
import {
    DEFAULT_HOME_LAYOUT,
    DEFAULT_QUICK_ACTIONS,
    DEFAULT_SECTIONS,
} from '@/types/home-hub';

const logger = createLogger('HomeConfigStore');

// ─── Interfaces ───────────────────────────────────────────────

interface HomeConfigState {
    /** Layout complet */
    layout: HomeLayout;
    /** Mode édition (pour le drag & drop des sections) */
    isEditing: boolean;

    // --- Section Actions ---
    /** Obtenir les sections visibles triées par ordre */
    getVisibleSections: () => HomeSectionConfig[];
    /** Obtenir les sections visibles triées par pertinence temporelle */
    getTimeSortedSections: () => HomeSectionConfig[];
    /** Obtenir les widgets triés par pertinence temporelle */
    getTimeSortedWidgets: () => HomeWidget[];
    /** Toggler la visibilité d'une section */
    toggleSectionVisibility: (sectionId: HomeSectionId) => void;
    /** Réordonner les sections (après drag & drop) */
    reorderSections: (orderedIds: HomeSectionId[]) => void;
    /** Déplacer une section vers le haut */
    moveSectionUp: (sectionId: HomeSectionId) => void;
    /** Déplacer une section vers le bas */
    moveSectionDown: (sectionId: HomeSectionId) => void;

    // --- Quick Actions ---
    /** Obtenir les actions rapides actives triées par position */
    getActiveQuickActions: () => QuickAction[];
    /** Toggler une action rapide */
    toggleQuickAction: (actionId: string) => void;
    /** Réordonner les actions rapides */
    reorderQuickActions: (orderedIds: string[]) => void;
    /** Mettre à jour le badge d'une action */
    updateQuickActionBadge: (actionId: string, badge: number | undefined) => void;

    // --- Widgets ---
    /** Ajouter un widget */
    addWidget: (widget: HomeWidget) => void;
    /** Supprimer un widget */
    removeWidget: (widgetId: string) => void;
    /** Toggler visibilité d'un widget */
    toggleWidgetVisibility: (widgetId: string) => void;
    /** Réordonner les widgets (après drag & drop) */
    reorderWidgets: (orderedIds: string[]) => void;
    /** Mettre à jour les données d'un widget */
    updateWidgetData: (widgetId: string, data: Record<string, unknown>) => void;

    // --- Mode édition ---
    setEditing: (editing: boolean) => void;

    // --- Reset ---
    resetToDefaults: () => void;
}

// ─── Store ────────────────────────────────────────────────────

export const useHomeConfigStore = create<HomeConfigState>()(
    persist(
        (set, get) => ({
            layout: { ...DEFAULT_HOME_LAYOUT },
            isEditing: false,

            // ─── Section Actions ─────────────────────────────

            getVisibleSections: () => {
                return get()
                    .layout.sections.filter((s) => s.visible)
                    .sort((a, b) => a.order - b.order);
            },

            getTimeSortedSections: () => {
                const period = getTimePeriod(new Date().getHours());
                const priorities = TIME_BASED_PRIORITIES[period];
                const visible = get().layout.sections.filter((s) => s.visible);
                return [...visible].sort((a, b) => {
                    const aIdx = priorities.indexOf(a.id);
                    const bIdx = priorities.indexOf(b.id);
                    // Sections prioritaires en premier, les autres gardent leur ordre
                    const aPriority = aIdx >= 0 ? aIdx : 100 + a.order;
                    const bPriority = bIdx >= 0 ? bIdx : 100 + b.order;
                    return aPriority - bPriority;
                });
            },

            getTimeSortedWidgets: () => {
                const period = getTimePeriod(new Date().getHours());
                const priorities = TIME_BASED_WIDGETS[period];
                const widgets = get().layout.widgets.filter((w) => w.visible);
                return [...widgets].sort((a, b) => {
                    const aIdx = priorities.indexOf(a.type);
                    const bIdx = priorities.indexOf(b.type);
                    const aPriority = aIdx >= 0 ? aIdx : 100 + a.order;
                    const bPriority = bIdx >= 0 ? bIdx : 100 + b.order;
                    return aPriority - bPriority;
                });
            },

            toggleSectionVisibility: (sectionId) => {
                logger.info('toggleSectionVisibility', { sectionId });
                set((state) => ({
                    layout: {
                        ...state.layout,
                        sections: state.layout.sections.map((s) =>
                            s.id === sectionId ? { ...s, visible: !s.visible } : s,
                        ),
                        updatedAt: new Date().toISOString(),
                    },
                }));
            },

            reorderSections: (orderedIds) => {
                logger.info('reorderSections', { count: orderedIds.length });
                set((state) => {
                    const sectionMap = new Map(state.layout.sections.map((s) => [s.id, s]));
                    const reordered = orderedIds
                        .map((id, index) => {
                            const section = sectionMap.get(id);
                            if (!section) return null;
                            return { ...section, order: index };
                        })
                        .filter(Boolean) as HomeSectionConfig[];

                    // Ajouter les sections qui n'étaient pas dans la liste (nouvelles sections)
                    const reorderedIds = new Set(orderedIds);
                    const remaining = state.layout.sections
                        .filter((s) => !reorderedIds.has(s.id))
                        .map((s, i) => ({ ...s, order: reordered.length + i }));

                    return {
                        layout: {
                            ...state.layout,
                            sections: [...reordered, ...remaining],
                            updatedAt: new Date().toISOString(),
                        },
                    };
                });
            },

            moveSectionUp: (sectionId) => {
                set((state) => {
                    const sorted = [...state.layout.sections].sort((a, b) => a.order - b.order);
                    const idx = sorted.findIndex((s) => s.id === sectionId);
                    if (idx <= 0) return state;

                    // Swap orders
                    const prev = sorted[idx - 1];
                    const curr = sorted[idx];
                    const sections = state.layout.sections.map((s) => {
                        if (s.id === curr.id) return { ...s, order: prev.order };
                        if (s.id === prev.id) return { ...s, order: curr.order };
                        return s;
                    });

                    return {
                        layout: { ...state.layout, sections, updatedAt: new Date().toISOString() },
                    };
                });
            },

            moveSectionDown: (sectionId) => {
                set((state) => {
                    const sorted = [...state.layout.sections].sort((a, b) => a.order - b.order);
                    const idx = sorted.findIndex((s) => s.id === sectionId);
                    if (idx < 0 || idx >= sorted.length - 1) return state;

                    const next = sorted[idx + 1];
                    const curr = sorted[idx];
                    const sections = state.layout.sections.map((s) => {
                        if (s.id === curr.id) return { ...s, order: next.order };
                        if (s.id === next.id) return { ...s, order: curr.order };
                        return s;
                    });

                    return {
                        layout: { ...state.layout, sections, updatedAt: new Date().toISOString() },
                    };
                });
            },

            // ─── Quick Actions ───────────────────────────────

            getActiveQuickActions: () => {
                return get()
                    .layout.quickActions.filter((a) => a.enabled)
                    .sort((a, b) => a.position - b.position);
            },

            toggleQuickAction: (actionId) => {
                logger.info('toggleQuickAction', { actionId });
                set((state) => ({
                    layout: {
                        ...state.layout,
                        quickActions: state.layout.quickActions.map((a) =>
                            a.id === actionId ? { ...a, enabled: !a.enabled } : a,
                        ),
                        updatedAt: new Date().toISOString(),
                    },
                }));
            },

            reorderQuickActions: (orderedIds) => {
                set((state) => ({
                    layout: {
                        ...state.layout,
                        quickActions: state.layout.quickActions.map((a) => {
                            const newPos = orderedIds.indexOf(a.id);
                            return newPos >= 0 ? { ...a, position: newPos } : a;
                        }),
                        updatedAt: new Date().toISOString(),
                    },
                }));
            },

            updateQuickActionBadge: (actionId, badge) => {
                set((state) => ({
                    layout: {
                        ...state.layout,
                        quickActions: state.layout.quickActions.map((a) =>
                            a.id === actionId ? { ...a, badge } : a,
                        ),
                    },
                }));
            },

            // ─── Widgets ─────────────────────────────────────

            addWidget: (widget) => {
                logger.info('addWidget', { widgetId: widget.id });
                set((state) => ({
                    layout: {
                        ...state.layout,
                        widgets: [...state.layout.widgets, widget],
                        updatedAt: new Date().toISOString(),
                    },
                }));
            },

            removeWidget: (widgetId) => {
                set((state) => ({
                    layout: {
                        ...state.layout,
                        widgets: state.layout.widgets.filter((w) => w.id !== widgetId),
                        updatedAt: new Date().toISOString(),
                    },
                }));
            },

            toggleWidgetVisibility: (widgetId) => {
                set((state) => ({
                    layout: {
                        ...state.layout,
                        widgets: state.layout.widgets.map((w) =>
                            w.id === widgetId ? { ...w, visible: !w.visible } : w,
                        ),
                        updatedAt: new Date().toISOString(),
                    },
                }));
            },

            reorderWidgets: (orderedIds) => {
                logger.info('reorderWidgets', { count: orderedIds.length });
                set((state) => ({
                    layout: {
                        ...state.layout,
                        widgets: state.layout.widgets.map((w) => {
                            const newOrder = orderedIds.indexOf(w.id);
                            return newOrder >= 0 ? { ...w, order: newOrder } : w;
                        }),
                        updatedAt: new Date().toISOString(),
                    },
                }));
            },

            updateWidgetData: (widgetId, data) => {
                set((state) => ({
                    layout: {
                        ...state.layout,
                        widgets: state.layout.widgets.map((w) =>
                            w.id === widgetId ? { ...w, data } : w,
                        ),
                    },
                }));
            },

            // ─── Editing ─────────────────────────────────────

            setEditing: (editing) => {
                set({ isEditing: editing });
            },

            // ─── Reset ───────────────────────────────────────

            resetToDefaults: () => {
                logger.info('resetToDefaults');
                set({
                    layout: {
                        version: DEFAULT_HOME_LAYOUT.version,
                        sections: DEFAULT_SECTIONS.map((s) => ({ ...s })),
                        quickActions: DEFAULT_QUICK_ACTIONS.map((a) => ({ ...a })),
                        widgets: [],
                        updatedAt: new Date().toISOString(),
                    },
                    isEditing: false,
                });
            },
        }),
        {
            name: 'home-config-storage',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
