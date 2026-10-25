// Strażnik stuknięć RD-17; osobno dla każdego źródła, po czasie zdarzenia (P-091 4b).
import type { Wynik } from './bledy';
import type { ZrodloZdarzenia } from './stany';
import { niezaimplementowane } from './zaslepka';

export type Dodanie = { id: string; czasMs: number; zrodlo: ZrodloZdarzenia };
export type Seria = { zrodlo: ZrodloZdarzenia; ids: string[]; odMs: number; doMs: number };

/** Serie do pytania „Added n rows in t s. Undo?”; parametry z konfiguracji (STRAZNIK_SERIA_ZDARZEN, STRAZNIK_OKNO_S). */
export function serieDoSprawdzenia(_dodania: Dodanie[], _konf: { seria: number; oknoS: number }): Wynik<Seria[]> {
  return niezaimplementowane('RD-17 serieDoSprawdzenia');
}
