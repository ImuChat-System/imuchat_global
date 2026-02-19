// Mock for react-native-gesture-handler
const React = require("react");

const createMockComponent = (name) => {
  const component = ({ children, ...props }) => {
    return React.createElement(name, props, children);
  };
  component.displayName = name;
  return component;
};

const createChainableGesture = () => {
  const gesture = {
    onStart: () => gesture,
    onUpdate: () => gesture,
    onEnd: () => gesture,
    onFinalize: () => gesture,
    enabled: () => gesture,
    minPointers: () => gesture,
    maxPointers: () => gesture,
    minDistance: () => gesture,
    numberOfTaps: () => gesture,
    maxDuration: () => gesture,
    maxDelay: () => gesture,
    maxDeltaX: () => gesture,
    maxDeltaY: () => gesture,
    shouldCancelWhenOutside: () => gesture,
    withTestId: () => gesture,
  };
  return gesture;
};

module.exports = {
  GestureHandlerRootView: createMockComponent("GestureHandlerRootView"),
  GestureDetector: ({ children }) => children,
  Gesture: {
    Pinch: () => createChainableGesture(),
    Pan: () => createChainableGesture(),
    Tap: () => createChainableGesture(),
    Simultaneous: (...gestures) => createChainableGesture(),
    Exclusive: (...gestures) => createChainableGesture(),
    Race: (...gestures) => createChainableGesture(),
  },
  Swipeable: createMockComponent("Swipeable"),
  DrawerLayout: createMockComponent("DrawerLayout"),
  State: {
    UNDETERMINED: 0,
    FAILED: 1,
    BEGAN: 2,
    CANCELLED: 3,
    ACTIVE: 4,
    END: 5,
  },
  PanGestureHandler: createMockComponent("PanGestureHandler"),
  PinchGestureHandler: createMockComponent("PinchGestureHandler"),
  RotationGestureHandler: createMockComponent("RotationGestureHandler"),
  TapGestureHandler: createMockComponent("TapGestureHandler"),
  FlingGestureHandler: createMockComponent("FlingGestureHandler"),
  LongPressGestureHandler: createMockComponent("LongPressGestureHandler"),
  ScrollView: createMockComponent("ScrollView"),
  FlatList: createMockComponent("FlatList"),
  BaseButton: createMockComponent("BaseButton"),
  RectButton: createMockComponent("RectButton"),
  BorderlessButton: createMockComponent("BorderlessButton"),
  TouchableHighlight: createMockComponent("TouchableHighlight"),
  TouchableOpacity: createMockComponent("TouchableOpacity"),
  TouchableNativeFeedback: createMockComponent("TouchableNativeFeedback"),
  TouchableWithoutFeedback: createMockComponent("TouchableWithoutFeedback"),
  Directions: {
    RIGHT: 1,
    LEFT: 2,
    UP: 4,
    DOWN: 8,
  },
  gestureHandlerRootHOC: (component) => component,
};
