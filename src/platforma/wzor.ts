// Adapter platformy wzoru (moduly.md „Kontrakt partii 6”): porty KonwersjaWzoru i SkanerStron oraz `sprawdzPdf` przez moduł Swift `oczko-wzor`
// (most: modules/oczko-wzor/index.ts, wyniki jako JSON). Powód spoza `Powod` albo zły JSON → `zapis` (nic po cichu). Build bez modułu (natywny = null):
// konwersja i skaner zwracają `zapis`, skaner ukryty, `sprawdzPdf` = kontrola nagłówka `%PDF-` i `%%EOF` (stan sprzed partii 6, BR-WZR-001/S2).
import type { Powod, Wynik } from '../domena/bledy';
import type { SkanerStron, ZrodloWzoru } from '../domena/porty';
import { otworzDoCzytania } from '../dane/pliki/system';
import { natywny as modul, type OczkoWzorNatywny } from '../../modules/oczko-wzor';
import type { KonwersjaPlatformy } from '../przypadki-uzycia/wzor';

const POWODY: readonly Powod[] = ['zablokowany', 'limit', 'zapis', 'bledne_dane', 'niedozwolone_przejscie', 'brak_miejsca', 'wersja_nowsza', 'uszkodzony', 'za_duze', 'konflikt', 'brak_sieci', 'odmowa', 'pusty', 'anulowano'];

function wynik<T>(json: string, wartosc: (o: Record<string, unknown>) => T | null): Wynik<T> {
  let o: unknown;
  try { o = JSON.parse(json); } catch { return { ok: false, powod: 'zapis' }; }
  if (typeof o !== 'object' || o === null) return { ok: false, powod: 'zapis' };
  const r = o as Record<string, unknown>;
  if (r.ok === true) { const w = wartosc(r); return w === null ? { ok: false, powod: 'zapis' } : { ok: true, wartosc: w }; }
  const p = POWODY.find((x) => x === r.powod);
  return { ok: false, powod: p ?? 'zapis' };
}
const liczba = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function pdfWygladaNaCaly(sciezka: string): boolean {
  const c = otworzDoCzytania(sciezka);
  try {
    if (c.rozmiar < 10) return false;
    const ascii = (b: Uint8Array) => String.fromCharCode(...b);
    const odKonca = Math.max(0, c.rozmiar - 1024);
    return ascii(c.czytaj(0, 5)) === '%PDF-' && ascii(c.czytaj(odKonca, c.rozmiar - odKonca)).includes('%%EOF');
  } finally {
    c.zamknij();
  }
}

export type PlatformaWzoru = KonwersjaPlatformy & SkanerStron & { skanerDostepny(): boolean };

export function platformaWzoru(n: OczkoWzorNatywny | null = modul()): PlatformaWzoru {
  return {
    async naPdf(z: ZrodloWzoru) {
      if (!n) return { ok: false, powod: 'zapis' };
      return wynik(await n.naPdf(JSON.stringify(z)), (r) => {
        const strony = liczba(r.strony);
        return typeof r.sciezka === 'string' && strony !== null ? { sciezka: r.sciezka, strony } : null;
      });
    },
    async sprawdzPdf(sciezka) {
      if (!n) return pdfWygladaNaCaly(sciezka) ? { ok: true, wartosc: { strony: 1 } } : { ok: false, powod: 'uszkodzony' };
      return wynik(await n.sprawdzPdf(sciezka), (r) => { const s = liczba(r.strony); return s === null ? null : { strony: s }; });
    },
    skanerDostepny: () => (n ? n.skanerDostepny() : false),
    async skanuj() {
      if (!n) return { ok: false, powod: 'zapis' };
      return wynik(await n.skanuj(), (r) => (Array.isArray(r.sciezki) && r.sciezki.every((x) => typeof x === 'string') ? { sciezki: r.sciezki as string[] } : null));
    },
  };
}
