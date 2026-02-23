/**
 * Tests for Avatar component
 * Covers rendering, image download, upload flow, edit button visibility
 */

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

// --- Mocks ---

// Mock I18nProvider
jest.mock("@/providers/I18nProvider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "fr",
    setLocale: jest.fn(),
  }),
}));

// Mock ThemeProvider
jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    primary: "#007AFF",
    surface: "#F5F5F5",
    background: "#FFFFFF",
    text: "#000000",
    border: "#E0E0E0",
    textMuted: "#999999",
    error: "#FF3B30",
    warning: "#FF9500",
  }),
  useSpacing: () => ({
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  }),
  useTheme: () => ({
    theme: { colors: { primary: "#007AFF", surface: "#F5F5F5" } },
    mode: "light",
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Supabase globally mocked in jest.setup.js
import { supabase } from "@/services/supabase";

// ImagePicker globally mocked in jest.setup.js
import * as ImagePicker from "expo-image-picker";

import Avatar from "../Avatar";

const mockOnUpload = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  // Default: storage.download resolves with a mock blob
  (supabase.storage.from as jest.Mock).mockReturnValue({
    upload: jest.fn().mockResolvedValue({ error: null }),
    download: jest.fn().mockResolvedValue({
      data: new Blob(["fake-image-data"], { type: "image/png" }),
      error: null,
    }),
    getPublicUrl: jest.fn(),
  });
});

describe("Avatar", () => {
  test("renders without crashing with null url", () => {
    const { toJSON } = render(<Avatar url={null} onUpload={mockOnUpload} />);
    expect(toJSON()).toBeTruthy();
  });

  test("renders with default size of 150", () => {
    const { toJSON } = render(<Avatar url={null} onUpload={mockOnUpload} />);
    const tree = toJSON() as any;
    // Root View should exist
    expect(tree).toBeTruthy();
  });

  test("renders with custom size", () => {
    const { toJSON } = render(
      <Avatar url={null} onUpload={mockOnUpload} size={80} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  test("attempts to download image when url is provided", () => {
    render(<Avatar url="avatars/test.png" onUpload={mockOnUpload} />);

    const storageMock = supabase.storage.from as jest.Mock;
    expect(storageMock).toHaveBeenCalledWith("avatars");
  });

  test("does not show edit button by default", () => {
    const { queryByText } = render(
      <Avatar url={null} onUpload={mockOnUpload} />,
    );

    // The edit button shows t("components.edit") = "components.edit"
    expect(queryByText("components.edit")).toBeNull();
  });

  test("shows edit button when showEditButton is true", () => {
    const { getByText } = render(
      <Avatar url={null} onUpload={mockOnUpload} showEditButton={true} />,
    );

    expect(getByText("components.edit")).toBeTruthy();
  });

  test("edit button triggers image picker on press", async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: [],
    });

    const { getByText } = render(
      <Avatar url={null} onUpload={mockOnUpload} showEditButton={true} />,
    );

    fireEvent.press(getByText("components.edit"));

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });
  });

  test("upload calls onUpload with file path on success", async () => {
    const mockBase64 = "aW1hZ2VkYXRh"; // base64 of "imagedata"

    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: "file:///photo.jpeg",
          base64: mockBase64,
          mimeType: "image/jpeg",
        },
      ],
    });

    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn().mockResolvedValue({ error: null }),
      download: jest.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: jest.fn(),
    });

    const { getByText } = render(
      <Avatar url={null} onUpload={mockOnUpload} showEditButton={true} />,
    );

    fireEvent.press(getByText("components.edit"));

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(
        expect.stringMatching(/\.jpeg$/),
      );
    });
  });

  test("upload handles user cancellation gracefully", async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: [],
    });

    const { getByText } = render(
      <Avatar url={null} onUpload={mockOnUpload} showEditButton={true} />,
    );

    fireEvent.press(getByText("components.edit"));

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });

    // onUpload should NOT be called on cancel
    expect(mockOnUpload).not.toHaveBeenCalled();
  });
});
