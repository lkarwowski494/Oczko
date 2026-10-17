import {
  shouldDebounceClick,
  checkPossibleInterDeviceDuplicate,
  recordCounterStep,
  createUndoEvent,
  mergeEventLogs,
} from '../counter-engine';
import { calculateCastOnAdjustment } from '../gauge-calculator';
import { calculateHatCrown } from '../hat-calculator';
import { convertNeedleSize, NEEDLE_SIZE_TABLE } from '../needle-gauge-converter';
import { RaglanCalculator } from '../raglan-calculator';
import { calculateMultiRowShaping } from '../shaping-calculator';
import { estimateYarnFromSwatch } from '../yarn-usage-estimator';
import { setRecovery, readRecovery, clearRecovery } from '../backup-service';

describe('Domain 100% Branch Coverage Suite (BR-TEST-002, BR-TEST-003)', () => {
  it('pokrywa gałęzie w counter-engine.ts', () => {
    // 1. Domyślny threshold w shouldDebounceClick
    expect(shouldDebounceClick(1000, 1100)).toBe(true);
    expect(shouldDebounceClick(1000, 1500)).toBe(false);

    // 2. checkPossibleInterDeviceDuplicate różne gałęzie
    const ev1 = { id: '1', counterId: 'c1', type: 'INCREMENT' as const, delta: 1, source: 'iphone' as const, timestampMs: 1000 };
    const evDiffCounter = { id: '2', counterId: 'c2', type: 'INCREMENT' as const, delta: 1, source: 'apple_watch' as const, timestampMs: 1050 };
    expect(checkPossibleInterDeviceDuplicate(ev1, evDiffCounter)).toBe(false);

    const evDecrement = { id: '3', counterId: 'c1', type: 'DECREMENT' as const, delta: -1, source: 'apple_watch' as const, timestampMs: 1050 };
    expect(checkPossibleInterDeviceDuplicate(ev1, evDecrement)).toBe(false);

    // 3. Domyślny idPrefix w recordCounterStep
    const steps = recordCounterStep({
      primaryConfig: { id: 'c1', partId: 'p1', name: 'Licznik' },
      direction: 'increment',
      source: 'iphone',
      timestampMs: 5000,
    });
    expect(steps[0].id).toContain('ev_5000_0_c1');

    // 4. Domyślne id w createUndoEvent (brak eventId)
    const undoEv = createUndoEvent({
      counterId: 'c1',
      events: steps,
      source: 'iphone',
      timestampMs: 6000,
    });
    expect(undoEv?.id).toBe('undo_6000_c1');

    // 5. mergeEventLogs z identycznymi znacznikami czasu (sortowanie po id)
    const evA = { id: 'a', counterId: 'c1', type: 'INCREMENT' as const, delta: 1, source: 'iphone' as const, timestampMs: 2000 };
    const evB = { id: 'b', counterId: 'c1', type: 'INCREMENT' as const, delta: 1, source: 'iphone' as const, timestampMs: 2000 };
    const merged = mergeEventLogs([evB], [evA]);
    expect(merged[0].id).toBe('a');
    expect(merged[1].id).toBe('b');

    // 6. checkPossibleInterDeviceDuplicate - prevEvent undefined i to samo źródło
    expect(checkPossibleInterDeviceDuplicate(undefined, evA)).toBe(false);
    expect(checkPossibleInterDeviceDuplicate(evA, { ...evA, id: 'a2', timestampMs: 2050 })).toBe(false);

    // 7. createUndoEvent - sortowanie po id przy tym samym timestampMs
    const undoWithSameTs = createUndoEvent({
      counterId: 'c1',
      events: [evB, evA],
      source: 'iphone',
      timestampMs: 3000,
    });
    expect(undoWithSameTs).not.toBeNull();
  });

  it('pokrywa gałęzie w gauge-calculator.ts', () => {
    expect(calculateCastOnAdjustment(-10, 1.2)).toBe(0);
    expect(calculateCastOnAdjustment(100, -0.5)).toBe(0);
    expect(calculateCastOnAdjustment(0, 1.0)).toBe(0);
  });

  it('pokrywa gałęzie w hat-calculator.ts', () => {
    // brimStyle folded bez podanego brimHeightCm
    const hatFolded = calculateHatCrown({
      headCircumferenceCm: 56,
      gaugeStitchesPer10Cm: 22,
      gaugeRowsPer10Cm: 30,
      brimStyle: 'folded',
      brimHeightCm: 0,
      fitStyle: 'beanie',
      wedges: 6,
    });
    expect(hatFolded.brimHeightCm).toBe(10);

    // fitStyle slouchy bez podanego slouchExtraCm
    const hatSlouch = calculateHatCrown({
      headCircumferenceCm: 56,
      gaugeStitchesPer10Cm: 22,
      gaugeRowsPer10Cm: 30,
      brimStyle: 'single',
      brimHeightCm: 4,
      fitStyle: 'slouchy',
      wedges: 6,
    });
    expect(hatSlouch.totalHeightCm).toBeGreaterThan(25);

    // headCircumferenceCm: 0 (fallback do 56)
    const hatZeroHead = calculateHatCrown({
      headCircumferenceCm: 0,
      gaugeStitchesPer10Cm: 22,
      gaugeRowsPer10Cm: 30,
      brimStyle: 'single',
      brimHeightCm: 4,
      fitStyle: 'beanie',
      wedges: 6,
    });
    expect(hatZeroHead.totalHeightCm).toBeGreaterThan(0);
  });

  it('pokrywa gałęzie w needle-gauge-converter.ts', () => {
    // Domyślny fromSystem = metric
    const def = convertNeedleSize(4.0);
    expect(def.metricMm).toBe(4.0);

    // US nieznaleziony (fallback 4.0)
    const usUnknown = convertNeedleSize('unknown', 'us');
    expect(usUnknown.metricMm).toBe(4.0);

    // UK nieznaleziony
    const ukUnknown = convertNeedleSize('unknown', 'uk');
    expect(ukUnknown.metricMm).toBe(4.0);

    // UK i JP znalezione
    const ukFound = convertNeedleSize('uk 14', 'uk');
    expect(ukFound.metricMm).toBe(2.0);
    const jpFound = convertNeedleSize('0 (2.1 mm)', 'jp');
    expect(jpFound.metricMm).toBe(2.0);
  });

  it('pokrywa gałęzie w raglan-calculator.ts', () => {
    // Nieparzysta liczba rzędów w short rows (totalRows % 2 !== 0 -> +1)
    const sr = RaglanCalculator.calculateGermanShortRows({
      neckRiseCm: 1.5,
      rowGaugePer10cm: 20, // 1.5 * 2 = 3 rzędy -> zaokrąglenie do 4
      sleeveStitches: 10,
      frontStitches: 20,
    });
    expect(sr.totalShortRows % 2).toBe(0);

    // Ujemna różnica klatki piersiowej i rękawa w podsumowaniu
    const yoke = RaglanCalculator.calculateYokeIncreases({
      stitchGaugePer10cm: 20,
      rowGaugePer10cm: 26,
      desiredChestCircumferenceCm: 120, // cel 120 cm, ale z karczku wyjdzie mniej
      desiredSleeveCircumferenceCm: 45,
      yokeDepthCm: 16,
      initialBackStitches: 30,
      initialFrontStitches: 30,
      initialSleeveStitches: 12,
      raglanLineStitches: 2,
      underarmCastOnStitches: 6,
    });
    expect(yoke.summaryPl).toBeDefined();
    expect(yoke.chestDifferenceCm).toBeLessThan(0);
  });

  it('pokrywa gałęzie w shaping-calculator.ts', () => {
    // rightSideOnly = true z resztą (remainder > 0)
    const shaping = calculateMultiRowShaping({
      startStitches: 40,
      endStitches: 60,
      totalRows: 64, // 64 / 10 = 6 r4 -> 8 rzędów co 6 i 2 rzędy co 8
      shapingPlacement: 'both_edges',
      workSidePreference: 'right_side_only',
    });
    expect(shaping.phases.length).toBe(2);
  });

  it('pokrywa gałęzie w yarn-usage-estimator.ts', () => {
    // 1. pieceCount <= 0 (fallback do 1)
    const resPiece0 = estimateYarnFromSwatch({
      swatchWidthCm: 10,
      swatchHeightCm: 10,
      swatchWeightGrams: 5,
      finishedWidthCm: 20,
      finishedHeightCm: 20,
      pieceCount: 0,
      skeinWeightGrams: 50,
      skeinLengthMeters: 150,
    });
    expect(resPiece0.rawTotalWeightGrams).toBe(20);

    // 2. missingSkeins === 1 (l. poj. 'motka')
    const resMissing1 = estimateYarnFromSwatch({
      swatchWidthCm: 10,
      swatchHeightCm: 10,
      swatchWeightGrams: 5,
      finishedWidthCm: 50,
      finishedHeightCm: 50,
      skeinWeightGrams: 100,
      availableSkeins: 1, // potrzeba ok. 125g, jest 100g -> brakuje 1 motka
    });
    expect(resMissing1.yarnChickenRisk).toBe('danger');
    expect(resMissing1.advice).toContain('1 motka');

    // 3. requiredSkeins === 1 bez availableSkeins (l. poj. 'motek')
    const resReq1 = estimateYarnFromSwatch({
      swatchWidthCm: 10,
      swatchHeightCm: 10,
      swatchWeightGrams: 2,
      finishedWidthCm: 20,
      finishedHeightCm: 20,
      skeinWeightGrams: 50,
    });
    expect(resReq1.requiredSkeins).toBe(1);
    expect(resReq1.advice).toContain('1 motek');

    // 4. requiredSkeins > 1 bez availableSkeins (l. mnoga 'motków')
    const resReqMany = estimateYarnFromSwatch({
      swatchWidthCm: 10,
      swatchHeightCm: 10,
      swatchWeightGrams: 10,
      finishedWidthCm: 50,
      finishedHeightCm: 50,
      skeinWeightGrams: 50,
    });
    expect(resReqMany.requiredSkeins).toBeGreaterThan(1);
    expect(resReqMany.advice).toContain('motków');
  });

  it('pokrywa gałęzie decrement w counter-engine.ts', () => {
    const steps = recordCounterStep({
      primaryConfig: { id: 'c1', partId: 'p1', name: 'Licznik', step: 2 },
      direction: 'decrement',
      source: 'iphone',
      timestampMs: 6000,
    });
    expect(steps.length).toBe(1);
    expect(steps[0].type).toBe('DECREMENT');
    expect(steps[0].delta).toBe(-2);
  });

  it('pokrywa gałęzie fallback w needle-gauge-converter.ts', () => {
    // US fallback gdy nieznana nazwa i brak liczby
    const resUsNaN = convertNeedleSize('nieznana', 'us');
    expect(resUsNaN.metricMm).toBe(4.0);

    // US fallback gdy nieznana nazwa ale jest liczba
    const resUsNum = convertNeedleSize('7.5 nieznana', 'us');
    expect(resUsNum.metricMm).toBe(7.0);

    // UK fallback gdy nieznana nazwa
    const resUk = convertNeedleSize('nieznana', 'uk');
    expect(resUk.metricMm).toBe(4.0);

    // JP fallback gdy nieznana nazwa
    const resJp = convertNeedleSize('nieznana', 'jp');
    expect(resJp.metricMm).toBe(4.0);

    // Fallback dla brakujących pól ukKnitting, jpKnitting, crochetUs
    NEEDLE_SIZE_TABLE.push({ metricMm: 99.0, labelMetric: '99 mm', usKnitting: 'US 99' });
    const resFallback = convertNeedleSize(99.0);
    expect(resFallback.uk).toBe('—');
    expect(resFallback.jp).toBe('—');
    expect(resFallback.crochet).toBe('—');
    NEEDLE_SIZE_TABLE.pop();
  });

  it('pokrywa gałąź rightSideOnly === false w shaping-calculator.ts', () => {
    // any_row z resztą -> baseInterval + 1
    const shaping = calculateMultiRowShaping({
      startStitches: 40,
      endStitches: 60,
      totalRows: 65, // 65 / 10 = 6 r5 -> baseInterval=6, nextInterval=7
      shapingPlacement: 'both_edges',
      workSidePreference: 'any_row',
    });
    expect(shaping.phases.length).toBeGreaterThan(0);
    expect(shaping.phases.some(p => p.everyNthRow === 6)).toBe(true);
    expect(shaping.phases.some(p => p.everyNthRow === 7)).toBe(true);

    // Przypadek gdy phase2Count === 0 (remainder < intervalDiff)
    const shapingZeroPhase2 = calculateMultiRowShaping({
      startStitches: 40,
      endStitches: 60,
      totalRows: 21, // 21 / 10 = 2 r1 -> baseInterval=2 (even), remainder=1 < intervalDiff=2
      shapingPlacement: 'both_edges',
      workSidePreference: 'right_side_only',
    });
    expect(shapingZeroPhase2.phases.length).toBe(1);
    expect(shapingZeroPhase2.phases[0].everyNthRow).toBe(2);
  });

  it('pokrywa gałęzie odczytu z bazy danych w backup-service.ts', async () => {
    // 1. Recovery bez raw, odczyt z db sukces
    setRecovery({ key: 'state_corrupt_test1', at: Date.now() });
    const mockDbSuccess = {
      getFirstAsync: jest.fn().mockResolvedValue({ value: '{"saved":"data"}' }),
    } as any;
    const val1 = await readRecovery(mockDbSuccess);
    expect(val1).toBe('{"saved":"data"}');

    // 2. Recovery bez raw, db zwraca pusty wiersz
    const mockDbEmpty = {
      getFirstAsync: jest.fn().mockResolvedValue(null),
    } as any;
    const val2 = await readRecovery(mockDbEmpty);
    expect(val2).toBeNull();

    // 3. Recovery bez raw, db rzuca błąd
    const mockDbError = {
      getFirstAsync: jest.fn().mockRejectedValue(new Error('db err')),
    } as any;
    const val3 = await readRecovery(mockDbError);
    expect(val3).toBeNull();

    clearRecovery();
  });
});
