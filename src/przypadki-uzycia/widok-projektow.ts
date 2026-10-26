// Model odczytu listy projektów (F-50, F-54, P-065 (2a); design-spec „Lista projektów”, „Projekt roboczy”): same dane, teksty i wyszukiwanie po
// etykiecie roboczej liczy kompozycja (etykieta zależy od języka, P-126 (1b)). Kolejność i kosz jak `listaProjektow` (BR-PRJ-012).
import type { Wynik } from '../domena/bledy';
import { mozeZaczacDzien } from '../domena/limit';
import { LIMIT_DNI_W_MIESIACU } from '../konfiguracja';
import { dniLimituMiesiaca, ostatniPlus } from '../dane/repozytoria/liczniki';
import { listaProjektow } from '../dane/repozytoria/projekty';
import { liczba, liczbaLubNull, tekst, tekstLubNull, wiersze } from '../dane/repozytoria/wiersze';
import { dodajDni } from './daty';
import { operacjaZapisu } from './zapis';
import type { Zaleznosci } from './zaleznosci';

export type ProjektNaEkranie = {
  id: string; nazwa: string; nienazwany: boolean; utworzonoMs: number; ostatniaPracaMs: number;
  /** Pierwszy licznik rzędów pierwszej części (otwierany z listy, F-49); `null` = projekt bez licznika. */
  licznik: { id: string; czesc: string; wartosc: number; cel: number | null } | null;
};
export type WidokProjektow = { wToku: ProjektNaEkranie[]; ukonczone: ProjektNaEkranie[]; dni: { zostalo: number; limit: number; dzis: string } | null };

export function widokProjektow(z: Zaleznosci): Promise<Wynik<WidokProjektow>> {
  return operacjaZapisu(z, 'widokProjektow', async (tx, teraz, chwila) => {
    const l = await listaProjektow(tx);
    const dodatki = new Map<string, { nienazwany: boolean; utworzonoMs: number; licznik: ProjektNaEkranie['licznik'] }>();
    for (const r of await wiersze(tx.all(
      `SELECT p.id, p.nienazwany, p.utworzono_ms,
              (SELECT l.id FROM czesc c JOIN licznik l ON l.czesc_id = c.id WHERE c.projekt_id = p.id AND c.usunieto_ms IS NULL AND l.usunieto_ms IS NULL
                ORDER BY c.kolejnosc, l.kolejnosc LIMIT 1) AS licznik_id
         FROM projekt p WHERE p.usunieto_ms IS NULL`), 'widokProjektow')) {
      const lid = tekstLubNull(r, 'licznik_id');
      let licznik: ProjektNaEkranie['licznik'] = null;
      if (lid) {
        const [x] = await wiersze(tx.all('SELECT l.wartosc, c.nazwa, c.cel_rzedow FROM licznik l JOIN czesc c ON c.id = l.czesc_id WHERE l.id = ?', [lid]), 'widokProjektow');
        if (x) licznik = { id: lid, czesc: tekst(x, 'nazwa'), wartosc: liczba(x, 'wartosc'), cel: liczbaLubNull(x, 'cel_rzedow') };
      }
      dodatki.set(tekst(r, 'id'), { nienazwany: liczba(r, 'nienazwany') === 1, utworzonoMs: liczba(r, 'utworzono_ms'), licznik });
    }
    const naEkranie = (p: (typeof l.wToku)[number]): ProjektNaEkranie => {
      const d = dodatki.get(p.id) ?? { nienazwany: false, utworzonoMs: p.ostatniaPracaMs, licznik: null };
      return { id: p.id, nazwa: p.nazwa, ostatniaPracaMs: p.ostatniaPracaMs, ...d };
    };
    const dzis = chwila.dzien;
    const pro = z.pro();
    const zaw = mozeZaczacDzien({ dni: await dniLimituMiesiaca(tx, dzis.slice(0, 7)), dzis, teraz, ostatniPlus: await ostatniPlus(tx, dodajDni(dzis, -2)), pro });
    return { ok: true, wartosc: { wToku: l.wToku.map(naEkranie), ukonczone: l.ukonczone.map(naEkranie), dni: pro ? null : { zostalo: zaw.zostalo, limit: LIMIT_DNI_W_MIESIACU, dzis } } };
  });
}
