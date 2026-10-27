// JAK-09 (P-290): w „Jakość · Linux” żadne zadanie nie jest informacyjne — `akceptacja` (testy przed kodem) przeszła zielona i jest bramką
// jak `verify`. Nowe zadanie informacyjne wymaga wpisu tutaj z ID decyzji (zasada 8: najpierw raz informacyjnie w CI).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from './jakosc-ios-pomoc';

const INFORMACYJNE: Record<string, string> = {}; // zadanie → ID decyzji

test('jakosc-linux.yml: continue-on-error tylko przy zadaniach z listy INFORMACYJNE', () => {
  const wf = parse(readFileSync(join(__dirname, '../../.github/workflows/jakosc-linux.yml'), 'utf8'));
  expect(Object.keys(wf.jobs)).toContain('akceptacja');
  const informacyjne = Object.entries(wf.jobs).filter(([, z]) => z['continue-on-error'] !== undefined && z['continue-on-error'] !== false).map(([id]) => id);
  expect(informacyjne.filter((id) => !(id in INFORMACYJNE))).toEqual([]);
});
