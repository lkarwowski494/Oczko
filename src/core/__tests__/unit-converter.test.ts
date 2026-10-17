import {
  metersToYards,
  yardsToMeters,
  gramsToOunces,
  ouncesToGrams,
  cmToInches,
  inchesToCm,
  swatch10cmTo4inch,
  swatch4inchTo10cm,
  formatLength,
  formatWeight,
  formatGauge,
  formatNeedleSize,
  getUnitSystem,
  setUnitSystem,
  subscribeUnitSystem,
  UnitSystem,
} from '../unit-converter';

describe('Moduł 17 / Apps4Brew Core: Unit Converter (Metric & Imperial — Zadanie O4)', () => {
  test('przelicza długości metry <-> jardy', () => {
    expect(metersToYards(100)).toBeCloseTo(109.36, 1);
    expect(yardsToMeters(109.36)).toBeCloseTo(100, 1);
    expect(metersToYards(0)).toBe(0);
    expect(metersToYards(-5)).toBe(0);
  });

  test('przelicza wagę gramy <-> uncje', () => {
    expect(gramsToOunces(100)).toBeCloseTo(3.53, 1);
    expect(ouncesToGrams(3.53)).toBeCloseTo(100, 0);
    expect(gramsToOunces(0)).toBe(0);
    expect(gramsToOunces(-10)).toBe(0);
  });

  test('przelicza wymiary cm <-> cale', () => {
    expect(cmToInches(10)).toBeCloseTo(3.94, 2);
    expect(inchesToCm(4)).toBeCloseTo(10.16, 2);
    expect(cmToInches(0)).toBe(0);
    expect(cmToInches(-5)).toBe(0);
    expect(inchesToCm(0)).toBe(0);
    expect(inchesToCm(-5)).toBe(0);
  });

  test('przelicza gęstość próbki 10 cm <-> 4 cale wg Craft Yarn Council', () => {
    expect(swatch10cmTo4inch(22)).toBe(22.4);
    expect(swatch4inchTo10cm(22.4)).toBe(22.0);
    expect(swatch10cmTo4inch(0)).toBe(0);
  });

  test('formatuje wartości w trybie metrycznym i imperialnym', () => {
    // Długość
    expect(formatLength(400, 'metric')).toBe('400 m');
    expect(formatLength(400, 'imperial')).toContain('yd');

    // Waga
    expect(formatWeight(100, 'metric')).toBe('100 g');
    expect(formatWeight(100, 'imperial')).toContain('oz');

    // Próbka
    expect(formatGauge(22, 'metric')).toBe('22 o. / 10 cm');
    expect(formatGauge(22, 'imperial')).toContain('sts / 4 in');

    // Rozmiar drutów
    expect(formatNeedleSize(4.0, 'metric')).toBe('4.0 mm');
    expect(formatNeedleSize(4.0, 'imperial')).toContain('US 6');

    // Domyślny parametr system = 'metric'
    expect(formatLength(400)).toBe('400 m');
    expect(formatWeight(100)).toBe('100 g');
    expect(formatGauge(22)).toBe('22 o. / 10 cm');
    expect(formatNeedleSize(4.0)).toBe('4.0 mm');
  });

  test('zarządza aktywnym systemem jednostek i powiadamianiem subskrybentów', () => {
    setUnitSystem('metric');
    expect(getUnitSystem()).toBe('metric');

    let notified: UnitSystem = 'metric';
    const unsubscribe = subscribeUnitSystem((sys) => {
      notified = sys;
    });

    setUnitSystem('imperial');
    expect(getUnitSystem()).toBe('imperial');
    expect(notified).toBe('imperial');

    unsubscribe();
    setUnitSystem('metric');
    expect(getUnitSystem()).toBe('metric');
    expect(notified).toBe('imperial'); // nie powiadomiono po odsubskrybowaniu
  });

  test('wInKeep — konwersja bez dryfu zaokrągleń (RD-ENG-01, BR-TEST-005, NFR-INT-003)', () => {
    const { wInKeep } = require('../unit-converter');

    // 4 wektory testowe z tabeli RD-ENG-01
    // • wInKeep("135", "lb", 61.23) -> 61.23 (brak dryfu na 61.25)
    expect(wInKeep('135', 'lb', 61.23)).toBe(61.23);

    // • wInKeep("135,0", "lb", 61.23) -> 61.23
    expect(wInKeep('135,0', 'lb', 61.23)).toBe(61.23);

    // • wInKeep("140", "lb", 61.23) -> 63.5
    expect(wInKeep('140', 'lb', 61.23)).toBe(63.5);

    // • wInKeep("80,5", "kg", 80) -> 80.5
    expect(wInKeep('80,5', 'kg', 80)).toBe(80.5);

    // Dodatkowe jednostki dziewiarskie: cale (in) vs cm
    // 10 cm = 3.937 in -> round_0.1 = 3.9 in
    expect(wInKeep('3.9', 'in', 10.0)).toBe(10.0);
    expect(wInKeep('3,9', 'in', 10.0)).toBe(10.0);
    expect(wInKeep('4.5', 'in', 10.0)).toBe(11.43);

    // Uncje (oz) vs gramy (g)
    // 50 g = 1.7637 oz -> round_0.1 = 1.8 oz
    expect(wInKeep('1.8', 'oz', 50.0)).toBe(50.0);
    expect(wInKeep('2.0', 'oz', 50.0)).toBe(56.7);

    // Jardy (yd) vs metry (m)
    expect(wInKeep('109.4', 'yd', 100.0)).toBe(100.0);

    // Przypadki brzegowe: puste / błędne / zerowe
    expect(wInKeep('abc', 'lb', 61.23)).toBe(0);
    expect(wInKeep('', 'lb', 61.23)).toBe(0);
    expect(wInKeep(135, 'lb', 61.23)).toBe(61.23);
    expect(wInKeep('135', 'lb', 0)).toBe(61.23); // prevBase = 0 traktowane jako brak poprzedniej wartości
  });
});

