import React from 'react';
import renderer, { act } from 'react-test-renderer';
import MainCounterScreen from '../MainCounterScreen';

describe('Oczko UI — Test renderowania głównego ekranu', () => {
  test('Komponent ekranu licznika definiuje poprawną strukturę i renderuje drzewo', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<MainCounterScreen />);
    });
    expect(tree).toBeDefined();
    const json = tree.toJSON();
    expect(json).not.toBeNull();
  });
});
