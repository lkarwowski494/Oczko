// Kontener zależności aplikacji na urządzeniu (08 partia 4, 3A): ścieżki danych (ADR-0001), baza (ADR-0019: bez zastępstwa w pamięci),
// porty platformy, i18n (ADR-0017). Jedyne miejsce, które składa adaptery; ekrany dostają gotowe usługi (moduly.md: ekrany → przypadki użycia).
import type { Wynik } from '../domena/bledy';
import type { Haptyka, EkranAktywny, Sklep } from '../domena/porty';
import { otworzPortExpo } from '../dane/baza/adapter-expo';
import { otworzBaze } from '../dane/baza/polaczenie';
import { sciezkiDanych } from '../dane/baza/sciezki';
import { migruj } from '../dane/migracje/migruj';
import { utworzMagazyn } from '../dane/pliki/magazyn';
import { czytajTekst, istniejePlik, katalogBiblioteki, polacz, utworzKatalog, zapiszTekst } from '../dane/pliki/system';
import { utworzI18n } from '../i18n/i18n';
import { ZASOBY } from '../i18n/slowniki';
import { dziennikUrzadzenia } from '../platforma/dziennik-plus';
import { ekranAktywny } from '../platforma/ekran-aktywny';
import { haptyka } from '../platforma/haptyka';
import { identyfikatory } from '../platforma/identyfikatory';
import { liveActivity } from '../platforma/live-activity';
import { tagiSystemowe, zegar24h } from '../platforma/lokalizacja';
import { sklepAplikacji } from '../platforma/sklep';
import { zegarAplikacji } from '../platforma/tryb-e2e';
import { zegarek } from '../platforma/zegarek';
import type { Tlumacz } from '../ekrany/wspolne';
import type { Jezyk, ZaleznosciKompozycji } from './licznik';

export type Kontener = {
  z: ZaleznosciKompozycji;
  j: Jezyk & { naZmiane(f: (j: string) => void): () => void };
  porty: { sklep: Sklep; ekranAktywny: EkranAktywny; haptyka: Haptyka };
};

/**
 * Identyfikator urządzenia w zdarzeniach (`zdarzenie.urzadzenie`, ADR-0005): UUID w pliku obok bazy, poza bazą, więc nie wchodzi do kopii ani archiwum.
 * Miejsce pliku: odstępstwo nazwane 08 (partia 4, 3A) do potwierdzenia przez 05 — dane.md nie ustala źródła tego pola.
 */
async function urzadzenie(katalog: string): Promise<string> {
  const plik = polacz(katalog, 'urzadzenie.txt');
  if (istniejePlik(plik)) {
    const t = (await czytajTekst(plik)).trim();
    if (/^[0-9a-f-]{36}$/i.test(t)) return t;
  }
  const nowy = identyfikatory.nowy();
  zapiszTekst(plik, nowy);
  return nowy;
}

/** Błąd otwarcia bazy albo plików → `powod` dla ekranu awaryjnego (ADR-0019, krok 3C); nic nie jest zastępowane po cichu. */
export async function utworzKontener(): Promise<Wynik<Kontener>> {
  const s = sciezkiDanych(katalogBiblioteki());
  const katalogDanych = s.baza.slice(0, s.baza.lastIndexOf('/'));
  const tymczasowy = polacz(katalogDanych, 'tmp');
  for (const k of [katalogDanych, s.pliki, s.kopie, tymczasowy]) utworzKatalog(k);
  const b = await otworzBaze(s.baza, (p) => otworzPortExpo(p));
  if (!b.ok) return b;
  const baza = b.wartosc;
  // Język: preferencja 'auto' w pamięci procesu do ekranu Ustawień (3C) — klucz `jezyk` tabeli `ustawienie` czeka na wiersz w dane.md (zgłoszenie do 05).
  const preferencje = new Map<string, string>();
  const i18n = await utworzI18n({ magazyn: { odczytaj: async (k) => preferencje.get(k) ?? null, zapisz: async (k, v) => { preferencje.set(k, v); } }, systemowe: tagiSystemowe, zasoby: ZASOBY });
  const jezyk = () => i18n.jezyk();
  const id = await urzadzenie(katalogDanych);
  const z: ZaleznosciKompozycji = {
    baza, zegar: zegarAplikacji(), id: identyfikatory, urzadzenie: id,
    pro: () => false, // dostęp Pro (ADR-0010, pamięć KP-06) z ekranem ofert w kroku 3C; do tego czasu darmowa (limit liczony jak bez Pro)
    magazyn: utworzMagazyn(s.pliki), katalogi: { kopie: s.kopie, tymczasowy },
    dziennik: dziennikUrzadzenia(baza),
    migruj: (p) => migruj(p, { katalogKopii: s.kopie }),
    liveActivity: liveActivity(id, undefined, jezyk),
    zegarek: zegarek(undefined, jezyk),
  };
  const t: Tlumacz = (k, p) => i18n.t(k, p);
  return {
    ok: true,
    wartosc: {
      z,
      j: { t, jezyk, zegar24h, naZmiane: (f) => i18n.naZmiane(f) },
      porty: { sklep: sklepAplikacji(), ekranAktywny: ekranAktywny(), haptyka: haptyka() },
    },
  };
}
