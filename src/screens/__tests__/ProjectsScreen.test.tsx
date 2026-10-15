import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ProjectsScreen from '../../../app/(tabs)/projects';
import { ProjectProvider } from '../../core/project-context';
import { createInMemoryDatabase } from '../../core/database';

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
    await act(async () => {
      tree = renderer.create(
        <ProjectProvider initialDb={db}>
          <ProjectsScreen />
        </ProjectProvider>
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 80));
    });

    return { tree, db, root: tree.root };
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

    // Znajdź przyciski "⚖️ Zużycie"
    const usageBtns = root.findAll((node: any) => {
      return (
        node.props?.onPress &&
        node.props?.children?.props?.children === '⚖️ Zużycie'
      );
    });

    expect(usageBtns.length).toBeGreaterThan(0);

    // 1. Otwórz z paska górnego
    await act(async () => {
      usageBtns[0].props.onPress();
      await new Promise((r) => setTimeout(r, 40));
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Kalkulator Zużycia Włóczki');

    // Zamknij modal estymatora przyciskiem ✕
    const closeBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        node.props?.children?.props?.children === '✕'
      );
    });

    await act(async () => {
      closeBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 40));
    });

    // 2. Otwórz z karty projektu
    await act(async () => {
      usageBtns[1].props.onPress();
      await new Promise((r) => setTimeout(r, 40));
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Kalkulator Zużycia Włóczki');

    // Zamknij ponownie nowo wyrenderowany modal
    const closeBtnAgain = root.find((node: any) => {
      return (
        node.props?.onPress &&
        node.props?.children?.props?.children === '✕'
      );
    });

    await act(async () => {
      closeBtnAgain.props.onPress();
      await new Promise((r) => setTimeout(r, 40));
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
});
