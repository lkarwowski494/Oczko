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
import { identifyStitch } from '../stitch-identifier';
import {
  calculateEvenIncreases,
  calculateEvenDecreases,
  calculateMultiRowShaping,
} from '../shaping-calculator';
import {
  deserializeGarminEnvelope,
  GarminOfflineQueue,
  handleGarminWatchEvent,
  GARMIN_COMM_UUID,
  GarminWatchEvent,
} from '../garmin-service';
import {
  convertNeedleSize,
  findClosestMetricNeedle,
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
import { RaglanCalculator } from '../raglan-calculator';
import { calculateHatCrown } from '../hat-calculator';
import {
  formatDuration,
  shouldAutoPauseSession,
  calculateKnittingSpeed,
} from '../time-tracking-service';
import {
  diagnoseEmergency,
  getProcedureById,
  listAllProcedures,
} from '../knitting-doctor';

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

  describe('Odporność Klucza Identyfikacji Ściegów na Zniekształcone Dane (DEC-16)', () => {
    test('Obsługuje puste, częściowe i nieznane cechy wejściowe bez rzucania wyjątków', () => {
      // Pusty słownik
      const resEmpty = identifyStitch({});
      expect(resEmpty.id).toBe('stockinette');

      // Nieznane identyfikatory opcji
      const resGibberish = identifyStitch({
        surface_texture: 'nieznana_faktura_xyz',
        reversibility: 'nieznany_spod_123',
        edge_and_stretch: 'losowa_cecha_999',
      });
      expect(resGibberish.id).toBe('stockinette');
      expect(resGibberish.namePl.length).toBeGreaterThan(0);
      expect(resGibberish.description.length).toBeGreaterThan(0);
    });
  });

  describe('Odporność Kalkulatora Kształtowania Oczek (shaping-calculator.ts)', () => {
    test('Obsługuje ujemne, ułamkowe i zerowe wartości wejściowe bez awarii', () => {
      // Ujemne wartości w dodawaniu
      const incNeg = calculateEvenIncreases(-50, -20, -5);
      expect(incNeg.initialStitches).toBe(0);
      expect(incNeg.targetStitches).toBe(0);
      expect(incNeg.isValid).toBe(true);

      // Ujemne wartości w odejmowaniu
      const decNeg = calculateEvenDecreases(-100, -50, -2);
      expect(decNeg.initialStitches).toBe(0);
      expect(decNeg.targetStitches).toBe(0);
      expect(decNeg.isValid).toBe(true);

      // Wartości ułamkowe (zaokrąglane w dół do int)
      const incFloat = calculateEvenIncreases(60.9, 72.4, 1.8);
      expect(incFloat.initialStitches).toBe(60);
      expect(incFloat.targetStitches).toBe(72);
      expect(incFloat.edgeStitches).toBe(1);
      expect(incFloat.isValid).toBe(true);

      // Wielorzędowe z ujemnymi rzędami
      const multiNeg = calculateMultiRowShaping({
        startStitches: -20,
        endStitches: -10,
        totalRows: -5,
        shapingPlacement: 'both_edges',
      });
      expect(multiNeg.startStitches).toBe(1);
      expect(multiNeg.endStitches).toBe(1);
      expect(multiNeg.totalRows).toBe(1);
      expect(multiNeg.isValid).toBe(true);
    });

    test('Skrajnie duża liczba oczek (np. 100 000) nie powoduje zawieszenia', () => {
      const hugeInc = calculateEvenIncreases(100000, 120000, 2, 'M1L');
      expect(hugeInc.isValid).toBe(true);
      expect(hugeInc.difference).toBe(20000);
      expect(hugeInc.groups.length).toBeGreaterThan(0);
    });
  });

  describe('Odporność Protokołu Garmin ConnectIQ na uszkodzone dane i payloady BLE', () => {
    test('deserializeGarminEnvelope bezpiecznie odrzuca uszkodzone dane wejściowe', () => {
      // 1. Puste i niepoprawne typy
      expect(deserializeGarminEnvelope('')).toEqual({ valid: false, error: 'EMPTY_PAYLOAD' });
      expect(deserializeGarminEnvelope(null as any)).toEqual({ valid: false, error: 'EMPTY_PAYLOAD' });
      expect(deserializeGarminEnvelope(undefined as any)).toEqual({ valid: false, error: 'EMPTY_PAYLOAD' });

      // 2. Niepoprawny JSON
      expect(deserializeGarminEnvelope('{ invalid json').valid).toBe(false);
      expect(deserializeGarminEnvelope('{ invalid json').error).toMatch(/JSON_SYNTAX_ERROR/);

      // 3. Typ nieobiektowy po parsowaniu (np. liczba lub string JSON)
      expect(deserializeGarminEnvelope('"string"')).toEqual({ valid: false, error: 'NOT_AN_OBJECT' });
      expect(deserializeGarminEnvelope('123')).toEqual({ valid: false, error: 'NOT_AN_OBJECT' });

      // 4. Nieprawidłowy lub brakujący appUuid
      expect(
        deserializeGarminEnvelope(JSON.stringify({ appUuid: 'wrong-uuid', type: 'ACK' }))
      ).toEqual({ valid: false, error: 'INVALID_APP_UUID' });

      // 5. Brak typu wiadomości
      expect(
        deserializeGarminEnvelope(JSON.stringify({ appUuid: GARMIN_COMM_UUID }))
      ).toEqual({ valid: false, error: 'MISSING_MESSAGE_TYPE' });
    });

    test('GarminOfflineQueue bezpiecznie obsługuje przepełnienie i odrzuca nadmiarowe wpisy', () => {
      const queue = new GarminOfflineQueue(3);
      const results: boolean[] = [];
      for (let i = 1; i <= 5; i++) {
        const ev: GarminWatchEvent = {
          eventId: `ev_${i}`,
          source: 'garmin_connectiq',
          button: 'KEY_START_STOP',
          counterId: 'c1',
          timestamp: i * 100,
        };
        results.push(queue.enqueue(ev));
      }

      expect(results).toEqual([true, true, true, false, false]);
      expect(queue.size()).toBe(3);
      const items = queue.flush();
      expect(items.map((e) => e.eventId)).toEqual(['ev_1', 'ev_2', 'ev_3']);
      expect(queue.size()).toBe(0);
    });

    test('handleGarminWatchEvent działa bezpiecznie przy pustym obiekcie akcji i nieznanych przyciskach', () => {
      const event: GarminWatchEvent = {
        eventId: 'ev_test',
        source: 'garmin_connectiq',
        button: 'TOUCH_TAP',
        counterId: 'c1',
        timestamp: 1234,
      };

      // Nie rzuca błędu przy pustych handlerach
      expect(() => handleGarminWatchEvent(event, {})).not.toThrow();

      // Nieznany przycisk
      const unknownEvent = { ...event, button: 'UNKNOWN_BUTTON' as any };
      expect(() => handleGarminWatchEvent(unknownEvent, {})).not.toThrow();
    });
  });

  describe('Odporność Przelicznika Rozmiarów Drutów i Jednostek (needle-gauge-converter.ts)', () => {
    test('Bezpieczna obsługa wartości brzegowych w konwersji rozmiarów drutów', () => {
      // 1. Skrajnie małe i duże mm
      const tiny = findClosestMetricNeedle(-5);
      expect(tiny.metricMm).toBe(2.0);

      const huge = findClosestMetricNeedle(999);
      expect(huge.metricMm).toBe(25.0);

      // 2. Nieprawidłowe ciągi i NaN
      const nanRes = convertNeedleSize('nieznany rozmiar', 'metric');
      expect(nanRes.metricMm).toBe(4.0);

      const emptyRes = convertNeedleSize('', 'us');
      expect(emptyRes.metricMm).toBe(4.0);

      const ukUnknown = convertNeedleSize('uk 99', 'uk');
      expect(ukUnknown.metricMm).toBe(4.0);

      const jpUnknown = convertNeedleSize('jp 99', 'jp');
      expect(jpUnknown.metricMm).toBe(4.0);
    });

    test('Przeliczniki jednostek rzemieślniczych zwracają 0 dla ujemnych i NaN', () => {
      expect(convertCraftLength(-10, 'meters', 'yards')).toBe(0);
      expect(convertCraftLength(NaN, 'meters', 'yards')).toBe(0);
      expect(convertCraftLength(10, 'meters', 'meters')).toBe(10);

      expect(convertCraftWeight(-5, 'grams', 'ounces')).toBe(0);
      expect(convertCraftWeight(NaN, 'grams', 'ounces')).toBe(0);
      expect(convertCraftWeight(50, 'grams', 'grams')).toBe(50);

      expect(convertGaugeTension(-20, '10cm', '4inch')).toBe(0);
      expect(convertGaugeTension(NaN, '10cm', '4inch')).toBe(0);
      expect(convertGaugeTension(22, '10cm', '10cm')).toBe(22);
    });
  });

  describe('Odporność Kalkulatora Zamienników Włóczki (yarn-substitution-service.ts)', () => {
    test('Weryfikacja rzucania wyjątków dla wartości brzegowych i niepoprawnych', () => {
      // 1. Zera i ujemne
      expect(() =>
        YarnSubstitutionService.calculateSubstitution({
          patternBalls: -1,
          patternBallLengthMeters: 100,
          newBallLengthMeters: 100,
        })
      ).toThrow();

      expect(() =>
        YarnSubstitutionService.calculateSubstitution({
          patternBalls: 5,
          patternBallLengthMeters: 0,
          newBallLengthMeters: 100,
        })
      ).toThrow();

      expect(() =>
        YarnSubstitutionService.calculateSubstitution({
          patternBalls: 5,
          patternBallLengthMeters: 100,
          newBallLengthMeters: -50,
        })
      ).toThrow();

      expect(() =>
        YarnSubstitutionService.calculateSubstitution({
          patternBalls: 5,
          patternBallLengthMeters: 100,
          newBallLengthMeters: 100,
          strands: -1,
        })
      ).toThrow();

      expect(() =>
        YarnSubstitutionService.calculateSubstitution({
          patternBalls: 5,
          patternBallLengthMeters: 100,
          newBallLengthMeters: 100,
          safetyMarginPercent: -10,
        })
      ).toThrow();

      // 2. WPI nieprawidłowe
      expect(() => YarnSubstitutionService.classifyByWpi(0)).toThrow();
      expect(() => YarnSubstitutionService.classifyByWpi(-10)).toThrow();
    });

    test('Ekstremalne wartości (wielkie projekty, koce, setki motków) nie powodują przepełnienia ani NaN', () => {
      const hugeResult = YarnSubstitutionService.calculateSubstitution({
        patternBalls: 1000,
        patternBallLengthMeters: 500,
        newBallLengthMeters: 120,
        newBallWeightGrams: 50,
        safetyMarginPercent: 20,
      });

      expect(hugeResult.ballsNeeded).toBeGreaterThan(0);
      expect(Number.isFinite(hugeResult.totalRequiredMeters)).toBe(true);
      expect(Number.isFinite(hugeResult.exactBalls)).toBe(true);
      expect(hugeResult.totalEstimatedWeightGrams).toBeGreaterThan(0);
    });
  });

  describe('Wstrzykiwanie Błędów do Kalkulatora Luzu i Doboru Rozmiaru (ease-calculator-service.ts)', () => {
    test('Nieprawidłowe, ujemne lub zerowe wartości wejściowe rzucają kontrolowane błędy', () => {
      expect(() => calculateDetailedEase(0, 100)).toThrow();
      expect(() => calculateDetailedEase(-80, 100)).toThrow();
      expect(() => calculateDetailedEase(90, 0)).toThrow();
      expect(() => calculateDetailedEase(90, -100)).toThrow();

      expect(() => recommendPatternSize(0, 5, [{ name: 'S', finishedCircumferenceCm: 90 }])).toThrow();
      expect(() => recommendPatternSize(90, 5, [])).toThrow();
      expect(() => recommendPatternSize(90, 5, [{ name: 'Błąd', finishedCircumferenceCm: -50 }])).toThrow();
      expect(() => recommendPatternSize(20, -30, [{ name: 'S', finishedCircumferenceCm: 90 }])).toThrow();

      expect(() =>
        adaptStitchesWithRecommendation({
          patternStitches: 0,
          patternGaugePer10cm: 20,
          myGaugePer10cm: 22,
        })
      ).toThrow();
      expect(() =>
        adaptStitchesWithRecommendation({
          patternStitches: 100,
          patternGaugePer10cm: -20,
          myGaugePer10cm: 22,
        })
      ).toThrow();
    });

    test('Skrajne wartości (miniaturowe lalki, gigantyczne koce) zachowują stabilność numeryczną', () => {
      // Bardzo mały wyrób (ubranko dla lalki: obwód 10 cm, luz 1 cm)
      const doll = calculateDetailedEase(10, 11);
      expect(doll.easeCm).toBe(1);
      expect(Number.isFinite(doll.percentageOfBody)).toBe(true);

      // Bardzo duży wyrób (koc / narzuta: 300 cm)
      const big = adaptStitchesWithRecommendation({
        patternStitches: 600,
        patternGaugePer10cm: 20,
        myGaugePer10cm: 25,
        repeatMultiple: 12,
        edgeStitches: 4,
      });
      expect(big.recommendedStitches).toBeGreaterThan(600);
      expect(Number.isFinite(big.recommendedWidthCm)).toBe(true);
    });
  });

  describe('Wstrzykiwanie Błędów do Kalkulatora Raglanu (raglan-calculator.ts)', () => {
    test('Nieprawidłowe, ujemne i zbyt małe wartości rzucają błędy walidacji', () => {
      expect(() => RaglanCalculator.calculateCastOnDivision({ totalCastOnStitches: -10 })).toThrow();
      expect(() => RaglanCalculator.calculateCastOnDivision({ totalCastOnStitches: 10, raglanLineStitches: 2 })).toThrow();
      expect(() => RaglanCalculator.calculateCastOnDivision({ totalCastOnStitches: 80, raglanLineStitches: -1 })).toThrow();
      expect(() => RaglanCalculator.calculateCastOnDivision({ totalCastOnStitches: 80, shortRowTurnsPerSide: -4 })).toThrow();
      expect(() => RaglanCalculator.calculateCastOnDivision({ totalCastOnStitches: 80, sleeveRatio: -0.1 })).toThrow();

      expect(() =>
        RaglanCalculator.calculateGermanShortRows({
          neckRiseCm: -2,
          rowGaugePer10cm: 28,
          sleeveStitches: 14,
          frontStitches: 28,
        })
      ).toThrow();

      expect(() =>
        RaglanCalculator.calculateYokeIncreases({
          stitchGaugePer10cm: 20,
          rowGaugePer10cm: 28,
          desiredChestCircumferenceCm: 0,
          desiredSleeveCircumferenceCm: 34,
          yokeDepthCm: 22,
          initialBackStitches: 20,
          initialFrontStitches: 20,
          initialSleeveStitches: 10,
        })
      ).toThrow();
    });

    test('Wielkie projekty (swetry oversize, 300 oczek) zachowują spójność numeryczną', () => {
      const hugeDivision = RaglanCalculator.calculateCastOnDivision({
        totalCastOnStitches: 320,
        raglanLineStitches: 4,
        shortRowTurnsPerSide: 6,
      });

      expect(hugeDivision.initialBackStitches).toBeGreaterThan(50);
      expect(hugeDivision.isBalancedAfterShortRows).toBe(true);

      const hugeYoke = RaglanCalculator.calculateYokeIncreases({
        stitchGaugePer10cm: 28,
        rowGaugePer10cm: 36,
        desiredChestCircumferenceCm: 160,
        desiredSleeveCircumferenceCm: 50,
        yokeDepthCm: 30,
        initialBackStitches: hugeDivision.initialBackStitches,
        initialFrontStitches: hugeDivision.initialFrontStitches,
        initialSleeveStitches: hugeDivision.initialSleeveStitches,
        raglanLineStitches: 4,
        underarmCastOnStitches: 16,
      });

      expect(hugeYoke.finalBodyStitches).toBeGreaterThan(400);
      expect(Number.isFinite(hugeYoke.resultingChestCircumferenceCm)).toBe(true);
    });
  });

  describe('Odporność Kalkulatora Korony Czapki (hat-calculator.ts)', () => {
    test('Skrajne wartości wejściowe i wielkie rozmiary (obwód 80 cm, 8 klinów) zachowują spójność', () => {
      const res = calculateHatCrown({
        headCircumferenceCm: 80,
        negativeEaseCm: 15,
        gaugeStitchesPer10Cm: 32,
        gaugeRowsPer10Cm: 45,
        brimStyle: 'folded',
        brimHeightCm: 12,
        fitStyle: 'slouchy',
        slouchExtraCm: 8,
        wedges: 8,
      });

      expect(res.castOnStitches % 8).toBe(0);
      expect(res.finalRemainingStitches).toBe(8);
      expect(res.rounds.length).toBeGreaterThan(10);
      expect(Number.isFinite(res.totalHeightCm)).toBe(true);
    });

    test('Wartości minimalne i zerowe są bezpiecznie domyślne lub klamrowane', () => {
      const res = calculateHatCrown({
        headCircumferenceCm: 0,
        negativeEaseCm: -10,
        gaugeStitchesPer10Cm: 0,
        gaugeRowsPer10Cm: 0,
        brimStyle: 'single',
        brimHeightCm: 0,
        fitStyle: 'beanie',
        wedges: 6,
      });

      expect(res.castOnStitches).toBeGreaterThanOrEqual(24);
      expect(res.rounds.length).toBeGreaterThan(0);
      expect(res.finalRemainingStitches).toBe(6);
    });
  });

  describe('Odporność Śledzenia Czasu i Prędkości Dziergania (time-tracking-service.ts)', () => {
    test('Obsługa wartości ujemnych, NaN i skrajnych w formatDuration', () => {
      expect(formatDuration(-100)).toBe('0s');
      expect(formatDuration(NaN as any)).toBe('0s');
      expect(formatDuration(undefined as any)).toBe('0s');
      expect(formatDuration(3665)).toBe('1h 1m');
      expect(formatDuration(65)).toBe('1m 5s');
      expect(formatDuration(42)).toBe('42s');
      expect(formatDuration(315360000)).toBe('87600h 0m'); // 10 lat
    });

    test('Obsługa nieprawidłowych i ujemnych timestampów w shouldAutoPauseSession', () => {
      expect(shouldAutoPauseSession(-500, 1000, 5)).toBe(false);
      expect(shouldAutoPauseSession(1000, -500, 5)).toBe(false);
      expect(shouldAutoPauseSession(0, 0, 5)).toBe(false);
      expect(shouldAutoPauseSession(1000, 1000, 0)).toBe(false);
    });

    test('Skrajne parametry i dzielenie przez zero w calculateKnittingSpeed', () => {
      const zeroResult = calculateKnittingSpeed(0, 0, 100);
      expect(zeroResult.rowsPerHour).toBe(0);
      expect(zeroResult.averageSecondsPerRow).toBe(0);
      expect(zeroResult.formattedRemainingTime).toBe('Brak danych');

      const negativeResult = calculateKnittingSpeed(-100, -5, -10);
      expect(negativeResult.rowsPerHour).toBe(0);
      expect(negativeResult.averageSecondsPerRow).toBe(0);
      expect(negativeResult.formattedRemainingTime).toBe('Cel osiągnięty');

      const hugeResult = calculateKnittingSpeed(100000000, 500000, 750000);
      expect(Number.isFinite(hugeResult.rowsPerHour)).toBe(true);
      expect(Number.isFinite(hugeResult.estimatedRemainingSeconds)).toBe(true);
    });
  });

  describe('Odporność Doktora Błędów i Ratowania Dzianiny (knitting-doctor.ts)', () => {
    test('Obsługa null, undefined, pustych stringów i znaków specjalnych w diagnoseEmergency', () => {
      expect(diagnoseEmergency(null as any)).toHaveLength(6);
      expect(diagnoseEmergency(undefined as any)).toHaveLength(6);
      expect(diagnoseEmergency('   ')).toHaveLength(6);
      expect(diagnoseEmergency('!@#$%^&*()_+{}|:"<>?')).toHaveLength(0);
      expect(diagnoseEmergency('🧶 🪢 🚨 🩺')).toHaveLength(0);
      expect(diagnoseEmergency('a'.repeat(1000))).toHaveLength(0);
    });

    test('Bezpieczne zapytania o nieistniejące identyfikatory i dyscypliny', () => {
      expect(getProcedureById('' as any)).toBeUndefined();
      expect(getProcedureById('non_existent_procedure' as any)).toBeUndefined();
      expect(listAllProcedures(undefined)).toHaveLength(6);
      expect(listAllProcedures('invalid_discipline' as any)).toHaveLength(0);
    });
  });
});



