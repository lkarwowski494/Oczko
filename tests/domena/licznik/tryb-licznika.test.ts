// Test roli 08 (P-114 Q2a): RD-12-W7–W9 (tryb licznika, BR-LIC-012, ER-40) — wektory bez testu 07 po fixie 01 (P-097 (3.1a)).
// Wyrocznia: tests/wektory/brd.json; r = liczba pokazana na liczniku (docs/brd/reguly.md RD-12): w trybie „skończone rzędy” r = skończone,
// w trybie „rząd w trakcie” r = skończone + 1 — liczone przez wartoscWyswietlana (BR-LIC-012), potem powtorzenie (RD-12).
import { powtorzenie, wartoscWyswietlana } from '../../../src/domena/licznik';
import { wektoryReguly, liczba, licznikWektorow } from '../../narzedzia/akceptacja';

describe('RD-12 BR-LIC-012 tryb licznika: wektory BRD W7–W9', () => {
  const wektory = wektoryReguly('RD-12').filter((w) => 'tryb [-]' in w.wejscie);
  const licznik = licznikWektorow();
  test.each(wektory.map((w) => [`BR-LIC-012 ${w.id} (${w.rodzaj}) skończone=${w.wejscie['skończone [rz.]']} tryb=${w.wejscie['tryb [-]']}`, w] as const))('%s', (_n, w) => {
    licznik.sprawdz(() => {
      const skonczone = liczba(w.wejscie['skończone [rz.]']);
      const tryb = w.wejscie['tryb [-]'];
      if (tryb !== 'rząd w trakcie' && tryb !== 'skończone rzędy') throw new Error(`Wektor ${w.id}: nieznany tryb ${String(tryb)}`);
      const r = tryb === 'rząd w trakcie' ? wartoscWyswietlana(skonczone, 'w_trakcie').dziergany : skonczone;
      expect(powtorzenie(r, liczba(w.wejscie['n [rz.]']))).toEqual({ ok: true, wartosc: { powtorzenie: w.oczekiwane['powtórzenie [-]'], rzadW: w.oczekiwane['rząd_w [rz.]'] } });
    });
  });
  test(`RD-12 liczność: wykonano ${wektory.length} z 3 wektorów trybu (pusty zbiór = porażka)`, () => {
    expect(wektory.map((w) => w.id)).toEqual(['RD-12-W7', 'RD-12-W8', 'RD-12-W9']);
    licznik.wynik(wektory.length);
  });
});

describe('BR-LIC-012 wartoscWyswietlana w trybie „skończone rzędy”', () => {
  test('BR-LIC-012 tryb „skończone”: licznik 12 → skończone 12, dziergany 13 (duża liczba = skończone, design-spec „Now knitting row N”)', () => {
    expect(wartoscWyswietlana(12, 'skonczone')).toEqual({ skonczone: 12, dziergany: 13 });
  });
});
