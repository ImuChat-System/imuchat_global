/**
 * File Manager Screens — Tests (DEV-037)
 *
 * Smoke-renders each of the 7 screens and the layout.
 */
import { render } from "@testing-library/react-native";
import React from "react";

// ── Mocks ─────────────────────────────────────────────────

jest.mock("expo-router", () => {
  const React = require("react");
  const StackComponent = (props: any) => React.createElement("View", props);
  StackComponent.Screen = (props: any) => React.createElement("View", props);
  return {
    useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
    Stack: StackComponent,
  };
});

jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    background: "#fff",
    surface: "#f0f0f0",
    text: "#000",
    textMuted: "#999",
    primary: "#3b82f6",
    border: "#ddd",
    error: "#ef4444",
  }),
  useSpacing: () => ({ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }),
}));

jest.mock("@/providers/I18nProvider", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: "fr" }),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: (props: any) =>
    require("react").createElement("Text", props, props.name),
}));

// Mock store — provide full mock state
const mockState = {
  currentFolderId: null,
  breadcrumbs: [{ id: null, name: "Mon Drive" }],
  files: [
    {
      id: "f1",
      name: "photo.jpg",
      type: "image" as const,
      mimeType: "image/jpeg",
      sizeBytes: 2048000,
      parentFolderId: null,
      url: "https://example.com/photo.jpg",
      thumbnailUrl: null,
      isFavorite: true,
      isShared: false,
      sharedWith: [],
      deviceOrigin: "mobile-1",
      createdAt: "2025-01-10T10:00:00Z",
      updatedAt: "2025-01-15T12:00:00Z",
    },
  ],
  folders: [
    {
      id: "d1",
      name: "Documents",
      parentFolderId: null,
      itemCount: 5,
      sizeBytes: 10240000,
      createdAt: "2025-01-01T08:00:00Z",
      updatedAt: "2025-01-14T09:00:00Z",
    },
  ],
  sharedFiles: [
    {
      file: {
        id: "sf1",
        name: "rapport.pdf",
        type: "document" as const,
        mimeType: "application/pdf",
        sizeBytes: 512000,
        parentFolderId: null,
        url: "https://example.com/rapport.pdf",
        thumbnailUrl: null,
        isFavorite: false,
        isShared: true,
        sharedWith: ["user-2"],
        deviceOrigin: "desktop-1",
        createdAt: "2025-01-05T10:00:00Z",
        updatedAt: "2025-01-10T11:00:00Z",
      },
      sharedBy: "user-2",
      sharedByName: "Alice",
      sharedAt: "2025-01-11T10:00:00Z",
      permission: "view" as const,
      expiresAt: null,
    },
  ],
  trash: [
    {
      id: "t1",
      name: "old.txt",
      type: "document" as const,
      mimeType: "text/plain",
      sizeBytes: 1024,
      parentFolderId: null,
      url: "",
      thumbnailUrl: null,
      isFavorite: false,
      isShared: false,
      sharedWith: [],
      deviceOrigin: "mobile-1",
      createdAt: "2024-12-01T10:00:00Z",
      updatedAt: "2025-01-02T10:00:00Z",
      deletedAt: "2025-01-03T10:00:00Z",
    },
  ],
  favorites: [
    {
      id: "f1",
      name: "photo.jpg",
      type: "image" as const,
      mimeType: "image/jpeg",
      sizeBytes: 2048000,
      parentFolderId: null,
      url: "https://example.com/photo.jpg",
      thumbnailUrl: null,
      isFavorite: true,
      isShared: false,
      sharedWith: [],
      deviceOrigin: "mobile-1",
      createdAt: "2025-01-10T10:00:00Z",
      updatedAt: "2025-01-15T12:00:00Z",
    },
  ],
  quota: { usedBytes: 5368709120, totalBytes: 16106127360, usedPercent: 33 },
  breakdown: {
    images: 2147483648,
    videos: 1073741824,
    audio: 536870912,
    documents: 1073741824,
    archives: 268435456,
    other: 268435456,
  },
  devices: [
    {
      id: "dev-1",
      name: "iPhone 15",
      type: "mobile" as const,
      lastSyncAt: "2025-01-20T10:00:00Z",
      status: "synced" as const,
      itemsSynced: 450,
      itemsPending: 0,
    },
  ],
  syncSettings: {
    autoSync: true,
    syncOnWifiOnly: true,
    syncPhotos: true,
    syncVideos: false,
    syncDocuments: true,
    syncFrequencyMinutes: 30,
  },
  uploads: [
    {
      id: "u1",
      fileName: "upload.pdf",
      fileType: "document" as const,
      sizeBytes: 1024000,
      progress: 45,
      status: "uploading" as const,
      targetFolderId: null,
    },
  ],
  sortBy: "name" as const,
  sortOrder: "asc" as const,
  searchQuery: "",
  loading: false,
  viewMode: "list" as const,
};

const mockActions = {
  setCurrentFolder: jest.fn(),
  setSortBy: jest.fn(),
  setSortOrder: jest.fn(),
  setSearchQuery: jest.fn(),
  setViewMode: jest.fn(),
  setLoading: jest.fn(),
  fetchFiles: jest.fn(),
  fetchSharedFiles: jest.fn(),
  fetchTrash: jest.fn(),
  fetchFavorites: jest.fn(),
  fetchQuota: jest.fn(),
  fetchDevices: jest.fn(),
  createFolder: jest.fn(),
  renameItem: jest.fn(),
  deleteItem: jest.fn(),
  restoreItem: jest.fn(),
  emptyTrash: jest.fn(),
  toggleFavorite: jest.fn(),
  shareFile: jest.fn(),
  revokeShare: jest.fn(),
  updateSyncSettings: jest.fn(),
  triggerSync: jest.fn(),
  addUpload: jest.fn(),
  removeUpload: jest.fn(),
  clearCompletedUploads: jest.fn(),
};

jest.mock("@/stores/file-manager-store", () => ({
  useFileManagerStore: (selector: (state: any) => any) =>
    selector({ ...mockState, ...mockActions }),
}));

// ── Screen imports (after mocks) ──────────────────────────
import LayoutScreen from "../app/file-manager/_layout";
import FavoritesScreen from "../app/file-manager/favorites";
import HubScreen from "../app/file-manager/index";
import MyFilesScreen from "../app/file-manager/my-files";
import SharedScreen from "../app/file-manager/shared";
import SyncScreen from "../app/file-manager/sync";
import TrashScreen from "../app/file-manager/trash";
import UploadScreen from "../app/file-manager/upload";

// ============================================================================
// HUB SCREEN
// ============================================================================

describe("FileManager — Hub Screen", () => {
  it("renders hub with testID", () => {
    const { getByTestId } = render(<HubScreen />);
    expect(getByTestId("file-manager-hub")).toBeTruthy();
  });

  it("renders storage usage section", () => {
    const { getByText } = render(<HubScreen />);
    expect(getByText("fileManager.storageUsage")).toBeTruthy();
  });

  it("renders breakdown section", () => {
    const { getByText } = render(<HubScreen />);
    expect(getByText("fileManager.breakdown")).toBeTruthy();
  });

  it("renders recent files section", () => {
    const { getByText } = render(<HubScreen />);
    expect(getByText("fileManager.recentFiles")).toBeTruthy();
  });

  it("renders nav cards for sections", () => {
    const { getByText } = render(<HubScreen />);
    expect(getByText("fileManager.myFiles")).toBeTruthy();
    expect(getByText("fileManager.shared")).toBeTruthy();
    expect(getByText("fileManager.favorites")).toBeTruthy();
    expect(getByText("fileManager.trash")).toBeTruthy();
  });
});

// ============================================================================
// MY FILES SCREEN
// ============================================================================

describe("FileManager — My Files Screen", () => {
  it("renders with testID", () => {
    const { getByTestId } = render(<MyFilesScreen />);
    expect(getByTestId("my-files-screen")).toBeTruthy();
  });

  it("renders breadcrumb root", () => {
    const { getByText } = render(<MyFilesScreen />);
    expect(getByText("fileManager.root")).toBeTruthy();
  });

  it("renders folder and file items", () => {
    const { getByText } = render(<MyFilesScreen />);
    expect(getByText("Documents")).toBeTruthy();
    expect(getByText("photo.jpg")).toBeTruthy();
  });
});

// ============================================================================
// SHARED SCREEN
// ============================================================================

describe("FileManager — Shared Screen", () => {
  it("renders with testID", () => {
    const { getByTestId } = render(<SharedScreen />);
    expect(getByTestId("shared-screen")).toBeTruthy();
  });

  it("renders shared file name", () => {
    const { getByText } = render(<SharedScreen />);
    expect(getByText("rapport.pdf")).toBeTruthy();
  });
});

// ============================================================================
// FAVORITES SCREEN
// ============================================================================

describe("FileManager — Favorites Screen", () => {
  it("renders with testID", () => {
    const { getByTestId } = render(<FavoritesScreen />);
    expect(getByTestId("favorites-screen")).toBeTruthy();
  });

  it("renders favorite file", () => {
    const { getByText } = render(<FavoritesScreen />);
    expect(getByText("photo.jpg")).toBeTruthy();
  });
});

// ============================================================================
// TRASH SCREEN
// ============================================================================

describe("FileManager — Trash Screen", () => {
  it("renders with testID", () => {
    const { getByTestId } = render(<TrashScreen />);
    expect(getByTestId("trash-screen")).toBeTruthy();
  });

  it("renders trash file", () => {
    const { getByText } = render(<TrashScreen />);
    expect(getByText("old.txt")).toBeTruthy();
  });

  it("renders empty trash button", () => {
    const { getByText } = render(<TrashScreen />);
    expect(getByText("fileManager.emptyTrashAction")).toBeTruthy();
  });
});

// ============================================================================
// SYNC SCREEN
// ============================================================================

describe("FileManager — Sync Screen", () => {
  it("renders with testID", () => {
    const { getByTestId } = render(<SyncScreen />);
    expect(getByTestId("sync-screen")).toBeTruthy();
  });

  it("renders sync now button", () => {
    const { getByText } = render(<SyncScreen />);
    expect(getByText("fileManager.syncNow")).toBeTruthy();
  });

  it("renders device name", () => {
    const { getByText } = render(<SyncScreen />);
    expect(getByText("iPhone 15")).toBeTruthy();
  });

  it("renders sync settings toggles", () => {
    const { getByText } = render(<SyncScreen />);
    expect(getByText("fileManager.autoSync")).toBeTruthy();
    expect(getByText("fileManager.syncOnWifi")).toBeTruthy();
    expect(getByText("fileManager.syncPhotos")).toBeTruthy();
  });
});

// ============================================================================
// UPLOAD SCREEN
// ============================================================================

describe("FileManager — Upload Screen", () => {
  it("renders with testID", () => {
    const { getByTestId } = render(<UploadScreen />);
    expect(getByTestId("upload-screen")).toBeTruthy();
  });

  it("renders pick file button", () => {
    const { getByText } = render(<UploadScreen />);
    expect(getByText("fileManager.pickFile")).toBeTruthy();
  });

  it("renders upload item", () => {
    const { getByText } = render(<UploadScreen />);
    expect(getByText("upload.pdf")).toBeTruthy();
  });
});

// ============================================================================
// LAYOUT
// ============================================================================

describe("FileManager — Layout", () => {
  it("renders layout without crash", () => {
    const { toJSON } = render(<LayoutScreen />);
    expect(toJSON()).toBeTruthy();
  });
});
