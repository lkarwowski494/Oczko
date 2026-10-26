// Ekran licznika (F-01–F-10, F-47, BR-LIC-*, BR-ZAK-006). Sygnatura: propozycja 07 (E3), porty i granice zatwierdzone przez 05 (Z07-22).
// Wygląd: docs/design/design-spec.md (komponenty, macierz stanów, VoiceOver) i ekrany.html `licznik-start`, `licznik-w-toku`, `limit`,
// `limit-zawczasu`; wartości z modułu motywu (tokeny 04), teksty przez t(). Decyzje (limit, blokada w danych, cel dnia) liczy domena —
// ekran pokazuje stan, który dostał; ogłoszenie i haptyka dopiero po wyniku ok (R-148).
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Haptyka, WzorzecHaptyki } from '../domena/porty';
import { LIMIT_DNI_W_MIESIACU } from '../konfiguracja';
import { cel as rozmiary, MAX_SKALA_LICZBY, odstep, promien, typografia, useKolory, type Kolory } from './motyw';
import { Kreski } from './Kreski';
import type { Oglos, Tlumacz, WynikEkranu } from './wspolne';

/** Stan limitu dni na liczniku (P-065, design-spec.md:15–19). Decyzję liczy domena (`mozeZaczacDzien`), ekran tylko pokazuje. */
export type LimitNaLiczniku =
  | { rodzaj: 'brak' }                 // Pro albo zostały ≥ 2 dni: na liczniku nic o dniach (BR-ZAK-006/S5, P-046)
  | { rodzaj: 'ostatni-darmowy' }      // cicha linia „1 free knitting day left in {month}” (design-spec.md:18)
  | { rodzaj: 'zawczasu' };            // komunikat zamiast +1 i −1 (design-spec.md:16)

/** Baner pod tytułem (design-spec.md:35); `null` = nic (BR-LIC-019/S4). */
export type BanerLicznika =
  | { rodzaj: 'seria'; n: number; sekundy: number }   // „Added 3 rows in 1 s. Undo?”
  | { rodzaj: 'cofnieto'; n: number; wartosc: number } // „Removed 3 rows. Back to 30.”
  | null;

export type StanEkranuLicznika = {
  projekt: string | null;              // null: pierwszy licznik bez nazwy (BR-LIC-001, NFR-PIE-001)
  czesc: string | null;
  skonczone: number;                   // duża liczba = rzędy skończone (design-spec.md:30)
  dziergany: number;                   // „Now knitting row N”
  znaczenie: 'skonczone' | 'w_trakcie'; // F-09; zgłoszenie Z07-04 (czy tryb zostaje)
  cel: number | null;                  // „Goal 96 rows · 49 to go” (design-spec.md:24)
  celDnia: { rzedy: number } | null;   // tylko przy terminie (BR-DNI-005/S5)
  przypomnienie: { tekst: string; ktory: number; razy: number; nastepny: number | null } | null; // rząd dziergany z instrukcją
  powtorzenie: { nazwa: string; numer: number; rzadW: number; dlugosc: number } | null;
  notatka: string | null;              // BR-PRJ-002/S1: widoczna przy liczniku
  sesja: { rzedy: number; od: string } | null; // „Marks this session: 14 rows since 19:52” (od: godzina sformatowana)
  zablokowany: boolean;                // F-03 (design-spec.md:34)
  limit: LimitNaLiczniku;
  miesiac: { nazwa: string; wznowienie: string; rzedyDanych: number }; // sformatowane („November”, „December 1”); rzedyDanych do „Your {n} rows …”
  baner: BanerLicznika;
  blizniak: { rzad: number; notatka: string | null; przypomnienie: string | null } | null; // BR-PRJ-014/S2
  wibracje: boolean;                   // ustawienie (BR-LIC-020/S3)
};

/** Co zaszło w rzędzie po +1 (haptyka F-48: dwa wzorce; ogłoszenie przy wejściu w rząd z instrukcją). */
export type ZdarzeniePlus = 'rzad' | 'przypomnienie' | 'koniec-powtorzenia' | 'cel-dnia' | 'cel-czesci';
export type WynikPlus = WynikEkranu<{
  skonczone: number;
  dziergany: number;
  zdarzenia: ZdarzeniePlus[];
  wejscieWPrzypomnienie: { rzad: number; tekst: string; ktory: number; razy: number } | null;
}>;

export type PropsLicznika = {
  stan: StanEkranuLicznika;
  t: Tlumacz;
  oglos: Oglos;                        // ogłoszenie dopiero po wyniku ok (R-148)
  haptyka: Haptyka;
  /** Przypadek użycia `dodajRzad` (moduly.md:69–75); wynik po COMMIT; `powod: 'zapis' | 'limit' | 'zablokowany'`. */
  naPlus(): Promise<WynikPlus>;
  naMinus(): Promise<WynikEkranu<{ skonczone: number }>>;
  naOdblokuj(): void;                  // pasek „Counter locked · Unlock”
  naCofnijSerie(): void;               // „Undo 3 rows”
  naOferty(): void;                    // tylko z komunikatu limitu (KP-13)
  naHistorie(): void;
  naMenu(): void;                      // menu ••• projektu
  naNastepnaCzesc(): void;             // BR-LIC-011/S1 (U-11)
};

/** F-48: rozpoznawalne są tylko dwa wzorce — rząd i rząd „ze znaczeniem” (instrukcja, koniec powtórzenia, cel dnia lub części). */
function wzorzecPoPlus(z: readonly ZdarzeniePlus[]): WzorzecHaptyki {
  return z.some((x) => x !== 'rzad') ? 'rzadZInstrukcja' : 'plus';
}

type Komunikat = 'blad_zapisu' | 'zablokowany' | null;

export function Licznik(p: PropsLicznika): React.ReactElement {
  const { stan: s, t } = p;
  const k = useKolory();
  const st = style(k);
  const [komunikat, ustawKomunikat] = useState<Komunikat>(null);
  const [arkuszLimitu, ustawArkuszLimitu] = useState<number | null>(null); // numer rzędu, który nie został dodany
  const zamontowany = useRef(true);
  useEffect(() => () => { zamontowany.current = false; }, []);

  const baner = s.baner;
  useEffect(() => {
    if (baner?.rodzaj === 'seria') p.oglos(t('licznik.seria', { count: baner.n }));
    // ogłoszenie raz na pojawienie się banera (design-spec „VoiceOver”: seria stuknięć)
  }, [baner?.rodzaj, baner?.n]);

  const zagraj = (w: WzorzecHaptyki) => { if (s.wibracje) p.haptyka.zagraj(w); };
  const start = s.projekt === null && s.skonczone === 0;
  const nrRobocza = s.dziergany;

  async function plus() {
    if (s.zablokowany) { // stan znany z góry: bez zapisu, komunikat jak odblokować (BR-LIC-004/S3)
      ustawKomunikat('zablokowany');
      zagraj('blokadaStukniecie');
      return;
    }
    const w = await p.naPlus();
    if (!zamontowany.current) return;
    if (!w.ok) {
      if (w.powod === 'limit') {
        ustawArkuszLimitu(nrRobocza);
        p.oglos(t('limit.ogloszenie', { n: nrRobocza, miesiac: s.miesiac.nazwa }));
      } else ustawKomunikat(w.powod === 'zablokowany' ? 'zablokowany' : 'blad_zapisu');
      return;
    }
    ustawKomunikat(null);
    zagraj(wzorzecPoPlus(w.wartosc.zdarzenia));
    const wej = w.wartosc.wejscieWPrzypomnienie;
    if (wej) p.oglos(t('licznik.wejscie_w_przypomnienie', { n: wej.rzad, tekst: wej.tekst, ktory: wej.ktory, razy: wej.razy }));
    else p.oglos(t('licznik.po_dodaniu', { zrobione: w.wartosc.skonczone, nastepny: w.wartosc.dziergany }));
  }
  async function minus() {
    if (s.zablokowany) { ustawKomunikat('zablokowany'); zagraj('blokadaStukniecie'); return; }
    const w = await p.naMinus();
    if (!zamontowany.current) return;
    if (!w.ok) { ustawKomunikat(w.powod === 'zablokowany' ? 'zablokowany' : 'blad_zapisu'); return; }
    ustawKomunikat(null);
    zagraj('minus');
  }

  const liczba = s.znaczenie === 'w_trakcie' ? s.dziergany : s.skonczone;
  const zawczasu = s.limit.rodzaj === 'zawczasu';
  const etykietaPlus = start
    ? t('licznik.plus')
    : s.przypomnienie
      ? t('licznik.plus_a11y_instrukcja', { n: nrRobocza, tekst: s.przypomnienie.tekst })
      : t('licznik.plus_a11y', { n: nrRobocza });

  return (
    <View style={st.ekran}>
      <View style={st.pasek}>
        <View style={st.paskaPrawa}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('licznik.historia')} onPress={p.naHistorie} style={st.ikona}>
            <Text style={st.ikonaTekst} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>◷</Text>
          </Pressable>
          {s.projekt !== null && (
            <Pressable accessibilityRole="button" accessibilityLabel={t('licznik.menu_a11y')} onPress={p.naMenu} style={st.ikona}>
              <Text style={st.ikonaTekst} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>•••</Text>
            </Pressable>
          )}
        </View>
      </View>
      {s.zablokowany && (
        <View style={st.blokada} accessibilityRole="summary">
          <Text style={st.tresc}>{t('licznik.zablokowany')}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={t('licznik.odblokuj')} onPress={p.naOdblokuj} style={st.blokadaPrzycisk}>
            <Text style={[st.tresc, st.pogrubiony]}>{t('licznik.odblokuj')}</Text>
          </Pressable>
        </View>
      )}
      <ScrollView contentContainerStyle={st.srodek}>
        {s.projekt !== null && <Text style={st.podpis}>{s.projekt}</Text>}
        <Text style={st.tytul} accessibilityRole="header">{s.czesc ?? t('licznik.tytul_roboczy')}</Text>
        {!start && <Text style={st.instrukcja}>{t('licznik.teraz', { n: nrRobocza })}</Text>}
        {baner?.rodzaj === 'seria' && (
          <View style={st.baner}>
            <Text style={st.tresc}>{t('licznik.baner_seria', { count: baner.n, sekundy: baner.sekundy })}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={t('licznik.cofnij', { count: baner.n })} onPress={p.naCofnijSerie} style={st.drugiPrzycisk}>
              <Text style={[st.tresc, st.pogrubiony]}>{t('licznik.cofnij', { count: baner.n })}</Text>
            </Pressable>
          </View>
        )}
        {baner?.rodzaj === 'cofnieto' && <Text style={[st.tresc, st.baner]}>{t('licznik.cofnieto', { count: baner.n, wartosc: baner.wartosc })}</Text>}
        <View style={st.liczbaWiersz}>
          <Text style={st.liczba} maxFontSizeMultiplier={MAX_SKALA_LICZBY}>{String(liczba)}</Text>
          <Text style={st.podpis}>{s.cel !== null ? t('licznik.z_celu', { cel: s.cel }) : t('licznik.jednostka')}</Text>
        </View>
        {start && <Text style={st.tresc}>{t('licznik.podpowiedz_start')}</Text>}
        {s.cel !== null && <LinijkaCelu s={s} t={t} st={st} naNastepnaCzesc={p.naNastepnaCzesc} />}
        {s.celDnia && <Text style={st.podpis}>{t('licznik.cel_dnia', { count: s.celDnia.rzedy })}</Text>}
        {s.limit.rodzaj === 'ostatni-darmowy' && <Text style={st.podpis}>{t('licznik.ostatni_darmowy', { miesiac: s.miesiac.nazwa })}</Text>}
        {zawczasu && (
          <Pressable accessibilityRole="link" accessibilityLabel={t('limit.pro_link')} onPress={p.naOferty}>
            <Text style={[st.tresc, st.link]}>{t('limit.pro_link')}</Text>
          </Pressable>
        )}
        {s.sesja && s.sesja.rzedy > 0 && (
          <View>
            <Text style={st.podpis}>{t('licznik.znaczniki_sesji', { count: s.sesja.rzedy, godzina: s.sesja.od })}</Text>
            <Kreski n={s.sesja.rzedy} kolor={k.kreska} />
          </View>
        )}
        {s.przypomnienie && (
          <View style={st.zakreslacz} accessibilityRole="text">
            <Text style={[st.instrukcja, { color: k.tekstNaZakreslaczu }]}>{t('licznik.przypomnienie', { n: nrRobocza, tekst: s.przypomnienie.tekst })}</Text>
            <Text style={[st.podpis, { color: k.tekstNaZakreslaczu }]}>
              {s.przypomnienie.nastepny !== null
                ? t('licznik.przypomnienie_postep', { ktory: s.przypomnienie.ktory, razy: s.przypomnienie.razy, nastepny: s.przypomnienie.nastepny })
                : t('licznik.przypomnienie_postep_ostatnie', { ktory: s.przypomnienie.ktory, razy: s.przypomnienie.razy })}
            </Text>
          </View>
        )}
        {s.powtorzenie && (
          <Text style={st.tresc}>{`${s.powtorzenie.nazwa} · ${t('licznik.powtorzenie', { numer: s.powtorzenie.numer, rzad: s.powtorzenie.rzadW, dlugosc: s.powtorzenie.dlugosc })}`}</Text>
        )}
        {s.notatka && (
          <View>
            <Text style={st.podpis}>{t('licznik.notatka')}</Text>
            <Text style={st.tresc}>{s.notatka}</Text>
          </View>
        )}
        {s.blizniak && (s.blizniak.notatka || s.blizniak.przypomnienie) && (
          <Text style={st.tresc}>{t('licznik.blizniak', { rzad: s.blizniak.rzad, tresc: [s.blizniak.notatka, s.blizniak.przypomnienie].filter(Boolean).join(' · ') })}</Text>
        )}
        {komunikat && (
          <Text style={st.tresc} accessibilityRole="alert" accessibilityLiveRegion="assertive">
            {t(komunikat === 'zablokowany' ? 'licznik.zablokowany_stukniecie' : 'licznik.blad_zapisu')}
          </Text>
        )}
      </ScrollView>
      {zawczasu ? (
        <View style={st.komunikatLimitu} accessibilityRole="summary">
          <Text style={st.tresc}>{t('limit.zawczasu', { count: s.miesiac.rzedyDanych, miesiac: s.miesiac.nazwa, data: s.miesiac.wznowienie })}</Text>
        </View>
      ) : (
        <View style={st.przyciski}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('licznik.minus_a11y')} onPress={minus} style={st.minus}>
            <Text style={st.minusTekst}>{t('licznik.minus')}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={etykietaPlus} onPress={plus} style={st.plus}>
            <Text style={st.plusTekst}>{t('licznik.plus')}</Text>
            {!start && <Text style={st.plusPodpis}>{t('licznik.podpis_plus', { n: nrRobocza })}</Text>}
          </Pressable>
        </View>
      )}
      {arkuszLimitu !== null && (
        <ArkuszLimitu n={arkuszLimitu} s={s} t={t} st={st} naOferty={() => { ustawArkuszLimitu(null); p.naOferty(); }} naZamknij={() => ustawArkuszLimitu(null)} />
      )}
    </View>
  );
}

function LinijkaCelu({ s, t, st, naNastepnaCzesc }: { s: StanEkranuLicznika; t: Tlumacz; st: Style; naNastepnaCzesc(): void }) {
  const c = s.cel ?? 0;
  const zostalo = c - s.skonczone;
  return (
    <View style={st.linijka}>
      <Text style={st.podpis}>{t('licznik.cel', { count: c })}</Text>
      <Text style={st.podpis}>
        {zostalo > 0 ? t('licznik.do_celu', { count: zostalo }) : zostalo === 0 ? t('licznik.cel_osiagniety') : t('licznik.ponad_cel', { count: -zostalo })}
      </Text>
      {zostalo <= 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel={t('licznik.nastepna_czesc')} onPress={naNastepnaCzesc} style={st.drugiPrzycisk}>
          <Text style={[st.tresc, st.pogrubiony]}>{t('licznik.nastepna_czesc')}</Text>
        </Pressable>
      )}
    </View>
  );
}

function ArkuszLimitu(p: { n: number; s: StanEkranuLicznika; t: Tlumacz; st: Style; naOferty(): void; naZamknij(): void }) {
  const { t, st, s } = p;
  return (
    <View style={st.arkusz} accessibilityViewIsModal>
      <Text style={st.tytul} accessibilityRole="header" accessibilityLabel={t('limit.nie_dodano', { n: p.n })}>{t('limit.nie_dodano', { n: p.n })}</Text>
      <Text style={st.tresc}>{t('limit.arkusz_dni', { limit: LIMIT_DNI_W_MIESIACU, miesiac: s.miesiac.nazwa, data: s.miesiac.wznowienie })}</Text>
      <Text style={st.tresc}>{t('limit.arkusz_zachowane', { count: s.miesiac.rzedyDanych })}</Text>
      <Text style={st.podpis}>{t('limit.arkusz_pro')}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={t('limit.zobacz_pro')} onPress={p.naOferty} style={st.plus}>
        <Text style={st.plusTekst}>{t('limit.zobacz_pro')}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={t('wspolne.nie_teraz')} onPress={p.naZamknij} style={st.drugiPrzycisk}>
        <Text style={[st.tresc, st.pogrubiony]}>{t('wspolne.nie_teraz')}</Text>
      </Pressable>
    </View>
  );
}

type Style = ReturnType<typeof style>;
function style(k: Kolory) {
  return StyleSheet.create({
    ekran: { flex: 1, backgroundColor: k.papier },
    pasek: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: odstep.l, minHeight: rozmiary.minimum },
    paskaPrawa: { flexDirection: 'row', gap: odstep.s },
    ikona: { minWidth: rozmiary.minimum, minHeight: rozmiary.minimum, alignItems: 'center', justifyContent: 'center' },
    ikonaTekst: { ...typografia.instrukcja, color: k.grafit },
    blokada: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: odstep.l, backgroundColor: k.papierGrupa, minHeight: rozmiary.minimum },
    blokadaPrzycisk: { minHeight: rozmiary.minimum, justifyContent: 'center', paddingHorizontal: odstep.s },
    srodek: { paddingHorizontal: odstep.xl, gap: odstep.m, paddingBottom: odstep.sekcja },
    tytul: { ...typografia.tytul, color: k.grafit },
    instrukcja: { ...typografia.instrukcja, color: k.grafit },
    tresc: { ...typografia.tresc, color: k.grafit },
    podpis: { ...typografia.podpis, color: k.olowek },
    pogrubiony: { fontWeight: '700' },
    link: { textDecorationLine: 'underline' },
    liczbaWiersz: { flexDirection: 'row', alignItems: 'baseline', gap: odstep.s },
    liczba: { ...typografia.liczba, color: k.grafit },
    linijka: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: odstep.s },
    baner: { gap: odstep.s, padding: odstep.m, borderRadius: promien.grupa, backgroundColor: k.papierGrupa },
    zakreslacz: { backgroundColor: k.zakreslacz, borderLeftWidth: 3, borderLeftColor: k.zakreslaczKrawedz, borderRadius: promien.zakreslacz, padding: odstep.m },
    przyciski: { flexDirection: 'row', alignItems: 'flex-end', gap: rozmiary.odstepMinusPlus, padding: odstep.l },
    minus: { width: rozmiary.przyciskMinus, height: rozmiary.przyciskMinus, borderRadius: promien.przyciskDrugi, borderWidth: 2, borderColor: k.drugiPrzyciskObrys, alignItems: 'center', justifyContent: 'center' },
    minusTekst: { ...typografia.przycisk, color: k.grafit },
    plus: { flex: 1, minHeight: rozmiary.przyciskPlusWysokosc, borderRadius: promien.przyciskGlowny, backgroundColor: k.przyciskTlo, alignItems: 'center', justifyContent: 'center', padding: odstep.m },
    plusTekst: { ...typografia.przycisk, color: k.przyciskTekst },
    plusPodpis: { ...typografia.podpis, color: k.przyciskTekst },
    drugiPrzycisk: { minHeight: rozmiary.minimum, borderRadius: promien.przyciskDrugi, borderWidth: 2, borderColor: k.drugiPrzyciskObrys, alignItems: 'center', justifyContent: 'center', paddingHorizontal: odstep.l },
    komunikatLimitu: { padding: odstep.l, margin: odstep.l, borderRadius: promien.grupa, backgroundColor: k.papierGrupa },
    arkusz: { ...StyleSheet.absoluteFill, backgroundColor: k.arkusz, padding: odstep.xl, gap: odstep.m, justifyContent: 'center' },
  });
}
