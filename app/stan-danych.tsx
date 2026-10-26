// Trasa „/stan-danych”: stan danych z Ustawień (F-58, BR-DAN-011) jako arkusz. Pokazuje tylko to, co aplikacja wie: synchronizacja iCloud
// (moduł F-27 jeszcze nie istnieje → „wyłączona”), zapis na telefonie i ostatni kontakt z zegarkiem (S3, P-193: bez liczby zmian —
// kolejka jest po stronie zegarka, ADR-0009; klucz `zegarek_ostatnia_partia_ms`, P-199 Q5a).
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StanDanych } from '../src/ekrany/StanDanych';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { zegarekOstatniaPartiaMs } from '../src/dane/repozytoria/ustawienia';

export default function EkranStanuDanych(): React.ReactElement {
  const { kontener } = useAplikacja();
  const router = useRouter();
  const j = kontener.j;
  const [kontaktMs, ustawKontakt] = useState<number | null>(null);
  useEffect(() => { void zegarekOstatniaPartiaMs(kontener.z.baza).then(ustawKontakt); }, [kontener]);
  const synchronizacja = kontener.z.synchronizacja ? kontener.z.synchronizacja.stan() : 'wylaczona';
  const strefa = kontener.z.zegar.teraz().strefa;
  const zegarek = kontaktMs === null ? null : {
    ostatniKontakt: new Intl.DateTimeFormat(j.jezyk(), { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: !j.zegar24h(), timeZone: strefa }).format(new Date(kontaktMs)),
  };
  return <StanDanych stan={{ synchronizacja, ostatniaUdana: null, czekaNaSiec: false, zegarek }} t={j.t} naZamknij={() => router.back()} />;
}
