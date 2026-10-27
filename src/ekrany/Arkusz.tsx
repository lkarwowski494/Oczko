// Wspólne elementy arkuszy (design-spec „Komponenty”: arkusze systemowe — treść się przewija, przyciski zawsze widoczne; formularze Save / Cancel).
// Prezentację arkusza (formSheet) daje trasa expo-router; tu tylko zawartość. Wartości z modułu motywu (tokeny 04).
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { cel, odstep, promien, typografia, useKolory, type Kolory } from './motyw';

/** Ile dół paska przycisków (współrzędne okna) zachodzi na górną krawędź klawiatury; bez klawiatury 0 (P-255 (a)). */
export function odstepNadKlawiatura(w: { dolPrzyciskow: number; gornaKlawiatury: number | null }): number {
  return w.gornaKlawiatury === null ? 0 : Math.max(0, w.dolPrzyciskow - w.gornaKlawiatury);
}
type Pomiar = (f: (x: number, y: number, szer: number, wys: number) => void) => void;

/**
 * Przyciski zawsze widoczne (design-spec „Komponenty”), także nad klawiaturą numeryczną (scen. 10: Save pod klawiszem „0”). Arkusz formSheet
 * jest przesunięty w oknie, więc pomiar w oknie (measureInWindow), nie ramka względem rodzica jak w KeyboardAvoidingView. `zmierz`: testy.
 */
export function Arkusz(p: { tytul: string; children: React.ReactNode; przyciski: React.ReactNode; testID?: string; zmierz?: Pomiar }): React.ReactElement {
  const st = style(useKolory());
  const pasek = useRef<View>(null);
  const [nadKlawiatura, ustawNadKlawiatura] = useState(0);
  const biezacy = useRef(0);
  useEffect(() => {
    const zmierz: Pomiar = p.zmierz ?? ((f) => pasek.current?.measureInWindow(f));
    const ustaw = (o: number) => { biezacy.current = o; ustawNadKlawiatura(o); };
    const pokaz = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
      zmierz((_x, y, _s, wys) => ustaw(odstepNadKlawiatura({ dolPrzyciskow: y + wys - biezacy.current, gornaKlawiatury: e.endCoordinates.screenY })));
    });
    const schowaj = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => ustaw(0));
    return () => { pokaz.remove(); schowaj.remove(); };
  }, [p.zmierz]);
  return (
    <View style={st.arkusz} testID={p.testID}>
      <ScrollView contentContainerStyle={st.tresc} keyboardShouldPersistTaps="handled">
        <Text style={st.tytul} accessibilityRole="header">{p.tytul}</Text>
        {p.children}
      </ScrollView>
      <View ref={pasek} style={[st.przyciski, { paddingBottom: odstep.l + nadKlawiatura }]} testID="arkusz-przyciski">{p.przyciski}</View>
    </View>
  );
}

type RodzajPrzycisku = 'glowny' | 'drugi' | 'tekstowy';
export function Przycisk(p: { tekst: string; etykieta?: string; onPress(): void; rodzaj?: RodzajPrzycisku; testID?: string; rola?: 'button' | 'link'; wylaczony?: boolean }): React.ReactElement {
  const st = style(useKolory());
  const r = p.rodzaj ?? 'drugi';
  return (
    <Pressable accessibilityRole={p.rola ?? 'button'} accessibilityLabel={p.etykieta ?? p.tekst} onPress={p.onPress} testID={p.testID}
      disabled={p.wylaczony} accessibilityState={p.wylaczony ? { disabled: true } : undefined}
      style={[r === 'glowny' ? st.glowny : r === 'drugi' ? st.drugi : st.tekstowy, p.wylaczony && st.wylaczony]}>
      <Text style={[r === 'glowny' ? st.glownyTekst : st.drugiTekst, p.wylaczony && st.wylaczonyTekst]}>{p.tekst}</Text>
    </Pressable>
  );
}

export function Pole(p: { etykieta: string; wartosc: string; naZmiane(t: string): void; liczbowe?: boolean; dziesietne?: boolean; wielowierszowe?: boolean; testID?: string; naKoniec?(): void }): React.ReactElement {
  const k = useKolory();
  const st = style(k);
  return (
    <View style={st.pole}>
      <Text style={st.podpis} importantForAccessibility="no" accessibilityElementsHidden>{p.etykieta}</Text>
      <TextInput accessibilityLabel={p.etykieta} value={p.wartosc} onChangeText={p.naZmiane} testID={p.testID} style={st.wejscie}
        keyboardType={p.dziesietne ? 'decimal-pad' : p.liczbowe ? 'number-pad' : 'default'} returnKeyType={p.liczbowe || p.dziesietne || p.wielowierszowe ? undefined : 'done'}
        onSubmitEditing={p.naKoniec} multiline={p.wielowierszowe} textAlignVertical={p.wielowierszowe ? 'top' : undefined}
        autoCorrect={false} placeholderTextColor={k.olowek} />
    </View>
  );
}

/** Wybór jednej z opcji (radio, `selected`; design-spec „VoiceOver”: wybory znaczenia i narzędzia jako radio). */
export function Wybor<T extends string>(p: { opcje: { wartosc: T; tekst: string; opis?: string }[]; wybrana: T; naWybor(w: T): void }): React.ReactElement {
  const st = style(useKolory());
  return (
    <View accessibilityRole="radiogroup" style={st.wybor}>
      {p.opcje.map((o) => (
        <Pressable key={o.wartosc} accessibilityRole="radio" accessibilityLabel={o.tekst} accessibilityState={{ selected: o.wartosc === p.wybrana }}
          onPress={() => p.naWybor(o.wartosc)} style={[st.opcja, o.wartosc === p.wybrana && st.opcjaWybrana]}>
          <Text style={st.drugiTekst}>{o.tekst}</Text>
          {o.opis && <Text style={st.podpis}>{o.opis}</Text>}
        </Pressable>
      ))}
    </View>
  );
}

/** Komunikat błędu; `znak` dodaje „!” przed tekstem (design-spec: błąd tekstem i znakiem, nie samym kolorem), VoiceOver czyta sam tekst. */
export function Komunikat({ tekst, znak }: { tekst: string; znak?: boolean }): React.ReactElement {
  const st = style(useKolory());
  return <Text style={st.blad} accessibilityRole="alert" accessibilityLiveRegion="assertive" accessibilityLabel={znak ? tekst : undefined}>{znak ? `! ${tekst}` : tekst}</Text>;
}
export function Tresc({ children, podpis, testID }: { children: React.ReactNode; podpis?: boolean; testID?: string }): React.ReactElement {
  const st = style(useKolory());
  return <Text style={podpis ? st.podpis : st.zwykly} testID={testID}>{children}</Text>;
}

/** Liczba całkowita ≥ 0 z pola (cyfry ASCII; pusty, ujemny, ułamek, tekst → null). */
export const liczbaZPola = (t: string): number | null => (/^\d+$/.test(t.trim()) ? Number(t.trim()) : null);

export function style(k: Kolory) {
  return StyleSheet.create({
    arkusz: { flex: 1, backgroundColor: k.arkusz },
    tresc: { padding: odstep.xl, gap: odstep.m },
    tytul: { ...typografia.tytul, color: k.grafit },
    przyciski: { padding: odstep.l, gap: odstep.s, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: k.linia },
    glowny: { minHeight: cel.minimum, borderRadius: promien.przyciskGlowny, backgroundColor: k.przyciskTlo, alignItems: 'center', justifyContent: 'center', paddingHorizontal: odstep.l },
    glownyTekst: { ...typografia.przycisk, color: k.przyciskTekst },
    drugi: { minHeight: cel.minimum, borderRadius: promien.przyciskDrugi, borderWidth: 2, borderColor: k.drugiPrzyciskObrys, alignItems: 'center', justifyContent: 'center', paddingHorizontal: odstep.l },
    tekstowy: { minHeight: cel.minimum, alignItems: 'center', justifyContent: 'center', paddingHorizontal: odstep.l },
    drugiTekst: { ...typografia.tresc, color: k.grafit, fontWeight: '700' },
    pole: { gap: odstep.xs },
    wylaczony: { backgroundColor: k.linia, borderColor: k.linia }, // stan nieaktywny z istniejących tokenów (brak tokenu „disabled” — zgłoszenie do 04)
    wylaczonyTekst: { color: k.olowek },
    wybor: { gap: odstep.s },
    opcja: { minHeight: cel.minimum, borderRadius: promien.pole, borderWidth: 2, borderColor: k.linia, padding: odstep.m, justifyContent: 'center' },
    opcjaWybrana: { borderColor: k.drugiPrzyciskObrys },
    wejscie: { ...typografia.tresc, color: k.grafit, minHeight: cel.minimum, borderRadius: promien.pole, borderWidth: 2, borderColor: k.drugiPrzyciskObrys, paddingHorizontal: odstep.m },
    podpis: { ...typografia.podpis, color: k.olowek },
    zwykly: { ...typografia.tresc, color: k.grafit },
    blad: { ...typografia.tresc, color: k.blad },
  });
}
