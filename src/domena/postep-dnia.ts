// Wykonanie dnia i cel stały w ciągu dnia (RD-15, BR-DNI-005, P-047, P-048 (3)).
// sygnatura: propozycja 07, do zatwierdzenia w sesji fix 05 (Z07-22). Ciała: zaślepki roli 07 (E3).
import type { Wynik } from './bledy';
import type { CelDnia } from './postep';
import type { RodzajZdarzenia, STANY } from './stany';
import { niezaimplementowane } from './zaslepka';

export type ZmianaDnia = { id: string; rodzaj: RodzajZdarzenia; dzien: string; rodzajLicznika: (typeof STANY)['licznik.rodzaj'][number]; cofa: readonly string[] };
/** RD-15: Σ(+1) − Σ(−1) liczników rzędów z dniem = `dzis`, bez zmian cofniętych z historii i bez wpisań/zerowań. */
export function wykonanieDnia(_zmiany: readonly ZmianaDnia[], _dzis: string): number {
  return niezaimplementowane('BR-DNI-005 wykonanieDnia');
}
/** Cel na dziś z `przedDzis` (koniec wczoraj) — nie zależy od dzisiejszych zmian; wykonanie „w z g”. */
export function stanDnia(_w: { suma: number; przedDzis: number; termin: string; dzis: string; zmiany: readonly ZmianaDnia[] }): Wynik<{ cel: CelDnia; wykonanie: number }> {
  return niezaimplementowane('BR-DNI-005 stanDnia');
}
