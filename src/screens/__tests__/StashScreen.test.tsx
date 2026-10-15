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

    // Zamknij modal estymatora (linia 745)
    const estimatorModal = root.find((n: any) => typeof n.props?.availableYarns !== 'undefined');
    act(() => {
      estimatorModal.props.onClose();
    });
  });

  it('obsługuje chipsy CYC, filtry surowców, reset filtrów oraz przełączanie z powrotem na zakładkę włóczek', async () => {
    const { root } = await renderStashScreen();

    // 1. Kliknij chip surowca (np. Wełna - linia 427)
    const fiberTag = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Wełna')
    );
    await act(async () => {
      fiberTag.props.onPress();
    });

    // 2. Kliknij "Wszystkie surowce" (linia 411)
    const allFibersTag = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Wszystkie surowce')
    );
    await act(async () => {
      allFibersTag.props.onPress();
    });

    // 3. Kliknij "Wszystkie grubości" (linia 360)
    const allWeightsChip = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Wszystkie grubości')
    );
    await act(async () => {
      allWeightsChip.props.onPress();
    });

    // 4. Przełącz na zakładkę drutów i z powrotem na włóczki (linia 284)
    const toolsTab = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Druty i szydełka')
    );
    await act(async () => {
      toolsTab.props.onPress();
    });

    const yarnTab = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Włóczki')
    );
    await act(async () => {
      yarnTab.props.onPress();
    });

    // 5. Wpisz wyszukiwanie i zresetuj filtry (linie 272-275)
    const searchInput = root.find((node: any) =>
      node.props?.onChangeText &&
      node.props?.placeholder &&
      node.props.placeholder.includes('Szukaj')
    );
    await act(async () => {
      searchInput.props.onChangeText('NierealnaWłóczkaNieIstnieje');
    });

    const resetFiltersBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Resetuj wszystkie filtry')
    );
    await act(async () => {
      resetFiltersBtn.props.onPress();
    });

    expect(extractAllStrings(tree.toJSON())).toContain('Twoje Zapasy Włóczek');
  });

  it('obsługuje anulowanie modalu dodawania oraz wybór kategorii grubości CYC w formularzu (linie 570, 631, 726)', async () => {
    const { root } = await renderStashScreen();

    // Otwórz modal dodawania włóczki
    const addYarnBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === '+ Dodaj włóczkę'
    );
    await act(async () => {
      addYarnBtn.props.onPress();
    });

    // Wybierz kategorię grubości w modalu (np. Worsted - linia 631)
    const worstedChips = root.findAll((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Worsted')
    );
    await act(async () => {
      worstedChips[worstedChips.length - 1].props.onPress();
    });

    // Anuluj modal przyciskiem Anuluj (linia 726)
    const cancelBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Anuluj')
    );
    await act(async () => {
      cancelBtn.props.onPress();
    });

    // Otwórz ponownie i wywołaj onRequestClose (linia 570)
    await act(async () => {
      addYarnBtn.props.onPress();
    });

    const modal = root.find((node: any) => node.type === 'Modal' && node.props?.onRequestClose);
    act(() => {
      modal.props.onRequestClose();
    });

    expect(tree).toBeDefined();
  });

  it('obsługuje tryb offline bez bazy SQLite (db null - linie 100, 199, 233, 247-248, 258, 267)', async () => {
    let treeOffline: any;
    act(() => {
      treeOffline = renderer.create(<StashScreen />);
    });
    const root = treeOffline.root;

    // 1. Dodaj nową włóczkę offline (linia 199)
    const addYarnBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === '+ Dodaj włóczkę'
    );
    await act(async () => {
      addYarnBtn.props.onPress();
    });

    const inputs = root.findAll((n: any) => n.type === 'TextInput' || n.props?.onChangeText);
    const brandInput = inputs.find((n: any) => n.props?.placeholder && n.props.placeholder.includes('Drops'));
    const nameInput = inputs.find((n: any) => n.props?.placeholder && n.props.placeholder.includes('Air / Sunday'));
    await act(async () => {
      brandInput.props.onChangeText('Drops');
      nameInput.props.onChangeText('Lima');
    });

    const submitYarnBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Zapisz w magazynie'
    );
    await act(async () => {
      await submitYarnBtn.props.onPress();
    });

    let text = extractAllStrings(treeOffline.toJSON());
    expect(text).toContain('Lima');

    // 2. Zużyj motek offline (linie 247-248)
    const useBtns = root.findAll((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Zużyj 1 motek (-1)'
    );
    await act(async () => {
      await useBtns[0].props.onPress();
    });

    // 3. Usuń włóczkę offline (linia 258)
    const deleteBtns = root.findAll((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Usuń'
    );
    await act(async () => {
      await deleteBtns[0].props.onPress();
    });

    // 4. Przełącz na druty, dodaj narzędzie offline (linia 233)
    const toolsTab = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Druty i szydełka')
    );
    await act(async () => {
      toolsTab.props.onPress();
    });

    const addToolBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === '+ Dodaj druty'
    );
    await act(async () => {
      addToolBtn.props.onPress();
    });

    const toolInputs = root.findAll((n: any) => n.type === 'TextInput' || n.props?.onChangeText);
    const toolNameInput = toolInputs.find((n: any) => n.props?.placeholder && n.props.placeholder.includes('KnitPro Zing na żyłce'));
    await act(async () => {
      toolNameInput.props.onChangeText('Szydełko Tulip 3.5');
    });

    const submitToolBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Zapisz w magazynie'
    );
    await act(async () => {
      await submitToolBtn.props.onPress();
    });

    text = extractAllStrings(treeOffline.toJSON());
    expect(text).toContain('Szydełko Tulip 3.5');

    // 5. Usuń narzędzie offline (linia 267)
    const deleteToolBtns = root.findAll((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Usuń z magazynu'
    );
    await act(async () => {
      await deleteToolBtns[0].props.onPress();
    });

    try {
      act(() => {
        treeOffline.unmount();
      });
    } catch (_e) {}
  });
});
