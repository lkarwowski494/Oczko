// Sprawdza wzorzec `dostep.mjs` na `wektory-dostepu.json`. Uruchomienie: node docs/monetyzacja/dostep-test.mjs
// Kod 0: wszystkie wektory zgodne; kod 1: co najmniej jeden niezgodny (lista na wyjściu).
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { decyzja, odczytajPamiec, ODBLOKOWUJA } from './dostep.mjs';

const w = JSON.parse(readFileSync(new URL('./wektory-dostepu.json', import.meta.url), 'utf8'));
const bledy = [];
if (!isDeepStrictEqual([...ODBLOKOWUJA], w.odblokowuja)) bledy.push(`ODBLOKOWUJA ${JSON.stringify(ODBLOKOWUJA)} ≠ wektory ${JSON.stringify(w.odblokowuja)}`);
for (const t of w.decyzja) {
  const wynik = decyzja(t.odczyt, t.pamiec, w.teraz, w.odblokowuja);
  if (!isDeepStrictEqual(wynik, t.oczekiwane)) bledy.push(`${t.id} (${t.scenariusz}): ${JSON.stringify(wynik)} ≠ ${JSON.stringify(t.oczekiwane)}`);
}
for (const t of w.odczytajPamiec) {
  const wynik = odczytajPamiec(t.wejscie);
  if (!isDeepStrictEqual(wynik, t.oczekiwane)) bledy.push(`${t.id} (${t.scenariusz}): ${JSON.stringify(wynik)} ≠ ${JSON.stringify(t.oczekiwane)}`);
}
const n = w.decyzja.length + w.odczytajPamiec.length;
console.log(bledy.length ? `NIEZGODNE ${bledy.length} z ${n}:\n${bledy.join('\n')}` : `zgodne ${n} z ${n} wektorów`);
process.exit(bledy.length ? 1 : 0);
