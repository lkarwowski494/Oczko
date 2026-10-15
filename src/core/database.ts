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
  const SQLite = require('expo-sqlite');
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
      return (nativeDb as any).getFirstAsync(source, ...(params as any[]));
    },
    async getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]> {
      return (nativeDb as any).getAllAsync(source, ...(params as any[]));
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

      // INSERT INTO stash_yarns
      if (/^INSERT\s+INTO\s+stash_yarns/i.test(clean)) {
        const [id, brand, name, colorway, dye_lot, weight_category, composition, skeins_total, skeins_remaining, weight_grams_per_skein, length_meters_per_skein, notes, created_at, updated_at] = params as any[];
        getTable('stash_yarns').set(id, {
          id, brand, name, colorway, dye_lot, weight_category, composition, skeins_total, skeins_remaining, weight_grams_per_skein, length_meters_per_skein, notes, created_at, updated_at
        });
        return { changes: 1, lastInsertRowId: 1 };
      }

      // INSERT INTO stash_tools
      if (/^INSERT\s+INTO\s+stash_tools/i.test(clean)) {
        const [id, name, tool_type, size_mm, us_size, material, cable_length_cm, brand, notes, created_at, updated_at] = params as any[];
        getTable('stash_tools').set(id, {
          id, name, tool_type, size_mm, us_size, material, cable_length_cm, brand, notes, created_at, updated_at
        });
        return { changes: 1, lastInsertRowId: 1 };
      }

      // INSERT INTO pattern_documents
      if (/^INSERT\s+INTO\s+pattern_documents/i.test(clean)) {
        const [
          id, project_id, file_name, file_uri, file_size, current_page, total_pages,
          ruler_y_percent, ruler_height_percent, auto_step_enabled, notes, created_at, updated_at
        ] = params as any[];
        getTable('pattern_documents').set(id, {
          id, project_id, file_name, file_uri, file_size, current_page, total_pages,
          ruler_y_percent, ruler_height_percent, auto_step_enabled, notes, created_at, updated_at
        });
        return { changes: 1, lastInsertRowId: 1 };
      }

      // UPDATE pattern_documents
      if (/^UPDATE\s+pattern_documents/i.test(clean)) {
        if (/current_page\s*=/i.test(clean)) {
          const [ruler_y_percent, current_page, updated_at, id] = params as any[];
          const existing = getTable('pattern_documents').get(id);
          if (existing) {
            Object.assign(existing, { ruler_y_percent, current_page, updated_at });
            return { changes: 1, lastInsertRowId: 0 };
          }
          return { changes: 0, lastInsertRowId: 0 };
        } else {
          const [ruler_y_percent, updated_at, id] = params as any[];
          const existing = getTable('pattern_documents').get(id);
          if (existing) {
            Object.assign(existing, { ruler_y_percent, updated_at });
            return { changes: 1, lastInsertRowId: 0 };
          }
          return { changes: 0, lastInsertRowId: 0 };
        }
      }

      // UPDATE projects
      if (/^UPDATE\s+projects/i.test(clean)) {
        if (/SET\s+status\s*=\s*\?,\s*updated_at\s*=\s*\?\s+WHERE\s+id\s*=\s*\?/i.test(clean)) {
          const [status, updated_at, id] = params as [string, string, string];
          const existing = getTable('projects').get(id);
          if (existing) {
            Object.assign(existing, { status, updated_at });
            return { changes: 1, lastInsertRowId: 0 };
          }
          return { changes: 0, lastInsertRowId: 0 };
        }
        const [name, status, updated_at, id] = params as [string, string, string, string];
        const existing = getTable('projects').get(id);
        if (existing) {
          Object.assign(existing, { name, status, updated_at });
          return { changes: 1, lastInsertRowId: 0 };
        }
        return { changes: 0, lastInsertRowId: 0 };
      }


      // UPDATE stash_yarns
      if (/^UPDATE\s+stash_yarns/i.test(clean)) {
        if (/skeins_remaining\s*=\s*\?/i.test(clean)) {
          const [skeins_remaining, updated_at, id] = params as any[];
          const existing = getTable('stash_yarns').get(id);
          if (existing) {
            Object.assign(existing, { skeins_remaining, updated_at });
            return { changes: 1, lastInsertRowId: 0 };
          }
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

      if (/^DELETE\s+FROM\s+(\w+)\s*;?$/i.test(clean)) {
        const match = clean.match(/^DELETE\s+FROM\s+(\w+)/i);
        const tbl = match ? match[1] : '';
        const count = getTable(tbl).size;
        getTable(tbl).clear();
        return { changes: count, lastInsertRowId: 0 };
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

      if (/FROM\s+project_parts/i.test(clean)) {
        return Array.from(getTable('project_parts').values()) as unknown as T[];
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

      if (/FROM\s+counters/i.test(clean)) {
        return Array.from(getTable('counters').values()) as unknown as T[];
      }

      if (/FROM\s+counter_events\s+WHERE\s+counter_id\s*=\s*\?/i.test(clean)) {
        const counterId = params[0] as string;
        const rows = Array.from(getTable('counter_events').values())
          .filter((e) => e.counter_id === counterId)
          .sort((a, b) => ((a.created_at_ms as number) - (b.created_at_ms as number)));
        return rows as unknown as T[];
      }

      if (/FROM\s+counter_events/i.test(clean)) {
        return Array.from(getTable('counter_events').values()) as unknown as T[];
      }

      if (/FROM\s+stash_yarns\s+WHERE\s+id\s*=\s*\?/i.test(clean)) {
        const id = params[0] as string;
        const row = getTable('stash_yarns').get(id);
        return row ? [row as unknown as T] : [];
      }

      if (/FROM\s+stash_yarns/i.test(clean)) {
        return Array.from(getTable('stash_yarns').values()) as unknown as T[];
      }

      if (/FROM\s+stash_tools\s+WHERE\s+id\s*=\s*\?/i.test(clean)) {
        const id = params[0] as string;
        const row = getTable('stash_tools').get(id);
        return row ? [row as unknown as T] : [];
      }

      if (/FROM\s+stash_tools/i.test(clean)) {
        return Array.from(getTable('stash_tools').values()) as unknown as T[];
      }

      if (/FROM\s+pattern_documents\s+WHERE\s+id\s*=\s*\?/i.test(clean)) {
        const id = params[0] as string;
        const row = getTable('pattern_documents').get(id);
        return row ? [row as unknown as T] : [];
      }

      if (/FROM\s+pattern_documents\s+WHERE\s+project_id\s*=\s*\?/i.test(clean)) {
        const projectId = params[0] as string;
        const rows = Array.from(getTable('pattern_documents').values())
          .filter((p) => p.project_id === projectId);
        return rows as unknown as T[];
      }

      if (/FROM\s+pattern_documents/i.test(clean)) {
        return Array.from(getTable('pattern_documents').values()) as unknown as T[];
      }

      return [];
    },

    async withTransactionAsync<T>(action: () => Promise<T>): Promise<T> {
      const snapshot = new Map<string, Map<string, Record<string, unknown>>>();
      for (const [tbl, data] of tables.entries()) {
        const copy = new Map<string, Record<string, unknown>>();
        for (const [k, v] of data.entries()) {
          copy.set(k, { ...v });
        }
        snapshot.set(tbl, copy);
      }
      try {
        return await action();
      } catch (err) {
        tables.clear();
        for (const [tbl, data] of snapshot.entries()) {
          tables.set(tbl, data);
        }
        throw err;
      }
    },
  };

  return client;
}
