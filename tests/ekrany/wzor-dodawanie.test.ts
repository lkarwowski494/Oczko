// Stany importu W11 (design-spec „Stany importu”): powód z dodajWzor → alert (tytuł, opis); `anulowano` i strona bez sieci (czeka w skrzynce) bez alertu.
import { alertImportu, nazwaDomyslna } from '../../src/kompozycja/wzor-dodawanie';
import type { Tlumacz } from '../../src/ekrany/wspolne';
import { tEn } from './pomoc';

let t: Tlumacz;
beforeAll(async () => { t = await tEn(); });

test.each([
  ['uszkodzony', 'Oczko can’t open this file', '“a.pdf” may be damaged.'],
  ['bledne_dane', 'Oczko can’t add this type of file', 'Patterns can be PDFs'],
  ['za_duze', 'This file is too large', 'A pattern can be up to 200 MB.'],
  ['odmowa', 'Oczko can’t save this page', 'The page asks you to sign in'],
  ['pusty', 'Oczko can’t save this page', 'The page asks you to sign in'],
] as const)('%s → %s', (powod, tytul, opis) => {
  const a = alertImportu(powod, 'a.pdf', t);
  expect(a?.tytul).toBe(tytul);
  expect(a?.opis).toContain(opis);
});
test('anulowano i brak_sieci → bez alertu; inny powód → błąd zapisu licznika (nic po cichu)', () => {
  expect(alertImportu('anulowano', 'x', t)).toBeNull();
  expect(alertImportu('brak_sieci', 'x', t)).toBeNull();
  expect(alertImportu('zapis', 'x', t)).toEqual({ tytul: 'Couldn’t save that row. It’s still on screen; try again.', opis: '' });
});
test('nazwa domyślna: plik bez rozszerzenia, host strony, „Scan …” / „Photos …” z datą', () => {
  expect(nazwaDomyslna({ rodzaj: 'plik', nazwa: 'Harbor Sweater.PDF' }, t, 'Nov 10')).toBe('Harbor Sweater');
  expect(nazwaDomyslna({ rodzaj: 'adres', adres: 'https://www.example.org/wzory/czapka' }, t, 'Nov 10')).toBe('www.example.org');
  expect(nazwaDomyslna({ rodzaj: 'skan' }, t, 'Nov 10')).toBe('Scan Nov 10');
  expect(nazwaDomyslna({ rodzaj: 'zdjecia' }, t, 'Nov 10')).toBe('Photos Nov 10');
});
