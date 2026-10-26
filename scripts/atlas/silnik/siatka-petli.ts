// Rodzina „siatka-petli” (druty: oczko prawe i lewe, ujęcia): rysunek liczony z danych karty (ADR-0022).
// Pętla = łańcuch Catmulla-Roma przez 7 węzłów (podstawa, szyjka, początek głowy, wierzchołek, …); podział na 5 części
// (platyna lewa, nóżka lewa, głowa, nóżka prawa, platyna prawa). Kolejność warstw NIE jest wpisana: wynika z reguł przeplotu
// na każdym wykrytym skrzyżowaniu i z sortowania topologicznego. Skrzyżowanie bez reguły albo cykl warstw = błąd rysunku.
//
// Reguły przeplotu na stronie prawej (oczko górne G przeciągnięte przez oczko dolne D; dla oczka prawego nowa pętla idzie
// spod spodu na wierzch, dla lewego odwrotnie):
//   platyna G × nóżka albo głowa D:  prawe → D na wierzchu;  lewe → G na wierzchu (dolna część nowej pętli leży po drugiej
//                         stronie starej pętli niż część nad przejściem; głowa występuje przy ujęciu, gdy głowy ujmowanych zachodzą na siebie)
//   nóżka G × głowa D:    prawe → G na wierzchu;  lewe → D na wierzchu
//   dwa oczka ujęte razem (ten sam rząd, wspólne dziecko): na wierzchu to z `na_wierzchu` operacji
import { catmullRom, probkuj, przeciecia, type P } from './geometria.ts';
import type { Czesc, Karta, Krok, Petla, RodzajCzesci, Rysunek, Skrzyzowanie, Strona } from './typy.ts';

/** Wymiary w jednostkach rysunku; jedno miejsce (konfiguracja rodziny). Uproszczenie ilustracyjne, nie pomiar dzianiny. */
export const WYMIAR = {
  kolumna: 20, // odstęp oczek w rzędzie
  rzad: 14, // odstęp rzędów
  wysokoscPetli: 1.75, // × rzad: zachodzenie pętli na rząd wyżej
  szyjka: 0.2, // × kolumna: półszerokość szyjki
  glowa: 0.34, // × kolumna: półszerokość głowy
  wysSzyjki: 0.28, // × wysokość pętli
  wysGlowy: 0.7, // × wysokość pętli: początek głowy
  przesuniecieUjecia: 0.42, // × kolumna: przesunięcie głów oczek ujmowanych ku dziecku
  glowaUjecia: 1.35, // × glowa: szerokość głowy oczka ujmowanego
  margines: 8,
} as const;

const KOLEJNOSC: RodzajCzesci[] = ['platyna_l', 'noga_l', 'glowa', 'noga_p', 'platyna_p'];
const grupa = (r: RodzajCzesci): 'platyna' | 'noga' | 'glowa' => (r === 'glowa' ? 'glowa' : r.startsWith('platyna') ? 'platyna' : 'noga');

interface PetlaRob extends Petla {
  lewa: number; // granica wycinka z lewym sąsiadem (podstawa platyny)
  prawa: number;
  szer: number; // mnożnik szerokości szyjki
  glowaSzer: number; // mnożnik szerokości głowy (oczka ujmowane: głowa obejmuje obie nóżki dziecka)
  dxGlowy: number; // przesunięcie głowy (oczka ujmowane)
}

/** Buduje rysunek kroku karty. Dla fazy „tkanina” rysuje próbkę przed operacją, dla „wynik” — po niej. */
export function siatkaPetli(karta: Karta, krok: Krok): Rysunek {
  const rys = karta.rysunek;
  if (!rys || rys.rodzina !== 'siatka-petli') throw new Error(`karta ${karta.id}: rodzina inna niż siatka-petli`);
  const { kolumny: N, rzedy: R } = rys.probka;
  const op = rys.operacja;
  const W = WYMIAR.kolumna, H = WYMIAR.rzad;
  const bledy: string[] = [];
  const doOperacji = krok.faza === 'tkanina' ? R - 1 : R; // liczba rysowanych rzędów
  const rzadOp = R - 1;
  const zuzywa = op?.typ === 'scal' ? op.zuzywa : 1;
  const k0 = op?.kolumna ?? Math.floor((N - zuzywa) / 2);
  const petle: PetlaRob[] = [];
  const idP = (r: number, k: number) => `p${r}_${k}`;
  const scalenia: Rysunek['scalenia'] = [];
  const wycinek = (x: number) => ({ lewa: x - W / 2, prawa: x + W / 2, szer: 1, glowaSzer: 1, dxGlowy: 0 });

  for (let r = 0; r < doOperacji; r++) {
    if (r < rzadOp || !op) {
      for (let k = 0; k < N; k++) {
        petle.push({ id: idP(r, k), rzad: r, kolumna: k, x: WYMIAR.margines + (k + 0.5) * W, typ: rys.tlo, rodzice: r ? [idP(r - 1, k)] : [], nachylenie: 0, ...wycinek(WYMIAR.margines + (k + 0.5) * W) });
      }
      continue;
    }
    // rząd operacji
    const dolne = petle.filter((p) => p.rzad === r - 1);
    let k = 0;
    for (let j = 0; j < dolne.length; ) {
      if (j === k0) {
        const ujete = dolne.slice(j, j + zuzywa);
        const x = ujete.reduce((s, p) => s + p.x, 0) / ujete.length;
        const typ: Strona = op.strona;
        const dziecko: PetlaRob = { id: idP(r, k), rzad: r, kolumna: k, x, typ, rodzice: ujete.map((p) => p.id), nachylenie: 0, ...wycinek(x), lewa: ujete[0].lewa, prawa: ujete[ujete.length - 1].prawa };
        petle.push(dziecko);
        if (op.typ === 'scal') {
          const nad = op.na_wierzchu === 'lewe' ? ujete[0] : ujete[ujete.length - 1];
          scalenia.push({ dziecko: dziecko.id, nad: nad.id, pod: ujete.filter((p) => p !== nad).map((p) => p.id) });
          for (const p of ujete) {
            p.dxGlowy = Math.sign(x - p.x) * WYMIAR.przesuniecieUjecia * W;
            p.glowaSzer = WYMIAR.glowaUjecia;
          }
        }
        j += zuzywa;
      } else {
        petle.push({ id: idP(r, k), rzad: r, kolumna: k, x: dolne[j].x, typ: rys.tlo, rodzice: [dolne[j].id], nachylenie: 0, ...wycinek(dolne[j].x) });
        j += 1;
      }
      k++;
    }
  }

  // Geometria: węzły każdego rzędu jednym łańcuchem (ciągłość nitki i stycznej w rzędzie z konstrukcji).
  const czesci: Czesc[] = [];
  const rzedy: string[][] = [];
  const L = WYMIAR.wysokoscPetli * H;
  const wysRys = (doOperacji - 1) * H + L + 2 * WYMIAR.margines;
  const Y = (y: number) => wysRys - WYMIAR.margines - y; // oś w dół jak w SVG
  for (let r = 0; r < doOperacji; r++) {
    const rzad = petle.filter((p) => p.rzad === r);
    const yb = r * H;
    const wezly: P[] = [];
    const granice: number[] = []; // indeksy węzłów będących granicami części
    rzad.forEach((p, i) => {
      const { lewa, prawa } = p;
      const n = WYMIAR.szyjka * W * p.szer, a = WYMIAR.glowa * W * p.glowaSzer, d = p.dxGlowy;
      const lok: P[] = [
        { x: lewa, y: yb },
        { x: p.x - n, y: yb + WYMIAR.wysSzyjki * L },
        { x: p.x - a + d, y: yb + WYMIAR.wysGlowy * L },
        { x: p.x + d, y: yb + L },
        { x: p.x + a + d, y: yb + WYMIAR.wysGlowy * L },
        { x: p.x + n, y: yb + WYMIAR.wysSzyjki * L },
        { x: prawa, y: yb },
      ];
      p.nachylenie = d;
      if (i > 0) lok.shift(); // wspólna podstawa z poprzednią pętlą
      const start = wezly.length - (i > 0 ? 1 : 0);
      wezly.push(...lok.map((q) => ({ x: q.x, y: Y(q.y) })));
      granice.push(start);
    });
    const seg = catmullRom(wezly);
    const ids: string[] = [];
    rzad.forEach((p, i) => {
      const s = granice[i]; // pętla zajmuje segmenty s..s+5
      const zakres: [RodzajCzesci, number, number][] = [
        ['platyna_l', s, s + 1],
        ['noga_l', s + 1, s + 2],
        ['glowa', s + 2, s + 4],
        ['noga_p', s + 4, s + 5],
        ['platyna_p', s + 5, s + 6],
      ];
      for (const [rodzaj, od, doo] of zakres) {
        const id = `${p.id}.${rodzaj}`;
        czesci.push({ id, petla: p.id, rodzaj, rzad: r, segmenty: seg.slice(od, doo) });
        ids.push(id);
      }
    });
    rzedy.push(ids);
  }

  // Skrzyżowania i reguły przeplotu.
  const petla = new Map(petle.map((p) => [p.id, p]));
  const lamane = new Map(czesci.map((c) => [c.id, probkuj(c.segmenty)]));
  const konce = (c: Czesc): P[] => [c.segmenty[0][0], c.segmenty[c.segmenty.length - 1][3]];
  const skrzyzowania: Skrzyzowanie[] = [];
  for (let i = 0; i < czesci.length; i++) {
    for (let j = i + 1; j < czesci.length; j++) {
      const A = czesci[i], B = czesci[j];
      if (Math.abs(A.rzad - B.rzad) > 1) continue;
      const pkt = przeciecia(lamane.get(A.id)!, lamane.get(B.id)!, [...konce(A), ...konce(B)]);
      for (const punkt of pkt) {
        const nad = regula(A, B, petla, scalenia);
        if (typeof nad !== 'string' || !nad.startsWith('p')) {
          bledy.push(`skrzyzowanie ${A.id} × ${B.id} w (${punkt.x.toFixed(1)}, ${punkt.y.toFixed(1)}): ${nad}`);
          continue;
        }
        skrzyzowania.push({ a: A.id, b: B.id, punkt, nad });
      }
    }
  }

  const kolejnosc = sortujWarstwy(czesci.map((c) => c.id), skrzyzowania, bledy);
  const wyroznione = krok.wyroznij.map((m) => idP(m.rzad, m.kolumna)).filter((id) => petla.has(id));
  for (const m of krok.wyroznij) if (!petla.has(idP(m.rzad, m.kolumna))) bledy.push(`wyroznij: brak pętli rząd ${m.rzad} kolumna ${m.kolumna} w fazie ${krok.faza}`);

  const szer = Math.max(...petle.map((p) => p.prawa)) + WYMIAR.margines;
  return {
    szer,
    wys: wysRys,
    petle: petle.map(({ lewa: _l, prawa: _p, szer: _s, glowaSzer: _g, dxGlowy: _d, ...p }) => p),
    czesci,
    kolejnosc,
    rzedy,
    skrzyzowania,
    wyroznione,
    scalenia,
    bledy,
  };
}

/** Która część jest na wierzchu na skrzyżowaniu (id) albo opis braku reguły. Eksport dla testów i walidatora. */
export function regula(A: Czesc, B: Czesc, petla: Map<string, Petla>, scalenia: Rysunek['scalenia']): string {
  if (A.petla === B.petla) return 'pętla przecina samą siebie';
  const pa = petla.get(A.petla)!, pb = petla.get(B.petla)!;
  if (pa.rzad === pb.rzad) {
    const s = scalenia.find((x) => [x.nad, ...x.pod].includes(pa.id) && [x.nad, ...x.pod].includes(pb.id));
    if (!s) return 'skrzyżowanie w rzędzie poza ujęciem';
    if (s.nad === pa.id) return A.id;
    if (s.nad === pb.id) return B.id;
    return 'ujęcie: żadna z pętli nie jest na wierzchu';
  }
  const [G, D, cG, cD] = pa.rzad > pb.rzad ? [pa, pb, A, B] : [pb, pa, B, A];
  if (!G.rodzice.includes(D.id)) return 'skrzyżowanie pętli bez przeplotu (nie rodzic–dziecko)';
  const gg = grupa(cG.rodzaj), gd = grupa(cD.rodzaj);
  const prawe = G.typ === 'prawe';
  if (gg === 'platyna' && (gd === 'noga' || gd === 'glowa')) return prawe ? cD.id : cG.id;
  if (gg === 'noga' && gd === 'glowa') return prawe ? cG.id : cD.id;
  return `brak reguły dla ${gg} (rząd ${G.rzad}) × ${gd} (rząd ${D.rzad})`;
}

/** Kolejność rysowania z relacji „nad” (Kahn, stabilnie według kolejności wejścia). Cykl = błąd. */
export function sortujWarstwy(ids: string[], skrzyzowania: Skrzyzowanie[], bledy: string[]): string[] {
  const wej = new Map(ids.map((id) => [id, 0]));
  const nast = new Map<string, Set<string>>(ids.map((id) => [id, new Set()]));
  for (const s of skrzyzowania) {
    const pod = s.nad === s.a ? s.b : s.a;
    if (!nast.get(pod)!.has(s.nad)) {
      nast.get(pod)!.add(s.nad);
      wej.set(s.nad, wej.get(s.nad)! + 1);
    }
  }
  const out: string[] = [];
  const gotowe = ids.filter((id) => wej.get(id) === 0);
  while (gotowe.length) {
    const id = gotowe.shift()!;
    out.push(id);
    for (const n of nast.get(id)!) {
      wej.set(n, wej.get(n)! - 1);
      if (wej.get(n) === 0) gotowe.push(n);
    }
  }
  if (out.length < ids.length) bledy.push(`cykl warstw: ${ids.filter((id) => !out.includes(id)).join(', ')}`);
  return out;
}

export { KOLEJNOSC };
