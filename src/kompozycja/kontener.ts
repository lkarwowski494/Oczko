// Kontener zależności aplikacji na urządzeniu (08 partia 4, 3A): ścieżki danych (ADR-0001), baza (ADR-0019: bez zastępstwa w pamięci),
// porty platformy, i18n (ADR-0017). Jedyne miejsce, które składa adaptery; ekrany dostają gotowe usługi (moduly.md: ekrany → przypadki użycia).
import type { Wynik } from '../domena/bledy';
import type { Haptyka, EkranAktywny, Sklep } from '../domena/porty';
import { otworzPortExpo } from '../dane/baza/adapter-expo';
import { otworzBaze } from '../dane/baza/polaczenie';
import { sciezkiDanych } from '../dane/baza/sciezki';
import { migruj } from '../dane/migracje/migruj';
import { utworzMagazyn } from '../dane/pliki/magazyn';
import { utworzArchiwum } from '../dane/archiwum';
import { czasWTle } from '../platforma/czas-w-tle';
import type { ZaleznosciArchiwum } from '../przypadki-uzycia/zaleznosci';
import { czytajTekst, istniejePlik, katalogBiblioteki, polacz, utworzKatalog, zapiszTekst } from '../dane/pliki/system';
import { dostepPro, type DostepPro } from './dostep';
import { utworzI18n } from '../i18n/i18n';
import { ZASOBY } from '../i18n/slowniki';
import type { PreferencjaJezyka } from '../i18n/jezyki';
import { magazynJezyka } from '../przypadki-uzycia/jezyk';
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
import { ustawKatalogTymczasowy } from './system';

export type ZaleznosciAplikacji = ZaleznosciKompozycji & ZaleznosciArchiwum;
export type Kontener = {
  z: ZaleznosciAplikacji;
  j: Jezyk & { naZmiane(f: (j: string) => void): () => void; preferencja(): PreferencjaJezyka; ustawJezyk(p: PreferencjaJezyka): Promise<void> };
  porty: { sklep: Sklep; ekranAktywny: EkranAktywny; haptyka: Haptyka };
  dostep: DostepPro;
  katalogDanych: string;
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
  ustawKatalogTymczasowy(tymczasowy);
  const b = await otworzBaze(s.baza, (p) => otworzPortExpo(p));
  if (!b.ok) return b;
  const baza = b.wartosc;
  const zegar = zegarAplikacji();
  // Język (F-36, P-190): preferencja w `ustawienie.jezyk` (stan urządzenia, dane.md), odczyt przed pierwszym ekranem.
  const i18n = await utworzI18n({ magazyn: magazynJezyka({ baza, zegar }), systemowe: tagiSystemowe, zasoby: ZASOBY });
  const jezyk = () => i18n.jezyk();
  const id = await urzadzenie(katalogDanych);
  // Zakupy sztucznego sklepu buildu E2E w pliku (e2e/README.md); w buildzie wydania sztuczny sklep nie istnieje (sprawdz-ipa).
  const plikSklepu = polacz(katalogDanych, 'sklep-e2e.json');
  const zakupyE2e = istniejePlik(plikSklepu) ? await czytajTekst(plikSklepu) : null;
  const sklep = sklepAplikacji({ czytaj: () => zakupyE2e, zapisz: (t) => zapiszTekst(plikSklepu, t) }, () => zegar.teraz().ms);
  // Pamięć uprawnień Pro (KP-06): plik obok bazy, poza bazą i archiwum.
  const plikPro = polacz(katalogDanych, 'pamiec-pro.json');
  const dostep = dostepPro(sklep, { czytaj: async () => (istniejePlik(plikPro) ? czytajTekst(plikPro) : null), zapisz: async (t) => zapiszTekst(plikPro, t) }, () => zegar.teraz().ms);
  const z0: ZaleznosciKompozycji = {
    baza, zegar, id: identyfikatory, urzadzenie: id,
    pro: () => dostep.stan().pro, // ADR-0010: decyzja ze sklepu, przy błędzie pamięć KP-06 z oknem offline
    magazyn: utworzMagazyn(s.pliki), katalogi: { kopie: s.kopie, tymczasowy },
    dziennik: dziennikUrzadzenia(baza),
    migruj: (p) => migruj(p, { katalogKopii: s.kopie, teraz: () => zegar.teraz().ms }),
    liveActivity: liveActivity(id, undefined, jezyk),
    zegarek: zegarek(undefined, jezyk),
  };
  const z: ZaleznosciAplikacji = {
    ...z0, czasWTle: czasWTle(),
    archiwum: utworzArchiwum({ baza, magazyn: z0.magazyn, zegar, katalogi: z0.katalogi, migruj: z0.migruj, aplikacja: 'oczko' }),
  };
  const t: Tlumacz = (k, p) => i18n.t(k, p);
  return {
    ok: true,
    wartosc: {
      z,
      j: { t, jezyk, zegar24h, naZmiane: (f) => i18n.naZmiane(f), preferencja: () => i18n.preferencja(), ustawJezyk: (p) => i18n.ustawJezyk(p) },
      porty: { sklep, ekranAktywny: ekranAktywny(), haptyka: haptyka() },
      dostep, katalogDanych,
    },
  };
}
