import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Share } from 'react-native';
import { RaglanCalculatorModal } from '../RaglanCalculatorModal';

jest.spyOn(Share, 'share').mockImplementation(() => Promise.resolve({ action: 'sharedAction' }));

describe('RaglanCalculatorModal (Komponent UI Konstrukcji Raglanu i Rzędów Skróconych)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renderuje modal z domyślnym schematem dekoltu i obsługuje zamykanie', () => {
    const handleClose = jest.fn();
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <RaglanCalculatorModal
          visible={true}
          onClose={handleClose}
          initialCastOnStitches={88}
        />
      );
    });

    const instance = root!.root;
    expect(instance.findByProps({ children: 'Kalkulator Raglanu' })).toBeTruthy();
    expect(instance.findByProps({ children: '📐 SCHEMAT PODZIAŁU DEKOLTU' })).toBeTruthy();
    expect(instance.findByProps({ children: 'TYŁ (Back)' })).toBeTruthy();
    expect(instance.findByProps({ children: 'PRZÓD (Front)' })).toBeTruthy();

    const closeBtn = instance.findByProps({ accessibilityLabel: 'Zamknij kalkulator raglanu' });
    act(() => {
      closeBtn.props.onPress();
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('pozwala modyfikować szerokość linii raglanu i liczbę obrotów GSR', () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <RaglanCalculatorModal
          visible={true}
          onClose={jest.fn()}
        />
      );
    });

    const instance = root!.root;

    // Wybierz linię raglanu 1 o.
    const chip1o = instance.findByProps({ accessibilityLabel: 'Wybierz szerokość linii raglanu 1 oczek' });
    act(() => {
      chip1o.props.onPress();
    });

    // Wybierz brak GSR (0 obrotów)
    const chip0turns = instance.findByProps({ accessibilityLabel: 'Wybierz liczbę obrotów GSR: 0' });
    act(() => {
      chip0turns.props.onPress();
    });

    const textsWithoutGsr = instance
      .findAllByType('Text' as any)
      .map((t) => (Array.isArray(t.props.children) ? t.props.children.join('') : t.props.children))
      .join(' ');
    // Sekcja GSR powinna zniknąć
    expect(textsWithoutGsr).not.toContain('Sekwencja Rzędów Skróconych');

    // Wybierz 5 obrotów GSR
    const chip5turns = instance.findByProps({ accessibilityLabel: 'Wybierz liczbę obrotów GSR: 5' });
    act(() => {
      chip5turns.props.onPress();
    });

    const textsWithGsr = instance
      .findAllByType('Text' as any)
      .map((t) => (Array.isArray(t.props.children) ? t.props.children.join('') : t.props.children))
      .join(' ');
    expect(textsWithGsr).toContain('Sekwencja Rzędów Skróconych');
  });

  test('obsługuje błędne lub puste dane bez awarii (fallback null)', () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <RaglanCalculatorModal
          visible={true}
          onClose={jest.fn()}
        />
      );
    });

    const instance = root!.root;
    const input = instance.findByProps({ accessibilityLabel: 'Pole liczby oczek nabieranych na dekolt' });

    act(() => {
      input.props.onChangeText('0');
    });
    expect(instance.findAllByProps({ children: '📐 SCHEMAT PODZIAŁU DEKOLTU' }).length).toBe(0);

    act(() => {
      input.props.onChangeText('10'); // zbyt mało oczek przy domyślnej linii raglanu
    });
    expect(instance.findAllByProps({ children: '📐 SCHEMAT PODZIAŁU DEKOLTU' }).length).toBe(0);
  });

  test('obsługuje zakładkę karczku i przyrostów oraz przełączanie między zakładkami', () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <RaglanCalculatorModal
          visible={true}
          onClose={jest.fn()}
        />
      );
    });

    const instance = root!.root;
    const yokeTab = instance.findByProps({ accessibilityLabel: 'Zakładka karczek i podkrój pach' });

    act(() => {
      yokeTab.props.onPress();
    });

    // Widoczne nagłówki karczku
    expect(instance.findByProps({ children: '🥋 WYNIKI KARCZKU & PODKROJU' })).toBeTruthy();

    const depthInput = instance.findByProps({ accessibilityLabel: 'Głębokość karczku w centymetrach' });
    const chestInput = instance.findByProps({ accessibilityLabel: 'Docelowy obwód klatki piersiowej w centymetrach' });
    const sleeveInput = instance.findByProps({ accessibilityLabel: 'Docelowy obwód rękawa w centymetrach' });
    const underarmInput = instance.findByProps({ accessibilityLabel: 'Liczba oczek dobieranych pod każdą pachą' });
    const stitchGaugeInput = instance.findByProps({ accessibilityLabel: 'Gęstość oczek na 10 centymetrów' });
    const rowGaugeInput = instance.findByProps({ accessibilityLabel: 'Gęstość rzędów na 10 centymetrów' });

    act(() => {
      depthInput.props.onChangeText('24');
      chestInput.props.onChangeText('105');
      sleeveInput.props.onChangeText('36');
      underarmInput.props.onChangeText('10');
      stitchGaugeInput.props.onChangeText('22');
      rowGaugeInput.props.onChangeText('30');
    });

    expect(instance.findByProps({ children: '🥋 WYNIKI KARCZKU & PODKROJU' })).toBeTruthy();

    // Sprawdź niepoprawne dane w karczku
    act(() => {
      depthInput.props.onChangeText('0');
    });
    expect(instance.findAllByProps({ children: '🥋 WYNIKI KARCZKU & PODKROJU' }).length).toBe(0);

    // Przełącz z powrotem na dekolt
    const castOnTab = instance.findByProps({ accessibilityLabel: 'Zakładka podział dekoltu i rzędy skrócone' });
    act(() => {
      castOnTab.props.onPress();
    });
    expect(instance.findByProps({ children: '📐 SCHEMAT PODZIAŁU DEKOLTU' })).toBeTruthy();
  });

  test('udostępnia raporty dla obu zakładek przez natywny Share Sheet', async () => {
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <RaglanCalculatorModal
          visible={true}
          onClose={jest.fn()}
        />
      );
    });

    const instance = root!.root;
    const shareBtn = instance.findByProps({ accessibilityLabel: 'Udostępnij raport konstrukcji raglanu' });

    // Udostępnianie z zakładki caston
    await act(async () => {
      await shareBtn.props.onPress();
    });
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Konstrukcja Raglanu od Góry'),
      })
    );

    // Przełącz na karczek
    const yokeTab = instance.findByProps({ accessibilityLabel: 'Zakładka karczek i podkrój pach' });
    act(() => {
      yokeTab.props.onPress();
    });

    // Udostępnianie z zakładki yoke
    await act(async () => {
      await shareBtn.props.onPress();
    });
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Karczek Raglanowy & Podkrój Pach'),
      })
    );
  });

  test('obsługuje onRequestClose modala', () => {
    const handleClose = jest.fn();
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <RaglanCalculatorModal
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
