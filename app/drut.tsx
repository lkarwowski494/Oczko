// Trasa „/drut?id=…”: arkusz drutu albo szydełka (P-191 P8a; BR-ZAP-003). Bez id — nowe narzędzie.
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FormularzDrutu, type DaneDrutu } from '../src/ekrany/Zapas';
import { useKolory } from '../src/ekrany/motyw';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { bazowa, podgladRozmiaru } from '../src/kompozycja/zapas';
import { formatujLiczbe } from '../src/i18n/format';
import { narzedzia, zapiszNarzedzie } from '../src/przypadki-uzycia/zapas';

export default function EkranDrutu(): React.ReactElement {
  const { kontener } = useAplikacja();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const k = useKolory();
  const j = kontener.j;
  const [poczatek, ustaw] = useState<DaneDrutu | null | undefined>(id ? undefined : null);
  useEffect(() => {
    if (!id) return;
    void narzedzia(kontener.z).then((w) => { const n = w.ok ? w.wartosc.find((x) => x.id === id) : undefined; if (n) ustaw(n); else router.back(); });
  }, [kontener, id, router]);
  if (poczatek === undefined) return <View style={{ flex: 1, backgroundColor: k.arkusz }} />;
  return (
    <FormularzDrutu t={j.t} poczatek={poczatek} podglad={(x, r) => podgladRozmiaru(x, r, j)} parsuj={(x) => bazowa(x, 'm', j.jezyk())}
      formatuj={(n) => formatujLiczbe(n, j.jezyk(), { maks: 2 })} naAnuluj={() => router.back()}
      naZapisz={async (d) => {
        const w = await zapiszNarzedzie(kontener.z, { ...d, id });
        if (!w.ok) return { ok: false, powod: w.powod === 'bledne_dane' ? 'bledne_dane' : 'zapis' };
        router.back();
        return { ok: true, wartosc: undefined };
      }} />
  );
}
