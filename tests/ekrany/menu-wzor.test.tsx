// Menu ••• licznika: wiersz wzoru (design-spec „Gdzie jest wzór”, W2a): `menu.wzor` przy wzorze, `menu.dodaj_wzor` bez; testID `menu-wzor` (subflow otworz-wzor-pdf).
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { MenuProjektu } from '../../src/ekrany/MenuProjektu';
import type { Tlumacz } from '../../src/ekrany/wspolne';
import { tEn } from './pomoc';

let t: Tlumacz;
beforeAll(async () => { t = await tEn(); });
const p = () => ({ naNazwa: jest.fn(), naCel: jest.fn(), naPrzypomnienie: jest.fn(), naPowtorzenie: jest.fn(), naWpisz: jest.fn(), naZablokuj: jest.fn(), naOdblokuj: jest.fn(), naZeruj: jest.fn(), naUkoncz: jest.fn(), naZamknij: jest.fn() });

test.each([[true, 'Pattern'], [false, 'Add pattern…']])('projekt z wzorem = %p → wiersz „%s” otwiera wzór', (maWzor, tekst) => {
  const naWzor = jest.fn();
  render(<MenuProjektu stan={{ projekt: 'Harbor', zablokowany: false, wartosc: 3, maWzor }} t={t} {...p()} naWzor={naWzor} />);
  expect(screen.getByTestId('menu-wzor')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: tekst }));
  expect(naWzor).toHaveBeenCalled();
});
