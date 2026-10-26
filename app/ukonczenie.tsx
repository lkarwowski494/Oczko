// Trasa „/ukonczenie?projekt=…”: karta ukończenia (U-9, BR-PRJ-015). „Done” → prośba o ocenę przez bramkę (P-160), potem lista projektów.
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ukonczenie, type StanUkonczenia } from '../src/ekrany/Ukonczenie';
import { useKolory } from '../src/ekrany/motyw';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { oglos, portOceny, systemAplikacji } from '../src/kompozycja/system';
import { stanUkonczenia } from '../src/kompozycja/ukonczenie';
import { prosbaPoUkonczeniu } from '../src/przypadki-uzycia/ocena';
import { kartaUkonczenia } from '../src/przypadki-uzycia/widok-ukonczenia';
import { zapiszZuzycie } from '../src/przypadki-uzycia/zapas';
import { formatujLiczbe, parsujLiczbe } from '../src/i18n/format';

export default function EkranUkonczenia(): React.ReactElement {
  const { kontener } = useAplikacja();
  const { projekt } = useLocalSearchParams<{ projekt: string }>();
  const router = useRouter();
  const k = useKolory();
  const [stan, ustaw] = useState<StanUkonczenia | null>(null);
  const [blad, ustawBlad] = useState(false);
  const jezyk = kontener.j.jezyk();
  useEffect(() => {
    void kartaUkonczenia(kontener.z, { projektId: projekt }).then((w) => {
      const ch = kontener.z.zegar.teraz();
      if (w.ok) ustaw(stanUkonczenia(w.wartosc, { j: kontener.j, terazMs: ch.ms, strefa: ch.strefa, zdjecie: (sha) => kontener.z.magazyn.sciezka(sha) }));
    });
  }, [kontener, projekt]);
  if (!stan) return <View style={{ flex: 1, backgroundColor: k.arkusz }} />;
  return (
    <Ukonczenie stan={{ ...stan, bladZapisu: blad }} t={kontener.j.t} oglos={oglos} system={systemAplikacji}
      liczby={{ formatuj: (n) => formatujLiczbe(n, jezyk, { maks: 2 }), parsuj: (x) => parsujLiczbe(x, jezyk) }}
      naUdostepnij={() => undefined /* obraz karty do udostępnienia (F-53, D4): po 04 fix-6 */}
      naGotowe={(zuzycie) => void (async () => {
        // F-37: zapis zużycia przed zamknięciem; nieudany — komunikat, karta zostaje (dane bez zmian, transakcja wycofana).
        if (zuzycie.length > 0 && !(await zapiszZuzycie(kontener.z, { projektId: projekt, zuzycie })).ok) { ustawBlad(true); return; }
        void prosbaPoUkonczeniu(kontener.z, portOceny);
        router.dismissTo('/projekty');
      })()} />
  );
}
