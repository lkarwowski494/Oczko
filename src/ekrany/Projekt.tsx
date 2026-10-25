// Przegląd projektu: liczniki, notatka, miejsce we wzorze, postęp, części i para (F-18, F-52, F-60; BR-PRJ-005, BR-PRJ-014/S3, BR-DNI-004/S3). Ekran nienarysowany (Z07-05).
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07 do zatwierdzenia przez 04 (teksty, stany) i 05 (porty, granice).
import type React from 'react';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Tlumacz } from './wspolne';

export type CzescProjektu = { id: string; nazwa: string; rzedy: number; cel: number | null; paraZ: string | null }; // paraZ: id pierwszej części pary
export type PropsProjektu = {
  stan: {
    nazwa: string;
    czesci: CzescProjektu[];
    notatka: string | null;
    miejsceWzoru: string | null;     // „Page 3, row 48” (sformatowane)
    ostatniaZmiana: string;          // sformatowana data
    postep: { rodzaj: 'procent'; wartosc: number } | { rodzaj: 'brak-celow' };  // RD-14 (RD-14-W6)
  };
  t: Tlumacz;
  naOtworzCzesc(id: string): void;
};
export function Projekt(_p: PropsProjektu): React.ReactElement {
  return niezaimplementowane('ekrany/Projekt');
}
