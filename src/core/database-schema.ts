/**
 * Schemat bazy danych SQLite dla aplikacji Oczko.
 * Zgodny z podejściem local-first (DEC-10) oraz zasadą trwałego zapisu stanu (BR-LICZ-008, BR-MAG-001...005).
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
    ON counter_events(counter_id, created_at_ms ASC);`,

  `CREATE TABLE IF NOT EXISTS stash_yarns (
    id TEXT PRIMARY KEY NOT NULL,
    brand TEXT NOT NULL,
    name TEXT NOT NULL,
    colorway TEXT NOT NULL,
    dye_lot TEXT,
    weight_category TEXT NOT NULL CHECK (weight_category IN ('Lace', 'Fingering', 'Sport', 'DK', 'Worsted', 'Aran', 'Bulky', 'Super Bulky')),
    composition TEXT NOT NULL,
    skeins_total REAL NOT NULL DEFAULT 1,
    skeins_remaining REAL NOT NULL DEFAULT 1,
    weight_grams_per_skein REAL,
    length_meters_per_skein REAL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,

  `CREATE INDEX IF NOT EXISTS idx_stash_yarns_brand_name
    ON stash_yarns(brand, name);`,

  `CREATE TABLE IF NOT EXISTS stash_tools (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    tool_type TEXT NOT NULL CHECK (tool_type IN ('circular', 'straight', 'dpn', 'crochet_hook', 'interchangeable_cable', 'interchangeable_tip')),
    size_mm REAL NOT NULL,
    us_size TEXT,
    material TEXT NOT NULL CHECK (material IN ('bamboo', 'wood', 'metal', 'plastic', 'carbon')),
    cable_length_cm INTEGER,
    brand TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,

  `CREATE INDEX IF NOT EXISTS idx_stash_tools_type_size
    ON stash_tools(tool_type, size_mm);`,

  `CREATE TABLE IF NOT EXISTS pattern_documents (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_uri TEXT NOT NULL,
    file_size INTEGER,
    current_page INTEGER NOT NULL DEFAULT 1,
    total_pages INTEGER NOT NULL DEFAULT 1,
    ruler_y_percent REAL NOT NULL DEFAULT 20.0,
    ruler_height_percent REAL NOT NULL DEFAULT 6.0,
    auto_step_enabled INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,

  `CREATE INDEX IF NOT EXISTS idx_pattern_documents_project
    ON pattern_documents(project_id);`,

  `CREATE TABLE IF NOT EXISTS project_time_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    started_at TEXT NOT NULL,
    ended_at TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    active_rows_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );`,

  `CREATE INDEX IF NOT EXISTS idx_project_time_sessions_project
    ON project_time_sessions(project_id);`,

  `CREATE TABLE IF NOT EXISTS app_entitlements (
    id TEXT PRIMARY KEY NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('trial', 'monthly', 'annual', 'lifetime')),
    status TEXT NOT NULL CHECK (status IN ('active', 'expired')),
    trial_started_at TEXT NOT NULL,
    purchased_at TEXT,
    expires_at TEXT,
    updated_at TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`
] as const;
