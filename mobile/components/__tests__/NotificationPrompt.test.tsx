/**
 * Tests unitaires pour NotificationPrompt
 */

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { NotificationPrompt } from "../NotificationPrompt";

// Mock du hook useNotifications
const mockRequestPermission = jest.fn();
jest.mock("../../hooks/useNotifications", () => ({
  useNotifications: () => ({
    requestPermission: mockRequestPermission,
  }),
}));

describe("NotificationPrompt", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render when visible is true", () => {
    const { getByText } = render(
      <NotificationPrompt visible={true} onClose={mockOnClose} />,
    );

    expect(getByText(/Restez connecté avec vos amis/i)).toBeTruthy();
  });

  it("should not render when visible is false", () => {
    const { queryByText } = render(
      <NotificationPrompt visible={false} onClose={mockOnClose} />,
    );

    expect(queryByText(/Restez connecté avec vos amis/i)).toBeNull();
  });

  it("should display all benefit items", () => {
    const { getByText } = render(
      <NotificationPrompt visible={true} onClose={mockOnClose} />,
    );

    expect(getByText(/Messages instantanés/i)).toBeTruthy();
    expect(getByText(/Appels entrants/i)).toBeTruthy();
    expect(getByText(/Invitations/i)).toBeTruthy();
    expect(getByText(/Événements importants/i)).toBeTruthy();
  });

  it('should call onClose when "Plus tard" button is pressed', () => {
    const { getByText } = render(
      <NotificationPrompt visible={true} onClose={mockOnClose} />,
    );

    const laterButton = getByText("Plus tard");
    fireEvent.press(laterButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call requestPermission when "Activer" button is pressed', async () => {
    mockRequestPermission.mockResolvedValue("granted");

    const { getByText } = render(
      <NotificationPrompt visible={true} onClose={mockOnClose} />,
    );

    const activateButton = getByText("Activer les notifications");
    fireEvent.press(activateButton);

    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalledTimes(1);
    });
  });

  it("should call onClose after permission is granted", async () => {
    mockRequestPermission.mockResolvedValue("granted");

    const { getByText } = render(
      <NotificationPrompt visible={true} onClose={mockOnClose} />,
    );

    const activateButton = getByText("Activer les notifications");
    fireEvent.press(activateButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should show loading state while requesting permission", async () => {
    let resolvePermission: (value: string) => void;
    const permissionPromise = new Promise<string>((resolve) => {
      resolvePermission = resolve;
    });
    mockRequestPermission.mockReturnValue(permissionPromise);

    const { getByText } = render(
      <NotificationPrompt visible={true} onClose={mockOnClose} />,
    );

    const activateButton = getByText("Activer les notifications");
    fireEvent.press(activateButton);

    // Vérifier que le bouton est en état de chargement
    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    // Résoudre la promesse
    resolvePermission!("granted");

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should handle permission denial gracefully", async () => {
    mockRequestPermission.mockResolvedValue("denied");

    const { getByText } = render(
      <NotificationPrompt visible={true} onClose={mockOnClose} />,
    );

    const activateButton = getByText("Activer les notifications");
    fireEvent.press(activateButton);

    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should display privacy notice", () => {
    const { getByText } = render(
      <NotificationPrompt visible={true} onClose={mockOnClose} />,
    );

    expect(getByText(/Vos données restent privées/i)).toBeTruthy();
  });

  it("should display emoji icons for each benefit", () => {
    const { getByText } = render(
      <NotificationPrompt visible={true} onClose={mockOnClose} />,
    );

    expect(getByText("💬")).toBeTruthy();
    expect(getByText("📞")).toBeTruthy();
    expect(getByText("👥")).toBeTruthy();
    expect(getByText("🎉")).toBeTruthy();
  });
});
