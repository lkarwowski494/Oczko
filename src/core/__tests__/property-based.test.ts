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
});

