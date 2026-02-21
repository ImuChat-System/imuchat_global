/**
 * User Store (Zustand + AsyncStorage persist)
 *
 * Profil utilisateur courant et préférences :
 * - Profil Supabase (username, avatar, full_name)
 * - Préférences locales (langue, thème)
 * - Status en ligne
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface UserProfile {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    status: "online" | "offline" | "away" | "busy";
}

interface UserPreferences {
    locale: "fr" | "en" | "ja";
    theme: "light" | "dark" | "system";
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
