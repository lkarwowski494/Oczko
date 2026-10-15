/**
 * Oczko — Silnik Konwersji Rozmiarów Drutów i Jednostek Rzemieślniczych
 * (Needle Size Gauge & Craft Unit Converter)
 *
 * Kompletna standaryzacja wg Craft Yarn Council (CYC) oraz ISO:
 * - Metryczny (mm, Europa / Polska)
 * - US (Stany Zjednoczone)
 * - UK (stary system brytyjski / odwrócony)
 * - JP (Japonia)
 * - Oznaczenia literowe szydełek (Crochet Hooks)
 * - Przelicznik jednostek rzemieślniczych: m <-> yd, g <-> oz, 10cm <-> 4 cale
 */

export type NeedleSystem = 'metric' | 'us' | 'uk' | 'jp';

export interface NeedleSizeEntry {
  metricMm: number;
  labelMetric: string;
  usKnitting: string;
  ukKnitting?: string;
  jpKnitting?: string;
  crochetUs?: string;
  craftYarnCouncilCategory?: string; // np. 'Lace', 'Fingering', 'DK', 'Worsted'
}

export interface NeedleConversionResult {
  sourceValue: string | number;
  sourceSystem: NeedleSystem;
  matchedEntry: NeedleSizeEntry;
  metricMm: number;
  us: string;
  uk: string;
  jp: string;
  crochet: string;
}

export const NEEDLE_SIZE_TABLE: NeedleSizeEntry[] = [
  { metricMm: 2.0, labelMetric: '2.0 mm', usKnitting: 'US 0', ukKnitting: 'UK 14', jpKnitting: '0 (2.1 mm)', crochetUs: 'Steel 4 / 2.0mm', craftYarnCouncilCategory: 'Lace' },
  { metricMm: 2.25, labelMetric: '2.25 mm', usKnitting: 'US 1', ukKnitting: 'UK 13', jpKnitting: '1 (2.4 mm)', crochetUs: 'B-1', craftYarnCouncilCategory: 'Fingering' },
  { metricMm: 2.5, labelMetric: '2.5 mm', usKnitting: 'US 1.5', ukKnitting: 'UK 12', jpKnitting: '1 (2.4 mm)', crochetUs: 'C-2', craftYarnCouncilCategory: 'Fingering' },
  { metricMm: 2.75, labelMetric: '2.75 mm', usKnitting: 'US 2', ukKnitting: 'UK 12', jpKnitting: '2 (2.7 mm)', crochetUs: 'C-2', craftYarnCouncilCategory: 'Fingering' },
  { metricMm: 3.0, labelMetric: '3.0 mm', usKnitting: 'US 2.5', ukKnitting: 'UK 11', jpKnitting: '3 (3.0 mm)', crochetUs: 'D-3', craftYarnCouncilCategory: 'Sport' },
  { metricMm: 3.25, labelMetric: '3.25 mm', usKnitting: 'US 3', ukKnitting: 'UK 10', jpKnitting: '4 (3.3 mm)', crochetUs: 'D-3', craftYarnCouncilCategory: 'Sport' },
  { metricMm: 3.5, labelMetric: '3.5 mm', usKnitting: 'US 4', ukKnitting: 'UK 9', jpKnitting: '5 (3.6 mm)', crochetUs: 'E-4', craftYarnCouncilCategory: 'DK' },
  { metricMm: 3.75, labelMetric: '3.75 mm', usKnitting: 'US 5', ukKnitting: 'UK 9', jpKnitting: '5 (3.6 mm)', crochetUs: 'F-5', craftYarnCouncilCategory: 'DK' },
  { metricMm: 4.0, labelMetric: '4.0 mm', usKnitting: 'US 6', ukKnitting: 'UK 8', jpKnitting: '6 (3.9 mm)', crochetUs: 'G-6', craftYarnCouncilCategory: 'Worsted' },
  { metricMm: 4.5, labelMetric: '4.5 mm', usKnitting: 'US 7', ukKnitting: 'UK 7', jpKnitting: '8 (4.5 mm)', crochetUs: '7', craftYarnCouncilCategory: 'Worsted' },
  { metricMm: 5.0, labelMetric: '5.0 mm', usKnitting: 'US 8', ukKnitting: 'UK 6', jpKnitting: '10 (5.1 mm)', crochetUs: 'H-8', craftYarnCouncilCategory: 'Worsted / Aran' },
  { metricMm: 5.5, labelMetric: '5.5 mm', usKnitting: 'US 9', ukKnitting: 'UK 5', jpKnitting: '11 (5.4 mm)', crochetUs: 'I-9', craftYarnCouncilCategory: 'Aran / Bulky' },
  { metricMm: 6.0, labelMetric: '6.0 mm', usKnitting: 'US 10', ukKnitting: 'UK 4', jpKnitting: '13 (6.0 mm)', crochetUs: 'J-10', craftYarnCouncilCategory: 'Bulky' },
  { metricMm: 6.5, labelMetric: '6.5 mm', usKnitting: 'US 10.5', ukKnitting: 'UK 3', jpKnitting: '15 (6.6 mm)', crochetUs: 'K-10.5', craftYarnCouncilCategory: 'Bulky' },
  { metricMm: 7.0, labelMetric: '7.0 mm', usKnitting: 'US 10.75', ukKnitting: 'UK 2', jpKnitting: '7.0 mm', crochetUs: 'K-10.5', craftYarnCouncilCategory: 'Bulky' },
  { metricMm: 8.0, labelMetric: '8.0 mm', usKnitting: 'US 11', ukKnitting: 'UK 0', jpKnitting: '8.0 mm', crochetUs: 'L-11', craftYarnCouncilCategory: 'Super Bulky' },
  { metricMm: 9.0, labelMetric: '9.0 mm', usKnitting: 'US 13', ukKnitting: 'UK 00', jpKnitting: '9.0 mm', crochetUs: 'M/N-13', craftYarnCouncilCategory: 'Super Bulky' },
  { metricMm: 10.0, labelMetric: '10.0 mm', usKnitting: 'US 15', ukKnitting: 'UK 000', jpKnitting: '10.0 mm', crochetUs: 'N/P-15', craftYarnCouncilCategory: 'Super Bulky' },
  { metricMm: 12.0, labelMetric: '12.0 mm', usKnitting: 'US 17', ukKnitting: 'UK 0000', jpKnitting: '12.0 mm', crochetUs: 'P/Q', craftYarnCouncilCategory: 'Jumbo' },
  { metricMm: 15.0, labelMetric: '15.0 mm', usKnitting: 'US 19', ukKnitting: 'UK 00000', jpKnitting: '15.0 mm', crochetUs: 'Q', craftYarnCouncilCategory: 'Jumbo' },
  { metricMm: 20.0, labelMetric: '20.0 mm', usKnitting: 'US 35', ukKnitting: 'UK 000000', jpKnitting: '20.0 mm', crochetUs: 'S', craftYarnCouncilCategory: 'Jumbo' },
  { metricMm: 25.0, labelMetric: '25.0 mm', usKnitting: 'US 50', ukKnitting: 'UK 0000000', jpKnitting: '25.0 mm', crochetUs: 'T / 25mm', craftYarnCouncilCategory: 'Jumbo' },
];

/**
 * Znajduje najbliższy metryczny rozmiar drutu z tabeli standardów.
 */
export function findClosestMetricNeedle(mm: number): NeedleSizeEntry {
  const safeMm = Math.max(0.5, mm);
  let closest = NEEDLE_SIZE_TABLE[0];
  let minDiff = Math.abs(safeMm - closest.metricMm);

  for (let i = 1; i < NEEDLE_SIZE_TABLE.length; i++) {
    const diff = Math.abs(safeMm - NEEDLE_SIZE_TABLE[i].metricMm);
    if (diff < minDiff) {
      minDiff = diff;
      closest = NEEDLE_SIZE_TABLE[i];
    }
  }

  return closest;
}

/**
 * Konwertuje rozmiar drutu z dowolnego systemu na pełny profil rozmiarów.
 */
export function convertNeedleSize(
  value: string | number,
  fromSystem: NeedleSystem = 'metric'
): NeedleConversionResult {
  let matched: NeedleSizeEntry = NEEDLE_SIZE_TABLE[8]; // Domyślnie 4.0 mm

  if (typeof value === 'number') {
    matched = findClosestMetricNeedle(value);
  } else {
    const cleanStr = String(value).trim().toLowerCase();
    const numericParsed = parseFloat(cleanStr);

    if (fromSystem === 'metric') {
      matched = isNaN(numericParsed) ? NEEDLE_SIZE_TABLE[8] : findClosestMetricNeedle(numericParsed);
    } else if (fromSystem === 'us') {
      const normalizedUS = cleanStr.startsWith('us') ? cleanStr : `us ${cleanStr}`;
      const found = NEEDLE_SIZE_TABLE.find(e => e.usKnitting.toLowerCase() === normalizedUS || e.usKnitting.toLowerCase().replace('us ', '') === cleanStr);
      matched = found || findClosestMetricNeedle(isNaN(numericParsed) ? 4.0 : numericParsed);
    } else if (fromSystem === 'uk') {
      const normalizedUK = cleanStr.startsWith('uk') ? cleanStr : `uk ${cleanStr}`;
      const found = NEEDLE_SIZE_TABLE.find(e => e.ukKnitting?.toLowerCase() === normalizedUK || e.ukKnitting?.toLowerCase().replace('uk ', '') === cleanStr);
      matched = found || findClosestMetricNeedle(4.0);
    } else if (fromSystem === 'jp') {
      const found = NEEDLE_SIZE_TABLE.find(e => e.jpKnitting?.toLowerCase().startsWith(cleanStr));
      matched = found || findClosestMetricNeedle(4.0);
    }
  }

  return {
    sourceValue: value,
    sourceSystem: fromSystem,
    matchedEntry: matched,
    metricMm: matched.metricMm,
    us: matched.usKnitting,
    uk: matched.ukKnitting || '—',
    jp: matched.jpKnitting || '—',
    crochet: matched.crochetUs || '—',
  };
}

/**
 * Przelicznik długości rzemieślniczych: metry <-> jardy (1 m = 1.093613 yd).
 */
export function convertCraftLength(
  value: number,
  fromUnit: 'meters' | 'yards',
  toUnit: 'meters' | 'yards'
): number {
  if (value <= 0 || isNaN(value)) return 0;
  if (fromUnit === toUnit) return value;

  const YARDS_PER_METER = 1.0936132983;

  if (fromUnit === 'meters' && toUnit === 'yards') {
    return Math.round((value * YARDS_PER_METER) * 100) / 100;
  }
  // yards to meters
  return Math.round((value / YARDS_PER_METER) * 100) / 100;
}

/**
 * Przelicznik wagi rzemieślniczej: gramy <-> uncje (1 oz = 28.349523 g).
 */
export function convertCraftWeight(
  value: number,
  fromUnit: 'grams' | 'ounces',
  toUnit: 'grams' | 'ounces'
): number {
  if (value <= 0 || isNaN(value)) return 0;
  if (fromUnit === toUnit) return value;

  const GRAMS_PER_OUNCE = 28.349523125;

  if (fromUnit === 'ounces' && toUnit === 'grams') {
    return Math.round((value * GRAMS_PER_OUNCE) * 100) / 100;
  }
  // grams to ounces
  return Math.round((value / GRAMS_PER_OUNCE) * 100) / 100;
}

/**
 * Przelicznik gęstości próbki: oczka na 10 cm <-> oczka na 4 cale.
 * Uwaga: 4 cale to dokładnie 10.16 cm, więc 10 cm to 3.937 cala.
 */
export function convertGaugeTension(
  stitches: number,
  fromUnit: '10cm' | '4inch',
  toUnit: '10cm' | '4inch'
): number {
  if (stitches <= 0 || isNaN(stitches)) return 0;
  if (fromUnit === toUnit) return stitches;

  // 4 cale = 10.16 cm. Oczka na 4 cale = (oczka na 10 cm) * 1.016
  if (fromUnit === '10cm' && toUnit === '4inch') {
    return Math.round((stitches * 1.016) * 10) / 10;
  }
  // 4inch to 10cm
  return Math.round((stitches / 1.016) * 10) / 10;
}
