// Trasa „/projekty”: lista projektów (F-50, F-54). Otwarcie projektu zapamiętuje jego pierwszy licznik (F-49) i wraca do licznika.
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ListaProjektow, type StanListyProjektow } from '../src/ekrany/ListaProjektow';
import { useKolory } from '../src/ekrany/motyw';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { Bezpieczny } from '../src/kompozycja/Bezpieczny';
import { stanListy } from '../src/kompozycja/projekty';
import { widokProjektow, type WidokProjektow } from '../src/przypadki-uzycia/widok-projektow';
import { ArkuszSkrzynki } from '../src/ekrany/WzorSkrzynka';
import { alertImportu } from '../src/kompozycja/wzor-dodawanie';

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
  // Partia 6 (R2, scenariusz 52): arkusz „N patterns to add” nad listą — zlecenia ze skrzynki bez projektu; nie nad licznikiem (P-046).
  const wz = kontener.wzor.k;
  const [skrzynka, ustawSkrzynke] = useState(wz.stan());
  useEffect(() => wz.naZmiane(() => ustawSkrzynke(wz.stan())), [wz]);
  const blad = skrzynka.bledy[0];
  useEffect(() => { // błąd pozycji skrzynki: alert z przyczyną, po „OK” pozycja znika ze skrzynki (design-spec R2)
    if (!blad) return;
    const t = kontener.j.t;
    const przyczyna = blad.powod === 'uszkodzony' ? t('skrzynka.uszkodzony') : alertImportu(blad.powod, blad.zlecenie.nazwa, t)?.opis ?? '';
    Alert.alert(t('skrzynka.nie_dodano', { plik: blad.zlecenie.nazwa }), przyczyna, [{ text: t('wspolne.ok'), onPress: () => void wz.potwierdzBlad(blad.zlecenie.id) }]);
  }, [blad, kontener, wz]);
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
        naNowy={() => router.push({ pathname: '/formularz/[rodzaj]', params: { rodzaj: 'nowy-projekt' } })}
        naUstawienia={() => router.push('/ustawienia')}
        naHistoria={() => router.push('/dni')}
        naNarzedzia={() => router.push('/narzedzia')}
        naKosz={() => router.push('/kosz')}
      />
      {skrzynka.doWyboru.length > 0 && (
        <ArkuszSkrzynki t={kontener.j.t} pozycje={skrzynka.doWyboru.map((x) => ({ id: x.id, nazwa: x.nazwa }))}
          projekty={stan.wToku.map((p) => ({ id: p.id, nazwa: p.nazwa }))}
          naWybierz={(pid) => void wz.wybierzProjekt(pid).then(async () => { const w = await widokProjektow(kontener.z); if (w.ok) ustawWidok(w.wartosc); })}
          naNieTeraz={() => wz.nieTeraz()} />
      )}
    </Bezpieczny>
  );
}
