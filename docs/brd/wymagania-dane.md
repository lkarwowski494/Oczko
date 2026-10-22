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
  - Scenariusz: Bez Pro, na limicie
    - Zakładając, że użytkownik nie ma Pro i zużył 5 z 5 darmowych dni limitu (L-07, KP-02; ER-26)
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
  - Scenariusz: Zastąpienie danych na niepustej bazie (ER-22)
    - Zakładając, że w aplikacji są projekty, a użytkownik importuje plik eksportu
    - Gdy wybiera „zastąp”
    - Wtedy aplikacja najpierw zapisuje plik kopii obecnych danych i pokazuje, gdzie on jest, a dopiero potem zastępuje dane zawartością pliku (P-047)
  - Scenariusz: Scalenie bez nadpisania (ER-22)
    - Zakładając, że w aplikacji jest projekt „Skarpeta” z licznikiem 40, a plik ma ten sam projekt z licznikiem 25 oraz projekt „Czapka”
    - Gdy użytkownik wybiera „scal”
    - Wtedy aplikacja ma „Czapkę” oraz obie wersje „Skarpety”: istniejącą z 40 i importowaną z 25, oznaczoną jako import (P-047)
  - Scenariusz: Rezygnacja z importu (ER-22)
    - Zakładając, że w aplikacji są projekty
    - Gdy użytkownik otwiera plik eksportu i rezygnuje przy wyborze „zastąp” albo „scal”
    - Wtedy dane w aplikacji się nie zmieniają

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
- Dowód potrzeby: J-07; „if you archive a project you cannot get it back” (Easy Knitty GB, id8099185238); przypadkowe usunięcie (Easy Knitty CA, id11235965435); usunięcie licznika jednym stuknięciem: „「削除」を間違えて押すと一瞬で消えるのが大変困ります” (編み物カウンター２, id10497670066, ER-22)
- Kryteria akceptacji:
  - Scenariusz: Przywrócenie
    - Zakładając, że użytkownik usunął projekt
    - Gdy po 29 dniach wybiera przywrócenie (P-026)
    - Wtedy projekt wraca ze wszystkimi danymi
  - Scenariusz: Okres przechowywania
    - Zakładając, że minęło 30 dni od usunięcia (P-026)
    - Gdy użytkownik szuka usuniętego projektu
    - Wtedy projektu nie ma, a aplikacja informowała o terminie przy usuwaniu
  - Scenariusz: Usunięty licznik (ER-22)
    - Zakładając, że użytkownik przez pomyłkę usunął licznik oczek z wartością 18 w projekcie „Sweter”
    - Gdy w ciągu 30 dni wybiera przywrócenie (P-047, jak P-026)
    - Wtedy licznik wraca do projektu z wartością 18 i historią
  - Scenariusz: Usunięta część (ER-22)
    - Zakładając, że użytkownik usunął część „rękaw lewy” z licznikami
    - Gdy w ciągu 30 dni wybiera przywrócenie
    - Wtedy część wraca z licznikami, wartościami i historią

### BR-DAN-009: Usunięcie wszystkich danych
- Przepływ: PR-08
- Dowód potrzeby: ZP-03; prywatność (OG-04)
- Kryteria akceptacji:
  - Scenariusz: Usunięcie na żądanie
    - Zakładając, że użytkownik ma dane na urządzeniu i w iCloud
    - Gdy potwierdza usunięcie wszystkich danych
    - Wtedy aplikacja nie ma żadnych projektów, a dane Oczka w iCloud użytkownika są usunięte

### BR-DAN-010: Zgłoś problem z diagnostyką lokalną
- Przepływ: PR-15
- Dowód potrzeby: J-07; „I don’t know where else to report bugs.” (YarnBuddy, id8151431159); „No email link posted just a direct link to a mail app I don’t have.” (Loopsy, id13620980670) · ER-19; prywatność OG-14, NFR-PRY-001, ZP-03
- Kryteria akceptacji:
  - Scenariusz: Podgląd przed wysłaniem
    - Zakładając, że użytkownik wybiera „Zgłoś problem”
    - Gdy aplikacja przygotowuje zgłoszenie
    - Wtedy użytkownik widzi pełną treść diagnostyki (wersja aplikacji i systemu, model urządzenia, stan synchronizacji i zegarka, ostatnie błędy) bez nazw projektów, notatek, zdjęć i wzorów, zanim cokolwiek opuści telefon
  - Scenariusz: Wysyłka wybranym kanałem
    - Zakładając, że na telefonie nie ma skonfigurowanej aplikacji Mail
    - Gdy użytkownik zatwierdza zgłoszenie
    - Wtedy może je wysłać albo zapisać dowolnym kanałem z arkusza udostępniania, a aplikacja nie wysyła niczego sama
  - Scenariusz: Rezygnacja
    - Zakładając, że użytkownik obejrzał treść zgłoszenia
    - Gdy rezygnuje
    - Wtedy nic nie opuszcza telefonu, a aplikacja nie zapisuje, że zgłoszenie było przygotowane

### BR-DAN-011: Widoczny stan synchronizacji i zegarka
- Przepływ: PR-15, PR-08
- Dowód potrzeby: J-07; „On my ipad I have an error telling me that sync hasn’t updated to the cloud, but no help as to why or how to fix it.” (YarnBuddy, id8662495109); zegarek bez synchronizacji z telefonem (YarnBuddy, id8151431159) · ER-19
- Kryteria akceptacji:
  - Scenariusz: Synchronizacja wstrzymana
    - Zakładając, że synchronizacja iCloud jest włączona, a telefon nie ma sieci od 2 godzin
    - Gdy użytkownik otwiera stan danych
    - Wtedy widzi, kiedy była ostatnia udana synchronizacja, że czeka na sieć i że dane na telefonie są zapisane
  - Scenariusz: Zegarek nie odpowiada
    - Zakładając, że zegarek ma zmiany niewysłane do telefonu
    - Gdy użytkownik otwiera stan danych na telefonie
    - Wtedy widzi, że zegarek ma zmiany czekające na połączenie, i co zrobić, żeby je przesłać

### BR-DAN-012: Prośba o ocenę i odnośnik „Oceń”
- Przepływ: PR-15, PR-07
- Dowód potrzeby: pętla opinii wersji 1 w kontrakcie zakresu przyjętym przez właściciela (P-052; `docs/scope-contract.md`, „Główna praca i pętla”), obok „Zgłoś problem” (BR-DAN-010); P-059 (3a); OG-15. Przeciw natręctwu: „it keeps asking me to rate the app after I already rated and it’s like every other click!” (kntd, id14475942102); „As soon as I opened the app it asks me to rate it” (YarnPal AU, id13575008695, 1★) · ER-25
- Dokładna chwila po ukończeniu i ewentualny własny limit poza systemowym: [DO WYJAŚNIENIA] (OP-33); teksty i miejsce „Oceń”: rola 04
- Kryteria akceptacji:
  - Scenariusz: Prośba po ukończeniu projektu
    - Zakładając, że użytkownik oznacza projekt jako ukończony (BR-PRJ-006)
    - Gdy zamyka kartę ukończenia (BR-PRJ-015)
    - Wtedy aplikacja woła systemową prośbę o ocenę, którą system może pokazać albo pominąć (S-39), i nie pokazuje żadnego własnego okna z prośbą o ocenę (OG-15)
  - Scenariusz: Nigdy w trakcie pracy ani przy płatnościach
    - Zakładając, że użytkownik otwiera aplikację, liczy rzędy, cofa zmianę, widzi komunikat na limicie (BR-ZAK-006) albo ekran zakupu
    - Gdy kończy tę czynność
    - Wtedy aplikacja nie woła prośby o ocenę
  - Scenariusz: „Oceń” w Ustawieniach
    - Zakładając, że użytkownik jest w Ustawieniach
    - Gdy stuka „Oceń”
    - Wtedy aplikacja otwiera stronę Oczka w App Store z formularzem recenzji (`action=write-review`), a nie systemową prośbę (S-39)

## Zakup (ZAK)
Model i ceny: P-057 (2026-10-22, model V4; ER-26): cała aplikacja darmowa od pierwszego uruchomienia w limicie dni limitu w miesiącu kalendarzowym; Pro (subskrypcja odnawiana miesięczna albo roczna, bez oferty wprowadzającej, albo zakup dożywotni) znosi limit. Produkty, ceny i wymagania KP-01–KP-15: kontrakt płatności `docs/monetyzacja.md`, „Sesja 3, E3”; obowiązują razem z BR-ZAK. Reguła liczenia dni limitu: `docs/monetyzacja/limit.mjs` i wektory L w `docs/monetyzacja/wektory-limitu.json` (rola 02); BRD odsyła do nich i ich nie kopiuje (P-059).

**Dzień limitu** (pojęcie z kontraktu, P-059): dzień, w którym strażnik limitu zapisał start pracy pierwszym +1 albo ręcznym wpisaniem numeru rzędu (D4 w P-057), z wyjątkiem pracy w toku (D3: +1 bez przerwy ≥ 60 min). To inne pojęcie niż **dzień z robótką** w kalendarzu i statystykach (BR-DNI-001, RD-15, RD-16): cofnięcie nie zwraca dnia limitu (L-06), wpisanie zużywa dzień limitu (D4), a praca od 23:40 do 00:10 to jeden dzień limitu i dwa dni z robótką (L-04, RD-16); w dniach brzegowych liczby mogą się różnić.

### BR-ZAK-001: Przywrócenie zakupu
- Przepływ: PR-09
- Dowód potrzeby: OG-02, OG-03 (subskrypcja na wszystkich urządzeniach, ER-26); „it’s prompting me to pay again after I updated” (Easy Knitty, id12782448883); 14 z 156 w próbce Easy Knitty. Inne urządzenie i rodzina (ER-06, 2026-10-22): „don’t want to pay twice to be able to work on a brioche pattern” (iPhone → iPad, Knitting Chart, id6190888819); „It’s a bit frustrating to find each family member must make the in app purchase individually.” (Knitting Chart, id4968890433). Na nowym urządzeniu transakcje są dostępne od pierwszego uruchomienia [FAKT S-33]; zwrot i odebranie z Family Sharing mają datę w transakcji [FAKT S-34]; Family Sharing działa dla zakupów nieodnawialnych i jest nieodwracalne [FAKT S-35]
- Kryteria akceptacji:
  - Scenariusz: Reinstalacja
    - Zakładając, że użytkownik kupił Pro (subskrypcję albo dożywotni) i przeinstalował aplikację
    - Gdy wybiera przywrócenie zakupów
    - Wtedy ma Pro bez limitu dni i bez ponownej opłaty, a jego dane z kopii albo synchronizacji są na miejscu
  - Scenariusz: Brak sieci
    - Zakładając, że użytkownik ma Pro, a telefon jest bez sieci
    - Gdy zaczyna nowy dzień pierwszym dodanym rzędem
    - Wtedy rząd zostaje dodany bez blokady limitu (KP-06, L-13)
  - Scenariusz: iPad z tym samym kontem Apple
    - Zakładając, że użytkownik kupił Pro na iPhonie (subskrypcję albo dożywotni)
    - Gdy instaluje Oczko na iPadzie z tym samym kontem Apple i otwiera aplikację
    - Wtedy iPad pokazuje Pro bez ponownej opłaty (subskrypcja: OG-03), także zanim użytkownik wybierze przywrócenie zakupów
  - Scenariusz: Zegarek bez telefonu w pobliżu (jeśli zegarek jest w wydaniu)
    - Zakładając, że telefon potwierdził Pro, darmowe dni w miesiącu się skończyły, a na zegarku jest Oczko
    - Gdy użytkownik zaczyna nowy dzień pierwszym dodanym rzędem na zegarku, a telefonu nie ma w zasięgu
    - Wtedy rząd zostaje dodany bez blokady limitu (P-039; sposób odczytu na zegarku: OP-22)
  - Scenariusz: Członek rodziny w Family Sharing
    - Zakładając, że dla produktów Pro włączono Family Sharing (P-038, P-057 D6), a członek rodziny nic nie kupował
    - Gdy członek rodziny otwiera Oczko na swoim urządzeniu
    - Wtedy ma Pro bez limitu dni i bez opłaty
  - Scenariusz: Odebranie z Family Sharing
    - Zakładając, że członek rodziny miał Pro z Family Sharing i ma projekty z historią
    - Gdy zakup przestaje być mu udostępniany i sklep podaje datę odebrania
    - Wtedy członek rodziny wraca do limitu dni (BR-ZAK-007), a jego projekty, historia i eksport zostają dostępne (KP-02 w `docs/monetyzacja.md`)

### BR-ZAK-002: Bez reklam i śledzenia
- Przepływ: PR-09
- Dowód potrzeby: ZP-03; „There are ADs even if you pay for the full version” (Easy Knitty, id10578656875); NFR-PRY-001
- Kryteria akceptacji:
  - Scenariusz: Bez Pro
    - Zakładając, że użytkownik nie ma Pro
    - Gdy korzysta z aplikacji
    - Wtedy nie widzi żadnej reklamy, a aplikacja nie łączy się z siecią reklamową ani analityczną

### BR-ZAK-003: Aktualizacja nie zabiera Pro ani darmowego limitu
- Przepływ: PR-09
- Dowód potrzeby: H-02; usunięcie opłaconej funkcji „Smart Pattern” (Loopsy, id14598505817); funkcje przeniesione za paywall (My Row Counter 18 z 917) · zależy od: ZAL-018, ZAL-025 · rozszerza: KP-01 (darmowy limit raz wydany tylko się luzuje; nic darmowego nie przechodzi za zaporę) · ER-26
- Kryteria akceptacji:
  - Scenariusz: Aktualizacja w okresie Pro
    - Zakładając, że użytkownik ma Pro
    - Gdy instaluje nową wersję aplikacji
    - Wtedy ma Pro bez limitu dni, a każda funkcja działa na jego danych
  - Scenariusz: Aktualizacja bez Pro
    - Zakładając, że poprzednia wersja dawała 5 darmowych dni limitu w miesiącu (P-057 D2) i całą aplikację w tych dniach
    - Gdy użytkownik bez Pro instaluje nową wersję
    - Wtedy limit wynosi co najmniej 5 dni w miesiącu, a każda funkcja dostępna wcześniej bez Pro jest dostępna bez Pro (KP-01)

### BR-ZAK-004: Polityka prywatności w aplikacji
- Przepływ: PR-09
- Dowód potrzeby: OG-04
- Kryteria akceptacji:
  - Scenariusz: Dostęp do polityki
    - Zakładając, że aplikacja jest otwarta
    - Gdy użytkownik otwiera ustawienia
    - Wtedy widzi odnośnik do polityki prywatności, który ją otwiera

### BR-ZAK-005: Limit dni i strażnik startu dnia
- Przepływ: PR-02, PR-09
- Dowód potrzeby: decyzja właściciela P-057 (D2–D5: limit 5 dni limitu w miesiącu kalendarzowym, przerwa 60 min, wpisanie jak +1, liczą się tylko dni bez Pro) i P-053 („rozpoczęta jednostka pracy zawsze do końca”); kontrakt płatności KP-12, KP-15; reguła i wektory L-01–L-15: `docs/monetyzacja/limit.mjs`, `docs/monetyzacja/wektory-limitu.json` (rola 02, P-059) · ER-26
- Strażnik wołany tylko przy pierwszym +1 nowego dnia limitu i przy ręcznym wpisaniu numeru rzędu (KP-12, D4); zerowanie, −1, liczniki inne niż rzędów, zegarek i ekran blokady: [DO WYJAŚNIENIA] (OP-32)
- Kryteria akceptacji:
  - Scenariusz: Pierwszy dzień miesiąca (L-01)
    - Zakładając, że jest 1 listopada, a w listopadzie nie ma dni limitu i użytkownik nie ma Pro
    - Gdy dodaje pierwszy rząd
    - Wtedy rząd zostaje dodany, a w listopadzie zostały 4 z 5 darmowych dni
  - Scenariusz: Rozpoczęty dzień do końca (L-02)
    - Zakładając, że użytkownik zużył 5 z 5 dni, a dzisiejszy dzień jest jednym z nich
    - Gdy dodaje rząd w innym projekcie
    - Wtedy rząd zostaje dodany, a liczba dni limitu się nie zmienia
  - Scenariusz: Praca po północy (L-04, L-04b)
    - Zakładając, że użytkownik zużył 5 z 5 dni i dodał rząd o 23:50
    - Gdy dodaje kolejny rząd o 00:00 po 10 minutach
    - Wtedy rząd zostaje dodany jako praca w toku, bez nowego dnia limitu
    - Ale gdy przerwa przed rzędem po północy trwa 61 minut, rząd nie zostaje dodany, a aplikacja pokazuje komunikat na limicie (BR-ZAK-006)
  - Scenariusz: Nowy dzień ponad limit (L-03)
    - Zakładając, że użytkownik bez Pro zużył 5 z 5 dni w listopadzie, a dziś jest 8 listopada
    - Gdy dodaje pierwszy rząd
    - Wtedy rząd nie zostaje dodany, licznik pokazuje poprzednią wartość, a aplikacja pokazuje komunikat na limicie (BR-ZAK-006)
  - Scenariusz: Ręczne wpisanie w nowym dniu ponad limit (L-08)
    - Zakładając, że użytkownik bez Pro zużył 5 z 5 dni, a dziś nie dodał jeszcze rzędu
    - Gdy wpisuje numer rzędu ręcznie (BR-LIC-017)
    - Wtedy wartość nie zostaje zapisana, a aplikacja pokazuje komunikat na limicie
  - Scenariusz: Cofnięcie nie zwraca dnia (L-06)
    - Zakładając, że użytkownik dziś dodał rząd i zużył nim dzień limitu
    - Gdy cofa ten rząd z historii
    - Wtedy liczba dni limitu się nie zmienia
  - Scenariusz: Dane bez limitu (L-07)
    - Zakładając, że użytkownik bez Pro zużył 5 z 5 dni
    - Gdy dopisuje dzień wstecz, poprawia historię albo notatkę, eksportuje dane albo otwiera kalkulator
    - Wtedy zmiana zostaje zapisana, a liczba dni limitu się nie zmienia
  - Scenariusz: Nowy miesiąc (L-05)
    - Zakładając, że w październiku użytkownik zużył 5 z 5 dni
    - Gdy 1 listopada dodaje pierwszy rząd
    - Wtedy rząd zostaje dodany, a w listopadzie zostały 4 z 5 darmowych dni
  - Scenariusz: Pro (L-10)
    - Zakładając, że użytkownik ma Pro, a darmowe dni w miesiącu się skończyły
    - Gdy zaczyna nowy dzień pierwszym rzędem
    - Wtedy rząd zostaje dodany, a dzień trafia do kalendarza (BR-DNI-001) bez blokady
  - Scenariusz: Ten sam dzień na dwóch urządzeniach (L-11)
    - Zakładając, że użytkownik dodał dziś rząd na zegarku, a dane zsynchronizowały się z iPhonem
    - Gdy dodaje rząd na iPhonie
    - Wtedy to wciąż jeden dzień limitu
  - Scenariusz: Zegar z przyszłości (L-15)
    - Zakładając, że ostatni zapisany rząd ma czas późniejszy niż bieżący czas telefonu, a użytkownik bez Pro zużył 5 z 5 dni
    - Gdy dodaje pierwszy rząd nowego dnia
    - Wtedy aplikacja nie traktuje tego jako pracy w toku i pokazuje komunikat na limicie

### BR-ZAK-006: Komunikat na limicie i miejsca ekranu zakupu
- Przepływ: PR-09, PR-02
- Dowód potrzeby: P-055 i P-057 (ekran zakupu tylko przy starcie ponad limit i w Ustawieniach, bez arkusza zakupu na starcie); KP-03, KP-13, KP-14 i ujawnienia (5), (6) w `docs/monetyzacja.md`, „Sesja 3, E3”; NFR-PIE-001 · ER-26
- Teksty, miejsce licznika dni i wygląd ustala rola 04 (KP-13, P-046)
- Kryteria akceptacji:
  - Scenariusz: Komunikat przy starcie dnia ponad limit
    - Zakładając, że strażnik nie pozwolił zacząć nowego dnia (BR-ZAK-005)
    - Gdy aplikacja pokazuje komunikat
    - Wtedy komunikat mówi, że darmowe dni w tym miesiącu się skończyły i że wracają 1. dnia następnego miesiąca, pokazuje Pro z ceną ze sklepu i mówi, że projekty, historia i eksport działają dalej
    - Oraz po zamknięciu komunikatu użytkownik widzi licznik z niezmienioną wartością
  - Scenariusz: Bez oferty w trakcie pracy
    - Zakładając, że użytkownik ma darmowe dni albo pracuje w rozpoczętym dniu
    - Gdy liczy rzędy, otwiera projekty, wzór i kalendarz
    - Wtedy nie widzi ekranu zakupu ani oferty Pro; ekran zakupu otwiera tylko z Ustawień
  - Scenariusz: Licznik dni
    - Zakładając, że użytkownik bez Pro zużył 2 z 5 dni w miesiącu
    - Gdy patrzy na licznik dni w miejscu ustalonym przez rolę 04
    - Wtedy widzi, że zostały 3 z 5 darmowych dni w tym miesiącu
  - Scenariusz: Aktywna subskrypcja
    - Zakładając, że użytkownik ma aktywną subskrypcję Pro
    - Gdy otwiera Ustawienia
    - Wtedy widzi stan Pro i „Zarządzaj subskrypcją”, które otwiera systemowe zarządzanie subskrypcją (KP-14), a ekran zakupu nie oferuje tej samej subskrypcji (KP-03)

### BR-ZAK-007: Utrata Pro
- Przepływ: PR-09
- Dowód potrzeby: KP-02 (utrata Pro: wraca limit dni; dane, historia, eksport i kopia zawsze dostępne); P-057 D5 (liczą się tylko dni bez Pro); ZAL-018 · ER-26
- Kryteria akceptacji:
  - Scenariusz: Wygaśnięcie w trakcie miesiąca (L-09)
    - Zakładając, że Pro wygasło 20 listopada, a w listopadzie użytkownik miał 10 dni limitu z Pro i 2 bez Pro
    - Gdy 21 listopada dodaje pierwszy rząd
    - Wtedy rząd zostaje dodany, a w listopadzie zostały 2 z 5 darmowych dni
  - Scenariusz: Dane po utracie Pro
    - Zakładając, że subskrypcja wygasła albo sklep zwrócił zakup, a użytkownik ma projekty z historią
    - Gdy otwiera projekty, historię i eksport
    - Wtedy wszystkie są dostępne i pełne, a synchronizacja iCloud działa dalej (P-054)
