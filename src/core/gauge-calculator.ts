/**
 * Oczko Core — Kalkulator próbki obliczeniowej (Gauge Swatch) i szablony projektów (DEC-01, BR-PROJ-004)
 * Zapewnia:
 * 1. Przeliczanie gęstości ściegu na docelowe wymiary (oczka i rzędy robótki)
 * 2. Obsługę jednostek metrycznych (cm) oraz imperialnych (cale)
 * 3. Analizę różnic naprężenia (próbka wykonawcy vs wzór) i rekomendacje doboru rozmiaru drutów/szydełka
 * 4. Przeliczanie liczby nabieranych oczek (cast-on adjustment) bez konieczności ponownego prucia próbki
 * 5. Wbudowane szablony typowych projektów dziewiarskich i szydełkowych
 */

export type MeasurementUnit = 'cm' | 'inch';

export interface SwatchMeasurement {
  stitches: number;
  rows: number;
  width: number;
  height: number;
  unit: MeasurementUnit;
}

export interface TargetDimensions {
  width: number;
  height: number;
  unit: MeasurementUnit;
}

export interface GaugeCalculationResult {
  stitchesPerUnit: number;
  rowsPerUnit: number;
  targetStitches: number;
  targetRows: number;
  unit: MeasurementUnit;
}

export interface GaugeComparisonResult {
  stitchRatio: number;
  rowRatio: number;
  status: 'exact' | 'tighter' | 'looser';
  needleAdjustmentRecommendation: string;
  recalculatedCastOn: (patternCastOn: number) => number;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  category: 'sweter' | 'szal' | 'czapka' | 'kocyk' | 'skarpetki';
  description: string;
  defaultDimensions: TargetDimensions;
  defaultCraftType: 'knitting' | 'crochet';
  recommendedYarnWeight: string;
  standardGauge: SwatchMeasurement;
}

const INCH_TO_CM = 2.54;

/**
 * Konwertuje wartość z cali na centymetry lub odwrotnie.
 */
export function convertLength(value: number, from: MeasurementUnit, to: MeasurementUnit): number {
  if (from === to) return value;
  if (from === 'inch' && to === 'cm') return value * INCH_TO_CM;
  return value / INCH_TO_CM;
}

/**
 * Wylicza docelową liczbę oczek i rzędów na podstawie wymiarów próbki i pożądanych rozmiarów wyrobu.
 */
export function calculateTargetStitchesAndRows(
  swatch: SwatchMeasurement,
  target: TargetDimensions
): GaugeCalculationResult {
  if (swatch.width <= 0 || swatch.height <= 0 || swatch.stitches <= 0 || swatch.rows <= 0) {
    throw new Error('Wymiary próbki oraz liczba oczek i rzędów muszą być większe od zera.');
  }
  if (target.width <= 0 || target.height <= 0) {
    throw new Error('Docelowe wymiary projektu muszą być większe od zera.');
  }

  // Przeliczenie wymiarów próbki na jednostkę docelową
  const swatchWidthInTargetUnit = convertLength(swatch.width, swatch.unit, target.unit);
  const swatchHeightInTargetUnit = convertLength(swatch.height, swatch.unit, target.unit);

  const stitchesPerUnit = swatch.stitches / swatchWidthInTargetUnit;
  const rowsPerUnit = swatch.rows / swatchHeightInTargetUnit;

  const targetStitches = Math.max(1, Math.round(target.width * stitchesPerUnit));
  const targetRows = Math.max(1, Math.round(target.height * rowsPerUnit));

  return {
    stitchesPerUnit: Number(stitchesPerUnit.toFixed(4)),
    rowsPerUnit: Number(rowsPerUnit.toFixed(4)),
    targetStitches,
    targetRows,
    unit: target.unit,
  };
}

/**
 * Przelicza liczbę nabieranych oczek w oparciu o stosunek gęstości próbki.
 */
export function calculateCastOnAdjustment(patternCastOn: number, stitchRatio: number): number {
  if (patternCastOn <= 0 || stitchRatio <= 0) return 0;
  return Math.max(1, Math.round(patternCastOn * stitchRatio));
}

/**
 * Porównuje próbkę wykonawcy z próbką wymaganą przez wzór.
 * Podaje rekomendację doboru rozmiaru drutów lub współczynnik przeliczenia oczek.
 */
export function compareGauges(
  patternGauge: SwatchMeasurement,
  actualGauge: SwatchMeasurement
): GaugeComparisonResult {
  // Sprowadzamy obie próbki do wspólnej jednostki (cm)
  const patWidthCm = convertLength(patternGauge.width, patternGauge.unit, 'cm');
  const patHeightCm = convertLength(patternGauge.height, patternGauge.unit, 'cm');
  const patStPerCm = patternGauge.stitches / patWidthCm;
  const patRowsPerCm = patternGauge.rows / patHeightCm;

  const actWidthCm = convertLength(actualGauge.width, actualGauge.unit, 'cm');
  const actHeightCm = convertLength(actualGauge.height, actualGauge.unit, 'cm');
  const actStPerCm = actualGauge.stitches / actWidthCm;
  const actRowsPerCm = actualGauge.rows / actHeightCm;

  const stitchRatio = Number((actStPerCm / patStPerCm).toFixed(4));
  const rowRatio = Number((actRowsPerCm / patRowsPerCm).toFixed(4));

  let status: 'exact' | 'tighter' | 'looser' = 'exact';
  let needleAdjustmentRecommendation = 'Próbka jest idealnie zgodna z zaleceniami wzoru. Zachowaj aktualne druty/szydełko.';

  // Jeśli wykonawca ma o ponad 3% więcej oczek na cm -> dzianina jest ciaśniejsza, wyrób wyszedłby mniejszy
  if (stitchRatio > 1.03) {
    status = 'tighter';
    needleAdjustmentRecommendation =
      'Twoja robótka jest ściślejsza niż we wzorze (więcej oczek na cm). Użyj drutów o 0.5–1.0 mm grubszych, aby wyrób nie wyszedł zbyt mały, lub nabierz odpowiednio więcej oczek.';
  } else if (stitchRatio < 0.97) {
    status = 'looser';
    needleAdjustmentRecommendation =
      'Twoja robótka jest luźniejsza niż we wzorze (mniej oczek na cm). Użyj drutów o 0.5–1.0 mm cieńszych, aby wyrób nie był za duży i zwiotczały, lub nabierz mniej oczek.';
  }

  const recalculatedCastOn = (patternCastOn: number) => {
    return calculateCastOnAdjustment(patternCastOn, stitchRatio);
  };

  return {
    stitchRatio,
    rowRatio,
    status,
    needleAdjustmentRecommendation,
    recalculatedCastOn,
  };
}

/**
 * Zestaw fabrycznych szablonów dla popularnych projektów rękodzielniczych.
 */
export const BUILT_IN_PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'tpl-beanie',
    name: 'Czapka Beanie (Damska/Męska)',
    category: 'czapka',
    description: 'Klasyczna czapka z pojedynczym wywinięciem ściągacza.',
    defaultDimensions: { width: 48, height: 24, unit: 'cm' },
    defaultCraftType: 'knitting',
    recommendedYarnWeight: 'Worsted',
    standardGauge: { stitches: 20, rows: 28, width: 10, height: 10, unit: 'cm' },
  },
  {
    id: 'tpl-scarf',
    name: 'Szal Prosty (Zimowy)',
    category: 'szal',
    description: 'Długi, ciepły szal przerabiany ściegiem ryżowym lub ściągaczem.',
    defaultDimensions: { width: 25, height: 180, unit: 'cm' },
    defaultCraftType: 'knitting',
    recommendedYarnWeight: 'Aran',
    standardGauge: { stitches: 16, rows: 22, width: 10, height: 10, unit: 'cm' },
  },
  {
    id: 'tpl-blanket',
    name: 'Kocyk Dziecięcy',
    category: 'kocyk',
    description: 'Miękki kocyk do wózka lub łóżeczka, prosty w wykonaniu.',
    defaultDimensions: { width: 80, height: 100, unit: 'cm' },
    defaultCraftType: 'knitting',
    recommendedYarnWeight: 'DK',
    standardGauge: { stitches: 22, rows: 30, width: 10, height: 10, unit: 'cm' },
  },
  {
    id: 'tpl-sweater-body',
    name: 'Sweter (Korpus / Przód)',
    category: 'sweter',
    description: 'Prosty przód lub tył swetra o standardowym kroju prostym.',
    defaultDimensions: { width: 52, height: 60, unit: 'cm' },
    defaultCraftType: 'knitting',
    recommendedYarnWeight: 'Worsted',
    standardGauge: { stitches: 18, rows: 24, width: 10, height: 10, unit: 'cm' },
  },
  {
    id: 'tpl-socks-cuff',
    name: 'Skarpetki (Ściągacz i cholewka)',
    category: 'skarpetki',
    description: 'Standardowe skarpetki na 4 drutach pończoszniczych lub metodą Magic Loop.',
    defaultDimensions: { width: 21, height: 26, unit: 'cm' },
    defaultCraftType: 'knitting',
    recommendedYarnWeight: 'Fingering',
    standardGauge: { stitches: 30, rows: 42, width: 10, height: 10, unit: 'cm' },
  },
];
