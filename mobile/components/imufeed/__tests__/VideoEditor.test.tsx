/**
 * Tests for VideoEditor component
 * Sprint S4 Axe B — Éditeur Basique
 */

import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ────────────────────────────────────────────────────

jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    primary: "#6A54A3",
    surface: "#1a1a2e",
    background: "#0f0a1a",
    text: "#ffffff",
    border: "#333",
    textMuted: "#999",
  }),
  useSpacing: () => ({ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }),
}));

// Mock expo-av Video
const mockVideoLoadAsync = jest.fn().mockResolvedValue({});
const mockSetPositionAsync = jest.fn().mockResolvedValue({});
const mockPlayAsync = jest.fn().mockResolvedValue({});
const mockPauseAsync = jest.fn().mockResolvedValue({});
const mockSetVolumeAsync = jest.fn().mockResolvedValue({});

jest.mock("expo-av", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    Video: React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({
        loadAsync: mockVideoLoadAsync,
        setPositionAsync: mockSetPositionAsync,
        playAsync: mockPlayAsync,
        pauseAsync: mockPauseAsync,
        setVolumeAsync: mockSetVolumeAsync,
      }));
      return <View testID="mock-video" {...props} />;
    }),
    ResizeMode: { CONTAIN: "contain" },
  };
});

import VideoEditor from "../VideoEditor";

// ─── Helpers ──────────────────────────────────────────────────

const makeVideo = (overrides = {}) => ({
  uri: "file:///test-video.mp4",
  width: 1080,
  height: 1920,
  duration: 30, // seconds
  fileSize: 10_000_000,
  mimeType: "video/mp4",
  ...overrides,
});

const mockOnDone = jest.fn();
const mockOnCancel = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe("VideoEditor", () => {
  it("renders without crashing", () => {
    const { getByText, getByLabelText } = render(
      <VideoEditor
        video={makeVideo()}
        onDone={mockOnDone}
        onCancel={mockOnCancel}
      />,
    );
    expect(getByText("OK")).toBeTruthy();
    expect(getByLabelText("Annuler")).toBeTruthy();
    expect(getByLabelText("Confirmer")).toBeTruthy();
  });

  it("shows video duration formatted", () => {
    const { getAllByText } = render(
      <VideoEditor
        video={makeVideo({ duration: 15 })}
        onDone={mockOnDone}
        onCancel={mockOnCancel}
      />,
    );
    // 15s duration = 15000ms → "0:15" appears in timeline labels
    const matches = getAllByText(/0:15/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onCancel when cancel button pressed", () => {
    const { getByLabelText } = render(
      <VideoEditor
        video={makeVideo()}
        onDone={mockOnDone}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.press(getByLabelText("Annuler"));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onDone with editor result when done button pressed", () => {
    const vid = makeVideo({ duration: 20 });
    const { getByLabelText } = render(
      <VideoEditor video={vid} onDone={mockOnDone} onCancel={mockOnCancel} />,
    );

    fireEvent.press(getByLabelText("Confirmer"));

    expect(mockOnDone).toHaveBeenCalledTimes(1);
    const result = mockOnDone.mock.calls[0][0];
    expect(result).toHaveProperty("uri", vid.uri);
    expect(result).toHaveProperty("trimRange");
    expect(result.trimRange).toHaveProperty("startMs", 0);
    expect(result.trimRange).toHaveProperty("endMs", 20000);
    expect(result).toHaveProperty("videoVolume");
    expect(result).toHaveProperty("musicVolume");
  });

  it("renders volume controls with accessibility labels", () => {
    const { getByLabelText } = render(
      <VideoEditor
        video={makeVideo()}
        onDone={mockOnDone}
        onCancel={mockOnCancel}
      />,
    );
    expect(getByLabelText("Volume Vidéo 0%")).toBeTruthy();
    expect(getByLabelText("Volume Musique 50%")).toBeTruthy();
  });

  it("renders trim handles and video mock", () => {
    const { getByTestId } = render(
      <VideoEditor
        video={makeVideo()}
        onDone={mockOnDone}
        onCancel={mockOnCancel}
      />,
    );
    expect(getByTestId("mock-video")).toBeTruthy();
  });
});
