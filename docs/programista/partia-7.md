# Rola 08 (programista), build, partia 7: synchronizacja iCloud
Plik stanu sesji · start 2026-10-26 ok. 19:40 UTC · gałąź `claude/jolly-thompson-paz6d8` · zakres: „Kontrakt partii 7” w `docs/architektura/moduly.md` (F-27, F-58 część synchronizacji, BR-DAN-002 S1–S3), projekt `docs/design/fix7-2026-10-26.md` i `udostepnij-icloud.html`, plan 07 `docs/jakosc/plan-partia-7-icloud.md`; decyzje P-217, P-218 Q5a, P-220 I1a/N3/N5, P-221 Q5a, P-229, P-230, P-233, P-241. Prompt roli: [OTWARTE] — repo `prompts` niedostępne w tej sesji (add_repo zablokowane przez kontrolę uprawnień), praca wg CLAUDE.md, kontraktu i polecenia koordynatora.

## Stan: E1 w toku (warstwa domeny i danych) · 2026-10-26 ok. 20:40 UTC

## E0 Środowisko i stan wyjściowy
| Sprawdzenie | Wynik |
|---|---|
| System, Node, git | Linux 6.18, Node v22.22.0, chmura; tożsamość git „Łukasz Karwowski <336954459+lkarwowski494@users.noreply.github.com>” |
| Xcode / Swift / symulator | brak — Swift (`modules/oczko-icloud`), build i E2E tylko w CI „Jakość · iOS” w oknie maszyn |
| Stan wyjściowy | HEAD eef6c9e (P-241), `npm ci`, `env -u NODE_PATH npm run verify` kod 0, **2330/2330** (187 zestawów) |
| Okno pushy (P-187, P-241) | do 22:15 UTC tylko zmiany sprawdzane w całości bramką Linux; potem tylko lokalne commity do sygnału koordynatora |
| Pliki wspólne z partią 6 | tylko dopisywanie we własnym bloku (tabela w moduly.md); klucze `icloud.*` nakłada partia 6 (łatka 04) |

## Plan (kolejność)
1. **Domena** `src/domena/icloud/` — kontrakt tabel (kopia `icloud-tabele.json`, test równości), odwzorowanie wiersz ↔ `RekordIcloud` (klucz złożony `json_array`, kolumny `pomin`, rekord z sieci sprawdzany: encja z kontraktu, nazwy kolumn, typy, klucz zgodny z polami). ✔
2. **Dane** `src/dane/repozytoria/icloud.ts` — włączenie (pełne wpisanie do skrzynki jednym `nr`), wyłączenie (pusta skrzynka, dane zostają), odczyt skrzynki partiami `PARTIA_SYNCHRONIZACJI`, potwierdzenie `nr <=`, odbiór partii (`wejscie = 1`, kolejność kontraktu, UPSERT po `zmieniono_ms`, tylko dopisywane z kolizją M-14, `dni_limitu`, `ustawienie_or`, poczekalnia z ponowieniem, usunięcia z kaskadą, `przeliczLicznik`, stan silnika). Błąd SQL jednego rekordu → `SAVEPOINT`, wpis `blad`, partia idzie dalej. ✔
3. **Przypadki użycia** `src/przypadki-uzycia/synchronizacja.ts` — sterownik: start, włącz/wyłącz, `polacz`, `nie_synchronizuj`, `wyslijZaleglosci`, zasoby plików przed transakcją (SHA-256 = klucz), zdarzenia konta, „Usuń też z iCloud”. ✔
4. **Platforma** `src/platforma/icloud.ts` (wybór adaptera) + `icloud-atrapa.ts` (ładowana warunkowo jak panele P-238) + argument `oczkoE2eIcloud` i panele `e2e-icloud-*` w `tryb-e2e.ts`; `npm run jakosc:slady-wydania` kod 0.
5. **Kompozycja i ekrany** — krok „uruchom silnik” w `start.ts` (po kroku partii 6), wiersz iCloud i stany F-58 w Data and sync, linia konfliktu na liczniku, „Also delete from iCloud”; wymaga kluczy `icloud.*` (łatka 04 z partii 6). Scenariusze 48–51.
6. **Natywne (lokalnie do okna maszyn)** — `modules/oczko-icloud` (CKSyncEngine, strefa `Oczko`, `CKAsset`), `cloudkit/schemat.ckdb` z generatora + test równości, XCTest odwzorowania na wektorach JSON.

## Ustalenia i odstępstwa (do przeglądu koordynatora / 05)
- (U1) Port `Synchronizacja` v2 nie niesie przyczyny stanu `blad`, a projekt 04 rozróżnia brak miejsca (`icloud.brak_miejsca`). Bez zmiany sygnatury: `wyslij` odrzuca błędem z polem `kod` (`brak_miejsca` | `siec`), sterownik mapuje na `przyczyna`. Do zatwierdzenia przez 05 przy następnej sesji.
- (U2) Przełącznik iCloud a `ICLOUD_W_1_0 = false`: scenariusze 48–51 wymagają wiersza. Rekomendacja zgłoszona koordynatorowi: wiersz widoczny przy `ICLOUD_W_1_0` albo aktywnej atrapie E2E.
- (U3) Wyzwalacz UPDATE `licznik` (L1) wpisuje do skrzynki także zmianę samej pamięci podręcznej (`wartosc`, `glowa`); rekord jedzie bez tych kolumn — nadmiarowa wysyłka, nie błąd danych. Ewentualne zawężenie wyzwalacza: decyzja 05.
- (U4) Rekord z kolumną nieznaną lokalnie (nowszy schemat na innym urządzeniu) — kolumna pomijana (zmiany schematu tylko dodające, ADR-0005).
- (U5) Testy warstwy danych powstały razem z kodem repozytorium (domena: test przed kodem); siłę testów sprawdziłem mutantami ręcznie: bez flagi `wejscie` 3 testy czerwone, bez `nr <=` 1, bez „nowsza wygrywa” 1 (dopisany test).

## Dowody
| Krok | Commit | Testy |
|---|---|---|
| 1–3 domena, dane, przypadki użycia | (ten commit) | `tests/domena/icloud/icloud-odwzorowanie.test.ts` 8/8, `tests/dane/icloud-dwa-urzadzenia.test.ts` 14/14 (w tym własność: permutacje, podział, powtórzenia) |
