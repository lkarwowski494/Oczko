// Trasa „/projekty”: lista projektów (F-50, F-54). Otwarcie projektu zapamiętuje jego pierwszy licznik (F-49) i wraca do licznika.
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ListaProjektow, type StanListyProjektow } from '../src/ekrany/ListaProjektow';
import { useKolory } from '../src/ekrany/motyw';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { Bezpieczny } from '../src/kompozycja/Bezpieczny';
import { stanListy } from '../src/kompozycja/projekty';
import { widokProjektow, type WidokProjektow } from '../src/przypadki-uzycia/widok-projektow';

export default function EkranProjektow(): React.ReactElement {
  const { kontener, licznik } = useAplikacja();
  const router = useRouter();
  const k = useKolory();
  const [widok, ustawWidok] = useState<WidokProjektow | null>(null);
  const [zapytanie, ustawZapytanie] = useState('');
  useFocusEffect(useCallback(() => {
    let zywy = true;
    void widokProjektow(kontener.z).then((w) => { if (zywy && w.ok) ustawWidok(w.wartosc); });
    return () => { zywy = false; };
  }, [kontener]));
  if (!widok) return <View style={{ flex: 1, backgroundColor: k.papier }} />;
  const ch = kontener.z.zegar.teraz();
  const stan: StanListyProjektow = stanListy(widok, { zapytanie, j: kontener.j, terazMs: ch.ms, strefa: ch.strefa });
  const wroc = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <Bezpieczny>
      <ListaProjektow
        stan={stan}
        t={kontener.j.t}
        naSzukaj={ustawZapytanie}
        naOtworz={(id) => {
          const p = [...widok.wToku, ...widok.ukonczone].find((x) => x.id === id);
          if (!p?.licznik) return;
          void licznik.otworz(p.licznik.id).then(wroc);
        }}
        naNowy={() => undefined /* formularz nowego projektu: krok 3B (formularze) */}
        naUstawienia={() => router.push('/ustawienia')}
        naKosz={() => router.push('/kosz')}
      />
    </Bezpieczny>
  );
}
