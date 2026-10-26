// Adapter portu DziennikPlus na urządzeniu (ADR-0008): źródło tekstu = moduł Swift OczkoDziennikPlus (jedyny pisarz, kolejka szeregowa);
// odczyt i diagnostyka w TS (src/dane/dziennik.ts). `natywny` wstrzykiwany (test na atrapie), domyślnie moduł aplikacji.
import type { DziennikPlus, PortBazy } from '../domena/porty';
import { utworzDziennik } from '../dane/dziennik';
import { natywny as modul, type OczkoDziennikPlusNatywny } from '../../modules/oczko-dziennik-plus';

export function dziennikUrzadzenia(baza: PortBazy, natywny: Pick<OczkoDziennikPlusNatywny, 'odczytajTekst' | 'skroc'> = modul()): DziennikPlus {
  return utworzDziennik({ tekst: () => natywny.odczytajTekst(), skroc: (doId) => natywny.skroc(doId) }, baza);
}
