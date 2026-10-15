/**
 * Oczko Core — Testy synchronizacji z Apple Watch & Live Activities (DEC-03, BR-SYS-003, BR-ZEG-003, BR-ZEG-009)
 */

import {
  createWatchCounterSnapshot,
  handleWatchInteraction,
  WatchOfflineQueue,
  generateLiveActivityAttributes,
  processDigitalCrownDelta,
  WatchCounterSnapshot,
  WatchCounterStateInput,
} from '../apple-watch-service';

describe('Apple Watch & Live Activities Companion (DEC-03, BR-SYS-003, BR-ZEG-003, BR-ZEG-009)', () => {
  const MOCK_STATE: WatchCounterStateInput = {
    rawValue: 42,
    targetValue: 100,
    activeReminder: true,
    reminderRows: [42, 50],
    isGoalReached: false,
  };

  describe('createWatchCounterSnapshot', () => {
    it('tworzy poprawny zrzut stanu dla Apple Watch i Smart Stack', () => {
      const snapshot = createWatchCounterSnapshot({
        projectId: 'proj_sweter',
        projectName: 'Sweter Nord',
        partId: 'part_rekaw',
        partName: 'Rękaw lewy',
        counterId: 'counter_main',
        counterName: 'Rzędy reglanu',
        counterState: MOCK_STATE,
        reminderReason: '🔔 Zmiana koloru nitki',
      });

      expect(snapshot.projectId).toBe('proj_sweter');
      expect(snapshot.projectName).toBe('Sweter Nord');
      expect(snapshot.partName).toBe('Rękaw lewy');
      expect(snapshot.currentValue).toBe(42);
      expect(snapshot.targetValue).toBe(100);
      expect(snapshot.progressPercent).toBe(42);
      expect(snapshot.activeReminder).toBe(true);
      expect(snapshot.reminderReason).toBe('🔔 Zmiana koloru nitki');
      expect(snapshot.lastUpdatedMs).toBeGreaterThan(0);
    });

    it('obsługuje brak wartości docelowej (targetValue undefined)', () => {
      const snapshot = createWatchCounterSnapshot({
        projectId: 'proj_szal',
        projectName: 'Szalik',
        partId: 'part_main',
        partName: 'Główna',
        counterId: 'c1',
        counterName: 'Licznik',
        counterState: {
          rawValue: 15,
          activeReminder: false,
          isGoalReached: false,
          history: [],
        },
      });

      expect(snapshot.currentValue).toBe(15);
      expect(snapshot.targetValue).toBeUndefined();
      expect(snapshot.progressPercent).toBeUndefined();
    });
  });

  describe('handleWatchInteraction (BR-ZEG-003, BR-ZEG-009)', () => {
    it('obsługuje kliknięcie +1 (tap / Smart Stack widget)', () => {
      const result = handleWatchInteraction({
        action: 'increment',
        counterId: 'c1',
        timestampMs: 1700000000000,
      });

      expect(result.action).toBe('increment');
      expect(result.counterId).toBe('c1');
      expect(result.source).toBe('apple_watch');
      expect(result.event.type).toBe('INCREMENT');
      expect(result.event.delta).toBe(1);
      expect(result.event.source).toBe('apple_watch');
    });

    it('obsługuje kliknięcie cofnięcia -1 (undo)', () => {
      const result = handleWatchInteraction({
        action: 'decrement',
        counterId: 'c1',
        timestampMs: 1700000000000,
      });

      expect(result.action).toBe('decrement');
      expect(result.event.type).toBe('UNDO');
      expect(result.event.delta).toBe(-1);
    });
  });

  describe('processDigitalCrownDelta (BR-ZEG-003 Cyfrowa Koronka)', () => {
    it('detektuje krok w przód po przekroczeniu progu obrotu koronki', () => {
      // Obrót o +1.2 jednostki przekracza próg 1.0
      const crownResult = processDigitalCrownDelta(0, 1.2);
      expect(crownResult.stepDelta).toBe(1);
      expect(crownResult.remainingAccumulator).toBeCloseTo(0.2);

      // Mały obrót nie wywołuje jeszcze kroku
      const subThreshold = processDigitalCrownDelta(0, 0.4);
      expect(subThreshold.stepDelta).toBe(0);
      expect(subThreshold.remainingAccumulator).toBeCloseTo(0.4);
    });

    it('detektuje krok w tył przy obrocie w przeciwnym kierunku', () => {
      const crownBackward = processDigitalCrownDelta(0, -1.5);
      expect(crownBackward.stepDelta).toBe(-1);
      expect(crownBackward.remainingAccumulator).toBeCloseTo(-0.5);
    });
  });

  describe('WatchOfflineQueue (Buforowanie offline przy braku łączności)', () => {
    it('kolejkuje zdarzenia zegarka offline i umożliwia ich zrzut (flush) po powrocie do zasięgu', () => {
      const queue = new WatchOfflineQueue();
      expect(queue.getPendingCount()).toBe(0);

      queue.enqueue({
        action: 'increment',
        counterId: 'c1',
        timestampMs: 1000,
      });
      queue.enqueue({
        action: 'increment',
        counterId: 'c1',
        timestampMs: 2000,
      });

      expect(queue.getPendingCount()).toBe(2);

      const flushed = queue.flush();
      expect(flushed.length).toBe(2);
      expect(queue.getPendingCount()).toBe(0);
      expect(flushed[0].timestampMs).toBe(1000);
      expect(flushed[1].timestampMs).toBe(2000);
    });
  });

  describe('generateLiveActivityAttributes (ActivityKit / iOS 18 / watchOS 11)', () => {
    it('generuje strukturę dynamicznego powiadomienia Dynamic Island i Smart Stack', () => {
      const snapshot: WatchCounterSnapshot = {
        projectId: 'p1',
        projectName: 'Czapka Beanie',
        partId: 'part_otok',
        partName: 'Ściągacz',
        counterId: 'c1',
        counterName: 'Rzędy',
        currentValue: 12,
        targetValue: 24,
        progressPercent: 50,
        activeReminder: false,
        lastUpdatedMs: 1700000000000,
      };

      const activity = generateLiveActivityAttributes(snapshot);

      expect(activity.activityType).toBe('com.apps4brew.knitting.counter');
      expect(activity.content.state.currentValue).toBe(12);
      expect(activity.content.state.progressPercent).toBe(50);
      expect(activity.content.state.headline).toBe('Czapka Beanie (Ściągacz)');
      expect(activity.attributes.projectName).toBe('Czapka Beanie');
    });
  });
});
