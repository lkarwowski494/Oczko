// Trasa „/formularz/[rodzaj]”: formularze menu ••• w arkuszu (prototyp.html:130–138). Po udanym zapisie: ekran blokady, przeładowanie licznika, powrót.
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FormularzCelu, FormularzNazwy, FormularzPowtorzenia, FormularzPrzypomnienia, FormularzWartosci } from '../../src/ekrany/Formularze';
import { useKolory } from '../../src/ekrany/motyw';
import type { WynikEkranu } from '../../src/ekrany/wspolne';
import { planPrzypomnien } from '../../src/domena/przypomnienia';
import { useAplikacja } from '../../src/kompozycja/Kontekst';
import { dodajPrzypomnienie, nazwijCzesc, ustawCel, ustawPowtorzenie } from '../../src/przypadki-uzycia/czesc';
import { wpiszWartosc } from '../../src/przypadki-uzycia/licznik';
import { nazwijProjekt } from '../../src/przypadki-uzycia/projekt';
import type { WidokLicznika } from '../../src/przypadki-uzycia/widok-licznika';

type Zapis = { ok: true; wartosc?: unknown } | { ok: false; powod: string };
export default function EkranFormularza(): React.ReactElement {
  const { kontener, licznik } = useAplikacja();
  const { rodzaj } = useLocalSearchParams<{ rodzaj: string }>();
  const router = useRouter();
  const k = useKolory();
  const [w, ustaw] = useState<WidokLicznika | null>(null);
  useEffect(() => { void licznik.widok().then(ustaw); }, [licznik]);
  if (!w) return <View style={{ flex: 1, backgroundColor: k.arkusz }} />;
  const z = kontener.z, t = kontener.j.t;
  const anuluj = () => router.back();
  async function zapisz(f: () => Promise<Zapis>): Promise<WynikEkranu<void>> {
    const r = await f();
    if (!r.ok) return { ok: false, powod: 'zapis' };
    await licznik.poZmianie();
    router.back();
    return { ok: true, wartosc: undefined };
  }
  switch (rodzaj) {
    case 'nazwa':
      return <FormularzNazwy t={t} naAnuluj={anuluj} stan={{ projekt: w.projekt.nienazwany ? '' : w.projekt.nazwa, czesc: w.projekt.nienazwany ? '' : w.czesc.nazwa }}
        naZapisz={(n) => zapisz(async () => {
          // Pusta nazwa projektu roboczego: zostaje nienazwany, nic nie znika (design-spec „Arkusz nazwy”).
          if (n.projekt) { const r = await nazwijProjekt(z, { projektId: w.projektId, nazwa: n.projekt }); if (!r.ok) return r; }
          if (n.czesc && n.czesc !== w.czesc.nazwa) return nazwijCzesc(z, { czescId: w.czescId, nazwa: n.czesc });
          return { ok: true };
        })} />;
    case 'cel':
      return <FormularzCelu t={t} naAnuluj={anuluj} stan={{ cel: w.czesc.cel }} naZapisz={(cel) => zapisz(() => ustawCel(z, { czescId: w.czescId, cel }))} />;
    case 'wpisz':
      return <FormularzWartosci t={t} naAnuluj={anuluj} stan={{ obecna: w.wartosc }} naZapisz={(v) => zapisz(() => wpiszWartosc(z, { licznikId: w.licznikId, wartosc: v }))} />;
    case 'powtorzenie':
      return <FormularzPowtorzenia t={t} naAnuluj={anuluj} stan={{ nazwa: w.nazwa || w.czesc.nazwa, dlugosc: w.powtorzenie?.dlugosc ?? null }}
        naZapisz={(p) => zapisz(() => ustawPowtorzenie(z, { licznikId: w.licznikId, dlugosc: p.dlugosc }))} />;
    case 'przypomnienie':
      return <FormularzPrzypomnienia t={t} naAnuluj={anuluj} stan={{ tekst: '', od: null, co: null, razy: null }}
        podglad={(p) => { const r = planPrzypomnien(p); return r.ok ? r : { ok: false, powod: 'bledne_dane' }; }}
        naZapisz={(p) => zapisz(() => dodajPrzypomnienie(z, { licznikId: w.licznikId, ...p }))} />;
    default:
      return <View style={{ flex: 1, backgroundColor: k.arkusz }} />;
  }
}
