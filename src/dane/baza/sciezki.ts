// Ścieżki danych aplikacji (ADR-0001: Application Support, nie Documents ani Caches; ADR-0015: nowa ścieżka bazy, stary plik nietknięty).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciało: zaślepka roli 07 (E3).
import { niezaimplementowane } from '../../domena/zaslepka';

export type SciezkiDanych = { baza: string; pliki: string; kopie: string; dziennik: string; stanStartu: string };
/** `katalogBiblioteki` = katalog `Library` kontenera aplikacji. */
export function sciezkiDanych(_katalogBiblioteki: string): SciezkiDanych {
  return niezaimplementowane('ADR-0001 sciezkiDanych');
}
