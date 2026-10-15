/**
 * Oczko Core — Parser i tłumacz skrótów dziewiarskich / szydełkowych (Moduł nauki i importu)
 * Obsługuje podstawowy słownik uniwersalny (EN / PL) oraz dekonstrukcję rzędów wzoru.
 */

export interface StitchTranslation {
  code: string;
  englishName: string;
  polishName: string;
  description: string;
  category: 'knit' | 'purl' | 'increase' | 'decrease' | 'special';
}

const STITCH_DICTIONARY: Record<string, StitchTranslation> = {
  k: {
    code: 'k',
    englishName: 'Knit',
    polishName: 'Oczko prawe',
    description: 'Przerób oczko na prawo (prawe oczko w rzędzie).',
    category: 'knit',
  },
  p: {
    code: 'p',
    englishName: 'Purl',
    polishName: 'Oczko lewe',
    description: 'Przerób oczko na lewo (lewe oczko w rzędzie).',
    category: 'purl',
  },
  yo: {
    code: 'yo',
    englishName: 'Yarn over',
    polishName: 'Narzut',
    description: 'Nawinęcie włóczki na drut tworzące ażurowe oczko.',
    category: 'increase',
  },
  k2tog: {
    code: 'k2tog',
    englishName: 'Knit 2 together',
    polishName: 'Przerób 2 oczka razem na prawo',
    description: 'Ujęcie oczka: przerób dwa oczka na raz na prawo (pochylenie w prawo).',
    category: 'decrease',
  },
  ssk: {
    code: 'ssk',
    englishName: 'Slip, slip, knit',
    polishName: 'Ściągnij, ściągnij, przerób',
    description: 'Ujęcie oczka: przełóż dwa oczka pojedynczo na prawy drut, a następnie przerób razem za tylne nitki (pochylenie w lewo).',
    category: 'decrease',
  },
  kfb: {
    code: 'kfb',
    englishName: 'Knit front and back',
    polishName: 'Przerób przednią i tylną nitkę',
    description: 'Zwiększenie oczka: przerób to samo oczko najpierw za przednią, a potem za tylną nitkę.',
    category: 'increase',
  },
};

/**
 * Tłumaczy pojedynczy token skrótu na opis i polską nazwę.
 */
export function translateStitchToken(token: string): StitchTranslation | null {
  const clean = token.toLowerCase().trim();
  return STITCH_DICTIONARY[clean] ?? null;
}

export interface ParsedRowInstruction {
  rawText: string;
  tokens: Array<{ raw: string; translation: StitchTranslation | null }>;
  isRecognized: boolean;
}

/**
 * Parsuje linijkę tekstu wzoru i rozbija ją na znane skróty techniczne.
 */
export function parseRowInstruction(rowText: string): ParsedRowInstruction {
  // Przykładowe uproszczone dzielenie po spacjach i przecinkach
  const rawTokens = rowText.replace(/[\.,]/g, '').split(/\s+/).filter(Boolean);
  
  let recognizedCount = 0;
  const tokens = rawTokens.map((raw) => {
    // Usuwamy ewentualne liczby powtórzeń z prefiksu lub sufiksu (np. "k5" -> "k" lub obsługa liczby)
    const baseMatch = raw.match(/^([a-zA-Z0-9]+)(\d*)$/);
    const lookupKey = baseMatch ? baseMatch[1].toLowerCase() : raw.toLowerCase();
    
    const translation = STITCH_DICTIONARY[lookupKey] ?? null;
    if (translation) recognizedCount++;

    return {
      raw,
      translation,
    };
  });

  return {
    rawText,
    tokens,
    isRecognized: tokens.length > 0 && recognizedCount > 0,
  };
}
