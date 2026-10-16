import {
  YarnSubstitutionService,
  COMMON_MULTI_STRAND_COMBINATIONS,
} from '../yarn-substitution-service';

describe('YarnSubstitutionService', () => {
  describe('calculateSubstitution', () => {
    it('wylicza poprawne zapotrzebowanie na zamiennik dla standardowych danych', () => {
      // Wzór: 6 motków po 120 m (720 m). Zamiennik: motki po 150 m. Margines 10%.
      // Wymagane: 720 * 1.10 = 792 m. 792 / 150 = 5.28 motka -> 6 motków.
      const result = YarnSubstitutionService.calculateSubstitution({
        patternBalls: 6,
        patternBallLengthMeters: 120,
        newBallLengthMeters: 150,
        newBallWeightGrams: 50,
        safetyMarginPercent: 10,
      });

      expect(result.baseRequiredMeters).toBe(720);
      expect(result.safetyMetersAdded).toBe(72);
      expect(result.totalRequiredMeters).toBe(792);
      expect(result.exactBalls).toBe(5.28);
      expect(result.ballsNeeded).toBe(6);
      expect(result.totalEstimatedWeightGrams).toBe(264); // 792 * (50/150) = 264g
      expect(result.isTightMargin).toBe(false);
      expect(result.recommendation).toContain('Bezpieczna kalkulacja z 10% marginesem');
    });

    it('obsługuje kalkulację bez podania wagi motka', () => {
      const result = YarnSubstitutionService.calculateSubstitution({
        patternBalls: 4,
        patternBallLengthMeters: 200,
        newBallLengthMeters: 100,
        safetyMarginPercent: 5,
      });

      expect(result.totalEstimatedWeightGrams).toBeUndefined();
      expect(result.ballsNeeded).toBe(9); // 800 * 1.05 = 840 m / 100 = 8.4 -> 9
      expect(result.recommendation).toContain('Bezpieczna kalkulacja z 5% marginesem');
    });

    it('obsługuje zerowy margines bezpieczeństwa z odpowiednią rekomendacją', () => {
      const result = YarnSubstitutionService.calculateSubstitution({
        patternBalls: 5,
        patternBallLengthMeters: 100,
        newBallLengthMeters: 120,
        safetyMarginPercent: 0,
      });

      expect(result.safetyMetersAdded).toBe(0);
      expect(result.ballsNeeded).toBe(5);
      expect(result.recommendation).toContain('Obliczono bez marginesu bezpieczeństwa');
    });

    it('wykrywa ciasny margines (tight margin) i rekomenduje dodatkowy motek', () => {
      // 5 motków po 100m = 500m. Nowy motek 100m.
      // 500 / 100 = dokładnie 5.00 motka (0% zapasu na końcu).
      const result = YarnSubstitutionService.calculateSubstitution({
        patternBalls: 5,
        patternBallLengthMeters: 100,
        newBallLengthMeters: 100,
        safetyMarginPercent: 0,
      });

      expect(result.isTightMargin).toBe(true);
      expect(result.recommendation).toContain('Zapas wynosi poniżej 2%');
    });

    it('obsługuje dzierganie z wielu nitek (strands = 2)', () => {
      const result = YarnSubstitutionService.calculateSubstitution({
        patternBalls: 5,
        patternBallLengthMeters: 100,
        newBallLengthMeters: 100,
        strands: 2,
        safetyMarginPercent: 10,
      });

      // 5 * 100 * 2 = 1000m bazowo. +10% = 1100m. 1100 / 100 = 11 motków.
      expect(result.baseRequiredMeters).toBe(1000);
      expect(result.totalRequiredMeters).toBe(1100);
      expect(result.ballsNeeded).toBe(11);
    });

    it('rzuca błędy dla niepoprawnych danych wejściowych', () => {
      expect(() =>
        YarnSubstitutionService.calculateSubstitution({
          patternBalls: 0,
          patternBallLengthMeters: 100,
          newBallLengthMeters: 100,
        })
      ).toThrow('Parametry ilości i metrażu muszą być większe od zera');

      expect(() =>
        YarnSubstitutionService.calculateSubstitution({
          patternBalls: 5,
          patternBallLengthMeters: -10,
          newBallLengthMeters: 100,
        })
      ).toThrow('Parametry ilości i metrażu muszą być większe od zera');

      expect(() =>
        YarnSubstitutionService.calculateSubstitution({
          patternBalls: 5,
          patternBallLengthMeters: 100,
          newBallLengthMeters: 0,
        })
      ).toThrow('Parametry ilości i metrażu muszą być większe od zera');

      expect(() =>
        YarnSubstitutionService.calculateSubstitution({
          patternBalls: 5,
          patternBallLengthMeters: 100,
          newBallLengthMeters: 100,
          strands: 0,
        })
      ).toThrow('Liczba nitek musi być większa od zera');

      expect(() =>
        YarnSubstitutionService.calculateSubstitution({
          patternBalls: 5,
          patternBallLengthMeters: 100,
          newBallLengthMeters: 100,
          safetyMarginPercent: -5,
        })
      ).toThrow('Margines bezpieczeństwa nie może być ujemny');
    });
  });

  describe('classifyByWpi', () => {
    it('poprawnie klasyfikuje standardowe wartości WPI', () => {
      const dkResult = YarnSubstitutionService.classifyByWpi(11);
      expect(dkResult.matchedCategories.length).toBeGreaterThan(0);
      expect(dkResult.standards.length).toBeGreaterThan(0);
      expect(dkResult.summaryText).toContain('Dopasowano standard');
      expect(dkResult.summaryText).toContain('CYC');
    });

    it('obsługuje nietypowe wartości WPI poza standardem CYC 0-7', () => {
      const outlier = YarnSubstitutionService.classifyByWpi(99);
      expect(outlier.matchedCategories.length).toBe(0);
      expect(outlier.standards.length).toBe(0);
      expect(outlier.summaryText).toContain('Nietypowa grubość przędzy (99 WPI)');
    });

    it('rzuca błąd dla ujemnego lub zerowego WPI', () => {
      expect(() => YarnSubstitutionService.classifyByWpi(0)).toThrow(
        'Liczba owinięć WPI musi być większa od zera'
      );
      expect(() => YarnSubstitutionService.classifyByWpi(-5)).toThrow(
        'Liczba owinięć WPI musi być większa od zera'
      );
    });
  });

  describe('getMultiStrandCombinations', () => {
    it('zwraca kompletną listę sprawdzonych kombinacji nitek', () => {
      const combinations = YarnSubstitutionService.getMultiStrandCombinations();
      expect(combinations.length).toBe(COMMON_MULTI_STRAND_COMBINATIONS.length);
      expect(combinations.some((c) => c.id === 'fingering_plus_mohair')).toBe(true);
      expect(combinations.every((c) => c.recommendedNeedlesMm.length > 0)).toBe(true);
    });
  });
});
