// Dwa momenty informowania o Pro (P-089 (3)): okno „Uczciwe zasady” (3a) i karta po imporcie (3b). Kiedy pokazać: domena (informacje-pro.ts).
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07 do zatwierdzenia przez 04 (teksty, stany) i 05 (porty, granice).
// Projekt okna według wzorca Treningu (docs/32) robi 04 (P-089 „Do wykonania”); makiety brak (Z07-05). (3b) warunkowo: import w MVP rozstrzyga 03.
import type React from 'react';
import type { Produkt } from '../domena/porty';
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
export type PropsKartyPoImporcie = {
  stan: { produkty: Produkt[] };   // ceny tylko ze sklepu (KP-09)
  t: Tlumacz;
  naPlany(): void;
  naZamknij(): void;
};
export function KartaPoImporcie(_p: PropsKartyPoImporcie): React.ReactElement {
  return niezaimplementowane('ekrany/KartaPoImporcie');
}
