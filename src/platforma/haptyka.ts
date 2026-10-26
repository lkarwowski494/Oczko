// Adapter portu Haptyka (F-48, tokeny docs/design/tokeny.json „haptyka”): rząd = UIImpactFeedbackGenerator .light („plus”), przypomnienie =
// dwa uderzenia .medium co 90 ms („rzadZInstrukcja”). Pozostałe wzorce tokenów (piąta kreska, −1, blokada, błąd zapisu) nie mają metod portu
// [kontrakt partii 4: zagraj(WzorzecHaptyki), moduly.md, P-135 Q4a]. Haptyka nie zmienia wyniku operacji: błąd modułu pomijany.
import type { Haptyka } from '../domena/porty';

export interface ModulHaptyki { impactAsync(styl: 'light' | 'medium'): Promise<void> }
export const ODSTEP_PRZYPOMNIENIA_MS = 90; // tokeny „rzadZInstrukcja”: dwa uderzenia co 90 ms

export function haptyka(m: ModulHaptyki = domyslny(), czekaj: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms))): Haptyka {
  const uderz = (s: 'light' | 'medium') => m.impactAsync(s).catch(() => undefined);
  return {
    rzad() { void uderz('light'); },
    przypomnienie() { void uderz('medium').then(() => czekaj(ODSTEP_PRZYPOMNIENIA_MS)).then(() => uderz('medium')); },
  };
}
function domyslny(): ModulHaptyki {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- leniwie: moduł natywny tylko na urządzeniu
  const h: { impactAsync(s: unknown): Promise<void>; ImpactFeedbackStyle: { Light: unknown; Medium: unknown } } = require('expo-haptics');
  return { impactAsync: (s) => h.impactAsync(s === 'light' ? h.ImpactFeedbackStyle.Light : h.ImpactFeedbackStyle.Medium) };
}
