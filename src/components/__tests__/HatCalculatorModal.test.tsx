import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Share, TouchableOpacity, Text } from 'react-native';
import { HatCalculatorModal } from '../HatCalculatorModal';

jest.spyOn(Share, 'share').mockImplementation(jest.fn().mockResolvedValue({ action: 'sharedAction' }));

describe('HatCalculatorModal (src/components/HatCalculatorModal.tsx)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and switches tabs', () => {
    const onClose = jest.fn();
    let component: renderer.ReactTestRenderer;

    act(() => {
      component = renderer.create(
        <HatCalculatorModal visible={true} onClose={onClose} />
      );
    });

    const root = component!.root;
    expect(root.findByProps({ children: '🧢 Kalkulator Czapki' })).toBeTruthy();

    // Check tab switching to crown
    const crownTabBtn = root.findByProps({ accessibilityLabel: 'Zakładka Korona i Rozpiska' });
    act(() => {
      crownTabBtn.props.onPress();
    });

    expect(root.findByProps({ children: '📐 Podział pionowy czapki:' })).toBeTruthy();

    // Switch back to fit tab
    const fitTabBtn = root.findByProps({ accessibilityLabel: 'Zakładka Wymiary i Ściągacz' });
    act(() => {
      fitTabBtn.props.onPress();
    });

    expect(root.findByProps({ children: 'Standardowe obwody głowy (CYC):' })).toBeTruthy();
  });

  it('selects standard size presets and adjusts steppers', () => {
    const onClose = jest.fn();
    let component: renderer.ReactTestRenderer;

    act(() => {
      component = renderer.create(
        <HatCalculatorModal visible={true} onClose={onClose} />
      );
    });

    const root = component!.root;

    // Select toddler size preset
    const toddlerChip = root.findByProps({
      accessibilityLabel: 'Wybierz rozmiar Maluch (1-3 lata), obwód 44 cm',
    });
    act(() => {
      toddlerChip.props.onPress();
    });

    // Check stepper buttons
    const incCircBtn = root.findByProps({ accessibilityLabel: 'Zwiększ obwód głowy o 1 cm' });
    const decCircBtn = root.findByProps({ accessibilityLabel: 'Zmniejsz obwód głowy o 1 cm' });
    act(() => {
      incCircBtn.props.onPress();
    });
    act(() => {
      decCircBtn.props.onPress();
    });

    // Negative ease steppers
    const incEaseBtn = root.findByProps({ accessibilityLabel: 'Zwiększ luz ujemny o 1 cm' });
    const decEaseBtn = root.findByProps({ accessibilityLabel: 'Zmniejsz luz ujemny o 1 cm' });
    act(() => {
      incEaseBtn.props.onPress();
    });
    act(() => {
      decEaseBtn.props.onPress();
    });

    // Gauge steppers
    const incStBtn = root.findByProps({ accessibilityLabel: 'Dodaj 1 oczko próbki' });
    const decStBtn = root.findByProps({ accessibilityLabel: 'Odejmij 1 oczko próbki' });
    act(() => {
      incStBtn.props.onPress();
    });
    act(() => {
      decStBtn.props.onPress();
    });

    const incRowBtn = root.findByProps({ accessibilityLabel: 'Dodaj 1 rząd próbki' });
    const decRowBtn = root.findByProps({ accessibilityLabel: 'Odejmij 1 rząd próbki' });
    act(() => {
      incRowBtn.props.onPress();
    });
    act(() => {
      decRowBtn.props.onPress();
    });

    // Brim style toggles
    const foldedBrimBtn = root.findByProps({ accessibilityLabel: 'Wywijany ściągacz' });
    const singleBrimBtn = root.findByProps({ accessibilityLabel: 'Pojedynczy ściągacz' });
    act(() => {
      foldedBrimBtn.props.onPress();
    });
    act(() => {
      singleBrimBtn.props.onPress();
    });

    // Fit style toggles
    const slouchyBtn = root.findByProps({ accessibilityLabel: 'Opadający slouchy' });
    const beanieBtn = root.findByProps({ accessibilityLabel: 'Klasyczny dopasowany beanie' });
    act(() => {
      slouchyBtn.props.onPress();
    });
    act(() => {
      beanieBtn.props.onPress();
    });
  });

  it('changes wedge count in crown tab and triggers share', async () => {
    const onClose = jest.fn();
    let component: renderer.ReactTestRenderer;

    act(() => {
      component = renderer.create(
        <HatCalculatorModal visible={true} onClose={onClose} />
      );
    });

    const root = component!.root;

    // Switch to crown tab
    const crownTabBtn = root.findByProps({ accessibilityLabel: 'Zakładka Korona i Rozpiska' });
    act(() => {
      crownTabBtn.props.onPress();
    });

    // Toggle wedges to 4 and 8
    const wedge4Btn = root.findByProps({ accessibilityLabel: '4 klinów korony' });
    const wedge8Btn = root.findByProps({ accessibilityLabel: '8 klinów korony' });
    act(() => {
      wedge4Btn.props.onPress();
    });
    act(() => {
      wedge8Btn.props.onPress();
    });

    // Share button
    const shareBtn = root.findByProps({ accessibilityLabel: 'Udostępnij wzór i rozpiskę czapki' });
    await act(async () => {
      await shareBtn.props.onPress();
    });

    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Rozpiska Korony Czapki'),
      })
    );
  });

  it('triggers onClose when close button is pressed', () => {
    const onClose = jest.fn();
    let component: renderer.ReactTestRenderer;

    act(() => {
      component = renderer.create(
        <HatCalculatorModal visible={true} onClose={onClose} />
      );
    });

    const root = component!.root;
    const closeBtn = root.findByProps({ accessibilityLabel: 'Zamknij kalkulator czapki' });
    act(() => {
      closeBtn.props.onPress();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
