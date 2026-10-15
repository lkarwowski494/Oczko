/**
 * Oczko Core — Fasada projektu (Orkiestrator spajający logikę, liczniki i reguły)
 */

import { CounterConfig, CounterEvent, computeCounterState, recordCounterStep, createUndoEvent } from './counter-engine';
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

  public stepCounter(counterId: string, direction: 'increment' | 'decrement', source: 'iphone' | 'apple_watch' | 'garmin', timestampMs: number): void {
    const config = this.context.counters.get(counterId);
    if (!config) throw new Error(`Nie znalezniono licznika o ID: ${counterId}`);

    const linkedConfigs = Array.from(this.context.counters.values());
    const newEvents = recordCounterStep({
      primaryConfig: config,
      linkedConfigs,
      direction,
      source,
      timestampMs,
    });

    this.context.events.push(...newEvents);
  }

  public undoLast(counterId: string, source: 'iphone' | 'apple_watch' | 'garmin', timestampMs: number): boolean {
    const undoEvent = createUndoEvent({
      counterId,
      events: this.context.events,
      source,
      timestampMs,
    });

    if (undoEvent) {
      this.context.events.push(undoEvent);
      return true;
    }
    return false;
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
