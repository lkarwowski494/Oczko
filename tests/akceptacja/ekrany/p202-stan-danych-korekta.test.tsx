// Przekazanie 01 → 07 (P-202, P-195 Q1/Q2a, P-193): testy oczekujące dla 08 — czerwone na asercji do czasu kodu.
// BR-DAN-011/S3 (ER-52): Stan danych na telefonie pokazuje czas ostatniego kontaktu z zegarkiem BEZ liczby zmian czekających na zegarku
// (liczbę zna tylko zegarek, ADR-0009). Sygnatura `zegarek: { ostatniKontakt }` to propozycja 07 (Z07-22) — 08 może ją zmienić z testem.
// BR-PRJ-013/S4 (ER-54): arkusz korekty sesji z przerwami mówi przed zapisem, że czas będzie liczony od początku do końca bez przerw
// (klucz formularz.sesja_przerwy z łatki 04 fix-6, P-202). Sygnatura `stan.przerwy` (sformatowany czas pauz albo null) — propozycja 07.
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { StanDanych, type PropsStanuDanych } from '../../../src/ekrany/StanDanych';
import type { Tlumacz } from '../../../src/ekrany/wspolne';
import { tEn } from '../../ekrany/pomoc';

let t: Tlumacz;
beforeAll(async () => { t = await tEn(); });

describe('P-202: przekazanie 01 (BR-DAN-011/S3, BR-PRJ-013/S4)', () => {
  test('BR-DAN-011/S3: ostatni kontakt z zegarkiem 2 godziny temu → czas kontaktu widoczny, bez liczby zmian na zegarku', () => {
    const stan = { synchronizacja: 'wylaczona', ostatniaUdana: null, czekaNaSiec: false, zegarek: { ostatniKontakt: 'Nov 10, 14:00' } } as unknown as PropsStanuDanych['stan'];
    render(<StanDanych stan={stan} t={t} />);
    expect(screen.getByText(/Nov 10, 14:00/)).toBeTruthy();
    expect(screen.queryByText(/change(s)? waiting/i)).toBeNull();
  });

  // BR-PRJ-013/S4: przeniesione przez 08 (partia 5) do tests/ekrany/sesje.test.tsx w sygnaturze KorektaSesji 08 (stan.przerwyMs, formatuj;
  // koordynator 16:38 UTC: „jeśli masz lepsze, przyjmij swoje”) — tam czerwone przed kodem 2bed45c, dziś zielone.
});
