/**
 * Schemat bazy danych SQLite / PowerSync dla aplikacji Oczko.
 * Zgodny z podejściem local-first (DEC-05: PowerSync) oraz dziennikiem zdarzeń (BR-LICZ-002).
 */

export const SQLITE_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    craft_type TEXT NOT NULL CHECK (craft_type IN ('knitting', 'crochet')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hibernated', 'finished', 'frogged')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS project_parts (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    target_rows INTEGER,
    created_at TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS counters (
    id TEXT PRIMARY KEY NOT NULL,
    part_id TEXT NOT NULL REFERENCES project_parts(id) ON DELETE CASCADE,
    parent_counter_id TEXT REFERENCES counters(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    counter_type TEXT NOT NULL CHECK (counter_type IN ('global_rows', 'pattern_repeat', 'shaping_interval', 'stitch_in_row')),
    initial_value INTEGER NOT NULL DEFAULT 0,
    step INTEGER NOT NULL DEFAULT 1,
    modulo_cycle INTEGER,
    max_repeats INTEGER,
    auto_advance_with_parent INTEGER NOT NULL DEFAULT 0,
    reminder_rows_json TEXT,
    created_at TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS counter_events (
    id TEXT PRIMARY KEY NOT NULL,
    counter_id TEXT NOT NULL REFERENCES counters(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('INCREMENT', 'DECREMENT', 'SET', 'RESET', 'UNDO')),
    delta INTEGER NOT NULL,
    target_event_id TEXT,
    source_device TEXT NOT NULL CHECK (source_device IN ('iphone', 'apple_watch', 'garmin', 'voice', 'gesture')),
    created_at_ms INTEGER NOT NULL
  );`,

  `CREATE INDEX IF NOT EXISTS idx_counter_events_counter_time
    ON counter_events(counter_id, created_at_ms ASC);`
] as const;
