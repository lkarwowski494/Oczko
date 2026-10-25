module.exports = {
  preset: 'jest-expo/ios',
  setupFiles: ['<rootDir>/jest.fast-check.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.app-after-env.js'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|standard-navigation)',
  ],
  // Testy oczekujące są poza głównym zestawem (DS-02): npm run test:akceptacja.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/tests/akceptacja/'],
  testTimeout: 30000,
  workerIdleMemoryLimit: '800MB',
};
