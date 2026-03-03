/**
 * Tests — AI Admin Screens (DEV-035)
 *
 * Render tests for the 7 AI administration screens + hub.
 * Uses mocked store, theme, i18n, and router.
 */
import { render } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ────────────────────────────────────────────────────────

var mockPush = jest.fn();
var mockBack = jest.fn();

jest.mock("expo-router", function () {
  return {
    router: { push: mockPush, replace: jest.fn(), back: mockBack },
    useRouter: function () {
      return { push: mockPush, replace: jest.fn(), back: mockBack };
    },
    useLocalSearchParams: function () {
      return {};
    },
    Stack: {
      Screen: function () {
        return null;
      },
    },
    Href: jest.fn(),
  };
});

jest.mock("@/providers/ThemeProvider", function () {
  return {
    useColors: function () {
      return {
        background: "#0f0a1a",
        text: "#ffffff",
        textMuted: "#999",
        primary: "#ec4899",
        surface: "#1a1a2e",
        border: "#333",
        error: "#ef4444",
        success: "#22c55e",
        warning: "#f5a623",
      };
    },
    useSpacing: function () {
      return { sm: 4, md: 8, lg: 16, xl: 24 };
    },
    useTheme: function () {
      return {
        theme: {
          colors: {
            background: "#0f0a1a",
            text: "#ffffff",
            textMuted: "#999",
            primary: "#ec4899",
            surface: "#1a1a2e",
            border: "#333",
            error: "#ef4444",
            success: "#22c55e",
            warning: "#f5a623",
          },
        },
      };
    },
  };
});

jest.mock("@/providers/I18nProvider", function () {
  return {
    useI18n: function () {
      return {
        t: function (key) {
          return key;
        },
        locale: "fr",
      };
    },
  };
});

// Mock the AI admin store with reasonable defaults
var mockAIAdminStoreState = {
  assistantEnabled: true,
  personas: [
    {
      id: "general",
      name: "Alice",
      description: "Assistante polyvalente",
      icon: "sparkles",
      color: "#8B5CF6",
      systemPrompt: "Tu es Alice.",
      temperature: 0.7,
      isBuiltIn: true,
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
  ],
  memoryEntries: [],
  memoryEnabled: true,
  auditLog: [],
  auditEnabled: true,
  toolPermissions: [
    {
      tool: "web_search",
      enabled: true,
      requireConfirmation: false,
      lastUsedAt: null,
      usageCount: 0,
    },
    {
      tool: "code_execution",
      enabled: false,
      requireConfirmation: true,
      lastUsedAt: null,
      usageCount: 0,
    },
  ],
  autoSummary: {
    enabled: false,
    frequency: "daily",
    length: "medium",
    language: "auto",
    includeKeyPoints: true,
    includeActionItems: true,
    notifyOnComplete: false,
  },
  moderation: {
    globalEnabled: true,
    globalLevel: "medium",
    rules: [
      {
        category: "hate_speech",
        enabled: true,
        level: "high",
        action: "block",
      },
      { category: "spam", enabled: true, level: "medium", action: "flag" },
    ],
    logModerationEvents: true,
    notifyOnBlock: true,
    allowOverride: false,
  },
  isLoading: false,
  toggleAssistant: jest.fn(),
  addPersona: jest.fn(),
  updatePersona: jest.fn(),
  deletePersona: jest.fn(),
  togglePersona: jest.fn(),
  toggleMemory: jest.fn(),
  deleteMemoryEntry: jest.fn(),
  deleteMemoryByCategory: jest.fn(),
  clearAllMemory: jest.fn(),
  addMemoryEntry: jest.fn(),
  toggleAudit: jest.fn(),
  addAuditEntry: jest.fn(),
  clearAuditLog: jest.fn(),
  toggleToolPermission: jest.fn(),
  setToolConfirmation: jest.fn(),
  updateAutoSummary: jest.fn(),
  updateModeration: jest.fn(),
  updateModerationRule: jest.fn(),
  setLoading: jest.fn(),
};

jest.mock("@/stores/ai-admin-store", function () {
  return {
    useAIAdminStore: function (selector) {
      if (typeof selector === "function") {
        return selector(mockAIAdminStoreState);
      }
      return mockAIAdminStoreState;
    },
  };
});

jest.mock("@expo/vector-icons", function () {
  var RN = require("react-native");
  return {
    Ionicons: function (props) {
      return require("react").createElement(
        RN.Text,
        { testID: "icon-" + props.name },
        props.name,
      );
    },
  };
});

jest.mock(
  "react-native/Libraries/Components/Keyboard/KeyboardAvoidingView",
  function () {
    var React = require("react");
    var RN = require("react-native");
    return {
      __esModule: true,
      default: function (props) {
        return React.createElement(RN.View, props, props.children);
      },
    };
  },
);

// ─── Utils ────────────────────────────────────────────────────────

function resetMocks() {
  mockPush.mockClear();
  mockBack.mockClear();
  Object.keys(mockAIAdminStoreState).forEach(function (key) {
    if (
      typeof mockAIAdminStoreState[key] === "function" &&
      mockAIAdminStoreState[key].mockClear
    ) {
      mockAIAdminStoreState[key].mockClear();
    }
  });
}

beforeEach(resetMocks);

// ─── Hub Screen ───────────────────────────────────────────────────

describe("AIAdminHub (index)", function () {
  var AIAdminHub = require("../../app/ai-admin/index").default;

  it("renders without crashing", function () {
    var tree = render(React.createElement(AIAdminHub));
    expect(tree.getByTestId("ai-admin-hub-screen")).toBeTruthy();
  });

  it("renders the assistant toggle", function () {
    var tree = render(React.createElement(AIAdminHub));
    expect(tree.getByTestId("assistant-toggle")).toBeTruthy();
  });
});

// ─── Personas Screen ─────────────────────────────────────────────

describe("PersonasScreen", function () {
  var PersonasScreen = require("../../app/ai-admin/personas").default;

  it("renders without crashing", function () {
    var tree = render(React.createElement(PersonasScreen));
    expect(tree.getByTestId("personas-screen")).toBeTruthy();
  });

  it("renders the add persona button", function () {
    var tree = render(React.createElement(PersonasScreen));
    expect(tree.getByTestId("add-persona-btn")).toBeTruthy();
  });
});

// ─── Memory Screen ───────────────────────────────────────────────

describe("MemoryScreen", function () {
  var MemoryScreen = require("../../app/ai-admin/memory").default;

  it("renders without crashing", function () {
    var tree = render(React.createElement(MemoryScreen));
    expect(tree.getByTestId("memory-screen")).toBeTruthy();
  });

  it("renders the memory screen container", function () {
    var tree = render(React.createElement(MemoryScreen));
    expect(tree.toJSON()).toBeTruthy();
  });
});

// ─── Audit Log Screen ────────────────────────────────────────────

describe("AuditLogScreen", function () {
  var AuditLogScreen = require("../../app/ai-admin/audit-log").default;

  it("renders without crashing", function () {
    var tree = render(React.createElement(AuditLogScreen));
    expect(tree.getByTestId("audit-log-screen")).toBeTruthy();
  });

  it("renders the audit log screen container", function () {
    var tree = render(React.createElement(AuditLogScreen));
    expect(tree.toJSON()).toBeTruthy();
  });
});

// ─── Permissions Screen ──────────────────────────────────────────

describe("PermissionsScreen", function () {
  var PermissionsScreen = require("../../app/ai-admin/permissions").default;

  it("renders without crashing", function () {
    var tree = render(React.createElement(PermissionsScreen));
    expect(tree.getByTestId("permissions-screen")).toBeTruthy();
  });
});

// ─── Auto-Summary Screen ─────────────────────────────────────────

describe("AutoSummaryScreen", function () {
  var AutoSummaryScreen = require("../../app/ai-admin/auto-summary").default;

  it("renders without crashing", function () {
    var tree = render(React.createElement(AutoSummaryScreen));
    expect(tree.getByTestId("auto-summary-screen")).toBeTruthy();
  });
});

// ─── Moderation Screen ───────────────────────────────────────────

describe("ModerationScreen", function () {
  var ModerationScreen = require("../../app/ai-admin/moderation").default;

  it("renders without crashing", function () {
    var tree = render(React.createElement(ModerationScreen));
    expect(tree.getByTestId("moderation-screen")).toBeTruthy();
  });

  it("renders the moderation screen container", function () {
    var tree = render(React.createElement(ModerationScreen));
    expect(tree.toJSON()).toBeTruthy();
  });
});
