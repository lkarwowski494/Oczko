// Przypomnienie „co N rzędów, M razy, od rzędu s” (RD-13, F-06).
import type { Wynik } from './bledy';
import { niezaimplementowane } from './zaslepka';

export type PlanPrzypomnienia = { od: number; co: number; razy: number };
export function czyPrzypomnienie(_rzad: number, _plan: PlanPrzypomnienia): Wynik<boolean> {
  return niezaimplementowane('RD-13 czyPrzypomnienie');
}
