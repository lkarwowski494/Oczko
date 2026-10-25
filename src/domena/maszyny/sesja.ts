// Maszyna sesji stopera (moduly.md, „Sesja stopera (F-21, F-51)”; P-072).
import type { Wynik } from '../bledy';
import type { StanSesji } from '../stany';
import { niezaimplementowane } from '../zaslepka';

export type Sesja = { stan: StanSesji; startMs: number; wstrzymanoMs: number | null; przerwyMs: number; koniecMs: number | null; skorygowano: boolean; doSprawdzenia: boolean };
export type ZdarzenieSesji = { rodzaj: 'wstrzymaj' | 'wznow' | 'zakoncz' } | { rodzaj: 'koryguj'; startMs: number; koniecMs: number } | { rodzaj: 'start_aplikacji' };
export function rozpocznijSesje(_terazMs: number): Sesja {
  return niezaimplementowane('BR-PRJ-013 rozpocznijSesje');
}
export function przejdzSesje(_s: Sesja, _z: ZdarzenieSesji, _terazMs: number, _maksH: number): Wynik<Sesja> {
  return niezaimplementowane('BR-PRJ-013 przejdzSesje');
}
export function czasSesjiMs(_s: Sesja): number {
  return niezaimplementowane('BR-PRJ-013 czasSesjiMs');
}
