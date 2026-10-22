# 0001. Dane użytkownika w SQLite (`expo-sqlite`), pliki wzorów i zdjęć poza bazą
Data: 2026-10-22 · Status: **przyjęta** (P-071) · Rola: 05 (E1) · Zależy od: P-021, P-070, NFR-DAN-001, NFR-DAN-002

## Kontekst i problem
Aplikacja zapisuje każdą zmianę licznika z godziną (BR-LIC-003), projekty z częściami, sesje stopera, zapas, dni limitu (`docs/monetyzacja/limit.mjs`) i agregaty po dniach (F-59). Szacunek 3-letni (E0 §3): 150 000 zdarzeń, ok. 18 MB danych i ok. 415 MB plików. Każde +1 ma być trwałe po zabiciu procesu (NFR-DAN-002).

## Czynniki decyzji
Zero utraty danych · koszt zapisu jednego +1 przy 3 latach danych · zapytania kalendarza i historii · migracje schematu · eksport i kopia · prostota (zasada architekta 2).

## Rozważane opcje
A. SQLite przez `expo-sqlite` 57, pliki (PDF, zdjęcia, rysunki) w katalogu aplikacji, w bazie odwołanie, rozmiar i SHA-256.
B. Pliki JSON z wersją formatu (jeden plik albo plik na projekt), zapis atomowy.
C. Magazyn klucz-wartość (np. AsyncStorage/UserDefaults).
D. Pliki binarne w bazie (BLOB).

## Decyzja
Opcja A. Baza `oczko.db` w `Library/Application Support/` aplikacji, objętym kopią urządzenia (rejestr Apple 9a) (nie w `Documents/`, które widać w Plikach; nie w `Caches`, który system czyści — rejestr Expo 9), klasa ochrony domyślna „until first user authentication” (rejestr Apple 3a, 3b; P-070 (3a): zapis przy zablokowanym ekranie po pierwszym odblokowaniu). Tryb WAL. Pliki w `Library/Application Support/pliki/<sha256>.<rozszerzenie>`; usunięcie pliku dopiero po usunięciu ostatniego odwołania (licznik odwołań w bazie).

### Konsekwencje
- Dobre: +1 to jedna krótka transakcja (pomiar E1-1: p50 0,18 ms, p95 0,37 ms na 150 000 zdarzeń, Linux, nie iPhone); historia i kalendarz po indeksie (`SEARCH … USING INDEX`, p95 ≤ 0,34 ms); migracje i kopie według modułu `dane-lokalne-sqlite`.
- Złe: migracje schematu są kodem do utrzymania (12 kroków, test na kopii każdej wydanej wersji); dwa miejsca prawdy (baza + pliki) wymagają kontroli spójności (plik bez odwołania, odwołanie bez pliku) przy uruchomieniu i w eksporcie.
- Nowa wersja nie otwiera, nie nadpisuje i nie usuwa pliku `Library/SQLite/oczko.db` wersji 0.1.0 (P-070 (2c), ADR-0015).

### Potwierdzenie
- Test w CI (rola 07): otwarcie bazy w ścieżce `Application Support`, `PRAGMA journal_mode` = `wal`, `PRAGMA foreign_keys` = 1 na połączeniu zapisu.
- Test spójności plików: każde odwołanie ma plik o zgodnym SHA-256; plik bez odwołania jest wykrywany.
- `EXPLAIN QUERY PLAN` zapytań głównych ekranów na danych 150 000 zdarzeń bez `SCAN` dużej tabeli (eksperyment `docs/architektura/eksperymenty/e1/e1-1-skala.mjs` jako wzór).

## Opcje: zalety i wady
### A — zalety: transakcje, indeksy, mały koszt zapisu, dojrzałe migracje i `VACUUM INTO`; jeden plik do kopii · wady: kod migracji, uwaga na kalibrację (REPLACE, klucze obce, połączenia).
### B — zalety: brak schematu SQL, prosty eksport · wady: każde +1 przepisuje cały plik: E1-1 zmierzył p50 128 ms, p95 176 ms przy 13,2 MB (≈ 500× wolniej niż A), a przerwany zapis bez `rename` gubi wszystko; kalendarz liczony w JS z całości.
### C — zalety: najprostsze API · wady: brak transakcji wielu kluczy i zapytań; historia 150 000 zdarzeń nie mieści się sensownie w modelu klucz-wartość.
### D — zalety: jeden plik zawiera wszystko · wady: baza rośnie do setek MB, `VACUUM INTO` i kopie trwają długo (ryzyko `0xdead10cc`, rejestr Apple 2b); sqlite.org (rejestr SQLite 8b) wskazuje pliki zewnętrzne jako szybsze dla dużych obiektów.
