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
  return `${childrenText} ${propsText}`;
}

describe('Oczko UI — Test renderowania głównego ekranu', () => {
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
  });

  test('Przełącza tryb widoku na Schemat & Linijka i renderuje przeglądarkę wzorów', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
    });

    const root = tree.root;
    // Znajdź tab "Schemat & Linijka"
    const patternTab = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node.props?.children).includes('Schemat & Linijka')
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
});
