// Wektory liczby mnogiej z wzorców roli 09 (CLDR) na Intl.PluralRules z polyfillem aplikacji (polyfille.ts).
import '../../src/i18n/polyfille';
import { JEZYKI } from '../../src/i18n/jezyki';

const WEKTORY: Record<string, Array<[number, string]>> = {
  pl: [[1, 'one'], [2, 'few'], [5, 'many'], [12, 'many'], [22, 'few'], [25, 'many'], [0, 'many'], [1.5, 'other']],
  ru: [[21, 'one']],
  cs: [[3, 'few'], [22, 'other']],
  lv: [[10, 'zero']],
  sl: [[2, 'two'], [3, 'few']],
  ro: [[2, 'few'], [20, 'other']],
  fr: [[0, 'one']],
  en: [[0, 'other']],
  // pt-BR: reguły CLDR „pt”; Portugalia ma własne (0 → other): słownik „pt-PT”, nie „pt”
  'pt-BR': [[0, 'one'], [1, 'one'], [2, 'other']],
  'pt-PT': [[0, 'other'], [1, 'one'], [2, 'other']],
};

describe('liczba mnoga według CLDR', () => {
  for (const [jezyk, wektory] of Object.entries(WEKTORY)) {
    for (const [n, kategoria] of wektory) {
      it(`${jezyk}: ${n} → ${kategoria}`, () => {
        expect(new Intl.PluralRules(jezyk).select(n)).toBe(kategoria);
      });
    }
  }

  it('polyfill obsługuje reguły każdego z 35 języków (nie tylko angielskie)', () => {
    const brak = JEZYKI.filter((j) => Intl.PluralRules.supportedLocalesOf([j]).length === 0);
    expect(brak).toEqual([]);
  });

  it('polyfill to implementacja formatjs, nie natywna (ścieżka jak na Hermes)', () => {
    expect(String(Intl.PluralRules).includes('[native code]')).toBe(false);
  });
});
