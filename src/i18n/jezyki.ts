// Zestaw języków (D-026, P-009), dopasowanie języka systemu i łańcuch zastępczy (ADR-0017).
export const ZRODLO = 'en';

export const JEZYKI = [
  'bg', 'cs', 'da', 'de', 'el', 'en', 'es-419', 'es', 'et', 'fi', 'fr', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'lt', 'lv',
  'ms', 'nb', 'nl', 'pl', 'pt-BR', 'pt-PT', 'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'tr', 'uk', 'vi', 'zh-Hant',
] as const;
export type Jezyk = (typeof JEZYKI)[number];
export type PreferencjaJezyka = 'auto' | Jezyk;

const jestJezykiem = (x: string): x is Jezyk => (JEZYKI as readonly string[]).includes(x);

const AMERYKA_LACINSKA = new Set([
  '419', 'MX', 'AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'GT', 'HN', 'NI', 'PA', 'PE', 'PR', 'PY', 'SV', 'US', 'UY', 'VE',
]);
const PORTUGALIA = new Set(['PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL', 'MO']);
const CHINY_TRADYCYJNE = new Set(['TW', 'HK', 'MO']);
const STARE_KODY: Record<string, string> = { in: 'id', no: 'nb', nn: 'nb' };

function dopasujTag(tag: string): Jezyk | null {
  const cz = tag.split('-');
  const jezyk = (STARE_KODY[cz[0].toLowerCase()] ?? cz[0].toLowerCase());
  if (!/^[a-z]{2,3}$/.test(jezyk) || cz.slice(1).some((x) => !/^[A-Za-z0-9]{2,8}$/.test(x))) return null;
  const skrypt = cz.slice(1).find((x) => /^[A-Za-z]{4}$/.test(x));
  const region = cz.slice(1).find((x) => /^([A-Za-z]{2}|\d{3})$/.test(x))?.toUpperCase();
  if (jezyk === 'zh') return skrypt?.toLowerCase() === 'hant' || (!skrypt && region && CHINY_TRADYCYJNE.has(region)) ? 'zh-Hant' : null;
  if (jezyk === 'es') return region && AMERYKA_LACINSKA.has(region) ? 'es-419' : 'es';
  if (jezyk === 'pt') return region && PORTUGALIA.has(region) ? 'pt-PT' : 'pt-BR';
  return jestJezykiem(jezyk) ? jezyk : null;
}

/** Pierwszy tag z listy użytkownika, który ma słownik; inaczej źródło. */
export function dopasujJezyk(tagi: string[]): Jezyk {
  for (const tag of tagi) {
    const j = dopasujTag(tag);
    if (j) return j;
  }
  return ZRODLO;
}

/** Wybór z przełącznika w aplikacji (P-075, 3b) albo z systemu; nieznany zapis = auto. */
export function wybierzJezyk(preferencja: string | null, tagiSystemowe: string[]): Jezyk {
  return preferencja && preferencja !== 'auto' && jestJezykiem(preferencja) ? preferencja : dopasujJezyk(tagiSystemowe);
}

const ZASTEPCZY: Partial<Record<Jezyk, Jezyk>> = { 'es-419': 'es', 'pt-BR': 'pt-PT', 'pt-PT': 'pt-BR' };

/** Wariant → język pokrewny → źródło; nigdy klucz. */
export function lancuchZastepczy(j: Jezyk): Jezyk[] {
  const bliski = ZASTEPCZY[j];
  return [...new Set<Jezyk>([j, ...(bliski ? [bliski] : []), ZRODLO])];
}
