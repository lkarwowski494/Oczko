/**
 * Hat Crown Shaping & Geometry Calculator (Czysta matematyka dziewiarska bez AI - ZP-05).
 * Obliczenia geometrii czapek, negatywnego luzu (negative ease), doboru oczek
 * oraz rozpiski rzędów zmniejszania korony (Crown Shaping & Decrease Rounds).
 */

export interface HatSizeStandard {
  id: string;
  name: string;
  headCircumferenceCm: number;
  recommendedTotalHeightCm: number;
}

export const HAT_STANDARD_SIZES: HatSizeStandard[] = [
  { id: 'baby', name: 'Niemowlę (Baby)', headCircumferenceCm: 35, recommendedTotalHeightCm: 15 },
  { id: 'toddler', name: 'Maluch (1-3 lata)', headCircumferenceCm: 44, recommendedTotalHeightCm: 18 },
  { id: 'child', name: 'Dziecko (4-10 lat)', headCircumferenceCm: 50, recommendedTotalHeightCm: 20 },
  { id: 'adult_s', name: 'Dorosły S / Młodzież (53-55 cm)', headCircumferenceCm: 54, recommendedTotalHeightCm: 21 },
  { id: 'adult_m', name: 'Dorosły M (Standard 56-58 cm)', headCircumferenceCm: 57, recommendedTotalHeightCm: 22.5 },
  { id: 'adult_l', name: 'Dorosły L (59-62 cm)', headCircumferenceCm: 60, recommendedTotalHeightCm: 24 },
];

export type HatBrimStyle = 'single' | 'folded';
export type HatFitStyle = 'beanie' | 'slouchy';
export type CrownDecreaseWedges = 4 | 6 | 8;

export interface HatCalculatorInput {
  headCircumferenceCm: number;
  negativeEaseCm?: number; // Domyślnie 5 cm (10-12% elastyczności ściągacza)
  gaugeStitchesPer10Cm: number;
  gaugeRowsPer10Cm: number;
  brimStyle: HatBrimStyle;
  brimHeightCm: number;
  fitStyle: HatFitStyle;
  slouchExtraCm?: number; // Dodatkowa głębokość dla stylu slouchy (np. 4 cm)
  wedges: CrownDecreaseWedges;
  targetRemainingStitches?: number; // Domyślnie równe liczbie klinów (np. 6 lub 8)
  ribbingMultiple?: number; // Np. 2 dla ściągacza 1x1, 4 dla ściągacza 2x2
}

export interface CrownRoundInstruction {
  roundNumber: number;
  isDecreaseRound: boolean;
  stitchesBetweenDecreases: number;
  totalStitchesAfter: number;
  description: string;
}

export interface HatCalculatorResult {
  targetCircumferenceCm: number;
  negativeEaseCm: number;
  castOnStitches: number;
  totalHeightCm: number;
  brimHeightCm: number;
  brimRows: number;
  bodyHeightCm: number;
  bodyRows: number;
  crownHeightCm: number;
  crownRoundsCount: number;
  wedges: CrownDecreaseWedges;
  finalRemainingStitches: number;
  rounds: CrownRoundInstruction[];
  summaryText: string;
}

/**
 * Główny kalkulator konstrukcji i zmniejszania czapki.
 */
export function calculateHatCrown(input: HatCalculatorInput): HatCalculatorResult {
  const headCirc = Math.max(20, Math.min(80, input.headCircumferenceCm || 56));
  const ease = Math.max(0, Math.min(15, input.negativeEaseCm !== undefined ? input.negativeEaseCm : 5));
  const stGauge = Math.max(1, input.gaugeStitchesPer10Cm || 22);
  const rowGauge = Math.max(1, input.gaugeRowsPer10Cm || 30);
  const wedges = input.wedges === 4 || input.wedges === 8 ? input.wedges : 6;
  const ribMultiple = input.ribbingMultiple && input.ribbingMultiple > 1 ? input.ribbingMultiple : wedges;

  // 1. Obwód roboczy po odjęciu luzu ujemnego
  const targetCirc = Math.max(15, headCirc - ease);
  const rawStitches = (targetCirc * stGauge) / 10;

  // 2. Wyrównanie oczek do wspólnego wielokrotności klinów i ściągacza (lub klinów)
  // Szukamy liczby podzielnej przez wedges, najbliższej rawStitches
  let castOn = Math.round(rawStitches / wedges) * wedges;
  if (ribMultiple % wedges !== 0 && wedges % ribMultiple !== 0) {
    // Jeżeli ściągacz ma inną wielokrotność, np. rib=4, wedges=6 -> NWW(4, 6) = 12
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const lcm = (ribMultiple * wedges) / gcd(ribMultiple, wedges);
    castOn = Math.round(rawStitches / lcm) * lcm;
  }
  // Minimalna bezpieczna liczba oczek na start korony
  castOn = Math.max(wedges * 4, castOn);

  // 3. Wysokości i rzędy
  // Szukamy wzorca rozmiaru lub estymujemy proporcję CYC
  let baseHeight = 22.5;
  const matched = HAT_STANDARD_SIZES.find((s) => Math.abs(s.headCircumferenceCm - headCirc) <= 3);
  if (matched) {
    baseHeight = matched.recommendedTotalHeightCm;
  } else {
    baseHeight = (headCirc * 0.4);
  }

  const brimHeight = Math.max(2, input.brimHeightCm || (input.brimStyle === 'folded' ? 10 : 5));
  const slouch = input.fitStyle === 'slouchy' ? Math.max(2, input.slouchExtraCm || 5) : 0;
  const totalHatHeight = baseHeight + slouch + (input.brimStyle === 'folded' ? brimHeight / 2 : 0);

  // 4. Kalkulacja rzędów korony (Crown Rounds)
  // W każdym okrążeniu zmniejszania odejmujemy 'wedges' oczek.
  // Standardowo: zmniejszamy co 2. rząd, a gdy między zmniejszeniami zostaje 1 lub 0 oczek -> co 1. rząd.
  const rawTargetRemaining = input.targetRemainingStitches ?? wedges;
  const targetRemaining = Math.max(
    wedges,
    Math.min(castOn - wedges, Math.round(rawTargetRemaining / wedges) * wedges)
  );

  const rounds: CrownRoundInstruction[] = [];
  let currentStitches = castOn;
  let stitchesBetween = Math.floor(currentStitches / wedges) - 2;
  let roundIdx = 1;

  while (currentStitches > targetRemaining && stitchesBetween >= 0) {
    // Rząd ze zmniejszeniami
    currentStitches -= wedges;
    const desc = stitchesBetween > 0
      ? `*k${stitchesBetween}, k2tog* powtórz ${wedges} razy (${currentStitches} o.)`
      : `*k2tog* powtórz ${wedges} razy (${currentStitches} o.)`;

    rounds.push({
      roundNumber: roundIdx++,
      isDecreaseRound: true,
      stitchesBetweenDecreases: stitchesBetween,
      totalStitchesAfter: currentStitches,
      description: desc,
    });

    // Czy robimy rząd gładki (co 2. rząd)?
    // Robimy rząd gładki, dopóki stitchesBetween >= 2 oraz nie osiągnęliśmy celu
    if (stitchesBetween >= 2 && currentStitches > targetRemaining) {
      rounds.push({
        roundNumber: roundIdx++,
        isDecreaseRound: false,
        stitchesBetweenDecreases: stitchesBetween,
        totalStitchesAfter: currentStitches,
        description: `Oczka prawe bez zmniejszeń (${currentStitches} o.)`,
      });
    }

    stitchesBetween--;
  }

  const crownRoundsCount = rounds.length;
  const crownHeightCm = Math.round(((crownRoundsCount * 10) / rowGauge) * 10) / 10;
  const brimRows = Math.round((brimHeight * rowGauge) / 10);
  const totalRows = Math.round((totalHatHeight * rowGauge) / 10);
  const bodyRows = Math.max(0, totalRows - brimRows - crownRoundsCount);
  const bodyHeightCm = Math.max(0, Math.round(((bodyRows * 10) / rowGauge) * 10) / 10);

  const summary = `Czapka: nabierz ${castOn} o. (obwód ${targetCirc.toFixed(1)} cm z luzem -${ease} cm). ` +
    `Ściągacz: ${brimHeight} cm (${brimRows} rz.), Korpus: ${bodyHeightCm} cm (${bodyRows} rz.), ` +
    `Korona: ${crownRoundsCount} okrążeń w ${wedges} klinach, pozostaje ${currentStitches} o. do ściągnięcia igłą.`;

  return {
    targetCircumferenceCm: Math.round(targetCirc * 10) / 10,
    negativeEaseCm: ease,
    castOnStitches: castOn,
    totalHeightCm: Math.round(totalHatHeight * 10) / 10,
    brimHeightCm: brimHeight,
    brimRows,
    bodyHeightCm,
    bodyRows,
    crownHeightCm,
    crownRoundsCount,
    wedges,
    finalRemainingStitches: currentStitches,
    rounds,
    summaryText: summary,
  };
}
