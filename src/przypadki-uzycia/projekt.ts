// Przypadki użycia projektu, części i kosza (moduly.md „Projekt”, ADR-0013, P-026, P-047 (7), P-072 (8a)).
// sygnatura: propozycja 07, do zatwierdzenia w sesji fix 05 (Z07-22). Ciała: zaślepki roli 07 (E3).
import type { Wynik } from '../domena/bledy';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Zaleznosci, ZaleznosciPlikow } from './zaleznosci';

export type NowyProjekt = { projektId: string; czesci: { czescId: string; nazwa: string; licznikId: string }[] };

export function utworzProjekt(_z: Zaleznosci, _w: { nazwa: string; czesci: string[] }): Promise<Wynik<NowyProjekt>> {
  return niezaimplementowane('BR-PRJ-001 utworzProjekt');
}
/** Nadanie albo zmiana nazwy: UPSERT, nigdy REPLACE (ADR-0002). */
export function nazwijProjekt(_z: Zaleznosci, _w: { projektId: string; nazwa: string }): Promise<Wynik<void>> {
  return niezaimplementowane('BR-LIC-001 nazwijProjekt');
}
export function zapiszNotatke(_z: Zaleznosci, _w: { projektId: string; tekst: string }): Promise<Wynik<void>> {
  return niezaimplementowane('BR-PRJ-002 zapiszNotatke');
}
export function zakonczProjekt(_z: Zaleznosci, _w: { projektId: string }): Promise<Wynik<void>> {
  return niezaimplementowane('BR-PRJ-006 zakonczProjekt');
}
export function wznowProjekt(_z: Zaleznosci, _w: { projektId: string }): Promise<Wynik<void>> {
  return niezaimplementowane('BR-PRJ-006 wznowProjekt');
}
export function zmienDateUkonczenia(_z: Zaleznosci, _w: { projektId: string; ukonczonoMs: number }): Promise<Wynik<void>> {
  return niezaimplementowane('BR-PRJ-013 zmienDateUkonczenia');
}
export function usunProjekt(_z: Zaleznosci, _w: { projektId: string }): Promise<Wynik<void>> {
  return niezaimplementowane('BR-DAN-008 usunProjekt');
}
export function przywrocProjekt(_z: Zaleznosci, _w: { projektId: string }): Promise<Wynik<void>> {
  return niezaimplementowane('BR-DAN-008 przywrocProjekt');
}
export function usunLicznik(_z: Zaleznosci, _w: { licznikId: string }): Promise<Wynik<void>> {
  return niezaimplementowane('BR-DAN-008/S3 usunLicznik');
}
export function przywrocLicznik(_z: Zaleznosci, _w: { licznikId: string }): Promise<Wynik<void>> {
  return niezaimplementowane('BR-DAN-008/S3 przywrocLicznik');
}
export function usunCzesc(_z: Zaleznosci, _w: { czescId: string }): Promise<Wynik<void>> {
  return niezaimplementowane('BR-DAN-008/S4 usunCzesc');
}
export function przywrocCzesc(_z: Zaleznosci, _w: { czescId: string }): Promise<Wynik<void>> {
  return niezaimplementowane('BR-DAN-008/S4 przywrocCzesc');
}
/** „Zrób taką samą” (F-20): części i przypomnienia skopiowane, liczniki 0, `kopia_z` = oryginał. */
export function zrobPonownie(_z: Zaleznosci, _w: { projektId: string }): Promise<Wynik<{ projektId: string }>> {
  return niezaimplementowane('BR-PRJ-007 zrobPonownie');
}
/** Druga część pary (bliźniak, BR-PRJ-014): `para_z`, cel z pierwszej części. */
export function dodajCzescPara(_z: Zaleznosci, _w: { czescId: string; nazwa: string }): Promise<Wynik<{ czescId: string; licznikId: string }>> {
  return niezaimplementowane('BR-PRJ-014 dodajCzescPara');
}
/** „Usuń wszystkie dane” (F-34): także dni limitu (dane.md) i pliki z magazynu. */
export function usunWszystkieDane(_z: ZaleznosciPlikow): Promise<Wynik<void>> {
  return niezaimplementowane('BR-DAN-009 usunWszystkieDane');
}
