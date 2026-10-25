// Ustawienia (BR-ZAK-004, BR-ZAK-006/S5, S7, BR-DAN-012/S3, KP-13, KP-14, F-48). Ekran nienarysowany (design-spec.md:95, zgłoszenie Z07-05).
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07 do zatwierdzenia przez 04 (teksty, stany) i 05 (porty, granice).
import type React from 'react';
import { niezaimplementowane } from '../domena/zaslepka';
import type { System, Tlumacz } from './wspolne';
import type { AktywnePro } from './Oferty';
import type { DniNaLiscie } from './ListaProjektow';

export type PropsUstawien = {
  stan: { pro: AktywnePro; dni: DniNaLiscie; wibracje: boolean };
  t: Tlumacz;
  system: System;
  adresy: { polityka: string; recenzja: string };  // recenzja: strona App Store z action=write-review (BR-DAN-012/S3)
  naOferty(): void;                                 // drugie miejsce wejścia do ofert (KP-13)
  naWibracje(wlaczone: boolean): void;
  naZglosProblem(): void;
  naStanDanych(): void;
};
export function Ustawienia(_p: PropsUstawien): React.ReactElement {
  return niezaimplementowane('ekrany/Ustawienia');
}
