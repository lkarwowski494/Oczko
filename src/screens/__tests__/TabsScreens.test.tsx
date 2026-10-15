import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ProjectsScreen from '../../../app/(tabs)/projects';
import StashScreen from '../../../app/(tabs)/stash';
import LearnScreen from '../../../app/(tabs)/learn';
import SettingsScreen from '../../../app/(tabs)/settings';

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

describe('Oczko UI — Testy ekranów nawigacji zakładek (5 tabs)', () => {
  test('Ekran Projekty poprawnie renderuje nagłówek i przycisk tworzenia', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<ProjectsScreen />);
    });
    expect(tree).toBeDefined();
    const allText = extractAllStrings(tree.toJSON());
    expect(allText).toContain('Twoje Robótki');
    expect(allText).toContain('+ Nowy');
    expect(allText).toContain('Próbka');
    expect(allText).toContain('Zużycie');
  });


  test('Ekran Magazyn (Stash) poprawnie renderuje przełącznik i pozycje włóczek', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<StashScreen />);
    });
    expect(tree).toBeDefined();
    const allText = extractAllStrings(tree.toJSON());
    expect(allText).toContain('Włóczki');
    expect(allText).toContain('Druty i szydełka');
    expect(allText).toContain('Zużycie');
  });

  test('Ekran Nauka poprawnie renderuje słownik i pozycje skrótów dziewiarskich', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<LearnScreen />);
    });
    expect(tree).toBeDefined();
    const allText = extractAllStrings(tree.toJSON());
    expect(allText).toContain('Słownik');
    expect(allText).toContain('Trenażer powtórzeń');
    expect(allText).toContain('k2tog');
    expect(allText).toContain('Oczko prawe');
  });

  test('Ekran Ustawienia poprawnie renderuje konfigurację debounce, kopię zapasową i sekcję o aplikacji', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<SettingsScreen />);
    });
    expect(tree).toBeDefined();
    const allText = extractAllStrings(tree.toJSON());
    expect(allText).toContain('LICZNIK & STUKNIĘCIA');
    expect(allText).toContain('com.apps4brew.knitting');
    expect(allText).toMatch(/300\s*ms/);
    expect(allText).toContain('Eksportuj kopię');
    expect(allText).toContain('Przywróć kopię');
    expect(allText).toContain('Stan lokalnej bazy SQLite');
  });
});

