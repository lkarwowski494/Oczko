/**
 * Oczko Core — Testy Własnościowe (Property-Based Testing, PBT) z fast-check
 * Weryfikacja niezmienników matematycznych i domenowych na tysiącach losowych danych wejściowych.
 * Zgodne ze standardem jakości repozytorium organizer.
 */

import * as fc from 'fast-check';
import {
  computeCounterState,
  CounterEvent,
  shouldDebounceClick,
  CounterConfig,
} from '../counter-engine';
import {
  calculateTargetStitchesAndRows,
  compareGauges,
  convertLength,
  SwatchMeasurement,
  TargetDimensions,
} from '../gauge-calculator';
import {
  calculateYarnGrist,
  estimateYarnFromProgress,
  estimateYarnFromSwatch,
} from '../yarn-usage-estimator';
import {
  filterStashYarns,
  StashFilterCriteria,
} from '../stash-filter-service';
import { StashYarnRecord, YarnWeightCategory } from '../stash-repository';
import { identifyStitch } from '../stitch-identifier';
import {
  calculateEvenIncreases,
  calculateEvenDecreases,
  calculateMultiRowShaping,
} from '../shaping-calculator';
import {
  serializeGarminEnvelope,
  deserializeGarminEnvelope,
  createGarminSyncPayload,
  GarminOfflineQueue,
  GARMIN_COMM_UUID,
  GarminWatchEvent,
} from '../garmin-service';
import {
  convertCraftLength,
  convertCraftWeight,
  convertGaugeTension,
} from '../needle-gauge-converter';
import { YarnSubstitutionService } from '../yarn-substitution-service';
import {
  calculateDetailedEase,
  recommendPatternSize,
  adaptStitchesWithRecommendation,
} from '../ease-calculator-service';

describe('Property-Based Testing — Niezmienniki Matematyczne i Domenowe (fast-check)', () => {
  describe('Niezmienniki Licznika i Event Sourcingu (counter-engine.ts)', () => {
    const baseConfig: CounterConfig = {
      id: 'cnt_pbt',
      partId: 'part_pbt',
      name: 'Licznik',
      initialValue: 0,
      step: 1,
    };

    it('Niezmiennik odwracalności: po N krokach i N wycofaniach stan licznika wynosi dokładnie 0', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 200 }), (n) => {
          const events: CounterEvent[] = [];
          let time = 1000;

          // Wykonaj N kroków
          for (let i = 0; i < n; i++) {
            events.push({
              id: `ev_inc_${i}`,
              counterId: 'cnt_pbt',
              type: 'INCREMENT',
              delta: 1,
              timestampMs: time,
              source: 'iphone',
            });
            time += 400; // Poza oknem debounce
          }

          // Wykonaj N wycofań (undo)
          for (let i = 0; i < n; i++) {
            events.push({
              id: `ev_undo_${i}`,
              counterId: 'cnt_pbt',
              type: 'UNDO',
              delta: -1,
              targetEventId: `ev_inc_${n - 1 - i}`,
              timestampMs: time,
              source: 'iphone',
            });
            time += 400;
          }

          const state = computeCounterState(baseConfig, events);
          expect(state.rawValue).toBe(0);
          expect(state.activeEventsCount).toBe(0);
        }),
        { numRuns: 100 }
      );
    });

    it('Niezmiennik wartości: dla K kroków bez wycofań wartość wynosi dokładnie K * step', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 150 }),
          fc.integer({ min: 1, max: 10 }),
          (k, step) => {
            const config: CounterConfig = {
              id: 'cnt_test',
              partId: 'part_test',
              name: 'Licznik',
              initialValue: 0,
              step,
            };

            const events: CounterEvent[] = [];
            let time = 1000;
            for (let i = 0; i < k; i++) {
              events.push({
                id: `ev_${i}`,
                counterId: 'cnt_test',
                type: 'INCREMENT',
                delta: step,
                timestampMs: time,
                source: 'iphone',
              });
              time += 400;
            }

            const state = computeCounterState(config, events);
            expect(state.rawValue).toBe(k * step);
            expect(state.activeEventsCount).toBe(k);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Niezmiennik ochrony debounce: kliknięcia w oknie < debounceMs są deterministycznie odrzucane', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 1000000 }),
          fc.integer({ min: 1, max: 299 }),
          fc.integer({ min: 300, max: 1000 }),
          (baseTime, deltaSmall, debounceMs) => {
            // W oknie debounce
            const rejected = shouldDebounceClick(baseTime, baseTime + deltaSmall, debounceMs);
            expect(rejected).toBe(true);

            // Po upływie okna debounce
            const accepted = shouldDebounceClick(baseTime, baseTime + debounceMs + 1, debounceMs);
            expect(accepted).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Niezmienniki Kalkulatora Próbki (gauge-calculator.ts)', () => {
    it('Niezmiennik inwersji jednostek: cm -> inch -> cm zachowuje pierwotną wartość', () => {
      fc.assert(
        fc.property(fc.double({ min: 0.1, max: 1000, noNaN: true }), (val) => {
          const inch = convertLength(val, 'cm', 'inch');
          const backToCm = convertLength(inch, 'inch', 'cm');
          expect(Math.abs(backToCm - val)).toBeLessThan(1e-5);
        }),
        { numRuns: 100 }
      );
    });

    it('Niezmiennik proporcjonalności liniowej: podwojenie wymiaru wyrobu podwaja liczbę oczek (±1 o.)', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10, max: 120, noNaN: true }),
          fc.integer({ min: 12, max: 35 }),
          fc.integer({ min: 15, max: 45 }),
          (widthCm, stitches10cm, rows10cm) => {
            const swatch: SwatchMeasurement = {
              stitches: stitches10cm,
              rows: rows10cm,
              width: 10,
              height: 10,
              unit: 'cm',
            };

            const target1: TargetDimensions = { width: widthCm, height: 40, unit: 'cm' };
            const target2: TargetDimensions = { width: widthCm * 2, height: 40, unit: 'cm' };

            const res1 = calculateTargetStitchesAndRows(swatch, target1);
            const res2 = calculateTargetStitchesAndRows(swatch, target2);

            expect(Math.abs(res2.targetStitches - 2 * res1.targetStitches)).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Niezmiennik tożsamości porównania próbek: identyczne próbki dają ratio 1.0 i status exact', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 40 }),
          fc.integer({ min: 12, max: 50 }),
          (stitches, rows) => {
            const gauge: SwatchMeasurement = {
              stitches,
              rows,
              width: 10,
              height: 10,
              unit: 'cm',
            };

            const cmp = compareGauges(gauge, gauge);
            expect(cmp.stitchRatio).toBe(1.0);
            expect(cmp.rowRatio).toBe(1.0);
            expect(cmp.status).toBe('exact');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Niezmienniki Estymatora Zużycia Włóczki (yarn-usage-estimator.ts)', () => {
    it('Niezmiennik grist: podwojenie długości przy tej samej wadze podwaja metraż na 100g', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10, max: 500, noNaN: true }),
          fc.float({ min: 50, max: 2000, noNaN: true }),
          (weight, length) => {
            const grist1 = calculateYarnGrist(weight, length);
            const grist2 = calculateYarnGrist(weight, length * 2);

            expect(Math.abs(grist2.metersPer100g - 2 * grist1.metersPer100g)).toBeLessThan(1e-4);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Niezmiennik monotoniczności postępu: większy targetRows ściśle zwiększa szacowaną wagę wyrobu', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 50 }),
          fc.integer({ min: 60, max: 120 }),
          fc.integer({ min: 130, max: 250 }),
          fc.float({ min: 20, max: 150, noNaN: true }),
          (completedRows, target1, target2, usedGrams) => {
            const est1 = estimateYarnFromProgress({
              completedRows,
              targetRows: target1,
              usedWeightGrams: usedGrams,
              skeinWeightGrams: 50,
            });

            const est2 = estimateYarnFromProgress({
              completedRows,
              targetRows: target2,
              usedWeightGrams: usedGrams,
              skeinWeightGrams: 50,
            });

            expect(est2.estimatedTotalWeightGrams).toBeGreaterThan(est1.estimatedTotalWeightGrams);
            expect(est2.requiredSkeins).toBeGreaterThanOrEqual(est1.requiredSkeins);
          }
        ),
        { numRuns: 80 }
      );
    });

    it('Niezmiennik skali powierzchni w próbce: podwojenie pola wyrobu podwaja wagę wyjściową (rawTotalWeightGrams)', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 20, max: 80, noNaN: true }),
          fc.float({ min: 20, max: 80, noNaN: true }),
          (width, height) => {
            const swatch = {
              swatchWidthCm: 10,
              swatchHeightCm: 10,
              swatchWeightGrams: 20,
              finishedWidthCm: width,
              finishedHeightCm: height,
              skeinWeightGrams: 50,
            };

            const res1 = estimateYarnFromSwatch(swatch);
            const res2 = estimateYarnFromSwatch({
              ...swatch,
              finishedWidthCm: width * 2,
            });

            expect(Math.abs(res2.rawTotalWeightGrams - 2 * res1.rawTotalWeightGrams)).toBeLessThan(1e-3);
          }
        ),
        { numRuns: 80 }
      );
    });
  });

  describe('Niezmienniki Filtrów Magazynu Włóczek (stash-filter-service.ts)', () => {
    const mockYarn = (id: string, name: string, weightCategory: YarnWeightCategory, composition: string, skeinsRemaining: number): StashYarnRecord => ({
      id,
      name,
      brand: 'Drops',
      colorway: 'Beż 01',
      weightCategory,
      composition,
      skeinsTotal: Math.max(1, skeinsRemaining),
      skeinsRemaining,
      createdAt: '2026-10-15T12:00:00Z',
      updatedAt: '2026-10-15T12:00:00Z',
    });

    const weightCategories: YarnWeightCategory[] = [
      'Lace',
      'Fingering',
      'Sport',
      'DK',
      'Worsted',
      'Aran',
      'Bulky',
      'Super Bulky',
    ];

    it('Pusty filtr zwraca dokładnie 100% elementów zbioru wejściowego', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1, maxLength: 20 }),
              weightCategory: fc.constantFrom(...weightCategories),
              composition: fc.constantFrom('100% wełna', '100% bawełna', '50% alpaka, 50% jedwab'),
              skeins: fc.integer({ min: 0, max: 20 }),
            }),
            { minLength: 1, maxLength: 25 }
          ),
          (items) => {
            const yarns = items.map((i) => mockYarn(i.id, i.name, i.weightCategory, i.composition, i.skeins));
            const filtered = filterStashYarns(yarns, {});
            expect(filtered).toHaveLength(yarns.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('Zawężenie filtra zawsze zwraca podzbiór wyników (subset property)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...weightCategories),
          (targetCategory) => {
            const sampleYarns: StashYarnRecord[] = [
              mockYarn('1', 'Merino Extra', targetCategory, '100% wełna', 5),
              mockYarn('2', 'Air', targetCategory, '70% alpaka', 0),
              mockYarn('3', 'Safran', 'Sport', '100% bawełna', 4),
              mockYarn('4', 'Nord', targetCategory, '45% alpaka, 30% poliamid, 25% wełna', 8),
            ];

            const broadFiltered = filterStashYarns(sampleYarns, { weightCategory: targetCategory });
            const narrowFiltered = filterStashYarns(sampleYarns, {
              weightCategory: targetCategory,
              inStockOnly: true,
            });

            // narrowFiltered jest podzbiorem broadFiltered
            expect(narrowFiltered.length).toBeLessThanOrEqual(broadFiltered.length);
            for (const item of narrowFiltered) {
              expect(broadFiltered.some((b) => b.id === item.id)).toBe(true);
              expect(item.skeinsRemaining).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Niezmienniki Klucza Identyfikacji Ściegów (stitch-identifier.ts, DEC-16)', () => {
    it('Niezmiennik totalności: dla dowolnego słownika odpowiedzi zwraca poprawny profil bez błędów wykonania', () => {
      fc.assert(
        fc.property(
          fc.dictionary(fc.string({ minLength: 1, maxLength: 30 }), fc.string({ minLength: 1, maxLength: 30 })),
          (randomAnswers) => {
            const match = identifyStitch(randomAnswers);
            expect(match).toBeDefined();
            expect(match.id.length).toBeGreaterThan(0);
            expect(match.namePl.length).toBeGreaterThan(0);
            expect(match.nameEn.length).toBeGreaterThan(0);
            expect(match.description.length).toBeGreaterThan(0);
            expect(['knitting', 'crochet']).toContain(match.craftType);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Niezmiennik determinizmu cech dominujących: splot szydełkowy zawsze klasyfikuje craftType jako crochet', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.string(),
          (reverse, edge) => {
            const match = identifyStitch({
              surface_texture: 'crochet_knots',
              reversibility: reverse,
              edge_and_stretch: edge,
            });
            expect(match.craftType).toBe('crochet');
            expect(match.id).toBe('crochet_basic');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('Niezmiennik kategorii ażuru: cecha otworów zawsze klasyfikuje kategorię jako lace', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.string(),
          (reverse, edge) => {
            const match = identifyStitch({
              surface_texture: 'holes',
              reversibility: reverse,
              edge_and_stretch: edge,
            });
            expect(match.category).toBe('lace');
            expect(match.id).toBe('lace_eyelet');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Niezmienniki Kalkulatora Kształtowania (shaping-calculator.ts)', () => {
    it('Niezmiennik zachowania liczby oczek przy dodawaniu: suma wygenerowanych grup i brzegów zawsze wynosi targetStitches', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 200 }),
          fc.integer({ min: 1, max: 50 }),
          fc.integer({ min: 0, max: 3 }),
          (initial, add, edge) => {
            const target = initial + add;
            const res = calculateEvenIncreases(initial, target, edge, 'M1L');

            if (res.isValid) {
              expect(res.targetStitches).toBe(target);
              expect(res.difference).toBe(add);

              // Suma oczek roboczych z grup musi równać się initial - 2 * edge
              const usedWorkingStitches = res.groups.reduce(
                (sum, g) => sum + g.normalStitches * g.repeatCount,
                0
              );
              expect(usedWorkingStitches).toBe(initial - 2 * edge);

              // Suma dodanych oczek z grup musi równać się różnicy (add)
              const totalAdded = res.groups.reduce((sum, g) => sum + g.repeatCount, 0);
              expect(totalAdded).toBe(add);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Niezmiennik poprawności odejmowania: po odjęciu suma oczek zawsze wynosi targetStitches', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 30, max: 200 }),
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 0, max: 2 }),
          (initial, dec, edge) => {
            const target = initial - dec;
            const res = calculateEvenDecreases(initial, target, edge, 'k2tog');

            if (res.isValid) {
              expect(res.targetStitches).toBe(target);
              expect(res.difference).toBe(dec);

              // Każda akcja k2tog zużywa (normalStitches + 2) oczek początkowych
              const totalInitialConsumed = res.groups.reduce(
                (sum, g) => sum + (g.normalStitches + 2) * g.repeatCount,
                0
              );
              expect(totalInitialConsumed).toBe(initial - 2 * edge);

              // Łączna liczba odejmowań równa się dec
              const totalDecreases = res.groups.reduce((sum, g) => sum + g.repeatCount, 0);
              expect(totalDecreases).toBe(dec);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Niezmiennik wielorzędowy: różnica oczek i zgodność rzędów', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 20, max: 100 }),
          fc.integer({ min: 2, max: 20 }),
          fc.integer({ min: 30, max: 120 }),
          (start, diff, rows) => {
            const evenDiff = diff % 2 === 0 ? diff : diff + 1;
            const end = start + evenDiff;

            const res = calculateMultiRowShaping({
              startStitches: start,
              endStitches: end,
              totalRows: rows,
              shapingPlacement: 'both_edges',
              workSidePreference: 'right_side_only',
            });

            if (res.isValid) {
              expect(res.totalStitchDiff).toBe(evenDiff);
              expect(res.endStitches).toBe(end);
              expect(res.actionCount).toBe(evenDiff / 2);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Niezmienniki Protokołu Garmin ConnectIQ (garmin-service.ts)', () => {
    it('Roundtrip: Serializacja i deserializacja koperty zachowuje appUuid, seqId i type', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<'HANDSHAKE' | 'SYNC_STATE' | 'WATCH_EVENT' | 'ACK' | 'NACK'>(
            'HANDSHAKE',
            'SYNC_STATE',
            'WATCH_EVENT',
            'ACK',
            'NACK'
          ),
          fc.integer({ min: 1, max: 100000 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          (type, seqId, textPayload) => {
            const raw = serializeGarminEnvelope(type, { text: textPayload }, seqId);
            const parsed = deserializeGarminEnvelope<{ text: string }>(raw);

            expect(parsed.valid).toBe(true);
            expect(parsed.envelope).toBeDefined();
            expect(parsed.envelope!.appUuid).toBe(GARMIN_COMM_UUID);
            expect(parsed.envelope!.seqId).toBe(seqId);
            expect(parsed.envelope!.type).toBe(type);
            expect(parsed.envelope!.payload.text).toBe(textPayload);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Niezmiennik bufora offline: GarminOfflineQueue nigdy nie przekracza maxCapacity', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 50 }),
          fc.integer({ min: 1, max: 200 }),
          (capacity, eventCount) => {
            const queue = new GarminOfflineQueue(capacity);
            for (let i = 0; i < eventCount; i++) {
              const event: GarminWatchEvent = {
                eventId: `evt_${i}`,
                source: 'garmin_connectiq',
                button: 'KEY_START_STOP',
                counterId: 'cnt_pbt',
                timestamp: 1000 + i,
              };
              queue.enqueue(event);
            }

            expect(queue.size()).toBeLessThanOrEqual(capacity);
            const flushed = queue.flush();
            expect(flushed.length).toBeLessThanOrEqual(capacity);
            expect(queue.size()).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Niezmienniki Przelicznika Rozmiarów Drutów i Jednostek (needle-gauge-converter.ts)', () => {
    it('Odwracalność jednostek długości (metry <-> jardy)', () => {
      fc.assert(
        fc.property(fc.integer({ min: 5, max: 5000 }), (m) => {
          const yd = convertCraftLength(m, 'meters', 'yards');
          const back = convertCraftLength(yd, 'yards', 'meters');
          expect(Math.abs(back - m)).toBeLessThanOrEqual(0.05);
        }),
        { numRuns: 100 }
      );
    });

    it('Odwracalność jednostek wagi (gramy <-> uncje)', () => {
      fc.assert(
        fc.property(fc.integer({ min: 10, max: 2000 }), (g) => {
          const oz = convertCraftWeight(g, 'grams', 'ounces');
          const back = convertCraftWeight(oz, 'ounces', 'grams');
          expect(Math.abs(back - g)).toBeLessThanOrEqual(0.2);
        }),
        { numRuns: 100 }
      );
    });

    it('Odwracalność jednostek próbki ściegu (10 cm <-> 4 cale)', () => {
      fc.assert(
        fc.property(fc.integer({ min: 6, max: 60 }), (sts) => {
          const in4 = convertGaugeTension(sts, '10cm', '4inch');
          const back = convertGaugeTension(in4, '4inch', '10cm');
          expect(Math.abs(back - sts)).toBeLessThanOrEqual(0.2);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Niezmienniki Kalkulatora Zamienników Włóczki i WPI (yarn-substitution-service.ts)', () => {
    it('Monotoniczność zapotrzebowania: większa liczba motków wzoru ściśle zwiększa wymagany metraż i liczbę motków zamiennika', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 15 }),
          fc.integer({ min: 16, max: 40 }),
          fc.integer({ min: 50, max: 300 }),
          fc.integer({ min: 50, max: 300 }),
          (balls1, balls2, pLen, nLen) => {
            const res1 = YarnSubstitutionService.calculateSubstitution({
              patternBalls: balls1,
              patternBallLengthMeters: pLen,
              newBallLengthMeters: nLen,
              safetyMarginPercent: 10,
            });
            const res2 = YarnSubstitutionService.calculateSubstitution({
              patternBalls: balls2,
              patternBallLengthMeters: pLen,
              newBallLengthMeters: nLen,
              safetyMarginPercent: 10,
            });

            expect(res2.totalRequiredMeters).toBeGreaterThan(res1.totalRequiredMeters);
            expect(res2.ballsNeeded).toBeGreaterThanOrEqual(res1.ballsNeeded);
            expect(res1.ballsNeeded).toBeGreaterThanOrEqual(res1.exactBalls);
            expect(res2.ballsNeeded).toBeGreaterThanOrEqual(res2.exactBalls);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Klasyfikacja WPI: dla każdego dodatniego WPI zwraca spójne kategorie mieszczące się w standardzie 0-7', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 60 }), (wpi) => {
          const res = YarnSubstitutionService.classifyByWpi(wpi);
          expect(res.wpi).toBe(wpi);
          for (const cat of res.matchedCategories) {
            expect(cat).toBeGreaterThanOrEqual(0);
            expect(cat).toBeLessThanOrEqual(7);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Niezmienniki Kalkulatora Luzu Odzieżowego i Doboru Rozmiaru (ease-calculator-service.ts)', () => {
    it('Monotoniczność luzu: przy stałym obwodzie ciała, większy obwód dzianiny ściśle zwiększa luz w cm i procentach', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 60, max: 150 }),
          fc.integer({ min: 50, max: 100 }),
          fc.integer({ min: 101, max: 200 }),
          (body, g1, g2) => {
            const res1 = calculateDetailedEase(body, g1);
            const res2 = calculateDetailedEase(body, g2);

            expect(res2.easeCm).toBeGreaterThan(res1.easeCm);
            expect(res2.percentageOfBody).toBeGreaterThan(res1.percentageOfBody);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Optymalność rekomendacji rozmiaru: wybrany rozmiar minimalizuje bezwzględną różnicę od zadanego luzu', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 70, max: 140 }),
          fc.integer({ min: -5, max: 25 }),
          fc.array(fc.integer({ min: 70, max: 180 }), { minLength: 2, maxLength: 8 }),
          (body, desiredEase, sizesArr) => {
            const sizes = sizesArr.map((s, idx) => ({
              name: `Rozmiar ${idx + 1}`,
              finishedCircumferenceCm: s,
            }));

            const rec = recommendPatternSize(body, desiredEase, sizes);
            expect(rec.recommendedSize.isClosest).toBe(true);

            // Niezmiennik: żaden inny kandydat nie ma mniejszej różnicy od zalecanego
            for (const cand of rec.allCandidates) {
              expect(cand.easeDiffFromDesiredCm).toBeGreaterThanOrEqual(
                rec.recommendedSize.easeDiffFromDesiredCm
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Zbieżność adaptacji oczek: szerokość zalecanego wariantu nie odbiega od wzorcowej o więcej niż 1 pełny raport', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 50, max: 200 }),
          fc.integer({ min: 14, max: 30 }),
          fc.integer({ min: 14, max: 30 }),
          fc.integer({ min: 1, max: 12 }),
          fc.integer({ min: 0, max: 4 }),
          (patternStitches, patternGauge, myGauge, repeatMultiple, edgeStitches) => {
            const res = adaptStitchesWithRecommendation({
              patternStitches,
              patternGaugePer10cm: patternGauge,
              myGaugePer10cm: myGauge,
              repeatMultiple,
              edgeStitches,
            });

            const repeatWidthCm = repeatMultiple / (myGauge / 10);
            const chosen =
              res.chosenCandidate === 'lower' ? res.lowerCandidate : res.upperCandidate;
            expect(chosen.widthDifferenceCm).toBeLessThanOrEqual(repeatWidthCm + 0.1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


