// Jedyne miejsce liczb (docs/architektura/moduly.md, „Konfiguracja”). Wartości z decyzji; testy importują stąd parametry produktowe.
// Plik utworzyła rola 07 (E3) jako wartości z tabeli roli 05, bez logiki. Liczby treści (F-38, RD-11) są w docs/tresci/parametry.json (rola 06).
export const LIMIT_DNI_W_MIESIACU = 5; // dni; P-057 (D2)
export const PRZERWA_NOWEGO_DNIA_MS = 3_600_000; // ms; P-057 (D3)
export const OKNO_OFFLINE_PRO_MS = 7 * 86_400_000; // ms; P-103 (3a): pamięć Pro przy błędzie sklepu, 7 dni po `wygasa` (jak Trening)
export const STRAZNIK_SERIA_ZDARZEN = 3; // liczba dodań; RD-17, P-047
export const STRAZNIK_OKNO_S = 2; // s; RD-17, P-047
export const KOSZ_DNI = 30; // dni; P-026
export const KROK_MOTKA = 0.5; // motki; krok krokowca zużycia na karcie ukończenia (design-spec „Zużycie włóczki przy ukończeniu”, P-126 (2a))
export const KOPIA_PRZED_IMPORTEM_DNI = 30; // dni; ADR-0004
export const SESJA_MAKS_H = 8; // h; P-072 (7a)
export const WERSJA_SCHEMATU = 1; // schemat.sql
export const WERSJA_FORMATU_ARCHIWUM = 1; // ADR-0004
export const ROZSZERZENIE_ARCHIWUM = '.oczko'; // ADR-0004
export const ZAPAS_MIEJSCA_EKSPORTU = 2; // × rozmiar; [OCENA] roli 05
export const BLEDY_MAKS_WIERSZY = 200; // wiersze; [OCENA] roli 05
export const DZIENNIK_BLAD_TEKST_MAKS = 4096; // znaki; ADR-0008 (3′) (fix-3 05): tekst uszkodzonej linii dziennika w `blad`
export const WERSJA_STANU = 3; // stan Live Activity i zegarka, moduly.md (v1 → v2: 08 partia 3, P-111 (3), P-129 Q7a; v2 → v3 `zablokowany`: 08 partia 4, N1, P-135 Q7a)
export const STAN_NAZWA_MAKS_ZNAKOW = 60; // znaki (punkty kodowe); [OCENA] roli 05 (Z07-12): ładunek < 4 KB (rejestr Apple 1b)
export const STAN_PRZYPOMNIENIA_MAKS = 3; // liczba; [OCENA] roli 05 (Z07-12)
export const STAN_PRZYPOMNIENIE_TEKST_MAKS = 40; // znaki; [OCENA] roli 05 (Z07-12)
export const ZEGAREK_PONOWIENIE_MS = 900_000; // ms; [OCENA] roli 05 (fix-4, P-135 Q2a): ponowna wysyłka niepotwierdzonej linii z kolejki zegarka (ADR-0009, 2026-10-26)
export const ZEGAREK_POTWIERDZENIA_MAKS = 256; // id; [OCENA] roli 05 (fix-4, P-135 Q2a): ostatnie potwierdzone id zegarka w kontekście aplikacji (ok. 9 KB)
export const ODSTEP_PROSBY_DNI = 14; // dni kalendarzowe; P-150 E2-1a (jak Trening REVIEW.MIN_GAP_DAYS; HIG: „a week or two between requests”)
export const PROSB_NA_WERSJE = 1; // prośby na wersję aplikacji; P-150 E2-1a (jak Trening); inna wartość wymaga licznika w zapisie (zmiana kontraktu)
export const PARTIA_SYNCHRONIZACJI = 200; // wiersze na transakcję; [OCENA] roli 05
export const MIN_IOS = '18.0'; // P-070, ADR-0006
export const MIN_WATCHOS = '11.0'; // P-070, ADR-0006
export const PROG_NIEUDANYCH_STARTOW = 2; // P-080 (interpretacja do weta), ADR-0019
export const KOPIE_RATUNKOWE_DNI = 30; // P-080, ADR-0020
export const PLIKI_OCHRONA_MIN = 10; // min; [OCENA] roli 05 (Z07-15): plik młodszy nie jest sprzątany przy starcie (zapis pliku przed wierszem odwołania)
/** ID produktów Pro: [DO USTALENIA] przy konfiguracji App Store Connect (P-038, P-089); tymczasowe jak w docs/monetyzacja/dostep.mjs. */
export const PRODUKTY_PRO: readonly string[] = Object.freeze(['oczko.pro.lifetime', 'oczko.pro.monthly', 'oczko.pro.yearly']);
