/**
 * Deep-link utilities for mini-apps.
 *
 * Expo Router handles `imuchat://miniapp/{id}` automatically because
 * of the file-based route `app/miniapp/[id].tsx`.
 *
 * This module provides helpers for:
 * - Generating shareable deep-links
 * - Programmatic navigation to a mini-app from anywhere
 * - Parsing incoming deep-link URLs
 */

import { createLogger } from '@/services/logger';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

const log = createLogger('MiniAppDeepLink');

// ─── Constants ────────────────────────────────────────────────────
const SCHEME = 'imuchat';
const MINIAPP_PATH = 'miniapp';

// ─── Public API ───────────────────────────────────────────────────

/**
 * Generate a deep-link URL for a specific mini-app.
 *
 * @example
 * getMiniAppDeepLink('imu-music')
 * // → "imuchat://miniapp/imu-music"
 */
export function getMiniAppDeepLink(moduleId: string): string {
    return `${SCHEME}://${MINIAPP_PATH}/${moduleId}`;
}

/**
 * Generate a universal link (https) for a mini-app — useful for sharing.
 *
 * @example
 * getMiniAppUniversalLink('imu-music')
 * // → "https://imuchat.app/miniapp/imu-music"
 */
export function getMiniAppUniversalLink(moduleId: string): string {
    return `https://imuchat.app/${MINIAPP_PATH}/${moduleId}`;
}

/**
 * Navigate to a mini-app screen programmatically.
 * Works from anywhere (not just inside a component).
 */
export function openMiniApp(moduleId: string): void {
    log.info(`Opening mini-app: ${moduleId}`);
    router.push({ pathname: '/miniapp/[id]', params: { id: moduleId } } as never);
}

/**
 * Parse an incoming URL and extract the mini-app module ID (if any).
 *
 * Supports both:
 *   - imuchat://miniapp/{id}
 *   - https://imuchat.app/miniapp/{id}
 *
 * @returns The module ID if the URL matches, or null.
 */
export function parseMiniAppUrl(url: string): string | null {
    try {
        const parsed = Linking.parse(url);
        // Expo Linking.parse returns { path, queryParams, hostname }
        // For "imuchat://miniapp/imu-music":
        //   hostname = "miniapp", path = "imu-music"
        // For "https://imuchat.app/miniapp/imu-music":
        //   hostname = "imuchat.app", path = "miniapp/imu-music"

        if (parsed.hostname === MINIAPP_PATH && parsed.path) {
            return parsed.path;
        }

        if (parsed.path?.startsWith(`${MINIAPP_PATH}/`)) {
            return parsed.path.slice(MINIAPP_PATH.length + 1);
        }

        return null;
    } catch (e) {
        log.warn(`Failed to parse mini-app URL: ${url}`, e);
        return null;
    }
}

/**
 * Open a URL — if it's a mini-app deep-link, navigate in-app.
 * Otherwise, open externally.
 */
export async function handleDeepLink(url: string): Promise<boolean> {
    const moduleId = parseMiniAppUrl(url);
    if (moduleId) {
        openMiniApp(moduleId);
        return true;
    }
    return false;
}
