/**
 * Tests pour StoreScreen — Connecté au modules-store (Phase M1)
 *
 * Le StoreScreen utilise useModulesStore() pour le catalogue,
 * useI18n(), useToast(), useNetworkState(), useRouter().
 */

import React from "react";

// === MOCK DATA ===

function makeModule(overrides: Record<string, unknown> = {}) {
  return {
    id: "mod-1",
    name: "Thème Aurora",
    version: "1.0.0",
    description: "A beautiful theme",
    category: "media" as const,
    icon: "🎨",
    author: "ImuChat",
    license: "MIT",
    entry_url: "https://example.com",
    permissions: [],
    dependencies: [],
    bundle_size: 1024,
    checksum: null,
    signature: null,
    sandbox: "iframe" as const,
    allowed_domains: [],
    content_security_policy: null,
    max_storage_size: 0,
    is_published: true,
    is_verified: true,
    default_enabled: false,
    is_core: false,
    publisher_id: null,
    download_count: 5000,
    rating: 4.8,
    price: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const MOCK_CATALOG = [
  makeModule({
    id: "mod-1",
    name: "Thème Aurora",
    category: "media",
    rating: 4.8,
    download_count: 5000,
    is_verified: true,
    price: null,
  }),
  makeModule({
    id: "mod-2",
    name: "Music Player Pro",
    category: "entertainment",
    rating: 4.5,
    download_count: 3000,
    is_verified: false,
    price: 2.99,
  }),
  makeModule({
    id: "mod-3",
    name: "Anime Sticker Pack",
    category: "creativity",
    rating: 4.2,
    download_count: 8000,
    price: null,
  }),
  makeModule({
    id: "mod-4",
    name: "Bot Assistant",
    category: "services",
    rating: 4.0,
    download_count: 2000,
    price: null,
  }),
  makeModule({
    id: "mod-5",
    name: "Task Manager",
    category: "productivity",
    rating: 3.8,
    download_count: 1000,
    price: 0.99,
  }),
];

// === MOCKS ===

const mockFetchCatalog = jest.fn().mockResolvedValue(undefined);
const mockFetchInstalled = jest.fn().mockResolvedValue(undefined);
const mockInstall = jest.fn().mockResolvedValue(undefined);
const mockUninstall = jest.fn().mockResolvedValue(undefined);
const mockIsInstalled = jest.fn().mockReturnValue(false);
const mockIsActive = jest.fn().mockReturnValue(false);
const mockRunAutoInstall = jest.fn().mockResolvedValue(undefined);
const mockLoadReviews = jest.fn().mockResolvedValue(undefined);
const mockLoadUserReview = jest.fn().mockResolvedValue(undefined);
const mockSubmitReview = jest.fn().mockResolvedValue(undefined);
const mockRemoveReview = jest.fn().mockResolvedValue(undefined);
const mockFetchRecommendations = jest.fn().mockResolvedValue(undefined);

jest.mock("@/services/store-notifications", () => ({
  hasNotificationPermissions: jest.fn().mockResolvedValue(false),
  requestNotificationPermissions: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/stores/modules-store", () => ({
  useModulesStore: () => ({
    catalog: MOCK_CATALOG,
    catalogLoading: false,
    catalogError: null,
    installedModules: [],
    fetchCatalog: mockFetchCatalog,
    fetchInstalled: mockFetchInstalled,
    install: mockInstall,
    uninstall: mockUninstall,
    isInstalled: mockIsInstalled,
    isActive: mockIsActive,
    runAutoInstall: mockRunAutoInstall,
    reviews: {},
    reviewStats: {},
    userReviews: {},
    reviewsLoading: false,
    recommendations: [],
    recommendationsLoading: false,
    loadReviews: mockLoadReviews,
    loadUserReview: mockLoadUserReview,
    submitReview: mockSubmitReview,
    removeReview: mockRemoveReview,
    fetchRecommendations: mockFetchRecommendations,
  }),
}));

jest.mock("@/hooks/useNetworkState", () => ({
  useNetworkState: () => ({ isConnected: true }),
}));

jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    background: "#0f0a1a",
    surface: "#1a1525",
    text: "#fff",
    textMuted: "#aaa",
    border: "#333",
    primary: "#ec4899",
    error: "#ef4444",
  }),
  useSpacing: () => ({ xs: 4, sm: 8, md: 12, lg: 16, xl: 24 }),
}));

import StoreScreen from "@/app/(tabs)/store";
import { fireEvent, render } from "@testing-library/react-native";

// ===================================================================

describe("StoreScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsInstalled.mockReturnValue(false);
    mockIsActive.mockReturnValue(false);
  });

  it("affiche l'écran store", () => {
    const { getByTestId } = render(<StoreScreen />);
    expect(getByTestId("store-screen")).toBeTruthy();
  });

  it("affiche le titre Store", () => {
    const { getByText } = render(<StoreScreen />);
    expect(getByText(/store\.title/)).toBeTruthy();
  });

  // ---- Hero Banner ----

  it("affiche le hero banner", () => {
    const { getByTestId } = render(<StoreScreen />);
    // Hero = highest-rated verified non-core module → mod-1 (4.8, verified)
    expect(getByTestId("store-hero")).toBeTruthy();
  });

  // ---- Search ----

  it("affiche la barre de recherche", () => {
    const { getByTestId } = render(<StoreScreen />);
    expect(getByTestId("store-search")).toBeTruthy();
  });

  it("filtre les résultats par recherche", () => {
    const { getByTestId, queryByTestId } = render(<StoreScreen />);
    fireEvent.changeText(getByTestId("store-search"), "Aurora");
    expect(getByTestId("store-item-mod-1")).toBeTruthy(); // Thème Aurora
    expect(queryByTestId("store-item-mod-2")).toBeNull(); // Music Player Pro
  });

  it("affiche le bouton clear quand on recherche", () => {
    const { getByTestId } = render(<StoreScreen />);
    fireEvent.changeText(getByTestId("store-search"), "test");
    expect(getByTestId("search-clear")).toBeTruthy();
  });

  it("efface la recherche au clic sur clear", () => {
    const { getByTestId } = render(<StoreScreen />);
    fireEvent.changeText(getByTestId("store-search"), "Aurora");
    fireEvent.press(getByTestId("search-clear"));
    // All items should be back
    expect(getByTestId("store-item-mod-1")).toBeTruthy();
    expect(getByTestId("store-item-mod-2")).toBeTruthy();
  });

  // ---- Tabs ----

  it("affiche les 5 onglets", () => {
    const { getByTestId } = render(<StoreScreen />);
    expect(getByTestId("tab-all")).toBeTruthy();
    expect(getByTestId("tab-apps")).toBeTruthy();
    expect(getByTestId("tab-installed")).toBeTruthy();
    expect(getByTestId("tab-contents")).toBeTruthy();
    expect(getByTestId("tab-services")).toBeTruthy();
  });

  it("filtre par onglet Apps", () => {
    // CATEGORY_TAB_MAP: productivity → apps
    const { getByTestId, queryByTestId } = render(<StoreScreen />);
    fireEvent.press(getByTestId("tab-apps"));
    expect(getByTestId("store-item-mod-5")).toBeTruthy(); // Task Manager (productivity → apps)
    expect(queryByTestId("store-item-mod-1")).toBeNull(); // Thème Aurora (media → contents)
  });

  it("filtre par onglet Contents", () => {
    // CATEGORY_TAB_MAP: media, entertainment, creativity → contents
    const { getByTestId, queryByTestId } = render(<StoreScreen />);
    fireEvent.press(getByTestId("tab-contents"));
    expect(getByTestId("store-item-mod-1")).toBeTruthy(); // Thème Aurora (media)
    expect(getByTestId("store-item-mod-2")).toBeTruthy(); // Music Player Pro (entertainment)
    expect(getByTestId("store-item-mod-3")).toBeTruthy(); // Anime Sticker Pack (creativity)
    expect(queryByTestId("store-item-mod-4")).toBeNull(); // Bot Assistant (services)
  });

  it("filtre par onglet Services", () => {
    // CATEGORY_TAB_MAP: services → services
    const { getByTestId, queryByTestId } = render(<StoreScreen />);
    fireEvent.press(getByTestId("tab-services"));
    expect(getByTestId("store-item-mod-4")).toBeTruthy(); // Bot Assistant (services)
    expect(queryByTestId("store-item-mod-1")).toBeNull(); // Thème Aurora
  });

  // ---- Sort ----

  it("affiche la barre de tri", () => {
    const { getByTestId } = render(<StoreScreen />);
    expect(getByTestId("sort-bar")).toBeTruthy();
  });

  it("affiche les options de tri", () => {
    const { getByTestId } = render(<StoreScreen />);
    expect(getByTestId("sort-popular")).toBeTruthy();
    expect(getByTestId("sort-newest")).toBeTruthy();
    expect(getByTestId("sort-rating")).toBeTruthy();
    expect(getByTestId("sort-price-asc")).toBeTruthy();
  });

  // ---- Product grid ----

  it("affiche la grille de produits", () => {
    const { getByTestId } = render(<StoreScreen />);
    expect(getByTestId("store-grid")).toBeTruthy();
  });

  it("affiche les 5 items du catalogue", () => {
    const { getByTestId } = render(<StoreScreen />);
    for (let i = 1; i <= 5; i++) {
      expect(getByTestId(`store-item-mod-${i}`)).toBeTruthy();
    }
  });

  it("affiche Gratuit pour les items sans prix", () => {
    const { getAllByText } = render(<StoreScreen />);
    const freeLabels = getAllByText("common.free");
    expect(freeLabels.length).toBeGreaterThan(0);
  });

  it("affiche les prix corrects", () => {
    const { getByText } = render(<StoreScreen />);
    expect(getByText("2.99€")).toBeTruthy();
    expect(getByText("0.99€")).toBeTruthy();
  });

  it("affiche Aucun résultat pour une recherche sans match", () => {
    const { getByTestId } = render(<StoreScreen />);
    fireEvent.changeText(getByTestId("store-search"), "xyzinexistant");
    expect(getByTestId("no-results")).toBeTruthy();
  });

  // ---- Install Modal ----

  it("ouvre la modale d'installation au clic sur un item", () => {
    const { getByTestId } = render(<StoreScreen />);
    fireEvent.press(getByTestId("store-item-mod-1"));
    expect(getByTestId("install-modal")).toBeTruthy();
    expect(getByTestId("btn-install")).toBeTruthy();
  });

  it("affiche le bouton fermer dans la modale", () => {
    const { getByTestId } = render(<StoreScreen />);
    fireEvent.press(getByTestId("store-item-mod-1"));
    expect(getByTestId("btn-close-modal")).toBeTruthy();
  });

  it("affiche le nom de l'item dans la modale", () => {
    const { getByTestId, getAllByText } = render(<StoreScreen />);
    fireEvent.press(getByTestId("store-item-mod-1"));
    const titles = getAllByText("Thème Aurora");
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  // ---- Combined filter + search ----

  it("combine onglet et recherche", () => {
    const { getByTestId, queryByTestId } = render(<StoreScreen />);
    // Contents tab: mod-1, mod-2, mod-3
    fireEvent.press(getByTestId("tab-contents"));
    fireEvent.changeText(getByTestId("store-search"), "Music");
    expect(getByTestId("store-item-mod-2")).toBeTruthy();
    expect(queryByTestId("store-item-mod-1")).toBeNull(); // Thème Aurora doesn't match "Music"
  });
});
