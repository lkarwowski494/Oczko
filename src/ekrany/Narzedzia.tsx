// Warstwa „Narzędzia” (P-046): włóczka w zapasie (F-37, BR-ZAP-001), kalkulator (F-38, BR-KAL-003, R-131). Ekrany nienarysowane (Z07-05).
// Sygnatury: propozycja 07 (E3), granice 05 (Z07-22). Pielęgnacja tylko tekstem albo zdjęciem etykiety, bez symboli (OG-13, OP-11).
import React, { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Arkusz, Pole, Przycisk, Tresc, liczbaZPola } from './Arkusz';
import { promien } from './motyw';
import type { Tlumacz } from './wspolne';

export type PropsWloczki = {
  stan: { nazwa: string; pielegnacja: { tekst: string | null; zdjecie: string | null } }; // bez symboli pielęgnacji (OG-13, OP-11)
  t: Tlumacz;
  naZapisz(p: { tekst: string | null; zdjecie: string | null }): void;
};
export function Wloczka({ stan, t }: PropsWloczki): React.ReactElement {
  const p = stan.pielegnacja;
  return (
    <Arkusz tytul={stan.nazwa} przyciski={null}>
      <Tresc podpis>{t('narzedzia.pielegnacja')}</Tresc>
      {p.tekst && <Tresc>{p.tekst}</Tresc>}
      {p.zdjecie && <Image source={{ uri: p.zdjecie }} accessible accessibilityRole="image" accessibilityLabel={t('narzedzia.zdjecie_etykiety', { nazwa: stan.nazwa })} style={st.zdjecie} />}
    </Arkusz>
  );
}

export type PropsKalkulatora = {
  stan: { uklad: 'metryczny' | 'imperialny' };   // z ustawień systemu (P-075 (4a)); jednostka widoczna przy polu (R-131)
  t: Tlumacz;
  naOblicz(w: { oczka: number; dlugosc: number; jednostka: 'cm' | 'in'; cel: number }): void;
};
const liczbaDziesietna = (s: string): number | null => (/^\d+([.,]\d+)?$/.test(s.trim()) ? Number(s.trim().replace(',', '.')) : null);
export function Kalkulator({ stan, t, naOblicz }: PropsKalkulatora): React.ReactElement {
  const cm = stan.uklad === 'metryczny';
  const [oczka, ustawOczka] = useState('');
  const [dlugosc, ustawDlugosc] = useState('');
  const [cel, ustawCel] = useState('');
  const oblicz = () => {
    const o = liczbaZPola(oczka), d = liczbaDziesietna(dlugosc), c = liczbaDziesietna(cel);
    if (o !== null && d !== null && c !== null && d > 0) naOblicz({ oczka: o, dlugosc: d, jednostka: cm ? 'cm' : 'in', cel: c });
  };
  return (
    <Arkusz tytul={t('narzedzia.oblicz')} przyciski={<Przycisk tekst={t('narzedzia.oblicz')} onPress={oblicz} rodzaj="glowny" />}>
      <Pole etykieta={t('narzedzia.kalk_oczka')} wartosc={oczka} naZmiane={ustawOczka} liczbowe />
      <Pole etykieta={t(cm ? 'narzedzia.kalk_dlugosc_cm' : 'narzedzia.kalk_dlugosc_in')} wartosc={dlugosc} naZmiane={ustawDlugosc} liczbowe />
      <Pole etykieta={t('narzedzia.kalk_cel')} wartosc={cel} naZmiane={ustawCel} liczbowe />
    </Arkusz>
  );
}
const st = StyleSheet.create({ zdjecie: { width: '100%', aspectRatio: 4 / 3, borderRadius: promien.grupa } });
