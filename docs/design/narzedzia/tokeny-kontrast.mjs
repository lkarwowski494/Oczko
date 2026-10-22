// tokeny-kontrast.mjs — z tokeny.json buduje pary sąsiadujących kolorów (oba motywy i warianty „Zwiększ kontrast”) do kontrast.mjs.
// node narzedzia/tokeny-kontrast.mjs tokeny.json > kontrast-pary.json
import { readFileSync } from 'node:fs';
const t = JSON.parse(readFileSync(process.argv[2], 'utf8')).kolor;
const pary = {};
const motywy = { jasny: t.jasny, ciemny: t.ciemny, 'jasny+kontrast': { ...t.jasny, ...t.jasnyKontrast }, 'ciemny+kontrast': { ...t.ciemny, ...t.ciemnyKontrast } };
for (const [m, k] of Object.entries(motywy)) {
  const p = (nazwa, a, b, prog) => { pary[`${m}: ${nazwa}`] = prog ? [k[a], k[b], prog] : [k[a], k[b]]; };
  p('tekst / papier', 'grafit', 'papier');
  p('tekst / grupa', 'grafit', 'papierGrupa');
  p('ołówek / papier', 'olowek', 'papier');
  p('ołówek / grupa', 'olowek', 'papierGrupa');
  p('tekst na zakreślaczu', 'tekstNaZakreslaczu', 'zakreslacz');
  p('krawędź zakreślenia / papier (element, 3:1)', 'zakreslaczKrawedz', 'papier', 3);
  p('przycisk: tekst / tło', 'przyciskTekst', 'przyciskTlo');
  p('przycisk: obrys / papier (element, 3:1)', 'przyciskObrys', 'papier', 3);
  p('przycisk −1: obrys / papier (element, 3:1)', 'drugiPrzyciskObrys', 'papier', 3);
  p('kreska / papier (grafika z danymi, 3:1)', 'kreska', 'papier', 3);
  p('błąd / papier', 'blad', 'papier');
}
console.log(JSON.stringify(pary, null, 1));
