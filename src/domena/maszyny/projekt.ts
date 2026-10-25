// Maszyna stanów projektu (moduly.md, „Projekt (F-19, F-33)”; ADR-0013).
import type { Wynik } from '../bledy';
import type { StanProjektu } from '../stany';
import { niezaimplementowane } from '../zaslepka';

export type Projekt = { stan: StanProjektu; ukonczonoMs: number | null; usunietoMs: number | null };
export type ZdarzenieProjektu = 'ukoncz' | 'wznow' | 'usun' | 'przywroc';
export function przejdzProjekt(_p: Projekt, _z: ZdarzenieProjektu, _terazMs: number): Wynik<Projekt> {
  return niezaimplementowane('ADR-0013 przejdzProjekt');
}
/** Sprzątanie przy starcie: true, gdy projekt usunięty co najmniej KOSZ_DNI temu. */
export function doSprzatniecia(_p: Projekt, _terazMs: number, _koszDni: number): boolean {
  return niezaimplementowane('BR-DAN-008 doSprzatniecia');
}
