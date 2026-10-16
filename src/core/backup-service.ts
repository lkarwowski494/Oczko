/**
 * Oczko Core — Serwis kopii zapasowej i eksportu/importu bazy danych (DEC-10, ZP-06, BR-DANE-002)
 * Zapewnia:
 * 1. Pełny eksport stanu (projekty, części, liczniki, dziennik zdarzeń, magazyn włóczek i narzędzi)
 * 2. Walidację schematu i metadanych kopii (wersja, sygnatura aplikacji, spójność)
 * 3. Transakcyjne przywracanie stanu z kopii bezpieczeństwa (atomic restore)
 * 4. Odczyt statystyk lokalnej bazy danych do widoku ustawień
 */

import { DatabaseClient } from './database';

export interface OczkoBackupMetadata {
  version: 1;
  appName: 'Oczko';
  bundleId: 'com.apps4brew.knitting';
  exportedAt: string;
  itemCounts: {
    projects: number;
    parts: number;
    counters: number;
    events: number;
    yarns: number;
    tools: number;
  };
}

export interface BackupProjectRow {
  id: string;
  name: string;
  craft_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BackupPartRow {
  id: string;
  project_id: string;
  name: string;
  sort_order: number;
  target_rows: number | null;
  created_at: string;
}

export interface BackupCounterRow {
  id: string;
  part_id: string;
  parent_counter_id: string | null;
  name: string;
  counter_type: string;
  initial_value: number;
  step: number;
  modulo_cycle: number | null;
  max_repeats: number | null;
  auto_advance_with_parent: number;
  reminder_rows_json: string | null;
  created_at: string;
}

export interface BackupEventRow {
  id: string;
  counter_id: string;
  event_type: string;
  delta: number;
  target_event_id: string | null;
  source_device: string;
  created_at_ms: number;
}

export interface BackupYarnRow {
  id: string;
  brand: string;
  name: string;
  colorway: string;
  dye_lot: string | null;
  weight_category: string;
  composition: string;
  skeins_total: number;
  skeins_remaining: number;
  weight_grams_per_skein: number | null;
  length_meters_per_skein: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackupToolRow {
  id: string;
  name: string;
  tool_type: string;
  size_mm: number;
  us_size: string | null;
  material: string;
  cable_length_cm: number | null;
  brand: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OczkoBackupData {
  metadata: OczkoBackupMetadata;
  projects: BackupProjectRow[];
  project_parts: BackupPartRow[];
  counters: BackupCounterRow[];
  counter_events: BackupEventRow[];
  stash_yarns: BackupYarnRow[];
  stash_tools: BackupToolRow[];
}

export const BACKUP_SCHEMA_VERSION = 1;
export const AUTO_BACKUP_DIR = 'Backup/';
export const AUTO_BACKUP_KEEP = 10;
export const AUTO_BACKUP_RE = /^oczko-(\d{4}-\d{2}-\d{2}-\d{6})(?:-(\d{1,3}))?\.json$/;
export const SAFETY_BACKUP_RE = /^oczko-przed-(?:importem|czyszczeniem)-(\d{4}-\d{2}-\d{2}-\d{6})(?:-(\d{1,3}))?\.json$/;

export interface OczkoBackupEnvelope {
  format: 'oczko-backup';
  schemaVersion: number;
  exportedAt: string;
  state: OczkoBackupData;
}

export function buildBackupEnvelope(state: OczkoBackupData): OczkoBackupEnvelope {
  return {
    format: 'oczko-backup',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  };
}

export function localISODate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function stampOf(d: Date = new Date()): string {
  const iso = localISODate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${iso}-${hours}${minutes}${seconds}`;
}

const poolKey = (m: RegExpExecArray) => `${m[1]}-${(m[2] ?? '1').padStart(3, '0')}`;

/**
 * Odczytuje statystyki liczby encji w lokalnej bazie SQLite.
 */
export async function getDatabaseStats(db: DatabaseClient): Promise<OczkoBackupMetadata['itemCounts']> {
  const [projects, parts, counters, events, yarns, tools] = await Promise.all([
    db.getAllAsync<any>('SELECT * FROM projects'),
    db.getAllAsync<any>('SELECT * FROM project_parts'),
    db.getAllAsync<any>('SELECT * FROM counters'),
    db.getAllAsync<any>('SELECT * FROM counter_events'),
    db.getAllAsync<any>('SELECT * FROM stash_yarns'),
    db.getAllAsync<any>('SELECT * FROM stash_tools'),
  ]);

  return {
    projects: projects.length,
    parts: parts.length,
    counters: counters.length,
    events: events.length,
    yarns: yarns.length,
    tools: tools.length,
  };
}

/**
 * Generuje pełną strukturę kopii zapasowej ze wszystkich tabel bazy SQLite.
 */
export async function exportDatabaseBackup(db: DatabaseClient): Promise<OczkoBackupData> {
  const [projects, parts, counters, events, yarns, tools] = await Promise.all([
    db.getAllAsync<BackupProjectRow>('SELECT * FROM projects'),
    db.getAllAsync<BackupPartRow>('SELECT * FROM project_parts'),
    db.getAllAsync<BackupCounterRow>('SELECT * FROM counters'),
    db.getAllAsync<BackupEventRow>('SELECT * FROM counter_events'),
    db.getAllAsync<BackupYarnRow>('SELECT * FROM stash_yarns'),
    db.getAllAsync<BackupToolRow>('SELECT * FROM stash_tools'),
  ]);

  const metadata: OczkoBackupMetadata = {
    version: 1,
    appName: 'Oczko',
    bundleId: 'com.apps4brew.knitting',
    exportedAt: new Date().toISOString(),
    itemCounts: {
      projects: projects.length,
      parts: parts.length,
      counters: counters.length,
      events: events.length,
      yarns: yarns.length,
      tools: tools.length,
    },
  };

  return {
    metadata,
    projects,
    project_parts: parts,
    counters,
    counter_events: events,
    stash_yarns: yarns,
    stash_tools: tools,
  };
}

/**
 * Eksportuje bazę danych jako zserializowany ciąg JSON.
 */
export async function exportBackupToJson(db: DatabaseClient, pretty: boolean = true): Promise<string> {
  const backup = await exportDatabaseBackup(db);
  return pretty ? JSON.stringify(backup, null, 2) : JSON.stringify(backup);
}

/**
 * Weryfikuje strukturę i poprawność pliku kopii zapasowej (obsługuje format koperty i format bezpośredni).
 */
export function validateBackupData(
  raw: unknown
): { valid: true; data: OczkoBackupData } | { valid: false; error: string } {
  let parsed: any = raw;

  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { valid: false, error: 'Nieprawidłowy format JSON.' };
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'Kopia zapasowa musi być obiektem JSON.' };
  }

  // Obsługa koperty Apps4Brew Standard ('oczko-backup')
  if (parsed.format === 'oczko-backup') {
    if (typeof parsed.schemaVersion !== 'number' || parsed.schemaVersion <= 0) {
      return { valid: false, error: 'Nieprawidłowa wersja schematu kopii.' };
    }
    if (parsed.schemaVersion > BACKUP_SCHEMA_VERSION) {
      return {
        valid: false,
        error: `Kopia pochodzi z nowszej wersji aplikacji (v${parsed.schemaVersion}). Zaktualizuj aplikację.`,
      };
    }
    if (!parsed.state || typeof parsed.state !== 'object') {
      return { valid: false, error: 'Brak sekcji "state" w pliku kopii zapasowej.' };
    }
    parsed = parsed.state;
  }

  const meta = parsed.metadata;
  if (!meta || meta.appName !== 'Oczko') {
    return { valid: false, error: 'Plik nie jest prawidłową kopią zapasową aplikacji Oczko.' };
  }

  if (meta.version !== 1) {
    return { valid: false, error: `Nieobsługiwana wersja kopii zapasowej: ${meta.version}. Oczekiwano wersji 1.` };
  }

  const tables = ['projects', 'project_parts', 'counters', 'counter_events', 'stash_yarns', 'stash_tools'];
  for (const table of tables) {
    if (!Array.isArray(parsed[table])) {
      return { valid: false, error: `Brakująca lub nieprawidłowa tabela w kopii: ${table}` };
    }
  }

  return { valid: true, data: parsed as OczkoBackupData };
}

/**
 * Zapis kopii zapasowej w katalogu Dokumentów (Backup/...) z rotacją do AUTO_BACKUP_KEEP (10 plików).
 */
export async function writeBackupFile(
  prefix: string,
  re: RegExp,
  state: OczkoBackupData,
  customFs?: any
): Promise<string> {
  const fs = customFs || (() => {
    try {
      return require('expo-file-system/legacy');
    } catch {
      try {
        return require('expo-file-system');
      } catch {
        return null;
      }
    }
  })();

  if (!fs || !fs.documentDirectory) {
    throw new Error('Brak katalogu dokumentów aplikacji');
  }

  const dir = `${fs.documentDirectory}${AUTO_BACKUP_DIR}`;
  const dirInfo = await fs.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await fs.makeDirectoryAsync(dir, { intermediates: true });
  }

  const stamp = stampOf(new Date());
  let name = `${prefix}${stamp}.json`;

  for (let n = 2; n < 1000 && (await fs.getInfoAsync(`${dir}${name}`)).exists; n++) {
    name = `${prefix}${stamp}-${n}.json`;
  }

  const envelope = buildBackupEnvelope(state);
  const targetPath = `${dir}${name}`;

  try {
    await fs.writeAsStringAsync(targetPath, JSON.stringify(envelope, null, 2));
  } catch (e) {
    if (fs.deleteAsync) {
      await fs.deleteAsync(targetPath, { idempotent: true }).catch(() => {});
    }
    throw e;
  }

  // Rotacja puli kopii zapasowych
  try {
    const files = await fs.readDirectoryAsync(dir);
    const pool = files
      .map((f: string) => [f, re.exec(f)] as const)
      .filter((x: any): x is readonly [string, RegExpExecArray] => !!x[1]);

    const oldFiles = pool
      .map(([f, m]: any) => [f, poolKey(m)] as const)
      .sort((a: any, b: any) => (a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0))
      .slice(AUTO_BACKUP_KEEP);

    for (const [f] of oldFiles) {
      await fs.deleteAsync(`${dir}${f}`, { idempotent: true });
    }
  } catch {
    // Nieprzerwana praca przy błędzie sprzątania
  }

  return targetPath;
}

/**
 * Automatyczna rotacyjna kopia zapasowa po zapisaniu postępu projektu (Apps4Brew SEC-09 / T-012).
 */
export async function autoBackup(
  db: DatabaseClient,
  customFs?: any
): Promise<string | null> {
  try {
    const data = await exportDatabaseBackup(db);
    return await writeBackupFile('oczko-', AUTO_BACKUP_RE, data, customFs);
  } catch {
    return null;
  }
}

/**
 * Kopia bezpieczeństwa przed operacjami niszczącymi (import, reset bazy).
 */
export async function safetyBackup(
  kind: 'import' | 'reset',
  db: DatabaseClient,
  customFs?: any
): Promise<string> {
  const prefix = kind === 'import' ? 'oczko-przed-importem-' : 'oczko-przed-czyszczeniem-';
  const data = await exportDatabaseBackup(db);
  return await writeBackupFile(prefix, SAFETY_BACKUP_RE, data, customFs);
}

/**
 * Przywraca stan bazy danych z obiektu kopii zapasowej w pojedynczej transakcji atomowej.
 */
export async function importDatabaseBackup(
  db: DatabaseClient,
  backupInput: OczkoBackupData | string
): Promise<{ success: boolean; importedCounts: OczkoBackupMetadata['itemCounts'] }> {
  const validation = validateBackupData(backupInput);
  if (!validation.valid) {
    throw new Error(`Błąd walidacji kopii zapasowej: ${validation.error}`);
  }

  const backup = validation.data;

  await db.withTransactionAsync(async () => {
    // 1. Czyszczenie tabel w kolejności zależności kluczy obcych
    await db.runAsync('DELETE FROM counter_events');
    await db.runAsync('DELETE FROM counters');
    await db.runAsync('DELETE FROM project_parts');
    await db.runAsync('DELETE FROM projects');
    await db.runAsync('DELETE FROM stash_yarns');
    await db.runAsync('DELETE FROM stash_tools');

    // 2. Odtwarzanie projektów
    for (const p of backup.projects) {
      await db.runAsync(
        'INSERT INTO projects (id, name, craft_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        p.id,
        p.name,
        p.craft_type,
        p.status,
        p.created_at,
        p.updated_at
      );
    }

    // 3. Odtwarzanie części
    for (const part of backup.project_parts) {
      await db.runAsync(
        'INSERT INTO project_parts (id, project_id, name, sort_order, target_rows, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        part.id,
        part.project_id,
        part.name,
        part.sort_order,
        part.target_rows,
        part.created_at
      );
    }

    // 4. Odtwarzanie liczników
    for (const c of backup.counters) {
      await db.runAsync(
        'INSERT INTO counters (id, part_id, parent_counter_id, name, counter_type, initial_value, step, modulo_cycle, max_repeats, auto_advance_with_parent, reminder_rows_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        c.id,
        c.part_id,
        c.parent_counter_id,
        c.name,
        c.counter_type,
        c.initial_value,
        c.step,
        c.modulo_cycle,
        c.max_repeats,
        c.auto_advance_with_parent,
        c.reminder_rows_json,
        c.created_at
      );
    }

    // 5. Odtwarzanie zdarzeń
    for (const ev of backup.counter_events) {
      await db.runAsync(
        'INSERT INTO counter_events (id, counter_id, event_type, delta, target_event_id, source_device, created_at_ms) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ev.id,
        ev.counter_id,
        ev.event_type,
        ev.delta,
        ev.target_event_id,
        ev.source_device,
        ev.created_at_ms
      );
    }

    // 6. Odtwarzanie magazynu włóczek
    for (const y of backup.stash_yarns) {
      await db.runAsync(
        'INSERT INTO stash_yarns (id, brand, name, colorway, dye_lot, weight_category, composition, skeins_total, skeins_remaining, weight_grams_per_skein, length_meters_per_skein, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        y.id,
        y.brand,
        y.name,
        y.colorway,
        y.dye_lot,
        y.weight_category,
        y.composition,
        y.skeins_total,
        y.skeins_remaining,
        y.weight_grams_per_skein,
        y.length_meters_per_skein,
        y.notes,
        y.created_at,
        y.updated_at
      );
    }

    // 7. Odtwarzanie magazynu narzędzi
    for (const t of backup.stash_tools) {
      await db.runAsync(
        'INSERT INTO stash_tools (id, name, tool_type, size_mm, us_size, material, cable_length_cm, brand, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        t.id,
        t.name,
        t.tool_type,
        t.size_mm,
        t.us_size,
        t.material,
        t.cable_length_cm,
        t.brand,
        t.notes,
        t.created_at,
        t.updated_at
      );
    }
  });

  return {
    success: true,
    importedCounts: {
      projects: backup.projects.length,
      parts: backup.project_parts.length,
      counters: backup.counters.length,
      events: backup.counter_events.length,
      yarns: backup.stash_yarns.length,
      tools: backup.stash_tools.length,
    },
  };
}
