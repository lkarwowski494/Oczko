// Raport czerwieni testów przed kodem (DS-02): klasyfikuje powód porażki na sztucznym wyniku Jest (bez uruchamiania testów).
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const SKRYPT = join(__dirname, '../../scripts/jakosc/akceptacja-raport.mjs');
type Test = { title: string; status: string; failureMessages?: string[] };
function raport(testy: Test[], zestawNieZaladowany = false) {
  const k = mkdtempSync(join(tmpdir(), 'raport-'));
  const plik = join(k, 'w.json');
  const testResults = [{ name: join(process.cwd(), 'tests/akceptacja/x.test.ts'), status: zestawNieZaladowany ? 'failed' : 'passed', message: zestawNieZaladowany ? "Cannot find module '../x'" : '', assertionResults: testy.map((t) => ({ ancestorTitles: [], failureMessages: [], ...t })) }];
  writeFileSync(plik, JSON.stringify({ testResults }));
  return spawnSync('node', [SKRYPT, '--json', plik], { encoding: 'utf8' });
}

describe('akceptacja-raport.mjs (zasada roli 07 nr 3)', () => {
  test.each([
    ['znacznik', 'Error: NIEZAIMPLEMENTOWANE: KP-12 startDnia'],
    ['asercja expect', 'expect(received).toBe(expected)'],
    ['asercja RNTL (brak elementu)', 'Unable to find an element with role: button, name: "Add row"'],
    ['asercja RNTL (nazwa dostępna)', 'expect(element).toHaveAccessibleName("Add row")'],
  ])('R-171 właściwa czerwień: %s → kod 0', (_n, komunikat) => {
    expect(raport([{ title: 'BR-LIC-001/S1 x', status: 'failed', failureMessages: [komunikat] }]).status).toBe(0);
  });
  test.each([
    ['import', "Cannot find module '../../src/domena/brak' from 'x.test.ts'"],
    ['typ', "TypeError: limit.startDnia is not a function"],
    ['składnia', 'SyntaxError: Unexpected token'],
    ['nieznany', 'coś innego'],
  ])('R-171 zła czerwień: %s → kod 1', (_n, komunikat) => {
    const w = raport([{ title: 'BR-LIC-001/S1 x', status: 'failed', failureMessages: [komunikat] }]);
    expect(w.status).toBe(1);
    expect(w.stdout).toContain('zly');
  });
  test('R-171 test zielony przed kodem bez oznaczenia → kod 1; z [ZIELONY-OK: …] → kod 0', () => {
    expect(raport([{ title: 'KP-12 x', status: 'passed' }]).status).toBe(1);
    expect(raport([{ title: 'KP-12 x [ZIELONY-OK: parametr]', status: 'passed' }]).status).toBe(0);
  });
  test('R-171 test bez ID kryterium w nazwie → kod 1', () => {
    const w = raport([{ title: 'działa', status: 'failed', failureMessages: ['NIEZAIMPLEMENTOWANE: x'] }]);
    expect(w.stdout).toContain('bez ID');
    expect(w.status).toBe(1);
  });
  test('R-171 zestaw, który się nie załadował, i pusty zbiór → kod 1', () => {
    expect(raport([], true).status).toBe(1);
    expect(raport([]).status).toBe(1);
  });
});
