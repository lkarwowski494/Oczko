// Korzeń nawigacji expo-router (P-114 Q1a, jak Trening; wiersz w ADR-0016): kontener zależności raz na proces, potem stos ekranów bez paska
// systemowego (pasek rysuje ekran według design-spec). Do kontenera nic nie jest pokazywane poza tłem papieru — pierwszy ekran to licznik (NFR-PIE-001).
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import type { Wynik } from '../src/domena/bledy';
import { DostawcaAplikacji, type Aplikacja } from '../src/kompozycja/Kontekst';
import { utworzKontener } from '../src/kompozycja/kontener';
import { kompozycjaLicznika } from '../src/kompozycja/licznik';
import { useKolory } from '../src/ekrany/motyw';

export default function Korzen(): React.ReactElement {
  const k = useKolory();
  const [a, ustaw] = useState<Wynik<Aplikacja> | null>(null);
  useEffect(() => {
    void utworzKontener().then(
      (w) => ustaw(w.ok ? { ok: true, wartosc: { kontener: w.wartosc, licznik: kompozycjaLicznika(w.wartosc.z, w.wartosc.j) } } : w),
      () => ustaw({ ok: false, powod: 'zapis' }),
    );
  }, []);
  // Błąd otwarcia danych: ekran awaryjny ADR-0019 (krok 3C, `tryb-awaryjny`); do tego czasu samo tło — bez zastępczej bazy w pamięci.
  if (!a || !a.ok) return <View style={{ flex: 1, backgroundColor: k.papier }} testID={a ? 'tryb-awaryjny' : undefined} />;
  return (
    <DostawcaAplikacji wartosc={a.wartosc}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: k.papier } }} />
    </DostawcaAplikacji>
  );
}
