/**
 * Oczko Core — Testy Odporności i Wstrzykiwania Błędów (Resilience & Fault Injection)
 * Wzorowane na rygorystycznych testach niezawodności repozytorium organizer.
 * Weryfikuje zachowanie systemu w warunkach brzegowych, przy uszkodzonych danych,
 * przerwanych transakcjach oraz skrajnych danych wejściowych.
 */

import {
  createInMemoryDatabase,
  DatabaseClient,
} from '../database';
import {
  validateBackupData,
  importDatabaseBackup,
  OczkoBackupData,
} from '../backup-service';
import {
  calculateTargetStitchesAndRows,
  calculateCastOnAdjustment,
  convertLength,
} from '../gauge-calculator';
import {
  calculateYarnGrist,
  estimateYarnFromProgress,
  estimateYarnFromSwatch,
} from '../yarn-usage-estimator';
import {
  computeCounterState,
  shouldDebounceClick,
  CounterConfig,
  CounterEvent,
} from '../counter-engine';

describe('Odporność i Wstrzykiwanie Błędów (Resilience & Fault Injection)', () => {
  describe('Atomowość Transakcji i Wycofywanie Błędów (Transaction Rollbacks)', () => {
    let db: DatabaseClient;

    beforeEach(() => {
      db = createInMemoryDatabase();
    });

    test('Błąd w trakcie transakcji cofa wszystkie operacje (Zero Partial Writes)', async () => {
      // 1. Zapisujemy początkowy stabilny rekord
      await db.runAsync(
        'INSERT INTO projects (id, name, craft_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        'proj_safe',
        'Stabilny Projekt',
        'knitting',
        'active',
        '2026-01-01',
        '2026-01-01'
      );

      // 2. Próbujemy wykonać transakcję z 2 operacjami, w której druga operacja rzuca błąd
      await expect(
        db.withTransactionAsync(async () => {
          await db.runAsync(
            'INSERT INTO projects (id, name, craft_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            'proj_doomed',
            'Projekt Skazany na Niepowodzenie',
            'crochet',
            'active',
            '2026-01-01',
            '2026-01-01'
          );

          await db.runAsync(
            'INSERT INTO project_parts (id, project_id, name, sort_order, target_rows, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            'part_doomed',
            'proj_doomed',
            'Część',
            1,
            100,
            '2026-01-01'
          );

          // Symulacja awarii / błędu zapisu dyskowego
          throw new Error('SYMULACJA_AWARII_DYSKU');
        })
      ).rejects.toThrow('SYMULACJA_AWARII_DYSKU');

      // 3. Weryfikacja: w bazie pozostał wyłącznie początkowy projekt, brak śmieciowych części i projektów
      const allProjects = await db.getAllAsync<any>('SELECT * FROM projects');
      const allParts = await db.getAllAsync<any>('SELECT * FROM project_parts');

      expect(allProjects).toHaveLength(1);
      expect(allProjects[0].id).toBe('proj_safe');
      expect(allParts).toHaveLength(0);
    });

    test('Baza danych pozwala na kolejne udane transakcje po uprzednim rollbacku', async () => {
      // Próba nieudana
      await expect(
        db.withTransactionAsync(async () => {
          throw new Error('BLAD_TRANSAKCJI');
        })
      ).rejects.toThrow('BLAD_TRANSAKCJI');

      // Kolejna próba udana
      const result = await db.withTransactionAsync(async () => {
        await db.runAsync(
          'INSERT INTO stash_yarns (id, brand, name, colorway, weight_category, composition, skeins_total, skeins_remaining, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          'yarn_1',
          'Isager',
          'Spinni',
          '61s',
          'Lace',
          '100% Wełna',
          4,
          4,
          '2026-01-01',
          '2026-01-01'
        );
        return 'SUKCES';
      });

      expect(result).toBe('SUKCES');
      const yarns = await db.getAllAsync<any>('SELECT * FROM stash_yarns');
      expect(yarns).toHaveLength(1);
      expect(yarns[0].id).toBe('yarn_1');
    });
  });

  describe('Walidacja i Odrzucanie Uszkodzonych Kopii Zapasowych (Corrupted Backup Protection)', () => {
    let db: DatabaseClient;

    beforeEach(async () => {
      db = createInMemoryDatabase();
      await db.runAsync(
        'INSERT INTO projects (id, name, craft_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        'p_orig',
        'Oryginalny Projekt',
        'knitting',
        'active',
        '2026-01-01',
        '2026-01-01'
      );
    });

    test('Odrzuca zdegenerowane i niepoprawne formaty JSON bez uszkadzania bazy', async () => {
      const corruptInputs = [
        '{ to nie jest poprawny json :(',
        'null',
        '12345',
        'true',
        '["nie", "obiekt"]',
        '{}',
        JSON.stringify({ metadata: { appName: 'InnaAplikacja', version: 1 } }),
        JSON.stringify({ metadata: { appName: 'Oczko', version: 999 } }),
        JSON.stringify({
          metadata: { appName: 'Oczko', version: 1 },
          projects: [],
          // brak project_parts, counters, counter_events, stash_yarns, stash_tools
        }),
      ];

      for (const input of corruptInputs) {
        const val = validateBackupData(input);
        expect(val.valid).toBe(false);

        await expect(importDatabaseBackup(db, input)).rejects.toThrow();
      }

      // Stan bazy pozostał nienaruszony
      const projects = await db.getAllAsync<any>('SELECT * FROM projects');
      expect(projects).toHaveLength(1);
      expect(projects[0].id).toBe('p_orig');
    });

    test('Bezpiecznie importuje poprawną kopię zapasową z zerowymi tabelami', async () => {
      const validEmptyBackup: OczkoBackupData = {
        metadata: {
          version: 1,
          appName: 'Oczko',
          bundleId: 'com.apps4brew.knitting',
          exportedAt: new Date().toISOString(),
          itemCounts: { projects: 0, parts: 0, counters: 0, events: 0, yarns: 0, tools: 0 },
        },
        projects: [],
        project_parts: [],
        counters: [],
        counter_events: [],
        stash_yarns: [],
        stash_tools: [],
      };

      const res = await importDatabaseBackup(db, validEmptyBackup);
      expect(res.success).toBe(true);

      const projects = await db.getAllAsync<any>('SELECT * FROM projects');
      expect(projects).toHaveLength(0);
    });
  });

  describe('Kalkulatory Matematyczne — Odporność na Wartości Brzegowe i Dzielenie przez Zero', () => {
    test('Kalkulator próbki (calculateTargetStitchesAndRows) odrzuca zera i wartości ujemne', () => {
      const validSwatch = { stitches: 20, rows: 28, width: 10, height: 10, unit: 'cm' as const };
      const validTarget = { width: 50, height: 60, unit: 'cm' as const };

      // Błędne wymiary próbki
      expect(() => calculateTargetStitchesAndRows({ ...validSwatch, stitches: 0 }, validTarget)).toThrow();
      expect(() => calculateTargetStitchesAndRows({ ...validSwatch, stitches: -5 }, validTarget)).toThrow();
      expect(() => calculateTargetStitchesAndRows({ ...validSwatch, width: 0 }, validTarget)).toThrow();
      expect(() => calculateTargetStitchesAndRows({ ...validSwatch, height: -10 }, validTarget)).toThrow();
      expect(() => calculateTargetStitchesAndRows({ ...validSwatch, rows: 0 }, validTarget)).toThrow();

      // Błędne wymiary docelowe
      expect(() => calculateTargetStitchesAndRows(validSwatch, { ...validTarget, width: 0 })).toThrow();
      expect(() => calculateTargetStitchesAndRows(validSwatch, { ...validTarget, height: -1 })).toThrow();
    });

    test('calculateCastOnAdjustment i convertLength radzą sobie ze skrajnymi parametrami', () => {
      // Identyczne jednostki
      expect(convertLength(100, 'cm', 'cm')).toBe(100);
      expect(convertLength(50, 'inch', 'inch')).toBe(50);

      // Przeliczanie oczek nabieranych
      expect(calculateCastOnAdjustment(100, 1.0)).toBe(100);
      expect(calculateCastOnAdjustment(100, 1.1)).toBe(110);
      expect(calculateCastOnAdjustment(100, 0.9)).toBe(90);
    });

    test('Estymator włóczki odrzuca ujemne i zerowe parametry początkowe', () => {
      expect(() => calculateYarnGrist(0, 100)).toThrow('Waga musi być większa od zera');
      expect(() => calculateYarnGrist(-10, 100)).toThrow('Waga musi być większa od zera');
      expect(() => calculateYarnGrist(100, 0)).toThrow('Długość musi być większa od zera');
      expect(() => calculateYarnGrist(100, -50)).toThrow('Długość musi być większa od zera');

      // estimateYarnFromProgress
      const baseProgress = {
        completedRows: 20,
        targetRows: 100,
        usedWeightGrams: 50,
        skeinWeightGrams: 100,
      };

      expect(() => estimateYarnFromProgress({ ...baseProgress, completedRows: 0 })).toThrow();
      expect(() => estimateYarnFromProgress({ ...baseProgress, targetRows: 0 })).toThrow();
      expect(() => estimateYarnFromProgress({ ...baseProgress, usedWeightGrams: 0 })).toThrow();
      expect(() => estimateYarnFromProgress({ ...baseProgress, skeinWeightGrams: 0 })).toThrow();

      // Gdy completedRows >= targetRows (wyrób skończony)
      const finished = estimateYarnFromProgress({
        ...baseProgress,
        completedRows: 100,
        targetRows: 100,
      });
      expect(finished.remainingWeightGrams).toBe(0);
      expect(finished.rawTotalWeightGrams).toBe(50);

      // estimateYarnFromSwatch
      const baseSwatch = {
        swatchWidthCm: 10,
        swatchHeightCm: 10,
        swatchWeightGrams: 10,
        finishedWidthCm: 50,
        finishedHeightCm: 60,
        skeinWeightGrams: 100,
      };

      expect(() => estimateYarnFromSwatch({ ...baseSwatch, swatchWidthCm: 0 })).toThrow();
      expect(() => estimateYarnFromSwatch({ ...baseSwatch, finishedHeightCm: 0 })).toThrow();
      expect(() => estimateYarnFromSwatch({ ...baseSwatch, swatchWeightGrams: 0 })).toThrow();
      expect(() => estimateYarnFromSwatch({ ...baseSwatch, skeinWeightGrams: 0 })).toThrow();
    });
  });

  describe('Niezmienniki Silnika Licznika w Warunkach Anomalii (Counter Invariants)', () => {
    const config: CounterConfig = {
      id: 'cnt_resil_01',
      partId: 'part_01',
      name: 'Rękaw',
      initialValue: 0,
    };

    test('Ignoruje zdarzenia UNDO wskazujące na nieistniejące targetEventId', () => {
      const events: CounterEvent[] = [
        {
          id: 'ev_1',
          counterId: config.id,
          type: 'INCREMENT',
          delta: 1,
          source: 'iphone',
          timestampMs: 1000,
        },
        {
          id: 'ev_2',
          counterId: config.id,
          type: 'UNDO',
          delta: -1,
          targetEventId: 'ev_nieistniejace',
          source: 'iphone',
          timestampMs: 2000,
        },
      ];

      const state = computeCounterState(config, events);
      expect(state.rawValue).toBe(1);
      expect(state.activeEventsCount).toBe(1);
    });

    test('Wielokrotne UNDO tego samego zdarzenia jest idempotentne', () => {
      const events: CounterEvent[] = [
        {
          id: 'ev_1',
          counterId: config.id,
          type: 'INCREMENT',
          delta: 1,
          source: 'iphone',
          timestampMs: 1000,
        },
        {
          id: 'ev_undo_1',
          counterId: config.id,
          type: 'UNDO',
          delta: -1,
          targetEventId: 'ev_1',
          source: 'iphone',
          timestampMs: 2000,
        },
        {
          id: 'ev_undo_2',
          counterId: config.id,
          type: 'UNDO',
          delta: -1,
          targetEventId: 'ev_1',
          source: 'apple_watch',
          timestampMs: 3000,
        },
      ];

      const state = computeCounterState(config, events);
      expect(state.rawValue).toBe(0);
      expect(state.activeEventsCount).toBe(0);
    });

    test('shouldDebounceClick poprawnie obsługuje ujemne lub odwrócone sygnatury czasowe', () => {
      // Normalny debounce (czas w przód, poniżej progu)
      expect(shouldDebounceClick(1000, 1100, 300)).toBe(true);

      // Czas powyżej progu (dozwolone kliknięcie)
      expect(shouldDebounceClick(1000, 1400, 300)).toBe(false);

      // Brak poprzedniego kliknięcia
      expect(shouldDebounceClick(undefined, 1000, 300)).toBe(false);

      // Odwrócony czas (np. skok zegara systemowego wstecz)
      expect(shouldDebounceClick(2000, 1000, 300)).toBe(false);
    });
  });
});
