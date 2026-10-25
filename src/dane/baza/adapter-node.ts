// Adapter PortBazy na node:sqlite — tylko dla testów (ADR-0002, strategia §3 „Dane”); wyjątek nazwany kontroli bazy w pamięci (Z07-21).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciało: zaślepka roli 07 (E3).
// Kontrakt: jedno połączenie, PRAGMA foreign_keys = ON poza transakcją, journal_mode = WAL (ADR-0001), transakcja = BEGIN IMMEDIATE … COMMIT
// w kolejce; `trybDeweloperski`: transakcja, w której czeka się na coś poza bazą (timer), jest odrzucana z komunikatem „ADR-0002”.
import type { PortBazy } from '../../domena/porty';
import { niezaimplementowane } from '../../domena/zaslepka';

export interface PortNode extends PortBazy {
  zamknij(): void;
}
export function utworzPortNode(_sciezka: string, _opcje?: { trybDeweloperski?: boolean }): PortNode {
  return niezaimplementowane('ADR-0002 utworzPortNode');
}
