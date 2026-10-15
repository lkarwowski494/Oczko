import React from 'react';
import renderer, { act } from 'react-test-renderer';
import GaugeCalculatorModal from '../GaugeCalculatorModal';

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

describe('GaugeCalculatorModal (DEC-01, BR-PROJ-004)', () => {
  it('renders modal with initial calculation results (100 stitches, 168 rows)', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <GaugeCalculatorModal visible={true} onClose={jest.fn()} />
      );
    });

    expect(tree).toBeDefined();
    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Kalkulator Próbki & Wymiarów');
    expect(text).toContain('OBLICZONA PRÓBA PROJEKTU');
    expect(text).toContain('100'); // 50 cm * 2 st/cm
    expect(text).toContain('168'); // 60 cm * 2.8 rows/cm
    expect(text).toContain('Oczek do nabrania');
    expect(text).toContain('Rzędów do przerobienia');
  });

  it('switches to tension comparison tab and calculates needle recommendations', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <GaugeCalculatorModal visible={true} onClose={jest.fn()} />
      );
    });

    const root = tree.root;
    // Znajdź tab Napięcie wzoru
    const compareTab = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node.props?.children).includes('Napięcie wzoru')
      );
    });

    act(() => {
      compareTab.props.onPress();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('ANALIZA NAPRĘŻENIA DZIANINY');
    expect(text).toContain('Przelicznik nabierania oczek');
  });

  it('switches to templates tab and allows applying a template to the calculator', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <GaugeCalculatorModal
          visible={true}
          onClose={jest.fn()}
          onCreateProject={jest.fn()}
        />
      );
    });

    const root = tree.root;
    // Znajdź tab Szablony
    const templatesTab = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node.props?.children).includes('Szablony')
      );
    });

    act(() => {
      templatesTab.props.onPress();
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Czapka Beanie');
    expect(text).toContain('Kocyk Dziecięcy');
    expect(text).toContain('Szal Prosty');

    // Znajdź przycisk "Zastosuj szablon"
    const applyBtns = root.findAll((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node.props?.children).includes('Zastosuj szablon')
      );
    });

    expect(applyBtns.length).toBeGreaterThan(0);
    act(() => {
      applyBtns[0].props.onPress(); // Czapka Beanie
    });

    // Po zastosowaniu szablonu modal wraca do zakładki kalkulatora
    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('OBLICZONA PRÓBA PROJEKTU');
    expect(text).toContain('Czapka Beanie');
  });

  it('invokes onCreateProject callback with calculated dimensions', () => {
    const mockCreate = jest.fn();
    const mockClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <GaugeCalculatorModal
          visible={true}
          onClose={mockClose}
          onCreateProject={mockCreate}
        />
      );
    });

    const root = tree.root;
    const createBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node.props?.children).includes('Utwórz robótkę')
      );
    });

    act(() => {
      createBtn.props.onPress();
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.any(String),
        craftType: 'knitting',
        targetRows: 168,
        targetStitches: 100,
      })
    );
    expect(mockClose).toHaveBeenCalled();
  });

  it('obsługuje przełączanie jednostek miary (cm / cale), powrót do zakładki kalkulatora i puste dane wejściowe', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <GaugeCalculatorModal visible={true} onClose={jest.fn()} />
      );
    });

    const root = tree.root;

    // Przełącz na cale (inch)
    const inchBtn = root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Cale (inch)'));
    act(() => {
      inchBtn.props.onPress();
    });
    expect(extractAllStrings(tree.toJSON())).toContain('Cale (inch)');

    // Przełącz z powrotem na cm
    const cmBtn = root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Centymetry (cm)'));
    act(() => {
      cmBtn.props.onPress();
    });
    expect(extractAllStrings(tree.toJSON())).toContain('Centymetry (cm)');

    // Przełącz na Napięcie wzoru
    const compareTab = root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Napięcie wzoru'));
    act(() => {
      compareTab.props.onPress();
    });

    // Powrót do zakładki Kalkulatora przez przycisk
    const calcTab = root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Przelicznik'));
    act(() => {
      calcTab.props.onPress();
    });
    expect(extractAllStrings(tree.toJSON())).toContain('1. Twoja próbka ściegu');

    // Wpisanie nieprawidłowej/pustej wartości w polu oczek próbki (powoduje calculationResult === null)
    const inputs = root.findAllByType('TextInput' as any);
    expect(inputs.length).toBeGreaterThan(0);
    act(() => {
      inputs[0].props.onChangeText('');
    });
    expect(extractAllStrings(tree.toJSON())).toContain('Wpisz poprawne wartości liczbowe większe od 0');

    // Przełącz na Napięcie wzoru i wyczyść dane, by sprawdzić comparisonResult === null (linia 119)
    act(() => {
      compareTab.props.onPress();
    });
    const compareInputs = root.findAllByType('TextInput' as any);
    act(() => {
      compareInputs[0].props.onChangeText('');
    });
    expect(extractAllStrings(tree.toJSON())).not.toContain('ANALIZA NAPRĘŻENIA DZIANINY');
  });

  it('obsługuje błędy przeliczania w blokach catch kalkulatora i porównywarki', () => {
    const gaugeModule = require('../../core/gauge-calculator');
    const spyCalc = jest.spyOn(gaugeModule, 'calculateTargetStitchesAndRows').mockImplementation(() => {
      throw new Error('Calc error');
    });

    let tree: any;
    act(() => {
      tree = renderer.create(<GaugeCalculatorModal visible={true} onClose={jest.fn()} />);
    });
    expect(extractAllStrings(tree.toJSON())).toContain('Wpisz poprawne wartości liczbowe większe od 0');
    spyCalc.mockRestore();

    const spyCompare = jest.spyOn(gaugeModule, 'compareGauges').mockImplementation(() => {
      throw new Error('Compare error');
    });

    act(() => {
      tree = renderer.create(<GaugeCalculatorModal visible={true} onClose={jest.fn()} />);
    });
    const root = tree.root;
    const compareTab = root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Napięcie wzoru'));
    act(() => {
      compareTab.props.onPress();
    });
    expect(extractAllStrings(tree.toJSON())).not.toContain('ANALIZA NAPRĘŻENIA DZIANINY');
    spyCompare.mockRestore();
  });
});
