# Rola 08 (programista), build, partia 7: synchronizacja iCloud
Plik stanu sesji · start 2026-10-26 ok. 19:40 UTC · gałąź `claude/jolly-thompson-paz6d8` · zakres: „Kontrakt partii 7” w `docs/architektura/moduly.md` (F-27, F-58 część synchronizacji, BR-DAN-002 S1–S3), projekt `docs/design/fix7-2026-10-26.md` i `udostepnij-icloud.html`, plan 07 `docs/jakosc/plan-partia-7-icloud.md`; decyzje P-217, P-218 Q5a, P-220 I1a/N3/N5, P-221 Q5a, P-229, P-230, P-233, P-241. Prompt roli: [OTWARTE] — repo `prompts` niedostępne w tej sesji (add_repo zablokowane przez kontrolę uprawnień), praca wg CLAUDE.md, kontraktu i polecenia koordynatora.

## Stan: kod TS kompletny i wypchnięty; moduł Swift na gałęzi kopii `claude/kopia-partia-7` (ostatni commit gałęzi, zawsze natywny na końcu) do okna maszyn · 2026-10-26 ok. 20:45 UTC
**Następny krok (okno maszyn, po sygnale koordynatora):** przenieść commit modułu `modules/oczko-icloud` (kopia → gałąź robocza), build „Jakość · iOS” (kompilacja Swift — kod CloudKit nie był kompilowany, bo na Linuksie nie ma CloudKit), scenariusze 48–51 w pakiecie pełnym, `cktool validate-schema` dla `cloudkit/schemat.ckdb` (właściciel: kontener `iCloud.com.apps4brew.knitting`), XCTest odwzorowania `RekordIcloud` ↔ `CKRecord` [OTWARTE: nie napisany — wymaga celu testów w oknie maszyn]. Potem test ZM-06 na urządzeniach właściciela (P-233) → koordynator ustawia `ICLOUD_W_1_0`.

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
4. **Platforma** `src/platforma/icloud.ts` (wybór adaptera) + `icloud-atrapa.ts` (ładowana warunkowo jak panele P-238) + argument `oczkoE2eIcloud` i panele `e2e-icloud-*` w `tryb-e2e.ts`; `npm run jakosc:slady-wydania` kod 0. ✔
5. **Kompozycja i ekrany** — start silnika po danych startu (kompozycja licznika, U7), wiersz iCloud i stany F-58 w Data and sync, linia konfliktu na liczniku i arkusz wyboru (`/konflikt`), „Also delete from iCloud”, alert innego konta. Scenariusze 48–51 (zielone na poziomie danych i RNTL; E2E w oknie maszyn). ✔ Także „Replace” i przywrócenie kopii przy włączonej synchronizacji: odmowa w przypadku użycia (`niedozwolone_przejscie`; inaczej usunięcia poszłyby do iCloud) + alert `icloud.zastap_wylacz`.
6. **Natywne (lokalnie do okna maszyn)** — `modules/oczko-icloud` (CKSyncEngine, strefa `Oczko`, `CKAsset`; Pola.swift z generatora) na gałęzi kopii; `cloudkit/schemat.ckdb` z generatora + test równości ✔ (wypchnięte). XCTest odwzorowania: otwarte.

## Ustalenia i odstępstwa (do przeglądu koordynatora / 05)
- (U1) Port `Synchronizacja` v2 nie niesie przyczyny stanu `blad`, a projekt 04 rozróżnia brak miejsca (`icloud.brak_miejsca`). Bez zmiany sygnatury: `wyslij` odrzuca błędem z polem `kod` (`brak_miejsca` | `siec`), sterownik mapuje na `przyczyna`. Do zatwierdzenia przez 05 przy następnej sesji.
- (U2) Przełącznik iCloud a `ICLOUD_W_1_0 = false`: scenariusze 48–51 wymagają wiersza. Rekomendacja zgłoszona koordynatorowi: wiersz widoczny przy `ICLOUD_W_1_0` albo aktywnej atrapie E2E.
- (U3) Wyzwalacz UPDATE `licznik` (L1) wpisuje do skrzynki także zmianę samej pamięci podręcznej (`wartosc`, `glowa`); rekord jedzie bez tych kolumn — nadmiarowa wysyłka, nie błąd danych. Ewentualne zawężenie wyzwalacza: decyzja 05.
- (U4) Rekord z kolumną nieznaną lokalnie (nowszy schemat na innym urządzeniu) — kolumna pomijana (zmiany schematu tylko dodające, ADR-0005).
- (U6) → P-247 U6a, zrobione: `zdarzenie.urzadzenie_rodzaj` (`iphone` | `ipad` z `Platform.isPad`, NULL = nieznany: zegarek, ekran blokady przez dziennik, starsze), `schemat.sql` = `0001.sql` (v1 niewydany, P-184), `stany.json`; UUID zostaje w `urzadzenie`. Wybór wersji: „iPhone” / „iPad” (nazwy własne), bez rodzaju — wartość pola (atrapa: „iPad (test)”). Do przeglądu 05 (dane.md).
- (U7) Kontrakt umieszcza „uruchom silnik” w `start.ts`, ale `uruchomDane` działa w jednej pozycji kolejki, a sterownik sam wchodzi do kolejki (zakleszczenie). Start silnika jest więc w kompozycji licznika zaraz po `uruchomDane` (opcja `icloud`), błąd silnika nie blokuje startu.
- (U8) `Licznik.tsx` ma 20 476 B przy limicie 20 480 B (granice ROZMIAR); linia konfliktu wydzielona do `IcloudKonflikt.tsx`. Partia 6 (ikona „Pattern”) musi wydzielać swój kod tak samo.
- (U9) „Manage storage” otwiera Ustawienia aplikacji (`Linking.openSettings`) — iOS nie ma publicznego adresu strony miejsca w iCloud.
- (U5) Testy warstwy danych powstały razem z kodem repozytorium (domena: test przed kodem); siłę testów sprawdziłem mutantami ręcznie: bez flagi `wejscie` 3 testy czerwone, bez `nr <=` 1, bez „nowsza wygrywa” 1 (dopisany test).

## Dowody
| Krok | Commit | Testy |
|---|---|---|
| 1–3 domena, dane, przypadki użycia | 41364a6 | `tests/domena/icloud/icloud-odwzorowanie.test.ts` 8/8, `tests/dane/icloud-dwa-urzadzenia.test.ts` 14/14 (w tym własność: permutacje, podział, powtórzenia) |
| 4 platforma, atrapa, rozstrzyganie konfliktu | 401dd04 | `tests/adaptery/icloud-platforma.test.ts` 9/9; mutanty (P-245): atrapa +4, bez błędu brak-miejsca, potwierdzenie przy błędzie JS → czerwone |
| 5 ekrany i kompozycja | (ten commit) | RNTL `icloud-stan-danych` 10/10, `icloud-licznik` 2/2, `icloud-konflikt` 1/1, `tests/dane/kompozycja-icloud` 2/2 (czerwone przed kodem); verify kod 0, 2408/2408; `jakosc:slady-wydania` kod 0; eksport wydania: 0 × „iPad (test)”, eksport E2E z atrapą: 1× |
| U6a rodzaj urządzenia; „Zastąp”/przywrócenie przy iCloud | (ten commit), ebbb591 | `tests/dane/icloud-rodzaj-urzadzenia.test.ts` 2/2, `icloud-zastap` 2/2 (czerwone przed kodem); verify 2468/2468 |
| 6a generator `cloudkit/schemat.ckdb` | (ten commit) | `tests/narzedzia/icloud-schemat-ckdb.test.ts` 2/2 (czerwone przed kodem); składnia jak `cktool export-schema` [DO USTALENIA: `cktool validate-schema` na koncie właściciela] |
| 6b moduł Swift `oczko-icloud` | ostatni commit `claude/kopia-partia-7` (cherry-pick w oknie maszyn) | brak kompilacji na Linuksie (CloudKit); `kontrola-swift` 0 błędów; verify 2480/2480 z modułem w drzewie; `jakosc:slady-wydania` kod 0 na 3d8b7c9 |
| przegląd 48–51 | 4d8a800 | 50: włączenie wysyła przy pustej skrzynce (zapis strefy) — test przed kodem; RYZYKO 49: etykieta VoiceOver przycisków wyboru (`dane.konflikt_a11y`) a selektor tekstowy scenariusza — do sprawdzenia w oknie maszyn (zgłoszone koordynatorowi) |

## Źródła API (odczyt 2026-10-26, developer.apple.com, dokumentacja w formacie JSON tych samych stron; expo-modules-core z node_modules)
Sprawdzenie: każde API użyte w `modules/oczko-icloud/ios/*.swift` zgodne z deklaracją ze strony; różnice poprawione na gałęzi kopii.
| API (Silnik.swift) | Adres | Cytat |
|---|---|---|
| `CKSyncEngine`, stan silnika | https://developer.apple.com/documentation/cloudkit/cksyncengine-5sie5 | „The sync engine uses an opaque type to track its internal state, and it’s your responsibility to persist that state to disk and make it available across app launches” |
| `Event.StateUpdate` | https://developer.apple.com/documentation/cloudkit/cksyncengine-5sie5/event/stateupdate | „You should persist this state alongside any changes fetched prior to receiving this state.” (partia zapisuje stan sprzed pobrania; stan po aktualizacji zapisuje osobne potwierdzenie — kolejność bezpieczna) |
| `State.Serialization` (JSONEncoder/Decoder) | https://developer.apple.com/documentation/cloudkit/cksyncengine-5sie5/state-swift.class/serialization | zgodność z `Decodable`, `Encodable`, `Sendable` (sekcja „Conforms To”) |
| `Configuration(database:stateSerialization:delegate:)` | https://developer.apple.com/documentation/cloudkit/cksyncengine-5sie5/configuration | `init(database: CKDatabase, stateSerialization: CKSyncEngine.State.Serialization?, delegate: any CKSyncEngineDelegate)` |
| `handleEvent(_:syncEngine:)` | https://developer.apple.com/documentation/cloudkit/cksyncenginedelegate-1q7g8/handleevent(_:syncengine:) | „your delegate won’t receive the subsequent event until it finishes processing the current one and returns from this method” (czekanie na transakcję JS wstrzymuje kolejne zdarzenia — zamierzone) |
| `nextRecordZoneChangeBatch` | https://developer.apple.com/documentation/cloudkit/cksyncenginedelegate-1q7g8/nextrecordzonechangebatch(_:syncengine:) | „you must make sure to only return a batch for the scope specified in the callback” (filtr `options.scope` jest) |
| `RecordZoneChangeBatch(pendingChanges:recordProvider:)` | https://developer.apple.com/documentation/cloudkit/cksyncengine-5sie5/recordzonechangebatch/init(pendingchanges:recordprovider:) | `init?(…, recordProvider: @Sendable (CKRecord.ID) async -> CKRecord?) async`; „If the closure returns nil, the method skips that change.” (ryzyko 3: async provider — zgodny) |
| `sendChanges(_:)` | https://developer.apple.com/documentation/cloudkit/cksyncengine-5sie5/sendchanges(_:) | „Use this method to request the sync engine sends all pending local changes to the server before your app continues.” |
| `cancelOperations()` | https://developer.apple.com/documentation/cloudkit/cksyncengine-5sie5/canceloperations() | „it’s possible for in-progress operations to complete even after this method returns” |
| `Event.SentRecordZoneChanges` | https://developer.apple.com/documentation/cloudkit/cksyncengine-5sie5/event/sentrecordzonechanges | pola `savedRecords`, `deletedRecordIDs`, `failedRecordSaves` (`record`, `error`), `failedRecordDeletes: [CKRecord.ID : CKError]` — **brakowało obsługi `failedRecordDeletes`: dopisana** |
| `Event.SentDatabaseChanges` | https://developer.apple.com/documentation/cloudkit/cksyncengine-5sie5/event/sentdatabasechanges | `failedZoneSaves` (`zone`, `error`) |
| `Event.AccountChange.ChangeType` | https://developer.apple.com/documentation/cloudkit/cksyncengine-5sie5/event/accountchange/changetype-swift.enum | `signIn(currentUser:)`, `signOut(previousUser:)`, `switchAccounts(previousUser:currentUser:)` |
| `FetchedRecordZoneChanges`, `FetchedDatabaseChanges` | https://developer.apple.com/documentation/cloudkit/ckdatabase/recordzonechange/deletion, …/databasechange/deletion | `recordID`, `recordType`; `zoneID` |
| `CKError.Code.quotaExceeded` | https://developer.apple.com/documentation/cloudkit/ckerror/code/quotaexceeded | „In the private database: The user doesn’t have enough iCloud storage. Prompt the user to go to iCloud settings to manage their storage.” |
| `CKError.Code.serverRecordChanged`, `serverRecord` | https://developer.apple.com/documentation/cloudkit/ckerror/code/serverrecordchanged | „your app needs to merge all changes into the record for the CKRecordChangedErrorServerRecordKey key and attempt a new save using that record” (pola systemowe rekordu serwera zapamiętane → następna wysyłka z jego znacznikiem zmiany) |
| `CKRecord.encodeSystemFields(with:)` | https://developer.apple.com/documentation/cloudkit/ckrecord/encodesystemfields(with:) | „You might use this method when you want to store only the system metadata because you store the actual record data elsewhere.” |
| Expo: kod błędu (ryzyko 1) | `node_modules/expo-modules-core` 57.0.23, `ios/Core/Exceptions/Exception.swift:39–50` | `init(name:description:code:)` → `customCode`; zamiast podklasy używam tego inicjalizatora |
| Expo: `sendEvent` (ryzyko 2) | `ios/Core/Modules/Module.swift:24` | `public func sendEvent(_ eventName: String, _ body: [String: Any?] = [:])` — `[String: Any]` przechodzi przez niejawne rzutowanie kolekcji [OTWARTE: potwierdzi kompilacja w oknie maszyn] |

## Stan po oknie maszyn 2026-10-27
- 2b7c1f0 (moduł `oczko-icloud`) na gałęzi roboczej: „Jakość · iOS” przebieg 115 — build Release zielony (Swift skompilowany za pierwszym razem), swift-test zielony.
- P-255 (a) wariant 1 (measureInWindow), (b), (c) przyjęte; commity na gałęzi kopii, push na roboczą po partii 6 (sygnał koordynatora).
- **Otwarte (plan):** XCTest modułu `oczko-icloud` — odwzorowanie `RekordJs` ↔ `CKRecord` (Pola.double, zasób `dane`, recordName z dwukropkiem w kluczu), na wektorach JSON wspólnych z `tests/domena/icloud`; testy przed kodem przy następnej zmianie kodu natywnego (cel testów do ustalenia z 07).
