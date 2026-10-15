import {
  calculateEvenIncreases,
  calculateEvenDecreases,
  calculateMultiRowShaping,
} from '../shaping-calculator';

describe('Silnik Kształtowania i Równomiernego Dodawania/Odejmowania Oczek (Shaping Calculator)', () => {
  describe('calculateEvenIncreases', () => {
    test('zwraca tryb none gdy liczba oczek jest identyczna', () => {
      const res = calculateEvenIncreases(60, 60);
      expect(res.mode).toBe('none');
      expect(res.difference).toBe(0);
      expect(res.isValid).toBe(true);
      expect(res.summaryPL).toContain('nie wykonuj dodawań');
    });

    test('zgłasza błąd gdy docelowa liczba oczek jest mniejsza niż początkowa', () => {
      const res = calculateEvenIncreases(80, 70);
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toBe('TARGET_LESS_THAN_CURRENT');
    });

    test('zgłasza błąd gdy oczka brzegowe przekraczają liczbę oczek', () => {
      const res = calculateEvenIncreases(10, 15, 6); // 2 x 6 = 12 > 10
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toBe('EDGE_EXCEEDS_TOTAL');
    });

    test('zgłasza błąd dla kfb gdy brak wystarczającej liczby oczek roboczych', () => {
      const res = calculateEvenIncreases(10, 25, 0, 'kfb'); // diff = 15 > 10
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toBe('INSUFFICIENT_STITCHES_FOR_KFB');
    });

    test('wylicza równomierne dodawanie z resztą 0 bez brzegów', () => {
      // 60 oczek początkowych, 72 docelowe -> dodaj 12 oczek (60 / 12 = 5)
      const res = calculateEvenIncreases(60, 72, 0, 'M1L');
      expect(res.isValid).toBe(true);
      expect(res.difference).toBe(12);
      expect(res.groups).toHaveLength(1);
      expect(res.groups[0].normalStitches).toBe(5);
      expect(res.groups[0].repeatCount).toBe(12);
      expect(res.summaryPL).toContain('przerób 5 o., dodaj 1 o. (M1L)* × 12');
      expect(res.shortNotation).toBe('[k5, M1L] × 12');
    });

    test('wylicza równomierne dodawanie z resztą i oczkami brzegowymi', () => {
      // 78 oczek, 96 docelowych -> diff = 18. Brzegi = 2 (używalnych = 78 - 4 = 74).
      // 74 / 18 = 4 z resztą 2. Większe (4+1=5): 2 razy, mniejsze (4): 16 razy.
      const res = calculateEvenIncreases(78, 96, 2, 'M1R');
      expect(res.isValid).toBe(true);
      expect(res.difference).toBe(18);
      expect(res.groups).toHaveLength(2);
      expect(res.groups[0].normalStitches).toBe(5);
      expect(res.groups[0].repeatCount).toBe(2);
      expect(res.groups[1].normalStitches).toBe(4);
      expect(res.groups[1].repeatCount).toBe(16);
      expect(res.summaryPL).toContain('Brzeg: 2 o.');
      expect(res.summaryEN).toContain('Edge 2 sts');
      expect(res.shortNotation).toContain('2 o., [k5, M1R] × 2, [k4, M1R] × 16, 2 o.');
    });

    test('obsługuje dodawanie gdy normalStitches wynosi 0', () => {
      const res = calculateEvenIncreases(4, 10, 0, 'yo'); // diff = 6, 4 / 6 = 0, reszta 4
      expect(res.isValid).toBe(true);
      expect(res.groups[0].normalStitches).toBe(1);
      expect(res.groups[1].normalStitches).toBe(0);
      expect(res.summaryPL).toContain('dodaj 1 o. (yo)* × 2');
    });
  });

  describe('calculateEvenDecreases', () => {
    test('zwraca tryb none gdy liczba oczek jest równa', () => {
      const res = calculateEvenDecreases(50, 50);
      expect(res.mode).toBe('none');
      expect(res.difference).toBe(0);
      expect(res.isValid).toBe(true);
    });

    test('zgłasza błąd gdy docelowa liczba oczek jest większa', () => {
      const res = calculateEvenDecreases(60, 70);
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toBe('TARGET_GREATER_THAN_CURRENT');
    });

    test('zgłasza błąd gdy oczka brzegowe przekraczają sumę oczek', () => {
      const res = calculateEvenDecreases(10, 8, 6); // 2 * 6 = 12 > 10
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toBe('EDGE_EXCEEDS_TOTAL');
    });

    test('zgłasza błąd gdy wymagana liczba oczek do odejmowania przekracza dostępne', () => {
      // 50 oczek, chcemy 20 -> diff = 30. Wymaga 30 * 2 = 60 oczek > 50!
      const res = calculateEvenDecreases(50, 20, 0, 'k2tog');
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toBe('EXCESSIVE_DECREASES_FOR_ROW');
    });

    test('wylicza równomierne odejmowanie z zerową resztą', () => {
      // 60 oczek -> 48 oczek. Diff = 12. Zużyte: 24. Pozostałe pojedyncze: 36.
      // 36 / 12 = 3. Każda grupa: przerób 3 o., k2tog.
      const res = calculateEvenDecreases(60, 48, 0, 'k2tog');
      expect(res.isValid).toBe(true);
      expect(res.difference).toBe(12);
      expect(res.groups).toHaveLength(1);
      expect(res.groups[0].normalStitches).toBe(3);
      expect(res.groups[0].repeatCount).toBe(12);
      expect(res.shortNotation).toBe('[k3, k2tog] × 12');
    });

    test('wylicza równomierne odejmowanie z resztą i oczkami brzegowymi', () => {
      // 80 oczek -> 68 oczek, brzegi = 2. Używalnych = 76.
      // Diff = 12. Zużyte na k2tog: 24. Pozostałe pojedyncze: 76 - 24 = 52.
      // 52 / 12 = 4 z resztą 4.
      // Większe (4+1=5): 4 razy, mniejsze (4): 8 razy.
      const res = calculateEvenDecreases(80, 68, 2, 'ssk');
      expect(res.isValid).toBe(true);
      expect(res.difference).toBe(12);
      expect(res.groups).toHaveLength(2);
      expect(res.groups[0].normalStitches).toBe(5);
      expect(res.groups[0].repeatCount).toBe(4);
      expect(res.groups[1].normalStitches).toBe(4);
      expect(res.groups[1].repeatCount).toBe(8);
      expect(res.summaryPL).toContain('Brzeg: 2 o.');
      expect(res.summaryEN).toContain('Edge 2 sts');
      expect(res.shortNotation).toContain('2 o., [k5, ssk] × 4, [k4, ssk] × 8, 2 o.');
    });

    test('obsługuje odejmowanie gdy normalStitches wynosi 0', () => {
      // 12 oczek -> 6 oczek. Diff = 6. Zużyte: 12. Pozostałe: 0.
      const res = calculateEvenDecreases(12, 6, 0, 'p2tog');
      expect(res.isValid).toBe(true);
      expect(res.groups[0].normalStitches).toBe(0);
      expect(res.summaryPL).toContain('*p2tog* × 6');
    });
  });

  describe('calculateMultiRowShaping', () => {
    test('zwraca tryb none gdy oczka początkowe i końcowe są równe', () => {
      const res = calculateMultiRowShaping({
        startStitches: 40,
        endStitches: 40,
        totalRows: 20,
        shapingPlacement: 'both_edges',
      });
      expect(res.mode).toBe('none');
      expect(res.isValid).toBe(true);
      expect(res.summaryPL).toContain('bez zmiany liczby oczek');
    });

    test('zgłasza błąd gdy diff jest nieparzysty dla both_edges', () => {
      const res = calculateMultiRowShaping({
        startStitches: 40,
        endStitches: 45, // diff = 5 (nieparzysty)
        totalRows: 20,
        shapingPlacement: 'both_edges',
      });
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toBe('ODD_DIFF_FOR_BOTH_EDGES');
    });

    test('zgłasza błąd gdy liczba akcji przekracza liczbę rzędów', () => {
      const res = calculateMultiRowShaping({
        startStitches: 40,
        endStitches: 80, // diff = 40, single_edge -> 40 akcji
        totalRows: 20,
        shapingPlacement: 'single_edge',
      });
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toBe('ACTIONS_EXCEED_ROWS');
    });

    test('wylicza symetryczne poszerzanie rękawa na obu brzegach (RS only)', () => {
      // 40 oczek -> 60 oczek w 40 rzędach. Diff = 20. Po 2 oczka na akcję -> 10 akcji.
      // 40 rzędów / 10 akcji = co 4 rzędy dokładnie (liczba parzysta).
      const res = calculateMultiRowShaping({
        startStitches: 40,
        endStitches: 60,
        totalRows: 40,
        shapingPlacement: 'both_edges',
        workSidePreference: 'right_side_only',
      });
      expect(res.isValid).toBe(true);
      expect(res.mode).toBe('increase');
      expect(res.phases).toHaveLength(1);
      expect(res.phases[0].everyNthRow).toBe(4);
      expect(res.phases[0].repeatTimes).toBe(10);
      expect(res.summaryPL).toContain('Dodawaj po 1 o. na każdym brzegu co 4 rzędów × 10 razy');
    });

    test('wylicza poszerzanie z podziałem na 2 fazy interwałów', () => {
      // 40 oczek -> 60 oczek w 48 rzędach. 10 akcji.
      // 48 / 10 = 4, reszta 8.
      const res = calculateMultiRowShaping({
        startStitches: 40,
        endStitches: 60,
        totalRows: 48,
        shapingPlacement: 'both_edges',
        workSidePreference: 'right_side_only',
      });
      expect(res.isValid).toBe(true);
      expect(res.phases.length).toBeGreaterThan(0);
      expect(res.summaryPL).toContain('Dodawaj');
    });

    test('dostosowuje nieparzysty baseInterval dla preferencji RS only', () => {
      // 40 -> 60 oczek (10 akcji) w 35 rzędach -> 35 / 10 = 3 (nieparzysty > 1)
      const res = calculateMultiRowShaping({
        startStitches: 40,
        endStitches: 60,
        totalRows: 35,
        shapingPlacement: 'both_edges',
        workSidePreference: 'right_side_only',
      });
      expect(res.isValid).toBe(true);
      expect(res.phases.length).toBeGreaterThan(0);
    });

    test('wylicza zwężanie pojedynczego brzegu bez preferencji RS (any_row)', () => {
      // 50 oczek -> 40 oczek w 30 rzędach. Diff = 10. single_edge -> 10 akcji.
      // 30 / 10 = co 3 rzędy.
      const res = calculateMultiRowShaping({
        startStitches: 50,
        endStitches: 40,
        totalRows: 30,
        shapingPlacement: 'single_edge',
        workSidePreference: 'any_row',
      });
      expect(res.isValid).toBe(true);
      expect(res.mode).toBe('decrease');
      expect(res.phases[0].everyNthRow).toBe(3);
      expect(res.phases[0].repeatTimes).toBe(10);
      expect(res.summaryPL).toContain('Odejmuj 1 o. co 3 rzędów × 10 razy');
    });
  });
});
