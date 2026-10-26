// Kompozycja partii 5: teksty listy i kosza z modeli odczytu (klucze 04 fix-5, liczba mnoga przez t(), daty krótkie w formacie języka).
import { liniaDzis, ostatniaPraca, stanKosza, krotkaData } from '../../src/kompozycja/projekt';
import { stanListy } from '../../src/kompozycja/projekty';
import type { Jezyk } from '../../src/kompozycja/licznik';
import { tEn } from './pomoc';

let j: Jezyk;
beforeAll(async () => { const t = await tEn(); j = { t, jezyk: () => 'en-US', zegar24h: () => false }; });

test('„last worked …”: 0 → today, 1 → yesterday, 2 / 41 → liczba mnoga', () => {
  expect([0, 1, 2, 41].map((n) => ostatniaPraca(n, j.t))).toEqual(['last worked today', 'last worked yesterday', 'last worked 2 days ago', 'last worked 41 days ago']);
});
test('linia dziś na liście: cel, po terminie, osiągnięty; brak terminu → null', () => {
  expect(liniaDzis({ cel: { rodzaj: 'cel', rzedy: 10 }, zrobione: 3 }, j.t)).toBe('Today: 3 of 10 rows');
  expect(liniaDzis({ cel: { rodzaj: 'cel', rzedy: 1 }, zrobione: 0 }, j.t)).toBe('Today: 0 of 1 row');
  expect(liniaDzis({ cel: { rodzaj: 'po_terminie', zostalo: 50 }, zrobione: 0 }, j.t)).toBe('Past the due date · 50 rows to go');
  expect(liniaDzis({ cel: { rodzaj: 'osiagniety' }, zrobione: 0 }, j.t)).toBe('Goal reached');
  expect(liniaDzis(null, j.t)).toBeNull();
});
test('krótka data z dnia RRRR-MM-DD bez przesunięcia strefy', () => {
  expect(krotkaData('2026-11-21', 'en-US')).toBe('Nov 21');
});
test('kosz: podpisy z rodzicem i terminem; licznik bez nazwy dostaje nazwę rodzaju', () => {
  const s = stanKosza([
    { rodzaj: 'licznik', id: 'l2', nazwa: '', nienazwany: false, rodzajLicznika: 'oczka', projekt: 'Harbor', czesc: 'Back', usunietoMs: 0, doDnia: '2026-11-21' },
    { rodzaj: 'czesc', id: 'c2', nazwa: 'Sleeve', nienazwany: false, rodzajLicznika: null, projekt: 'Harbor', czesc: null, usunietoMs: 0, doDnia: '2026-11-22' },
    { rodzaj: 'projekt', id: 'p2', nazwa: 'Scarf', nienazwany: false, rodzajLicznika: null, projekt: 'Scarf', czesc: null, usunietoMs: 0, doDnia: '2026-11-23' },
  ], j);
  expect(s).toEqual({ dni: 30, pozycje: [
    { rodzaj: 'licznik', id: 'l2', nazwa: 'Stitches', podpis: 'Counter in Harbor, Back · until Nov 21' },
    { rodzaj: 'czesc', id: 'c2', nazwa: 'Sleeve', podpis: 'Part of Harbor · until Nov 22' },
    { rodzaj: 'projekt', id: 'p2', nazwa: 'Scarf', podpis: 'Project · until Nov 23' },
  ] });
});
test('stanListy: linie terminu i ostatniej pracy tylko w toku; liczba kosza', () => {
  const p = { id: 'p1', nazwa: 'Harbor', nienazwany: false, utworzonoMs: 0, ostatniaPracaMs: 0, licznik: null, dniOdPracy: 41, dzis: { cel: { rodzaj: 'cel' as const, rzedy: 10 }, zrobione: 3 } };
  const s = stanListy({ wToku: [p], ukonczone: [{ ...p, id: 'p2' }], dni: null, kosz: 2 }, { zapytanie: '', j, terazMs: 0, strefa: 'UTC' });
  expect([s.wToku[0].termin, s.wToku[0].ostatniaPraca, s.ukonczone[0].ostatniaPraca ?? null, s.kosz]).toEqual(['Today: 3 of 10 rows', 'last worked 41 days ago', null, 2]);
});
