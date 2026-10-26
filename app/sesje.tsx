// Trasa „/sesje?projekt=…”: sesje projektu (F-51, BR-PRJ-013; P-191 P4a–P5a). Stuknięcie w zakończoną sesję → arkusz korekty.
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Sesje, type PropsSesji } from '../src/ekrany/Sesje';
import { useKolory } from '../src/ekrany/motyw';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { Bezpieczny } from '../src/kompozycja/Bezpieczny';
import { stanSesji } from '../src/kompozycja/sesje';
import { sesjeProjektu } from '../src/przypadki-uzycia/sesja';

export default function EkranSesji(): React.ReactElement {
  const { kontener } = useAplikacja();
  const { projekt } = useLocalSearchParams<{ projekt: string }>();
  const router = useRouter();
  const k = useKolory();
  const [stan, ustaw] = useState<PropsSesji['stan'] | null>(null);
  useFocusEffect(useCallback(() => {
    void sesjeProjektu(kontener.z, { projektId: projekt }).then((w) => {
      const ch = kontener.z.zegar.teraz();
      if (w.ok) ustaw(stanSesji(w.wartosc, { j: kontener.j, terazMs: ch.ms, strefa: ch.strefa }));
    });
  }, [kontener, projekt]));
  if (!stan) return <View style={{ flex: 1, backgroundColor: k.papier }} />;
  return (
    <Bezpieczny>
      <Sesje stan={stan} t={kontener.j.t} naWstecz={() => router.back()}
        naKorekta={(sesja) => router.push({ pathname: '/sesja-korekta', params: { sesja, projekt } })} />
    </Bezpieczny>
  );
}
