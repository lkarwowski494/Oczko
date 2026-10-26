// Kompozycja ekranów projektu i kosza (08 partia 5; design-spec „Projekt, części i kosz”, klucze 04 fix-5): teksty z modeli odczytu przez t()
// — liczba mnoga i parametry mechanizmem i18n (ADR-0017), daty krótkie w formacie języka aplikacji, dzień RRRR-MM-DD bez przesunięcia strefy.
import type { CelDnia } from '../domena/postep';
import type { StanKosza } from '../ekrany/Kosz';
import type { Tlumacz } from '../ekrany/wspolne';
import { KOSZ_DNI } from '../konfiguracja';
import type { ElementKosza } from '../przypadki-uzycia/widok-kosza';
import type { Jezyk } from './licznik';

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
