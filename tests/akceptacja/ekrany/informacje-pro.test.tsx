// Momenty informowania o Pro (P-089 (3)): okno „Uczciwe zasady” (3a, R-120) i karta po imporcie (3b, R-121).
// Kiedy pokazać (tylko darmowa, raz, po ukończonym dniu / udanym imporcie): domena `informacje-pro.ts` (testy domeny).
// Makiety brak (Z07-05; P-089: projekt okna według wzorca Treningu robi 04) → zapytania po roli bez etykiety wzorcowej.
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { KartaPoImporcie, OknoUczciweZasady } from '../../../src/ekrany/InformacjePro';
import type { Produkt } from '../../../src/domena/porty';
import type { Tlumacz } from '../../../src/ekrany/wspolne';
import { przycisk, tEn } from './pomoc';

let t: Tlumacz;
beforeAll(async () => { t = await tEn(); });
const PRODUKTY: Produkt[] = [
  { id: 'oczko.pro.miesiac', cenaWyswietlana: '4,99 zł', okres: 'miesiac' },
  { id: 'oczko.pro.rok', cenaWyswietlana: '19,99 zł', okres: 'rok' },
  { id: 'oczko.pro.dozywotni', cenaWyswietlana: '59,99 zł', okres: 'dozywotni' },
];

describe('Informacje o Pro (P-089)', () => {
  test('P-089 (3a) / R-120: główny przycisk okna „Uczciwe zasady” zamyka, nie otwiera ofert', () => {
    const naZamknij = jest.fn(), naPlany = jest.fn();
    render(<OknoUczciweZasady t={t} naZamknij={naZamknij} naPlany={naPlany} />);
    expect(screen.getByRole('header')).toBeTruthy(); // design-spec.md:67 fokus na nagłówku
    const przyciski = screen.getAllByRole('button');
    expect(przyciski).toHaveLength(1); // jeden główny przycisk; plany tylko jako link
    fireEvent.press(przyciski[0]);
    expect(naZamknij).toHaveBeenCalledTimes(1);
    expect(naPlany).not.toHaveBeenCalled();
  });

  test('P-089 (3a): link prowadzi do planów Pro; w oknie bez cen, procentów i porównań', () => {
    const naZamknij = jest.fn(), naPlany = jest.fn();
    render(<OknoUczciweZasady t={t} naZamknij={naZamknij} naPlany={naPlany} />);
    fireEvent.press(screen.getByRole('link'));
    expect(naPlany).toHaveBeenCalledTimes(1);
    expect(naZamknij).not.toHaveBeenCalled();
    expect(screen.queryByText(/[$€£]|zł|%|free trial|Upgrade now|Unlock/i)).toBeNull();
  });

  test('P-089 (3b) / R-121: karta po imporcie z planami i cenami tylko ze sklepu; zamknięcie (warunkowo: import w MVP, 03)', () => {
    const naZamknij = jest.fn(), naPlany = jest.fn();
    render(<KartaPoImporcie stan={{ produkty: PRODUKTY }} t={t} naZamknij={naZamknij} naPlany={naPlany} />);
    for (const p of PRODUKTY) expect(screen.getByText(new RegExp(p.cenaWyswietlana))).toBeTruthy();
    expect(screen.queryByText(/\$\s?\d|0[.,]99|6[.,]99|14[.,]99/)).toBeNull();
    fireEvent.press(przycisk('Close', 'button')); // nazwa jak ekrany.html:160
    expect(naZamknij).toHaveBeenCalledTimes(1);
    expect(naPlany).not.toHaveBeenCalled();
  });
});
