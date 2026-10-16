import {
  calculateHatCrown,
  HAT_STANDARD_SIZES,
} from '../hat-calculator';

describe('Hat Crown Calculator (src/core/hat-calculator.ts)', () => {
  it('calculates standard adult M beanie with 6 wedges correctly', () => {
    const res = calculateHatCrown({
      headCircumferenceCm: 57,
      negativeEaseCm: 5,
      gaugeStitchesPer10Cm: 22,
      gaugeRowsPer10Cm: 30,
      brimStyle: 'single',
      brimHeightCm: 5,
      fitStyle: 'beanie',
      wedges: 6,
    });

    expect(res.targetCircumferenceCm).toBe(52);
    expect(res.negativeEaseCm).toBe(5);
    expect(res.castOnStitches % 6).toBe(0);
    expect(res.wedges).toBe(6);
    expect(res.finalRemainingStitches).toBe(6);
    expect(res.rounds.length).toBeGreaterThan(0);
    expect(res.crownRoundsCount).toBe(res.rounds.length);
    expect(res.summaryText).toContain('nabierz');
    expect(res.summaryText).toContain('6 klinach');

    // Verify rounds structure
    const firstDecrease = res.rounds[0];
    expect(firstDecrease.isDecreaseRound).toBe(true);
    expect(firstDecrease.roundNumber).toBe(1);
    expect(firstDecrease.description).toContain('k2tog');
  });

  it('handles folded brim and slouchy fit correctly', () => {
    const res = calculateHatCrown({
      headCircumferenceCm: 54,
      gaugeStitchesPer10Cm: 20,
      gaugeRowsPer10Cm: 28,
      brimStyle: 'folded',
      brimHeightCm: 10,
      fitStyle: 'slouchy',
      slouchExtraCm: 5,
      wedges: 4,
    });

    expect(res.brimHeightCm).toBe(10);
    expect(res.wedges).toBe(4);
    expect(res.finalRemainingStitches).toBe(4);
    expect(res.totalHeightCm).toBeGreaterThan(25);
  });

  it('aligns cast-on with ribbingMultiple when coprime with wedges', () => {
    // 2x2 ribbing (multiple 4) with 6 wedges -> LCM(4, 6) = 12
    const res = calculateHatCrown({
      headCircumferenceCm: 56,
      gaugeStitchesPer10Cm: 22,
      gaugeRowsPer10Cm: 30,
      brimStyle: 'single',
      brimHeightCm: 4,
      fitStyle: 'beanie',
      wedges: 6,
      ribbingMultiple: 4,
    });

    expect(res.castOnStitches % 12).toBe(0);
    expect(res.castOnStitches % 6).toBe(0);
    expect(res.castOnStitches % 4).toBe(0);
  });

  it('supports 8 wedges crown shaping and custom remaining stitches', () => {
    const res = calculateHatCrown({
      headCircumferenceCm: 60,
      negativeEaseCm: 6,
      gaugeStitchesPer10Cm: 18,
      gaugeRowsPer10Cm: 24,
      brimStyle: 'single',
      brimHeightCm: 4,
      fitStyle: 'beanie',
      wedges: 8,
      targetRemainingStitches: 16,
    });

    expect(res.wedges).toBe(8);
    expect(res.finalRemainingStitches).toBe(16);
    const lastRound = res.rounds[res.rounds.length - 1];
    expect(lastRound.totalStitchesAfter).toBe(16);
  });

  it('handles child size and custom head circumferences outside preset matches', () => {
    const res = calculateHatCrown({
      headCircumferenceCm: 40, // Outside exact standard matches (35, 44, 50, 54, 57, 60)
      negativeEaseCm: 4,
      gaugeStitchesPer10Cm: 24,
      gaugeRowsPer10Cm: 32,
      brimStyle: 'single',
      brimHeightCm: 3,
      fitStyle: 'beanie',
      wedges: 6,
    });

    expect(res.targetCircumferenceCm).toBe(36);
    expect(res.totalHeightCm).toBeCloseTo(16, 0); // 40 * 0.4 = 16
  });

  it('rounds targetRemainingStitches to the closest multiple of wedges', () => {
    // When requesting 10 stitches with 6 wedges, it rounds to 12 (multiple of 6)
    const res = calculateHatCrown({
      headCircumferenceCm: 50,
      negativeEaseCm: 2,
      gaugeStitchesPer10Cm: 15,
      gaugeRowsPer10Cm: 20,
      brimStyle: 'single',
      brimHeightCm: 3,
      fitStyle: 'beanie',
      wedges: 6,
      targetRemainingStitches: 10,
    });

    expect(res.finalRemainingStitches).toBe(12);
    expect(res.rounds[res.rounds.length - 1].totalStitchesAfter).toBe(12);
  });

  it('clamps extreme inputs safely', () => {
    const res = calculateHatCrown({
      headCircumferenceCm: 10, // Clamped to 20
      negativeEaseCm: 25, // Clamped to 15
      gaugeStitchesPer10Cm: -5, // Clamped to 1
      gaugeRowsPer10Cm: 0, // Clamped to 1
      brimStyle: 'single',
      brimHeightCm: 0, // Default 5
      fitStyle: 'beanie',
      wedges: 6,
    });

    expect(res.castOnStitches).toBeGreaterThanOrEqual(24);
    expect(res.crownRoundsCount).toBeGreaterThan(0);
  });

  it('provides all standard sizes defined in HAT_STANDARD_SIZES', () => {
    expect(HAT_STANDARD_SIZES.length).toBe(6);
    expect(HAT_STANDARD_SIZES.map((s) => s.id)).toEqual([
      'baby',
      'toddler',
      'child',
      'adult_s',
      'adult_m',
      'adult_l',
    ]);
  });
});
