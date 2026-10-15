import { createInMemoryDatabase } from '../database';
import {
  exportDatabaseBackup,
  exportBackupToJson,
  validateBackupData,
  importDatabaseBackup,
  getDatabaseStats,
  OczkoBackupData,
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

    // 3. Weryfikacja statystyk
    const stats = await getDatabaseStats(db);
    expect(stats).toEqual({
      projects: 1,
      parts: 1,
      counters: 1,
      events: 1,
      yarns: 1,
      tools: 1,
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
        itemCounts: { projects: 0, parts: 0, counters: 0, events: 0, yarns: 0, tools: 0 },
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

    // Weryfikacja stanu targetDb
    const targetStats = await getDatabaseStats(targetDb);
    expect(targetStats.projects).toBe(1);
    expect(targetStats.events).toBe(1);
    expect(targetStats.yarns).toBe(1);

    const restoredProjects = await targetDb.getAllAsync<any>('SELECT * FROM projects');
    expect(restoredProjects[0].name).toBe('Kocyk dziecięcy');
    expect(restoredProjects[0].id).toBe('proj-restore');
  });
});
