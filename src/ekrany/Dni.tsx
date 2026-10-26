// Kalendarz dni z robótką i podsumowanie miesiąca (F-59; BR-DNI-001, BR-DNI-003). Ekrany nienarysowane (design-spec.md:95, Z07-05): lista
// dni bez serii i ponagleń (P-043), czas tylko z sesji stopera — bez „0 h” (BR-DNI-003/S2). Sygnatury: propozycja 07 (E3), granice 05 (Z07-22).
import React from 'react';
import { ScrollView, Text } from 'react-native';
import { Przycisk } from './Arkusz';
import { odstep, typografia, useKolory } from './motyw';
import type { Tlumacz } from './wspolne';

export type PropsKalendarza = { stan: { miesiac: string; dni: { data: string; etykieta: string; rzedy: number }[] }; t: Tlumacz; naDzien(data: string): void };
export function Kalendarz({ stan, t, naDzien }: PropsKalendarza): React.ReactElement {
  const k = useKolory();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: k.papier }} contentContainerStyle={{ padding: odstep.l, gap: odstep.s }}>
      <Text style={{ ...typografia.tytul, color: k.grafit }} accessibilityRole="header">{stan.miesiac}</Text>
      {stan.dni.map((d) => <Przycisk key={d.data} tekst={t('dni.dzien', { etykieta: d.etykieta, count: d.rzedy })} onPress={() => naDzien(d.data)} rodzaj="tekstowy" />)}
    </ScrollView>
  );
}

export type PropsPodsumowania = { stan: { okres: string; rzedy: number; ukonczone: string[]; czas: string | null }; t: Tlumacz }; // czas null = brak sesji stopera
export function Podsumowanie({ stan, t }: PropsPodsumowania): React.ReactElement {
  const k = useKolory();
  const tekst = { ...typografia.tresc, color: k.grafit };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: k.papier }} contentContainerStyle={{ padding: odstep.l, gap: odstep.s }}>
      <Text style={{ ...typografia.tytul, color: k.grafit }} accessibilityRole="header">{stan.okres}</Text>
      <Text style={tekst}>{t('dni.rzedy', { count: stan.rzedy })}</Text>
      {stan.ukonczone.length > 0 && <Text style={tekst}>{t('dni.ukonczone', { lista: stan.ukonczone.join(', ') })}</Text>}
      <Text style={{ ...typografia.podpis, color: k.olowek }}>{stan.czas ? t('dni.czas', { czas: stan.czas }) : t('dni.bez_stopera')}</Text>
    </ScrollView>
  );
}
