import { createSyncPayload, processIncomingSync } from '../device-sync';
import { CounterEvent } from '../counter-engine';

describe('Oczko Core — Synchronizacja urządzeń (Garmin / Watch)', () => {
  test('Tworzy paczkę synchronizacji i poprawnie scala zdarzenia z urządzenia', () => {
    const localEvents: CounterEvent[] = [
      { id: 'e1', counterId: 'c1', type: 'INCREMENT', delta: 1, source: 'iphone', timestampMs: 1000 },
    ];

    const payload = createSyncPayload('garmin_fenix_7', 'garmin', localEvents);
    expect(payload.deviceId).toBe('garmin_fenix_7');
    expect(payload.events).toHaveLength(1);

    const incomingEvents: CounterEvent[] = [
      { id: 'e1', counterId: 'c1', type: 'INCREMENT', delta: 1, source: 'iphone', timestampMs: 1000 },
      { id: 'e2', counterId: 'c1', type: 'INCREMENT', delta: 1, source: 'garmin', timestampMs: 1500 },
    ];

    const { mergedEvents, result } = processIncomingSync(localEvents, {
      deviceId: 'garmin_fenix_7',
      source: 'garmin',
      lastSyncTimestamp: 1500,
      events: incomingEvents,
    });

    expect(mergedEvents).toHaveLength(2);
    expect(result.acceptedEventsCount).toBe(1); // dodano nowe e2 z Garmina, zdeduplikowano e1
    expect(result.latestTimestamp).toBe(1500);
  });

  test('createSyncPayload z pustą listą zdarzeń oraz sortowanie zdarzeń o tym samym timestampMs', () => {
    const emptyPayload = createSyncPayload('watch_1', 'apple_watch', []);
    expect(emptyPayload.events).toEqual([]);
    expect(emptyPayload.lastSyncTimestamp).toBeGreaterThan(0);

    const evA: CounterEvent = { id: 'a_event', counterId: 'c1', type: 'INCREMENT', delta: 1, source: 'iphone', timestampMs: 1000 };
    const evB: CounterEvent = { id: 'b_event', counterId: 'c1', type: 'INCREMENT', delta: 1, source: 'apple_watch', timestampMs: 1000 };

    const { mergedEvents } = processIncomingSync([evB], {
      deviceId: 'iphone_1',
      source: 'iphone',
      lastSyncTimestamp: 1000,
      events: [evA],
    });

    expect(mergedEvents).toHaveLength(2);
    expect(mergedEvents[0].id).toBe('a_event');
    expect(mergedEvents[1].id).toBe('b_event');

    const emptySync = processIncomingSync([], {
      deviceId: 'dev_0',
      source: 'iphone',
      lastSyncTimestamp: 9999,
      events: [],
    });
    expect(emptySync.mergedEvents).toEqual([]);
    expect(emptySync.result.latestTimestamp).toBe(9999);
  });
});
