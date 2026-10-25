// Zegarek (ADR-0009, F-12): stan wysyłany telefon → zegarek (`StanZegarka`, złote pliki tests/wspolne/stan-zegarka-*.json)
// i zdarzenia z zegarka (`ZdarzenieWejsciowe`, `zrodlo: 'zegarek'`) jako wejście funkcji `scal` (ADR-0005, NFR-ZEG-001).
// sygnatura: propozycja 07, do zatwierdzenia w sesji fix 05 (Z07-22). Ciała: zaślepki roli 07 (E3).
import type { DzienLimitu } from './limit';
import type { StanZegarka, ZdarzenieWejsciowe } from './porty';
import type { ZdarzenieLicznika } from './scal';
import { niezaimplementowane } from './zaslepka';

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
export function stanZegarka(_w: WejscieStanuZegarka): StanZegarka {
  return niezaimplementowane('NFR-ZEG-001 stanZegarka');
}
/** Zdarzenie z zegarka albo ekranu blokady → zdarzenie licznika dla `scal` (te same id i rodzice, bez wyróżnienia źródła). */
export function zdarzenieZWejscia(_z: ZdarzenieWejsciowe): ZdarzenieLicznika {
  return niezaimplementowane('BR-LIC-015 zdarzenieZWejscia');
}
