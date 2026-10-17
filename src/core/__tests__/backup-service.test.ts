import { createInMemoryDatabase } from '../database';
import {
  exportDatabaseBackup,
  exportBackupToJson,
  validateBackupData,
  importDatabaseBackup,
  getDatabaseStats,
  OczkoBackupData,
  buildBackupEnvelope,
  autoBackup,
  safetyBackup,
} from '../backup-service';
import { insertProject, insertProjectPart, insertCounter, appendCounterEvent } from '../project-repository';
import { insertStashYarn, insertStashTool } from '../stash-repository';

describe('Oczko Backup Service (DEC-10, ZP-06, BR-DANE-002)', () => {
  it('correctly reads stats and exports full database state to backup object and JSON', async () => {
    const db = createInMemoryDatabase();

    // 1. Sprawdzenie pustych statystyk
    const initialStats = await getDatabaseStats(db);
    expect(initialStats).toEqual({
      projects: 0,
      parts: 0,
      counters: 0,
      events: 0,
      yarns: 0,
      tools: 0,
      pattern_documents: 0,
      project_time_sessions: 0,
      app_entitlements: 0,
      app_settings: 0,
    });

    // 2. Dodanie danych testowych
    await insertProject(db, {
      id: 'proj-1',
      name: 'Sweter testowy',
      craftType: 'knitting',
      status: 'active',
      createdAt: '2026-10-15T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z',
    });

    await insertProjectPart(db, {
      id: 'part-1',
      projectId: 'proj-1',
      name: 'Korpus',
      sortOrder: 1,
      targetRows: 120,
    });

    await insertCounter(db, {
      id: 'cnt-1',
      partId: 'part-1',
      name: 'Rzędy główne',
      initialValue: 0,
      step: 1,
    });

    await appendCounterEvent(db, {
      id: 'ev-1',
      counterId: 'cnt-1',
      type: 'INCREMENT',
      delta: 1,
      source: 'iphone',
      timestampMs: 1700000000000,
    });

    await insertStashYarn(db, {
      id: 'yarn-1',
      brand: 'Drops',
      name: 'Air',
      colorway: 'Perłowy',
      weightCategory: 'Aran',
      composition: '65% Alpaca, 28% Polyamide, 7% Wool',
      skeinsTotal: 5,
      skeinsRemaining: 4.5,
      createdAt: '2026-10-15T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z',
    });

    await insertStashTool(db, {
      id: 'tool-1',
      name: 'Druty z żyłką 4.5mm',
      toolType: 'circular',
      sizeMm: 4.5,
      material: 'metal',
      cableLengthCm: 80,
      createdAt: '2026-10-15T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z',
    });

    await db.runAsync(
      `INSERT INTO pattern_documents (id, project_id, file_name, file_uri, file_size, current_page, total_pages, ruler_y_percent, ruler_height_percent, auto_step_enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['doc-1', 'proj-1', 'wzor.pdf', 'file:///wzor.pdf', 1024, 1, 2, 20, 6, 1, '2026-10-15T10:00:00.000Z', '2026-10-15T10:00:00.000Z']
    );

    await db.runAsync(
      `INSERT INTO project_time_sessions (id, project_id, start_time_ms, end_time_ms, elapsed_seconds, start_row, end_row, rows_knitted, average_seconds_per_row, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['sess-1', 'proj-1', 1000, 2000, 60, 0, 5, 5, 12, '2026-10-15T10:00:00.000Z']
    );

    await db.runAsync(
      `INSERT INTO app_entitlements (id, plan_type, status, trial_started_at, purchased_at, expires_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['ent-1', 'annual', 'active', '2026-10-15T10:00:00.000Z', '2026-10-15T10:00:00.000Z', null, '2026-10-15T10:00:00.000Z']
    );

    await db.runAsync(
      `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)`,
      ['language', 'pl', '2026-10-15T10:00:00.000Z']
    );

    // 3. Weryfikacja statystyk
    const stats = await getDatabaseStats(db);
    expect(stats).toEqual({
      projects: 1,
      parts: 1,
      counters: 1,
      events: 1,
      yarns: 1,
      tools: 1,
      pattern_documents: 1,
      project_time_sessions: 1,
      app_entitlements: 1,
      app_settings: 1,
    });

    // 4. Eksport kopii
    const backup = await exportDatabaseBackup(db);
    expect(backup.metadata.appName).toBe('Oczko');
    expect(backup.metadata.version).toBe(1);
    expect(backup.metadata.bundleId).toBe('com.apps4brew.knitting');
    expect(backup.metadata.itemCounts).toEqual(stats);

    expect(backup.projects).toHaveLength(1);
    expect(backup.projects[0].name).toBe('Sweter testowy');
    expect(backup.project_parts).toHaveLength(1);
    expect(backup.counters).toHaveLength(1);
    expect(backup.counter_events).toHaveLength(1);
    expect(backup.stash_yarns).toHaveLength(1);
    expect(backup.stash_tools).toHaveLength(1);
    expect(backup.pattern_documents).toHaveLength(1);
    expect(backup.project_time_sessions).toHaveLength(1);
    expect(backup.app_entitlements).toHaveLength(1);
    expect(backup.app_settings).toHaveLength(1);

    // 5. Eksport do formatu JSON
    const jsonString = await exportBackupToJson(db);
    const parsed = JSON.parse(jsonString);
    expect(parsed.metadata.appName).toBe('Oczko');
  });

  it('validates backup data structure and detects invalid formats', () => {
    // Prawidłowy backup
    const validBackup: OczkoBackupData = {
      metadata: {
        version: 1,
        appName: 'Oczko',
        bundleId: 'com.apps4brew.knitting',
        exportedAt: '2026-10-15T10:00:00.000Z',
        itemCounts: {
          projects: 0,
          parts: 0,
          counters: 0,
          events: 0,
          yarns: 0,
          tools: 0,
          pattern_documents: 0,
          project_time_sessions: 0,
          app_entitlements: 0,
          app_settings: 0,
        },
      },
      projects: [],
      project_parts: [],
      counters: [],
      counter_events: [],
      stash_yarns: [],
      stash_tools: [],
    };

    const resValid = validateBackupData(validBackup);
    expect(resValid.valid).toBe(true);

    // Błędny JSON string
    const resBadJson = validateBackupData('{ invalid json ');
    expect(resBadJson.valid).toBe(false);

    // Zła nazwa aplikacji
    const resBadApp = validateBackupData({
      metadata: { version: 1, appName: 'InnaAplikacja' },
      projects: [],
    });
    expect(resBadApp.valid).toBe(false);

    // Nieobsługiwana wersja schematu
    const resBadVer = validateBackupData({
      metadata: { version: 99, appName: 'Oczko' },
      projects: [],
    });
    expect(resBadVer.valid).toBe(false);

    // Brakujące tabele
    const resMissingTables = validateBackupData({
      metadata: { version: 1, appName: 'Oczko' },
      projects: [],
    });
    expect(resMissingTables.valid).toBe(false);
  });

  it('imports backup into a fresh database and restores full entity state', async () => {
    const sourceDb = createInMemoryDatabase();

    await insertProject(sourceDb, {
      id: 'proj-restore',
      name: 'Kocyk dziecięcy',
      craftType: 'crochet',
      status: 'active',
      createdAt: '2026-10-15T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z',
    });

    await insertProjectPart(sourceDb, {
      id: 'part-restore',
      projectId: 'proj-restore',
      name: 'Środek',
      sortOrder: 0,
      targetRows: 80,
    });

    await insertCounter(sourceDb, {
      id: 'cnt-restore',
      partId: 'part-restore',
      name: 'Okrążenia',
      initialValue: 0,
      step: 1,
    });

    await appendCounterEvent(sourceDb, {
      id: 'ev-restore-1',
      counterId: 'cnt-restore',
      type: 'INCREMENT',
      delta: 1,
      source: 'iphone',
      timestampMs: 1700000001000,
    });

    await insertStashYarn(sourceDb, {
      id: 'yarn-restore',
      brand: 'YarnArt',
      name: 'Jeans',
      colorway: 'Błękit',
      weightCategory: 'Sport',
      composition: '55% Cotton, 45% Acrylic',
      skeinsTotal: 3,
      skeinsRemaining: 3,
      createdAt: '2026-10-15T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z',
    });

    await insertStashTool(sourceDb, {
      id: 'tool-restore',
      name: 'Druty KP 3.5mm',
      toolType: 'circular',
      sizeMm: 3.5,
      material: 'wood',
      cableLengthCm: 60,
      createdAt: '2026-10-15T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z',
    });

    await sourceDb.runAsync(
      `INSERT INTO pattern_documents (id, project_id, file_name, file_uri, file_size, current_page, total_pages, ruler_y_percent, ruler_height_percent, auto_step_enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['doc-res', 'proj-restore', 'kocyk.pdf', 'file:///kocyk.pdf', 2048, 1, 1, 15, 5, 1, '2026-10-15T10:00:00.000Z', '2026-10-15T10:00:00.000Z']
    );

    await sourceDb.runAsync(
      `INSERT INTO project_time_sessions (id, project_id, start_time_ms, end_time_ms, elapsed_seconds, start_row, end_row, rows_knitted, average_seconds_per_row, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['sess-res', 'proj-restore', 1000, 3000, 120, 0, 10, 10, 12, '2026-10-15T10:00:00.000Z']
    );

    await sourceDb.runAsync(
      `INSERT INTO app_entitlements (id, plan_type, status, trial_started_at, purchased_at, expires_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['ent-res', 'lifetime', 'active', '2026-10-15T10:00:00.000Z', '2026-10-15T10:00:00.000Z', null, '2026-10-15T10:00:00.000Z']
    );

    await sourceDb.runAsync(
      `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)`,
      ['unit_system', 'imperial', '2026-10-15T10:00:00.000Z']
    );

    const backupJson = await exportBackupToJson(sourceDb);

    // Nowa baza z innymi danymi początkowymi
    const targetDb = createInMemoryDatabase();
    await insertProject(targetDb, {
      id: 'old-proj',
      name: 'Stary projekt do nadpisania',
      craftType: 'knitting',
      status: 'frogged',
      createdAt: '2026-10-14T00:00:00.000Z',
      updatedAt: '2026-10-14T00:00:00.000Z',
    });

    // Przywrócenie z kopii
    const result = await importDatabaseBackup(targetDb, backupJson);
    expect(result.success).toBe(true);
    expect(result.importedCounts.projects).toBe(1);
    expect(result.importedCounts.events).toBe(1);
    expect(result.importedCounts.yarns).toBe(1);
    expect(result.importedCounts.tools).toBe(1);
    expect(result.importedCounts.pattern_documents).toBe(1);
    expect(result.importedCounts.project_time_sessions).toBe(1);
    expect(result.importedCounts.app_entitlements).toBe(1);
    expect(result.importedCounts.app_settings).toBe(1);

    // Weryfikacja stanu targetDb
    const targetStats = await getDatabaseStats(targetDb);
    expect(targetStats.projects).toBe(1);
    expect(targetStats.events).toBe(1);
    expect(targetStats.yarns).toBe(1);
    expect(targetStats.tools).toBe(1);
    expect(targetStats.pattern_documents).toBe(1);
    expect(targetStats.project_time_sessions).toBe(1);
    expect(targetStats.app_entitlements).toBe(1);
    expect(targetStats.app_settings).toBe(1);

    const restoredProjects = await targetDb.getAllAsync<any>('SELECT * FROM projects');
    expect(restoredProjects[0].name).toBe('Kocyk dziecięcy');
    expect(restoredProjects[0].id).toBe('proj-restore');

    const restoredSettings = await targetDb.getAllAsync<any>('SELECT * FROM app_settings WHERE key = ?', ['unit_system']);
    expect(restoredSettings[0].value).toBe('imperial');
  });

  it('odrzuca backup będący liczbą lub wartością prostą oraz rzuca błąd przy importowaniu niepoprawnego backupu', async () => {
    const valNonObject = validateBackupData('12345');
    expect(valNonObject.valid).toBe(false);
    if (!valNonObject.valid) {
      expect(valNonObject.error).toContain('musi być obiektem JSON');
    }

    const db = createInMemoryDatabase();
    await expect(importDatabaseBackup(db, '{ "bad": true }')).rejects.toThrow('Błąd walidacji kopii zapasowej');
  });

  it('obsługuje standard koperty OczkoBackupEnvelope oraz walidację wersji schematu', async () => {
    const db = createInMemoryDatabase();
    const backupData = await exportDatabaseBackup(db);
    const envelope = buildBackupEnvelope(backupData);

    expect(envelope.format).toBe('oczko-backup');
    expect(envelope.schemaVersion).toBe(1);
    expect(envelope.state).toEqual(backupData);

    // Walidacja poprawnej koperty
    const valEnvelope = validateBackupData(envelope);
    expect(valEnvelope.valid).toBe(true);

    // Błędna wersja schematu
    const invalidVersion = { ...envelope, schemaVersion: 999 };
    const valBadVer = validateBackupData(invalidVersion);
    expect(valBadVer.valid).toBe(false);

    // Nieprawidłowa wersja schematu <= 0
    const zeroVersion = { ...envelope, schemaVersion: 0 };
    expect(validateBackupData(zeroVersion).valid).toBe(false);

    // Brak sekcji state
    const noState = { format: 'oczko-backup', schemaVersion: 1 };
    expect(validateBackupData(noState).valid).toBe(false);
  });

  it('autoBackup i safetyBackup zapisują pliki w katalogu Backup/ i rotują do 10 kopii', async () => {
    const db = createInMemoryDatabase();

    // Mock modułu FileSystem
    const virtualFiles: Record<string, string> = {};
    const mockFs = {
      documentDirectory: 'file:///data/user/0/com.apps4brew.knitting/files/',
      getInfoAsync: jest.fn(async (path: string) => ({ exists: path in virtualFiles })),
      makeDirectoryAsync: jest.fn(async () => {}),
      writeAsStringAsync: jest.fn(async (path: string, content: string) => {
        virtualFiles[path] = content;
      }),
      readDirectoryAsync: jest.fn(async () => {
        const prefix = 'file:///data/user/0/com.apps4brew.knitting/files/Backup/';
        return Object.keys(virtualFiles)
          .filter((k) => k.startsWith(prefix))
          .map((k) => k.replace(prefix, ''));
      }),
      deleteAsync: jest.fn(async (path: string) => {
        delete virtualFiles[path];
      }),
    };

    // 1. Wykonanie autoBackup
    const autoPath = await autoBackup(db, mockFs);
    expect(autoPath).toBeDefined();
    expect(autoPath).toContain('oczko-');
    expect(autoPath).toContain('.json');

    // 2. Wykonanie safetyBackup przed importem i resetem
    const safetyImportPath = await safetyBackup('import', db, mockFs);
    expect(safetyImportPath).toContain('oczko-przed-importem-');

    const safetyResetPath = await safetyBackup('reset', db, mockFs);
    expect(safetyResetPath).toContain('oczko-przed-czyszczeniem-');

    // 3. Symulacja rotacji powyżej 10 plików
    for (let i = 1; i <= 15; i++) {
      const pad = String(i).padStart(2, '0');
      const fakeFileName = `oczko-2026-10-16-1200${pad}.json`;
      virtualFiles[`file:///data/user/0/com.apps4brew.knitting/files/Backup/${fakeFileName}`] = '{}';
    }

    await autoBackup(db, mockFs);
    expect(mockFs.deleteAsync).toHaveBeenCalled();

    // Błąd braku documentDirectory
    await expect(autoBackup(db, { documentDirectory: null })).resolves.toBeNull();

    // Błąd zapisu na dysku i czyszczenie pliku tymczasowego
    const failingFs = {
      documentDirectory: 'file:///data/user/0/com.apps4brew.knitting/files/',
      getInfoAsync: jest.fn(async () => ({ exists: true })),
      makeDirectoryAsync: jest.fn(async () => {}),
      writeAsStringAsync: jest.fn(async () => {
        throw new Error('Dysk pełny');
      }),
      deleteAsync: jest.fn(async () => {}),
    };
    await expect(safetyBackup('import', db, failingFs)).rejects.toThrow('Dysk pełny');
    expect(failingFs.deleteAsync).toHaveBeenCalled();

    // autoBackup w razie błędu bezpiecznie zwraca null bez wywalania aplikacji
    await expect(autoBackup(db, failingFs)).resolves.toBeNull();

    // Domyślne wywołanie bez customFs (zapisuje przez domyślny fs)
    const defaultRes = await autoBackup(db);
    expect(defaultRes).toMatch(/oczko-kopia-/);
  });

  describe('RD-ENG-12: rotateBackups & dwie rozdzielne pule po 10 kopii', () => {
    const {
      rotateBackups,
      AUTO_BACKUP_RE,
      SAFETY_BACKUP_RE,
      getRecovery,
      setRecovery,
      clearRecovery,
      readRecovery,
    } = require('../backup-service');

    it('spełnia wektory testowe z tabeli RD-ENG-12', () => {
      // Wektor: 10 kopii przed-importem + 15 kopii kopia
      const safetyFiles: string[] = [];
      for (let i = 1; i <= 10; i++) {
        const pad = String(i).padStart(2, '0');
        safetyFiles.push(`oczko-przed-importem-2026-10-17-0800${pad}.json`);
      }

      const autoFiles: string[] = [];
      for (let i = 1; i <= 15; i++) {
        const pad = String(i).padStart(2, '0');
        autoFiles.push(`oczko-kopia-2026-10-17-0900${pad}.json`);
      }

      const allFiles = [...safetyFiles, ...autoFiles];

      // Rotacja puli bieżącej (kopia)
      const resAuto = rotateBackups(allFiles, AUTO_BACKUP_RE, 10);
      expect(resAuto.kept).toHaveLength(10);
      expect(resAuto.deleted).toHaveLength(5);
      // Wszystkie usunięte pliki należą do najstarszych z puli auto
      expect(resAuto.deleted).toEqual([
        'oczko-kopia-2026-10-17-090005.json',
        'oczko-kopia-2026-10-17-090004.json',
        'oczko-kopia-2026-10-17-090003.json',
        'oczko-kopia-2026-10-17-090002.json',
        'oczko-kopia-2026-10-17-090001.json',
      ]);

      // Pula bezpieczeństwa (przed-importem) NIE została naruszona
      const resSafety = rotateBackups(allFiles, SAFETY_BACKUP_RE, 10);
      expect(resSafety.kept).toHaveLength(10);
      expect(resSafety.deleted).toHaveLength(0); // wszystkie 10 zostaje!
    });

    it('poprawnie zarządza stanem odzyskiwania awaryjnego (BR-TEST-023)', async () => {
      clearRecovery();
      expect(getRecovery()).toBeNull();

      setRecovery({ key: 'state_corrupt_123', at: 1000, raw: '{"bad": true}' });
      expect(getRecovery()).toEqual({ key: 'state_corrupt_123', at: 1000, raw: '{"bad": true}' });

      const recovered = await readRecovery();
      expect(recovered).toBe('{"bad": true}');

      clearRecovery();
      expect(getRecovery()).toBeNull();
      expect(await readRecovery()).toBeNull();
    });
  });
});


