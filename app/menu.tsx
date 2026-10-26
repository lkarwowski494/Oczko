// Trasa „/menu”: menu ••• projektu (prototyp.html:129). Formularze otwierają się w miejsce menu; blokada, zerowanie i ukończenie zapisują od razu.
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { MenuProjektu } from '../src/ekrany/MenuProjektu';
import { useKolory } from '../src/ekrany/motyw';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { ustawBlokade, wyzeruj } from '../src/przypadki-uzycia/licznik';
import { zakonczProjekt } from '../src/przypadki-uzycia/projekt';
import type { WidokLicznika } from '../src/przypadki-uzycia/widok-licznika';

export default function EkranMenu(): React.ReactElement {
  const { kontener, licznik } = useAplikacja();
  const router = useRouter();
  const k = useKolory();
  const [w, ustaw] = useState<WidokLicznika | null>(null);
  useEffect(() => { void licznik.widok().then(ustaw); }, [licznik]);
  if (!w) return <View style={{ flex: 1, backgroundColor: k.arkusz }} />;
  const z = kontener.z;
  const poZapisie = async (r: { ok: boolean }) => { if (r.ok) await licznik.poZmianie(); router.back(); };
  const formularz = (rodzaj: string) => router.replace({ pathname: '/formularz/[rodzaj]', params: { rodzaj } });
  return (
    <MenuProjektu
      stan={{ projekt: licznik.nazwaProjektu(w), zablokowany: w.zablokowany, wartosc: w.wartosc }}
      t={kontener.j.t}
      naNazwa={() => formularz('nazwa')} naCel={() => formularz('cel')} naPrzypomnienie={() => formularz('przypomnienie')}
      naPowtorzenie={() => formularz('powtorzenie')} naWpisz={() => formularz('wpisz')}
      naZablokuj={() => void ustawBlokade(z, { licznikId: w.licznikId, zablokowany: true }).then(poZapisie)}
      naOdblokuj={() => void ustawBlokade(z, { licznikId: w.licznikId, zablokowany: false }).then(poZapisie)}
      naZeruj={() => void wyzeruj(z, { licznikId: w.licznikId }).then(poZapisie)}
      naUkoncz={() => void zakonczProjekt(z, { projektId: w.projektId }).then(async (r) => {
        if (!r.ok) return;
        await licznik.poZmianie();
        router.replace({ pathname: '/ukonczenie', params: { projekt: w.projektId } });
      })}
      naZamknij={() => router.back()}
    />
  );
}
