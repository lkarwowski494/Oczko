// P-255 (a), scenariusz 10: przyciski arkusza (Save / Cancel) nad klawiaturą numeryczną — stuknięcie w Save trafiało w klawisz „0” (46 → 460).
// Odstęp = ile dół paska przycisków (w oknie) zachodzi na górną krawędź klawiatury; arkusz formSheet jest przesunięty w oknie, więc pomiar
// w oknie (measureInWindow), nie ramka względem rodzica (KeyboardAvoidingView).
import React from 'react';
import { Keyboard, Text } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import { Arkusz, odstepNadKlawiatura } from '../../src/ekrany/Arkusz';
import { odstep } from '../../src/ekrany/motyw';

test('odstęp = zachodzenie dołu przycisków na klawiaturę; bez zachodzenia albo bez klawiatury 0', () => {
  expect(odstepNadKlawiatura({ dolPrzyciskow: 800, gornaKlawiatury: 500 })).toBe(300);
  expect(odstepNadKlawiatura({ dolPrzyciskow: 450, gornaKlawiatury: 500 })).toBe(0);
  expect(odstepNadKlawiatura({ dolPrzyciskow: 800, gornaKlawiatury: null })).toBe(0);
});

test('Arkusz: po pokazaniu klawiatury pasek przycisków dostaje odstęp, po schowaniu 0', () => {
  const sluchacze: Record<string, (e: { endCoordinates: { screenY: number } }) => void> = {};
  const spy = jest.spyOn(Keyboard, 'addListener').mockImplementation(((nazwa: string, fn: (e: { endCoordinates: { screenY: number } }) => void) => {
    sluchacze[nazwa] = fn;
    return { remove: () => undefined };
  }) as unknown as typeof Keyboard.addListener);
  render(<Arkusz tytul="T" przyciski={<Text>Save</Text>} zmierz={(f) => f(0, 600, 390, 200)}>{null}</Arkusz>);
  act(() => sluchacze.keyboardWillShow({ endCoordinates: { screenY: 500 } }));
  expect(screen.getByTestId('arkusz-przyciski')).toHaveStyle({ paddingBottom: odstep.l + 300 }) // token 04 zostaje, odstęp dochodzi;
  act(() => sluchacze.keyboardWillHide({ endCoordinates: { screenY: 844 } }));
  expect(screen.getByTestId('arkusz-przyciski')).toHaveStyle({ paddingBottom: odstep.l });
  spy.mockRestore();
});
