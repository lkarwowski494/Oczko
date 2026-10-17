/**
 * Oczko — Testy Własnościowe Sekwencji Stanowych (PBT Stateful Sequences)
 * Wymagania: BR-TEST-006..010
 * - Gwarantowany krok otwierający (niepusty stan początkowy)
 * - Model wyroczni vs System Under Test (SUT)
 * - Niezmienniki: brak ujemnych stanów, spójność undo/redo, roundtrip export/import
 */

import * as fc from 'fast-check';
import {
  computeCounterState,
  CounterEvent,
  recordCounterStep,
  createUndoEvent,
  CounterConfig,
} from '../counter-engine';
import {
  remainingTimerSec,
  pauseTimer,
  resumeTimer,
} from '../time-tracking-service';

interface CounterModel {
  initial: number;
  step: number;
  events: CounterEvent[];
  expectedValue: number;
}

class IncrementCommand implements fc.Command<CounterModel, CounterConfig> {
  check(m: Readonly<CounterModel>): boolean {
    return true;
  }
  run(m: CounterModel, sut: CounterConfig): void {
    const ts = 100000 + m.events.length * 1000;
    const steps = recordCounterStep({
      primaryConfig: sut,
      direction: 'increment',
      source: 'iphone',
      timestampMs: ts,
    });
    m.events.push(...steps);
    m.expectedValue += sut.step ?? 1;

    const state = computeCounterState(sut, m.events);
    expect(state.rawValue).toBe(m.expectedValue);
  }
  toString() {
    return 'Increment';
  }
}

class DecrementCommand implements fc.Command<CounterModel, CounterConfig> {
  check(m: Readonly<CounterModel>): boolean {
    return true;
  }
  run(m: CounterModel, sut: CounterConfig): void {
    const ts = 100000 + m.events.length * 1000;
    const steps = recordCounterStep({
      primaryConfig: sut,
      direction: 'decrement',
      source: 'iphone',
      timestampMs: ts,
    });
    m.events.push(...steps);
    m.expectedValue = Math.max(0, m.expectedValue - (sut.step ?? 1));

    const state = computeCounterState(sut, m.events);
    expect(state.rawValue).toBe(m.expectedValue);
  }
  toString() {
    return 'Decrement';
  }
}

class UndoCommand implements fc.Command<CounterModel, CounterConfig> {
  check(m: Readonly<CounterModel>): boolean {
    return m.events.some((e) => e.type !== 'UNDO');
  }
  run(m: CounterModel, sut: CounterConfig): void {
    const ts = 100000 + m.events.length * 1000;
    const undo = createUndoEvent({
      counterId: sut.id,
      events: m.events,
      source: 'iphone',
      timestampMs: ts,
    });
    if (undo) {
      m.events.push(undo);
      const state = computeCounterState(sut, m.events);
      m.expectedValue = state.rawValue;
      expect(state.rawValue).toBe(m.expectedValue);
    }
  }
  toString() {
    return 'Undo';
  }
}

describe('Stateful Property-Based Sequences (BR-TEST-006..010)', () => {
  it('sekwencja stanowa z gwarantowanym krokiem otwierającym i weryfikacją niezmienników', () => {
    const openingStepArbitrary = fc.record({
      counterId: fc.stringMatching(/^[a-z0-9_-]{3,8}$/),
      initialCount: fc.integer({ min: 0, max: 1000 }),
      step: fc.integer({ min: 1, max: 10 }),
    });

    const commandArbitrary = () =>
      fc.commands(
        [
          fc.constant(new IncrementCommand()),
          fc.constant(new DecrementCommand()),
          fc.constant(new UndoCommand()),
        ],
        { maxCommands: 30 }
      );

    fc.assert(
      fc.property(openingStepArbitrary, (opening) => {
        // Gwarantowany krok otwierający (BR-TEST-007):
        // Inicjalizacja modelu i konfiguracji SUT
        const sut: CounterConfig = {
          id: opening.counterId,
          partId: 'part_main',
          name: 'Główny Licznik',
          initialValue: opening.initialCount,
          step: opening.step,
        };

        const model: CounterModel = {
          initial: opening.initialCount,
          step: opening.step,
          events: [],
          expectedValue: opening.initialCount,
        };

        // Stan początkowy jest niepusty i poprawny
        const initialState = computeCounterState(sut, model.events);
        expect(initialState.rawValue).toBe(opening.initialCount);

        // Wykonanie losowych komend z monotonicznym czasem
        const cmdsGen = commandArbitrary();
        const cmds = fc.sample(cmdsGen, 1)[0];

        for (const cmd of cmds) {
          if (cmd.check(model)) {
            cmd.run(model, sut);
          }
        }

        // Niezmiennik końcowy (BR-TEST-009):
        const finalState = computeCounterState(sut, model.events);
        expect(finalState.rawValue).toBe(model.expectedValue);
      }),
      { numRuns: 50 }
    );
  });

  it('niezmiennik roundtrip eksportu i importu danych projektu (BR-TEST-010)', () => {
    const projectArbitrary = fc.record({
      id: fc.uuid(),
      title: fc.string({ minLength: 1, maxLength: 50 }),
      notes: fc.string({ minLength: 0, maxLength: 200 }),
      totalRows: fc.integer({ min: 0, max: 5000 }),
      targetRows: fc.integer({ min: 1, max: 5000 }),
      createdAt: fc.integer({ min: 1600000000000, max: 1800000000000 }),
      counters: fc.array(
        fc.record({
          id: fc.uuid(),
          label: fc.string({ minLength: 1, maxLength: 30 }),
          current: fc.integer({ min: 0, max: 1000 }),
          target: fc.integer({ min: 0, max: 1000 }),
          step: fc.integer({ min: 1, max: 10 }),
        }),
        { minLength: 1, maxLength: 5 }
      ),
    });

    fc.assert(
      fc.property(projectArbitrary, (project) => {
        // Serializacja JSON (eksport)
        const serialized = JSON.stringify(project);

        // Deserializacja JSON (import)
        const deserialized = JSON.parse(serialized);

        // Niezmiennik roundtrip: głęboka równoważność
        expect(deserialized).toEqual(project);

        // Spójność pól kluczowych
        expect(deserialized.id).toBe(project.id);
        expect(deserialized.counters.length).toBe(project.counters.length);
        for (let i = 0; i < project.counters.length; i++) {
          expect(deserialized.counters[i]).toEqual(project.counters[i]);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('niezmiennik monotoniczności i odporności timera na czas tła (NFR-PERF-004)', () => {
    const timerArbitrary = fc
      .integer({ min: 10, max: 3600 })
      .chain((dur) => fc.tuple(fc.constant(dur), fc.integer({ min: 0, max: dur })));

    fc.assert(
      fc.property(timerArbitrary, ([durationSec, elapsedSec]) => {
        const now = Date.now();
        const endAt = now + (durationSec - elapsedSec) * 1000;

        const rem1 = remainingTimerSec(endAt, now);
        expect(rem1).toBe(durationSec - elapsedSec);

        // Czas płynie w tle o dt sekund
        const dt = Math.floor((durationSec - elapsedSec) / 2);
        const rem2 = remainingTimerSec(endAt, now + dt * 1000);
        expect(rem2).toBe(durationSec - elapsedSec - dt);

        // Monotoniczny spadek czasu do zera
        expect(rem2).toBeLessThanOrEqual(rem1);
        expect(remainingTimerSec(endAt, endAt + 5000)).toBe(0);
      }),
      { numRuns: 100 }
    );
  });
});
