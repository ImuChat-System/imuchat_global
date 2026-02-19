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

// Helper to create chainable animation presets
const createAnimationPreset = (name) => {
  const preset = {
    duration: (ms) => preset,
    delay: (ms) => preset,
    springify: () => preset,
    damping: (value) => preset,
    stiffness: (value) => preset,
    overshootClamping: (value) => preset,
    restDisplacementThreshold: (value) => preset,
    restSpeedThreshold: (value) => preset,
    withInitialValues: (values) => preset,
    withCallback: (callback) => preset,
    build: () => preset,
  };
  return preset;
};

// Animation presets with chainable API
const SlideInDown = createAnimationPreset("SlideInDown");
const SlideOutDown = createAnimationPreset("SlideOutDown");
const SlideInUp = createAnimationPreset("SlideInUp");
const SlideOutUp = createAnimationPreset("SlideOutUp");
const SlideInRight = createAnimationPreset("SlideInRight");
const SlideOutRight = createAnimationPreset("SlideOutRight");
const SlideInLeft = createAnimationPreset("SlideInLeft");
const SlideOutLeft = createAnimationPreset("SlideOutLeft");
const FadeIn = createAnimationPreset("FadeIn");
const FadeOut = createAnimationPreset("FadeOut");
const FadeInDown = createAnimationPreset("FadeInDown");
const FadeOutUp = createAnimationPreset("FadeOutUp");
const ZoomIn = createAnimationPreset("ZoomIn");
const ZoomOut = createAnimationPreset("ZoomOut");
const BounceIn = createAnimationPreset("BounceIn");
const BounceOut = createAnimationPreset("BounceOut");
const Layout = createAnimationPreset("Layout");
const LinearTransition = createAnimationPreset("LinearTransition");

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
  SlideInRight,
  SlideOutRight,
  SlideInLeft,
  SlideOutLeft,
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
