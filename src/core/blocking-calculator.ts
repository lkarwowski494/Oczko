/**
 * Oczko Core — Kalkulator Blokowania Próbki i Kompensacji Wymiarów (DEC-34, BR-PROJ-005)
 * Zapewnia deterministyczne obliczenia zachowania dzianiny przed i po blokowaniu na mokro (Wet Blocking):
 * 1. Oblicza stopień rozciągnięcia (growth) lub skurczu (shrinkage) wzdłuż i wszerz w procentach.
 * 2. Przelicza gęstość oczek i rzędów na jednostkę (cm / cal) przed i po praniu.
 * 3. Wylicza wymiary docelowe na drutach (on-needles dimensions) — rzemieślnik wie, przy jakich
 *    wymiarach przerabiania zakończyć robótkę, aby po praniu osiągnąć idealny rozmiar.
 * 4. Generuje technologiczne porady dla włókien w oparciu o dynamikę próbki.
 * 
 * Zgodne ze standardem Craft Yarn Council (CYC) oraz inwariantem ZP-05 (Zero Generative AI).
 */

export type Unit = 'cm' | 'inch';

export type DimensionBehavior = 'growth' | 'shrinkage' | 'stable';

export interface RawSwatch {
  stitches: number;
  rows: number;
  width: number;
  height: number;
  unit: Unit;
}

export interface BlockedSwatch {
  width: number;
  height: number;
  unit: Unit;
}

export interface TargetGarmentDimensions {
  targetWidth: number;
  targetHeight: number;
  unit: Unit;
}

export interface BlockingAnalysisResult {
  widthChangePct: number;
  heightChangePct: number;
  widthBehavior: DimensionBehavior;
  heightBehavior: DimensionBehavior;

  rawStitchesPerUnit: number;
  rawRowsPerUnit: number;
  blockedStitchesPerUnit: number;
  blockedRowsPerUnit: number;

  requiredCastOnStitches: number;
  requiredTotalRows: number;

  onNeedlesWidth: number;
  onNeedlesHeight: number;
  unit: Unit;

  fiberTips: string[];
}

const INCH_TO_CM = 2.54;

/**
 * Konwertuje wartość pomiędzy centymetrami a calami.
 */
export function convertLength(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  if (from === 'inch' && to === 'cm') return value * INCH_TO_CM;
  return value / INCH_TO_CM;
}

/**
 * Klasyfikuje zachowanie wymiaru na podstawie zmiany procentowej.
 */
export function classifyBehavior(changePct: number): DimensionBehavior {
  if (changePct > 2.0) return 'growth';
  if (changePct < -2.0) return 'shrinkage';
  return 'stable';
}

/**
 * Generuje technologiczne porady rzemieślnicze na podstawie dynamiki zmiany wymiarów.
 */
export function generateFiberAdvice(widthPct: number, heightPct: number): string[] {
  const tips: string[] = [];

  if (heightPct >= 8.0) {
    tips.push(
      'Dzianina silnie rośnie wzdłuż po praniu (charakterystyczne dla Superwash, alpaki lub jedwabiu). Przerabiaj mniej rzędów na drutach, aby uniknąć zbyt długiego wyrobu.'
    );
  } else if (heightPct <= -5.0) {
    tips.push(
      'Dzianina zbiega się w pionie. Będziesz potrzebować większej liczby rzędów na drutach, aby osiągnąć zamierzoną długość po praniu.'
    );
  }

  if (widthPct >= 8.0) {
    tips.push(
      'Dzianina mocno rozszerza się wszerz. Zwróć uwagę na luz odzieżowy – wyrób po blokowaniu będzie wyraźnie luźniejszy niż w trakcie dziergania.'
    );
  } else if (widthPct <= -5.0) {
    tips.push(
      'Ścieg wyraźnie zagęszcza się wszerz (typowe dla niefilcowanej wełny lub ściągaczy). Unikaj agresywnego naciągania szpilkami podczas suszenia.'
    );
  }

  if (tips.length === 0) {
    tips.push('Próbka wykazuje wysoką stabilność wymiarową przed i po blokowaniu.');
  }

  return tips;
}

/**
 * Główna funkcja analityczna kalkulatora blokowania próbki.
 */
export function calculateBlockingAnalysis(
  raw: RawSwatch,
  blocked: BlockedSwatch,
  target?: TargetGarmentDimensions
): BlockingAnalysisResult {
  if (
    raw.stitches <= 0 ||
    raw.rows <= 0 ||
    raw.width <= 0 ||
    raw.height <= 0 ||
    blocked.width <= 0 ||
    blocked.height <= 0
  ) {
    throw new Error('Wymiary i liczba oczek próbki muszą być większe od zera.');
  }

  // Konwersja wymiarów próbki po praniu do jednostki próbki surowej
  const normBlockedWidth = convertLength(blocked.width, blocked.unit, raw.unit);
  const normBlockedHeight = convertLength(blocked.height, blocked.unit, raw.unit);

  const widthChangePct = Number(
    (((normBlockedWidth - raw.width) / raw.width) * 100).toFixed(1)
  );
  const heightChangePct = Number(
    (((normBlockedHeight - raw.height) / raw.height) * 100).toFixed(1)
  );

  const rawStitchesPerUnit = raw.stitches / raw.width;
  const rawRowsPerUnit = raw.rows / raw.height;

  const blockedStitchesPerUnit = raw.stitches / normBlockedWidth;
  const blockedRowsPerUnit = raw.rows / normBlockedHeight;

  let requiredCastOnStitches = 0;
  let requiredTotalRows = 0;
  let onNeedlesWidth = 0;
  let onNeedlesHeight = 0;

  if (target) {
    if (target.targetWidth < 0 || target.targetHeight < 0) {
      throw new Error('Docelowe wymiary wyrobu nie mogą być ujemne.');
    }
    const normTargetWidth = convertLength(target.targetWidth, target.unit, raw.unit);
    const normTargetHeight = convertLength(target.targetHeight, target.unit, raw.unit);

    requiredCastOnStitches = Math.round(normTargetWidth * blockedStitchesPerUnit);
    requiredTotalRows = Math.round(normTargetHeight * blockedRowsPerUnit);

    // Wymiary do jakich należy dziergać na drutach (przed praniem)
    onNeedlesWidth = Number((normTargetWidth * (raw.width / normBlockedWidth)).toFixed(1));
    onNeedlesHeight = Number((normTargetHeight * (raw.height / normBlockedHeight)).toFixed(1));
  }

  return {
    widthChangePct,
    heightChangePct,
    widthBehavior: classifyBehavior(widthChangePct),
    heightBehavior: classifyBehavior(heightChangePct),
    rawStitchesPerUnit,
    rawRowsPerUnit,
    blockedStitchesPerUnit,
    blockedRowsPerUnit,
    requiredCastOnStitches,
    requiredTotalRows,
    onNeedlesWidth,
    onNeedlesHeight,
    unit: raw.unit,
    fiberTips: generateFiberAdvice(widthChangePct, heightChangePct),
  };
}
