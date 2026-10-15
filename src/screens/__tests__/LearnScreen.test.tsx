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

    // Przełącz z powrotem na Słownik (linia 79)
    const glossaryTab = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Słownik & Symbole')
    );

    act(() => {
      glossaryTab.props.onPress();
    });

    expect(extractAllStrings(tree.toJSON())).toContain('Słownik & Symbole');
  });

  it('obsługuje interaktywny klucz identyfikacji ściegów Co widzisz? (DEC-16)', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<LearnScreen />);
    });

    const root = tree.root;

    // 1. Przełącz na zakładkę "Co widzisz?"
    const identifierTab = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Co widzisz?')
    );

    act(() => {
      identifierTab.props.onPress();
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Co widzisz na prawej stronie robótki?');
    expect(text).toContain('Krok 1 z 3');

    // 2. Kliknij opcję w Kroku 1: "Gładkie pionowe kolumny „V”"
    const vOption = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Gładkie pionowe kolumny')
    );

    act(() => {
      vOption.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Odwróć robótkę — jak wygląda lewa strona?');
    expect(text).toContain('Krok 2 z 3');

    // 3. Sprawdź przycisk "◀ Cofnij" do kroku 1
    const backBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Cofnij')
    );

    act(() => {
      backBtn.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Krok 1 z 3');

    // 4. Ponownie wybierz w Kroku 1: warkocze
    const cableOption = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Splecione pasma / warkocze')
    );

    act(() => {
      cableOption.props.onPress();
    });

    // 5. Krok 2: wybierz opcję
    const reverseOption = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Gładkie zapadnięte tło')
    );

    act(() => {
      reverseOption.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Jak zachowują się brzegi i elastyczność dzianiny?');
    expect(text).toContain('Krok 3 z 3');

    // 6. Krok 3: wybierz opcję i uzyskaj wynik
    const edgeOption = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Leży zupełnie płasko')
    );

    act(() => {
      edgeOption.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Warkocz dziewiarski');
    expect(text).toContain('Jak liczyć rzędy w tym ściegu?');
    expect(text).toContain('Poćwicz ten ścieg w trenażerze');
    expect(text).toContain('Pokaż definicję w słowniku');

    // 7. Przejdź do trenażera przez przycisk akcji
    const goToTrainerBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Poćwicz ten ścieg w trenażerze')
    );

    act(() => {
      goToTrainerBtn.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Warkocz');
    expect(text).toContain('Zalicz krok (+)');

    // 8. Przełącz z powrotem na "Co widzisz?" i zresetuj
    const idTab2 = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Co widzisz?')
    );

    act(() => {
      idTab2.props.onPress();
    });

    const resetIdBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Zidentyfikuj inny ścieg')
    );

    act(() => {
      resetIdBtn.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Krok 1 z 3');

    // 9. Przetestuj przycisk "Zacznij od początku" w trakcie ankiety
    const garterOpt = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Poziome wypukłe grzbiety')
    );

    act(() => {
      garterOpt.props.onPress();
    });

    const restartSurveyBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Zacznij od początku')
    );

    act(() => {
      restartSurveyBtn.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Krok 1 z 3');

    // 10. Przeprowadź pełną identyfikację dżerseju i przetestuj przejście do słownika
    const vOpt2 = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Gładkie pionowe kolumny')
    );
    act(() => {
      vOpt2.props.onPress();
    });

    const diffOpt = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Zupełnie inaczej (fale i pętelki)')
    );
    act(() => {
      diffOpt.props.onPress();
    });

    const curlOpt = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Brzegi mocno rolują się')
    );
    act(() => {
      curlOpt.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Dżersej / Ścieg gładki prawy');
    expect(text).toContain('Wskazówka techniczna & brzegi');

    const goToGlossaryBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Pokaż definicję w słowniku')
    );
    act(() => {
      goToGlossaryBtn.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Oczko prawe');
    expect(text).toContain('prawe');
  });
});
