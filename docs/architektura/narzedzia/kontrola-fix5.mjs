// kontrola-fix5.mjs — kontrola dokumentów roli 05 fix-5 (NZ-08-P4-05, P-151, P-156): ADR-0008 po P-142 (4a) i N3,
// kontrakt prośby o ocenę (P-150 E2-1a). Przed poprawką czerwone (dowód stanu wyjściowego), po poprawce zielone.
// Użycie: node docs/architektura/narzedzia/kontrola-fix5.mjs [--id adr4a,n3,...]   (kod 1, gdy któraś pozycja nie przechodzi)
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const K = join(import.meta.dirname, '../../..');
const czytaj = (p) => (existsSync(join(K, p)) ? readFileSync(join(K, p), 'utf8') : '');
const sekcja = (tekst, naglowek) => tekst.split(/^## /m).find((s) => s.startsWith(naglowek)) ?? '';
const adr8 = czytaj('docs/adr/0008-plus-jeden-z-ekranu-blokady-dziennik.md');
const fix5 = sekcja(adr8, 'Uzupełnienie 2026-10-26 (fix-5');

/** id → lista [opis, warunek]. */
const KONTROLE = {
  adr4a: [['ADR-0008: przy `uwaga != null` przycisk +1 zostaje (P-142 4a), bez zdania „zamiast przycisku komunikat”', () => !/zamiast przycisku/.test(adr8) && /`uwaga != null`[^\n]*przycisk \+1 zostaje[^\n]*P-142 \(4a\)/.test(adr8)]],
  n3: [['ADR-0008 (fix-5): ryzyko nazwane N3 — zegarek ze stanem v2 nie widzi blokady; brzegowe; bez odrzucenia na telefonie (P-151)', () => ['N3', 'brzegowe', 'X-ZG-11', 'P-151', 'nie odrzuca'].every((s) => fix5.includes(s)) && /stan\w* v2/.test(fix5)]],
};

const i = process.argv.indexOf('--id');
const wybrane = i > 0 ? process.argv[i + 1].split(',') : Object.keys(KONTROLE);
let zle = 0, razem = 0;
for (const id of wybrane) {
  for (const [opis, warunek] of KONTROLE[id] ?? [[`nieznane id ${id}`, () => false]]) {
    razem += 1;
    const ok = warunek();
    if (!ok) zle += 1;
    console.log(`${ok ? 'OK  ' : 'BRAK'} (${id}) ${opis}`);
  }
}
console.log(`kontrola fix-5: ${razem - zle}/${razem}`);
process.exit(zle ? 1 : 0);
