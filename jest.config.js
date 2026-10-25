module.exports = {
  preset: 'jest-expo/ios',
  setupFiles: ['<rootDir>/jest.fast-check.js'],
  // Zastępniki pakietów natywnych na Node (P-120 Q1a, jak Trening): prawdziwy dysk i prawdziwy SQLite, nie atrapa.
  moduleNameMapper: {
    '^expo-file-system$': '<rootDir>/tests/narzedzia/expo-file-system-node.ts',
    '^expo-sqlite$': '<rootDir>/tests/narzedzia/expo-sqlite-node.ts',
  },
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
