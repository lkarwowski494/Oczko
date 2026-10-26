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

import type { WidokProjektu } from '../../src/przypadki-uzycia/widok-projektu';
import { stanProjektu } from '../../src/kompozycja/projekt';
const W: WidokProjektu = {
  id: 'p1', nazwa: 'Harbor', nienazwany: false, stan: 'w_toku', utworzonoMs: Date.UTC(2026, 9, 1), zmienionoMs: Date.UTC(2026, 9, 20, 10), ostatniaPracaMs: Date.UTC(2026, 9, 22, 10),
  notatka: '', narzedzie: 'druty', drutMm: 4, drutUS: '6', terminDzien: '2026-10-31', celDnia: { rodzaj: 'cel', rzedy: 10 }, zrobioneDzis: 3,
  postep: { rodzaj: 'procent', wartosc: 51 }, ukonczonoDzien: null,
  czesci: [
    { id: 'c1', nazwa: 'Back', rzedy: 60, cel: 96, celZPary: false, paraZ: null, calosc: null, liczniki: [{ id: 'l1', nazwa: '', rodzaj: 'rzedy', sekcja: false, wartosc: 60, znaczenie: 'skonczone' }] },
    { id: 'c2', nazwa: 'Blanket', rzedy: 20, cel: null, celZPary: false, paraZ: null, calosc: null, liczniki: [
      { id: 'l2', nazwa: 'Square 1', rodzaj: 'rzedy', sekcja: false, wartosc: 12, znaczenie: 'skonczone' }, { id: 'l3', nazwa: '', rodzaj: 'rzedy', sekcja: false, wartosc: 8, znaczenie: 'skonczone' }] },
  ],
};
test('stanProjektu: termin, szczegóły z US, pusta notatka = null, liczniki z nazwą rodzaju, całość przy ≥ 2 licznikach rzędów (propozycja 04 N2)', () => {
  const s = stanProjektu(W, { j, terazMs: Date.UTC(2026, 9, 22, 12), strefa: 'UTC' });
  expect(s.termin).toBe('Done by Oct 31 · today 3 of 10 rows');
  expect(s.szczegoly).toEqual({ narzedzie: 'Needles', rozmiar: '4 mm (US 6)', termin: 'Oct 31' });
  expect(s.notatka).toBeNull();
  expect(s.ostatniaZmiana).toBe('Oct 22');
  expect(s.czesci[0].liczniki).toEqual([{ id: 'l1', nazwa: 'Rows', opis: '60 rows' }]);
  expect([s.czesci[0].calosc, s.czesci[1].calosc, s.czesci[1].liczniki?.[1]?.nazwa]).toEqual([null, 20, 'Rows']);
});
test('stanProjektu: gałęzie terminu RD-15 i brak terminu', () => {
  const linia = (z: Partial<WidokProjektu>) => stanProjektu({ ...W, ...z }, { j, terazMs: 0, strefa: 'UTC' }).termin;
  expect(linia({ celDnia: { rodzaj: 'po_terminie', zostalo: 5 } })).toBe('The due date Oct 31 has passed · 5 rows to go');
  expect(linia({ celDnia: { rodzaj: 'osiagniety' } })).toBe('Done by Oct 31 · goal reached');
  expect(linia({ celDnia: null })).toBe('Done by Oct 31 · set a goal for a part to get a daily goal');
  expect(linia({ terminDzien: null, celDnia: null })).toBeNull();
  expect(stanProjektu({ ...W, drutMm: 6.5, drutUS: null, narzedzie: 'szydelko' }, { j, terazMs: 0, strefa: 'UTC' }).szczegoly).toEqual({ narzedzie: 'Hook', rozmiar: '6.5 mm', termin: 'Oct 31' });
});
test('stanProjektu: daty ukończonego projektu z rokiem (daty historii), zakres wyboru od dnia startu do dziś; w toku brak', () => {
  const s = stanProjektu({ ...W, stan: 'ukonczony', ukonczonoDzien: '2026-10-20' }, { j, terazMs: Date.UTC(2026, 9, 22, 12), strefa: 'UTC' });
  expect(s.daty).toEqual({ start: 'Oct 1, 2026', koniec: 'Oct 20, 2026', startDzien: '2026-10-01', koniecDzien: '2026-10-20', dzis: '2026-10-22' });
  expect(stanProjektu(W, { j, terazMs: 0, strefa: 'UTC' }).daty).toBeNull();
});
