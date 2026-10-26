// Trasa „/wloczka?id=…”: arkusz włóczki (P-191 P8a; BR-ZAP-001). Bez id — nowa włóczka; zapis przez kolejkę przypadków użycia, potem powrót.
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FormularzWloczki } from '../src/ekrany/Zapas';
import { useKolory } from '../src/ekrany/motyw';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { imperialny } from '../src/kompozycja/miary';
import { bazowa, przeliczenie } from '../src/kompozycja/zapas';
import { formatujLiczbe } from '../src/i18n/format';
import { wloczka, zapiszWloczke, type FormularzWloczki as Dane } from '../src/przypadki-uzycia/zapas';

export default function EkranWloczki(): React.ReactElement {
  const { kontener } = useAplikacja();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const k = useKolory();
  const j = kontener.j;
  const [poczatek, ustaw] = useState<Dane | null | undefined>(id ? undefined : null);
  useEffect(() => {
    if (!id) return;
    void wloczka(kontener.z, id).then((w) => { if (w.ok) ustaw(w.wartosc); else router.back(); });
  }, [kontener, id, router]);
  if (poczatek === undefined) return <View style={{ flex: 1, backgroundColor: k.arkusz }} />;
  return (
    <FormularzWloczki t={j.t} poczatek={poczatek} jednostki={imperialny() ? 'imperialne' : 'metryczne'}
      przelicz={(x, u) => przeliczenie(x, u, j)} bazowa={(x, u) => bazowa(x, u, j.jezyk())} formatuj={(n) => formatujLiczbe(n, j.jezyk(), { maks: 2 })}
      naAnuluj={() => router.back()}
      naZapisz={async (d) => {
        const w = await zapiszWloczke(kontener.z, { ...d, id });
        if (!w.ok) return { ok: false, powod: w.powod === 'bledne_dane' ? 'bledne_dane' : 'zapis' };
        router.back();
        return { ok: true, wartosc: undefined };
      }} />
  );
}
