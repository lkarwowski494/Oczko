// Port Orientacja (P-221 Q3a, ADR-0026; moduly.md „iPad i orientacja”): na iPhonie pion poza ekranem wzoru, dowolna na wzorze (F-25, W1a/W3);
// na iPadzie oba no-op (multitasking nie dopuszcza blokady). Adapter expo-screen-orientation 57.0.3 wstrzyknięty; błąd modułu nie wychodzi do ekranu.
import { orientacja, type ModulOrientacji } from '../../src/platforma/orientacja';

const modul = (blad = false) => {
  const wywolania: string[] = [];
  const m: ModulOrientacji = {
    lockAsync: async (o) => { wywolania.push(`lock:${o}`); if (blad) throw new Error('x'); },
    unlockAsync: async () => { wywolania.push('unlock'); if (blad) throw new Error('x'); },
    OrientationLock: { PORTRAIT_UP: 1 },
  };
  return { m, wywolania };
};

test('iPhone: tylkoPion blokuje PORTRAIT_UP, dowolna odblokowuje', async () => {
  const a = modul();
  const o = orientacja(a.m, false);
  o.tylkoPion(); o.dowolna();
  await Promise.resolve();
  expect(a.wywolania).toEqual(['lock:1', 'unlock']);
});
test('iPad: oba no-op', () => {
  const a = modul();
  const o = orientacja(a.m, true);
  o.tylkoPion(); o.dowolna();
  expect(a.wywolania).toEqual([]);
});
test('błąd modułu połknięty (bez nieobsłużonego odrzucenia)', async () => {
  const a = modul(true);
  expect(() => { orientacja(a.m, false).tylkoPion(); }).not.toThrow();
  await new Promise((r) => setTimeout(r, 0));
});
