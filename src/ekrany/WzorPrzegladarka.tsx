// Przeglądarka wzoru (design-spec „Wzór, rysik i iPad”, makiety fix7 `wzor.html`; P-220 W1a, W3, W4b, W5a, W6a, W9b; P-218 (1)–(3)).
// Strona PDF z rysunkami i znacznikiem to widok modułu natywnego `oczko-wzor` (slot `widok`, składa kompozycja); ekran rysuje pasek nawigacji,
// narzędzia, plakietkę strony i pasek licznika (te same testID co licznik). Jeden wzór widoczny naraz; obok wzoru tylko licznik (P-218 (3)).
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Narzedzie } from '../domena/rysik';
import type { Uklad } from '../domena/uklad';
import { cel as rozmiary, MAX_SKALA_LICZBY, odstep, promien, typografia, useKolory, type Kolory } from './motyw';
import type { Tlumacz, WynikEkranu } from './wspolne';

export type StanPrzegladarki = {
  nazwa: string;
  opis: string;                                   // `wzor.wiersz_opis` („PDF · 6 pages”), testID `wzor-zrodlo`
  czesc: string;                                  // część licznika: „‹” wraca do niej (`wzor.wstecz_a11y`)
  wzory: { wzorId: string; nazwa: string }[];     // wzory projektu (W9b); ≥ 2 → tytuł przełącza
  wzorId: string;
  strona: { n: number; razem: number } | null;
  zakreslenia: number;
  narzedzie: Narzedzie;
  word: boolean;                                  // podgląd zastępczy Worda: bez znacznika i rysowania (W11)
  kierunek?: 1 | -1 | null;                       // kierunek rzędów zapisany w znaczniku; null = pierwsze ustawienie pyta (P-126 (3a))
  licznik: { liczba: number; dziergany: number };
  uklad: Uklad;
};
export type PropsPrzegladarki = {
  stan: StanPrzegladarki;
  t: Tlumacz;
  widok: React.ReactNode;
  terminKosza?: string;                           // krótka data końca kosza do opisu usunięcia (P-229)
  naWstecz(): void;
  naPrzelacz(wzorId: string): void;
  naNarzedzie(n: Narzedzie): void;
  naCofnij(): void;
  naZaznaczRzad(kierunek: 1 | -1): void;
  naObroc(): void;
  naUsun(): void;
  potwierdz(tytul: string, opis: string, przycisk: string, f: () => void): void;
  naPlus(): Promise<WynikEkranu<unknown>>;
  naMinus(): Promise<WynikEkranu<unknown>>;
};

export function PrzegladarkaWzoru(p: PropsPrzegladarki): React.ReactElement {
  const { stan: s, t } = p;
  const k = useKolory();
  const st = style(k);
  const [menu, ustawMenu] = useState<'brak' | 'opcje' | 'wzory'>('brak');
  const [blad, ustawBlad] = useState(false);
  const [pytanie, ustawPytanie] = useState(false); // „Which way do rows go on this page?” (3a: bez wartości domyślnej)
  const zaznacz = () => { if (s.kierunek === 1 || s.kierunek === -1) p.naZaznaczRzad(s.kierunek); else ustawPytanie(true); };
  const ipad = s.uklad.klasa === 'regular';
  const tryb = s.narzedzie !== 'brak';
  const obok = s.uklad.wzor === 'obok';

  async function licz(f: () => Promise<WynikEkranu<unknown>>) { ustawBlad(!(await f()).ok); }
  const narzedzie = (n: Narzedzie, klucz: 'wzor.zakreslacz' | 'wzor.pioro' | 'wzor.gumka', id: string, znak: string) => (
    <Pressable key={id} accessibilityRole="button" accessibilityLabel={t(klucz)} accessibilityState={{ selected: s.narzedzie === n }}
      accessibilityValue={n === 'zakreslacz' ? { text: t('wzor.zakreslenia', { count: s.zakreslenia }) } : undefined}
      onPress={() => p.naNarzedzie(s.narzedzie === n && !ipad ? 'brak' : n)} style={[st.ikona, s.narzedzie === n && st.wybrane]} testID={id}>
      <Text style={st.ikonaTekst} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>{znak}</Text>
    </Pressable>
  );
  const cofnij = (
    <Pressable key="cofnij" accessibilityRole="button" accessibilityLabel={t('wzor.cofnij_rysunek')} onPress={p.naCofnij} style={st.ikona} testID="wzor-cofnij-rysunek">
      <Text style={st.ikonaTekst} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>↶</Text>
    </Pressable>
  );

  const pasekNawigacji = !ipad && tryb ? (
    // iPhone i iPad compact w trybie rysowania: pasek nawigacji zamienia się w pasek narzędzi (W5a)
    <View style={st.pasek}>
      <View style={st.grupa}>{narzedzie('zakreslacz', 'wzor.zakreslacz', 'wzor-zakreslacz', '🖍')}{narzedzie('gumka', 'wzor.gumka', 'wzor-gumka', '⌫')}{cofnij}</View>
      <Pressable accessibilityRole="button" accessibilityLabel={t('wspolne.gotowe')} onPress={() => p.naNarzedzie('brak')} style={st.ikona}>
        <Text style={[st.tresc, st.pogrubiony]}>{t('wspolne.gotowe')}</Text>
      </Pressable>
    </View>
  ) : (
    <View style={st.pasek}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('wzor.wstecz_a11y', { czesc: s.czesc })} onPress={p.naWstecz} style={st.ikona} testID="nav-wstecz">
        <Text style={st.ikonaTekst} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>‹</Text>
      </Pressable>
      <View style={st.tytulPaska}>
        {s.wzory.length >= 2 ? (
          <Pressable accessibilityRole="button" accessibilityLabel={t('wzor.przelacz_a11y', { nazwa: s.nazwa })} onPress={() => ustawMenu('wzory')} testID="wzor-przelacz">
            <Text style={st.tytul} numberOfLines={2}>{`${s.nazwa} ▾`}</Text>
          </Pressable>
        ) : <Text style={st.tytul} accessibilityRole="header" numberOfLines={2}>{s.nazwa}</Text>}
        <Text style={st.podpis} testID="wzor-zrodlo">{s.opis}</Text>
      </View>
      <View style={st.grupa}>
        {!s.word && (
          <Pressable accessibilityRole="button" accessibilityLabel={t('wzor.zaznacz_rzad')} onPress={zaznacz} style={st.ikona}>
            <Text style={st.ikonaTekst} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>▭</Text>
          </Pressable>
        )}
        {!s.word && !ipad && narzedzie('zakreslacz', 'wzor.zakreslacz', 'wzor-zakreslacz', '🖍')}
        <Pressable accessibilityRole="button" accessibilityLabel={t('wzor.menu_a11y')} onPress={() => ustawMenu('opcje')} style={st.ikona} testID="wzor-menu">
          <Text style={st.ikonaTekst} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>•••</Text>
        </Pressable>
      </View>
    </View>
  );

  const wzor = (
    <View style={st.wzor}>
      {pasekNawigacji}
      {ipad && !s.word && (
        // iPad (regular): stały pasek narzędzi pod paskiem nawigacji (W5a)
        <View style={st.pasekNarzedzi}>
          {narzedzie('zakreslacz', 'wzor.zakreslacz', 'wzor-zakreslacz', '🖍')}{narzedzie('pioro', 'wzor.pioro', 'wzor-pioro', '✎')}{narzedzie('gumka', 'wzor.gumka', 'wzor-gumka', '⌫')}{cofnij}
        </View>
      )}
      {s.word && <Text style={[st.tresc, st.informacja]} accessibilityRole="text">{t('wzor.word_podglad')}</Text>}
      {pytanie && (
        <View style={st.informacja} accessibilityRole="summary" testID="wzor-kierunek">
          <Text style={st.tresc}>{t('wzor.kierunek_pytanie')}</Text>
          {([[-1, 'wzor.kierunek_gora', 'wzor.kierunek_gora_opis', '↑'], [1, 'wzor.kierunek_dol', 'wzor.kierunek_dol_opis', '↓']] as const).map(([kier, k1, k2, znak]) => (
            <Pressable key={kier} accessibilityRole="button" accessibilityLabel={`${t(k1)}, ${t(k2)}`} onPress={() => { ustawPytanie(false); p.naZaznaczRzad(kier); }} style={st.pozycja}>
              <Text style={st.tresc}>{`${znak} ${t(k1)}, ${t(k2)}`}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {!s.word && <Text style={st.podpis} testID="wzor-zakreslenia">{t('wzor.zakreslenia', { count: s.zakreslenia })}</Text>}
      {tryb && !ipad && <Text style={st.podpis}>{t('wzor.zakreslacz_podpowiedz')}</Text>}
      <View style={[st.strona, ipad && !obok && st.stronaIpad]} testID="wzor-widok">
        {p.widok}
        {s.strona && (
          <Text style={st.plakietka} accessibilityLabel={t('wzor.strona_a11y', { n: s.strona.n, razem: s.strona.razem })} testID="wzor-strona">
            {t('wzor.strona_z', { n: s.strona.n, razem: s.strona.razem })}
          </Text>
        )}
      </View>
    </View>
  );

  const licznik = (
    <View style={obok ? [st.kolumna, { width: s.uklad.kolumnaLicznika ?? undefined }] : st.pasekLicznika} testID={obok ? 'wzor-kolumna-licznika' : 'wzor-pasek-licznika'}>
      <View style={st.liczbaBlok}>
        <Text style={st.liczba} maxFontSizeMultiplier={MAX_SKALA_LICZBY} testID="licznik-wartosc">{String(s.licznik.liczba)}</Text>
        <Text style={st.podpis} testID="licznik-teraz-rzad">{t('licznik.teraz', { n: s.licznik.dziergany })}</Text>
      </View>
      {blad && <Text style={st.tresc} accessibilityRole="alert" testID="blad-zapisu">{t('licznik.blad_zapisu')}</Text>}
      <View style={obok ? st.przyciskiKolumna : st.przyciski}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('licznik.minus_a11y')} onPress={() => void licz(p.naMinus)} style={st.minus} testID="licznik-minus">
          <Text style={st.minusTekst}>{t('licznik.minus')}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t('licznik.plus_a11y', { n: s.licznik.dziergany })} onPress={() => void licz(p.naPlus)} style={[st.plus, obok && st.plusKolumna]} testID="licznik-plus">
          <Text style={st.plusTekst}>{t('licznik.plus')}</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[st.ekran, obok && st.obok]}>
      {wzor}
      {licznik}
      {menu === 'opcje' && (
        <Menu st={st} zamknij={() => ustawMenu('brak')}>
          <Pozycja st={st} tekst={t('wzor.obroc')} id="wzor-obroc" onPress={() => { ustawMenu('brak'); p.naObroc(); }} />
          <Pozycja st={st} tekst={t('wzor.usun')} id="wzor-usun" niszczaca onPress={() => {
            ustawMenu('brak');
            p.potwierdz(t('wzor.usun_tytul', { nazwa: s.nazwa }), t('usun.wzor_opis', { data: p.terminKosza ?? '' }), t('wzor.usun_potwierdz'), p.naUsun);
          }} />
        </Menu>
      )}
      {menu === 'wzory' && (
        <Menu st={st} zamknij={() => ustawMenu('brak')}>
          {s.wzory.map((w) => (
            <Pressable key={w.wzorId} accessibilityRole="menuitem" accessibilityLabel={w.nazwa} accessibilityState={{ selected: w.wzorId === s.wzorId }}
              onPress={() => { ustawMenu('brak'); if (w.wzorId !== s.wzorId) p.naPrzelacz(w.wzorId); }} style={st.pozycja}>
              <Text style={st.tresc}>{`${w.wzorId === s.wzorId ? '✓ ' : ''}${w.nazwa}`}</Text>
            </Pressable>
          ))}
        </Menu>
      )}
    </View>
  );
}

function Menu(p: { st: Style; zamknij(): void; children: React.ReactNode }) {
  return (
    <View style={p.st.menuTlo} accessibilityViewIsModal>
      <Pressable style={StyleSheet.absoluteFill} onPress={p.zamknij} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
      <ScrollView style={p.st.menu} accessibilityRole="menu">{p.children}</ScrollView>
    </View>
  );
}
function Pozycja(p: { st: Style; tekst: string; id: string; niszczaca?: boolean; onPress(): void }) {
  return (
    <Pressable accessibilityRole="menuitem" accessibilityLabel={p.tekst} onPress={p.onPress} style={p.st.pozycja} testID={p.id}>
      <Text style={[p.st.tresc, p.niszczaca && p.st.niszczaca]}>{p.tekst}</Text>
    </Pressable>
  );
}

type Style = ReturnType<typeof style>;
function style(k: Kolory) {
  return StyleSheet.create({
    ekran: { flex: 1, backgroundColor: k.papier },
    obok: { flexDirection: 'row' },
    wzor: { flex: 1 },
    pasek: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: odstep.s, minHeight: rozmiary.minimum, flexWrap: 'wrap' },
    pasekNarzedzi: { flexDirection: 'row', gap: odstep.s, paddingHorizontal: odstep.l, minHeight: rozmiary.minimum, alignItems: 'center' },
    grupa: { flexDirection: 'row', alignItems: 'center' },
    tytulPaska: { flex: 1, minWidth: 120 },
    ikona: { minWidth: rozmiary.minimum, minHeight: rozmiary.minimum, alignItems: 'center', justifyContent: 'center', borderRadius: promien.przyciskDrugi },
    wybrane: { backgroundColor: k.papierGrupa },
    ikonaTekst: { ...typografia.instrukcja, color: k.grafit },
    tytul: { ...typografia.instrukcja, color: k.grafit },
    tresc: { ...typografia.tresc, color: k.grafit },
    podpis: { ...typografia.podpis, color: k.olowek, paddingHorizontal: odstep.l },
    pogrubiony: { fontWeight: '700' },
    informacja: { padding: odstep.m, marginHorizontal: odstep.l, borderRadius: promien.grupa, backgroundColor: k.papierGrupa },
    strona: { flex: 1, backgroundColor: k.papierGrupa },
    stronaIpad: { alignSelf: 'center', width: '100%', maxWidth: 640 }, // kolumna strony iPada maks. 640 pt (W4b)
    plakietka: { ...typografia.podpis, color: k.grafit, alignSelf: 'center', position: 'absolute', bottom: odstep.m, paddingHorizontal: odstep.m, borderRadius: promien.grupa, backgroundColor: k.papier },
    pasekLicznika: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: k.linia, paddingHorizontal: odstep.l, paddingVertical: odstep.s, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: odstep.m, backgroundColor: k.papier },
    kolumna: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: k.linia, padding: odstep.l, gap: odstep.m, backgroundColor: k.papier },
    liczbaBlok: { flexShrink: 1 },
    liczba: { ...typografia.liczba, fontSize: 40, lineHeight: 48, color: k.grafit }, // pasek licznika: 40 pt (design-spec W1a)
    przyciski: { flexDirection: 'row', alignItems: 'center', gap: odstep.m, flexGrow: 1, justifyContent: 'flex-end' },
    przyciskiKolumna: { flex: 1, flexDirection: 'column-reverse', gap: odstep.m },
    minus: { width: 56, height: 56, borderRadius: promien.przyciskDrugi, borderWidth: 2, borderColor: k.drugiPrzyciskObrys, alignItems: 'center', justifyContent: 'center' },
    minusTekst: { ...typografia.przycisk, color: k.grafit },
    plus: { minHeight: 72, minWidth: 132, flexGrow: 1, borderRadius: promien.przyciskGlowny, backgroundColor: k.przyciskTlo, alignItems: 'center', justifyContent: 'center', padding: odstep.m },
    plusKolumna: { flex: 1 },
    plusTekst: { ...typografia.przycisk, color: k.przyciskTekst },
    menuTlo: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end' },
    menu: { maxHeight: '60%', margin: odstep.l, borderRadius: promien.grupa, backgroundColor: k.arkusz },
    pozycja: { minHeight: rozmiary.minimum, justifyContent: 'center', paddingHorizontal: odstep.l, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: k.linia },
    niszczaca: { color: k.blad },
  });
}
