import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ProjectsScreen from '../../../app/(tabs)/projects';
import { ProjectProvider, useProject } from '../../core/project-context';
import { createInMemoryDatabase } from '../../core/database';
import { ShapingCalculatorModal } from '../../components/ShapingCalculatorModal';
import { EaseCalculatorModal } from '../../components/EaseCalculatorModal';
import { RaglanCalculatorModal } from '../../components/RaglanCalculatorModal';
import { HatCalculatorModal } from '../../components/HatCalculatorModal';
import { setLang } from '../../core/i18n';

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

jest.setTimeout(15000);

describe('ProjectsScreen — Pełne testy interakcji i formularzy (BR-PROJ-001..005)', () => {
  let tree: any = null;

  beforeEach(() => {
    setLang('pl');
  });

  afterEach(() => {
    if (tree) {
      try {
        act(() => {
          tree.unmount();
        });
      } catch (_e) {}
      tree = null;
    }
  });

  async function renderProjectsScreen(db = createInMemoryDatabase()) {
    let capturedCtx: any = null;
    function CtxCapture() {
      capturedCtx = useProject();
      return null;
    }

    await act(async () => {
      tree = renderer.create(
        <ProjectProvider initialDb={db}>
          <CtxCapture />
          <ProjectsScreen />
        </ProjectProvider>
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 80));
    });

    return { tree, db, root: tree.root, projectCtx: capturedCtx };
  }
  it('otwiera modal nowego projektu, zmienia technikę na szydełko, wypełnia pola i tworzy projekt', async () => {
    const { tree } = await renderProjectsScreen();
    const root = tree.root;

    // 1. Znajdź przycisk "+ Nowy projekt"
    const newProjBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        node.props?.children?.props?.children === '+ Nowy projekt'
      );
    });

    await act(async () => {
      newProjBtn.props.onPress();
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Nowa Robótka');
    expect(text).toContain('Typ techniki');

    // 2. Znajdź przycisk zmiany techniki na Szydełko
    const crochetBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('Szydełko (Crochet)')
      );
    });

    await act(async () => {
      crochetBtn.props.onPress();
    });

    // 3. Wypełnij pola tekstowe
    const textInputs = root.findAll((node: any) => node.type === 'TextInput' || node.props?.onChangeText);
    const nameInput = textInputs.find((node: any) =>
      node.props?.placeholder && node.props.placeholder.includes('Mój Kardigan')
    );
    const partNameInput = textInputs.find((node: any) =>
      node.props?.placeholder && node.props.placeholder.includes('Korpus / Tył')
    );
    const targetRowsInput = textInputs.find((node: any) =>
      node.props?.placeholder && node.props.placeholder.includes('120')
    );

    expect(nameInput).toBeDefined();
    expect(partNameInput).toBeDefined();
    expect(targetRowsInput).toBeDefined();

    await act(async () => {
      nameInput.props.onChangeText('Chusta Szydełkowa');
      partNameInput.props.onChangeText('Trójkąt początkowy');
      targetRowsInput.props.onChangeText('60');
    });

    // 4. Kliknij "Utwórz projekt"
    const submitBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('Utwórz projekt')
      );
    });

    await act(async () => {
      await submitBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 60));
    });

    // 5. Sprawdź, czy nowy projekt pojawił się na liście
    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Chusta Szydełkowa');
    expect(text).toContain('SZYDEŁKO');
    expect(text).toContain('Trójkąt początkowy');
    expect(text).toContain('60 rz.');
  });

  it('obsługuje dodawanie nowej części do istniejącego projektu (+ Część)', async () => {
    const { tree } = await renderProjectsScreen();
    const root = tree.root;

    // Precyzyjnie znajdź dedykowany przycisk "+ Część" na karcie robótki
    const addPartBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        node.props?.children?.props?.children === '+ Część'
      );
    });

    await act(async () => {
      addPartBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 40));
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Dodaj nową część robótki');

    // Znajdź pola w modalu dodawania części
    const partInputs = root.findAll((node: any) => node.type === 'TextInput' || node.props?.onChangeText);
    const addedNameInput = partInputs.find((node: any) =>
      node.props?.placeholder && node.props.placeholder.includes('Rękaw lewy')
    );
    const addedTargetInput = partInputs.find((node: any) =>
      node.props?.placeholder && node.props.placeholder.includes('80')
    );

    expect(addedNameInput).toBeDefined();
    expect(addedTargetInput).toBeDefined();

    await act(async () => {
      addedNameInput.props.onChangeText('Rękaw Prawy');
      addedTargetInput.props.onChangeText('90');
    });

    // Zatwierdź dodanie części
    const submitAddPartBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        node.props?.children?.props?.children === 'Dodaj część'
      );
    });

    await act(async () => {
      await submitAddPartBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 60));
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Rękaw Prawy');
    expect(text).toContain('90 rz.');
  });

  it('obsługuje otwarcie modalu estymatora zużycia włóczki z paska górnego oraz karty projektu', async () => {
    const { tree } = await renderProjectsScreen();
    const root = tree.root;

    // 1. Otwórz z paska górnego (styles.gaugeButton -> #F0ECE8)
    const topBarUsageBtn = root.find((n: any) =>
      n.props?.onPress &&
      n.props?.style?.backgroundColor === '#F0ECE8' &&
      extractAllStrings(n).includes('⚖️ Zużycie')
    );

    await act(async () => {
      topBarUsageBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 40));
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Kalkulator Zużycia Włóczki');

    // Zamknij modal estymatora przyciskiem ✕
    const closeBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('✕')
      );
    });

    await act(async () => {
      closeBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 40));
    });

    // 2. Otwórz z karty projektu (styles.cardShareButton -> #FAF5F0)
    const cardUsageBtn = root.find((n: any) =>
      n.props?.onPress &&
      n.props?.style?.backgroundColor === '#FAF5F0' &&
      extractAllStrings(n).includes('⚖️ Zużycie')
    );

    await act(async () => {
      cardUsageBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 40));
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Kalkulator Zużycia Włóczki');

    // Bezpośrednie wywołanie onClose na YarnUsageEstimatorModal (linie 475-476)
    const yarnModal = root.find((node: any) => typeof node.props?.availableYarns !== 'undefined');
    await act(async () => {
      yarnModal.props.onClose();
    });

    // 3. Obsługa onRequestClose w modalach
    const modals = root.findAll((node: any) => node.type === 'Modal' || node.props?.onRequestClose);
    modals.forEach((m: any) => {
      if (typeof m.props?.onRequestClose === 'function') {
        act(() => {
          m.props.onRequestClose();
        });
      }
    });
  });

  it('obsługuje otwarcie modalu kalkulatora próbki (📐 Próbka)', async () => {
    const { tree } = await renderProjectsScreen();
    const root = tree.root;

    const gaugeBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        node.props?.children?.props?.children === '📐 Próbka'
      );
    });

    await act(async () => {
      gaugeBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 30));
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Kalkulator Próbki & Wymiarów');
  });

  it('obsługuje otwarcie modalu karty projektu (📊 Karta) i zmianę statusu robótki', async () => {
    const { tree } = await renderProjectsScreen();
    const root = tree.root;

    // Precyzyjnie znajdź przycisk "📊 Karta" na karcie robótki
    const shareCardBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        node.props?.children?.props?.children === '📊 Karta'
      );
    });

    await act(async () => {
      shareCardBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 40));
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Karta Robótki');
    expect(text).toContain('W TRAKCIE');

    // Zmiana statusu na Ukończony (FO)
    const foBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('Oznacz jako ukończony (FO)')
      );
    });

    await act(async () => {
      await foBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 60));
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('FO (UKOŃCZONY)');
  });

  it('obsługuje kliknięcie w przycisk Licznik na karcie projektu', async () => {
    const { tree } = await renderProjectsScreen();
    const root = tree.root;

    const counterBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        node.props?.children?.props?.children === 'Licznik 🧶'
      );
    });

    await act(async () => {
      await counterBtn.props.onPress();
    });

    expect(tree).toBeDefined();
  });

  it('obsługuje wybór projektu kliknięciem w kartę (handleSelectProject)', async () => {
    const { tree } = await renderProjectsScreen();
    const root = tree.root;

    // Kliknij całą kartę projektu
    const card = root.find((n: any) =>
      n.props?.onPress &&
      extractAllStrings(n).includes('Mój Sweter Raglanowy')
    );

    await act(async () => {
      card.props.onPress();
    });

    expect(tree).toBeDefined();
  });

  it('obsługuje anulowanie modali nowego projektu i nowej części oraz przełącznik drutów', async () => {
    const { tree } = await renderProjectsScreen();
    const root = tree.root;

    // 1. Otwórz modal nowego projektu
    const newProjBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === '+ Nowy projekt'
    );
    await act(async () => {
      newProjBtn.props.onPress();
    });

    // Przełącz na druty (linia 330)
    const knittingBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Druty (Knitting)')
    );
    await act(async () => {
      knittingBtn.props.onPress();
    });

    // Anuluj modal nowego projektu (linia 383)
    const cancelNewProjBtn = root.findAll((n: any) =>
      n.props?.onPress &&
      extractAllStrings(n).includes('Anuluj')
    )[0];
    await act(async () => {
      cancelNewProjBtn.props.onPress();
    });

    // 2. Otwórz modal dodawania części i anuluj (linia 437)
    const addPartBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === '+ Część'
    );
    await act(async () => {
      addPartBtn.props.onPress();
    });

    const cancelAddPartBtn = root.findAll((n: any) =>
      n.props?.onPress &&
      extractAllStrings(n).includes('Anuluj')
    )[0];
    await act(async () => {
      cancelAddPartBtn.props.onPress();
    });

    expect(tree).toBeDefined();
  });

  it('obsługuje tworzenie projektu z próbki ściegu (handleCreateProjectFromGauge) oraz zamknięcie modali', async () => {
    const { tree } = await renderProjectsScreen();
    const root = tree.root;

    // Znajdź GaugeCalculatorModal
    const gaugeModal = root.find((n: any) => typeof n.props?.onCreateProject === 'function');
    await act(async () => {
      await gaugeModal.props.onCreateProject({
        name: 'Sweter z próbki',
        craftType: 'knitting',
        targetRows: 160,
      });
      await gaugeModal.props.onClose();
    });

    // Znajdź ProjectShareCardModal i wywołaj onClose
    const shareModal = root.find((n: any) => typeof n.props?.onStatusChange === 'function' && typeof n.props?.onClose === 'function');
    await act(async () => {
      shareModal.props.onClose();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Sweter z próbki');

    // Znajdź przycisk otwierania kalkulatora kształtowania oczek
    const shapingBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('✂️ Oczka')
    );
    await act(async () => {
      shapingBtn.props.onPress();
    });

    // Znajdź ShapingCalculatorModal i zamknij
    const shapingModal = root.findByType(ShapingCalculatorModal);
    await act(async () => {
      shapingModal.props.onClose();
    });

    // Znajdź przycisk otwierania kalkulatora luzu i doboru rozmiaru
    const easeBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('👕 Luz')
    );
    await act(async () => {
      easeBtn.props.onPress();
    });

    // Znajdź EaseCalculatorModal i zamknij
    const easeModal = root.findByType(EaseCalculatorModal);
    await act(async () => {
      easeModal.props.onClose();
    });

    // Znajdź przycisk otwierania kalkulatora raglanu
    const raglanBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('🥋 Raglan')
    );
    await act(async () => {
      raglanBtn.props.onPress();
    });

    // Znajdź RaglanCalculatorModal i zamknij
    const raglanModal = root.findByType(RaglanCalculatorModal);
    await act(async () => {
      raglanModal.props.onClose();
    });

    // Znajdź przycisk otwierania kalkulatora czapki
    const hatBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('🧢 Czapka')
    );
    await act(async () => {
      hatBtn.props.onPress();
    });

    // Znajdź HatCalculatorModal i zamknij
    const hatModal = root.findByType(HatCalculatorModal);
    await act(async () => {
      hatModal.props.onClose();
    });
  });

  it('obsługuje renderowanie bez kontekstu ProjectProvider (fallback try-catch)', () => {
    let treeNoProv: any;
    act(() => {
      treeNoProv = renderer.create(<ProjectsScreen />);
    });
    expect(treeNoProv).toBeDefined();
    try {
      act(() => {
        treeNoProv.unmount();
      });
    } catch (_e) {}
  });

  it('po wygaśnięciu trialu próba utworzenia projektu blokuje formularz i chroni historię (Read-Only)', async () => {
    const { tree, projectCtx } = await renderProjectsScreen();

    const textBefore = extractAllStrings(tree.toJSON());
    // Dotychczasowy projekt ze seeda bazy jest nadal w 100% widoczny (ochrona 4.9★)
    expect(textBefore).toContain('Mój Sweter Raglanowy');

    // Tworzymy 2 kolejne projekty, aby osiągnąć limit 3 projektów w trialu
    await act(async () => {
      await projectCtx.createProject({
        name: 'Projekt B',
        craftType: 'knitting',
        parts: [{ name: 'Główna' }],
      });
      await projectCtx.createProject({
        name: 'Projekt C',
        craftType: 'crochet',
        parts: [{ name: 'Główna' }],
      });
    });

    const root = tree.root;
    // Znajdź przycisk + Nowy projekt
    const newBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('+ Nowy projekt')
    );

    await act(async () => {
      newBtn.props.onPress();
    });

    // Sprawdź czy pojawił się modal Paywalla
    const textAfter = extractAllStrings(tree.toJSON());
    expect(textAfter).toContain('APPS4BREW STUDIO PASS');
    expect(textAfter).toContain('Dziergaj bez limitów');

    // Historia wszystkich 3 projektów pozostaje nienaruszona
    expect(textAfter).toContain('Mój Sweter Raglanowy');
    expect(textAfter).toContain('Projekt B');
    expect(textAfter).toContain('Projekt C');
  });
});
