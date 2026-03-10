/**
 * useTimeOfDay — Hook de contexte temporel
 *
 * Retourne la période de la journée pour adapter le Home Hub :
 * - morning (6h-12h)  → Agenda, Tasks, Notifications
 * - afternoon (12h-18h) → Messages, Feed, Modules
 * - evening (18h-22h) → Watch, Social, Friends
 * - night (22h-6h) → Chill, Music, Dark Mode
 *
 * Sprint S9 Axe A — Moteur de Personnalisation
 */

import { useEffect, useState } from 'react';

export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Détermine la période de la journée à partir d'une heure (0-23).
 */
export function getTimePeriod(hour: number): TimePeriod {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
}

/**
 * Sections prioritaires par période de la journée.
 * Retourne les HomeSectionId les plus pertinentes.
 */
export const TIME_BASED_PRIORITIES: Record<TimePeriod, string[]> = {
    morning: ['agenda', 'tasks', 'notifications', 'quick-actions'],
    afternoon: ['messages', 'imufeed', 'modules', 'alice'],
    evening: ['social', 'stories', 'imufeed', 'music'],
    night: ['music', 'imufeed', 'alice', 'stories'],
};

/**
 * Widget types prioritaires par période.
 */
export const TIME_BASED_WIDGETS: Record<TimePeriod, string[]> = {
    morning: ['agenda', 'weather', 'tasks'],
    afternoon: ['arena', 'gaming', 'tasks'],
    evening: ['gaming', 'arena', 'weather'],
    night: ['weather', 'agenda', 'tasks'],
};

/**
 * Hook qui retourne la période actuelle de la journée.
 * Se met à jour toutes les 15 minutes.
 */
export function useTimeOfDay() {
    const [period, setPeriod] = useState<TimePeriod>(() =>
        getTimePeriod(new Date().getHours()),
    );

    useEffect(() => {
        const checkPeriod = () => {
            const newPeriod = getTimePeriod(new Date().getHours());
            setPeriod((prev) => (prev !== newPeriod ? newPeriod : prev));
        };

        // Vérifier toutes les 15 minutes
        const interval = setInterval(checkPeriod, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return {
        period,
        priorities: TIME_BASED_PRIORITIES[period],
        widgetPriorities: TIME_BASED_WIDGETS[period],
    };
}
