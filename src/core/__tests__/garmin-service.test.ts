import {
  GARMIN_COMM_UUID,
  createGarminSyncPayload,
  serializeGarminEnvelope,
  deserializeGarminEnvelope,
  handleGarminWatchEvent,
  GarminOfflineQueue,
  GarminWatchEvent,
} from '../garmin-service';

describe('Prototyp Protokołu Garmin ConnectIQ Mobile SDK Bridge (DEC-02)', () => {
  describe('createGarminSyncPayload', () => {
    test('tworzy poprawny ładunek synchronizacji z domyślnymi wartościami', () => {
      const payload = createGarminSyncPayload({
        counterId: 'cnt_123',
        projectName: 'Czapka Zimowa Merinowa',
        partName: 'Ściągacz 2x2',
        currentCount: 14,
        targetCount: 40,
      });

      expect(payload.counterId).toBe('cnt_123');
      expect(payload.projectName).toBe('Czapka Zimowa Merinowa');
      expect(payload.partName).toBe('Ściągacz 2x2');
      expect(payload.currentCount).toBe(14);
      expect(payload.targetCount).toBe(40);
      expect(payload.unitLabel).toBe('rząd');
      expect(payload.isCompleted).toBe(false);
      expect(payload.timestamp).toBeGreaterThan(0);
    });

    test('obsługuje opcjonalne pola warkocza/cyklu oraz flagę ukończenia', () => {
      const payload = createGarminSyncPayload({
        counterId: 'cnt_999',
        projectName: 'Długi Sweter z Warkoczami Oversize',
        partName: 'Korpus Przód i Tył Razem',
        currentCount: 100,
        targetCount: 100,
        unitLabel: 'okrążenie',
        linkedPatternName: 'Warkocz C6F z Przeplotem',
        linkedPatternCycle: 8,
        linkedPatternStep: 4,
        timestamp: 1700000000000,
      });

      expect(payload.isCompleted).toBe(true);
      expect(payload.unitLabel).toBe('okrążenie');
      expect(payload.linkedPatternName).toBe('Warkocz C6F z Przeplotem');
      expect(payload.linkedPatternCycle).toBe(8);
      expect(payload.linkedPatternStep).toBe(4);
      expect(payload.timestamp).toBe(1700000000000);
      // Przycinanie długich nazw
      expect(payload.projectName.length).toBeLessThanOrEqual(32);
      expect(payload.partName.length).toBeLessThanOrEqual(24);
    });

    test('zabezpiecza wartości ujemne', () => {
      const payload = createGarminSyncPayload({
        counterId: 'c1',
        projectName: 'Test',
        partName: 'P1',
        currentCount: -10,
        targetCount: -20,
      });
      expect(payload.currentCount).toBe(0);
      expect(payload.targetCount).toBe(0);
      expect(payload.isCompleted).toBe(false);
    });
  });

  describe('serializeGarminEnvelope & deserializeGarminEnvelope', () => {
    test('poprawnie serializuje i deserializuje kopertę wiadomości ConnectIQ', () => {
      const rawJson = serializeGarminEnvelope('SYNC_STATE', { test: 123 }, 42);
      expect(rawJson).toContain(GARMIN_COMM_UUID);
      expect(rawJson).toContain('"seqId":42');

      const result = deserializeGarminEnvelope<{ test: number }>(rawJson);
      expect(result.valid).toBe(true);
      expect(result.envelope?.appUuid).toBe(GARMIN_COMM_UUID);
      expect(result.envelope?.type).toBe('SYNC_STATE');
      expect(result.envelope?.payload.test).toBe(123);
    });

    test('odrzuca puste dane i niebędące stringiem', () => {
      const r1 = deserializeGarminEnvelope('');
      expect(r1.valid).toBe(false);
      expect(r1.error).toBe('EMPTY_PAYLOAD');

      const r2 = deserializeGarminEnvelope(null as any);
      expect(r2.valid).toBe(false);
      expect(r2.error).toBe('EMPTY_PAYLOAD');
    });

    test('odrzuca JSON niebędący obiektem', () => {
      const r = deserializeGarminEnvelope('12345');
      expect(r.valid).toBe(false);
      expect(r.error).toBe('NOT_AN_OBJECT');
    });

    test('odrzuca kopertę z nieznanym appUuid', () => {
      const fakeJson = JSON.stringify({
        appUuid: 'obce-uuid-12345',
        type: 'WATCH_EVENT',
        payload: {},
      });
      const r = deserializeGarminEnvelope(fakeJson);
      expect(r.valid).toBe(false);
      expect(r.error).toBe('INVALID_APP_UUID');
    });

    test('odrzuca kopertę bez pola type', () => {
      const noTypeJson = JSON.stringify({
        appUuid: GARMIN_COMM_UUID,
        payload: {},
      });
      const r = deserializeGarminEnvelope(noTypeJson);
      expect(r.valid).toBe(false);
      expect(r.error).toBe('MISSING_MESSAGE_TYPE');
    });

    test('obsługuje błędy składni JSON', () => {
      const r = deserializeGarminEnvelope('{ uszkodzony json');
      expect(r.valid).toBe(false);
      expect(r.error).toContain('JSON_SYNTAX_ERROR');
    });
  });

  describe('handleGarminWatchEvent', () => {
    const createEvent = (button: any): GarminWatchEvent => ({
      eventId: 'evt_1',
      source: 'garmin_connectiq',
      button,
      counterId: 'c1',
      timestamp: Date.now(),
    });

    test('obsługuje KEY_START_STOP i TOUCH_TAP jako inkrementację', () => {
      const onInc = jest.fn();
      const onDec = jest.fn();

      const r1 = handleGarminWatchEvent(createEvent('KEY_START_STOP'), {
        onIncrement: onInc,
        onDecrement: onDec,
      });
      expect(r1.handled).toBe(true);
      expect(r1.actionName).toBe('INCREMENT');
      expect(onInc).toHaveBeenCalledTimes(1);

      const r2 = handleGarminWatchEvent(createEvent('TOUCH_TAP'), {
        onIncrement: onInc,
        onDecrement: onDec,
      });
      expect(r2.handled).toBe(true);
      expect(onInc).toHaveBeenCalledTimes(2);
    });

    test('obsługuje KEY_LAP jako cofnięcie UNDO', () => {
      const onInc = jest.fn();
      const onDec = jest.fn();

      const r = handleGarminWatchEvent(createEvent('KEY_LAP'), {
        onIncrement: onInc,
        onDecrement: onDec,
      });
      expect(r.handled).toBe(true);
      expect(r.actionName).toBe('DECREMENT_UNDO');
      expect(onDec).toHaveBeenCalledTimes(1);
    });

    test('obsługuje KEY_DOWN oraz KEY_UP z przekazanymi akcjami części', () => {
      const onNext = jest.fn();
      const onPrev = jest.fn();

      const rDown = handleGarminWatchEvent(createEvent('KEY_DOWN'), {
        onIncrement: jest.fn(),
        onDecrement: jest.fn(),
        onNextPart: onNext,
      });
      expect(rDown.handled).toBe(true);
      expect(rDown.actionName).toBe('NEXT_PART');
      expect(onNext).toHaveBeenCalledTimes(1);

      const rUp = handleGarminWatchEvent(createEvent('KEY_UP'), {
        onIncrement: jest.fn(),
        onDecrement: jest.fn(),
        onPreviousPart: onPrev,
      });
      expect(rUp.handled).toBe(true);
      expect(rUp.actionName).toBe('PREVIOUS_PART');
      expect(onPrev).toHaveBeenCalledTimes(1);
    });

    test('ignoruje KEY_DOWN / KEY_UP gdy brak handlerów części', () => {
      const rDown = handleGarminWatchEvent(createEvent('KEY_DOWN'), {
        onIncrement: jest.fn(),
        onDecrement: jest.fn(),
      });
      expect(rDown.handled).toBe(false);
      expect(rDown.actionName).toBe('IGNORED_NEXT_PART');

      const rUp = handleGarminWatchEvent(createEvent('KEY_UP'), {
        onIncrement: jest.fn(),
        onDecrement: jest.fn(),
      });
      expect(rUp.handled).toBe(false);
      expect(rUp.actionName).toBe('IGNORED_PREVIOUS_PART');
    });

    test('obsługuje nieznany przycisk oraz brakujące handlery increment / decrement', () => {
      const r = handleGarminWatchEvent(createEvent('KEY_POWER' as any), {
        onIncrement: jest.fn(),
        onDecrement: jest.fn(),
      });
      expect(r.handled).toBe(false);
      expect(r.actionName).toBe('UNKNOWN_BUTTON');

      const rInc = handleGarminWatchEvent(createEvent('KEY_START_STOP'), {});
      expect(rInc.handled).toBe(false);
      expect(rInc.actionName).toBe('IGNORED_INCREMENT');

      const rLap = handleGarminWatchEvent(createEvent('KEY_LAP'), {});
      expect(rLap.handled).toBe(false);
      expect(rLap.actionName).toBe('IGNORED_DECREMENT');
    });
  });

  describe('GarminOfflineQueue', () => {
    test('kolejkuje zdarzenia i opróżnia bufor', () => {
      const queue = new GarminOfflineQueue(3);
      expect(queue.size()).toBe(0);

      const e1: GarminWatchEvent = {
        eventId: 'e1',
        source: 'garmin_connectiq',
        button: 'KEY_START_STOP',
        counterId: 'c1',
        timestamp: 1000,
      };
      const e2: GarminWatchEvent = {
        eventId: 'e2',
        source: 'garmin_connectiq',
        button: 'KEY_LAP',
        counterId: 'c1',
        timestamp: 1001,
      };

      expect(queue.enqueue(e1)).toBe(true);
      expect(queue.enqueue(e2)).toBe(true);
      expect(queue.size()).toBe(2);

      const flushed = queue.flush();
      expect(flushed).toHaveLength(2);
      expect(flushed[0].eventId).toBe('e1');
      expect(queue.size()).toBe(0);
    });

    test('odrzuca zdarzenia po osiągnięciu maksymalnej pojemności', () => {
      const queue = new GarminOfflineQueue(2);
      const e: GarminWatchEvent = {
        eventId: 'e',
        source: 'garmin_connectiq',
        button: 'KEY_START_STOP',
        counterId: 'c1',
        timestamp: 1000,
      };

      expect(queue.enqueue(e)).toBe(true);
      expect(queue.enqueue(e)).toBe(true);
      expect(queue.enqueue(e)).toBe(false); // pełna kolejka
      expect(queue.size()).toBe(2);

      queue.clear();
      expect(queue.size()).toBe(0);
    });
  });
});
