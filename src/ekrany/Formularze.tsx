// Formularze w arkuszach (prototyp.html:130–138; design-spec.md:45, :67): wpisanie wartości (F-45), powtórzenie (F-05), przypomnienie (F-06), korekta sesji (F-51).
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07 do zatwierdzenia przez 04 (teksty, stany) i 05 (porty, granice).
// Walidację liczy domena (RD-12-W5, RD-13, BR-LIC-017/S7); ekran nie woła naZapisz z błędną wartością i pokazuje komunikat (rola alert).
import type React from 'react';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Tlumacz, WynikEkranu } from './wspolne';

export type PropsFormularzaWartosci = {
  stan: { obecna: number };
  t: Tlumacz;
  naZapisz(wartosc: number): Promise<WynikEkranu<void>>;  // wpiszWartosc
  naAnuluj(): void;
};
export function FormularzWartosci(_p: PropsFormularzaWartosci): React.ReactElement {
  return niezaimplementowane('ekrany/FormularzWartosci');
}

export type PropsFormularzaPowtorzenia = {
  stan: { nazwa: string; dlugosc: number | null };
  t: Tlumacz;
  naZapisz(p: { nazwa: string; dlugosc: number }): Promise<WynikEkranu<void>>;
  naAnuluj(): void;
};
export function FormularzPowtorzenia(_p: PropsFormularzaPowtorzenia): React.ReactElement {
  return niezaimplementowane('ekrany/FormularzPowtorzenia');
}

export type PlanPrzypomnieniaEkranu = { tekst: string; od: number; co: number; razy: number };
export type PropsFormularzaPrzypomnienia = {
  stan: { tekst: string; od: number | null; co: number | null; razy: number | null };
  t: Tlumacz;
  /** Podgląd rzędów z domeny (RD-13, `przypomnienia.ts`); ekran tylko pokazuje i dołącza do etykiety „Save reminder”. */
  podglad(plan: PlanPrzypomnieniaEkranu): WynikEkranu<number[]>;
  naZapisz(plan: PlanPrzypomnieniaEkranu): Promise<WynikEkranu<void>>;
  naAnuluj(): void;
};
export function FormularzPrzypomnienia(_p: PropsFormularzaPrzypomnienia): React.ReactElement {
  return niezaimplementowane('ekrany/FormularzPrzypomnienia');
}

export type PropsKorektySesji = {
  stan: { start: string; koniec: string };   // godziny sformatowane HH:MM w strefie urządzenia
  t: Tlumacz;
  naZapisz(z: { start: string; koniec: string }): Promise<WynikEkranu<void>>;
  naAnuluj(): void;
};
export function KorektaSesji(_p: PropsKorektySesji): React.ReactElement {
  return niezaimplementowane('ekrany/KorektaSesji');
}
