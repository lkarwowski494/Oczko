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
  p('błąd / arkusz', 'blad', 'arkusz');
  p('ołówek / arkusz', 'olowek', 'arkusz');
  p('wybrany przełącznik: obrys / arkusz (element, 3:1)', 'przyciskObrys', 'arkusz', 3);
  p('wybrany przełącznik: tekst / tło', 'przyciskTekst', 'przyciskTlo');
}
// Znacznik wzoru: stałe kolory na stronie dokumentu (NZ-08-P2-04).
const w = t.wzor;
if (w) {
  pary['wzór: znacznik / strona (element, 3:1)'] = [w.znacznik, w.strona, 3];
  pary['wzór: etykieta znacznika tekst / tło'] = [w.etykietaTekst, w.etykietaTlo];
}
console.log(JSON.stringify(pary, null, 1));
