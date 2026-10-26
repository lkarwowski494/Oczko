// Kreski sesji (element firmowy, design-spec „Element firmowy”): rzędy posiedzenia w piątkach — cztery pionowe, piąta przekreśla; najwyżej 25
// widocznych, liczba zawsze w podpisie nad kreskami. Rysowane z widoków (bez biblioteki SVG — decyzja 08, ADR-0016 „Nawigacja i SVG”).
// Grafika ukryta przed VoiceOver: dane niesie podpis.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { odstep } from './motyw';

export const KRESKI_MAKS = 25; // design-spec „Element firmowy”: najwyżej 25 widocznych
const WYSOKOSC = 28, GRUBOSC = 2, ROZSTAW = 6;

export function Kreski({ n, kolor }: { n: number; kolor: string }): React.ReactElement {
  const widoczne = Math.max(0, Math.min(n, KRESKI_MAKS));
  const piatki = Array.from({ length: Math.ceil(widoczne / 5) }, (_, i) => Math.min(5, widoczne - i * 5));
  return (
    <View style={st.wiersz} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" testID="kreski-sesji">
      {piatki.map((ile, i) => (
        <View key={i} style={st.piatka}>
          {Array.from({ length: Math.min(ile, 4) }, (_, j) => <View key={j} style={[st.kreska, { backgroundColor: kolor, left: j * ROZSTAW }]} />)}
          {ile === 5 && <View style={[st.kreska, st.przekreslenie, { backgroundColor: kolor }]} />}
        </View>
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  wiersz: { flexDirection: 'row', flexWrap: 'wrap', gap: odstep.m, minHeight: WYSOKOSC },
  piatka: { width: 4 * ROZSTAW, height: WYSOKOSC },
  kreska: { position: 'absolute', top: 0, width: GRUBOSC, height: WYSOKOSC, borderRadius: GRUBOSC / 2 },
  przekreslenie: { left: 2 * ROZSTAW - GRUBOSC / 2, transform: [{ rotate: '-60deg' }], height: WYSOKOSC * 1.2, top: -WYSOKOSC * 0.1 },
});
