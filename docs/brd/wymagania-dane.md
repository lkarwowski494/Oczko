# Wymagania: dane (DAN) i zakup (ZAK)
Stan: STOP E3 · Aktualizacja: 2026-10-21 · Przepływy w `wymagania.md`. Zasady: P-021 (baza na urządzeniu, opcjonalnie iCloud), ZP-03, ZP-09.

## Dane (DAN)
### BR-DAN-001: Baza na urządzeniu jest źródłem prawdy
- Przepływ: PR-02, PR-08
- Dowód potrzeby: J-07; CloudKit wymaga sieci (OG-09); „Went camping with my project just to find out that it doesn’t work without WiFi, so I didn’t know what row I was on” (Crochet row & stitch counter, id12528635347, soczewka konkurencji)
- Kryteria akceptacji:
  - Scenariusz: Brak sieci
    - Zakładając, że telefon jest w trybie samolotowym
    - Gdy użytkownik otwiera projekt i dodaje 5 rzędów
    - Wtedy licznik pokazuje nowe wartości, a po wymuszonym zamknięciu aplikacji wartości są te same (NFR-DAN-002)

### BR-DAN-002: Opcjonalna synchronizacja przez iCloud
- Przepływ: PR-08
- Dowód potrzeby: J-07; „would love for all my devices to sync” (My Row Counter CA, id3172873446); P-021
- Kryteria akceptacji:
  - Scenariusz: Drugie urządzenie
    - Zakładając, że synchronizacja jest włączona na iPhonie i iPadzie
    - Gdy użytkownik dodaje rząd na iPhonie przy dostępnej sieci
    - Wtedy iPad pokazuje tę samą wartość licznika
  - Scenariusz: Konflikt
    - Zakładając, że bez sieci iPhone ustawił licznik na 20, a iPad na 18
    - Gdy oba urządzenia się zsynchronizują
    - Wtedy aplikacja pokazuje obie wartości z urządzeniem i godziną zmiany i nie wybiera żadnej po cichu (NFR-DAN-003)
  - Scenariusz: Synchronizacja wyłączona
    - Zakładając, że użytkownik nie włączył synchronizacji
    - Gdy korzysta z aplikacji
    - Wtedy aplikacja nie wysyła danych poza urządzenie

### BR-DAN-003: Dane przetrwają aktualizację
- Przepływ: PR-08
- Dowód potrzeby: J-07; „ALL of the started projects I had, close to 20 are just GONE” (knitCompanion, id9354492354); utrata po aktualizacji (Strikketeller, id14009367992)
- Kryteria akceptacji:
  - Scenariusz: Nowa wersja
    - Zakładając, że użytkownik ma 12 projektów, historię liczników i zapas włóczki
    - Gdy instaluje nową wersję aplikacji ze zmianą schematu bazy
    - Wtedy ma te same 12 projektów, historię i zapas (NFR-DAN-001)
  - Scenariusz: Nieudana migracja
    - Zakładając, że migracja bazy nie powiodła się
    - Gdy aplikacja się uruchamia
    - Wtedy dane sprzed migracji są nienaruszone, a aplikacja pokazuje komunikat o błędzie zamiast pustej listy

### BR-DAN-004: Dane na nowym telefonie
- Przepływ: PR-08
- Dowód potrzeby: J-07; „I got a new iPhone … This app wants $10 just to see my patterns on my new phone” (My Row Counter, id10843107781); kopia iCloud obejmuje dane aplikacji (OG-10)
- Kryteria akceptacji:
  - Scenariusz: Odtworzenie z kopii urządzenia
    - Zakładając, że stary telefon miał kopię iCloud z danymi Oczka
    - Gdy użytkownik odtwarza nowy telefon z tej kopii i otwiera Oczko
    - Wtedy widzi wszystkie projekty z wartościami liczników bez dodatkowej opłaty

### BR-DAN-005: Eksport wszystkich danych
- Przepływ: PR-08
- Dowód potrzeby: J-07; „unable to export anything, which was a huge part of why I subscribed” (YarnBuddy, id10700489878); eksport ma 3 z 14 · zależy od: ZAL-018
- Kryteria akceptacji:
  - Scenariusz: Pełny eksport
    - Zakładając, że użytkownik ma projekty, wzory, zdjęcia i zapas
    - Gdy wybiera eksport
    - Wtedy dostaje plik w aplikacji Pliki, który zawiera wszystkie projekty, liczniki z historią, notatki, zapas, wzory i zdjęcia
  - Scenariusz: Bez zakupu
    - Zakładając, że użytkownik nie kupił wersji płatnej
    - Gdy wybiera eksport
    - Wtedy eksport działa tak samo

### BR-DAN-006: Import własnego eksportu
- Przepływ: PR-08
- Dowód potrzeby: J-07; przeniesienie bez synchronizacji (P-020 jako wariant, P-021)
- Kryteria akceptacji:
  - Scenariusz: Pełny obieg
    - Zakładając, że użytkownik ma plik eksportu z BR-DAN-005
    - Gdy importuje go na czystej instalacji
    - Wtedy ma te same projekty, wartości liczników, historię, notatki, zapas, wzory i zdjęcia
  - Scenariusz: Plik z innej aplikacji
    - Zakładając, że plik nie jest eksportem Oczka
    - Gdy użytkownik próbuje go zaimportować
    - Wtedy aplikacja pokazuje, że nie rozpoznaje pliku, i nie zmienia istniejących danych

### BR-DAN-007: Import od konkurencji
- Przepływ: PR-13
- Dowód potrzeby: H-08; arkusz zapasu z Ravelry (OG-08); odchodzenie płacących z YarnBuddy (id13993192426) · zależy od: ZAL-023
- Kryteria akceptacji:
  - Scenariusz: Zapas z Ravelry
    - Zakładając, że użytkownik pobrał arkusz zapasu z Ravelry
    - Gdy importuje go do Oczka
    - Wtedy każda włóczka z arkusza jest w zapasie, a aplikacja pokazuje, ile pozycji zaimportowała i których kolumn nie rozpoznała

### BR-DAN-008: Usunięcie z możliwością przywrócenia
- Przepływ: PR-07
- Dowód potrzeby: J-07; „if you archive a project you cannot get it back” (Easy Knitty GB, id8099185238); przypadkowe usunięcie (Easy Knitty CA, id11235965435)
- Kryteria akceptacji:
  - Scenariusz: Przywrócenie
    - Zakładając, że użytkownik usunął projekt
    - Gdy w okresie przechowywania wybiera przywrócenie
    - Wtedy projekt wraca ze wszystkimi danymi
  - Scenariusz: Okres przechowywania
    - Zakładając, że minął okres przechowywania [DO WYJAŚNIENIA] (OP-18)
    - Gdy użytkownik szuka usuniętego projektu
    - Wtedy projektu nie ma, a aplikacja informowała o terminie przy usuwaniu

### BR-DAN-009: Usunięcie wszystkich danych
- Przepływ: PR-08
- Dowód potrzeby: ZP-03; prywatność (OG-04)
- Kryteria akceptacji:
  - Scenariusz: Usunięcie na żądanie
    - Zakładając, że użytkownik ma dane na urządzeniu i w iCloud
    - Gdy potwierdza usunięcie wszystkich danych
    - Wtedy aplikacja nie ma żadnych projektów, a dane Oczka w iCloud użytkownika są usunięte

## Zakup (ZAK)
Model i ceny: P-019 i rola 02 (sesja 2). Tu tylko wymagania z ograniczeń sklepu i skarg.

### BR-ZAK-001: Przywrócenie zakupu
- Przepływ: PR-09
- Dowód potrzeby: OG-02; „it’s prompting me to pay again after I updated” (Easy Knitty, id12782448883); 14 z 156 w próbce Easy Knitty
- Kryteria akceptacji:
  - Scenariusz: Reinstalacja
    - Zakładając, że użytkownik kupił wersję płatną i przeinstalował aplikację
    - Gdy wybiera przywrócenie zakupów
    - Wtedy ma wersję płatną bez ponownej opłaty, a jego dane z kopii albo synchronizacji są na miejscu
  - Scenariusz: Brak sieci
    - Zakładając, że użytkownik ma wersję płatną, a telefon jest bez sieci
    - Gdy otwiera aplikację
    - Wtedy funkcje płatne działają

### BR-ZAK-002: Bez reklam i śledzenia
- Przepływ: PR-09
- Dowód potrzeby: ZP-03; „There are ADs even if you pay for the full version” (Easy Knitty, id10578656875); NFR-PRY-001
- Kryteria akceptacji:
  - Scenariusz: Wersja darmowa
    - Zakładając, że użytkownik nie kupił wersji płatnej
    - Gdy korzysta z aplikacji
    - Wtedy nie widzi żadnej reklamy, a aplikacja nie łączy się z siecią reklamową ani analityczną

### BR-ZAK-003: Opłacona funkcja nie znika
- Przepływ: PR-09
- Dowód potrzeby: H-02; usunięcie opłaconej funkcji „Smart Pattern” (Loopsy, id14598505817); funkcje przeniesione za paywall (My Row Counter 18 z 917) · zależy od: ZAL-018
- Kryteria akceptacji:
  - Scenariusz: Aktualizacja w okresie zakupu
    - Zakładając, że użytkownik kupił dostęp do funkcji
    - Gdy instaluje nową wersję aplikacji
    - Wtedy funkcja jest dostępna i działa na jego danych

### BR-ZAK-004: Polityka prywatności w aplikacji
- Przepływ: PR-09
- Dowód potrzeby: OG-04
- Kryteria akceptacji:
  - Scenariusz: Dostęp do polityki
    - Zakładając, że aplikacja jest otwarta
    - Gdy użytkownik otwiera ustawienia
    - Wtedy widzi odnośnik do polityki prywatności, który ją otwiera
