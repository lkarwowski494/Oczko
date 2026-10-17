import {
  convertLength,
  classifyBehavior,
  generateFiberAdvice,
  calculateBlockingAnalysis,
  RawSwatch,
  BlockedSwatch,
  TargetGarmentDimensions,
} from '../blocking-calculator';

describe('Blocking Calculator & Gauge Compensation Core (DEC-34)', () => {
  describe('convertLength', () => {
    it('returns same value if units are identical', () => {
      expect(convertLength(10, 'cm', 'cm')).toBe(10);
      expect(convertLength(4, 'inch', 'inch')).toBe(4);
    });

    it('converts inches to centimeters accurately', () => {
      expect(convertLength(4, 'inch', 'cm')).toBeCloseTo(10.16, 2);
    });

    it('converts centimeters to inches accurately', () => {
      expect(convertLength(10.16, 'cm', 'inch')).toBeCloseTo(4, 2);
    });
  });

  describe('classifyBehavior', () => {
    it('classifies growth (> +2.0%)', () => {
      expect(classifyBehavior(2.1)).toBe('growth');
      expect(classifyBehavior(15.0)).toBe('growth');
    });

    it('classifies shrinkage (< -2.0%)', () => {
      expect(classifyBehavior(-2.1)).toBe('shrinkage');
      expect(classifyBehavior(-8.0)).toBe('shrinkage');
    });

    it('classifies stable (between -2.0% and +2.0%)', () => {
      expect(classifyBehavior(0)).toBe('stable');
      expect(classifyBehavior(1.9)).toBe('stable');
      expect(classifyBehavior(-1.9)).toBe('stable');
    });
  });

  describe('generateFiberAdvice', () => {
    it('generates growth tips for long stretch (> +8% height)', () => {
      const tips = generateFiberAdvice(0, 10);
      expect(tips.some((t) => t.includes('silnie rośnie wzdłuż'))).toBe(true);
    });

    it('generates vertical shrinkage tips for height shrinkage (< -5% height)', () => {
      const tips = generateFiberAdvice(0, -6);
      expect(tips.some((t) => t.includes('zbiega się w pionie'))).toBe(true);
    });

    it('generates width growth tips (> +8% width)', () => {
      const tips = generateFiberAdvice(10, 0);
      expect(tips.some((t) => t.includes('mocno rozszerza się wszerz'))).toBe(true);
    });

    it('generates width shrinkage tips (< -5% width)', () => {
      const tips = generateFiberAdvice(-7, 0);
      expect(tips.some((t) => t.includes('zagęszcza się wszerz'))).toBe(true);
    });

    it('generates stability tip when within stable threshold', () => {
      const tips = generateFiberAdvice(1.0, -1.0);
      expect(tips[0]).toContain('stabilność wymiarową');
    });
  });

  describe('calculateBlockingAnalysis', () => {
    const rawSwatch: RawSwatch = {
      stitches: 20,
      rows: 28,
      width: 10,
      height: 10,
      unit: 'cm',
    };

    it('calculates growth and compensation correctly for wet blocked swatch', () => {
      // Swatch grew from 10x10 to 11x11 (+10% width, +10% height)
      const blockedSwatch: BlockedSwatch = {
        width: 11,
        height: 11,
        unit: 'cm',
      };
      const target: TargetGarmentDimensions = {
        targetWidth: 55, // 55 cm target width
        targetHeight: 66, // 66 cm target height
        unit: 'cm',
      };

      const result = calculateBlockingAnalysis(rawSwatch, blockedSwatch, target);

      expect(result.widthChangePct).toBe(10.0);
      expect(result.heightChangePct).toBe(10.0);
      expect(result.widthBehavior).toBe('growth');
      expect(result.heightBehavior).toBe('growth');

      // Density raw was 2 st/cm, 2.8 rows/cm
      expect(result.rawStitchesPerUnit).toBe(2.0);
      expect(result.rawRowsPerUnit).toBe(2.8);

      // Blocked density is 20/11 = 1.818 st/cm, 28/11 = 2.545 rows/cm
      expect(result.blockedStitchesPerUnit).toBeCloseTo(20 / 11, 3);
      expect(result.blockedRowsPerUnit).toBeCloseTo(28 / 11, 3);

      // Target stitches: 55 * (20/11) = 100 stitches
      expect(result.requiredCastOnStitches).toBe(100);
      // Target rows: 66 * (28/11) = 168 rows
      expect(result.requiredTotalRows).toBe(168);

      // On-needles dimensions: 55 / 1.1 = 50 cm width, 66 / 1.1 = 60 cm height
      expect(result.onNeedlesWidth).toBe(50);
      expect(result.onNeedlesHeight).toBe(60);

      expect(result.fiberTips.length).toBeGreaterThan(0);
    });

    it('calculates shrinkage and compensation correctly', () => {
      // Swatch shrank to 9.5 x 9.5 (-5% change)
      const blockedSwatch: BlockedSwatch = {
        width: 9.5,
        height: 9.5,
        unit: 'cm',
      };
      const target: TargetGarmentDimensions = {
        targetWidth: 47.5,
        targetHeight: 57,
        unit: 'cm',
      };

      const result = calculateBlockingAnalysis(rawSwatch, blockedSwatch, target);
      expect(result.widthChangePct).toBe(-5.0);
      expect(result.heightChangePct).toBe(-5.0);
      expect(result.widthBehavior).toBe('shrinkage');
      expect(result.heightBehavior).toBe('shrinkage');

      // Required stitches: 47.5 * (20 / 9.5) = 100
      expect(result.requiredCastOnStitches).toBe(100);
      // Required rows: 57 * (28 / 9.5) = 168
      expect(result.requiredTotalRows).toBe(168);

      // On needles dimensions: 47.5 * (10 / 9.5) = 50.0 cm
      expect(result.onNeedlesWidth).toBe(50.0);
      expect(result.onNeedlesHeight).toBe(60.0);
    });

    it('works without target garment dimensions provided', () => {
      const blockedSwatch: BlockedSwatch = {
        width: 10,
        height: 10,
        unit: 'cm',
      };
      const result = calculateBlockingAnalysis(rawSwatch, blockedSwatch);

      expect(result.widthChangePct).toBe(0);
      expect(result.heightChangePct).toBe(0);
      expect(result.widthBehavior).toBe('stable');
      expect(result.heightBehavior).toBe('stable');
      expect(result.requiredCastOnStitches).toBe(0);
      expect(result.requiredTotalRows).toBe(0);
      expect(result.onNeedlesWidth).toBe(0);
      expect(result.onNeedlesHeight).toBe(0);
    });

    it('handles mixed units seamlessly (inch blocked & cm raw)', () => {
      const rawInches: RawSwatch = {
        stitches: 18,
        rows: 24,
        width: 4, // 4 inches
        height: 4, // 4 inches
        unit: 'inch',
      };
      // Blocked swatch measured in cm: 10.16 cm = exactly 4.0 inches (0% change)
      const blockedCm: BlockedSwatch = {
        width: 10.16,
        height: 10.16,
        unit: 'cm',
      };
      const targetCm: TargetGarmentDimensions = {
        targetWidth: 50.8, // 20 inches
        targetHeight: 76.2, // 30 inches
        unit: 'cm',
      };

      const result = calculateBlockingAnalysis(rawInches, blockedCm, targetCm);
      expect(result.widthChangePct).toBeCloseTo(0, 1);
      expect(result.heightChangePct).toBeCloseTo(0, 1);
      // 20 inches * (18 / 4 st/inch) = 90 st
      expect(result.requiredCastOnStitches).toBe(90);
    });

    it('throws descriptive error on non-positive input values', () => {
      expect(() => {
        calculateBlockingAnalysis(
          { ...rawSwatch, stitches: 0 },
          { width: 10, height: 10, unit: 'cm' }
        );
      }).toThrow('Wymiary i liczba oczek próbki muszą być większe od zera.');

      expect(() => {
        calculateBlockingAnalysis(
          { ...rawSwatch, width: -1 },
          { width: 10, height: 10, unit: 'cm' }
        );
      }).toThrow('Wymiary i liczba oczek próbki muszą być większe od zera.');

      expect(() => {
        calculateBlockingAnalysis(
          rawSwatch,
          { width: 0, height: 10, unit: 'cm' }
        );
      }).toThrow('Wymiary i liczba oczek próbki muszą być większe od zera.');
    });

    it('throws error on negative target dimensions', () => {
      expect(() => {
        calculateBlockingAnalysis(
          rawSwatch,
          { width: 10, height: 10, unit: 'cm' },
          { targetWidth: -10, targetHeight: 50, unit: 'cm' }
        );
      }).toThrow('Docelowe wymiary wyrobu nie mogą być ujemne.');
    });
  });
});
