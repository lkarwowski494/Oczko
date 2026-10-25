// Warstwa „Narzędzia” (P-046): włóczka w zapasie (F-37, BR-ZAP-001), kalkulator (F-38, BR-KAL-003, R-131). Ekrany nienarysowane (Z07-05).
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07; do zatwierdzenia przez 04 (teksty, stany); porty i granice zatwierdzone przez 05 (fix 2026-10-25, Z07-22).
import type React from 'react';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Tlumacz } from './wspolne';

export type PropsWloczki = {
  stan: { nazwa: string; pielegnacja: { tekst: string | null; zdjecie: string | null } }; // bez symboli pielęgnacji (OG-13, OP-11)
  t: Tlumacz;
  naZapisz(p: { tekst: string | null; zdjecie: string | null }): void;
};
export function Wloczka(_p: PropsWloczki): React.ReactElement {
  return niezaimplementowane('ekrany/Wloczka');
}
export type PropsKalkulatora = {
  stan: { uklad: 'metryczny' | 'imperialny' };   // z ustawień systemu (P-075 (4a)); jednostka widoczna przy polu (R-131)
  t: Tlumacz;
  naOblicz(w: { oczka: number; dlugosc: number; jednostka: 'cm' | 'in'; cel: number }): void;
};
export function Kalkulator(_p: PropsKalkulatora): React.ReactElement {
  return niezaimplementowane('ekrany/Kalkulator');
}
