# Wymagania: projekt (PRJ) i wzór (WZR)
Stan: STOP E3 · Aktualizacja: 2026-10-21 · Przepływy w `wymagania.md`.

## Projekt (PRJ)
### BR-PRJ-001: Projekt z częściami
- Przepływ: PR-07
- Dowód potrzeby: J-02, J-05; „Create, Edit or Delete Parts of projects (in other words: sub-projects)” (opis Easy Knitty, S-17); części ma 10 z 14
- Kryteria akceptacji:
  - Scenariusz: Części swetra
    - Zakładając, że użytkownik zakłada projekt „Sweter” z częściami przód, tył, rękaw lewy, rękaw prawy
    - Gdy w części „rękaw lewy” dodaje 30 rzędów
    - Wtedy rękaw lewy ma 30 rzędów, a pozostałe części mają 0

### BR-PRJ-002: Notatka widoczna przy liczniku
- Przepływ: PR-02, PR-07
- Dowód potrzeby: J-05; „I'd like to be able to write in a note that my Next Sti[tch]” (Crochet and Knit Counter, id3713410970); limit notatki za mały (soczewka początkująca)
- Kryteria akceptacji:
  - Scenariusz: Notatka przy przerwie
    - Zakładając, że użytkownik zapisał notatkę „następne: 3 oczka prawe, potem warkocz”
    - Gdy wraca do ekranu licznika tego projektu
    - Wtedy widzi notatkę obok licznika bez otwierania innego ekranu
  - Scenariusz: Długa notatka (ER-24)
    - Zakładając, że użytkownik wkleja do notatki całą stronę wzoru, ok. 5000 znaków (przykład testu, nie limit: P-047)
    - Gdy zapisuje notatkę i otwiera ją ponownie
    - Wtedy notatka ma cały wklejony tekst, bez obcięcia i bez komunikatu o limicie

### BR-PRJ-003: Zdjęcia projektu i etykiety
- Przepływ: PR-07
- Dowód potrzeby: J-05; „It would be really nice to have shots of the yarn labels as reference” (knitCompanion CA, id3998353222)
- Kryteria akceptacji:
  - Scenariusz: Zdjęcie etykiety
    - Zakładając, że projekt jest otwarty
    - Gdy użytkownik robi zdjęcie etykiety włóczki aparatem
    - Wtedy zdjęcie jest w projekcie i widać je bez sieci

### BR-PRJ-004: Dane techniczne projektu
- Przepływ: PR-07 · Reguła: RD-11
- Dowód potrzeby: J-05; „Enter project details such as start date, yarn, gauge, hook/needle sizes” (opis YarnBuddy, S-17); szydełko 5,2 mm niedostępne do wyboru (Crochet row & stitch counter, id12656086541)
- Kryteria akceptacji:
  - Scenariusz: Drut w milimetrach
    - Zakładając, że użytkownik wpisuje drut 4 mm
    - Gdy zapisuje projekt
    - Wtedy projekt pokazuje „4 mm (US 6)” (RD-11-W1)
  - Scenariusz: Rozmiar bez odpowiednika
    - Zakładając, że użytkownik wpisuje drut 3 mm
    - Gdy zapisuje projekt
    - Wtedy projekt pokazuje „3 mm” bez numeru US (RD-11-W3)

### BR-PRJ-005: Powrót do projektu po przerwie
- Przepływ: PR-07
- Dowód potrzeby: J-05; „come back to a languishing WIP years later and just pick up where I left off” (My Row Counter GB, id14614568294)
- Kryteria akceptacji:
  - Scenariusz: Powrót po miesiącach
    - Zakładając, że projekt ostatnio zmieniono 5 miesięcy temu
    - Gdy użytkownik otwiera projekt
    - Wtedy widzi wartości wszystkich liczników, ostatnią notatkę, miejsce we wzorze i datę ostatniej zmiany

### BR-PRJ-006: Stan projektu
- Przepływ: PR-07
- Dowód potrzeby: J-05; „label projects as finished, hibernating and work in progress” (kntd GB, id13584919414); „I wish I could mark a project “complete”” (knitCompanion, id13529266059)
- Kryteria akceptacji:
  - Scenariusz: Ukończenie
    - Zakładając, że projekt jest w toku
    - Gdy użytkownik oznacza go jako ukończony
    - Wtedy projekt znika z listy w toku, jest na liście ukończonych z datą i czasem pracy

### BR-PRJ-007: Zrób ponownie
- Przepływ: PR-07
- Dowód potrzeby: J-05; „I find it very annoying how difficult it is to remake projects” (My Row Counter, id13648606552); kopia projektu (編み物カウンター２, id13818579399)
- Kryteria akceptacji:
  - Scenariusz: Druga skarpeta
    - Zakładając, że projekt „Skarpeta” ma części, liczniki z wartościami i instrukcje przypomnień
    - Gdy użytkownik wybiera „zrób ponownie”
    - Wtedy powstaje nowy projekt z tymi samymi częściami i przypomnieniami, liczniki mają 0, a oryginał się nie zmienia

### BR-PRJ-008: Stoper sesji działa przy zablokowanym ekranie
- Przepływ: PR-14
- Dowód potrzeby: J-11; „time tracking is only accurate if you leave your phone unlocked” (Easy Knitty, id11473397244); stoper liczący podwójnie (Easy Knitty, id13261592468)
- Kryteria akceptacji:
  - Scenariusz: Blokada telefonu
    - Zakładając, że stoper sesji działa od 20:00
    - Gdy użytkownik blokuje telefon i zatrzymuje stoper o 20:45
    - Wtedy sesja trwa 45 minut, a czas projektu rośnie o 45 minut
  - Scenariusz: Zapomniany stoper
    - Zakładając, że stoper działa, a telefon jest zablokowany
    - Gdy użytkownik patrzy na ekran blokady
    - Wtedy widzi działający stoper i może go zatrzymać bez odblokowania

### BR-PRJ-009: Postęp i szacowany czas
- Przepływ: PR-14
- Dowód potrzeby: J-11; „Based on your speed, CozyKnit Counter can estimate time remaining to reach your goal” (opis CozyKnit, S-17); dowód słaby (H-06)
- Kryteria akceptacji:
  - Scenariusz: Szacunek z tempa
    - Zakładając, że cel części to 100 rzędów, zrobiono 40 w 4 godziny pracy
    - Gdy użytkownik otwiera postęp
    - Wtedy widzi 40% i szacunek 6 godzin do końca, oznaczony jako szacunek z dotychczasowego tempa

### BR-PRJ-010: Przypomnienie o przerwie
- Przepływ: PR-14
- Dowód potrzeby: J-11; „I can tell this will help me take breaks” (My Row Counter, id13210040139); RYZ-08 · zależy od: OP-15
- Kryteria akceptacji:
  - Scenariusz: Przerwa po ustawionym czasie
    - Zakładając, że użytkownik włączył przypomnienie o przerwie po wybranym czasie
    - Gdy stoper sesji osiąga ten czas
    - Wtedy aplikacja pokazuje przypomnienie bez porad zdrowotnych

## Wzór (WZR)
Każda funkcja wzoru przechodzi porównanie z zastrzeżeniami patentów przed projektem i wydaniem (P-024, OG-07).

### BR-WZR-001: Import wzoru z pliku
- Przepływ: PR-06, PR-13
- Dowód potrzeby: J-04; wzór PDF ma 10 z 14 (ER-09); import z Plików bez API (OG-08)
- Kryteria akceptacji:
  - Scenariusz: PDF z aplikacji Pliki
    - Zakładając, że w Plikach jest wzór PDF
    - Gdy użytkownik udostępnia go do Oczka
    - Wtedy wzór jest w projekcie i otwiera się bez sieci
  - Scenariusz: Plik uszkodzony
    - Zakładając, że plik PDF jest uszkodzony
    - Gdy użytkownik próbuje go zaimportować
    - Wtedy aplikacja pokazuje komunikat, że nie może otworzyć pliku, i nie tworzy pustego wzoru

### BR-WZR-002: Wzór ze zdjęcia książki
- Przepływ: PR-06
- Dowód potrzeby: J-04; „add patterns from photos which is just what I needed for patterns I'm knitting from books” (My Row Counter GB, id6082188639)
- Kryteria akceptacji:
  - Scenariusz: Zdjęcie strony
    - Zakładając, że użytkownik ma wzór w książce
    - Gdy robi zdjęcie strony w projekcie
    - Wtedy zdjęcie jest wzorem projektu, który można powiększać

### BR-WZR-003: Znacznik bieżącego rzędu we wzorze
- Przepływ: PR-06
- Dowód potrzeby: J-04; obejście z linijką w aplikacji Zdjęcia (編み物カウンター２, id14499518985); „For years I have struggled to remember where I am in a pattern” (My Row Counter GB, id8441435364) · zależy od: P-024
- Kryteria akceptacji:
  - Scenariusz: Znacznik idzie z licznikiem
    - Zakładając, że znacznik stoi na rzędzie 12 schematu, a licznik ma 12
    - Gdy użytkownik dodaje rząd
    - Wtedy znacznik przesuwa się na rząd 13
  - Scenariusz: Powrót do wzoru
    - Zakładając, że użytkownik zamknął aplikację ze znacznikiem na rzędzie 13
    - Gdy otwiera wzór po tygodniu
    - Wtedy znacznik stoi na rzędzie 13

### BR-WZR-004: Pisanie po wzorze
- Przepływ: PR-06
- Dowód potrzeby: J-04; „near impossible to do any kind of writing on PDFs with my Apple Pencil” (Knitting Chart, id13583431468); kropki od dłoni (Knitting Chart GB, id10826661505)
- Kryteria akceptacji:
  - Scenariusz: Dłoń na ekranie
    - Zakładając, że użytkownik pisze Apple Pencil po wzorze na iPadzie
    - Gdy dłoń opiera się o ekran
    - Wtedy na wzorze pojawia się tylko linia z rysika

### BR-WZR-005: Wzór i licznik razem
- Przepływ: PR-06
- Dowód potrzeby: J-04; „I use my iPad to see the pattern and I use my iPhone for the counter” (Loopsy, id14597301969); brak trybu poziomego (soczewka zaawansowana)
- Kryteria akceptacji:
  - Scenariusz: Telefon poziomo na stojaku
    - Zakładając, że wzór jest otwarty, a telefon stoi poziomo
    - Gdy użytkownik dodaje rząd
    - Wtedy widzi jednocześnie wzór i nową wartość licznika

### BR-WZR-006: Siatka co 10 oczek na schemacie
- Przepływ: PR-06
- Dowód potrzeby: J-04; „at least to see 10 cell increments” (knitCompanion, id13447480282); dowód pojedynczy
- Kryteria akceptacji:
  - Scenariusz: Włączenie siatki
    - Zakładając, że schemat jest otwarty
    - Gdy użytkownik włącza siatkę i ustawia jej początek
    - Wtedy na schemacie widać linie co 10 kratek od wskazanego miejsca
