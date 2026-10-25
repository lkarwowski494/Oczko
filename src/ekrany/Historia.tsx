// Historia licznika (F-02, BR-LIC-003, BR-LIC-017/S6; prototyp.html:128). Arkusz systemowy.
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07 do zatwierdzenia przez 04 (teksty, stany) i 05 (porty, granice).
import type React from 'react';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Tlumacz } from './wspolne';

export type WpisHistorii = { id: string; godzina: string; z: number; na: number; opis: string | null }; // godzina sformatowana (format.ts)
export type PropsHistorii = {
  stan: { wpisy: WpisHistorii[] };          // od najnowszego; „Undo” tylko przy ostatniej zmianie (P-091 (3a))
  t: Tlumacz;
  naCofnij(id: string): void;
  naZamknij(): void;
};
export function Historia(_p: PropsHistorii): React.ReactElement {
  return niezaimplementowane('ekrany/Historia');
}
