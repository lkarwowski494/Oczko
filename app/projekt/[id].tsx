// Trasa „/projekt/[id]”: ekran projektu (A5 partii 5; design-spec „Ekran projektu”, P-183 3a). Wejście: nazwa projektu na liczniku, lista projektów.
// Potwierdzenia „Make another” i „Delete …” to alerty systemowe (design-spec „Usuwanie”, słownik „Delete {object}”); termin w treści = dzień
// usunięcia + KOSZ_DNI. Po zapisie: ekran blokady i licznik (`poZmianie` / `poUsunieciu`, C2), ogłoszenie VoiceOver, model od nowa.
import React, { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Projekt } from '../../src/ekrany/Projekt';
import { useKolory } from '../../src/ekrany/motyw';
import { dzienLokalny } from '../../src/domena/postep';
import { KOSZ_DNI } from '../../src/konfiguracja';
import { useAplikacja } from '../../src/kompozycja/Kontekst';
import { Bezpieczny } from '../../src/kompozycja/Bezpieczny';
import { krotkaData, stanProjektu } from '../../src/kompozycja/projekt';
import { oglos } from '../../src/kompozycja/system';
import { dodajDni } from '../../src/przypadki-uzycia/daty';
import { usunCzesc, usunLicznik, usunProjekt, wznowProjekt, zmienDateUkonczenia, zrobPonownie } from '../../src/przypadki-uzycia/projekt';
import { widokProjektu, type WidokProjektu } from '../../src/przypadki-uzycia/widok-projektu';

export default function EkranProjektu(): React.ReactElement {
  const { kontener, licznik } = useAplikacja();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const k = useKolory();
  const [w, ustaw] = useState<WidokProjektu | null>(null);
  const [edycja, ustawEdycje] = useState(false);
  const z = kontener.z, j = kontener.j, t = j.t;
  const wczytaj = useCallback(async () => {
    const r = await widokProjektu(z, { projektId: id });
    if (r.ok) ustaw(r.wartosc);
    else router.replace('/projekty'); // projekt w koszu albo nieistniejący
  }, [z, id, router]);
  useFocusEffect(useCallback(() => { void wczytaj(); }, [wczytaj]));
  if (!w) return <View style={{ flex: 1, backgroundColor: k.papier }} />;
  const ch = z.zegar.teraz();
  const stan = stanProjektu(w, { j, terazMs: ch.ms, strefa: ch.strefa });
  const doDnia = () => { const d = dzienLokalny(ch.ms, ch.strefa); return d.ok ? krotkaData(dodajDni(d.wartosc, KOSZ_DNI), j.jezyk()) : ''; };
  const otworzLicznik = (licznikId: string) => void licznik.otworz(licznikId).then(() => router.navigate('/'));
  const formularz = (rodzaj: string, extra: Record<string, string> = {}) => router.push({ pathname: '/formularz/[rodzaj]', params: { rodzaj, projekt: w.id, ...extra } });
  const potwierdz = (tytul: string, opis: string, przycisk: string, f: () => Promise<void>, destrukcyjny = true) =>
    Alert.alert(tytul, opis, [{ text: t('wspolne.anuluj'), style: 'cancel' }, { text: przycisk, style: destrukcyjny ? 'destructive' : 'default', onPress: () => void f() }]);
  const poUsunieciu = async (nazwa: string) => { await licznik.poUsunieciu(w.id); oglos(t('usun.ogloszenie', { nazwa })); await wczytaj(); };
  const czesc = (cid: string) => w.czesci.find((c) => c.id === cid);
  const licznikW = (lid: string) => stan.czesci.flatMap((c) => c.liczniki ?? []).find((l) => l.id === lid);
  return (
    <Bezpieczny>
      <Projekt
        stan={stan} t={t} edycja={edycja}
        naWstecz={() => (router.canGoBack() ? router.back() : router.replace('/projekty'))}
        naOtworzCzesc={(cid) => { const l = czesc(cid)?.liczniki[0]; if (l) otworzLicznik(l.id); }}
        naOtworzLicznik={otworzLicznik}
        naDodajCzesc={() => formularz('czesc')} naDodajLicznik={() => formularz('licznik')}
        naNotatka={() => formularz('notatka')} naNarzedzie={() => formularz('narzedzie')} naTermin={() => formularz('termin')}
        naEdytuj={() => ustawEdycje(true)} naKoniecEdycji={() => ustawEdycje(false)}
        naDataUkonczenia={(dzien) => void zmienDateUkonczenia(z, { projektId: w.id, ukonczonoDzien: dzien }).then(async (r) => { if (r.ok) await wczytaj(); })}
        naWznow={() => void wznowProjekt(z, { projektId: w.id }).then(async (r) => {
          if (!r.ok) return;
          await licznik.poZmianie();
          oglos(t('projekt.wznowiono', { nazwa: stan.nazwa }));
          await wczytaj();
        })}
        naZrobTakaSama={() => potwierdz(t('projekt.kopia_tytul', { nazwa: stan.nazwa }), t('projekt.kopia_opis'), t('projekt.kopia_potwierdz'), async () => {
          const r = await zrobPonownie(z, { projektId: w.id }); // nazwa kopii = nazwa oryginału (04-fix5-N1, decyzja 08 w raporcie)
          if (r.ok) router.replace({ pathname: '/projekt/[id]', params: { id: r.wartosc.projektId } });
        }, false)}
        naUsunProjekt={() => potwierdz(t('usun.tytul', { nazwa: stan.nazwa }), t('usun.projekt_opis', { data: doDnia() }), t('usun.projekt'), async () => {
          const r = await usunProjekt(z, { projektId: w.id });
          if (!r.ok) return;
          await licznik.poUsunieciu(w.id);
          oglos(t('usun.ogloszenie', { nazwa: stan.nazwa }));
          router.replace('/projekty');
        })}
        naUsunCzesc={(cid) => {
          const c = czesc(cid);
          if (!c) return;
          potwierdz(t('usun.tytul', { nazwa: c.nazwa }), t('usun.czesc_opis', { count: c.liczniki.length, data: doDnia() }), t('usun.czesc'), async () => {
            if ((await usunCzesc(z, { czescId: cid })).ok) await poUsunieciu(c.nazwa);
          });
        }}
        naUsunLicznik={(lid) => {
          const nazwa = licznikW(lid)?.nazwa ?? '';
          potwierdz(t('usun.tytul', { nazwa }), t('usun.licznik_opis', { data: doDnia() }), t('usun.licznik'), async () => {
            if ((await usunLicznik(z, { licznikId: lid })).ok) await poUsunieciu(nazwa);
          });
        }}
      />
    </Bezpieczny>
  );
}

