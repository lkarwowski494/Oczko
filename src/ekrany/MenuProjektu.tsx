// Menu ••• projektu (prototyp.html:129, design-spec.md:34). Arkusz systemowy.
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07; do zatwierdzenia przez 04 (teksty, stany); porty i granice zatwierdzone przez 05 (fix 2026-10-25, Z07-22).
import type React from 'react';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Tlumacz } from './wspolne';

export type PropsMenuProjektu = {
  stan: { projekt: string; zablokowany: boolean; wartosc: number };
  t: Tlumacz;
  naNazwa(): void; naCel(): void; naPrzypomnienie(): void; naPowtorzenie(): void; naWpisz(): void;
  naZablokuj(): void; naOdblokuj(): void;
  /** Zerowanie (F-45): wołane dopiero po potwierdzeniu w tym arkuszu (BR-LIC-017/S6, R-007). */
  naZeruj(): void;
  naUkoncz(): void;
  naZamknij(): void;
};
export function MenuProjektu(_p: PropsMenuProjektu): React.ReactElement {
  return niezaimplementowane('ekrany/MenuProjektu');
}
