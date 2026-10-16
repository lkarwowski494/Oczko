// Sprawdza kompletność tłumaczeń (Apps4Brew i18n Standard): każde t('…') z literałem w kodzie
// musi mieć wpis w src/core/i18n.en.ts z tymi samymi parametrami {…}.
// Uruchom: node scripts/check-i18n.mjs (kod wyjścia 1 = braki)
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const files = [];

const walk = (d) => {
  if (!existsSync(d)) return;
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.expo' && f !== 'scratch' && f !== 'trening_readonly') {
        walk(p);
      }
    } else if (/\.(ts|tsx)$/.test(f) && !/i18n(\.en)?\.ts$/.test(f) && !/\.test\.(ts|tsx)$/.test(f)) {
      files.push(p);
    }
  }
};

['src', 'app'].forEach((d) => walk(join(root, d)));
if (existsSync(join(root, 'App.tsx'))) files.push(join(root, 'App.tsx'));

const unq = (s) => s.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
const used = new Map();

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\bt\(\s*'((?:[^'\\]|\\.)*)'/g)) {
    used.set(unq(m[1]), f);
  }
}

const dictPath = join(root, 'src/core/i18n.en.ts');
const dictSrc = readFileSync(dictPath, 'utf8');
const params = (k) => [...k.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

const dict = Object.fromEntries(
  [...dictSrc.matchAll(/'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'/g)].map((m) => [
    unq(m[1]),
    unq(m[2]),
  ])
);

const keys = new Set(Object.keys(dict));
const missing = [...used.keys()].filter((k) => !keys.has(k));
const badParams = Object.keys(dict).filter((k) => params(k) !== params(dict[k]));

console.log(`i18n: ${used.size} tekstów w kodzie, ${keys.size} w słowniku EN`);
if (missing.length) {
  console.log('BRAK tłumaczenia w słowniku EN:\n' + missing.map((k) => `  '${k}' (${used.get(k).replace(root, '')})`).join('\n'));
}
if (badParams.length) {
  console.log('Różne parametry {…} w PL i EN:\n' + badParams.map((k) => '  ' + k).join('\n'));
}

process.exit(missing.length || badParams.length ? 1 : 0);
