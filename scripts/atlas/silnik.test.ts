// Testy geometrii atlasu (prototyp E1 roli 05, ADR-0022 „Potwierdzenie”): rysunki kart próbnych bez błędów, determinizm względem plików
// w docs/atlas/prototyp, strażnik liter (P-192) i mutanty — każde sprawdzenie musi oblać na celowo zepsutym rysunku.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { siatkaPetli, regula } from './silnik/siatka-petli.ts';
import { sprawdzRysunek } from './silnik/sprawdz.ts';
import { doSvg, paletaZTokenow, straznikLiter } from './silnik/svg.ts';
import type { Karta, Rysunek } from './silnik/typy.ts';

const KORZEN = join(__dirname, '..', '..');
const KARTY = join(KORZEN, 'docs/atlas/prototyp/karty');
const tokeny = JSON.parse(readFileSync(join(KORZEN, 'docs/design/tokeny.json'), 'utf8'));
const palety = [paletaZTokenow(tokeny, 'jasny'), paletaZTokenow(tokeny, 'ciemny')];
const karta = (plik: string): Karta => JSON.parse(readFileSync(join(KARTY, plik), 'utf8'));
const kody = (k: Karta, i: number, rys?: Rysunek) => {
  const krok = k.kroki![i];
  return sprawdzRysunek(k, krok, rys ?? siatkaPetli(k, krok), palety).map((b) => b.kod);
};
const kopia = <T>(x: T): T => JSON.parse(JSON.stringify(x));

describe('rysunki kart próbnych', () => {
  const pliki = readdirSync(KARTY).filter((f) => f.endsWith('.json')).sort();
  test('są trzy karty: oczko prawe, oczko lewe, k2tog', () => {
    expect(pliki).toEqual(['k2tog.json', 'oczko-lewe.json', 'oczko-prawe.json']);
  });
  for (const plik of pliki) {
    const k = karta(plik);
    k.kroki!.forEach((krok, i) => {
      test(`${k.id} krok ${i + 1} (${krok.faza}): bez błędów geometrii, przeplotu, liczby oczek, twierdzeń, liter i kontrastu`, () => {
        expect(sprawdzRysunek(k, krok, siatkaPetli(k, krok), palety)).toEqual([]);
      });
      test(`${k.id} krok ${i + 1}: determinizm — ten sam JSON daje bajtowo plik z docs/atlas/prototyp`, () => {
        const a = doSvg(siatkaPetli(k, krok), palety[0]);
        expect(doSvg(siatkaPetli(kopia(k), kopia(krok)), palety[0])).toBe(a);
        expect(readFileSync(join(KORZEN, 'docs/atlas/prototyp', `${k.id}.${krok.faza}.svg`), 'utf8')).toBe(a);
      });
    });
  }

  test('k2tog: rząd po ujęciu ma o 1 oczko mniej, pętla na wierzchu to lewa i pochyla się w prawo', () => {
    const k = karta('k2tog.json');
    const r = siatkaPetli(k, k.kroki![1]);
    expect(r.petle.filter((p) => p.rzad === 2)).toHaveLength(3);
    expect(r.scalenia).toEqual([{ dziecko: 'p2_1', nad: 'p1_1', pod: ['p1_2'] }]);
    expect(r.petle.find((p) => p.id === 'p1_1')!.nachylenie).toBeGreaterThan(0);
  });

  test('oczko prawe i lewe: reguła przeplotu odwraca się (nóżka nowej pętli nad / pod głową starej)', () => {
    for (const [plik, nadGlowa] of [['oczko-prawe.json', 'noga'], ['oczko-lewe.json', 'glowa']] as const) {
      const k = karta(plik);
      const r = siatkaPetli(k, k.kroki![0]);
      const czesc = new Map(r.czesci.map((c) => [c.id, c]));
      const nogaGlowa = r.skrzyzowania.filter((s) => [s.a, s.b].some((id) => czesc.get(id)!.rodzaj === 'glowa') && [s.a, s.b].some((id) => czesc.get(id)!.rodzaj.startsWith('noga')));
      expect(nogaGlowa.length).toBeGreaterThan(0);
      for (const s of nogaGlowa) expect(czesc.get(s.nad)!.rodzaj.startsWith(nadGlowa)).toBe(true);
    }
  });
});

describe('mutanty: każde sprawdzenie oblewa na zepsutym rysunku', () => {
  const k = karta('k2tog.json');
  const krok = k.kroki![1];
  const dobry = () => siatkaPetli(k, krok);

  test('odwrócona kolejność warstw → przeplot', () => {
    const r = dobry();
    r.kolejnosc = [...r.kolejnosc].reverse();
    expect(kody(k, 1, r)).toContain('przeplot');
  });
  test('przerwa w nitce → ciaglosc', () => {
    const r = dobry();
    const c = r.czesci.find((x) => x.id === 'p1_1.glowa')!;
    c.segmenty[0] = [{ x: c.segmenty[0][0].x + 1, y: c.segmenty[0][0].y }, c.segmenty[0][1], c.segmenty[0][2], c.segmenty[0][3]];
    expect(kody(k, 1, r)).toContain('ciaglosc');
  });
  test('pętla bez rodzica → topologia', () => {
    const r = dobry();
    r.petle.find((p) => p.id === 'p2_0')!.rodzice = [];
    expect(kody(k, 1, r)).toContain('topologia');
  });
  test('nóżki dziecka wysunięte nad głowę rodzica → obejmowanie', () => {
    const r = dobry();
    for (const c of r.czesci.filter((x) => x.petla === 'p2_0' && x.rodzaj.startsWith('noga'))) c.segmenty = c.segmenty.map((b) => b.map((q) => ({ x: q.x, y: q.y - 12 })) as typeof b);
    expect(kody(k, 1, r)).toContain('obejmowanie');
  });
  test('twierdzenie „lewo” przy k2tog → twierdzenie', () => {
    const m = kopia(k);
    m.twierdzenia[0].wartosc.pochylenie = 'lewo';
    expect(kody(m, 1)).toContain('twierdzenie');
  });
  test('na wierzchu prawa pętla (jak ssk) przy twierdzeniu „prawo” → twierdzenie', () => {
    const m = kopia(k);
    (m.rysunek!.operacja as { na_wierzchu: string }).na_wierzchu = 'prawe';
    expect(kody(m, 1)).toContain('twierdzenie');
  });
  test('bilans −2 w twierdzeniu przy ujęciu 2 oczek → twierdzenie', () => {
    const m = kopia(k);
    m.twierdzenia[0].wartosc.bilans = -2;
    expect(kody(m, 1)).toContain('twierdzenie');
  });
  test('paleta bez kontrastu → kontrast', () => {
    const r = dobry();
    const zla = [{ tlo: '#FCFCFA', nitka: '#F2F3F0', wyroznienie: '#F6E04A' }];
    expect(sprawdzRysunek(k, krok, r, zla).map((b) => b.kod)).toContain('kontrast');
  });
  test('wyróżnienie nieistniejącej pętli → wyroznienie', () => {
    const m = kopia(k);
    m.kroki![1].wyroznij = [{ rzad: 2, kolumna: 3 }];
    expect(kody(m, 1)).toContain('wyroznienie');
  });
  test('reguła: skrzyżowanie pętli, które nie są rodzicem i dzieckiem, nie ma reguły', () => {
    const r = dobry();
    const petla = new Map(r.petle.map((p) => [p.id, p]));
    const A = r.czesci.find((c) => c.id === 'p2_0.noga_l')!, B = r.czesci.find((c) => c.id === 'p1_3.glowa')!;
    expect(regula(A, B, petla, r.scalenia)).toMatch(/bez przeplotu/);
  });
});

describe('strażnik liter (P-192)', () => {
  const k = karta('oczko-prawe.json');
  const svg = doSvg(siatkaPetli(k, k.kroki![0]), palety[0]);
  test('wygenerowany SVG przechodzi', () => expect(straznikLiter(svg)).toEqual([]));
  test.each([
    ['<text>', svg.replace('</g>', '<text x="1" y="1">k2tog</text></g>')],
    ['<title>', svg.replace('</g>', '<title>Knit</title></g>')],
    ['aria-label', svg.replace('<g ', '<g aria-label="knit" ')],
    ['tekst między znacznikami', svg.replace('</g>', 'k</g>')],
    ['łuk A w ścieżce', svg.replace(/d="M/, 'd="A1 1 0 0 1 2 2 M')],
    ['litera w klasie', svg.replace('class="a-n"', 'class="knit"')],
    ['<foreignObject>', svg.replace('</g>', '<foreignObject></foreignObject></g>')],
  ])('oblewa: %s', (_, zly) => expect(straznikLiter(zly).length).toBeGreaterThan(0));
});

