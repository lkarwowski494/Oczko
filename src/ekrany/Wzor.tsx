// Linki przy wzorze: film z instrukcją (F-55, BR-WZR-007/S4). Ekran nienarysowany (Z07-05).
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07 do zatwierdzenia przez 04 (teksty, stany) i 05 (porty, granice).
import type React from 'react';
import { niezaimplementowane } from '../domena/zaslepka';
import type { System, Tlumacz } from './wspolne';

export type PropsLinkuFilmu = {
  stan: { tytul: string; url: string; siec: 'jest' | 'brak' };  // Oczko zapisuje tylko link, nie film
  t: Tlumacz;
  system: System;
};
export function LinkFilmu(_p: PropsLinkuFilmu): React.ReactElement {
  return niezaimplementowane('ekrany/LinkFilmu');
}
