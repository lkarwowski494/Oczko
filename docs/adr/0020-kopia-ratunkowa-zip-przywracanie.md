# 0020. Kopia ratunkowa: surowe trzy pliki przed otwarciem bazy, przekazanie jako jeden ZIP, przywrócenie przez API kopii po sprawdzeniu, kopie trzymane 30 dni
Data: 2026-10-22 · Status: **przyjęta** (P-080 (3b)) · Rola: 12 (E1) · Zależy od: ADR-0001, ADR-0002, ADR-0004, ADR-0016 (ZIP), ADR-0019

## Kontekst i problem
ADR-0004 ustala zwykły eksport i import, `dane.md` kopię `VACUUM INTO` przed migracją z przebudową. Brakuje ścieżki, gdy baza jest uszkodzona albo aplikacja nie startuje. Fakty (odczyt 2026-10-22): „If a database file is separated from its WAL file, then transactions that were previously committed to the database might be lost, or the database file might become corrupted” (sqlite.org/wal.html); `VACUUM INTO` daje „a consistent snapshot of the original database” (sqlite.org/lang_vacuum.html); podmiana pliku bazy bez jej dziennika prowadzi do uszkodzenia (sqlite.org/howtocorrupt.html §1.4); `expo-sqlite` ma `backupDatabaseAsync({ destDatabase, destDatabaseName, sourceDatabase, sourceDatabaseName })` (docs.expo.dev/versions/latest/sdk/sqlite). `.recover` to polecenie programu `sqlite3`, którego `expo-sqlite` nie ma (moduł `ratowanie-danych`, odczyt 18.10.2026).

## Czynniki decyzji
Oryginał nietknięty · kopia kompletna (z `-wal`) · uszkodzone dane da się przekazać deweloperowi jednym ruchem · przywrócenie nie podmienia pliku · miejsce na urządzeniu.

## Rozważane opcje
Sposób przekazania surowej kopii (pozostałe elementy są zasadą, nie opcją):
A. Trzy udostępnienia po kolei (`shareAsync` bierze jeden plik) z instrukcją.
B. Jeden ZIP z trzema plikami i małym `manifest.json` (wersja aplikacji, build, `user_version` jeśli odczytany, SHA-256 plików).
C. Katalog widoczny w aplikacji Pliki (klucze Info.plist do udostępniania dokumentów).

## Decyzja
Opcja B (właściciel: „3b”, P-080). Zasady:
1. **Surowa kopia na wejściu trybu awaryjnego** (ADR-0019), zanim cokolwiek otworzy bazę: `oczko.db`, `-wal`, `-shm` kopiowane do `Application Support/kopie/ratunkowe-<czas>/` (katalog kopii z `dane.md`, poza `Caches`).
2. **Baza się otwiera:** „Zapisz kopię danych” = archiwum `.oczko` (ADR-0004) z `VACUUM INTO` bez migracji, sprawdzone `sprawdzKopie` osobnym połączeniem przed udostępnieniem (`integrity_check` = ok, `foreign_key_check` pusty, `application_id`, `user_version` w zakresie).
3. **Baza się nie otwiera albo `VACUUM INTO` zawodzi:** ZIP surowej kopii z pkt 1 przez arkusz udostępniania; plik tymczasowy do udostępnienia w `Caches`, usuwany po udostępnieniu. ZIP używa tej samej biblioteki lub modułu co archiwum `.oczko` (ADR-0016, wybór roli 08 z 05).
4. **Brak miejsca:** komunikat z systemu roli 04; niczego nie usuwamy, żeby zrobić miejsce.
5. **Przywrócenie z kopii** (z pliku ratunkowego albo `.oczko` w trybie „zastąp”): `sprawdzKopie` → kopia bieżącej bazy `VACUUM INTO` do katalogu kopii → `backupDatabaseAsync` z kopii do bazy głównej przez kolejkę zapisów (ADR-0002), nigdy podmiana pliku → migracje → restart do kamienia milowego. Kopia nowsza, pusta, obca albo z innym `page_size`: odrzucona bez zmian w danych.
6. **Czas trzymania kopii** (ratunkowe, przed migracją, przed przywróceniem, przed importem): **30 dni**, ale nigdy przed kamieniem milowym nowej wersji (P-080, interpretacja roli 12 do weta: „30 dni” było kierunkiem w rozpisce Q3, właściciel wybrał „3b” bez liczby; zgodne z `KOPIA_PRZED_IMPORTEM_DNI` = 30). Nowy parametr `KOPIE_RATUNKOWE_DNI` = 30 w `konfiguracja.ts` (rola 05/08).
7. **Naprawa uszkodzonej bazy** tylko na kopii, na komputerze dewelopera (skrypt `naprawa-kopii.sh` z modułu w `docs/niezawodnosc/narzedzia/`, E3); pliki od użytkownika poza każdym repozytorium (także prywatnym), w scratchpadzie, usuwane po zamknięciu sprawy za zgodą właściciela; o zwrocie danych decyduje właściciel z użytkownikiem.

### Konsekwencje
- Dobre: żadna operacja ratunkowa nie zmienia oryginału; jeden plik do wysłania; przywrócenie ma kopię „przed”.
- Złe: kopie zajmują miejsce do 30 dni (przy 18 MB bazy kilka kopii to dziesiątki MB; pliki wzorów nie są kopiowane, bo nie zmieniają się w miejscu, ADR-0001); ZIP zależy od nierozstrzygniętego wyboru w ADR-0016.
- Prywatność: kopie zostają na urządzeniu (w kopii systemowej urządzenia jak baza); wychodzą tylko przez arkusz udostępniania z decyzji użytkownika; u dewelopera to dane osobowe (pkt 7). Koszt: 0 zł.

### Potwierdzenie
- Testy w Node na `node:sqlite` (E2, czerwone przed kodem): kopia `VACUUM INTO` zawiera zapisy z `-wal` (baza w WAL, zapis bez checkpointu, kopia ma wszystkie wiersze); `sprawdzKopie`: uszkodzona, nowsza, starsza niż `min`, obca, pusta, poprawna; przywrócenie: liczności przed i po, błąd w trakcie zostawia bieżącą bazę bez zmian, kopia „przed” istnieje.
- Test sprzątania: kopia 29 dni zostaje, 31 dni usunięta, kopia sprzed kamienia milowego zostaje niezależnie od wieku.
- Test na symulatorze (CI, P-079): przywrócenie z kopii na czystej instalacji z licznościami; ZIP surowej kopii zawiera trzy pliki o SHA-256 z manifestu.
- Kontrola w CI: brak kopiowania samej ścieżki `.db` bez `-wal` w `src/`, brak `VACUUM` i `REINDEX` na bazie głównej w kodzie ratunkowym.

## Uzupełnienie 2026-10-26 (fix-3 05: P-123 pkt 6, P-124 Q7a; decyzja B i zasady bez zmian; do przeglądu roli 12)
- **(5′) Mechanizm przywrócenia: `ATTACH` + `INSERT … SELECT` zamiast `backupDatabaseAsync`.** Port bazy nie wydaje uchwytu `SQLiteDatabase` (ADR-0002), a `backupDatabaseAsync` nadpisuje stronami całą bazę, także `blad` i klucze stanu urządzenia. Zasady (5) zostają: `sprawdzKopie` przed czymkolwiek, kopia bieżącej bazy `VACUUM INTO` do katalogu kopii, nigdy podmiana pliku, wszystko przez kolejkę. Kolejność (stan kodu: `src/dane/kopia-ratunkowa.ts:71-90`, `src/dane/baza/przeniesienie.ts:24-46`): (1) kopia w starszym schemacie migrowana tym samym runnerem na **kopii roboczej** w katalogu tymczasowym (plik od użytkownika nietknięty), usuwanej na końcu; (2) `ATTACH DATABASE ? AS kopia` z parametrem, **poza transakcją** (w transakcji SQLite go odrzuca); (3) jedna transakcja `BEGIN IMMEDIATE` z `PRAGMA defer_foreign_keys = ON`: kontrola, że każda tabela bazy głównej ma regułę przeniesienia (nowa tabela bez reguły = błąd, nie pominięcie), usunięcie danych w kolejności dzieci → rodzice, wstawienie rodzice → dzieci; `blad` i klucze stanu urządzenia (`dane.md` „Klucze tabeli `ustawienie`”) zostają; naruszenie klucza obcego odrzuca `COMMIT` → `ROLLBACK`, baza bez zmian; (4) `DETACH` w `finally`. **Dla 08:** kroki (2)–(4) w jednej pozycji kolejki przypadków użycia (`wKolejce`), żeby żaden zapis z ekranu nie wszedł między `ATTACH` a transakcję; transakcja pod `CzasWTle.chron` (ADR-0002 (7)). „Kopia z innym `page_size`” przestaje być powodem odrzucenia (`INSERT … SELECT` nie kopiuje stron); zostają: nowsza, pusta, obca, uszkodzona.
- **(2′) `application_id`** (P-123 pkt 11, P-124 Q5a): schemat v1 go nie ustawiał, a `sprawdzKopie` sprawdzało obecność tabel. Kontrakt: wartość 1331919467 w schemacie i kontrola w `sprawdzKopie` (`docs/architektura/dane.md` „Identyfikator pliku bazy”); wdraża 08 w partii 3. Test: plik z innym `application_id` i tabelami Oczka → `obca`, bez zmian w danych.
- Potwierdzenie bez zmian (testy przywrócenia z licznościami, błąd w trakcie zostawia bazę bez zmian, kopia „przed” istnieje); dochodzi test: `blad` i klucze urządzenia po „zastąp” takie jak przed.

## Uzupełnienie 2026-10-26 (rola 12 E2–E3, P-194; decyzja B i zasady bez zmian)
- (3) ZIP surowej kopii: `zipSurowejKopii` w `src/niezawodnosc/kopie.ts` — pliki z wyniku `surowaKopia` i `manifest.json` (wersja, build, `user_version` i `application_id` z nagłówka pliku, SHA-256); bazy nie otwiera. Wpięcie w ekran awaryjny: łatka dla 08 (P-194 Q3a).
- (6) Sprzątanie: `kopieDoUsuniecia` / `sprzatnijKopie`, ściśle starsze niż 30 dni, tylko przy kamieniu milowym; kopia bez czasu w nazwie zostaje. Nazwa kopii przed migracją z czasem: `przed-migracja-<wersja>-<ms>.db` (P-194 Q2a, N12-02), żeby ponowna próba po nieudanej migracji nie trafiała na istniejący plik.
- Ćwiczenia automatem (pętla, zepsuty plik, brak miejsca, przerwane przywracanie): `tests/niezawodnosc/cwiczenia.test.ts`, wynik w `docs/niezawodnosc/runbook.md` §6.

## Opcje: zalety i wady
### A — zalety: bez zależności · wady: trzy kroki dla zestresowanej osoby; łatwo wysłać sam `.db` bez `-wal` (utrata zapisów).
### B — zalety: jeden plik, komplet gwarantowany, SHA-256 do sprawdzenia · wady: zależy od ZIP (ADR-0016).
### C — zalety: bez kodu udostępniania · wady: dodatkowe klucze Info.plist, katalog widoczny w Plikach także na co dzień; użytkownik sam musi wybrać trzy pliki.
