// Repozytorium projektów: lista „W toku” / „Ukończone”, wyszukiwanie (F-50, F-54; indeks projekt_lista).
// sygnatura: propozycja 07, do zatwierdzenia w sesji fix 05 (Z07-22). Ciało: zaślepka roli 07 (E3).
import type { PortBazy } from '../../domena/porty';
import type { StanProjektu } from '../../domena/stany';
import { niezaimplementowane } from '../../domena/zaslepka';

export type ProjektNaLiscie = { id: string; nazwa: string; stan: StanProjektu; ostatniaPracaMs: number; ukonczonoMs: number | null; czasPracyMs: number };
/** Bez projektów w koszu; „W toku” według ostatniej pracy malejąco (BR-PRJ-012). */
export function listaProjektow(_baza: PortBazy, _w?: { szukaj?: string }): Promise<{ wToku: ProjektNaLiscie[]; ukonczone: ProjektNaLiscie[] }> {
  return niezaimplementowane('BR-PRJ-012 listaProjektow');
}
