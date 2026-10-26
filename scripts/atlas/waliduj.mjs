// Walidator kart atlasu (ADR-0023): schemat → semantyka → rysunek każdego kroku. Ten sam dla roli 06 i dla `verify`.
// Użycie: node --experimental-strip-types --no-warnings scripts/atlas/waliduj.mjs <katalog-kart|plik.json> [--bez-rysunku]
//         node --experimental-strip-types --no-warnings scripts/atlas/waliduj.mjs --schema --write|--check   (docs/atlas/katalog.schema.json)
// Kod wyjścia: 0 = poprawne, 1 = błędy, 2 = użycie.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCHEMAT, walidujKarte } from './silnik/kontrakt.ts';
import { paletaZTokenow } from './silnik/svg.ts';
import { sprawdzKrok } from './silnik/sprawdz.ts';

const KORZEN = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PLIK_SCHEMATU = join(KORZEN, 'docs/atlas/katalog.schema.json');
const argv = process.argv.slice(2);
if (argv.includes('--schema')) {
  const tekst = JSON.stringify(SCHEMAT, null, 2) + '\n';
  if (argv.includes('--write')) { writeFileSync(PLIK_SCHEMATU, tekst); console.log(`zapisano ${PLIK_SCHEMATU}`); process.exit(0); }
  if (argv.includes('--check')) {
    const ok = existsSync(PLIK_SCHEMATU) && readFileSync(PLIK_SCHEMATU, 'utf8') === tekst;
    console.log(ok ? 'OK: schemat w repo = schemat z kontraktu' : `NIEAKTUALNY ${PLIK_SCHEMATU} — uruchom --schema --write`);
    process.exit(ok ? 0 : 1);
  }
  console.error('--schema wymaga --write albo --check'); process.exit(2);
}
const cel = argv.find((a) => !a.startsWith('--'));
if (!cel || !existsSync(cel)) { console.error('Użycie: waliduj.mjs <katalog-kart|plik.json> [--bez-rysunku]'); process.exit(2); }
const pliki = statSync(cel).isDirectory() ? readdirSync(cel).filter((f) => f.endsWith('.json')).sort().map((f) => join(cel, f)) : [cel];
const tokeny = JSON.parse(readFileSync(join(KORZEN, 'docs/design/tokeny.json'), 'utf8'));
const palety = [paletaZTokenow(tokeny, 'jasny'), paletaZTokenow(tokeny, 'ciemny')];
let bledy = 0;
for (const p of pliki) {
  let k;
  try { k = JSON.parse(readFileSync(p, 'utf8')); } catch (e) { console.log(`${basename(p)} [json] ${e.message}`); bledy++; continue; }
  const b = walidujKarte(k, argv.includes('--bez-rysunku') ? {} : { sprawdzKrok: sprawdzKrok(palety) });
  for (const e of b) console.log(`${basename(p)} [${e.kod}] ${e.sciezka}: ${e.szczegol}`);
  bledy += b.length;
}
console.log(bledy ? `${bledy} błędów w ${pliki.length} kartach` : `OK: ${pliki.length} kart bez błędów`);
process.exit(bledy ? 1 : 0);
