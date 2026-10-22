// Samosprawdzenie przy starcie; pusta lista = w porządku. W buildzie deweloperskim błąd na ekranie.
type PluralRulesLike = { supportedLocalesOf(l: string[]): string[] };

export function sprawdzIntl(jezyki: string[]): string[] {
  const PR = (globalThis as { Intl?: { PluralRules?: PluralRulesLike } }).Intl?.PluralRules;
  if (typeof PR !== 'function') return ['brak Intl.PluralRules: polyfill nie został załadowany'];
  const reguly: PluralRulesLike = PR;
  const obslugiwany = (j: string) => {
    try {
      return reguly.supportedLocalesOf([j]).length > 0;
    } catch {
      return false; // niepoprawny tag (RangeError) = brak reguł
    }
  };
  return jezyki.filter((j) => !obslugiwany(j)).map((j) => `brak reguł liczby mnogiej dla ${j}`);
}
