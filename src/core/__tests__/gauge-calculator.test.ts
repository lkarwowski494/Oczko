import {
  convertLength,
  calculateTargetStitchesAndRows,
  compareGauges,
  BUILT_IN_PROJECT_TEMPLATES,
  SwatchMeasurement,
  TargetDimensions,
} from '../gauge-calculator';

describe('Gauge Calculator & Templates Core (DEC-01, BR-PROJ-004)', () => {
  describe('convertLength', () => {
    it('accurately converts between inches and centimeters', () => {
      expect(convertLength(10, 'cm', 'cm')).toBe(10);
      expect(convertLength(4, 'inch', 'cm')).toBeCloseTo(10.16, 2);
      expect(convertLength(10.16, 'cm', 'inch')).toBeCloseTo(4, 2);
    });
  });

  describe('calculateTargetStitchesAndRows', () => {
    it('calculates target cast-on stitches and rows from 10x10 cm swatch', () => {
      const swatch: SwatchMeasurement = {
        stitches: 20,
        rows: 28,
        width: 10,
        height: 10,
        unit: 'cm',
      };
      const target: TargetDimensions = {
        width: 50,
        height: 60,
        unit: 'cm',
      };

      const result = calculateTargetStitchesAndRows(swatch, target);
      expect(result.stitchesPerUnit).toBe(2.0);
      expect(result.rowsPerUnit).toBe(2.8);
      expect(result.targetStitches).toBe(100);
      expect(result.targetRows).toBe(168);
      expect(result.unit).toBe('cm');
    });

    it('handles mixed units (inch swatch to cm target)', () => {
      // Próbka 4 x 4 cale: 18 st, 24 rows
      const swatch: SwatchMeasurement = {
        stitches: 18,
        rows: 24,
        width: 4,
        height: 4,
        unit: 'inch',
      };
      // Cel w centymetrach: 25.4 cm szerokości (czyli dokładnie 10 cali)
      const target: TargetDimensions = {
        width: 25.4,
        height: 50.8,
        unit: 'cm',
      };

      const result = calculateTargetStitchesAndRows(swatch, target);
      // 10 cali * (18 / 4) = 45 oczek
      expect(result.targetStitches).toBe(45);
      // 20 cali * (24 / 4) = 120 rzędów
      expect(result.targetRows).toBe(120);
    });

    it('rejects invalid or zero dimensions', () => {
      const invalidSwatch: SwatchMeasurement = {
        stitches: 0,
        rows: 20,
        width: 10,
        height: 10,
        unit: 'cm',
      };
      const target: TargetDimensions = { width: 50, height: 60, unit: 'cm' };

      expect(() => calculateTargetStitchesAndRows(invalidSwatch, target)).toThrow('Wymiary próbki oraz liczba oczek');
      expect(() => calculateTargetStitchesAndRows({ stitches: 10, rows: 10, width: 10, height: 10, unit: 'cm' }, { width: 0, height: 50, unit: 'cm' })).toThrow('Docelowe wymiary projektu muszą być większe od zera');
    });
  });

  describe('compareGauges', () => {
    it('identifies exact gauge tension match', () => {
      const pattern: SwatchMeasurement = {
        stitches: 20,
        rows: 28,
        width: 10,
        height: 10,
        unit: 'cm',
      };
      const actual: SwatchMeasurement = {
        stitches: 20,
        rows: 28,
        width: 10,
        height: 10,
        unit: 'cm',
      };

      const comparison = compareGauges(pattern, actual);
      expect(comparison.status).toBe('exact');
      expect(comparison.stitchRatio).toBe(1.0);
      expect(comparison.recalculatedCastOn(100)).toBe(100);
    });

    it('identifies tighter gauge and recommends thicker needles and cast-on adjustment', () => {
      // Wzór: 20 st na 10 cm. Wykonawca: 24 st na 10 cm (za ciasno)
      const pattern: SwatchMeasurement = {
        stitches: 20,
        rows: 28,
        width: 10,
        height: 10,
        unit: 'cm',
      };
      const actual: SwatchMeasurement = {
        stitches: 24,
        rows: 32,
        width: 10,
        height: 10,
        unit: 'cm',
      };

      const comparison = compareGauges(pattern, actual);
      expect(comparison.status).toBe('tighter');
      expect(comparison.stitchRatio).toBe(1.2);
      expect(comparison.needleAdjustmentRecommendation).toContain('grubszych');
      // Gdy wzór mówił 100 oczek, to przy 1.2 trzeba nabrać 120 oczek, aby zachować ten sam wymiar
      expect(comparison.recalculatedCastOn(100)).toBe(120);
    });

    it('identifies looser gauge and recommends thinner needles and cast-on adjustment', () => {
      // Wzór: 20 st na 10 cm. Wykonawca: 16 st na 10 cm (za luźno)
      const pattern: SwatchMeasurement = {
        stitches: 20,
        rows: 28,
        width: 10,
        height: 10,
        unit: 'cm',
      };
      const actual: SwatchMeasurement = {
        stitches: 16,
        rows: 22,
        width: 10,
        height: 10,
        unit: 'cm',
      };

      const comparison = compareGauges(pattern, actual);
      expect(comparison.status).toBe('looser');
      expect(comparison.stitchRatio).toBe(0.8);
      expect(comparison.needleAdjustmentRecommendation).toContain('cieńszych');
      // Gdy wzór mówił 100 oczek, to przy 0.8 trzeba nabrać 80 oczek
      expect(comparison.recalculatedCastOn(100)).toBe(80);
    });
  });

  describe('BUILT_IN_PROJECT_TEMPLATES', () => {
    it('provides populated project templates with valid dimensions and gauges', () => {
      expect(BUILT_IN_PROJECT_TEMPLATES.length).toBeGreaterThanOrEqual(5);

      const beanie = BUILT_IN_PROJECT_TEMPLATES.find((t) => t.category === 'czapka');
      expect(beanie).toBeDefined();
      expect(beanie!.defaultDimensions.width).toBeGreaterThan(0);
      expect(beanie!.defaultDimensions.height).toBeGreaterThan(0);
      expect(beanie!.standardGauge.stitches).toBeGreaterThan(0);

      // Sprawdzenie wyliczenia oczek dla czapki z jej standardowej próbki
      const calculated = calculateTargetStitchesAndRows(
        beanie!.standardGauge,
        beanie!.defaultDimensions
      );
      // 48 cm * (20 st / 10 cm) = 96 oczek
      expect(calculated.targetStitches).toBe(96);
      // 24 cm * (28 rzędów / 10 cm) = 67 rzędów
      expect(calculated.targetRows).toBe(67);
    });
  });
});
