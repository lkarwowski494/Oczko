// Format archiwum w TS (P-120 Q2a, ADR-0004): SHA-256 kawałkami = node:crypto, ZIP „stored” czytany niezależnym czytnikiem testów 07 (czytajZip),
// zły CRC wykrywany przy wypakowaniu. Test roli 08; wyrocznia: node:crypto i czytnik APPNOTE z tests/dane/pomocnicze.
import { createHash, randomBytes } from 'node:crypto';
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sha256 } from '../../src/dane/archiwum/sha256';
import { czytajKatalog, wypakuj, zapiszZip } from '../../src/dane/archiwum/zip';
import { czytajZip } from './pomocnicze/dane-wejsciowe';
import { katalogTymczasowy } from './pomocnicze/srodowisko';

test('ADR-0004: SHA-256 liczony kawałkami = node:crypto (długości 0, 55, 56, 64, 65, 1 MiB + 3, podział na nierówne kawałki)', () => {
  for (const n of [0, 1, 55, 56, 63, 64, 65, 119, 120, (1 << 20) + 3]) {
    const b = randomBytes(n);
    const s = sha256();
    for (let i = 0; i < n; i += 37) s.dodaj(b.subarray(i, i + 37));
    expect({ n, h: s.wynik() }).toEqual({ n, h: createHash('sha256').update(b).digest('hex') });
  }
});

test('ADR-0004: ZIP z plikiem z dysku i danymi w pamięci → czytnik 07 widzi te same bajty; wypakowanie z CRC; zepsuty bajt → CRC zły', () => {
  const k = katalogTymczasowy();
  const duzy = randomBytes((1 << 20) * 2 + 17);
  writeFileSync(join(k, 'duzy.bin'), duzy);
  const zip = join(k, 'a.oczko');
  zapiszZip(zip, [{ nazwa: 'manifest.json', dane: new TextEncoder().encode('{"format":"oczko"}') }, { nazwa: 'pliki/żółw.bin', plik: join(k, 'duzy.bin') }]);
  const z = czytajZip(zip);
  expect([...z.keys()]).toEqual(['manifest.json', 'pliki/żółw.bin']);
  expect(z.get('pliki/żółw.bin')!.equals(duzy)).toBe(true);
  const kat = czytajKatalog(zip)!;
  expect(wypakuj(zip, kat[1], join(k, 'out.bin'))).toBe(true);
  expect(readFileSync(join(k, 'out.bin')).equals(duzy)).toBe(true);
  const b = readFileSync(zip);
  b[kat[1].danePrzesuniecie + 5] ^= 0xff;
  writeFileSync(zip, b);
  expect(wypakuj(zip, kat[1], join(k, 'out2.bin'))).toBe(false);
  writeFileSync(join(k, 'tekst.oczko'), 'to nie jest archiwum');
  expect(czytajKatalog(join(k, 'tekst.oczko'))).toBeNull();
});
