// Maszyna stanów projektu (moduly.md, „Projekt (F-19, F-33)”; ADR-0013).
import type { Wynik } from '../bledy';
import type { StanProjektu } from '../stany';

export type Projekt = { stan: StanProjektu; ukonczonoMs: number | null; usunietoMs: number | null };
export type ZdarzenieProjektu = 'ukoncz' | 'wznow' | 'usun' | 'przywroc';
const NIEDOZWOLONE = { ok: false, powod: 'niedozwolone_przejscie' } as const;

export function przejdzProjekt(p: Projekt, z: ZdarzenieProjektu, terazMs: number): Wynik<Projekt> {
  const usuniety = p.usunietoMs !== null;
  switch (z) {
    case 'ukoncz': // w_toku → ukonczony; w koszu żadnej zmiany poza przywróceniem
      return p.stan === 'w_toku' && !usuniety ? { ok: true, wartosc: { ...p, stan: 'ukonczony', ukonczonoMs: terazMs } } : NIEDOZWOLONE;
    case 'wznow':
      return p.stan === 'ukonczony' && !usuniety ? { ok: true, wartosc: { ...p, stan: 'w_toku', ukonczonoMs: null } } : NIEDOZWOLONE;
    case 'usun': // „dowolny” w tabeli; ponowne usunięcie z kosza nie zmienia terminu (bez przesunięcia usunieto_ms)
      return usuniety ? NIEDOZWOLONE : { ok: true, wartosc: { ...p, usunietoMs: terazMs } };
    case 'przywroc':
      return usuniety ? { ok: true, wartosc: { ...p, usunietoMs: null } } : NIEDOZWOLONE;
  }
}
/**
 * Sprzątanie przy starcie: true, gdy projekt usunięty co najmniej KOSZ_DNI temu; zegar cofnięty (teraz < usunieto_ms) niczego nie usuwa.
 * Warunek dwóch startów (`ostatni_start_ms`, P-110 Q5a) sprawdza przypadek użycia startu — sygnatura go nie przyjmuje (zgłoszenie 08 → 05).
 */
export function doSprzatniecia(p: Projekt, terazMs: number, koszDni: number): boolean {
  return p.usunietoMs !== null && terazMs >= p.usunietoMs && terazMs - p.usunietoMs >= koszDni * 86_400_000;
}
