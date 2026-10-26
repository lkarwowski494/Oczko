// Jedno źródło ścieżki bazy (P-176 warunek STOP E2, po ae20b71): katalog danych tylko z `sciezkiDanych` (src/dane/baza/sciezki.ts),
// otwarcie SQLite tylko w adapterze expo-sqlite (katalog jako URI file://), Swift nie otwiera bazy (granice.mjs SWIFT). Nazwa pliku `oczko.db`
// poza sciezki.ts tylko tam, gdzie wynika z formatu: wpis archiwum `.oczko` (ADR-0004), trzy pliki surowej kopii (ADR-0020), panel SHA buildu E2E.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const KORZEN = join(__dirname, '../..');
function pliki(katalog: string, wzorzec: RegExp): string[] {
  const w: string[] = [];
  for (const n of readdirSync(join(KORZEN, katalog))) {
    const p = join(KORZEN, katalog, n);
    if (statSync(p).isDirectory()) w.push(...pliki(relative(KORZEN, p), wzorzec));
    else if (wzorzec.test(n)) w.push(relative(KORZEN, p));
  }
  return w;
}
const TS = [...pliki('src', /\.tsx?$/), ...pliki('app', /\.tsx?$/)];
const SWIFT = [...pliki('modules', /\.swift$/), ...pliki('targets', /\.swift$/)];
const gdzie = (lista: string[], re: RegExp) => lista.filter((p) => re.test(readFileSync(join(KORZEN, p), 'utf8'))).sort();

test('openDatabase* tylko w adapterze expo-sqlite (katalog jako file://)', () => {
  expect(gdzie(TS, /openDatabase(Sync|Async)\(/)).toEqual(['src/dane/baza/adapter-expo.ts']);
  expect(readFileSync(join(KORZEN, 'src/dane/baza/adapter-expo.ts'), 'utf8')).toMatch(/openDatabaseSync\(nazwa, \{ useNewConnection: true \}, katalogJakoUri\(katalog\)\)/);
});
test('ścieżki danych liczone tylko przez sciezkiDanych: kontener (start normalny) i start-aplikacji (strażnik, tryb awaryjny)', () => {
  expect(gdzie(TS, /sciezkiDanych\(/).filter((p) => p !== 'src/dane/baza/sciezki.ts')).toEqual(['src/kompozycja/kontener.ts', 'src/kompozycja/start-aplikacji.ts']);
});
test('literał oczko.db poza sciezki.ts tylko w formacie archiwum, surowej kopii i panelu SHA E2E', () => {
  expect(gdzie(TS, /[/'"`]oczko\.db['"`-]/)).toEqual(['app/ustawienia.tsx', 'src/dane/archiwum.ts', 'src/dane/baza/sciezki.ts', 'src/dane/kopia-ratunkowa.ts'].sort());
});
test('Swift nie otwiera bazy (bez SQLite3 i bez ścieżki oczko.db)', () => {
  expect(gdzie(SWIFT, /import SQLite3|sqlite3_open|oczko\.db/)).toEqual([]);
});
