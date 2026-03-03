
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// SSR-safe storage: AsyncStorage accesses `window` internally on web,
// which crashes during Expo Router's server-side rendering pass.
// Fall back to a no-op in-memory store when `window` is not available.
const isSSR = Platform.OS === 'web' && typeof window === 'undefined';
const ssrSafeStorage = isSSR
    ? {
        getItem: (_key: string) => Promise.resolve(null),
        setItem: (_key: string, _value: string) => Promise.resolve(),
        removeItem: (_key: string) => Promise.resolve(),
    }
    : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ssrSafeStorage,
        autoRefreshToken: true,
        persistSession: !isSSR,
        detectSessionInUrl: false,
    },
});

// ==========================================
// DEV MODE - Auth bypass helper
// ==========================================
const DEV_BYPASS_AUTH = process.env.EXPO_PUBLIC_DEV_BYPASS_AUTH === 'true';
const DEV_ADMIN_ID = 'dev-admin-user-id-12345';
const DEV_ADMIN_EMAIL = process.env.EXPO_PUBLIC_DEV_ADMIN_EMAIL || 'admin@imuchat.dev';

/**
 * Retourne l'utilisateur courant.
 * En mode dev bypass, retourne un faux user sans appeler Supabase.
 */
export async function getCurrentUser() {
    if (DEV_BYPASS_AUTH) {
        return {
            id: DEV_ADMIN_ID,
            email: DEV_ADMIN_EMAIL,
            // Supabase User shape minimal
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
        } as { id: string; email: string; app_metadata: object; user_metadata: object; aud: string; created_at: string };
    }
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}
// ==========================================

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
if (!isSSR) {
    AppState.addEventListener('change', (state) => {
        if (state === 'active') {
            supabase.auth.startAutoRefresh();
        } else {
            supabase.auth.stopAutoRefresh();
        }
    });
}
