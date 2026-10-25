// Sprzątanie „Ostatnio usuniętych” przy starcie (P-026, KOSZ_DNI; pliki bez odwołań po COMMIT, ADR-0001).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22).
// Warunek dwóch startów w domenie (`doSprzatniecia`, P-118 W2): `ostatni_start_ms` czytany z `ustawienie` przed sprzątaniem.
import type { Wynik } from '../domena/bledy';
import { doSprzatniecia } from '../domena/maszyny/projekt';
import type { PortBazy } from '../domena/porty';
import { KOSZ_DNI, PLIKI_OCHRONA_MIN } from '../konfiguracja';
import { ostatniStartMs } from '../dane/repozytoria/ustawienia';
import { liczba, tekst, wiersze } from '../dane/repozytoria/wiersze';
import { wKolejce } from './kolejka';
import { wTransakcji } from './zapis';
import type { ZaleznosciPlikow } from './zaleznosci';

export type WynikSprzatania = { projekty: number; czesci: number; liczniki: number; pliki: number };

const ODWOLANIA = `SELECT pdf_sha256 AS h FROM wzor UNION SELECT oryginal_sha256 FROM wzor UNION SELECT plik_sha256 FROM rysunek UNION SELECT plik_sha256 FROM zdjecie`;
/** Pliki odwoływane przez wiersze projektu (wzory, rysunki, zdjęcia) — kandydaci do usunięcia po trwałym usunięciu projektu. */
const PLIKI_PROJEKTU = `SELECT pdf_sha256 AS h FROM wzor WHERE projekt_id = ?1 UNION SELECT oryginal_sha256 FROM wzor WHERE projekt_id = ?1
  UNION SELECT r.plik_sha256 FROM rysunek r JOIN wzor w ON w.id = r.wzor_id WHERE w.projekt_id = ?1 UNION SELECT plik_sha256 FROM zdjecie WHERE projekt_id = ?1`;

async function usunieci(tx: PortBazy, sql: string): Promise<{ id: string; usunietoMs: number }[]> {
  return (await wiersze(tx.all(sql), 'sprzatnijKosz')).map((r) => ({ id: tekst(r, 'id'), usunietoMs: liczba(r, 'usunieto_ms') }));
}

/** Bez kolejki: woła ją pozycja kolejki startu (`uruchomDane`). Pliki usuwane z magazynu po COMMIT, w tej samej pozycji kolejki. */
export async function sprzatnijKoszWKolejce(z: ZaleznosciPlikow): Promise<Wynik<WynikSprzatania>> {
  const doUsuniecia: string[] = [];
  const w = await wTransakcji(z, 'sprzatnijKosz', async (tx, teraz): Promise<Wynik<WynikSprzatania>> => {
    const ostatni = await ostatniStartMs(tx);
    const doKosza = (u: { usunietoMs: number }) => doSprzatniecia({ stan: 'w_toku', ukonczonoMs: null, usunietoMs: u.usunietoMs }, teraz, ostatni, KOSZ_DNI);
    const projekty = (await usunieci(tx, 'SELECT id, usunieto_ms FROM projekt WHERE usunieto_ms IS NOT NULL')).filter(doKosza);
    const czesci = (await usunieci(tx, 'SELECT c.id, c.usunieto_ms FROM czesc c JOIN projekt p ON p.id = c.projekt_id WHERE c.usunieto_ms IS NOT NULL AND p.usunieto_ms IS NULL')).filter(doKosza);
    const liczniki = (await usunieci(tx,
      'SELECT l.id, l.usunieto_ms FROM licznik l JOIN czesc c ON c.id = l.czesc_id JOIN projekt p ON p.id = c.projekt_id WHERE l.usunieto_ms IS NOT NULL AND c.usunieto_ms IS NULL AND p.usunieto_ms IS NULL')).filter(doKosza);
    const kandydaci = new Set<string>();
    for (const p of projekty) {
      for (const r of await wiersze(tx.all(PLIKI_PROJEKTU, [p.id]), 'sprzatnijKosz')) if (r.h !== null) kandydaci.add(tekst(r, 'h'));
      await tx.run('DELETE FROM projekt WHERE id = ?', [p.id]); // kaskada: części, liczniki, historia, wzory; dni limitu zostają (P-072 (8a))
    }
    for (const c of czesci) await tx.run('DELETE FROM czesc WHERE id = ?', [c.id]);
    for (const l of liczniki) await tx.run('DELETE FROM licznik WHERE id = ?', [l.id]);
    const uzywane = new Set((await wiersze(tx.all(ODWOLANIA), 'sprzatnijKosz')).filter((r) => r.h !== null).map((r) => tekst(r, 'h')));
    // Pliki zwolnione przez to usunięcie + stare pliki bez odwołań; młodsze niż PLIKI_OCHRONA_MIN mogą czekać na wiersz (import w toku, Z07-15).
    const sieroty = (await wiersze(tx.all('SELECT sha256 FROM plik WHERE utworzono_ms <= ?', [teraz - PLIKI_OCHRONA_MIN * 60_000]), 'sprzatnijKosz')).map((r) => tekst(r, 'sha256'));
    for (const h of [...kandydaci, ...sieroty]) {
      if (uzywane.has(h) || doUsuniecia.includes(h)) continue;
      await tx.run('DELETE FROM plik WHERE sha256 = ?', [h]);
      doUsuniecia.push(h);
    }
    return { ok: true, wartosc: { projekty: projekty.length, czesci: czesci.length, liczniki: liczniki.length, pliki: doUsuniecia.length } };
  });
  if (w.ok) for (const h of doUsuniecia) await z.magazyn.usun(h); // po COMMIT (ADR-0001)
  return w;
}

export function sprzatnijKosz(z: ZaleznosciPlikow): Promise<Wynik<WynikSprzatania>> {
  return wKolejce(z.baza, () => sprzatnijKoszWKolejce(z));
}
