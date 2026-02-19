const expoPreset = require("jest-expo/jest-preset");

module.exports = {
  ...expoPreset,
  // Override setupFiles to avoid ESM issues with React Native 0.81.5
  setupFiles: [],
};
