// Odwzorowanie wiersz ↔ RekordIcloud (moduly.md „Kontrakt partii 7”; czyste funkcje, bez bazy). Rekord z sieci nie jest zaufany:
// encja tylko z kontraktu, nazwy pól tylko jako identyfikatory SQL, wartości tylko tekst, liczba albo null, klucz zgodny z polami.
import type { Wynik } from '../bledy';
import type { RekordIcloud } from '../porty';
import { tabelaIcloud, type TabelaIcloud } from './kontrakt';

export type WartoscPola = string | number | null;
export type Wiersz = Record<string, WartoscPola>;
const NAZWA_KOLUMNY = /^[a-z][a-z0-9_]*$/;

/** Klucz jak w wyzwalaczach `zmiana_icloud`: pojedynczy = wartość tekstem, złożony = json_array(kolumny) (np. ["w1",0]). */
export function kluczWiersza(t: TabelaIcloud, w: Readonly<Wiersz>): string {
  if (t.klucz.length === 1) return String(w[t.klucz[0]]);
  return JSON.stringify(t.klucz.map((k) => w[k] ?? null));
}
/** Wartości kolumn klucza w kolejności kontraktu (do WHERE / DELETE). */
export function wartosciKlucza(t: TabelaIcloud, klucz: string): Wynik<(string | number)[]> {
  if (t.klucz.length === 1) return { ok: true, wartosc: [klucz] };
  let v: unknown;
  try { v = JSON.parse(klucz); } catch { return { ok: false, powod: 'bledne_dane' }; }
  if (!Array.isArray(v) || v.length !== t.klucz.length || !v.every((x) => typeof x === 'string' || (typeof x === 'number' && Number.isFinite(x)))) return { ok: false, powod: 'bledne_dane' };
  return { ok: true, wartosc: v as (string | number)[] };
}

/** recordName CloudKit = "<encja>:<klucz>"; encja nie ma dwukropka, więc rozbiór po pierwszym. */
export const nazwaRekordu = (encja: string, klucz: string): string => `${encja}:${klucz}`;
export function rozbierzNazwe(nazwa: string): { encja: string; klucz: string } | null {
  const i = nazwa.indexOf(':');
  return i > 0 ? { encja: nazwa.slice(0, i), klucz: nazwa.slice(i + 1) } : null;
}

/** Wiersz bazy → rekord do wysłania; kolumny `pomin` nie jadą (licznik: wartość i głowa liczone u odbiorcy przez `scal`). */
export function rekordZWiersza(t: TabelaIcloud, w: Readonly<Wiersz>, sciezkaPliku: string | null): RekordIcloud {
  const pola: Wiersz = {};
  for (const [k, v] of Object.entries(w)) if (!t.pomin.includes(k)) pola[k] = v;
  return { encja: t.tabela, klucz: kluczWiersza(t, w), pola, plik: t.zasob ? sciezkaPliku : null };
}

/** Rekord z iCloud → tabela i wiersz do zapisu; każde odstępstwo od kontraktu = `bledne_dane` (wpis w `blad`, rekord pominięty). */
export function wierszZRekordu(r: RekordIcloud): Wynik<{ tabela: TabelaIcloud; wiersz: Wiersz }> {
  const t = tabelaIcloud(r.encja);
  if (!t || typeof r.pola !== 'object' || r.pola === null) return { ok: false, powod: 'bledne_dane' };
  const wiersz: Wiersz = {};
  for (const [k, v] of Object.entries(r.pola)) {
    if (!NAZWA_KOLUMNY.test(k) || t.pomin.includes(k)) return { ok: false, powod: 'bledne_dane' };
    if (!(v === null || typeof v === 'string' || (typeof v === 'number' && Number.isFinite(v)))) return { ok: false, powod: 'bledne_dane' };
    wiersz[k] = v;
  }
  if (t.klucz.some((k) => wiersz[k] === undefined || wiersz[k] === null) || kluczWiersza(t, wiersz) !== r.klucz) return { ok: false, powod: 'bledne_dane' };
  if (t.tylkoKlucze && !t.tylkoKlucze.includes(String(wiersz[t.klucz[0]]))) return { ok: false, powod: 'bledne_dane' };
  return { ok: true, wartosc: { tabela: t, wiersz } };
}
