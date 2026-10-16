import {
  evaluateGarmentEase,
  adaptPatternStitches,
  EaseCategory,
  PatternRecalculationResult,
} from './domain-rules';

export type EasePresetId =
  | 'negative_socks'
  | 'negative_fitted'
  | 'zero_ease'
  | 'close_fit'
  | 'classic_fit'
  | 'relaxed_fit'
  | 'oversize_fit'
  | 'boxy_fit';

export interface EasePreset {
  id: EasePresetId;
  labelPl: string;
  recommendedEaseCm: number;
  rangeDescriptionPl: string;
  recommendedFor: string;
}

export const EASE_PRESETS: readonly EasePreset[] = [
  {
    id: 'negative_socks',
    labelPl: 'Głęboki ujemny (-10 do -5 cm)',
    recommendedEaseCm: -7.5,
    rangeDescriptionPl: 'od -10 cm do -5 cm',
    recommendedFor: 'Skarpety, czapki beanie, elastyczne opaski, biustonosze dzianinowe',
  },
  {
    id: 'negative_fitted',
    labelPl: 'Lekki ujemny (-5 do -1 cm)',
    recommendedEaseCm: -3,
    rangeDescriptionPl: 'od -5 cm do -1 cm',
    recommendedFor: 'Dopasowane golfy, elastyczne body, ściągaczowe topy z wełny z elastanem',
  },
  {
    id: 'zero_ease',
    labelPl: 'Zerowy luz (0 cm)',
    recommendedEaseCm: 0,
    rangeDescriptionPl: 'dokładnie 0 cm',
    recommendedFor: 'Rękawiczki, dopasowane kamizelki, odzież dokładnie według wymiarów ciała',
  },
  {
    id: 'close_fit',
    labelPl: 'Lekko przylegający (+1 do +4 cm)',
    recommendedEaseCm: 3,
    rangeDescriptionPl: 'od +1 cm do +4 cm',
    recommendedFor: 'Eleganckie kardigany, dopasowane bluzki, klasyczne pulowery wizytowe',
  },
  {
    id: 'classic_fit',
    labelPl: 'Klasyczny (+5 do +9 cm)',
    recommendedEaseCm: 7,
    rangeDescriptionPl: 'od +5 cm do +9 cm',
    recommendedFor: 'Standardowy sweter damski/męski, raglan, kardigan z guzikami',
  },
  {
    id: 'relaxed_fit',
    labelPl: 'Luźny (+10 do +14 cm)',
    recommendedEaseCm: 12,
    rangeDescriptionPl: 'od +10 cm do +14 cm',
    recommendedFor: 'Wygodne swetry weekendowe, miękkie kimona, pulowery z obniżoną linią ramion',
  },
  {
    id: 'oversize_fit',
    labelPl: 'Oversize (+15 do +24 cm)',
    recommendedEaseCm: 20,
    rangeDescriptionPl: 'od +15 cm do +24 cm',
    recommendedFor: 'Nowoczesne swetry oversize, grube kardigany z wełny czesankowej',
  },
  {
    id: 'boxy_fit',
    labelPl: 'Bardzo luźny / Boxy (≥ +25 cm)',
    recommendedEaseCm: 28,
    rangeDescriptionPl: 'od +25 cm w górę',
    recommendedFor: 'Poncza, kwadratowe swetry boxy, obszerne okrycia wierzchnie',
  },
];

export interface StandardGarmentSize {
  code: string;
  bustMinCm: number;
  bustMaxCm: number;
  typicalBustCm: number;
}

export const STANDARD_ADULT_SIZES: readonly StandardGarmentSize[] = [
  { code: 'XS', bustMinCm: 71, bustMaxCm: 76, typicalBustCm: 73.5 },
  { code: 'S', bustMinCm: 81, bustMaxCm: 86, typicalBustCm: 83.5 },
  { code: 'M', bustMinCm: 91, bustMaxCm: 96, typicalBustCm: 93.5 },
  { code: 'L', bustMinCm: 101, bustMaxCm: 106, typicalBustCm: 103.5 },
  { code: 'XL', bustMinCm: 111, bustMaxCm: 117, typicalBustCm: 114 },
  { code: '2XL', bustMinCm: 122, bustMaxCm: 127, typicalBustCm: 124.5 },
  { code: '3XL', bustMinCm: 132, bustMaxCm: 137, typicalBustCm: 134.5 },
  { code: '4XL', bustMinCm: 142, bustMaxCm: 147, typicalBustCm: 144.5 },
  { code: '5XL', bustMinCm: 152, bustMaxCm: 158, typicalBustCm: 155 },
];

export function getEasePresets(): readonly EasePreset[] {
  return EASE_PRESETS;
}

export function getStandardGarmentSizes(): readonly StandardGarmentSize[] {
  return STANDARD_ADULT_SIZES;
}

export function findStandardSizeByBust(bustCm: number): StandardGarmentSize | null {
  if (bustCm <= 0) return null;
  const match = STANDARD_ADULT_SIZES.find(
    (s) => bustCm >= s.bustMinCm && bustCm <= s.bustMaxCm
  );
  if (match) return match;

  // Znajdź najbliższy standardowy rozmiar, jeśli jest poza przedziałami
  let closest: StandardGarmentSize = STANDARD_ADULT_SIZES[0];
  let minDiff = Math.abs(bustCm - closest.typicalBustCm);

  for (let i = 1; i < STANDARD_ADULT_SIZES.length; i++) {
    const s = STANDARD_ADULT_SIZES[i];
    const diff = Math.abs(bustCm - s.typicalBustCm);
    if (diff < minDiff) {
      minDiff = diff;
      closest = s;
    }
  }

  return closest;
}

export interface DetailedEaseEvaluation {
  easeCm: number;
  category: EaseCategory;
  percentageOfBody: number;
  summaryPl: string;
  isNegative: boolean;
}

export function calculateDetailedEase(
  bodyMeasurementCm: number,
  finishedGarmentCm: number
): DetailedEaseEvaluation {
  if (bodyMeasurementCm <= 0 || finishedGarmentCm <= 0) {
    throw new Error('Wymiary ciała i gotowej dzianiny muszą być większe od 0');
  }

  const evaluation = evaluateGarmentEase(bodyMeasurementCm, finishedGarmentCm);
  const easeCm = Number(evaluation.easeCm.toFixed(1));
  const percentageOfBody = Number(((easeCm / bodyMeasurementCm) * 100).toFixed(1));
  const isNegative = easeCm < 0;

  let summaryPl = '';
  if (easeCm === 0) {
    summaryPl = `Dzianina idealnie zgodna z wymiarami ciała (0 cm luzu).`;
  } else if (easeCm > 0) {
    summaryPl = `Luz dodatni +${easeCm} cm (+${percentageOfBody}% obwodu ciała) — krój ${evaluation.category}.`;
  } else {
    summaryPl = `Luz ujemny ${easeCm} cm (${percentageOfBody}% obwodu ciała) — krój ${evaluation.category}. Dzianina będzie rozciągnięta na sylwetce.`;
  }

  return {
    easeCm,
    category: evaluation.category,
    percentageOfBody,
    summaryPl,
    isNegative,
  };
}

export interface PatternSizeCandidate {
  name: string;
  finishedCircumferenceCm: number;
  resultingEaseCm: number;
  easeDiffFromDesiredCm: number;
  category: EaseCategory;
  isClosest: boolean;
}

export interface SizeRecommendationResult {
  targetGarmentCircumferenceCm: number;
  desiredEaseCm: number;
  recommendedSize: PatternSizeCandidate;
  allCandidates: PatternSizeCandidate[];
  explanationPl: string;
}

export function recommendPatternSize(
  bodyMeasurementCm: number,
  desiredEaseCm: number,
  availablePatternSizes: Array<{ name: string; finishedCircumferenceCm: number }>
): SizeRecommendationResult {
  if (bodyMeasurementCm <= 0) {
    throw new Error('Obwód ciała musi być większy od 0');
  }
  if (!availablePatternSizes || availablePatternSizes.length === 0) {
    throw new Error('Lista rozmiarów we wzorze nie może być pusta');
  }

  const targetCircumference = Number((bodyMeasurementCm + desiredEaseCm).toFixed(1));
  if (targetCircumference <= 0) {
    throw new Error('Docelowy obwód dzianiny musi być większy od 0');
  }

  let minDiff = Infinity;
  let bestIndex = 0;

  const evaluatedCandidates = availablePatternSizes.map((size, index) => {
    if (size.finishedCircumferenceCm <= 0) {
      throw new Error(`Rozmiar ${size.name} ma nieprawidłowy obwód <= 0`);
    }

    const resultingEaseCm = Number(
      (size.finishedCircumferenceCm - bodyMeasurementCm).toFixed(1)
    );
    const easeDiffFromDesiredCm = Number(
      Math.abs(resultingEaseCm - desiredEaseCm).toFixed(1)
    );
    const evalResult = evaluateGarmentEase(
      bodyMeasurementCm,
      size.finishedCircumferenceCm
    );

    if (easeDiffFromDesiredCm < minDiff) {
      minDiff = easeDiffFromDesiredCm;
      bestIndex = index;
    }

    return {
      name: size.name,
      finishedCircumferenceCm: size.finishedCircumferenceCm,
      resultingEaseCm,
      easeDiffFromDesiredCm,
      category: evalResult.category,
      isClosest: false,
    };
  });

  evaluatedCandidates[bestIndex].isClosest = true;
  const recommendedSize = evaluatedCandidates[bestIndex];

  const sign = recommendedSize.resultingEaseCm >= 0 ? '+' : '';
  const explanationPl =
    `Dla obwodu ciała ${bodyMeasurementCm} cm i pożądanego luzu ${desiredEaseCm >= 0 ? '+' : ''}${desiredEaseCm} cm ` +
    `(docelowo: ${targetCircumference} cm), najlepszym rozmiarem jest „${recommendedSize.name}” ` +
    `(${recommendedSize.finishedCircumferenceCm} cm, luz rzeczywisty: ${sign}${recommendedSize.resultingEaseCm} cm, ${recommendedSize.category}).`;

  return {
    targetGarmentCircumferenceCm: targetCircumference,
    desiredEaseCm,
    recommendedSize,
    allCandidates: evaluatedCandidates,
    explanationPl,
  };
}

export interface AdaptedStitchesResult {
  exactStitches: number;
  originalTargetWidthCm: number;
  lowerCandidate: {
    k: number;
    stitches: number;
    resultingWidthCm: number;
    widthDifferenceCm: number;
  };
  upperCandidate: {
    k: number;
    stitches: number;
    resultingWidthCm: number;
    widthDifferenceCm: number;
  };
  chosenCandidate: 'lower' | 'upper';
  recommendedStitches: number;
  recommendedWidthCm: number;
  advicePl: string;
}

export function adaptStitchesWithRecommendation(params: {
  patternStitches: number;
  patternGaugePer10cm: number;
  myGaugePer10cm: number;
  repeatMultiple?: number;
  edgeStitches?: number;
}): AdaptedStitchesResult {
  const {
    patternStitches,
    patternGaugePer10cm,
    myGaugePer10cm,
    repeatMultiple = 1,
    edgeStitches = 0,
  } = params;

  if (patternStitches <= 0 || patternGaugePer10cm <= 0 || myGaugePer10cm <= 0) {
    throw new Error('Parametry oczek i gęstości próbki muszą być większe od 0');
  }

  const rawResult: PatternRecalculationResult = adaptPatternStitches(
    patternStitches,
    patternGaugePer10cm,
    myGaugePer10cm,
    repeatMultiple,
    edgeStitches
  );

  const originalTargetWidthCm = Number(
    ((patternStitches / (patternGaugePer10cm / 10))).toFixed(1)
  );

  const lowerWidth = Number(rawResult.lowerCandidate.resultingWidthCm.toFixed(1));
  const upperWidth = Number(rawResult.upperCandidate.resultingWidthCm.toFixed(1));

  const lowerDiff = Number(Math.abs(lowerWidth - originalTargetWidthCm).toFixed(1));
  const upperDiff = Number(Math.abs(upperWidth - originalTargetWidthCm).toFixed(1));

  const chosenCandidate: 'lower' | 'upper' = lowerDiff <= upperDiff ? 'lower' : 'upper';
  const best = chosenCandidate === 'lower' ? rawResult.lowerCandidate : rawResult.upperCandidate;
  const bestWidth = chosenCandidate === 'lower' ? lowerWidth : upperWidth;
  const bestDiff = chosenCandidate === 'lower' ? lowerDiff : upperDiff;

  const repeatInfo =
    repeatMultiple > 1
      ? ` (${best.k} powtórzeń raportu po ${repeatMultiple} o.${edgeStitches > 0 ? ` + ${edgeStitches} o. brzegowe` : ''})`
      : '';

  const advicePl =
    `Zalecany wariant: ${best.stitches} o.${repeatInfo}. ` +
    `Szerokość wyniesie ${bestWidth} cm (różnica ${bestDiff} cm względem zamierzonego ${originalTargetWidthCm} cm).`;

  return {
    exactStitches: Number(rawResult.exactStitches.toFixed(2)),
    originalTargetWidthCm,
    lowerCandidate: {
      k: rawResult.lowerCandidate.k,
      stitches: rawResult.lowerCandidate.stitches,
      resultingWidthCm: lowerWidth,
      widthDifferenceCm: lowerDiff,
    },
    upperCandidate: {
      k: rawResult.upperCandidate.k,
      stitches: rawResult.upperCandidate.stitches,
      resultingWidthCm: upperWidth,
      widthDifferenceCm: upperDiff,
    },
    chosenCandidate,
    recommendedStitches: best.stitches,
    recommendedWidthCm: bestWidth,
    advicePl,
  };
}
