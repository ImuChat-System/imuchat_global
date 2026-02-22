/**
 * User Store (Zustand + AsyncStorage persist)
 *
 * Profil utilisateur courant et préférences :
 * - Profil Supabase (username, avatar, display_name, bio, status)
 * - Enriched status (emoji + text + expiration)
 * - Visibility (public/private/anonymous)
 * - Préférences locales (langue, thème)
 */

import { ThemePresetId } from "@/constants/theme-presets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ProfileVisibility = "public" | "private" | "anonymous";
export type OnlineStatus = "online" | "offline" | "away" | "busy";

// Theme preference: specific preset or "system" (auto light/dark)
export type ThemePreference = ThemePresetId | "system";

export interface UserProfile {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    website: string | null;
    status: OnlineStatus;
    // Enriched status
    status_emoji: string | null;
    status_expires_at: string | null;
    // Visibility & verification
    visibility: ProfileVisibility;
    is_verified: boolean;
    // Stats (denormalized cache)
    contacts_count: number;
    conversations_count: number;
}

interface UserPreferences {
    locale: "fr" | "en" | "ja";
    theme: ThemePreference;
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    hapticEnabled: boolean;
}

interface UserState {
    // State
    profile: UserProfile | null;
    preferences: UserPreferences;
    isAuthenticated: boolean;

    // Actions
    setProfile: (profile: UserProfile | null) => void;
    updateProfile: (partial: Partial<UserProfile>) => void;
    setPreferences: (partial: Partial<UserPreferences>) => void;
    setAuthenticated: (auth: boolean) => void;
    reset: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
    locale: "fr",
    theme: "system",
    notificationsEnabled: true,
    soundEnabled: true,
    hapticEnabled: true,
};

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            // Initial state
            profile: null,
            preferences: DEFAULT_PREFERENCES,
            isAuthenticated: false,

            // Actions
            setProfile: (profile) => set({ profile }),

            updateProfile: (partial) =>
                set((state) => ({
                    profile: state.profile ? { ...state.profile, ...partial } : null,
                })),

            setPreferences: (partial) =>
                set((state) => ({
                    preferences: { ...state.preferences, ...partial },
                })),

            setAuthenticated: (auth) => set({ isAuthenticated: auth }),

            reset: () =>
                set({
                    profile: null,
                    preferences: DEFAULT_PREFERENCES,
                    isAuthenticated: false,
                }),
        }),
        {
            name: "imuchat-user",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                profile: state.profile,
                preferences: state.preferences,
                // On ne persiste pas isAuthenticated — déterminé par la session Supabase
            }),
        },
    ),
);
