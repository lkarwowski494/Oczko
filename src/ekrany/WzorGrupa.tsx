// Grupa wzorów na ekranie projektu i dodanie wzoru (design-spec „Gdzie jest wzór” W8, „Dodanie wzoru” W7a, „Stany importu” W11; P-220 W9b).
// Każde dodanie tworzy nowy wzór — stron do istniejącego się nie dokłada (P-218 (1), Q6a). Film to odnośnik poza wzorem (P-218 (4)) — slot `film`.
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { adresStrony } from '../domena/adres';
import { Arkusz, Komunikat, Pole, Przycisk, Tresc } from './Arkusz';
import { cel as rozmiary, odstep, promien, typografia, useKolory, type Kolory } from './motyw';
import type { Tlumacz } from './wspolne';

export type ZrodloDodaniaEkranu = 'plik' | 'skan' | 'zdjecia' | 'link';
export type PropsGrupyWzorow = {
  wzory: { wzorId: string; nazwa: string; opis: string }[];        // opis: `wzor.wiersz_opis`
  oczekujace: { id: string; nazwa: string; stan: 'import' | 'siec' }[];
  skaner: boolean;                                                  // VNDocumentCameraViewController.isSupported
  t: Tlumacz;
  naOtworz(wzorId: string): void;
  naDodaj(z: ZrodloDodaniaEkranu): void;
  naUsunOczekujacy(id: string): void;
  film?: React.ReactNode;                                           // wiersz „Video” albo „Add video link” (S4)
  panelE2e?: React.ReactNode;                                       // build E2E: pliki testowe (tryb-e2e.ts, P-238)
};

export function GrupaWzorow(p: PropsGrupyWzorow): React.ReactElement {
  const { t } = p;
  const st = style(useKolory());
  const [menu, ustawMenu] = useState(false);
  const pozycja = (tekst: string, z: ZrodloDodaniaEkranu) => (
    <Pressable key={z} accessibilityRole="menuitem" accessibilityLabel={tekst} onPress={() => { ustawMenu(false); p.naDodaj(z); }} style={st.pozycja}>
      <Text style={st.tekst}>{tekst}</Text>
    </Pressable>
  );
  return (
    <View testID="projekt-wzory">
      <Text style={st.naglowek} accessibilityRole="header">{t(p.wzory.length >= 2 ? 'projekt.wzory' : 'projekt.wzor')}</Text>
      <View style={st.grupa}>
        {p.wzory.map((w) => (
          <Pressable key={w.wzorId} accessibilityRole="button" accessibilityLabel={`${w.nazwa}, ${w.opis}`} onPress={() => p.naOtworz(w.wzorId)} style={st.wiersz} testID="projekt-wzor">
            <Text style={st.tekst}>{w.nazwa}</Text>
            <Text style={st.podpis}>{w.opis}</Text>
          </Pressable>
        ))}
        {p.oczekujace.map((o) => (
          <View key={o.id} style={[st.wiersz, st.wierszPoziomy]} accessibilityRole={o.stan === 'import' ? 'progressbar' : undefined} testID={o.stan === 'siec' ? 'wzor-czeka-siec' : undefined}>
            <View style={st.rosnie}>
              <Text style={st.tekst}>{o.nazwa}</Text>
              <Text style={st.podpis}>{t(o.stan === 'siec' ? 'wzor.czeka_siec' : 'wzor.import_w_toku')}</Text>
            </View>
            {o.stan === 'siec' && (
              <Pressable accessibilityRole="button" accessibilityLabel={t('wzor.usun_oczekujacy_a11y', { nazwa: o.nazwa })} onPress={() => p.naUsunOczekujacy(o.id)} style={st.ikona}>
                <Text style={st.tekst} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>✕</Text>
              </Pressable>
            )}
          </View>
        ))}
        {p.film}
        <Pressable accessibilityRole="button" accessibilityLabel={t('wzor.dodaj')} onPress={() => ustawMenu(!menu)} style={st.wiersz} testID="wzor-dodaj">
          <Text style={[st.tekst, st.akcja]}>{t('wzor.dodaj')}</Text>
          {p.wzory.length === 0 && <Text style={st.podpis}>{t('wzor.dodaj_opis')}</Text>}
        </Pressable>
        {menu && (
          <View accessibilityRole="menu" style={st.menu}>
            {pozycja(t('wzor.z_pliku'), 'plik')}
            {p.skaner && pozycja(t('wzor.skanuj'), 'skan')}
            {pozycja(t('wzor.ze_zdjec'), 'zdjecia')}
            {pozycja(t('wzor.link_strony'), 'link')}
            {p.panelE2e}
          </View>
        )}
      </View>
    </View>
  );
}

/** Arkusz „Web page” (W7a): pole adresu, „Paste”, „Save page”; zły adres → `wzor.link_blad` pod polem. */
export function ArkuszLinku(p: { t: Tlumacz; naZapisz(adres: string): void; naAnuluj(): void; naWklej(): Promise<string | null> }): React.ReactElement {
  const { t } = p;
  const [adres, ustawAdres] = useState('');
  const [blad, ustawBlad] = useState(false);
  const zapisz = () => { const a = adresStrony(adres); if (a) p.naZapisz(a); else ustawBlad(true); };
  return (
    <Arkusz tytul={t('wzor.link_tytul')} przyciski={<>
      <Przycisk tekst={t('wzor.zapisz_strone')} rodzaj="glowny" onPress={zapisz} />
      <Przycisk tekst={t('wspolne.anuluj')} rodzaj="tekstowy" onPress={p.naAnuluj} />
    </>}>
      <Pole etykieta={t('wzor.link_pole')} wartosc={adres} naZmiane={(x) => { ustawAdres(x); ustawBlad(false); }} testID="wzor-link-pole" naKoniec={zapisz} />
      {blad && <Komunikat tekst={t('wzor.link_blad')} />}
      <Przycisk tekst={t('wzor.wklej')} rodzaj="tekstowy" onPress={() => void p.naWklej().then((x) => { if (x) { ustawAdres(x); ustawBlad(false); } })} />
      <Tresc podpis>{t('wzor.link_opis')}</Tresc>
    </Arkusz>
  );
}

function style(k: Kolory) {
  return StyleSheet.create({
    naglowek: { ...typografia.podpis, color: k.olowek, textTransform: 'uppercase', marginTop: odstep.l, marginBottom: odstep.s },
    grupa: { borderRadius: promien.grupa, backgroundColor: k.papierGrupa, overflow: 'hidden' },
    wiersz: { minHeight: rozmiary.minimum, justifyContent: 'center', paddingHorizontal: odstep.l, paddingVertical: odstep.s, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: k.linia },
    wierszPoziomy: { flexDirection: 'row', alignItems: 'center', gap: odstep.s },
    rosnie: { flex: 1 },
    ikona: { minWidth: rozmiary.minimum, minHeight: rozmiary.minimum, alignItems: 'center', justifyContent: 'center' },
    tekst: { ...typografia.tresc, color: k.grafit },
    akcja: { fontWeight: '600' },
    podpis: { ...typografia.podpis, color: k.olowek },
    menu: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: k.linia, backgroundColor: k.arkusz },
    pozycja: { minHeight: rozmiary.minimum, justifyContent: 'center', paddingHorizontal: odstep.l, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: k.linia },
  });
}
