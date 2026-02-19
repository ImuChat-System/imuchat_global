// Mock for lottie-react-native
const React = require("react");

const LottieView = React.forwardRef(({ children, ...props }, ref) => {
  return React.createElement("LottieView", { ...props, ref }, children);
});

LottieView.displayName = "LottieView";

// Mock play/pause methods
LottieView.prototype = {
  play: () => {},
  pause: () => {},
  reset: () => {},
  resume: () => {},
};

module.exports = LottieView;
module.exports.default = LottieView;
