// Scalanie zdarzeń licznika z wielu źródeł (ADR-0005, ADR-0008, ADR-0009). Prototyp: docs/architektura/eksperymenty/e1/scal.mjs; wyrocznia: scal-wektory.json (M-01–M-08).
import type { RodzajZdarzenia } from './stany';
import { niezaimplementowane } from './zaslepka';

export type ZdarzenieLicznika = { id: string; licznik: string; rodzaj: RodzajZdarzenia; wartosc?: number; rodzice: string[] };
export type WynikScalenia =
  | { stan: 'zgodny'; wartosc: number; glowy: string[] }
  | { stan: 'konflikt'; glowy: string[]; kandydaci: { glowa: string; wartosc: number }[] }
  | { stan: 'czeka'; brakujacy: string[] };

export function scal(_zdarzenia: ZdarzenieLicznika[]): WynikScalenia {
  return niezaimplementowane('NFR-DAN-003 scal');
}
