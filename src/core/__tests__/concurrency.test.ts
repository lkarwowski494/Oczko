/**
 * Oczko Core — Testy Współbieżności i Wyścigów (Concurrency & Race Condition Simulation)
 * Wzorowane na rygorystycznych testach rozproszonych repozytorium organizer.
 * Weryfikuje odporność na jednoczesne akcje z Apple Watch i iPhone'a,
 * kolejkowanie offline, asynchroniczną synchronizację oraz determinizm sortowania.
 */

import {
  computeCounterState,
  checkPossibleInterDeviceDuplicate,
  CounterConfig,
  CounterEvent,
} from '../counter-engine';
import {
  WatchOfflineQueue,
  handleWatchInteraction,
} from '../apple-watch-service';
import {
  processIncomingSync,
  createSyncPayload,
} from '../device-sync';
import {
  createInMemoryDatabase,
  DatabaseClient,
} from '../database';
import {
  insertProject,
  insertProjectPart,
  insertCounter,
  appendCounterEvent,
  getCounterEvents,
} from '../project-repository';

describe('Współbieżność i Wyścigi Stanu (Concurrency & Race Conditions)', () => {
  const config: CounterConfig = {
    id: 'cnt_race_01',
    partId: 'part_01',
    name: 'Korpus współbieżny',
    initialValue: 0,
  };

  test('Determinizm przy identycznym znaczniku czasu (Sub-millisecond tie breaking)', () => {
    // Dwa zdarzenia z dokładnie tą samą milisekundą z różnych źródeł
    const timestamp = 1710000000000;
    const eventAppleWatch: CounterEvent = {
      id: 'ev_aaa_watch',
      counterId: config.id,
      type: 'INCREMENT',
      delta: 1,
      source: 'apple_watch',
      timestampMs: timestamp,
    };

    const eventIPhone: CounterEvent = {
      id: 'ev_bbb_iphone',
      counterId: config.id,
      type: 'INCREMENT',
      delta: 1,
      source: 'iphone',
      timestampMs: timestamp,
    };

    // Niezależnie od kolejności przekazania tablicy, stan wynikowy musi być w 100% identyczny
    const stateOrderA = computeCounterState(config, [eventAppleWatch, eventIPhone]);
    const stateOrderB = computeCounterState(config, [eventIPhone, eventAppleWatch]);

    expect(stateOrderA.rawValue).toBe(2);
    expect(stateOrderB.rawValue).toBe(2);
    expect(stateOrderA.activeEventsCount).toBe(2);
    expect(stateOrderB.activeEventsCount).toBe(2);
    expect(stateOrderA).toEqual(stateOrderB);
  });

  test('Buforowanie offline Apple Watch i deterministyczne uzgadnianie kolejki', () => {
    const queue = new WatchOfflineQueue();
    expect(queue.getPendingCount()).toBe(0);

    // Użytkownik robi na drutach w ogrodzie bez telefonu — zegarek buforuje 10 kliknięć i 1 obrót koronką
    for (let i = 1; i <= 10; i++) {
      queue.enqueue({
        action: 'increment',
        counterId: config.id,
        timestampMs: 1000 + i * 200,
      });
    }

    queue.enqueue({
      action: 'crown_rotate',
      counterId: config.id,
      delta: 2,
      timestampMs: 3500,
    });

    expect(queue.getPendingCount()).toBe(11);

    // Po powrocie w zasięg Bluetooth iPhone'a kolejka jest opróżniana (flush)
    const pendingItems = queue.flush();
    expect(queue.getPendingCount()).toBe(0);
    expect(pendingItems).toHaveLength(11);

    // Mapowanie interakcji z zegarka na zdarzenia domenowe
    const events: CounterEvent[] = pendingItems.map((item) => handleWatchInteraction(item).event);

    const state = computeCounterState(config, events);
    // 10 pojedynczych inkrementacji (+10) + 1 koronka (+2) = 12
    expect(state.rawValue).toBe(12);

    // Test metody clear()
    queue.enqueue({ action: 'increment', counterId: config.id });
    expect(queue.getPendingCount()).toBe(1);
    queue.clear();
    expect(queue.getPendingCount()).toBe(0);
  });

  test('Wykrywanie potencjalnych duplikatów między urządzeniami (Inter-device duplicate detection)', () => {
    const baseTs = 1710000000000;
    const watchEvent: CounterEvent = {
      id: 'ev_w1',
      counterId: config.id,
      type: 'INCREMENT',
      delta: 1,
      source: 'apple_watch',
      timestampMs: baseTs,
    };

    // Zdarzenie z iPhone'a zarejestrowane 300 ms później (w oknie 2000 ms)
    const iphoneEventClose: CounterEvent = {
      id: 'ev_ip1',
      counterId: config.id,
      type: 'INCREMENT',
      delta: 1,
      source: 'iphone',
      timestampMs: baseTs + 300,
    };

    // Zdarzenie z iPhone'a zarejestrowane 5000 ms później (poza oknem)
    const iphoneEventFar: CounterEvent = {
      id: 'ev_ip2',
      counterId: config.id,
      type: 'INCREMENT',
      delta: 1,
      source: 'iphone',
      timestampMs: baseTs + 5000,
    };

    // To samo urządzenie nie jest konfliktem międzyurządzeniowym (obsługiwane przez debounce)
    const watchEventRepeat: CounterEvent = {
      id: 'ev_w2',
      counterId: config.id,
      type: 'INCREMENT',
      delta: 1,
      source: 'apple_watch',
      timestampMs: baseTs + 200,
    };

    expect(checkPossibleInterDeviceDuplicate(watchEvent, iphoneEventClose, 2000)).toBe(true);
    expect(checkPossibleInterDeviceDuplicate(watchEvent, iphoneEventFar, 2000)).toBe(false);
    expect(checkPossibleInterDeviceDuplicate(watchEvent, watchEventRepeat, 2000)).toBe(false);
    expect(checkPossibleInterDeviceDuplicate(undefined, iphoneEventClose, 2000)).toBe(false);
  });

  test('Asynchroniczna synchronizacja paczek z urządzeń zewnętrznych (processIncomingSync)', () => {
    const existingEvents: CounterEvent[] = [
      {
        id: 'ev_1',
        counterId: config.id,
        type: 'INCREMENT',
        delta: 1,
        source: 'iphone',
        timestampMs: 1000,
      },
      {
        id: 'ev_2',
        counterId: config.id,
        type: 'INCREMENT',
        delta: 1,
        source: 'iphone',
        timestampMs: 2000,
      },
    ];

    // Przychodząca paczka z zegarka: zawiera duplikat ev_2 oraz nowe ev_3 i ev_4
    const incomingEvents: CounterEvent[] = [
      {
        id: 'ev_2', // już istnieje w bazie
        counterId: config.id,
        type: 'INCREMENT',
        delta: 1,
        source: 'iphone',
        timestampMs: 2000,
      },
      {
        id: 'ev_3',
        counterId: config.id,
        type: 'INCREMENT',
        delta: 1,
        source: 'apple_watch',
        timestampMs: 3000,
      },
      {
        id: 'ev_4',
        counterId: config.id,
        type: 'INCREMENT',
        delta: 1,
        source: 'apple_watch',
        timestampMs: 4000,
      },
    ];

    const payload = createSyncPayload('watch_device_99', 'apple_watch', incomingEvents);
    const { mergedEvents, result } = processIncomingSync(existingEvents, payload);

    expect(result.acceptedEventsCount).toBe(2); // tylko ev_3 i ev_4
    expect(result.conflictsResolved).toBe(0);
    expect(result.latestTimestamp).toBe(4000);
    expect(mergedEvents).toHaveLength(4);

    // Determinizm i ciągłość stanu
    const state = computeCounterState(config, mergedEvents);
    expect(state.rawValue).toBe(4);
    expect(state.activeEventsCount).toBe(4);
  });

  test('Równoległe asynchroniczne zapisy do repozytorium (Concurrent Repository Writes)', async () => {
    const db: DatabaseClient = createInMemoryDatabase();

    // Tworzymy bazową strukturę
    await insertProject(db, {
      id: 'proj_concurrent_1',
      name: 'Współbieżny Sweter',
      craftType: 'knitting',
      status: 'active',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    });

    await insertProjectPart(db, {
      id: 'part_concurrent_1',
      projectId: 'proj_concurrent_1',
      name: 'Tył',
      sortOrder: 1,
      targetRows: 200,
    });

    await insertCounter(db, {
      id: 'cnt_concurrent_1',
      partId: 'part_concurrent_1',
      name: 'Licznik współbieżny',
      initialValue: 0,
      step: 1,
    });

    // 25 równoległych asynchronicznych zapisów zdarzeń do bazy danych
    const concurrentWrites = Array.from({ length: 25 }, (_, idx) =>
      appendCounterEvent(db, {
        id: `ev_concurrent_${idx}`,
        counterId: 'cnt_concurrent_1',
        type: 'INCREMENT',
        delta: 1,
        source: idx % 2 === 0 ? 'iphone' : 'apple_watch',
        timestampMs: 1710000000000 + idx * 10,
      })
    );

    await Promise.all(concurrentWrites);

    // Weryfikacja: dokładnie 25 zdarzeń w bazie, bez wyścigów ani zagubionych wpisów
    const events = await getCounterEvents(db, 'cnt_concurrent_1');
    expect(events).toHaveLength(25);

    const state = computeCounterState(
      { id: 'cnt_concurrent_1', partId: 'part_concurrent_1', name: 'Licznik współbieżny', initialValue: 0 },
      events
    );

    expect(state.rawValue).toBe(25);
    expect(state.activeEventsCount).toBe(25);
  });
});
