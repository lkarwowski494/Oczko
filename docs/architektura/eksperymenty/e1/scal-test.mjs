import { scal } from './scal.mjs'; import { readFileSync } from 'node:fs';
const W = JSON.parse(readFileSync(new URL('./scal-wektory.json', import.meta.url)));
let ok = 0;
for (const w of W) {
  const kopia = JSON.stringify(w.zdarzenia); const r = scal(w.zdarzenia); const o = w.oczekiwane;
  const zgodne = r.stan === o.stan && (o.wartosc === undefined || r.wartosc === o.wartosc) && (!o.wartosci || JSON.stringify(r.kandydaci.map((k) => k.wartosc).sort((a, b) => a - b)) === JSON.stringify(o.wartosci)) && JSON.stringify(w.zdarzenia) === kopia;
  // ta sama odpowiedź przy odwróconej kolejności wejścia (o ile komplet)
  const odwr = scal([...w.zdarzenia].reverse()); const zgodneOdwr = JSON.stringify({ s: odwr.stan, w: odwr.wartosc }) === JSON.stringify({ s: r.stan, w: r.wartosc });
  console.log(`${w.id} ${zgodne && zgodneOdwr ? 'OK' : 'BŁĄD'} — ${w.opis} → ${JSON.stringify(r)}`); if (zgodne && zgodneOdwr) ok++;
}
console.log(`${ok}/${W.length}`); process.exit(ok === W.length ? 0 : 1);
