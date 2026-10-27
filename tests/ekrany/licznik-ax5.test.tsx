// P-266 (1), scenariusz 30 (NFR-DOS-002, AX5; przebieg 121): przy dużym tekście nazwy projektu i części zajmują cały przewijany środek ekranu
// (+1 rośnie z tekstem), a liczba — kluczowa wartość — zostaje poza widokiem. Po zmianie wartości (i przy pierwszym układzie) środek przewija
// się do liczby, gdy nie jest cała widoczna; przy zwykłym tekście nic się nie przewija.
import React from 'react';
import { ScrollView } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Licznik } from '../../src/ekrany/Licznik';
import { przewiniecieDoLiczby } from '../../src/ekrany/LiczbaWidoczna';
import type { Tlumacz } from '../../src/ekrany/wspolne';
import { atrapaHaptyki, stanLicznika, tEn, wywolaniaLicznika } from './pomoc';

let t: Tlumacz;
beforeAll(async () => { t = await tEn(); });

test('decyzja: liczba widoczna → bez przewijania; poniżej albo powyżej widoku → przewinięcie do jej góry', () => {
  expect(przewiniecieDoLiczby({ przesuniecie: 0, wysokosc: 600, y: 200, h: 125 })).toBeNull();
  expect(przewiniecieDoLiczby({ przesuniecie: 0, wysokosc: 180, y: 900, h: 125 })).toBe(900);
  expect(przewiniecieDoLiczby({ przesuniecie: 950, wysokosc: 180, y: 900, h: 125 })).toBe(900);
  expect(przewiniecieDoLiczby({ przesuniecie: 0, wysokosc: 0, y: 900, h: 125 })).toBeNull(); // przed układem widoku
});

test('AX5: po +1 (nowa wartość) środek licznika przewija się do liczby poza widokiem', () => {
  const props = { t, oglos: jest.fn(), haptyka: atrapaHaptyki(), ...wywolaniaLicznika() };
  const { rerender } = render(<Licznik stan={stanLicznika({ skonczone: 0, dziergany: 1 })} {...props} />);
  const srodek = screen.UNSAFE_getAllByType(ScrollView)[0];
  const scrollTo = srodek.instance.scrollTo as jest.Mock;
  fireEvent(srodek, 'layout', { nativeEvent: { layout: { x: 0, y: 148, width: 402, height: 180 } } });
  fireEvent(screen.getByTestId('licznik-wartosc-wiersz'), 'layout', { nativeEvent: { layout: { x: 20, y: 900, width: 362, height: 125 } } });
  scrollTo.mockClear();
  act(() => { rerender(<Licznik stan={stanLicznika({ skonczone: 1, dziergany: 2 })} {...props} />); });
  expect(scrollTo).toHaveBeenCalledWith({ y: 900, animated: false });
});
