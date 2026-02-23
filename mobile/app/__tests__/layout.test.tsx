/**
 * Phase 5 — Tests layout des onglets (TabLayout)
 * Couvre : présence de chaque Tabs.Screen, titres i18n, nombre total d'onglets
 */
import { render } from "@testing-library/react-native";
import React from "react";

// ─── Mock Tabs to capture Screen declarations ───
const screensRegistered: Record<string, any>[] = [];

jest.mock("expo-router", () => {
  const TabsScreen = (props: any) => {
    screensRegistered.push(props);
    return null;
  };
  const TabsMock = ({ children }: { children: React.ReactNode }) => children;
  TabsMock.Screen = TabsScreen;
  return {
    Tabs: TabsMock,
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    Href: jest.fn(),
  };
});

import TabLayout from "../(tabs)/_layout";

function renderLayout() {
  screensRegistered.length = 0;
  return render(<TabLayout />);
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

describe("TabLayout", () => {
  it("déclare 10 onglets", () => {
    renderLayout();
    expect(screensRegistered.length).toBe(10);
  });

  it("contient un onglet 'index' (home)", () => {
    renderLayout();
    const home = screensRegistered.find((s) => s.name === "index");
    expect(home).toBeDefined();
    expect(home.options.title).toBe("tabs.home");
  });

  it("contient un onglet 'chats'", () => {
    renderLayout();
    const chats = screensRegistered.find((s) => s.name === "chats");
    expect(chats).toBeDefined();
    expect(chats.options.title).toBe("tabs.messages");
  });

  it("contient un onglet 'calls'", () => {
    renderLayout();
    const calls = screensRegistered.find((s) => s.name === "calls");
    expect(calls).toBeDefined();
    expect(calls.options.title).toBe("tabs.calls");
  });

  it("contient un onglet 'contacts'", () => {
    renderLayout();
    const contacts = screensRegistered.find((s) => s.name === "contacts");
    expect(contacts).toBeDefined();
    expect(contacts.options.title).toBe("tabs.contacts");
  });

  it("contient un onglet 'social'", () => {
    renderLayout();
    const social = screensRegistered.find((s) => s.name === "social");
    expect(social).toBeDefined();
    expect(social.options.title).toBe("tabs.social");
  });

  it("contient un onglet 'notifications'", () => {
    renderLayout();
    const notif = screensRegistered.find((s) => s.name === "notifications");
    expect(notif).toBeDefined();
    expect(notif.options.title).toBe("tabs.notifications");
  });

  it("contient un onglet 'watch'", () => {
    renderLayout();
    const watch = screensRegistered.find((s) => s.name === "watch");
    expect(watch).toBeDefined();
    expect(watch.options.title).toBe("tabs.watch");
  });

  it("contient un onglet 'store'", () => {
    renderLayout();
    const store = screensRegistered.find((s) => s.name === "store");
    expect(store).toBeDefined();
    expect(store.options.title).toBe("tabs.store");
  });

  it("contient un onglet 'settings'", () => {
    renderLayout();
    const settings = screensRegistered.find((s) => s.name === "settings");
    expect(settings).toBeDefined();
    expect(settings.options.title).toBe("tabs.settings");
  });

  it("contient un onglet 'profile' caché (href: null)", () => {
    renderLayout();
    const profile = screensRegistered.find((s) => s.name === "profile");
    expect(profile).toBeDefined();
    expect(profile.options.title).toBe("tabs.profile");
    expect(profile.options.href).toBeNull();
  });
});
