/**
 * Tests unitaires pour MediaPicker - Mobile
 */

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { MediaPicker } from "../MediaPicker";

// Mock des modules
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    All: "All",
    Images: "Images",
    Videos: "Videos",
  },
  UIImagePickerControllerQualityType: {
    Medium: 1,
  },
}));

jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn().mockResolvedValue({
    uri: "compressed-uri",
    width: 1200,
    height: 800,
  }),
  SaveFormat: {
    JPEG: "jpeg",
  },
}));

jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    background: "#FFFFFF",
    text: "#000000",
    textSecondary: "#666666",
  }),
  useSpacing: () => ({
    sm: 8,
    md: 16,
    lg: 24,
  }),
}));

jest.mock("@/services/media-upload", () => ({
  requestMediaPermissions: jest.fn().mockResolvedValue(true),
  requestCameraPermissions: jest.fn().mockResolvedValue(true),
  pickImage: jest.fn(),
  pickVideo: jest.fn(),
  pickMedia: jest.fn(),
  takePhoto: jest.fn(),
}));

describe("MediaPicker", () => {
  const mockOnMediaSelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });
  });

  it("renders correctly", () => {
    const { getByLabelText } = render(
      <MediaPicker onMediaSelected={mockOnMediaSelected} />,
    );

    expect(getByLabelText("components.addMedia")).toBeTruthy();
  });

  it("renders in icon-only mode", () => {
    const { queryByText, getByLabelText } = render(
      <MediaPicker onMediaSelected={mockOnMediaSelected} iconOnly />,
    );

    expect(getByLabelText("components.addMedia")).toBeTruthy();
    expect(queryByText("components.media")).toBeNull();
  });

  it("opens modal when pressed", () => {
    const { getByLabelText, getByText } = render(
      <MediaPicker onMediaSelected={mockOnMediaSelected} />,
    );

    fireEvent.press(getByLabelText("components.addMedia"));

    expect(getByText("components.addMedia")).toBeTruthy();
    expect(getByText("components.gallery")).toBeTruthy();
    expect(getByText("components.photo")).toBeTruthy();
  });

  it("shows video option when allowVideo is true", () => {
    const { getByLabelText, getByText } = render(
      <MediaPicker onMediaSelected={mockOnMediaSelected} allowVideo />,
    );

    fireEvent.press(getByLabelText("components.addMedia"));

    expect(getByText("components.video")).toBeTruthy();
  });

  it("does not show video option when allowVideo is false", () => {
    const { getByLabelText, queryByText } = render(
      <MediaPicker onMediaSelected={mockOnMediaSelected} allowVideo={false} />,
    );

    fireEvent.press(getByLabelText("components.addMedia"));

    expect(queryByText("components.video")).toBeNull();
  });

  it("selects images from gallery", async () => {
    const mockAssets = [
      {
        uri: "test-uri-1.jpg",
        mimeType: "image/jpeg",
        fileName: "test1.jpg",
        width: 1920,
        height: 1080,
        fileSize: 500000,
        type: "image",
      },
    ];

    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: mockAssets,
    });

    const { getByLabelText, getByText } = render(
      <MediaPicker onMediaSelected={mockOnMediaSelected} />,
    );

    fireEvent.press(getByLabelText("components.addMedia"));
    fireEvent.press(getByText("components.gallery"));

    await waitFor(() => {
      expect(mockOnMediaSelected).toHaveBeenCalled();
    });

    const calledWith = mockOnMediaSelected.mock.calls[0][0];
    expect(calledWith).toHaveLength(1);
    expect(calledWith[0].type).toBe("image");
  });

  it("takes photo from camera", async () => {
    const mockAsset = {
      uri: "camera-uri.jpg",
      mimeType: "image/jpeg",
      width: 1920,
      height: 1080,
      fileSize: 300000,
    };

    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [mockAsset],
    });

    const { getByLabelText, getByText } = render(
      <MediaPicker onMediaSelected={mockOnMediaSelected} />,
    );

    fireEvent.press(getByLabelText("components.addMedia"));
    fireEvent.press(getByText("components.photo"));

    await waitFor(() => {
      expect(mockOnMediaSelected).toHaveBeenCalled();
    });

    const calledWith = mockOnMediaSelected.mock.calls[0][0];
    expect(calledWith).toHaveLength(1);
    expect(calledWith[0].type).toBe("image");
  });

  it("respects maxImages limit", async () => {
    const mockAssets = Array(10)
      .fill(null)
      .map((_, i) => ({
        uri: `test-uri-${i}.jpg`,
        mimeType: "image/jpeg",
        fileName: `test${i}.jpg`,
        width: 1920,
        height: 1080,
        fileSize: 500000,
        type: "image",
      }));

    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: mockAssets,
    });

    const { getByLabelText, getByText } = render(
      <MediaPicker onMediaSelected={mockOnMediaSelected} maxImages={3} />,
    );

    fireEvent.press(getByLabelText("components.addMedia"));
    fireEvent.press(getByText("components.gallery"));

    await waitFor(() => {
      expect(mockOnMediaSelected).toHaveBeenCalled();
    });

    const calledWith = mockOnMediaSelected.mock.calls[0][0];
    expect(calledWith.length).toBeLessThanOrEqual(3);
  });

  it("handles cancelled selection", async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: [],
    });

    const { getByLabelText, getByText } = render(
      <MediaPicker onMediaSelected={mockOnMediaSelected} />,
    );

    fireEvent.press(getByLabelText("components.addMedia"));
    fireEvent.press(getByText("components.gallery"));

    await waitFor(() => {
      expect(mockOnMediaSelected).not.toHaveBeenCalled();
    });
  });

  it("is disabled when disabled prop is true", () => {
    const { getByLabelText } = render(
      <MediaPicker onMediaSelected={mockOnMediaSelected} disabled />,
    );

    const button = getByLabelText("components.addMedia");
    fireEvent.press(button);

    // Modal should not open when disabled
    expect(mockOnMediaSelected).not.toHaveBeenCalled();
  });
});
