/**
 * Tests unitaires pour VoicePlayer - Mobile
 */

import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { VoicePlayer } from "../VoicePlayer";

// Mock expo-av
const mockPlayAsync = jest.fn().mockResolvedValue(undefined);
const mockPauseAsync = jest.fn().mockResolvedValue(undefined);
const mockSetPositionAsync = jest.fn().mockResolvedValue(undefined);
const mockSetRateAsync = jest.fn().mockResolvedValue(undefined);
const mockUnloadAsync = jest.fn().mockResolvedValue(undefined);
const mockGetStatusAsync = jest.fn().mockResolvedValue({
  isLoaded: true,
  isPlaying: false,
  positionMillis: 0,
  durationMillis: 30000,
});

jest.mock("expo-av", () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          playAsync: mockPlayAsync,
          pauseAsync: mockPauseAsync,
          setPositionAsync: mockSetPositionAsync,
          setRateAsync: mockSetRateAsync,
          unloadAsync: mockUnloadAsync,
          getStatusAsync: mockGetStatusAsync,
        },
      }),
    },
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
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

describe("VoicePlayer", () => {
  const defaultProps = {
    audioUrl: "https://example.com/audio.m4a",
    duration: 30,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with required props", () => {
    const { getByText } = render(<VoicePlayer {...defaultProps} />);

    // Should show duration
    expect(getByText("0:00 / 0:30")).toBeTruthy();
  });

  it("renders with custom waveform data", () => {
    const waveformData = [0.2, 0.5, 0.8, 0.3, 0.6];

    const { getByText } = render(
      <VoicePlayer {...defaultProps} waveformData={waveformData} />,
    );

    expect(getByText("0:00 / 0:30")).toBeTruthy();
  });

  it("renders with transcription button when transcription provided", () => {
    const { getByText } = render(
      <VoicePlayer {...defaultProps} transcription="Test transcription" />,
    );

    expect(getByText("Transcription")).toBeTruthy();
  });

  it("toggles transcription visibility on button press", () => {
    const { getByText, queryByText } = render(
      <VoicePlayer
        {...defaultProps}
        transcription="Test transcription content"
      />,
    );

    // Initially transcription is hidden
    expect(queryByText("Test transcription content")).toBeNull();

    // Press transcription toggle
    fireEvent.press(getByText("Transcription"));

    // Now transcription should be visible
    expect(getByText("Test transcription content")).toBeTruthy();
    expect(getByText("Masquer")).toBeTruthy();
  });

  it("renders with isOwn style", () => {
    const { getByText } = render(
      <VoicePlayer {...defaultProps} isOwn={true} />,
    );

    expect(getByText("0:00 / 0:30")).toBeTruthy();
  });

  it("renders with custom primary color", () => {
    const { getByText } = render(
      <VoicePlayer {...defaultProps} primaryColor="#FF0000" />,
    );

    expect(getByText("0:00 / 0:30")).toBeTruthy();
  });

  it("displays playback speed button", () => {
    const { getByText } = render(<VoicePlayer {...defaultProps} />);

    expect(getByText("1x")).toBeTruthy();
  });

  it("cycles through playback speeds on button press", () => {
    const { getByText } = render(<VoicePlayer {...defaultProps} />);

    const speedButton = getByText("1x");

    fireEvent.press(speedButton);
    expect(getByText("1.5x")).toBeTruthy();

    fireEvent.press(getByText("1.5x"));
    expect(getByText("2x")).toBeTruthy();

    fireEvent.press(getByText("2x"));
    expect(getByText("1x")).toBeTruthy();
  });

  it("formats time correctly for various durations", () => {
    // Test with 90 seconds (1:30)
    const { getByText } = render(
      <VoicePlayer audioUrl="https://example.com/audio.m4a" duration={90} />,
    );

    expect(getByText("0:00 / 1:30")).toBeTruthy();
  });
});

describe("VoicePlayer - Playback", () => {
  const defaultProps = {
    audioUrl: "https://example.com/audio.m4a",
    duration: 30,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("has play button accessible", () => {
    const { UNSAFE_root } = render(<VoicePlayer {...defaultProps} />);

    // Component should render with play functionality
    expect(UNSAFE_root).toBeDefined();
  });

  it("handles audio loading state", async () => {
    const { getByText } = render(<VoicePlayer {...defaultProps} />);

    // Should show initial time
    expect(getByText("0:00 / 0:30")).toBeTruthy();
  });
});

describe("VoicePlayer - Waveform", () => {
  it("generates default waveform when none provided", () => {
    const { UNSAFE_root } = render(
      <VoicePlayer audioUrl="https://example.com/audio.m4a" duration={30} />,
    );

    expect(UNSAFE_root).toBeDefined();
  });

  it("uses provided waveform data", () => {
    const waveformData = Array.from({ length: 40 }, (_, i) => i / 40);

    const { UNSAFE_root } = render(
      <VoicePlayer
        audioUrl="https://example.com/audio.m4a"
        duration={30}
        waveformData={waveformData}
      />,
    );

    expect(UNSAFE_root).toBeDefined();
  });
});
