// Sprawdza wzorzec `limit.mjs` na `wektory-limitu.json`. Uruchomienie: node docs/monetyzacja/limit-test.mjs
// Kod 0: wszystkie wektory zgodne; kod 1: co najmniej jeden niezgodny (lista na wyjściu).
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import * as L from './limit.mjs';
const { startDnia, LIMIT_DNI, PRZERWA_MS } = L;

const w = JSON.parse(readFileSync(new URL('./wektory-limitu.json', import.meta.url), 'utf8'));
const bledy = [];
if (LIMIT_DNI !== w.limit) bledy.push(`LIMIT_DNI ${LIMIT_DNI} ≠ wektory ${w.limit}`);
if (PRZERWA_MS !== w.przerwa_ms) bledy.push(`PRZERWA_MS ${PRZERWA_MS} ≠ wektory ${w.przerwa_ms}`);
for (const t of w.startDnia) {
  const wynik = startDnia(t.wejscie);
  if (!isDeepStrictEqual(wynik, t.oczekiwane)) bledy.push(`${t.id} (${t.scenariusz}): ${JSON.stringify(wynik)} ≠ ${JSON.stringify(t.oczekiwane)}`);
}
// Funkcja woła strażnika? (P-067); brak funkcji we wzorcu to błąd testu, nie pominięcie.
for (const t of w.wolaStraznika || []) {
  let wynik;
  try { wynik = typeof L.wolaStraznika === 'function' ? L.wolaStraznika(t.wejscie) : 'BRAK FUNKCJI wolaStraznika'; } catch { wynik = 'błąd'; }
  if (wynik !== t.oczekiwane) bledy.push(`${t.id} (${t.scenariusz}): ${JSON.stringify(wynik)} ≠ ${JSON.stringify(t.oczekiwane)}`);
}
// Stan zawczasu (P-065 (1a)): ta sama reguła co startDnia, bez zapisu i bez zmiany wejścia.
for (const t of w.mozeZaczacDzien || []) {
  const kopia = structuredClone(t.wejscie);
  let wynik;
  try { wynik = typeof L.mozeZaczacDzien === 'function' ? L.mozeZaczacDzien(t.wejscie) : 'BRAK FUNKCJI mozeZaczacDzien'; } catch { wynik = 'błąd'; }
  if (!isDeepStrictEqual(wynik, t.oczekiwane)) bledy.push(`${t.id} (${t.scenariusz}): ${JSON.stringify(wynik)} ≠ ${JSON.stringify(t.oczekiwane)}`);
  if (!isDeepStrictEqual(kopia, t.wejscie)) bledy.push(`${t.id}: funkcja zmieniła wejście`);
}
const n = w.startDnia.length + (w.wolaStraznika || []).length + (w.mozeZaczacDzien || []).length;
console.log(bledy.length ? `NIEZGODNE ${bledy.length} z ${n}:\n${bledy.join('\n')}` : `zgodne ${n} z ${n} wektorów`);
process.exit(bledy.length ? 1 : 0);
