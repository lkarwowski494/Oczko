// Postęp projektu (RD-14, F-60), cel dzienny do terminu (RD-15, F-61), dzień lokalny (RD-16, F-59), początek tygodnia (RD-20).
// Daty RRRR-MM-DD liczone na kalendarzu (dzień od 1970-01-01 w UTC), nigdy z różnicy chwil (doba 23/25 h, ER-38).
import type { Wynik } from './bledy';

export type CzescPostepu = { rzedy: number; cel: number | null };
export type CelDnia = { rodzaj: 'cel'; rzedy: number } | { rodzaj: 'osiagniety' } | { rodzaj: 'po_terminie'; zostalo: number };

const BLAD = { ok: false, powod: 'bledne_dane' } as const;
const calkowita = (n: number): boolean => Number.isInteger(n) && n >= 0;

/** Σ min(r_i, c_i) i Σ c_i po częściach z celem (RD-14); część bez celu nie wchodzi. */
function sumy(czesci: readonly CzescPostepu[]): { zrobione: number; cel: number } | null {
  let zrobione = 0;
  let cel = 0;
  for (const c of czesci) {
    if (!calkowita(c.rzedy) || (c.cel !== null && !(Number.isInteger(c.cel) && c.cel > 0))) return null;
    if (c.cel === null) continue;
    zrobione += Math.min(c.rzedy, c.cel);
    cel += c.cel;
  }
  return { zrobione, cel };
}

export function postepProcent(czesci: CzescPostepu[]): Wynik<number> {
  const s = sumy(czesci);
  if (!s || s.cel === 0) return BLAD; // RD-14-W6: Σ c_i = 0
  // ⌊100 × Z / C⌋ na liczbach całkowitych (ER-38, R-127: 100 × 0,29 daje 28,999…).
  const licznik = 100 * s.zrobione;
  return { ok: true, wartosc: (licznik - (licznik % s.cel)) / s.cel };
}

/** Numer dnia kalendarzowego (dni od 1970-01-01) dla RRRR-MM-DD; data spoza kalendarza (2026-02-30) → null. */
function numerDnia(data: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  if (!m) return null;
  const [r, mies, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const ms = Date.UTC(r, mies - 1, d);
  const t = new Date(ms);
  if (t.getUTCFullYear() !== r || t.getUTCMonth() !== mies - 1 || t.getUTCDate() !== d) return null;
  return Math.round(ms / 86_400_000);
}
function dataZNumeru(n: number): string {
  return new Date(n * 86_400_000).toISOString().slice(0, 10);
}

/** RD-15 (W8–W10, ER-38): d = (termin − dziś) + 1 na datach kalendarzowych RRRR-MM-DD, nie z różnicy chwil. Sygnatura 08 (P-114 Q2a). */
export function dniDoTerminu(dzis: string, termin: string): Wynik<number> {
  const a = numerDnia(dzis);
  const b = numerDnia(termin);
  if (a === null || b === null) return BLAD;
  return { ok: true, wartosc: b - a + 1 };
}

/** RD-15: C = suma celów, przedDzis = rzędy przed dziś (min z celem), daty lokalne RRRR-MM-DD. */
export function celDzienny(w: { suma: number; przedDzis: number; termin: string; dzis: string }): Wynik<CelDnia> {
  if (!(Number.isInteger(w.suma) && w.suma > 0) || !calkowita(w.przedDzis)) return BLAD; // RD-15-W7: C > 0 (ostre)
  const d = dniDoTerminu(w.dzis, w.termin);
  if (!d.ok) return d;
  const reszta = w.suma - Math.min(w.przedDzis, w.suma);
  // R ≤ 0 przed sprawdzeniem terminu: przy d < 1 i R = 0 komunikat jest [DO USTALENIA] 01 (test 07 pomija ten przypadek).
  if (reszta <= 0) return { ok: true, wartosc: { rodzaj: 'osiagniety' } };
  if (d.wartosc < 1) return { ok: true, wartosc: { rodzaj: 'po_terminie', zostalo: reszta } };
  return { ok: true, wartosc: { rodzaj: 'cel', rzedy: Math.ceil(reszta / d.wartosc) } };
}

const formaty = new Map<string, Intl.DateTimeFormat>();
/** RD-16: data lokalna RRRR-MM-DD (kalendarz gregoriański, cyfry ASCII) w strefie IANA w chwili ms; język urządzenia nie wpływa (R-134). */
export function dzienLokalny(ms: number, strefa: string): Wynik<string> {
  if (!Number.isFinite(ms)) return BLAD; // RD-16-W6: brak chwili
  let f = formaty.get(strefa);
  if (!f) {
    try {
      f = new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn', { timeZone: strefa, year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return BLAD; // nieznana strefa IANA (RangeError)
    }
    formaty.set(strefa, f);
  }
  const czesci: Record<string, string> = {};
  for (const p of f.formatToParts(new Date(ms))) czesci[p.type] = p.value;
  const { year, month, day } = czesci;
  if (!year || !month || !day) return BLAD;
  return { ok: true, wartosc: `${year.padStart(4, '0')}-${month}-${day}` };
}

/** RD-20 (P-110 Q7, jak Trening `thisMonday`): poniedziałek tygodnia dnia RRRR-MM-DD, dla każdego regionu. Sygnatura 08 (P-114 Q2a). */
export function poczatekTygodnia(dzien: string): Wynik<string> {
  const n = numerDnia(dzien);
  if (n === null) return BLAD; // RD-20-W9: data spoza kalendarza
  const dzienTygodnia = (new Date(n * 86_400_000).getUTCDay() + 6) % 7; // poniedziałek = 0 … niedziela = 6
  return { ok: true, wartosc: dataZNumeru(n - dzienTygodnia) };
}
