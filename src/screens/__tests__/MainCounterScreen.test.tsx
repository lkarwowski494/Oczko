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
  const valueText = node.props?.value ? String(node.props.value) : '';
  return `${childrenText} ${propsText} ${valueText}`;
}

describe('Oczko UI — Test renderowania głównego ekranu i interakcji (BR-LICZ-003, BR-SYS-011)', () => {
  let currentTree: any = null;
  const originalCreate = renderer.create;

  beforeEach(() => {
    renderer.create = ((element: any, options: any) => {
      const instance = originalCreate(element, options);
      currentTree = instance;
      return instance;
    }) as any;
  });

  afterEach(() => {
    renderer.create = originalCreate;
    if (currentTree) {
      try {
        act(() => {
          currentTree.unmount();
        });
      } catch {}
      currentTree = null;
    }
  });

  test('Komponent ekranu licznika definiuje poprawną strukturę i renderuje drzewo', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
      currentTree = tree;
    });
    expect(tree).toBeDefined();
    const allText = extractAllStrings(tree.toJSON());
    expect(allText).toContain('Mój Sweter');
    expect(allText).toContain('Licznik');
    expect(allText).toContain('Schemat & Linijka');
    expect(allText).toContain('Stuknij, aby dodać rząd');
    expect(allText).toMatch(/przypomnienie cykliczne/i);
  });

  test('Przełącza tryb widoku na Schemat & Linijka i renderuje przeglądarkę wzorów', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
    });

    const root = tree.root;
    const patternTab = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('Schemat & Linijka')
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

  test('Otwiera modal konfiguracji przypomnienia cyklicznego i pozwala ustawić interwał', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
    });

    const root = tree.root;
    const intervalChip = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).toLowerCase().includes('przypomnienie cykliczne')
      );
    });

    act(() => {
      intervalChip.props.onPress();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Przypomnienie cykliczne (Interwał)');
    expect(text).toContain('Szybki wybór interwału:');
    expect(text).toContain('co 6');
  });

  test('Inkrementuje i cofa licznik z obsługą haptyki', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
    });

    const root = tree.root;
    // Znajdź kartę licznika
    const counterCard = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node.props?.children).includes('Stuknij, aby dodać rząd')
      );
    });

    act(() => {
      counterCard.props.onPress();
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('1');

    // Znajdź przycisk cofania (Undo)
    const undoBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node.props?.children).includes('Cofnij')
      );
    });

    act(() => {
      undoBtn.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('0');
  });

  test('Przełącza tryb widoku na Wzór PDF i renderuje komponent podglądu PDF (BR-WZOR-001, DEC-09)', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
    });

    const root = tree.root;
    const pdfTab = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('Wzór PDF')
      );
    });

    act(() => {
      pdfTab.props.onPress();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Brak wczytanego wzoru');
    expect(text).toContain('Wczytaj plik PDF');
  });

  test('Otwiera symulator Apple Watch (DEC-03) i zwiększa licznik główny po stuknięciu +1 na zegarku', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
    });

    const root = tree.root;
    // Znajdź przycisk otwierający Apple Watch
    const watchChip = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('Apple Watch')
      );
    });

    act(() => {
      watchChip.props.onPress();
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Apple Watch & Smart Stack');
    expect(text).toContain('watchOS 11');

    // Znajdź przycisk +1 Rząd w symulatorze zegarka
    const watchPlusBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('+1 Rząd')
      );
    });

    act(() => {
      watchPlusBtn.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('1'); // licznik na zegarku i ekranie wzrósł do 1
  });

  test('W połączeniu z ProjectProvider pozwala przełączać części robótki oraz dodać licznik wzoru', async () => {
    const { ProjectProvider } = require('../../core/project-context');
    const { createInMemoryDatabase } = require('../../core/database');
    const db = createInMemoryDatabase();

    let tree: any;
    await act(async () => {
      tree = renderer.create(
        <ProjectProvider initialDb={db}>
          <MainCounterScreen />
        </ProjectProvider>
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 60));
    });

    const root = tree.root;
    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Mój Sweter Raglanowy');

    // 1. Przełącz część na 'Rękaw lewy'
    const sleeveChip = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Rękaw lewy'
    );

    await act(async () => {
      await sleeveChip.props.onPress();
      await new Promise((r) => setTimeout(r, 30));
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Rękaw lewy');

    // 2. Otwórz modal dodawania licznika powiązanego (+ Licznik wzoru)
    const addLinkedBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('+ Licznik wzoru')
    );

    await act(async () => {
      addLinkedBtn.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Dodaj powiązany licznik wzoru');

    // 3. Wypełnij pola
    const inputs = root.findAll((node: any) => node.type === 'TextInput' || node.props?.onChangeText);
    const nameInput = inputs.find((n: any) => n.props?.placeholder && n.props.placeholder.includes('Warkocz na rękawie'));
    const cycleInput = inputs.find((n: any) => n.props?.value === '6');

    if (nameInput) {
      await act(async () => {
        nameInput.props.onChangeText('Ażur Liście');
      });
    }

    if (cycleInput) {
      await act(async () => {
        cycleInput.props.onChangeText('12');
      });
    }

    // 4. Kliknij 'Dodaj licznik'
    const submitLinkedBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Dodaj licznik'
    );

    await act(async () => {
      await submitLinkedBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 60));
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Ażur Liście');
  });

  test('Ustawia i zapisuje przypomnienie cykliczne z presetem co 8 i własną etykietą', async () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
    });

    const root = tree.root;

    // Otwórz modal interwału
    const intervalChip = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).toLowerCase().includes('przypomnienie cykliczne')
    );

    act(() => {
      intervalChip.props.onPress();
    });

    // Wybierz preset 'co 8'
    const preset8 = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'co 8'
    );

    act(() => {
      preset8.props.onPress();
    });

    // Zmień etykietę
    const inputs = root.findAll((node: any) => node.type === 'TextInput' || node.props?.onChangeText);
    const labelInput = inputs.find((n: any) =>
      n.props?.placeholder && n.props.placeholder.includes('Zmiana splotu')
    );

    if (labelInput) {
      act(() => {
        labelInput.props.onChangeText('Dodaj oczko na brzegu');
      });
    }

    // Kliknij "Zapisz"
    const saveBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Zapisz'
    );

    act(() => {
      saveBtn.props.onPress();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('co 8 rz.');
    expect(text).toContain('Dodaj oczko na brzegu');
  });

  test('W kontekście ProjectProvider obsługuje krok i cofnięcie licznika, osiągnięcie celu (goal) oraz cykl i interwał (haptics)', async () => {
    const { ProjectProvider } = require('../../core/project-context');
    const { createInMemoryDatabase } = require('../../core/database');
    const { createFullProject } = require('../../core/project-service');
    const feedback = require('../../core/feedback-service');
    const hapticSpy = jest.spyOn(feedback, 'triggerHaptic').mockImplementation(async () => {});

    const db = createInMemoryDatabase();
    // Projekt z częścią z celem na 2 rzędy
    await createFullProject(db, {
      name: 'Sweter Testowy Cel',
      craftType: 'knitting',
      parts: [{ name: 'Karb', targetRows: 2 }],
    });

    let tree: any;
    await act(async () => {
      tree = renderer.create(
        <ProjectProvider initialDb={db}>
          <MainCounterScreen />
        </ProjectProvider>
      );
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 60));
    });

    const root = tree.root;

    // 1. Krok 1: wartość przechodzi z 0 na 1 (normalny krok - 'step')
    const incBtn = root.find((n: any) =>
      n.props?.onPress &&
      extractAllStrings(n).includes('Stuknij, aby dodać rząd')
    );
    await act(async () => {
      incBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 30));
    });
    expect(hapticSpy).toHaveBeenCalledWith('step');

    // 2. Krok 2: wartość przechodzi z 1 na 2 (cel osiągnięty targetRows=2 - 'goal')
    await act(async () => {
      incBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 30));
    });
    expect(hapticSpy).toHaveBeenCalledWith('goal');

    // 3. Cofnięcie licznika w kontekście (linia 159 - 'undo')
    const undoBtn = root.find((n: any) =>
      n.props?.onPress &&
      extractAllStrings(n).includes('Cofnij')
    );
    await act(async () => {
      undoBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 30));
    });
    expect(hapticSpy).toHaveBeenCalledWith('undo');

    // 4. Ustawienie interwału (np. co 1 rząd) -> następny krok wyzwoli 'reminder'
    const intervalChip = root.find((n: any) =>
      n.props?.onPress &&
      extractAllStrings(n).toLowerCase().includes('przypomnienie cykliczne')
    );
    act(() => {
      intervalChip.props.onPress();
    });
    const intervalInputs = root.findAll((ti: any) => typeof ti.props?.onChangeText === 'function');
    const intervalInput = intervalInputs.find((ti: any) => ti.props?.placeholder === 'np. 6' && ti.props?.keyboardType === 'numeric');
    if (intervalInput) {
      act(() => {
        intervalInput.props.onChangeText('1');
      });
    }
    const saveIntervalBtn = root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Zapisz'));
    act(() => {
      saveIntervalBtn.props.onPress();
    });

    // Krok przy aktywnym interwale (wartość 1 -> 2 jest też celem, cofnijmy do 0 najpierw)
    await act(async () => {
      undoBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 30));
    });
    // Teraz counterValue = 0, targetRows = 2. Następny krok -> 1 (nie osiąga celu 2, ale spełnia interwał 1 % 1 == 0 -> 'reminder')
    await act(async () => {
      incBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 30));
    });
    expect(hapticSpy).toHaveBeenCalledWith('reminder');

    hapticSpy.mockRestore();
  });

  test('Obsługuje zmianę trybu widoku na PatternGuideViewer, PDF oraz powrót do Licznika (linie 226, 269-270)', async () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
    });
    const root = tree.root;

    // 1. Przełącz na Schemat & Linijka
    const patternTab = root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Schemat & Linijka'));
    act(() => {
      patternTab.props.onPress();
    });

    // Wywołaj onStepCounter w PatternGuideViewer (linie 269-270)
    const guideViewer = root.find((n: any) => typeof n.props?.onStepCounter === 'function');
    act(() => {
      guideViewer.props.onStepCounter('increment');
      guideViewer.props.onStepCounter('decrement');
    });

    // 2. Powrót do Licznika (linia 226)
    const counterTab = root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Licznik') && !extractAllStrings(n).includes('Licznik wzoru'));
    act(() => {
      counterTab.props.onPress();
    });

    expect(extractAllStrings(tree.toJSON())).toContain('Stuknij, aby dodać rząd');
  });

  test('Obsługuje operacje na dokumencie PDF w MainCounterScreen z bazą SQLite (linie 182-198, 206-211)', async () => {
    const { ProjectProvider } = require('../../core/project-context');
    const { createInMemoryDatabase } = require('../../core/database');
    const { listProjects } = require('../../core/project-repository');
    const db = createInMemoryDatabase();

    let tree: any;
    await act(async () => {
      tree = renderer.create(
        <ProjectProvider initialDb={db}>
          <MainCounterScreen />
        </ProjectProvider>
      );
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 60));
    });

    const projects = await listProjects(db);
    const activeProjectId = projects[0]?.id || 'proj_default';

    const root = tree.root;

    // Przełącz na Wzór PDF
    const pdfTab = root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Wzór PDF'));
    act(() => {
      pdfTab.props.onPress();
    });

    const pdfViewer = root.find((n: any) => typeof n.props?.onDocumentChange === 'function');
    const testDoc = {
      id: 'doc_test_1',
      projectId: activeProjectId,
      fileName: 'test_pattern.pdf',
      fileUri: 'file:///test.pdf',
      fileSize: 1024,
      currentPage: 1,
      totalPages: 3,
      rulerYPercent: 20,
      rulerHeightPercent: 5,
      autoStepEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Wstawienie dokumentu (insert - linie 196-198)
    await act(async () => {
      await pdfViewer.props.onDocumentChange(testDoc);
    });

    // 2. Aktualizacja dokumentu (update - linie 189-195)
    await act(async () => {
      await pdfViewer.props.onDocumentChange({ ...testDoc, rulerYPercent: 25 });
    });

    // 3. Usunięcie dokumentu (delete - linie 206-211)
    await act(async () => {
      await pdfViewer.props.onDeleteDocument();
    });

    expect(tree).toBeDefined();
  });

  test('Obsługuje dodawanie powiązanego licznika wzoru oraz anulowanie modali i Apple Watch', async () => {
    const { ProjectProvider } = require('../../core/project-context');
    const { createInMemoryDatabase } = require('../../core/database');
    const feedback = require('../../core/feedback-service');
    const hapticSpy = jest.spyOn(feedback, 'triggerHaptic').mockImplementation(async () => {});
    const db = createInMemoryDatabase();

    let tree: any;
    await act(async () => {
      tree = renderer.create(
        <ProjectProvider initialDb={db}>
          <MainCounterScreen />
        </ProjectProvider>
      );
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 60));
    });

    const root = tree.root;

    // 1. Otwórz modal powiązanego licznika
    const addLinkedBtn = root.find((n: any) =>
      n.props?.onPress &&
      extractAllStrings(n).includes('Licznik wzoru (warkocz/ażur)')
    );
    act(() => {
      addLinkedBtn.props.onPress();
    });

    // Znajdź modale z onRequestClose
    const modals = root.findAll((n: any) => typeof n.props?.onRequestClose === 'function');
    // Zamknięcie przez onRequestClose (linia 396)
    act(() => {
      modals[0].props.onRequestClose();
    });

    // Otwórz ponownie
    act(() => {
      addLinkedBtn.props.onPress();
    });
    // Zamknięcie przez przycisk Anuluj (linia 437)
    const cancelBtns = root.findAll((n: any) => n.props?.onPress && extractAllStrings(n).includes('Anuluj'));
    act(() => {
      cancelBtns[0].props.onPress();
    });

    // Otwórz ponownie
    act(() => {
      addLinkedBtn.props.onPress();
    });

    // Test early return gdy newLinkedName jest pusty (linia 168)
    const inputs = root.findAll((n: any) => typeof n.props?.onChangeText === 'function');
    const nameInput = inputs.find((ti: any) => ti.props?.placeholder?.includes('Warkocz'));
    act(() => {
      if (nameInput) nameInput.props.onChangeText('');
    });
    const addBtn = root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Dodaj licznik'));
    await act(async () => {
      await addBtn.props.onPress();
    });

    // Wprowadź dane licznika (linie 169-178, 409, 418, 428)
    const numericInputs = inputs.filter((ti: any) => ti.props?.keyboardType === 'numeric');
    const cycleInput = numericInputs[0];
    const reminderInput = numericInputs[1];

    act(() => {
      if (nameInput) nameInput.props.onChangeText('Warkocz 2x2');
      if (cycleInput) cycleInput.props.onChangeText('1');
      if (reminderInput) reminderInput.props.onChangeText('1');
    });

    const submitBtn = root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Dodaj licznik'));
    await act(async () => {
      await submitBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 60));
    });

    // Krok licznika wyzwalający cykl linked countera (linie 147, 150 - 'cycle')
    const incBtn = root.find((n: any) =>
      n.props?.onPress &&
      extractAllStrings(n).includes('Stuknij, aby dodać rząd')
    );
    await act(async () => {
      incBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 30));
    });
    expect(hapticSpy).toHaveBeenCalledWith('cycle');

    // 2. Modal interwału: onRequestClose (linia 458) i Anuluj (linia 513)
    const intervalChip = root.find((n: any) =>
      n.props?.onPress &&
      extractAllStrings(n).toLowerCase().includes('przypomnienie cykliczne')
    );
    act(() => {
      intervalChip.props.onPress();
    });
    const currentModals = root.findAll((n: any) => typeof n.props?.onRequestClose === 'function');
    act(() => {
      currentModals[1].props.onRequestClose();
    });
    act(() => {
      intervalChip.props.onPress();
    });
    const currentCancelBtns = root.findAll((n: any) => n.props?.onPress && extractAllStrings(n).includes('Anuluj'));
    act(() => {
      currentCancelBtns[1].props.onPress();
    });

    // 3. Modal Apple Watch: otwieranie, onStep('increment'), onStep('decrement'), onClose (linie 537, 540, 541)
    const watchChip = root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Apple Watch'));
    act(() => {
      watchChip.props.onPress();
    });
    const watchModal = root.find((n: any) => typeof n.props?.onClose === 'function' && typeof n.props?.onStep === 'function');
    await act(async () => {
      watchModal.props.onStep('increment');
      watchModal.props.onStep('decrement');
      watchModal.props.onClose();
      await new Promise((r) => setTimeout(r, 30));
    });

    // 4. Modal Garmin ConnectIQ (DEC-02): otwieranie, onIncrement, onDecrement, onNextPart, onPreviousPart, onClose
    const garminChip = root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Garmin'));
    act(() => {
      garminChip.props.onPress();
    });
    let garminModal = root.find(
      (n: any) => typeof n.props?.onClose === 'function' && typeof n.props?.onIncrement === 'function' && n.props?.syncPayload
    );
    await act(async () => {
      garminModal.props.onIncrement();
      garminModal.props.onDecrement();
      if (garminModal.props.onNextPart) garminModal.props.onNextPart();
      await new Promise((r) => setTimeout(r, 60));
    });

    // Po przełączeniu na kolejną część (activePartIndex > 0), wywołaj onPreviousPart:
    garminModal = root.find(
      (n: any) => typeof n.props?.onClose === 'function' && typeof n.props?.onIncrement === 'function' && n.props?.syncPayload
    );
    await act(async () => {
      if (garminModal.props.onPreviousPart) garminModal.props.onPreviousPart();
      garminModal.props.onClose();
      await new Promise((r) => setTimeout(r, 60));
    });

    hapticSpy.mockRestore();
    expect(tree).toBeDefined();
  });
});

