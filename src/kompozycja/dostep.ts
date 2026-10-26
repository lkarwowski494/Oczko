// Dostęp Pro w aplikacji (ADR-0010, KP-06, P-103 (3a)): odczyt transakcji ze sklepu → `decyzja` (domena); błąd odczytu → pamięć ostatniego stanu
// z oknem offline. Pamięć w pliku poza bazą (KP-06: poza danymi synchronizowanymi i archiwum). Poziom dla okna „Uczciwe zasady”: pewny stan
// darmowy tylko po udanym odczycie sklepu (P-103 (5a)); błąd odczytu bez Pro = „niepewny”.
import { decyzja, odczytajPamiec, type Pamiec } from '../domena/dostep';
import type { PoziomDostepu } from '../domena/limit';
import type { Sklep } from '../domena/porty';
import { PRODUKTY_PRO } from '../konfiguracja';
import type { AktywnePro } from '../ekrany/Oferty';

export type MagazynPamieci = { czytaj(): Promise<string | null>; zapisz(tekst: string): Promise<void> };
export type StanDostepu = { pro: boolean; poziom: PoziomDostepu; aktywne: AktywnePro; wygasa: number | null };

export function dostepPro(sklep: Sklep, magazyn: MagazynPamieci, terazMs: () => number) {
  let stan: StanDostepu = { pro: false, poziom: 'niepewny', aktywne: null, wygasa: null };
  const sluchacze = new Set<(s: StanDostepu) => void>();
  async function odswiez(): Promise<StanDostepu> {
    let pamiec: Pamiec = null;
    try { pamiec = odczytajPamiec(await magazyn.czytaj()); } catch { pamiec = null; }
    let transakcje: Awaited<ReturnType<Sklep['transakcje']>> | null = null;
    try { transakcje = await sklep.transakcje(); } catch { transakcje = null; }
    const d = decyzja(transakcje ? { zrodlo: 'sklep', uprawnienia: transakcje } : { zrodlo: 'blad' }, pamiec, terazMs(), PRODUKTY_PRO);
    if (transakcje) await magazyn.zapisz(JSON.stringify(d.pamiec ?? { produkty: [], wygasa: null })).catch(() => undefined);
    const produkty = d.pamiec?.produkty ?? [];
    const aktywne: AktywnePro = !d.dostep ? null
      : produkty.some((p) => p.endsWith('.lifetime')) ? { rodzaj: 'dozywotni' } : { rodzaj: 'subskrypcja', produkt: produkty[0] ?? '' };
    stan = { pro: d.dostep, poziom: d.dostep ? 'pro' : transakcje ? 'darmowa' : 'niepewny', aktywne, wygasa: d.pamiec?.wygasa ?? null };
    sluchacze.forEach((f) => f(stan));
    return stan;
  }
  return {
    odswiez,
    stan: () => stan,
    naZmiane(f: (s: StanDostepu) => void) { sluchacze.add(f); return () => void sluchacze.delete(f); },
    /** KP-07: nasłuch transakcji od startu; każda zmiana → ponowna decyzja. */
    nasluchuj: () => sklep.obserwuj(() => { void odswiez(); }),
  };
}
export type DostepPro = ReturnType<typeof dostepPro>;
