// Trasa „/stan-danych”: stan danych z Ustawień (F-58, BR-DAN-011) jako arkusz. Pokazuje tylko to, co aplikacja wie: synchronizacja iCloud
// (moduł F-27 jeszcze nie istnieje → „wyłączona”) i zapis na telefonie. Zmiany czekające na zegarku: telefon nie zna dziś ich liczby
// (kolejka jest po stronie zegarka, ADR-0009) — zegarek: null do decyzji o źródle tej liczby (pytanie 08 partia 5 do 05/koordynatora).
import React from 'react';
import { useRouter } from 'expo-router';
import { StanDanych } from '../src/ekrany/StanDanych';
import { useAplikacja } from '../src/kompozycja/Kontekst';

export default function EkranStanuDanych(): React.ReactElement {
  const { kontener } = useAplikacja();
  const router = useRouter();
  const synchronizacja = kontener.z.synchronizacja ? kontener.z.synchronizacja.stan() : 'wylaczona';
  return <StanDanych stan={{ synchronizacja, ostatniaUdana: null, czekaNaSiec: false, zegarek: null }} t={kontener.j.t} naZamknij={() => router.back()} />;
}
