/**
 * Oczko — Prototyp Protokołu Garmin ConnectIQ Mobile SDK Bridge (DEC-02)
 *
 * Deterministyczna obsługa wiadomości BLE, serializacji kopert JSON,
 * mapowania zdarzeń fizycznych przycisków Garmin oraz buforowania offline.
 * Eliminuje ryzyko architektoniczne przed pełną wersją na zegarki Garmin (v1.1).
 */

export const GARMIN_COMM_UUID = 'c48e89f2-7e04-4b53-9f89-8d76b1f20001';

export type GarminWatchModel =
  | 'forerunner_965'
  | 'fenix_7'
  | 'venu_3'
  | 'epix_pro'
  | 'generic_ciq';

export type GarminButtonKey =
  | 'KEY_START_STOP' // Inkrementacja (+1)
  | 'KEY_LAP'        // Cofnięcie (UNDO / -1)
  | 'KEY_UP'         // Poprzednia część / opcja
  | 'KEY_DOWN'       // Następna część / opcja
  | 'TOUCH_TAP';     // Stuknięcie w ekran dotykowy

export interface GarminDeviceHandshake {
  model: GarminWatchModel;
  deviceName: string;
  firmwareVersion: string;
  connectIqVersion: string;
  batteryLevelPercent: number;
  protocolVersion: number;
}

export interface GarminSyncPayload {
  counterId: string;
  projectName: string;
  partName: string;
  currentCount: number;
  targetCount: number;
  unitLabel: string;
  linkedPatternName?: string;
  linkedPatternCycle?: number;
  linkedPatternStep?: number;
  isCompleted: boolean;
  timestamp: number;
}

export interface GarminWatchEvent {
  eventId: string;
  source: 'garmin_connectiq';
  button: GarminButtonKey;
  counterId: string;
  timestamp: number;
  batteryLevelPercent?: number;
}

export interface GarminMessageEnvelope<T> {
  appUuid: string;
  seqId: number;
  type: 'HANDSHAKE' | 'SYNC_STATE' | 'WATCH_EVENT' | 'ACK' | 'NACK';
  payload: T;
  timestamp: number;
}

/**
 * Tworzy kompaktowy ładunek synchronizacji (GarminSyncPayload) dla zegarka Garmin.
 */
export function createGarminSyncPayload(params: {
  counterId: string;
  projectName: string;
  partName: string;
  currentCount: number;
  targetCount: number;
  unitLabel?: string;
  linkedPatternName?: string;
  linkedPatternCycle?: number;
  linkedPatternStep?: number;
  timestamp?: number;
}): GarminSyncPayload {
  const current = Math.max(0, Math.floor(params.currentCount));
  const target = Math.max(0, Math.floor(params.targetCount));

  return {
    counterId: params.counterId,
    projectName: params.projectName.slice(0, 32),
    partName: params.partName.slice(0, 24),
    currentCount: current,
    targetCount: target,
    unitLabel: params.unitLabel || 'rząd',
    linkedPatternName: params.linkedPatternName ? params.linkedPatternName.slice(0, 24) : undefined,
    linkedPatternCycle: params.linkedPatternCycle,
    linkedPatternStep: params.linkedPatternStep,
    isCompleted: target > 0 && current >= target,
    timestamp: params.timestamp || Date.now(),
  };
}

/**
 * Serializuje kopertę wiadomości ConnectIQ Mobile SDK do JSON.
 */
export function serializeGarminEnvelope<T>(
  type: GarminMessageEnvelope<T>['type'],
  payload: T,
  seqId: number = 1
): string {
  const envelope: GarminMessageEnvelope<T> = {
    appUuid: GARMIN_COMM_UUID,
    seqId: Math.max(1, Math.floor(seqId)),
    type,
    payload,
    timestamp: Date.now(),
  };
  return JSON.stringify(envelope);
}

/**
 * Deserializuje i waliduje surowy ciąg znaków JSON z mostka Garmin ConnectIQ.
 */
export function deserializeGarminEnvelope<T>(
  rawJson: string
): { valid: boolean; envelope?: GarminMessageEnvelope<T>; error?: string } {
  try {
    if (!rawJson || typeof rawJson !== 'string') {
      return { valid: false, error: 'EMPTY_PAYLOAD' };
    }
    const parsed = JSON.parse(rawJson);

    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'NOT_AN_OBJECT' };
    }

    if (parsed.appUuid !== GARMIN_COMM_UUID) {
      return { valid: false, error: 'INVALID_APP_UUID' };
    }

    if (!parsed.type || typeof parsed.type !== 'string') {
      return { valid: false, error: 'MISSING_MESSAGE_TYPE' };
    }

    return {
      valid: true,
      envelope: parsed as GarminMessageEnvelope<T>,
    };
  } catch (err: any) {
    return { valid: false, error: `JSON_SYNTAX_ERROR: ${err.message}` };
  }
}

/**
 * Obsługuje zdarzenie naciśnięcia przycisku lub dotyku w zegarku Garmin.
 */
export function handleGarminWatchEvent(
  event: GarminWatchEvent,
  actions: {
    onIncrement?: () => void;
    onDecrement?: () => void;
    onNextPart?: () => void;
    onPreviousPart?: () => void;
  }
): { handled: boolean; actionName: string } {
  switch (event.button) {
    case 'KEY_START_STOP':
    case 'TOUCH_TAP':
      if (actions.onIncrement) {
        actions.onIncrement();
        return { handled: true, actionName: 'INCREMENT' };
      }
      return { handled: false, actionName: 'IGNORED_INCREMENT' };

    case 'KEY_LAP':
      if (actions.onDecrement) {
        actions.onDecrement();
        return { handled: true, actionName: 'DECREMENT_UNDO' };
      }
      return { handled: false, actionName: 'IGNORED_DECREMENT' };

    case 'KEY_DOWN':
      if (actions.onNextPart) {
        actions.onNextPart();
        return { handled: true, actionName: 'NEXT_PART' };
      }
      return { handled: false, actionName: 'IGNORED_NEXT_PART' };

    case 'KEY_UP':
      if (actions.onPreviousPart) {
        actions.onPreviousPart();
        return { handled: true, actionName: 'PREVIOUS_PART' };
      }
      return { handled: false, actionName: 'IGNORED_PREVIOUS_PART' };

    default:
      return { handled: false, actionName: 'UNKNOWN_BUTTON' };
  }
}

/**
 * Bufor zdarzeń offline dla urządzeń Garmin przy utracie zasięgu BLE z telefonem.
 */
export class GarminOfflineQueue {
  private queue: GarminWatchEvent[] = [];
  private maxCapacity: number;

  constructor(maxCapacity: number = 100) {
    this.maxCapacity = maxCapacity;
  }

  enqueue(event: GarminWatchEvent): boolean {
    if (this.queue.length >= this.maxCapacity) {
      return false; // bufor pełny
    }
    this.queue.push(event);
    return true;
  }

  flush(): GarminWatchEvent[] {
    const events = [...this.queue];
    this.queue = [];
    return events;
  }

  size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}
