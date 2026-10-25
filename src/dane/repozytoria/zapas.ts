// Repozytorium zapasu włóczki (F-37; BR-ZAP-001, BR-ZAP-002 (U-9), BR-ZAP-004; RD-10 kategorie grubości).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciała: zaślepki roli 07 (E3).
// Kategoria grubości: `wloczka.kategoria` (CYC 0–7 albo NULL, indeks `wloczka_kategoria`; fix 05 2026-10-25, P-099, P-110 Q6a).
import type { Wynik } from '../../domena/bledy';
import type { PortBazy } from '../../domena/porty';
import { niezaimplementowane } from '../../domena/zaslepka';

export type WloczkaZapasu = { id: string; nazwa: string; motki: number; dlugoscMotkaM: number | null; kategoria: number | null };
export function dodajWloczke(_baza: PortBazy, _w: { id: string; nazwa: string; motki: number; dlugoscMotkaM?: number; kategoria?: number; terazMs: number }): Promise<Wynik<void>> {
  return niezaimplementowane('BR-ZAP-001 dodajWloczke');
}
/** Zapas bez usuniętych; `kategoria` filtruje po kategorii grubości (RD-10). */
export function zapas(_baza: PortBazy, _w?: { kategoria?: number }): Promise<WloczkaZapasu[]> {
  return niezaimplementowane('BR-ZAP-004 zapas');
}
/** Potwierdzenie zużycia przy zakończeniu projektu: `projekt_wloczka.zuzyto_motki` i `wloczka.motki −=` w jednej transakcji. */
export function potwierdzZuzycie(_baza: PortBazy, _w: { projektId: string; zuzycie: { wloczkaId: string; motki: number }[]; terazMs: number }): Promise<Wynik<void>> {
  return niezaimplementowane('BR-ZAP-002 potwierdzZuzycie');
}
