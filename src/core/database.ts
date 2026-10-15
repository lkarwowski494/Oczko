/**
 * Oczko Core — Interfejs klienta bazy danych i adaptery SQLite (expo-sqlite oraz in-memory)
 * Zgodny z zasadami: offline-first, lokalna baza, bezpieczeństwo danych (BR-LICZ-008, DEC-10).
 */

import { SQLITE_SCHEMA_STATEMENTS } from './database-schema';

export interface DatabaseClient {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, ...params: unknown[]): Promise<{ changes: number; lastInsertRowId: number }>;
  getFirstAsync<T>(source: string, ...params: unknown[]): Promise<T | null>;
  getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]>;
  withTransactionAsync<T>(action: () => Promise<T>): Promise<T>;
  closeAsync?(): Promise<void>;
}

/**
 * Inicjalizuje tabele i indeksy w bazie danych wg zdefiniowanego schematu.
 */
export async function initializeDatabase(db: DatabaseClient): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const statement of SQLITE_SCHEMA_STATEMENTS) {
      await db.execAsync(statement);
    }
  });
}

/**
 * Otwiera bazę danych SQLite w środowisku produkcyjnym (Expo / iOS / Android).
 */
export async function openOczkoDatabase(dbName: string = 'oczko.db'): Promise<DatabaseClient> {
  const SQLite = await import('expo-sqlite');
  const nativeDb = await SQLite.openDatabaseAsync(dbName);
  
  const client: DatabaseClient = {
    async execAsync(source: string): Promise<void> {
      await nativeDb.execAsync(source);
    },
    async runAsync(source: string, ...params: unknown[]): Promise<{ changes: number; lastInsertRowId: number }> {
      const res = await nativeDb.runAsync(source, ...(params as any[]));
      return { changes: res.changes, lastInsertRowId: res.lastInsertRowId };
    },
    async getFirstAsync<T>(source: string, ...params: unknown[]): Promise<T | null> {
      return nativeDb.getFirstAsync<T>(source, ...(params as any[]));
    },
    async getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]> {
      return nativeDb.getAllAsync<T>(source, ...(params as any[]));
    },
    async withTransactionAsync<T>(action: () => Promise<T>): Promise<T> {
      let result: T;
      await nativeDb.withTransactionAsync(async () => {
        result = await action();
      });
      return result!;
    },
    async closeAsync(): Promise<void> {
      await nativeDb.closeAsync();
    },
  };

  await initializeDatabase(client);
  return client;
}

/**
 * Tworzy w pamięci klienta bazy danych symulującego operacje SQL (do testów jednostkowych i headless).
 */
export function createInMemoryDatabase(): DatabaseClient {
  const tables = new Map<string, Map<string, Record<string, unknown>>>();

  const getTable = (tableName: string) => {
    if (!tables.has(tableName)) {
      tables.set(tableName, new Map());
    }
    return tables.get(tableName)!;
  };

  const client: DatabaseClient = {
    async execAsync(_source: string): Promise<void> {
      // W środowisku in-memory schema jest emulowana mapami
    },

    async runAsync(source: string, ...params: unknown[]): Promise<{ changes: number; lastInsertRowId: number }> {
      const clean = source.trim();
      
      // INSERT INTO projects
      if (/^INSERT\s+INTO\s+projects/i.test(clean)) {
        const [id, name, craft_type, status, created_at, updated_at] = params as [string, string, string, string, string, string];
        getTable('projects').set(id, { id, name, craft_type, status, created_at, updated_at });
        return { changes: 1, lastInsertRowId: 1 };
      }

      // INSERT INTO project_parts
      if (/^INSERT\s+INTO\s+project_parts/i.test(clean)) {
        const [id, project_id, name, sort_order, target_rows, created_at] = params as [string, string, string, number, number | null, string];
        getTable('project_parts').set(id, { id, project_id, name, sort_order, target_rows, created_at });
        return { changes: 1, lastInsertRowId: 1 };
      }

      // INSERT INTO counters
      if (/^INSERT\s+INTO\s+counters/i.test(clean)) {
        const [id, part_id, parent_counter_id, name, counter_type, initial_value, step, modulo_cycle, max_repeats, auto_advance_with_parent, reminder_rows_json, created_at] = params as any[];
        getTable('counters').set(id, {
          id, part_id, parent_counter_id, name, counter_type, initial_value, step, modulo_cycle, max_repeats, auto_advance_with_parent, reminder_rows_json, created_at
        });
        return { changes: 1, lastInsertRowId: 1 };
      }

      // INSERT INTO counter_events
      if (/^INSERT\s+INTO\s+counter_events/i.test(clean)) {
        const [id, counter_id, event_type, delta, target_event_id, source_device, created_at_ms] = params as any[];
        getTable('counter_events').set(id, {
          id, counter_id, event_type, delta, target_event_id, source_device, created_at_ms
        });
        return { changes: 1, lastInsertRowId: 1 };
      }

      // UPDATE projects
      if (/^UPDATE\s+projects/i.test(clean)) {
        const [name, status, updated_at, id] = params as [string, string, string, string];
        const existing = getTable('projects').get(id);
        if (existing) {
          Object.assign(existing, { name, status, updated_at });
          return { changes: 1, lastInsertRowId: 0 };
        }
        return { changes: 0, lastInsertRowId: 0 };
      }

      // DELETE
      if (/^DELETE\s+FROM\s+(\w+)\s+WHERE\s+id\s*=\s*\?/i.test(clean)) {
        const match = clean.match(/^DELETE\s+FROM\s+(\w+)/i);
        const tbl = match ? match[1] : '';
        const id = params[0] as string;
        const deleted = getTable(tbl).delete(id);
        return { changes: deleted ? 1 : 0, lastInsertRowId: 0 };
      }

      return { changes: 0, lastInsertRowId: 0 };
    },

    async getFirstAsync<T>(source: string, ...params: unknown[]): Promise<T | null> {
      const all = await this.getAllAsync<T>(source, ...params);
      return all.length > 0 ? all[0] : null;
    },

    async getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]> {
      const clean = source.trim();

      if (/FROM\s+projects\s+WHERE\s+id\s*=\s*\?/i.test(clean)) {
        const id = params[0] as string;
        const row = getTable('projects').get(id);
        return row ? [row as unknown as T] : [];
      }

      if (/FROM\s+projects/i.test(clean)) {
        return Array.from(getTable('projects').values()) as unknown as T[];
      }

      if (/FROM\s+project_parts\s+WHERE\s+project_id\s*=\s*\?/i.test(clean)) {
        const projectId = params[0] as string;
        const rows = Array.from(getTable('project_parts').values())
          .filter((p) => p.project_id === projectId)
          .sort((a, b) => ((a.sort_order as number) - (b.sort_order as number)));
        return rows as unknown as T[];
      }

      if (/FROM\s+counters\s+WHERE\s+id\s*=\s*\?/i.test(clean)) {
        const id = params[0] as string;
        const row = getTable('counters').get(id);
        return row ? [row as unknown as T] : [];
      }

      if (/FROM\s+counters\s+WHERE\s+part_id\s*=\s*\?/i.test(clean)) {
        const partId = params[0] as string;
        const rows = Array.from(getTable('counters').values()).filter((c) => c.part_id === partId);
        return rows as unknown as T[];
      }

      if (/FROM\s+counter_events\s+WHERE\s+counter_id\s*=\s*\?/i.test(clean)) {
        const counterId = params[0] as string;
        const rows = Array.from(getTable('counter_events').values())
          .filter((e) => e.counter_id === counterId)
          .sort((a, b) => ((a.created_at_ms as number) - (b.created_at_ms as number)));
        return rows as unknown as T[];
      }

      return [];
    },

    async withTransactionAsync<T>(action: () => Promise<T>): Promise<T> {
      return action();
    },
  };

  return client;
}
