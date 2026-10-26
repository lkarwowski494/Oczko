// Wpis liczby (P-097 (5a), jak pole liczbowe Treningu): separator dziesiętny według języka (CLDR przez Intl), cyfry ASCII;
// zapis niezgodny = null (pole odrzuca wpis), pusty = null.
import { parsujLiczbe } from '../../src/i18n/format';

describe('parsujLiczbe', () => {
  test.each([
    ['en', '1.5', 1.5], ['en', ' 2 ', 2], ['en', '0', 0], ['pl', '1,5', 1.5], ['de', '2,5', 2.5], ['fr', '0,5', 0.5],
    ['en', '1,5', null], ['pl', '1.5', null], ['en', 'abc', null], ['en', '', null], ['en', '1.2.3', null], ['en', '-1', null], ['en', '.', null],
  ] as const)('%s „%s” → %p', (j, t, w) => {
    expect(parsujLiczbe(t, j)).toBe(w);
  });
});
