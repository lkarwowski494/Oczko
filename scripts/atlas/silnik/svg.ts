// Zapis rysunku do SVG (strona statyczna, podgląd PNG) i strażnik liter (P-192). W aplikacji ten sam model rysuje react-native-svg (ADR-0024).
// SVG nie zawiera tekstu: tylko <svg>, <rect>, <g>, <path>; klasy ról (a-t, a-o, a-z, a-n) pozwalają stronie podmienić kolory motywu ciemnego.
import { odleglosc, probkuj, z2, type Bez, type P } from './geometria.ts';
import type { Rysunek } from './typy.ts';

/** Role kolorów rysunku; wartości wyłącznie z tokenów 04 (docs/design/tokeny.json). */
export interface Paleta {
  tlo: string; // papier
  nitka: string; // grafit
  wyroznienie: string; // zakreślacz
}

/** Paleta z tokenów: kolor.<motyw>.{papier, grafit, zakreslacz}. */
export function paletaZTokenow(tokeny: { kolor: Record<string, Record<string, string>> }, motyw: 'jasny' | 'ciemny'): Paleta {
  const k = tokeny.kolor[motyw];
  return { tlo: k.papier, nitka: k.grafit, wyroznienie: k.zakreslacz };
}

export const KRESKA = { nitka: 2.6, obwodka: 4.6, wyroznienie: 7.5, promienObwodki: 4.5 } as const;

/** Odcinki części leżące w promieniu skrzyżowań, na których ta część jest na wierzchu (obwódka tylko tam: bez nacięć na złączach). */
function odcinkiObwodki(segmenty: Bez[], punkty: P[]): P[][] {
  const lam = probkuj(segmenty, 48);
  return punkty.map((x) => lam.filter((q) => odleglosc(q, x) <= KRESKA.promienObwodki)).filter((l) => l.length > 1);
}
const dLamanej = (l: P[]): string => `M${z2(l[0].x)} ${z2(l[0].y)}` + l.slice(1).map((q) => `L${z2(q.x)} ${z2(q.y)}`).join('');

const d = (segmenty: Bez[]): string =>
  `M${z2(segmenty[0][0].x)} ${z2(segmenty[0][0].y)}` +
  segmenty.map((b) => `C${z2(b[1].x)} ${z2(b[1].y)} ${z2(b[2].x)} ${z2(b[2].y)} ${z2(b[3].x)} ${z2(b[3].y)}`).join('');

/** SVG rysunku: dla każdej części od spodu obwódka w kolorze tła wokół jej skrzyżowań „na wierzchu” (przerwa w kresce spodniej), kreska nitki; wyróżnienie pod spodem. */
export function doSvg(rys: Rysunek, paleta: Paleta): string {
  const czesc = new Map(rys.czesci.map((c) => [c.id, c]));
  const wyr = new Set(rys.wyroznione);
  // wyróżnienie (zakreślacz) pod całym rysunkiem: nie przykrywa nitki żadnej części, także własnej pętli
  const el: string[] = rys.czesci
    .filter((c) => wyr.has(c.petla) && !c.rodzaj.startsWith('platyna'))
    .map((c) => `<path class="a-z" d="${d(c.segmenty)}" stroke="${paleta.wyroznienie}" stroke-width="${KRESKA.wyroznienie}" stroke-linecap="round"/>`);
  for (const id of rys.kolejnosc) {
    const c = czesc.get(id)!;
    const sciezka = d(c.segmenty);
    const nad = rys.skrzyzowania.filter((x) => x.nad === id).map((x) => x.punkt);
    for (const l of odcinkiObwodki(c.segmenty, nad)) el.push(`<path class="a-o" d="${dLamanej(l)}" stroke="${paleta.tlo}" stroke-width="${KRESKA.obwodka}"/>`);
    el.push(`<path class="a-n" d="${sciezka}" stroke="${paleta.nitka}" stroke-width="${KRESKA.nitka}" stroke-linecap="round"/>`);
  }
  const w = z2(rys.szer), h = z2(rys.wys);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
    `<rect class="a-t" width="${w}" height="${h}" fill="${paleta.tlo}"/>` +
    `<g fill="none" stroke-linecap="butt" stroke-linejoin="round">${el.join('')}</g></svg>`
  );
}

// ---------- strażnik liter (P-192 (3)) ----------
// Biała lista: element, atrybut i postać wartości. Każdy tekst między znacznikami, <text>, <title>, <desc>, aria-label itp. oblewa.
const ELEMENTY = new Set(['svg', 'rect', 'g', 'path', 'circle', 'line', 'polyline', 'polygon']);
const ATRYBUTY: Record<string, RegExp> = {
  xmlns: /^http:\/\/www\.w3\.org\/2000\/svg$/,
  viewBox: /^[-\d. ]+$/,
  width: /^[\d.]+$/,
  height: /^[\d.]+$/,
  x: /^[-\d.]+$/, y: /^[-\d.]+$/, cx: /^[-\d.]+$/, cy: /^[-\d.]+$/, r: /^[\d.]+$/,
  x1: /^[-\d.]+$/, y1: /^[-\d.]+$/, x2: /^[-\d.]+$/, y2: /^[-\d.]+$/,
  points: /^[-\d., ]+$/,
  d: /^[MCLZmclz\d.\s,-]+$/, // tylko polecenia ścieżki M, C, L, Z (bez łuków A: zastrzeżenie dekodera iOS, rejestr E0)
  fill: /^(#[0-9A-Fa-f]{6}|none)$/,
  stroke: /^(#[0-9A-Fa-f]{6}|none)$/,
  'stroke-width': /^[\d.]+$/,
  'stroke-linecap': /^(butt|round)$/,
  'stroke-linejoin': /^(round|miter)$/,
  class: /^a-[tozn]$/, // role kolorów, nie słowa
};

/** Lista naruszeń P-192 w SVG; pusta = bez liter i tekstu. */
export function straznikLiter(svg: string): string[] {
  const bledy: string[] = [];
  const bezZnacznikow = svg.replace(/<[^>]*>/g, '');
  if (bezZnacznikow.trim()) bledy.push(`tekst poza znacznikami: ${JSON.stringify(bezZnacznikow.trim().slice(0, 40))}`);
  for (const m of svg.matchAll(/<\/?\s*([A-Za-z][\w:-]*)([^>]*)>/g)) {
    const nazwa = m[1];
    if (!ELEMENTY.has(nazwa)) {
      bledy.push(`element spoza listy: <${nazwa}>`);
      continue;
    }
    const reszta = m[2].replace(/\/\s*$/, '');
    const atr = [...reszta.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)];
    const zostalo = reszta.replace(/([\w:-]+)\s*=\s*"([^"]*)"/g, '').trim();
    if (zostalo) bledy.push(`nieczytelny fragment w <${nazwa}>: ${zostalo.slice(0, 30)}`);
    for (const [, k, v] of atr) {
      const wz = ATRYBUTY[k];
      if (!wz) bledy.push(`atrybut spoza listy: ${k} w <${nazwa}>`);
      else if (!wz.test(v)) bledy.push(`wartość atrybutu ${k} poza wzorcem: ${JSON.stringify(v.slice(0, 30))}`);
    }
  }
  return bledy;
}
