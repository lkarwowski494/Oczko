// Mechanizm i18n (ADR-0017): i18next + react-i18next, klucze znaczeniowe, źródło en, wybór z ustawień i z systemu.
import i18next, { type i18n as I18n, type TFunction } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ZRODLO, JEZYKI, lancuchZastepczy, wybierzJezyk, type PreferencjaJezyka } from './jezyki';

export type Zasoby = Record<string, { translation: Record<string, unknown> }>;
/** Port na tabelę `ustawienie` (klucze `jezyk`, `uklad_miar`); adapter w src/dane/repozytoria (rola 08). */
export interface MagazynPreferencji {
  odczytaj(klucz: string): Promise<string | null>;
  zapisz(klucz: string, wartosc: string): Promise<void>;
}
export const JEZYK_PSEUDO = 'en-XA';

export interface OpcjeI18n {
  magazyn: MagazynPreferencji;
  /** Tagi języków urządzenia w kolejności preferencji (expo-localization `getLocales`). */
  systemowe: () => string[];
  zasoby: Zasoby;
  /** Pseudolokalizacja: tylko build deweloperski (EXPO_PUBLIC_PSEUDO), nigdy w supportedLocales. */
  pseudo?: Zasoby[string];
}

async function bezpiecznyOdczyt(m: MagazynPreferencji, klucz: string): Promise<string | null> {
  try {
    return await m.odczytaj(klucz);
  } catch {
    return null; // uszkodzone ustawienia nie blokują startu aplikacji
  }
}

export async function utworzI18n(opcje: OpcjeI18n) {
  const instancja: I18n = i18next.createInstance();
  const nasluchujacy = new Set<(j: string) => void>();
  let preferencja: string | null = await bezpiecznyOdczyt(opcje.magazyn, 'jezyk');
  const zasoby: Zasoby = opcje.pseudo ? { ...opcje.zasoby, [JEZYK_PSEUDO]: opcje.pseudo } : opcje.zasoby;
  const wybierz = () => (opcje.pseudo ? JEZYK_PSEUDO : wybierzJezyk(preferencja, opcje.systemowe()));
  const fallbackLng = Object.fromEntries([
    ...JEZYKI.map((j) => [j, lancuchZastepczy(j).slice(1)] as const),
    [JEZYK_PSEUDO, [ZRODLO]],
    ['default', [ZRODLO]],
  ]);
  await instancja.use(initReactI18next).init({
    resources: zasoby,
    lng: wybierz(),
    fallbackLng,
    supportedLngs: false,
    interpolation: { escapeValue: false },
    returnEmptyString: false,
    initAsync: false,
  });
  const zmien = async () => {
    const j = wybierz();
    if (j !== instancja.language) {
      await instancja.changeLanguage(j);
      nasluchujacy.forEach((f) => f(j));
    }
  };
  return {
    i18n: instancja,
    t: instancja.t.bind(instancja) as TFunction,
    jezyk: () => instancja.language,
    /** `'auto'` = za systemem; zapis w ustawieniach przed zmianą (P-075, 3b). */
    async ustawJezyk(p: PreferencjaJezyka) {
      await opcje.magazyn.zapisz('jezyk', p);
      preferencja = p;
      await zmien();
    },
    /** Android: zmiana języka systemu nie restartuje aplikacji; wołane przy powrocie na pierwszy plan. */
    odswiezJezykSystemowy: zmien,
    naZmiane(f: (j: string) => void) {
      nasluchujacy.add(f);
      return () => void nasluchujacy.delete(f);
    },
  };
}
