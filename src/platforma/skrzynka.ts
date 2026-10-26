// Skrzynka importu „Udostępnij do Oczka” w kontenerze App Group (ADR-0011 fix-7; moduly.md „Kontrakt partii 6”, cel targets/share).
// Rozszerzenie kopiuje plik do `<grupa>/skrzynka/<id>/` i na końcu zapisuje manifest `zlecenie.json` (plik tymczasowy → rename); `sciezka`
// w manifeście jest względna (nazwa pliku w katalogu zlecenia). Katalog bez poprawnego manifestu to zlecenie niepełne: usuwane dopiero, gdy
// nie zmieniał się od SKRZYNKA_PORZUCONE_H (rozszerzenie mogło jeszcze kopiować).
import type { SkrzynkaImportu, ZlecenieImportu } from '../domena/porty';
import { SKRZYNKA_PORZUCONE_H } from '../konfiguracja';
import { czasZmianyKatalogu, czytajTekst, istniejePlik, lista, polacz, usunKatalog } from '../dane/pliki/system';

const MANIFEST = 'zlecenie.json';
const GODZINA_MS = 3_600_000;

function zlecenieZManifestu(tekst: string, katalog: string, id: string): ZlecenieImportu | null {
  let m: unknown;
  try { m = JSON.parse(tekst); } catch { return null; }
  if (typeof m !== 'object' || m === null) return null;
  const r = m as Record<string, unknown>;
  const napis = (k: string) => (typeof r[k] === 'string' ? (r[k] as string) : null);
  const rodzaj = r.rodzaj === 'plik' || r.rodzaj === 'adres' || r.rodzaj === 'film' ? r.rodzaj : null;
  const sciezka = napis('sciezka'), nazwa = napis('nazwa'), typ = napis('typ');
  if (r.id !== id || !rodzaj || !nazwa || typ === null || typeof r.utworzonoMs !== 'number') return null;
  if (rodzaj === 'plik' && (!sciezka || sciezka.includes('/') || !istniejePlik(polacz(katalog, sciezka)))) return null; // tylko plik w katalogu zlecenia
  if (rodzaj !== 'plik' && !napis('adres')) return null;
  return { id, rodzaj, nazwa, sciezka: rodzaj === 'plik' && sciezka ? polacz(katalog, sciezka) : null, adres: napis('adres'), typ, projektId: napis('projektId'), utworzonoMs: r.utworzonoMs };
}

/** `grupa` = katalog kontenera App Group (null: grupa niedostępna — np. build bez uprawnień; skrzynka pusta). */
export function skrzynkaWKatalogu(grupa: string | null, teraz: () => number): SkrzynkaImportu {
  const korzen = grupa ? polacz(grupa, 'skrzynka') : null;
  return {
    async pobierz() {
      if (!korzen) return [];
      const wynik: ZlecenieImportu[] = [];
      for (const id of lista(korzen)) {
        const k = polacz(korzen, id);
        const m = istniejePlik(polacz(k, MANIFEST)) ? zlecenieZManifestu(await czytajTekst(polacz(k, MANIFEST)), k, id) : null;
        if (m) { wynik.push(m); continue; }
        const zmiana = czasZmianyKatalogu(k);
        if (zmiana !== null && teraz() - zmiana > SKRZYNKA_PORZUCONE_H * GODZINA_MS) usunKatalog(k);
      }
      return wynik.sort((a, b) => a.utworzonoMs - b.utworzonoMs || (a.id < b.id ? -1 : 1));
    },
    async usun(id) {
      if (!korzen || id.includes('/')) return;
      usunKatalog(polacz(korzen, id));
    },
  };
}
