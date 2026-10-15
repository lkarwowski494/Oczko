import {
  CounterConfig,
  computeCounterState,
  recordCounterStep,
  createUndoEvent,
  mergeEventLogs,
  CounterEvent,
} from '../counter-engine';

describe('Oczko Core — Silnik licznika i dziennik zdarzeń (BR-LICZ)', () => {
  const mainCounter: CounterConfig = {
    id: 'cnt_main',
    partId: 'part_sleeve',
    name: 'Rzędy rękawa',
    targetValue: 60,
    reminderRows: [6, 12, 18, 24],
  };

  const repeatCounter: CounterConfig = {
    id: 'cnt_cable',
    partId: 'part_sleeve',
    name: 'Warkocz (8 rzędów)',
    moduloCycle: 8,
    linkedToParentId: 'cnt_main',
  };

  test('BR-LICZ-001 & 003: inkrementacja, licznik cykliczny i przypomnienia', () => {
    let events: CounterEvent[] = [];

    // Klikamy 6 razy
    for (let i = 1; i <= 6; i++) {
      const stepEvents = recordCounterStep({
        primaryConfig: mainCounter,
        linkedConfigs: [repeatCounter],
        direction: 'increment',
        source: 'apple_watch',
        timestampMs: 1000 + i * 100,
        idPrefix: `step_${i}`,
      });
      events.push(...stepEvents);
    }

    const mainState = computeCounterState(mainCounter, events);
    const repeatState = computeCounterState(repeatCounter, events);

    expect(mainState.rawValue).toBe(6);
    expect(mainState.activeReminder).toBe(true); // rząd 6 ma przypomnienie
    expect(repeatState.cycleStep).toBe(6);
    expect(repeatState.completedCycles).toBe(0);
  });

  test('BR-LICZ-004: obsługa cofania (UNDO) z poziomu zegarka', () => {
    let events: CounterEvent[] = recordCounterStep({
      primaryConfig: mainCounter,
      direction: 'increment',
      source: 'garmin',
      timestampMs: 2000,
      idPrefix: 'init',
    });

    expect(computeCounterState(mainCounter, events).rawValue).toBe(1);

    // Cofamy ostatni krok
    const undoEvent = createUndoEvent({
      counterId: mainCounter.id,
      events,
      source: 'garmin',
      timestampMs: 2500,
      eventId: 'undo_1',
    });

    expect(undoEvent).not.toBeNull();
    if (undoEvent) {
      events.push(undoEvent);
    }

    expect(computeCounterState(mainCounter, events).rawValue).toBe(0);
  });

  test('BR-LICZ-008: bezkonfliktowe scalanie dzienników zdarzeń z wielu urządzeń', () => {
    const localEvents: CounterEvent[] = [
      { id: 'ev_1', counterId: 'cnt_main', type: 'INCREMENT', delta: 1, source: 'iphone', timestampMs: 1000 },
    ];
    const remoteEvents: CounterEvent[] = [
      { id: 'ev_1', counterId: 'cnt_main', type: 'INCREMENT', delta: 1, source: 'iphone', timestampMs: 1000 },
      { id: 'ev_2', counterId: 'cnt_main', type: 'INCREMENT', delta: 1, source: 'apple_watch', timestampMs: 1100 },
    ];

    const merged = mergeEventLogs(localEvents, remoteEvents);
    expect(merged).toHaveLength(2); // zdeduplikowało ev_1
    expect(computeCounterState(mainCounter, merged).rawValue).toBe(2);
  });
});
