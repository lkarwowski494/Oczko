// Scalanie zdarzeń licznika z wielu źródeł (ADR-0005, ADR-0008, ADR-0009). Prototyp: docs/architektura/eksperymenty/e1/scal.mjs (iteracyjny,
// fix 05 2026-10-25, Z07-13); wyrocznia: scal-wektory.json (M-01–M-17), mutanty: eksperymenty/e1/mutanty-scal.mjs.
import type { RodzajZdarzenia } from './stany';
import { niezaimplementowane } from './zaslepka';

export type ZdarzenieLicznika = { id: string; licznik: string; rodzaj: RodzajZdarzenia; wartosc?: number; rodzice: string[]; cofa?: string[] };
export type WynikScalenia =
  | { stan: 'zgodny'; wartosc: number; glowy: string[] }
  | { stan: 'konflikt'; glowy: string[]; kandydaci: { glowa: string; wartosc: number }[] }
  | { stan: 'czeka'; brakujacy: string[] };
// Kontrakt 05 (fix 2026-10-25, Z07-13): czwarty wariant { stan: 'blad'; powod: 'kolizja_id' | 'nieznany_rodzaj' | 'wiele_rodzicow' | 'cykl'; id }
// (moduly.md „Scalanie”); dopisuje go 08 razem z dopasowaniem pomocnika `jakoZbiory` w testach 07 (typecheck:testy).

export function scal(_zdarzenia: ZdarzenieLicznika[]): WynikScalenia {
  return niezaimplementowane('NFR-DAN-003 scal');
}
