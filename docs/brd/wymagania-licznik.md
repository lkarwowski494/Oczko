# Wymagania: licznik (LIC)
Stan: STOP E3 · Aktualizacja: 2026-10-21 · Przepływy w `wymagania.md`; dowody i cytaty w `odkrywanie.md`.

### BR-LIC-001: Licznik od pierwszego uruchomienia
- Przepływ: PR-01
- Dowód potrzeby: J-01; początkujący odinstalowują, gdy nie umieją założyć pierwszego projektu (soczewka początkująca, My Row Counter id11891747617); OG-01 wymaga głębi, ale nie na starcie (H-07)
- Kryteria akceptacji:
  - Scenariusz: Pierwsze uruchomienie
    - Zakładając, że aplikacja jest uruchomiona pierwszy raz
    - Gdy otwiera się pierwszy ekran
    - Wtedy jest nim licznik z wartością 0, bez powitania, quizu, prośby o uprawnienie, konto, nazwę projektu, wzór ani zakup (NFR-PIE-001, ER-14)
  - Scenariusz: Pierwszy rząd jednym stuknięciem
    - Zakładając, że aplikacja jest uruchomiona pierwszy raz, bez sieci
    - Gdy użytkownik stuka raz w przycisk dodawania
    - Wtedy licznik pokazuje 1
  - Scenariusz: Nazwanie później
    - Zakładając, że użytkownik policzył 12 rzędów w liczniku bez nazwy
    - Gdy nadaje mu nazwę projektu
    - Wtedy projekt ma licznik z wartością 12

### BR-LIC-002: Dodawanie i odejmowanie rzędu
- Przepływ: PR-02
- Dowód potrzeby: J-01; skargi na usunięty przycisk odejmowania (編み物カウンター２, id10157582822) i brak cofania (Knit Row Counter)
- Kryteria akceptacji:
  - Scenariusz: Dodanie rzędu
    - Zakładając, że licznik ma wartość 41
    - Gdy użytkownik dodaje rząd
    - Wtedy licznik pokazuje 42
  - Scenariusz: Odjęcie przy pruciu
    - Zakładając, że licznik ma wartość 42
    - Gdy użytkownik odejmuje rząd
    - Wtedy licznik pokazuje 41
  - Scenariusz: Granica zera
    - Zakładając, że licznik ma wartość 0
    - Gdy użytkownik odejmuje rząd
    - Wtedy licznik nadal pokazuje 0, a aplikacja nie zapisuje zmiany w historii

### BR-LIC-003: Historia zmian z godziną i cofnięciem
- Przepływ: PR-02
- Dowód potrzeby: J-01; „いつカウンターを押したのか履歴を確認できるので” (編み物カウンター２, id13252701149); historii nie da się poprawić (Easy Knitty GB, id8099185238)
- Kryteria akceptacji:
  - Scenariusz: Sprawdzenie, czy dodałem rząd
    - Zakładając, że użytkownik dodał rząd o 20:14 i o 20:31
    - Gdy otwiera historię licznika
    - Wtedy widzi obie zmiany z godziną i wartością po zmianie
  - Scenariusz: Cofnięcie serii przypadkowych zmian
    - Zakładając, że licznik miał 30, a przez przypadek dodano 100 rzędów
    - Gdy użytkownik cofa te zmiany z historii
    - Wtedy licznik pokazuje 30, a statystyki czasu i tempa nie liczą cofniętych rzędów

### BR-LIC-004: Blokada przed przypadkowym stuknięciem
- Przepływ: PR-02
- Dowód potrzeby: J-01; 24 z 47 recenzji o przypadkowym stuknięciu ma ≤3★; „Just moving my phone to get back to the pattern caused row jumps” (Knit Row Counter, id1532433389); „The motion of swiping up increases the count every single time” (Knit Row Counter CA, id4570617893)
- Kryteria akceptacji:
  - Scenariusz: Licznik zablokowany
    - Zakładając, że licznik ma wartość 15 i jest zablokowany
    - Gdy telefon dotknie kolana albo stołu w miejscu przycisku dodawania
    - Wtedy licznik nadal pokazuje 15
  - Scenariusz: Odblokowanie
    - Zakładając, że licznik jest zablokowany
    - Gdy użytkownik odblokowuje go świadomym gestem
    - Wtedy dodanie rzędu znów zmienia wartość
  - Scenariusz: Stuknięcie w zablokowany licznik (ER-24)
    - Zakładając, że licznik ma wartość 15 i jest zablokowany
    - Gdy użytkownik świadomie stuka w przycisk dodawania
    - Wtedy licznik nadal pokazuje 15, a aplikacja pokazuje, że licznik jest zablokowany i jak go odblokować
  - Scenariusz: Gest systemowy (ER-24)
    - Zakładając, że licznik ma wartość 15 i nie jest zablokowany
    - Gdy użytkownik przesuwa palcem od dolnej krawędzi, żeby przejść do innej aplikacji
    - Wtedy licznik nadal pokazuje 15, a historia nie ma nowej zmiany

### BR-LIC-005: Potwierdzenie zmiany bez przerywania dźwięku
- Przepływ: PR-02
- Dowód potrzeby: J-01; użytkownik nie patrzy na ekran (kontekst); „NO sound (that means: listen to your podcast …)” (opis Easy Knitty, S-17)
- Kryteria akceptacji:
  - Scenariusz: Potwierdzenie dotykiem
    - Zakładając, że w tle gra podcast z innej aplikacji
    - Gdy użytkownik dodaje rząd
    - Wtedy telefon potwierdza zmianę wibracją, a podcast gra dalej bez przerwy
  - Scenariusz: Dźwięk wyłączony
    - Zakładając, że użytkownik wyłączył dźwięki aplikacji
    - Gdy dodaje rząd
    - Wtedy aplikacja nie odtwarza żadnego dźwięku

### BR-LIC-006: Kilka liczników w projekcie
- Przepływ: PR-03
- Dowód potrzeby: J-02; 13 z 14 konkurentów; „Set up several counters to keep track of your increases” (opis My Row Counter, S-17)
- Kryteria akceptacji:
  - Scenariusz: Drugi licznik
    - Zakładając, że projekt ma licznik rzędów z wartością 20
    - Gdy użytkownik dodaje licznik oczek i dodaje w nim 5
    - Wtedy projekt pokazuje licznik rzędów 20 i licznik oczek 5

### BR-LIC-007: Licznik powtórzeń powiązany z rzędami
- Przepływ: PR-03 · Reguła: RD-12
- Dowód potrzeby: J-02; „I wish it had a repeat counter for those pattern where you repeat rows 1-8 several times” (My Row Counter, id14113087501)
- Kryteria akceptacji:
  - Scenariusz: Środek trzeciego powtórzenia
    - Zakładając, że powtórzenie ma 8 rzędów
    - Gdy licznik rzędów osiąga 17
    - Wtedy aplikacja pokazuje powtórzenie 3 i rząd 1 powtórzenia (RD-12-W1)
  - Scenariusz: Koniec powtórzenia
    - Zakładając, że powtórzenie ma 8 rzędów
    - Gdy licznik rzędów osiąga 8
    - Wtedy aplikacja pokazuje powtórzenie 1 i rząd 8 powtórzenia (RD-12-W2)
  - Scenariusz: Błędna długość powtórzenia
    - Zakładając, że użytkownik ustawia powtórzenie
    - Gdy podaje długość 0 rzędów
    - Wtedy aplikacja nie zapisuje ustawienia i prosi o długość co najmniej 1 (RD-12-W5)

### BR-LIC-008: Zmiana ustawień licznika w trakcie
- Przepływ: PR-03
- Dowód potrzeby: J-02; „once I start I can’t edit the counter” (knitCompanion, id10629944697)
- Kryteria akceptacji:
  - Scenariusz: Zmiana długości powtórzenia
    - Zakładając, że licznik rzędów ma 17, a powtórzenie 8 rzędów
    - Gdy użytkownik zmienia długość powtórzenia na 10
    - Wtedy licznik rzędów nadal ma 17, a aplikacja pokazuje powtórzenie 2 i rząd 7 powtórzenia

### BR-LIC-009: Przypomnienie „co N rzędów, M razy”
- Przepływ: PR-04 · Reguła: RD-13
- Dowód potrzeby: J-03; przypomnienie przeoczone, bo za mało widoczne (編み物カウンター２, id13310860035); „the reminder needs an audio queue” (My Row Counter, id11943122526)
- Kryteria akceptacji:
  - Scenariusz: Przypomnienie w trakcie serii
    - Zakładając, że instrukcja to: od rzędu 6, co 6 rzędów, 5 razy
    - Gdy licznik rzędów osiąga 12
    - Wtedy aplikacja pokazuje przypomnienie z numerem 2 z 5, zmienia wygląd całego ekranu licznika i potwierdza je wibracją (RD-13-W1)
  - Scenariusz: Ostatnie przypomnienie
    - Zakładając tę samą instrukcję
    - Gdy licznik osiąga 30
    - Wtedy aplikacja pokazuje przypomnienie 5 z 5 (RD-13-W2)
  - Scenariusz: Po zakończeniu serii
    - Zakładając tę samą instrukcję
    - Gdy licznik osiąga 36
    - Wtedy aplikacja nie pokazuje przypomnienia (RD-13-W3)

### BR-LIC-010: Plan rzędów z instrukcji wzoru
- Przepływ: PR-04 · Reguła: RD-13
- Dowód potrzeby: J-03; luka rynku: nikt nie zamienia instrukcji na plan rzędów (macierz, `odkrywanie.md`); H-06 · zależy od: ZAL-021
- Kryteria akceptacji:
  - Scenariusz: Plan z instrukcji
    - Zakładając, że użytkownik wpisuje: od rzędu 6, co 6 rzędów, 5 razy
    - Gdy zapisuje instrukcję
    - Wtedy widzi listę rzędów 6, 12, 18, 24, 30
  - Scenariusz: Brak rzędu początkowego
    - Zakładając, że użytkownik wpisuje „co 6 rzędów, 5 razy” bez rzędu początkowego
    - Gdy próbuje zapisać
    - Wtedy aplikacja prosi o rząd początkowy i nie zgaduje go (OP-06)

### BR-LIC-011: Cel rzędów i jego osiągnięcie
- Przepływ: PR-02
- Dowód potrzeby: J-11; „if you hit your last row on a counter … can the counter color change” (YarnBuddy, id13666644359); radość z konfetti (編み物カウンター２, id13632559947)
- Kryteria akceptacji:
  - Scenariusz: Osiągnięcie celu
    - Zakładając, że cel części to 40 rzędów, a licznik ma 39
    - Gdy użytkownik dodaje rząd
    - Wtedy aplikacja pokazuje osiągnięcie celu i proponuje przejście do następnej części
  - Scenariusz: Przekroczenie celu
    - Zakładając, że licznik ma 40 przy celu 40
    - Gdy użytkownik dodaje rząd
    - Wtedy licznik pokazuje 41 i oznaczenie „ponad cel”

### BR-LIC-012: Znaczenie liczby na liczniku
- Przepływ: PR-02
- Dowód potrzeby: J-01; prośba o wybór „skończony rząd” albo „rząd w trakcie” (編み物カウンター２, id12699699581)
- Kryteria akceptacji:
  - Scenariusz: Tryb „rząd w trakcie”
    - Zakładając, że użytkownik wybrał tryb „rząd w trakcie” i skończył 12 rzędów
    - Gdy patrzy na licznik
    - Wtedy licznik pokazuje „rząd 13”

### BR-LIC-013: Ekran nie gaśnie podczas liczenia
- Przepływ: PR-05
- Dowód potrzeby: J-06; „it stays on so you don’t have to wake up the screen & put your passcode in” (Crochet and Knit Counter, id1843073711)
- Kryteria akceptacji:
  - Scenariusz: Długa sesja
    - Zakładając, że ekran licznika jest otwarty, a opcja jest włączona
    - Gdy mija czas automatycznej blokady telefonu
    - Wtedy ekran nadal pokazuje licznik
  - Scenariusz: Opcja wyłączona
    - Zakładając, że użytkownik wyłączył opcję
    - Gdy mija czas automatycznej blokady
    - Wtedy telefon blokuje ekran jak zwykle

### BR-LIC-014: Liczenie z ekranu blokady
- Przepływ: PR-05
- Dowód potrzeby: J-06; „hate that I have to unlock my phone to use it” (YarnBuddy, id11419908994); licznik na ekranie blokady mają 2 z 14
- Kryteria akceptacji:
  - Scenariusz: Dodanie rzędu bez odblokowania
    - Zakładając, że telefon jest zablokowany, a licznik projektu ma 22
    - Gdy użytkownik dodaje rząd z ekranu blokady
    - Wtedy ekran blokady pokazuje 23, a w aplikacji licznik też ma 23

### BR-LIC-015: Zegarek bez telefonu w ręku
- Przepływ: PR-05
- Dowód potrzeby: J-06; „it keeps telling me to go back to my phone” (My Row Counter, id12428329746); zegarek gubi liczbę (YarnBuddy 17 z 301)
- Kryteria akceptacji:
  - Scenariusz: Liczenie na zegarku
    - Zakładając, że licznik projektu ma 10, a telefon leży w innym pokoju
    - Gdy użytkownik dodaje 3 rzędy na zegarku
    - Wtedy zegarek pokazuje 13, a po powrocie w zasięg telefon też pokazuje 13 (NFR-ZEG-001)
  - Scenariusz: Przypomnienie na zegarku
    - Zakładając instrukcję z BR-LIC-009
    - Gdy na zegarku licznik osiąga 12
    - Wtedy zegarek pokazuje przypomnienie 2 z 5 i wibruje

### BR-LIC-016: Dodanie rzędu głosem
- Przepływ: PR-05
- Dowód potrzeby: J-06; „just speak to it to increment the counter” (opis My Row Counter, S-17); głos ma 3 z 14
- Kryteria akceptacji:
  - Scenariusz: Polecenie głosowe
    - Zakładając, że licznik bieżącego projektu ma 7
    - Gdy użytkownik wypowiada polecenie dodania rzędu przez Siri
    - Wtedy licznik ma 8, a Siri odpowiada nową wartością

### BR-LIC-017: Wpisanie wartości licznika i wyzerowanie
- Przepływ: PR-01, PR-02, PR-13
- Dowód potrzeby: J-01, J-07; „You should be able to enter the number.” (StitchTally, id14375427685); „I wish the edit screen for a project let me directly edit the number of rows completed” (Easy Knitty, id11473397244); przeniesienie trwających robótek z papieru albo innej aplikacji i poprawka bez dziesiątek stuknięć (rola 03, `docs/scope-contract.md` E1: ER-13) · ER-13
- Kryteria akceptacji:
  - Scenariusz: Przeniesienie trwającej robótki
    - Zakładając, że użytkownik zakłada licznik dla robótki, w której skończył 57 rzędów
    - Gdy wpisuje wartość 57
    - Wtedy licznik pokazuje 57, a następne dodanie rzędu daje 58
  - Scenariusz: Wpisanie w historii z cofnięciem
    - Zakładając, że licznik ma 30
    - Gdy użytkownik wpisuje 35, a potem cofa tę zmianę z historii
    - Wtedy historia pokazuje wpisanie z godziną i wartością przed i po, a licznik po cofnięciu pokazuje 30
  - Scenariusz: Wpisanie nie jest pracą
    - Zakładając, że użytkownik wpisał 57 przy przeniesieniu robótki
    - Gdy otwiera dzień i postęp w module DNI
    - Wtedy wpisane 57 rzędów nie są rzędami zrobionymi tego dnia ani nie zmieniają tempa
  - Scenariusz: Zerowanie z potwierdzeniem
    - Zakładając, że licznik ma 42
    - Gdy użytkownik wybiera wyzerowanie
    - Wtedy aplikacja prosi o potwierdzenie, a dopiero po nim licznik pokazuje 0 i historia ma zmianę z 42 na 0, którą można cofnąć
  - Scenariusz: Błędna wartość
    - Zakładając, że licznik ma 42
    - Gdy użytkownik wpisuje wartość ujemną albo tekst
    - Wtedy aplikacja nie zmienia licznika i pokazuje, że wartość musi być liczbą całkowitą od 0

### BR-LIC-018: Licznik całości zasilany przez sekcje jednego kawałka
- Przepływ: PR-03
- Dowód potrzeby: J-01, J-02; „The individual sections, when you update the row count, should automatically update the global counter.” (My Row Counter, id13712427204); „a row counter feature that allows you to break it down to multiple parts of the pattern, all rolling up to a global counter so you never lose your place” (My Row Counter, id9711911250, strona App Store US, odczyt roli 03 2026-10-22) · ER-16
- Kryteria akceptacji:
  - Scenariusz: Sekcja zasila całość
    - Zakładając, że kawałek „korpus” ma sekcje „ściągacz” z 20 rzędami i „gładki” z 5 rzędami, a licznik całości pokazuje 25
    - Gdy użytkownik dodaje rząd w sekcji „gładki”
    - Wtedy sekcja „gładki” pokazuje 6, a licznik całości 26
  - Scenariusz: Prucie w sekcji
    - Zakładając ten sam stan
    - Gdy użytkownik odejmuje rząd w sekcji „gładki”
    - Wtedy sekcja pokazuje 4, a licznik całości 24
  - Scenariusz: Części osobnych kawałków
    - Zakładając, że projekt „Sweter” ma osobne kawałki przód i rękaw lewy (BR-PRJ-001)
    - Gdy użytkownik dodaje rząd w rękawie
    - Wtedy licznik całości przodu się nie zmienia
