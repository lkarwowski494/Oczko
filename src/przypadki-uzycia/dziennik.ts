// Scalenie dziennika +1 z ekranu blokady (ADR-0008, scal M-02, Z07-11): idempotentne po UUID, potem `skroc`.
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciało: zaślepka roli 07 (E3).
import type { Wynik } from '../domena/bledy';
import { niezaimplementowane } from '../domena/zaslepka';
import type { ZaleznosciDziennika } from './zaleznosci';

/** `pominieto`: linie bez licznika w bazie (zatruta linia, R-021) — wpis w `blad`, reszta scalona. */
export function scalDziennik(_z: ZaleznosciDziennika): Promise<Wynik<{ scalono: number; pominieto: number }>> {
  return niezaimplementowane('ADR-0008 scalDziennik');
}
