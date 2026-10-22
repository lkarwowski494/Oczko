# Wymagania: dni i postęp (DNI)
Stan: rola 01, tryb fix (2026-10-22) · Moduł z ER-11 i ER-12 (P-043, P-044, P-046, P-047); prefiks `KAL` należy do obliczeń. Przepływy w `wymagania.md`, reguły w `reguly.md`.

Miejsce tych funkcji na ekranach ustala rola 04: na ekranie licznika nic z tego modułu, dopóki użytkownik sam czegoś nie ustawi (P-046); kalendarz, dzień i podsumowanie okresu to jeden widok w historii albo projekcie, nie osobna zakładka (P-046).

### BR-DNI-001: Kalendarz dni z robótką
- Przepływ: PR-16
- Dowód potrzeby: J-11; dowód słaby (pochwały istniejącej funkcji, 0 próśb w recenzjach angielskich, P-043): „アクティビティが自動で記録されるのが、後から見返す時に進捗がわかりやすくてありがたいです” (編み物カウンター２, id12699699581); „毎日の編み物の励みになっています。” (編み物カウンター２, id9461069621) · ER-11 (K-1)
- Kryteria akceptacji:
  - Scenariusz: Dzień z robótką
    - Zakładając, że użytkownik 21 października dodał 12 rzędów w projekcie „Skarpeta”, a 20 października nie dziergał
    - Gdy otwiera kalendarz października
    - Wtedy 21 października ma znacznik dnia z robótką, a 20 października go nie ma
  - Scenariusz: Cofnięte i wpisane zmiany
    - Zakładając, że 19 października użytkownik tylko wpisał wartość licznika przy przeniesieniu robótki i cofnął przypadkowe dodania z historii
    - Gdy otwiera kalendarz
    - Wtedy 19 października nie ma znacznika dnia z robótką (RD-15: wpisania i cofnięte zmiany nie są pracą)
  - Scenariusz: Bez serii i ponagleń
    - Zakładając, że użytkownik nie dziergał od 10 dni
    - Gdy otwiera aplikację albo kalendarz
    - Wtedy aplikacja nie pokazuje licznika serii dni ani nie wysyła przypomnienia o niedzierganiu (P-043)

### BR-DNI-002: Dzień: projekty, rzędy i czas
- Przepływ: PR-16
- Dowód potrzeby: J-11; „It would be good to be able to go back to week or day or project. Total time spent per day would be cool” (Easy Knitty CA, id10575864934) · ER-11 (K-2)
- Kryteria akceptacji:
  - Scenariusz: Szczegóły dnia
    - Zakładając, że 21 października użytkownik dodał 12 rzędów w „Skarpecie” i 5 w „Swetrze”, a stoper sesji „Skarpety” liczył 50 minut
    - Gdy wybiera 21 października w kalendarzu
    - Wtedy widzi „Skarpeta: 12 rzędów, 50 min” i „Sweter: 5 rzędów” i może przejść do każdego projektu
  - Scenariusz: Dzień w strefie urządzenia (ER-24)
    - Zakładając, że użytkownik w Nowym Jorku dodał rząd w sobotę 3 czerwca 2023 o 21:30 czasu lokalnego, czyli 4 czerwca o 01:30 UTC (RD-16-W1)
    - Gdy otwiera ten dzień
    - Wtedy rząd jest w sobocie 3 czerwca, nie w niedzieli 4 czerwca

### BR-DNI-003: Podsumowanie tygodnia i miesiąca
- Przepływ: PR-16
- Dowód potrzeby: J-11; „As a data nerd I love all of the counts it gives you.” (My Row Counter, id13787781171); „you also get daily, weekly, monthly, and yearly stats” (My Row Counter, id12140475342); id10575864934 jw. · ER-11 (K-3)
- Kryteria akceptacji:
  - Scenariusz: Tydzień z porównaniem
    - Zakładając, że w tym tygodniu użytkownik zrobił 80 rzędów i 4 godziny ze stopera, a w poprzednim 60 rzędów
    - Gdy otwiera podsumowanie tygodnia
    - Wtedy widzi 80 rzędów, 4 godziny, liczbę ukończonych projektów oraz 60 rzędów w poprzednim tygodniu, a tydzień zaczyna się w dniu ustawionym w regionie telefonu
  - Scenariusz: Czas bez stopera
    - Zakładając, że w miesiącu nie było żadnej sesji stopera
    - Gdy użytkownik otwiera podsumowanie miesiąca
    - Wtedy widzi rzędy i ukończone projekty, a w miejscu czasu informację, że czas pochodzi ze stopera sesji, bez wartości 0 godzin

### BR-DNI-004: Postęp projektu w procentach
- Przepływ: PR-16, PR-14 · Reguła: RD-14
- Dowód potrzeby: J-11; „進捗が全体の何%なのか表示されたり” (編み物カウンター２, id13632559947); „進捗率が分かるのでモチベーションも上がり” (編み物カウンター２, id12304022403); prośba o postęp całego projektu, nie licznika (編み物カウンター２, id12060415068) · ER-11 (K-4)
- Kryteria akceptacji:
  - Scenariusz: Postęp z części
    - Zakładając, że części mają cele 100, 100, 60 i 60 rzędów, a zrobiono 100, 40, 0 i 0
    - Gdy użytkownik otwiera projekt
    - Wtedy widzi postęp 43%, oznaczony jako przybliżenie z rzędów (RD-14-W1)
  - Scenariusz: Część ponad cel
    - Zakładając, że pierwsza część ma 120 rzędów przy celu 100, a pozostałe 0
    - Gdy użytkownik otwiera projekt
    - Wtedy widzi 31%, nie więcej (RD-14-W4)
  - Scenariusz: Brak celów
    - Zakładając, że żadna część nie ma celu
    - Gdy użytkownik otwiera projekt
    - Wtedy nie widzi procentu, tylko informację, że postęp wymaga celu rzędów części (RD-14-W6)

### BR-DNI-005: Termin projektu i cel dzienny
- Przepływ: PR-16 · Reguła: RD-15 · zależy od: ZAL-027
- Dowód potrzeby: J-11; termin: „Add a due date reminder for your project.” (opis YarnBuddy, S-17); „track pieces I need to complete, set due dates, and stay organized” (Loopsy, id13818450106); cel dzienny bez bezpośredniego dowodu, wyjątek właściciela P-043 · ER-11 (K-5)
- Kryteria akceptacji:
  - Scenariusz: Cel dnia
    - Zakładając, że cel projektu to 320 rzędów, do wczoraj zrobiono 140, dziś jest 22 października, a termin 4 listopada
    - Gdy użytkownik otwiera projekt
    - Wtedy widzi cel na dziś 13 rzędów (RD-15-W1)
  - Scenariusz: Cel stały w ciągu dnia
    - Zakładając ten sam projekt i 5 rzędów zrobionych dziś
    - Gdy użytkownik otwiera projekt ponownie
    - Wtedy cel na dziś nadal wynosi 13 rzędów, a wykonanie pokazuje 5 z 13
  - Scenariusz: Prucie dziś
    - Zakładając 5 rzędów zrobionych dziś
    - Gdy użytkownik odejmuje 2 rzędy
    - Wtedy wykonanie pokazuje 3 z 13
  - Scenariusz: Po terminie
    - Zakładając, że termin minął, a zostało 20 rzędów
    - Gdy użytkownik otwiera projekt
    - Wtedy nie widzi celu dziennego, tylko „termin minął, zostało 20 rzędów” (RD-15-W4)
  - Scenariusz: Bez terminu nic na ekranie licznika
    - Zakładając, że projekt nie ma terminu
    - Gdy użytkownik liczy rzędy
    - Wtedy ekran licznika nie pokazuje celu dziennego ani elementów kalendarza (P-046)
