// Archiwum `.oczko` (ADR-0004, dane.md „Kopie i eksport”): ZIP z manifest.json, oczko.db (VACUUM INTO) i pliki/<sha256>.<rozszerzenie>.
// sygnatura: propozycja 07, do zatwierdzenia w sesji fix 05 (Z07-22). Ciało: zaślepka roli 07 (E3).
import type { MagazynPlikow, PortBazy, Zegar } from '../domena/porty';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Katalogi, Migruj, PortArchiwum } from '../przypadki-uzycia/porty-propozycja';

export function utworzArchiwum(_z: { baza: PortBazy; magazyn: MagazynPlikow; zegar: Zegar; katalogi: Katalogi; migruj: Migruj; aplikacja: string }): PortArchiwum {
  return niezaimplementowane('ADR-0004 utworzArchiwum');
}
