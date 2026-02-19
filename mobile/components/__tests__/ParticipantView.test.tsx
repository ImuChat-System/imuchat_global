/**
 * Tests unitaires pour ParticipantView
 */

import type { CallParticipant } from "@/services/calls";
import { render } from "@testing-library/react-native";
import React from "react";
import { ParticipantView } from "../ParticipantView";

describe("ParticipantView", () => {
  const mockParticipant: CallParticipant = {
    userId: "user-123",
    name: "John Doe",
    isAudioEnabled: true,
    isVideoEnabled: true,
    isScreenSharing: false,
  };

  it("should render participant name", () => {
    const { getByText } = render(
      <ParticipantView participant={mockParticipant} />,
    );
    expect(getByText("John Doe")).toBeTruthy();
  });

  it("should show video placeholder when video is enabled", () => {
    const { getByTestId } = render(
      <ParticipantView participant={mockParticipant} />,
    );
    expect(getByTestId("video-placeholder")).toBeTruthy();
  });

  it("should show Avatar when video is disabled", () => {
    const participantWithoutVideo = {
      ...mockParticipant,
      isVideoEnabled: false,
    };

    const { getByTestId } = render(
      <ParticipantView participant={participantWithoutVideo} />,
    );
    expect(getByTestId("participant-avatar")).toBeTruthy();
  });

  it("should show muted indicator when audio is disabled", () => {
    const participantMuted = {
      ...mockParticipant,
      isAudioEnabled: false,
    };

    const { getByText } = render(
      <ParticipantView participant={participantMuted} />,
    );
    expect(getByText("🔇")).toBeTruthy();
  });

  it("should show camera off indicator when video is disabled", () => {
    const participantNoCamera = {
      ...mockParticipant,
      isVideoEnabled: false,
    };

    const { getByText } = render(
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

    const { getByText } = render(
      <ParticipantView participant={participantNoMedias} />,
    );
    expect(getByText("🔇")).toBeTruthy();
    expect(getByText("🚫")).toBeTruthy();
  });

  it("should not show indicators when both audio and video are enabled", () => {
    const { queryByText } = render(
      <ParticipantView participant={mockParticipant} />,
    );
    expect(queryByText("🔇")).toBeNull();
    expect(queryByText("🚫")).toBeNull();
  });

  it("should render with custom style prop", () => {
    const customStyle = { width: 200, height: 200 };
    const { getByTestId } = render(
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

    const { getByTestId, getByText } = render(
      <ParticipantView participant={participantNoName} />,
    );
    expect(getByTestId("participant-avatar")).toBeTruthy();
    expect(getByText("User")).toBeTruthy(); // Fallback to "User"
  });

  it("should render overlay with participant info", () => {
    const { getByTestId, getByText } = render(
      <ParticipantView participant={mockParticipant} />,
    );

    expect(getByTestId("participant-overlay")).toBeTruthy();
    expect(getByText("John Doe")).toBeTruthy();
  });
});
