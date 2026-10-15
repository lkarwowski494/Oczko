/**
 * Oczko Core — Testy repozytorium magazynu włóczek i narzędzi w SQLite (BR-MAG-001...005)
 */

import { createInMemoryDatabase } from '../database';
import {
  insertStashYarn,
  listStashYarns,
  updateStashYarnRemaining,
  deleteStashYarn,
  insertStashTool,
  listStashTools,
  deleteStashTool,
  seedDefaultStashIfEmpty,
  StashYarnRecord,
  StashToolRecord,
} from '../stash-repository';

describe('Oczko Core — Repozytorium magazynu włóczek i narzędzi (BR-MAG-001...005)', () => {
  let db: ReturnType<typeof createInMemoryDatabase>;

  beforeEach(() => {
    db = createInMemoryDatabase();
  });

  test('seedDefaultStashIfEmpty tworzy pozycje początkowe gdy magazyn jest pusty', async () => {
    await seedDefaultStashIfEmpty(db);

    const yarns = await listStashYarns(db);
    const tools = await listStashTools(db);

    expect(yarns.length).toBeGreaterThanOrEqual(1);
    expect(tools.length).toBeGreaterThanOrEqual(1);

    // Ponowne wywołanie nie dubluje danych
    await seedDefaultStashIfEmpty(db);
    const yarns2 = await listStashYarns(db);
    expect(yarns2.length).toBe(yarns.length);
  });

  test('insertStashYarn oraz listStashYarns poprawnie zapisują i odczytują włóczkę', async () => {
    const yarn: StashYarnRecord = {
      id: 'yarn_drops_air',
      brand: 'Drops',
      name: 'Air',
      colorway: '01 Biały',
      dyeLot: '4512',
      weightCategory: 'Worsted',
      composition: '65% Alpaka, 28% Poliamid, 7% Wełna',
      skeinsTotal: 5,
      skeinsRemaining: 5,
      weightGramsPerSkein: 50,
      lengthMetersPerSkein: 150,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await insertStashYarn(db, yarn);
    const list = await listStashYarns(db);
    expect(list.some((y) => y.id === 'yarn_drops_air')).toBe(true);
    const saved = list.find((y) => y.id === 'yarn_drops_air')!;
    expect(saved.brand).toBe('Drops');
    expect(saved.name).toBe('Air');
    expect(saved.skeinsRemaining).toBe(5);
  });

  test('updateStashYarnRemaining aktualizuje stan pozostałych motków', async () => {
    const yarn: StashYarnRecord = {
      id: 'yarn_sandnes',
      brand: 'Sandnes Garn',
      name: 'Peer Gynt',
      colorway: '1021',
      weightCategory: 'DK',
      composition: '100% Wełna Norweska',
      skeinsTotal: 6,
      skeinsRemaining: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await insertStashYarn(db, yarn);
    await updateStashYarnRemaining(db, 'yarn_sandnes', 4.5);

    const list = await listStashYarns(db);
    const saved = list.find((y) => y.id === 'yarn_sandnes')!;
    expect(saved.skeinsRemaining).toBe(4.5);
  });

  test('deleteStashYarn usuwa włóczkę z magazynu', async () => {
    const yarn: StashYarnRecord = {
      id: 'yarn_temp',
      brand: 'Test',
      name: 'Temp',
      colorway: 'Red',
      weightCategory: 'Sport',
      composition: '100% Bawełna',
      skeinsTotal: 1,
      skeinsRemaining: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await insertStashYarn(db, yarn);
    let list = await listStashYarns(db);
    expect(list.length).toBe(1);

    await deleteStashYarn(db, 'yarn_temp');
    list = await listStashYarns(db);
    expect(list.length).toBe(0);
  });

  test('insertStashTool oraz listStashTools poprawnie ewidencjonują druty i szydełka', async () => {
    const tool: StashToolRecord = {
      id: 'tool_chiaogoo_4mm',
      name: 'ChiaoGoo Red Lace 4.0mm',
      toolType: 'circular',
      sizeMm: 4.0,
      material: 'metal',
      cableLengthCm: 80,
      brand: 'ChiaoGoo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await insertStashTool(db, tool);
    const list = await listStashTools(db);
    expect(list.some((t) => t.id === 'tool_chiaogoo_4mm')).toBe(true);

    await deleteStashTool(db, 'tool_chiaogoo_4mm');
    const afterDelete = await listStashTools(db);
    expect(afterDelete.length).toBe(0);
  });
});
