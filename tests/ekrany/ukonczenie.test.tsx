// Chwila ukończenia (F-19, F-37, F-53; U-9; BR-PRJ-015, BR-DAN-012/S1; design-spec.md:57, :66; ekrany.html `ukonczenie`).
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Ukonczenie, type StanUkonczenia } from '../../../src/ekrany/Ukonczenie';
import type { Tlumacz } from '../../../src/ekrany/wspolne';
import { atrapaSystemu, przycisk, tEn } from '../../ekrany/pomoc';

let t: Tlumacz;
beforeAll(async () => { t = await tEn(); });
// BR-PRJ-015/S1: 1–21 października, 640 rzędów, 18 godzin, włóczka i zdjęcie
const STAN: StanUkonczenia = { nazwa: 'Harbor Sweater', okres: 'Oct 1 – Oct 21', dni: 21, rzedy: 640, czas: '18 h', czesci: 4,
  wloczka: [{ id: 'w1', nazwa: 'Fjord Wool, Slate' }], zdjecie: 'file:///zdjecie.jpg' };
function pokaz(s: Partial<StanUkonczenia> = {}) {
  const system = atrapaSystemu();
  const oglos = jest.fn();
  const w = { naWloczka: jest.fn(), naUdostepnij: jest.fn(), naGotowe: jest.fn() };
  render(<Ukonczenie stan={{ ...STAN, ...s }} t={t} oglos={oglos} system={system} {...w} />);
  return { system, oglos, w };
}

describe('Ukonczenie', () => {
  test('BR-PRJ-015/S1: karta — dni, godziny, rzędy, włóczka, zdjęcie, udostępnienie (ekrany.html:197–209)', () => {
    const { w } = pokaz();
    expect(screen.getByText('640')).toBeTruthy();
    expect(screen.getByText(/18 h/)).toBeTruthy();
    expect(screen.getByText(/21 knitting days/)).toBeTruthy(); // ekrany.html:201 „… · 23 knitting days”
    expect(screen.getByText(/Fjord Wool, Slate/)).toBeTruthy();
    expect(screen.getAllByRole('image').length).toBeGreaterThan(0);
    fireEvent.press(przycisk('Share', 'button')); // ekrany.html:197 aria-label="Share"
    expect(w.naUdostepnij).toHaveBeenCalledTimes(1);
  });

  test('BR-PRJ-015/S3: bez stopera karta nie pokazuje czasu (zamiast 0 godzin)', () => {
    pokaz({ czas: null });
    expect(screen.queryByText(/\b0 h\b|\d+ h\b|\bmin\b/)).toBeNull();
  });

  test('BR-DAN-012/S1: po zamknięciu karty „Done” jedna systemowa prośba o ocenę (ekrany.html:209)', () => {
    const { system, w } = pokaz();
    expect(system.prosbaOOcene).not.toHaveBeenCalled();
    fireEvent.press(przycisk('Done', 'button'));
    expect(w.naGotowe).toHaveBeenCalledTimes(1);
    expect(system.prosbaOOcene).toHaveBeenCalledTimes(1);
  });

  test('BR-PRJ-015 / NFR-DOS-001: ogłoszenie „Harbor Sweater moved to Finished.” (design-spec.md:66)', () => {
    const { oglos } = pokaz();
    expect(oglos).toHaveBeenCalledWith('Harbor Sweater moved to Finished.');
  });

  test('BR-PRJ-015 [macierz 04]: pytanie o włóczkę; bez włóczki w zapasie pominięte (design-spec.md:57, ekrany.html:206)', () => {
    const { w } = pokaz();
    // ekrany.html:206 aria-label="Enter yarn left over for Fjord Wool, Slate"
    fireEvent.press(przycisk('Enter yarn left over for Fjord Wool, Slate', 'button'));
    expect(w.naWloczka).toHaveBeenCalledWith('w1');
    screen.unmount();
    pokaz({ wloczka: [] });
    expect(screen.queryByRole('button', { name: /^Enter yarn left over/ })).toBeNull();
  });
});
