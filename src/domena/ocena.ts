// Prośba o ocenę w sklepie (P-150 E2-1a, P-156): bramka `czyProsicOOcene` — czysta funkcja, bez I/O (ARCH-03).
// Kontrakt: docs/architektura/moduly.md „Prośba o ocenę”; wyrocznia: docs/architektura/wektory-prosby-o-ocene.json (PO-01–PO-11).
// Rola 05 (fix-5) zostawia tu tylko typy (P-156 Q2a); funkcję dopisuje 08:
//   export function czyProsicOOcene(w: WejscieProsby): boolean
// Test oczekujący: tests/akceptacja/domena/prosba-o-ocene.test.ts (08 przenosi go do tests/domena/ w commicie, który go zazielenia).

/** Chwila, w której przypadek użycia pyta bramkę; `true` możliwe tylko przy 'zamknieto_karte_ukonczenia' (BR-DAN-012, P-150). */
export type ZdarzenieProsby =
  | 'start'
  | 'zamknieto_karte_ukonczenia'
  | 'plus'
  | 'minus'
  | 'komunikat_limitu'
  | 'okno_uczciwe_zasady'
  | 'ekran_zakupu'
  | 'ocen_w_ustawieniach';

/** Wartość klucza `ustawienie` `ostatnia_prosba_o_ocene` (dane.md): wersja aplikacji i dzień lokalny (RD-16) ostatniej prośby. */
export type OstatniaProsba = { wersja: string; dzien: string };

export interface WejscieProsby {
  zdarzenie: ZdarzenieProsby;
  wersja: string;            // wersja aplikacji (CFBundleShortVersionString); pusta = nieznana → false
  ostatniaProsba?: unknown;  // odczyt klucza bez walidacji: brak albo zły kształt = jak brak prośby (PO-11)
  dzis: string;              // Zegar.teraz().dzien, RRRR-MM-DD
  dostepna: boolean;         // StoreReview.isAvailableAsync(); false w TestFlight (PO-08)
}

export type CzyProsicOOcene = (w: WejscieProsby) => boolean;
