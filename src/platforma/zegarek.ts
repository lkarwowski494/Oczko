// Adapter portu Zegarek (ADR-0009): stan v2 do zegarka przez moduł Swift (updateApplicationContext); zdarzenia z zegarka zapisuje moduł
// do dziennika +1 (jedyny pisarz), a `odbieraj` dostaje je tylko jako sygnał do scalenia dziennika (źródłem prawdy jest dziennik).
import type { StanZegarka, Zegarek, ZdarzenieWejsciowe } from '../domena/porty';
import { parsujDziennik } from '../dane/dziennik';
import { natywny as modul, type OczkoDziennikPlusNatywny } from '../../modules/oczko-dziennik-plus';

type Natywny = Pick<OczkoDziennikPlusNatywny, 'zegarekWyslij' | 'addListener'>;

export function zegarek(natywny: Natywny = modul()): Zegarek {
  return {
    // Błąd wysyłki nie przerywa zapisu w aplikacji (zegarek dostanie kolejny stan); brak zegarka obsługuje moduł.
    wyslijStan: (s: StanZegarka) => natywny.zegarekWyslij(JSON.stringify(s)).catch(() => undefined),
    odbieraj(fn: (z: ZdarzenieWejsciowe[]) => void) {
      const sub = natywny.addListener('zegarekZdarzenia', (e) => fn(parsujDziennik(e.linie.map((l) => `${l}\n`).join('')).zdarzenia));
      return () => sub.remove();
    },
  };
}
