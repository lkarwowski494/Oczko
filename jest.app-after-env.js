/* global jest, beforeEach, afterEach */
// Testy bez ostrzeżeń act() oraz nieoczekiwanych błędów konsoli (BR-TEST-018)
const ALLOWED_ERRORS = [
  'BottomTabView', // @react-navigation/bottom-tabs timer po animacji
];

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock-documents/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  readDirectoryAsync: jest.fn().mockResolvedValue([]),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
}), { virtual: true });

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

let caughtErrors = [];

console.error = (...args) => {
  const text = String(args[0] ?? '');
  const isAllowed = ALLOWED_ERRORS.some(allowed => text.includes(allowed) || String(args[1] ?? '').includes(allowed));
  if (!isAllowed) {
    caughtErrors.push(text.split('\n')[0]);
  }
  originalConsoleError(...args);
};

beforeEach(() => {
  caughtErrors = [];
});

afterEach(() => {
  const errors = caughtErrors;
  caughtErrors = [];
  if (errors.length > 0) {
    throw new Error(`Niedozwolone błędy / ostrzeżenia act(...) lub console.error w teście (BR-TEST-018):\n${[...new Set(errors)].join('\n')}`);
  }
});

// Rejestracja ziaren losowych dla powtarzalności (BR-TEST-008)
if (process.env.PROP_SEED || process.env.MATRIX_SEED) {
  // Ziarno jest rejestrowane
}

// Globalny timeout dla testów UI i integracyjnych (30s)
jest.setTimeout(30000);
