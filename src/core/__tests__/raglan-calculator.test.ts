import { RaglanCalculator } from '../raglan-calculator';

describe('RaglanCalculator (Konstrukcja Karczku Raglanowego i Rzędów Skróconych)', () => {
  describe('calculateCastOnDivision (Podział oczek dekoltu)', () => {
    it('poprawnie dzieli oczka dekoltu z uwzględnieniem linii raglanu i kompensacji GSR', () => {
      // 88 oczek nabieranych, 4 linie po 2 o. (8 o. raglanu), 80 o. dostępne
      // 80 * 1/6 = 13.33 -> 13 o. na rękaw (26 o. na oba)
      // 80 - 26 = 54 o. na korpus -> 27 o. baza
      // 4 obroty GSR: tył = 27 - 4 = 23 o., przód = 27 + 4 = 31 o.
      const result = RaglanCalculator.calculateCastOnDivision({
        totalCastOnStitches: 88,
        raglanLineStitches: 2,
        shortRowTurnsPerSide: 4,
      });

      expect(result.totalCastOnStitches).toBe(88);
      expect(result.raglanLineStitches).toBe(2);
      expect(result.totalRaglanStitches).toBe(8);
      expect(result.initialSleeveStitches).toBe(13);
      expect(result.initialBackStitches).toBe(23);
      expect(result.initialFrontStitches).toBe(31);

      // Suma wszystkich elementów równa liczbie nabranych oczek
      const sum =
        result.initialBackStitches +
        result.initialFrontStitches +
        2 * result.initialSleeveStitches +
        result.totalRaglanStitches;
      expect(sum).toBe(88);

      // Po wykonaniu rzędów skróconych tył osiąga 23 + 2*4 = 31 o. (idealny balans z przodem!)
      expect(result.finalBackAfterShortRows).toBe(31);
      expect(result.finalFrontAfterShortRows).toBe(31);
      expect(result.isBalancedAfterShortRows).toBe(true);
      expect(result.divisionFormulaPl).toContain('Tył: 23 o., Przód: 31 o.');
    });

    it('obsługuje przypadek brzegowy głębokiego dekoltu (initialBack < 4)', () => {
      // Mała liczba oczek i duża liczba obrotów wymuszająca shift
      const result = RaglanCalculator.calculateCastOnDivision({
        totalCastOnStitches: 32,
        raglanLineStitches: 1,
        shortRowTurnsPerSide: 12,
        sleeveRatio: 0.1,
      });

      expect(result.initialBackStitches).toBeGreaterThanOrEqual(4);
      expect(result.totalCastOnStitches).toBe(32);
    });

    it('zapewnia minimalnie 2 oczka na rękaw przy skrajnie małym sleeveRatio', () => {
      const result = RaglanCalculator.calculateCastOnDivision({
        totalCastOnStitches: 20,
        raglanLineStitches: 1,
        sleeveRatio: 0.05,
        shortRowTurnsPerSide: 0,
      });
      expect(result.initialSleeveStitches).toBe(2);
    });

    it('rzuca błąd przy niedozwolonych danych wejściowych', () => {
      expect(() =>
        RaglanCalculator.calculateCastOnDivision({ totalCastOnStitches: 0 })
      ).toThrow('Liczba oczek nabieranych musi być większa od 0');

      expect(() =>
        RaglanCalculator.calculateCastOnDivision({
          totalCastOnStitches: 80,
          raglanLineStitches: -1,
        })
      ).toThrow('Liczba oczek linii raglanowej nie może być ujemna');

      expect(() =>
        RaglanCalculator.calculateCastOnDivision({
          totalCastOnStitches: 80,
          shortRowTurnsPerSide: -2,
        })
      ).toThrow('Liczba obrotów rzędów skróconych nie może być ujemna');

      expect(() =>
        RaglanCalculator.calculateCastOnDivision({
          totalCastOnStitches: 80,
          sleeveRatio: 0.5,
        })
      ).toThrow('Proporcja rękawa musi mieścić się w przedziale');

      expect(() =>
        RaglanCalculator.calculateCastOnDivision({
          totalCastOnStitches: 10,
          raglanLineStitches: 2, // 4 * 2 = 8 o., available = 2 < 8
        })
      ).toThrow('Zbyt mało oczek na podział korpusu i rękawów');
    });
  });

  describe('calculateGermanShortRows (Planowanie punktów zwrotnych GSR)', () => {
    it('wylicza liczbę rzędów skróconych i rozkłada punkty zwrotne', () => {
      const plan = RaglanCalculator.calculateGermanShortRows({
        neckRiseCm: 3,
        rowGaugePer10cm: 28,
        sleeveStitches: 14,
        frontStitches: 32,
      });

      // 3 cm * 2.8 rz./cm = 8.4 -> 8 rzędów (lub parzysta liczba >= 2)
      expect(plan.totalShortRows % 2).toBe(0);
      expect(plan.turnsPerSide).toBe(plan.totalShortRows / 2);
      expect(plan.turnPoints.length).toBe(plan.turnsPerSide);
      expect(plan.instructionStepsPl.length).toBeGreaterThanOrEqual(4);
      expect(plan.instructionStepsPl[1]).toContain('Rząd 1 (RS)');
    });

    it('zaokrągla nieparzyste rzędy do parzystej liczby i chroni przed min rzędami', () => {
      const plan = RaglanCalculator.calculateGermanShortRows({
        neckRiseCm: 0.1,
        rowGaugePer10cm: 10,
        sleeveStitches: 10,
        frontStitches: 20,
      });
      expect(plan.totalShortRows).toBeGreaterThanOrEqual(2);
      expect(plan.turnsPerSide).toBeGreaterThanOrEqual(1);
    });

    it('rzuca błąd przy niedozwolonych wartościach zerowych lub ujemnych', () => {
      expect(() =>
        RaglanCalculator.calculateGermanShortRows({
          neckRiseCm: 0,
          rowGaugePer10cm: 28,
          sleeveStitches: 10,
          frontStitches: 20,
        })
      ).toThrow('Podniesienie tyłu i gęstość rzędów muszą być większe od 0');

      expect(() =>
        RaglanCalculator.calculateGermanShortRows({
          neckRiseCm: 3,
          rowGaugePer10cm: 28,
          sleeveStitches: 0,
          frontStitches: 20,
        })
      ).toThrow('Liczba oczek rękawa i przodu musi być większa od 0');
    });
  });

  describe('calculateYokeIncreases (Przyrosty karczku i podkrój pach)', () => {
    it('wylicza poprawnie rzędy z przyrostami, oczka korpusu i rękawów oraz obwody wyrobu', () => {
      const yoke = RaglanCalculator.calculateYokeIncreases({
        stitchGaugePer10cm: 20,
        rowGaugePer10cm: 28,
        desiredChestCircumferenceCm: 100,
        desiredSleeveCircumferenceCm: 34,
        yokeDepthCm: 22,
        initialBackStitches: 28,
        initialFrontStitches: 28,
        initialSleeveStitches: 14,
        raglanLineStitches: 2,
        underarmCastOnStitches: 8,
      });

      // 22 cm * 2.8 rz./cm = ~62 rzędów
      expect(yoke.totalYokeRounds).toBeCloseTo(62, 0);
      expect(yoke.increaseRounds).toBe(Math.floor(yoke.totalYokeRounds / 2));
      expect(yoke.plainRounds + yoke.increaseRounds).toBe(yoke.totalYokeRounds);

      expect(yoke.finalBodyStitches).toBeGreaterThan(yoke.bodyStitchesBeforeSplit);
      expect(yoke.finalSleeveStitches).toBeGreaterThan(yoke.sleeveStitchesBeforeSplit);

      expect(yoke.resultingChestCircumferenceCm).toBeGreaterThan(80);
      expect(yoke.resultingSleeveCircumferenceCm).toBeGreaterThan(25);
      expect(yoke.summaryPl).toContain('Głębokość karczku');
      expect(yoke.summaryPl).toContain('podkrojów pach');
    });

    it('generuje znak plus w podsumowaniu przy dodatniej różnicy obwodu rękawa', () => {
      const yoke = RaglanCalculator.calculateYokeIncreases({
        stitchGaugePer10cm: 20,
        rowGaugePer10cm: 28,
        desiredChestCircumferenceCm: 100,
        desiredSleeveCircumferenceCm: 20,
        yokeDepthCm: 22,
        initialBackStitches: 28,
        initialFrontStitches: 28,
        initialSleeveStitches: 14,
        raglanLineStitches: 2,
        underarmCastOnStitches: 8,
      });
      expect(yoke.sleeveDifferenceCm).toBeGreaterThan(0);
      expect(yoke.summaryPl).toContain('obwód rękawa');
      expect(yoke.summaryPl).toContain('+');
    });

    it('rzuca błąd przy niedozwolonych parametrach karczku', () => {
      expect(() =>
        RaglanCalculator.calculateYokeIncreases({
          stitchGaugePer10cm: 0,
          rowGaugePer10cm: 28,
          desiredChestCircumferenceCm: 100,
          desiredSleeveCircumferenceCm: 34,
          yokeDepthCm: 20,
          initialBackStitches: 20,
          initialFrontStitches: 20,
          initialSleeveStitches: 10,
        })
      ).toThrow('Gęstość próbki musi być większa od 0');

      expect(() =>
        RaglanCalculator.calculateYokeIncreases({
          stitchGaugePer10cm: 20,
          rowGaugePer10cm: 28,
          desiredChestCircumferenceCm: -100,
          desiredSleeveCircumferenceCm: 34,
          yokeDepthCm: 20,
          initialBackStitches: 20,
          initialFrontStitches: 20,
          initialSleeveStitches: 10,
        })
      ).toThrow('Docelowe wymiary i głębokość karczku muszą być większe od 0');
    });
  });
});
