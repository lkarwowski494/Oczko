/**
 * Oczko Core — Budżety Wydajnościowe i Profilowanie CPU (Performance Budget Testing)
 * Wzorowane na rygorystycznych kontraktach wydajnościowych repozytorium organizer.
 * Weryfikuje stałą złożoność czasową i brak regresji O(N^2) w silniku licznika,
 * filtracji magazynu, kalkulatorze próbki oraz analizatorze wzorów.
 */

import {
  computeCounterState,
  CounterConfig,
  CounterEvent,
} from '../counter-engine';
import {
  filterStashYarns,
  calculateStashMetrics,
  StashFilterCriteria,
} from '../stash-filter-service';
import { StashYarnRecord } from '../stash-repository';
import {
  calculateTargetStitchesAndRows,
  SwatchMeasurement,
  TargetDimensions,
} from '../gauge-calculator';
import {
  calculateYarnGrist,
  estimateYarnFromProgress,
} from '../yarn-usage-estimator';
import { parseRowInstruction } from '../pattern-parser';
import { processDigitalCrownDelta } from '../apple-watch-service';
import { identifyStitch } from '../stitch-identifier';

describe('Budżety Wydajnościowe i Efektywność CPU (Performance Budget)', () => {
  const config: CounterConfig = {
    id: 'cnt_perf_01',
    partId: 'part_01',
    name: 'Główny korpus',
    initialValue: 0,
    targetValue: 5000,
    reminderRows: [100, 200, 300, 400, 500, 1000, 2000, 3000, 4000, 5000],
  };

  test('Replay 5 000 zdarzeń licznika (Event Sourcing) wykonuje się w budżecie < 60 ms', () => {
    // Generujemy sekwencję 5000 zdarzeń (mieszanka INCREMENT, DECREMENT, UNDO, SET)
    const events: CounterEvent[] = [];
    const baseTs = 1700000000000;

    for (let i = 1; i <= 5000; i++) {
      const isUndo = i % 100 === 0 && i > 1;
      const targetId = isUndo ? `ev_${i - 1}` : undefined;

      events.push({
        id: `ev_${i}`,
        counterId: config.id,
        type: isUndo ? 'UNDO' : (i % 250 === 0 ? 'SET' : 'INCREMENT'),
        delta: isUndo ? -1 : 1,
        targetEventId: targetId,
        source: i % 2 === 0 ? 'iphone' : 'apple_watch',
        timestampMs: baseTs + i * 100,
      });
    }

    const t0 = performance.now();
    const state = computeCounterState(config, events);
    const durationMs = performance.now() - t0;

    // Asercje poprawności stanu
    expect(state.counterId).toBe(config.id);
    expect(state.rawValue).toBeGreaterThan(0);
    expect(state.activeEventsCount).toBeGreaterThan(4500);

    // Budżet wydajnościowy: < 60 ms na 5 000 zdarzeń
    expect(durationMs).toBeLessThan(60);
  });

  test('Filtrowanie i agregacja metryk 2 500 pozycji magazynu włóczek mieści się w < 40 ms', () => {
    // Przygotowanie kolekcji 2 500 włóczek z różnymi składami, markami i grubościami
    const categories = ['Fingering', 'DK', 'Worsted', 'Aran', 'Bulky', 'Lace'] as const;
    const yarns: StashYarnRecord[] = [];

    for (let i = 1; i <= 2500; i++) {
      const cat = categories[i % categories.length];
      const hasWool = i % 2 === 0;
      const hasSilk = i % 5 === 0;
      const composition = `${hasWool ? '100% Wełna merino' : '100% Bawełna'}${hasSilk ? ', 20% Jedwab' : ''}`;

      yarns.push({
        id: `yarn_${i}`,
        brand: `Manufaktura ${i % 20}`,
        name: `Włóczka Premium ${i}`,
        colorway: `Kolor ${i % 30}`,
        dyeLot: i % 10 === 0 ? `LOT-${i % 5}` : undefined,
        weightCategory: cat,
        composition,
        skeinsTotal: (i % 10) + 1,
        skeinsRemaining: i % 7 === 0 ? 0 : (i % 10) + 1,
        weightGramsPerSkein: 50 + (i % 5) * 10,
        lengthMetersPerSkein: 150 + (i % 10) * 20,
        notes: i % 3 === 0 ? 'Kupione na festiwalu dziewiarskim' : undefined,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      });
    }

    const criteria: StashFilterCriteria = {
      query: 'merino',
      weightCategory: 'Fingering',
      fiberTag: 'wool',
      inStockOnly: true,
    };

    const t0 = performance.now();
    const filtered = filterStashYarns(yarns, criteria);
    const metrics = calculateStashMetrics(filtered);
    const durationMs = performance.now() - t0;

    expect(filtered.length).toBeGreaterThan(0);
    expect(metrics.totalSkeins).toBeGreaterThan(0);
    expect(metrics.totalGrams).toBeGreaterThan(0);
    expect(metrics.totalMeters).toBeGreaterThan(0);

    // Budżet wydajnościowy: < 40 ms na 2 500 rekordów ze złożonym filtrem tekstowo-surowcowym
    expect(durationMs).toBeLessThan(40);
  });

  test('10 000 kalkulacji próbki i wskaźnika Yarn Grist wykonuje się w < 50 ms', () => {
    const swatch: SwatchMeasurement = {
      stitches: 22,
      rows: 30,
      width: 10,
      height: 10,
      unit: 'cm',
    };
    const target: TargetDimensions = {
      width: 55,
      height: 70,
      unit: 'cm',
    };

    const t0 = performance.now();
    for (let i = 0; i < 10000; i++) {
      calculateTargetStitchesAndRows(swatch, target);
      calculateYarnGrist(100, 420);
    }
    const durationMs = performance.now() - t0;

    // Budżet: 10 000 obliczeń w < 50 ms
    expect(durationMs).toBeLessThan(50);
  });

  test('Parsowanie i leksykalna analiza 500 rzędów wzoru dziewiarskiego wykonuje się w < 40 ms', () => {
    const rowInstructions = [
      'k2, p2, k2tog, yo, kfb, ssk, p4, k10',
      'p across all stitches until marker, yo, k2tog',
      'k1, yo, ssk, kfb, p2tog, k3',
      'Row 4: k2, p2, k2, p2 ribbing pattern',
    ];

    const t0 = performance.now();
    for (let i = 0; i < 500; i++) {
      const text = rowInstructions[i % rowInstructions.length];
      parseRowInstruction(text);
    }
    const durationMs = performance.now() - t0;

    expect(durationMs).toBeLessThan(40);
  });

  test('10 000 symulacji obrotu cyfrowej koronki (Digital Crown) w < 25 ms', () => {
    let accumulator = 0;
    let totalSteps = 0;

    const t0 = performance.now();
    for (let i = 0; i < 10000; i++) {
      const delta = (i % 3 === 0 ? 0.4 : 0.8);
      const res = processDigitalCrownDelta(accumulator, delta, 1.0);
      accumulator = res.remainingAccumulator;
      totalSteps += res.stepDelta;
    }
    const durationMs = performance.now() - t0;

    expect(totalSteps).toBeGreaterThan(0);
    expect(durationMs).toBeLessThan(25);
  });

  test('1 000 estymacji zużycia włóczki z marginesem bezpieczeństwa w < 30 ms', () => {
    const t0 = performance.now();
    for (let i = 1; i <= 1000; i++) {
      estimateYarnFromProgress({
        completedRows: 40 + (i % 20),
        targetRows: 200,
        usedWeightGrams: 80 + (i % 10),
        skeinWeightGrams: 100,
        skeinLengthMeters: 400,
        availableSkeins: 4,
        safetyMarginPercent: 15,
      });
    }
    const durationMs = performance.now() - t0;

    expect(durationMs).toBeLessThan(30);
  });

  test('10 000 deterministycznych rozpoznań ściegu w < 20 ms', () => {
    const scenarios: Record<string, string>[] = [
      { surface_texture: 'v_columns', reversibility: 'different_ridges', edge_and_stretch: 'curls' },
      { surface_texture: 'cables', reversibility: 'flat_background' },
      { surface_texture: 'holes', edge_and_stretch: 'airy_lace' },
      { surface_texture: 'ribs', edge_and_stretch: 'elastic_accordion' },
      { surface_texture: 'crochet_knots' },
      { surface_texture: 'grains', reversibility: 'identical' },
    ];

    const t0 = performance.now();
    for (let i = 0; i < 10000; i++) {
      const answers = scenarios[i % scenarios.length];
      identifyStitch(answers);
    }
    const durationMs = performance.now() - t0;

    expect(durationMs).toBeLessThan(20);
  });
});
