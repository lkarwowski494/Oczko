// granice.mjs — użycie: node granice.mjs <katalog-źródeł> [katalog-domeny=domena] [limit-KB=20]
// Zgłasza: pliki ponad limit, importy spoza domeny i konfiguracji w domenie (pakiety tylko z listy DOZWOLONE; `import type` wolno), cykle importów. Kod wyjścia 1 przy naruszeniu.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
const [src, domena = 'domena', limitKB = '20'] = process.argv.slice(2);
const root = resolve(src), dom = resolve(root, domena) + sep;
const EXT = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
const DOZWOLONE = /^$/; // pakiety dozwolone w domenie (czyste biblioteki z ADR), np. /^(date-fns|zod)(\/.*)?$/
const pomin = (p) => /\.(test|spec)\.|\.d\.ts$|__tests__|node_modules/.test(p);
const pliki = [];
(function skan(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) skan(p);
    else if (EXT.some((e) => n.endsWith(e)) && !pomin(p)) pliki.push(p);
  }
})(root);
const znajdz = (baza) => [baza, ...EXT.map((e) => baza + e), ...EXT.map((e) => join(baza, 'index' + e))].find((p) => existsSync(p) && statSync(p).isFile());
const IMPORT = /(?:import|export)\s+(type\s+)?(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]|(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const graf = new Map(); let bledy = 0;
const zgl = (s) => { console.log(s); bledy++; };
for (const p of pliki) {
  const tekst = readFileSync(p, 'utf8'), rel = relative(root, p), kb = Buffer.byteLength(tekst) / 1024;
  if (kb > Number(limitKB)) zgl(`ROZMIAR ${rel}: ${kb.toFixed(1)} KB > ${limitKB} KB`);
  const krawedzie = [];
  for (const m of tekst.matchAll(IMPORT)) {
    const spec = m[2] ?? m[3], tylkoTyp = Boolean(m[1]);
    const baza = spec.startsWith('.') ? resolve(dirname(p), spec) : spec.startsWith('@/') ? join(root, spec.slice(2)) : null;
    const cel = baza && znajdz(baza);
    const wolno = cel ? cel.startsWith(dom) || /konfiguracja\.[jt]s$/.test(cel) : !baza && DOZWOLONE.test(spec);
    if (p.startsWith(dom) && !tylkoTyp && !wolno) zgl(`DOMENA ${rel} importuje '${spec}'`);
    if (cel && !tylkoTyp) krawedzie.push(cel);
  }
  graf.set(p, krawedzie);
}
const stan = new Map(), sciezka = [], cykle = new Set();
(function dfsWszystkie() {
  const dfs = (u) => {
    stan.set(u, 1); sciezka.push(u);
    for (const v of graf.get(u) ?? []) {
      if (stan.get(v) === 1) cykle.add(sciezka.slice(sciezka.indexOf(v)).concat(v).map((x) => relative(root, x)).join(' -> '));
      else if (!stan.has(v)) dfs(v);
    }
    sciezka.pop(); stan.set(u, 2);
  };
  for (const p of pliki) if (!stan.has(p)) dfs(p);
})();
for (const c of cykle) zgl(`CYKL ${c}`);
console.log(bledy ? `${bledy} naruszeń w ${pliki.length} plikach` : `OK: ${pliki.length} plików, bez naruszeń`);
process.exit(bledy ? 1 : 0);
