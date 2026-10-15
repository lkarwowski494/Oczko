/**
 * Oczko Core — Serwis zarządzania cyklem życia projektów, części i liczników (BR-PROJ-001 - 005)
 */

import { DatabaseClient } from './database';
import {
  ProjectRecord,
  CraftType,
  insertProject,
  listProjects,
  insertProjectPart,
  getProjectParts,
  insertCounter,
  getCountersByPart,
  getCounterEvents,
} from './project-repository';
import { ProjectPartDefinition } from './project-structure';
import { CounterConfig, computeCounterState } from './counter-engine';

export interface CreateProjectPartInput {
  name: string;
  targetRows?: number;
}

export interface CreateProjectInput {
  name: string;
  craftType: CraftType;
  parts: CreateProjectPartInput[];
}

export interface EnrichedCounter extends CounterConfig {
  currentValue: number;
}

export interface EnrichedPart extends ProjectPartDefinition {
  counters: EnrichedCounter[];
}

export interface EnrichedProject extends ProjectRecord {
  parts: EnrichedPart[];
  primaryCounter?: EnrichedCounter;
}

export interface CreateProjectResult {
  project: ProjectRecord;
  parts: ProjectPartDefinition[];
  counters: CounterConfig[];
  activeCounterId: string;
}

/**
 * Tworzy projekt wraz z częściami i automatycznie generowanymi licznikami głównymi.
 */
export async function createFullProject(
  db: DatabaseClient,
  input: CreateProjectInput
): Promise<CreateProjectResult> {
  const timestamp = new Date().toISOString();
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const project: ProjectRecord = {
    id: projectId,
    name: input.name.trim(),
    craftType: input.craftType,
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await insertProject(db, project);

  const parts: ProjectPartDefinition[] = [];
  const counters: CounterConfig[] = [];

  const partsInput = input.parts && input.parts.length > 0
    ? input.parts
    : [{ name: 'Główna', targetRows: undefined }];

  for (let idx = 0; idx < partsInput.length; idx++) {
    const pInput = partsInput[idx];
    const partId = `part_${projectId}_${idx + 1}`;
    const part: ProjectPartDefinition = {
      id: partId,
      projectId,
      name: pInput.name.trim(),
      sortOrder: idx + 1,
      targetRows: pInput.targetRows,
    };
    await insertProjectPart(db, part);
    parts.push(part);

    const counterId = `cnt_${partId}_main`;
    const counter: CounterConfig = {
      id: counterId,
      partId,
      name: 'Rzędy',
      initialValue: 0,
      step: 1,
    };
    await insertCounter(db, counter);
    counters.push(counter);
  }

  return {
    project,
    parts,
    counters,
    activeCounterId: counters[0]?.id ?? '',
  };
}

/**
 * Ładuje listę wszystkich projektów wraz ze zrekonstruowanym bieżącym postępem liczników.
 */
export async function loadAllProjectsWithProgress(db: DatabaseClient): Promise<EnrichedProject[]> {
  const projectRecords = await listProjects(db);
  const result: EnrichedProject[] = [];

  for (const record of projectRecords) {
    const parts = await getProjectParts(db, record.id);
    const enrichedParts: EnrichedPart[] = [];

    for (const part of parts) {
      const counters = await getCountersByPart(db, part.id);
      const enrichedCounters: EnrichedCounter[] = [];

      for (const counter of counters) {
        const events = await getCounterEvents(db, counter.id);
        const state = computeCounterState(counter, events);
        enrichedCounters.push({
          ...counter,
          currentValue: state.rawValue,
        });
      }

      enrichedParts.push({
        ...part,
        counters: enrichedCounters,
      });
    }

    const firstCounter = enrichedParts[0]?.counters[0];

    result.push({
      ...record,
      parts: enrichedParts,
      primaryCounter: firstCounter,
    });
  }

  return result;
}

/**
 * Jeśli baza danych nie zawiera żadnych projektów, tworzy domyślny projekt startowy.
 */
export async function seedDefaultProjectIfEmpty(
  db: DatabaseClient
): Promise<CreateProjectResult | null> {
  const existing = await listProjects(db);
  if (existing.length > 0) {
    const firstProject = existing[0];
    const parts = await getProjectParts(db, firstProject.id);
    const counters = parts.length > 0 ? await getCountersByPart(db, parts[0].id) : [];
    return {
      project: firstProject,
      parts,
      counters,
      activeCounterId: counters[0]?.id ?? '',
    };
  }

  return createFullProject(db, {
    name: 'Mój Sweter Raglanowy',
    craftType: 'knitting',
    parts: [
      { name: 'Korpus', targetRows: 120 },
      { name: 'Rękaw lewy', targetRows: 80 },
      { name: 'Rękaw prawy', targetRows: 80 },
    ],
  });
}
