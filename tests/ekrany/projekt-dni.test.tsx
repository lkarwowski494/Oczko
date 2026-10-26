// Przegląd projektu (F-18, F-52, F-60; BR-PRJ-005, BR-PRJ-014/S3, BR-DNI-004/S3), kalendarz i podsumowanie (F-59; BR-DNI-001/S4, BR-DNI-003/S2).
// Ekrany nienarysowane (design-spec.md:95; Z07-05): asercje na danych z propsów i negatywne; teksty robocze oznaczone.
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Projekt, type PropsProjektu } from '../../src/ekrany/Projekt';
import { Kalendarz, Podsumowanie } from '../../src/ekrany/Dni';
import type { Tlumacz } from '../../src/ekrany/wspolne';
import { tEn } from './pomoc';

let t: Tlumacz;
beforeAll(async () => { t = await tEn(); });
const projekt = (z: Partial<PropsProjektu['stan']> = {}): PropsProjektu['stan'] => ({
  nazwa: 'Harbor Sweater', notatka: 'Switch to 4 mm for the cuff', miejsceWzoru: 'Page 3, row 48', ostatniaZmiana: 'June 2',
  czesci: [{ id: 'c1', nazwa: 'Left sleeve', rzedy: 47, cel: 96, paraZ: null }, { id: 'c2', nazwa: 'Back', rzedy: 120, cel: 140, paraZ: null }],
  postep: { rodzaj: 'procent', wartosc: 64 }, ...z,
});

describe('Projekt i dni', () => {
  test('BR-PRJ-005/S1: po 5 miesiącach widać wartości liczników, notatkę, miejsce we wzorze i datę zmiany', () => {
    render(<Projekt stan={projekt()} t={t} naOtworzCzesc={jest.fn()} />);
    expect(screen.getByText(/Left sleeve/)).toBeTruthy();
    expect(screen.getByText(/\b47\b/)).toBeTruthy();
    expect(screen.getByText(/\b120\b/)).toBeTruthy();
    expect(screen.getByText('Switch to 4 mm for the cuff')).toBeTruthy();
    expect(screen.getByText(/Page 3, row 48/)).toBeTruthy();
    expect(screen.getByText(/June 2/)).toBeTruthy();
  });

  test('BR-DNI-004/S3: bez celów brak procentu, informacja, że postęp wymaga celu (RD-14-W6; Z07-05)', () => {
    render(<Projekt stan={projekt({ postep: { rodzaj: 'brak-celow' }, czesci: [{ id: 'c1', nazwa: 'Left sleeve', rzedy: 47, cel: null, paraZ: null }] })} t={t} naOtworzCzesc={jest.fn()} />);
    expect(screen.queryByText(/%/)).toBeNull();
    expect(screen.getByText(/goal/i)).toBeTruthy();
  });

  test('BR-PRJ-014/S3: para z pierwszą częścią bez rzędów — druga bez celu, informacja kiedy cel się pojawi (Z07-05)', () => {
    render(<Projekt stan={projekt({ postep: { rodzaj: 'brak-celow' }, czesci: [
      { id: 'c1', nazwa: 'Left sleeve', rzedy: 0, cel: null, paraZ: null },
      { id: 'c2', nazwa: 'Right sleeve', rzedy: 0, cel: null, paraZ: 'c1' },
    ] })} t={t} naOtworzCzesc={jest.fn()} />);
    expect(screen.queryByText(/Goal \d+ rows/)).toBeNull();
    expect(screen.getByText(/Left sleeve.*rows|goal.*Left sleeve|Left sleeve.*goal/i)).toBeTruthy();
  });

  test('BR-DNI-001/S4: kalendarz bez serii dni i ponagleń po 10 dniach przerwy (P-043)', () => {
    render(<Kalendarz stan={{ miesiac: 'November', dni: [{ data: '2026-11-01', etykieta: 'Nov 1', rzedy: 12 }] }} t={t} naDzien={jest.fn()} />);
    expect(screen.getByText(/November/)).toBeTruthy();
    expect(screen.queryByText(/streak|in a row|don’t break|keep it up|you haven’t knitted|miss/i)).toBeNull();
  });

  test('BR-DNI-003/S2: podsumowanie miesiąca bez sesji — rzędy i ukończone, czas tylko jako informacja o stoperze (Z07-05)', () => {
    render(<Podsumowanie stan={{ okres: 'November', rzedy: 312, ukonczone: ['Lavender hat'], czas: null }} t={t} />);
    expect(screen.getByText(/312/)).toBeTruthy();
    expect(screen.getByText(/Lavender hat/)).toBeTruthy();
    expect(screen.queryByText(/\b0 h\b|0 hours|0:00/)).toBeNull();
    expect(screen.getByText(/stopwatch|timer/i)).toBeTruthy();
  });
});
