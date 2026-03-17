/**
 * useReducedMotion — Détection préférence mouvement réduit
 *
 * Combine la préférence système (AccessibilityInfo) et la préférence
 * utilisateur (advanced-settings) pour décider si les animations
 * doivent être simplifiées ou supprimées.
 *
 * Sprint S15A — Accessibilité & Polish
 */

import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Hook qui détecte si l'utilisateur préfère les mouvements réduits.
 *
 * @param userPrefOverride - Optionnel : si true, force reducedMotion
 *   même si le système ne l'a pas activé (depuis les settings app)
 */
export function useReducedMotion(userPrefOverride?: boolean): boolean {
    const [systemPref, setSystemPref] = useState(false);

    useEffect(() => {
        // Check initial value
        AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
            setSystemPref(enabled);
        });

        // Listen for changes
        const subscription = AccessibilityInfo.addEventListener(
            "reduceMotionChanged",
            (enabled: boolean) => {
                setSystemPref(enabled);
            },
        );

        return () => {
            subscription.remove();
        };
    }, []);

    // User pref OR system pref → reduce motion
    return userPrefOverride === true || systemPref;
}

/**
 * Returns animation duration scaled by motion preference.
 * If reduced motion is enabled, returns minDuration (or 0 for skip).
 */
export function getAnimationDuration(
    baseDuration: number,
    isReduced: boolean,
    minDuration: number = 0,
): number {
    return isReduced ? minDuration : baseDuration;
}

export default useReducedMotion;
