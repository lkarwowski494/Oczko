// Zapis zużycia włóczki z karty ukończenia (F-37, BR-ZAP-002, U-9, P-126 (2a)): pozycja kolejki przypadków użycia wokół potwierdzZuzycie
// (jedna transakcja, różnica względem poprzedniego potwierdzenia, zapas nie poniżej 0). Nieudany zapis: wpis w `blad`, wynik do ekranu.
import type { Wynik } from '../domena/bledy';
import { potwierdzZuzycie } from '../dane/repozytoria/zapas';
import { zapiszBlad } from '../dane/repozytoria/bledy';
import { wKolejce } from './kolejka';
import type { Zaleznosci } from './zaleznosci';

export function zapiszZuzycie(z: Pick<Zaleznosci, 'baza' | 'zegar'>, w: { projektId: string; zuzycie: { wloczkaId: string; motki: number }[] }): Promise<Wynik<void>> {
  return wKolejce(z.baza, async () => {
    const terazMs = z.zegar.teraz().ms;
    const r = await potwierdzZuzycie(z.baza, { projektId: w.projektId, zuzycie: w.zuzycie, terazMs });
    if (!r.ok && r.powod !== 'bledne_dane') await zapiszBlad(z.baza, { czasMs: terazMs, kod: 'zapis_zuzycie', szczegoly: { powod: r.powod } }).catch(() => undefined);
    return r;
  });
}
