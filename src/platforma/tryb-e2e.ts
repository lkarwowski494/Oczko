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
/** Zlecenie testowe skrzynki importu (P-230 Q2a): moduł ładowany warunkowo jak panele (P-238). */
export type SkrzynkaE2e = typeof import('../kompozycja/e2e/skrzynka');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- ładowanie warunkowe (P-238)
export const skrzynkaTestowa: SkrzynkaE2e | null = process.env.EXPO_PUBLIC_E2E === '1' ? (require('../kompozycja/e2e/skrzynka') as SkrzynkaE2e) : null;
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
/** `oczkoE2eIcloud` (P-230 Q1a): tryb atrapy iCloud (`wlaczony` | `wylaczony` | `brak-konta` | `brak-miejsca` | `konflikt`); działa tylko z atrapą (icloud.ts). */
export const trybIcloudE2e = (): string | null => argument('oczkoE2eIcloud');
/**
 * `oczkoE2eSzerokoscOkna=<pt>` (P-225 Q2a, P-237 (1)): aplikacja rysuje się w kontenerze tej szerokości — układ compact na symulatorze iPada
 * (nazwany wyjątek: bez klasy rozmiaru systemu; prawdziwe okno sprawdza urządzenie, P-226). Poza E2E albo przy złej wartości null.
 */
export function szerokoscOknaE2e(): number | null {
  const a = argument('oczkoE2eSzerokoscOkna');
  const n = a === null ? NaN : Number(a);
  return Number.isFinite(n) && n >= 200 && n <= 2000 ? n : null;
}
/** `oczkoE2eSkrzynka=pdf` (P-230 Q2a): przed pierwszym ekranem testowy PDF jako zlecenie bez projektu w skrzynce App Group. */
export const skrzynkaE2e = (): 'pdf' | null => (argument('oczkoE2eSkrzynka') === 'pdf' ? 'pdf' : null);
