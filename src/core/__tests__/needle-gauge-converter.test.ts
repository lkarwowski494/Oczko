import {
  NEEDLE_SIZE_TABLE,
  findClosestMetricNeedle,
  convertNeedleSize,
  convertCraftLength,
  convertCraftWeight,
  convertGaugeTension,
} from '../needle-gauge-converter';

describe('Silnik Konwersji Rozmiarów Drutów i Jednostek (needle-gauge-converter)', () => {
  describe('findClosestMetricNeedle', () => {
    test('znajduje dokładne i najbliższe rozmiary metryczne', () => {
      expect(findClosestMetricNeedle(4.0).metricMm).toBe(4.0);
      expect(findClosestMetricNeedle(4.1).metricMm).toBe(4.0);
      expect(findClosestMetricNeedle(4.4).metricMm).toBe(4.5);
      expect(findClosestMetricNeedle(1.5).metricMm).toBe(2.0); // poniżej minimum
      expect(findClosestMetricNeedle(30.0).metricMm).toBe(25.0); // powyżej maksimum
    });
  });

  describe('convertNeedleSize', () => {
    test('konwertuje rozmiar podany jako liczba (mm)', () => {
      const res = convertNeedleSize(4.0, 'metric');
      expect(res.metricMm).toBe(4.0);
      expect(res.us).toBe('US 6');
      expect(res.uk).toBe('UK 8');
      expect(res.jp).toBe('6 (3.9 mm)');
      expect(res.crochet).toBe('G-6');
    });

    test('konwertuje rozmiar podany jako string w systemie metrycznym', () => {
      const res = convertNeedleSize('3.5 mm', 'metric');
      expect(res.metricMm).toBe(3.5);
      expect(res.us).toBe('US 4');

      const resNan = convertNeedleSize('tekst', 'metric');
      expect(resNan.metricMm).toBe(4.0); // fallback do 4.0
    });

    test('konwertuje z systemu US', () => {
      const res1 = convertNeedleSize('US 8', 'us');
      expect(res1.metricMm).toBe(5.0);

      const res2 = convertNeedleSize('8', 'us');
      expect(res2.metricMm).toBe(5.0);

      const resNotFound = convertNeedleSize('US 999', 'us');
      expect(resNotFound.metricMm).toBe(4.0);
    });

    test('konwertuje z systemu UK', () => {
      const res1 = convertNeedleSize('UK 10', 'uk');
      expect(res1.metricMm).toBe(3.25);

      const res2 = convertNeedleSize('10', 'uk');
      expect(res2.metricMm).toBe(3.25);

      const resNotFound = convertNeedleSize('UK 999', 'uk');
      expect(resNotFound.metricMm).toBe(4.0);
    });

    test('konwertuje z systemu japońskiego (JP)', () => {
      const res1 = convertNeedleSize('3', 'jp');
      expect(res1.metricMm).toBe(3.0);

      const resNotFound = convertNeedleSize('99', 'jp');
      expect(resNotFound.metricMm).toBe(4.0);
    });
  });

  describe('convertCraftLength', () => {
    test('przelicza metry na jardy i odwrotnie', () => {
      // 100 m = ~109.36 yd
      expect(convertCraftLength(100, 'meters', 'yards')).toBe(109.36);
      // 109.36 yd = ~100.00 m
      expect(convertCraftLength(109.36, 'yards', 'meters')).toBe(100);
      // Ta sama jednostka
      expect(convertCraftLength(50, 'meters', 'meters')).toBe(50);
    });

    test('obsługuje zera, liczby ujemne i NaN', () => {
      expect(convertCraftLength(0, 'meters', 'yards')).toBe(0);
      expect(convertCraftLength(-10, 'meters', 'yards')).toBe(0);
      expect(convertCraftLength(NaN, 'meters', 'yards')).toBe(0);
    });
  });

  describe('convertCraftWeight', () => {
    test('przelicza uncje na gramy i odwrotnie', () => {
      // 1 oz = 28.35 g
      expect(convertCraftWeight(1, 'ounces', 'grams')).toBe(28.35);
      // 100 g = ~3.53 oz
      expect(convertCraftWeight(100, 'grams', 'ounces')).toBe(3.53);
      // Ta sama jednostka
      expect(convertCraftWeight(50, 'grams', 'grams')).toBe(50);
    });

    test('obsługuje zera, liczby ujemne i NaN', () => {
      expect(convertCraftWeight(0, 'grams', 'ounces')).toBe(0);
      expect(convertCraftWeight(-5, 'grams', 'ounces')).toBe(0);
      expect(convertCraftWeight(NaN, 'grams', 'ounces')).toBe(0);
    });
  });

  describe('convertGaugeTension', () => {
    test('przelicza gęstość próbki 10cm na 4 cale i odwrotnie', () => {
      // 20 oczek na 10 cm = 20.3 oczek na 4 cale
      expect(convertGaugeTension(20, '10cm', '4inch')).toBe(20.3);
      // 20.3 oczka na 4 cale = 20.0 oczek na 10 cm
      expect(convertGaugeTension(20.3, '4inch', '10cm')).toBe(20);
      // Ta sama jednostka
      expect(convertGaugeTension(22, '10cm', '10cm')).toBe(22);
    });

    test('obsługuje zera, wartości ujemne i NaN', () => {
      expect(convertGaugeTension(0, '10cm', '4inch')).toBe(0);
      expect(convertGaugeTension(-10, '10cm', '4inch')).toBe(0);
      expect(convertGaugeTension(NaN, '10cm', '4inch')).toBe(0);
    });
  });

  describe('NEEDLE_SIZE_TABLE', () => {
    test('tabela zawiera standardowe rozmiary', () => {
      expect(NEEDLE_SIZE_TABLE.length).toBeGreaterThanOrEqual(20);
      expect(NEEDLE_SIZE_TABLE[0].metricMm).toBe(2.0);
    });
  });
});
