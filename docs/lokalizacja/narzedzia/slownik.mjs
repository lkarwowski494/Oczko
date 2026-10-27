// Słownik terminów dziewiarskich i szydełkowych (rola 09, P-271, lekcja L-030 Treningu).
// node docs/lokalizacja/narzedzia/slownik.mjs [--md] [--slowniki src/i18n/slowniki]
//   bez flag: kontrola słownika (kod 0 = bez błędów, 1 = błędy)
//   --md: zapisuje docs/lokalizacja/slownik-terminow.md (generowany, nie edytować ręcznie)
//   --slowniki <katalog>: dla każdego <tag>.json w katalogu szuka terminów zakazanych w tekstach,
//     których źródło en zawiera pojęcie (strażnik przekładu; wyjątki w slownik-wyjatki.json)
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const TU = dirname(fileURLToPath(import.meta.url));
const KAT = join(TU, '..');
const PLIK = join(KAT, 'slownik-terminow.json');
const ZRODLO = 'src/i18n/slowniki/en.json';

export const splaszcz = (o, p = '', w = {}) => {
  for (const [k, v] of Object.entries(o)) v && typeof v === 'object' ? splaszcz(v, p + k + '.', w) : (w[p + k] = String(v));
  return w;
};
const rx = (s) => new RegExp(s, 'iu');

export function sprawdz(slownik, en) {
  const bledy = [], uwagi = [], { jezyki, pojecia, zrodla } = slownik;
  const ids = new Set();
  for (const p of pojecia) {
    const e = (m) => bledy.push(`${p.id}: ${m}`);
    if (ids.has(p.id)) e('powtórzony id');
    ids.add(p.id);
    for (const pole of ['en', 'pl', 'znaczenie', 'wykrywaj']) if (!p[pole]) e(`brak pola ${pole}`);
    let w = null;
    try { w = rx(p.wykrywaj); } catch (x) { e(`zły wzorzec wykrywaj: ${x.message}`); }
    if (w && en && !Object.values(en).some((t) => w.test(t)) && !p.poza_interfejsem) uwagi.push(`${p.id}: wzorzec nie trafia w żaden tekst ${ZRODLO} (dopisz "poza_interfejsem": true, jeśli celowo)`);
    for (const j of jezyki) {
      const t = p.jezyki?.[j];
      if (!t) { e(`brak języka ${j}`); continue; }
      if (t.nie_zbadano) { uwagi.push(`${p.id}: ${j} nie zbadano`); continue; }
      if (!t.zalecany?.trim()) e(`${j}: pusty termin zalecany`);
      if (!['wysoka', 'srednia', 'niska'].includes(t.pewnosc)) e(`${j}: pewność „${t.pewnosc}”`);
      if (t.pewnosc === 'niska' && t.status !== '[DO SPRAWDZENIA]') e(`${j}: pewność niska bez statusu [DO SPRAWDZENIA]`);
      if (t.pewnosc === 'wysoka' && !(t.zrodla || []).some((z) => z.cytat?.trim())) e(`${j}: pewność wysoka bez cytatu źródła`);
      for (const z of t.zrodla || []) if (!zrodla[z.id]) e(`${j}: nieznane źródło ${z.id}`);
      for (const z of t.zakazane || []) {
        let r;
        try { r = rx(z.wzorzec); } catch (x) { e(`${j}: zły wzorzec zakazu ${z.wzorzec}: ${x.message}`); continue; }
        if (!z.powod?.trim()) e(`${j}: zakaz ${z.wzorzec} bez powodu`);
        for (const s of [t.zalecany, ...(t.warianty || [])]) if (s && r.test(s)) e(`${j}: termin „${s}” pasuje do własnego zakazu ${z.wzorzec}`);
      }
    }
  }
  for (const [id, z] of Object.entries(zrodla)) {
    if (!z.szczebel || !z.rejestr) bledy.push(`źródło ${id}: brak szczebla albo odsyłacza do rejestru`);
    if (z.url || z.tytul) bledy.push(`źródło ${id}: tytuł i adres tylko w prywatnym rejestrze (oczko-warsztat), nie w repo publicznym`);
    if (z.szczebel >= 5) bledy.push(`źródło ${id}: szczebel 5 (fora, Wikipedia) nie potwierdza terminu`);
  }
  return { bledy, uwagi };
}

export function straznik(slownik, en, slowniki, wyjatki = []) {
  const trafienia = [];
  for (const [j, sl] of Object.entries(slowniki)) {
    if (j === 'en') continue;
    for (const p of slownik.pojecia) {
      const w = rx(p.wykrywaj), t = p.jezyki?.[j];
      for (const z of t?.zakazane || []) {
        const r = rx(z.wzorzec);
        for (const [k, s] of Object.entries(sl)) {
          const kb = k.replace(/_(zero|one|two|few|many|other)$/, '');
          const zr = en[k] ?? en[`${kb}_other`] ?? en[kb];
          if (!zr || !w.test(zr) || !r.test(s)) continue;
          if (wyjatki.some((x) => x.klucz === kb && x.pojecie === p.id && x.jezyki.includes(j))) continue;
          trafienia.push(`${j} ${k}: „${s}” — ${p.id}, zakaz ${z.wzorzec}: ${z.powod}`);
        }
      }
    }
  }
  return trafienia;
}

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
export function md(slownik, en) {
  const { jezyki, pojecia, zrodla } = slownik;
  const licz = (pew) => pojecia.reduce((n, p) => n + jezyki.filter((j) => p.jezyki[j]?.pewnosc === pew).length, 0);
  const o = [];
  o.push('# Słownik terminów dziewiarskich i szydełkowych (35 języków)', '');
  o.push('Plik generowany z `docs/lokalizacja/slownik-terminow.json` (jedno źródło); nie edytuj ręcznie: `node docs/lokalizacja/narzedzia/slownik.mjs --md`.', '');
  o.push(slownik._zasada, '');
  o.push(`Pojęć: ${pojecia.length} · języków: ${jezyki.length} · wpisów: ${pojecia.length * jezyki.length} (wysoka ${licz('wysoka')}, średnia ${licz('srednia')}, niska ${licz('niska')}). Pewność: ${Object.entries(slownik.pewnosc).map(([k, v]) => `**${k}** — ${v}`).join('; ')}.`, '');
  o.push('## Pojęcia', '', '| id | en | pl | znaczenie | kluczy en |', '|---|---|---|---|---|');
  for (const p of pojecia) {
    const w = rx(p.wykrywaj), n = en ? Object.values(en).filter((t) => w.test(t)).length : '?';
    o.push(`| \`${p.id}\` | ${esc(p.en)} | ${esc(p.pl)} | ${esc(p.znaczenie)} | ${n} |`);
  }
  o.push('', '## Terminy zalecane (pewność: ✓ wysoka, ~ średnia, ? niska = [DO SPRAWDZENIA])', '');
  const zn = { wysoka: '✓', srednia: '~', niska: '?' };
  const grupy = [];
  for (let i = 0; i < jezyki.length; i += 9) grupy.push(jezyki.slice(i, i + 9));
  for (const g of grupy) {
    o.push(`| pojęcie | ${g.join(' | ')} |`, `|---|${g.map(() => '---').join('|')}|`);
    for (const p of pojecia) o.push(`| \`${p.id}\` | ${g.map((j) => `${esc(p.jezyki[j]?.zalecany)} ${zn[p.jezyki[j]?.pewnosc] ?? ''}`).join(' | ')} |`);
    o.push('');
  }
  o.push('## Terminy zakazane (kalki)', '', '| pojęcie | język | wzorzec | powód |', '|---|---|---|---|');
  for (const p of pojecia) for (const j of jezyki) for (const z of p.jezyki[j]?.zakazane || []) o.push(`| \`${p.id}\` | ${j} | \`${esc(z.wzorzec)}\` | ${esc(z.powod)} |`);
  o.push('', '## Do sprawdzenia przez rodzimego użytkownika albo źródło (pewność niska)', '');
  for (const j of jezyki) {
    const l = pojecia.filter((p) => p.jezyki[j]?.pewnosc === 'niska').map((p) => `${p.id} („${p.jezyki[j].zalecany}”)`);
    if (l.length) o.push(`- **${j}** (${l.length}): ${l.join(', ')}`);
  }
  o.push('', '## Źródła', '', 'Tytuły, adresy i kopie surowych tekstów są w prywatnym rejestrze (kolumna „rejestr”); w repo publicznym tylko ID (decyzja koordynatora 2026-10-27, bramka marek P-121 (5)).', '', '| ID | szczebel | kraj | język | odczyt | rejestr |', '|---|---|---|---|---|---|');
  for (const [id, z] of Object.entries(zrodla).sort()) o.push(`| ${id} | ${z.szczebel} | ${z.kraj ?? ''} | ${z.jezyk ?? ''} | ${z.odczyt ?? ''} | ${esc(z.rejestr)} |`);
  return o.join('\n') + '\n';
}

function main(argv) {
  const slownik = JSON.parse(readFileSync(PLIK, 'utf8'));
  const en = existsSync(ZRODLO) ? splaszcz(JSON.parse(readFileSync(ZRODLO, 'utf8'))) : null;
  if (!en) console.log(`UWAGA brak ${ZRODLO} (uruchom z katalogu repo); kontrola wzorców wykrywaj pominięta`);
  const { bledy, uwagi } = sprawdz(slownik, en);
  const i = argv.indexOf('--slowniki');
  if (i >= 0) {
    const kat = argv[i + 1], sl = {};
    for (const f of readdirSync(kat)) if (/^[a-z]{2,3}(-[A-Za-z0-9]+)*\.json$/.test(f)) sl[f.slice(0, -5)] = splaszcz(JSON.parse(readFileSync(join(kat, f), 'utf8')));
    const pw = join(KAT, 'slownik-wyjatki.json');
    for (const t of straznik(slownik, en || {}, sl, existsSync(pw) ? JSON.parse(readFileSync(pw, 'utf8')).wyjatki : [])) bledy.push(`termin zakazany: ${t}`);
  }
  if (argv.includes('--md')) writeFileSync(join(KAT, 'slownik-terminow.md'), md(slownik, en));
  for (const b of bledy) console.log('BŁĄD', b);
  for (const u of uwagi) console.log('UWAGA', u);
  console.log(`błędy: ${bledy.length}, uwagi: ${uwagi.length}; pojęć: ${slownik.pojecia.length}, języków: ${slownik.jezyki.length}`);
  return bledy.length ? 1 : 0;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = main(process.argv.slice(2));
