// „Zgłoś problem” (F-57, BR-DAN-010, R-162, R-163) i stan danych (F-58, BR-DAN-011). Ekrany nienarysowane (Z07-05).
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ZglosProblem, type PoleDiagnostyki } from '../../src/ekrany/ZglosProblem';
import { StanDanych } from '../../src/ekrany/StanDanych';
import type { Tlumacz } from '../../src/ekrany/wspolne';
import { atrapaSystemu, tEn } from './pomoc';

let t: Tlumacz;
beforeAll(async () => { t = await tEn(); });
const DIAG: PoleDiagnostyki[] = [
  { pole: 'wersja', wartosc: '1.0.0 (2001)' }, { pole: 'system', wartosc: 'iOS 26.1' }, { pole: 'model', wartosc: 'iPhone17,3' },
  { pole: 'synchronizacja', wartosc: 'aktywna' }, { pole: 'zegarek', wartosc: 'brak' }, { pole: 'bledy', wartosc: 'zapis 2026-11-08 20:14' },
];

describe('Zgłoś problem i stan danych', () => {
  test('BR-DAN-010/S1 / R-162: pełna diagnostyka widoczna, zanim cokolwiek opuści telefon', () => {
    const system = atrapaSystemu();
    render(<ZglosProblem stan={{ diagnostyka: DIAG }} t={t} system={system} naAnuluj={jest.fn()} />);
    for (const d of DIAG) expect(screen.getByText(new RegExp(d.wartosc.replace(/[.()]/g, '\\$&')))).toBeTruthy();
    expect(system.udostepnij).not.toHaveBeenCalled();
    expect(system.otworzAdres).not.toHaveBeenCalled();
  });

  test('BR-DAN-010/S2 / R-163: wysyłka tylko przez arkusz udostępniania, treść = podgląd (Z07-05: „Share”)', () => {
    const system = atrapaSystemu();
    render(<ZglosProblem stan={{ diagnostyka: DIAG }} t={t} system={system} naAnuluj={jest.fn()} />);
    // nazwa jak przycisk udostępniania w ekrany.html:197 (aria-label="Share")
    fireEvent.press(screen.getByRole('button', { name: /^Share/ }));
    expect(system.udostepnij).toHaveBeenCalledTimes(1);
    const tresc: string = system.udostepnij.mock.calls[0][0].tresc;
    for (const d of DIAG) expect(tresc).toContain(d.wartosc);
    expect(system.otworzAdres).not.toHaveBeenCalled(); // bez mailto i bez sieci
  });

  test('BR-DAN-011/S1: synchronizacja wstrzymana — ostatnia udana, czeka na sieć, dane zapisane na telefonie (Z07-05)', () => {
    render(<StanDanych stan={{ synchronizacja: 'blad', ostatniaUdana: 'Nov 8, 14:05', czekaNaSiec: true, zegarek: null }} t={t} />);
    expect(screen.getByText(/Nov 8, 14:05/)).toBeTruthy();
    // Z07-05: teksty robocze 07
    expect(screen.getByText(/waiting for (a )?(network|connection|internet)/i)).toBeTruthy();
    expect(screen.getByText(/saved on this (iPhone|phone|device)/i)).toBeTruthy();
  });

  test('BR-DAN-011/S2: zegarek ma 3 zmiany czekające na połączenie i co zrobić (Z07-05)', () => {
    render(<StanDanych stan={{ synchronizacja: 'wylaczona', ostatniaUdana: null, czekaNaSiec: false, zegarek: { oczekujace: 3 } }} t={t} />);
    expect(screen.getByText(/watch/i)).toBeTruthy();
    expect(screen.getByText(/\b3\b/)).toBeTruthy();
    expect(screen.getByText(/open Oczko|bring|near|nearby|Bluetooth/i)).toBeTruthy();
  });
});
