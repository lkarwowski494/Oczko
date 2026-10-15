import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { NeedleGaugeModal } from '../NeedleGaugeModal';

describe('NeedleGaugeModal (Komponent UI Miarki Drutów i Jednostek)', () => {
  test('renderuje zakładkę rozmiarów drutów i pozwala wybrać rozmiar', () => {
    const handleClose = jest.fn();
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <NeedleGaugeModal
          visible={true}
          onClose={handleClose}
          initialMetricMm={4.0}
        />
      );
    });

    const instance = root!.root;

    // Tytuł
    expect(instance.findByProps({ children: 'Miarka Drutów i Jednostek' })).toBeTruthy();
    expect(instance.findAllByProps({ children: '4.0 mm' }).length).toBeGreaterThanOrEqual(1);

    // Wybór innego rozmiaru z listy (np. 5.0 mm)
    const row5mm = instance.findByProps({ accessibilityLabel: 'Wybierz rozmiar 5.0 mm' });
    act(() => {
      row5mm.props.onPress();
    });

    expect(instance.findAllByProps({ children: '5.0 mm' }).length).toBeGreaterThanOrEqual(1);

    // Kliknięcie w aktywną zakładkę drutów ponownie (linia 84)
    const needlesTab = instance.findByProps({ accessibilityLabel: 'Zakładka rozmiary drutów' });
    act(() => {
      needlesTab.props.onPress();
    });

    // Zamknięcie
    const closeBtn = instance.findByProps({ accessibilityLabel: 'Zamknij miarkę drutów' });
    act(() => {
      closeBtn.props.onPress();
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('obsługuje zakładkę przelicznika jednostek i wprowadzanie wartości', () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <NeedleGaugeModal
          visible={true}
          onClose={jest.fn()}
        />
      );
    });

    const instance = root!.root;

    // Przełączenie na zakładkę jednostek
    const unitsTab = instance.findByProps({ accessibilityLabel: 'Zakładka przelicznik miar' });
    act(() => {
      unitsTab.props.onPress();
    });

    // Zmiana metrów na 200 m
    const metersInput = instance.findByProps({ accessibilityLabel: 'Wartość w metrach' });
    act(() => {
      metersInput.props.onChangeText('200');
    });
    expect(instance.findByProps({ children: '218.72 yd' })).toBeTruthy();

    // Zmiana gramów na 50 g
    const gramsInput = instance.findByProps({ accessibilityLabel: 'Wartość w gramach' });
    act(() => {
      gramsInput.props.onChangeText('50');
    });
    expect(instance.findByProps({ children: '1.76 oz' })).toBeTruthy();

    // Zmiana gęstości próbki na 22 o.
    const tensionInput = instance.findByProps({ accessibilityLabel: 'Oczka na 10 cm' });
    act(() => {
      tensionInput.props.onChangeText('22');
    });
    expect(instance.findByProps({ children: '22.4 o.' })).toBeTruthy();

    // Test wpisania pustego ciągu do pól konwertera (fallback do 0)
    act(() => {
      metersInput.props.onChangeText('');
      gramsInput.props.onChangeText('');
      tensionInput.props.onChangeText('');
    });
    expect(instance.findByProps({ children: '0 yd' })).toBeTruthy();
    expect(instance.findByProps({ children: '0 oz' })).toBeTruthy();
    expect(instance.findByProps({ children: '0 o.' })).toBeTruthy();

    // Powrót do zakładki drutów
    const needlesTab = instance.findByProps({ accessibilityLabel: 'Zakładka rozmiary drutów' });
    act(() => {
      needlesTab.props.onPress();
    });
    expect(instance.findByProps({ children: 'WYBRANY ROZMIAR DRUTU / SZYDEŁKA' })).toBeTruthy();
  });
});
