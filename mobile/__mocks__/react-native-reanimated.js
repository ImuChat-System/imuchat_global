// Mock for react-native-reanimated
const React = require("react");

// Create animated components
const createAnimatedComponent = (Component) => {
  const AnimatedComponent = React.forwardRef((props, ref) => {
    return React.createElement(Component, { ...props, ref });
  });
  AnimatedComponent.displayName = `Animated.${Component.displayName || Component.name || "Component"}`;
  return AnimatedComponent;
};

// Mock Animated components
const Animated = {
  View: createAnimatedComponent(require("react-native").View),
  Text: createAnimatedComponent(require("react-native").Text),
  Image: createAnimatedComponent(require("react-native").Image),
  ScrollView: createAnimatedComponent(require("react-native").ScrollView),
  FlatList: createAnimatedComponent(require("react-native").FlatList),
  createAnimatedComponent,
};

// Animation presets
const SlideInDown = { duration: 300 };
const SlideOutDown = { duration: 300 };
const SlideInUp = { duration: 300 };
const SlideOutUp = { duration: 300 };
const FadeIn = { duration: 300 };
const FadeOut = { duration: 300 };
const FadeInDown = { duration: 300 };
const FadeOutUp = { duration: 300 };
const ZoomIn = { duration: 300 };
const ZoomOut = { duration: 300 };
const BounceIn = { duration: 300 };
const BounceOut = { duration: 300 };
const Layout = {};
const LinearTransition = {};

// Shared value mock
const useSharedValue = (initialValue) => {
  const ref = React.useRef({ value: initialValue });
  return ref.current;
};

const useAnimatedStyle = (styleFunction) => {
  try {
    return styleFunction();
  } catch {
    return {};
  }
};

const useAnimatedGestureHandler = () => ({});
const useAnimatedScrollHandler = () => ({});

const withTiming = (value, config, callback) => {
  callback && callback(true);
  return value;
};

const withSpring = (value, config, callback) => {
  callback && callback(true);
  return value;
};

const withDelay = (delay, animation) => animation;
const withSequence = (...animations) => animations[animations.length - 1];
const withRepeat = (animation, numberOfReps, reverse) => animation;
const cancelAnimation = () => {};
const interpolate = (value, inputRange, outputRange) => {
  const index = inputRange.findIndex((v) => v >= value);
  return outputRange[index] || outputRange[0];
};

const Extrapolate = {
  CLAMP: "clamp",
  EXTEND: "extend",
  IDENTITY: "identity",
};

const Extrapolation = {
  CLAMP: "clamp",
  EXTEND: "extend",
  IDENTITY: "identity",
};

const Easing = {
  linear: (t) => t,
  ease: (t) => t,
  quad: (t) => t,
  cubic: (t) => t,
  poly: () => (t) => t,
  sin: (t) => t,
  circle: (t) => t,
  exp: (t) => t,
  elastic: () => (t) => t,
  back: () => (t) => t,
  bounce: (t) => t,
  bezier: () => (t) => t,
  in: (easing) => easing,
  out: (easing) => easing,
  inOut: (easing) => easing,
};

const runOnJS = (fn) => fn;
const runOnUI = (fn) => fn;
const makeMutable = (value) => ({ value });
const useDerivedValue = (fn) => ({ value: fn() });

module.exports = {
  default: Animated,
  ...Animated,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  useAnimatedScrollHandler,
  useDerivedValue,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  cancelAnimation,
  interpolate,
  Extrapolate,
  Extrapolation,
  Easing,
  runOnJS,
  runOnUI,
  makeMutable,
  SlideInDown,
  SlideOutDown,
  SlideInUp,
  SlideOutUp,
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeOutUp,
  ZoomIn,
  ZoomOut,
  BounceIn,
  BounceOut,
  Layout,
  LinearTransition,
};
