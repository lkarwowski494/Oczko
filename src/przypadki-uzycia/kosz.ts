// Sprzątanie „Ostatnio usuniętych” przy starcie (P-026, KOSZ_DNI; pliki bez odwołań po COMMIT, ADR-0001).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciało: zaślepka roli 07 (E3).
import type { Wynik } from '../domena/bledy';
import { niezaimplementowane } from '../domena/zaslepka';
import type { ZaleznosciPlikow } from './zaleznosci';

export type WynikSprzatania = { projekty: number; czesci: number; liczniki: number; pliki: number };
export function sprzatnijKosz(_z: ZaleznosciPlikow): Promise<Wynik<WynikSprzatania>> {
  return niezaimplementowane('BR-DAN-008/S2 sprzatnijKosz');
}
