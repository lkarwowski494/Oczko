// Przeglądarka wzoru (design-spec „Wzór, rysik i iPad”; P-220 W1a, W3, W4b, W5a, W9b; P-218 (3); BR-WZR-005, BR-WZR-008; testID z e2e/README.md
// i scenariuszy 44–47, 52). Widok strony PDF to moduł natywny `oczko-wzor` — tu slot (`widok`), więc ekran jest testowalny bez urządzenia.
import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ukladOkna } from '../../src/domena/uklad';
import { PrzegladarkaWzoru, type StanPrzegladarki } from '../../src/ekrany/WzorPrzegladarka';
import type { Tlumacz } from '../../src/ekrany/wspolne';
import { tEn } from './pomoc';

let t: Tlumacz;
beforeAll(async () => { t = await tEn(); });

const stan = (z: Partial<StanPrzegladarki> = {}): StanPrzegladarki => ({
  nazwa: 'Harbor chart', opis: 'PDF · 6 pages', czesc: 'Back', wzory: [{ wzorId: 'w1', nazwa: 'Harbor chart' }], wzorId: 'w1',
  strona: { n: 2, razem: 6 }, zakreslenia: 0, narzedzie: 'brak', word: false,
  licznik: { liczba: 47, dziergany: 48 }, uklad: ukladOkna({ szerokosc: 390, wysokosc: 844 }), ...z,
});
function wywolania() {
  return {
    naWstecz: jest.fn(), naPrzelacz: jest.fn(), naNarzedzie: jest.fn(), naCofnij: jest.fn(), naZaznaczRzad: jest.fn(), naObroc: jest.fn(),
    naUsun: jest.fn(), potwierdz: jest.fn((_t: string, _o: string, _p: string, f: () => void) => f()),
    naPlus: jest.fn(async () => ({ ok: true as const, wartosc: undefined })), naMinus: jest.fn(async () => ({ ok: true as const, wartosc: undefined })),
  };
}
const widok = <Text testID="slot-widoku">PDF</Text>;

test('iPhone pionowo (W1a): wzór, plakietka strony, opis źródła i pasek licznika z tymi samymi id co licznik', () => {
  const w = wywolania();
  render(<PrzegladarkaWzoru stan={stan()} t={t} widok={widok} {...w} />);
  expect(screen.getByTestId('wzor-widok')).toBeTruthy();
  expect(screen.getByTestId('slot-widoku')).toBeTruthy();
  expect(screen.getByTestId('wzor-strona').props.children).toBe('Page 2 of 6');
  expect(screen.getByTestId('wzor-zrodlo').props.children).toBe('PDF · 6 pages');
  expect(screen.getByTestId('licznik-wartosc').props.children).toBe('47');
  expect(screen.getByTestId('licznik-teraz-rzad').props.children).toBe('Now knitting row 48');
  fireEvent.press(screen.getByTestId('licznik-plus'));
  fireEvent.press(screen.getByTestId('licznik-minus'));
  expect([w.naPlus.mock.calls.length, w.naMinus.mock.calls.length]).toEqual([1, 1]);
  fireEvent.press(screen.getByTestId('nav-wstecz'));
  expect(w.naWstecz).toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Back to Back' })).toBeTruthy();
});

test('układ „obok” (telefon poziomo W3, iPad poziomo W4b): kolumna licznika o szerokości z ukladOkna, wzór nadal widoczny', () => {
  render(<PrzegladarkaWzoru stan={stan({ uklad: ukladOkna({ szerokosc: 1180, wysokosc: 820 }) })} t={t} widok={widok} {...wywolania()} />);
  const kolumna = screen.getByTestId('wzor-kolumna-licznika');
  expect(kolumna.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ width: 340 })]));
  expect(screen.getByTestId('wzor-widok')).toBeTruthy();
});

test('iPhone: zakreślacz włącza tryb (selected), pasek narzędzi: gumka, cofnij, Done; liczba zakreśleń jako tekst (scenariusz 47)', () => {
  const w = wywolania();
  const r = render(<PrzegladarkaWzoru stan={stan()} t={t} widok={widok} {...w} />);
  expect(screen.getByTestId('wzor-zakreslenia').props.children).toBe('0 highlights');
  expect(screen.getByTestId('wzor-zakreslacz').props.accessibilityState).toEqual(expect.objectContaining({ selected: false }));
  fireEvent.press(screen.getByTestId('wzor-zakreslacz'));
  expect(w.naNarzedzie).toHaveBeenLastCalledWith('zakreslacz');
  r.rerender(<PrzegladarkaWzoru stan={stan({ narzedzie: 'zakreslacz', zakreslenia: 1 })} t={t} widok={widok} {...w} />);
  expect(screen.getByTestId('wzor-zakreslacz').props.accessibilityState).toEqual(expect.objectContaining({ selected: true }));
  expect(screen.getByTestId('wzor-zakreslenia').props.children).toBe('1 highlight');
  fireEvent.press(screen.getByTestId('wzor-gumka'));
  expect(w.naNarzedzie).toHaveBeenLastCalledWith('gumka');
  fireEvent.press(screen.getByTestId('wzor-cofnij-rysunek'));
  expect(w.naCofnij).toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Done' }));
  expect(w.naNarzedzie).toHaveBeenLastCalledWith('brak');
  expect(screen.queryByTestId('wzor-pioro')).toBeNull(); // pióro tylko na iPadzie
});

test('iPad (regular): stały pasek z piórem; zaznaczenie pióra', () => {
  const w = wywolania();
  render(<PrzegladarkaWzoru stan={stan({ uklad: ukladOkna({ szerokosc: 820, wysokosc: 1180 }) })} t={t} widok={widok} {...w} />);
  fireEvent.press(screen.getByTestId('wzor-pioro'));
  expect(w.naNarzedzie).toHaveBeenLastCalledWith('pioro');
  expect(screen.getByTestId('wzor-gumka')).toBeTruthy();
});

test('W9b, P-218 (3): przy ≥ 2 wzorach tytuł przełącza (menu z ✓ przy bieżącym); jeden wzór → bez przełącznika', () => {
  const w = wywolania();
  const r = render(<PrzegladarkaWzoru stan={stan()} t={t} widok={widok} {...w} />);
  expect(screen.queryByTestId('wzor-przelacz')).toBeNull();
  r.rerender(<PrzegladarkaWzoru stan={stan({ wzory: [{ wzorId: 'w1', nazwa: 'Harbor chart' }, { wzorId: 'w2', nazwa: 'Edging' }] })} t={t} widok={widok} {...w} />);
  fireEvent.press(screen.getByRole('button', { name: 'Pattern: Harbor chart. Switch pattern' }));
  expect(screen.getByRole('menuitem', { name: 'Harbor chart', selected: true })).toBeTruthy();
  fireEvent.press(screen.getByRole('menuitem', { name: 'Edging' }));
  expect(w.naPrzelacz).toHaveBeenCalledWith('w2');
});

test('menu •••: obrót strony, usunięcie do kosza po potwierdzeniu (P-229, tekst roboczy usun.wzor_opis)', () => {
  const w = wywolania();
  render(<PrzegladarkaWzoru stan={stan()} t={t} widok={widok} {...w} terminKosza="Nov 25" />);
  fireEvent.press(screen.getByTestId('wzor-menu'));
  fireEvent.press(screen.getByTestId('wzor-obroc'));
  expect(w.naObroc).toHaveBeenCalled();
  fireEvent.press(screen.getByTestId('wzor-menu'));
  fireEvent.press(screen.getByTestId('wzor-usun'));
  expect(w.potwierdz).toHaveBeenCalledWith('Delete “Harbor chart”?', expect.stringContaining('until Nov 25'), 'Delete pattern', expect.any(Function));
  expect(w.naUsun).toHaveBeenCalled();
});

test('Word w podglądzie zastępczym: linia informacji, bez „Mark row” i zakreślacza (design-spec W11)', () => {
  render(<PrzegladarkaWzoru stan={stan({ word: true })} t={t} widok={widok} {...wywolania()} />);
  expect(screen.getByText(/Word documents open as they are/)).toBeTruthy();
  expect(screen.queryByTestId('wzor-zakreslacz')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Mark row' })).toBeNull();
});
