// Repozytorium zapasu włóczki (F-37; BR-ZAP-001, BR-ZAP-002 (U-9), BR-ZAP-004; RD-10 kategorie grubości).
// sygnatura: propozycja 07, do zatwierdzenia w sesji fix 05 (Z07-22). Ciała: zaślepki roli 07 (E3).
// Schemat v1 nie ma kolumny kategorii grubości w `wloczka` ([DO USTALENIA] 05, raport luk E3).
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
