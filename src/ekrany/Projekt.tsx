// Przegląd projektu: liczniki, notatka, miejsce we wzorze, postęp, części i para (F-18, F-52, F-60; BR-PRJ-005, BR-PRJ-014/S3, BR-DNI-004/S3).
// Ekran nienarysowany (Z07-05): układ z komponentów list systemowych design-spec, teksty robocze 08 do zatwierdzenia przez 04.
// Sygnatura: propozycja 07 (E3), granice zatwierdzone przez 05 (Z07-22). Postęp liczy domena (RD-14), ekran pokazuje.
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { cel, odstep, promien, typografia, useKolory } from './motyw';
import type { Tlumacz } from './wspolne';

export type CzescProjektu = { id: string; nazwa: string; rzedy: number; cel: number | null; paraZ: string | null }; // paraZ: id pierwszej części pary
export type PropsProjektu = {
  stan: {
    nazwa: string;
    czesci: CzescProjektu[];
    notatka: string | null;
    miejsceWzoru: string | null;     // „Page 3, row 48” (sformatowane)
    ostatniaZmiana: string;          // sformatowana data
    postep: { rodzaj: 'procent'; wartosc: number } | { rodzaj: 'brak-celow' };  // RD-14 (RD-14-W6)
  };
  t: Tlumacz;
  naOtworzCzesc(id: string): void;
};
export function Projekt({ stan: s, t, naOtworzCzesc }: PropsProjektu): React.ReactElement {
  const k = useKolory();
  const tekst = { ...typografia.tresc, color: k.grafit };
  const podpis = { ...typografia.podpis, color: k.olowek };
  const wgId = new Map(s.czesci.map((c) => [c.id, c]));
  return (
    <ScrollView style={{ flex: 1, backgroundColor: k.papier }} contentContainerStyle={{ padding: odstep.l, gap: odstep.l }}>
      <Text style={{ ...typografia.tytul, color: k.grafit }} accessibilityRole="header">{s.nazwa}</Text>
      <Text style={podpis}>{s.postep.rodzaj === 'procent' ? t('projekt.postep', { procent: s.postep.wartosc }) : t('projekt.postep_bez_celow')}</Text>
      <View style={[st.grupa, { backgroundColor: k.papierGrupa }]}>
        {s.czesci.map((c) => {
          const para = c.paraZ ? wgId.get(c.paraZ) : undefined;
          return (
            <View key={c.id} style={{ gap: odstep.xs }}>
              <Pressable accessibilityRole="button" onPress={() => naOtworzCzesc(c.id)} style={{ minHeight: cel.minimum, justifyContent: 'center' }}>
                <Text style={{ ...tekst, fontWeight: '700' }}>{c.nazwa}</Text>
                <Text style={podpis}>{c.cel !== null ? t('projekt.czesc_cel', { rzedy: c.rzedy, cel: c.cel }) : t('projekt.czesc_rzedy', { count: c.rzedy })}</Text>
              </Pressable>
              {para && c.cel === null && <Text style={podpis}>{t('projekt.cel_z_pary', { nazwa: para.nazwa })}</Text>}
            </View>
          );
        })}
      </View>
      {s.notatka && (
        <View>
          <Text style={podpis}>{t('licznik.notatka')}</Text>
          <Text style={tekst}>{s.notatka}</Text>
        </View>
      )}
      {s.miejsceWzoru && <Text style={tekst}>{t('projekt.miejsce_wzoru', { miejsce: s.miejsceWzoru })}</Text>}
      <Text style={podpis}>{t('projekt.ostatnia_zmiana', { data: s.ostatniaZmiana })}</Text>
    </ScrollView>
  );
}
const st = StyleSheet.create({ grupa: { borderRadius: promien.grupa, padding: odstep.m, gap: odstep.s } });
