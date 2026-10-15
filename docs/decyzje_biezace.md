# Oczko — Rejestr bieżący decyzji i stanu projektu
**Data aktualizacji:** 15.10.2026  
**Właściciel:** Łukasz  
**Status projektu:** Start fazy budowy (Tydzień 0)

---

## 1. Przyjęte moduły i role (odkrycie ról, Zasada 10)
* **Obowiązujące moduły:**
  1. *Moduł: aplikacje (oprogramowanie)* (TDD, testy przed kodem, potwierdzanie czerwonego testu na kodzie przed poprawką, praca odporna na przerwy, narzędzia 0 zł).
  2. *Moduł: research i treści merytoryczne* (5 szczebli hierarchii źródeł, czytanie par zdań, brak faktów z pamięci).
  3. *3 zasady ogólne z modułu gier* (jedno źródło prawdy z generatorami, „udokumentowane” ≠ „zweryfikowane”, warianty/archiwa obok kanonu).
* **Odrzucone moduły:**
  * *Moduł: produkcja medialna z AI* (ZP-05: brak treści generowanych przez AI w produkcie).
* **Aktywne role:**
  * Analityk produktu, Badacz merytoryczny, Programista, Tester E2E, Audytor / Weryfikator treści, Sekretarz dokumentacji, Koordynator.

---

## 2. Rozstrzygnięte decyzje (Blok I — przed startem budowy)

* **DEC-01 Zakres pierwszej wersji: Opcja (b+) — Rekomendowana**
  * *Zakres:* 128 BR (122 MUST + 6 wyjątków higieny: ochrona przed podwójnym liczeniem BR-LICZ-007, cyfrowa koronka BR-ZEG-003, widżet Smart Stack z „+1” BR-ZEG-009, kontrolka/przycisk czynności BR-SYS-011, 14 dni próby BR-ZAK-003, Family Sharing BR-ZAK-011).
  * *Nakład:* ok. 26–44 dni pracy agenta (3–4 tyg. kalendarza).
* **DEC-02 Garmin w MVP czy zaraz po: Opcja B**
  * *Rozstrzygnięcie:* Wersja na zegarki Garmin w wersji 1.1 (zaraz po MVP); w MVP prototyp modułu w Expo/React Native eliminujący ryzyko architektoniczne.
* **DEC-03 Pełna aplikacja na Apple Watch w MVP: Opcja A**
  * *Rozstrzygnięcie:* Pełna niezależna aplikacja (gest, koronka, wibracje haptyczne).
* **DEC-04 Nauka jako wyróżnik: Opcja A**
  * *Rozstrzygnięcie:* Tak, nauka wchodzi do produktu od wersji 1.0 (trener z powtórkami, słownik, karty technik).
* **DEC-05 Bundle ID: Opcja A**
  * *Rozstrzygnięcie:* `com.apps4brew.knitting` (trwały, niezależny od ewentualnej zmiany nazwy handlowej).
* **DEC-06 Repozytorium robocze i organizacja: Decyzja właściciela (15.10.2026)**
  * *Rozstrzygnięcie:* Pracujemy bezpośrednio w repozytorium [`lkarwowski494/Oczko`](https://github.com/lkarwowski494/Oczko). Przeniesienie do organizacji `Apps4Brew` następuje dopiero na etapie wydania PROD w App Store.
  * **KRYTYCZNA ZASADA BEZPIECZEŃSTWA (INWARIANT):** Repozytorium [`lkarwowski494/trening`](https://github.com/lkarwowski494/trening) jest **ŚCIŚLE READ-ONLY**. Absolutny zakaz modyfikacji, usuwania, commita i pusha do projektu Trening. Służy wyłącznie do odczytu i powielania architektury.
* **DEC-07 Hierarchia źródeł: Opcja A**
  * *Rozstrzygnięcie:* 5 szczebli: 1. rachunek → 2. normy branżowe → 3. podręczniki → 4. organizacje/serwisy → 5. praktyka (społeczność).
* **DEC-08 Minimalna wersja iOS / watchOS: Opcja B**
  * *Rozstrzygnięcie:* iOS 18 / watchOS 11 (obsługa kontrolek, gestów, widżetów Smart Stack).
* **DEC-09 Przeglądarka PDF: Opcja A**
  * *Rozstrzygnięcie:* Własny moduł z linijką przypiętą do strony (spełnia NFR-DOST-009).
* **DEC-10 Kopia i synchronizacja: Opcja A**
  * *Rozstrzygnięcie:* W MVP kopia w pliku + iCloud Drive użytkownika; synchronizacja w chmurze (CloudKit) w wersji 2.x. Pliki wzorów domyślnie wyłączone z kopii do czasu opinii prawnej (DEC-33).

---

## 3. Rozstrzygnięte decyzje (Blok II — kluczowe zasady produktu)
* **DEC-11 Model wejścia:** W4 + G2 (darmowy rdzeń z limitem na 1 aktywny projekt + 14 dni pełnej wersji; zegarek i Garmin darmowe dla 1 projektu).
* **DEC-12 Family Sharing:** Opcja A (włączone dla subskrypcji i zakupu dożywotniego).
* **DEC-13 Ilustracje technik:** Opcja A (rysowane kodem, 0 zł).
* **DEC-16 Rozpoznawanie ściegu:** Opcja A (klucz „co widzisz?” bez AI w MVP, klasyfikator w 1.1).
* **DEC-17 Trener wzorów w MVP:** Opcja A (słownik + 4 ćwiczenia z powtórkami, bez parsera wzorów).
* **DEC-18 Języki terminologii w MVP:** Opcja A (EN-US/UK, DE, FR, polskie druty; polskie szydełko opisowo).
* **DEC-21 iPad i Mac:** Opcja A (iPhone w MVP, iPad w 1.2; Mac wyłączony w ASC do czasu testu).
* **DEC-24 Glify symboli:** Opcja A (własne glify wektorowe + przypis do standardu + równoległe zapytanie o licencję).

* **DEC-25 Architektura nawigacji aplikacji:** Opcja A (15.10.2026)
  * *Rozstrzygnięcie:* 5-zakładkowa architektura w Expo Router (`app/(tabs)/`: `index` Licznik, `projects` Projekty, `stash` Magazyn, `learn` Nauka, `settings` Ustawienia) z root layoutem Stack oraz `SafeAreaProvider`.

* **ZAS-TYMCZ Tymczasowa reguła wykonawcza właściciela (15.10.2026):**
  * *Rozstrzygnięcie:* Agent automatycznie przyjmuje rekomendowane opcje decyzyjne i nieprzerwanie kontynuuje implementację kolejnych modułów MVP, raportując twarde dowody (testy, CI) oraz aktualny stan po każdym kroku (obowiązuje do odwołania przez właściciela).

---

## 4. Postęp implementacji MVP (Tydzień 0/1)
* **Zrealizowane wymagania:**
  * **BR-LICZ-001 & 003**: Silnik licznika, obsługa cykli i powtórzeń, progi powiadomień (`src/core/counter-engine.ts`).
  * **BR-LICZ-004**: Obsługa niezawodnego cofania (UNDO) ze znakowaniem zdarzeń anulowanych.
  * **BR-LICZ-007**: Ochrona przed podwójnym liczeniem (debounce 300 ms dla manualnych stuknięć, detekcja potencjalnych duplikatów między urządzeniami <= 2s).
  * **BR-LICZ-008 & BR-DANE-001**: Trwałość w SQLite (`src/core/database.ts`, `src/core/project-repository.ts`), niezmienny dziennik zdarzeń (append-only), pełne odtwarzanie stanu po awarii i restarcie.
  * **BR-NAV-001 & Architektura UI**: Pełny layout nawigacyjny w Expo Router (`app/_layout.tsx`, `app/(tabs)/_layout.tsx`) z 5 dedykowanymi ekranami: Licznik (`index.tsx`), Projekty (`projects.tsx`), Magazyn (`stash.tsx`), Nauka (`learn.tsx`), Ustawienia (`settings.tsx`).
  * **BR-PROJ-001...005 & Pionowy plasterek (Vertical Slice)**:
    - Serwis zarządzania cyklem życia projektów i wyliczania postępów (`src/core/project-service.ts`).
    - Reaktywny kontekst stanu `ProjectProvider` (`src/core/project-context.tsx`) łączący SQLite z UI.
    - Interaktywny ekran `Projekty` z modalem tworzenia robótek (nazwa, druty/szydełko, części, docelowe rzędy) i wyborem aktywnego projektu.
    - Pełna integracja z ekranem `Licznik`: stuknięcie w ekran trwale rejestruje krok w SQLite (`counter_events`), odświeża stan w czasie rzeczywistym i umożliwia cofanie (UNDO).
  * **DEC-04, DEC-17, DEC-18, DEC-24 & Moduł Nauka (Wyróżnik MVP)**:
    - Autorytatywna baza 42 terminów dziewiarskich i szydełkowych (`src/core/glossary-data.ts`) ze standardem CYC, terminologią PL ↔ EN / DE / FR, glifami i filtrowaniem po kategoriach.
    - Silnik trenażera powtórzeń sekwencji ściegów (`src/core/pattern-trainer.ts`) z 4 wzorcami (Ściągacz 2x2, Ścieg ryżowy, Warkocz C6F, Ażur z dziurkami).
    - Interaktywny ekran `app/(tabs)/learn.tsx` z przełącznikiem trybów (Słownik / Trenażer), podglądem bieżącego kroku, stroną RS/WS, licznikiem powtórzeń w rzędzie oraz ekranem gratulacyjnym.
  * **BR-MAG-001...005 & Trwały Magazyn Włóczek i Narzędzi w SQLite**:
    - Tabele `stash_yarns` i `stash_tools` ze schematem SQLite i indeksami (`src/core/database-schema.ts`, `src/core/database.ts`).
    - Repozytorium operacji CRUD i seedowania danych startowych (`src/core/stash-repository.ts`).
    - Interaktywny interfejs `app/(tabs)/stash.tsx` z przełącznikiem Włóczki / Druty i szydełka, modalem rejestracji nowych motków i akcesoriów oraz operacją zużycia motka.
  * **BR-PROJ-002, BR-LICZ-003, BR-LICZ-005 & Wieloczęściowość i Powiązane Liczniki Modulo (Warkocze / Ażury)**:
    - Rozszerzenie `ProjectService` o dodawanie części robótki oraz liczników powiązanych z konfigurowalnym modulo cyklu i etykietą przypomnienia (`addPartToProject`, `addLinkedCounterToPart`).
    - Synchroniczna inkrementacja licznika powiązanego w `ProjectFacade.stepCounter` przy kroku licznika głównego części.
    - Transakcyjne i spójne wycofywanie (UNDO) kroku nadrzędnego wraz z powiązanymi krokami podrzędnymi w pojedynczej transakcji SQLite (`createAndApplyUndoWithLinked`).
    - Interfejs `MainCounterScreen`: poziomy pasek wyboru części robótki (chipsy) z licznikami rzędów, karty powiązanych liczników z wyliczaniem rzędu w powtórzeniu (np. `Rząd 4/6 (Powt. 2)`), plakietki ostrzeżeń/przypomnień oraz modal szybkiego dodawania wzorów/warkoczy.
    - Ekran `app/(tabs)/projects.tsx`: podgląd wszystkich części i ich postępu dla każdego projektu oraz modal dodawania nowej części.
  * **DEC-10, ZP-06, BR-DANE-002 & Kopia Zapasowa Bazy SQLite (Export / Import JSON)**:
    - Serwis kopii bezpieczeństwa `src/core/backup-service.ts` realizujący pełny eksport wszystkich 6 tabel bazy SQLite wraz z metadanymi wersji, bundle ID i liczbą rekordów.
    - Ścisła walidacja strukturalna formatu pliku przed przywróceniem (`validateBackupData`).
    - Atomowe, transakcyjne przywracanie stanu z kopii zapasowej (`importDatabaseBackup`) z kaskadowym czyszczeniem i odtwarzaniem powiązań kluczy obcych.
    - Interfejs `app/(tabs)/settings.tsx`: kafel statystyk bazy w czasie rzeczywistym (liczba projektów, zdarzeń, włóczek, narzędzi), natywny eksport przez systemowy Share Sheet (zapis do plików, iCloud, AirDrop) oraz modal bezpiecznego przywracania z podglądem błędów walidacji.
  * **DEC-09, NFR-DOST-009 & Przeglądarka Schematów z Linijką Przypiętą do Wiersza (Pattern Guide Viewer)**:
    - Baza wbudowanych schematów dziewiarskich CYC (`src/core/pattern-guide-data.ts`) dla warkoczy (C6F) oraz ażurów z dziurkami (romby).
    - Komponent `src/components/PatternGuideViewer.tsx` wyposażony w interaktywną, półprzezroczystą linijkę o wysokim kontraście (high accessibility NFR-DOST-009) podświetlającą bieżący wiersz diagramu.
    - Opcja automatycznego kroku linijki (`Auto-krok`) zsynchronizowana z licznikiem głównym robótki oraz tryb ręcznego przesuwania linijki po diagramie.
    - Zintegrowany przełącznik widoku w `src/screens/MainCounterScreen.tsx` (`🔢 Licznik` vs `📜 Schemat & Linijka`), umożliwiający podgląd wzoru z jednoczesnym naliczaniem rzędów.
  * **Stan testów:** 16 zestawów testowych, 53 testy jednostkowe, komponentowe i integracyjne zaliczone (100% zielone).



