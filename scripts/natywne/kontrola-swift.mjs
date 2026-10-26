// Kontrola Swift w repo (Linux, jakosc:kontrole; X-RG-04, P-129 Q2a, jak Trening scripts/verify-native.mjs):
//  JEDNA-REGULA: każda reguła wspólna (`func mozeZaczacDzien`, `func startDnia`, `func proZegarka`, `func dzienLokalny`) ma jedną definicję
//                — w pakiecie modules/oczko-reguly; inny plik .swift z definicją to błąd, chyba że jest wpisaną kopią (niżej);
//  KOPIA: plik z listy KOPIE (cel natywny dostaje źródło pakietu, bo Xcode nie kompiluje pakietu z modules/) ma bajty równe źródłu;
//  PUSTO: brak pakietu albo brak definicji reguły to błąd (pusty zbiór to nie zaliczenie).
// Użycie: node scripts/natywne/kontrola-swift.mjs [--katalog <korzeń>]
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const PAKIET = 'modules/oczko-reguly/Sources';
/** Kopia w celu natywnym → źródło w pakiecie (dopisywane w 3C razem z celem). */
export const KOPIE = {};
const REGULY = ['mozeZaczacDzien', 'startDnia', 'proZegarka', 'dzienLokalny'];

export function kontrolaSwift(korzen, kopie = KOPIE) {
  const bledy = [];
  const zbierz = (d) => (existsSync(d) ? readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    if (n === '.build' || n === 'node_modules') return [];
    return statSync(p).isDirectory() ? zbierz(p) : n.endsWith('.swift') ? [p] : [];
  }) : []);
  if (!existsSync(join(korzen, PAKIET))) return [`PUSTO ${PAKIET}: brak pakietu reguł`];
  const pliki = ['modules', 'targets'].flatMap((k) => zbierz(join(korzen, k))).map((p) => relative(korzen, p).split('\\').join('/'));
  for (const [kopia, zrodlo] of Object.entries(kopie)) {
    if (!existsSync(join(korzen, kopia)) || !existsSync(join(korzen, zrodlo))) { bledy.push(`KOPIA ${kopia}: brak pliku albo źródła ${zrodlo}`); continue; }
    if (readFileSync(join(korzen, kopia), 'utf8') !== readFileSync(join(korzen, zrodlo), 'utf8')) bledy.push(`KOPIA ${kopia}: różni się od ${zrodlo} (skopiuj źródło pakietu)`);
  }
  for (const r of REGULY) {
    const wzor = new RegExp(`\\bfunc\\s+${r}\\b`);
    const z = pliki.filter((p) => wzor.test(readFileSync(join(korzen, p), 'utf8')));
    const wPakiecie = z.filter((p) => p.startsWith(`${PAKIET}/`));
    if (wPakiecie.length !== 1) bledy.push(`JEDNA-REGULA ${r}: ${wPakiecie.length} definicji w ${PAKIET} (oczekiwana 1)`);
    for (const p of z.filter((x) => !x.startsWith(`${PAKIET}/`) && !(x in kopie))) bledy.push(`JEDNA-REGULA ${r}: druga definicja w ${p} (użyj pakietu albo wpisz kopię w KOPIE)`);
  }
  return bledy;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const i = process.argv.indexOf('--katalog');
  const korzen = i > 0 ? process.argv[i + 1] : join(import.meta.dirname, '../..');
  const b = kontrolaSwift(korzen);
  for (const x of b) console.log(`BŁĄD ${x}`);
  console.log(`kontrola Swift: ${b.length} błędów`);
  process.exit(b.length ? 1 : 0);
}
