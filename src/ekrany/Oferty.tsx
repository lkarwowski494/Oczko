// Ekran ofert Oczko Pro (F-35; design-spec.md:56, :68, :77–80; ekrany.html `oferty`; KP-03, KP-04, KP-08, KP-09, KP-14; P-089 (1)).
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07 do zatwierdzenia przez 04 (teksty, stany) i 05 (porty, granice).
// Ceny wyłącznie z `Produkt.cenaWyswietlana` (StoreKit displayPrice); w kodzie i tłumaczeniach żadnej kwoty (KP-09, P-089 (1), R-118).
import type React from 'react';
import type { Produkt } from '../domena/porty';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Tlumacz } from './wspolne';

export type ProduktyOfert = { rodzaj: 'gotowe'; produkty: Produkt[] } | { rodzaj: 'ladowanie' } | { rodzaj: 'brak-sieci' };
export type AktywnePro = { rodzaj: 'subskrypcja'; produkt: string } | { rodzaj: 'dozywotni' } | null;
export type PropsOfert = {
  stan: { produkty: ProduktyOfert; aktywne: AktywnePro; familySharing: boolean };
  t: Tlumacz;
  adresy: { polityka: string; warunki: string };   // z konfiguracji (KP-04); Terms of Use = standardowa EULA Apple
  naKup(produkt: string): void;
  naPrzywroc(): void;                              // tylko po stuknięciu (KP-08)
  naZarzadzaj(): void;                             // showManageSubscriptions (KP-14)
  naOtworzAdres(url: string): void;
  naZamknij(): void;
};
export function Oferty(_p: PropsOfert): React.ReactElement {
  return niezaimplementowane('ekrany/Oferty');
}
