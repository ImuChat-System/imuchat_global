/**
 * useAccessibility — Hook maître accessibilité
 *
 * Fournit l'état complet d'accessibilité :
 * - Préférence mouvement réduit (système + user)
 * - Font scale (système)
 * - Screen reader actif (VoiceOver / TalkBack)
 * - Bold text (iOS)
 * - Contraste élevé
 *
 * Sprint S15A — Accessibilité & Polish
 */

import { useEffect, useState } from "react";
import { AccessibilityInfo, PixelRatio, Platform } from "react-native";

export interface AccessibilityState {
    /** Motion réduit (système ou user) */
    isReducedMotion: boolean;
    /** Screen reader actif (VoiceOver / TalkBack) */
    isScreenReaderEnabled: boolean;
    /** Font scale multiplicateur système (1 = normal) */
    fontScale: number;
    /** Bold text préféré (iOS) */
    isBoldTextEnabled: boolean;
    /** Invert colors actif */
    isInvertColorsEnabled: boolean;
    /** Grayscale actif */
    isGrayscaleEnabled: boolean;
}

const DEFAULT_STATE: AccessibilityState = {
    isReducedMotion: false,
    isScreenReaderEnabled: false,
    fontScale: 1,
    isBoldTextEnabled: false,
    isInvertColorsEnabled: false,
    isGrayscaleEnabled: false,
};

export function useAccessibility(): AccessibilityState {
    const [state, setState] = useState<AccessibilityState>(DEFAULT_STATE);

    useEffect(() => {
        // Fetch initial values
        const init = async () => {
            const [reduceMotion, screenReader, invertColors, grayscale] =
                await Promise.all([
                    AccessibilityInfo.isReduceMotionEnabled(),
                    AccessibilityInfo.isScreenReaderEnabled(),
                    Platform.OS === "ios"
                        ? AccessibilityInfo.isInvertColorsEnabled()
                        : Promise.resolve(false),
                    Platform.OS === "ios"
                        ? AccessibilityInfo.isGrayscaleEnabled()
                        : Promise.resolve(false),
                ]);

            const fontScale = PixelRatio.getFontScale();

            // Bold text: only accessible on iOS via native modules
            // We approximate it via fontScale > 1 on Android
            const boldText =
                Platform.OS === "ios"
                    ? await AccessibilityInfo.isBoldTextEnabled()
                    : false;

            setState({
                isReducedMotion: reduceMotion,
                isScreenReaderEnabled: screenReader,
                fontScale,
                isBoldTextEnabled: boldText,
                isInvertColorsEnabled: invertColors,
                isGrayscaleEnabled: grayscale,
            });
        };

        init();

        // Subscribe to changes
        const subscriptions = [
            AccessibilityInfo.addEventListener(
                "reduceMotionChanged",
                (enabled) => {
                    setState((prev) => ({
                        ...prev,
                        isReducedMotion: enabled,
                    }));
                },
            ),
            AccessibilityInfo.addEventListener(
                "screenReaderChanged",
                (enabled) => {
                    setState((prev) => ({
                        ...prev,
                        isScreenReaderEnabled: enabled,
                    }));
                },
            ),
        ];

        if (Platform.OS === "ios") {
            subscriptions.push(
                AccessibilityInfo.addEventListener(
                    "invertColorsChanged",
                    (enabled) => {
                        setState((prev) => ({
                            ...prev,
                            isInvertColorsEnabled: enabled,
                        }));
                    },
                ),
                AccessibilityInfo.addEventListener(
                    "grayscaleChanged",
                    (enabled) => {
                        setState((prev) => ({
                            ...prev,
                            isGrayscaleEnabled: enabled,
                        }));
                    },
                ),
                AccessibilityInfo.addEventListener(
                    "boldTextChanged",
                    (enabled) => {
                        setState((prev) => ({
                            ...prev,
                            isBoldTextEnabled: enabled,
                        }));
                    },
                ),
            );
        }

        return () => {
            subscriptions.forEach((sub) => sub.remove());
        };
    }, []);

    return state;
}

/**
 * Returns scaled font size respecting system & user preferences.
 */
export function scaledFontSize(
    baseSize: number,
    fontScale: number,
    maxScale: number = 2.0,
): number {
    const effectiveScale = Math.min(fontScale, maxScale);
    return Math.round(baseSize * effectiveScale);
}

export default useAccessibility;
