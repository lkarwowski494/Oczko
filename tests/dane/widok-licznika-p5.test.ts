// BR-LIC-018/S1 na ekranie licznika (partia 5): licznik w części z ≥ 2 licznikami rzędów albo z sekcją → całość części; inaczej null.
// Reguła „≥ 2 liczniki rzędów” = propozycja 04 do N2 (P-183), flaga `sekcja` ma pierwszeństwo; decyzja 05 przy przeglądzie sygnatur.
import { widokLicznika } from '../../src/przypadki-uzycia/widok-licznika';
import { czesc, licznik, projekt } from './pomocnicze/dane-wejsciowe';
import { przygotuj, wykonaj } from './pomocnicze/srodowisko';

test('całość części: 12 + 8 = 20 przy dwóch licznikach rzędów; jeden licznik → null; licznik oczek nie wchodzi', async () => {
  const s = await przygotuj();
  await wykonaj(s.baza, [projekt('p1', 'Koc'), czesc('c1', 'p1', 'Kwadrat'), ...licznik('l1', 'c1', 12), ...licznik('l2', 'c1', 8, { kolejnosc: 2 }),
    ...licznik('l3', 'c1', 30, { kolejnosc: 3, rodzaj: 'oczka' }), czesc('c2', 'p1', 'Brzeg', 2), ...licznik('m1', 'c2', 4)]);
  const w = await widokLicznika(s.z, { licznikId: 'l2' });
  expect(w.ok && w.wartosc.calosc).toBe(20);
  const m = await widokLicznika(s.z, { licznikId: 'm1' });
  expect(m.ok && m.wartosc.calosc).toBeNull();
});
