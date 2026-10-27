// Kompozycja listy projektów (F-50, F-54, P-065 (2a)): etykieta projektu roboczego w bieżącym języku i wyszukiwanie po niej (design-spec
// „Projekt roboczy”: w wyszukiwaniu ta sama etykieta). Opis wiersza: część i rząd dziergany — klucze „row 47 of 96 · today” z makiety
// ekrany.html `projekty` nie są jeszcze w słowniku 04 (zgłoszenie 08 partia 4, 3A), więc opis używa istniejącego `licznik.teraz`.
import type { StanListyProjektow, WierszProjektu } from '../ekrany/ListaProjektow';
import { widokProjektow, type ProjektNaEkranie, type WidokProjektow } from '../przypadki-uzycia/widok-projektow';
import type { Zaleznosci } from '../przypadki-uzycia/zaleznosci';
import { etykietaRobocza, type Jezyk } from './licznik';
import { liniaDzis, ostatniaPraca } from './projekt';

const nazwaMiesiaca = (dzien: string, j: string) =>
  new Intl.DateTimeFormat(j, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(Number(dzien.slice(0, 4)), Number(dzien.slice(5, 7)) - 1, 1)));

export function stanListy(w: WidokProjektow, o: { zapytanie: string; j: Jezyk; terazMs: number; strefa: string }): StanListyProjektow {
  const { j } = o;
  const szukaj = o.zapytanie.trim().toLocaleLowerCase();
  const wiersz = (p: ProjektNaEkranie, wToku: boolean): WierszProjektu => {
    const nazwa = p.nienazwany ? etykietaRobocza(p.utworzonoMs, o.terazMs, j, o.strefa) : p.nazwa;
    const rzad = p.licznik ? j.t('licznik.teraz', { n: p.licznik.wartosc + 1 }) : '';
    const opis = p.licznik && !p.nienazwany ? `${p.licznik.czesc} · ${rzad}` : rzad;
    return { id: p.id, nazwa, opis, kolorWloczki: null, ...(wToku ? { termin: liniaDzis(p.dzis, j.t), ostatniaPraca: ostatniaPraca(p.dniOdPracy, j.t) } : {}) };
  };
  const filtr = (l: ProjektNaEkranie[], wToku = false) => l.map((p) => wiersz(p, wToku)).filter((x) => !szukaj || x.nazwa.toLocaleLowerCase().includes(szukaj));
  return {
    wToku: filtr(w.wToku, true), ukonczone: filtr(w.ukonczone), zapytanie: o.zapytanie, kosz: w.kosz,
    dni: w.dni && { zostalo: w.dni.zostalo, limit: w.dni.limit, miesiac: nazwaMiesiaca(w.dni.dzis, j.jezyk()) },
  };
}

/** Projekty w toku dla arkusza skrzynki (R2): kolejność i nazwy jak na liście projektów, bez filtra wyszukiwania; błąd odczytu = pusta lista („New project” zostaje). */
export async function projektyDoSkrzynki(z: Zaleznosci, j: Jezyk): Promise<{ id: string; nazwa: string }[]> {
  const w = await widokProjektow(z);
  if (!w.ok) return [];
  const ch = z.zegar.teraz();
  return stanListy(w.wartosc, { zapytanie: '', j, terazMs: ch.ms, strefa: ch.strefa }).wToku.map((p) => ({ id: p.id, nazwa: p.nazwa }));
}
