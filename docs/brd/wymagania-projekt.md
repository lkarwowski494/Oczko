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

### BR-PRJ-011: Powrót do tego samego miejsca po starcie i z innej aplikacji
- Przepływ: PR-02, PR-06, PR-07
- Dowód potrzeby: J-05, J-04; „it *does not save* my settings.” (My Row Counter, id14255514434); „I feel like all of my pattens should automatically open right where I left off” (knitCompanion, id8240402281, pisownia oryginału); „If I am in it then move to my browser or another app, then come back to this app, it is gone.” (knitCompanion, id12667261449); „if I open different patterns on different devices they stay open on the specific device” (My Row Counter GB, id14633308306) · ER-15
- Kryteria akceptacji:
  - Scenariusz: Start po zamknięciu aplikacji
    - Zakładając, że użytkownik pracował w projekcie „Sweter”, część „rękaw lewy”, licznik rzędów, wzór na stronie 3 w powiększeniu 200%, a system zamknął aplikację
    - Gdy użytkownik uruchamia aplikację
    - Wtedy widzi ten sam projekt, część i licznik oraz wzór na stronie 3 w powiększeniu 200%, bez ponownego wybierania
  - Scenariusz: Powrót z innej aplikacji
    - Zakładając, że wzór jest otwarty na stronie 3, a użytkownik przechodzi do przeglądarki
    - Gdy wraca do Oczka
    - Wtedy wzór jest otwarty na tej samej stronie i w tym samym powiększeniu, bez ponownego ładowania przez użytkownika
  - Scenariusz: Dwa urządzenia
    - Zakładając, że na iPadzie otwarty jest wzór projektu „Sweter”, a na iPhonie projekt „Skarpeta”
    - Gdy użytkownik zmienia stronę wzoru na iPadzie
    - Wtedy iPhone nadal pokazuje projekt „Skarpeta”, a wartości liczników obu projektów są na obu urządzeniach te same (stan widoku osobno na urządzeniu, dane wspólne)

### BR-PRJ-012: Lista projektów po roku
- Przepływ: PR-07
- Dowód potrzeby: J-05; „rather than having to scroll through the hundreds of patterns I have stored on here” (knitCompanion GB, id5228080107); „I’d like to be able to only see current projects that aren’t completed but also aren’t archived.” (YarnBuddy, id13730696774); „would like a finished projects page instead of archiving” (YarnBuddy GB, id11278392542) · ER-23
- Kryteria akceptacji:
  - Scenariusz: W toku według ostatniej pracy
    - Zakładając, że projekt „Skarpeta” miał ostatnią zmianę licznika wczoraj, a „Sweter” 3 tygodnie temu
    - Gdy użytkownik otwiera listę projektów
    - Wtedy „Skarpeta” jest nad „Swetrem”, a projekty ukończone są w osobnej grupie
  - Scenariusz: Wyszukiwanie po nazwie
    - Zakładając, że użytkownik ma 80 projektów, w tym ukończony „Sweter w warkocze”
    - Gdy wpisuje w wyszukiwanie „warkocz”
    - Wtedy widzi ten projekt z oznaczeniem, że jest ukończony, także bez sieci
  - Scenariusz: Brak wyników
    - Zakładając, że żaden projekt nie ma w nazwie „kamizelka”
    - Gdy użytkownik wpisuje „kamizelka”
    - Wtedy widzi informację, że nie ma takiego projektu, a lista po wyczyszczeniu wyszukiwania wraca

### BR-PRJ-013: Korekta czasu sesji i dat projektu
- Przepływ: PR-14, PR-07
- Dowód potrzeby: J-11; „Please make it so I can correct my timer. If I forget to pause it when I walk away I can’t wind back the time.” (Loopsy, id13728925552); „I’ll pause it when I go to bed and wake up to it saying I’ve been crocheting for 8 hours.” (Loopsy, id13535125970); „The completion date on the projects I’ve done cannot be changed” (YarnBuddy, id13730696774) · ER-20
- Kryteria akceptacji:
  - Scenariusz: Zapomniany stoper
    - Zakładając, że sesja trwa 8 godzin, bo stoper działał przez noc, a czas projektu wynosi 20 godzin
    - Gdy użytkownik zmienia koniec sesji tak, że trwa 1 godzinę
    - Wtedy sesja trwa 1 godzinę, a czas projektu 13 godzin
  - Scenariusz: Data ukończenia
    - Zakładając, że projekt oznaczono jako ukończony dziś, a skończono go 3 dni temu
    - Gdy użytkownik zmienia datę ukończenia na dzień sprzed 3 dni
    - Wtedy lista ukończonych i kalendarz pokazują ukończenie tego dnia
  - Scenariusz: Koniec przed początkiem
    - Zakładając, że sesja zaczęła się o 20:00
    - Gdy użytkownik ustawia jej koniec na 19:30
    - Wtedy aplikacja nie zapisuje zmiany i pokazuje, że koniec musi być po początku

### BR-PRJ-014: Druga część pary (bliźniak)
- Przepływ: PR-07, PR-02
- Dowód potrzeby: J-02, J-05; „when I make the second sock I can make sure they match row counts” (Crochet and Knit Counter, id5378098505); „I would like to keep notes for how many rows/sts the first sleeve was to have the second sleeve match” (Crochet and Knit Counter, id4956785470); BR-PRJ-007 · ER-12 (I-2, P-044); porównanie z zastrzeżeniami patentów (OG-07, P-024: treść zależna od postępu)
- Kryteria akceptacji:
  - Scenariusz: Cel z pierwszej części
    - Zakładając, że pierwszy rękaw ma 96 rzędów i jest ukończony
    - Gdy użytkownik zakłada drugi rękaw jako parę pierwszego
    - Wtedy drugi rękaw ma cel 96 rzędów
  - Scenariusz: To samo miejsce co w pierwszej
    - Zakładając, że w pierwszym rękawie przy rzędzie 30 jest notatka „ujmowanie” i było przypomnienie
    - Gdy licznik drugiego rękawa osiąga 30
    - Wtedy aplikacja pokazuje, że w pierwszym rękawie w tym rzędzie była notatka „ujmowanie” i przypomnienie
  - Scenariusz: Pierwsza bez rzędów
    - Zakładając, że pierwsza część ma 0 rzędów
    - Gdy użytkownik zakłada parę
    - Wtedy druga część nie ma celu, a aplikacja pokazuje, że cel pojawi się, gdy pierwsza ma rzędy

### BR-PRJ-015: Karta ukończenia projektu
- Przepływ: PR-07
- Dowód potrzeby: J-11; „編み終えた時に紙吹雪が出るのが地味に嬉しい” (編み物カウンター２, id13632559947); „I would love to have a running list of completed projects with the time it took to complete listed.” (knitCompanion, id13529266059) · ER-12 (I-6, P-044); tylko w chwili ukończenia, bez osi zdjęć (P-046)
- Kryteria akceptacji:
  - Scenariusz: Karta przy ukończeniu
    - Zakładając, że projekt trwał od 1 do 21 października, ma 640 rzędów, 18 godzin ze stopera, włóczkę i zdjęcie
    - Gdy użytkownik oznacza go jako ukończony
    - Wtedy widzi kartę: 21 dni, 18 godzin, 640 rzędów, włóczkę i zdjęcie, z możliwością zapisania albo udostępnienia
  - Scenariusz: Udostępnienie bez lokalizacji (ER-24)
    - Zakładając, że zdjęcie projektu ma w metadanych położenie GPS
    - Gdy użytkownik udostępnia kartę
    - Wtedy plik karty nie zawiera metadanych położenia, a aplikacja nie wysyła niczego sama (arkusz udostępniania, ZP-03)
  - Scenariusz: Bez stopera
    - Zakładając, że projekt nie miał sesji stopera
    - Gdy użytkownik oznacza go jako ukończony
    - Wtedy karta nie pokazuje czasu pracy zamiast pokazywać 0 godzin

### BR-PRJ-016: Projekty dawno nieruszane
- Przepływ: PR-07
- Dowód potrzeby: J-05; „come back to a languishing WIP years later and just pick up where I left off” (My Row Counter GB, id14614568294); „put one into “hibernation” for months, and still be able to pick up exactly where I left off” (Crochet and Knit Counter CA, id6825424556) · ER-12 (I-9, P-044); bez progu dni (P-047)
- Kryteria akceptacji:
  - Scenariusz: Ostatnia praca na liście
    - Zakładając, że ostatnia zmiana licznika „Swetra” była 47 dni temu
    - Gdy użytkownik otwiera listę projektów w toku
    - Wtedy przy „Swetrze” widzi „ostatnia praca 47 dni temu”, a projekt stoi niżej niż nowsze (BR-PRJ-012)
  - Scenariusz: Powrót jednym stuknięciem
    - Zakładając ten sam projekt
    - Gdy użytkownik stuka w niego na liście
    - Wtedy otwiera się ostatnia część i licznik w miejscu pracy (BR-PRJ-011)

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

### BR-WZR-007: Wzór ze strony WWW i z pliku Word, link do filmu
- Przepływ: PR-06
- Dowód potrzeby: J-04; „be it a webpage or a pdf” (opis My Row Counter, S-17); nota wersji My Row Counter 3.58 „Can now import Word files” (strona App Store, odczyt roli 03 2026-10-22); „The fact that I can load patterns in from websites and PDF’s is a game changer!!” (My Row Counter, id14644150451); film: dowód słaby, pojedynczy: „I use it to transcribe free videos” (My Row Counter, id14688038898) · ER-17; porównanie z zastrzeżeniami patentów jak cały moduł (OG-07, P-024)
- Kryteria akceptacji:
  - Scenariusz: Strona WWW zapisana bez sieci
    - Zakładając, że użytkownik ma otwarty wzór na stronie WWW w przeglądarce
    - Gdy udostępnia stronę do Oczka i wybiera projekt
    - Wtedy wzór jest w projekcie i otwiera się później bez sieci
  - Scenariusz: Plik Word
    - Zakładając, że w Plikach jest wzór w pliku Word
    - Gdy użytkownik udostępnia go do Oczka
    - Wtedy wzór jest w projekcie i otwiera się bez sieci
  - Scenariusz: Strona, której nie da się zapisać
    - Zakładając, że strona wymaga logowania albo nie ma treści wzoru
    - Gdy użytkownik udostępnia ją do Oczka
    - Wtedy aplikacja pokazuje, że nie może zapisać strony, i nie tworzy pustego wzoru
  - Scenariusz: Link do filmu
    - Zakładając, że użytkownik dodaje do projektu link do filmu z instrukcją
    - Gdy otwiera link bez sieci
    - Wtedy aplikacja pokazuje, że film wymaga sieci; Oczko zapisuje tylko link, nie film

### BR-WZR-008: Zakreślanie i notatki na wzorze palcem
- Przepływ: PR-06
- Dowód potrzeby: J-04; „I thought the highlighter pen would allow me to highlight for the size I’m making, it doesn’t :(” (My Row Counter GB, id6552766264, po zakupie); „I wanted to be able to write notes and highlight sizes for garment knitting. So with that in mind, I decided to upgrade.” (knitCompanion, id8179546053); „I love being able to highlight and mark on my patterns” (My Row Counter, id13648606552) · ER-18; płatne zakreślanie u lidera (H-06); porównanie z zastrzeżeniami patentów (OG-07, P-024)
- Kryteria akceptacji:
  - Scenariusz: Zakreślenie mojego rozmiaru na iPhonie
    - Zakładając, że wzór jest otwarty na iPhonie, a użytkownik włączył zakreślacz
    - Gdy przeciąga palcem po liczbach dla rozmiaru M
    - Wtedy liczby rozmiaru M są zakreślone i zakreślenie jest tam po ponownym otwarciu wzoru bez sieci
  - Scenariusz: Notatka w miejscu wzoru
    - Zakładając, że wzór jest otwarty
    - Gdy użytkownik dodaje notatkę „ujmowanie co 4 rzędy” przy rzędzie 30 schematu
    - Wtedy notatka jest widoczna w tym miejscu wzoru i nie zmienia samego pliku wzoru
  - Scenariusz: Przewijanie bez zakreślacza
    - Zakładając, że zakreślacz jest wyłączony
    - Gdy użytkownik przesuwa palcem po wzorze
    - Wtedy wzór się przewija i nic się na nim nie rysuje (na iPadzie z Apple Pencil palec nie rysuje, BR-WZR-004)
