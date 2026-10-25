// „Zgłoś problem” (F-57, ADR-0018): podgląd treści bez zapisu do bazy.
// sygnatura: propozycja 07, do zatwierdzenia w sesji fix 05 (Z07-22). Ciało: zaślepka roli 07 (E3).
import type { Wynik } from '../domena/bledy';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Zaleznosci } from './zaleznosci';

export function przygotujZgloszenie(_z: Zaleznosci): Promise<Wynik<{ tresc: string }>> {
  return niezaimplementowane('BR-DAN-010 przygotujZgloszenie');
}
