// Otwarcie bazy aplikacji (ADR-0019: bez cichego zastępstwa bazą w pamięci; Z07-21: plik niedostępny przed odblokowaniem ≠ uszkodzenie).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciało: zaślepka roli 07 (E3).
// Docelowo jedyne miejsce importu expo-sqlite (moduly.md); fabryka połączenia wstrzykiwana, żeby test szedł na node:sqlite.
import type { Wynik } from '../../domena/bledy';
import type { PortBazy } from '../../domena/porty';
import { niezaimplementowane } from '../../domena/zaslepka';

/** SQLITE_CORRUPT / SQLITE_NOTADB → `uszkodzony`; SQLITE_CANTOPEN / IOERR → `zapis` (propozycja; osobny powód: [DO USTALENIA] Z07-21). */
export function otworzBaze(_sciezka: string, _fabryka: (sciezka: string) => PortBazy): Promise<Wynik<PortBazy>> {
  return niezaimplementowane('ADR-0019 otworzBaze');
}
