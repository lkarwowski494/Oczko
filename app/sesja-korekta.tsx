// Trasa „/sesja-korekta?sesja=…&projekt=…”: arkusz korekty sesji (F-51, BR-PRJ-013; P-191 P4a–P5a, P-195 Q2a). Save zawsze zdejmuje
// „do sprawdzenia” (korygujSesje), potem ekran blokady i zegarek (P-199 Q3c) i powrót.
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KorektaSesji, type PropsKorektySesji } from '../src/ekrany/Formularze';
import { useKolory } from '../src/ekrany/motyw';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { czasPracy } from '../src/kompozycja/ukonczenie';
import { SESJA_MAKS_H } from '../src/konfiguracja';
import { korygujSesje, sesjeProjektu } from '../src/przypadki-uzycia/sesja';

export default function EkranKorektySesji(): React.ReactElement {
  const { kontener, licznik } = useAplikacja();
  const { sesja, projekt } = useLocalSearchParams<{ sesja: string; projekt: string }>();
  const router = useRouter();
  const k = useKolory();
  const j = kontener.j;
  const [stan, ustaw] = useState<PropsKorektySesji['stan'] | null>(null);
  useEffect(() => {
    void sesjeProjektu(kontener.z, { projektId: projekt }).then((w) => {
      if (!w.ok) return;
      const s = w.wartosc.find((x) => x.id === sesja);
      if (!s || s.koniecMs === null) { router.back(); return; }
      const inne = w.wartosc.filter((x) => x.id !== sesja && x.stan === 'zakonczona').reduce((a, x) => a + x.czasMs, 0);
      ustaw({ startMs: s.startMs, koniecMs: s.koniecMs, terazMs: kontener.z.zegar.teraz().ms, przerwyMs: s.przerwyMs, doSprawdzenia: s.doKorekty ? SESJA_MAKS_H : null, czasInnychMs: inne });
    });
  }, [kontener, sesja, projekt, router]);
  if (!stan) return <View style={{ flex: 1, backgroundColor: k.arkusz }} />;
  const strefa = kontener.z.zegar.teraz().strefa;
  return (
    <KorektaSesji stan={stan} t={j.t} naAnuluj={() => router.back()}
      formatuj={{
        dataGodzina: (ms) => new Intl.DateTimeFormat(j.jezyk(), { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: !j.zegar24h(), timeZone: strefa }).format(new Date(ms)),
        czas: (ms) => czasPracy(Math.max(0, ms), j),
      }}
      naZapisz={async (z) => {
        const w = await korygujSesje(kontener.z, { sesjaId: sesja, startMs: z.startMs, koniecMs: z.koniecMs });
        if (!w.ok) return { ok: false, powod: w.powod === 'bledne_dane' ? 'bledne_dane' : 'zapis' };
        await licznik.poZmianie();
        router.back();
        return { ok: true, wartosc: undefined };
      }} />
  );
}
