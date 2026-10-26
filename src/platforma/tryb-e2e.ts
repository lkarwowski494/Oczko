// Tryb buildu E2E (e2e/README.md „Build E2E”): jedyne miejsce przełączników EXPO_PUBLIC_E2E i EXPO_PUBLIC_WATCH_FAKE (kontrola TRYB-E2E).
// Bez EXPO_PUBLIC_E2E=1 argumenty startu są ignorowane, a funkcje zwracają tryb zwykły. Argumenty startu Maestro (`launchApp: arguments`)
// trafiają na iOS do domeny argumentów NSUserDefaults, czytanej przez `Settings.get` [DO USTALENIA e2e/README.md: potwierdza pierwszy przebieg].
import { Platform, Settings } from 'react-native';
import { chwilaLokalna } from '../domena/postep';
import type { Zegar } from '../domena/porty';
import { zegarSystemu } from './zegar';

export const E2E = process.env.EXPO_PUBLIC_E2E === '1';
/**
 * Panele buildu E2E (P-238): `require` w gałęzi warunku na zmiennej w tym samym module — Expo wstawia wartość EXPO_PUBLIC_*, Metro składa stałą
 * i bez EXPO_PUBLIC_E2E=1 moduł paneli (napisy „Test …”, testID `e2e-…`) nie trafia do bundla. Warunek z importowanej stałej `E2E` tego nie robi.
 */
export type PaneleE2e = typeof import('../kompozycja/e2e/panele');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- ładowanie warunkowe (P-238), jak expo-iap w sklep.ts
export const paneleE2e: PaneleE2e | null = process.env.EXPO_PUBLIC_E2E === '1' ? (require('../kompozycja/e2e/panele') as PaneleE2e) : null;
export const ZEGAREK_SZTUCZNY = E2E && process.env.EXPO_PUBLIC_WATCH_FAKE === '1';

function argument(klucz: string): string | null {
  if (!E2E || Platform.OS !== 'ios') return null;
  const v: unknown = Settings.get(klucz);
  return typeof v === 'string' && v.length > 0 ? v : null;
}
const strefaUrzadzenia = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** Zegar aplikacji: w buildzie E2E z `oczkoE2eTeraz` (podana chwila + czas od startu procesu; zegar biegnie, RD-17), inaczej zegar systemu. */
export function zegarAplikacji(teraz: () => number = Date.now): Zegar {
  const a = argument('oczkoE2eTeraz');
  if (!a) return zegarSystemu(teraz);
  const start = chwilaLokalna({ lokalnie: a, strefa: strefaUrzadzenia() });
  if (!start.ok) throw new Error(`oczkoE2eTeraz: zły zapis ${a}`); // błąd scenariusza, nie stan użytkownika
  const t0 = teraz();
  return zegarSystemu(() => start.wartosc + (teraz() - t0));
}
/** `oczkoE2eSiec=brak` (NFR-OFF-001): adapter sieci zwraca „brak połączenia”. */
export const siecWylaczona = (): boolean => argument('oczkoE2eSiec') === 'brak';
/** `oczkoE2eAwariaStartu=przed-kamieniem` (ADR-0019): wymuszona awaria przed kamieniem milowym startu. */
export const awariaStartu = (): boolean => argument('oczkoE2eAwariaStartu') === 'przed-kamieniem';
