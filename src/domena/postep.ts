// Postęp projektu (RD-14, F-60), cel dzienny do terminu (RD-15, F-61), dzień lokalny (RD-16, F-59).
import type { Wynik } from './bledy';
import { niezaimplementowane } from './zaslepka';

export type CzescPostepu = { rzedy: number; cel: number | null };
export type CelDnia = { rodzaj: 'cel'; rzedy: number } | { rodzaj: 'osiagniety' } | { rodzaj: 'po_terminie'; zostalo: number };

export function postepProcent(_czesci: CzescPostepu[]): Wynik<number> {
  return niezaimplementowane('RD-14 postepProcent');
}
/** RD-15: C = suma celów, przedDzis = rzędy przed dziś (min z celem), daty lokalne RRRR-MM-DD. */
export function celDzienny(_w: { suma: number; przedDzis: number; termin: string; dzis: string }): Wynik<CelDnia> {
  return niezaimplementowane('RD-15 celDzienny');
}
/** RD-16: data lokalna RRRR-MM-DD (kalendarz gregoriański, cyfry ASCII) w strefie IANA w chwili ms. */
export function dzienLokalny(_ms: number, _strefa: string): Wynik<string> {
  return niezaimplementowane('RD-16 dzienLokalny');
}
