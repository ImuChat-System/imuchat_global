/**
 * Tests for stores/user-store.ts and stores/ui-store.ts
 *
 * Zustand stores are tested by manipulating state directly via getState/setState.
 */

// Mock AsyncStorage for persist middleware
jest.mock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: {
        getItem: jest.fn().mockResolvedValue(null),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
    },
}));

// Mock ThemePresetId import
jest.mock("../../constants/theme-presets", () => ({
    ThemePresetId: {},
}));

import { useUIStore } from "../ui-store";
import { useUserStore } from "../user-store";

// ─── User Store ────────────────────────────────────────

describe("useUserStore", () => {
    beforeEach(() => {
        // Reset to initial state
        useUserStore.getState().reset();
    });

    describe("initial state", () => {
        it("has null profile", () => {
            expect(useUserStore.getState().profile).toBeNull();
        });

        it("has default preferences", () => {
            const { preferences } = useUserStore.getState();
            expect(preferences.locale).toBe("fr");
            expect(preferences.theme).toBe("system");
            expect(preferences.notificationsEnabled).toBe(true);
            expect(preferences.soundEnabled).toBe(true);
            expect(preferences.hapticEnabled).toBe(true);
        });

        it("is not authenticated", () => {
            expect(useUserStore.getState().isAuthenticated).toBe(false);
        });
    });

    describe("setProfile", () => {
        it("sets the user profile", () => {
            const profile = {
                id: "user-1",
                username: "alice",
                display_name: "Alice",
                avatar_url: null,
                bio: null,
                website: null,
                status: "online" as const,
                status_emoji: null,
                status_expires_at: null,
                visibility: "public" as const,
                is_verified: false,
                contacts_count: 0,
                conversations_count: 0,
            };

            useUserStore.getState().setProfile(profile);
            expect(useUserStore.getState().profile).toEqual(profile);
        });

        it("can set profile to null", () => {
            useUserStore.getState().setProfile({
                id: "u1",
                username: "a",
                display_name: null,
                avatar_url: null,
                bio: null,
                website: null,
                status: "online",
                status_emoji: null,
                status_expires_at: null,
                visibility: "public",
                is_verified: false,
                contacts_count: 0,
                conversations_count: 0,
            });
            useUserStore.getState().setProfile(null);
            expect(useUserStore.getState().profile).toBeNull();
        });
    });

    describe("updateProfile", () => {
        it("partially updates the profile", () => {
            useUserStore.getState().setProfile({
                id: "u1",
                username: "alice",
                display_name: "Alice",
                avatar_url: null,
                bio: null,
                website: null,
                status: "online",
                status_emoji: null,
                status_expires_at: null,
                visibility: "public",
                is_verified: false,
                contacts_count: 0,
                conversations_count: 0,
            });

            useUserStore.getState().updateProfile({ bio: "Hello!", status: "away" });

            const profile = useUserStore.getState().profile!;
            expect(profile.bio).toBe("Hello!");
            expect(profile.status).toBe("away");
            expect(profile.username).toBe("alice"); // unchanged
        });

        it("does nothing if profile is null", () => {
            useUserStore.getState().setProfile(null);
            useUserStore.getState().updateProfile({ bio: "test" });
            expect(useUserStore.getState().profile).toBeNull();
        });
    });

    describe("setPreferences", () => {
        it("partially updates preferences", () => {
            useUserStore.getState().setPreferences({ locale: "en", soundEnabled: false });

            const prefs = useUserStore.getState().preferences;
            expect(prefs.locale).toBe("en");
            expect(prefs.soundEnabled).toBe(false);
            expect(prefs.notificationsEnabled).toBe(true); // unchanged
        });

        it("updates theme preference", () => {
            useUserStore.getState().setPreferences({ theme: "dark" as any });
            expect(useUserStore.getState().preferences.theme).toBe("dark");
        });
    });

    describe("setAuthenticated", () => {
        it("sets isAuthenticated to true", () => {
            useUserStore.getState().setAuthenticated(true);
            expect(useUserStore.getState().isAuthenticated).toBe(true);
        });

        it("sets isAuthenticated to false", () => {
            useUserStore.getState().setAuthenticated(true);
            useUserStore.getState().setAuthenticated(false);
            expect(useUserStore.getState().isAuthenticated).toBe(false);
        });
    });

    describe("reset", () => {
        it("restores all state to defaults", () => {
            useUserStore.getState().setProfile({
                id: "u1",
                username: "a",
                display_name: null,
                avatar_url: null,
                bio: null,
                website: null,
                status: "online",
                status_emoji: null,
                status_expires_at: null,
                visibility: "public",
                is_verified: false,
                contacts_count: 0,
                conversations_count: 0,
            });
            useUserStore.getState().setAuthenticated(true);
            useUserStore.getState().setPreferences({ locale: "ja" });

            useUserStore.getState().reset();

            expect(useUserStore.getState().profile).toBeNull();
            expect(useUserStore.getState().isAuthenticated).toBe(false);
            expect(useUserStore.getState().preferences.locale).toBe("fr");
        });
    });
});

// ─── UI Store ──────────────────────────────────────────

describe("useUIStore", () => {
    beforeEach(() => {
        // Reset UI store to defaults
        useUIStore.setState({
            activeTab: "chats",
            isOnline: true,
            isReconnecting: false,
            isKeyboardVisible: false,
            isSearchOpen: false,
        });
    });

    describe("initial state", () => {
        it("defaults to chats tab", () => {
            expect(useUIStore.getState().activeTab).toBe("chats");
        });

        it("defaults to online", () => {
            expect(useUIStore.getState().isOnline).toBe(true);
        });

        it("defaults to keyboard not visible", () => {
            expect(useUIStore.getState().isKeyboardVisible).toBe(false);
        });

        it("defaults to search closed", () => {
            expect(useUIStore.getState().isSearchOpen).toBe(false);
        });
    });

    describe("setActiveTab", () => {
        it("changes the active tab", () => {
            useUIStore.getState().setActiveTab("social");
            expect(useUIStore.getState().activeTab).toBe("social");
        });

        it("switches between tabs", () => {
            useUIStore.getState().setActiveTab("contacts");
            useUIStore.getState().setActiveTab("store");
            expect(useUIStore.getState().activeTab).toBe("store");
        });
    });

    describe("setOnline", () => {
        it("sets online to false", () => {
            useUIStore.getState().setOnline(false);
            expect(useUIStore.getState().isOnline).toBe(false);
        });

        it("sets online back to true", () => {
            useUIStore.getState().setOnline(false);
            useUIStore.getState().setOnline(true);
            expect(useUIStore.getState().isOnline).toBe(true);
        });
    });

    describe("setReconnecting", () => {
        it("sets reconnecting state", () => {
            useUIStore.getState().setReconnecting(true);
            expect(useUIStore.getState().isReconnecting).toBe(true);
        });
    });

    describe("setKeyboardVisible", () => {
        it("tracks keyboard visibility", () => {
            useUIStore.getState().setKeyboardVisible(true);
            expect(useUIStore.getState().isKeyboardVisible).toBe(true);
        });
    });

    describe("setSearchOpen", () => {
        it("toggles search state", () => {
            useUIStore.getState().setSearchOpen(true);
            expect(useUIStore.getState().isSearchOpen).toBe(true);
            useUIStore.getState().setSearchOpen(false);
            expect(useUIStore.getState().isSearchOpen).toBe(false);
        });
    });
});
