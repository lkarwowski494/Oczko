// P-287 (15), BR-LIC-015/S2, scenariusz 15: udawany zegarek buildu E2E (EXPO_PUBLIC_WATCH_FAKE=1, e2e/README.md:37, :251) — `wyslijStan`
// zapisuje ostatni StanZegarka, panel `e2e-zegarek-stan` pokazuje go tekstem (bez t()): rząd roboczy i przypomnienia z instrukcją.
import React from 'react';
import { act, render, screen } from '@testing-library/react-native';
import { opisStanuZegarka, PanelZegarka, zegarekSztuczny } from '../../src/kompozycja/e2e/panele';
import type { StanZegarka } from '../../src/domena/porty';

const stan = (z: Partial<StanZegarka> = {}): StanZegarka => ({
  wersja: 3, licznikId: 'l1', nazwa: 'Sweater', wartosc: 11, znaczenie: 'skonczone', glowa: 'z11', ostatniPlusMs: 1, dzien: '2026-11-10',
  dzienDozwolony: true, sesjaStartMs: null, pro: false, proWaznoscDo: null, dniWMiesiacu: [], przypomnienia: [{ od: 12, co: 6, razy: 8, tekst: 'decrease at both ends' }],
  zablokowany: false, ...z,
});

test('opis: wartość, rząd roboczy i przypomnienia z planem i instrukcją', () => {
  expect(opisStanuZegarka(stan())).toBe('Watch state: Sweater · 11 done · row 12 · reminders: from 12 every 6 ×8: decrease at both ends');
  expect(opisStanuZegarka(stan({ przypomnienia: [], wartosc: 0 }))).toBe('Watch state: Sweater · 0 done · row 1');
});

test('panel: przed pierwszym stanem „no state”; po wyslijStan ostatni stan (scen. 15: „.*row 12.*decrease at both ends.*”)', async () => {
  render(<PanelZegarka />);
  expect(screen.getByTestId('e2e-zegarek-stan').props.children).toBe('Watch state: none');
  await act(async () => { await zegarekSztuczny.wyslijStan(stan()); });
  expect(String(screen.getByTestId('e2e-zegarek-stan').props.children)).toMatch(/.*row 12.*decrease at both ends.*/);
});
