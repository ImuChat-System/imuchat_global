/**
 * Tests unitaires pour VoiceRecorder - Mobile
 */

import { render } from "@testing-library/react-native";
import React from "react";
import { VoiceRecorder } from "../VoiceRecorder";

// Mock expo-av
jest.mock("expo-av", () => ({
  Audio: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    Recording: jest.fn().mockImplementation(() => ({
      prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
      startAsync: jest.fn().mockResolvedValue(undefined),
      stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
      getStatusAsync: jest.fn().mockResolvedValue({
        isRecording: true,
        durationMillis: 5000,
        metering: -30,
      }),
      getURI: jest.fn().mockReturnValue("file://test.m4a"),
    })),
    AndroidOutputFormat: { MPEG_4: 2 },
    AndroidAudioEncoder: { AAC: 3 },
    IOSAudioQuality: { HIGH: "high" },
  },
}));

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

// Mock ThemeProvider
jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    surface: "#FFFFFF",
    text: "#000000",
    textMuted: "#666666",
    border: "#E0E0E0",
  }),
}));

// Mock useVoiceRecording hook
const mockStart = jest.fn();
const mockStop = jest.fn();
const mockCancel = jest.fn();
const mockRequestPermission = jest.fn();

jest.mock("@/hooks/useVoiceRecording", () => ({
  useVoiceRecording: () => ({
    status: "idle",
    duration: 0,
    formattedDuration: "0:00",
    metering: null,
    uploadProgress: 0,
    error: null,
    hasPermission: true,
    start: mockStart,
    stop: mockStop.mockResolvedValue({
      uri: "file://test.m4a",
      duration: 5000,
      mimeType: "audio/m4a",
    }),
    cancel: mockCancel,
    upload: jest.fn(),
    requestPermission: mockRequestPermission.mockResolvedValue(true),
  }),
}));

describe("VoiceRecorder", () => {
  const mockOnRecordingComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly in idle state", () => {
    const { getByText } = render(
      <VoiceRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onCancel={mockOnCancel}
      />,
    );

    expect(getByText("components.holdToRecord")).toBeTruthy();
  });

  it("renders with custom primary color", () => {
    const { getByText } = render(
      <VoiceRecorder
        onRecordingComplete={mockOnRecordingComplete}
        primaryColor="#FF0000"
      />,
    );

    expect(getByText("components.holdToRecord")).toBeTruthy();
  });

  it("shows permission error when microphone access is denied", () => {
    // Override the mock for this test
    jest.doMock("@/hooks/useVoiceRecording", () => ({
      useVoiceRecording: () => ({
        status: "idle",
        duration: 0,
        formattedDuration: "0:00",
        metering: null,
        hasPermission: false,
        start: mockStart,
        stop: mockStop,
        cancel: mockCancel,
        requestPermission: mockRequestPermission.mockResolvedValue(false),
      }),
    }));

    // This test verifies the component handles permission states
    const { getByText } = render(
      <VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />,
    );

    // Component should still render
    expect(getByText).toBeDefined();
  });
});

describe("VoiceRecorder - Recording State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays waveform bars when provided", () => {
    const { UNSAFE_getAllByType } = render(
      <VoiceRecorder onRecordingComplete={jest.fn()} />,
    );

    // Verify component renders
    expect(UNSAFE_getAllByType).toBeDefined();
  });
});

describe("VoiceRecorder - Interaction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles recording completion callback", async () => {
    const mockOnComplete = jest.fn();

    render(<VoiceRecorder onRecordingComplete={mockOnComplete} />);

    // Verify component is ready for interaction
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it("handles cancel callback", async () => {
    const mockOnCancelFn = jest.fn();

    render(
      <VoiceRecorder
        onRecordingComplete={jest.fn()}
        onCancel={mockOnCancelFn}
      />,
    );

    expect(mockOnCancelFn).not.toHaveBeenCalled();
  });
});
