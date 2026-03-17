// Mock for react-native to avoid ESM issues in Jest
// This provides minimal mocks for the most commonly used React Native components

const React = require("react");

// Create a simple mock component factory
const createMockComponent = (name) => {
  const component = ({ children, ...props }) => {
    return React.createElement(name, props, children);
  };
  component.displayName = name;
  return component;
};

// Core components
const View = createMockComponent("View");
const Text = createMockComponent("Text");
const TouchableOpacity = createMockComponent("TouchableOpacity");
const Pressable = createMockComponent("Pressable");
const ScrollView = createMockComponent("ScrollView");

// FlatList mock that actually renders items via data + renderItem
const FlatList = ({ data, renderItem, keyExtractor, children, ...props }) => {
  const items =
    data && renderItem
      ? data.map((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : String(index);
          return React.createElement(
            React.Fragment,
            { key },
            renderItem({ item, index, separators: {} }),
          );
        })
      : children;
  return React.createElement("FlatList", props, items);
};
FlatList.displayName = "FlatList";
const Image = createMockComponent("Image");
// Add static methods that hooks rely on
Image.prefetch = jest.fn(() => Promise.resolve());
Image.getSize = jest.fn();
Image.getSizeWithHeaders = jest.fn();
Image.resolveAssetSource = jest.fn(() => ({ uri: "", width: 0, height: 0 }));
const TextInput = createMockComponent("TextInput");
const ActivityIndicator = createMockComponent("ActivityIndicator");
const Button = createMockComponent("Button");
const Switch = createMockComponent("Switch");
const SafeAreaView = createMockComponent("SafeAreaView");
const Modal = createMockComponent("Modal");
const KeyboardAvoidingView = createMockComponent("KeyboardAvoidingView");
const StatusBar = createMockComponent("StatusBar");

// StyleSheet mock
const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => {
    if (Array.isArray(style)) {
      return Object.assign({}, ...style.filter(Boolean));
    }
    return style || {};
  },
  hairlineWidth: 1,
  absoluteFill: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  absoluteFillObject: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
};

// Platform mock
const Platform = {
  OS: "ios",
  Version: "14.0",
  select: (obj) => obj.ios ?? obj.default,
  isPad: false,
  isTV: false,
  isTesting: true,
};

// Dimensions mock
const Dimensions = {
  get: (dim) => {
    if (dim === "window" || dim === "screen") {
      return { width: 375, height: 812, scale: 2, fontScale: 1 };
    }
    return {};
  },
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
  set: () => {},
};

// Animated mock
const Animated = {
  View: createMockComponent("Animated.View"),
  Text: createMockComponent("Animated.Text"),
  Image: createMockComponent("Animated.Image"),
  ScrollView: createMockComponent("Animated.ScrollView"),
  FlatList: createMockComponent("Animated.FlatList"),
  Value: function (value) {
    this._value = value;
    this.setValue = (v) => {
      this._value = v;
    };
    this.setOffset = () => {};
    this.flattenOffset = () => {};
    this.extractOffset = () => {};
    this.interpolate = () => new Animated.Value(0);
    this.addListener = () => ({ remove: () => {} });
    this.removeListener = () => {};
    this.removeAllListeners = () => {};
    this.stopAnimation = (cb) => cb && cb(this._value);
  },
  ValueXY: function (value) {
    this.x = new Animated.Value(value?.x || 0);
    this.y = new Animated.Value(value?.y || 0);
    this.setValue = () => {};
    this.setOffset = () => {};
    this.flattenOffset = () => {};
    this.extractOffset = () => {};
    this.addListener = () => ({ remove: () => {} });
    this.removeListener = () => {};
    this.removeAllListeners = () => {};
    this.stopAnimation = (cb) => cb && cb({ x: 0, y: 0 });
    this.getLayout = () => ({ left: this.x, top: this.y });
    this.getTranslateTransform = () => [
      { translateX: this.x },
      { translateY: this.y },
    ];
  },
  timing: () => ({
    start: (cb) => cb && cb({ finished: true }),
    stop: () => {},
    reset: () => {},
  }),
  spring: () => ({
    start: (cb) => cb && cb({ finished: true }),
    stop: () => {},
    reset: () => {},
  }),
  decay: () => ({
    start: (cb) => cb && cb({ finished: true }),
    stop: () => {},
    reset: () => {},
  }),
  parallel: () => ({
    start: (cb) => cb && cb({ finished: true }),
    stop: () => {},
    reset: () => {},
  }),
  sequence: () => ({
    start: (cb) => cb && cb({ finished: true }),
    stop: () => {},
    reset: () => {},
  }),
  stagger: () => ({
    start: (cb) => cb && cb({ finished: true }),
    stop: () => {},
    reset: () => {},
  }),
  delay: () => ({
    start: (cb) => cb && cb({ finished: true }),
    stop: () => {},
    reset: () => {},
  }),
  loop: () => ({
    start: (cb) => cb && cb({ finished: true }),
    stop: () => {},
    reset: () => {},
  }),
  event: () => () => {},
  add: () => new Animated.Value(0),
  subtract: () => new Animated.Value(0),
  multiply: () => new Animated.Value(0),
  divide: () => new Animated.Value(0),
  modulo: () => new Animated.Value(0),
  diffClamp: () => new Animated.Value(0),
  createAnimatedComponent: (Component) => Component,
};

// PanResponder mock
const PanResponder = {
  create: (config) => ({
    panHandlers: {
      onStartShouldSetResponder: () => true,
      onMoveShouldSetResponder: () => true,
      onResponderGrant: () => {},
      onResponderMove: () => {},
      onResponderRelease: () => {},
      onResponderTerminate: () => {},
      onStartShouldSetResponderCapture: () => true,
      onMoveShouldSetResponderCapture: () => true,
    },
  }),
};

// AppState mock
const AppState = {
  currentState: "active",
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
};

// Linking mock
const Linking = {
  openURL: () => Promise.resolve(),
  canOpenURL: () => Promise.resolve(true),
  getInitialURL: () => Promise.resolve(null),
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
};

// Alert mock
const Alert = {
  alert: () => {},
  prompt: () => {},
};

// Vibration mock
const Vibration = {
  vibrate: () => {},
  cancel: () => {},
};

// PixelRatio mock
const PixelRatio = {
  get: () => 2,
  getFontScale: () => 1,
  getPixelSizeForLayoutSize: (size) => size * 2,
  roundToNearestPixel: (size) => Math.round(size * 2) / 2,
};

// Keyboard mock
const Keyboard = {
  dismiss: () => {},
  addListener: () => ({ remove: () => {} }),
  removeListener: () => {},
  removeAllListeners: () => {},
  isVisible: () => false,
  metrics: () => ({}),
  scheduleLayoutAnimation: () => {},
};

// AccessibilityInfo mock
const AccessibilityInfo = {
  addEventListener: () => ({ remove: () => {} }),
  announceForAccessibility: () => {},
  isAccessibilityServiceEnabled: () => Promise.resolve(false),
  isBoldTextEnabled: () => Promise.resolve(false),
  isGrayscaleEnabled: () => Promise.resolve(false),
  isInvertColorsEnabled: () => Promise.resolve(false),
  isReduceMotionEnabled: () => Promise.resolve(false),
  isReduceTransparencyEnabled: () => Promise.resolve(false),
  isScreenReaderEnabled: () => Promise.resolve(false),
  prefersCrossFadeTransitions: () => Promise.resolve(false),
  setAccessibilityFocus: () => {},
};

// BackHandler mock (Android)
const BackHandler = {
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
  exitApp: () => {},
};

// InteractionManager mock
const InteractionManager = {
  runAfterInteractions: (callback) => {
    callback && callback();
    return { then: () => {}, done: () => {}, cancel: () => {} };
  },
  createInteractionHandle: () => 1,
  clearInteractionHandle: () => {},
  setDeadline: () => {},
};

// NativeModules mock
const NativeModules = {};

// I18nManager mock
const I18nManager = {
  isRTL: false,
  allowRTL: () => {},
  forceRTL: () => {},
  swapLeftAndRightInRTL: () => {},
};

// Appearance mock
const Appearance = {
  getColorScheme: () => "light",
  addChangeListener: () => ({ remove: () => {} }),
  removeChangeListener: () => {},
};

// useColorScheme hook
const useColorScheme = () => "light";

// useWindowDimensions hook
const useWindowDimensions = () => ({
  width: 375,
  height: 812,
  scale: 2,
  fontScale: 1,
});

module.exports = {
  // Components
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  Button,
  Switch,
  SafeAreaView,
  Modal,
  KeyboardAvoidingView,
  StatusBar,

  // APIs
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
  PanResponder,
  AppState,
  Linking,
  Alert,
  Vibration,
  PixelRatio,
  Keyboard,
  AccessibilityInfo,
  BackHandler,
  InteractionManager,
  NativeModules,
  I18nManager,
  Appearance,

  // Hooks
  useColorScheme,
  useWindowDimensions,

  // Additional exports needed
  processColor: (color) => color,
  requireNativeComponent: () => createMockComponent("NativeComponent"),
  findNodeHandle: () => null,
  UIManager: {
    getViewManagerConfig: () => ({}),
    measure: () => {},
    measureInWindow: () => {},
    dispatchViewManagerCommand: () => {},
  },
};
