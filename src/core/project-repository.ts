/**
 * Oczko Core — Repozytorium trwałości projektów, części, liczników i dziennika zdarzeń (SQLite)
 * Gwarantuje zasadę: „dane nigdy nie giną” (ZP-06, BR-LICZ-008, BR-DANE-001).
 */

import { DatabaseClient } from './database';
import { CounterConfig, CounterEvent, DeviceSource } from './counter-engine';
import { ProjectPartDefinition } from './project-structure';
import { ProjectManagerFacade } from './project-facade';
import { ProjectTimeSessionRecord } from './time-tracking-service';

export type CraftType = 'knitting' | 'crochet';
export type ProjectStatus = 'active' | 'hibernated' | 'finished' | 'frogged';

export interface ProjectRecord {
  id: string;
  name: string;
  craftType: CraftType;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export async function insertProject(db: DatabaseClient, project: ProjectRecord): Promise<void> {
  await db.runAsync(
    `INSERT INTO projects (id, name, craft_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    project.id,
    project.name,
    project.craftType,
    project.status,
    project.createdAt,
    project.updatedAt
  );
}

export async function getProject(db: DatabaseClient, projectId: string): Promise<ProjectRecord | null> {
  interface Row {
    id: string;
    name: string;
    craft_type: CraftType;
    status: ProjectStatus;
    created_at: string;
    updated_at: string;
  }
  const row = await db.getFirstAsync<Row>(`SELECT * FROM projects WHERE id = ?`, projectId);
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    craftType: row.craft_type,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function updateProjectStatus(
  db: DatabaseClient,
  projectId: string,
  status: ProjectStatus
): Promise<void> {
  await db.runAsync(
    `UPDATE projects SET status = ?, updated_at = ? WHERE id = ?`,
    status,
    new Date().toISOString(),
    projectId
  );
}

export async function listProjects(db: DatabaseClient): Promise<ProjectRecord[]> {
  interface Row {
    id: string;
    name: string;
    craft_type: CraftType;
    status: ProjectStatus;
    created_at: string;
    updated_at: string;
  }
  const rows = await db.getAllAsync<Row>(`SELECT * FROM projects`);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    craftType: r.craft_type,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function insertProjectPart(db: DatabaseClient, part: ProjectPartDefinition): Promise<void> {
  await db.runAsync(
    `INSERT INTO project_parts (id, project_id, name, sort_order, target_rows, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    part.id,
    part.projectId,
    part.name,
    part.sortOrder,
    part.targetRows ?? null,
    new Date().toISOString()
  );
}

export async function getProjectParts(db: DatabaseClient, projectId: string): Promise<ProjectPartDefinition[]> {
  interface Row {
    id: string;
    project_id: string;
    name: string;
    sort_order: number;
    target_rows: number | null;
  }
  const rows = await db.getAllAsync<Row>(`SELECT * FROM project_parts WHERE project_id = ?`, projectId);
  return rows.map((r) => ({
    id: r.id,
    projectId: r.project_id,
    name: r.name,
    sortOrder: r.sort_order,
    targetRows: r.target_rows ?? undefined,
  }));
}

export async function insertCounter(
  db: DatabaseClient,
  counter: CounterConfig & { counterType?: string }
): Promise<void> {
  await db.runAsync(
    `INSERT INTO counters (
      id, part_id, parent_counter_id, name, counter_type, initial_value, step, modulo_cycle, max_repeats, auto_advance_with_parent, reminder_rows_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    counter.id,
    counter.partId,
    counter.linkedToParentId ?? null,
    counter.name,
    counter.counterType ?? 'global_rows',
    counter.initialValue ?? 0,
    counter.step ?? 1,
    counter.moduloCycle ?? null,
    null,
    counter.linkedToParentId ? 1 : 0,
    counter.reminderRows ? JSON.stringify(counter.reminderRows) : null,
    new Date().toISOString()
  );
}

export async function getCountersByPart(db: DatabaseClient, partId: string): Promise<CounterConfig[]> {
  interface Row {
    id: string;
    part_id: string;
    parent_counter_id: string | null;
    name: string;
    counter_type: string;
    initial_value: number;
    step: number;
    modulo_cycle: number | null;
    reminder_rows_json: string | null;
  }
  const rows = await db.getAllAsync<Row>(`SELECT * FROM counters WHERE part_id = ?`, partId);
  return rows.map((r) => ({
    id: r.id,
    partId: r.part_id,
    name: r.name,
    initialValue: r.initial_value,
    step: r.step,
    moduloCycle: r.modulo_cycle ?? undefined,
    linkedToParentId: r.parent_counter_id ?? undefined,
    reminderRows: r.reminder_rows_json ? JSON.parse(r.reminder_rows_json) : undefined,
  }));
}

export async function appendCounterEvent(db: DatabaseClient, event: CounterEvent): Promise<void> {
  await db.runAsync(
    `INSERT INTO counter_events (id, counter_id, event_type, delta, target_event_id, source_device, created_at_ms) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    event.id,
    event.counterId,
    event.type,
    event.delta,
    event.targetEventId ?? null,
    event.source,
    event.timestampMs
  );
}

export async function getCounterEvents(db: DatabaseClient, counterId: string): Promise<CounterEvent[]> {
  interface Row {
    id: string;
    counter_id: string;
    event_type: 'INCREMENT' | 'DECREMENT' | 'SET' | 'RESET' | 'UNDO';
    delta: number;
    target_event_id: string | null;
    source_device: DeviceSource;
    created_at_ms: number;
  }
  const rows = await db.getAllAsync<Row>(`SELECT * FROM counter_events WHERE counter_id = ?`, counterId);
  return rows.map((r) => ({
    id: r.id,
    counterId: r.counter_id,
    type: r.event_type,
    delta: r.delta,
    targetEventId: r.target_event_id ?? undefined,
    source: r.source_device,
    timestampMs: r.created_at_ms,
  }));
}

/**
 * Ładuje pełny stan projektu z bazy SQLite i rekonstruuje fasadę ProjectManagerFacade z historią zdarzeń.
 */
export async function loadProjectFacade(db: DatabaseClient, projectId: string): Promise<ProjectManagerFacade> {
  const project = await getProject(db, projectId);
  if (!project) throw new Error(`Projekt o ID ${projectId} nie istnieje w bazie SQLite.`);

  const facade = new ProjectManagerFacade(project.id, project.name);
  const parts = await getProjectParts(db, projectId);

  const allEvents: CounterEvent[] = [];

  for (const part of parts) {
    const counters = await getCountersByPart(db, part.id);
    for (const counter of counters) {
      facade.registerCounter(counter);
      const events = await getCounterEvents(db, counter.id);
      allEvents.push(...events);
    }
  }

  // Wczytanie zdarzeń do fasady
  facade.loadExistingEvents(allEvents);
  return facade;
}

/**
 * Trwały zapis kroku licznika: wylicza zdarzenia i zapisuje je w transakcji SQLite.
 */
export async function persistProjectStep(
  db: DatabaseClient,
  facade: ProjectManagerFacade,
  counterId: string,
  direction: 'increment' | 'decrement',
  source: DeviceSource,
  timestampMs: number,
  debounceThresholdMs?: number
): Promise<CounterEvent[]> {
  const events = facade.stepCounter(counterId, direction, source, timestampMs, debounceThresholdMs);
  if (events.length > 0) {
    await db.withTransactionAsync(async () => {
      for (const ev of events) {
        await appendCounterEvent(db, ev);
      }
    });
  }
  return events;
}

/**
 * Trwały zapis operacji UNDO w transakcji SQLite.
 */
export async function persistProjectUndo(
  db: DatabaseClient,
  facade: ProjectManagerFacade,
  counterId: string,
  source: DeviceSource,
  timestampMs: number
): Promise<boolean> {
  const undoEvents = facade.createAndApplyUndoWithLinked(counterId, source, timestampMs);
  if (undoEvents.length > 0) {
    await db.withTransactionAsync(async () => {
      for (const ev of undoEvents) {
        await appendCounterEvent(db, ev);
      }
    });
    return true;
  }
  return false;
}

/**
 * Trwały zapis ukończonej sesji czasu pracy nad projektem (BR-CZAS-001..004).
 */
export async function saveTimeSession(
  db: DatabaseClient,
  session: ProjectTimeSessionRecord
): Promise<void> {
  await db.runAsync(
    `INSERT INTO project_time_sessions (id, project_id, started_at, ended_at, duration_seconds, active_rows_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    session.id,
    session.projectId,
    session.startedAt,
    session.endedAt,
    session.durationSeconds,
    session.activeRowsCount,
    session.createdAt
  );
}

/**
 * Pobiera listę wszystkich sesji czasowych dla danego projektu.
 */
export async function listTimeSessions(
  db: DatabaseClient,
  projectId: string
): Promise<ProjectTimeSessionRecord[]> {
  interface Row {
    id: string;
    project_id: string;
    started_at: string;
    ended_at: string;
    duration_seconds: number;
    active_rows_count: number;
    created_at: string;
  }
  const rows = await db.getAllAsync<Row>(
    `SELECT * FROM project_time_sessions WHERE project_id = ? ORDER BY started_at ASC`,
    projectId
  );
  return rows.map((r) => ({
    id: r.id,
    projectId: r.project_id,
    startedAt: r.started_at,
    endedAt: r.ended_at,
    durationSeconds: r.duration_seconds,
    activeRowsCount: r.active_rows_count,
    createdAt: r.created_at,
  }));
}

/**
 * Zwraca łączny skumulowany czas pracy nad projektem w sekundach.
 */
export async function getTotalProjectDurationSeconds(
  db: DatabaseClient,
  projectId: string
): Promise<number> {
  interface Row {
    total_seconds: number | null;
  }
  const row = await db.getFirstAsync<Row>(
    `SELECT SUM(duration_seconds) as total_seconds FROM project_time_sessions WHERE project_id = ?`,
    projectId
  );
  return row?.total_seconds ?? 0;
}

