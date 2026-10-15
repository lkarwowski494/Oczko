/**
 * Testy jednostkowe silnika estymatora zużycia włóczki i wagi wyrobu (BR-MAG-004)
 * Zgodne z TDD (Zasada 10) i hierarchią źródeł craftowych.
 */

import {
  estimateYarnFromProgress,
  estimateYarnFromSwatch,
  calculateYarnGrist,
  estimateFromProjectPart,
  ProgressYarnInput,
  SwatchYarnInput,
} from '../yarn-usage-estimator';

describe('Yarn Usage & Finished Object Weight Estimator (BR-MAG-004)', () => {
  describe('estimateYarnFromProgress', () => {
    it('poprawnie wylicza zapotrzebowanie na włóczkę na podstawie ukończonych rzędów i wagi', () => {
      const input: ProgressYarnInput = {
        completedRows: 50,
        targetRows: 200,
        usedWeightGrams: 40,
        skeinWeightGrams: 50,
        skeinLengthMeters: 175,
        availableSkeins: 4,
        safetyMarginPercent: 10,
      };

      const result = estimateYarnFromProgress(input);

      // 40g / 50 rzędów = 0.8g / rząd
      expect(result.gramsPerRow).toBeCloseTo(0.8, 2);
      // 200 * 0.8g = 160g bazowo
      expect(result.rawTotalWeightGrams).toBeCloseTo(160, 1);
      // 160g * 1.10 (10% margines) = 176g
      expect(result.estimatedTotalWeightGrams).toBeCloseTo(176, 1);
      // Pozostało do zrobienia: 176g - 40g = 136g
      expect(result.remainingWeightGrams).toBeCloseTo(136, 1);
      // Wymagane motki: ceil(176 / 50) = 4 motki
      expect(result.requiredSkeins).toBe(4);

      // Metraż: 175m / 50g = 3.5 m/g
      // Łączny metraż: 176g * 3.5 = 616m
      expect(result.estimatedTotalLengthMeters).toBeCloseTo(616, 1);
      // Pozostały metraż: 136g * 3.5 = 476m
      expect(result.remainingLengthMeters).toBeCloseTo(476, 1);

      // Dostępność w magazynie: 4 motki * 50g = 200g
      // 200g >= 176g -> wystarczy
      expect(result.isSufficient).toBe(true);
      expect(result.differenceGrams).toBeCloseTo(24, 1);
      expect(result.yarnChickenRisk).toBe('safe');
      expect(result.advice).toContain('Zapas włóczki jest wystarczający');
    });

    it('wykrywa ryzyko Yarn Chicken (brak włóczki / deficyt) i ostrzega użytkownika', () => {
      const input: ProgressYarnInput = {
        completedRows: 100,
        targetRows: 300,
        usedWeightGrams: 80,
        skeinWeightGrams: 50,
        availableSkeins: 4, // 4 * 50g = 200g
        safetyMarginPercent: 10,
      };

      // 80g / 100 = 0.8g/rząd -> 300 rzędów = 240g bazowo -> z 10% = 264g
      // Wymagane motki: ceil(264 / 50) = 6 motków
      // Dostępne: 4 motki (200g) -> brakuje 64g (2 motków)
      const result = estimateYarnFromProgress(input);

      expect(result.isSufficient).toBe(false);
      expect(result.requiredSkeins).toBe(6);
      expect(result.differenceGrams).toBeCloseTo(-64, 1);
      expect(result.missingSkeins).toBe(2);
      expect(result.yarnChickenRisk).toBe('danger');
      expect(result.advice).toContain('Yarn Chicken');
      expect(result.advice).toContain('Brakuje ok. 64');
    });

    it('identyfikuje stan ostrzegawczy, gdy zapas jest na styk (< 5% rezerwy)', () => {
      const input: ProgressYarnInput = {
        completedRows: 100,
        targetRows: 200,
        usedWeightGrams: 98,
        skeinWeightGrams: 100,
        availableSkeins: 2, // 200g
        safetyMarginPercent: 0, // bez marginesu
      };

      // 98g / 100 = 0.98g/rząd -> 200 rzędów = 196g
      // Dostępne 200g, zapotrzebowanie 196g -> nadwyżka 4g (2% rezerwy)
      const result = estimateYarnFromProgress(input);

      expect(result.isSufficient).toBe(true);
      expect(result.differenceGrams).toBeCloseTo(4, 1);
      expect(result.yarnChickenRisk).toBe('warning');
      expect(result.advice).toContain('Zapas na styk');
    });

    it('rzuca błąd przy nieprawidłowych lub zerowych danych wejściowych', () => {
      expect(() =>
        estimateYarnFromProgress({
          completedRows: 0,
          targetRows: 100,
          usedWeightGrams: 50,
          skeinWeightGrams: 50,
        })
      ).toThrow('Liczba ukończonych rzędów musi być większa od zera');

      expect(() =>
        estimateYarnFromProgress({
          completedRows: 50,
          targetRows: 0,
          usedWeightGrams: 50,
          skeinWeightGrams: 50,
        })
      ).toThrow('Docelowa liczba rzędów musi być większa od zera');

      expect(() =>
        estimateYarnFromProgress({
          completedRows: 50,
          targetRows: 100,
          usedWeightGrams: 0,
          skeinWeightGrams: 50,
        })
      ).toThrow('Waga zużytej włóczki musi być większa od zera');

      expect(() =>
        estimateYarnFromProgress({
          completedRows: 50,
          targetRows: 100,
          usedWeightGrams: 50,
          skeinWeightGrams: 0,
        })
      ).toThrow('Waga motka musi być większa od zera');
    });

    it('obsługuje przypadek, gdy robótka już osiągnęła lub przekroczyła docelowe rzędy', () => {
      const input: ProgressYarnInput = {
        completedRows: 120,
        targetRows: 100,
        usedWeightGrams: 90,
        skeinWeightGrams: 50,
      };

      const result = estimateYarnFromProgress(input);
      expect(result.remainingWeightGrams).toBe(0);
      expect(result.advice).toContain('ukończona');
    });
  });

  describe('estimateYarnFromSwatch', () => {
    it('estymuje zapotrzebowanie na włóczkę na podstawie próbki ściegu i wymiarów wyrobu', () => {
      const input: SwatchYarnInput = {
        swatchWidthCm: 10,
        swatchHeightCm: 10,
        swatchWeightGrams: 8, // 8g na 100 cm² (0.08 g/cm²)
        finishedWidthCm: 50,
        finishedHeightCm: 160, // Szal: 50 x 160 = 8000 cm²
        pieceCount: 1,
        skeinWeightGrams: 100,
        skeinLengthMeters: 200,
        availableSkeins: 8,
        safetyMarginPercent: 10,
      };

      const result = estimateYarnFromSwatch(input);

      // Pole próbki: 100 cm² -> 0.08 g/cm²
      expect(result.gramsPerCm2).toBeCloseTo(0.08, 4);
      // Pole wyrobu: 8000 cm² * 0.08g = 640g wagi surowej
      expect(result.rawTotalWeightGrams).toBeCloseTo(640, 1);
      // Z 10% marginesem: 640 * 1.10 = 704g
      expect(result.estimatedTotalWeightGrams).toBeCloseTo(704, 1);
      // Wymagane motki: ceil(704 / 100) = 8 motków
      expect(result.requiredSkeins).toBe(8);
      // Dostępne: 8 motków (800g) >= 704g -> wystarczy
      expect(result.isSufficient).toBe(true);
      expect(result.differenceGrams).toBeCloseTo(96, 1);
      expect(result.yarnChickenRisk).toBe('safe');
    });

    it('uwzględnia liczbę elementów wyrobu (np. przód + tył swetra)', () => {
      const input: SwatchYarnInput = {
        swatchWidthCm: 10,
        swatchHeightCm: 10,
        swatchWeightGrams: 10, // 0.1 g/cm²
        finishedWidthCm: 50,
        finishedHeightCm: 60, // 3000 cm² na element
        pieceCount: 2, // 6000 cm² łącznie
        skeinWeightGrams: 50,
        safetyMarginPercent: 15,
      };

      const result = estimateYarnFromSwatch(input);
      // 6000 * 0.1 = 600g * 1.15 = 690g
      expect(result.rawTotalWeightGrams).toBeCloseTo(600, 1);
      expect(result.estimatedTotalWeightGrams).toBeCloseTo(690, 1);
      // ceil(690 / 50) = 14 motków
      expect(result.requiredSkeins).toBe(14);
    });

    it('odrzuca nieprawidłowe wymiary próbki lub wyrobu', () => {
      expect(() =>
        estimateYarnFromSwatch({
          swatchWidthCm: 0,
          swatchHeightCm: 10,
          swatchWeightGrams: 10,
          finishedWidthCm: 50,
          finishedHeightCm: 60,
          skeinWeightGrams: 50,
        })
      ).toThrow('Wymiary próbki muszą być większe od zera');
    });
  });

  describe('calculateYarnGrist', () => {
    it('oblicza wskaźnik grist (metry na gram oraz metry na 100g)', () => {
      const grist = calculateYarnGrist(50, 175);
      expect(grist.metersPerGram).toBeCloseTo(3.5, 2);
      expect(grist.metersPer100g).toBeCloseTo(350, 1);
    });

    it('zgłasza błąd przy zerowej wadze', () => {
      expect(() => calculateYarnGrist(0, 100)).toThrow('Waga musi być większa od zera');
    });
  });

  describe('estimateFromProjectPart', () => {
    it('tworzy estymację bezpośrednio z danych części robótki i włóczki', () => {
      const result = estimateFromProjectPart({
        partName: 'Korpus',
        currentRow: 60,
        targetRows: 180,
        usedWeightGrams: 75,
        yarn: {
          brand: 'Drops',
          name: 'Nord',
          skeinWeightGrams: 50,
          skeinLengthMeters: 170,
          skeinsRemaining: 4, // 200g w magazynie
        },
        safetyMarginPercent: 10,
      });

      // 75g / 60 = 1.25g/rząd -> 180 * 1.25 = 225g * 1.1 = 247.5g
      // W magazynie: 4 * 50 = 200g. Brakuje 47.5g (1 motek)
      expect(result.partName).toBe('Korpus');
      expect(result.estimate.isSufficient).toBe(false);
      expect(result.estimate.missingSkeins).toBe(1);
      expect(result.estimate.requiredSkeins).toBe(5);
    });
  });
});
