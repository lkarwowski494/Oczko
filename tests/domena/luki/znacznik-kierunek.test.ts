// P-118 W7 (fix-2 05, Q2a), ADR-0011 „Uzupełnienie … kierunek znacznika i koniec strony”: kierunek w znaczniku i zatrzymanie na krawędzi strony.
// Test roli 08 z wyroczni ADR-0011 (P-120 Q4a), do przeglądu 07; `y` z tolerancją 1e-9 (liczby zmiennoprzecinkowe, jak w wyroczni).
import { polozenieZnacznika, type ZnacznikWzoru } from '../../../src/domena/znacznik-wzoru';

const Z: ZnacznikWzoru = { strona: 2, y: 0.5, wysokoscRzedu: 0.1, kierunek: -1, rzadBazowy: 12, wartoscPrzyUstawieniu: 12 };

describe('P-118 W7 polozenieZnacznika: wyrocznia ADR-0011', () => {
  test.each([
    ['BR-WZR-003/S1 w górę, licznik 13', Z, 13, { strona: 2, rzad: 13, y: 0.4, pozaStrona: false }],
    ['w górę, licznik 12 (bez zmiany)', Z, 12, { strona: 2, rzad: 12, y: 0.5, pozaStrona: false }],
    ['w górę, licznik 17 → górna krawędź strony', Z, 17, { strona: 2, rzad: 17, y: 0, pozaStrona: false }],
    ['w górę, licznik 18 → poza stroną, znacznik na krawędzi', Z, 18, { strona: 2, rzad: 18, y: 0, pozaStrona: true }],
    ['w górę, licznik 11 (cofnięcie)', Z, 11, { strona: 2, rzad: 11, y: 0.6, pozaStrona: false }],
    ['w dół, licznik 16', { ...Z, kierunek: 1 as const }, 16, { strona: 2, rzad: 16, y: 0.9, pozaStrona: false }],
    ['w dół, licznik 17 → poza stroną', { ...Z, kierunek: 1 as const }, 17, { strona: 2, rzad: 17, y: 0.9, pozaStrona: true }],
    ['w górę, licznik 0 → cofnięcie przed rząd 1', Z, 0, { strona: 2, rzad: 0, y: 0.9, pozaStrona: true }],
  ] as const)('P-118 W7 %s', (_n, z, licznik, oczek) => {
    const w = polozenieZnacznika(z, licznik);
    expect({ ...w, y: undefined }).toEqual({ ...oczek, y: undefined });
    expect(w.y).toBeCloseTo(oczek.y, 9);
  });
});
