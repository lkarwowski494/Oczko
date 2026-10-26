// Trasa „/”: ekran licznika (pierwszy ekran, NFR-PIE-001; powrót do miejsca F-49). Gdy zapamiętane miejsce jest w koszu, lista projektów (moduly.md:238).
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Aplikacja } from '../src/ekrany/Aplikacja';
import { useKolory } from '../src/ekrany/motyw';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { cyklAplikacji, oglos, systemAplikacji } from '../src/kompozycja/system';
import { pokazacOknoUczciweZasady } from '../src/przypadki-uzycia/informacje-pro';

export default function EkranLicznika(): React.ReactElement {
  const { kontener, licznik } = useAplikacja();
  const router = useRouter();
  const k = useKolory();
  const [gotowe, ustawGotowe] = useState(false);
  const [wersja, ustawWersje] = useState(licznik.wersja());
  useEffect(() => {
    let zywy = true;
    void licznik.przygotuj().then((w) => {
      if (!zywy) return;
      ustawGotowe(true);
      if (w.ok && w.wartosc.cel === 'lista') router.push('/projekty');
      // P-089 (3a): raz, przy otwarciu aplikacji po minionym dniu z robótką (scenariusz 07), w pewnym stanie darmowym.
      void pokazacOknoUczciweZasady(kontener.z, { poziom: kontener.dostep.stan().poziom, ekran: 'start' }).then((o) => {
        if (zywy && o.ok && o.wartosc) router.push('/uczciwe-zasady');
      });
    });
    return () => { zywy = false; };
  }, [licznik, router, kontener]);
  useFocusEffect(useCallback(() => { ustawWersje(licznik.wersja()); }, [licznik]));
  if (!gotowe) return <View style={{ flex: 1, backgroundColor: k.papier }} />;
  return (
    <Aplikacja
      key={wersja}
      porty={kontener.porty}
      uslugi={licznik.uslugi}
      cykl={cyklAplikacji}
      system={systemAplikacji}
      oglos={oglos}
      t={kontener.j.t}
      dzialania={{ ...licznik.dzialania, naProjekty: () => router.push('/projekty'), naHistorie: () => router.push('/historia'), naMenu: () => router.push('/menu'), naOferty: () => router.push('/oferty') }}
    />
  );
}
