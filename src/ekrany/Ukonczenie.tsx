// Chwila ukończenia: karta projektu i pytanie o włóczkę (F-19, F-37, F-53; U-9; design-spec.md:57, :66; ekrany.html `ukonczenie`; BR-DAN-012/S1).
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07 do zatwierdzenia przez 04 (teksty, stany) i 05 (porty, granice).
import type React from 'react';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Oglos, System, Tlumacz } from './wspolne';

export type StanUkonczenia = {
  nazwa: string;
  okres: string;               // „Oct 1 – Nov 21” (sformatowane)
  dni: number;                 // dni z robótką
  rzedy: number;
  czas: string | null;         // „18 h 10 min”; null = bez stopera (BR-PRJ-015/S3)
  czesci: number;
  wloczka: { id: string; nazwa: string }[];  // pusta = pytanie pominięte (design-spec.md:57)
  zdjecie: string | null;      // URI
};
export type PropsUkonczenia = {
  stan: StanUkonczenia;
  t: Tlumacz;
  oglos: Oglos;                // „Harbor Sweater moved to Finished.” (design-spec.md:66)
  system: System;              // prosbaOOcene po zamknięciu karty (BR-DAN-012/S1)
  naWloczka(id: string): void;
  naUdostepnij(): void;
  naGotowe(): void;
};
export function Ukonczenie(_p: PropsUkonczenia): React.ReactElement {
  return niezaimplementowane('ekrany/Ukonczenie');
}
