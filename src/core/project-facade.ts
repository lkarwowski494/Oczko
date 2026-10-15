/**
 * Oczko Core — Fasada projektu (Orkiestrator spajający logikę, liczniki i reguły)
 */

import { CounterConfig, CounterEvent, DeviceSource, computeCounterState, recordCounterStep, createUndoEvent } from './counter-engine';
import { calculateFromGauge, evaluateGarmentEase } from './domain-rules';
import { parseRowInstruction } from './pattern-parser';

export interface ProjectManagerContext {
  projectId: string;
  projectName: string;
  counters: Map<string, CounterConfig>;
  events: CounterEvent[];
}

export class ProjectManagerFacade {
  private context: ProjectManagerContext;

  constructor(projectId: string, projectName: string) {
    this.context = {
      projectId,
      projectName,
      counters: new Map(),
      events: [],
    };
  }

  public registerCounter(config: CounterConfig): void {
    this.context.counters.set(config.id, config);
  }

  public loadExistingEvents(events: CounterEvent[]): void {
    this.context.events = [...events];
  }

  public getLastEventTimestamp(counterId: string): number | undefined {
    const counterEvents = this.context.events.filter((e) => e.counterId === counterId);
    if (counterEvents.length === 0) return undefined;
    return Math.max(...counterEvents.map((e) => e.timestampMs));
  }

  public stepCounter(
    counterId: string,
    direction: 'increment' | 'decrement',
    source: DeviceSource,
    timestampMs: number,
    debounceThresholdMs: number = 0
  ): CounterEvent[] {
    const config = this.context.counters.get(counterId);
    if (!config) throw new Error(`Nie znalezniono licznika o ID: ${counterId}`);

    const lastTimestamp = this.getLastEventTimestamp(counterId);
    const linkedConfigs = Array.from(this.context.counters.values());
    const newEvents = recordCounterStep({
      primaryConfig: config,
      linkedConfigs,
      direction,
      source,
      timestampMs,
      lastEventTimestampMs: lastTimestamp,
      debounceThresholdMs,
    });

    if (newEvents.length > 0) {
      this.context.events.push(...newEvents);
    }
    return newEvents;
  }

  public createAndApplyUndo(
    counterId: string,
    source: DeviceSource,
    timestampMs: number
  ): CounterEvent | null {
    const undoEvent = createUndoEvent({
      counterId,
      events: this.context.events,
      source,
      timestampMs,
    });

    if (undoEvent) {
      this.context.events.push(undoEvent);
      return undoEvent;
    }
    return null;
  }

  public undoLast(counterId: string, source: DeviceSource, timestampMs: number): boolean {
    return this.createAndApplyUndo(counterId, source, timestampMs) !== null;
  }

  public getCounterState(counterId: string) {
    const config = this.context.counters.get(counterId);
    if (!config) throw new Error(`Nie znalezniono licznika o ID: ${counterId}`);
    return computeCounterState(config, this.context.events);
  }

  public evaluateDesign(swatchCount: number, swatchLengthCm: number, targetWidthCm: number, bodyCm: number, garmentCm: number) {
    const gaugeRes = calculateFromGauge({ count: swatchCount, length: swatchLengthCm, unit: 'cm' }, targetWidthCm, 'cm');
    const easeRes = evaluateGarmentEase(bodyCm, garmentCm);
    return {
      gaugeRes,
      easeRes,
    };
  }

  public parseInstructionLine(text: string) {
    return parseRowInstruction(text);
  }
}
