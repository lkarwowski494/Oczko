// Trasa „/ustawienia” (BR-ZAK-004, BR-ZAK-006/S5, S7, KP-13, F-48, BR-DAN-006, BR-DAN-009). Dni darmowe z modelu listy projektów.
// Eksport → arkusz udostępniania; import → wybór pliku, liczności przed decyzją, „scal” albo „zastąp” (P-091 (6a)); wynik w treści ekranu.
// Panele `e2e-*` tylko w buildzie E2E (bez t(), e2e/README.md).
import React, { useCallback, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Import } from '../src/ekrany/Dane';
import { Ustawienia } from '../src/ekrany/Ustawienia';
import { Tresc } from '../src/ekrany/Arkusz';
import type { DniNaLiscie } from '../src/ekrany/ListaProjektow';
import type { Licznosci, Manifest, TrybImportu } from '../src/domena/porty';
import { ADRESY } from '../src/kompozycja/adresy';
import { licznosciTekst, wynikScalenia } from '../src/kompozycja/dane';
import { plikiE2e } from '../src/kompozycja/e2e-pliki';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { Bezpieczny } from '../src/kompozycja/Bezpieczny';
import { stanListy } from '../src/kompozycja/projekty';
import { systemAplikacji } from '../src/kompozycja/system';
import { E2E } from '../src/platforma/tryb-e2e';
import { udostepnijPlik, wybierzArchiwum } from '../src/platforma/system-plikow-uzytkownika';
import { eksportuj, importuj } from '../src/przypadki-uzycia/archiwum';
import { usunWszystkieDane } from '../src/przypadki-uzycia/projekt';
import { widokProjektow } from '../src/przypadki-uzycia/widok-projektow';
import { przyTle } from '../src/przypadki-uzycia/start';
import { sha256PlikuTs } from '../src/dane/pliki/magazyn';
import { polacz } from '../src/dane/pliki/system';

type Dane =
  | { rodzaj: 'eksport'; licznosci: string }
  | { rodzaj: 'wybor'; plik: string; licznosci: string }
  | { rodzaj: 'wynik'; tekst: string }
  | { rodzaj: 'blad' }
  | null;

export default function EkranUstawien(): React.ReactElement {
  const { kontener, licznik, preferencje } = useAplikacja();
  const router = useRouter();
  const t = kontener.j.t;
  const z = kontener.z;
  const [dni, ustawDni] = useState<DniNaLiscie>(null);
  const [wibracje, ustawWibracje] = useState(preferencje.stan().wibracje);
  const [dostep, ustawDostep] = useState(kontener.dostep.stan());
  const [dane, ustawDane] = useState<Dane>(null);
  const [ostatniEksport, ustawOstatni] = useState<string | null>(null);
  const pliki = plikiE2e(kontener.katalogDanych);
  const [zapisane, ustawZapisane] = useState(() => (E2E ? pliki.ile() : 0));
  const [sha, ustawSha] = useState('');
  const wybor = useRef<((t: TrybImportu | 'anuluj') => void) | null>(null);

  useFocusEffect(useCallback(() => {
    const koniec = kontener.dostep.naZmiane(ustawDostep);
    void widokProjektow(z).then((w) => {
      const ch = z.zegar.teraz();
      if (w.ok) ustawDni(stanListy(w.wartosc, { zapytanie: '', j: kontener.j, terazMs: ch.ms, strefa: ch.strefa }).dni);
    });
    // ADR-0019 test E2E: SHA-256 pliku bazy po checkpoincie WAL (stan pliku taki, jak po przejściu w tło).
    if (E2E) void przyTle(z).then(() => sha256PlikuTs(polacz(kontener.katalogDanych, 'oczko.db'))).then(ustawSha);
    return koniec;
  }, [kontener, z]));

  async function eksport(): Promise<string | null> {
    const w = await eksportuj(z, { katalogDocelowy: z.katalogi.tymczasowy });
    if (!w.ok) { ustawDane({ rodzaj: 'blad' }); return null; }
    ustawOstatni(w.wartosc.sciezka);
    ustawDane({ rodzaj: 'eksport', licznosci: licznosciTekst(w.wartosc.manifest.licznosci, t) });
    return w.wartosc.sciezka;
  }
  async function licznosciBazy(): Promise<Licznosci> {
    const [r] = await z.baza.all<{ p: number }>('SELECT count(*) AS p FROM projekt');
    return { projekt: r?.p ?? 0 };
  }
  async function importZ(sciezka: string) {
    const przed = await licznosciBazy();
    const w = await importuj(z, {
      sciezka,
      wybierz: (m: Manifest) => new Promise((r) => {
        wybor.current = r;
        ustawDane({ rodzaj: 'wybor', plik: sciezka.slice(sciezka.lastIndexOf('/') + 1), licznosci: licznosciTekst(m.licznosci, t) });
      }),
    });
    wybor.current = null;
    if (!w.ok) { ustawDane({ rodzaj: 'blad' }); return; }
    if (w.wartosc.tryb === 'anulowano') { ustawDane(null); return; }
    if (w.wartosc.tryb === 'zastap') licznik.zresetuj(); else await licznik.poZmianie();
    ustawDane({ rodzaj: 'wynik', tekst: wynikScalenia(przed, w.wartosc.licznosci, t) });
  }
  const zamknijDane = () => { wybor.current?.('anuluj'); ustawDane(null); };

  const wynikDanych = dane === null ? null
    : dane.rodzaj === 'eksport' ? <View testID="eksport-wynik"><Tresc testID="eksport-licznosci">{t('dane.eksport_gotowy', { licznosci: dane.licznosci })}</Tresc></View>
    : dane.rodzaj === 'blad' ? <Tresc>{t('dane.blad')}</Tresc>
    : <Import wbudowany t={t} stan={dane.rodzaj === 'wybor' ? { rodzaj: 'wybor', plik: dane.plik, licznosci: dane.licznosci } : { rodzaj: 'wybor', plik: '' }}
        wynik={dane.rodzaj === 'wynik' ? dane.tekst : undefined}
        naScal={() => wybor.current?.('scal')} naZastap={() => wybor.current?.('zastap')} naAnuluj={zamknijDane} />;

  const panelE2e = E2E ? (
    <View style={{ gap: 8 }}>
      <Pressable accessibilityRole="button" testID="e2e-pliki-zachowaj-eksport"
        onPress={() => { if (ostatniEksport) ustawZapisane(pliki.zachowaj(ostatniEksport)); }}>
        <Text>Test files: keep last export</Text>
      </Pressable>
      <Text testID="e2e-sha-bazy" selectable>{sha}</Text>
      <Text testID="e2e-pliki-stan">{`Saved: ${zapisane} file${zapisane === 1 ? '' : 's'}`}</Text>
      <Pressable accessibilityRole="button" testID="e2e-pliki-importuj-ostatni" onPress={() => { const p = pliki.ostatni(); if (p) void importZ(p); }}>
        <Text>Test files: import last kept</Text>
      </Pressable>
    </View>
  ) : null;

  return (
    <Bezpieczny>
      <Ustawienia
        stan={{ pro: dostep.aktywne, dni: dostep.pro ? null : dni, wibracje }}
        t={t}
        system={systemAplikacji}
        adresy={{ polityka: ADRESY.polityka, recenzja: ADRESY.recenzja }}
        naOferty={() => router.push('/oferty')}
        naWstecz={() => router.back()}
        naWibracje={(w) => { preferencje.ustaw({ wibracje: w }); ustawWibracje(w); }}
        naZglosProblem={() => router.push('/zglos')}
        naStanDanych={() => undefined /* stan danych (F-58): synchronizacja iCloud poza tą partią */}
        dane={{
          naEksport: () => void eksport().then((s) => { if (s && !E2E) void udostepnijPlik(s); }),
          naImport: () => void wybierzArchiwum().then((p) => { if (p) void importZ(p); }),
          naUsunWszystko: () => void usunWszystkieDane(z).then((w) => {
            if (!w.ok) { ustawDane({ rodzaj: 'blad' }); return; }
            licznik.zresetuj();
            router.dismissTo('/projekty');
          }),
        }}
        wynikDanych={wynikDanych}
        panelE2e={panelE2e}
      />
    </Bezpieczny>
  );
}
