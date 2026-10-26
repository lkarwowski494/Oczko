// Kompozycja ekranów projektu i kosza (08 partia 5; design-spec „Projekt, części i kosz”, klucze 04 fix-5): teksty z modeli odczytu przez t()
// — liczba mnoga i parametry mechanizmem i18n (ADR-0017), daty krótkie w formacie języka aplikacji, dzień RRRR-MM-DD bez przesunięcia strefy.
import type { CelDnia } from '../domena/postep';
import type { StanKosza } from '../ekrany/Kosz';
import type { PropsProjektu } from '../ekrany/Projekt';
import type { Tlumacz } from '../ekrany/wspolne';
import { KOSZ_DNI } from '../konfiguracja';
import type { ElementKosza } from '../przypadki-uzycia/widok-kosza';
import { rozmiarUS } from '../domena/obliczenia/druty';
import { dzienLokalny } from '../domena/postep';
import { formatujLiczbe } from '../i18n/format';
import type { WidokProjektu } from '../przypadki-uzycia/widok-projektu';
import { etykietaRobocza, type Jezyk } from './licznik';

/** „last worked …” (BR-PRJ-016, P-183 1a): dni kalendarzowe, bez progu. */
export function ostatniaPraca(dni: number, t: Tlumacz): string {
  if (dni <= 0) return t('projekty.ostatnia_praca_dzis');
  if (dni === 1) return t('projekty.ostatnia_praca_wczoraj');
  return t('projekty.ostatnia_praca_dni', { count: dni });
}
/** Linia terminu na liście (BR-DNI-005/006); bez terminu albo celów — nic (BR-DNI-005 „Bez terminu nic”). */
export function liniaDzis(d: { cel: CelDnia; zrobione: number } | null, t: Tlumacz): string | null {
  if (!d) return null;
  switch (d.cel.rodzaj) {
    case 'cel': return t('projekty.dzis', { count: d.cel.rzedy, zrobione: d.zrobione });
    case 'po_terminie': return t('projekty.po_terminie', { count: d.cel.zostalo });
    case 'osiagniety': return t('licznik.cel_osiagniety');
  }
}
/** Krótka data („Nov 21”) z dnia kalendarzowego — liczona w UTC, więc dzień się nie przesuwa (RD-16). */
export function krotkaData(dzien: string, jezyk: string): string {
  const [r, m, d] = dzien.split('-').map(Number);
  return new Intl.DateTimeFormat(jezyk, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(r, m - 1, d)));
}
/** Nazwa licznika na ekranach poza licznikiem: własna albo nazwa rodzaju (design-spec arkusz licznika: „pusta nazwa = nazwa rodzaju”). */
export const nazwaLicznika = (nazwa: string, rodzaj: 'rzedy' | 'oczka', t: Tlumacz): string => nazwa || t(rodzaj === 'oczka' ? 'formularz.rodzaj_oczka' : 'formularz.rodzaj_rzedy');

/** Ekran „Recently deleted”: podpis gdzie wróci i do kiedy (`kosz.projekt` / `kosz.czesc` / `kosz.licznik`). */
export function stanKosza(elementy: readonly ElementKosza[], j: Jezyk): StanKosza {
  const t = j.t;
  return {
    dni: KOSZ_DNI,
    pozycje: elementy.map((e) => {
      const data = krotkaData(e.doDnia, j.jezyk());
      const nazwa = e.rodzaj === 'licznik' ? nazwaLicznika(e.nazwa, e.rodzajLicznika ?? 'rzedy', t) : e.nazwa;
      const podpis = e.rodzaj === 'projekt' ? t('kosz.projekt', { data })
        : e.rodzaj === 'czesc' ? t('kosz.czesc', { projekt: e.projekt, data })
        : t('kosz.licznik', { projekt: e.projekt, czesc: e.czesc ?? '', data });
      return { rodzaj: e.rodzaj, id: e.id, nazwa, podpis };
    }),
  };
}
/**
 * Stan ekranu projektu z `widokProjektu` (design-spec „Ekran projektu”): linia terminu wg gałęzi RD-15, szczegóły z numerem US, liczniki z nazwą
 * rodzaju, „Whole piece” przy ≥ 2 licznikach rzędów części (propozycja 04 do N2 — rozstrzyga 05; flaga `sekcja` z modelu ma pierwszeństwo).
 * Licznik oczek: opis = sama liczba (klucz „{n} stitches” przyjdzie z partii licznika oczek, design-spec).
 */
export function stanProjektu(w: WidokProjektu, o: { j: Jezyk; terazMs: number; strefa: string }): PropsProjektu['stan'] {
  const { j } = o, t = j.t, jezyk = j.jezyk();
  const termin = w.terminDzien ? krotkaData(w.terminDzien, jezyk) : null;
  const linia = (): string | null => {
    if (!termin) return null;
    const c = w.celDnia;
    if (!c) return t('projekt.termin_bez_celow', { data: termin });
    if (c.rodzaj === 'cel') return t('projekt.termin_dzis', { data: termin, count: c.rzedy, zrobione: w.zrobioneDzis });
    if (c.rodzaj === 'po_terminie') return t('projekt.termin_po', { data: termin, count: c.zostalo });
    return t('projekt.termin_osiagniety', { data: termin });
  };
  const mm = w.drutMm === null ? null : formatujLiczbe(w.drutMm, jezyk, { maks: 2 });
  const zmiana = dzienLokalny(Math.max(w.zmienionoMs, w.ostatniaPracaMs), o.strefa);
  return {
    nazwa: w.nienazwany ? etykietaRobocza(w.utworzonoMs, o.terazMs, j, o.strefa) : w.nazwa,
    postep: w.postep, termin: linia(), ukonczony: w.stan === 'ukonczony',
    notatka: w.notatka.trim() ? w.notatka : null, miejsceWzoru: null, // miejsce we wzorze: partia wzorów (F-26)
    ostatniaZmiana: zmiana.ok ? krotkaData(zmiana.wartosc, jezyk) : '',
    szczegoly: {
      narzedzie: mm === null ? null : t(w.narzedzie === 'szydelko' ? 'projekt.szydelko' : 'projekt.druty'),
      rozmiar: mm === null ? null : w.drutUS ? t('projekt.rozmiar_us', { mm, us: w.drutUS }) : t('projekt.rozmiar_mm', { mm }),
      termin,
    },
    czesci: w.czesci.map((c) => {
      const rzedow = c.liczniki.filter((l) => l.rodzaj === 'rzedy').length;
      return {
        id: c.id, nazwa: c.nazwa, rzedy: c.rzedy, cel: c.cel, paraZ: c.paraZ, paraNazwa: c.paraZ ? w.czesci.find((x) => x.id === c.paraZ)?.nazwa ?? null : null,
        calosc: c.calosc ?? (rzedow >= 2 ? c.rzedy : null),
        liczniki: c.liczniki.map((l) => ({
          id: l.id, nazwa: nazwaLicznika(l.nazwa, l.rodzaj, t),
          opis: l.rodzaj === 'rzedy' ? t('projekt.czesc_rzedy', { count: l.wartosc }) : formatujLiczbe(l.wartosc, jezyk),
        })),
      };
    }),
  };
}
/** Podgląd rozmiaru w arkuszu narzędzia (RD-11 / RD-19 na żywo): „4 mm (US 6)” albo „3 mm” bez odpowiednika. */
export function podgladRozmiaru(mm: number, n: 'druty' | 'szydelko', j: Jezyk): string {
  const us = rozmiarUS(mm, n);
  const m = formatujLiczbe(mm, j.jezyk(), { maks: 2 });
  return us ? j.t('projekt.rozmiar_us', { mm: m, us }) : j.t('projekt.rozmiar_mm', { mm: m });
}
