import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Share } from 'react-native';
import { YarnSubstitutionModal } from '../YarnSubstitutionModal';

jest.spyOn(Share, 'share').mockImplementation(() => Promise.resolve({ action: 'sharedAction' }));

describe('YarnSubstitutionModal (Komponent UI Kalkulatora Zamienników i WPI)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renderuje modal z domyślną zakładką zamiennika i obsługuje zmianę wartości', () => {
    const handleClose = jest.fn();
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <YarnSubstitutionModal
          visible={true}
          onClose={handleClose}
          initialPatternBalls={6}
          initialPatternLength={120}
        />
      );
    });

    const instance = root!.root;

    // Tytuł i wynik
    expect(instance.findByProps({ children: 'Zamiennik Włóczek & WPI' })).toBeTruthy();
    expect(instance.findByProps({ children: 'Wynik kalkulacji' })).toBeTruthy();

    // Pola tekstowe
    const patternBallsInput = instance.findByProps({ accessibilityLabel: 'Liczba motków we wzorze' });
    const newLengthInput = instance.findByProps({ accessibilityLabel: 'Metraż nowego motka w metrach' });

    act(() => {
      patternBallsInput.props.onChangeText('8');
      newLengthInput.props.onChangeText('200');
    });

    // Sprawdzenie zamknięcia modala
    const closeBtn = instance.findByProps({ accessibilityLabel: 'Zamknij kalkulator zamienników' });
    act(() => {
      closeBtn.props.onPress();
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('pozwala wybrać liczbę nitek oraz margines bezpieczeństwa', () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <YarnSubstitutionModal
          visible={true}
          onClose={jest.fn()}
        />
      );
    });

    const instance = root!.root;

    // Wybór 2 nitek
    const strand2Btn = instance.findByProps({ accessibilityLabel: 'Dzierganie z 2 nitek' });
    act(() => {
      strand2Btn.props.onPress();
    });

    // Wybór marginesu 0%
    const margin0Btn = instance.findByProps({ accessibilityLabel: 'Margines bezpieczeństwa 0 procent' });
    act(() => {
      margin0Btn.props.onPress();
    });

    // Wybór marginesu 20%
    const margin20Btn = instance.findByProps({ accessibilityLabel: 'Margines bezpieczeństwa 20 procent' });
    act(() => {
      margin20Btn.props.onPress();
    });

    expect(instance.findByProps({ children: 'Wynik kalkulacji' })).toBeTruthy();
  });

  test('obsługuje zakładkę łączenia nitek (multistrand)', () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <YarnSubstitutionModal
          visible={true}
          onClose={jest.fn()}
        />
      );
    });

    const instance = root!.root;

    // Przełączenie na łączenie nitek
    const multistrandTab = instance.findByProps({ accessibilityLabel: 'Łączenie nitek' });
    act(() => {
      multistrandTab.props.onPress();
    });

    expect(instance.findByProps({ children: 'Fingering (1) + Lace Mohair (0)' })).toBeTruthy();

    // Powrót do zakładki zamiennika
    const subTab = instance.findByProps({ accessibilityLabel: 'Kalkulator zamiennika' });
    act(() => {
      subTab.props.onPress();
    });
    expect(instance.findByProps({ children: 'Wynik kalkulacji' })).toBeTruthy();
  });

  test('obsługuje zakładkę WPI, steppery + i - oraz zmianę wartości', () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <YarnSubstitutionModal
          visible={true}
          onClose={jest.fn()}
        />
      );
    });

    const instance = root!.root;

    // Przełączenie na WPI
    const wpiTab = instance.findByProps({ accessibilityLabel: 'Kalkulator WPI' });
    act(() => {
      wpiTab.props.onPress();
    });

    expect(instance.findByProps({ children: 'Rozpoznana grubość przędzy' })).toBeTruthy();

    // Stepper +
    const plusBtn = instance.findByProps({ accessibilityLabel: 'Zwiększ liczbę owinięć WPI o jeden' });
    act(() => {
      plusBtn.props.onPress();
    });

    // Stepper -
    const minusBtn = instance.findByProps({ accessibilityLabel: 'Zmniejsz liczbę owinięć WPI o jeden' });
    act(() => {
      minusBtn.props.onPress();
    });

    // Zmiana tekstu WPI na 1 i próba zmniejszenia poniżej 1
    const wpiInput = instance.findByProps({ accessibilityLabel: 'Liczba owinięć na cal WPI' });
    act(() => {
      wpiInput.props.onChangeText('1');
    });
    act(() => {
      minusBtn.props.onPress();
    });

    // Stepper + gdy wpiInput jest puste
    act(() => {
      wpiInput.props.onChangeText('');
    });
    act(() => {
      plusBtn.props.onPress();
    });

    // Zmiana tekstu WPI na 18
    act(() => {
      wpiInput.props.onChangeText('18');
    });

    // Zmiana tekstu WPI na niepoprawną
    act(() => {
      wpiInput.props.onChangeText('0');
    });
  });

  test('obsługuje niepoprawne dane wejściowe i błędy walidacji w zamienniku', () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <YarnSubstitutionModal
          visible={true}
          onClose={jest.fn()}
        />
      );
    });

    const instance = root!.root;

    const patternBallsInput = instance.findByProps({ accessibilityLabel: 'Liczba motków we wzorze' });
    act(() => {
      patternBallsInput.props.onChangeText('0');
    });

    expect(instance.findByProps({ children: 'Wprowadź dodatnie wartości liczbowe dla motków i metrażu.' })).toBeTruthy();

    act(() => {
      patternBallsInput.props.onChangeText('abc');
    });

    expect(instance.findByProps({ children: 'Wprowadź dodatnie wartości liczbowe dla motków i metrażu.' })).toBeTruthy();
  });

  test('obsługuje udostępnianie kalkulacji oraz błędy Share.share', async () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <YarnSubstitutionModal
          visible={true}
          onClose={jest.fn()}
        />
      );
    });

    const instance = root!.root;

    const shareBtn = instance.findByProps({ accessibilityLabel: 'Udostępnij kalkulację zamiennika' });
    await act(async () => {
      shareBtn.props.onPress();
    });
    expect(Share.share).toHaveBeenCalled();

    // Błąd udostępniania
    (Share.share as jest.Mock).mockRejectedValueOnce(new Error('User cancelled'));
    await act(async () => {
      shareBtn.props.onPress();
    });
    expect(Share.share).toHaveBeenCalled();
  });

  test('obsługuje onRequestClose modala', () => {
    const handleClose = jest.fn();
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <YarnSubstitutionModal
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
