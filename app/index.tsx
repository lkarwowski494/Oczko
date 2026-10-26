// Trasa „/”: ekran licznika (pierwszy ekran, NFR-PIE-001; powrót do miejsca F-49). Gdy zapamiętane miejsce jest w koszu, lista projektów (moduly.md:238).
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Aplikacja } from '../src/ekrany/Aplikacja';
import { useKolory } from '../src/ekrany/motyw';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { Bezpieczny } from '../src/kompozycja/Bezpieczny';
import { cyklAplikacji, oglos, systemAplikacji } from '../src/kompozycja/system';
import { nastepnaCzesc } from '../src/przypadki-uzycia/czesc';
import { pokazacOknoUczciweZasady } from '../src/przypadki-uzycia/informacje-pro';
import { EkranAwaryjny } from '../src/kompozycja/EkranAwaryjny';
import { powodAwaryjny, zapiszKamien } from '../src/kompozycja/start-aplikacji';

export default function EkranLicznika(): React.ReactElement {
  const { kontener, licznik } = useAplikacja();
  const router = useRouter();
  const k = useKolory();
  const [gotowe, ustawGotowe] = useState(false);
  const [awaria, ustawAwarie] = useState<'wersja_nowsza' | 'uszkodzony' | null>(null);
  const [wersja, ustawWersje] = useState(licznik.wersja());
  useEffect(() => {
    let zywy = true;
    void licznik.przygotuj().then((w) => {
      if (!zywy) return;
      if (!w.ok) { ustawAwarie(powodAwaryjny(w.powod)); return; } // migracja albo baza: ekran awaryjny, nic po cichu (ADR-0019)
      ustawGotowe(true);
      void zapiszKamien(); // ADR-0019: baza otwarta, migracje zakończone, pierwszy ekran zaraz wyrenderowany
      if (w.ok && w.wartosc.cel === 'lista') router.push('/projekty');
      // P-089 (3a): raz, przy otwarciu aplikacji po minionym dniu z robótką (scenariusz 07), w pewnym stanie darmowym.
      void pokazacOknoUczciweZasady(kontener.z, { poziom: kontener.dostep.stan().poziom, ekran: 'start' }).then((o) => {
        if (zywy && o.ok && o.wartosc) router.push('/uczciwe-zasady');
      });
    });
    return () => { zywy = false; };
  }, [licznik, router, kontener]);
  useFocusEffect(useCallback(() => { ustawWersje(licznik.wersja()); }, [licznik]));
  // „Next part” (BR-LIC-011/S1, P-182 Q4a): następna część → jej licznik (ekran od nowa); ostatnia → arkusz „What’s next?”.
  async function naNastepnaCzesc(): Promise<void> {
    const id = licznik.biezacy();
    if (!id) return;
    const r = await nastepnaCzesc(kontener.z, { licznikId: id });
    if (!r.ok) return;
    if (r.wartosc.rodzaj === 'licznik') { await licznik.otworz(r.wartosc.licznikId); ustawWersje(licznik.wersja()); return; }
    router.push({ pathname: '/formularz/[rodzaj]', params: { rodzaj: 'co-dalej', czesc: r.wartosc.czescId } });
  }
  if (awaria) return <Bezpieczny><EkranAwaryjny powod={awaria} t={kontener.j.t} naNormalnie={() => router.replace('/')} /></Bezpieczny>;
  if (!gotowe) return <View style={{ flex: 1, backgroundColor: k.papier }} />;
  return (
    <Bezpieczny>
      <Aplikacja
        key={wersja}
        porty={kontener.porty}
        uslugi={licznik.uslugi}
        cykl={cyklAplikacji}
        system={systemAplikacji}
        oglos={oglos}
        t={kontener.j.t}
        dzialania={{ ...licznik.dzialania, naProjekty: () => router.push('/projekty'), naHistorie: () => router.push('/historia'), naMenu: () => router.push('/menu'), naOferty: () => router.push('/oferty'),
          naProjekt: () => void licznik.widok().then((w) => { if (w) router.push({ pathname: '/projekt/[id]', params: { id: w.projektId } }); }),
          naNastepnaCzesc: () => void naNastepnaCzesc() }}
      />
    </Bezpieczny>
  );
}
