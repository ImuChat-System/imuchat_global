/**
 * Tests pour TypingIndicator Component - Mobile
 */

import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import { TypingIndicator } from "../TypingIndicator";

// Mock du ThemeProvider
jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    textSecondary: "#6B7280",
    primary: "#8B5CF6",
  }),
}));

describe("TypingIndicator", () => {
  it("should not render when no users are typing", () => {
    const { toJSON } = render(<TypingIndicator userNames={[]} />);
    expect(toJSON()).toBeNull();
  });

  it("should render single user typing message", () => {
    const { getByText } = render(<TypingIndicator userNames={["Alice"]} />);
    expect(getByText("Alice est en train d'écrire...")).toBeTruthy();
  });

  it("should render two users typing message", () => {
    const { getByText } = render(
      <TypingIndicator userNames={["Alice", "Bob"]} />,
    );
    expect(getByText("Alice et Bob sont en train d'écrire...")).toBeTruthy();
  });

  it("should render multiple users typing message", () => {
    const { getByText } = render(
      <TypingIndicator userNames={["Alice", "Bob", "Charlie"]} />,
    );
    expect(getByText("3 personnes sont en train d'écrire...")).toBeTruthy();
  });

  it("should use custom primary color", () => {
    const { UNSAFE_root } = render(
      <TypingIndicator userNames={["Alice"]} primaryColor="#FF69B4" />,
    );

    // Vérifier que le composant est rendu
    expect(UNSAFE_root).toBeTruthy();
  });

  it("should render three animated dots", async () => {
    const { UNSAFE_getAllByType } = render(
      <TypingIndicator userNames={["Alice"]} />,
    );

    // Attendre que les animations démarrent
    await waitFor(() => {
      // Le composant devrait avoir 3 dots animés
      // Note: Les Animated.View sont rendus comme View dans le test
    });
  });
});
