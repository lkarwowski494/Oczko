// Przeliczenia jednostek (RD-03; wyrocznia: docs/tresci/wektory.json jednostki, tolerancja 1e-9).
import { niezaimplementowane } from '../zaslepka';

export type Przelicznik = 'in→cm' | 'yd→m' | 'oz→g' | 'cm→in' | 'm→yd' | 'g→oz';
export function przelicz(_wartosc: number, _przelicznik: Przelicznik): number {
  return niezaimplementowane('BR-KAL-003 przelicz');
}
