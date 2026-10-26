// Historia licznika (F-02, BR-LIC-003, BR-LIC-017/S6; prototyp.html:128). Arkusz systemowy; „Undo” tylko przy ostatniej zmianie (P-091 (3a)).
// Sygnatura: propozycja 07 (E3), granice zatwierdzone przez 05 (Z07-22). Wpisy przychodzą od najnowszego, godzina sformatowana (format.ts).
import React from 'react';
import { View } from 'react-native';
import { Arkusz, Przycisk, Tresc } from './Arkusz';
import { odstep } from './motyw';
import type { Tlumacz } from './wspolne';

export type WpisHistorii = { id: string; godzina: string; z: number; na: number; opis: string | null }; // godzina sformatowana (format.ts)
export type PropsHistorii = {
  stan: { wpisy: WpisHistorii[] };          // od najnowszego; „Undo” tylko przy ostatniej zmianie (P-091 (3a))
  t: Tlumacz;
  naCofnij(id: string): void;
  naZamknij(): void;
};
export function Historia({ stan, t, naCofnij, naZamknij }: PropsHistorii): React.ReactElement {
  return (
    <Arkusz tytul={t('licznik.historia')} przyciski={<Przycisk tekst={t('wspolne.zamknij')} onPress={naZamknij} rodzaj="tekstowy" testID="arkusz-zamknij" />}>
      <View testID="historia-lista" style={{ gap: odstep.s }}>
        {stan.wpisy.length === 0 && <Tresc>{t('historia.pusto')}</Tresc>}
        {stan.wpisy.slice(0, 50).map((w, i) => (
          <View key={w.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: odstep.s }}>
            <Tresc>{w.opis ? t('historia.wpis_opis', { czas: w.godzina, z: w.z, na: w.na, opis: w.opis }) : t('historia.wpis', { czas: w.godzina, z: w.z, na: w.na })}</Tresc>
            {i === 0 && <Przycisk tekst={t('wspolne.cofnij')} onPress={() => naCofnij(w.id)} testID="historia-cofnij-ostatnia" />}
          </View>
        ))}
      </View>
    </Arkusz>
  );
}
