// Zegarek (ADR-0009, F-12): stan wysyłany telefon → zegarek (`StanZegarka`, złote pliki tests/wspolne/stan-zegarka-*.json)
// i zdarzenia z zegarka (`ZdarzenieWejsciowe`, `zrodlo: 'zegarek'`) jako wejście funkcji `scal` (ADR-0005, NFR-ZEG-001).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciała: zaślepki roli 07 (E3).
import { scalDni, type DzienLimitu } from './limit';
import type { StanZegarka, ZdarzenieWejsciowe } from './porty';
import type { ZdarzenieLicznika } from './scal';

export type WejscieStanuZegarka = {
  licznik: { id: string; wartosc: number; glowa: string | null };
  nazwa: string;
  dzis: string; // RRRR-MM-DD (RD-16)
  dzienDozwolony: boolean;
  sesjaStartMs: number | null;
  dostep: { pro: boolean; wygasa: number | null }; // wygasa null = bez końca (R-031)
  dniLimitu: DzienLimitu[]; // wszystkie wiersze dzien_limitu, dowolna kolejność
};
/** Stan dla zegarka: `dniWMiesiacu` = dni limitu z miesiąca dnia `dzis`, rosnąco (propozycja 07). */
export function stanZegarka(w: WejscieStanuZegarka): StanZegarka {
  const miesiac = w.dzis.slice(0, 7);
  // Dni limitu z miesiąca dnia `dzis`, jedna data raz, `pro` = OR (scalDni, P-103 (1a), (6a)), rosnąco po dacie.
  const dniWMiesiacu = scalDni({ a: w.dniLimitu.filter((d) => d.data.startsWith(miesiac)), b: [] }).map((d) => ({ dzien: d.data, pro: d.pro }));
  return {
    licznikId: w.licznik.id,
    nazwa: w.nazwa,
    wartosc: w.licznik.wartosc,
    glowa: w.licznik.glowa,
    dzien: w.dzis,
    dzienDozwolony: w.dzienDozwolony,
    sesjaStartMs: w.sesjaStartMs,
    pro: w.dostep.pro,
    proWaznoscDo: w.dostep.wygasa,
    dniWMiesiacu,
  };
}
/** Zdarzenie z zegarka albo ekranu blokady → zdarzenie licznika dla `scal` (te same id i rodzice, bez wyróżnienia źródła). */
export function zdarzenieZWejscia(z: ZdarzenieWejsciowe): ZdarzenieLicznika {
  return { id: z.id, licznik: z.licznikId, rodzaj: z.rodzaj, rodzice: [...z.rodzice] };
}
