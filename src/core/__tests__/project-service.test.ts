import { createInMemoryDatabase } from '../database';
import {
  createFullProject,
  loadAllProjectsWithProgress,
  seedDefaultProjectIfEmpty,
  EnrichedProject,
} from '../project-service';

describe('Oczko Core — Serwis projektów i zarządzanie stanem (BR-PROJ-001 - 005)', () => {
  let db: ReturnType<typeof createInMemoryDatabase>;

  beforeEach(() => {
    db = createInMemoryDatabase();
  });

  test('seedDefaultProjectIfEmpty tworzy projekt startowy gdy baza jest pusta', async () => {
    const seeded = await seedDefaultProjectIfEmpty(db);
    expect(seeded).not.toBeNull();
    expect(seeded?.project.name).toContain('Sweter');
    expect(seeded?.parts.length).toBeGreaterThanOrEqual(1);
    expect(seeded?.activeCounterId).toBeDefined();

    // Ponowne wywołanie nie dubluje projektu
    const secondCall = await seedDefaultProjectIfEmpty(db);
    expect(secondCall?.project.id).toBe(seeded?.project.id);
  });

  test('createFullProject poprawnie tworzy projekt z częściami i domyślnymi licznikami', async () => {
    const result = await createFullProject(db, {
      name: 'Czapka Zimowa',
      craftType: 'knitting',
      parts: [
        { name: 'Ściągacz', targetRows: 25 },
        { name: 'Główka czapki', targetRows: 45 },
      ],
    });

    expect(result.project.id).toBeDefined();
    expect(result.project.name).toBe('Czapka Zimowa');
    expect(result.parts.length).toBe(2);
    expect(result.counters.length).toBe(2);
    expect(result.counters[0].name).toBe('Rzędy');
  });

  test('loadAllProjectsWithProgress wylicza aktualne postępy dla wszystkich projektów', async () => {
    const created = await createFullProject(db, {
      name: 'Szalik Ażurowy',
      craftType: 'knitting',
      parts: [{ name: 'Całość', targetRows: 200 }],
    });

    const projects = await loadAllProjectsWithProgress(db);
    expect(projects.length).toBe(1);
    const p = projects[0];
    expect(p.name).toBe('Szalik Ażurowy');
    expect(p.parts.length).toBe(1);
    expect(p.parts[0].counters.length).toBe(1);
    expect(p.parts[0].counters[0].currentValue).toBe(0);
  });
});
