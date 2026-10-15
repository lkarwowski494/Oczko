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
});

