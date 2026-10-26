// Formularze w arkuszach (prototyp.html:130–138; design-spec.md:45, :67): wpisanie wartości (F-45), powtórzenie (F-05), przypomnienie (F-06),
// korekta sesji (F-51), nazwa projektu i części, cel części. Sygnatury: propozycja 07 (E3), granice zatwierdzone przez 05 (Z07-22).
// Walidację reguł liczy domena (RD-12-W5, RD-13 przez `podglad`, BR-LIC-017/S7); ekran nie woła naZapisz z błędną wartością i pokazuje komunikat (rola alert).
// Pola liczbowe przed polem tekstowym, zapis przyciskiem arkusza (e2e/README.md zasada 6: bez chowania klawiatury liczbowej).
import React, { useState } from 'react';
import { Arkusz, Komunikat, Pole, Przycisk, Tresc, liczbaZPola } from './Arkusz';
import type { Tlumacz, WynikEkranu } from './wspolne';

type Przyciski = { t: Tlumacz; naZapisz(): void; naAnuluj(): void; zapisz?: string; zapiszA11y?: string; testZapisz?: string };
function PrzyciskiFormularza(p: Przyciski): React.ReactElement {
  return (
    <>
      <Przycisk tekst={p.zapisz ?? p.t('wspolne.zapisz')} etykieta={p.zapiszA11y} onPress={p.naZapisz} rodzaj="glowny" testID={p.testZapisz ?? 'formularz-zapisz'} />
      <Przycisk tekst={p.t('wspolne.anuluj')} onPress={p.naAnuluj} rodzaj="tekstowy" testID="arkusz-zamknij" />
    </>
  );
}
/** Wynik zapisu z przypadku użycia; nieudany → komunikat formularza (bez makiety, Z07-05), wpisane dane zostają w polach. */
async function zapiszZ<T>(f: () => Promise<WynikEkranu<T>>, naBlad: () => void): Promise<void> {
  const w = await f();
  if (!w.ok) naBlad();
}

export type PropsFormularzaWartosci = {
  stan: { obecna: number };
  t: Tlumacz;
  naZapisz(wartosc: number): Promise<WynikEkranu<void>>;  // wpiszWartosc
  naAnuluj(): void;
};
export function FormularzWartosci({ stan, t, naZapisz, naAnuluj }: PropsFormularzaWartosci): React.ReactElement {
  const [tekst, ustaw] = useState(String(stan.obecna));
  const [blad, ustawBlad] = useState(false);
  const n = liczbaZPola(tekst);
  const zapisz = () => { if (n === null) { ustawBlad(true); return; } ustawBlad(false); void zapiszZ(() => naZapisz(n), () => ustawBlad(true)); };
  return (
    <Arkusz tytul={t('formularz.wpisz_tytul')} przyciski={<PrzyciskiFormularza t={t} naZapisz={zapisz} naAnuluj={naAnuluj} />}>
      <Tresc>{t('formularz.wpisz_opis')}</Tresc>
      <Pole etykieta={t('formularz.wpisz_pole')} wartosc={tekst} naZmiane={ustaw} liczbowe testID="wpisz-wartosc-pole" />
      {n !== null && <Tresc podpis>{t('formularz.wpisz_podglad', { n: n + 1 })}</Tresc>}
      {blad && <Komunikat tekst={t('formularz.wpisz_blad')} />}
    </Arkusz>
  );
}

export type PropsFormularzaPowtorzenia = {
  stan: { nazwa: string; dlugosc: number | null };
  t: Tlumacz;
  naZapisz(p: { nazwa: string; dlugosc: number }): Promise<WynikEkranu<void>>;
  naAnuluj(): void;
};
export function FormularzPowtorzenia({ stan, t, naZapisz, naAnuluj }: PropsFormularzaPowtorzenia): React.ReactElement {
  const [tekst, ustaw] = useState(stan.dlugosc === null ? '' : String(stan.dlugosc));
  const [blad, ustawBlad] = useState(false);
  const zapisz = () => {
    const n = liczbaZPola(tekst);
    if (n === null || n < 1) { ustawBlad(true); return; } // RD-12-W5: długość ≥ 1
    ustawBlad(false);
    void zapiszZ(() => naZapisz({ nazwa: stan.nazwa, dlugosc: n }), () => ustawBlad(true));
  };
  return (
    <Arkusz tytul={t('formularz.powt_tytul')} przyciski={<PrzyciskiFormularza t={t} naZapisz={zapisz} naAnuluj={naAnuluj} />}>
      <Pole etykieta={t('formularz.powt_pole')} wartosc={tekst} naZmiane={ustaw} liczbowe />
      {blad && <Komunikat tekst={t('formularz.powt_blad')} />}
    </Arkusz>
  );
}

export type PlanPrzypomnieniaEkranu = { tekst: string; od: number; co: number; razy: number };
export type PropsFormularzaPrzypomnienia = {
  stan: { tekst: string; od: number | null; co: number | null; razy: number | null };
  t: Tlumacz;
  /** Podgląd rzędów z domeny (RD-13, `przypomnienia.ts`); ekran tylko pokazuje i dołącza do etykiety „Save reminder”. */
  podglad(plan: PlanPrzypomnieniaEkranu): WynikEkranu<number[]>;
  naZapisz(plan: PlanPrzypomnieniaEkranu): Promise<WynikEkranu<void>>;
  naAnuluj(): void;
};
const naPole = (n: number | null) => (n === null ? '' : String(n));
export function FormularzPrzypomnienia({ stan, t, podglad, naZapisz, naAnuluj }: PropsFormularzaPrzypomnienia): React.ReactElement {
  const [tekst, ustawTekst] = useState(stan.tekst);
  const [od, ustawOd] = useState(naPole(stan.od));
  const [co, ustawCo] = useState(naPole(stan.co));
  const [razy, ustawRazy] = useState(naPole(stan.razy));
  const [blad, ustawBlad] = useState<'od' | 'plan' | null>(null);
  // Brak pola = NaN (nie zgadywany rząd, OP-06): domena odrzuca plan, podgląd pusty.
  const plan: PlanPrzypomnieniaEkranu = { tekst: tekst.trim(), od: liczbaZPola(od) ?? NaN, co: liczbaZPola(co) ?? NaN, razy: liczbaZPola(razy) ?? NaN };
  const p = podglad(plan);
  const rzedy = p.ok && p.wartosc.length > 0 ? p.wartosc.join(', ') : null;
  const zapisz = () => {
    if (!Number.isFinite(plan.od) || plan.od < 1) { ustawBlad('od'); return; }
    if (!rzedy || plan.razy < 1) { ustawBlad('plan'); return; }
    ustawBlad(null);
    void zapiszZ(() => naZapisz(plan), () => ustawBlad('plan'));
  };
  return (
    <Arkusz tytul={t('formularz.przyp_tytul')} przyciski={
      <PrzyciskiFormularza t={t} naZapisz={zapisz} naAnuluj={naAnuluj} zapisz={t('formularz.przyp_zapisz')} testZapisz="przypomnienie-zapisz"
        zapiszA11y={rzedy ? t('formularz.przyp_zapisz_a11y', { rzedy }) : t('formularz.przyp_zapisz')} />
    }>
      <Tresc>{t('formularz.przyp_opis')}</Tresc>
      <Pole etykieta={t('formularz.przyp_od')} wartosc={od} naZmiane={ustawOd} liczbowe testID="przypomnienie-od-rzedu" />
      <Pole etykieta={t('formularz.przyp_co')} wartosc={co} naZmiane={ustawCo} liczbowe testID="przypomnienie-co-ile" />
      <Pole etykieta={t('formularz.przyp_razy')} wartosc={razy} naZmiane={ustawRazy} liczbowe testID="przypomnienie-ile-razy" />
      <Pole etykieta={t('formularz.przyp_tekst')} wartosc={tekst} naZmiane={ustawTekst} testID="przypomnienie-co-robic" />
      {rzedy && <Tresc podpis testID="przypomnienie-podglad">{t('formularz.przyp_podglad', { rzedy })}</Tresc>}
      {blad && <Komunikat tekst={t(blad === 'od' ? 'formularz.przyp_blad_od' : 'formularz.przyp_blad')} />}
    </Arkusz>
  );
}
export type PropsKorektySesji = {
  stan: { start: string; koniec: string };   // godziny sformatowane HH:MM w strefie urządzenia
  t: Tlumacz;
  naZapisz(z: { start: string; koniec: string }): Promise<WynikEkranu<void>>;
  naAnuluj(): void;
};
const minuty = (g: string): number | null => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(g.trim());
  return m && Number(m[1]) < 24 && Number(m[2]) < 60 ? Number(m[1]) * 60 + Number(m[2]) : null;
};
export function KorektaSesji({ stan, t, naZapisz, naAnuluj }: PropsKorektySesji): React.ReactElement {
  const [start, ustawStart] = useState(stan.start);
  const [koniec, ustawKoniec] = useState(stan.koniec);
  const [blad, ustawBlad] = useState(false);
  const zapisz = () => {
    const a = minuty(start), b = minuty(koniec);
    if (a === null || b === null || b <= a) { ustawBlad(true); return; } // BR-PRJ-013/S3
    ustawBlad(false);
    void zapiszZ(() => naZapisz({ start: start.trim(), koniec: koniec.trim() }), () => ustawBlad(true));
  };
  return (
    <Arkusz tytul={t('formularz.sesja_tytul')} przyciski={<PrzyciskiFormularza t={t} naZapisz={zapisz} naAnuluj={naAnuluj} />}>
      <Pole etykieta={t('formularz.sesja_start')} wartosc={start} naZmiane={ustawStart} />
      <Pole etykieta={t('formularz.sesja_koniec')} wartosc={koniec} naZmiane={ustawKoniec} />
      {blad && <Komunikat tekst={t('formularz.sesja_blad')} />}
    </Arkusz>
  );
}

/** Nazwa projektu i części (prototyp.html:130); pusta nazwa projektu roboczego zostawia go nienazwanym (design-spec „Arkusz nazwy”). */
export type PropsFormularzaNazwy = {
  stan: { projekt: string; czesc: string };
  t: Tlumacz;
  naZapisz(n: { projekt: string; czesc: string }): Promise<WynikEkranu<void>>;
  naAnuluj(): void;
};
export function FormularzNazwy({ stan, t, naZapisz, naAnuluj }: PropsFormularzaNazwy): React.ReactElement {
  const [projekt, ustawProjekt] = useState(stan.projekt);
  const [czesc, ustawCzesc] = useState(stan.czesc);
  const [blad, ustawBlad] = useState(false);
  const zapisz = () => void zapiszZ(() => naZapisz({ projekt: projekt.trim(), czesc: czesc.trim() }), () => ustawBlad(true));
  return (
    <Arkusz tytul={t('formularz.nazwa_tytul')} przyciski={<PrzyciskiFormularza t={t} naZapisz={zapisz} naAnuluj={naAnuluj} />}>
      <Pole etykieta={t('formularz.nazwa_czesc')} wartosc={czesc} naZmiane={ustawCzesc} />
      <Pole etykieta={t('formularz.nazwa_projekt')} wartosc={projekt} naZmiane={ustawProjekt} testID="formularz-nazwa-projektu" />
      <Tresc podpis>{t('formularz.nazwa_opis')}</Tresc>
      {blad && <Komunikat tekst={t('licznik.blad_zapisu')} />}
    </Arkusz>
  );
}

/** Cel części (prototyp.html:131, U-8): liczba rzędów ≥ 1 albo puste pole = bez celu. */
export type PropsFormularzaCelu = {
  stan: { cel: number | null };
  t: Tlumacz;
  naZapisz(cel: number | null): Promise<WynikEkranu<void>>;
  naAnuluj(): void;
};
export function FormularzCelu({ stan, t, naZapisz, naAnuluj }: PropsFormularzaCelu): React.ReactElement {
  const [tekst, ustaw] = useState(naPole(stan.cel));
  const [blad, ustawBlad] = useState(false);
  const zapisz = () => {
    const n = tekst.trim() === '' ? null : liczbaZPola(tekst);
    if (n === 0 || (n === null && tekst.trim() !== '')) { ustawBlad(true); return; }
    ustawBlad(false);
    void zapiszZ(() => naZapisz(n), () => ustawBlad(true));
  };
  return (
    <Arkusz tytul={t('formularz.cel_tytul')} przyciski={<PrzyciskiFormularza t={t} naZapisz={zapisz} naAnuluj={naAnuluj} />}>
      <Pole etykieta={t('formularz.cel_pole')} wartosc={tekst} naZmiane={ustaw} liczbowe />
      {blad && <Komunikat tekst={t('formularz.przyp_blad')} />}
    </Arkusz>
  );
}
