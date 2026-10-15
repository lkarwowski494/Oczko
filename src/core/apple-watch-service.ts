/**
 * Oczko Core — Serwis synchronizacji z Apple Watch & Live Activities (DEC-03, BR-SYS-003, BR-ZEG-003, BR-ZEG-009)
 * Obsługuje przygotowanie zrzutów stanu dla watchOS 11, rejestrację akcji z cyfrowej koronki
 * oraz generowanie struktur dla widżetów Smart Stack i ActivityKit (iOS 18).
 */

import { CounterEvent, DeviceSource } from './counter-engine';

export interface WatchCounterStateInput {
  rawValue: number;
  targetValue?: number;
  activeReminder?: boolean;
  reminderRows?: number[];
  isGoalReached?: boolean;
  history?: any[];
  [key: string]: any;
}

export interface WatchCounterSnapshot {
  projectId: string;
  projectName: string;
  partId: string;
  partName: string;
  counterId: string;
  counterName: string;
  currentValue: number;
  targetValue?: number;
  progressPercent?: number;
  activeReminder?: boolean;
  reminderReason?: string;
  lastUpdatedMs: number;
}

export interface CreateWatchSnapshotParams {
  projectId: string;
  projectName: string;
  partId: string;
  partName: string;
  counterId: string;
  counterName: string;
  counterState: WatchCounterStateInput;
  reminderReason?: string;
}

/**
 * Przygotowuje zrzut stanu licznika do natychmiastowej transmisji przez WatchConnectivity / WCSession.
 */
export function createWatchCounterSnapshot(params: CreateWatchSnapshotParams): WatchCounterSnapshot {
  const currentVal = params.counterState.rawValue;
  const targetVal = params.counterState.targetValue;
  const progressPercent =
    targetVal && targetVal > 0
      ? Math.min(100, Math.round((currentVal / targetVal) * 100))
      : undefined;

  return {
    projectId: params.projectId,
    projectName: params.projectName,
    partId: params.partId,
    partName: params.partName,
    counterId: params.counterId,
    counterName: params.counterName,
    currentValue: currentVal,
    targetValue: targetVal,
    progressPercent,
    activeReminder: params.counterState.activeReminder,
    reminderReason: params.reminderReason,
    lastUpdatedMs: Date.now(),
  };
}

export interface WatchInteractionInput {
  action: 'increment' | 'decrement' | 'crown_rotate';
  counterId: string;
  delta?: number;
  timestampMs?: number;
}

export interface WatchInteractionResult {
  action: 'increment' | 'decrement' | 'crown_rotate';
  counterId: string;
  source: DeviceSource;
  event: CounterEvent;
}

/**
 * Przetwarza interakcję z zegarka (tap +1, przycisk undo -1, Smart Stack) na zdarzenie domeny.
 */
export function handleWatchInteraction(input: WatchInteractionInput): WatchInteractionResult {
  const ts = input.timestampMs ?? Date.now();
  const isUndo = input.action === 'decrement';
  const delta = isUndo ? -1 : (input.delta ?? 1);

  const event: CounterEvent = {
    id: `wev_${ts}_${Math.random().toString(36).substring(2, 7)}`,
    counterId: input.counterId,
    type: isUndo ? 'UNDO' : 'INCREMENT',
    delta,
    source: 'apple_watch',
    timestampMs: ts,
  };

  return {
    action: input.action,
    counterId: input.counterId,
    source: 'apple_watch',
    event,
  };
}

export interface DigitalCrownResult {
  stepDelta: number;
  remainingAccumulator: number;
}

/**
 * Oblicza przesunięcie cyfrowej koronki (Digital Crown) z progiem czułości (BR-ZEG-003).
 */
export function processDigitalCrownDelta(
  currentAccumulator: number,
  delta: number,
  threshold: number = 1.0
): DigitalCrownResult {
  const total = currentAccumulator + delta;

  if (total >= threshold) {
    const stepDelta = Math.floor(total / threshold);
    const remainingAccumulator = total - stepDelta * threshold;
    return {
      stepDelta,
      remainingAccumulator,
    };
  } else if (total <= -threshold) {
    const stepDelta = -Math.floor(Math.abs(total) / threshold);
    const remainingAccumulator = total - stepDelta * threshold;
    return {
      stepDelta,
      remainingAccumulator,
    };
  }

  return {
    stepDelta: 0,
    remainingAccumulator: total,
  };
}

/**
 * Bufor zdarzeń generowanych na zegarku w trybie offline (gdy iPhone jest poza zasięgiem BLE).
 */
export class WatchOfflineQueue {
  private queue: WatchInteractionInput[] = [];

  enqueue(item: WatchInteractionInput): void {
    this.queue.push(item);
  }

  flush(): WatchInteractionInput[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  getPendingCount(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}

export interface OczkoLiveActivityAttributes {
  activityType: string;
  attributes: {
    projectId: string;
    projectName: string;
  };
  content: {
    state: {
      currentValue: number;
      targetValue?: number;
      progressPercent?: number;
      headline: string;
      activeReminder?: boolean;
      reminderReason?: string;
      lastUpdatedMs: number;
    };
  };
}

/**
 * Formatuje payload ActivityKit dla Live Activities i Dynamic Island (iOS 18 / watchOS 11, BR-ZEG-009).
 */
export function generateLiveActivityAttributes(
  snapshot: WatchCounterSnapshot
): OczkoLiveActivityAttributes {
  return {
    activityType: 'com.apps4brew.knitting.counter',
    attributes: {
      projectId: snapshot.projectId,
      projectName: snapshot.projectName,
    },
    content: {
      state: {
        currentValue: snapshot.currentValue,
        targetValue: snapshot.targetValue,
        progressPercent: snapshot.progressPercent,
        headline: `${snapshot.projectName} (${snapshot.partName})`,
        activeReminder: snapshot.activeReminder,
        reminderReason: snapshot.reminderReason,
        lastUpdatedMs: snapshot.lastUpdatedMs,
      },
    },
  };
}
