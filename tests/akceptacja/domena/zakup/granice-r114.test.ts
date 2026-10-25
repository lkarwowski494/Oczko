// Test 07 z tests/akceptacja/domena/zakup/granice.test.ts (R-114, Z07-08), zostawiony w katalogu oczekujących przez 08 (partia 1):
// przeczy decyzji P-103 (3a) — pamięć ma okno offline 7 dni po `wygasa`, więc przy `wygasa === teraz` sklep daje brak dostępu
// (wektor 02 W-20), a pamięć dostęp (W-21b: 7 dni bez 1 ms). Zgłoszenie do 07: dopasować albo usunąć test; sensu nie zmienia 08.
import { decyzja } from '../../../../src/domena/dostep';
import type { Odczyt } from '../../../../src/domena/dostep';
import { PRODUKTY_PRO } from '../../../../src/konfiguracja';
import { TERAZ } from '../../../domena/zakup/pomocnicze';

const MIES = 'oczko.pro.monthly';
const sklep = (...u: { produkt: string; wygasa: number | null }[]): Odczyt => ({ zrodlo: 'sklep', uprawnienia: u.map((x) => ({ ...x, odebrane: false })) });

describe('Z07-08 / R-114 wygasa wobec teraz (KP-06)', () => {
  test('Z07-08 R-114 KP-06 wygasa === teraz: sklep i pamięć rozstrzygają tak samo (strona granicy [DO USTALENIA])', () => {
    const zeSklepu = decyzja(sklep({ produkt: MIES, wygasa: TERAZ }), null, TERAZ, PRODUKTY_PRO).dostep;
    const zPamieci = decyzja({ zrodlo: 'blad' }, { produkty: [MIES], wygasa: TERAZ }, TERAZ, PRODUKTY_PRO).dostep;
    expect(zPamieci).toBe(zeSklepu);
  });
});
