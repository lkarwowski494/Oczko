import React from 'react';
import renderer, { act } from 'react-test-renderer';
import LearnScreen from '../../../app/(tabs)/learn';

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

describe('LearnScreen — Pełne testy słownika i trenażera powtórzeń (DEC-17)', () => {
  it('obsługuje wyszukiwanie terminów oraz filtrowanie po kategoriach w słowniku', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<LearnScreen />);
    });

    const root = tree.root;
    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Słownik & Symbole');
    expect(text).toContain('k2tog');

    // 1. Wyszukaj skrót 'k2tog'
    const searchInput = root.find((node: any) =>
      node.props?.onChangeText &&
      node.props?.placeholder &&
      node.props.placeholder.includes('Szukaj skrótu')
    );

    act(() => {
      searchInput.props.onChangeText('k2tog');
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('k2tog');
    expect(text).toContain('Dwa oczka razem na prawo');

    // 2. Filtruj po kategorii 'Redukcje (-)'
    const decreaseChip = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Redukcje (-)')
    );

    act(() => {
      decreaseChip.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('k2tog');

    // 3. Filtruj po kategorii 'Warkocze'
    const cableChip = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Warkocze')
    );

    act(() => {
      // Wyczyść wyszukiwarkę przed przełączeniem
      searchInput.props.onChangeText('');
    });

    act(() => {
      cableChip.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('C6F');
  });

  it('przełącza na Trenażer powtórzeń, wybiera ćwiczenie i przechodzi kroki aż do ukończenia wzorca', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<LearnScreen />);
    });

    const root = tree.root;

    // Przełącz na Trenażer
    const trainerTab = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Trenażer powtórzeń')
    );

    act(() => {
      trainerTab.props.onPress();
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('WYBIERZ WZORZEC DO ĆWICZENIA');
    expect(text).toContain('Zalicz krok (+)');

    // Wybierz proste ćwiczenie (Ścieg francuski lub ściągacz)
    const exerciseChips = root.findAll((node: any) =>
      node.props?.onPress &&
      (extractAllStrings(node).includes('Ściągacz 2x2') ||
       extractAllStrings(node).includes('Ścieg perłowy') ||
       extractAllStrings(node).includes('Warkocz'))
    );

    expect(exerciseChips.length).toBeGreaterThan(0);

    act(() => {
      exerciseChips[0].props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Zalicz krok (+)');

    // Kliknij przycisk resetowania
    const resetBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Zresetuj ćwiczenie')
    );

    act(() => {
      resetBtn.props.onPress();
    });

    // Przejdź wszystkie kroki wzorca aż do ukończenia
    let isCompleted = false;
    let iterations = 0;
    const maxIterations = 50;

    while (!isCompleted && iterations < maxIterations) {
      iterations++;
      const currentText = extractAllStrings(tree.toJSON());
      if (currentText.includes('Wzorzec ukończony!')) {
        isCompleted = true;
        break;
      }

      const stepBtn = root.find((node: any) =>
        node.props?.onPress &&
        extractAllStrings(node).includes('Zalicz krok (+)')
      );

      act(() => {
        stepBtn.props.onPress();
      });
    }

    expect(isCompleted).toBe(true);
    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Wzorzec ukończony!');
    expect(text).toContain('Powtórz ćwiczenie');

    // Kliknij "Powtórz ćwiczenie"
    const restartBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Powtórz ćwiczenie')
    );

    act(() => {
      restartBtn.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Zalicz krok (+)');
  });
});
