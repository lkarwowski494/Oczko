// Korzeń aplikacji: pierwszy ekran, start, cykl życia (NFR-PIE-001, BR-LIC-001, KP-07, KP-08, KP-13, BR-DAN-012/S2, R-020, R-091).
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07; do zatwierdzenia przez 04 (teksty, stany); porty i granice zatwierdzone przez 05 (fix 2026-10-25, Z07-22).
// `UslugiAplikacji` to atrapa warstwy przypadków użycia widziana z ekranu (src/przypadki-uzycia: sygnatury od 05, moduly.md:20) — [DO USTALENIA] 05.
import type React from 'react';
import type { EkranAktywny, Haptyka, Sklep } from '../domena/porty';
import { niezaimplementowane } from '../domena/zaslepka';
import type { CyklAplikacji, Oglos, System, Tlumacz } from './wspolne';
import type { StanEkranuLicznika, WynikPlus } from './Licznik';

export type StanStartu = {
  licznik: StanEkranuLicznika;          // F-49: powrót do miejsca; świeża instalacja: licznik bez nazwy z 0
  ekranWlaczony: boolean;               // F-10: ekran nie gaśnie przy liczeniu
};
export interface UslugiAplikacji {
  start(): Promise<StanStartu>;
  dodajRzad(): Promise<WynikPlus>;
  scalDziennik(): Promise<void>;        // ADR-0008: przy wejściu na pierwszy plan (R-020)
  przyTle(): Promise<void>;             // wal_checkpoint(TRUNCATE) w kolejce (R-091)
}
export type PropsAplikacji = {
  porty: { sklep: Sklep; ekranAktywny: EkranAktywny; haptyka: Haptyka }; // DziennikPlus czyta przypadek użycia scalDziennik
  uslugi: UslugiAplikacji;
  cykl: CyklAplikacji;
  system: System;
  oglos: Oglos;
  t: Tlumacz;
};
export function Aplikacja(_p: PropsAplikacji): React.ReactElement {
  return niezaimplementowane('ekrany/Aplikacja');
}
