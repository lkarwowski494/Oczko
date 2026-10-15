import React from 'react';
import renderer, { act } from 'react-test-renderer';
import PatternPdfViewer from '../PatternPdfViewer';
import { PatternDocument } from '../../core/pattern-document-service';

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

const MOCK_DOC: PatternDocument = {
  id: 'doc_1',
  projectId: 'proj_1',
  fileName: 'sweter_nord.pdf',
  fileUri: 'file:///path/sweter_nord.pdf',
  fileSize: 1048576,
  currentPage: 2,
  totalPages: 6,
  rulerYPercent: 35.0,
  rulerHeightPercent: 6.0,
  autoStepEnabled: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('PatternPdfViewer (BR-WZOR-001, DEC-09, NFR-DOST-009)', () => {
  it('renderuje stan pusty, gdy brak wczytanego dokumentu PDF', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<PatternPdfViewer initialDocument={null} />);
    });

    expect(tree).toBeDefined();
    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Brak wczytanego wzoru');
    expect(text).toContain('Wczytaj plik PDF');
  });

  it('renderuje zaimportowany dokument z nazwą pliku, stronami i linijką', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <PatternPdfViewer
          initialDocument={MOCK_DOC}
          activeCounterRow={14}
        />
      );
    });

    expect(tree).toBeDefined();
    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('sweter_nord.pdf');
    expect(text).toContain('Strona 2 z 6');
    expect(text).toContain('Rząd 14');
    expect(text).toContain('Auto-krok');
  });

  it('obsługuje przesuwanie linijki w górę i w dół przyciskami', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <PatternPdfViewer
          initialDocument={MOCK_DOC}
          activeCounterRow={14}
        />
      );
    });

    const root = tree.root;
    // Znajdź przycisk przesunięcia w dół (Niżej)
    const downBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('Niżej')
      );
    });

    act(() => {
      downBtn.props.onPress();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('sweter_nord.pdf');
  });

  it('obsługuje zmianę stron (następna / poprzednia strona)', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <PatternPdfViewer
          initialDocument={MOCK_DOC}
          activeCounterRow={14}
        />
      );
    });

    const root = tree.root;
    // Znajdź przycisk następnej strony
    const nextPageBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('▶')
      );
    });

    act(() => {
      nextPageBtn.props.onPress();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Strona 3 z 6');

    // Znajdź przycisk poprzedniej strony
    const prevPageBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('◀')
      );
    });

    act(() => {
      prevPageBtn.props.onPress();
    });

    const textAfterPrev = extractAllStrings(tree.toJSON());
    expect(textAfterPrev).toContain('Strona 2 z 6');
  });

  it('obsługuje reset linijki na górę strony (↺ Na górę)', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <PatternPdfViewer
          initialDocument={MOCK_DOC}
          activeCounterRow={14}
        />
      );
    });

    const root = tree.root;
    const resetBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('Na górę')
      );
    });

    act(() => {
      resetBtn.props.onPress();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('15%');
  });

  it('wywołuje onDeleteDocument po kliknięciu Usuń', () => {
    const onDeleteMock = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <PatternPdfViewer
          initialDocument={MOCK_DOC}
          onDeleteDocument={onDeleteMock}
        />
      );
    });

    const root = tree.root;
    const deleteBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('Usuń')
      );
    });

    act(() => {
      deleteBtn.props.onPress();
    });

    expect(onDeleteMock).toHaveBeenCalledTimes(1);
  });
});
