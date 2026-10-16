/**
 * Oczko Core — Kalkulator Konstrukcji Karczku Raglanowego i Rzędów Skróconych Dekoltu
 * Pure domain service (Zero React / React Native imports).
 * 100% deterministyczny algorytm konstrukcji swetra od góry (Top-Down Raglan):
 * 1. Proporcjonalny podział oczek dekoltu (tył, przód, rękawy, 4 linie raglanowe)
 * 2. Kompensacja rzędów skróconych (German Short Rows / GSR) zapobiegająca asymetrii
 * 3. Planowanie pogłębienia dekoltu i punktów zwrotnych (turn points)
 * 4. Planowanie przyrostów karczku, głębokości i oczek podkroju pach (underarm cast-on)
 */

export interface RaglanCastOnParams {
  totalCastOnStitches: number;
  raglanLineStitches?: number; // domyślnie 2 o. na każdą z 4 linii (łącznie 8 o.)
  shortRowTurnsPerSide?: number; // liczba punktów obrotu rzędów skróconych (domyślnie 4)
  sleeveRatio?: number; // proporcja na pojedynczy rękaw (domyślnie ~0.166, czyli 1/6)
}

export interface RaglanCastOnDivision {
  totalCastOnStitches: number;
  raglanLineStitches: number;
  totalRaglanStitches: number;
  availableBodyStitches: number;
  initialBackStitches: number;
  initialFrontStitches: number;
  initialSleeveStitches: number;
  finalBackAfterShortRows: number;
  finalFrontAfterShortRows: number;
  shortRowTurnsPerSide: number;
  isBalancedAfterShortRows: boolean;
  divisionFormulaPl: string;
}

export interface ShortRowTurnPoint {
  index: number;
  section: 'left_sleeve' | 'right_sleeve' | 'front_neckline';
  stitchesPastMarker: number;
  descriptionPl: string;
}

export interface ShortRowsPlan {
  neckRiseCm: number;
  rowGaugePer10cm: number;
  totalShortRows: number;
  turnsPerSide: number;
  turnPoints: ShortRowTurnPoint[];
  instructionStepsPl: string[];
}

export interface RaglanYokeParams {
  stitchGaugePer10cm: number;
  rowGaugePer10cm: number;
  desiredChestCircumferenceCm: number;
  desiredSleeveCircumferenceCm: number;
  yokeDepthCm: number;
  initialBackStitches: number;
  initialFrontStitches: number;
  initialSleeveStitches: number;
  raglanLineStitches?: number;
  underarmCastOnStitches?: number; // oczka dobierane pod pachą (domyślnie np. 8 o.)
}

export interface RaglanYokeResult {
  totalYokeRounds: number;
  increaseRounds: number;
  plainRounds: number;
  increasesPerRaglanLine: number;
  bodyStitchesBeforeSplit: number; // przód + tył + oczka raglanowe
  sleeveStitchesBeforeSplit: number; // pojedynczy rękaw + oczka raglanowe
  underarmCastOnStitches: number;
  finalBodyStitches: number; // łącznie z podkrojem pach
  finalSleeveStitches: number; // łącznie z podkrojem pach
  resultingChestCircumferenceCm: number;
  resultingSleeveCircumferenceCm: number;
  chestDifferenceCm: number;
  sleeveDifferenceCm: number;
  summaryPl: string;
}

export class RaglanCalculator {
  /**
   * Oblicza podział oczek dekoltu na druty z automatyczną kompensacją rzędów skróconych.
   */
  public static calculateCastOnDivision(params: RaglanCastOnParams): RaglanCastOnDivision {
    const {
      totalCastOnStitches,
      raglanLineStitches = 2,
      shortRowTurnsPerSide = 4,
      sleeveRatio = 1 / 6,
    } = params;

    if (totalCastOnStitches <= 0) {
      throw new Error('Liczba oczek nabieranych musi być większa od 0');
    }
    if (raglanLineStitches < 0) {
      throw new Error('Liczba oczek linii raglanowej nie może być ujemna');
    }
    if (shortRowTurnsPerSide < 0) {
      throw new Error('Liczba obrotów rzędów skróconych nie może być ujemna');
    }
    if (sleeveRatio <= 0 || sleeveRatio >= 0.4) {
      throw new Error('Proporcja rękawa musi mieścić się w przedziale (0, 0.4)');
    }

    const totalRaglanStitches = raglanLineStitches * 4;
    const available = totalCastOnStitches - totalRaglanStitches;

    if (available < 8) {
      throw new Error(
        `Zbyt mało oczek na podział korpusu i rękawów (${available} o. dostępnych po odjęciu linii raglanu)`
      );
    }

    // Wyznacz bazową liczbę oczek na rękawy
    let rawSleeve = Math.round(available * sleeveRatio);
    if (rawSleeve < 2) rawSleeve = 2;

    const remainingForBody = available - 2 * rawSleeve;
    let baseBack = Math.floor(remainingForBody / 2);
    let baseFront = remainingForBody - baseBack;

    // Kompensacja rzędów skróconych (German Short Rows):
    // Każdy nawrót na rękawie dodaje 1 przyrost raglanowy na tył i 0 na przód.
    // Aby po zakończeniu rzędów skróconych tył i przód miały równą liczbę oczek,
    // odejmujemy punkty obrotu od tyłu i dodajemy do przodu.
    let initialBack = baseBack - shortRowTurnsPerSide;
    let initialFront = baseFront + shortRowTurnsPerSide;

    // Zabezpieczenie przed ujemnym tyłem przy bardzo głębokim wycięciu
    if (initialBack < 4) {
      const shift = 4 - initialBack;
      initialBack = 4;
      initialFront = initialFront - shift;
    }

    const finalBackAfterShortRows = initialBack + 2 * shortRowTurnsPerSide;
    const finalFrontAfterShortRows = initialFront;
    const isBalancedAfterShortRows = Math.abs(finalBackAfterShortRows - finalFrontAfterShortRows) <= 1;

    const divisionFormulaPl =
      `Tył: ${initialBack} o., Przód: ${initialFront} o., ` +
      `Rękawy: 2 × ${rawSleeve} o., Linie raglanu: 4 × ${raglanLineStitches} o. ` +
      `(Kompensacja ${shortRowTurnsPerSide} obrotów GSR -> po wyprofilowaniu tył: ${finalBackAfterShortRows} o., przód: ${finalFrontAfterShortRows} o.)`;

    return {
      totalCastOnStitches,
      raglanLineStitches,
      totalRaglanStitches,
      availableBodyStitches: available,
      initialBackStitches: initialBack,
      initialFrontStitches: initialFront,
      initialSleeveStitches: rawSleeve,
      finalBackAfterShortRows,
      finalFrontAfterShortRows,
      shortRowTurnsPerSide,
      isBalancedAfterShortRows,
      divisionFormulaPl,
    };
  }

  /**
   * Planuje punkty zwrotne rzędów skróconych (German Short Rows) dla podniesienia tyłu dekoltu.
   */
  public static calculateGermanShortRows(params: {
    neckRiseCm: number;
    rowGaugePer10cm: number;
    sleeveStitches: number;
    frontStitches: number;
  }): ShortRowsPlan {
    const { neckRiseCm, rowGaugePer10cm, sleeveStitches, frontStitches } = params;

    if (neckRiseCm <= 0 || rowGaugePer10cm <= 0) {
      throw new Error('Podniesienie tyłu i gęstość rzędów muszą być większe od 0');
    }
    if (sleeveStitches <= 0 || frontStitches <= 0) {
      throw new Error('Liczba oczek rękawa i przodu musi być większa od 0');
    }

    const rowsPerCm = rowGaugePer10cm / 10;
    // Rzędy skrócone wykonuje się parami (1 rząd prawy + 1 rząd lewy na cykl)
    let totalRows = Math.round(neckRiseCm * rowsPerCm);
    if (totalRows % 2 !== 0) totalRows += 1;
    if (totalRows < 2) totalRows = 2;

    const turnsPerSide = totalRows / 2;

    // Rozmieszczenie punktów zwrotnych:
    // Zazwyczaj 2-3 obroty na rękawie, a pozostałe przy dekolcie przodu
    const turnPoints: ShortRowTurnPoint[] = [];
    const sleeveTurns = Math.min(turnsPerSide, Math.max(1, Math.floor(turnsPerSide * 0.75)));
    const frontTurns = turnsPerSide - sleeveTurns;

    const sleeveStep = Math.max(1, Math.floor(sleeveStitches / (sleeveTurns + 1)));
    const frontStep = frontTurns > 0 ? Math.max(1, Math.floor((frontStitches * 0.3) / frontTurns)) : 0;

    // Punkty zwrotne rękawa
    for (let i = 1; i <= sleeveTurns; i++) {
      turnPoints.push({
        index: i,
        section: 'left_sleeve',
        stitchesPastMarker: i * sleeveStep,
        descriptionPl: `Obrót ${i}: ${i * sleeveStep} o. za markerem raglanu na lewym rękawie`,
      });
    }

    // Punkty zwrotne przodu (łagodne podkrojenie)
    for (let i = 1; i <= frontTurns; i++) {
      turnPoints.push({
        index: sleeveTurns + i,
        section: 'front_neckline',
        stitchesPastMarker: i * frontStep,
        descriptionPl: `Obrót ${sleeveTurns + i}: ${i * frontStep} o. w głąb dekoltu przodu`,
      });
    }

    const instructionStepsPl: string[] = [
      `1. Nabierz oczka i oznacz 4 linie raglanowe markerami (PM).`,
      `2. Rząd 1 (RS): Przerób oczka tyłu, dodaj o. raglanowe, przerób lewy rękaw do ${sleeveStep} o., obróć robótkę.`,
      `3. Rząd 2 (WS): Utwórz oczko podwójne (German Double Stitch - DS), przerób lewy rękaw, tył i prawy rękaw do ${sleeveStep} o., obróć robótkę.`,
      `4. Kontynuuj włączając kolejne punkty zwrotne co ${sleeveStep} o. aż do wykonania ${turnsPerSide} obrotów z każdej strony.`,
      `5. Po zakończeniu rzędów skróconych połącz robótkę w okrążenie na środku przodu.`,
    ];

    return {
      neckRiseCm,
      rowGaugePer10cm,
      totalShortRows: totalRows,
      turnsPerSide,
      turnPoints,
      instructionStepsPl,
    };
  }

  /**
   * Wylicza liczbę rzędów karczku, częstotliwość przyrostów oraz parametry oddzielenia rękawów od korpusu.
   */
  public static calculateYokeIncreases(params: RaglanYokeParams): RaglanYokeResult {
    const {
      stitchGaugePer10cm,
      rowGaugePer10cm,
      desiredChestCircumferenceCm,
      desiredSleeveCircumferenceCm,
      yokeDepthCm,
      initialBackStitches,
      initialFrontStitches,
      initialSleeveStitches,
      raglanLineStitches = 2,
      underarmCastOnStitches = 8,
    } = params;

    if (stitchGaugePer10cm <= 0 || rowGaugePer10cm <= 0) {
      throw new Error('Gęstość próbki musi być większa od 0');
    }
    if (desiredChestCircumferenceCm <= 0 || desiredSleeveCircumferenceCm <= 0 || yokeDepthCm <= 0) {
      throw new Error('Docelowe wymiary i głębokość karczku muszą być większe od 0');
    }

    const stitchesPerCm = stitchGaugePer10cm / 10;
    const rowsPerCm = rowGaugePer10cm / 10;

    const totalYokeRounds = Math.round(yokeDepthCm * rowsPerCm);

    // Standardowo w raglanie przyrosty wykonuje się co 2. okrążenie (co drugi rząd)
    const increasesPerRaglanLine = Math.floor(totalYokeRounds / 2);
    const increaseRounds = increasesPerRaglanLine;
    const plainRounds = totalYokeRounds - increaseRounds;

    // Przyrosty dodają po 2 oczka na element (1 przyrost z każdej strony elementu w rzędzie dodawania)
    const addedToBodyPart = increasesPerRaglanLine * 2;
    const addedToSleeve = increasesPerRaglanLine * 2;

    // Połowa oczek linii raglanu trafia zazwyczaj do korpusu, połowa do rękawów (lub całość do korpusu)
    const raglanToBody = raglanLineStitches * 2; // 2 linie raglanu na przód i 2 na tył
    const raglanToSleeve = raglanLineStitches * 2;

    const backBeforeSplit = initialBackStitches + addedToBodyPart + raglanToBody;
    const frontBeforeSplit = initialFrontStitches + addedToBodyPart + raglanToBody;
    const bodyStitchesBeforeSplit = backBeforeSplit + frontBeforeSplit;

    const sleeveStitchesBeforeSplit = initialSleeveStitches + addedToSleeve + raglanToSleeve;

    // Dodanie oczek podkrojów pach (2 pachy dla korpusu = 2 * underarm)
    const finalBodyStitches = bodyStitchesBeforeSplit + 2 * underarmCastOnStitches;
    const finalSleeveStitches = sleeveStitchesBeforeSplit + underarmCastOnStitches;

    const resultingChestCircumferenceCm = Number((finalBodyStitches / stitchesPerCm).toFixed(1));
    const resultingSleeveCircumferenceCm = Number((finalSleeveStitches / stitchesPerCm).toFixed(1));

    const chestDifferenceCm = Number(
      (resultingChestCircumferenceCm - desiredChestCircumferenceCm).toFixed(1)
    );
    const sleeveDifferenceCm = Number(
      (resultingSleeveCircumferenceCm - desiredSleeveCircumferenceCm).toFixed(1)
    );

    const summaryPl =
      `Głębokość karczku: ${totalYokeRounds} rzędów (${increasesPerRaglanLine} rzędów z przyrostami co 2. okrążenie). ` +
      `Przed oddzieleniem: korpus ${bodyStitchesBeforeSplit} o., rękaw ${sleeveStitchesBeforeSplit} o. ` +
      `Po dodaniu podkrojów pach (${underarmCastOnStitches} o.): obwód klatki ${resultingChestCircumferenceCm} cm (${chestDifferenceCm >= 0 ? '+' : ''}${chestDifferenceCm} cm), ` +
      `obwód rękawa ${resultingSleeveCircumferenceCm} cm (${sleeveDifferenceCm >= 0 ? '+' : ''}${sleeveDifferenceCm} cm).`;

    return {
      totalYokeRounds,
      increaseRounds,
      plainRounds,
      increasesPerRaglanLine,
      bodyStitchesBeforeSplit,
      sleeveStitchesBeforeSplit,
      underarmCastOnStitches,
      finalBodyStitches,
      finalSleeveStitches,
      resultingChestCircumferenceCm,
      resultingSleeveCircumferenceCm,
      chestDifferenceCm,
      sleeveDifferenceCm,
      summaryPl,
    };
  }
}
