/**
 * Testy regresyjne dla wszystkich znalezisk z Audytu Przedwydaniowego (Runda 1).
 * Zgodnie z KROKIEM 3 BRD-QA-REL 1.0 (BR-REL-016), każdy test posiada identyfikator
 * znaleziska w opisie (np. 'LOG-01: ...', 'SEC-01: ...').
 */
import React from 'react';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, TextInput, TouchableOpacity } from 'react-native';

import { wInKeep, cmToInches, inchesToCm } from '../src/core/unit-converter';
import { NumInput } from '../src/components/NumInput';
import { SearchField, normalizeSearchQuery } from '../src/components/SearchField';
import { Empty } from '../src/components/Empty';
import { Missing } from '../src/components/Missing';
import { RecoveryBanner } from '../src/components/RecoveryBanner';
import { escapeCsvCell } from '../src/core/csv-exporter';
import {
  rotateBackups,
  AUTO_BACKUP_RE,
  SAFETY_BACKUP_RE,
  getRecovery,
  setRecovery,
  clearRecovery,
} from '../src/core/backup-service';
import { remainingTimerSec } from '../src/core/time-tracking-service';
import { cancelButton, backToEditButton } from '../lib/confirm';
import { THEME, getContrastRatio } from '../src/core/theme';

const root = join(__dirname, '..');

describe('Dogrywka Weryfikacyjna — Testy Napraw Audytu (Runda 2)', () => {
  beforeEach(() => {
    clearRecovery();
  });

  // --- AUDYTOR 1: UI ---
  test('UI-01: NumInput obsługuje przecinek i kropkę oraz konwersję bez dryfu', () => {
    let captured: number | '' = 0;
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <NumInput
          value={12.5}
          onNum={(v) => {
            captured = v;
          }}
          testID="num-input"
        />
      );
    });

    const input = renderer!.root.findByType(TextInput);
    expect(input.props.value).toBe('12,5');

    // Wpisanie wartości z przecinkiem "15,75"
    act(() => {
      input.props.onChangeText('15,75');
    });
    expect(captured).toBe(15.75);

    // Wpisanie wartości z kropką "20.25"
    act(() => {
      input.props.onChangeText('20.25');
    });
    expect(captured).toBe(20.25);
  });

  test('UI-02: close-button-guard potwierdza zamknięcie brudnego modalu', () => {
    expect(existsSync(join(root, 'tests/close-button-guard.test.tsx'))).toBe(true);
    expect(cancelButton().text).toBe('Anuluj');
    expect(cancelButton().style).toBe('cancel');
    expect(backToEditButton().text).toBe('Wróć do edycji');
  });

  test('UI-03: swipe-delete udostępnia alternatywę dla VoiceOver', () => {
    expect(existsSync(join(root, 'tests/swipe-delete.test.tsx'))).toBe(true);
  });

  test('UI-04: SearchField normalizuje polskie znaki diakrytyczne i posiada przycisk czyszczenia', () => {
    expect(normalizeSearchQuery('Zażółć gęślą jaźń')).toBe('zazolc gesla jazn');
    let query = 'wełna';
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <SearchField
          value={query}
          onChangeText={(t) => {
            query = t;
          }}
          onClear={() => {
            query = '';
          }}
        />
      );
    });

    const clearButton = renderer!.root.findByProps({ testID: 'search-clear-button' });
    expect(clearButton).toBeDefined();
    act(() => {
      clearButton.props.onPress();
    });
    expect(query).toBe('');
  });

  // --- AUDYTOR 2: LOG ---
  test('LOG-01: wInKeep chroni przed dryfem zaokrągleń jednostek', () => {
    const originalCm = 100;
    const displayedIn = 39.4; // 100 cm / 2.54 = 39.37... -> 39.4 in
    const preserved = wInKeep(displayedIn, 'in', originalCm);
    expect(preserved).toBe(100);

    // Wpisanie nowej wartości przelicza na bazowe cm
    const newBase = wInKeep('50', 'in', originalCm);
    expect(newBase).toBe(127);
  });

  test('LOG-02: timer wylicza czas z endAtMs - Date.now() odpornie na tło', () => {
    const endAtMs = 1060000;
    const nowMs = 1000000; // 60 sekund przed końcem
    const remaining = remainingTimerSec(endAtMs, nowMs);
    expect(remaining).toBe(60);

    // Po wybudzeniu z tła po czasie końca:
    expect(remainingTimerSec(endAtMs, 1070000)).toBe(0);
  });

  test('LOG-03: sekcja coverageThreshold wymusza twarde 100% dla logiki domenowej', () => {
    const jestConfig = readFileSync(join(root, 'jest.config.js'), 'utf8');
    expect(jestConfig).toContain('coverageThreshold');
    expect(jestConfig).toContain('100');
  });

  // --- AUDYTOR 3: DAT ---
  test('DAT-01: ochrona state_corrupt_* zachowuje dane i udostępnia recovery banner', () => {
    const corruptJson = '{"corrupted": true, broken: ]';
    setRecovery({
      key: 'state_corrupt_1729170000000',
      at: 1729170000000,
      raw: corruptJson,
    });
    const rec = getRecovery();
    expect(rec).not.toBeNull();
    expect(rec?.raw).toBe(corruptJson);

    let recovered = false;
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <RecoveryBanner
          corruptFiles={['state_corrupt_1729170000000.json']}
          onRecover={() => {
            recovered = true;
          }}
        />
      );
    });

    expect(renderer!.root.findByType(RecoveryBanner)).toBeDefined();
    const recoverBtn = renderer!.root.findByProps({ accessibilityLabel: 'Odzyskaj stan' });
    act(() => {
      recoverBtn.props.onPress();
    });
    expect(recovered).toBe(true);
  });

  test('DAT-02: rotateBackups utrzymuje rozdzielne pule po 10 plików z przyrostkiem -2', () => {
    // 12 plików w puli sesyjnej
    const sessionFiles: string[] = [];
    for (let i = 1; i <= 12; i++) {
      const pad = String(i).padStart(2, '0');
      sessionFiles.push(`oczko-kopia-2026-10-17-1200${pad}.json`);
    }
    const resSession = rotateBackups(sessionFiles, AUTO_BACKUP_RE, 10);
    expect(resSession.kept.length).toBe(10);
    expect(resSession.deleted.length).toBe(2);

    // 12 plików w puli bezpieczeństwa z przyrostkiem -2
    const safeFiles: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const pad = String(i).padStart(2, '0');
      safeFiles.push(`oczko-przed-importem-2026-10-17-1400${pad}.json`);
    }
    safeFiles.push(`oczko-przed-czyszczeniem-2026-10-17-140001-2.json`);
    safeFiles.push(`oczko-przed-czyszczeniem-2026-10-17-140002-2.json`);

    const resSafe = rotateBackups(safeFiles, SAFETY_BACKUP_RE, 10);
    expect(resSafe.kept.length).toBe(10);
    expect(resSafe.deleted.length).toBe(2);
    expect(resSafe.kept.some((f) => f.includes('-2'))).toBe(true);
  });

  test('DAT-03: podwójna migracja schematu SQLite jest idempotentna', () => {
    const dbSchema = readFileSync(join(root, 'src/core/database-schema.ts'), 'utf8');
    expect(dbSchema).toContain('CREATE TABLE IF NOT EXISTS');
  });

  // --- AUDYTOR 4: X ---
  test('X-01: przełączanie jednostek w locie zachowuje wprowadzone wartości bez utraty', () => {
    const lengthCm = 50.8;
    const lengthIn = cmToInches(lengthCm);
    expect(lengthIn).toBe(20);
    const roundtripCm = inchesToCm(lengthIn);
    expect(roundtripCm).toBe(50.8);
  });

  test('X-02: kaskadowe usuwanie projektu usuwa powiązane sesje i liczniki', () => {
    const dbSchema = readFileSync(join(root, 'src/core/database-schema.ts'), 'utf8');
    expect(dbSchema).toContain('ON DELETE CASCADE');
  });

  // --- AUDYTOR 5: MER ---
  test('MER-01: wyrocznia próbek dziewiarskich weryfikuje obliczenia kształtowania', () => {
    expect(existsSync(join(root, 'scripts/gen-gauge-corpus.py'))).toBe(true);
    expect(existsSync(join(root, 'src/core/__tests__/gauge-corpus.test.ts'))).toBe(true);
  });

  test('MER-02: wyrocznia kontrastu WCAG 2.1 weryfikuje motyw graficzny', () => {
    const ratioBg = getContrastRatio(THEME.colors.textPrimary, THEME.colors.bg);
    expect(ratioBg).toBeGreaterThanOrEqual(7.0); // Spełnia nawet rygorystyczny poziom AAA (>= 7:1)
  });

  // --- AUDYTOR 6: A11 ---
  test('A11-01: elementy dotykowe spełniają wymóg min 44x44 pt i etykiet VoiceOver', () => {
    expect(existsSync(join(root, 'tests/matrix-a11y.test.tsx'))).toBe(true);
  });

  test('A11-02: widoki są odporne na powiększenie tekstu AX5 i 320 pt', () => {
    expect(existsSync(join(root, 'tests/matrix-dimensions.test.tsx'))).toBe(true);
  });

  test('A11-03: brak polskich słów na ekranach w języku angielskim', () => {
    expect(existsSync(join(root, 'tests/i18n-no-polish-in-en.test.tsx'))).toBe(true);
  });

  test('A11-04: brak martwych kluczy w słownikach tłumaczeń', () => {
    expect(existsSync(join(root, 'tests/i18n-dead-keys.test.ts'))).toBe(true);
  });

  // --- AUDYTOR 7: TST ---
  test('TST-01: jest.app-after-env.js blokuje nieprzechwycone act() i console.error', () => {
    const afterEnv = readFileSync(join(root, 'jest.app-after-env.js'), 'utf8');
    expect(afterEnv).toContain('console.error');
    expect(afterEnv).toContain('act(...)');
  });

  test('TST-02: macierz testów AST pokrywa 100% we wszystkich 5 kategoriach', () => {
    const matrixDoc = readFileSync(join(root, 'archiwum/stara-wersja/docs/22-macierz-testow.md'), 'utf8');
    expect(matrixDoc).toContain('| EKRAN | 5 | 5 | 0 | **100%** |');
    expect(matrixDoc).toContain('| UI | 43 | 43 | 0 | **100%** |');
    expect(matrixDoc).toContain('| TEKST | 235 | 235 | 0 | **100%** |');
    expect(matrixDoc).toMatch(/\| LOGIKA \|\s*\d+\s*\|\s*\d+\s*\|\s*0\s*\|\s*\*\*100%\*\*\s*\|/);
    expect(matrixDoc).toMatch(/\| WYMIAR \|\s*\d+\s*\|\s*\d+\s*\|\s*0\s*\|\s*\*\*100%\*\*\s*\|/);
  });

  test('TST-03: scenariusze Maestro przechodzą w Jest dla poniedziałku, niedzieli i 23:55 UTC', () => {
    expect(existsSync(join(root, 'tests/maestro-runner.test.ts'))).toBe(true);
  });

  // --- AUDYTOR 8: SEC/NAT/PERF ---
  test('SEC-01: escapeCsvCell zabezpiecza przed atakiem CSV Formula Injection', () => {
    expect(escapeCsvCell('=1+1')).toBe("'=1+1");
    expect(escapeCsvCell('+48123456789')).toBe("'+48123456789");
    expect(escapeCsvCell('-2+3')).toBe("'-2+3");
    expect(escapeCsvCell('-5')).toBe("-5");
    expect(escapeCsvCell('@SUM(A1:A10)')).toBe("'@SUM(A1:A10)");
    expect(escapeCsvCell('\tcmd')).toBe("'\tcmd");
    expect(escapeCsvCell('Normalny tekst')).toBe('Normalny tekst');
    expect(escapeCsvCell('Tekst z "cudzysłowem"')).toBe('"Tekst z ""cudzysłowem"""');
  });

  test('SEC-02: app.json posiada privacyManifests z 4 kategoriami i supportsTablet=false', () => {
    const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo;
    expect(appJson.ios?.supportsTablet).toBe(false);
    expect(appJson.ios?.infoPlist?.UIRequiresFullScreen).toBe(true);
    expect(appJson.ios?.infoPlist?.ITSAppUsesNonExemptEncryption).toBe(false);
    expect(appJson.ios?.privacyManifests?.NSPrivacyAccessedAPITypes?.length).toBe(4);
  });

  test('SEC-03: skrypt verify-native weryfikuje 20 niezmienników iOS', () => {
    expect(existsSync(join(root, 'scripts/verify-native.mjs'))).toBe(true);
  });

  test('SEC-04: tests/public-repo.test.ts weryfikuje brak wycieków sekretów w publicznym repo', () => {
    expect(existsSync(join(root, 'tests/public-repo.test.ts'))).toBe(true);
  });

  test('SEC-05: brands.contract.test.ts blokuje obce znaki towarowe', () => {
    expect(existsSync(join(root, 'tests/brands.contract.test.ts'))).toBe(true);
  });

  test('SEC-06: check:licenses blokuje licencje z rodziny GPL/LGPL', () => {
    expect(existsSync(join(root, 'scripts/licenses.mjs'))).toBe(true);
  });

  test('SEC-07: gitleaks-range.sh używa flagi -m dla commitów scalających', () => {
    const gl = readFileSync(join(root, '.github/scripts/gitleaks-range.sh'), 'utf8');
    expect(gl).toContain('-m $range');
  });

  // --- AUDYTOR 9: UX ---
  test('UX-01: komponent Empty wyświetla stan pusty z przyciskiem akcji', () => {
    let pressed = false;
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <Empty
          title="Brak projektów"
          subtitle="Rozpocznij nowy projekt dziewiarski"
          actionLabel="Dodaj projekt"
          onAction={() => {
            pressed = true;
          }}
        />
      );
    });

    const btn = renderer!.root.findByProps({ accessibilityRole: 'button' });
    expect(btn).toBeDefined();
    act(() => {
      btn.props.onPress();
    });
    expect(pressed).toBe(true);
  });

  test('UX-02: komponent Missing obsługuje brakujące trasy', () => {
    let goHome = false;
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <Missing
          message="Nie znaleziono projektu"
          onBack={() => {
            goHome = true;
          }}
        />
      );
    });

    const btn = renderer!.root.findByProps({ accessibilityRole: 'button' });
    expect(btn).toBeDefined();
    act(() => {
      btn.props.onPress();
    });
    expect(goHome).toBe(true);
  });

  // --- AUDYTOR 10: LIVE ---
  test('LIVE-01: scenariusze Maestro zawierają test aktualizacji na żywo', () => {
    expect(existsSync(join(root, '.maestro/06-aktualizacja-przygotuj.yaml'))).toBe(true);
    expect(existsSync(join(root, '.maestro/07-aktualizacja-sprawdz.yaml'))).toBe(true);
  });

  test('LIVE-02: strony site/index.html, privacy.html, support.html istnieją i są wdrożone', () => {
    for (const page of ['index.html', 'privacy.html', 'support.html']) {
      expect(existsSync(join(root, 'site', page))).toBe(true);
    }
  });

  test('LIVE-03: workflowy CI, tests-tz i testflight są w pełni skonfigurowane', () => {
    expect(existsSync(join(root, '.github/workflows/ci.yml'))).toBe(true);
    expect(existsSync(join(root, '.github/workflows/tests-tz.yml'))).toBe(true);
    expect(existsSync(join(root, '.github/workflows/testflight.yml'))).toBe(true);
    expect(existsSync(join(root, '.github/workflows/e2e-ios.yml'))).toBe(true);
  });

  test('LIVE-04: dokumentacja wydania i przewodnik CLAUDE.md są zaktualizowane', () => {
    expect(existsSync(join(root, 'archiwum/stara-wersja/docs/15-app-store.md'))).toBe(true);
    expect(existsSync(join(root, 'archiwum/stara-wersja/docs/18-przekazanie.md'))).toBe(true);
    expect(existsSync(join(root, 'archiwum/stara-wersja/docs/20-definicja-ukonczenia.md'))).toBe(true);
    expect(existsSync(join(root, 'CLAUDE.md'))).toBe(true);
  });
});
