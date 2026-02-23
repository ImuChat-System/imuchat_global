/**
 * Tests pour WatchScreen — Parité web watch hub
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

import WatchScreen from "@/app/(tabs)/watch";
import { fireEvent, render } from "@testing-library/react-native";

// ===================================================================

describe("WatchScreen", () => {
  it("affiche l'écran watch", () => {
    const { getByTestId } = render(<WatchScreen />);
    expect(getByTestId("watch-screen")).toBeTruthy();
  });

  it("affiche le titre Watch", () => {
    const { getAllByText } = render(<WatchScreen />);
    // "Watch" appears in title and in section headings
    const matches = getAllByText(/watch\.title/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  // ---- Featured Carousel ----

  it("affiche le featured carousel", () => {
    const { getByTestId } = render(<WatchScreen />);
    expect(getByTestId("featured-carousel")).toBeTruthy();
  });

  // ---- Category Filter ----

  it("affiche le filtre de catégories", () => {
    const { getByTestId } = render(<WatchScreen />);
    expect(getByTestId("category-filter")).toBeTruthy();
  });

  it("affiche les 5 catégories", () => {
    const { getByTestId } = render(<WatchScreen />);
    expect(getByTestId("category-all")).toBeTruthy();
    expect(getByTestId("category-anime")).toBeTruthy();
    expect(getByTestId("category-movie")).toBeTruthy();
    expect(getByTestId("category-series")).toBeTruthy();
    expect(getByTestId("category-documentary")).toBeTruthy();
  });

  it("filtre les parties par catégorie anime", () => {
    const { getByTestId, queryByTestId } = render(<WatchScreen />);
    fireEvent.press(getByTestId("category-anime"));
    // anime parties should be visible
    expect(getByTestId("party-wp1")).toBeTruthy(); // Dragon Ball Super
    expect(getByTestId("party-wp5")).toBeTruthy(); // Attack on Titan
    // non-anime should be hidden
    expect(queryByTestId("party-wp2")).toBeNull(); // Breaking Bad (series)
    expect(queryByTestId("party-wp3")).toBeNull(); // Interstellar (movie)
  });

  it("filtre les parties par catégorie movie", () => {
    const { getByTestId, queryByTestId } = render(<WatchScreen />);
    fireEvent.press(getByTestId("category-movie"));
    expect(getByTestId("party-wp3")).toBeTruthy(); // Interstellar
    expect(queryByTestId("party-wp1")).toBeNull(); // Dragon Ball
  });

  it("retourne à Tout au clic sur all", () => {
    const { getByTestId } = render(<WatchScreen />);
    fireEvent.press(getByTestId("category-anime"));
    fireEvent.press(getByTestId("category-all"));
    expect(getByTestId("party-wp1")).toBeTruthy();
    expect(getByTestId("party-wp2")).toBeTruthy();
    expect(getByTestId("party-wp3")).toBeTruthy();
  });

  // ---- Watch Parties ----

  it("affiche la liste des parties en direct", () => {
    const { getByTestId } = render(<WatchScreen />);
    expect(getByTestId("parties-list")).toBeTruthy();
  });

  it("affiche les 5 watch parties", () => {
    const { getByTestId } = render(<WatchScreen />);
    expect(getByTestId("party-wp1")).toBeTruthy();
    expect(getByTestId("party-wp2")).toBeTruthy();
    expect(getByTestId("party-wp3")).toBeTruthy();
    expect(getByTestId("party-wp4")).toBeTruthy();
    expect(getByTestId("party-wp5")).toBeTruthy();
  });

  it("affiche les boutons Rejoindre", () => {
    const { getByTestId } = render(<WatchScreen />);
    expect(getByTestId("join-party-wp1")).toBeTruthy();
  });

  it("affiche aucune party quand le filtre est vide", () => {
    const { getByTestId, queryByTestId } = render(<WatchScreen />);
    fireEvent.press(getByTestId("category-documentary"));
    // Only wp4 is documentary
    expect(getByTestId("party-wp4")).toBeTruthy();
    // Others are filtered out
    expect(queryByTestId("party-wp1")).toBeNull();
  });

  // ---- Upcoming ----

  it("affiche la section À venir", () => {
    const { getByTestId } = render(<WatchScreen />);
    expect(getByTestId("upcoming-list")).toBeTruthy();
  });

  it("affiche les 3 upcoming parties", () => {
    const { getByTestId } = render(<WatchScreen />);
    expect(getByTestId("upcoming-up1")).toBeTruthy();
    expect(getByTestId("upcoming-up2")).toBeTruthy();
    expect(getByTestId("upcoming-up3")).toBeTruthy();
  });

  it("affiche les titres des upcoming parties", () => {
    const { getByText } = render(<WatchScreen />);
    expect(getByText("Marvel Movie Night")).toBeTruthy();
    expect(getByText(/Jujutsu Kaisen/)).toBeTruthy();
  });

  // ---- Create CTA ----

  it("affiche le bouton créer une Watch Party", () => {
    const { getByTestId } = render(<WatchScreen />);
    expect(getByTestId("btn-create-party")).toBeTruthy();
  });

  it("affiche le texte du CTA", () => {
    const { getByText } = render(<WatchScreen />);
    expect(getByText(/watch\.createParty/)).toBeTruthy();
  });

  // ---- Section titles ----

  it("affiche les titres de section", () => {
    const { getByText } = render(<WatchScreen />);
    expect(getByText(/watch\.live/)).toBeTruthy();
    expect(getByText(/watch\.upcoming/)).toBeTruthy();
  });
});
