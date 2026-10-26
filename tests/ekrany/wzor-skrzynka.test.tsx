// Arkusz skrzynki importu na liście projektów (design-spec R2; P-230 Q2a, scenariusz 52): „N patterns to add”, lista projektów w toku + „New project”,
// „Not now” zostawia zlecenia; testID `skrzynka`, `skrzynka-projekt`. Nie nad licznikiem (P-046) — slot tylko w ListaProjektow.
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ArkuszSkrzynki } from '../../src/ekrany/WzorSkrzynka';
import type { Tlumacz } from '../../src/ekrany/wspolne';
import { tEn } from './pomoc';

let t: Tlumacz;
beforeAll(async () => { t = await tEn(); });

test('1 zlecenie: tytuł w liczbie pojedynczej, nazwa pliku, wybór projektu → naWybierz(projektId); „New project” → null', () => {
  const naWybierz = jest.fn();
  render(<ArkuszSkrzynki t={t} pozycje={[{ id: 'z1', nazwa: 'Harbor test pattern.pdf' }]} projekty={[{ id: 'p1', nazwa: 'Harbor Sweater' }, { id: 'p2', nazwa: 'Scarf' }]}
    naWybierz={naWybierz} naNieTeraz={jest.fn()} />);
  expect(screen.getByTestId('skrzynka')).toBeTruthy();
  expect(screen.getByText('1 pattern to add')).toBeTruthy();
  expect(screen.getByText('Harbor test pattern.pdf')).toBeTruthy();
  fireEvent.press(screen.getAllByTestId('skrzynka-projekt')[1]);
  expect(naWybierz).toHaveBeenLastCalledWith('p2');
  fireEvent.press(screen.getByRole('button', { name: 'New project' }));
  expect(naWybierz).toHaveBeenLastCalledWith(null);
});

test('2 zlecenia: „2 patterns to add”; „Not now” zamyka bez zmian', () => {
  const naNieTeraz = jest.fn();
  render(<ArkuszSkrzynki t={t} pozycje={[{ id: 'a', nazwa: 'a.pdf' }, { id: 'b', nazwa: 'b.pdf' }]} projekty={[]} naWybierz={jest.fn()} naNieTeraz={naNieTeraz} />);
  expect(screen.getByText('2 patterns to add')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Not now' }));
  expect(naNieTeraz).toHaveBeenCalled();
});
