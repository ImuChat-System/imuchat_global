// Mock for expo/virtual/env.js
// babel-preset-expo transforms process.env.EXPO_PUBLIC_* to imports from this module
module.exports = {
  env: process.env,
};
