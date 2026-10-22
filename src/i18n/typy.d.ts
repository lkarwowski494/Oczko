// Typowane klucze t(): literówka w kluczu to błąd kompilacji (źródło en.json; liczba mnoga przez `count`).
import type en from './slowniki/en.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof en };
  }
}
