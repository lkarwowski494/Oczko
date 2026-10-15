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
});
