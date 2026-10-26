// Teksty natywne Live Activity (ADR-0017 „Teksty natywne”, wzór Treningu tests/widget-i18n.test.ts): tabela język → klucz → tekst
// w targets/widget/Teksty.swift generowana ze słowników t() (sekcja `aktywnosc`); test porównuje zapisany plik z wygenerowanym.
// Aktualizacja: UPDATE_TEKSTY_NATYWNE=1 npx jest tests/adaptery/teksty-natywne.test.ts
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import en from '../../src/i18n/slowniki/en.json';

const KORZEN = join(__dirname, '../..');
const SLOWNIKI = join(KORZEN, 'src/i18n/slowniki');
const CELE = ['targets/widget/Teksty.swift', 'targets/watch/Teksty.swift'].map((c) => join(KORZEN, c)); // ta sama tabela w widżecie i na zegarku
const KLUCZE = Object.keys(en.aktywnosc).sort();

/** Napis Swift: ucieczka `\` i `"` (teksty bez znaków sterujących — sprawdza test niżej). */
const swift = (t: string) => `"${t.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
function generuj(): string {
  const jezyki = readdirSync(SLOWNIKI).filter((n) => /^[a-zA-Z-]+\.json$/.test(n) && !n.includes('kontekst')).map((n) => n.replace(/\.json$/, '')).sort();
  const wiersze = jezyki.map((j) => {
    const s = (JSON.parse(readFileSync(join(SLOWNIKI, `${j}.json`), 'utf8')) as { aktywnosc?: Record<string, string> }).aktywnosc ?? {};
    return `    ${swift(j)}: [${KLUCZE.filter((k) => s[k]).map((k) => `${swift(k)}: ${swift(s[k] ?? '')}`).join(', ')}],`;
  });
  return [
    '// Wygenerowane z src/i18n/slowniki/*.json (sekcja `aktywnosc`) przez tests/adaptery/teksty-natywne.test.ts — nie edytować (ADR-0017).',
    'import Foundation',
    '',
    'enum Teksty {',
    '  static let tabela: [String: [String: String]] = [',
    ...wiersze,
    '  ]',
    '  /// Język z preferencji systemu (pierwszy obsługiwany), zapas: angielski.',
    '  static func t(_ klucz: String) -> String {',
    '    for jezyk in Locale.preferredLanguages {',
    '      for kandydat in [jezyk, String(jezyk.prefix(while: { $0 != "-" }))] { if let tekst = tabela[kandydat]?[klucz] { return tekst } }',
    '    }',
    '    return tabela["en"]?[klucz] ?? klucz',
    '  }',
    '}',
    '',
  ].join('\n');
}

test.each(CELE.map((c) => [c.slice(KORZEN.length + 1), c] as const))('%s = tabela wygenerowana ze słowników t()', (_n, cel) => {
  const g = generuj();
  if (process.env.UPDATE_TEKSTY_NATYWNE === '1') writeFileSync(cel, g);
  expect(readFileSync(cel, 'utf8')).toBe(g);
});
test('klucze celów natywnych w źródle en: dodaj, limit, odejmij, polacz; bez znaków sterujących', () => {
  expect(KLUCZE).toEqual(['dodaj', 'limit', 'odejmij', 'polacz']);
  expect(Object.values(en.aktywnosc).filter((t) => /[\u0000-\u001f]/.test(t))).toEqual([]);
});
test('każdy klucz Teksty.t("…") użyty w Swift widżetu i zegarka jest w tabeli', () => {
  const swiftKod = ['targets/widget', 'targets/watch'].flatMap((k) => readdirSync(join(KORZEN, k)).filter((n) => n.endsWith('.swift')).map((n) => readFileSync(join(KORZEN, k, n), 'utf8'))).join('\n');
  const uzyte = [...new Set([...swiftKod.matchAll(/Teksty\.t\("([^"]+)"\)/g)].map((m) => m[1]))].sort();
  expect(uzyte.length).toBeGreaterThan(0);
  expect(uzyte.filter((k) => !KLUCZE.includes(k ?? ''))).toEqual([]);
});
