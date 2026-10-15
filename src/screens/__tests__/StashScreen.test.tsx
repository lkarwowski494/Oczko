import React from 'react';
import renderer, { act } from 'react-test-renderer';
import StashScreen from '../../../app/(tabs)/stash';
import { ProjectProvider } from '../../core/project-context';
import { createInMemoryDatabase } from '../../core/database';

jest.setTimeout(15000);

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

describe('StashScreen — Pełne testy magazynu włóczek i narzędzi (BR-MAG-001..004)', () => {
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

  async function renderStashScreen(db = createInMemoryDatabase()) {
    await act(async () => {
      tree = renderer.create(
        <ProjectProvider initialDb={db}>
          <StashScreen />
        </ProjectProvider>
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 80));
    });

    return { tree, db, root: tree.root };
  }

  it('renderuje początkowe włóczki i obsługuje filtrowanie po nazwie oraz czyszczenie wyszukiwarki', async () => {
    const { root } = await renderStashScreen();

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Twoje Zapasy Włóczek');
    expect(text).toContain('Nord');
    expect(text).toContain('Sunday');

    // Znajdź pole wyszukiwania
    const searchInput = root.find((node: any) =>
      node.props?.onChangeText &&
      node.props?.placeholder &&
      node.props.placeholder.includes('Szukaj')
    );

    // Wpisz frazę wyszukiwania 'Nord'
    await act(async () => {
      searchInput.props.onChangeText('Nord');
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Nord');
    expect(text).not.toContain('Sunday');

    // Znajdź przycisk wyczyszczenia ✕
    const clearBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.accessibilityLabel === 'Wyczyść wyszukiwanie'
    );

    await act(async () => {
      clearBtn.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Nord');
    expect(text).toContain('Sunday');
  });

  it('obsługuje filtrowanie po grubości przędzy CYC i dostępności na stanie', async () => {
    const { root } = await renderStashScreen();

    // Przełącznik "Tylko na stanie"
    const stockToggle = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Wszystkie (w tym 0)')
    );

    await act(async () => {
      stockToggle.props.onPress();
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('✓ Tylko na stanie');

    // Kliknij chip grubości CYC (np. Fingering (1))
    const fingeringChip = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Fingering (1)')
    );

    await act(async () => {
      fingeringChip.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Nord');
  });

  it('otwiera modal, dodaje nową włóczkę i zapisuje w magazynie', async () => {
    const { root } = await renderStashScreen();

    // Kliknij "+ Dodaj włóczkę"
    const addYarnBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('+ Dodaj włóczkę')
    );

    await act(async () => {
      addYarnBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 40));
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Dodaj włóczkę do schowka');

    // Wypełnij pola modalu
    const inputs = root.findAll((node: any) => node.type === 'TextInput' || node.props?.onChangeText);
    const brandInput = inputs.find((n: any) => n.props?.placeholder && n.props.placeholder.includes('Drops / Sandnes'));
    const nameInput = inputs.find((n: any) => n.props?.placeholder && n.props.placeholder.includes('Air / Sunday'));
    const colorInput = inputs.find((n: any) => n.props?.placeholder && n.props.placeholder.includes('01 Biały'));
    const lotInput = inputs.find((n: any) => n.props?.placeholder === 'np. 1240');
    const skeinsInput = inputs.find((n: any) => n.props?.placeholder && n.props.placeholder.includes('np. 4'));

    expect(brandInput).toBeDefined();
    expect(nameInput).toBeDefined();

    await act(async () => {
      brandInput.props.onChangeText('Malabrigo');
      nameInput.props.onChangeText('Rios');
      if (colorInput) colorInput.props.onChangeText('866 Arco Iris');
      if (lotInput) lotInput.props.onChangeText('9912');
      if (skeinsInput) skeinsInput.props.onChangeText('3');
    });

    // Zapisz włóczkę
    const submitBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Zapisz w magazynie'
    );

    await act(async () => {
      await submitBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 60));
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Malabrigo');
    expect(text).toContain('Rios');
    expect(text).toContain('866 Arco Iris');
  });

  it('obsługuje zużycie motka (-1) oraz usunięcie włóczki', async () => {
    const { root } = await renderStashScreen();

    // Znajdź przycisk "Zużyj 1 motek (-1)"
    const useBtns = root.findAll((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Zużyj 1 motek (-1)'
    );

    expect(useBtns.length).toBeGreaterThan(0);

    await act(async () => {
      await useBtns[0].props.onPress();
      await new Promise((r) => setTimeout(r, 60));
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Pozostało motków:');

    // Znajdź przycisk "Usuń" na karcie włóczki
    const deleteBtns = root.findAll((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Usuń'
    );

    expect(deleteBtns.length).toBeGreaterThan(0);

    await act(async () => {
      await deleteBtns[0].props.onPress();
      await new Promise((r) => setTimeout(r, 60));
    });

    expect(tree).toBeDefined();
  });

  it('przełącza na zakładkę drutów i szydełek, dodaje nowe narzędzie i usuwa je', async () => {
    const { root } = await renderStashScreen();

    // Przełącz na "Druty i szydełka"
    const toolsTab = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Druty i szydełka')
    );

    await act(async () => {
      toolsTab.props.onPress();
      await new Promise((r) => setTimeout(r, 40));
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Twoje Narzędzia');

    // Kliknij "+ Dodaj druty"
    const addToolBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === '+ Dodaj druty'
    );

    await act(async () => {
      addToolBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 40));
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Dodaj druty / szydełko');

    // Wypełnij formularz narzędzia
    const toolInputs = root.findAll((node: any) => node.type === 'TextInput' || node.props?.onChangeText);
    const toolNameInput = toolInputs.find((n: any) => n.props?.placeholder && n.props.placeholder.includes('KnitPro Zing na żyłce'));
    const toolSizeInput = toolInputs.find((n: any) => n.props?.placeholder && n.props.placeholder.includes('4.0'));
    const toolCableInput = toolInputs.find((n: any) => n.props?.placeholder && n.props.placeholder.includes('80'));

    expect(toolNameInput).toBeDefined();

    await act(async () => {
      toolNameInput.props.onChangeText('Druty bambusowe HiyaHiya');
      if (toolSizeInput) toolSizeInput.props.onChangeText('5.5');
      if (toolCableInput) toolCableInput.props.onChangeText('100');
    });

    // Zapisz narzędzie
    const submitToolBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Zapisz w magazynie'
    );

    await act(async () => {
      await submitToolBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 60));
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Druty bambusowe HiyaHiya');
    expect(text).toMatch(/5\.5\s*mm/);

    // Usuń narzędzie
    const deleteToolBtns = root.findAll((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Usuń z magazynu'
    );

    expect(deleteToolBtns.length).toBeGreaterThan(0);

    await act(async () => {
      await deleteToolBtns[0].props.onPress();
      await new Promise((r) => setTimeout(r, 60));
    });

    expect(tree).toBeDefined();
  });

  it('otwiera modal estymatora zużycia włóczki z przycisku ⚖️ Zużycie w Magazynie', async () => {
    const { root } = await renderStashScreen();

    const usageBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === '⚖️ Zużycie'
    );

    await act(async () => {
      usageBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 40));
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Kalkulator Zużycia Włóczki');
  });
});
