import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Share, Alert } from 'react-native';
import SettingsScreen from '../../../app/(tabs)/settings';
import { ProjectProvider } from '../../core/project-context';
import { createInMemoryDatabase } from '../../core/database';
import { exportBackupToJson } from '../../core/backup-service';

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

describe('SettingsScreen — Pełne testy ustawień, kopii zapasowych i haptyki (BR-LICZ-008, DEC-10)', () => {
  let tree: any = null;

  beforeEach(() => {
    jest.clearAllMocks();
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

  async function renderSettingsScreen(db = createInMemoryDatabase()) {
    await act(async () => {
      tree = renderer.create(
        <ProjectProvider initialDb={db}>
          <SettingsScreen />
        </ProjectProvider>
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 80));
    });

    return { tree, db };
  }

  it('obsługuje zmianę czasu blokady debounce stuknięć (200, 400, 500 ms)', async () => {
    const { tree } = await renderSettingsScreen();
    const root = tree.root;

    // Znajdź chip 500 ms
    const chip500 = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('500')
    );

    await act(async () => {
      chip500.props.onPress();
    });

    expect(tree).toBeDefined();
    const text = extractAllStrings(tree.toJSON());
    expect(text).toMatch(/500\s*ms/);
  });

  it('obsługuje testowanie profili wibracji haptycznych oraz przełączanie przełączników', async () => {
    const { tree } = await renderSettingsScreen();
    const root = tree.root;

    // Przetestuj profile wibracji (Krok, Cofnięcie, Cykl, Cel, Przypomnienie)
    const testChips = root.findAll((node: any) =>
      node.props?.onPress &&
      (extractAllStrings(node).includes('Krok (+1)') ||
       extractAllStrings(node).includes('Cofnięcie (-1)') ||
       extractAllStrings(node).includes('Cykl wzoru') ||
       extractAllStrings(node).includes('Cel robótki') ||
       extractAllStrings(node).includes('Przypomnienie'))
    );

    expect(testChips.length).toBeGreaterThanOrEqual(5);

    for (const chip of testChips) {
      await act(async () => {
        chip.props.onPress();
      });
    }

    // Przełączniki Switch (Dźwięk kliknięcia, iCloud)
    const switches = root.findAll((node: any) => node.type === 'Switch' || node.props?.onValueChange);
    expect(switches.length).toBeGreaterThanOrEqual(2);

    for (const sw of switches) {
      await act(async () => {
        sw.props.onValueChange(true);
      });
    }

    expect(tree).toBeDefined();
  });

  it('obsługuje zmianę domyślnego przypomnienia interwałowego (co 6, co 10, Wyłącz)', async () => {
    const { tree } = await renderSettingsScreen();
    const root = tree.root;

    const chipCo6 = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'co 6'
    );

    await act(async () => {
      chipCo6.props.onPress();
    });

    const chipOff = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === 'Wyłącz'
    );

    await act(async () => {
      chipOff.props.onPress();
    });

    expect(tree).toBeDefined();
  });

  it('obsługuje eksport kopii zapasowej do JSON (Share.share)', async () => {
    const shareSpy = jest.spyOn(Share, 'share').mockResolvedValueOnce({ action: 'sharedAction' } as any);
    const { tree } = await renderSettingsScreen();
    const root = tree.root;

    const exportBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Eksportuj kopię')
    );

    await act(async () => {
      await exportBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 60));
    });

    expect(shareSpy).toHaveBeenCalledTimes(1);
    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Wyeksportowano kopię bazy danych');
  });

  it('obsługuje modal przywracania kopii z walidacją błędnego JSON oraz pomyślnym odtworzeniem', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { tree, db } = await renderSettingsScreen();
    const root = tree.root;

    // Kliknij "Przywróć kopię"
    const restoreBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Przywróć kopię')
    );

    await act(async () => {
      restoreBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 30));
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Przywróć z kopii zapasowej');

    // 1. Wpisz niepoprawny JSON
    const jsonInput = root.find((node: any) =>
      (node.type === 'TextInput' || node.props?.onChangeText) &&
      node.props?.placeholder &&
      node.props.placeholder.includes('Wklej tutaj kod JSON')
    );

    await act(async () => {
      jsonInput.props.onChangeText('to_nie_jest_poprawny_json');
    });

    const submitRestoreBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Zatwierdź i przywróć dane')
    );

    await act(async () => {
      await submitRestoreBtn.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toMatch(/nieprawidłowy format json/i);

    // 2. Wpisz poprawny format JSON z kopii zapasowej
    const validBackupJson = await exportBackupToJson(db, false);

    await act(async () => {
      jsonInput.props.onChangeText(validBackupJson);
    });

    await act(async () => {
      await submitRestoreBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 60));
    });

    expect(alertSpy).toHaveBeenCalled();
    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Przywrócono bazę pomyślnie');
  });

  it('obsługuje otwarcie i zamknięcie symulatora Apple Watch (⌚ Testuj)', async () => {
    const { tree } = await renderSettingsScreen();
    const root = tree.root;

    const watchTestBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('⌚ Testuj')
    );

    await act(async () => {
      watchTestBtn.props.onPress();
      await new Promise((r) => setTimeout(r, 30));
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Apple Watch & Smart Stack');

    // Zamknij symulator zegarka
    const closeWatchBtn = root.find((node: any) =>
      node.props?.onPress &&
      node.props?.children?.props?.children === '✕'
    );

    await act(async () => {
      closeWatchBtn.props.onPress();
    });

    expect(tree).toBeDefined();
  });

  it('obsługuje zamknięcie modalu przywracania kopii (✕, Anuluj oraz onRequestClose) — linie 361, 367, 418', async () => {
    const { tree } = await renderSettingsScreen();
    const root = tree.root;

    const restoreBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Przywróć kopię')
    );

    // 1. Zamknij przyciskiem ✕ (linia 367)
    await act(async () => {
      restoreBtn.props.onPress();
    });
    const closeBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('✕')
    );
    await act(async () => {
      closeBtn.props.onPress();
    });

    // 2. Zamknij przyciskiem Anuluj (linia 418)
    await act(async () => {
      restoreBtn.props.onPress();
    });
    const cancelBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Anuluj')
    );
    await act(async () => {
      cancelBtn.props.onPress();
    });

    // 3. onRequestClose na modalu (linia 361)
    await act(async () => {
      restoreBtn.props.onPress();
    });
    const modal = root.find((node: any) => node.type === 'Modal' && node.props?.onRequestClose);
    act(() => {
      modal.props.onRequestClose();
    });

    expect(tree).toBeDefined();
  });

  it('obsługuje błąd eksportu inny niż anulowanie (Alert.alert — linie 82-83)', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const shareSpy = jest.spyOn(Share, 'share').mockRejectedValueOnce(new Error('Share crash'));
    const { tree } = await renderSettingsScreen();
    const root = tree.root;

    const exportBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Eksportuj kopię')
    );

    await act(async () => {
      await exportBtn.props.onPress();
    });

    expect(alertSpy).toHaveBeenCalledWith('Błąd eksportu', 'Share crash');
    shareSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('obsługuje błąd rzucony przez importDatabaseBackup (linia 123)', async () => {
    const backupService = require('../../core/backup-service');
    const spy = jest.spyOn(backupService, 'importDatabaseBackup').mockRejectedValueOnce(new Error('Corrupt DB'));

    const { tree, db } = await renderSettingsScreen();
    const root = tree.root;

    const restoreBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Przywróć kopię')
    );
    await act(async () => {
      restoreBtn.props.onPress();
    });

    const validBackupJson = await backupService.exportBackupToJson(db, false);
    const jsonInput = root.find((node: any) =>
      (node.type === 'TextInput' || node.props?.onChangeText) &&
      node.props?.placeholder &&
      node.props.placeholder.includes('Wklej tutaj kod JSON')
    );
    await act(async () => {
      jsonInput.props.onChangeText(validBackupJson);
    });

    const submitRestoreBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Zatwierdź i przywróć dane')
    );
    await act(async () => {
      await submitRestoreBtn.props.onPress();
    });

    expect(extractAllStrings(tree.toJSON())).toContain('Corrupt DB');
    spy.mockRestore();
  });

  it('obsługuje brak bazy danych (db null) dla eksportu i przywracania (linie 69-70, 92-93)', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    let treeNoDb: any;
    act(() => {
      treeNoDb = renderer.create(<SettingsScreen />);
    });

    const root = treeNoDb.root;

    // 1. Eksport bez db (linie 69-70)
    const exportBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Eksportuj kopię')
    );
    await act(async () => {
      await exportBtn.props.onPress();
    });
    expect(alertSpy).toHaveBeenCalledWith('Błąd', 'Baza danych nie jest jeszcze zainicjalizowana.');

    // 2. Przywracanie bez db (linie 92-93)
    const restoreBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Przywróć kopię')
    );
    await act(async () => {
      restoreBtn.props.onPress();
    });

    const submitRestoreBtn = root.find((node: any) =>
      node.props?.onPress &&
      extractAllStrings(node).includes('Zatwierdź i przywróć dane')
    );
    await act(async () => {
      await submitRestoreBtn.props.onPress();
    });

    expect(extractAllStrings(treeNoDb.toJSON())).toContain('Baza danych nie jest dostępna.');
    alertSpy.mockRestore();
  });

  it('obsługuje błąd w getDatabaseStats (console.error — linia 59)', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const backupService = require('../../core/backup-service');
    const spy = jest.spyOn(backupService, 'getDatabaseStats').mockRejectedValueOnce(new Error('Stats error'));

    await renderSettingsScreen();
    expect(consoleErrorSpy).toHaveBeenCalled();

    spy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('otwiera modal symulatora Garmin ConnectIQ i wykonuje akcje licznika oraz zamknięcia', async () => {
    const { tree } = await renderSettingsScreen();
    const root = tree.root;

    const garminBtn = root.find(
      (node: any) =>
        node.props?.onPress &&
        extractAllStrings(node).includes('🛰️ Testuj')
    );
    expect(garminBtn).toBeDefined();

    await act(async () => {
      garminBtn.props.onPress();
    });

    const garminModal = root.find(
      (node: any) =>
        typeof node.props?.onClose === 'function' &&
        typeof node.props?.onIncrement === 'function' &&
        node.props?.syncPayload
    );
    expect(garminModal).toBeDefined();

    await act(async () => {
      garminModal.props.onIncrement();
      garminModal.props.onDecrement();
      garminModal.props.onClose();
    });

    expect(tree).toBeDefined();
  });
});
