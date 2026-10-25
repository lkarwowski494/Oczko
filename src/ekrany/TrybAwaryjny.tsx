// Ekran trybu awaryjnego (ADR-0019; R-079): „Zapisz kopię danych”, „Spróbuj normalnie”, „Zgłoś problem”. Ekranu nie narysowano (Z07-05).
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07; do zatwierdzenia przez 04 (teksty, stany); porty i granice zatwierdzone przez 05 (fix 2026-10-25, Z07-22).
// W tym trybie ekran nie dostaje żadnego portu zapisu do bazy (ADR-0019: „nic nie zmienia danych”).
import type React from 'react';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Tlumacz } from './wspolne';

export type PowodTrybuAwaryjnego = 'petla-startow' | 'wersja_nowsza' | 'uszkodzony';
export type PropsTrybuAwaryjnego = {
  stan: { powod: PowodTrybuAwaryjnego };
  t: Tlumacz;
  naZapiszKopie(): void;
  naSprobujNormalnie(): void;
  naZglosProblem(): void;
};
export function TrybAwaryjny(_p: PropsTrybuAwaryjnego): React.ReactElement {
  return niezaimplementowane('ekrany/TrybAwaryjny');
}
