// Zegarek (ADR-0009, F-12): stan wysyłany telefon → zegarek (`StanZegarka`, złote pliki tests/wspolne/stan-zegarka-*.json)
// i zdarzenia z zegarka (`ZdarzenieWejsciowe`, `zrodlo: 'zegarek'`) jako wejście funkcji `scal` (ADR-0005, NFR-ZEG-001).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciała: zaślepki roli 07 (E3).
import { scalDni, type DzienLimitu } from './limit';
import { STAN_NAZWA_MAKS_ZNAKOW, STAN_PRZYPOMNIENIA_MAKS, STAN_PRZYPOMNIENIE_TEKST_MAKS, WERSJA_STANU } from '../konfiguracja';
import type { PrzypomnienieStanu, StanEkranuBlokady, StanZegarka, ZdarzenieWejsciowe } from './porty';
import type { ZdarzenieLicznika } from './scal';

export type WejscieStanuZegarka = {
  licznik: { id: string; wartosc: number; glowa: string | null; znaczenie: 'skonczone' | 'w_trakcie' };
  nazwa: string; // nazwa projektu albo etykieta projektu roboczego w bieżącym języku (P-126 (1b)) — liczy wołający przez t()
  dzis: string; // RRRR-MM-DD (RD-16)
  dzienDozwolony: boolean;
  sesjaStartMs: number | null;
  ostatniPlusMs: number | null; // czas ostatniej zmiany licznika (przerwa nowego dnia w intencji, ADR-0008 (1))
  dostep: { pro: boolean; wygasa: number | null }; // wygasa null = bez końca (R-031)
  dniLimitu: DzienLimitu[]; // wszystkie wiersze dzien_limitu, dowolna kolejność
  przypomnienia: PrzypomnienieStanu[]; // plan RD-13 licznika
};
/** Pierwsze `n` punktów kodowych (para zastępcza UTF-16 nie jest rozcinana). */
const utnij = (t: string, n: number): string => Array.from(t).slice(0, n).join('');
/**
 * Stan Live Activity i zegarka, wersja 2 (moduly.md „Stan Live Activity i zegarka”, ADR-0009): `dniWMiesiacu` = dni limitu z miesiąca dnia `dzis`,
 * rosnąco (OR po dacie); nazwa i przypomnienia ucięte do limitów z konfiguracji, żeby ładunek był < 4 KB (rejestr Apple 1b).
 */
export function stanEkranuBlokady(w: WejscieStanuZegarka): StanEkranuBlokady {
  const miesiac = w.dzis.slice(0, 7);
  const dniWMiesiacu = scalDni({ a: w.dniLimitu.filter((d) => d.data.startsWith(miesiac)), b: [] }).map((d) => ({ dzien: d.data, pro: d.pro }));
  return {
    wersja: WERSJA_STANU,
    licznikId: w.licznik.id,
    nazwa: utnij(w.nazwa, STAN_NAZWA_MAKS_ZNAKOW),
    wartosc: w.licznik.wartosc,
    znaczenie: w.licznik.znaczenie,
    glowa: w.licznik.glowa,
    ostatniPlusMs: w.ostatniPlusMs,
    dzien: w.dzis,
    dzienDozwolony: w.dzienDozwolony,
    sesjaStartMs: w.sesjaStartMs,
    pro: w.dostep.pro,
    proWaznoscDo: w.dostep.wygasa,
    dniWMiesiacu,
    przypomnienia: w.przypomnienia.slice(0, STAN_PRZYPOMNIENIA_MAKS).map((p) => ({ ...p, tekst: utnij(p.tekst, STAN_PRZYPOMNIENIE_TEKST_MAKS) })),
  };
}
/** Zegarek dostaje ten sam ładunek co Live Activity (StanZegarka = StanEkranuBlokady, ADR-0009). */
export const stanZegarka: (w: WejscieStanuZegarka) => StanZegarka = stanEkranuBlokady;
/** Zdarzenie z zegarka albo ekranu blokady → zdarzenie licznika dla `scal` (te same id i rodzice, bez wyróżnienia źródła). */
export function zdarzenieZWejscia(z: ZdarzenieWejsciowe): ZdarzenieLicznika {
  return { id: z.id, licznik: z.licznikId, rodzaj: z.rodzaj, rodzice: [...z.rodzice] };
}
