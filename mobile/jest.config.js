module.exports = {
  // No preset - manual config to avoid RN 0.81.5 ESM issues
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    // Transform all react-native related packages
    "node_modules/(?!(react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@unimodules|unimodules|sentry-expo|native-base|react-native-svg|@supabase|@testing-library)/)",
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      { configFile: "./babel.config.js" },
    ],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    // Force single React instance to avoid hooks errors
    "^react$": "<rootDir>/node_modules/react",
    "^react-dom$": "<rootDir>/node_modules/react-dom",
    "^react-test-renderer$": "<rootDir>/node_modules/react-test-renderer",
    // Mock react-native to avoid ESM issues
    "^react-native$": "<rootDir>/__mocks__/react-native.js",
    "^lottie-react-native$": "<rootDir>/__mocks__/lottie-react-native.js",
    "^react-native-reanimated$":
      "<rootDir>/__mocks__/react-native-reanimated.js",
    "^expo-av$": "<rootDir>/__mocks__/expo-av.js",
    "^expo-file-system/legacy$":
      "<rootDir>/__mocks__/expo-file-system/legacy.js",
    "^@react-native/js-polyfills/(.*)$": "<rootDir>/__mocks__/empty.js",
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.expo/**",
    "!**/coverage/**",
    "!jest.config.js",
    "!jest.setup.js",
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
};
