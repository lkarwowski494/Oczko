// Kopia spójna bazy przez VACUUM INTO, nigdy kopia samego pliku (dane.md, eksperyment D, docs/niezawodnosc/eksperymenty/wal-kopia.out).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciało: zaślepka roli 07 (E3).
import type { Wynik } from '../../domena/bledy';
import type { PortBazy } from '../../domena/porty';
import { niezaimplementowane } from '../../domena/zaslepka';

export function kopiaBazy(_baza: PortBazy, _cel: string): Promise<Wynik<{ bajty: number }>> {
  return niezaimplementowane('ADR-0004 kopiaBazy');
}
