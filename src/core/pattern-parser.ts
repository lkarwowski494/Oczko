/**
 * Oczko Core — Parser i tłumacz skrótów dziewiarskich / szydełkowych (Moduł nauki i importu)
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
    description: 'Przerób oczko na prawo.',
    category: 'knit',
  },
  p: {
    code: 'p',
    englishName: 'Purl',
    polishName: 'Oczko lewe',
    description: 'Przerób oczko na lewo.',
    category: 'purl',
  },
  yo: {
    code: 'yo',
    englishName: 'Yarn over',
    polishName: 'Narzut',
    description: 'Nawinięcie włóczki na drut.',
    category: 'increase',
  },
  k2tog: {
    code: 'k2tog',
    englishName: 'Knit 2 together',
    polishName: 'Przerób 2 oczka razem na prawo',
    description: 'Ujęcie oczka.',
    category: 'decrease',
  },
  ssk: {
    code: 'ssk',
    englishName: 'Slip, slip, knit',
    polishName: 'Ściągnij, ściągnij, przerób',
    description: 'Ujęcie oczka.',
    category: 'decrease',
  },
  kfb: {
    code: 'kfb',
    englishName: 'Knit front and back',
    polishName: 'Przerób przednią i tylną nitkę',
    description: 'Zwiększenie oczka.',
    category: 'increase',
  },
};

export function translateStitchToken(token: string): StitchTranslation | null {
  const clean = token.toLowerCase().trim();
  return STITCH_DICTIONARY[clean] ?? null;
}

export interface ParsedRowInstruction {
  rowText: string;
  tokens: Array<{ raw: string; translation: StitchTranslation | null }>;
  isRecognized: boolean;
}

export function parseRowInstruction(rowText: string): ParsedRowInstruction {
  const rawTokens = rowText.replace(/[\.,]/g, '').split(/\s+/).filter(Boolean);
  
  let recognizedCount = 0;
  const tokens = rawTokens.map((raw) => {
    const baseMatch = raw.match(/^([a-zA-Z0-9]+)(\d*)$/);
    const lookupKey = baseMatch ? baseMatch[1].toLowerCase() : raw.toLowerCase();
    
    const translation = STITCH_DICTIONARY[lookupKey] ?? null;
    if (translation) recognizedCount++;

    return { raw, translation };
  });

  return {
    rowText,
    tokens,
    isRecognized: tokens.length > 0 && recognizedCount > 0,
  };
}
