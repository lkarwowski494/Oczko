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

---

## 4. Postęp implementacji MVP (Tydzień 0/1)
* **Zrealizowane wymagania:**
  * **BR-LICZ-001 & 003**: Silnik licznika, obsługa cykli i powtórzeń, progi powiadomień (`src/core/counter-engine.ts`).
  * **BR-LICZ-004**: Obsługa niezawodnego cofania (UNDO) ze znakowaniem zdarzeń anulowanych.
  * **BR-LICZ-007**: Ochrona przed podwójnym liczeniem (debounce 300 ms dla manualnych stuknięć, detekcja potencjalnych duplikatów między urządzeniami <= 2s).
  * **BR-LICZ-008 & BR-DANE-001**: Trwałość w SQLite (`src/core/database.ts`, `src/core/project-repository.ts`), niezmienny dziennik zdarzeń (append-only), pełne odtwarzanie stanu po awarii i restarcie.
  * **BR-NAV-001 & Architektura UI**: Pełny layout nawigacyjny w Expo Router (`app/_layout.tsx`, `app/(tabs)/_layout.tsx`) z 5 dedykowanymi ekranami: Licznik (`index.tsx`), Projekty (`projects.tsx`), Magazyn (`stash.tsx`), Nauka (`learn.tsx`), Ustawienia (`settings.tsx`).
  * **Stan testów:** 8 zestawów testowych, 25 testów jednostkowych i komponentowych zaliczonych (100% zielone lokalnie i gotowe do weryfikacji w CI).
