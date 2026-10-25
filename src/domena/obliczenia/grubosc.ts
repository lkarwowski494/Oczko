// Klasyfikacja grubości włóczki z próbki (RD-10 według P-084; wyrocznia: docs/tresci/wektory.json klasyfikacja_4in, klasyfikacja_10cm).
import { niezaimplementowane } from '../zaslepka';

export type Klasyfikacja =
  | { wynik: 'kategorie'; kategorie: number[]; p4Zaokraglone: number | null; polowka: boolean }
  | { wynik: 'miedzy'; kategorie: [number, number]; polowka: boolean }
  | { wynik: 'powyzej_tabeli'; p4Zaokraglone: number | null; polowka: boolean }
  | { wynik: 'blad_danych' };

/** Próbka: oczka na 4 in albo na 10 cm (przeliczenie dokładne × 10,16 / 10, P-081 P3a). */
export function klasyfikujGrubosc(_proba: { oczka: number; na: '4in' | '10cm' }): Klasyfikacja {
  return niezaimplementowane('BR-KAL-008 klasyfikujGrubosc');
}
