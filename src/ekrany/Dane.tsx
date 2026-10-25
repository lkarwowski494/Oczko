// Import archiwum i rozstrzygnięcie konfliktu (F-31–F-34, F-27; R-050, R-068). Ekrany nienarysowane (Z07-05).
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07 do zatwierdzenia przez 04 (teksty, stany) i 05 (porty, granice).
import type React from 'react';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Tlumacz } from './wspolne';

export type PropsImportu = {
  stan: { rodzaj: 'wybor'; plik: string } | { rodzaj: 'zastapiono'; kopia: { nazwa: string; miejsce: string } }; // kopia przed „Zastąp” (P-047, dane.md:69)
  t: Tlumacz;
  naZastap(): void;
  naScal(): void;
  naAnuluj(): void;
};
export function Import(_p: PropsImportu): React.ReactElement {
  return niezaimplementowane('ekrany/Import');
}
export type KandydatKonfliktu = { id: string; wartosc: number; urzadzenie: string; godzina: string };
export type PropsKonfliktu = {
  stan: { licznik: string; kandydaci: KandydatKonfliktu[] };   // M-04, M-05: wybór użytkownika, nigdy po cichu
  t: Tlumacz;
  naWybierz(id: string): void;
};
export function Konflikt(_p: PropsKonfliktu): React.ReactElement {
  return niezaimplementowane('ekrany/Konflikt');
}
