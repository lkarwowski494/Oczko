// Kalendarz dni z robótką i podsumowanie miesiąca (F-59; BR-DNI-001, BR-DNI-003). Ekrany nienarysowane (design-spec.md:95, Z07-05).
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07; do zatwierdzenia przez 04 (teksty, stany); porty i granice zatwierdzone przez 05 (fix 2026-10-25, Z07-22).
import type React from 'react';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Tlumacz } from './wspolne';

export type PropsKalendarza = { stan: { miesiac: string; dni: { data: string; etykieta: string; rzedy: number }[] }; t: Tlumacz; naDzien(data: string): void };
export function Kalendarz(_p: PropsKalendarza): React.ReactElement {
  return niezaimplementowane('ekrany/Kalendarz');
}
export type PropsPodsumowania = { stan: { okres: string; rzedy: number; ukonczone: string[]; czas: string | null }; t: Tlumacz }; // czas null = brak sesji stopera
export function Podsumowanie(_p: PropsPodsumowania): React.ReactElement {
  return niezaimplementowane('ekrany/Podsumowanie');
}
