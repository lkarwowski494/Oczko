// Posiedzenie dla kresek na liczniku (design-spec „Kreski sesji przez północ”, :242–:244; P-126 (6a), N2; P-097 (4a)).
// Zaczyna je pierwsze +1 po przerwie ≥ PRZERWA_NOWEGO_DNIA_MS albo start stopera (posiedzenie = sesja stopera); kończy taka przerwa
// (kreski poprzedniego widać do następnego +1, więc funkcja nie patrzy na „teraz”) albo zatrzymanie stopera. Północ go nie przerywa.
import { PRZERWA_NOWEGO_DNIA_MS } from '../konfiguracja';

export type Posiedzenie = { rzedy: number; odMs: number } | null;

/** `dodaniaMs`: czasy +1 nieobjętych cofnięciem, od najnowszego; `stoper`: ostatnia sesja stopera projektu (koniecMs null = trwa albo wstrzymana). */
export function posiedzenie(w: { dodaniaMs: readonly number[]; stoper: { startMs: number; koniecMs: number | null } | null }): Posiedzenie {
  const s = w.stoper;
  if (s && s.koniecMs === null) return { rzedy: w.dodaniaMs.filter((t) => t >= s.startMs).length, odMs: s.startMs };
  const po = s ? w.dodaniaMs.filter((t) => t > (s.koniecMs ?? s.startMs)) : w.dodaniaMs;
  const [pierwsze] = po;
  if (pierwsze === undefined) return null;
  let i = 0;
  while (i + 1 < po.length && (po[i] ?? 0) - (po[i + 1] ?? 0) < PRZERWA_NOWEGO_DNIA_MS) i += 1;
  return { rzedy: i + 1, odMs: po[i] ?? pierwsze };
}
