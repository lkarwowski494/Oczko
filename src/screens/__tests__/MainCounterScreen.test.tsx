import React from 'react';
import renderer, { act } from 'react-test-renderer';
import MainCounterScreen from '../MainCounterScreen';

function extractAllStrings(node: any): string {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractAllStrings).join(' ');
  }
  const childrenText = node.children ? node.children.map(extractAllStrings).join(' ') : '';
  const propsText = node.props?.children ? extractAllStrings(node.props.children) : '';
  const valueText = node.props?.value ? String(node.props.value) : '';
  return `${childrenText} ${propsText} ${valueText}`;
}

describe('Oczko UI — Test renderowania głównego ekranu i interakcji (BR-LICZ-003, BR-SYS-011)', () => {
  test('Komponent ekranu licznika definiuje poprawną strukturę i renderuje drzewo', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
    });
    expect(tree).toBeDefined();
    const allText = extractAllStrings(tree.toJSON());
    expect(allText).toContain('Mój Sweter');
    expect(allText).toContain('Licznik');
    expect(allText).toContain('Schemat & Linijka');
    expect(allText).toContain('Stuknij, aby dodać rząd');
    expect(allText).toMatch(/przypomnienie cykliczne/i);
  });

  test('Przełącza tryb widoku na Schemat & Linijka i renderuje przeglądarkę wzorów', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
    });

    const root = tree.root;
    const patternTab = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('Schemat & Linijka')
      );
    });

    act(() => {
      patternTab.props.onPress();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Warkocz C6F');
    expect(text).toContain('DIAGRAM DZIEWIARSKI');
    expect(text).toContain('LINIJKA');
    expect(text).toContain('Legenda symboli CYC');
  });

  test('Otwiera modal konfiguracji przypomnienia cyklicznego i pozwala ustawić interwał', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
    });

    const root = tree.root;
    const intervalChip = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).toLowerCase().includes('przypomnienie cykliczne')
      );
    });

    act(() => {
      intervalChip.props.onPress();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Przypomnienie cykliczne (Interwał)');
    expect(text).toContain('Szybki wybór interwału:');
    expect(text).toContain('co 6');
  });

  test('Inkrementuje i cofa licznik z obsługą haptyki', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
    });

    const root = tree.root;
    // Znajdź kartę licznika
    const counterCard = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node.props?.children).includes('Stuknij, aby dodać rząd')
      );
    });

    act(() => {
      counterCard.props.onPress();
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('1');

    // Znajdź przycisk cofania (Undo)
    const undoBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node.props?.children).includes('Cofnij')
      );
    });

    act(() => {
      undoBtn.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('0');
  });

  test('Przełącza tryb widoku na Wzór PDF i renderuje komponent podglądu PDF (BR-WZOR-001, DEC-09)', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
    });

    const root = tree.root;
    const pdfTab = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('Wzór PDF')
      );
    });

    act(() => {
      pdfTab.props.onPress();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Brak wczytanego wzoru');
    expect(text).toContain('Wczytaj plik PDF');
  });

  test('Otwiera symulator Apple Watch (DEC-03) i zwiększa licznik główny po stuknięciu +1 na zegarku', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
    });

    const root = tree.root;
    // Znajdź przycisk otwierający Apple Watch
    const watchChip = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('Apple Watch')
      );
    });

    act(() => {
      watchChip.props.onPress();
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Apple Watch & Smart Stack');
    expect(text).toContain('watchOS 11');

    // Znajdź przycisk +1 Rząd w symulatorze zegarka
    const watchPlusBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('+1 Rząd')
      );
    });

    act(() => {
      watchPlusBtn.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('1'); // licznik na zegarku i ekranie wzrósł do 1
  });

  test('W połączeniu z ProjectProvider pozwala przełączać części robótki oraz dodać licznik wzoru', async () => {
    const { ProjectProvider } = require('../../core/project-context');
    const { createInMemoryDatabase } = require('../../core/database');
    const db = createInMemoryDatabase();

    let tree: any;
    await act(async () => {
      tree = renderer.create(
        <ProjectProvider initialDb={db}>
          <MainCounterScreen />
        </ProjectProvider>
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 60));
    });

    const root = tree.root;
    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Mój Sweter Raglanowy');

    // 1. Przełącz część na 'Rękaw lewy'
    const sleeveChip = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Rękaw lewy'
    );

    await act(async () => {
      await sleeveChip.props.onPress();
      await new Promise((r) => setTimeout(r, 30));
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Rękaw lewy');

    // 2. Otwórz modal dodawania licznika powiązanego (+ Licznik wzoru)
    const addLinkedBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('+ Licznik wzoru')
    );

    await act(async () => {
      addLinkedBtn.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Dodaj powiązany licznik wzoru');

    // 3. Wypełnij pola
    const inputs = root.findAll((node: any) => node.type === 'TextInput' || node.props?.onChangeText);
    const nameInput = inputs.find((n: any) => n.props?.placeholder && n.props.placeholder.includes('Warkocz na rękawie'));
    const cycleInput = inputs.find((n: any) => n.props?.value === '6');

    if (nameInput) {
      await act(async () => {
        nameInput.props.onChangeText('Ażur Liście');
      });
    }

    if (cycleInput) {
      await act(async () => {
        cycleInput.props.onChangeText('12');
      });
    }

    // 4. Kliknij 'Dodaj licznik'
    const submitLinkedBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Dodaj licznik'
    );

    await act(async () => {
      await submitLinkedBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 60));
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Ażur Liście');
  });

  test('Ustawia i zapisuje przypomnienie cykliczne z presetem co 8 i własną etykietą', async () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
    });

    const root = tree.root;

    // Otwórz modal interwału
    const intervalChip = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).toLowerCase().includes('przypomnienie cykliczne')
    );

    act(() => {
      intervalChip.props.onPress();
    });

    // Wybierz preset 'co 8'
    const preset8 = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'co 8'
    );

    act(() => {
      preset8.props.onPress();
    });

    // Zmień etykietę
    const inputs = root.findAll((node: any) => node.type === 'TextInput' || node.props?.onChangeText);
    const labelInput = inputs.find((n: any) =>
      n.props?.placeholder && n.props.placeholder.includes('Zmiana splotu')
    );

    if (labelInput) {
      act(() => {
        labelInput.props.onChangeText('Dodaj oczko na brzegu');
      });
    }

    // Kliknij "Zapisz"
    const saveBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Zapisz'
    );

    act(() => {
      saveBtn.props.onPress();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('co 8 rz.');
    expect(text).toContain('Dodaj oczko na brzegu');
  });
});
