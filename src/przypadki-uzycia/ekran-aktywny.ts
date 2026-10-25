// Ekran nie gaśnie podczas liczenia (BR-LIC-013, F-10; port EkranAktywny, rejestr Expo 7: każdy włączony tag wyłączany).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciało: zaślepka roli 07 (E3).
import type { EkranAktywny } from '../domena/porty';

/** Wejście na ekran licznika; zwraca funkcję wyjścia. Opcja wyłączona → ani `wlacz`, ani nic do wyłączenia. */
const TAG = 'oczko-licznik'; // jeden tag ekranu licznika; ten sam przy wyłączeniu (rejestr Expo 7)
export function wejdzNaEkranLicznika(z: { ekran: EkranAktywny }, w: { opcjaWlaczona: boolean }): () => void {
  if (!w.opcjaWlaczona) return () => undefined;
  z.ekran.wlacz(TAG);
  let wylaczony = false;
  return () => {
    if (wylaczony) return; // podwójne wyjście (np. tło i odmontowanie) nie wyłącza tagu drugi raz
    wylaczony = true;
    z.ekran.wylacz(TAG);
  };
}
