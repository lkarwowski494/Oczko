// Trasa „/oferty”: ekran ofert (F-35; KP-13: tylko z komunikatu limitu, z Ustawień i z okna „Uczciwe zasady”). Ceny ze sklepu (KP-09).
// Po zakupie albo przywróceniu: ponowna decyzja dostępu i przeładowanie licznika (limit znika przy Pro). Panel `e2e-sklep-wygas` tylko w buildzie E2E.
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Oferty, type ProduktyOfert } from '../src/ekrany/Oferty';
import { ADRESY, FAMILY_SHARING } from '../src/kompozycja/adresy';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { systemAplikacji } from '../src/kompozycja/system';
import { paneleE2e } from '../src/platforma/tryb-e2e';

export default function EkranOfert(): React.ReactElement {
  const { kontener, licznik } = useAplikacja();
  const router = useRouter();
  const { sklep } = kontener.porty;
  const [produkty, ustawProdukty] = useState<ProduktyOfert>({ rodzaj: 'ladowanie' });
  const [dostep, ustawDostep] = useState(kontener.dostep.stan());
  useEffect(() => kontener.dostep.naZmiane(ustawDostep), [kontener]);
  useEffect(() => {
    void sklep.produkty().then((p) => ustawProdukty(p.length ? { rodzaj: 'gotowe', produkty: p } : { rodzaj: 'brak-sieci' }), () => ustawProdukty({ rodzaj: 'brak-sieci' }));
  }, [sklep]);
  const poZmianie = async () => { await kontener.dostep.odswiez(); await licznik.poZmianie(); };
  const wygas = 'wygas' in sklep && typeof sklep.wygas === 'function' ? (sklep.wygas as () => void) : null;
  return (
    <>
      <Oferty
        stan={{ produkty, aktywne: dostep.aktywne, familySharing: FAMILY_SHARING }}
        t={kontener.j.t}
        adresy={{ polityka: ADRESY.polityka, warunki: ADRESY.warunki }}
        naKup={(id) => void sklep.kup(id).then(poZmianie)}
        naPrzywroc={() => void sklep.przywroc().then(poZmianie)}
        naZarzadzaj={() => systemAplikacji.zarzadzajSubskrypcja()}
        naOtworzAdres={(u) => systemAplikacji.otworzAdres(u)}
        naZamknij={() => router.back()}
      />
      {paneleE2e && wygas && <paneleE2e.PanelSklepu naWygas={() => { wygas(); void poZmianie(); }} /> /* build E2E (P-238) */}
    </>
  );
}
