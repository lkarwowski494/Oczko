import {
  openOczkoDatabase,
  initializeDatabase,
  createInMemoryDatabase,
  DatabaseClient,
} from '../database';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockImplementation(async () => {
    return {
      execAsync: jest.fn().mockResolvedValue(undefined),
      runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 1 }),
      getFirstAsync: jest.fn().mockResolvedValue({ id: '1' }),
      getAllAsync: jest.fn().mockResolvedValue([{ id: '1' }]),
      withTransactionAsync: jest.fn().mockImplementation(async (cb: () => Promise<any>) => cb()),
      closeAsync: jest.fn().mockResolvedValue(undefined),
    };
  }),
}));

describe('Oczko Core — database.ts client and in-memory mock branches', () => {
  test('openOczkoDatabase i natywne metody klienta expo-sqlite', async () => {
    const client = await openOczkoDatabase('my_oczko.db');
    expect(client).toBeDefined();

    await client.execAsync('CREATE TABLE test (id TEXT)');
    const runRes = await client.runAsync('INSERT INTO test VALUES (?)', '1');
    expect(runRes.changes).toBe(1);

    const first = await client.getFirstAsync('SELECT * FROM test');
    expect(first).toEqual({ id: '1' });

    const all = await client.getAllAsync('SELECT * FROM test');
    expect(all).toEqual([{ id: '1' }]);

    const txRes = await client.withTransactionAsync(async () => 'transaction_done');
    expect(txRes).toBe('transaction_done');

    if (client.closeAsync) {
      await client.closeAsync();
    }
  });

  test('initializeDatabase wywołuje wszystkie instrukcje schematu w transakcji', async () => {
    const executed: string[] = [];
    const mockClient: DatabaseClient = {
      async execAsync(source: string) {
        executed.push(source);
      },
      async runAsync() {
        return { changes: 1, lastInsertRowId: 1 };
      },
      async getFirstAsync() {
        return null;
      },
      async getAllAsync() {
        return [];
      },
      async withTransactionAsync<T>(action: () => Promise<T>): Promise<T> {
        return action();
      },
    };

    await initializeDatabase(mockClient);
    expect(executed.length).toBeGreaterThan(0);
  });

  test('createInMemoryDatabase — pokrycie wszystkich gałęzi UPDATE, DELETE i SELECT', async () => {
    const db = createInMemoryDatabase();

    // 1. UPDATE pattern_documents gdy rekord nie istnieje
    const resPatDocNotFound = await db.runAsync(
      'UPDATE pattern_documents SET ruler_y_percent = ?, current_page = ?, updated_at = ? WHERE id = ?',
      50, 2, '2026-10-15', 'nonexistent_doc'
    );
    expect(resPatDocNotFound.changes).toBe(0);

    // 2. UPDATE projects status gdy nie istnieje
    const resProjStatusNotFound = await db.runAsync(
      'UPDATE projects SET status = ?, updated_at = ? WHERE id = ?',
      'finished', '2026-10-15', 'nonexistent_proj'
    );
    expect(resProjStatusNotFound.changes).toBe(0);

    // 3. UPDATE projects name, status gdy nie istnieje i gdy istnieje
    const resProjNotFound = await db.runAsync(
      'UPDATE projects SET name = ?, status = ?, updated_at = ? WHERE id = ?',
      'Nowa nazwa', 'finished', '2026-10-15', 'nonexistent_proj'
    );
    expect(resProjNotFound.changes).toBe(0);

    await db.runAsync(
      'INSERT INTO projects (id, name, craft_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      'p_upd', 'Stary Sweter', 'knitting', 'active', '2026-10-15', '2026-10-15'
    );
    const resProjFound = await db.runAsync(
      'UPDATE projects SET name = ?, status = ?, updated_at = ? WHERE id = ?',
      'Nowy Sweter', 'finished', '2026-10-15', 'p_upd'
    );
    expect(resProjFound.changes).toBe(1);

    // 4. UPDATE stash_yarns gdy nie istnieje
    const resYarnNotFound = await db.runAsync(
      'UPDATE stash_yarns SET skeins_remaining = ?, updated_at = ? WHERE id = ?',
      2, '2026-10-15', 'nonexistent_yarn'
    );
    expect(resYarnNotFound.changes).toBe(0);

    // 5. Nieobsługiwany runAsync SQL zwraca 0
    const resUnknown = await db.runAsync('DROP TABLE imaginary_table');
    expect(resUnknown.changes).toBe(0);

    // 6. counters WHERE id = ?
    await db.runAsync(
      'INSERT INTO counters (id, part_id, parent_counter_id, name, counter_type, initial_value, step, modulo_cycle, max_repeats, auto_advance_with_parent, reminder_rows_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      'c1', 'p1', null, 'Licznik 1', 'row', 0, 1, null, null, 1, '[]', '2026-10-15'
    );
    const counterFound = await db.getAllAsync('SELECT * FROM counters WHERE id = ?', 'c1');
    expect(counterFound).toHaveLength(1);
    const counterNotFound = await db.getAllAsync('SELECT * FROM counters WHERE id = ?', 'c999');
    expect(counterNotFound).toHaveLength(0);

    // 7. stash_yarns WHERE id = ?
    await db.runAsync(
      'INSERT INTO stash_yarns (id, brand, name, colorway, dye_lot, weight_category, composition, skeins_total, skeins_remaining, weight_grams_per_skein, length_meters_per_skein, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      'y1', 'Drops', 'Air', '01', '123', 'Aran', 'Alpaka', 4, 4, 50, 150, '', '2026-10-15', '2026-10-15'
    );
    const yarnFound = await db.getAllAsync('SELECT * FROM stash_yarns WHERE id = ?', 'y1');
    expect(yarnFound).toHaveLength(1);
    const yarnNotFound = await db.getAllAsync('SELECT * FROM stash_yarns WHERE id = ?', 'y999');
    expect(yarnNotFound).toHaveLength(0);

    // 8. stash_tools WHERE id = ?
    await db.runAsync(
      'INSERT INTO stash_tools (id, name, tool_type, size_mm, us_size, material, cable_length_cm, brand, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      't1', 'Druty 4mm', 'circular', 4.0, '6', 'metal', 80, 'KnitPro', '', '2026-10-15', '2026-10-15'
    );
    const toolFound = await db.getAllAsync('SELECT * FROM stash_tools WHERE id = ?', 't1');
    expect(toolFound).toHaveLength(1);
    const toolNotFound = await db.getAllAsync('SELECT * FROM stash_tools WHERE id = ?', 't999');
    expect(toolNotFound).toHaveLength(0);

    // 9. pattern_documents (wszystkie) i WHERE id = ?
    await db.runAsync(
      'INSERT INTO pattern_documents (id, project_id, file_name, file_uri, file_size, current_page, total_pages, ruler_y_percent, ruler_height_percent, auto_step_enabled, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      'doc1', 'p1', 'wzor.pdf', 'file://doc.pdf', 100, 1, 3, 20, 5, 1, '', '2026-10-15', '2026-10-15'
    );
    const allDocs = await db.getAllAsync('SELECT * FROM pattern_documents');
    expect(allDocs).toHaveLength(1);
    const docFound = await db.getAllAsync('SELECT * FROM pattern_documents WHERE id = ?', 'doc1');
    expect(docFound).toHaveLength(1);

    // 10. Nieznane SELECT zwraca pustą tablicę []
    const unknownSelect = await db.getAllAsync('SELECT * FROM unknown_random_entity');
    expect(unknownSelect).toEqual([]);
  });
});
