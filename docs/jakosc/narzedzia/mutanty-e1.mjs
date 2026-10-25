import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
// Użycie: skopiuj do pustego katalogu docs/monetyzacja/{limit,limit-test,dostep,dostep-test}.mjs, wektory-limitu.json, wektory-dostepu.json oraz docs/architektura/eksperymenty/e1/{scal.mjs,scal-test.mjs,scal-wektory.json}; potem node docs/jakosc/narzedzia/mutanty-e1.mjs <katalog>. Wynik 2026-10-25: 7 z 18 mutantów przeżywa (E1 roli 07).
import { execFileSync } from 'node:child_process';
const dir = process.argv[2];
const M = {
 'limit.mjs': [
  ['teraz - ostatniPlus < przerwa', 'teraz - ostatniPlus <= przerwa'],
  ['teraz - ostatniPlus >= 0 &&', ''],
  ['darmowe(dni) < limit', 'darmowe(dni) <= limit'],
  ['!pro && zostalo === 1', '!pro && zostalo <= 1'],
  ['!pro && zostalo === 1', 'zostalo === 1'],
  ["d.data.startsWith(miesiac) && !d.pro).length;\n  const wynik", "d.data.startsWith(miesiac)).length;\n  const wynik"],
  ['if (pro) return wynik(true, { data: dzis, pro: true });', 'if (pro) return wynik(true, null);'],
  ['Math.max(0, limit - darmowe(po))', 'limit - darmowe(po)'],
  ['dzis.slice(0, 7)', 'dzis.slice(0, 4)'],
 ],
 'dostep.mjs': [
  ['u.wygasa > teraz', 'u.wygasa >= teraz'],
  ['pamiec.wygasa > teraz', 'pamiec.wygasa >= teraz'],
  ['Math.max(...wazne.map((u) => u.wygasa))', 'Math.min(...wazne.map((u) => u.wygasa))'],
  ['wazne.some((u) => u.wygasa === null) ? null :', ''],
  ['pamiec.produkty.length > 0 &&', ''],
  ['!u.odebrane && ', ''],
 ],
 'scal.mjs': [
  ['w = Math.max(0, baza +', 'w = (baza +'],
  ['.sort();', ';'],
  ['wartoscW(z.rodzice[0], pamiec)', 'wartoscW(z.rodzice[z.rodzice.length-1], pamiec)'],
 ],
};
const testy = { 'limit.mjs': 'limit-test.mjs', 'dostep.mjs': 'dostep-test.mjs', 'scal.mjs': 'scal-test.mjs' };
for (const [plik, lista] of Object.entries(M)) {
  const oryg = readFileSync(`${dir}/${plik}`, 'utf8');
  for (const [a, b] of lista) {
    if (!oryg.includes(a)) { console.log('BRAK WZORCA', plik, a); continue; }
    writeFileSync(`${dir}/${plik}`, oryg.replace(a, b));
    let kod = 0; try { execFileSync('node', [`${dir}/${testy[plik]}`], { stdio: 'pipe' }); } catch (e) { kod = e.status; }
    console.log(kod ? 'ZABITY ' : 'PRZEŻYŁ', plik, JSON.stringify(a).slice(0,60), '→', JSON.stringify(b).slice(0,60));
  }
  writeFileSync(`${dir}/${plik}`, oryg);
}
