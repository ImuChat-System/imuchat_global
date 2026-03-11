/**
 * Centralized URL configuration for all ImuChat services (mobile/Expo).
 * All service URLs are read from EXPO_PUBLIC_* environment variables with production defaults.
 * Never hardcode service URLs outside this file.
 */

const IS_PROD = process.env.NODE_ENV === 'production';

// ── REST API (api.imuchat.app) ────────────────────────────
export const API_URL: string =
    process.env.EXPO_PUBLIC_API_URL ??
    (IS_PROD ? 'https://api.imuchat.app' : 'http://localhost:8080');

// ── WebSocket (ws.imuchat.app) ────────────────────────────
export const WS_URL: string =
    process.env.EXPO_PUBLIC_WS_URL ??
    (IS_PROD ? 'wss://ws.imuchat.app' : 'ws://localhost:3001');

// ── Auth (auth.imuchat.app → Supabase) ───────────────────
export const AUTH_URL: string =
    process.env.EXPO_PUBLIC_AUTH_URL ??
    (IS_PROD ? 'https://auth.imuchat.app' : `${API_URL}/auth`);

// ── Storage (storage.imuchat.app → Supabase Storage) ─────
export const STORAGE_URL: string =
    process.env.EXPO_PUBLIC_STORAGE_URL ??
    (process.env.EXPO_PUBLIC_SUPABASE_URL
        ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1`
        : 'https://your-project.supabase.co/storage/v1');

// ── Media proxy (media.imuchat.app) ──────────────────────
export const MEDIA_URL: string =
    process.env.EXPO_PUBLIC_MEDIA_URL ??
    (IS_PROD ? 'https://media.imuchat.app' : `${API_URL}/api/v1/media`);

// ── Push notifications (push.imuchat.app) ────────────────
export const PUSH_URL: string =
    process.env.EXPO_PUBLIC_PUSH_URL ??
    (IS_PROD ? 'https://push.imuchat.app' : `${API_URL}/api/v1/notifications`);

// ── Convenience: REST API prefix ────────────────────────
export const API_V1 = `${API_URL}/api/v1`;

// ── Legacy alias (used by existing services) ─────────────
export const PLATFORM_CORE_URL = API_URL;
