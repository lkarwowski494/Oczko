/**
 * Oczko Core — Testy zarządzania częściami i powiązanymi licznikami cyklicznymi (BR-PROJ-002, BR-LICZ-003, BR-LICZ-005)
 */

import { createInMemoryDatabase } from '../database';
import {
  createFullProject,
  addPartToProject,
  addLinkedCounterToPart,
  loadAllProjectsWithProgress,
} from '../project-service';
import {
  loadProjectFacade,
  persistProjectStep,
  persistProjectUndo,
} from '../project-repository';

describe('Oczko Core — Części i powiązane liczniki wzorów (BR-PROJ-002, BR-LICZ-003, BR-LICZ-005)', () => {
  let db: ReturnType<typeof createInMemoryDatabase>;

  beforeEach(() => {
    db = createInMemoryDatabase();
  });

  test('addPartToProject dodaje nową część do istniejącego projektu', async () => {
    const created = await createFullProject(db, {
      name: 'Sweter z raglanem',
      craftType: 'knitting',
      parts: [{ name: 'Korpus', targetRows: 100 }],
    });

    const newPart = await addPartToProject(db, created.project.id, {
      name: 'Rękaw lewy',
      targetRows: 70,
    });

    expect(newPart.part.id).toBeDefined();
    expect(newPart.part.name).toBe('Rękaw lewy');
    expect(newPart.primaryCounter.name).toBe('Rzędy');

    const projects = await loadAllProjectsWithProgress(db);
    const p = projects.find((proj) => proj.id === created.project.id)!;
    expect(p.parts.length).toBe(2);
  });

  test('addLinkedCounterToPart tworzy licznik powiązany (np. warkocz co 6 rzędów)', async () => {
    const created = await createFullProject(db, {
      name: 'Kardigan z warkoczem',
      craftType: 'knitting',
      parts: [{ name: 'Przód', targetRows: 80 }],
    });

    const mainCounter = created.counters[0];

    const linked = await addLinkedCounterToPart(db, created.parts[0].id, mainCounter.id, {
      name: 'Splot warkocza',
      moduloCycle: 6,
      reminderRows: [6], // przypomnij w 6. rzędzie o skrzyżowaniu
    });

    expect(linked.id).toBeDefined();
    expect(linked.linkedToParentId).toBe(mainCounter.id);
    expect(linked.moduloCycle).toBe(6);

    // Krok w liczniku głównym automatycznie inkrementuje powiązany licznik warkocza
    const facade = await loadProjectFacade(db, created.project.id);
    const t0 = 1000000;

    // Wykonaj 6 kroków
    for (let i = 1; i <= 6; i++) {
      await persistProjectStep(db, facade, mainCounter.id, 'increment', 'iphone', t0 + i * 500, 300);
    }

    const mainState = facade.getCounterState(mainCounter.id);
    const linkedState = facade.getCounterState(linked.id);

    expect(mainState.rawValue).toBe(6);
    expect(linkedState.rawValue).toBe(6);
    expect(linkedState.cycleStep).toBe(6);
    expect(linkedState.completedCycles).toBe(0);
    expect(linkedState.activeReminder).toBe(true); // 6. rząd = przypomnienie o splocie!

    // 7. krok: licznik główny = 7, warkocz = 7 (krok 1 w drugim cyklu, 1 ukończony cykl)
    await persistProjectStep(db, facade, mainCounter.id, 'increment', 'iphone', t0 + 3500, 300);
    const linkedState7 = facade.getCounterState(linked.id);
    expect(linkedState7.rawValue).toBe(7);
    expect(linkedState7.cycleStep).toBe(1);
    expect(linkedState7.completedCycles).toBe(1);
  });

  test('Undo na liczniku głównym synchronicznie cofa krok na liczniku powiązanym', async () => {
    const created = await createFullProject(db, {
      name: 'Czapka',
      craftType: 'knitting',
      parts: [{ name: 'Całość', targetRows: 50 }],
    });

    const mainCounter = created.counters[0];
    const linked = await addLinkedCounterToPart(db, created.parts[0].id, mainCounter.id, {
      name: 'Ażur',
      moduloCycle: 4,
    });

    const facade = await loadProjectFacade(db, created.project.id);
    const t0 = 2000000;

    await persistProjectStep(db, facade, mainCounter.id, 'increment', 'iphone', t0, 300);
    expect(facade.getCounterState(mainCounter.id).rawValue).toBe(1);
    expect(facade.getCounterState(linked.id).rawValue).toBe(1);

    await persistProjectUndo(db, facade, mainCounter.id, 'iphone', t0 + 500);
    expect(facade.getCounterState(mainCounter.id).rawValue).toBe(0);
  });
});
