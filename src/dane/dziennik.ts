// Dziennik +1 z ekranu blokady (ADR-0008): odczyt pliku .jsonl po stronie TS (złote pliki wspólne z XCTest, Z07-11).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciała: zaślepki roli 07 (E3).
import type { DziennikPlus, PortBazy, ZdarzenieWejsciowe } from '../domena/porty';
import { niezaimplementowane } from '../domena/zaslepka';

/** Uszkodzona linia (ucięta, zły JSON, brak pola) pominięta; poprzednie zachowane. */
export function parsujDziennik(_tekst: string): { zdarzenia: ZdarzenieWejsciowe[]; uszkodzone: number[] } {
  return niezaimplementowane('ADR-0008 parsujDziennik');
}
/** Adapter DziennikPlus na pliku (Node, testy): uszkodzona linia → wiersz `blad` (diagnostyka F-57). */
export function utworzDziennikNode(_sciezka: string, _baza: PortBazy): DziennikPlus {
  return niezaimplementowane('ADR-0008 utworzDziennikNode');
}
