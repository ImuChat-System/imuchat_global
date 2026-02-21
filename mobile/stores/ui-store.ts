/**
 * UI Store (Zustand)
 *
 * État global de l'interface :
 * - Tab active
 * - Modal states
 * - Keyboard visible
 * - Network status
 * - Bottom sheet refs
 */

import { create } from "zustand";

type ActiveTab = "index" | "chats" | "contacts" | "social" | "store";

interface UIState {
    // Navigation
    activeTab: ActiveTab;

    // Network
    isOnline: boolean;
    isReconnecting: boolean;

    // UI flags
    isKeyboardVisible: boolean;
    isSearchOpen: boolean;

    // Actions
    setActiveTab: (tab: ActiveTab) => void;
    setOnline: (online: boolean) => void;
    setReconnecting: (reconnecting: boolean) => void;
    setKeyboardVisible: (visible: boolean) => void;
    setSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
    // Initial state
    activeTab: "chats",
    isOnline: true,
    isReconnecting: false,
    isKeyboardVisible: false,
    isSearchOpen: false,

    // Actions
    setActiveTab: (tab) => set({ activeTab: tab }),
    setOnline: (online) => set({ isOnline: online }),
    setReconnecting: (reconnecting) => set({ isReconnecting: reconnecting }),
    setKeyboardVisible: (visible) => set({ isKeyboardVisible: visible }),
    setSearchOpen: (open) => set({ isSearchOpen: open }),
}));
