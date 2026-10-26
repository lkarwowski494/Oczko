// Sztuczny sklep buildu E2E (e2e/README.md, wzór Treningu lib/store-fake.ts): ceny testowe, zakup bez okna Apple, „wygaś dostęp”
// (`e2e-sklep-wygas`). Transakcje w pamięci procesu jak w Treningu (P-087; [DO USTALENIA 08] z README rozstrzygnięte analogią — restart = brak zakupu).
import type { Sklep, Transakcja } from '../domena/porty';

const CENY = { 'oczko.pro.monthly': ['$0.99', 'miesiac'], 'oczko.pro.yearly': ['$6.99', 'rok'], 'oczko.pro.lifetime': ['$14.99', 'dozywotni'] } as const;
const DOBA_MS = 86_400_000;

export function sklepSztuczny(terazMs: () => number = Date.now): Sklep & { wygas(): void } {
  let transakcje: Transakcja[] = [];
  const obserwatorzy = new Set<() => void>();
  const powiadom = () => obserwatorzy.forEach((f) => f());
  return {
    async produkty() { return Object.entries(CENY).map(([id, [cena, okres]]) => ({ id, cenaWyswietlana: cena, okres })); },
    async kup(id) {
      if (!(id in CENY)) return { ok: false, powod: 'bledne_dane' };
      transakcje = [...transakcje.filter((t) => t.produkt !== id), { produkt: id, wygasa: id === 'oczko.pro.lifetime' ? null : terazMs() + 30 * DOBA_MS, odebrane: false, karencjaDo: null }];
      powiadom();
      return { ok: true, wartosc: undefined };
    },
    async przywroc() { powiadom(); return { ok: true, wartosc: undefined }; },
    async transakcje() { return transakcje; },
    obserwuj(fn) { obserwatorzy.add(fn); return () => obserwatorzy.delete(fn); },
    /** „Test store: expire access”: wszystkie uprawnienia kończą się teraz (dostęp liczy dostep.ts z końcem wyłącznym). */
    wygas() { transakcje = transakcje.map((t) => ({ ...t, wygasa: terazMs(), karencjaDo: null })); powiadom(); },
  };
}
