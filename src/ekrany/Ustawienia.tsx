// Ustawienia (BR-ZAK-004, BR-ZAK-006/S5, S7, BR-DAN-012/S3, KP-13, KP-14, F-48). Ekran nienarysowany (design-spec.md:95, Z07-05): lista grupowana
// z komponentów design-spec, etykiety robocze w en.kontekst.json. Sygnatura: propozycja 07 (E3), granice 05 (Z07-22).
// „Rate Oczko” otwiera stronę recenzji (action=write-review), nie systemową prośbę (BR-DAN-012/S3).
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Przycisk } from './Arkusz';
import { cel, odstep, promien, typografia, useKolory } from './motyw';
import type { System, Tlumacz } from './wspolne';
import type { AktywnePro } from './Oferty';
import type { DniNaLiscie } from './ListaProjektow';

export type PropsUstawien = {
  stan: { pro: AktywnePro; dni: DniNaLiscie; wibracje: boolean };
  t: Tlumacz;
  system: System;
  adresy: { polityka: string; recenzja: string };  // recenzja: strona App Store z action=write-review (BR-DAN-012/S3)
  naOferty(): void;                                 // drugie miejsce wejścia do ofert (KP-13)
  naWibracje(wlaczone: boolean): void;
  naZglosProblem(): void;
  naStanDanych(): void;
  /** Dane (BR-DAN-006, BR-DAN-009): kompozycja; bez nich pozycji nie ma. */
  dane?: { naEksport(): void; naImport(): void; naUsunWszystko(): void };
  /** Wynik eksportu albo import w toku (kompozycja), pod grupą danych. */
  wynikDanych?: React.ReactNode;
  /** Panele buildu E2E (e2e/README.md, bez t()); w buildzie wydania null. */
  panelE2e?: React.ReactNode;
  naWstecz?(): void;
};
export function Ustawienia({ stan: s, t, system, adresy, naOferty, naWibracje, naZglosProblem, naStanDanych, dane, wynikDanych, panelE2e, naWstecz }: PropsUstawien): React.ReactElement {
  const k = useKolory();
  const [pytanie, ustawPytanie] = useState(false); // BR-DAN-009: usunięcie dopiero po potwierdzeniu
  const st = StyleSheet.create({
    grupa: { borderRadius: promien.grupa, backgroundColor: k.papierGrupa, padding: odstep.s, gap: odstep.xs },
    podpis: { ...typografia.podpis, color: k.olowek, paddingHorizontal: odstep.m },
    wiersz: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: odstep.m, minHeight: cel.minimum },
  });
  return (
    <ScrollView style={{ flex: 1, backgroundColor: k.papier }} contentContainerStyle={{ padding: odstep.l, gap: odstep.l }} testID="ustawienia">
      {naWstecz && <View style={{ flexDirection: 'row' }}><Przycisk tekst={`‹ ${t('wspolne.wstecz')}`} etykieta={t('wspolne.wstecz')} onPress={naWstecz} rodzaj="tekstowy" testID="nav-wstecz" /></View>}
      {panelE2e /* build E2E: na górze, widoczny bez przewijania (scenariusze 08, 09) */}
      <Text style={{ ...typografia.tytul, color: k.grafit }} accessibilityRole="header">{t('ustawienia.tytul')}</Text>
      <View style={st.grupa}>
        <Przycisk tekst={t('ustawienia.oczko_pro')} onPress={naOferty} rodzaj="tekstowy" testID="ustawienia-oczko-pro" />
        {s.pro?.rodzaj === 'subskrypcja' && <Przycisk tekst={t('oferty.zarzadzaj')} onPress={() => system.zarzadzajSubskrypcja()} rodzaj="tekstowy" />}
        {s.dni && <Text style={st.podpis} testID="ustawienia-dni-darmowe">{t('projekty.dni', { zostalo: s.dni.zostalo, limit: s.dni.limit, miesiac: s.dni.miesiac })}</Text>}
      </View>
      <View style={st.grupa}>
        <View style={st.wiersz}>
          <Text style={{ ...typografia.tresc, color: k.grafit }} importantForAccessibility="no" accessibilityElementsHidden>{t('ustawienia.wibracje')}</Text>
          <Switch accessibilityRole="switch" accessibilityLabel={t('ustawienia.wibracje')} value={s.wibracje} onValueChange={naWibracje} />
        </View>
      </View>
      {dane && (
        <View style={st.grupa}>
          <Przycisk tekst={t('ustawienia.eksport')} onPress={dane.naEksport} rodzaj="tekstowy" testID="ustawienia-eksport" />
          <Przycisk tekst={t('ustawienia.import')} onPress={dane.naImport} rodzaj="tekstowy" testID="ustawienia-import" />
          <Przycisk tekst={t('ustawienia.usun_wszystko')} onPress={() => ustawPytanie(true)} rodzaj="tekstowy" testID="ustawienia-usun-wszystko" />
          {pytanie && (
            <View accessibilityRole="alert" style={{ gap: odstep.s, padding: odstep.m }}>
              <Text style={{ ...typografia.tresc, color: k.grafit }}>{t('ustawienia.usun_pytanie')}</Text>
              <Przycisk tekst={t('ustawienia.usun_potwierdz')} onPress={() => { ustawPytanie(false); dane.naUsunWszystko(); }} rodzaj="glowny" testID="potwierdz-usun-wszystko" />
              <Przycisk tekst={t('wspolne.anuluj')} onPress={() => ustawPytanie(false)} rodzaj="tekstowy" />
            </View>
          )}
        </View>
      )}
      {wynikDanych}
      <View style={st.grupa}>
        <Przycisk tekst={t('ustawienia.stan_danych')} onPress={naStanDanych} rodzaj="tekstowy" />
        <Przycisk tekst={t('ustawienia.zglos')} onPress={naZglosProblem} rodzaj="tekstowy" />
        <Przycisk tekst={t('ustawienia.ocen')} onPress={() => system.otworzAdres(adresy.recenzja)} rodzaj="tekstowy" />
        <Przycisk tekst={t('ustawienia.polityka')} onPress={() => system.otworzAdres(adresy.polityka)} rodzaj="tekstowy" rola="link" />
      </View>
    </ScrollView>
  );
}
