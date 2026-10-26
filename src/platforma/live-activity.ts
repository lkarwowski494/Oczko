// Adapter portu LiveActivity (ADR-0008 (7), moduly.md „Porty domeny”): stan v2 jako JSON do modułu Swift; `urzadzenie` w atrybutach aktywności
// (pole linii dziennika z intencji). Live Activity wyłączone w ustawieniach systemu → `niedozwolone_przejscie`; wyjątek modułu → `zapis`.
import type { Wynik } from '../domena/bledy';
import type { LiveActivity, StanEkranuBlokady } from '../domena/porty';
import { natywny as modul, type OczkoDziennikPlusNatywny } from '../../modules/oczko-dziennik-plus';

type Natywny = Pick<OczkoDziennikPlusNatywny, 'liveStart' | 'liveAktualizuj' | 'liveZakoncz' | 'liveDostepne'>;

export function liveActivity(urzadzenie: string, natywny: Natywny = modul()): LiveActivity {
  return {
    async start(s: StanEkranuBlokady): Promise<Wynik<void>> {
      if (!natywny.liveDostepne()) return { ok: false, powod: 'niedozwolone_przejscie' };
      try {
        await natywny.liveStart(JSON.stringify(s), urzadzenie);
        return { ok: true, wartosc: undefined };
      } catch {
        return { ok: false, powod: 'zapis' };
      }
    },
    // Aktualizacja i koniec: błąd modułu nie przerywa zapisu w aplikacji (stan Live Activity to widok, dane są w bazie i dzienniku).
    aktualizuj: (s) => natywny.liveAktualizuj(JSON.stringify(s)).catch(() => undefined),
    zakoncz: () => natywny.liveZakoncz().catch(() => undefined),
  };
}
