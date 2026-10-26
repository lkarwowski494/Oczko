// Licznik, partia 5: nazwa projektu otwiera ekran projektu (design-spec „Ekran projektu”: wejście `licznik-projekt`), „Next part” przy celu
// (BR-LIC-011/S1, P-182 Q4a) i linia „{część} in total” licznika sekcji (BR-LIC-018/S1).
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Licznik } from '../../src/ekrany/Licznik';
import type { Tlumacz } from '../../src/ekrany/wspolne';
import { atrapaHaptyki, przycisk, stanLicznika, tEn, wywolaniaLicznika } from './pomoc';

let t: Tlumacz;
beforeAll(async () => { t = await tEn(); });

test('stuknięcie w nazwę projektu (licznik-projekt) otwiera ekran projektu; etykieta = nazwa', () => {
  const w = { ...wywolaniaLicznika(), naProjekt: jest.fn() };
  render(<Licznik stan={stanLicznika()} t={t} oglos={jest.fn()} haptyka={atrapaHaptyki()} {...w} />);
  fireEvent.press(przycisk('Harbor Sweater', 'button'));
  expect(w.naProjekt).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('licznik-projekt').props.children).toBe('Harbor Sweater');
});

test('BR-LIC-018/S1: licznik sekcji pokazuje „Blanket in total: 20 rows”', () => {
  render(<Licznik stan={stanLicznika({ calosc: { czesc: 'Blanket', rzedy: 20 } })} t={t} oglos={jest.fn()} haptyka={atrapaHaptyki()} {...wywolaniaLicznika()} />);
  expect(screen.getByText('Blanket in total: 20 rows')).toBeTruthy();
});
