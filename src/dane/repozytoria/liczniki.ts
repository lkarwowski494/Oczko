// Repozytorium licznika i jego zdarzeń (moduly.md „Ścieżka zapisu +1”, ADR-0002, ADR-0005): odczyt stanu, dopisanie zdarzenia
// (historia tylko dopisywana), pamięć podręczna wartości, dni limitu (`zapis-dnia-limitu.sql`, dane.md) i ostatnia praca projektu.
import type { DzienLimitu } from '../../domena/limit';
import type { PortBazy } from '../../domena/porty';
import { BladDanych } from '../../domena/bledy';
import { STANY, type RodzajZdarzenia, type ZrodloZdarzenia } from '../../domena/stany';
import { liczba, liczbaLubNull, listaTekstow, tekst, tekstLubNull, wiersze } from './wiersze';

export type StanLicznika = {
  id: string; projektId: string; wartosc: number; glowa: string | null; zablokowany: boolean; konflikt: boolean;
  rodzaj: 'rzedy' | 'oczka'; usuniety: boolean; // usunięty licznik, część albo projekt (kosz, P-026)
};
export type NoweZdarzenie = {
  id: string; licznikId: string; rodzaj: RodzajZdarzenia; wartosc: number | null; wartoscPo: number; rodzice: string[]; cofa: string[];
  zrodlo: ZrodloZdarzenia; urzadzenie: string; czasMs: number; strefa: string; dzien: string;
};

export async function stanLicznika(tx: PortBazy, licznikId: string): Promise<StanLicznika | null> {
  const [w] = await wiersze(tx.all(
    `SELECT l.id, c.projekt_id, l.wartosc, l.glowa, l.zablokowany, l.konflikt, l.rodzaj,
            (l.usunieto_ms IS NOT NULL OR c.usunieto_ms IS NOT NULL OR p.usunieto_ms IS NOT NULL) AS usuniety
       FROM licznik l JOIN czesc c ON c.id = l.czesc_id JOIN projekt p ON p.id = c.projekt_id WHERE l.id = ?`, [licznikId]), 'stanLicznika');
  if (!w) return null;
  const rodzaj = tekst(w, 'rodzaj');
  return {
    id: tekst(w, 'id'), projektId: tekst(w, 'projekt_id'), wartosc: liczba(w, 'wartosc'), glowa: tekstLubNull(w, 'glowa'),
    zablokowany: liczba(w, 'zablokowany') === 1, konflikt: liczba(w, 'konflikt') === 1, rodzaj: rodzaj === 'oczka' ? 'oczka' : 'rzedy',
    usuniety: liczba(w, 'usuniety') === 1,
  };
}

export async function dopiszZdarzenie(tx: PortBazy, z: NoweZdarzenie): Promise<void> {
  await tx.run(
    `INSERT INTO zdarzenie (id, licznik_id, rodzaj, wartosc, wartosc_po, rodzice, cofa, zrodlo, urzadzenie, czas_ms, strefa, dzien)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [z.id, z.licznikId, z.rodzaj, z.wartosc, z.wartoscPo, JSON.stringify(z.rodzice), JSON.stringify(z.cofa), z.zrodlo, z.urzadzenie, z.czasMs, z.strefa, z.dzien],
  );
}
/** Pamięć podręczna wyniku `scal` w tej samej transakcji co zdarzenie (schemat.sql, `licznik.wartosc`). */
export async function ustawStan(tx: PortBazy, licznikId: string, s: { wartosc: number; glowa: string | null; konflikt?: boolean }): Promise<void> {
  if (s.konflikt === undefined) await tx.run('UPDATE licznik SET wartosc = ?, glowa = ? WHERE id = ?', [s.wartosc, s.glowa, licznikId]);
  else await tx.run('UPDATE licznik SET wartosc = ?, glowa = ?, konflikt = ? WHERE id = ?', [s.wartosc, s.glowa, s.konflikt ? 1 : 0, licznikId]);
}
export async function zapiszOstatniaPrace(tx: PortBazy, projektId: string, czasMs: number): Promise<void> {
  await tx.run('UPDATE projekt SET ostatnia_praca_ms = max(ostatnia_praca_ms, ?) WHERE id = ?', [czasMs, projektId]);
}

export type ZdarzenieZapisane = { id: string; rodzaj: RodzajZdarzenia; wartoscPo: number; rodzice: string[]; cofa: string[]; dzien: string };
export async function zdarzenie(tx: PortBazy, id: string): Promise<ZdarzenieZapisane | null> {
  const [w] = await wiersze(tx.all('SELECT id, rodzaj, wartosc_po, rodzice, cofa, dzien FROM zdarzenie WHERE id = ?', [id]), 'zdarzenie');
  if (!w) return null;
  const rodzaj = tekst(w, 'rodzaj');
  const r = STANY['zdarzenie.rodzaj'].find((x) => x === rodzaj);
  if (r === undefined) throw new BladDanych(`zdarzenie ${id}: nieznany rodzaj`); // CHECK w schemacie, więc stan niemożliwy
  return { id: tekst(w, 'id'), rodzaj: r, wartoscPo: liczba(w, 'wartosc_po'), rodzice: listaTekstow(w, 'rodzice'), cofa: listaTekstow(w, 'cofa'), dzien: tekst(w, 'dzien') };
}

/** Dni limitu miesiąca `RRRR-MM` (wejście `dni` funkcji limitu). */
export async function dniLimituMiesiaca(tx: PortBazy, miesiac: string): Promise<DzienLimitu[]> {
  const w = await wiersze(tx.all('SELECT dzien, pro FROM dzien_limitu WHERE dzien >= ? AND dzien < ? ORDER BY dzien', [`${miesiac}-01`, `${miesiac}-32`]), 'dniLimitu');
  return w.map((r) => ({ data: tekst(r, 'dzien'), pro: liczba(r, 'pro') === 1 }));
}
/** Czas poprzedniego +1 w dowolnym projekcie (limit.mjs: `ostatniPlus`); przerwa nowego dnia to godzina, więc wystarczą dni od `odDnia` (indeks zdarzenie_dzien). */
export async function ostatniPlus(tx: PortBazy, odDnia: string): Promise<number | null> {
  const [w] = await wiersze(tx.all("SELECT max(czas_ms) AS m FROM zdarzenie WHERE dzien >= ? AND rodzaj = 'plus'", [odDnia]), 'ostatniPlus');
  return w ? liczbaLubNull(w, 'm') : null;
}
/** dane.md „Dni limitu: zapis i scalenie”: jedna data = jeden wiersz, `pro` = OR, najwcześniejszy start; wiersza nigdy nie usuwa (L-16). */
export async function zapiszDzienLimitu(tx: PortBazy, d: { dzien: string; pro: boolean; zaczetoMs: number; zdarzenieId: string }): Promise<void> {
  await tx.run(
    `INSERT INTO dzien_limitu (dzien, pro, zaczeto_ms, zdarzenie_id) VALUES (?, ?, ?, ?)
     ON CONFLICT (dzien) DO UPDATE SET
       pro = max(pro, excluded.pro),
       zdarzenie_id = CASE WHEN excluded.zaczeto_ms < zaczeto_ms THEN excluded.zdarzenie_id ELSE zdarzenie_id END,
       zaczeto_ms = min(zaczeto_ms, excluded.zaczeto_ms)`,
    [d.dzien, d.pro ? 1 : 0, d.zaczetoMs, d.zdarzenieId],
  );
}
/** Łańcuch od głowy wstecz po pierwszym rodzicu, aż do `doId` włącznie; null, gdy `doId` nie leży na łańcuchu (cofnięcie serii z końca, P-091 (3a)). */
export async function seriaOdKonca(tx: PortBazy, glowa: string, doId: string): Promise<{ ids: string[]; rodzicPoczatku: string | null } | null> {
  const w = await wiersze(tx.all(
    `WITH RECURSIVE lancuch(id, rodzic, n) AS (
       SELECT id, json_extract(rodzice, '$[0]'), 0 FROM zdarzenie WHERE id = ?
       UNION ALL
       SELECT z.id, json_extract(z.rodzice, '$[0]'), l.n + 1 FROM zdarzenie z JOIN lancuch l ON z.id = l.rodzic WHERE l.id <> ?
     ) SELECT id, rodzic FROM lancuch ORDER BY n`, [glowa, doId]), 'seriaOdKonca');
  const ostatni = w[w.length - 1];
  if (!ostatni || tekst(ostatni, 'id') !== doId) return null;
  return { ids: w.map((r) => tekst(r, 'id')), rodzicPoczatku: tekstLubNull(ostatni, 'rodzic') };
}
