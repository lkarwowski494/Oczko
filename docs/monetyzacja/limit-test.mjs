// Sprawdza wzorzec `limit.mjs` na `wektory-limitu.json`. Uruchomienie: node docs/monetyzacja/limit-test.mjs
// Kod 0: wszystkie wektory zgodne; kod 1: co najmniej jeden niezgodny (lista na wyjściu).
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { startDnia, LIMIT_DNI, PRZERWA_MS } from './limit.mjs';

const w = JSON.parse(readFileSync(new URL('./wektory-limitu.json', import.meta.url), 'utf8'));
const bledy = [];
if (LIMIT_DNI !== w.limit) bledy.push(`LIMIT_DNI ${LIMIT_DNI} ≠ wektory ${w.limit}`);
if (PRZERWA_MS !== w.przerwa_ms) bledy.push(`PRZERWA_MS ${PRZERWA_MS} ≠ wektory ${w.przerwa_ms}`);
for (const t of w.startDnia) {
  const wynik = startDnia(t.wejscie);
  if (!isDeepStrictEqual(wynik, t.oczekiwane)) bledy.push(`${t.id} (${t.scenariusz}): ${JSON.stringify(wynik)} ≠ ${JSON.stringify(t.oczekiwane)}`);
}
const n = w.startDnia.length;
console.log(bledy.length ? `NIEZGODNE ${bledy.length} z ${n}:\n${bledy.join('\n')}` : `zgodne ${n} z ${n} wektorów`);
process.exit(bledy.length ? 1 : 0);
