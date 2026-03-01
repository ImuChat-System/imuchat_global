// Define __DEV__ global for React Native compatibility
globalThis.__DEV__ = true;

// Mock Supabase
jest.mock("./services/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
}));

// Mock Expo Router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Stack: {
    Screen: () => null,
  },
  Tabs: Object.assign(({ children }) => children, {
    Screen: ({ name }) => null,
  }),
  Href: jest.fn(),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock Expo Image Picker
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" }),
  ),
  requestCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" }),
  ),
  MediaTypeOptions: {
    Images: "Images",
    Videos: "Videos",
    All: "All",
  },
}));

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
  FontAwesome: "FontAwesome",
  FontAwesome5: "FontAwesome5",
  MaterialIcons: "MaterialIcons",
  MaterialCommunityIcons: "MaterialCommunityIcons",
  Feather: "Feather",
}));

// Mock @expo/vector-icons/FontAwesome (separate import path)
jest.mock("@expo/vector-icons/FontAwesome", () => "FontAwesome");

// Mock expo-localization
jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "fr", languageTag: "fr-FR" }],
  getCalendars: () => [{ calendar: "gregory", timeZone: "Europe/Paris" }],
}));

// Mock expo-haptics (virtual — not installed)
jest.mock(
  "expo-haptics",
  () => ({
    impactAsync: jest.fn(),
    notificationAsync: jest.fn(),
    selectionAsync: jest.fn(),
    ImpactFeedbackStyle: { Light: "Light", Medium: "Medium", Heavy: "Heavy" },
    NotificationFeedbackType: {
      Success: "Success",
      Warning: "Warning",
      Error: "Error",
    },
  }),
  { virtual: true },
);

// Mock expo-clipboard
jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(),
  getStringAsync: jest.fn(),
}));

// Mock expo-linking (ESM module Jest can't parse)
jest.mock("expo-linking", () => ({
  parse: jest.fn(() => ({
    scheme: "",
    hostname: "",
    path: "",
    queryParams: {},
  })),
  createURL: jest.fn((path) => "imuchat://" + path),
  openURL: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock @react-native-community/netinfo (NativeModule.RNCNetInfo is null in Jest)
jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: "wifi",
    }),
  ),
  useNetInfo: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
    type: "wifi",
  })),
}));

// Mock expo-av
jest.mock("expo-av", () => ({
  Audio: {
    Recording: jest.fn(() => ({
      prepareToRecordAsync: jest.fn(),
      startAsync: jest.fn(),
      stopAndUnloadAsync: jest.fn(),
      getURI: jest.fn(() => "file://recording.m4a"),
      getStatusAsync: jest.fn(() => ({
        isRecording: true,
        durationMillis: 3000,
        metering: -30,
      })),
    })),
    Sound: {
      createAsync: jest.fn(() => ({
        sound: {
          playAsync: jest.fn(),
          pauseAsync: jest.fn(),
          stopAsync: jest.fn(),
          unloadAsync: jest.fn(),
          setPositionAsync: jest.fn(),
          setVolumeAsync: jest.fn(),
          setIsLoopingAsync: jest.fn(),
          setStatusAsync: jest.fn(),
          getStatusAsync: jest.fn(() => ({ isLoaded: true })),
        },
      })),
    },
    requestPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: "granted" }),
    ),
    setAudioModeAsync: jest.fn(),
    RecordingOptionsPresets: { HIGH_QUALITY: {} },
    AndroidOutputFormat: { MPEG_4: 2 },
    AndroidAudioEncoder: { AAC: 3 },
    IOSAudioQuality: { HIGH: 127 },
  },
}));

// Mock expo-sharing
jest.mock("expo-sharing", () => ({
  shareAsync: jest.fn(),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock react-native-safe-area-context (ESM import that Jest can't parse)
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  initialWindowMetrics: {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  },
}));

// Mock expo-file-system
jest.mock("expo-file-system", () => ({
  documentDirectory: "file:///docs/",
  cacheDirectory: "file:///cache/",
  writeAsStringAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: false })),
  EncodingType: { UTF8: "utf8", Base64: "base64" },
}));

// Mock @react-native-async-storage/async-storage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
}));

// Mock I18nProvider (useI18n)
jest.mock("./providers/I18nProvider", () => ({
  I18nProvider: ({ children }) => children,
  useI18n: () => ({
    locale: "fr",
    setLocale: jest.fn(),
    t: (key) => key,
  }),
}));

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: ({ children }) => children,
  Swipeable: ({ children }) => children,
  RectButton: "RectButton",
  PanGestureHandler: "PanGestureHandler",
  State: {},
  Directions: {},
}));

// Mock rn-emoji-keyboard (imports .png assets that Jest can't parse)
jest.mock("rn-emoji-keyboard", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: (props) => null,
    EmojiKeyboard: (props) => null,
  };
});

// Mock chat sub-components that depend on external native modules
jest.mock("./components/chat/EmojiPickerButton", () => ({
  EmojiPickerButton: () => null,
}));

jest.mock("./components/chat/GifPicker", () => ({
  GifButton: () => null,
  GifPicker: () => null,
}));

jest.mock("./components/chat/ReplyPreview", () => ({
  ReplyPreview: () => null,
}));

// Mock media upload hook
jest.mock("./hooks/useMediaUpload", () => ({
  useMediaUpload: () => ({
    pickImage: jest.fn(),
    pickDocument: jest.fn(),
    uploading: false,
    progress: 0,
  }),
}));

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
