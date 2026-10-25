// „Zgłoś problem” z podglądem diagnostyki (F-57, BR-DAN-010, ADR-0018, R-162, R-163). Ekran nienarysowany (Z07-05).
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07; do zatwierdzenia przez 04 (teksty, stany); porty i granice zatwierdzone przez 05 (fix 2026-10-25, Z07-22).
// Diagnostykę (bez treści projektów) składa przypadek użycia; ekran pokazuje całość przed wysyłką i oddaje ją tylko arkuszowi udostępniania.
import type React from 'react';
import { niezaimplementowane } from '../domena/zaslepka';
import type { System, Tlumacz } from './wspolne';

export type PoleDiagnostyki = { pole: 'wersja' | 'system' | 'model' | 'synchronizacja' | 'zegarek' | 'bledy'; wartosc: string };
export type PropsZglosProblem = {
  stan: { diagnostyka: PoleDiagnostyki[] };
  t: Tlumacz;
  system: System;          // udostepnij: jedyna droga wyjścia (bez sieci w aplikacji)
  naAnuluj(): void;
};
export function ZglosProblem(_p: PropsZglosProblem): React.ReactElement {
  return niezaimplementowane('ekrany/ZglosProblem');
}
