// Linijka celu części na liczniku („Goal 96 rows · 49 to go”, „Next part”; design-spec.md:24, BR-LIC-011/S1) — wydzielona z Licznik.tsx (P-268, plan-prac 1.6).
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { StanEkranuLicznika } from './LicznikTypy';
import type { Style } from './LicznikStyl';
import type { Tlumacz } from './wspolne';

export function LinijkaCelu({ s, t, st, naNastepnaCzesc }: { s: StanEkranuLicznika; t: Tlumacz; st: Style; naNastepnaCzesc(): void }) {
  const c = s.cel ?? 0;
  const zostalo = c - s.skonczone;
  return (
    <View style={st.linijka}>
      <Text style={st.podpis}>{t('licznik.cel', { count: c })}</Text>
      <Text style={st.podpis}>
        {zostalo > 0 ? t('licznik.do_celu', { count: zostalo }) : zostalo === 0 ? t('licznik.cel_osiagniety') : t('licznik.ponad_cel', { count: -zostalo })}
      </Text>
      {zostalo <= 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel={t('licznik.nastepna_czesc')} onPress={naNastepnaCzesc} style={st.drugiPrzycisk} testID="licznik-nastepna-czesc">
          <Text style={[st.tresc, st.pogrubiony]}>{t('licznik.nastepna_czesc')}</Text>
        </Pressable>
      )}
    </View>
  );
}
