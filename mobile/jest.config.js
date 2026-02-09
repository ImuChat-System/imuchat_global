module.exports = {
  preset: "jest-expo",
  // Override preset setupFiles (some packages provide ESM setup files) by
  // specifying a local CommonJS-safe setup file.
  setupFiles: ["<rootDir>/jest.setup.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    // Allow transforming react-native, expo and a few common packages inside node_modules
    "node_modules/(?!(react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@unimodules|unimodules|sentry-expo|native-base|react-native-svg|@supabase)/)",
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^react-native/jest/setup$":
      "<rootDir>/__mocks__/react-native-jest-setup.js",
    "^react-native/jest/setup.js$":
      "<rootDir>/__mocks__/react-native-jest-setup.js",
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
