// Dostęp do Pro z bieżących uprawnień (kontrakt płatności). Wzorzec: docs/monetyzacja/dostep.mjs; wyrocznia: wektory-dostepu.json.
import { niezaimplementowane } from './zaslepka';

export type Uprawnienie = { produkt: string; wygasa: number | null; odebrane: boolean };
export type Odczyt = { zrodlo: 'sklep'; uprawnienia: Uprawnienie[] } | { zrodlo: 'blad' };
export type Pamiec = { produkty: string[]; wygasa: number | null } | null;
export type DecyzjaDostepu = { dostep: boolean; powod: 'sklep' | 'pamiec' | 'brak'; pamiec: Pamiec };

export function decyzja(_o: Odczyt, _p: Pamiec, _teraz: number, _odblokowuja: readonly string[]): DecyzjaDostepu {
  return niezaimplementowane('BR-ZAK-001 decyzja');
}
export function odczytajPamiec(_tekst: unknown): Pamiec {
  return niezaimplementowane('BR-ZAK-001 odczytajPamiec');
}
