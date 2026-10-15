/**
 * Oczko Core — Silnik licznika rzędów i niezmiennego dziennika zdarzeń (BR-LICZ-001…012)
 */

export type DeviceSource = 'iphone' | 'apple_watch' | 'garmin' | 'voice' | 'gesture';
export type CounterEventType = 'INCREMENT' | 'DECREMENT' | 'RESET' | 'UNDO' | 'SET';

export interface CounterConfig {
  id: string;
  partId: string;
  name: string;
  initialValue?: number;
  step?: number;
  moduloCycle?: number;
  targetValue?: number;
  reminderRows?: number[];
  linkedToParentId?: string;
}

export interface CounterEvent {
  id: string;
  counterId: string;
  type: CounterEventType;
  delta: number;
  targetEventId?: string;
  source: DeviceSource;
  timestampMs: number;
}

export interface ComputedCounterState {
  counterId: string;
  rawValue: number;
  cycleStep: number | null;
  completedCycles: number | null;
  activeReminder: boolean;
  progressRatio: number | null;
  activeEventsCount: number;
}

export function computeCounterState(
  config: CounterConfig,
  events: readonly CounterEvent[]
): ComputedCounterState {
  const initial = config.initialValue ?? 0;

  const sorted = [...events].sort((a, b) =>
    a.timestampMs !== b.timestampMs
      ? a.timestampMs - b.timestampMs
      : a.id.localeCompare(b.id)
  );

  const undoneEventIds = new Set<string>();
  for (const ev of sorted) {
    if (ev.type === 'UNDO' && ev.targetEventId) {
      undoneEventIds.add(ev.targetEventId);
    }
  }

  let rawValue = initial;
  let activeEventsCount = 0;

  for (const ev of sorted) {
    if (ev.counterId !== config.id) continue;
    if (ev.type === 'UNDO') continue;
    if (undoneEventIds.has(ev.id)) continue;

    activeEventsCount++;
    if (ev.type === 'RESET') {
      rawValue = initial;
    } else if (ev.type === 'SET') {
      rawValue = Math.max(0, ev.delta);
    } else {
      rawValue = Math.max(0, rawValue + ev.delta);
    }
  }

  let cycleStep: number | null = null;
  let completedCycles: number | null = null;

  if (config.moduloCycle && config.moduloCycle > 0) {
    const m = config.moduloCycle;
    if (rawValue === 0) {
      cycleStep = 0;
      completedCycles = 0;
    } else {
      cycleStep = ((rawValue - 1) % m) + 1;
      completedCycles = Math.floor((rawValue - 1) / m);
    }
  }

  const reminderSet = new Set(config.reminderRows ?? []);
  const activeReminder = reminderSet.has(rawValue);

  const progressRatio =
    config.targetValue && config.targetValue > 0
      ? Math.min(1, rawValue / config.targetValue)
      : null;

  return {
    counterId: config.id,
    rawValue,
    cycleStep,
    completedCycles,
    activeReminder,
    progressRatio,
    activeEventsCount,
  };
}

export function shouldDebounceClick(
  lastTimestampMs: number | undefined,
  currentTimestampMs: number,
  thresholdMs: number = 300
): boolean {
  if (lastTimestampMs === undefined || thresholdMs <= 0) return false;
  const elapsed = currentTimestampMs - lastTimestampMs;
  return elapsed >= 0 && elapsed < thresholdMs;
}

export function checkPossibleInterDeviceDuplicate(
  prevEvent: CounterEvent | undefined,
  currentEvent: CounterEvent,
  windowMs: number = 2000
): boolean {
  if (!prevEvent) return false;
  if (prevEvent.counterId !== currentEvent.counterId) return false;
  if (prevEvent.type !== 'INCREMENT' || currentEvent.type !== 'INCREMENT') return false;
  if (prevEvent.source === currentEvent.source) return false;
  return Math.abs(currentEvent.timestampMs - prevEvent.timestampMs) <= windowMs;
}

export function recordCounterStep(params: {
  primaryConfig: CounterConfig;
  linkedConfigs?: readonly CounterConfig[];
  direction: 'increment' | 'decrement';
  source: DeviceSource;
  timestampMs: number;
  lastEventTimestampMs?: number;
  debounceThresholdMs?: number;
  idPrefix?: string;
}): CounterEvent[] {
  const {
    primaryConfig,
    linkedConfigs = [],
    direction,
    source,
    timestampMs,
    lastEventTimestampMs,
    debounceThresholdMs = 0,
    idPrefix = 'ev',
  } = params;

  if (shouldDebounceClick(lastEventTimestampMs, timestampMs, debounceThresholdMs)) {
    return [];
  }

  const allConfigs = [
    primaryConfig,
    ...linkedConfigs.filter((c) => c.linkedToParentId === primaryConfig.id),
  ];

  return allConfigs.map((cfg, idx) => {
    const step = cfg.step ?? 1;
    const delta = direction === 'increment' ? step : -step;
    return {
      id: `${idPrefix}_${timestampMs}_${idx}_${cfg.id}`,
      counterId: cfg.id,
      type: direction === 'increment' ? 'INCREMENT' : 'DECREMENT',
      delta,
      source,
      timestampMs,
    };
  });
}

export function createUndoEvent(params: {
  counterId: string;
  events: readonly CounterEvent[];
  source: DeviceSource;
  timestampMs: number;
  eventId?: string;
}): CounterEvent | null {
  const { counterId, events, source, timestampMs, eventId } = params;

  const counterEvents = events
    .filter((e) => e.counterId === counterId)
    .sort((a, b) =>
      a.timestampMs !== b.timestampMs
        ? a.timestampMs - b.timestampMs
        : a.id.localeCompare(b.id)
    );

  const undoneIds = new Set<string>();
  for (const ev of counterEvents) {
    if (ev.type === 'UNDO' && ev.targetEventId) {
      undoneIds.add(ev.targetEventId);
    }
  }

  for (let i = counterEvents.length - 1; i >= 0; i--) {
    const candidate = counterEvents[i];
    if (candidate.type !== 'UNDO' && !undoneIds.has(candidate.id)) {
      return {
        id: eventId ?? `undo_${timestampMs}_${counterId}`,
        counterId,
        type: 'UNDO',
        delta: 0,
        targetEventId: candidate.id,
        source,
        timestampMs,
      };
    }
  }

  return null;
}

export function mergeEventLogs(
  localEvents: readonly CounterEvent[],
  remoteEvents: readonly CounterEvent[]
): CounterEvent[] {
  const map = new Map<string, CounterEvent>();
  for (const ev of localEvents) map.set(ev.id, ev);
  for (const ev of remoteEvents) map.set(ev.id, ev);

  return Array.from(map.values()).sort((a, b) =>
    a.timestampMs !== b.timestampMs
      ? a.timestampMs - b.timestampMs
      : a.id.localeCompare(b.id)
  );
}
