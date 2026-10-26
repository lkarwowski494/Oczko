// Przywrócenie kopii (ADR-0020 (5), (5′); tryb awaryjny ADR-0019 i Stan danych): sprawdzenie, kopia przed, dane z kopii przez port.
import type { Wynik } from '../domena/bledy';
import { przywrocZKopii } from '../dane/kopia-ratunkowa';
import { wKolejce } from './kolejka';
import type { ZaleznosciArchiwum } from './zaleznosci';

/**
 * Jedna pozycja kolejki zapisów (ATTACH → transakcja → DETACH, ADR-0020 (5′)): zapis z ekranu wysłany w trakcie czeka i trafia do danych
 * po przywróceniu; całość pod `CzasWTle.chron`, wygaśnięcie → ROLLBACK, baza bez zmian (ADR-0002 (7)).
 */
export function przywrocKopie(z: Pick<ZaleznosciArchiwum, 'baza' | 'zegar' | 'katalogi' | 'czasWTle'>, sciezka: string): Promise<Wynik<{ kopiaPrzed: string }>> {
  return z.czasWTle.chron('przywrocenie', (sygnal) => wKolejce(z.baza, () => przywrocZKopii(z, sciezka, sygnal)));
}
