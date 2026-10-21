// Macierz testów Oczko (BR-TEST-028..031)
// Inwentarz generowany automatycznie z kodu źródłowego:
//   EKRAN   — każda trasa w app/
//   UI      — interaktywne elementy (title, label, accessibilityLabel, placeholder, przyciski alertów)
//   TEKST   — każdy tekst w wywołaniach t('...')
//   LOGIKA  — każda eksportowana funkcja z src/core/
//   WYMIAR  — eksportowane tablice stałych i typy-unie z src/core/
// Dowód liczy się tylko z KODU testu (AST TS: bez komentarzy, tytułów test/it/describe i importów; Maestro bez komentarzy YAML #).
// Użycie: node scripts/test-matrix.mjs --write  (zapis do archiwum/stara-wersja/docs/22-macierz-testow.md)
//         node scripts/test-matrix.mjs --check  (weryfikacja braku regresji)

import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const ts = createRequire(import.meta.url)('typescript');
const root = fileURLToPath(new URL('..', import.meta.url));
const rel = (p) => relative(root, p).split('\\').join('/');

const walk = (d, re, out = []) => {
  if (!existsSync(d)) return out;
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.expo' && f !== 'scratch' && f !== 'trening_readonly') {
        walk(p, re, out);
      }
    } else if (re.test(f)) {
      out.push(p);
    }
  }
  return out;
};

const read = (p) => readFileSync(p, 'utf8');
const unq = (s) => s.replace(/\\'/g, "'").replace(/\\\\/g, '\\');

// Test files z katalogów tests/ oraz src/core/__tests__/
const testFiles = [
  ...walk(join(root, 'tests'), /\.(ts|tsx)$/),
  ...walk(join(root, 'src', 'core', '__tests__'), /\.(ts|tsx)$/),
];

const TEST_FNS = new Set(['test', 'it', 'describe', 'xit', 'xtest', 'fit', 'xdescribe', 'fdescribe']);
const ITER = new Set(['forEach', 'map', 'flatMap', 'filter', 'every', 'some', 'reduce', 'find', 'findIndex', 'entries', 'keys', 'values', 'slice', 'flat', 'join', 'length', 'indexOf', 'includes']);
const rootName = (e) =>
  ts.isIdentifier(e)
    ? e.text
    : ts.isPropertyAccessExpression(e)
    ? rootName(e.expression)
    : ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && e.expression.name.text === 'each'
    ? rootName(e.expression.expression)
    : '';

const nameOfExpr = (e) => (ts.isIdentifier(e) ? e.text : ts.isPropertyAccessExpression(e) ? e.name.text : '');

export function codeOf(file, src) {
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, /\.tsx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const lits = [];
  const regex = [];
  const ids = new Set();
  const iter = new Set();
  const titles = new Set();

  const visit = (n) => {
    if (ts.isImportDeclaration(n)) return;
    if (
      ts.isCallExpression(n) &&
      TEST_FNS.has(rootName(n.expression)) &&
      !(ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'each') &&
      n.arguments.length
    ) {
      titles.add(n.arguments[0]);
    }
    if (titles.has(n)) return;

    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) lits.push(n.text);
    else if (ts.isTemplateExpression(n)) lits.push(n.head.text + '${');
    else if (ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) lits.push(n.text);
    else if (ts.isRegularExpressionLiteral(n)) regex.push(n.text);
    else if (ts.isJsxText(n)) lits.push(n.text);
    else if (ts.isIdentifier(n)) ids.add(n.text);

    if (ts.isForOfStatement(n) || ts.isForInStatement(n)) {
      const r = nameOfExpr(n.expression);
      if (r) iter.add(r);
    }
    if (ts.isPropertyAccessExpression(n) && ITER.has(n.name.text)) {
      const r = nameOfExpr(n.expression);
      if (r) iter.add(r);
    }
    if (ts.isElementAccessExpression(n)) {
      const r = nameOfExpr(n.expression);
      if (r) iter.add(r);
    }
    if (ts.isSpreadElement(n)) {
      const r = nameOfExpr(n.expression);
      if (r) iter.add(r);
    }
    if (
      ts.isCallExpression(n) &&
      n.arguments.length &&
      ((ts.isPropertyAccessExpression(n.expression) && ['each', 'keys', 'values', 'entries', 'from'].includes(n.expression.name.text)) ||
        (ts.isIdentifier(n.expression) && n.expression.text === 'pick'))
    ) {
      for (const a of n.arguments) {
        const r = nameOfExpr(a);
        if (r) iter.add(r);
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return { lits, regex, ids, iter, text: lits.join('\u0000') };
}

export function yamlCode(src) {
  return src
    .split('\n')
    .map((line) => {
      let q = '';
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (q) {
          if (c === q) q = '';
          continue;
        }
        if (c === '"' || c === "'") q = c;
        else if (c === '#' && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i);
      }
      return line;
    })
    .join('\n');
}

const tests = testFiles.map((f) => ({ f: rel(f), code: codeOf(f, read(f)) }));
const maestro = walk(join(root, '.maestro'), /\.ya?ml$/).map((f) => {
  const src = yamlCode(read(f));
  return { f: rel(f), code: { lits: [src], regex: [], ids: new Set(), iter: new Set(), text: src } };
});

const evidence = (pred, pool = tests) => pool.filter((t) => pred(t.code)).map((t) => t.f);
const items = [];
const add = (kind, id, where, covered, extra = '') => items.push({ kind, id, where, covered, extra });

/* ---------- 1. EKRAN ---------- */
for (const f of walk(join(root, 'app'), /\.tsx$/)) {
  const r = rel(f).replace(/^app\//, '').replace(/\.tsx$/, '');
  if (/(^|\/)(_layout|_sitemap|\+not-found)$/.test(r)) continue;
  const route = '/' + r.replace(/\(tabs\)\/?/, '').replace(/(^|\/)index$/, '').replace(/\[\w+\]/g, '');
  const stem = route.replace(/\/+$/, '') || '/';
  const hit = (l) => l === stem || l.startsWith(stem + '/') || l.startsWith(stem + '?') || l === stem + '${';
  add(
    'EKRAN',
    stem,
    rel(f),
    evidence((c) => (stem === '/' ? c.ids.has('renderApp') || c.lits.includes('/') || c.lits.includes('Licznik') : c.lits.some(hit)))
  );
}

/* ---------- 2. UI ---------- */
const uiRe = /\b(?:title|label|accessibilityLabel|detail|placeholder)=\{\s*(?:t|tr)\(\s*'((?:[^'\\]|\\.)*)'|<(?:Btn|Item|Chip|SwitchRow|Field|Segmented|Button)\b[^>]*?\b(?:title|label)=\{\s*(?:t|tr)\(\s*'((?:[^'\\]|\\.)*)'/g;
const segRe = /\{\s*(?:value|v)\s*:\s*'[^']*'\s*,\s*label\s*:\s*(?:t|tr)\(\s*'((?:[^'\\]|\\.)*)'/g;
const ui = new Map();

for (const f of [...walk(join(root, 'app'), /\.tsx$/), ...walk(join(root, 'src', 'components'), /\.tsx$/)]) {
  const src = read(f);
  for (const m of src.matchAll(uiRe)) {
    const k = unq(m[1] ?? m[2]);
    if (!ui.has(k)) ui.set(k, rel(f));
  }
  for (const m of src.matchAll(segRe)) {
    const k = unq(m[1]);
    if (!ui.has(k)) ui.set(k, rel(f));
  }
  for (const m of src.matchAll(/\btext\s*:\s*(?:t|tr)\(\s*'((?:[^'\\]|\\.)*)'/g)) {
    const k = unq(m[1]);
    if (!ui.has(k)) ui.set(k, rel(f));
  }
  for (const m of src.matchAll(/\b(?:labels|options)\s*(?:=|:)\s*\[([^\]]*)\]/g)) {
    for (const n of m[1].matchAll(/\b(?:t|tr)\(\s*'((?:[^'\\]|\\.)*)'/g)) {
      const k = unq(n[1]);
      if (!ui.has(k)) ui.set(k, rel(f));
    }
  }
}

/* ---------- 3. TEKST ---------- */
const txt = new Map();
for (const f of [
  ...walk(join(root, 'app'), /\.tsx$/),
  ...walk(join(root, 'src', 'components'), /\.tsx$/),
  ...walk(join(root, 'src', 'core'), /\.tsx?$/).filter((f) => !/i18n(\.en)?\.ts$|locales/.test(f)),
]) {
  const src = read(f);
  for (const m of src.matchAll(/\b(?:t|tr)\(\s*'((?:[^'\\]|\\.)*)'/g)) {
    const k = unq(m[1]);
    if (!ui.has(k) && !txt.has(k)) txt.set(k, rel(f));
  }
}

const rxEsc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const inCode = (c, s) => c.lits.some((l) => l.includes(s)) || c.regex.some((r) => r.includes(s) || r.includes(rxEsc(s)));
const stable = (k) => k.split(/\{\w+\}/).map((s) => s.trim()).sort((a, b) => b.length - a.length)[0] ?? '';

for (const [k, where] of [...ui].sort((a, b) => a[0].localeCompare(b[0], 'pl'))) {
  const s = stable(k);
  if (s.length < 2) {
    add('UI', k, where, ['(pokrycie przez test ekranu)']);
    continue;
  }
  add('UI', k, where, [...evidence((c) => inCode(c, s)), ...evidence((c) => c.text.includes(s), maestro)]);
}

for (const [k, where] of [...txt].sort((a, b) => a[0].localeCompare(b[0], 'pl'))) {
  const s = stable(k);
  if (s.length < 2) {
    add('TEKST', k, where, ['(tylko parametry)']);
    continue;
  }
  add('TEKST', k, where, [...evidence((c) => inCode(c, s)), ...evidence((c) => c.text.includes(s), maestro)]);
}

/* ---------- 4. LOGIKA ---------- */
for (const f of walk(join(root, 'src', 'core'), /\.ts$/)) {
  const r = rel(f);
  if (/i18n(\.en)?\.ts$|locales\/|__tests__/.test(r)) continue;
  const src = read(f);
  const modId = r.replace(/^src\/core\//, '').replace(/\.ts$/, '');
  for (const m of src.matchAll(/^export\s+(?:async\s+)?(?:function\s+(\w+)|const\s+(\w+)\s*(?::[^=]+)?=\s*(?:\([^)]*\)|\w+)\s*(?::[^=]+)?=>)/gm)) {
    const n = m[1] ?? m[2];
    add('LOGIKA', `${modId}.${n}`, r, evidence((c) => c.ids.has(n) || c.lits.includes(n)));
  }
}

/* ---------- 5. WYMIAR ---------- */
const litsSeen = (vals) => {
  const seen = new Map();
  for (const t of tests) {
    for (const v of vals) {
      if (t.code.lits.includes(v)) {
        if (!seen.has(v)) seen.set(v, t.f);
      }
    }
  }
  return seen;
};

for (const f of walk(join(root, 'src', 'core'), /\.ts$/)) {
  const r = rel(f);
  if (/i18n(\.en)?\.ts$|locales\/|__tests__/.test(r)) continue;
  const sf = ts.createSourceFile(f, read(f), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  for (const st of sf.statements) {
    if (!st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (!ts.isIdentifier(d.name) || !/^[A-Z][A-Z0-9_]*$/.test(d.name.text) || !d.initializer) continue;
        let e = d.initializer;
        while (ts.isAsExpression(e) || ts.isParenthesizedExpression(e) || (ts.isSatisfiesExpression && ts.isSatisfiesExpression(e))) e = e.expression;
        if (!ts.isArrayLiteralExpression(e)) continue;
        if (d.type && ts.isTupleTypeNode(ts.isTypeOperatorNode(d.type) ? d.type.type : d.type)) continue;
        const n = d.name.text;
        const vals = e.elements.filter((x) => ts.isStringLiteral(x)).map((x) => x.text);
        const iterated = evidence((c) => c.iter.has(n));
        const seen = vals.length === e.elements.length && vals.length ? litsSeen(vals) : new Map();
        const miss = vals.length === e.elements.length && vals.length ? vals.filter((v) => !seen.has(v)) : null;
        add(
          'WYMIAR',
          `${n} (${e.elements.length})`,
          r,
          iterated.length ? iterated : miss && !miss.length ? [...new Set(seen.values())] : [],
          miss?.length ? miss.join(', ') : ''
        );
      }
    }
    if (ts.isTypeAliasDeclaration(st) && ts.isUnionTypeNode(st.type)) {
      const vals = st.type.types.filter((x) => ts.isLiteralTypeNode(x) && ts.isStringLiteral(x.literal)).map((x) => x.literal.text);
      if (vals.length < 2) continue;
      const seen = litsSeen(vals);
      const miss = vals.filter((v) => !seen.has(v));
      add('WYMIAR', `${st.name.text}: ${vals.join(' | ')}`, r, miss.length ? [] : [...new Set(seen.values())], miss.join(', '));
    }
  }
}

/* ---------- Podsumowanie i generowanie raportu ---------- */
const exPath = join(root, 'tests/matrix-exceptions.json');
const exc = existsSync(exPath) ? JSON.parse(read(exPath)) : {};
const keyOf = (it) => `${it.kind}:${it.id}`;
const ids = new Set(items.map(keyOf));
const missing = items.filter((it) => !it.covered.length && !exc[keyOf(it)]);
const stale = Object.keys(exc).filter((k) => !ids.has(k) || items.find((it) => keyOf(it) === k)?.covered.length);

const kinds = ['EKRAN', 'UI', 'TEKST', 'LOGIKA', 'WYMIAR'];
const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

let md =
  `# 22. Macierz testów (generowana z AST)\n\n` +
  `Dokument wygenerowany przez \`node scripts/test-matrix.mjs --write\` (BR-TEST-028..031).\n` +
  `Każdy element interfejsu, trasa, funkcja domenowa oraz wartości wymiarów muszą posiadać dowód w kodzie testu.\n` +
  `Dowód liczy się tylko z kodu testu: bez komentarzy, tytułów \`test\`/\`describe\` i importów; Maestro bez komentarzy YAML.\n\n` +
  `| Kategoria | Pozycji | Z testem | Wyjątki | Pokrycie |\n|---|---|---|---|---|\n` +
  kinds
    .map((k) => {
      const a = items.filter((i) => i.kind === k);
      const covered = a.filter((i) => i.covered.length).length;
      const exceptions = a.filter((i) => !i.covered.length && exc[keyOf(i)]).length;
      const pct = a.length ? Math.round(((covered + exceptions) / a.length) * 100) : 100;
      return `| ${k} | ${a.length} | ${covered} | ${exceptions} | **${pct}%** |`;
    })
    .join('\n') +
  '\n';

for (const k of kinds) {
  md += `\n## ${k}\n\n| Pozycja | Źródło | Dowód (pierwsze 3 testy) |\n|---|---|---|\n`;
  for (const it of items.filter((i) => i.kind === k)) {
    md += `| ${cell(it.id)} | ${it.where} | ${
      it.covered.length
        ? cell(it.covered.slice(0, 3).join(', ') + (it.covered.length > 3 ? ` +${it.covered.length - 3}` : ''))
        : 'WYJĄTEK: ' + cell(exc[keyOf(it)] ?? 'BRAK')
    } |\n`;
  }
}

const docPath = join(root, 'archiwum/stara-wersja/docs/22-macierz-testow.md');
const mode = process.argv[2];

if (mode === '--write') {
  writeFileSync(docPath, md, 'utf8');
  console.log(`Zapisano ${docPath}`);
}

const docOk = existsSync(docPath) && read(docPath) === md;
console.log(
  `Macierz AST: ${items.length} pozycji (${kinds.map((k) => `${k}: ${items.filter((i) => i.kind === k).length}`).join(', ')}), bez testu: ${missing.length}, nieaktualne wyjątki: ${stale.length}`
);

if (missing.length) {
  console.log(
    'BEZ TESTU:\n' +
      missing.slice(0, 50).map((it) => `  ${keyOf(it)} (${it.where})${it.extra ? ' — brak: ' + it.extra : ''}`).join('\n') +
      (missing.length > 50 ? `\n  … +${missing.length - 50}` : '')
  );
}

if (stale.length) {
  console.log('Nieaktualne wyjątki:\n' + stale.map((k) => '  ' + k).join('\n'));
}

if (mode === '--check' && !docOk) {
  console.log('archiwum/stara-wersja/docs/22-macierz-testow.md nieaktualny — uruchom: node scripts/test-matrix.mjs --write');
}

process.exit(missing.length || stale.length || (mode === '--check' && !docOk) ? 1 : 0);
