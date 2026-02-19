/**
 * Tests pour StoreScreen — Parité web store page
 */

import React from "react";

// === MOCKS ===

jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    background: "#0f0a1a",
    surface: "#1a1525",
    text: "#fff",
    textMuted: "#aaa",
    border: "#333",
    primary: "#ec4899",
  }),
  useSpacing: () => ({ xs: 4, sm: 8, md: 12, lg: 16, xl: 24 }),
}));

import StoreScreen from "@/app/(tabs)/store";
import { fireEvent, render } from "@testing-library/react-native";

// ===================================================================

describe("StoreScreen", () => {
  it("affiche l'écran store", () => {
    const { getByTestId } = render(<StoreScreen />);
    expect(getByTestId("store-screen")).toBeTruthy();
  });

  it("affiche le titre Store", () => {
    const { getByText } = render(<StoreScreen />);
    expect(getByText(/Store/)).toBeTruthy();
  });

  // ---- Hero Banner ----

  it("affiche le hero banner", () => {
    const { getByTestId } = render(<StoreScreen />);
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
    expect(getByTestId("store-item-si-1")).toBeTruthy(); // Thème Aurora
    expect(queryByTestId("store-item-si-2")).toBeNull(); // Music Player Pro
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
    expect(getByTestId("store-item-si-1")).toBeTruthy();
    expect(getByTestId("store-item-si-2")).toBeTruthy();
  });

  // ---- Tabs ----

  it("affiche les 5 onglets", () => {
    const { getByTestId } = render(<StoreScreen />);
    expect(getByTestId("tab-all")).toBeTruthy();
    expect(getByTestId("tab-apps")).toBeTruthy();
    expect(getByTestId("tab-contents")).toBeTruthy();
    expect(getByTestId("tab-services")).toBeTruthy();
    expect(getByTestId("tab-bundles")).toBeTruthy();
  });

  it("filtre par onglet Apps", () => {
    const { getByTestId, queryByTestId } = render(<StoreScreen />);
    fireEvent.press(getByTestId("tab-apps"));
    expect(getByTestId("store-item-si-2")).toBeTruthy(); // Music Player Pro (apps)
    expect(queryByTestId("store-item-si-1")).toBeNull(); // Thème Aurora (contents)
  });

  it("filtre par onglet Contents", () => {
    const { getByTestId, queryByTestId } = render(<StoreScreen />);
    fireEvent.press(getByTestId("tab-contents"));
    expect(getByTestId("store-item-si-1")).toBeTruthy(); // Thème Aurora
    expect(getByTestId("store-item-si-3")).toBeTruthy(); // Anime Sticker Pack
    expect(queryByTestId("store-item-si-4")).toBeNull(); // Bot Assistant (services)
  });

  it("filtre par onglet Bundles", () => {
    const { getByTestId, queryByTestId } = render(<StoreScreen />);
    fireEvent.press(getByTestId("tab-bundles"));
    expect(getByTestId("store-item-si-5")).toBeTruthy(); // Starter Bundle
    expect(getByTestId("store-item-si-9")).toBeTruthy(); // Premium Theme Pack
    expect(queryByTestId("store-item-si-1")).toBeNull();
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
    expect(getByTestId("sort-price-asc")).toBeTruthy();
    expect(getByTestId("sort-price-desc")).toBeTruthy();
  });

  // ---- Product grid ----

  it("affiche la grille de produits", () => {
    const { getByTestId } = render(<StoreScreen />);
    expect(getByTestId("store-grid")).toBeTruthy();
  });

  it("affiche les 10 items du catalogue", () => {
    const { getByTestId } = render(<StoreScreen />);
    for (let i = 1; i <= 10; i++) {
      expect(getByTestId(`store-item-si-${i}`)).toBeTruthy();
    }
  });

  it("affiche Gratuit pour les items sans prix", () => {
    const { getAllByText } = render(<StoreScreen />);
    const freeLabels = getAllByText("Gratuit");
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

  // ---- Purchase Modal ----

  it("ouvre la modale d'achat au clic sur un item", () => {
    const { getByTestId } = render(<StoreScreen />);
    fireEvent.press(getByTestId("store-item-si-1"));
    expect(getByTestId("purchase-modal")).toBeTruthy();
    expect(getByTestId("btn-purchase")).toBeTruthy();
  });

  it("affiche le bouton fermer dans la modale", () => {
    const { getByTestId } = render(<StoreScreen />);
    fireEvent.press(getByTestId("store-item-si-1"));
    expect(getByTestId("btn-close-modal")).toBeTruthy();
  });

  it("affiche le nom de l'item dans la modale", () => {
    const { getByTestId, getAllByText } = render(<StoreScreen />);
    fireEvent.press(getByTestId("store-item-si-1"));
    const titles = getAllByText("Thème Aurora");
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  // ---- Combined filter + search ----

  it("combine onglet et recherche", () => {
    const { getByTestId, queryByTestId } = render(<StoreScreen />);
    fireEvent.press(getByTestId("tab-apps"));
    fireEvent.changeText(getByTestId("store-search"), "Music");
    expect(getByTestId("store-item-si-2")).toBeTruthy();
    expect(queryByTestId("store-item-si-8")).toBeNull(); // Games Hub (apps but not matching "Music")
  });
});
