import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Share } from 'react-native';
import { ShapingCalculatorModal } from '../ShapingCalculatorModal';

jest.spyOn(Share, 'share').mockImplementation(() => Promise.resolve({ action: 'sharedAction' }));

describe('ShapingCalculatorModal (Komponent UI Kalkulatora Kształtowania)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renderuje modal z domyślną zakładką dodawania i obsługuje zmianę wartości', () => {
    const handleClose = jest.fn();
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <ShapingCalculatorModal
          visible={true}
          onClose={handleClose}
          initialStitches={80}
        />
      );
    });

    const instance = root!.root;

    // Nagłówek i tytul
    expect(instance.findByProps({ children: 'Kształtowanie Oczek' })).toBeTruthy();

    // Wartości domyślne pól dodawania
    const textInputs = instance.findAllByType('TextInput' as any);
    expect(textInputs.length).toBeGreaterThanOrEqual(3);

    // Zmiana metody na kfb
    const kfbButton = instance.findByProps({ accessibilityLabel: 'Wybierz metodę dodawania kfb' });
    act(() => {
      kfbButton.props.onPress();
    });

    // Udostępnienie instrukcji
    const shareButton = instance.findByProps({ accessibilityLabel: 'Udostępnij instrukcję dodawania' });
    act(() => {
      shareButton.props.onPress();
    });
    expect(Share.share).toHaveBeenCalled();

    // Zamknięcie modala
    const closeButton = instance.findByProps({ accessibilityLabel: 'Zamknij kalkulator kształtowania' });
    act(() => {
      closeButton.props.onPress();
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('obsługuje zakładkę odejmowania i błędy walidacji', () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <ShapingCalculatorModal
          visible={true}
          onClose={jest.fn()}
          initialStitches={80}
        />
      );
    });

    const instance = root!.root;

    // Przełączenie na zakładkę odejmowania
    const decreaseTab = instance.findByProps({ accessibilityLabel: 'Odejmowanie oczek' });
    act(() => {
      decreaseTab.props.onPress();
    });

    // Wybór metody ssk
    const sskButton = instance.findByProps({ accessibilityLabel: 'Wybierz metodę odejmowania ssk' });
    act(() => {
      sskButton.props.onPress();
    });

    // Udostępnienie instrukcji odejmowania
    const shareDec = instance.findByProps({ accessibilityLabel: 'Udostępnij instrukcję odejmowania' });
    act(() => {
      shareDec.props.onPress();
    });
    expect(Share.share).toHaveBeenCalled();

    // Wprowadzenie błędnych danych: chcę więcej oczek niż mam w odejmowaniu
    const currentInput = instance.findByProps({ accessibilityLabel: 'Początkowa liczba oczek do odjęcia' });
    const targetInput = instance.findByProps({ accessibilityLabel: 'Docelowa liczba oczek po odjęciu' });

    act(() => {
      currentInput.props.onChangeText('50');
      targetInput.props.onChangeText('90'); // 90 > 50 -> błąd w trybie odejmowania
    });

    // Powinien wyświetlić komunikat błędu
    expect(instance.findByProps({ children: 'Docelowa liczba oczek jest większa niż początkowa. Użyj kalkulatora dodawania.' })).toBeTruthy();
  });

  test('obsługuje zakładkę kształtowania wielorzędowego, przełączanie brzegów i checkbox', () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <ShapingCalculatorModal
          visible={true}
          onClose={jest.fn()}
          initialStitches={44}
        />
      );
    });

    const instance = root!.root;

    // Przełączenie na wielorzędowe
    const multiTab = instance.findByProps({ accessibilityLabel: 'Kształtowanie wielorzędowe' });
    act(() => {
      multiTab.props.onPress();
    });

    // Przełączenie na jeden brzeg
    const singleEdgeBtn = instance.findByProps({ accessibilityLabel: 'Kształtuj na jednym brzegu' });
    act(() => {
      singleEdgeBtn.props.onPress();
    });

    // Powrót do obu brzegów
    const bothEdgesBtn = instance.findByProps({ accessibilityLabel: 'Kształtuj po obu brzegach symetrycznie' });
    act(() => {
      bothEdgesBtn.props.onPress();
    });

    // Przełączenie checkboxa RS only
    const checkbox = instance.findByProps({ accessibilityLabel: 'Modyfikacje tylko w rzędach prawych' });
    act(() => {
      checkbox.props.onPress();
    });

    // Udostępnienie rozpiski
    const shareMulti = instance.findByProps({ accessibilityLabel: 'Udostępnij rozpiskę kształtowania' });
    act(() => {
      shareMulti.props.onPress();
    });
    expect(Share.share).toHaveBeenCalled();

    // Błąd: nieparzysta różnica przy obu brzegach
    const startInput = instance.findByProps({ accessibilityLabel: 'Oczka początkowe w kształtowaniu wielorzędowym' });
    const endInput = instance.findByProps({ accessibilityLabel: 'Oczka końcowe w kształtowaniu wielorzędowym' });

    act(() => {
      startInput.props.onChangeText('40');
      endInput.props.onChangeText('45'); // diff = 5 (nieparzysty)
    });

    expect(instance.findByProps({ children: 'Symetryczne kształtowanie po obu brzegach wymaga parzystej różnicy oczek (różnica wynosi 5).' })).toBeTruthy();

    // Przełączenie z powrotem na zakładkę dodawania
    const increaseTab = instance.findByProps({ accessibilityLabel: 'Dodawanie oczek' });
    act(() => {
      increaseTab.props.onPress();
    });
    expect(instance.findByProps({ children: 'DODAWANIE W JEDNYM RZĘDZIE' })).toBeTruthy();
  });

  test('obsługuje błąd Share.share bez rzucania wyjątku', async () => {
    jest.spyOn(Share, 'share').mockImplementationOnce(() => Promise.reject(new Error('Share error')));

    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <ShapingCalculatorModal
          visible={true}
          onClose={jest.fn()}
        />
      );
    });

    const shareButton = root!.root.findByProps({ accessibilityLabel: 'Udostępnij instrukcję dodawania' });
    await act(async () => {
      await shareButton.props.onPress();
    });
  });
});
