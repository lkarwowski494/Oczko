// Start i powrót na pierwszy plan (ADR-0008, ADR-0015, ADR-0019, P-072 (7a), Z07-11).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciała: zaślepki roli 07 (E3).
import type { Wynik } from '../domena/bledy';
import { niezaimplementowane } from '../domena/zaslepka';
import { scalDziennikWKolejce } from './dziennik';
import { wKolejce } from './kolejka';
import type { ZaleznosciDziennika, ZaleznosciStartu } from './zaleznosci';

export type WynikStartuDanych = { migracja: { z: number; do: number }; scalono: number; sprzatnieto: number; domknieteSesje: number };
/** Kolejność: migruj → scalDziennik → domknięcie zapomnianych sesji (SESJA_MAKS_H) → sprzatnijKosz. */
export function uruchomDane(_z: ZaleznosciStartu): Promise<Wynik<WynikStartuDanych>> {
  return niezaimplementowane('NFR-DAN-001 uruchomDane');
}
/** `AppState → active`: scalenie dziennika w kolejce przed pierwszym zapisem po powrocie (Z07-11, R-020). */
export function naPierwszyPlan(z: ZaleznosciDziennika): Promise<Wynik<{ scalono: number }>> {
  // Pozycja kolejki powstaje synchronicznie w chwili wywołania, więc zapis z ekranu wywołany później jej nie wyprzedzi (ADR-0008 (2)).
  return wKolejce(z.baza, async () => {
    const w = await scalDziennikWKolejce(z);
    return w.ok ? { ok: true, wartosc: { scalono: w.wartosc.scalono } } : w;
  });
}
