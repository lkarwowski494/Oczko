// Przegląd 2026-10-26 (realny): kreska zapisana przy zamykaniu ekranu wzoru trafia do pliku w katalogu oczekujących, a zdarzenie nie ma odbiorcy.
// Przy następnym otwarciu wzoru JS odzyskuje takie pliki (nazwa: <wzorId>__<strona>__<uuid>.pkdrawing) i zapisuje je zapiszRysunek; obce pliki zostają.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { odzyskajRysunki } from '../../src/przypadki-uzycia/wzor-widok';
import { plik, projekt, wzor } from './pomocnicze/dane-wejsciowe';
import { jeden, przygotuj, sha256, wlozPlik, wykonaj } from './pomocnicze/srodowisko';

test('pliki oczekujące → rysunki stron we właściwych wzorach; pliki usunięte; obce i uszkodzone nazwy zostają', async () => {
  const s = await przygotuj();
  const h = wlozPlik(s.magazyn, Buffer.from('%PDF-1.4\n%%EOF\n'), 'pdf');
  await wykonaj(s.baza, [projekt('p1', 'Harbor'), plik(h, 'pdf', 15), wzor('w1', 'p1', h), wzor('w2', 'p1', h)]);
  const k = join(s.katalog, 'tmp', 'rysunki');
  mkdirSync(k, { recursive: true });
  writeFileSync(join(k, 'w1__0__a.pkdrawing'), 'r-w1-0');
  writeFileSync(join(k, 'w2__3__b.pkdrawing'), 'r-w2-3');
  writeFileSync(join(k, 'inny.txt'), 'x');
  expect(await odzyskajRysunki(s.z, { katalog: k })).toEqual({ ok: true, wartosc: 2 });
  expect(await jeden(s.baza, "SELECT plik_sha256 FROM rysunek WHERE wzor_id = 'w1' AND strona = 0")).toEqual({ plik_sha256: sha256('r-w1-0') });
  expect(await jeden(s.baza, "SELECT plik_sha256 FROM rysunek WHERE wzor_id = 'w2' AND strona = 3")).toEqual({ plik_sha256: sha256('r-w2-3') });
  expect([existsSync(join(k, 'w1__0__a.pkdrawing')), existsSync(join(k, 'inny.txt'))]).toEqual([false, true]);
  expect(await odzyskajRysunki(s.z, { katalog: join(s.katalog, 'nie-ma') })).toEqual({ ok: true, wartosc: 0 });
});
