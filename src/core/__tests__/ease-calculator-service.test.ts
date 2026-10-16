import {
  getEasePresets,
  getStandardGarmentSizes,
  findStandardSizeByBust,
  calculateDetailedEase,
  recommendPatternSize,
  adaptStitchesWithRecommendation,
  EASE_PRESETS,
  STANDARD_ADULT_SIZES,
} from '../ease-calculator-service';

describe('EaseCalculatorService (Kalkulator Luzu Odzieżowego i Doboru Rozmiaru)', () => {
  describe('Presety i standardy rozmiarów', () => {
    it('zwraca kompletną listę presetów luzu odzieżowego', () => {
      const presets = getEasePresets();
      expect(presets).toHaveLength(8);
      expect(presets[0].id).toBe('negative_socks');
      expect(presets[2].id).toBe('zero_ease');
      expect(presets[4].id).toBe('classic_fit');
      expect(presets[7].id).toBe('boxy_fit');
    });

    it('zwraca standardowe rozmiary sylwetki dorosłych CYC/ISO', () => {
      const sizes = getStandardGarmentSizes();
      expect(sizes).toHaveLength(9);
      expect(sizes[0].code).toBe('XS');
      expect(sizes[8].code).toBe('5XL');
    });

    it('wyszukuje rozmiar standardowy na podstawie obwodu biustu/klatki', () => {
      expect(findStandardSizeByBust(0)).toBeNull();
      expect(findStandardSizeByBust(-10)).toBeNull();

      // Dokładne przedziały
      expect(findStandardSizeByBust(73)?.code).toBe('XS');
      expect(findStandardSizeByBust(84)?.code).toBe('S');
      expect(findStandardSizeByBust(94)?.code).toBe('M');
      expect(findStandardSizeByBust(104)?.code).toBe('L');
      expect(findStandardSizeByBust(115)?.code).toBe('XL');
      expect(findStandardSizeByBust(125)?.code).toBe('2XL');
      expect(findStandardSizeByBust(135)?.code).toBe('3XL');
      expect(findStandardSizeByBust(145)?.code).toBe('4XL');
      expect(findStandardSizeByBust(155)?.code).toBe('5XL');

      // Wartości poza przedziałami (znajduje najbliższy)
      expect(findStandardSizeByBust(55)?.code).toBe('XS');
      expect(findStandardSizeByBust(78)?.code).toBe('XS');
      expect(findStandardSizeByBust(80)?.code).toBe('S');
      expect(findStandardSizeByBust(200)?.code).toBe('5XL');
    });
  });

  describe('calculateDetailedEase', () => {
    it('rzuca błąd przy nieprawidłowych wymiarach', () => {
      expect(() => calculateDetailedEase(0, 100)).toThrow('Wymiary ciała i gotowej dzianiny muszą być większe od 0');
      expect(() => calculateDetailedEase(90, -5)).toThrow('Wymiary ciała i gotowej dzianiny muszą być większe od 0');
    });

    it('poprawnie ocenia luz zerowy (dopasowany)', () => {
      const result = calculateDetailedEase(90, 90);
      expect(result.easeCm).toBe(0);
      expect(result.percentageOfBody).toBe(0);
      expect(result.isNegative).toBe(false);
      expect(result.category).toBe('dopasowany');
      expect(result.summaryPl).toContain('0 cm luzu');
    });

    it('poprawnie ocenia luz dodatni (klasyczny sweter)', () => {
      const result = calculateDetailedEase(92, 100);
      expect(result.easeCm).toBe(8);
      expect(result.percentageOfBody).toBeCloseTo(8.7, 1);
      expect(result.isNegative).toBe(false);
      expect(result.category).toBe('klasyczny');
      expect(result.summaryPl).toContain('Luz dodatni +8 cm');
    });

    it('poprawnie ocenia luz ujemny (skarpeta lub elastyczny top)', () => {
      const result = calculateDetailedEase(95, 87);
      expect(result.easeCm).toBe(-8);
      expect(result.isNegative).toBe(true);
      expect(result.category).toBe('bardzo dopasowany');
      expect(result.summaryPl).toContain('Luz ujemny -8 cm');
      expect(result.summaryPl).toContain('rozciągnięta na sylwetce');
    });
  });

  describe('recommendPatternSize', () => {
    const patternSizes = [
      { name: '1 (XS)', finishedCircumferenceCm: 85 },
      { name: '2 (S)', finishedCircumferenceCm: 95 },
      { name: '3 (M)', finishedCircumferenceCm: 105 },
      { name: '4 (L)', finishedCircumferenceCm: 115 },
      { name: '5 (XL)', finishedCircumferenceCm: 125 },
    ];

    it('rzuca błąd przy nieprawidłowych danych wejściowych', () => {
      expect(() => recommendPatternSize(0, 5, patternSizes)).toThrow('Obwód ciała musi być większy od 0');
      expect(() => recommendPatternSize(90, 5, [])).toThrow('Lista rozmiarów we wzorze nie może być pusta');
      expect(() => recommendPatternSize(10, -20, patternSizes)).toThrow('Docelowy obwód dzianiny musi być większy od 0');
      expect(() =>
        recommendPatternSize(90, 5, [{ name: 'Błędny', finishedCircumferenceCm: -10 }])
      ).toThrow('ma nieprawidłowy obwód <= 0');
    });

    it('rekomenduje rozmiar najbliższy docelowemu obwodowi z uwzględnieniem pożądanego luzu', () => {
      // Ciało 92 cm, pożądany luz +10 cm -> cel 102 cm.
      // Rozmiar 2 = 95 cm (luz +3 cm, diff 7 cm)
      // Rozmiar 3 = 105 cm (luz +13 cm, diff 3 cm) -> Najbliższy!
      const rec = recommendPatternSize(92, 10, patternSizes);
      expect(rec.targetGarmentCircumferenceCm).toBe(102);
      expect(rec.desiredEaseCm).toBe(10);
      expect(rec.recommendedSize.name).toBe('3 (M)');
      expect(rec.recommendedSize.isClosest).toBe(true);
      expect(rec.recommendedSize.resultingEaseCm).toBe(13);
      expect(rec.allCandidates).toHaveLength(5);
      expect(rec.explanationPl).toContain('najlepszym rozmiarem jest „3 (M)”');
    });

    it('obsługuje pożądany luz ujemny dla czapek/skarpet', () => {
      const sockSizes = [
        { name: 'Dziecięcy', finishedCircumferenceCm: 16 },
        { name: 'Damski S/M', finishedCircumferenceCm: 19 },
        { name: 'Męski L', finishedCircumferenceCm: 22 },
      ];
      // Obwód stopy 21 cm, pożądany luz -2 cm -> cel 19 cm.
      const rec = recommendPatternSize(21, -2, sockSizes);
      expect(rec.recommendedSize.name).toBe('Damski S/M');
      expect(rec.recommendedSize.resultingEaseCm).toBe(-2);
      expect(rec.recommendedSize.isClosest).toBe(true);
    });
  });

  describe('adaptStitchesWithRecommendation', () => {
    it('rzuca błąd przy niedozwolonych wartościach zerowych lub ujemnych', () => {
      expect(() =>
        adaptStitchesWithRecommendation({
          patternStitches: 0,
          patternGaugePer10cm: 20,
          myGaugePer10cm: 22,
        })
      ).toThrow('Parametry oczek i gęstości próbki muszą być większe od 0');
    });

    it('dokonuje adaptacji oczek z rekomendacją wariantu najbliższego docelowej szerokości', () => {
      // Wzór: 100 oczek przy 20 o. / 10 cm -> cel: 50.0 cm szerokości
      // Moja próbka: 22 o. / 10 cm (2.2 o./cm) -> dokładnie 110 oczek
      const result = adaptStitchesWithRecommendation({
        patternStitches: 100,
        patternGaugePer10cm: 20,
        myGaugePer10cm: 22,
        repeatMultiple: 4,
        edgeStitches: 2,
      });

      expect(result.originalTargetWidthCm).toBe(50);
      expect(result.exactStitches).toBe(110);
      expect(result.recommendedStitches).toBeGreaterThanOrEqual(108);
      expect(result.advicePl).toContain('Zalecany wariant');
      expect(result.advicePl).toContain('raportu po 4 o.');
    });

    it('wybiera upperCandidate, jeśli jest bliżej niż lowerCandidate', () => {
      // Wzór: 50 oczek przy 20 o. / 10 cm -> cel: 25.0 cm
      // Moja próbka: 21 o. / 10 cm -> exact: 52.5 oczek.
      // repeat = 10, edge = 0.
      // lower: k=5 -> 50 o. (50 / 2.1 = 23.8 cm, diff 1.2 cm)
      // upper: k=6 -> 60 o. (60 / 2.1 = 28.57 cm, diff 3.57 cm) -> lower is closer!
      const lowerCloser = adaptStitchesWithRecommendation({
        patternStitches: 50,
        patternGaugePer10cm: 20,
        myGaugePer10cm: 21,
        repeatMultiple: 10,
        edgeStitches: 0,
      });
      expect(lowerCloser.chosenCandidate).toBe('lower');
      expect(lowerCloser.recommendedStitches).toBe(50);

      // Teraz przypadek gdzie upper jest bliżej:
      // Wzór: 58 oczek przy 20 o. / 10 cm -> cel: 29.0 cm
      // Moja próbka: 20 o. / 10 cm -> exact: 58 oczek.
      // repeat = 10, edge = 0 -> kFloor = 5 (50 o. -> 25.0 cm, diff 4.0 cm), kCeil = 6 (60 o. -> 30.0 cm, diff 1.0 cm)
      const upperCloser = adaptStitchesWithRecommendation({
        patternStitches: 58,
        patternGaugePer10cm: 20,
        myGaugePer10cm: 20,
        repeatMultiple: 10,
        edgeStitches: 0,
      });
      expect(upperCloser.chosenCandidate).toBe('upper');
      expect(upperCloser.recommendedStitches).toBe(60);
    });

    it('działa poprawnie bez raportu (repeatMultiple = 1, edgeStitches = 0)', () => {
      const result = adaptStitchesWithRecommendation({
        patternStitches: 100,
        patternGaugePer10cm: 20,
        myGaugePer10cm: 22,
      });
      expect(result.recommendedStitches).toBe(110);
      expect(result.advicePl).not.toContain('raportu po');
    });
  });
});
