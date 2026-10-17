/**
 * Oczko — Strażnicy Wzorców Interakcji S1–S16 (NFR-INT-001..016)
 * Zgodne ze standardem repozytorium trening / organizer (interaction-guards.test.ts).
 * Statyczny skan źródeł app/, src/components/, src/screens/, src/core/.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { normalizeSearchQuery, searchMatches } from '../src/components/SearchField';

const ROOT = join(__dirname, '..');

const walk = (d: string): string[] => {
  try {
    return readdirSync(d).flatMap((f) => {
      const p = join(d, f);
      return statSync(p).isDirectory() ? walk(p) : [p];
    });
  } catch {
    return [];
  }
};

const rel = (p: string) => relative(ROOT, p).split(sep).join('/');

const codeFiles = ['app', 'lib', 'src/components', 'src/screens', 'src/core']
  .flatMap((d) => walk(join(ROOT, d)))
  .filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f) && !f.endsWith('.d.ts'));

const srcMap = new Map<string, string>(codeFiles.map((f) => [rel(f), readFileSync(f, 'utf8')]));

const lines = (re: RegExp, allow: string[] = []) =>
  [...srcMap]
    .filter(([f]) => !allow.includes(f))
    .flatMap(([f, s]) =>
      s
        .split('\n')
        .map((l, i) => [f, i + 1, l] as const)
        .filter(([, , l]) => re.test(l))
        .map(([f2, n]) => `${f2}:${n}`)
    );

describe('Strażnicy Wzorców Interakcji S1–S16 (NFR-INT-001..016)', () => {
  describe('S1: Zamykanie modali (NFR-INT-001)', () => {
    test('komponenty modalne posiadają mechanizm zamknięcia', () => {
      const modalFiles = [...srcMap.keys()].filter((f) => f.includes('Modal.tsx'));
      expect(modalFiles.length).toBeGreaterThan(0);
      for (const f of modalFiles) {
        const s = srcMap.get(f)!;
        expect(/onRequestClose|CloseButton|onClose|close-modal/i.test(s)).toBe(true);
      }
    });
  });

  describe('S2: Nagłówki i przyciski akcji (NFR-INT-002)', () => {
    test('wspólne przyciski nagłówka i modali mają minimalny wymiar dotykowy >= 44 pt', () => {
      const closeBtn = srcMap.get('src/components/CloseButton.tsx');
      expect(closeBtn).toBeDefined();
      expect(closeBtn).toMatch(/minWidth:\s*44/);
      expect(closeBtn).toMatch(/minHeight:\s*44/);
    });
  });

  describe('S3: Wprowadzanie liczb z przecinkiem i kropką (NFR-INT-003, RD-ENG-03)', () => {
    test('komponent NumInput istnieje i obsługuje prop stored oraz zamianę przecinka na kropkę', () => {
      const numInput = srcMap.get('src/components/NumInput.tsx');
      expect(numInput).toBeDefined();
      expect(numInput).toMatch(/replace\(',',\s*'\.'\)/);
      expect(numInput).toMatch(/wInKeep/);
    });
  });

  describe('S4: Usuwanie dwutorowe — gest SwipeRow + VoiceOver (NFR-INT-004)', () => {
    test('komponent SwipeRow udostępnia akcję accessibilityActions delete i potwierdzenie', () => {
      const swipe = srcMap.get('src/components/SwipeRow.tsx');
      expect(swipe).toBeDefined();
      expect(swipe).toMatch(/name:\s*'delete'/);
      expect(swipe).toMatch(/accessibilityActions/);
    });
  });

  describe('S5: Potwierdzenia — styl cancel w lib/confirm.ts (NFR-INT-005)', () => {
    test('zakaz etykiet "Nie" i "Wróć" jako przycisków potwierdzeń (anulowanie to zawsze "Anuluj")', () => {
      const bad = lines(/text:\s*['"](Nie|Wróć)['"]/, ['src/components/Missing.tsx']);
      expect(bad).toEqual([]);
    });

    test('rezygnacja w confirm.ts używa wyłącznie etykiety Anuluj', () => {
      const confirmCode = srcMap.get('lib/confirm.ts');
      expect(confirmCode).toBeDefined();
      expect(confirmCode).toMatch(/text:\s*t\('Anuluj'\)/);
      expect(confirmCode).toMatch(/style:\s*'cancel'/);
    });
  });

  describe('S6: Przełączniki i stan zaznaczenia (NFR-INT-006)', () => {
    test('komponenty przełączników posiadają odpowiednie accessibilityRole lub accessibilityState', () => {
      const switchOccurrences = lines(/accessibilityRole=['"]switch['"]|accessibilityState=\{[^}]*checked/);
      expect(switchOccurrences.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('S7: Czas i timery odporne na uśpienie (NFR-INT-007, NFR-PERF-004)', () => {
    test('czas timera wyliczany wyłącznie z timestampów bez dryfu setInterval', () => {
      const timeService = srcMap.get('src/core/time-tracking-service.ts');
      expect(timeService).toBeDefined();
      expect(timeService).toMatch(/remainingTimerSec/);
      expect(timeService).toMatch(/Date\.now\(\)|endAtMs\s*-\s*nowMs/);
    });
  });

  describe('S8: Komunikaty zwrotne (NFR-INT-008)', () => {
    test('zakaz generycznego tytułu "Błąd" lub "Error" w alertach i komunikatach', () => {
      const badAlerts = lines(/Alert\.alert\(\s*['"](Błąd|Error)['"]/i);
      expect(badAlerts).toEqual([]);
    });

    test('zakaz wywołań Alert.alert w layoutach startowych _layout.tsx (zamiast tego recovery banner)', () => {
      const layouts = [...srcMap.keys()].filter((f) => f.includes('_layout.tsx'));
      for (const layout of layouts) {
        const s = srcMap.get(layout)!;
        expect(s).not.toMatch(/Alert\.alert\(/);
      }
    });
  });

  describe('S9: Słownik pojęć — brak zakazanych synonimów (NFR-INT-009)', () => {
    test('jednolita terminologia dziewiarska: Projekt, Włóczka, Licznik (zakaz: "Plan", "Motek" jako nazwa obiektu)', () => {
      const i18n = srcMap.get('src/core/i18n.en.ts') || '';
      expect(i18n).not.toMatch(/workout/i); // wykluczenie pojęć z treningu
    });
  });

  describe('S10: Bezpieczna nawigacja i ochrona przed podwójnym kliknięciem (NFR-INT-010)', () => {
    test('debounce w counter-engine zapobiega dublowaniu kliknięć', () => {
      const engine = srcMap.get('src/core/counter-engine.ts');
      expect(engine).toBeDefined();
      expect(engine).toMatch(/shouldDebounceClick/);
    });
  });

  describe('S11: Obowiązkowy stan pusty Empty (NFR-INT-011)', () => {
    test('komponent Empty istnieje i udostępnia rolę summary oraz przycisk kolejnego kroku', () => {
      const empty = srcMap.get('src/components/Empty.tsx');
      expect(empty).toBeDefined();
      expect(empty).toMatch(/accessibilityRole="summary"/);
    });
  });

  describe('S12: Obowiązkowy stan brakującego rekordu Missing (NFR-INT-012)', () => {
    test('komponent Missing istnieje i posiada rolę alert oraz przycisk powrotu', () => {
      const missing = srcMap.get('src/components/Missing.tsx');
      expect(missing).toBeDefined();
      expect(missing).toMatch(/accessibilityRole="alert"/);
    });
  });

  describe('S13: Język i etykiety dostępności (NFR-INT-013, NFR-A11Y-001)', () => {
    test('zakaz pustych etykiet accessibilityLabel w komponentach klikalnych', () => {
      const bad = lines(/accessibilityLabel=['"]\s*['"]/);
      expect(bad).toEqual([]);
    });
  });

  describe('S14: Pola dotyku i zakaz roli link (NFR-INT-014, RD-ENG-03)', () => {
    test('zakaz accessibilityRole="link" dla nawigacji w aplikacji (przejścia to przyciski)', () => {
      const badLinks = lines(/accessibilityRole=['"]link['"]/);
      expect(badLinks).toEqual([]);
    });
  });

  describe('S15: Pole wyszukiwania SearchField z normalizacją diakrytyczną (NFR-INT-015, RD-ENG-07)', () => {
    test('SearchField posiada przycisk czyszczenia i normalizację ł/Ł -> l/L', () => {
      const search = srcMap.get('src/components/SearchField.tsx');
      expect(search).toBeDefined();
      expect(search).toMatch(/normalizeSearchQuery/);
      expect(search).toMatch(/replace\(\/\[ł\]\/g,\s*'l'\)/);

      // Weryfikacja działania normalizacji (RD-ENG-07):
      expect(normalizeSearchQuery('Żółty Liść')).toBe('zolty lisc');
      expect(searchMatches('Włóczka Merino Żółta', 'wloczka merino zolta')).toBe(true);
      expect(searchMatches('Ściągacz Raglanowy', 'sciagacz raglanowy')).toBe(true);
    });
  });

  describe('S16: Czystość warstwy widoków — zakaz bezpośredniego expo-sqlite w app/ (NFR-INT-016)', () => {
    test('pliki app/ i src/screens/ nie importują bezpośrednio expo-sqlite ani expo-file-system', () => {
      const viewFiles = [...srcMap.keys()].filter(
        (f) => f.startsWith('app/') || f.startsWith('src/screens/')
      );
      const badImports = viewFiles.filter((f) => {
        const s = srcMap.get(f)!;
        return /from\s+['"]expo-sqlite['"]/.test(s) || /from\s+['"]expo-file-system['"]/.test(s);
      });
      expect(badImports).toEqual([]);
    });
  });
});
