// Reguła darmowego limitu dni (P-057, kontrakt KP-12–KP-15). Wzorzec: docs/monetyzacja/limit.mjs; wyrocznia: docs/monetyzacja/wektory-limitu.json.
import type { RodzajZdarzenia } from './stany';
import { niezaimplementowane } from './zaslepka';

export type RodzajStraznika = 'plus' | 'wpisanie' | 'zerowanie' | 'minus' | 'edycja-historii';
export type DzienLimitu = { data: string; pro: boolean }; // data: RRRR-MM-DD (RD-16)
export type WejscieDnia = { dni: DzienLimitu[]; dzis: string; teraz: number; ostatniPlus: number | null; pro: boolean; limit?: number; przerwa?: number };
export type WynikStartu = { dozwolone: boolean; zapis: DzienLimitu | null; zostalo: number };
export type StanZawczasu = { limitZawczasu: boolean; ostatniDarmowy: boolean; zostalo: number };

/** Mapowanie rodzaju zdarzenia z bazy na rodzaj strażnika (moduly.md, „Mapowanie rodzaju zdarzenia”, P-067). */
export function rodzajStraznika(rodzaj: RodzajZdarzenia): RodzajStraznika {
  return niezaimplementowane(`moduly.md:77 rodzajStraznika(${rodzaj})`);
}
export function wolaStraznika(_z: { rodzaj: RodzajStraznika }): boolean {
  return niezaimplementowane('KP-12 wolaStraznika');
}
export function startDnia(_w: WejscieDnia): WynikStartu {
  return niezaimplementowane('KP-12 startDnia');
}
export function mozeZaczacDzien(_w: WejscieDnia): StanZawczasu {
  return niezaimplementowane('KP-13 mozeZaczacDzien');
}
