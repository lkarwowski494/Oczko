import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Share } from 'react-native';
import { EaseCalculatorModal } from '../EaseCalculatorModal';

jest.spyOn(Share, 'share').mockImplementation(() => Promise.resolve({ action: 'sharedAction' }));

describe('EaseCalculatorModal (Komponent UI Kalkulatora Luzu i Doboru Rozmiaru)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renderuje modal z domyślną zakładką doboru rozmiaru i zamyka się', () => {
    const handleClose = jest.fn();
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <EaseCalculatorModal
          visible={true}
          onClose={handleClose}
          initialBodyBustCm={92}
          initialPatternSizes="85, 95, 105, 115"
        />
      );
    });

    const instance = root!.root;
    expect(instance.findByProps({ children: 'Luz i Dobór Rozmiaru' })).toBeTruthy();
    expect(instance.findByProps({ children: '🎯 REKOMENDOWANY ROZMIAR' })).toBeTruthy();

    const closeBtn = instance.findByProps({ accessibilityLabel: 'Zamknij kalkulator luzu' });
    act(() => {
      closeBtn.props.onPress();
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('pozwala wybrać preset luzu i używać steppera +/- 1 cm', () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <EaseCalculatorModal
          visible={true}
          onClose={jest.fn()}
        />
      );
    });

    const instance = root!.root;

    // Kliknij preset 'Oversize (+15 do +24 cm)'
    const oversizeChip = instance.findByProps({ accessibilityLabel: 'Wybierz styl luzu: Oversize (+15 do +24 cm)' });
    act(() => {
      oversizeChip.props.onPress();
    });

    const easeInput = instance.findByProps({ accessibilityLabel: 'Wartość pożądanego luzu w cm' });
    expect(easeInput.props.value).toBe('20');

    // Użyj przycisków steppera
    const plusBtn = instance.findByProps({ accessibilityLabel: 'Zwiększ pożądany luz o 1 cm' });
    const minusBtn = instance.findByProps({ accessibilityLabel: 'Zmniejsz pożądany luz o 1 cm' });

    act(() => {
      plusBtn.props.onPress();
    });
    expect(easeInput.props.value).toBe('21');

    act(() => {
      minusBtn.props.onPress();
      minusBtn.props.onPress();
    });
    expect(easeInput.props.value).toBe('19');
  });

  test('obsługuje zmianę obwodu ciała i manualne wpisanie rozmiarów wzoru', () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <EaseCalculatorModal
          visible={true}
          onClose={jest.fn()}
        />
      );
    });

    const instance = root!.root;
    const bodyInput = instance.findByProps({ accessibilityLabel: 'Pole obwodu biustu w centymetrach' });
    const patternSizesInput = instance.findByProps({
      accessibilityLabel: 'Lista obwodów gotowego wyrobu we wzorze rozdzielona przecinkami',
    });

    act(() => {
      bodyInput.props.onChangeText('104');
      patternSizesInput.props.onChangeText('90, 100, 110, 120');
    });

    const allTexts = instance
      .findAllByType('Text' as any)
      .map((t) => (Array.isArray(t.props.children) ? t.props.children.join('') : t.props.children))
      .join(' ');

    // Rozmiar L w standardzie CYC
    expect(allTexts).toContain('Rozmiar L');
  });

  test('obsługuje pusty lub niepoprawny stan wprowadzonych danych bez błędu', () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <EaseCalculatorModal
          visible={true}
          onClose={jest.fn()}
        />
      );
    });

    const instance = root!.root;
    const bodyInput = instance.findByProps({ accessibilityLabel: 'Pole obwodu biustu w centymetrach' });
    const patternSizesInput = instance.findByProps({
      accessibilityLabel: 'Lista obwodów gotowego wyrobu we wzorze rozdzielona przecinkami',
    });

    act(() => {
      bodyInput.props.onChangeText('');
      patternSizesInput.props.onChangeText('');
    });

    // Karta rekomendacji powinna zniknąć
    expect(instance.findAllByProps({ children: '🎯 REKOMENDOWANY ROZMIAR' }).length).toBe(0);
  });

  test('obsługuje zakładkę adaptacji oczek do innej próbki', () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <EaseCalculatorModal
          visible={true}
          onClose={jest.fn()}
          initialPatternStitches={120}
          initialPatternGauge={20}
          initialMyGauge={24}
        />
      );
    });

    const instance = root!.root;
    const adaptationTab = instance.findByProps({
      accessibilityLabel: 'Zakładka przelicznik oczek do innej próbki',
    });

    act(() => {
      adaptationTab.props.onPress();
    });

    // Widoczne nagłówki adaptacji
    expect(instance.findByProps({ children: '📐 ADAPTACJA OCZEK' })).toBeTruthy();

    const stitchesInput = instance.findByProps({ accessibilityLabel: 'Liczba oczek ze wzoru' });
    const myGaugeInput = instance.findByProps({
      accessibilityLabel: 'Twoja własna gęstość próbki na 10 centymetrów',
    });
    const repeatInput = instance.findByProps({
      accessibilityLabel: 'Wielokrotność raportu wzoru np. 4 dla ściągacza 2 na 2',
    });
    const edgeInput = instance.findByProps({ accessibilityLabel: 'Liczba oczek brzegowych' });

    act(() => {
      stitchesInput.props.onChangeText('140');
      myGaugeInput.props.onChangeText('22');
      repeatInput.props.onChangeText('8');
      edgeInput.props.onChangeText('2');
    });

    expect(instance.findByProps({ children: '📐 ADAPTACJA OCZEK' })).toBeTruthy();
    const adaptTexts = instance
      .findAllByType('Text' as any)
      .map((t) => (Array.isArray(t.props.children) ? t.props.children.join('') : t.props.children))
      .join(' ');
    expect(adaptTexts).toContain('Wariant mniejszy');
    expect(adaptTexts).toContain('Wariant większy');

    // Test przełączenia z powrotem na zakładkę fit
    const fitTab = instance.findByProps({
      accessibilityLabel: 'Zakładka ocena luzu i dobór rozmiaru',
    });
    act(() => {
      fitTab.props.onPress();
    });
    expect(instance.findByProps({ children: '👕 Rozmiar & Luz' })).toBeTruthy();
  });

  test('obsługuje błędy i przypadki brzegowe w wyliczaniu rekomendacji i adaptacji (catch)', () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <EaseCalculatorModal
          visible={true}
          onClose={jest.fn()}
        />
      );
    });

    const instance = root!.root;
    const bodyInput = instance.findByProps({ accessibilityLabel: 'Pole obwodu biustu w centymetrach' });
    const easeInput = instance.findByProps({ accessibilityLabel: 'Wartość pożądanego luzu w cm' });

    // Wymuszenie błędu w recommendPatternSize: targetCircumference <= 0 (body=20, ease=-30)
    act(() => {
      bodyInput.props.onChangeText('20');
      easeInput.props.onChangeText('-30');
    });
    expect(instance.findAllByProps({ children: '🎯 REKOMENDOWANY ROZMIAR' }).length).toBe(0);

    // Przełącz na adaptację
    const adaptationTab = instance.findByProps({
      accessibilityLabel: 'Zakładka przelicznik oczek do innej próbki',
    });
    act(() => {
      adaptationTab.props.onPress();
    });

    const stitchesInput = instance.findByProps({ accessibilityLabel: 'Liczba oczek ze wzoru' });
    const edgeInput = instance.findByProps({ accessibilityLabel: 'Liczba oczek brzegowych' });

    // 1. Nieprawidłowe dane (np. stitches = 0)
    act(() => {
      stitchesInput.props.onChangeText('0');
    });
    expect(instance.findAllByProps({ children: '📐 ADAPTACJA OCZEK' }).length).toBe(0);

    // 2. Wymuszenie błędu w adaptPatternStitches: exactStitches < edgeStitches (np. stitches = 1, edge = 50)
    act(() => {
      stitchesInput.props.onChangeText('1');
      edgeInput.props.onChangeText('50');
    });
    expect(instance.findAllByProps({ children: '📐 ADAPTACJA OCZEK' }).length).toBe(0);
  });

  test('udostępnia raporty dla obu zakładek przez natywny Share Sheet', async () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <EaseCalculatorModal
          visible={true}
          onClose={jest.fn()}
        />
      );
    });

    const instance = root!.root;
    const shareBtn = instance.findByProps({ accessibilityLabel: 'Udostępnij raport dopasowania' });

    // Udostępnianie z zakładki fit
    await act(async () => {
      await shareBtn.props.onPress();
    });
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Dobór Rozmiaru & Luz Dziewiarski'),
      })
    );

    // Przełączenie na adaptację
    const adaptationTab = instance.findByProps({
      accessibilityLabel: 'Zakładka przelicznik oczek do innej próbki',
    });
    act(() => {
      adaptationTab.props.onPress();
    });

    // Udostępnianie z zakładki adaptation
    await act(async () => {
      await shareBtn.props.onPress();
    });
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Adaptacja Oczek do Próbki'),
      })
    );
  });

  test('obsługuje onRequestClose modala', () => {
    const handleClose = jest.fn();
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <EaseCalculatorModal
          visible={true}
          onClose={handleClose}
        />
      );
    });

    const modal = root!.root.findByType('Modal' as any);
    act(() => {
      modal.props.onRequestClose();
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
