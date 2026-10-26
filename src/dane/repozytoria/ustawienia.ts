// Klucze tabeli `ustawienie` (dane.md „Klucze tabeli ustawienie”): wartość JSON; nowy klucz wymaga wiersza w tej tabeli dokumentu.
import type { PortBazy } from '../../domena/porty';
import { tekst, wiersze } from './wiersze';

export type KluczUstawienia = 'okno_uczciwe_zasady_widziane' | 'ostatnie_miejsce' | 'ostatni_start_ms' | 'icloud_uzytkownik' | 'ostatnia_prosba_o_ocene' | 'jezyk';

export async function odczytajUstawienie(tx: PortBazy, klucz: KluczUstawienia): Promise<unknown> {
  const [w] = await wiersze(tx.all('SELECT wartosc FROM ustawienie WHERE klucz = ?', [klucz]), 'ustawienie');
  return w ? JSON.parse(tekst(w, 'wartosc')) : undefined; // undefined = brak klucza (nie „wartość domyślna”)
}
export async function zapiszUstawienie(tx: PortBazy, klucz: KluczUstawienia, wartosc: unknown, terazMs: number): Promise<void> {
  await tx.run(
    `INSERT INTO ustawienie (klucz, wartosc, zmieniono_ms) VALUES (?, ?, ?)
     ON CONFLICT (klucz) DO UPDATE SET wartosc = excluded.wartosc, zmieniono_ms = excluded.zmieniono_ms`,
    [klucz, JSON.stringify(wartosc), terazMs],
  );
}
/** `ostatni_start_ms` (P-110 Q5a): liczba całkowita albo brak; zły zapis = brak (czeka na następny start, nigdy nie kasuje). */
export async function ostatniStartMs(tx: PortBazy): Promise<number | null> {
  const v = await odczytajUstawienie(tx, 'ostatni_start_ms');
  return typeof v === 'number' && Number.isInteger(v) ? v : null;
}
