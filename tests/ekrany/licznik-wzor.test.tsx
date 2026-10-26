// P-220 W2a (design-spec „Gdzie jest wzór”): ikona „Pattern” w pasku licznika tylko, gdy projekt ma ≥ 1 wzór (P-046: wzór dodała użytkowniczka),
// przed Historią; testID `licznik-wzor` (e2e/README.md, scenariusze 47 i 52), etykieta `licznik.wzor_a11y`.
import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Licznik } from '../../src/ekrany/Licznik';
import type { Tlumacz } from '../../src/ekrany/wspolne';
import { atrapaHaptyki, stanLicznika, tEn, wywolaniaLicznika } from './pomoc';

let t: Tlumacz;
beforeAll(async () => { t = await tEn(); });

test('projekt z wzorem: ikona „Pattern” otwiera wzór; kolejność w pasku: stoper, wzór, Historia', () => {
  const naWzor = jest.fn();
  render(<Licznik stan={stanLicznika()} t={t} oglos={jest.fn()} haptyka={atrapaHaptyki()} {...wywolaniaLicznika()} naWzor={naWzor} stoper={<Text testID="slot-stopera">S</Text>} />);
  fireEvent.press(screen.getByTestId('licznik-wzor'));
  expect(naWzor).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Pattern' })).toBeTruthy();
  const kolejnosc = screen.UNSAFE_root.findAll((n) => typeof n.type === 'string' && ['slot-stopera', 'licznik-wzor', 'licznik-historia'].includes(n.props.testID)).map((n) => n.props.testID);
  expect([...new Set(kolejnosc)]).toEqual(['slot-stopera', 'licznik-wzor', 'licznik-historia']);
});

test('projekt bez wzoru (brak naWzor) → bez ikony (P-046)', () => {
  render(<Licznik stan={stanLicznika()} t={t} oglos={jest.fn()} haptyka={atrapaHaptyki()} {...wywolaniaLicznika()} />);
  expect(screen.queryByTestId('licznik-wzor')).toBeNull();
});
