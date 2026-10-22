import { sprawdzIntl } from '../../src/i18n/sprawdzIntl';

describe('sprawdzIntl: samosprawdzenie przy starcie (lista pusta = w porządku)', () => {
  const oryginal = (globalThis as { Intl?: unknown }).Intl;
  afterEach(() => {
    (globalThis as { Intl?: unknown }).Intl = oryginal;
  });

  it('w Node z ICU: pusta lista dla pl, ru, ja', () => {
    expect(sprawdzIntl(['pl', 'ru', 'ja'])).toEqual([]);
  });
  it('brak Intl.PluralRules: jeden komunikat o polyfillu', () => {
    (globalThis as { Intl?: unknown }).Intl = {};
    expect(sprawdzIntl(['pl'])).toEqual(['brak Intl.PluralRules: polyfill nie został załadowany']);
  });
  it('brak Intl w ogóle: ten sam komunikat, bez wyjątku', () => {
    (globalThis as { Intl?: unknown }).Intl = undefined;
    expect(sprawdzIntl(['pl'])).toEqual(['brak Intl.PluralRules: polyfill nie został załadowany']);
  });
  it('język bez reguł: komunikat z kodem języka', () => {
    expect(sprawdzIntl(['pl', 'qq-zz-invalid-x'])).toEqual(expect.any(Array));
    const fake = { PluralRules: { supportedLocalesOf: (l: string[]) => l.filter((x) => x !== 'lv') } };
    (globalThis as { Intl?: unknown }).Intl = fake;
    expect(sprawdzIntl(['pl', 'lv'])).toEqual(['brak reguł liczby mnogiej dla lv']);
  });
});
