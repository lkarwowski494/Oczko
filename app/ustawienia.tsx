// Trasa „/ustawienia” (BR-ZAK-004, BR-ZAK-006/S5, S7, KP-13, F-48). Dni darmowe z modelu listy projektów (ta sama reguła co licznik).
import React, { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ustawienia } from '../src/ekrany/Ustawienia';
import type { DniNaLiscie } from '../src/ekrany/ListaProjektow';
import { ADRESY } from '../src/kompozycja/adresy';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { stanListy } from '../src/kompozycja/projekty';
import { systemAplikacji } from '../src/kompozycja/system';
import { widokProjektow } from '../src/przypadki-uzycia/widok-projektow';

export default function EkranUstawien(): React.ReactElement {
  const { kontener, preferencje } = useAplikacja();
  const router = useRouter();
  const [dni, ustawDni] = useState<DniNaLiscie>(null);
  const [wibracje, ustawWibracje] = useState(preferencje.stan().wibracje);
  const [dostep, ustawDostep] = useState(kontener.dostep.stan());
  useFocusEffect(useCallback(() => {
    const koniec = kontener.dostep.naZmiane(ustawDostep);
    void widokProjektow(kontener.z).then((w) => {
      const ch = kontener.z.zegar.teraz();
      if (w.ok) ustawDni(stanListy(w.wartosc, { zapytanie: '', j: kontener.j, terazMs: ch.ms, strefa: ch.strefa }).dni);
    });
    return koniec;
  }, [kontener]));
  return (
    <Ustawienia
      stan={{ pro: dostep.aktywne, dni: dostep.pro ? null : dni, wibracje }}
      t={kontener.j.t}
      system={systemAplikacji}
      adresy={{ polityka: ADRESY.polityka, recenzja: ADRESY.recenzja }}
      naOferty={() => router.push('/oferty')}
      naWstecz={() => router.back()}
      naWibracje={(w) => { preferencje.ustaw({ wibracje: w }); ustawWibracje(w); }}
      naZglosProblem={() => undefined /* „Zgłoś problem”: arkusz udostępniania, pakiet sharing (P-036, ADR-0016) — następny krok */}
      naStanDanych={() => undefined /* stan danych (F-58): synchronizacja iCloud poza tą partią */}
    />
  );
}
