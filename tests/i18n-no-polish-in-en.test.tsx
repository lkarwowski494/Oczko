import { EN } from '../src/core/i18n.en';

describe('Higiena i18n — brak polskich słów i znaków w EN (NFR-I18N-003)', () => {
  const POLISH_DIACRITICS = /[ąćęłńóśźż]/i;
  const POLISH_BLACKLIST_WORDS = [
    /\bAnuluj\b/i,
    /\bZapisz\b/i,
    /\bUsuń\b/i,
    /\bGotowe\b/i,
    /\bUstawienia\b/i,
    /\bWróć\b/i,
    /\bSzukaj\b/i,
    /\bLicznik\b/i,
    /\bWłóczka\b/i,
    /\bProjekt\b/i,
    /\bPróbka\b/i,
  ];

  it('wartości w słowniku angielskim EN nie zawierają polskich znaków diakrytycznych', () => {
    const leakingKeys: string[] = [];

    for (const [key, value] of Object.entries(EN)) {
      // Wyjątki: ewentualne emoji lub cytowania
      if (POLISH_DIACRITICS.test(value)) {
        leakingKeys.push(`[${key}] -> "${value}"`);
      }
    }

    expect(leakingKeys).toEqual([]);
  });

  it('wartości w słowniku angielskim EN nie zawierają zakazanych polskich słów UI', () => {
    const leakingWords: string[] = [];

    for (const [key, value] of Object.entries(EN)) {
      for (const pattern of POLISH_BLACKLIST_WORDS) {
        if (pattern.test(value)) {
          leakingWords.push(`[${key}] -> "${value}" (matches ${pattern})`);
        }
      }
    }

    expect(leakingWords).toEqual([]);
  });

  it('wszystkie klucze słownika EN posiadają niepuste tłumaczenie', () => {
    for (const [key, value] of Object.entries(EN)) {
      expect(value.trim().length).toBeGreaterThan(0);
    }
  });
});
