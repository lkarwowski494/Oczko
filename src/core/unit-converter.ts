/**
 * Apps4Brew Core — Podwójny System Jednostek (Metric & Imperial — Złoty Standard #4, Zadanie O4)
 * Zapewnia:
 * 1. Przeliczanie długości (metry <-> jardy)
 * 2. Przeliczanie wagi (gramy <-> uncje)
 * 3. Przeliczanie wymiarów (cm <-> cale)
 * 4. Przeliczanie gęstości próbki obliczeniowej (10x10 cm <-> 4x4 cale wg Craft Yarn Council)
 * 5. Formatowanie z uwzględnieniem wybranego systemu jednostek
 */

import {
  convertCraftLength,
  convertCraftWeight,
  convertGaugeTension,
  findClosestMetricNeedle,
} from './needle-gauge-converter';

export type UnitSystem = 'metric' | 'imperial';

let currentUnitSystem: UnitSystem = 'metric';
type UnitSystemListener = (sys: UnitSystem) => void;
const unitListeners = new Set<UnitSystemListener>();

export function setUnitSystem(sys: UnitSystem): void {
  currentUnitSystem = sys;
  unitListeners.forEach((fn) => fn(sys));
}

export function getUnitSystem(): UnitSystem {
  return currentUnitSystem;
}

export function subscribeUnitSystem(listener: UnitSystemListener): () => void {
  unitListeners.add(listener);
  return () => {
    unitListeners.delete(listener);
  };
}

export const CM_PER_INCH = 2.54;

/**
 * Przelicza metry na jardy.
 */
export function metersToYards(meters: number): number {
  return convertCraftLength(meters, 'meters', 'yards');
}

/**
 * Przelicza jardy na metry.
 */
export function yardsToMeters(yards: number): number {
  return convertCraftLength(yards, 'yards', 'meters');
}

/**
 * Przelicza gramy na uncje wagowe (oz).
 */
export function gramsToOunces(grams: number): number {
  return convertCraftWeight(grams, 'grams', 'ounces');
}

/**
 * Przelicza uncje wagowe (oz) na gramy.
 */
export function ouncesToGrams(ounces: number): number {
  return convertCraftWeight(ounces, 'ounces', 'grams');
}

/**
 * Przelicza centymetry na cale.
 */
export function cmToInches(cm: number): number {
  if (cm <= 0 || isNaN(cm)) return 0;
  return Math.round((cm / CM_PER_INCH) * 100) / 100;
}

/**
 * Przelicza cale na centymetry.
 */
export function inchesToCm(inches: number): number {
  if (inches <= 0 || isNaN(inches)) return 0;
  return Math.round((inches * CM_PER_INCH) * 100) / 100;
}

/**
 * Przelicza próbkę ściegu z 10 cm na 4 cale.
 */
export function swatch10cmTo4inch(stitchesPer10cm: number): number {
  return convertGaugeTension(stitchesPer10cm, '10cm', '4inch');
}

/**
 * Przelicza próbkę ściegu z 4 cali na 10 cm.
 */
export function swatch4inchTo10cm(stitchesPer4inch: number): number {
  return convertGaugeTension(stitchesPer4inch, '4inch', '10cm');
}

/**
 * Formatuje długość motka / robótki wg aktywnego systemu jednostek.
 */
export function formatLength(meters: number, system: UnitSystem = 'metric'): string {
  if (system === 'imperial') {
    return `${metersToYards(meters)} yd`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Formatuje wagę motka wg aktywnego systemu jednostek.
 */
export function formatWeight(grams: number, system: UnitSystem = 'metric'): string {
  if (system === 'imperial') {
    return `${gramsToOunces(grams)} oz`;
  }
  return `${Math.round(grams)} g`;
}

/**
 * Formatuje gęstość próbki wg aktywnego systemu jednostek (CYC).
 */
export function formatGauge(stitchesPer10cm: number, system: UnitSystem = 'metric'): string {
  if (system === 'imperial') {
    return `${swatch10cmTo4inch(stitchesPer10cm)} sts / 4 in`;
  }
  return `${stitchesPer10cm} o. / 10 cm`;
}

/**
 * Formatuje rozmiar drutów uwzględniając standard US w trybie imperialnym.
 */
export function formatNeedleSize(metricMm: number, system: UnitSystem = 'metric'): string {
  const entry = findClosestMetricNeedle(metricMm);
  if (system === 'imperial') {
    return `${entry.usKnitting} (${entry.labelMetric})`;
  }
  return entry.labelMetric;
}

/**
 * RD-ENG-01: Konwersja bez dryfu zaokrągleń (wInKeep).
 * Niech v_prev będzie wartością bazową (np. w kg, g, cm), u jednostką wyświetlania (lb, oz, in),
 * f(v, u) = round_0.1(v * c_u) wartością wyświetlaną, a x_in nową liczbą wpisaną przez użytkownika po zamianie ',' -> '.'.
 * Jeżeli v_prev > 0 oraz round_0.1(x_in) === f(v_prev, u), to funkcja zwraca dokładnie v_prev;
 * w przeciwnym razie zwraca round_0.01(x_in / c_u).
 */
export function wInKeep(
  rawInput: string | number,
  unit: string,
  prevBase?: number
): number {
  const str = typeof rawInput === 'number' ? String(rawInput) : rawInput;
  const normalized = str.trim().replace(',', '.');
  const xIn = parseFloat(normalized);
  if (isNaN(xIn)) return 0;

  let cu = 1.0;
  if (unit === 'lb') cu = 1 / 0.45359237;
  else if (unit === 'oz') cu = 1 / 28.349523125;
  else if (unit === 'in') cu = 1 / 2.54;
  else if (unit === 'yd') cu = 1.0936132983;
  else cu = 1.0;

  const round01 = (v: number) => Math.round(v * 10) / 10;
  const round001 = (v: number) => Math.round(v * 100) / 100;

  if (typeof prevBase === 'number' && prevBase > 0) {
    const displayed = round01(prevBase * cu);
    if (round01(xIn) === displayed) {
      return prevBase;
    }
  }

  return round001(xIn / cu);
}

