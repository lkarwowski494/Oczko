// Start i powrót na pierwszy plan (ADR-0008, ADR-0015, ADR-0019, P-072 (7a), Z07-11).
// sygnatura: propozycja 07, do zatwierdzenia w sesji fix 05 (Z07-22). Ciała: zaślepki roli 07 (E3).
import type { Wynik } from '../domena/bledy';
import { niezaimplementowane } from '../domena/zaslepka';
import type { ZaleznosciDziennika, ZaleznosciStartu } from './zaleznosci';

export type WynikStartuDanych = { migracja: { z: number; do: number }; scalono: number; sprzatnieto: number; domknieteSesje: number };
/** Kolejność: migruj → scalDziennik → domknięcie zapomnianych sesji (SESJA_MAKS_H) → sprzatnijKosz. */
export function uruchomDane(_z: ZaleznosciStartu): Promise<Wynik<WynikStartuDanych>> {
  return niezaimplementowane('NFR-DAN-001 uruchomDane');
}
/** `AppState → active`: scalenie dziennika w kolejce przed pierwszym zapisem po powrocie (Z07-11, R-020). */
export function naPierwszyPlan(_z: ZaleznosciDziennika): Promise<Wynik<{ scalono: number }>> {
  return niezaimplementowane('Z07-11 naPierwszyPlan');
}
