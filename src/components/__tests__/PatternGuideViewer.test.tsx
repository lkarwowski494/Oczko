import React from 'react';
import renderer, { act } from 'react-test-renderer';
import PatternGuideViewer from '../PatternGuideViewer';

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

describe('PatternGuideViewer (DEC-09, NFR-DOST-009)', () => {
  it('renders default cable pattern with active row guide pinned to counter', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<PatternGuideViewer activeCounterRow={1} />);
    });

    expect(tree).toBeDefined();
    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Warkocz C6F');
    expect(text).toMatch(/Rząd\s*1\s*z\s*8/);
    expect(text).toContain('Prawa strona / RS');
    expect(text).toContain('LINIJKA');
    expect(text).toContain('DIAGRAM DZIEWIARSKI');
    expect(text).toContain('Legenda symboli CYC');
  });

  it('updates highlighted row and instruction when active counter row advances', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<PatternGuideViewer activeCounterRow={5} />);
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toMatch(/Rząd\s*5\s*z\s*8/);
    expect(text).toContain('C6F');
    expect(text).toContain('3 na drut pom.');
  });


  it('calls onStepCounter when next row button is pressed with pinned ruler', () => {
    const mockStep = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <PatternGuideViewer activeCounterRow={2} onStepCounter={mockStep} />
      );
    });

    const root = tree.root;
    // Znajdź przycisk "Następny rząd ▶"
    const nextButtons = root.findAll((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node.props?.children).includes('Następny rząd')
      );
    });

    expect(nextButtons.length).toBeGreaterThan(0);
    act(() => {
      nextButtons[0].props.onPress();
    });

    expect(mockStep).toHaveBeenCalledWith('increment');
  });

  it('allows switching to lace pattern chart', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<PatternGuideViewer activeCounterRow={1} />);
    });

    const root = tree.root;
    const laceChip = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node.props?.children).includes('Ażur Romby')
      );
    });

    act(() => {
      laceChip.props.onPress();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Ażur Romby');
    expect(text).toMatch(/Rząd\s*1\s*z\s*6/);
  });

  it('obsługuje poprzedni rząd (decrement) oraz ręczną nawigację po odpięciu linijki', () => {
    const mockStep = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <PatternGuideViewer activeCounterRow={4} onStepCounter={mockStep} />
      );
    });

    const root = tree.root;

    // 1. Kliknięcie poprzedniego rzędu w trybie przypiętym
    const prevBtn = root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Poprzedni rząd'));
    act(() => {
      prevBtn.props.onPress();
    });
    expect(mockStep).toHaveBeenCalledWith('decrement');

    // 2. Kliknięcie bezpośrednio na wiersz diagramu (odpina linijkę i ustawia ręczny rząd)
    const rowButtons = root.findAll((n: any) => n.props?.activeOpacity === 0.8 && n.props?.onPress);
    expect(rowButtons.length).toBeGreaterThan(0);
    act(() => {
      rowButtons[0].props.onPress(); // Kliknięto rząd R8
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Linijka przesuwana niezależnie');

    // 3. W trybie ręcznym: Następny rząd (z 8 zawija do 1) -> test linii 53
    const nextBtn = root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Następny rząd'));
    act(() => {
      nextBtn.props.onPress();
    });
    text = extractAllStrings(tree.toJSON());
    expect(text).toMatch(/Rząd\s*1\s*z\s*8/);

    // 4. W trybie ręcznym: Poprzedni rząd (z 1 zawija do 8) -> test linii 61
    act(() => {
      prevBtn.props.onPress();
    });
    text = extractAllStrings(tree.toJSON());
    expect(text).toMatch(/Rząd\s*8\s*z\s*8/);

    // 5. Poprzedni rząd z 8 do 7
    act(() => {
      prevBtn.props.onPress();
    });
    text = extractAllStrings(tree.toJSON());
    expect(text).toMatch(/Rząd\s*7\s*z\s*8/);
  });
});

