import React from 'react';
import renderer, { act } from 'react-test-renderer';
import * as DocumentPicker from 'expo-document-picker';
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

  it('obsługuje przełączniki trybu wysokiego kontrastu oraz auto-kroku', () => {
    const onDocChange = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <PatternPdfViewer
          initialDocument={MOCK_DOC}
          activeCounterRow={14}
          onDocumentChange={onDocChange}
        />
      );
    });

    const root = tree.root;
    const switches = root.findAll((node: any) => node.type === 'Switch' || node.props?.onValueChange);
    expect(switches.length).toBe(2);

    // 1. Przełącznik auto-kroku (wyłącz)
    act(() => {
      switches[0].props.onValueChange(false);
    });

    expect(onDocChange).toHaveBeenCalledWith(
      expect.objectContaining({ autoStepEnabled: false })
    );

    // 2. Przełącznik wysokiego kontrastu (włącz)
    act(() => {
      switches[1].props.onValueChange(true);
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('PODGLĄD STRONY DOKUMENTU');
  });

  it('obsługuje wczytanie pliku PDF w stanie pustym (fallback picker)', async () => {
    const onDocChange = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <PatternPdfViewer
          initialDocument={null}
          onDocumentChange={onDocChange}
        />
      );
    });

    const root = tree.root;
    const pickBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Wczytaj plik PDF')
    );

    await act(async () => {
      await pickBtn.props.onPress();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('zaimportowany_wzor.pdf');
    expect(onDocChange).toHaveBeenCalled();
  });

  it('aktualizuje pozycję linijki po zmianie rzędu w liczniku (autoStep)', () => {
    const onDocChange = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <PatternPdfViewer
          initialDocument={MOCK_DOC}
          activeCounterRow={14}
          onDocumentChange={onDocChange}
        />
      );
    });

    // Zwiększ rząd z 14 na 15
    act(() => {
      tree.update(
        <PatternPdfViewer
          initialDocument={MOCK_DOC}
          activeCounterRow={15}
          onDocumentChange={onDocChange}
        />
      );
    });

    expect(onDocChange).toHaveBeenCalledWith(
      expect.objectContaining({
        rulerYPercent: expect.any(Number),
      })
    );
  });

  it('obsługuje przesuwanie linijki wyżej (▲ Wyżej)', () => {
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
    const upBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Wyżej')
    );

    act(() => {
      upBtn.props.onPress();
    });

    expect(extractAllStrings(tree.toJSON())).toContain('sweter_nord.pdf');
  });

  it('obsługuje callback onPickDocument oraz DocumentPicker z poprawnym plikiem i błędem', async () => {
    // 1. Z callbackiem onPickDocument
    const onPickMock = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <PatternPdfViewer initialDocument={null} onPickDocument={onPickMock} />
      );
    });
    const pickBtn = tree.root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Wczytaj plik PDF'));
    await act(async () => {
      await pickBtn.props.onPress();
    });
    expect(onPickMock).toHaveBeenCalled();

    // 2. Bez onPickDocument, DocumentPicker zwraca poprawny plik
    const DocumentPicker = require('expo-document-picker');
    const spyPicker = jest.spyOn(DocumentPicker, 'getDocumentAsync').mockResolvedValueOnce({
      canceled: false,
      assets: [
        {
          uri: 'file:///test/pattern.pdf',
          name: 'pattern.pdf',
          size: 2048,
          mimeType: 'application/pdf',
        },
      ],
    });

    const onDocChange = jest.fn();
    act(() => {
      tree = renderer.create(
        <PatternPdfViewer initialDocument={null} onDocumentChange={onDocChange} />
      );
    });
    const pickBtn2 = tree.root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Wczytaj plik PDF'));
    await act(async () => {
      await pickBtn2.props.onPress();
    });
    expect(onDocChange).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: 'pattern.pdf' })
    );
    spyPicker.mockRestore();

    // 3. DocumentPicker rzuca wyjątek (obsługa catch)
    const spyError = jest.spyOn(DocumentPicker, 'getDocumentAsync').mockRejectedValueOnce(
      new Error('Picker crashed')
    );
    let tree3: any;
    act(() => {
      tree3 = renderer.create(
        <PatternPdfViewer initialDocument={null} />
      );
    });
    const pickBtn3 = tree3.root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Wczytaj plik PDF'));
    await act(async () => {
      await pickBtn3.props.onPress();
    });
    spyError.mockRestore();

    // 4. DocumentPicker.getDocumentAsync nie jest zdefiniowane (gałąź else fallback)
    const originalGetDoc = DocumentPicker.getDocumentAsync;
    DocumentPicker.getDocumentAsync = null;
    let tree4: any;
    const onDocChange4 = jest.fn();
    act(() => {
      tree4 = renderer.create(
        <PatternPdfViewer initialDocument={null} onDocumentChange={onDocChange4} />
      );
    });
    const pickBtn4 = tree4.root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Wczytaj plik PDF'));
    await act(async () => {
      await pickBtn4.props.onPress();
    });
    expect(onDocChange4).toHaveBeenCalled();
    DocumentPicker.getDocumentAsync = originalGetDoc;
  });

  it('obsługuje anulowanie wyboru pliku oraz plik niepoprawny w DocumentPicker', async () => {
    // 1. Użytkownik anulował wybór (canceled: true)
    const spyCanceled = jest.spyOn(DocumentPicker, 'getDocumentAsync').mockResolvedValueOnce({
      canceled: true,
      assets: null,
    });
    let tree: any;
    act(() => {
      tree = renderer.create(<PatternPdfViewer initialDocument={null} />);
    });
    const pickBtn = tree.root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Wczytaj plik PDF'));
    await act(async () => {
      await pickBtn.props.onPress();
    });
    expect(extractAllStrings(tree.toJSON())).toContain('Brak wczytanego wzoru');
    spyCanceled.mockRestore();

    // 2. Plik niepoprawny (np. za duży lub nieobsługiwany)
    const spyInvalid = jest.spyOn(DocumentPicker, 'getDocumentAsync').mockResolvedValueOnce({
      canceled: false,
      assets: [
        {
          uri: 'file:///bad.exe',
          name: 'bad.exe',
          size: 50 * 1024 * 1024,
          mimeType: 'application/octet-stream',
          lastModified: Date.now(),
        },
      ],
    } as any);
    let tree2: any;
    act(() => {
      tree2 = renderer.create(<PatternPdfViewer initialDocument={null} />);
    });
    const pickBtn2 = tree2.root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Wczytaj plik PDF'));
    await act(async () => {
      await pickBtn2.props.onPress();
    });
    expect(extractAllStrings(tree2.toJSON())).toContain('Brak wczytanego wzoru');
    spyInvalid.mockRestore();
  });

  it('obsługuje formatowanie rozmiaru w KB i brak rozmiaru, oraz krańce stron', () => {
    // 1. Rozmiar w KB oraz pierwsza strona (prev button disabled)
    const docKB: PatternDocument = {
      ...MOCK_DOC,
      currentPage: 1,
      totalPages: 1,
      fileSize: 500 * 1024,
    };
    let tree: any;
    act(() => {
      tree = renderer.create(<PatternPdfViewer initialDocument={docKB} />);
    });
    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('500 KB');

    // Próba kliknięcia prev/next gdy jesteśmy na 1 z 1
    const prevBtn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Poprzednia strona');
    const nextBtn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Następna strona');
    act(() => {
      prevBtn.props.onPress();
      nextBtn.props.onPress();
    });
    expect(extractAllStrings(tree.toJSON())).toContain('Strona 1 z 1');

    // 2. Brak rozmiaru pliku (fileSize = 0) oraz aktualizacja initialDocument przez props
    const docNoSize: PatternDocument = {
      ...MOCK_DOC,
      currentPage: 1,
      totalPages: 3,
      fileSize: 0,
    };
    act(() => {
      tree.update(<PatternPdfViewer initialDocument={docNoSize} />);
    });
    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('sweter_nord.pdf');
  });

  it('obsługuje brak modułu expo-document-picker (try-catch require)', () => {
    jest.resetModules();
    jest.doMock('expo-document-picker', () => {
      throw new Error('Module not available');
    });
    const FallbackViewer = require('../PatternPdfViewer').default;
    expect(FallbackViewer).toBeDefined();
    jest.dontMock('expo-document-picker');
    jest.resetModules();
  });
});

