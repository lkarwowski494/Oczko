// Repozytorium dni z robótką (F-59, RD-15, RD-16): wykonanie dnia bez wpisań i bez cofniętych zmian.
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciało: zaślepka roli 07 (E3).
import type { PortBazy } from '../../domena/porty';
import { niezaimplementowane } from '../../domena/zaslepka';

export function wykonanieDnia(_baza: PortBazy, _dzien: string): Promise<{ rzedy: number }> {
  return niezaimplementowane('BR-DNI-001 wykonanieDnia');
}
