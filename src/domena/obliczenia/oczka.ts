// Liczba oczek na szerokość z próbki (RD-01) i próbka 4 in → 10 cm (RD-04).
import type { Wynik } from '../bledy';
import { niezaimplementowane } from '../zaslepka';

export function oczkaNaSzerokosc(_w: { szerokoscCm: number; oczkaNa10cm: number }): Wynik<number> {
  return niezaimplementowane('RD-01 oczkaNaSzerokosc');
}
export function proba4inNa10cm(_oczkaNa4in: number): Wynik<number> {
  return niezaimplementowane('RD-04 proba4inNa10cm');
}
