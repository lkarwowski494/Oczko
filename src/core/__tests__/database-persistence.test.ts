import { createInMemoryDatabase } from '../database';
import {
  insertProject,
  getProject,
  listProjects,
  updateProjectStatus,
  insertProjectPart,
  getProjectParts,
  insertCounter,
  getCountersByPart,
  loadProjectFacade,
  persistProjectStep,
  persistProjectUndo,
} from '../project-repository';

describe('Oczko Core — Trwałość danych SQLite i Dziennik Zdarzeń (BR-LICZ-008, ZP-06)', () => {
  test('Zapis i odczyt projektu, części oraz konfiguracji liczników', async () => {
    const db = createInMemoryDatabase();

    await insertProject(db, {
      id: 'proj_sweter',
      name: 'Mój Ciepły Sweter',
      craftType: 'knitting',
      status: 'active',
      createdAt: '2026-10-15T10:00:00Z',
      updatedAt: '2026-10-15T10:00:00Z',
    });

    const project = await getProject(db, 'proj_sweter');
    expect(project).not.toBeNull();
    expect(project?.name).toBe('Mój Ciepły Sweter');
    expect(project?.craftType).toBe('knitting');

    await updateProjectStatus(db, 'proj_sweter', 'finished');
    const updatedProject = await getProject(db, 'proj_sweter');
    expect(updatedProject?.status).toBe('finished');

    const allProjects = await listProjects(db);
    expect(allProjects).toHaveLength(1);

    await insertProjectPart(db, {
      id: 'part_body',
      projectId: 'proj_sweter',
      name: 'Korpus',
      sortOrder: 1,
      targetRows: 120,
    });

    const parts = await getProjectParts(db, 'proj_sweter');
    expect(parts).toHaveLength(1);
    expect(parts[0].name).toBe('Korpus');

    await insertCounter(db, {
      id: 'cnt_body_main',
      partId: 'part_body',
      name: 'Główny korpusu',
      initialValue: 0,
      step: 1,
      targetValue: 120,
      reminderRows: [20, 40, 60],
    });

    await insertCounter(db, {
      id: 'cnt_pattern_repeat',
      partId: 'part_body',
      name: 'Ścieg warkocz (8 rzędów)',
      initialValue: 0,
      step: 1,
      moduloCycle: 8,
      linkedToParentId: 'cnt_body_main',
    });

    const counters = await getCountersByPart(db, 'part_body');
    expect(counters).toHaveLength(2);
  });

  test('Dziennik zdarzeń w SQLite i bezpieczne odtworzenie po awarii / restarcie (BR-LICZ-008)', async () => {
    const db = createInMemoryDatabase();

    await insertProject(db, {
      id: 'proj_czapka',
      name: 'Czapka Wełniana',
      craftType: 'knitting',
      status: 'active',
      createdAt: '2026-10-15T11:00:00Z',
      updatedAt: '2026-10-15T11:00:00Z',
    });

    await insertProjectPart(db, {
      id: 'part_hat',
      projectId: 'proj_czapka',
      name: 'Rondo i góra',
      sortOrder: 1,
    });

    await insertCounter(db, {
      id: 'cnt_hat',
      partId: 'part_hat',
      name: 'Rzędy czapki',
      initialValue: 0,
      step: 1,
      targetValue: 50,
      reminderRows: [10, 20],
    });

    // 1. Inicjalizacja fasady z bazy
    let facade = await loadProjectFacade(db, 'proj_czapka');
    expect(facade.getCounterState('cnt_hat').rawValue).toBe(0);

    // 2. Kliknięcie 3 razy w odstępach
    await persistProjectStep(db, facade, 'cnt_hat', 'increment', 'iphone', 1000);
    await persistProjectStep(db, facade, 'cnt_hat', 'increment', 'apple_watch', 2000);
    await persistProjectStep(db, facade, 'cnt_hat', 'increment', 'garmin', 3000);

    expect(facade.getCounterState('cnt_hat').rawValue).toBe(3);

    // 3. Cofnięcie ostatniego kroku (Undo)
    const undone = await persistProjectUndo(db, facade, 'cnt_hat', 'iphone', 4000);
    expect(undone).toBe(true);
    expect(facade.getCounterState('cnt_hat').rawValue).toBe(2);

    const undoneFail = await persistProjectUndo(db, facade, 'nonexistent_counter', 'iphone', 4100);
    expect(undoneFail).toBe(false);

    // 4. SYMULACJA AWARII / RESTARTU APLIKACJI
    // Tworzymy nową instancję fasady, czytając wyłącznie dane zapisane w SQLite
    const restoredFacade = await loadProjectFacade(db, 'proj_czapka');
    const restoredState = restoredFacade.getCounterState('cnt_hat');

    expect(restoredState.rawValue).toBe(2);
    expect(restoredState.activeEventsCount).toBe(2);
  });

  test('Ochrona przed podwójnym liczeniem (BR-LICZ-007) nie zaśmieca bazy SQLite zbędnymi zdarzeniami', async () => {
    const db = createInMemoryDatabase();

    await insertProject(db, {
      id: 'proj_test',
      name: 'Test Debounce',
      craftType: 'crochet',
      status: 'active',
      createdAt: '2026-10-15T12:00:00Z',
      updatedAt: '2026-10-15T12:00:00Z',
    });

    await insertProjectPart(db, {
      id: 'part_test',
      projectId: 'proj_test',
      name: 'Próbka',
      sortOrder: 1,
    });

    await insertCounter(db, {
      id: 'cnt_debounce',
      partId: 'part_test',
      name: 'Licznik próbki',
      initialValue: 0,
      step: 1,
    });

    const facade = await loadProjectFacade(db, 'proj_test');

    // Pierwsze kliknięcie o t = 1000 ms
    const ev1 = await persistProjectStep(db, facade, 'cnt_debounce', 'increment', 'iphone', 1000, 300);
    expect(ev1).toHaveLength(1);

    // Przypadkowe podwójne kliknięcie o t = 1150 ms (odstęp 150 ms < 300 ms)
    const evSpurious = await persistProjectStep(db, facade, 'cnt_debounce', 'increment', 'iphone', 1150, 300);
    expect(evSpurious).toHaveLength(0); // Odrzucone przez debounce

    // Prawidłowe kolejne kliknięcie o t = 1500 ms (odstęp 500 ms >= 300 ms)
    const ev2 = await persistProjectStep(db, facade, 'cnt_debounce', 'increment', 'iphone', 1500, 300);
    expect(ev2).toHaveLength(1);

    // W bazie i fasadzie powinny być dokładnie 2 zdarzenia, wartość = 2
    expect(facade.getCounterState('cnt_debounce').rawValue).toBe(2);

    const reloaded = await loadProjectFacade(db, 'proj_test');
    expect(reloaded.getCounterState('cnt_debounce').rawValue).toBe(2);
  });
});
