// Eksport i import `.oczko` (ADR-0004, maszyna importu moduly.md, P-047, P-091 (6a)); pod CzasWTle.chron.
// sygnatura: propozycja 07, do zatwierdzenia w sesji fix 05 (Z07-22). Ciała: zaślepki roli 07 (E3).
import type { Wynik } from '../domena/bledy';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Manifest, TrybImportu, WynikImportu } from './porty-propozycja';
import type { ZaleznosciArchiwum } from './zaleznosci';

/** Najpierw scalenie dziennika +1 (R-063), sprawdzenie miejsca (ZAPAS_MIEJSCA_EKSPORTU), potem archiwum. */
export function eksportuj(_z: ZaleznosciArchiwum, _w: { katalogDocelowy: string }): Promise<Wynik<{ sciezka: string; manifest: Manifest }>> {
  return niezaimplementowane('BR-DAN-005 eksportuj');
}
/** sprawdzanie → wybór (scal / zastąp / anuluj) → kopia przed (tylko zastąp) → wczytywanie; przed wczytywaniem baza bez zmian. */
export function importuj(
  _z: ZaleznosciArchiwum,
  _w: { sciezka: string; wybierz: (m: Manifest) => Promise<TrybImportu | 'anuluj'> },
): Promise<Wynik<WynikImportu>> {
  return niezaimplementowane('BR-DAN-006 importuj');
}
