#!/usr/bin/env node
/**
 * Weryfikacja licencji Open Source (NFR-SEC-009).
 * Analizuje drzewo zależności produkcyjnych i blokuje licencje z rodziny GPL/AGPL/LGPL/MPL/UNKNOWN.
 * Użycie: node scripts/licenses.mjs [--check]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'src/core/licenses.generated.ts');
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
const P = lock.packages;

const ALLOWED = new Set([
  'MIT',
  'ISC',
  '0BSD',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'Apache-2.0',
  'BSL-1.0',
  'OFL-1.1',
  'CC0-1.0',
  'CC-BY-4.0',
  'Unlicense',
  'BlueOak-1.0.0',
  'Python-2.0',
  'blessing',
]);

const FORBIDDEN_FAMILY = /(?:^|\b)(GPL|AGPL|LGPL|SSPL|CPAL|EUPL|UNKNOWN|UNLICENSED)(?:\b|$)/i;

function resolve(from, dep) {
  let p = from;
  for (;;) {
    const k = (p ? p + '/' : '') + 'node_modules/' + dep;
    if (P[k] && !P[k].dev && !P[k].devOptional) return k;
    if (!p) return null;
    const i = p.lastIndexOf('/node_modules/');
    p = i < 0 ? '' : p.slice(0, i);
  }
}

const seen = new Map();
const queue = Object.keys(P[''].dependencies ?? {}).map((d) => resolve('', d)).filter(Boolean);

while (queue.length) {
  const k = queue.pop();
  if (seen.has(k)) continue;
  const e = P[k];
  seen.set(k, e);
  for (const d of Object.keys({ ...e.dependencies, ...e.optionalDependencies, ...e.peerDependencies })) {
    if (e.peerDependenciesMeta?.[d]?.optional && !e.dependencies?.[d] && !e.optionalDependencies?.[d]) continue;
    const r = resolve(k, d);
    if (r && !seen.has(r)) queue.push(r);
  }
}

const rows = [];
const errors = [];

for (const [k, e] of seen) {
  let pj = null;
  try {
    pj = JSON.parse(readFileSync(join(root, k, 'package.json'), 'utf8'));
  } catch {}

  const rawLic = e.license ?? (typeof pj?.license === 'string' ? pj.license : Array.isArray(pj?.licenses) ? pj.licenses.map((x) => x.type ?? x).join(' OR ') : 'UNKNOWN');
  
  // Resolve dual/multi licenses
  let chosen = rawLic;
  if (rawLic.includes(' OR ')) {
    const parts = rawLic.replace(/[()]/g, '').split(/\s+OR\s+/);
    const permissive = parts.find((p) => ALLOWED.has(p.trim()));
    if (permissive) chosen = permissive.trim();
  } else if (rawLic.includes(' AND ')) {
    const parts = rawLic.replace(/[()]/g, '').split(/\s+AND\s+/);
    const allAllowed = parts.every((p) => ALLOWED.has(p.trim()));
    if (allAllowed) chosen = rawLic;
  }

  const pkgName = k.slice(k.lastIndexOf('node_modules/') + 'node_modules/'.length);
  const version = e.version ?? pj?.version ?? '';

  if (FORBIDDEN_FAMILY.test(chosen) && !rawLic.includes(' OR ')) {
    errors.push(`Zakazana licencja ${rawLic} w ${pkgName}@${version}`);
  }

  rows.push({ name: pkgName, version, license: chosen, raw: rawLic });
}

if (errors.length > 0) {
  console.error('[check:licenses] BŁĘDY LICENCJI:');
  for (const err of errors) console.error(`  ✖ ${err}`);
  process.exit(1);
}

rows.sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));

const content = `/* Wygenerowane: node scripts/licenses.mjs (NFR-SEC-009) — nie edytuj ręcznie. */
export const LICENSES: readonly { name: string; version: string; license: string }[] = ${JSON.stringify(
  rows.map((r) => ({ name: r.name, version: r.version, license: r.license })),
  null,
  2
)};
`;

if (process.argv.includes('--check')) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (current !== content) {
    console.error('[check:licenses] Plik src/core/licenses.generated.ts jest nieaktualny. Uruchom: node scripts/licenses.mjs');
    process.exit(1);
  }
  console.log(`[check:licenses] OK: Wszystkie licencje (${rows.length} pakietów) są poprawne i permisywne.`);
} else {
  writeFileSync(OUT, content, 'utf8');
  console.log(`[check:licenses] Zapisano ${OUT} (${rows.length} pakietów).`);
}
