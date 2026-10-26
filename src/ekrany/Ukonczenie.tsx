// Chwila ukończenia: karta projektu i pytanie o włóczkę (F-19, F-37, F-53; U-9; design-spec.md:57, :66; ekrany.html `ukonczenie`; BR-DAN-012/S1).
// Sygnatura: propozycja 07 (E3), granice zatwierdzone przez 05 (Z07-22). „Done” woła `naGotowe`; prośbę o ocenę decyduje bramka czyProsicOOcene
// w przypadku użycia (moduly.md „Prośba o ocenę”, P-150, P-160) — ekran nie woła wywołania systemowego sam.
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Arkusz, Przycisk, Tresc } from './Arkusz';
import { odstep, promien, typografia, useKolory } from './motyw';
import type { Oglos, System, Tlumacz } from './wspolne';

export type StanUkonczenia = {
  nazwa: string;
  okres: string;               // „Oct 1 – Nov 21” (sformatowane)
  dni: number;                 // dni z robótką
  rzedy: number;
  czas: string | null;         // „18 h 10 min”; null = bez stopera (BR-PRJ-015/S3)
  czesci: number;
  wloczka: { id: string; nazwa: string }[];  // pusta = pytanie pominięte (design-spec.md:57)
  zdjecie: string | null;      // URI
};
export type PropsUkonczenia = {
  stan: StanUkonczenia;
  t: Tlumacz;
  oglos: Oglos;                // „Harbor Sweater moved to Finished.” (design-spec.md:66)
  system: System;              // port systemu (udostępnianie, 3C); prośba o ocenę przez przypadek użycia po `naGotowe` (P-160)
  naWloczka(id: string): void;
  naUdostepnij(): void;
  naGotowe(): void;
};
export function Ukonczenie({ stan: s, t, oglos, naWloczka, naUdostepnij, naGotowe }: PropsUkonczenia): React.ReactElement {
  const k = useKolory();
  useEffect(() => { oglos(t('ukonczenie.ogloszenie', { nazwa: s.nazwa })); }, [s.nazwa]); // raz przy wejściu na kartę
  const podsumowanie = [s.czas, t('ukonczenie.czesci', { count: s.czesci }), t('ukonczenie.dni', { count: s.dni })].filter(Boolean).join(' · ');
  return (
    <Arkusz tytul={s.nazwa} testID="ukonczenie-karta" przyciski={<Przycisk tekst={t('ukonczenie.gotowe')} onPress={naGotowe} rodzaj="glowny" testID="ukonczenie-gotowe" />}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Przycisk tekst="⇪" etykieta={t('ukonczenie.udostepnij')} onPress={naUdostepnij} rodzaj="tekstowy" />
      </View>
      <Tresc podpis>{t('ukonczenie.okres', { okres: s.okres })}</Tresc>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: odstep.s }}>
        <Text style={{ ...typografia.liczba, color: k.grafit }}>{String(s.rzedy)}</Text>
        <Tresc podpis>{t('ukonczenie.jednostka')}</Tresc>
      </View>
      <Tresc podpis>{podsumowanie}</Tresc>
      {s.zdjecie && <Image source={{ uri: s.zdjecie }} accessible accessibilityRole="image" accessibilityLabel={t('ukonczenie.zdjecie', { nazwa: s.nazwa })} style={st.zdjecie} />}
      {s.wloczka.length > 0 && (
        <View style={{ gap: odstep.s }}>
          <Tresc podpis>{t('ukonczenie.wloczka')}</Tresc>
          {s.wloczka.map((w) => <Przycisk key={w.id} tekst={w.nazwa} etykieta={t('ukonczenie.wloczka_wpisz', { nazwa: w.nazwa })} onPress={() => naWloczka(w.id)} />)}
        </View>
      )}
    </Arkusz>
  );
}
const st = StyleSheet.create({ zdjecie: { width: '100%', aspectRatio: 4 / 3, borderRadius: promien.grupa } });
