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
    expect(allText).toContain('Wszystkie grubości');
    expect(allText).toContain('Wszystkie surowce');
    expect(allText).toContain('Znaleziono:');
  });

  test('Ekran Magazyn obsługuje wyszukiwanie po partii farbowania (Dye Lot) oraz czyszczenie filtrów', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<StashScreen />);
    });

    const root = tree.root;
    // Znajdź pole wyszukiwania
    const searchInput = root.find((node: any) => {
      return (
        node.props?.onChangeText &&
        node.props?.placeholder &&
        node.props.placeholder.includes('Szukaj')
      );
    });

    // Wpisz partię farbowania '1240'
    act(() => {
      searchInput.props.onChangeText('1240');
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Nord');
    expect(text).toContain('Lot: 1240');
    expect(text).not.toContain('Sunday');

    // Wpisz frazę nieistniejącą
    act(() => {
      searchInput.props.onChangeText('brak_takiej_wloczki_xyz');
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Brak pasujących włóczek');
    expect(text).toContain('Resetuj wszystkie filtry');

    // Kliknij przycisk resetu filtrów
    const resetBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('Resetuj wszystkie filtry')
      );
    });

    act(() => {
      resetBtn.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Nord');
    expect(text).toContain('Sunday');
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
    expect(allText).toContain('Wibracje haptyczne');
    expect(allText).toContain('Przetestuj profile wibracji');
    expect(allText).toContain('Domyślne przypomnienie interwałowe');
    expect(allText).toContain('Eksportuj kopię');
    expect(allText).toContain('Przywróć kopię');
    expect(allText).toContain('Stan lokalnej bazy SQLite');
  });
});

