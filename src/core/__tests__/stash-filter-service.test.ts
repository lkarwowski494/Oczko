/**
 * Oczko Core — Testy filtrów i klasyfikacji magazynu włóczek (BR-MAG-002, BR-MAG-003)
 */

import {
  filterStashYarns,
  calculateStashMetrics,
  detectFiberTags,
  FIBER_FILTER_TAGS,
  YARN_WEIGHT_STANDARDS,
  StashFilterCriteria,
} from '../stash-filter-service';
import { StashYarnRecord } from '../stash-repository';

const SAMPLE_YARNS: StashYarnRecord[] = [
  {
    id: 'y1',
    brand: 'Drops',
    name: 'Nord',
    colorway: '03 Jasnoszary',
    dyeLot: '1240',
    weightCategory: 'Fingering',
    composition: '45% Alpaka, 30% Poliamid, 25% Wełna',
    skeinsTotal: 4,
    skeinsRemaining: 4,
    weightGramsPerSkein: 50,
    lengthMetersPerSkein: 170,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'y2',
    brand: 'Sandnes Garn',
    name: 'Sunday',
    colorway: '2511 Almond',
    dyeLot: '8910',
    weightCategory: 'Fingering',
    composition: '100% Wełna Merino (non-superwash)',
    skeinsTotal: 3,
    skeinsRemaining: 2,
    weightGramsPerSkein: 50,
    lengthMetersPerSkein: 235,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'y3',
    brand: 'Drops',
    name: 'Air',
    colorway: '10 Mgła morska',
    dyeLot: '4450',
    weightCategory: 'Worsted',
    composition: '65% Alpaka, 28% Poliamid, 7% Wełna',
    skeinsTotal: 6,
    skeinsRemaining: 0, // wyczerpane motki
    weightGramsPerSkein: 50,
    lengthMetersPerSkein: 150,
    createdAt: '2026-01-03T00:00:00Z',
    updatedAt: '2026-01-03T00:00:00Z',
  },
  {
    id: 'y4',
    brand: 'DMC',
    name: 'Natura Just Cotton',
    colorway: 'N04 Ibiza',
    weightCategory: 'Sport',
    composition: '100% Bawełna Czesana',
    skeinsTotal: 5,
    skeinsRemaining: 5,
    weightGramsPerSkein: 50,
    lengthMetersPerSkein: 155,
    createdAt: '2026-01-04T00:00:00Z',
    updatedAt: '2026-01-04T00:00:00Z',
  },
  {
    id: 'y5',
    brand: 'Isager',
    name: 'Silk Mohair',
    colorway: '62 Petrol',
    dyeLot: '9901',
    weightCategory: 'Lace',
    composition: '75% Super Kid Mohair, 25% Jedwab',
    skeinsTotal: 2,
    skeinsRemaining: 2,
    weightGramsPerSkein: 25,
    lengthMetersPerSkein: 212,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
  },
];

describe('Stash Filter Service (BR-MAG-002, BR-MAG-003)', () => {
  describe('Wyszukiwanie tekstowe i po partii farbowania (Dye Lot)', () => {
    it('wyszukuje włóczkę po marce lub nazwie (case-insensitive)', () => {
      const results = filterStashYarns(SAMPLE_YARNS, { query: 'drops' });
      expect(results.length).toBe(2);
      expect(results.map((r) => r.name)).toEqual(['Nord', 'Air']);
    });

    it('wyszukuje precyzyjnie po numerze partii farbowania (Dye Lot)', () => {
      const results = filterStashYarns(SAMPLE_YARNS, { query: '8910' });
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Sunday');
      expect(results[0].dyeLot).toBe('8910');
    });

    it('wyszukuje po nazwie koloru', () => {
      const results = filterStashYarns(SAMPLE_YARNS, { query: 'Petrol' });
      expect(results.length).toBe(1);
      expect(results[0].brand).toBe('Isager');
    });

    it('zwraca pustą listę gdy brak dopasowania', () => {
      const results = filterStashYarns(SAMPLE_YARNS, { query: 'nieistniejąca włóczka' });
      expect(results.length).toBe(0);
    });
  });

  describe('Filtrowanie według kategorii grubości CYC (BR-MAG-002)', () => {
    it('filtruje włóczki po wybranej grubości Fingering', () => {
      const results = filterStashYarns(SAMPLE_YARNS, { weightCategory: 'Fingering' });
      expect(results.length).toBe(2);
      expect(results.every((r) => r.weightCategory === 'Fingering')).toBe(true);
    });

    it('zwraca wszystkie włóczki gdy kategoria to ALL lub undefined', () => {
      const resultsAll = filterStashYarns(SAMPLE_YARNS, { weightCategory: 'ALL' });
      expect(resultsAll.length).toBe(5);
    });

    it('posiada poprawne standardy CYC dla grubości', () => {
      const fingering = YARN_WEIGHT_STANDARDS.find((s) => s.category === 'Fingering');
      expect(fingering).toBeDefined();
      expect(fingering?.cycNumber).toBe(1);
      expect(fingering?.recommendedNeedlesMm).toBe('2.25 - 3.25 mm');
    });
  });

  describe('Filtrowanie według składu surowcowego', () => {
    it('wykrywa tagi surowców w składzie włóczki', () => {
      const tagsNord = detectFiberTags(SAMPLE_YARNS[0].composition);
      expect(tagsNord).toContain('alpaca');
      expect(tagsNord).toContain('synthetic');
      expect(tagsNord).toContain('wool');

      const tagsCotton = detectFiberTags(SAMPLE_YARNS[3].composition);
      expect(tagsCotton).toContain('cotton');

      const tagsSilkMohair = detectFiberTags(SAMPLE_YARNS[4].composition);
      expect(tagsSilkMohair).toContain('mohair');
      expect(tagsSilkMohair).toContain('silk');
    });

    it('filtruje włóczki po tagu surowcowym (np. alpaka)', () => {
      const results = filterStashYarns(SAMPLE_YARNS, { fiberTag: 'alpaca' });
      expect(results.length).toBe(2); // Nord, Air
      expect(results.map((r) => r.name)).toContain('Nord');
      expect(results.map((r) => r.name)).toContain('Air');
    });

    it('filtruje po tagu bawełna', () => {
      const results = filterStashYarns(SAMPLE_YARNS, { fiberTag: 'cotton' });
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Natura Just Cotton');
    });
  });

  describe('Filtrowanie dostępności (tylko na stanie)', () => {
    it('odrzuca wyczerpane motki gdy inStockOnly jest włączone', () => {
      const inStock = filterStashYarns(SAMPLE_YARNS, { inStockOnly: true });
      expect(inStock.length).toBe(4);
      expect(inStock.some((y) => y.name === 'Air')).toBe(false);
    });
  });

  describe('Kombinacja filtrów (multi-filter)', () => {
    it('łączy zapytanie tekstowe, grubość i dostępność', () => {
      const results = filterStashYarns(SAMPLE_YARNS, {
        query: 'Drops',
        weightCategory: 'Fingering',
        inStockOnly: true,
      });
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Nord');
    });
  });

  describe('Agregacja statystyk magazynu (calculateStashMetrics)', () => {
    it('poprawnie sumuje pozostałe motki, wagę w gramach i metraż', () => {
      const metrics = calculateStashMetrics(SAMPLE_YARNS);
      // y1: 4 * 50g = 200g, 4 * 170m = 680m
      // y2: 2 * 50g = 100g, 2 * 235m = 470m
      // y3: 0 * 50g = 0g, 0m
      // y4: 5 * 50g = 250g, 5 * 155m = 775m
      // y5: 2 * 25g = 50g, 2 * 212m = 424m
      // Suma motków: 4 + 2 + 0 + 5 + 2 = 13 motków
      // Suma gramów: 200 + 100 + 0 + 250 + 50 = 600 g
      // Suma metrów: 680 + 470 + 0 + 775 + 424 = 2349 m
      expect(metrics.totalItems).toBe(5);
      expect(metrics.totalSkeins).toBe(13);
      expect(metrics.totalGrams).toBe(600);
      expect(metrics.totalMeters).toBe(2349);
    });

    it('zwraca zera dla pustej listy', () => {
      const emptyMetrics = calculateStashMetrics([]);
      expect(emptyMetrics.totalItems).toBe(0);
      expect(emptyMetrics.totalSkeins).toBe(0);
      expect(emptyMetrics.totalGrams).toBe(0);
      expect(emptyMetrics.totalMeters).toBe(0);
    });
  });
});
