import {
  inchesToCm,
  yardsToMeters,
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
  });
});
