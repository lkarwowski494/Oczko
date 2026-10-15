import {
  inchesToCm,
  cmToInches,
  yardsToMeters,
  metersToYards,
  ouncesToGrams,
  yardsPer100gToMetersPer100g,
  calculateFromGauge,
  adaptPatternStitches,
  distributeShapingInRow,
  distributeShapingOverRows,
  generateRowSchedule,
  calculateYarnFromSwatch,
  calculateYarnSubstitution,
  getYarnWeightCategoriesByKnitGauge4in,
  getYarnWeightCategoriesByWpi,
  usNeedleToMm,
  evaluateGarmentEase,
} from '../domain-rules';

describe('Oczko Core — Wektory testowe BRD C4a (T1…T19 oraz W-00…W-09)', () => {
  test('W-00.1 (RD-00): brak zaokrąglania pośredniego — 10 g / 30,2 in² * 36 in² = 11,92 g', () => {
    const res = calculateYarnFromSwatch({
      swatchArea: 30.2,
      swatchWeightGrams: 10,
      projectArea: 36,
    });
    expect(res.exactGrams).toBeCloseTo(11.9205, 4);
    expect(Number(res.exactGrams.toFixed(2))).toBe(11.92);
  });

  test('T13 & W-01.1–3 (RD-01): przeliczanie jednostek cal, jard i różnica 4 in vs 10 cm', () => {
    expect(yardsPer100gToMetersPer100g(220)).toBeCloseTo(201.168, 6);
    expect(inchesToCm(4)).toBeCloseTo(10.16, 6);
    expect(yardsToMeters(200)).toBeCloseTo(182.88, 6);
    const from4in = calculateFromGauge({ count: 22, length: 4, unit: 'in' }, 100, 'cm');
    const from10cm = calculateFromGauge({ count: 22, length: 10, unit: 'cm' }, 100, 'cm');
    expect(from4in.exact).toBeCloseTo(216.5354, 4);
    expect(from10cm.exact).toBe(220);
  });

  test('T1, T2, T3, T4 (RD-02): próbka splotu i przeliczenie wzoru z wielokrotnością raportu', () => {
    const t1 = calculateFromGauge({ count: 22, length: 10, unit: 'cm' }, 50, 'cm');
    expect(t1.exact).toBe(110);

    const t2 = calculateFromGauge({ count: 22, length: 4, unit: 'in' }, 100, 'cm');
    expect(t2.exact).toBeCloseTo(216.535433, 5);
    expect(t2.floor).toBe(216);
    expect(t2.ceil).toBe(217);

    const t3 = calculateFromGauge({ count: 17, length: 7.5, unit: 'cm' }, 10, 'cm');
    expect(t3.densityPer10cm).toBeCloseTo(22.666667, 5);

    const t4 = adaptPatternStitches(120, 22, 20, 4, 0);
    expect(t4.exactStitches).toBeCloseTo(109.090909, 5);
    expect(t4.lowerCandidate.stitches).toBe(108);
    expect(t4.lowerCandidate.resultingWidthCm).toBeCloseTo(54.0, 5);
    expect(t4.upperCandidate.stitches).toBe(112);
    expect(t4.upperCandidate.resultingWidthCm).toBeCloseTo(56.0, 5);
  });

  test('T5, T6, T7, T19 (RD-03b, RD-07d): rozkład na wysokości (Paden) i harmonogram rzędów', () => {
    const t5 = distributeShapingOverRows(50, 18, false);
    expect(t5.shorterCount).toBe(4);
    expect(t5.shorterInterval).toBe(2);
    expect(t5.longerCount).toBe(14);
    expect(t5.longerInterval).toBe(3);

    const t6 = distributeShapingOverRows(50, 18, true);
    expect(t6.shorterCount).toBe(11);
    expect(t6.shorterInterval).toBe(2);
    expect(t6.longerCount).toBe(7);
    expect(t6.longerInterval).toBe(4);

    const t7 = generateRowSchedule({ firstRow: 6, step: 6, totalEvents: 8 });
    expect(t7).toEqual([6, 12, 18, 24, 30, 36, 42, 48]);

    const t19 = generateRowSchedule({ firstRow: 14, step: 6, moreTimes: 6 });
    expect(t19).toEqual([14, 20, 26, 32, 38, 44, 50]);
    expect(t19).toHaveLength(7);
  });

  test('T8, T9, T10, W-03a.1 (RD-03a): równomierne rozłożenie w rzędzie/okrążeniu', () => {
    const t8 = distributeShapingInRow(52, 6, 'm1_yo', 'round');
    expect(t8.gaps).toEqual([9, 9, 9, 9, 8, 8]);
    expect(t8.finalStitches).toBe(58);

    const t9 = distributeShapingInRow(74, 30, 'k2tog', 'flat');
    expect(t9.P).toBe(14);
    expect(t9.g).toBe(31);
    expect(t9.q).toBe(0);
    expect(t9.r).toBe(14);
    expect(t9.finalStitches).toBe(44);

    expect(() => distributeShapingInRow(20, 11, 'k2tog', 'flat')).toThrow('Niewykonalne: P = -2');

    const w03a1 = distributeShapingInRow(52, 6, 'm1_yo', 'flat');
    expect(w03a1.largerGapCount).toBe(3);
    expect(w03a1.largerGapSize).toBe(8);
    expect(w03a1.smallerGapCount).toBe(4);
    expect(w03a1.smallerGapSize).toBe(7);
  });

  test('T11, T12, W-05.1 (RD-04, RD-05): zapotrzebowanie i zamiana włóczki', () => {
    const t11 = calculateYarnFromSwatch({
      swatchArea: 225,
      swatchWeightGrams: 9,
      projectArea: 8000,
      metersPer100g: 200,
      ballWeightGrams: 50,
    });
    expect(t11.exactGrams).toBe(320);
    expect(t11.exactMeters).toBe(640);
    expect(t11.ballsNeeded).toBe(7);

    const t12 = calculateYarnSubstitution({
      patternBalls: 6,
      patternBallLength: 125,
      newBallLength: 90,
    });
    expect(t12.ballsNeeded).toBe(9);

    const w05_1 = calculateYarnSubstitution({
      patternBalls: 6,
      patternBallLength: 125,
      newBallLength: 90,
      safetyMarginRatio: 0.1,
    });
    expect(w05_1.ballsNeeded).toBe(10);
  });

  test('T14, T15, W-06a.1–2 (RD-06a, RD-06b, RD-06c): WPI, kategorie CYC i druty US -> mm', () => {
    expect(getYarnWeightCategoriesByKnitGauge4in(23)).toEqual([2, 3]);
    expect(getYarnWeightCategoriesByKnitGauge4in(16)).toEqual([4]);
    expect(getYarnWeightCategoriesByWpi(12)).toEqual([2, 3, 4]);
    expect(usNeedleToMm(6)).toEqual([4.0, 4.25]);
  });

  test('T16 & W-09.1 (RD-09): luz krawiecki (ease) i kategorie dopasowania', () => {
    const t16 = evaluateGarmentEase(92, 96);
    expect(t16.easeCm).toBe(4);
    expect(t16.category).toBe('między zerowym a klasycznym');

    // Pełne pokrycie wszystkich 10 gałęzi kategorii luzu
    expect(evaluateGarmentEase(100, 88).category).toBe('poniżej skali (mniej niż -10 cm)');
    expect(evaluateGarmentEase(100, 92).category).toBe('bardzo dopasowany');
    expect(evaluateGarmentEase(100, 97).category).toBe('pomiędzy (dopasowany–bardzo dopasowany)');
    expect(evaluateGarmentEase(100, 100).category).toBe('dopasowany');
    expect(evaluateGarmentEase(100, 103).category).toBe('między zerowym a klasycznym');
    expect(evaluateGarmentEase(100, 108).category).toBe('klasyczny');
    expect(evaluateGarmentEase(100, 110).category).toBe('klasyczny / luźny');
    expect(evaluateGarmentEase(100, 113).category).toBe('luźny');
    expect(evaluateGarmentEase(100, 115).category).toBe('luźny / oversize');
    expect(evaluateGarmentEase(100, 120).category).toBe('oversize');

    expect(() => evaluateGarmentEase(0, 100)).toThrow('Wymiary ciała i ubrania muszą być większe od 0');
    expect(() => evaluateGarmentEase(100, 0)).toThrow('Wymiary ciała i ubrania muszą być większe od 0');
  });

  test('Walidacje i konwersje jednostek — wyjątki i metody pomocnicze', () => {
    expect(cmToInches(10)).toBeCloseTo(3.937, 3);
    expect(metersToYards(100)).toBeCloseTo(109.361, 3);
    expect(ouncesToGrams(3.5)).toBeCloseTo(99.223, 3);

    expect(() => inchesToCm(0)).toThrow('Długość musi być większa od 0');
    expect(() => cmToInches(-5)).toThrow('Długość musi być większa od 0');
    expect(() => yardsToMeters(0)).toThrow('Długość musi być większa od 0');
    expect(() => metersToYards(-2)).toThrow('Długość musi być większa od 0');
    expect(() => ouncesToGrams(0)).toThrow('Waga musi być większa od 0');
    expect(() => yardsPer100gToMetersPer100g(0)).toThrow('Metraż musi być większy od 0');
  });

  test('calculateFromGauge — skrajne i błędne przypadki', () => {
    expect(() => calculateFromGauge({ count: 0, length: 10, unit: 'cm' }, 50)).toThrow('Wartości próbki muszą być większe od 0');
    expect(() => calculateFromGauge({ count: 20, length: 0, unit: 'cm' }, 50)).toThrow('Wartości próbki muszą być większe od 0');
    expect(() => calculateFromGauge({ count: 20, length: 10, unit: 'cm' }, -10)).toThrow('Wymiar docelowy nie może być ujemny');
    
    const zeroResult = calculateFromGauge({ count: 20, length: 10, unit: 'cm' }, 0);
    expect(zeroResult.exact).toBe(0);
    expect(zeroResult.rounded).toBe(0);
    expect(zeroResult.densityPerUnit).toBe(2);

    const inchTarget = calculateFromGauge({ count: 20, length: 10, unit: 'cm' }, 4, 'in');
    expect(inchTarget.exact).toBeCloseTo(20.32, 2);
  });

  test('adaptPatternStitches — walidacja błędów i oczka brzegowe', () => {
    expect(() => adaptPatternStitches(0, 20, 22)).toThrow('Liczba oczek i gęstości muszą być większe od 0');
    expect(() => adaptPatternStitches(100, 0, 22)).toThrow('Liczba oczek i gęstości muszą być większe od 0');
    expect(() => adaptPatternStitches(100, 20, 0)).toThrow('Liczba oczek i gęstości muszą być większe od 0');
    expect(() => adaptPatternStitches(100, 20, 22, 0, 2)).toThrow('Nieprawidłowe parametry raportu wzoru');
    expect(() => adaptPatternStitches(100, 20, 22, 4, -1)).toThrow('Nieprawidłowe parametry raportu wzoru');
    expect(() => adaptPatternStitches(10, 20, 2, 4, 100)).toThrow('Wynik mniejszy niż liczba oczek brzegowych');
  });

  test('distributeShapingInRow — metoda kfb, zerowa zmiana i błędy', () => {
    expect(() => distributeShapingInRow(0, 5, 'k2tog', 'flat')).toThrow('Nieprawidłowa liczba oczek lub zmian');
    expect(() => distributeShapingInRow(50, -1, 'k2tog', 'flat')).toThrow('Nieprawidłowa liczba oczek lub zmian');

    // Zerowa zmiana (changeCount === 0)
    const zeroChange = distributeShapingInRow(40, 0, 'k2tog', 'flat');
    expect(zeroChange.finalStitches).toBe(40);
    expect(zeroChange.gaps).toEqual([40]);

    // Metoda kfb
    const kfbRound = distributeShapingInRow(50, 5, 'kfb', 'round');
    expect(kfbRound.P).toBe(45);
    expect(kfbRound.finalStitches).toBe(55);
  });

  test('distributeShapingOverRows — zdarzenia zerowe, nadmiarowe i błędy', () => {
    expect(() => distributeShapingOverRows(0, 5)).toThrow('Liczba rzędów i zdarzeń musi być dodatnia');
    expect(() => distributeShapingOverRows(50, -1)).toThrow('Liczba rzędów i zdarzeń musi być dodatnia');

    const zeroEvents = distributeShapingOverRows(50, 0);
    expect(zeroEvents.totalRowsCovered).toBe(0);

    expect(() => distributeShapingOverRows(10, 15)).toThrow('Liczba zdarzeń przekracza liczbę dostępnych rzędów');
    expect(() => distributeShapingOverRows(10, 6, true)).toThrow('Liczba zdarzeń przekracza liczbę dostępnych rzędów');
  });

  test('generateRowSchedule — obsługa parametrów zerowych i błędów', () => {
    expect(() => generateRowSchedule({ firstRow: 0, step: 2 })).toThrow('Pierwszy rząd i krok muszą być większe od 0');
    expect(() => generateRowSchedule({ firstRow: 4, step: 0 })).toThrow('Pierwszy rząd i krok muszą być większe od 0');
    expect(generateRowSchedule({ firstRow: 4, step: 2, totalEvents: 0 })).toEqual([]);
    expect(generateRowSchedule({ firstRow: 4, step: 2 })).toEqual([]);
  });

  test('calculateYarnFromSwatch & calculateYarnSubstitution — błędy i wąski margines', () => {
    expect(() => calculateYarnFromSwatch({ swatchArea: 0, swatchWeightGrams: 10, projectArea: 100 })).toThrow('Powierzchnia i waga muszą być większe od 0');
    expect(() => calculateYarnFromSwatch({ swatchArea: 100, swatchWeightGrams: 0, projectArea: 100 })).toThrow('Powierzchnia i waga muszą być większe od 0');
    expect(() => calculateYarnFromSwatch({ swatchArea: 100, swatchWeightGrams: 10, projectArea: 0 })).toThrow('Powierzchnia i waga muszą być większe od 0');

    expect(() => calculateYarnSubstitution({ patternBalls: 0, patternBallLength: 100, newBallLength: 100 })).toThrow('Parametry włóczki muszą być większe od 0');
    expect(() => calculateYarnSubstitution({ patternBalls: 5, patternBallLength: 0, newBallLength: 100 })).toThrow('Parametry włóczki muszą być większe od 0');
    expect(() => calculateYarnSubstitution({ patternBalls: 5, patternBallLength: 100, newBallLength: 0 })).toThrow('Parametry włóczki muszą być większe od 0');
    expect(() => calculateYarnSubstitution({ patternBalls: 5, patternBallLength: 100, newBallLength: 100, strands: 0 })).toThrow('Parametry włóczki muszą być większe od 0');

    // isTightMargin test (exactBalls tuż poniżej lub równo liczbie całkowitej)
    const tightSub = calculateYarnSubstitution({
      patternBalls: 2,
      patternBallLength: 99.9,
      newBallLength: 100,
    });
    expect(tightSub.isTightMargin).toBe(true);
  });

  test('Kategorie CYC, WPI i igły US — błędy walidacji', () => {
    expect(() => getYarnWeightCategoriesByKnitGauge4in(0)).toThrow('Gęstość musi być większa od 0');
    expect(() => getYarnWeightCategoriesByWpi(0)).toThrow('WPI musi być większe od 0');
    expect(() => usNeedleToMm('unknown_size')).toThrow('Nieznany rozmiar drutów US');
  });
});

