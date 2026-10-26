// Posiedzenie dla kresek i podpisu „Marks this session: {n} rows since {godzina}” (design-spec „Kreski sesji przez północ”, :242–:244;
// P-126 (6a), N2): zaczyna je pierwsze +1 po przerwie ≥ PRZERWA_NOWEGO_DNIA_MS albo start stopera (wtedy posiedzenie = sesja stopera);
// kończy je taka przerwa (kreski widać do następnego +1) albo zatrzymanie stopera. Północ go nie przerywa.
import { posiedzenie } from '../../../src/domena/posiedzenie';
import { PRZERWA_NOWEGO_DNIA_MS as P } from '../../../src/konfiguracja';

const M = 60_000;
const T = 1_000_000_000_000;
const plusy = (...min: number[]) => min.map((m) => T + m * M).sort((a, b) => b - a); // od najnowszego

describe('posiedzenie', () => {
  test('bez +1 i bez stopera → null', () => {
    expect(posiedzenie({ dodaniaMs: [], stoper: null })).toBeNull();
  });
  test('trzy +1 co minutę → 3 od pierwszego', () => {
    expect(posiedzenie({ dodaniaMs: plusy(0, 1, 2), stoper: null })).toEqual({ rzedy: 3, odMs: T });
  });
  test('N2: przerwa ≥ 60 min po ostatnim +1 — kreski zostają do następnego +1', () => {
    expect(posiedzenie({ dodaniaMs: plusy(0, 1, 2), stoper: null })).toEqual({ rzedy: 3, odMs: T });
  });
  test('następne +1 po przerwie ≥ 60 min zaczyna nowe posiedzenie od jednej kreski', () => {
    expect(posiedzenie({ dodaniaMs: plusy(0, 1, 2 + P / M), stoper: null })).toEqual({ rzedy: 1, odMs: T + 2 * M + P });
  });
  test('stoper trwa: posiedzenie = sesja stopera — od startu, także bez +1 (0 rzędów) i mimo przerwy ≥ 60 min w środku', () => {
    expect(posiedzenie({ dodaniaMs: plusy(-5), stoper: { startMs: T, koniecMs: null } })).toEqual({ rzedy: 0, odMs: T });
    expect(posiedzenie({ dodaniaMs: plusy(-5, 1, 2 + P / M), stoper: { startMs: T, koniecMs: null } })).toEqual({ rzedy: 2, odMs: T });
  });
  test('stoper zatrzymany: +1 do zatrzymania nie należą do następnego posiedzenia; bez +1 po zatrzymaniu → null', () => {
    expect(posiedzenie({ dodaniaMs: plusy(1, 2), stoper: { startMs: T, koniecMs: T + 3 * M } })).toBeNull();
    expect(posiedzenie({ dodaniaMs: plusy(1, 2, 4, 5), stoper: { startMs: T, koniecMs: T + 3 * M } })).toEqual({ rzedy: 2, odMs: T + 4 * M });
  });
});
