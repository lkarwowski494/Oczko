// Repozytorium kalendarza dni z robótką, dnia, podsumowania okresu i kolejności „który projekt dziś” (F-59, F-61; RD-15, RD-16;
// P-046, P-048 (3), (4), (6); P-059 (2a): dzień z robótką ≠ dzień limitu).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciała: zaślepki roli 07 (E3).
import type { CelDnia } from '../../domena/postep';
import type { PortBazy } from '../../domena/porty';
import { niezaimplementowane } from '../../domena/zaslepka';

/** Dni miesiąca `RRRR-MM` z robótką: zmiana +1/−1 licznika rzędów (dzień ze zdarzenia, RD-16), bez wpisań, zerowań i zmian cofniętych. Rosnąco. */
export function dniZRobotka(_baza: PortBazy, _miesiac: string): Promise<string[]> {
  return niezaimplementowane('BR-DNI-001 dniZRobotka');
}
/** `czasMs` = suma sesji stopera projektu z dniem `dzien`; null, gdy sesji nie było (P-048 (6)). */
export type ProjektDnia = { projektId: string; nazwa: string; rzedy: number; czasMs: number | null };
export function szczegolyDnia(_baza: PortBazy, _dzien: string): Promise<ProjektDnia[]> {
  return niezaimplementowane('BR-DNI-002 szczegolyDnia');
}
/** `pierwszyDzienTygodnia`: 1 = poniedziałek … 7 = niedziela (z regionu, Intl/CLDR, ADR-0017). */
export type Podsumowanie = { od: string; do: string; rzedy: number; czasMs: number | null; ukonczone: number; poprzednie: { rzedy: number } };
export function podsumowanieTygodnia(_baza: PortBazy, _w: { dzis: string; pierwszyDzienTygodnia: 1 | 2 | 3 | 4 | 5 | 6 | 7 }): Promise<Podsumowanie> {
  return niezaimplementowane('BR-DNI-003 podsumowanieTygodnia');
}
/** Projekty w toku (bez kosza) w kolejności P-048 (4): po terminie, potem cel na dziś malejąco, potem bez terminu według ostatniej pracy. */
export type ProjektDzis = { id: string; nazwa: string; cel: CelDnia | null };
export function kolejnoscProjektow(_baza: PortBazy, _dzis: string): Promise<ProjektDzis[]> {
  return niezaimplementowane('BR-DNI-006 kolejnoscProjektow');
}
