// Lista projektów (F-50, F-54, F-60; design-spec.md:55, ekrany.html `projekty`).
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07; do zatwierdzenia przez 04 (teksty, stany); porty i granice zatwierdzone przez 05 (fix 2026-10-25, Z07-22).
import type React from 'react';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Tlumacz } from './wspolne';

export type WierszProjektu = { id: string; nazwa: string; opis: string; kolorWloczki: string | null }; // opis sformatowany: „Left sleeve · row 47 of 96 · today”
/** Licznik darmowych dni (P-065 (2a), design-spec.md:18); `null` przy Pro (design-spec.md:19). */
export type DniNaLiscie = { zostalo: number; limit: number; miesiac: string } | null;
export type StanListyProjektow = { wToku: WierszProjektu[]; ukonczone: WierszProjektu[]; zapytanie: string; dni: DniNaLiscie };
export type PropsListyProjektow = {
  stan: StanListyProjektow; // wToku i ukonczone już przefiltrowane przez zapytanie (wyszukiwanie: przypadek użycia)
  t: Tlumacz;
  naSzukaj(zapytanie: string): void;
  naOtworz(id: string): void;
  naNowy(): void;
};
export function ListaProjektow(_p: PropsListyProjektow): React.ReactElement {
  return niezaimplementowane('ekrany/ListaProjektow');
}
