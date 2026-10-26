// Cienkie adaptery platformy (test roli 08 na wstrzykniętych modułach): Zegar (RD-16 przez domenę), Haptyka (wzorce tokenów 04), EkranAktywny (tag).
import { ekranAktywny } from '../../src/platforma/ekran-aktywny';
import { haptyka, ODSTEP_PRZYPOMNIENIA_MS } from '../../src/platforma/haptyka';
import { zegarSystemu } from '../../src/platforma/zegar';

test('Zegar: ms i strefa z systemu, dzień lokalny w strefie (RD-16-W1: 2023-06-04T01:30Z w New York → 2023-06-03); zła strefa = wyjątek', () => {
  const ms = Date.UTC(2023, 5, 4, 1, 30);
  expect(zegarSystemu(() => ms, () => 'America/New_York').teraz()).toEqual({ ms, strefa: 'America/New_York', dzien: '2023-06-03' });
  expect(() => zegarSystemu(() => ms, () => 'Nie/Istnieje').teraz()).toThrow('Zegar');
});

test('Haptyka: rząd = jedno .light; przypomnienie = dwa .medium z odstępem 90 ms; błąd modułu bez wyjątku', async () => {
  const uderzenia: string[] = [];
  const czekania: number[] = [];
  const h = haptyka({ impactAsync: async (s) => { uderzenia.push(s); } }, async (ms) => { czekania.push(ms); });
  h.rzad();
  h.przypomnienie();
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
  expect([uderzenia, czekania]).toEqual([['light', 'medium', 'medium'], [ODSTEP_PRZYPOMNIENIA_MS]]);
  expect(() => haptyka({ impactAsync: async () => { throw new Error('x'); } }).rzad()).not.toThrow();
});

test('EkranAktywny: włącz i wyłącz z tym samym tagiem (activateKeepAwakeAsync / deactivateKeepAwake)', () => {
  const w: string[] = [];
  const e = ekranAktywny({ activateKeepAwakeAsync: async (t) => { w.push(`+${t}`); }, deactivateKeepAwake: async (t) => { w.push(`-${t}`); } });
  e.wlacz('licznik'); e.wylacz('licznik');
  expect(w).toEqual(['+licznik', '-licznik']);
});
