/**
 * Oczko Core & State — Test integracyjny pełnego przepływu projektu (Vertical Slice)
 * Pokrywa: Utworzenie projektu -> Trwały krok licznika -> Dziennik zdarzeń w SQLite -> Obliczenie postępu -> Undo -> Odtwarzanie po restarcie
 */

import { createInMemoryDatabase } from '../database';
import {
  createFullProject,
  loadAllProjectsWithProgress,
} from '../project-service';
import {
  loadProjectFacade,
  persistProjectStep,
  persistProjectUndo,
  getCounterEvents,
} from '../project-repository';

describe('Oczko — Pełny przepływ integracyjny projektu i licznika w SQLite (BR-PROJ-001...005, BR-LICZ-008)', () => {
  let db: ReturnType<typeof createInMemoryDatabase>;

  beforeEach(() => {
    db = createInMemoryDatabase();
  });

  test('Kompletna ścieżka: Tworzenie projektu -> Krok w liczniku -> Zapis w SQLite -> Postęp na liście -> Undo -> Odtworzenie stanu', async () => {
    // 1. Utworzenie projektu z częściami
    const created = await createFullProject(db, {
      name: 'Kardigan Wełniany',
      craftType: 'knitting',
      parts: [
        { name: 'Tył', targetRows: 50 },
        { name: 'Przód lewy', targetRows: 50 },
      ],
    });

    expect(created.project.id).toBeDefined();
    expect(created.parts.length).toBe(2);
    const mainCounterId = created.activeCounterId;
    expect(mainCounterId).toBeDefined();

    // 2. Załadowanie fasady i wykonanie kroków licznika (+3 rzędy)
    const facade = await loadProjectFacade(db, created.project.id);
    expect(facade.getCounterState(mainCounterId).rawValue).toBe(0);

    const t0 = 1000000;
    await persistProjectStep(db, facade, mainCounterId, 'increment', 'iphone', t0, 300);
    await persistProjectStep(db, facade, mainCounterId, 'increment', 'iphone', t0 + 500, 300);
    await persistProjectStep(db, facade, mainCounterId, 'increment', 'iphone', t0 + 1000, 300);

    expect(facade.getCounterState(mainCounterId).rawValue).toBe(3);

    // 3. Weryfikacja zapisu zdarzeń w bazie SQLite (Append-Only Event Log)
    const events = await getCounterEvents(db, mainCounterId);
    expect(events.length).toBe(3);
    expect(events.map((e) => e.type)).toEqual(['INCREMENT', 'INCREMENT', 'INCREMENT']);

    // 4. Odświeżenie listy projektów – postęp i wartość w widoku
    const projects = await loadAllProjectsWithProgress(db);
    expect(projects.length).toBe(1);
    const p = projects[0];
    expect(p.name).toBe('Kardigan Wełniany');
    const partBack = p.parts.find((part) => part.name === 'Tył');
    expect(partBack?.counters[0].currentValue).toBe(3);

    // 5. Operacja UNDO (cofnięcie ostatniego rzędu)
    const undoApplied = await persistProjectUndo(db, facade, mainCounterId, 'iphone', t0 + 1500);
    expect(undoApplied).toBe(true);
    expect(facade.getCounterState(mainCounterId).rawValue).toBe(2);

    const eventsAfterUndo = await getCounterEvents(db, mainCounterId);
    expect(eventsAfterUndo.length).toBe(4);
    expect(eventsAfterUndo[3].type).toBe('UNDO');

    // 6. Symulacja restartu aplikacji / awarii zasilania
    // Nowa fasada wczytana prosto z czystej bazy danych musi mieć stan = 2
    const reloadedFacade = await loadProjectFacade(db, created.project.id);
    expect(reloadedFacade.getCounterState(mainCounterId).rawValue).toBe(2);
  });
});
