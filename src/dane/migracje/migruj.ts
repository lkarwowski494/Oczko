// Runner migracji (dane.md „Polityka migracji”): user_version, jedna transakcja na migrację, foreign_keys = OFF przed BEGIN tylko
// przy przebudowie, foreign_key_check pusty przed COMMIT, kopia `przed-migracja-<wersja>.db` przed przebudową, baza nowsza odrzucona.
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciało: zaślepka roli 07 (E3).
// Migracje aplikacji: src/dane/migracje/0001.sql (= docs/architektura/schemat.sql v1) — tworzy rola 08; `dodatkowe` tylko dla testów runnera.
import type { Wynik } from '../../domena/bledy';
import type { Migracja, PortBazy } from '../../domena/porty';
import { niezaimplementowane } from '../../domena/zaslepka';

export type OpcjeMigracji = { dodatkowe?: readonly Migracja[]; katalogKopii?: string };
/** Błąd migracji → ROLLBACK całości, `powod: 'zapis'` (propozycja); baza nowsza → `powod: 'wersja_nowsza'`, bez zmian. */
export function migruj(_port: PortBazy, _opcje?: OpcjeMigracji): Promise<Wynik<{ z: number; do: number }>> {
  return niezaimplementowane('NFR-DAN-001 migruj');
}
