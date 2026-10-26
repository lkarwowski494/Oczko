// Trasa „/historia”: arkusz historii bieżącego licznika (F-02, BR-LIC-003); „Undo” cofa tylko ostatnią zmianę (P-091 (3a)).
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Historia, type WpisHistorii } from '../src/ekrany/Historia';
import { formatujGodzine } from '../src/i18n/format';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { cofnijOstatnie } from '../src/przypadki-uzycia/licznik';
import { historiaLicznika } from '../src/przypadki-uzycia/widok-licznika';

const OPIS = { zerowanie: 'historia.opis_zerowanie', wpisanie: 'historia.opis_wpisanie', cofniecie: 'historia.opis_cofniecie' } as const;

export default function EkranHistorii(): React.ReactElement {
  const { kontener, licznik } = useAplikacja();
  const router = useRouter();
  const { t, jezyk, zegar24h } = kontener.j;
  const [wpisy, ustaw] = useState<WpisHistorii[]>([]);
  const [licznikId, ustawId] = useState<string | null>(null);
  const wczytaj = useCallback(async () => {
    const w = await licznik.widok();
    ustawId(w?.licznikId ?? null);
    if (!w) { ustaw([]); return; }
    const h = await historiaLicznika(kontener.z, { licznikId: w.licznikId });
    const strefa = kontener.z.zegar.teraz().strefa;
    if (h.ok) ustaw(h.wartosc.map((x) => ({
      id: x.id, z: x.z, na: x.na, godzina: formatujGodzine(new Date(x.czasMs), jezyk(), { uses24h: zegar24h(), strefa }),
      opis: x.rodzaj in OPIS ? t(OPIS[x.rodzaj as keyof typeof OPIS]) : null,
    })));
  }, [kontener, licznik, t, jezyk, zegar24h]);
  useEffect(() => { void wczytaj(); }, [wczytaj]);
  return (
    <Historia stan={{ wpisy }} t={t} naZamknij={() => router.back()} naCofnij={async () => {
      if (!licznikId) return;
      const r = await cofnijOstatnie(kontener.z, { licznikId });
      if (r.ok) { await licznik.poZmianie(); await wczytaj(); }
    }} />
  );
}
