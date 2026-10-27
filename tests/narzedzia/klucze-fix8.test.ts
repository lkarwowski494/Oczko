// Łatka kluczy 04 fix-8 (P-275 (1); P-243 S2a, P-209): teksty ostateczne kosza i usunięcia wzoru w en.json i en.kontekst.json.
// Wyrocznia: docs/design/fix8-2026-10-27/klucze.json. Roboczy klucz 08 `usun.wzor_opis` zastąpiony kluczem 04 `wzor.usun_opis` (z {{data}}).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const KORZEN = join(__dirname, '../..');
const czytaj = (p: string): unknown => JSON.parse(readFileSync(join(KORZEN, p), 'utf8'));
const LATKA = czytaj('docs/design/fix8-2026-10-27/klucze.json') as { en: Record<string, string>; kontekst: Record<string, string> };
const EN = czytaj('src/i18n/slowniki/en.json') as Record<string, Record<string, string>>;
const KONTEKST = czytaj('src/i18n/slowniki/en.kontekst.json') as Record<string, Record<string, string>>;
const wartosc = (s: Record<string, Record<string, string>>, klucz: string) => {
  const [sekcja, nazwa] = klucz.split('.');
  return s[sekcja]?.[nazwa];
};

test('każda wartość en z łatki fix-8 jest w en.json bez zmian', () => {
  for (const [k, v] of Object.entries(LATKA.en)) expect([k, wartosc(EN, k)]).toEqual([k, v]);
});

test('każdy wpis kontekstu z łatki fix-8 jest w en.kontekst.json bez zmian', () => {
  for (const [k, v] of Object.entries(LATKA.kontekst)) expect([k, wartosc(KONTEKST, k)]).toEqual([k, v]);
});

test('roboczy klucz usun.wzor_opis usunięty (tekst usunięcia wzoru = wzor.usun_opis z {{data}})', () => {
  expect([wartosc(EN, 'usun.wzor_opis'), wartosc(KONTEKST, 'usun.wzor_opis')]).toEqual([undefined, undefined]);
  expect(wartosc(EN, 'wzor.usun_opis')).toContain('{{data}}');
});
