# Przepływy i wymagania niefunkcjonalne
Stan: STOP E3 · Aktualizacja: 2026-10-21 · Wymagania funkcjonalne według modułów: `wymagania-licznik.md` (LIC), `wymagania-projekt.md` (PRJ, WZR), `wymagania-dane.md` (DAN, ZAK), `wymagania-narzedzia.md` (ZAP, KAL, SLO).

Lista jest szeroka (zasada roli 7): obejmuje wszystko, na co wskazują dowody. Kolejność i cięcie należą do roli 03 (H-04, H-05). Ekrany projektuje rola 04; „ekran licznika” i podobne nazwy oznaczają miejsce w przepływie, nie układ.

## Przepływy (PR)
### PR-01: Pierwsze liczenie
- Kto: P-1 (także każdy nowy użytkownik). Praca: J-01. Częstość: raz, przy pierwszym uruchomieniu.
- Kroki: instaluje aplikację; otwiera ją; zaczyna liczyć rzędy bez konta, projektu i wzoru; później może nadać licznikowi nazwę projektu.
- Kontekst: robótka już w rękach albo obok; uwaga podzielona.
### PR-02: Liczenie rzędów w sesji
- Kto: P-1, P-2, P-3. Praca: J-01. Częstość: każda sesja, każdy rząd.
- Kroki: otwiera projekt; po każdym rzędzie dodaje 1; przy pruciu cofa; gdy nie pamięta, czy dodał, sprawdza historię; kończy sesję.
- Kontekst: obie ręce zajęte, telefon na stojaku albo na kolanach, podcast lub TV.
### PR-03: Powtórzenia i części
- Kto: P-2, P-3. Praca: J-02. Częstość: projekty z motywem albo kilkoma częściami.
- Kroki: dodaje licznik powtórzenia o długości n rzędów albo licznik części; dodaje rząd; widzi rząd w powtórzeniu i numer powtórzenia; zmienia ustawienie w trakcie.
- Kontekst: jak PR-02.
### PR-04: Instrukcje „co N rzędów” i „w tym samym czasie”
- Kto: P-2, P-3. Praca: J-03. Częstość: kształtowanie (rękawy, dekolt, raglan).
- Kroki: wpisuje instrukcję ze wzoru (od rzędu s, co N rzędów, M razy); aplikacja pokazuje plan rzędów; podczas liczenia dostaje wyraźne przypomnienie w odpowiednim rzędzie.
- Kontekst: jak PR-02; przypomnienie musi zauważyć ktoś, kto patrzy na robótkę.
### PR-05: Liczenie bez sięgania po telefon
- Kto: P-1, P-2. Praca: J-06. Częstość: każda sesja.
- Kroki: dodaje rząd z zegarka, z ekranu blokady albo głosem; ekran telefonu nie gaśnie, gdy liczy na telefonie.
- Kontekst: ręce zajęte, telefon zablokowany albo w innym miejscu pokoju.
### PR-06: Praca ze wzorem
- Kto: P-2, P-3. Praca: J-04. Częstość: projekty ze wzorem.
- Kroki: importuje PDF albo zdjęcie wzoru (Pliki, udostępnianie, aparat); ustawia znacznik bieżącego rzędu; dzierga, a znacznik przesuwa się z licznikiem; dopisuje notatki i zakreślenia.
- Kontekst: iPhone albo iPad, często poziomo; drobny tekst wieczorem.
### PR-07: Projekt od założenia do archiwum
- Kto: P-2, P-4. Prace: J-05, J-11. Częstość: każdy projekt.
- Kroki: zakłada projekt z częściami; zapisuje włóczkę, druty, próbkę, zdjęcia i notatki; przerywa na tygodnie; wraca i zastaje stan; kończy projekt; archiwizuje albo robi kopię do powtórzenia.
- Kontekst: dom; powrót po długiej przerwie.
### PR-08: Dane na nowym telefonie i iPadzie
- Kto: P-2, P-3. Praca: J-07. Częstość: zmiana telefonu, drugie urządzenie, aktualizacja aplikacji.
- Kroki: włącza synchronizację iCloud (opcjonalnie); na drugim urządzeniu widzi te same projekty; przy zmianie telefonu odtwarza dane z kopii urządzenia albo z pliku eksportu; po aktualizacji aplikacji zastaje wszystkie dane.
- Kontekst: wolne ręce; synchronizacja wymaga sieci (OG-09).
### PR-09: Zakup i przywrócenie zakupu
- Kto: każdy płacący. Praca: J-07. Częstość: zakup raz; przywrócenie przy nowym urządzeniu.
- Kroki: kupuje wersję płatną; na nowym urządzeniu albo po reinstalacji przywraca zakup; korzysta bez reklam.
- Kontekst: wolne ręce, sieć.
### PR-10: Zapas włóczki
- Kto: P-4. Praca: J-08. Częstość: zakupy, start i koniec projektu.
- Kroki: dodaje włóczkę ze zdjęciem etykiety; przypisuje ją do projektu; po zakończeniu odejmuje zużycie; przed zakupem sprawdza, co ma.
- Kontekst: dom albo sklep bez zasięgu.
### PR-11: Obliczenie
- Kto: P-2, P-3. Praca: J-09. Częstość: start projektu, zmiana włóczki.
- Kroki: wybiera obliczenie; podaje dane (próbka, wymiar, jednostki); widzi wynik z danymi wejściowymi i założeniami; zapisuje wynik w projekcie.
- Kontekst: dom, wolne ręce.
### PR-12: Sprawdzenie skrótu
- Kto: P-1. Praca: J-10. Częstość: przy nieznanym skrócie.
- Kroki: wybiera system terminologii wzoru (US albo UK); wyszukuje skrót; czyta znaczenie.
- Kontekst: w trakcie robótki, krótka przerwa.
### PR-13: Przejście od innej aplikacji
- Kto: P-2, P-4. Praca: J-07. Częstość: raz.
- Kroki: eksportuje dane z poprzedniej aplikacji albo z Ravelry; importuje plik do Oczka; sprawdza projekty i zapas.
- Kontekst: dom.
### PR-14: Czas i postęp
- Kto: P-2. Praca: J-11. Częstość: każda sesja.
- Kroki: uruchamia stoper sesji; kontynuuje przy zablokowanym ekranie; widzi czas projektu, postęp do celu i szacowany czas do końca.
- Kontekst: jak PR-02.

## Wymagania niefunkcjonalne (NFR)
### NFR-DAN-001: Zero utraty danych przy aktualizacji
- Miara: liczba rekordów (projekty, liczniki, historia, zapas, notatki) różnych przed i po migracji schematu.
- Próg: 0 (zasada projektu „Zero utraty danych”, `CLAUDE.md`).
- Metoda: test migracji w transakcji na kopii bazy poprzedniej wersji (rola 07, 12).
### NFR-DAN-002: Każda zmiana licznika zapisana trwale
- Miara: liczba zmian licznika utraconych po wymuszonym zamknięciu aplikacji albo wyłączeniu telefonu zaraz po dotknięciu.
- Próg: 0.
- Metoda: test automatyczny z zabiciem procesu po każdej zmianie (rola 07).
### NFR-DAN-003: Synchronizacja nie zmienia liczby bez wiedzy użytkownika
- Miara: liczba przypadków, w których po synchronizacji licznik ma wartość inną niż ostatnia ustawiona na którymkolwiek urządzeniu, bez pokazania konfliktu.
- Próg: 0 (RYZ-02).
- Metoda: test konfliktów na dwóch urządzeniach i zegarku, z przerwaną siecią (rola 12).
### NFR-OFF-001: Działanie bez sieci
- Miara: odsetek przepływów PR-01–PR-07, PR-10–PR-12, PR-14 wykonanych w trybie samolotowym.
- Próg: 100% (`docs/pomysl.md`; P-021).
- Metoda: test ręczny i automatyczny w trybie samolotowym.
### NFR-PRY-001: Brak zbierania danych
- Miara: kategorie danych w etykiecie App Privacy i lista SDK.
- Próg: „Data Not Collected”, zero SDK reklamowych i analitycznych (ZP-03).
- Metoda: przegląd zależności i etykiety przed wydaniem (rola 10).
### NFR-DOS-001: VoiceOver w głównych przepływach
- Miara: odsetek elementów sterujących PR-01–PR-05 z etykietą i akcją VoiceOver.
- Próg: 100% (ZP-04; popyt: VoiceOver w Crochet and Knit Counter).
- Metoda: audyt VoiceOver na urządzeniu (rola 04 ustala pozostałe podłogi dostępności).
### NFR-DOS-002: Duży tekst
- Miara: obcięty albo nakładający się tekst na ekranach PR-01–PR-06 przy największym rozmiarze tekstu.
- Próg: [DO USTALENIA] (OP-16), podłogę ustala rola 04.
- Metoda: zrzuty przy każdym rozmiarze Dynamic Type.
### NFR-WYD-001: Reakcja licznika
- Miara: czas od dotknięcia do pokazania nowej wartości.
- Próg: [DO USTALENIA] (OP-17), budżet ustala rola 05.
- Metoda: pomiar na najstarszym obsługiwanym iPhonie.
### NFR-ZEG-001: Zgodność zegarka i telefonu
- Miara: różnica wartości licznika między zegarkiem a telefonem po serii zmian na obu urządzeniach.
- Próg: 0 po zakończeniu synchronizacji (skargi: YarnBuddy 17 z 301).
- Metoda: test na parze urządzeń, także przy telefonie poza zasięgiem.
### NFR-JEZ-001: 35 lokalizacji
- Miara: odsetek tekstów interfejsu przetłumaczonych w każdej z 35 lokalizacji.
- Próg: 100% przed wydaniem w danym sklepie (D-026; P-009).
- Metoda: kontrola katalogu tłumaczeń (rola 09).
### NFR-KOS-001: Koszt stały
- Miara: miesięczny koszt usług poza opłatą Apple Developer.
- Próg: 0 zł (ZAL-003; OG-09).
- Metoda: przegląd usług w ADR (rola 05).
