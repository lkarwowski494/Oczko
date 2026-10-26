// Kompozycja partii 6 (moduly.md „Kontrakt partii 6”; P-246: krok skrzynki po danych startu, poza kolejką `uruchomDane`, przed silnikiem iCloud):
// zlecenie testowe E2E (oczkoE2eSkrzynka, P-230 Q2a), przetworzenie skrzynki importu, migawka projektów dla rozszerzenia (P-220 R1a, P-243) i stan
// arkusza „N patterns to add” na liście projektów (R2; nie nad licznikiem, P-046). Woła ją start aplikacji i powrót na pierwszy plan.
import type { Powod, Wynik } from '../domena/bledy';
import type { MigawkaProjektow, ZlecenieImportu } from '../domena/porty';
import { odswiezMigawke } from '../przypadki-uzycia/migawka';
import { utworzProjekt } from '../przypadki-uzycia/projekt';
import { odrzucZlecenie, przetworzSkrzynke, przypiszZlecenie, type ZaleznosciSkrzynki } from '../przypadki-uzycia/skrzynka';

export type StanSkrzynki = { doWyboru: ZlecenieImportu[]; czekaSiec: ZlecenieImportu[]; bledy: { zlecenie: ZlecenieImportu; powod: Powod }[] };
export type ZaleznosciKompozycjiWzoru = ZaleznosciSkrzynki & { migawka: MigawkaProjektow; jezyk(): string };

export function kompozycjaWzoru(z: ZaleznosciKompozycjiWzoru, o: { grupa: string | null; zlecenieE2e: ((grupa: string, terazMs: number) => void) | null }) {
  let stan: StanSkrzynki = { doWyboru: [], czekaSiec: [], bledy: [] };
  let wToku: Promise<void> | null = null;
  const sluchacze = new Set<() => void>();
  const zmien = (s: StanSkrzynki) => { stan = s; for (const f of sluchacze) f(); };
  async function przetworz(): Promise<void> {
    if (o.zlecenieE2e && o.grupa) o.zlecenieE2e(o.grupa, z.zegar.teraz().ms); // build E2E: tryb-e2e.ts (P-238)
    const w = await przetworzSkrzynke(z);
    if (w.ok) zmien({ doWyboru: w.wartosc.doWyboru, czekaSiec: w.wartosc.czekaSiec, bledy: w.wartosc.bledy });
    await odswiezMigawke(z);
  }
  return {
    /** Start i `AppState → active`: jedno przetworzenie naraz (drugie wywołanie czeka na pierwsze). */
    poStarcie(): Promise<void> {
      wToku ??= przetworz().finally(() => { wToku = null; });
      return wToku;
    },
    stan: () => stan,
    naZmiane(f: () => void): () => void { sluchacze.add(f); return () => { sluchacze.delete(f); }; },
    odswiezMigawke: () => odswiezMigawke(z),
    /** Arkusz skrzynki: wszystkie zlecenia do wybranego projektu (null = nowy projekt z nazwą pierwszego pliku); wynik = liczba dodanych. */
    async wybierzProjekt(projektId: string | null): Promise<Wynik<number>> {
      let cel = projektId;
      if (!cel) {
        const nazwa = (stan.doWyboru[0]?.nazwa ?? '').replace(/\.(pdf|docx?|jpe?g|png|heic)$/i, '').trim();
        const p = await utworzProjekt(z, { nazwa, czesci: [] });
        if (!p.ok) return p;
        cel = p.wartosc.projektId;
      }
      let n = 0;
      const zostaje: ZlecenieImportu[] = [];
      const bledy = [...stan.bledy];
      for (const zl of stan.doWyboru) {
        const r = await przypiszZlecenie(z, { zlecenie: zl, projektId: cel });
        if (r.ok) n += 1;
        else if (r.powod === 'brak_sieci') zostaje.push(zl);
        else bledy.push({ zlecenie: zl, powod: r.powod });
      }
      zmien({ doWyboru: [], czekaSiec: [...stan.czekaSiec, ...zostaje], bledy });
      await odswiezMigawke(z);
      return { ok: true, wartosc: n };
    },
    /** „Not now”: zlecenia zostają w skrzynce do następnego otwarcia. */
    nieTeraz(): void { zmien({ ...stan, doWyboru: [] }); },
    /** Alert błędu potwierdzony: zlecenie usunięte ze skrzynki (nic nie ginie po cichu — użytkowniczka widziała przyczynę). */
    async potwierdzBlad(id: string): Promise<void> {
      await odrzucZlecenie(z, { id });
      zmien({ ...stan, bledy: stan.bledy.filter((b) => b.zlecenie.id !== id) });
    },
  };
}
export type KompozycjaWzoru = ReturnType<typeof kompozycjaWzoru>;
