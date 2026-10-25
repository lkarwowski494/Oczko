// Kontrole repo roli 07 (strategia §10): każda reguła pada na pliku-pułapce i przechodzi na przypadku dobrym (zasada sceptyka 2).
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const KONTROLE = join(__dirname, '../../scripts/jakosc/kontrole-repo.mjs');
const WORKFLOWY = join(__dirname, '../../scripts/jakosc/sprawdz-workflowy.mjs');

function repo(pliki: Record<string, string>): string {
  const k = mkdtempSync(join(tmpdir(), 'kontrole-'));
  const wszystkie = { 'package.json': '{"dependencies":{}}', ...pliki };
  for (const [p, t] of Object.entries(wszystkie)) { mkdirSync(dirname(join(k, p)), { recursive: true }); writeFileSync(join(k, p), t); }
  return k;
}
const uruchom = (skrypt: string, k: string) => spawnSync('node', [skrypt, '--katalog', k], { encoding: 'utf8' });

const PULAPKI: [string, string, string][] = [
  ['OR-REPLACE', 'src/dane/repozytoria/licznik.ts', "export const q = `INSERT  OR\n REPLACE INTO licznik VALUES (?)`;"],
  ['EXCLUSIVE-TX', 'src/dane/baza/kolejka.ts', 'db.withExclusiveTransactionAsync(async () => {});'],
  ['BAZA-W-PAMIECI', 'src/dane/baza/polaczenie.ts', "open(':memory:');"],
  ['KOPIA-SAMEGO-DB', 'src/dane/archiwum.ts', "await FileSystem.copyAsync({ from: 'app.db', to: kopia });"],
  ['VACUUM-RATUNEK', 'src/dane/kopia-ratunkowa.ts', "await port.run('VACUUM');"],
  ['STARY-PLIK-0-1-0', 'src/dane/baza/sciezki.ts', "const s = 'Library/SQLite/oczko.db';"],
  ['SQLITE3-SWIFT', 'targets/widget/Intencja.swift', 'import Foundation\nimport SQLite3\n'],
  ['SZTUCZNY-SKLEP', 'src/ekrany/Oferty.tsx', "if (process.env.EXPO_PUBLIC_STORE_FAKE === '1') {}"],
  ['WYMUSZONA-AWARIA', 'src/ekrany/Start.tsx', "if (process.env.EXPO_PUBLIC_WYMUS_AWARIE) throw new Error('x');"],
  ['CENY-W-KODZIE', 'src/ekrany/Oferty.tsx', "const cena = '14,99 zł';"],
  ['CENY-W-KODZIE', 'src/komponenty/Plan.tsx', "const c = '$0.99';"],
];

describe('kontrole-repo.mjs (strategia §10, kontrola 05-8, P-089)', () => {
  test.each(PULAPKI)('R-171 pułapka %s w %s pada (kod 1)', (regula, plik, tekst) => {
    const w = uruchom(KONTROLE, repo({ [plik]: tekst }));
    expect(w.status).toBe(1);
    expect(w.stdout).toContain(regula);
  });
  test('R-171 dobre pliki (UPSERT, VACUUM INTO, przełącznik w adapterze sklepu, ceny ze StoreKit) przechodzą (kod 0)', () => {
    const w = uruchom(KONTROLE, repo({
      'src/dane/repozytoria/licznik.ts': "export const q = 'INSERT INTO licznik (id) VALUES (?) ON CONFLICT (id) DO UPDATE SET wartosc = excluded.wartosc';",
      'src/dane/kopia-ratunkowa.ts': "await port.run('VACUUM INTO ?', [cel]);",
      'src/platforma/sklep.ts': "export const sztuczny = process.env.EXPO_PUBLIC_STORE_FAKE === '1';",
      'src/dane/baza/adapter-node.ts': "new DatabaseSync(':memory:');",
      'src/ekrany/Oferty.tsx': 'export const Cena = ({ p }: { p: { cenaWyswietlana: string } }) => p.cenaWyswietlana;',
    }));
    expect(w.stdout).toContain('naruszeń 0');
    expect(w.status).toBe(0);
  });
  test('R-171 testy i kod 0.1.0 są poza zakresem nowego kodu', () => {
    const w = uruchom(KONTROLE, repo({ 'src/core/database.ts': "open(':memory:')", 'src/dane/__tests__/x.test.ts': "open(':memory:')" }));
    expect(w.status).toBe(0);
  });
  test('R-171 package.json: expo-updates, SDK awarii i nieprzypięta wersja padają', () => {
    const w = uruchom(KONTROLE, repo({ 'package.json': JSON.stringify({ dependencies: { 'expo-updates': '1.0.0', '@sentry/react-native': '6.0.0', 'expo-iap': '^5.8.1' } }) }));
    expect(w.status).toBe(1);
    for (const r of ['EXPO-UPDATES', 'SDK-AWARII', 'PRZYPIECIE']) expect(w.stdout).toContain(r);
  });
  test('R-171 app.json z włączoną sekcją updates pada (ADR-0021)', () => {
    const w = uruchom(KONTROLE, repo({ 'app.json': JSON.stringify({ expo: { updates: { url: 'https://u.expo.dev/x' } } }) }));
    expect(w.stdout).toContain('EXPO-UPDATES app.json');
  });
  test('R-130 wydana migracja zmieniona po wydaniu pada (Z07-15)', () => {
    const w = uruchom(KONTROLE, repo({
      'src/dane/migracje/0001.sql': 'CREATE TABLE a (id TEXT);',
      'docs/jakosc/migracje-wydane.json': JSON.stringify({ migracje: [{ plik: 'src/dane/migracje/0001.sql', sha256: '0'.repeat(64) }] }),
    }));
    expect(w.status).toBe(1);
    expect(w.stdout).toContain('MIGRACJA-WYDANA');
  });
  test('R-171 zły korzeń (bez package.json) to błąd, nie zaliczenie', () => {
    const k = mkdtempSync(join(tmpdir(), 'pusty-'));
    expect(uruchom(KONTROLE, k).status).toBe(2);
  });
});

describe('sprawdz-workflowy.mjs (ADR-0014, kontrola 05-9)', () => {
  const wf = (nazwa: string, tekst: string) => repo({ [`.github/workflows/${nazwa}`]: tekst });
  test('R-173 sekret poza środowiskiem testflight pada', () => {
    const w = uruchom(WORKFLOWY, wf('a.yml', 'on: push\njobs:\n  b:\n    runs-on: macos-26\n    steps:\n      - run: echo ${{ secrets.ASC_KEY_ID }}\n'));
    expect(w.status).toBe(1);
    expect(w.stdout).toContain('SEKRET-BEZ-SRODOWISKA');
  });
  test('R-173 dowolna nazwa sekretu (nie tylko ASC_*) też pada', () => {
    const w = uruchom(WORKFLOWY, wf('a.yml', 'on: push\njobs:\n  b:\n    runs-on: ubuntu-latest\n    env:\n      K: ${{ secrets.KLUCZ_PODPISU }}\n    steps:\n      - run: true\n'));
    expect(w.stdout).toContain('KLUCZ_PODPISU');
  });
  test.each(['pull_request', 'pull_request_target', 'workflow_run'])('R-173 wyzwalacz %s w workflowie z sekretami pada', (wyz) => {
    const w = uruchom(WORKFLOWY, wf('t.yml', `on:\n  ${wyz}:\n  push:\n    tags: ['v*']\njobs:\n  b:\n    runs-on: macos-26\n    environment: testflight\n    steps:\n      - run: echo \${{ secrets.ASC_KEY_ID }}\n`));
    expect(w.stdout).toContain('WYZWALACZ-Z-SEKRETAMI');
  });
  test('R-173 sekret w zadaniu z environment: testflight i wyzwalaczem tag przechodzi', () => {
    const w = uruchom(WORKFLOWY, wf('t.yml', "on:\n  push:\n    tags: ['v*']\n  workflow_dispatch:\njobs:\n  b:\n    runs-on: macos-26\n    environment: testflight\n    steps:\n      - run: echo ${{ secrets.ASC_KEY_ID }} ${{ secrets.GITHUB_TOKEN }}\n"));
    expect(w.status).toBe(0);
  });
  test('P-089 sztuczny sklep w workflowie wydania pada', () => {
    const w = uruchom(WORKFLOWY, wf('t.yml', "on: workflow_dispatch\njobs:\n  b:\n    runs-on: macos-26\n    environment: testflight\n    env:\n      EXPO_PUBLIC_STORE_FAKE: '1'\n    steps:\n      - run: true\n"));
    expect(w.stdout).toContain('SZTUCZNY-SKLEP-W-WYDANIU');
  });
  test('R-173 brak workflowów to błąd, nie zaliczenie', () => {
    expect(uruchom(WORKFLOWY, repo({})).status).toBe(1);
  });
});

describe('ESLint src/dane (DS-12, kontrola 05-8)', () => {
  // ESLint przez CLI (konfiguracja płaska ładuje się dynamicznym importem, którego Jest nie obsługuje bez flag).
  const bledy = async (kod: string): Promise<string[]> => {
    const w = spawnSync('npx', ['eslint', '--format', 'json', '--stdin', '--stdin-filename', 'src/dane/pulapka.ts'], { input: kod, encoding: 'utf8', cwd: join(__dirname, '../..') });
    return JSON.parse(w.stdout)[0].messages.map((m: { ruleId: string }) => m.ruleId);
  };
  test('R-171 pusty catch pada', async () => {
    expect(await bledy('try { f(); } catch (e) {}')).toContain('no-empty');
  });
  test('R-171 withExclusiveTransactionAsync i OR REPLACE (także w szablonie) padają', async () => {
    expect(await bledy("db.withExclusiveTransactionAsync(async () => {}); const a = 'INSERT OR REPLACE INTO x'; const b = `insert or replace into ${'x'}`;")).toEqual(['no-restricted-syntax', 'no-restricted-syntax', 'no-restricted-syntax']);
  });
  test('R-171 catch z obsługą błędu przechodzi', async () => {
    expect(await bledy("try { f(); } catch (e) { zapiszBlad(e); throw e; }")).toEqual([]);
  });
});
