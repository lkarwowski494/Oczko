// Kopia ratunkowa i przywracanie (ADR-0020, ADR-0019): surowa kopia trzech plików, sprawdzenie kopii osobnym połączeniem,
// przywrócenie przez API kopii w kolejce (nigdy podmiana pliku), kopia bieżącej bazy przed przywróceniem.
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciała: zaślepki roli 07 (E3).
import type { Wynik } from '../domena/bledy';
import type { Katalogi, PortBazy, Zegar } from '../domena/porty';
import { niezaimplementowane } from '../domena/zaslepka';

/** ADR-0020 (1): oczko.db, -wal, -shm do `kopie/ratunkowe-<czas>/`, zanim cokolwiek otworzy bazę. */
export function surowaKopia(_katalogDanych: string, _katalogKopii: string, _zegar: Zegar): Promise<Wynik<{ katalog: string; pliki: string[] }>> {
  return niezaimplementowane('ADR-0020 surowaKopia');
}
/** ADR-0020 (2), (5): integrity_check, foreign_key_check, user_version w zakresie; nowsza → `wersja_nowsza`, obca/pusta → `bledne_dane`. */
export function sprawdzKopie(_sciezka: string): Promise<Wynik<{ wersjaSchematu: number }>> {
  return niezaimplementowane('ADR-0020 sprawdzKopie');
}
/** ADR-0020 (5): sprawdzKopie → kopia bieżącej bazy do `katalogi.kopie` → kopia z pliku do bazy głównej przez kolejkę. */
export function przywrocZKopii(_z: { baza: PortBazy; zegar: Zegar; katalogi: Katalogi }, _sciezka: string): Promise<Wynik<{ kopiaPrzed: string }>> {
  return niezaimplementowane('ADR-0020 przywrocZKopii');
}
