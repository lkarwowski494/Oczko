// Trasa „/wzor”: przeglądarka wzoru bieżącego projektu (design-spec „Wzór, rysik i iPad”; P-220 W1a–W9b; moduly.md „Kontrakt partii 6”).
// Bez wzoru: grupa „Add pattern” (W7a, subflow otworz-wzor-pdf). Widok strony = moduł natywny `oczko-wzor` (WidokWzoru); build bez modułu: pusta strona.
// Pasek licznika woła te same usługi co licznik (+1/−1), więc znacznik idzie z licznikiem (BR-WZR-003). Ostatni wzór w `ostatnie_miejsce` (P-246).
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WidokWzoruNatywny } from '../modules/oczko-wzor';
import { ukladOkna } from '../src/domena/uklad';
import { politykaPlotna, poDotyku, type Narzedzie } from '../src/domena/rysik';
import { ArkuszLinku, GrupaWzorow, type ZrodloDodaniaEkranu } from '../src/ekrany/WzorGrupa';
import { PrzegladarkaWzoru } from '../src/ekrany/WzorPrzegladarka';
import { useKolory } from '../src/ekrany/motyw';
import { Bezpieczny } from '../src/kompozycja/Bezpieczny';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { krotkaData } from '../src/kompozycja/projekt';
import { alertImportu, nazwaDomyslna } from '../src/kompozycja/wzor-dodawanie';
import { wybierzPlikWzoru } from '../src/platforma/system-plikow-uzytkownika';
import { paneleE2e, szerokoscOknaE2e } from '../src/platforma/tryb-e2e';
import { wybieraczZdjec } from '../src/platforma/zdjecia';
import { dodajNotatkeWzoru, dodajWzor, listaWzorow, usunWzor, wzorDoOtwarcia, zapamietajWzor, zapiszRysunek, ustawZnacznik, type ZrodloDodania } from '../src/przypadki-uzycia/wzor';
import { ustawObrot, widokWzoru, type WidokWzoru } from '../src/przypadki-uzycia/wzor-widok';
import type { WidokLicznika } from '../src/przypadki-uzycia/widok-licznika';
import { KOSZ_DNI } from '../src/konfiguracja';

const RODZAJ: Record<string, 'wzor.rodzaj_pdf' | 'wzor.rodzaj_zdjecie' | 'wzor.rodzaj_strona' | 'wzor.rodzaj_word'> = { pdf: 'wzor.rodzaj_pdf', obraz: 'wzor.rodzaj_zdjecie', www: 'wzor.rodzaj_strona', word: 'wzor.rodzaj_word' };

export default function EkranWzoru(): React.ReactElement {
  const { kontener, licznik } = useAplikacja();
  const router = useRouter();
  const k = useKolory();
  const okno = useWindowDimensions();
  const { id, dodaj: dodajParam } = useLocalSearchParams<{ id?: string; dodaj?: string }>();
  const { t } = kontener.j;
  const zw = kontener.wzor.z;
  const [lw, ustawLw] = useState<WidokLicznika | null>(null);
  const [wzory, ustawWzory] = useState<{ wzorId: string; nazwa: string }[] | null>(null);
  const [widok, ustawWidok] = useState<WidokWzoru | null>(null);
  const [narzedzie, ustawNarzedzie] = useState<Narzedzie>('brak');
  const [rysik, ustawRysik] = useState({ tylkoRysik: false });
  const [strona, ustawStrone] = useState<{ n: number; razem: number } | null>(null);
  const [zakreslenia, ustawZakreslenia] = useState(0);
  const [cofnij, ustawCofnij] = useState(0);
  const [link, ustawLink] = useState(false);

  const wczytaj = useCallback(async (wybrany?: string) => {
    const w = await licznik.widok();
    ustawLw(w);
    if (!w) return;
    const l = await listaWzorow(zw, { projektId: w.projektId });
    ustawWzory(l.ok ? l.wartosc.map((x) => ({ wzorId: x.wzorId, nazwa: x.nazwa })) : []);
    const cel = wybrany ?? (await wzorDoOtwarcia(zw, { projektId: w.projektId }));
    const wzorId = typeof cel === 'string' ? cel : cel.ok ? cel.wartosc : null;
    if (!wzorId) { ustawWidok(null); return; }
    const v = await widokWzoru(zw, { wzorId });
    ustawWidok(v.ok ? v.wartosc : null);
    if (v.ok) await zapamietajWzor(zw, { licznikId: w.licznikId, wzorId });
  }, [licznik, zw]);
  useEffect(() => { void wczytaj(id); setRysikOtwarcie(); }, [wczytaj, id]);
  useEffect(() => { const o = kontener.porty.orientacja; o.dowolna(); return () => o.tylkoPion(); }, [kontener]); // F-25: wzór w obu położeniach na iPhonie
  const [dodano, ustawDodano] = useState(false); // „Add pattern” z ekranu projektu: źródło od razu, raz (W7a)
  useEffect(() => {
    if (!lw || dodano || !dodajParam || !['plik', 'skan', 'zdjecia', 'link'].includes(dodajParam)) return;
    ustawDodano(true);
    void dodaj(dodajParam as ZrodloDodaniaEkranu);
  }, [lw, dodano, dodajParam]);
  function setRysikOtwarcie() { ustawRysik((s) => poDotyku(s, 'otwarcie')); }

  async function dodaj(zrodlo: ZrodloDodaniaEkranu | { rodzaj: 'adres'; adres: string } | { rodzaj: 'e2e-pdf' | 'e2e-zdjecie' | 'e2e-word'; sciezka: string }): Promise<void> {
    if (!lw) return;
    const data = krotkaData(zw.zegar.teraz().dzien, kontener.j.jezyk());
    let z: ZrodloDodania | null = null, nazwa = '', plik = '';
    if (typeof zrodlo === 'object') {
      if (zrodlo.rodzaj === 'adres') { z = { rodzaj: 'adres', adres: zrodlo.adres }; nazwa = nazwaDomyslna(zrodlo, t, data); plik = nazwa; }
      else if (zrodlo.rodzaj === 'e2e-word') { z = { rodzaj: 'word', plik: { id: 'e2e', nazwa: 'Test pattern.docx', sciezka: zrodlo.sciezka, typ: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } }; nazwa = 'Test pattern'; }
      else if (zrodlo.rodzaj === 'e2e-pdf') { z = { rodzaj: 'pdf', plik: { id: 'e2e', nazwa: 'Test pattern.pdf', sciezka: zrodlo.sciezka, typ: 'application/pdf' } }; nazwa = 'Test pattern'; }
      else { z = { rodzaj: 'obrazy', sciezki: [zrodlo.sciezka] }; nazwa = nazwaDomyslna({ rodzaj: 'zdjecia' }, t, data); }
    } else if (zrodlo === 'link') { ustawLink(true); return; }
    else if (zrodlo === 'plik') {
      const p = await wybierzPlikWzoru();
      if (!p) return;
      const word = /wordprocessingml|msword/i.test(p.typ) || /\.docx?$/i.test(p.nazwa);
      const pdf = /pdf/i.test(p.typ) || /\.pdf$/i.test(p.nazwa);
      if (!word && !pdf) { pokaz(alertImportu('bledne_dane', p.nazwa, t)); return; }
      z = { rodzaj: word ? 'word' : 'pdf', plik: { id: p.nazwa, nazwa: p.nazwa, sciezka: p.sciezka, typ: p.typ } };
      nazwa = nazwaDomyslna({ rodzaj: 'plik', nazwa: p.nazwa }, t, data); plik = p.nazwa;
    } else if (zrodlo === 'skan') {
      const s = await kontener.wzor.platforma.skanuj();
      if (!s.ok) { pokaz(alertImportu(s.powod, '', t)); return; }
      z = { rodzaj: 'obrazy', sciezki: s.wartosc.sciezki }; nazwa = nazwaDomyslna({ rodzaj: 'skan' }, t, data);
    } else {
      const s = await wybieraczZdjec().wybierzStrony();
      if (s.rodzaj !== 'zdjecia') { if (s.rodzaj === 'blad') pokaz(alertImportu('zapis', '', t)); return; }
      z = { rodzaj: 'obrazy', sciezki: s.sciezki }; nazwa = nazwaDomyslna({ rodzaj: 'zdjecia' }, t, data);
    }
    if (!z) return;
    const r = await dodajWzor(zw, { projektId: lw.projektId, nazwa, zrodlo: z });
    if (r.ok) { await kontener.wzor.k.odswiezMigawke(); await wczytaj(r.wartosc.wzorId); }
    else pokaz(alertImportu(r.powod, plik, t));
  }
  function pokaz(a: { tytul: string; opis: string } | null): void {
    if (a) Alert.alert(a.tytul, a.opis || undefined, [{ text: t('wspolne.ok') }]);
  }

  if (link) return <Bezpieczny><ArkuszLinku t={t} naAnuluj={() => ustawLink(false)} naWklej={async () => null} naZapisz={(adres) => { ustawLink(false); void dodaj({ rodzaj: 'adres', adres }); }} /></Bezpieczny>;
  if (!lw || !wzory) return <View style={{ flex: 1, backgroundColor: k.papier }} />;
  const szerokosc = szerokoscOknaE2e() ?? okno.width;
  const uklad = ukladOkna({ szerokosc, wysokosc: okno.height });
  if (!widok) {
    return (
      <Bezpieczny>
        <View style={{ flex: 1, padding: 16, backgroundColor: k.papier }}>
          <GrupaWzorow wzory={[]} oczekujace={[]} skaner={kontener.wzor.platforma.skanerDostepny()} t={t} naOtworz={(w) => void wczytaj(w)} naDodaj={(z) => void dodaj(z)} naUsunOczekujacy={() => undefined}
            panelE2e={paneleE2e ? <paneleE2e.PanelWzoru katalogTymczasowy={kontener.z.katalogi.tymczasowy} naPdf={(s) => void dodaj({ rodzaj: 'e2e-pdf', sciezka: s })} naZdjecie={(s) => void dodaj({ rodzaj: 'e2e-zdjecie', sciezka: s })}
              naWord={(s) => void dodaj({ rodzaj: 'e2e-word', sciezka: s })} naAdres={(a) => void dodaj({ rodzaj: 'adres', adres: a })} /> : null} />
        </View>
      </Bezpieczny>
    );
  }
  const polityka = politykaPlotna({ narzedzie, tylkoRysik: rysik.tylkoRysik });
  const zn = widok.znacznik;
  const plikPdf = widok.plikPdf;
  const natywny = WidokWzoruNatywny && plikPdf ? (
    <WidokWzoruNatywny style={{ flex: 1 }} testID="wzor-pdf" plikPdf={plikPdf} strona={strona ? strona.n - 1 : 0} rysunki={widok.rysunki} narzedzie={narzedzie} polityka={polityka} cofnij={cofnij}
      znacznik={zn ? { strona: zn.strona, y: zn.y, wysokosc: zn.wysokosc, pozaStrona: zn.pozaStrona, przedSchematem: zn.przedSchematem, kierunek: zn.kierunek,
        etykieta: t(zn.kierunek === -1 ? 'wzor.znacznik_a11y_gora' : 'wzor.znacznik_a11y_dol', { n: zn.rzad }) } : null}
      onRysunek={(e) => void zapiszRysunek(zw, { wzorId: widok.wzorId, strona: e.nativeEvent.strona, plikTymczasowy: e.nativeEvent.plikTymczasowy })}
      onStrona={(e) => ustawStrone({ n: e.nativeEvent.strona + 1, razem: e.nativeEvent.stron })}
      onPierwszyRysik={() => ustawRysik((s) => poDotyku(s, 'rysik'))}
      onZakreslenia={(e) => ustawZakreslenia(e.nativeEvent.liczba)}
      onStukniecie={(e) => zn && void ustawZnacznik(zw, { wzorId: widok.wzorId, licznikId: lw.licznikId, strona: e.nativeEvent.strona, y: Math.min(e.nativeEvent.y, 0.98), wysokoscRzedu: zn?.wysokosc ?? 0.02,
        rzadBazowy: lw.wartosc + 1, kierunek: zn.kierunek }).then(() => wczytaj(widok.wzorId))} /> // przytrzymanie przestawia znacznik o znanym kierunku; pierwszy: „Mark row” z pytaniem (3a)
  ) : <View style={{ flex: 1 }} />;
  const liczba = lw.znaczenie === 'w_trakcie' ? lw.wartosc + 1 : lw.wartosc;
  const strony = strona?.razem ?? 0;
  return (
    <Bezpieczny pelnaSzerokosc>
      <PrzegladarkaWzoru
        stan={{ nazwa: widok.nazwa, opis: t('wzor.wiersz_opis', { rodzaj: t(RODZAJ[widok.zrodlo] ?? 'wzor.rodzaj_pdf'), strony: t('wzor.strony', { count: strony }) }), czesc: lw.czesc.nazwa,
          wzory, wzorId: widok.wzorId, strona, zakreslenia, narzedzie, word: plikPdf === null, kierunek: zn?.kierunek ?? null, licznik: { liczba, dziergany: lw.wartosc + 1 }, uklad }}
        t={t} widok={natywny}
        terminKosza={krotkaData(dodajDni(zw.zegar.teraz().dzien, KOSZ_DNI), kontener.j.jezyk())}
        naWstecz={() => router.back()}
        naPrzelacz={(w) => void wczytaj(w)}
        naNarzedzie={ustawNarzedzie}
        naCofnij={() => ustawCofnij((n) => n + 1)}
        naZaznaczRzad={(kierunek) => void ustawZnacznik(zw, { wzorId: widok.wzorId, licznikId: lw.licznikId, strona: strona ? strona.n - 1 : 0, y: 0.5, wysokoscRzedu: zn?.wysokosc ?? 0.02, rzadBazowy: lw.wartosc + 1, kierunek }).then(() => wczytaj(widok.wzorId))}
        naNotatka={(tekst) => void dodajNotatkeWzoru(zw, { wzorId: widok.wzorId, rzad: zn?.rzad ?? lw.wartosc + 1, tekst })}
        naObroc={() => void ustawObrot(zw, { wzorId: widok.wzorId, strona: strona ? strona.n - 1 : 0, kat: (((widok.obroty[strona ? strona.n - 1 : 0] ?? 0) + 90) % 360) as 0 | 90 | 180 | 270 }).then(() => wczytaj(widok.wzorId))}
        naUsun={() => void usunWzor(zw, { wzorId: widok.wzorId }).then(async (r) => { if (r.ok) { await kontener.wzor.k.odswiezMigawke(); await wczytaj(); } })}
        potwierdz={(tytul, opis, przycisk, f) => Alert.alert(tytul, opis, [{ text: t('wspolne.anuluj'), style: 'cancel' }, { text: przycisk, style: 'destructive', onPress: f }])}
        naPlus={async () => { const r = await licznik.uslugi.dodajRzad(); await wczytaj(widok.wzorId); return r.ok ? { ok: true, wartosc: undefined } : r; }}
        naMinus={async () => { const r = licznik.dzialania.naMinus ? await licznik.dzialania.naMinus() : { ok: false as const, powod: 'zapis' as const }; await wczytaj(widok.wzorId); return r; }}
      />
    </Bezpieczny>
  );
}
const dodajDni = (dzien: string, n: number): string => { const [r, m, d] = dzien.split('-').map(Number); return new Date(Date.UTC(r, m - 1, d + n)).toISOString().slice(0, 10); };
