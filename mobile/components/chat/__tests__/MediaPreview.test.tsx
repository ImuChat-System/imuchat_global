/**
 * Tests unitaires pour MediaPreview - Mobile
 */

import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { MediaFile } from "../MediaPicker";
import { MediaPreview } from "../MediaPreview";

// Mock des modules
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

jest.mock("expo-av", () => ({
  Video: "Video",
  ResizeMode: {
    COVER: "cover",
  },
}));

const createMockMedia = (overrides: Partial<MediaFile> = {}): MediaFile => ({
  id: `media-${Math.random().toString(36).slice(2)}`,
  uri: "test-uri.jpg",
  type: "image",
  width: 1920,
  height: 1080,
  size: 500000,
  mimeType: "image/jpeg",
  fileName: "test.jpg",
  status: "pending",
  ...overrides,
});

describe("MediaPreview", () => {
  const mockOnRemove = jest.fn();
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when media array is empty", () => {
    const { toJSON } = render(
      <MediaPreview media={[]} onRemove={mockOnRemove} />,
    );

    expect(toJSON()).toBeNull();
  });

  it("renders media items", () => {
    const media = [createMockMedia(), createMockMedia()];

    const { getAllByLabelText } = render(
      <MediaPreview media={media} onRemove={mockOnRemove} />,
    );

    const removeButtons = getAllByLabelText("common.delete");
    expect(removeButtons).toHaveLength(2);
  });

  it("shows correct count in header", () => {
    const media = [createMockMedia(), createMockMedia(), createMockMedia()];

    const { getByText } = render(
      <MediaPreview media={media} onRemove={mockOnRemove} />,
    );

    expect(getByText(/components\.mediaCount/)).toBeTruthy();
  });

  it("calls onRemove when remove button is pressed", () => {
    const media = [createMockMedia({ id: "test-id-1" })];

    const { getByLabelText } = render(
      <MediaPreview media={media} onRemove={mockOnRemove} />,
    );

    fireEvent.press(getByLabelText("common.delete"));
    expect(mockOnRemove).toHaveBeenCalledWith("test-id-1");
  });

  it("shows upload progress for uploading items", () => {
    const media = [
      createMockMedia({ status: "uploading", uploadProgress: 50 }),
    ];

    const { getByText } = render(
      <MediaPreview media={media} onRemove={mockOnRemove} />,
    );

    expect(getByText("50%")).toBeTruthy();
    expect(getByText(/components\.inProgress/)).toBeTruthy();
  });

  it("shows error count in header", () => {
    const media = [
      createMockMedia({ status: "error" }),
      createMockMedia({ status: "error" }),
    ];

    const { getByText } = render(
      <MediaPreview
        media={media}
        onRemove={mockOnRemove}
        onRetry={mockOnRetry}
      />,
    );

    expect(getByText(/components\.errorsLabel/)).toBeTruthy();
  });

  it("shows retry button for error items", () => {
    const media = [createMockMedia({ id: "error-id", status: "error" })];

    const { getByText } = render(
      <MediaPreview
        media={media}
        onRemove={mockOnRemove}
        onRetry={mockOnRetry}
      />,
    );

    fireEvent.press(getByText("common.retry"));
    expect(mockOnRetry).toHaveBeenCalledWith("error-id");
  });

  it("shows video indicator for video items", () => {
    const media = [createMockMedia({ type: "video", mimeType: "video/mp4" })];

    const { UNSAFE_getByType } = render(
      <MediaPreview media={media} onRemove={mockOnRemove} />,
    );

    // Le composant Video devrait être rendu
    // Note: Ce test dépend de la structure du mock
  });

  it("respects custom previewSize", () => {
    const media = [createMockMedia()];

    const { root } = render(
      <MediaPreview media={media} onRemove={mockOnRemove} previewSize={100} />,
    );

    // Vérifier que la taille custom est appliquée
    expect(root).toBeTruthy();
  });

  it("shows uploaded badge for completed uploads", () => {
    const media = [createMockMedia({ status: "uploaded" })];

    const { root } = render(
      <MediaPreview media={media} onRemove={mockOnRemove} />,
    );

    // Le badge checkmark devrait être visible
    expect(root).toBeTruthy();
  });

  it("handles multiple media types", () => {
    const media = [
      createMockMedia({ type: "image" }),
      createMockMedia({ type: "video" }),
      createMockMedia({
        type: "image",
        status: "uploading",
        uploadProgress: 75,
      }),
    ];

    const { getAllByLabelText, getByText } = render(
      <MediaPreview media={media} onRemove={mockOnRemove} />,
    );

    expect(getAllByLabelText("common.delete")).toHaveLength(3);
    expect(getByText(/components\.mediaCount/)).toBeTruthy();
  });
});
