// Tabela przekazania roli 07 → 08 (E4): plik testów akceptacyjnych → kryteria (ID z nazw testów) → pliki src do wdrożenia (importy zaślepek)
// → kolejność (moduly.md / e4-przekazanie roli 05: domena → dane → platforma → ekrany) → zależność od poprawek 01/02/05 (ER-/Z07- w pliku).
// Użycie: node docs/jakosc/narzedzia/tabela-08.mjs [--wynik docs/jakosc/e4/tabela-08.md]   (kod 1, gdy jakiś plik testów nie wskazuje pliku src)
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';

const KORZEN = resolve(dirname(new URL(import.meta.url).pathname), '../../..');
const AKC = join(KORZEN, 'tests/akceptacja');
const pliki = [];
(function skan(d) { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) skan(p); else if (/\.test\.tsx?$/.test(n)) pliki.push(p); } })(AKC);

const ID = /\b(BR-[A-Z]{3}-\d{3}(?:\/S\d+)?|NFR-[A-Z]{3}-\d{3}|KP-\d{2}|RD-\d{2}|P-\d{3}|R-\d{3}|PR-\d{2})\b/g;
const POPRAWKI = /\b(ER-\d{2}|Z07-\d{2})\b/g;
const KOLEJNOSC = [
  [/domena\/zakup/, 1, 'domena: limit, dostęp, informacje o Pro'],
  [/domena\/licznik/, 1, 'domena: licznik, scal, strażnik, przypomnienia'],
  [/domena\/(dni|obliczenia)/, 1, 'domena: dni, postęp, obliczenia'],
  [/domena\/maszyny/, 1, 'domena: maszyny stanów'],
  [/domena\/luki/, 1, 'domena: funkcje dodane w E3 (Z07-22)'],
  [/dane\//, 2, 'dane: port bazy, migracje, repozytoria, archiwum, kopie'],
  [/ekrany\//, 4, 'ekrany (po adapterach platformy, krok 3)'],
];
const wiersze = [];
let bledy = 0;
for (const p of pliki.sort()) {
  const t = readFileSync(p, 'utf8');
  const rel = relative(KORZEN, p);
  const src = [...new Set([...t.matchAll(/from\s+['"]((?:\.\.\/)+src\/[^'"]+)['"]/g)].map((m) => relative(KORZEN, resolve(dirname(p), m[1]))))].sort();
  const testy = (t.match(/\b(test|it)(\.each\([^)]*\))?\s*\(/g) ?? []).length;
  const ids = [...new Set(t.match(ID) ?? [])].sort();
  const plikSrc = (s) => ['.ts', '.tsx', '/index.ts'].map((e) => join(KORZEN, s + e)).find((x) => existsSync(x));
  const zPropozycji = src.some((s) => { const f = plikSrc(s); return f && /Z07-22/.test(readFileSync(f, 'utf8')); });
  const pop = [...new Set([...(t.match(POPRAWKI) ?? []), ...(zPropozycji ? ['Z07-22'] : [])])].sort();
  const [, nr, opis] = KOLEJNOSC.find(([re]) => re.test(rel)) ?? [null, 9, '?'];
  if (!src.length) { bledy++; console.log(`BŁĄD ${rel}: nie importuje żadnego pliku src`); }
  wiersze.push({ rel, src, testy, ids, pop, nr, opis });
}
wiersze.sort((a, b) => a.nr - b.nr || a.rel.localeCompare(b.rel));
const md = [
  '# Przekazanie 07 → 08: testy akceptacyjne → kryteria → pliki do wdrożenia',
  `Wygenerowano: \`node docs/jakosc/narzedzia/tabela-08.mjs --wynik docs/jakosc/e4/tabela-08.md\` (${new Date().toISOString().slice(0, 10)}). Kolejność według \`docs/architektura/e4-przekazanie.md\` („Co czyta każda rola: 08”): 1 domena, 2 dane, 3 adaptery i Swift (testy natywne: \`tests/wspolne/xctest-specyfikacja.md\`, scenariusze \`e2e/\`), 4 ekrany. Kolumna „Zależy od poprawek” = zgłoszenia wymienione w pliku testów: test może się zmienić w sesji fix 01/02/05 (P-090 Q3a, P-091 11a, P-096).`,
  '',
  '| Kolejność | Plik testów | Testy (wywołania) | Kryteria i ryzyka (ID) | Pliki src do wdrożenia | Zależy od poprawek |',
  '|---|---|---|---|---|---|',
  ...wiersze.map((w) => `| ${w.nr} ${w.opis} | \`${w.rel}\` | ${w.testy} | ${w.ids.join(', ') || '—'} | ${w.src.map((s) => `\`${s}\``).join('<br>')} | ${w.pop.join(', ') || '—'} |`),
  '',
  `Razem plików testów: ${wiersze.length}; zależnych od poprawek: ${wiersze.filter((w) => w.pop.length).length}.`,
];
const i = process.argv.indexOf('--wynik');
if (i > 0) { mkdirSync(dirname(process.argv[i + 1]), { recursive: true }); writeFileSync(process.argv[i + 1], md.join('\n') + '\n'); }
console.log(`plików testów: ${wiersze.length}, zależnych od poprawek: ${wiersze.filter((w) => w.pop.length).length}, błędów: ${bledy}`);
process.exit(bledy ? 1 : 0);
