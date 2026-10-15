/**
 * Oczko Core — Protokół i obsługa synchronizacji z urządzeniami zewnętrznymi (Garmin / Apple Watch)
 */

import { CounterEvent, DeviceSource } from './counter-engine';

export interface SyncPayload {
  deviceId: string;
  source: DeviceSource;
  lastSyncTimestamp: number;
  events: CounterEvent[];
}

export interface SyncResponseResult {
  acceptedEventsCount: number;
  conflictsResolved: number;
  latestTimestamp: number;
}

/**
 * Waliduje i przygotowuje paczkę zdarzeń do wysłania na urządzenie ubieralne lub z powrotem do chmury.
 */
export function createSyncPayload(
  deviceId: string,
  source: DeviceSource,
  events: readonly CounterEvent[]
): SyncPayload {
  const lastSyncTimestamp = events.length > 0 ? Math.max(...events.map((e) => e.timestampMs)) : Date.now();
  return {
    deviceId,
    source,
    lastSyncTimestamp,
    events: [...events],
  };
}

/**
 * Przetwarza przychodzącą paczkę zdarzeń z urządzenia i zwraca podsumowanie synchronizacji.
 */
export function processIncomingSync(
  existingEvents: readonly CounterEvent[],
  incomingPayload: SyncPayload
): { mergedEvents: CounterEvent[]; result: SyncResponseResult } {
  const eventMap = new Map<string, CounterEvent>();

  for (const ev of existingEvents) {
    eventMap.set(ev.id, ev);
  }

  let acceptedCount = 0;
  for (const ev of incomingPayload.events) {
    if (!eventMap.has(ev.id)) {
      eventMap.set(ev.id, ev);
      acceptedCount++;
    }
  }

  const mergedEvents = Array.from(eventMap.values()).sort((a, b) =>
    a.timestampMs !== b.timestampMs ? a.timestampMs - b.timestampMs : a.id.localeCompare(b.id)
  );

  const latestTimestamp = mergedEvents.length > 0 ? Math.max(...mergedEvents.map((e) => e.timestampMs)) : incomingPayload.lastSyncTimestamp;

  return {
    mergedEvents,
    result: {
      acceptedEventsCount: acceptedCount,
      conflictsResolved: 0, // Działamy na niezmiennym dzienniku zdarzeń (append-only), więc brak konfliktów nadpisywania
      latestTimestamp,
    },
  };
}
