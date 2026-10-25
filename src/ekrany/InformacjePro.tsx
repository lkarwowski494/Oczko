// Okno „Uczciwe zasady” (P-089 (3a), KP-16). Kiedy pokazać: domena `oknoUczciweZasady` (src/domena/limit.ts, wektory O-* roli 02).
// Karta planów Pro po imporcie: poza 1.0 (F-29, P-113 Q2a, P-117 Q1a, P-118 I1) — usunięta w partii 2 roli 08.
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07; do zatwierdzenia przez 04 (teksty, stany); porty i granice zatwierdzone przez 05 (fix 2026-10-25, Z07-22).
// Projekt okna według wzorca Treningu (docs/32) robi 04 (P-089 „Do wykonania”); makiety brak (Z07-05).
import type React from 'react';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Tlumacz } from './wspolne';

export type PropsOknaUczciweZasady = {
  t: Tlumacz;
  naZamknij(): void;      // główny przycisk zamyka okno
  naPlany(): void;        // link prowadzi do planów Pro (ekran ofert)
};
export function OknoUczciweZasady(_p: PropsOknaUczciweZasady): React.ReactElement {
  return niezaimplementowane('ekrany/OknoUczciweZasady');
}
