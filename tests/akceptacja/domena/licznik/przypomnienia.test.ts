// RD-13 przypomnienie „co N rzędów, M razy, od rzędu s” (BR-LIC-009, F-06) — poziom domena-Node.
// Wyrocznia: tests/wektory/brd.json RD-13-W1…W5 + własność ze wzoru RD-13 (rachunek na liczbach całkowitych w teście).
// Przeskok wartości (wpisanie 10 → 20, R-015) nie ma reguły: ER-40 otwarte, poza tym plikiem.
import fc from 'fast-check';
import { czyPrzypomnienie } from '../../../../src/domena/przypomnienia';
import { wektoryReguly, liczba, licznikWektorow, BLAD_DANYCH, opcjeWlasnosci } from '../../../narzedzia/akceptacja';

const KRYTERIA_RD13: Record<string, string> = {
  'RD-13-W1': 'BR-LIC-009/S1',
  'RD-13-W2': 'BR-LIC-009/S2',
  'RD-13-W3': 'BR-LIC-009/S3',
  'RD-13-W4': 'BR-LIC-009',
  'RD-13-W5': 'BR-LIC-009',
};

describe('RD-13 czyPrzypomnienie: wektory BRD', () => {
  const wektory = wektoryReguly('RD-13');
  const licznik = licznikWektorow();
  test.each(wektory.map((w) => [`${KRYTERIA_RD13[w.id] ?? 'RD-13'} ${w.id} (${w.rodzaj}) r=${w.wejscie['r [rz.]']} s=${w.wejscie['s [rz.]']} N=${w.wejscie['N [rz.]']} M=${w.wejscie['M [-]']}`, w] as const))('%s', (_n, w) => {
    licznik.sprawdz(() => {
      const plan = { od: liczba(w.wejscie['s [rz.]']), co: liczba(w.wejscie['N [rz.]']), razy: liczba(w.wejscie['M [-]']) };
      const wynik = czyPrzypomnienie(liczba(w.wejscie['r [rz.]']), plan);
      const o = w.oczekiwane['przypomnienie [-]'];
      if (o === BLAD_DANYCH) expect(wynik).toEqual({ ok: false, powod: 'bledne_dane' });
      else expect(wynik).toEqual({ ok: true, wartosc: o === 'tak' });
    });
  });
  test(`RD-13 liczność: wykonano ${wektory.length} z ${wektory.length} wektorów (pusty zbiór = porażka)`, () => {
    expect(wektory.length).toBe(5);
    licznik.wynik(wektory.length);
  });
});

describe('RD-13 własność: dokładnie M wyzwoleń w rzędach s, s+N, …, s+(M−1)N', () => {
  test('BR-LIC-009 RD-13 dla dowolnego planu (s ≥ 1, N ≥ 1, M ≥ 1) zbiór rzędów z przypomnieniem = {s + kN : 0 ≤ k < M}', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 60 }), fc.integer({ min: 1, max: 12 }), fc.integer({ min: 1, max: 8 }), (s, N, M) => {
        const plan = { od: s, co: N, razy: M };
        const oczekiwane = Array.from({ length: M }, (_, k) => s + k * N);
        const wyzwolone: number[] = [];
        for (let r = 1; r <= s + (M + 1) * N; r += 1) {
          const w = czyPrzypomnienie(r, plan);
          expect(w.ok).toBe(true);
          if (w.ok && w.wartosc) wyzwolone.push(r);
        }
        expect(wyzwolone).toEqual(oczekiwane);
      }),
      opcjeWlasnosci(),
    );
  });
});
