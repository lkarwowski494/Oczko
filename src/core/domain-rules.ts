export type ConfidenceLevel = 'math' | 'standard' | 'heurystyka' | 'praktyka';

export const UNITS = {
  CM_PER_INCH: 2.54,
  M_PER_YARD: 0.9144,
  G_PER_OUNCE: 28.349523125,
  KG_PER_POUND: 0.45359237,
  OZ_PER_POUND: 16,
} as const;

export function inchesToCm(inches: number): number {
  if (inches <= 0) throw new Error('Długość musi być większa od 0');
  return inches * UNITS.CM_PER_INCH;
}

export function cmToInches(cm: number): number {
  if (cm <= 0) throw new Error('Długość musi być większa od 0');
  return cm / UNITS.CM_PER_INCH;
}

export function yardsToMeters(yards: number): number {
  if (yards <= 0) throw new Error('Długość musi być większa od 0');
  return yards * UNITS.M_PER_YARD;
}

export function metersToYards(meters: number): number {
  if (meters <= 0) throw new Error('Długość musi być większa od 0');
  return meters / UNITS.M_PER_YARD;
}

export function ouncesToGrams(oz: number): number {
  if (oz <= 0) throw new Error('Waga musi być większa od 0');
  return oz * UNITS.G_PER_OUNCE;
}

export function yardsPer100gToMetersPer100g(ydPer100g: number): number {
  if (ydPer100g <= 0) throw new Error('Metraż musi być większy od 0');
  return ydPer100g * UNITS.M_PER_YARD;
}

export interface GaugeSample {
  count: number;
  length: number;
  unit: 'cm' | 'in';
}

export interface StitchCalculationResult {
  exact: number;
  rounded: number;
  floor: number;
  ceil: number;
  densityPerUnit: number;
  densityPer10cm: number;
}

export function calculateFromGauge(
  sample: GaugeSample,
  targetDimension: number,
  targetUnit: 'cm' | 'in' = 'cm'
): StitchCalculationResult {
  if (sample.count <= 0 || sample.length <= 0) {
    throw new Error('Wartości próbki muszą być większe od 0');
  }
  if (targetDimension < 0) {
    throw new Error('Wymiar docelowy nie może być ujemny');
  }
  const sampleLengthCm = sample.unit === 'in' ? sample.length * UNITS.CM_PER_INCH : sample.length;
  if (targetDimension === 0) {
    return {
      exact: 0,
      rounded: 0,
      floor: 0,
      ceil: 0,
      densityPerUnit: sample.count / sample.length,
      densityPer10cm: (sample.count / sampleLengthCm) * 10,
    };
  }

  const targetCm = targetUnit === 'in' ? targetDimension * UNITS.CM_PER_INCH : targetDimension;
  const exact = (sample.count * targetCm) / sampleLengthCm;

  return {
    exact,
    rounded: Math.round(exact),
    floor: Math.floor(exact),
    ceil: Math.ceil(exact),
    densityPerUnit: sample.count / sample.length,
    densityPer10cm: (sample.count * 10) / sampleLengthCm,
  };
}

export interface PatternRepeatCandidate {
  k: number;
  stitches: number;
  resultingWidthCm: number;
}

export interface PatternRecalculationResult {
  exactStitches: number;
  lowerCandidate: PatternRepeatCandidate;
  upperCandidate: PatternRepeatCandidate;
}

export function adaptPatternStitches(
  patternStitches: number,
  patternGaugePer10cm: number,
  myGaugePer10cm: number,
  repeatMultiple: number = 1,
  edgeStitches: number = 0
): PatternRecalculationResult {
  if (patternStitches <= 0 || patternGaugePer10cm <= 0 || myGaugePer10cm <= 0) {
    throw new Error('Liczba oczek i gęstości muszą być większe od 0');
  }
  if (repeatMultiple <= 0 || edgeStitches < 0) {
    throw new Error('Nieprawidłowe parametry raportu wzoru');
  }

  const exactStitches = (patternStitches * myGaugePer10cm) / patternGaugePer10cm;

  if (exactStitches < edgeStitches) {
    throw new Error('Wynik mniejszy niż liczba oczek brzegowych (brak poprawnego k)');
  }

  const kFloor = Math.floor((exactStitches - edgeStitches) / repeatMultiple);
  const kCeil = Math.ceil((exactStitches - edgeStitches) / repeatMultiple);

  const lowerStitches = repeatMultiple * kFloor + edgeStitches;
  const upperStitches = repeatMultiple * kCeil + edgeStitches;
  const myDensityPerCm = myGaugePer10cm / 10;

  return {
    exactStitches,
    lowerCandidate: {
      k: kFloor,
      stitches: lowerStitches,
      resultingWidthCm: lowerStitches / myDensityPerCm,
    },
    upperCandidate: {
      k: kCeil,
      stitches: upperStitches,
      resultingWidthCm: upperStitches / myDensityPerCm,
    },
  };
}

export type ShapingMethod = 'k2tog' | 'm1_yo' | 'kfb';
export type WorkMode = 'round' | 'flat';

export interface RowShapingDistribution {
  P: number;
  g: number;
  q: number;
  r: number;
  largerGapSize: number;
  largerGapCount: number;
  smallerGapSize: number;
  smallerGapCount: number;
  gaps: number[];
  finalStitches: number;
}

export function distributeShapingInRow(
  currentStitches: number,
  changeCount: number,
  method: ShapingMethod,
  mode: WorkMode
): RowShapingDistribution {
  if (currentStitches <= 0 || changeCount < 0) {
    throw new Error('Nieprawidłowa liczba oczek lub zmian');
  }

  let P: number;
  let finalStitches: number;

  if (method === 'k2tog') {
    P = currentStitches - 2 * changeCount;
    finalStitches = currentStitches - changeCount;
  } else if (method === 'm1_yo') {
    P = currentStitches;
    finalStitches = currentStitches + changeCount;
  } else {
    P = currentStitches - changeCount;
    finalStitches = currentStitches + changeCount;
  }

  if (P < 0) {
    throw new Error(`Niewykonalne: P = ${P}`);
  }

  if (changeCount === 0) {
    return {
      P: currentStitches,
      g: 1,
      q: currentStitches,
      r: 0,
      largerGapSize: currentStitches + 1,
      largerGapCount: 0,
      smallerGapSize: currentStitches,
      smallerGapCount: 1,
      gaps: [currentStitches],
      finalStitches: currentStitches,
    };
  }

  const g = mode === 'round' ? changeCount : changeCount + 1;
  const q = Math.floor(P / g);
  const r = P % g;

  const largerGapCount = r;
  const smallerGapCount = g - r;

  const gaps: number[] = [
    ...Array(largerGapCount).fill(q + 1),
    ...Array(smallerGapCount).fill(q),
  ];

  return {
    P,
    g,
    q,
    r,
    largerGapSize: q + 1,
    largerGapCount,
    smallerGapSize: q,
    smallerGapCount,
    gaps,
    finalStitches,
  };
}

export interface HeightDistributionResult {
  shorterInterval: number;
  shorterCount: number;
  longerInterval: number;
  longerCount: number;
  totalRowsCovered: number;
}

export function distributeShapingOverRows(
  totalRows: number,
  eventsCount: number,
  rsOnly: boolean = false
): HeightDistributionResult {
  if (totalRows <= 0 || eventsCount < 0) {
    throw new Error('Liczba rzędów i zdarzeń musi być dodatnia');
  }
  if (eventsCount === 0) {
    return {
      shorterInterval: 0,
      shorterCount: 0,
      longerInterval: 0,
      longerCount: 0,
      totalRowsCovered: 0,
    };
  }

  const effectiveRows = rsOnly ? Math.floor(totalRows / 2) : totalRows;
  if (eventsCount > effectiveRows) {
    throw new Error('Liczba zdarzeń przekracza liczbę dostępnych rzędów');
  }

  const q = Math.floor(effectiveRows / eventsCount);
  const r = effectiveRows % eventsCount;

  const shorterCount = eventsCount - r;
  const longerCount = r;

  const multiplier = rsOnly ? 2 : 1;
  const shorterInterval = q * multiplier;
  const longerInterval = (q + 1) * multiplier;

  return {
    shorterInterval,
    shorterCount,
    longerInterval,
    longerCount,
    totalRowsCovered: shorterCount * shorterInterval + longerCount * longerInterval,
  };
}

export function generateRowSchedule(params: {
  firstRow: number;
  step: number;
  totalEvents?: number;
  moreTimes?: number;
}): number[] {
  const { firstRow, step, totalEvents, moreTimes } = params;
  if (firstRow <= 0 || step <= 0) {
    throw new Error('Pierwszy rząd i krok muszą być większe od 0');
  }

  const count = moreTimes !== undefined ? 1 + moreTimes : (totalEvents ?? 0);
  if (count <= 0) return [];

  return Array.from({ length: count }, (_, i) => firstRow + i * step);
}

export interface SwatchYarnRequirementResult {
  exactGrams: number;
  exactMeters: number;
  ballsNeeded: number;
}

export function calculateYarnFromSwatch(params: {
  swatchArea: number;
  swatchWeightGrams: number;
  projectArea: number;
  metersPer100g?: number;
  ballWeightGrams?: number;
}): SwatchYarnRequirementResult {
  const { swatchArea, swatchWeightGrams, projectArea, metersPer100g, ballWeightGrams } = params;
  if (swatchArea <= 0 || swatchWeightGrams <= 0 || projectArea <= 0) {
    throw new Error('Powierzchnia i waga muszą być większe od 0');
  }

  const exactGrams = (projectArea * swatchWeightGrams) / swatchArea;
  const exactMeters = metersPer100g ? (exactGrams * metersPer100g) / 100 : 0;
  const ballsNeeded = ballWeightGrams ? Math.ceil(exactGrams / ballWeightGrams) : 0;

  return {
    exactGrams,
    exactMeters,
    ballsNeeded,
  };
}

export interface YarnSubstitutionResult {
  totalLengthRequired: number;
  exactBalls: number;
  ballsNeeded: number;
  isTightMargin: boolean;
}

export function calculateYarnSubstitution(params: {
  patternBalls: number;
  patternBallLength: number;
  newBallLength: number;
  safetyMarginRatio?: number;
  strands?: number;
}): YarnSubstitutionResult {
  const {
    patternBalls,
    patternBallLength,
    newBallLength,
    safetyMarginRatio = 0,
    strands = 1,
  } = params;

  if (patternBalls <= 0 || patternBallLength <= 0 || newBallLength <= 0 || strands <= 0) {
    throw new Error('Parametry włóczki muszą być większe od 0');
  }

  const baseLength = patternBalls * patternBallLength * strands;
  const totalLengthRequired = baseLength * (1 + safetyMarginRatio);
  const exactBalls = totalLengthRequired / newBallLength;
  const ballsNeeded = Math.ceil(exactBalls - 1e-12);

  const nearestInt = Math.round(exactBalls);
  const isTightMargin = Math.abs(exactBalls - nearestInt) <= 0.02 && exactBalls <= nearestInt;

  return {
    totalLengthRequired,
    exactBalls,
    ballsNeeded,
    isTightMargin,
  };
}

export function getYarnWeightCategoriesByKnitGauge4in(stitchesPer4in: number): number[] {
  if (stitchesPer4in <= 0) throw new Error('Gęstość musi być większa od 0');
  const cycRanges: Array<{ category: number; min: number; max: number }> = [
    { category: 0, min: 33, max: 40 },
    { category: 1, min: 27, max: 32 },
    { category: 2, min: 23, max: 26 },
    { category: 3, min: 21, max: 24 },
    { category: 4, min: 16, max: 20 },
    { category: 5, min: 12, max: 15 },
    { category: 6, min: 7, max: 11 },
    { category: 7, min: 1, max: 6 },
  ];

  return cycRanges
    .filter((r) => stitchesPer4in >= r.min && stitchesPer4in <= r.max)
    .map((r) => r.category);
}

export function getYarnWeightCategoriesByWpi(wpi: number): number[] {
  if (wpi <= 0) throw new Error('WPI musi być większe od 0');
  const wpiRanges: Array<{ category: number; min: number; max: number }> = [
    { category: 0, min: 30, max: 60 },
    { category: 1, min: 14, max: 30 },
    { category: 2, min: 12, max: 18 },
    { category: 3, min: 11, max: 15 },
    { category: 4, min: 9, max: 12 },
    { category: 5, min: 6, max: 9 },
    { category: 6, min: 5, max: 6 },
    { category: 7, min: 1, max: 4 },
  ];

  return wpiRanges
    .filter((r) => wpi >= r.min && wpi <= r.max)
    .map((r) => r.category);
}

const US_TO_MM_KNIT_NEEDLES: Record<string, number[]> = {
  '000': [1.5],
  '00': [1.75],
  '0': [2.0],
  '1': [2.25],
  '1.5': [2.5],
  '2': [2.75],
  '2.5': [3.0],
  '3': [3.25],
  '4': [3.5],
  '5': [3.75],
  '6': [4.0, 4.25],
  '7': [4.5],
  '8': [5.0],
  '9': [5.5],
  '10': [6.0],
  '10.5': [6.5],
  '10.75': [7.0],
  '11': [8.0],
  '13': [9.0],
  '15': [10.0],
  '17': [12.0],
  '19': [15.0, 16.0],
  '35': [19.0],
  '36': [20.0],
  '50': [25.0],
};

export function usNeedleToMm(usSize: string | number): number[] {
  const key = String(usSize).trim();
  const match = US_TO_MM_KNIT_NEEDLES[key];
  if (!match) throw new Error(`Nieznany rozmiar drutów US: ${usSize}`);
  return [...match];
}

export type EaseCategory =
  | 'bardzo dopasowany'
  | 'pomiędzy (dopasowany–bardzo dopasowany)'
  | 'dopasowany'
  | 'między zerowym a klasycznym'
  | 'klasyczny'
  | 'klasyczny / luźny'
  | 'luźny'
  | 'luźny / oversize'
  | 'oversize'
  | 'poniżej skali (mniej niż -10 cm)';

export interface EaseEvaluation {
  easeCm: number;
  category: EaseCategory;
}

export function evaluateGarmentEase(bodyMeasurementCm: number, finishedGarmentCm: number): EaseEvaluation {
  if (bodyMeasurementCm <= 0 || finishedGarmentCm <= 0) {
    throw new Error('Wymiary ciała i ubrania muszą być większe od 0');
  }

  const easeCm = finishedGarmentCm - bodyMeasurementCm;

  let category: EaseCategory;
  if (easeCm < -10) {
    category = 'poniżej skali (mniej niż -10 cm)';
  } else if (easeCm >= -10 && easeCm <= -5) {
    category = 'bardzo dopasowany';
  } else if (easeCm > -5 && easeCm < 0) {
    category = 'pomiędzy (dopasowany–bardzo dopasowany)';
  } else if (easeCm === 0) {
    category = 'dopasowany';
  } else if (easeCm > 0 && easeCm < 5) {
    category = 'między zerowym a klasycznym';
  } else if (easeCm >= 5 && easeCm < 10) {
    category = 'klasyczny';
  } else if (easeCm === 10) {
    category = 'klasyczny / luźny';
  } else if (easeCm > 10 && easeCm < 15) {
    category = 'luźny';
  } else if (easeCm === 15) {
    category = 'luźny / oversize';
  } else {
    category = 'oversize';
  }

  return { easeCm, category };
}
