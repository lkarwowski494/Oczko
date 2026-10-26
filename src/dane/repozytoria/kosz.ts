// Pozycje „Recently deleted” (F-33, BR-DAN-008, P-026): projekty w koszu oraz części i liczniki w koszu, których rodzic nie jest w koszu
// (przywrócenie rodzica przywraca je razem z nim — C1, design-spec „Ekran Recently deleted”). Termin = dzień usunięcia (RD-16) + KOSZ_DNI.
import { dzienLokalny } from '../../domena/postep';
import type { PortBazy } from '../../domena/porty';
import { KOSZ_DNI } from '../../konfiguracja';
import { BladDanych } from '../../domena/bledy';
import { liczba, tekst, tekstLubNull, wiersze } from './wiersze';

const plusDni = (dzien: string, n: number): string => { const [r, m, d] = dzien.split('-').map(Number); return new Date(Date.UTC(r, m - 1, d + n)).toISOString().slice(0, 10); };

export type ElementKosza = {
  rodzaj: 'projekt' | 'czesc' | 'licznik'; id: string; nazwa: string; nienazwany: boolean; rodzajLicznika: 'rzedy' | 'oczka' | null;
  projekt: string; czesc: string | null; usunietoMs: number; doDnia: string;
};

const SQL = `
  SELECT 'projekt' AS rodzaj, p.id, p.nazwa, p.nienazwany, NULL AS rodzaj_licznika, p.nazwa AS projekt, NULL AS czesc, p.usunieto_ms
    FROM projekt p WHERE p.usunieto_ms IS NOT NULL
  UNION ALL
  SELECT 'czesc', c.id, c.nazwa, 0, NULL, p.nazwa, NULL, c.usunieto_ms
    FROM czesc c JOIN projekt p ON p.id = c.projekt_id WHERE c.usunieto_ms IS NOT NULL AND p.usunieto_ms IS NULL
  UNION ALL
  SELECT 'licznik', l.id, l.nazwa, 0, l.rodzaj, p.nazwa, c.nazwa, l.usunieto_ms
    FROM licznik l JOIN czesc c ON c.id = l.czesc_id JOIN projekt p ON p.id = c.projekt_id
   WHERE l.usunieto_ms IS NOT NULL AND c.usunieto_ms IS NULL AND p.usunieto_ms IS NULL
  ORDER BY usunieto_ms, id`;

/** Od najkrótszego terminu (najdawniej usunięte). `strefa` = strefa chwili odczytu (dzień usunięcia liczony lokalnie, RD-16). */
export async function elementyKosza(baza: PortBazy, strefa: string): Promise<ElementKosza[]> {
  return (await wiersze(baza.all(SQL), 'elementyKosza')).map((r) => {
    const usunietoMs = liczba(r, 'usunieto_ms');
    const dzien = dzienLokalny(usunietoMs, strefa);
    if (!dzien.ok) throw new BladDanych(`elementyKosza: strefa ${strefa}`); // brak terminu nie jest zgadywany
    const rl = tekstLubNull(r, 'rodzaj_licznika');
    const rodzaj = tekst(r, 'rodzaj');
    return {
      rodzaj: rodzaj === 'projekt' ? 'projekt' : rodzaj === 'czesc' ? 'czesc' : 'licznik', id: tekst(r, 'id'), nazwa: tekst(r, 'nazwa'), nienazwany: liczba(r, 'nienazwany') === 1,
      rodzajLicznika: rl === null ? null : rl === 'oczka' ? 'oczka' : 'rzedy', projekt: tekst(r, 'projekt'), czesc: tekstLubNull(r, 'czesc'), usunietoMs,
      doDnia: plusDni(dzien.wartosc, KOSZ_DNI),
    };
  });
}
