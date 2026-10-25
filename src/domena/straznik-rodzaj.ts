// Strażnik stuknięć tylko dla liczników rzędów (RD-17 „tylko liczniki rzędów, nie oczek”, ER-24, BR-LIC-019/S3).
// sygnatura: propozycja 07, do zatwierdzenia w sesji fix 05 (Z07-22). Ciało: zaślepka roli 07 (E3).
import type { Wynik } from './bledy';
import type { STANY } from './stany';
import type { Dodanie, Seria } from './straznik-tempa';
import { niezaimplementowane } from './zaslepka';

/** Licznik oczek → `{ ok: true, wartosc: [] }` bez sprawdzania serii; licznik rzędów → `serieDoSprawdzenia`. */
export function serieLicznika(_w: { rodzajLicznika: (typeof STANY)['licznik.rodzaj'][number]; dodania: readonly Dodanie[]; konf: { seria: number; oknoS: number } }): Wynik<Seria[]> {
  return niezaimplementowane('BR-LIC-019 serieLicznika');
}
