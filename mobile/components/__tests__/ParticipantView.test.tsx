/**
 * Tests unitaires pour ParticipantView
 */

import { ThemeProvider } from "@/providers/ThemeProvider";
import type { CallParticipant } from "@/services/calls";
import { render, type RenderOptions } from "@testing-library/react-native";
import React, { type ReactElement } from "react";
import { ParticipantView } from "../ParticipantView";

// Wrapper avec ThemeProvider requis pour Avatar
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui as any, { wrapper: AllTheProviders, ...options });

describe("ParticipantView", () => {
  const mockParticipant: CallParticipant = {
    userId: "user-123",
    name: "John Doe",
    isAudioEnabled: true,
    isVideoEnabled: true,
    isScreenSharing: false,
  };

  it("should render participant name", () => {
    const { getByText } = customRender(
      <ParticipantView participant={mockParticipant} />,
    );
    expect(getByText("John Doe")).toBeTruthy();
  });

  it("should show video placeholder when video is enabled", () => {
    const { getByTestId } = customRender(
      <ParticipantView participant={mockParticipant} />,
    );
    expect(getByTestId("video-placeholder")).toBeTruthy();
  });

  it("should show Avatar when video is disabled", () => {
    const participantWithoutVideo = {
      ...mockParticipant,
      isVideoEnabled: false,
    };

    const { getByTestId } = customRender(
      <ParticipantView participant={participantWithoutVideo} />,
    );
    expect(getByTestId("participant-avatar")).toBeTruthy();
  });

  it("should show muted indicator when audio is disabled", () => {
    const participantMuted = {
      ...mockParticipant,
      isAudioEnabled: false,
    };

    const { getByText } = customRender(
      <ParticipantView participant={participantMuted} />,
    );
    expect(getByText("🔇")).toBeTruthy();
  });

  it("should show camera off indicator when video is disabled", () => {
    const participantNoCamera = {
      ...mockParticipant,
      isVideoEnabled: false,
    };

    const { getByText } = customRender(
      <ParticipantView participant={participantNoCamera} />,
    );
    expect(getByText("🚫")).toBeTruthy();
  });

  it("should show both indicators when audio and video are disabled", () => {
    const participantNoMedias = {
      ...mockParticipant,
      isAudioEnabled: false,
      isVideoEnabled: false,
    };

    const { getByText } = customRender(
      <ParticipantView participant={participantNoMedias} />,
    );
    expect(getByText("🔇")).toBeTruthy();
    expect(getByText("🚫")).toBeTruthy();
  });

  it("should not show indicators when both audio and video are enabled", () => {
    const { queryByText } = customRender(
      <ParticipantView participant={mockParticipant} />,
    );
    expect(queryByText("🔇")).toBeNull();
    expect(queryByText("🚫")).toBeNull();
  });

  it("should render with custom style prop", () => {
    const customStyle = { width: 200, height: 200 };
    const { getByTestId } = customRender(
      <ParticipantView participant={mockParticipant} style={customStyle} />,
    );
    const container = getByTestId("participant-container");
    expect(container).toBeTruthy();
    // Vérifier le style personnalisé serait fait avec snapshot testing
  });

  it("should handle missing name gracefully", () => {
    const participantNoName = {
      ...mockParticipant,
      name: undefined,
      isVideoEnabled: false,
    };

    const { getByTestId, getByText } = customRender(
      <ParticipantView participant={participantNoName} />,
    );
    expect(getByTestId("participant-avatar")).toBeTruthy();
    expect(getByText("common.user")).toBeTruthy(); // Fallback to i18n key
  });

  it("should render overlay with participant info", () => {
    const { getByTestId, getByText } = customRender(
      <ParticipantView participant={mockParticipant} />,
    );

    expect(getByTestId("participant-overlay")).toBeTruthy();
    expect(getByText("John Doe")).toBeTruthy();
  });
});
