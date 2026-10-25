// Repozytorium wzorów: znacznik bieżącego rzędu (BR-WZR-003) i notatki w miejscu wzoru (BR-WZR-008).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciała: zaślepki roli 07 (E3).
import type { PortBazy } from '../../domena/porty';
import { niezaimplementowane } from '../../domena/zaslepka';

export function odczytajZnacznik(_baza: PortBazy, _wzorId: string): Promise<{ licznikId: string; strona: number; rzad: number } | null> {
  return niezaimplementowane('BR-WZR-003 odczytajZnacznik');
}
export function notatkiWzoru(_baza: PortBazy, _wzorId: string): Promise<{ rzad: number; tekst: string }[]> {
  return niezaimplementowane('BR-WZR-008 notatkiWzoru');
}
