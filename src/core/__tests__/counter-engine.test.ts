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

  test('BR-LICZ-007: ochrona przed podwójnym liczeniem (seria 10 stuknięć co 150 ms)', () => {
    // Seria 10 stuknięć co 150 ms przy progu 300 ms -> powinno dać dokładnie 5 zdarzeń
    let recordedEventsThreshold300: CounterEvent[] = [];
    let lastAcceptedTime: number | undefined = undefined;

    for (let i = 0; i < 10; i++) {
      const now = 1000 + i * 150;
      const evs = recordCounterStep({
        primaryConfig: mainCounter,
        direction: 'increment',
        source: 'iphone',
        timestampMs: now,
        lastEventTimestampMs: lastAcceptedTime,
        debounceThresholdMs: 300,
        idPrefix: `tap_${i}`,
      });
      if (evs.length > 0) {
        recordedEventsThreshold300.push(...evs);
        lastAcceptedTime = now;
      }
    }
    expect(recordedEventsThreshold300).toHaveLength(5);

    // Przy progu 0 ms -> powinno zarejestrować wszystkie 10 zdarzeń
    let recordedEventsThreshold0: CounterEvent[] = [];
    lastAcceptedTime = undefined;

    for (let i = 0; i < 10; i++) {
      const now = 1000 + i * 150;
      const evs = recordCounterStep({
        primaryConfig: mainCounter,
        direction: 'increment',
        source: 'iphone',
        timestampMs: now,
        lastEventTimestampMs: lastAcceptedTime,
        debounceThresholdMs: 0,
        idPrefix: `tap0_${i}`,
      });
      if (evs.length > 0) {
        recordedEventsThreshold0.push(...evs);
        lastAcceptedTime = now;
      }
    }
    expect(recordedEventsThreshold0).toHaveLength(10);
  });

  test('BR-LICZ-007: wykrywanie możliwego podwójnego naliczenia między urządzeniami (odstęp <= 2s)', () => {
    const ev1: CounterEvent = {
      id: 'ev_watch_1',
      counterId: 'cnt_main',
      type: 'INCREMENT',
      delta: 1,
      source: 'apple_watch',
      timestampMs: 5000,
    };

    const ev2Close: CounterEvent = {
      id: 'ev_phone_1',
      counterId: 'cnt_main',
      type: 'INCREMENT',
      delta: 1,
      source: 'iphone',
      timestampMs: 6500, // 1.5s później z innego urządzenia
    };

    const ev3Distant: CounterEvent = {
      id: 'ev_phone_2',
      counterId: 'cnt_main',
      type: 'INCREMENT',
      delta: 1,
      source: 'iphone',
      timestampMs: 7500, // 2.5s po pierwszym
    };

    const { checkPossibleInterDeviceDuplicate } = require('../counter-engine');
    expect(checkPossibleInterDeviceDuplicate(ev1, ev2Close)).toBe(true);
    expect(checkPossibleInterDeviceDuplicate(ev1, ev3Distant)).toBe(false);
  });

  test('computeCounterState obsługuje zdarzenia RESET oraz SET', () => {
    // rawValue === 0 z moduloCycle
    const zeroState = computeCounterState(repeatCounter, []);
    expect(zeroState.cycleStep).toBe(0);
    expect(zeroState.completedCycles).toBe(0);

    const events: CounterEvent[] = [
      { id: 'e1', counterId: 'cnt_main', type: 'INCREMENT', delta: 5, source: 'iphone', timestampMs: 1000 },
      { id: 'e2', counterId: 'cnt_main', type: 'SET', delta: 12, source: 'iphone', timestampMs: 2000 },
      { id: 'e3', counterId: 'cnt_main', type: 'RESET', delta: 0, source: 'iphone', timestampMs: 3000 },
    ];

    const state = computeCounterState(mainCounter, events);
    expect(state.rawValue).toBe(mainCounter.initialValue ?? 0);
  });

  test('createUndoEvent zwraca null gdy brak zdarzeń lub wszystkie zostały już cofnięte', () => {
    const emptyUndo = createUndoEvent({
      counterId: 'cnt_main',
      events: [],
      source: 'iphone',
      timestampMs: 1000,
    });
    expect(emptyUndo).toBeNull();

    const ev: CounterEvent = { id: 'step_1', counterId: 'cnt_main', type: 'INCREMENT', delta: 1, source: 'iphone', timestampMs: 1000 };
    const undo1: CounterEvent = { id: 'undo_1', counterId: 'cnt_main', type: 'UNDO', delta: 0, targetEventId: 'step_1', source: 'iphone', timestampMs: 2000 };

    const secondUndo = createUndoEvent({
      counterId: 'cnt_main',
      events: [ev, undo1],
      source: 'iphone',
      timestampMs: 3000,
    });
    expect(secondUndo).toBeNull();
  });
});
