module.exports = {
  preset: 'jest-expo/ios',
  setupFilesAfterEnv: ['<rootDir>/jest.app-after-env.js'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|standard-navigation)',
  ],
  testTimeout: 30000,
  workerIdleMemoryLimit: '800MB',
  coverageThreshold: {
    './src/core/gauge-calculator.ts': { lines: 100, branches: 100, functions: 100, statements: 100 },
    './src/core/hat-calculator.ts': { lines: 100, branches: 100, functions: 100, statements: 100 },
    './src/core/raglan-calculator.ts': { lines: 100, branches: 100, functions: 100, statements: 100 },
    './src/core/yarn-usage-estimator.ts': { lines: 100, branches: 100, functions: 100, statements: 100 },
    './src/core/yarn-substitution-service.ts': { lines: 100, branches: 100, functions: 100, statements: 100 },
    './src/core/unit-converter.ts': { lines: 100, branches: 100, functions: 100, statements: 100 },
    './src/core/use-unit-system.ts': { lines: 100, branches: 100, functions: 100, statements: 100 },
    './src/core/csv-exporter.ts': { lines: 100, branches: 100, functions: 100, statements: 100 },
    './src/core/knitting-doctor.ts': { lines: 100, branches: 100, functions: 100, statements: 100 },
    './src/core/time-tracking-service.ts': { lines: 100, branches: 100, functions: 100, statements: 100 },
    './src/core/': {
      lines: 99,
      branches: 94,
      functions: 95,
      statements: 98,
    },
  },
};
