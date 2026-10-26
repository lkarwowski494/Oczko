// Start aplikacji ze strażnikiem (ADR-0019): stan startu w pliku JSON przed otwarciem bazy; tryb awaryjny bez migracji i bez zapisów do bazy
// (najpierw surowa kopia trzech plików, ADR-0020); kamień milowy po pierwszym ekranie. Wymuszona awaria buildu E2E (`oczkoE2eAwariaStartu`):
// po zapisie „start w toku” proces nie idzie dalej (pusty ekran), więc następny start liczy go jako nieudany.
import type { Powod } from '../domena/bledy';
import type { Licznosci } from '../domena/porty';
import { sciezkiDanych } from '../dane/baza/sciezki';
import { surowaKopia } from '../dane/kopia-ratunkowa';
import { sha256PlikuTs } from '../dane/pliki/magazyn';
import { czytajTekst, istniejePlik, katalogBiblioteki, polacz, utworzKatalog, zapiszTekst } from '../dane/pliki/system';
import Constants from 'expo-constants';
import { sprzatnijKopie, zipSurowejKopii } from '../niezawodnosc/kopie';
import { kopiaAwaryjna } from './kopia-awaryjna';
import { kamienMilowy, odczytajStan, poczatekStartu, sprobujNormalnie, type StanStartu } from '../niezawodnosc/start';
import { awariaStartu, zegarAplikacji } from '../platforma/tryb-e2e';

export type TrybStartu = { tryb: 'normalny' } | { tryb: 'awaryjny'; powod: 'petla-startow' | 'wersja_nowsza' | 'uszkodzony' } | { tryb: 'awaria-e2e' };

function sciezki() {
  const s = sciezkiDanych(katalogBiblioteki());
  const katalogDanych = s.baza.slice(0, s.baza.lastIndexOf('/'));
  utworzKatalog(katalogDanych);
  return { ...s, katalogDanych };
}
async function czytajStan(plik: string): Promise<StanStartu> {
  try { return odczytajStan(istniejePlik(plik) ? await czytajTekst(plik) : null); } catch { return odczytajStan(null); }
}
const zapisz = (plik: string, s: StanStartu) => { try { zapiszTekst(plik, JSON.stringify(s)); } catch { /* brak zapisu stanu nie blokuje startu */ } };

/** Początek startu na pierwszym planie (wołający czeka na AppState = active). */
export async function rozpocznijStart(): Promise<TrybStartu> {
  const s = sciezki();
  const p = poczatekStartu(await czytajStan(s.stanStartu));
  zapisz(s.stanStartu, p.stan); // przed otwarciem bazy (ADR-0019)
  if (p.awaryjny) return { tryb: 'awaryjny', powod: 'petla-startow' };
  if (awariaStartu()) return { tryb: 'awaria-e2e' };
  return { tryb: 'normalny' };
}
export async function zapiszKamien(): Promise<void> {
  const s = sciezki();
  zapisz(s.stanStartu, kamienMilowy(await czytajStan(s.stanStartu)));
  sprzatnijKopie(s.kopie, zegarAplikacji().teraz().ms); // ADR-0020 (6): kopie po KOPIE_RATUNKOWE_DNI, tylko po kamieniu milowym; błąd nie blokuje startu
}
export async function sprobujNormalnieTeraz(): Promise<void> {
  const s = sciezki();
  zapisz(s.stanStartu, sprobujNormalnie(await czytajStan(s.stanStartu)));
}
/** Powód błędu startu normalnego → nagłówek ekranu awaryjnego (ten sam ekran, ADR-0019). */
export const powodAwaryjny = (p: Powod): 'wersja_nowsza' | 'uszkodzony' => (p === 'wersja_nowsza' ? 'wersja_nowsza' : 'uszkodzony');

/** Tryb awaryjny: surowa kopia przed czymkolwiek, potem archiwum `.oczko` z bazy w jej obecnej wersji (bez migracji i bez zapisów do bazy). */
export function trybAwaryjny() {
  const s = sciezki();
  const zegar = zegarAplikacji();
  const katalogi = { kopie: s.kopie, tymczasowy: polacz(s.katalogDanych, 'tmp') };
  utworzKatalog(katalogi.kopie);
  utworzKatalog(katalogi.tymczasowy);
  const kopia = surowaKopia(s.katalogDanych, s.kopie, zegar);
  const archiwum = kopiaAwaryjna({ sciezkaBazy: s.baza, pliki: s.pliki, zegar, katalogi }); // P-203: połączenie bez zamknięcia (bez checkpointu)
  return {
    kopia,
    sha: () => (istniejePlik(s.baza) ? sha256PlikuTs(s.baza) : Promise.resolve('')),
    async zapiszKopie(): Promise<{ sciezka: string; licznosci: Licznosci } | null> {
      await kopia;
      return archiwum.zapisz();
    },
    /** ADR-0020 (3): baza się nie otwiera albo archiwum zawiodło → jeden ZIP surowej kopii (trzy pliki + manifest) do arkusza udostępniania. */
    async zipSurowej(): Promise<string | null> {
      const k = await kopia;
      if (!k.ok) return null;
      const cel = polacz(katalogi.tymczasowy, `oczko-ratunkowa-${zegar.teraz().ms}.zip`);
      const w = await zipSurowejKopii(k.wartosc.katalog, k.wartosc.pliki, cel, { aplikacja: Constants.expoConfig?.version ?? '?', build: Constants.expoConfig?.ios?.buildNumber ?? '?', terazMs: zegar.teraz().ms });
      return w.ok ? cel : null;
    },
  };
}
