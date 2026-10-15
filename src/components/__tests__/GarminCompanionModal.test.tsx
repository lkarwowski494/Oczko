import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { GarminCompanionModal } from '../GarminCompanionModal';
import { createGarminSyncPayload } from '../../core/garmin-service';

describe('GarminCompanionModal (Komponent UI Symulatora Garmin)', () => {
  const mockPayload = createGarminSyncPayload({
    counterId: 'c_test',
    projectName: 'Czapka Wełniana',
    partName: 'Otok',
    currentCount: 15,
    targetCount: 40,
    linkedPatternName: 'Warkocz C6F',
    linkedPatternCycle: 6,
    linkedPatternStep: 3,
  });

  test('renderuje tarczę zegarka i obsługuje naciśnięcia przycisków online', () => {
    const handleInc = jest.fn();
    const handleDec = jest.fn();
    const handleNext = jest.fn();
    const handlePrev = jest.fn();
    const handleClose = jest.fn();

    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <GarminCompanionModal
          visible={true}
          onClose={handleClose}
          syncPayload={mockPayload}
          onIncrement={handleInc}
          onDecrement={handleDec}
          onNextPart={handleNext}
          onPreviousPart={handlePrev}
        />
      );
    });

    const instance = root!.root;

    // Nagłówek i tytul
    expect(instance.findByProps({ children: 'Garmin ConnectIQ' })).toBeTruthy();
    expect(instance.findByProps({ children: 'Czapka Wełniana' })).toBeTruthy();

    // Zmiana modelu na Fenix 7
    const fenixBtn = instance.findByProps({ accessibilityLabel: 'Wybierz model Garmin Fēnix 7 Solar' });
    act(() => {
      fenixBtn.props.onPress();
    });

    // Przycisk START (+1)
    const startBtn = instance.findByProps({ accessibilityLabel: 'Przycisk START STOP zegarka Garmin (+1 rząd)' });
    act(() => {
      startBtn.props.onPress();
    });
    expect(handleInc).toHaveBeenCalledTimes(1);

    // Przycisk BACK (-1)
    const lapBtn = instance.findByProps({ accessibilityLabel: 'Przycisk LAP BACK zegarka Garmin (Cofnij)' });
    act(() => {
      lapBtn.props.onPress();
    });
    expect(handleDec).toHaveBeenCalledTimes(1);

    // Przycisk UP i DOWN
    const upBtn = instance.findByProps({ accessibilityLabel: 'Przycisk UP zegarka Garmin' });
    const downBtn = instance.findByProps({ accessibilityLabel: 'Przycisk DOWN zegarka Garmin' });
    act(() => {
      upBtn.props.onPress();
      downBtn.props.onPress();
    });
    expect(handlePrev).toHaveBeenCalledTimes(1);
    expect(handleNext).toHaveBeenCalledTimes(1);

    // Stuknięcie w ekran
    const dial = instance.findByProps({ accessibilityLabel: 'Dotknij ekran zegarka Garmin aby naliczyć rząd' });
    act(() => {
      dial.props.onPress();
    });
    expect(handleInc).toHaveBeenCalledTimes(2);

    // Zamknięcie modala
    const closeBtn = instance.findByProps({ accessibilityLabel: 'Zamknij symulator Garmin' });
    act(() => {
      closeBtn.props.onPress();
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('obsługuje tryb offline i kolejkowanie zdarzeń', () => {
    const handleInc = jest.fn();
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <GarminCompanionModal
          visible={true}
          onClose={jest.fn()}
          syncPayload={mockPayload}
          onIncrement={handleInc}
          onDecrement={jest.fn()}
        />
      );
    });

    const instance = root!.root;

    // Przełącz w tryb offline
    const toggleOffline = instance.findByProps({ accessibilityLabel: 'Przełącz tryb offline Garmin' });
    act(() => {
      toggleOffline.props.onPress();
    });

    // Kliknij START w trybie offline (powinno trafić do bufora, a nie do handleInc)
    const startBtn = instance.findByProps({ accessibilityLabel: 'Przycisk START STOP zegarka Garmin (+1 rząd)' });
    act(() => {
      startBtn.props.onPress();
      startBtn.props.onPress();
    });
    expect(handleInc).not.toHaveBeenCalled();

    // Sprawdź przycisk wysyłki zbuforowanych zdarzeń
    const flushBtn = instance.findByProps({ accessibilityLabel: 'Zsynchronizuj zdarzenia z kolejki offline' });
    expect(flushBtn).toBeTruthy();

    act(() => {
      flushBtn.props.onPress();
    });
    expect(handleInc).toHaveBeenCalledTimes(2);
  });
});
