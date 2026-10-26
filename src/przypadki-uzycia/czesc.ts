// Przypadki użycia części i licznika z menu ••• (prototyp.html:129–138): nazwa części, cel części (U-8), przypomnienie (F-06, RD-13),
// długość powtórzenia (F-05, RD-12). Każdy zapis to UPDATE/INSERT jednej rzeczy w kolejce (ADR-0002); walidacja reguł w domenie.
import type { Wynik } from '../domena/bledy';
import { planPrzypomnien } from '../domena/przypomnienia';
import { OK, blad, operacjaZapisu } from './zapis';
import type { Zaleznosci } from './zaleznosci';

const calkowita = (n: unknown, min: number): n is number => typeof n === 'number' && Number.isInteger(n) && n >= min;

export function nazwijCzesc(z: Zaleznosci, w: { czescId: string; nazwa: string }): Promise<Wynik<void>> {
  if (typeof w.nazwa !== 'string' || w.nazwa.trim().length === 0) return Promise.resolve(blad('bledne_dane'));
  return operacjaZapisu(z, 'nazwijCzesc', async (tx, teraz) => {
    const r = await tx.run('UPDATE czesc SET nazwa = ?, zmieniono_ms = ? WHERE id = ? AND usunieto_ms IS NULL', [w.nazwa.trim(), teraz, w.czescId]);
    return r.zmiany === 1 ? OK : blad('bledne_dane');
  });
}
/** Cel części w rzędach (U-8); `null` usuwa cel. */
export function ustawCel(z: Zaleznosci, w: { czescId: string; cel: number | null }): Promise<Wynik<void>> {
  if (w.cel !== null && !calkowita(w.cel, 1)) return Promise.resolve(blad('bledne_dane'));
  return operacjaZapisu(z, 'ustawCel', async (tx, teraz) => {
    const r = await tx.run('UPDATE czesc SET cel_rzedow = ?, zmieniono_ms = ? WHERE id = ? AND usunieto_ms IS NULL', [w.cel, teraz, w.czescId]);
    return r.zmiany === 1 ? OK : blad('bledne_dane');
  });
}
/** Przypomnienie „od rzędu s, co N, M razy” (F-06); plan sprawdza domena (RD-13: N ≥ 1), s ≥ 1, M ≥ 1 (CHECK schematu). */
export function dodajPrzypomnienie(z: Zaleznosci, w: { licznikId: string; od: number; co: number; razy: number; tekst: string }): Promise<Wynik<{ id: string }>> {
  const plan = planPrzypomnien({ od: w.od, co: w.co, razy: w.razy });
  if (!plan.ok || !calkowita(w.od, 1) || !calkowita(w.razy, 1) || typeof w.tekst !== 'string') return Promise.resolve(blad('bledne_dane'));
  return operacjaZapisu(z, 'dodajPrzypomnienie', async (tx, teraz) => {
    const [l] = await tx.all<{ n: number }>('SELECT count(*) AS n FROM licznik WHERE id = ? AND usunieto_ms IS NULL', [w.licznikId]);
    if (!l || l.n !== 1) return blad('bledne_dane');
    const id = z.id.nowy();
    await tx.run('INSERT INTO przypomnienie (id, licznik_id, od_rzedu, co_n, razy, tekst, zmieniono_ms) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, w.licznikId, w.od, w.co, w.razy, w.tekst.trim(), teraz]);
    return { ok: true, wartosc: { id } };
  });
}
/** Długość powtórzenia licznika (F-05, RD-12-W5: ≥ 1) i jego nazwa; `null` wyłącza powtórzenie. */
export function ustawPowtorzenie(z: Zaleznosci, w: { licznikId: string; dlugosc: number | null; nazwa?: string }): Promise<Wynik<void>> {
  if (w.dlugosc !== null && !calkowita(w.dlugosc, 1)) return Promise.resolve(blad('bledne_dane'));
  return operacjaZapisu(z, 'ustawPowtorzenie', async (tx, teraz) => {
    const r = await tx.run('UPDATE licznik SET dlugosc_powtorzenia = ?, nazwa = coalesce(?, nazwa), zmieniono_ms = ? WHERE id = ? AND usunieto_ms IS NULL',
      [w.dlugosc, w.nazwa?.trim() ?? null, teraz, w.licznikId]);
    return r.zmiany === 1 ? OK : blad('bledne_dane');
  });
}
