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
});
