// Ekran nie gaśnie podczas liczenia (BR-LIC-013, F-10; port EkranAktywny, rejestr Expo 7: każdy włączony tag wyłączany).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciało: zaślepka roli 07 (E3).
import type { EkranAktywny } from '../domena/porty';
import { niezaimplementowane } from '../domena/zaslepka';

/** Wejście na ekran licznika; zwraca funkcję wyjścia. Opcja wyłączona → ani `wlacz`, ani nic do wyłączenia. */
export function wejdzNaEkranLicznika(_z: { ekran: EkranAktywny }, _w: { opcjaWlaczona: boolean }): () => void {
  return niezaimplementowane('BR-LIC-013 wejdzNaEkranLicznika');
}
