/**
 * Tests — Dev Store Screens (DEV-034)
 *
 * Render tests for the 10 developer portal screens.
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
      return { id: "test-id-1" };
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
        primary: "#6A54A3",
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
            primary: "#6A54A3",
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

// Mock the dev store with reasonable defaults
var mockDevStoreState = {
  submissions: [],
  submissionsLoading: false,
  versions: [],
  versionsLoading: false,
  themes: [],
  themesLoading: false,
  profile: null,
  profileLoading: false,
  analyticsOverview: null,
  analyticsLoading: false,
  analyticsPeriod: "30d",
  appAnalytics: {},
  apiKeys: [],
  apiKeysLoading: false,
  webhooks: [],
  webhooksLoading: false,
  dashboardStats: null,
  recentActivity: [],
  dashboardLoading: false,
  fetchSubmissions: jest.fn(),
  createSubmission: jest.fn(),
  updateSubmission: jest.fn(),
  deleteSubmission: jest.fn(),
  submitForReview: jest.fn(),
  fetchVersions: jest.fn(),
  publishVersion: jest.fn(),
  fetchThemes: jest.fn(),
  createTheme: jest.fn(),
  updateTheme: jest.fn(),
  deleteTheme: jest.fn(),
  publishTheme: jest.fn(),
  fetchProfile: jest.fn(),
  updateProfile: jest.fn(),
  startKYC: jest.fn(),
  fetchAnalyticsOverview: jest.fn(),
  fetchAppAnalytics: jest.fn(),
  setAnalyticsPeriod: jest.fn(),
  fetchAPIKeys: jest.fn(),
  createAPIKey: jest.fn(),
  revokeAPIKey: jest.fn(),
  fetchWebhooks: jest.fn(),
  createWebhook: jest.fn(),
  deleteWebhook: jest.fn(),
  fetchDashboard: jest.fn(),
  reset: jest.fn(),
};

jest.mock("@/stores/dev-store-store", function () {
  return {
    useDevStore: function (selector) {
      if (typeof selector === "function") {
        return selector(mockDevStoreState);
      }
      return mockDevStoreState;
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

// KeyboardAvoidingView can sometimes be undefined in test renderer
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
  Object.keys(mockDevStoreState).forEach(function (key) {
    if (
      typeof mockDevStoreState[key] === "function" &&
      mockDevStoreState[key].mockClear
    ) {
      mockDevStoreState[key].mockClear();
    }
  });
}

beforeEach(resetMocks);

// ─── Hub Screen ───────────────────────────────────────────────────

describe("DevStoreHub (index)", function () {
  var DevStoreHub = require("../../app/dev-store/index").default;

  it("renders without crashing", function () {
    var tree = render(React.createElement(DevStoreHub));
    expect(tree.getByTestId("dev-store-hub")).toBeTruthy();
  });

  it("calls fetchDashboard on mount", function () {
    render(React.createElement(DevStoreHub));
    expect(mockDevStoreState.fetchDashboard).toHaveBeenCalled();
  });
});

// ─── My Apps Screen ───────────────────────────────────────────────

describe("MyAppsScreen", function () {
  var MyAppsScreen = require("../../app/dev-store/my-apps").default;

  it("renders without crashing", function () {
    var tree = render(React.createElement(MyAppsScreen));
    expect(tree.getByTestId("my-apps-screen")).toBeTruthy();
  });

  it("calls fetchSubmissions on mount", function () {
    render(React.createElement(MyAppsScreen));
    expect(mockDevStoreState.fetchSubmissions).toHaveBeenCalled();
  });
});

// ─── Submit App Screen ────────────────────────────────────────────

describe("SubmitAppScreen", function () {
  var SubmitAppScreen = require("../../app/dev-store/submit-app").default;

  it("renders without crashing", function () {
    var tree = render(React.createElement(SubmitAppScreen));
    expect(tree.getByTestId("submit-app-screen")).toBeTruthy();
  });

  it("renders the app name input", function () {
    var tree = render(React.createElement(SubmitAppScreen));
    expect(tree.getByTestId("input-name")).toBeTruthy();
  });
});

// ─── App Detail Screen ───────────────────────────────────────────

describe("AppDetailScreen", function () {
  it("renders loading when no submission found", function () {
    var AppDetailScreen = require("../../app/dev-store/app-detail").default;
    var tree = render(React.createElement(AppDetailScreen));
    // With empty submissions and a test-id-1 param, should still render
    expect(tree).toBeTruthy();
  });
});

// ─── My Themes Screen ────────────────────────────────────────────

describe("MyThemesScreen", function () {
  var MyThemesScreen = require("../../app/dev-store/my-themes").default;

  it("renders without crashing", function () {
    var tree = render(React.createElement(MyThemesScreen));
    expect(tree.getByTestId("my-themes-screen")).toBeTruthy();
  });

  it("calls fetchThemes on mount", function () {
    render(React.createElement(MyThemesScreen));
    expect(mockDevStoreState.fetchThemes).toHaveBeenCalled();
  });
});

// ─── Theme Editor Screen ─────────────────────────────────────────

describe("ThemeEditorScreen", function () {
  var ThemeEditorScreen = require("../../app/dev-store/theme-editor").default;

  it("renders without crashing", function () {
    var tree = render(React.createElement(ThemeEditorScreen));
    expect(tree.getByTestId("theme-editor-screen")).toBeTruthy();
  });
});

// ─── Creator Profile Screen ──────────────────────────────────────

describe("CreatorProfileScreen", function () {
  var CreatorProfileScreen =
    require("../../app/dev-store/creator-profile").default;

  it("renders without crashing", function () {
    var tree = render(React.createElement(CreatorProfileScreen));
    expect(tree.getByTestId("creator-profile-screen")).toBeTruthy();
  });

  it("calls fetchProfile on mount", function () {
    render(React.createElement(CreatorProfileScreen));
    expect(mockDevStoreState.fetchProfile).toHaveBeenCalled();
  });
});

// ─── Analytics Screen ────────────────────────────────────────────

describe("AnalyticsScreen", function () {
  var AnalyticsScreen = require("../../app/dev-store/analytics").default;

  it("renders without crashing", function () {
    var tree = render(React.createElement(AnalyticsScreen));
    expect(tree.getByTestId("analytics-screen")).toBeTruthy();
  });

  it("calls fetchAnalyticsOverview on mount", function () {
    render(React.createElement(AnalyticsScreen));
    expect(mockDevStoreState.fetchAnalyticsOverview).toHaveBeenCalled();
  });
});

// ─── API Keys Screen ─────────────────────────────────────────────

describe("APIKeysScreen", function () {
  var APIKeysScreen = require("../../app/dev-store/api-keys").default;

  it("renders without crashing", function () {
    var tree = render(React.createElement(APIKeysScreen));
    expect(tree.getByTestId("api-keys-screen")).toBeTruthy();
  });

  it("calls fetchAPIKeys on mount", function () {
    render(React.createElement(APIKeysScreen));
    expect(mockDevStoreState.fetchAPIKeys).toHaveBeenCalled();
  });
});

// ─── Documentation Screen ────────────────────────────────────────

describe("DocumentationScreen", function () {
  var DocumentationScreen =
    require("../../app/dev-store/documentation").default;

  it("renders without crashing", function () {
    var tree = render(React.createElement(DocumentationScreen));
    expect(tree.getByTestId("documentation-screen")).toBeTruthy();
  });

  it("renders all doc sections", function () {
    var tree = render(React.createElement(DocumentationScreen));
    expect(tree.getByTestId("doc-getting-started")).toBeTruthy();
    expect(tree.getByTestId("doc-api-reference")).toBeTruthy();
    expect(tree.getByTestId("doc-submission-guide")).toBeTruthy();
    expect(tree.getByTestId("doc-theme-guide")).toBeTruthy();
    expect(tree.getByTestId("doc-permissions")).toBeTruthy();
    expect(tree.getByTestId("doc-monetization")).toBeTruthy();
    expect(tree.getByTestId("doc-best-practices")).toBeTruthy();
    expect(tree.getByTestId("doc-faq")).toBeTruthy();
  });
});
