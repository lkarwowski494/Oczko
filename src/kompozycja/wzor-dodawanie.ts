// Dodanie wzoru w aplikacji (design-spec W7a, stany W11): źródło → dodajWzor; powód → alert z tekstami 04; nazwa domyślna (plik bez rozszerzenia,
// tytuł strony — tu host, bo konwersja nie zwraca tytułu [OCENA 08] — `wzor.nazwa_skan`, `wzor.nazwa_zdjecia`). Każde dodanie = nowy wzór (P-218 (1)).
import type { Powod } from '../domena/bledy';
import { WZOR_MAKS_MB } from '../konfiguracja';
import type { Tlumacz } from '../ekrany/wspolne';

export function alertImportu(powod: Powod, plik: string, t: Tlumacz): { tytul: string; opis: string } | null {
  switch (powod) {
    case 'anulowano': case 'brak_sieci': return null; // strona bez sieci czeka w skrzynce (`wzor.czeka_siec`), bez błędu
    case 'uszkodzony': return { tytul: t('wzor.blad_plik'), opis: t('wzor.blad_plik_opis', { plik }) };
    case 'bledne_dane': return { tytul: t('wzor.blad_typ'), opis: t('wzor.blad_typ_opis') };
    case 'za_duze': return { tytul: t('wzor.blad_rozmiar'), opis: t('wzor.blad_rozmiar_opis', { mb: WZOR_MAKS_MB }) };
    case 'odmowa': case 'pusty': return { tytul: t('wzor.blad_strona'), opis: t('wzor.blad_strona_opis') };
    default: return { tytul: t('licznik.blad_zapisu'), opis: '' };
  }
}
export function nazwaDomyslna(z: { rodzaj: 'plik'; nazwa: string } | { rodzaj: 'adres'; adres: string } | { rodzaj: 'skan' | 'zdjecia' }, t: Tlumacz, data: string): string {
  if (z.rodzaj === 'plik') return z.nazwa.replace(/\.(pdf|docx?)$/i, '').trim() || z.nazwa;
  if (z.rodzaj === 'adres') { const m = /^https?:\/\/([^/?#]+)/i.exec(z.adres); return m ? m[1] : z.adres; }
  return t(z.rodzaj === 'skan' ? 'wzor.nazwa_skan' : 'wzor.nazwa_zdjecia', { data });
}
/** Skaner stron (W11 :664): `odmowa` = brak dostępu do aparatu (Skaner.swift) → alert z „Open Settings”; inne powody jak import. */
export function alertSkanu(powod: Powod, t: Tlumacz): { tytul: string; opis: string; ustawienia: boolean } | null {
  if (powod === 'odmowa') return { tytul: t('zdjecia.brak_aparatu_tytul'), opis: t('wzor.brak_aparatu_opis'), ustawienia: true };
  const a = alertImportu(powod, '', t);
  return a ? { ...a, ustawienia: false } : null;
}
