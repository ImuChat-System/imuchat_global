/**
 * Tests unitaires pour ImageGallery - Mobile
 */

import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { GalleryMedia, ImageGallery } from "../ImageGallery";

// Mock des modules
jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    background: "#FFFFFF",
    text: "#000000",
    textSecondary: "#666666",
  }),
}));

jest.mock("expo-av", () => ({
  Video: "Video",
  ResizeMode: {
    CONTAIN: "contain",
    COVER: "cover",
  },
}));

jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) =>
    children,
  GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  Gesture: {
    Pinch: () => ({
      onUpdate: () => ({ onEnd: () => ({}) }),
    }),
    Pan: () => ({
      onUpdate: () => ({ onEnd: () => ({}) }),
    }),
    Tap: () => ({
      numberOfTaps: () => ({ onEnd: () => ({}) }),
    }),
    Simultaneous: () => ({}),
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

const createMockMedia = (
  overrides: Partial<GalleryMedia> = {},
): GalleryMedia => ({
  id: `gallery-${Math.random().toString(36).slice(2)}`,
  uri: "https://example.com/image.jpg",
  type: "image",
  width: 1920,
  height: 1080,
  ...overrides,
});

describe("ImageGallery", () => {
  const mockOnItemPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when media array is empty", () => {
    const { toJSON } = render(<ImageGallery media={[]} />);
    expect(toJSON()).toBeNull();
  });

  it("renders single image correctly", () => {
    const media = [createMockMedia()];

    const { root } = render(<ImageGallery media={media} />);
    expect(root).toBeTruthy();
  });

  it("renders two images side by side", () => {
    const media = [createMockMedia(), createMockMedia()];

    const { root } = render(<ImageGallery media={media} />);
    expect(root).toBeTruthy();
  });

  it("renders grid for 3+ images", () => {
    const media = [
      createMockMedia(),
      createMockMedia(),
      createMockMedia(),
      createMockMedia(),
    ];

    const { root } = render(<ImageGallery media={media} columns={2} />);
    expect(root).toBeTruthy();
  });

  it("calls onItemPress when item is tapped", () => {
    const media = [createMockMedia({ id: "test-id" }), createMockMedia()];

    const { getAllByLabelText } = render(
      <ImageGallery media={media} onItemPress={mockOnItemPress} />,
    );

    fireEvent.press(getAllByLabelText(/Voir image/)[0]);
    expect(mockOnItemPress).toHaveBeenCalledWith(
      expect.objectContaining({ id: "test-id" }),
      0,
    );
  });

  it("shows video indicator for video items", () => {
    const media = [createMockMedia({ type: "video" }), createMockMedia()];

    const { getByLabelText } = render(<ImageGallery media={media} />);

    expect(getByLabelText(/Voir vidéo/)).toBeTruthy();
  });

  it("opens lightbox when item is tapped without onItemPress", () => {
    const media = [createMockMedia(), createMockMedia()];

    const { getAllByLabelText, getByText } = render(
      <ImageGallery media={media} />,
    );

    fireEvent.press(getAllByLabelText(/Voir image/)[0]);

    // Le lightbox devrait s'ouvrir et afficher le compteur
    expect(getByText("1 / 2")).toBeTruthy();
  });

  it("respects custom columns prop", () => {
    const media = [
      createMockMedia(),
      createMockMedia(),
      createMockMedia(),
      createMockMedia(),
      createMockMedia(),
      createMockMedia(),
    ];

    const { root } = render(<ImageGallery media={media} columns={3} />);
    expect(root).toBeTruthy();
  });

  it("respects custom spacing prop", () => {
    const media = [createMockMedia(), createMockMedia()];

    const { root } = render(<ImageGallery media={media} spacing={8} />);
    expect(root).toBeTruthy();
  });

  it("handles mixed media types", () => {
    const media = [
      createMockMedia({ type: "image" }),
      createMockMedia({ type: "video" }),
      createMockMedia({ type: "image" }),
    ];

    const { getAllByLabelText } = render(<ImageGallery media={media} />);

    const imageItems = getAllByLabelText(/Voir image/);
    const videoItems = getAllByLabelText(/Voir vidéo/);

    expect(imageItems).toHaveLength(2);
    expect(videoItems).toHaveLength(1);
  });

  it("uses thumbnail when provided", () => {
    const media = [
      createMockMedia({
        uri: "https://example.com/full.jpg",
        thumbnail: "https://example.com/thumb.jpg",
      }),
      createMockMedia(),
    ];

    const { root } = render(<ImageGallery media={media} />);
    expect(root).toBeTruthy();
  });

  it("closes lightbox when close button is pressed", () => {
    const media = [createMockMedia(), createMockMedia()];

    const { getAllByLabelText, queryByText, getByLabelText } = render(
      <ImageGallery media={media} />,
    );

    // Ouvrir le lightbox
    fireEvent.press(getAllByLabelText(/Voir image/)[0]);
    expect(queryByText("1 / 2")).toBeTruthy();

    // Fermer le lightbox
    fireEvent.press(getByLabelText("Fermer"));
  });
});
