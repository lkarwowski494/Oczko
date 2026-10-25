// Przypadki użycia licznika (moduly.md „Ścieżka zapisu +1”, ADR-0002, ADR-0005, P-067, P-091 (3a)).
// sygnatura: propozycja 07, do zatwierdzenia w sesji fix 05 (Z07-22). Ciała: zaślepki roli 07 (E3).
import type { Wynik } from '../domena/bledy';
import type { STANY } from '../domena/stany';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Zaleznosci } from './zaleznosci';

export type RodzajLicznika = (typeof STANY)['licznik.rodzaj'][number];
export type WynikZmiany = { wartosc: number; zdarzenieId: string };

/** +1: jedna transakcja w kolejce; błąd kroku 3 → ROLLBACK i `powod: 'zapis'` (moduly.md:69–76). */
export function dodajRzad(_z: Zaleznosci, _w: { licznikId: string }): Promise<Wynik<WynikZmiany>> {
  return niezaimplementowane('NFR-DAN-002 dodajRzad');
}
export function odejmijRzad(_z: Zaleznosci, _w: { licznikId: string }): Promise<Wynik<WynikZmiany>> {
  return niezaimplementowane('BR-LIC-003 odejmijRzad');
}
/** Cofnięcie tylko ostatniej zmiany (P-091 (3a)). */
export function cofnijOstatnie(_z: Zaleznosci, _w: { licznikId: string }): Promise<Wynik<WynikZmiany>> {
  return niezaimplementowane('P-091 cofnijOstatnie');
}
/** Cofnięcie serii na końcu historii, od zdarzenia `odZdarzeniaId` do głowy (F-02, F-47, P-091 (3a)). */
export function cofnijSerie(_z: Zaleznosci, _w: { licznikId: string; odZdarzeniaId: string }): Promise<Wynik<WynikZmiany>> {
  return niezaimplementowane('BR-LIC-003 cofnijSerie');
}
export function wpiszWartosc(_z: Zaleznosci, _w: { licznikId: string; wartosc: number }): Promise<Wynik<WynikZmiany>> {
  return niezaimplementowane('BR-LIC-017 wpiszWartosc');
}
export function wyzeruj(_z: Zaleznosci, _w: { licznikId: string }): Promise<Wynik<WynikZmiany>> {
  return niezaimplementowane('BR-LIC-017 wyzeruj');
}
export function dodajLicznik(_z: Zaleznosci, _w: { czescId: string; rodzaj: RodzajLicznika; nazwa?: string }): Promise<Wynik<{ licznikId: string }>> {
  return niezaimplementowane('BR-LIC-006 dodajLicznik');
}
/** Licznik od pierwszego uruchomienia bez nazwy (BR-LIC-001, NFR-PIE-001): projekt roboczy z jedną częścią. */
export function utworzSzybkiLicznik(_z: Zaleznosci): Promise<Wynik<{ projektId: string; czescId: string; licznikId: string }>> {
  return niezaimplementowane('BR-LIC-001 utworzSzybkiLicznik');
}
