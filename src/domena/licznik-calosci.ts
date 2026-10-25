// Licznik całości kawałka zasilany przez sekcje rzędów (BR-LIC-018, F-46; schemat.sql `licznik.sekcja`: całość liczona, nie zapisywana).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciało: zaślepka roli 07 (E3).
import type { STANY } from './stany';

export type LicznikKawalka = { id: string; czescId: string; rodzaj: (typeof STANY)['licznik.rodzaj'][number]; sekcja: boolean; wartosc: number };
/** Suma wartości sekcji rzędów części `czescId`; liczniki innych części (osobnych kawałków) nie wchodzą. */
export function licznikCalosci(liczniki: readonly LicznikKawalka[], czescId: string): number {
  return liczniki.filter((l) => l.czescId === czescId && l.sekcja && l.rodzaj === 'rzedy').reduce((s, l) => s + l.wartosc, 0);
}
