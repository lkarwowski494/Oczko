# Kontrakt zakresu: Oczko
Stan: **E3 zakończony, przyjęty przez właściciela (P-052, 2026-10-22)** · Aktualizacja: 2026-10-22 · Rola 03-zakres, tryb build (prompt `prompts` @97ec212) · Wejście: BRD `docs/brd/` (80 BR po poprawce roli 01: P-047, P-048), `docs/monetyzacja.md` (sesja 2), ZAL-001–027 · Decyzje zakresu: P-040–P-046, P-049, P-052; model: V4 (P-057, P-058) · Historia E0–E2 (rama, soczewki, pominięcia, warianty): `docs/scope-contract-historia.md`

## Główna praca i pętla
- Główna praca: J-01 „Wiedzieć, w którym rzędzie jestem, i ufać tej liczbie” z J-05 (powrót) i J-04 (miejsce we własnym wzorze); ZAL-019 podważone w części (J-04 w rdzeniu, E1).
- Pętla główna: uruchomienie w ostatnim miejscu (F-49, F-18) → +1 z wibracją, ekran nie gaśnie (F-01, F-10) → pomyłka: −1, cofnięcie, strażnik, opcjonalna blokada, wpisanie wartości (F-02, F-47, F-03, F-45) → [warstwa] części z celem (F-14, F-08), wzór obok licznika ze znacznikiem (F-24, F-25, F-26) i przypomnienie (F-06) → wyjście bez zapisywania (F-31) → powrót z notatką (F-15).
- Apetyt wersji 1: 45 h godzin właściciela na funkcje (W1 = 43,75 h [OCENA ×0,5–2]) plus ok. 15 h bramek ról (P-049). Podział: jedna aplikacja (iPhone, iPad, zegarek) z warstwami Narzędzia (F-37, F-38) i Historia (F-59) poza ekranem licznika (P-049, H-07 (a), ZAL-022).
- Zasada ekranu licznika (P-046): nic z kalendarza, terminu ani nowych funkcji, dopóki użytkownik sam czegoś nie ustawi; wyjątki działające bez nowego elementu: F-47, F-48. Uproszczenia przepływów U-1–U-12: `oczko-warsztat/03-zakres/2026-10-22-build/przeplywy-mapa-szkic.md` (wejście dla 04).
- Wzorzec najlepszych (Lookup US 2026-10-22): knitCompanion (6899 ocen), My Row Counter (3867), Knitting Chart (1298). W pętli: licznik + własny wzór ze znacznikiem + powrót; nie mają kalendarza, kalkulatorów swetrowych, słownika; skargi: złożoność, funkcje przeniesione za paywall, reklamy, synchronizacja. Szczegóły i cytaty: historia, sekcja „E1”.
- Dostęp darmowe / płatne: **model V4 (P-057, kontrakt płatności `docs/monetyzacja.md`, „Sesja 3, E3”, P-058).** Wszystkie funkcje z tabeli „Zakres” są darmowe od pierwszego uruchomienia w limicie 5 dni z robótką w miesiącu kalendarzowym; dzień zużywa tylko praca przy robótce (liczenie rzędów), blokada tylko przy starcie nowego dnia ponad limit (strażnik startu), praca w toku nigdy nie przerwana; dane, eksport, przywracanie i polityka zawsze. Pro (0,99 USD/mies., 6,99 USD/rok bez oferty wprowadzającej, dożywotni 14,99 USD) znosi limit; podziału funkcji na darmowe i Pro nie ma, więc P-049 (4) i kolumna „Dostęp” z E2 tracą przedmiot.
- Pętla opinii w wersji 1: F-57 „Zgłoś problem”; systemowa prośba o ocenę po ukończeniu projektu i odnośnik „Oceń” (specyfikacja: rola 11) bez BR: ER-25 do roli 01.

## Zakres
| ID | Funkcja | Wymagania | Decyzja | Dowód wartości | WTP | Intuicyjność | Podłoga | Zależy od | Uzasadnienie |
|---|---|---|---|---|---|---|---|---|---|
| F-01 | Licznik od pierwszego uruchomienia, +1/−1, wibracja | BR-LIC-001, BR-LIC-002, BR-LIC-005 | MVP | J-01 (R: 12 z 14 konkurencji, BRD) | WTP-0 (R) | pierwsze +1 jednym stuknięciem, nic przed licznikiem (NFR-PIE-001); wynik: czeka na 04 | dane: BR-LIC-001, BR-LIC-002 (blok.) | F-31 | rdzeń pętli |
| F-02 | Historia zmian z godziną i cofnięciem | BR-LIC-003 | MVP | J-01 (R: 編み物カウンター２ id13252701149) | WTP-1 (R) | historia jednym stuknięciem z ekranu licznika; zmiana z godziną i wartością; wynik: czeka na 04 | dane: BR-LIC-003 → F-01 | F-01 | rdzeń pętli |
| F-03 | Blokada przed przypadkowym stuknięciem (opcja) | BR-LIC-004 | MVP | J-01 (B: 24 z 47 recenzji ≤3★) | WTP-2 (B) | opcja domyślnie wyłączona (U-1); stuknięcie w zablokowany licznik mówi, jak odblokować; wynik: czeka na 04 | — | F-01 | ochrona liczby; domyślną ochroną jest F-47 (U-1) |
| F-04 | Kilka liczników, zmiana ustawień w trakcie | BR-LIC-006, BR-LIC-008 | MVP | J-02 (R: 13 z 14) | WTP-1 (R) | „dodaj licznik” w projekcie; typ nazwany słowem pracy (rzędy, oczka); wynik: czeka na 04 | — | F-01 | J-02; P-030 (bez limitu) |
| F-05 | Licznik powtórzeń powiązany z rzędami | BR-LIC-007 | MVP | J-02 (R: id14113087501) | WTP-1 (R) | długość powtórzenia jednym polem; licznik pokazuje „powtórzenie 3, rząd 1”; wynik: czeka na 04 | — | F-04 | J-02; Pro (P-027) |
| F-06 | Przypomnienie „co N rzędów, M razy” z podglądem planu rzędów | BR-LIC-009, BR-LIC-010 | MVP | J-03 (R: ✓$ 2; luka: plan rzędów) | WTP-1 (R) | jeden formularz „od rzędu, co N, M razy” z listą rzędów przed zapisem (U-3); przypomnienie zmienia cały ekran; wynik: czeka na 04 | — | F-01 | BR-LIC-010 scalone z F-06 jako podgląd (U-3, P-046); ID F-07 wycofane |
| F-08 | Cel rzędów części i jego osiągnięcie | BR-LIC-011 | MVP | J-11 (B: id13666644359) | WTP-2 (B) | cel jednym polem; po osiągnięciu „Następna część / Druga taka sama” (U-11); wynik: czeka na 04 | — | F-14 | cel zasila postęp F-60 i bliźniaka F-52 |
| F-09 | Znaczenie liczby: rząd skończony / w trakcie | BR-LIC-012 | MVP | J-01 (B: id12699699581) | WTP-2 (B) | domyślnie „skończone rzędy”; zmiana w ustawieniach licznika, bez pytania na starcie; wynik: czeka na 04 | — | F-01 | P-040 (wariant B); ustawienie zamiast pytania (sygnał kombajnu złagodzony domyślną wartością) |
| F-10 | Ekran nie gaśnie podczas liczenia | BR-LIC-013 | MVP | J-06 (R: ✓ 6 z 14) | WTP-0 (R) | domyślnie włączone na ekranie licznika; wynik: czeka na 04 | — | F-01 | pętla |
| F-11 | Sesja na ekranie blokady: rząd (+1) i czas razem | BR-LIC-014 | MVP | J-06 (R słaby: ✓$ 1) | WTP-1 (R) | jedna sesja na ekranie blokady z rzędem i czasem (U-4); wynik: czeka na 04 | — | F-01 | P-040; wspólny mechanizm z F-21 |
| F-12 | Liczenie na zegarku | BR-LIC-015 | MVP | J-06 (R mocny: ✓$ 3, id14675500870) | WTP-1 (R) | +1 jednym stuknięciem na zegarku, ten sam licznik co w telefonie; wynik: czeka na 04 | dane: NFR-ZEG-001 (blok.) | F-01, F-35 | P-040 (wariant B); P-039 |
| F-13 | Rząd głosem (Siri) | BR-LIC-016 | PÓŹNIEJ | J-06 (R: ✓$ 2; 3 z 3 liderów) | WTP-1 (R) | — | — | F-01 | poza kierunkiem P-040; frazy i rozpoznawanie w 35 językach, 1,5 h + 2 h/rok. Powrót: wersja 1.1 albo ≥3 prośby o sterowanie głosem w recenzjach Oczka |
| F-14 | Projekt z częściami (powstaje z pierwszego licznika) | BR-PRJ-001 | MVP | J-02, J-05 (R: 10 z 14) | WTP-1 (R) | projekt powstaje sam z pierwszego licznika, części dodawane w razie potrzeby (U-5); wynik: czeka na 04 | — | F-01 | pętla (swetry, części) |
| F-15 | Notatka widoczna przy liczniku | BR-PRJ-002 | MVP | J-05 (R: id3713410970) | WTP-1 (R) | notatka obok licznika bez otwierania innego ekranu; wynik: czeka na 04 | — | F-14 | pętla (powrót z notatką) |
| F-16 | Zdjęcia projektu i etykiet | BR-PRJ-003 | MVP | J-05 (R: id3998353222) | WTP-1 (R) | zdjęcie z projektu aparatem albo z biblioteki; wynik: czeka na 04 | — | F-14 | P-040, P-032 |
| F-17 | Dane techniczne projektu (drut mm i US) | BR-PRJ-004 | MVP | J-05 (B: id12656086541) | WTP-2 (B) | drut w mm, numer US dopisany sam; próbka wpisana raz wypełnia obliczenia (U-10); wynik: czeka na 04 | — | F-14 | P-040; źródło danych dla F-38 |
| F-18 | Powrót do projektu po przerwie | BR-PRJ-005 | MVP | J-05 (R) | WTP-0 (R) | otwarcie projektu pokazuje liczniki, notatkę, miejsce we wzorze i datę; wynik: czeka na 04 | dane: odczyt | F-14 | pętla |
| F-19 | Stan projektu i archiwum ukończonych | BR-PRJ-006 | MVP | J-05 (R: id13584919414) | WTP-2 (R) | „Ukończony” jako jedna akcja w jednej chwili ukończenia (U-9); wynik: czeka na 04 | dane: odczyt | F-14 | dane użytkownika |
| F-20 | Zrób taką samą: cały projekt | BR-PRJ-007 | MVP | J-05 (B: id13648606552) | WTP-2 (B) | „Zrób taką samą” → cały projekt (U-2); wynik: czeka na 04 | — | F-14 | P-040, P-032; jedno pojęcie z F-52 |
| F-21 | Stoper sesji przy zablokowanym ekranie | BR-PRJ-008 | MVP | J-11 (R: id9819100347) | WTP-1 (R) | start sesji jednym stuknięciem; czas na ekranie blokady razem z rzędem (U-4); wynik: czeka na 04 | — | F-11 | P-040 |
| F-22 | Szacunek czasu do celu z tempa | BR-PRJ-009 | PÓŹNIEJ | J-11 (H) | WTP-2 (H) | — | — | F-60 | procent z rzędów daje F-60 (BR-DNI-004); szacunek z tempa to hipoteza. Powrót: razem z F-62 w wersji 1.1 |
| F-24 | Import wzoru z pliku i ze zdjęcia | BR-WZR-001, BR-WZR-002 | MVP | J-04 (R: wzór PDF 10 z 14; MRC 37 ze 177 pochwał) | WTP-1 (R) | import z arkusza udostępniania do bieżącego projektu; wynik: czeka na 04 | prawo: OG-07 (blok.) | F-14 | pętla (J-04 w rdzeniu, ZAL-019); P-032 |
| F-25 | Wzór i licznik na jednym ekranie | BR-WZR-005 | MVP | J-04 (B: id14597301969) | WTP-2 (B) | telefon poziomo: wzór i licznik razem, bez ustawienia; wynik: czeka na 04 | prawo: OG-07 (blok.) | F-24 | pętla; P-032 |
| F-26 | Znacznik bieżącego rzędu we wzorze | BR-WZR-003 | MVP | J-04 (R mocny: id12653275134) | WTP-1 (R) | znacznik ustawiany raz stuknięciem w rząd, potem idzie z licznikiem; wynik: czeka na 04 | prawo: OG-07 (blok.) | F-25 | pętla; Pro (uwaga dla 02: u knitCompanion darmowe) |
| F-27 | Synchronizacja przez iCloud (opcjonalna) | BR-DAN-002 | MVP | J-07 (R: ✓$ 3, ✓ 7) | WTP-1 (R) | włączenie jednym przełącznikiem; stan widoczny (F-58); wynik: czeka na 04 | dane: NFR-DAN-003 (blok.) | F-31 | P-031, P-021 |
| F-28 | Pisanie po wzorze Apple Pencil | BR-WZR-004 | MVP | J-04 (R: ✓$ 5 z 7) | WTP-1 (R) | rysik pisze od razu, palec przewija (pencilOnly); wynik: czeka na 04 | prawo: OG-07 (blok.) | F-24 | P-042 |
| F-29 | Import od innej aplikacji (zapas z Ravelry) | BR-DAN-007 | PÓŹNIEJ | H-08 (H) | WTP-2 (H) | — | — | F-32 | hipoteza, cudze formaty się zmieniają (1,5 h + 1,5 h/rok). Powrót: ≥3 prośby o import z konkretnej aplikacji |
| F-31 | Baza na urządzeniu, trwały zapis, dane po aktualizacji | BR-DAN-001, BR-DAN-003 | MVP | J-07 (R: id12528635347) | dane | bez przycisku „Zapisz”; wynik: czeka na 04 | dane: NFR-DAN-001, NFR-DAN-002 (blok.) | — | podłoga |
| F-32 | Nowy telefon, eksport i import własnej kopii (także na niepustej bazie) | BR-DAN-004, BR-DAN-005, BR-DAN-006 | MVP | J-07 (R: id10843107781) | dane | eksport jednym przyciskiem do Plików; import rozpoznaje plik Oczka i pyta „scal / zastąp”; wynik: czeka na 04 | dane: eksport, odczyt (blok.) | F-31 | podłoga |
| F-33 | Ostatnio usunięte (projekt, licznik, część) 30 dni | BR-DAN-008 | MVP | J-07 (R: id11235965435) | dane | „Ostatnio usunięte” z terminem przy usuwaniu; wynik: czeka na 04 | dane: usunięcie | F-31 | podłoga; P-026, P-047 |
| F-34 | Usunięcie wszystkich danych | BR-DAN-009 | MVP | ZP-03 | dane | w ustawieniach, z potwierdzeniem i zdaniem o zakupie (KP-05); wynik: czeka na 04 | dane: usunięcie; prawo: OG-04 | F-31 | podłoga |
| F-35 | Zakup Pro, przywracanie, opłacone nie znika | BR-ZAK-001, BR-ZAK-003 | MVP | OG-02 (R: id12782448883) | warunek | „Przywróć zakupy” na ekranie zakupu i w ustawieniach; zakup tylko po działaniu użytkownika (KP-10); wynik: czeka na 04 | prawo: OG-02 (blok.) | F-31 | podłoga; P-029 |
| F-36 | Bez reklam i śledzenia, polityka prywatności | BR-ZAK-002, BR-ZAK-004 | MVP | ZP-03 (R: id10578656875) | warunek | polityka prywatności w ustawieniach; wynik: czeka na 04 | prawo: OG-04, NFR-PRY-001 (blok.) | — | podłoga |
| F-37 | Zapas włóczki i narzędzi (warstwa Narzędzia) | BR-ZAP-001, BR-ZAP-002, BR-ZAP-003, BR-ZAP-004 | MVP | J-08 (R: id7646956808) | WTP-1 (R) | Narzędzia → Zapas; zużycie pytane w chwili ukończenia projektu (U-9); wynik: czeka na 04 | prawo: OG-13; bezpieczeństwo: RD-03, RD-10 | F-19 | P-040, P-046 (warstwa poza pętlą) |
| F-38 | Obliczenia podstawowe: oczka z próbki, jednostki, grubość (warstwa Narzędzia) | BR-KAL-001, BR-KAL-003, BR-KAL-008 | MVP | J-09 (R: ✓$ 2, ✓ 7) | WTP-1 (R) | Narzędzia → Obliczenia albo z projektu z próbką wpisaną raz (U-10); wynik z danymi wejściowymi; wynik: czeka na 04 | bezpieczeństwo: RD-01, RD-03, RD-04, RD-10 (blok.) | F-17 | P-040, P-046 (warstwa poza pętlą); przegląd 06 (D-027) |
| F-39 | Przeliczenie wzoru na własną próbkę | BR-KAL-002 | PÓŹNIEJ | J-09 (R słaby) | WTP-1 (R) | — | bezpieczeństwo: RD-02 | F-38 | 1 pochwała kalkulatora na 177 (MRC). Powrót: wersja 1.1 albo ≥3 prośby o przeliczenie na własną próbkę |
| F-40 | Równomierne dodawanie i ujmowanie | BR-KAL-004 | PÓŹNIEJ | J-09 (B) | WTP-1 (B) | — | — | F-38 | bez rzędu płaskiego (OP-04) funkcja połowiczna. Powrót: OP-04 rozstrzygnięte u źródła i ≥3 prośby |
| F-42 | Zużycie włóczki z wagi próbki | BR-KAL-005 | PÓŹNIEJ | J-08, J-09 (R: StashBot 4,99 USD) | WTP-1 (R) | — | bezpieczeństwo: RD-07 | F-37 | OP-05 (zapas domyślny) otwarte; RD-07 krytyczna. Powrót: wersja 1.1 razem z zapasem, po rozstrzygnięciu OP-05 |
| F-44 | Słownik skrótów US/UK bez sieci | BR-SLO-001, BR-SLO-002 | PÓŹNIEJ | J-10 (R: RYZ-03) | WTP-2 (R) | — | bezpieczeństwo: RYZ-03 | — | OP-12: brak źródeł terminologii w 35 językach; 6 h + 3 h/rok przeglądu treści krytycznej. Powrót: źródło terminologii (OP-12) albo zawężenie do tabeli US↔UK z CYC |
| F-45 | Wpisanie wartości licznika i wyzerowanie | BR-LIC-017 | MVP | J-01, J-07 (R: 86 recenzji, 44 ≤3★; id14375427685) | WTP-0 (R), ocena 03 | stuknięcie w liczbę otwiera pole wartości; zerowanie z potwierdzeniem i cofnięciem; wynik: czeka na 04 | — | F-02 | pętla (przeniesienie trwającej robótki); E1 ER-13 |
| F-46 | Licznik całości nad sekcjami kawałka | BR-LIC-018 | MVP | J-01, J-02 (R: id13712427204) | WTP-1 (R), ocena 03 | licznik całości widoczny nad sekcjami bez ustawienia; wynik: czeka na 04 | — | F-14 | E1 ER-16; P-045 |
| F-47 | Strażnik stuknięć z tempa | BR-LIC-019 | MVP | J-01 (R: 47 recenzji, id8099185238) | WTP-1 (R), ocena 03 | baner „Cofnąć?” przy serii (RD-17), bez ustawienia; wynik: czeka na 04 | dane: ochrona liczby → F-01 | F-02 | pętla; P-044 (I-1) |
| F-48 | Wibracja przypomnienia inna niż wibracja rzędu | BR-LIC-020 | MVP | J-03 (B: id12476127028) | WTP-2 (B), ocena 03 | tylko dwa wzorce (rząd, przypomnienie), bez kodu do nauki; wynik: czeka na 04 | — | F-01, F-06 | P-044 (I-7) zawężone do dwóch wzorców (soczewka opiekuna) |
| F-49 | Powrót do tego samego miejsca | BR-PRJ-011 | MVP | J-05, J-04 (R: id14255514434) | WTP-0 (R), ocena 03 | aplikacja otwiera się tam, gdzie użytkownik skończył, bez ustawienia; wynik: czeka na 04 | dane: odczyt | F-18 | pętla; E1 ER-15 |
| F-50 | Lista projektów po roku | BR-PRJ-012 | MVP | J-05 (R: id13730696774) | WTP-2 (R), ocena 03 | w toku według ostatniej pracy, ukończone osobno, wyszukiwanie; wynik: czeka na 04 | dane: odczyt | F-19 | E1 ER-23 |
| F-51 | Korekta czasu sesji i dat projektu | BR-PRJ-013 | MVP | J-11 (R: id13728925552) | WTP-2 (R), ocena 03 | korekta w szczegółach sesji i projektu; wynik: czeka na 04 | dane: korekta | F-21 | E1 ER-20 |
| F-52 | Druga część pary (bliźniak) | BR-PRJ-014 | MVP | J-02, J-05 (B: id5378098505, id4956785470) | WTP-2 (B), ocena 03 | „Druga taka sama” przy celu części (U-11) i w „Zrób taką samą” (U-2); wynik: czeka na 04 | — | F-08, F-14 | P-044 (I-2) |
| F-53 | Karta ukończenia projektu | BR-PRJ-015 | MVP | J-11 (B: id13632559947, id13529266059) | WTP-2 (B), ocena 03 | karta pojawia się sama w chwili ukończenia; udostępnienie arkuszem systemowym; wynik: czeka na 04 | prawo: NFR-PRY-001 (zdjęcia bez lokalizacji) | F-19 | P-044 (I-6), P-046 (tylko w chwili ukończenia) |
| F-54 | Projekty dawno nieruszane | BR-PRJ-016 | MVP | J-05 (R: id14614568294) | WTP-2 (R), ocena 03 | „ostatnia praca N dni temu” na liście, bez ustawienia; wynik: czeka na 04 | — | F-50 | P-044 (I-9), P-047 |
| F-55 | Wzór ze strony WWW i z Worda, link do filmu | BR-WZR-007 | MVP | J-04 (R: listing MRC, id14644150451) | WTP-1 (R), ocena 03 | strona z Safari udostępniona do Oczka zapisuje się offline; Word jak PDF; wynik: czeka na 04 | prawo: OG-07, OG-08 | F-24 | E1 ER-17; wykonalność 05 |
| F-56 | Zakreślanie i notatki na wzorze palcem | BR-WZR-008 | MVP | J-04 (R: id6552766264, po zakupie) | WTP-1 (R), ocena 03 | zakreślacz palcem na iPhonie jednym narzędziem; wynik: czeka na 04 | prawo: OG-07 (blok.) | F-24 | E1 ER-18 |
| F-57 | Zgłoś problem z diagnostyką lokalną | BR-DAN-010 | MVP | J-07 (R: id8151431159, id13620980670) | warunek | „Zgłoś problem” w ustawieniach otwiera arkusz udostępniania z diagnostyką do podglądu; wynik: czeka na 04 | prawo: NFR-PRY-001 (bez treści projektów) | F-31 | pętla opinii w wersji 1 (kontrakt roli); P-041 |
| F-58 | Widoczny stan synchronizacji i zegarka | BR-DAN-011 | MVP | J-07 (R: id8662495109) | dane | stan jednym zdaniem w ustawieniach i przy błędzie; wynik: czeka na 04 | dane: NFR-DAN-003 → F-27 | F-27 | E1 ER-19 |
| F-59 | Kalendarz dni, dzień i podsumowanie okresu (jeden widok) | BR-DNI-001, BR-DNI-002, BR-DNI-003 | MVP | J-11 (B: id12699699581, id10575864934) | WTP-2 (B), ocena 03 | jeden widok w historii: miesiąc, dzień po stuknięciu, podsumowanie pod spodem (U-7); nic na ekranie licznika; wynik: czeka na 04 | — | F-02 | P-043, P-046 |
| F-60 | Postęp projektu w procentach | BR-DNI-004 | MVP | J-11 (R: id13632559947, id12304022403) | WTP-2 (R), ocena 03 | % pokazuje się sam, gdy części mają cele (U-8); część bez celu oznaczona; wynik: czeka na 04 | — | F-08 | P-043 |
| F-61 | Termin projektu, cel dzienny i kolejność „który projekt dziś” | BR-DNI-005, BR-DNI-006 | MVP | termin (R: listing YarnBuddy, id13818450106); cel dzienny (H) | WTP-2 (H), ocena 03 | jedno pole „Gotowe do”; cel na dziś i kolejność listy liczą się same (U-6); bez terminu nic się nie pokazuje; wynik: czeka na 04 | — | F-60 | wyjątek właściciela P-043, ZAL-027 (cel dzienny); P-044, P-046 |
| F-62 | „Zdążę?” przed startem projektu | BR-DNI-007 | PÓŹNIEJ | J-11 (H) | WTP-2 (H), ocena 03 | — | — | F-61 | P-046: przy pierwszym projekcie brak historii tempa. Powrót: wersja 1.1, gdy użytkownicy mają ukończone projekty |

## NIE robimy
| ID | Funkcja | Wymagania | Decyzja | Dowód wartości | WTP | Intuicyjność | Podłoga | Zależy od | Uzasadnienie |
|---|---|---|---|---|---|---|---|---|---|
| F-23 | Przypomnienie o przerwie | BR-PRJ-010 | NIE | J-11 (B pojedynczy) | WTP-2 (B) | — | — | — | OP-15 bez decyzji, RYZ-08 (obietnica zdrowotna), 1 recenzja. Powrót: ≥3 prośby o przypomnienie o przerwie w recenzjach Oczka |
| F-30 | Siatka co 10 oczek na schemacie | BR-WZR-006 | NIE | J-04 (B pojedynczy) | WTP-2 (B) | — | prawo: OG-07 | — | 1 recenzja, żaden z 3 liderów. Powrót: ≥3 prośby o siatkę na schemacie |
| F-41 | Długość po blokowaniu | BR-KAL-006 | NIE | J-09 (B; 0 próśb w 4682 recenzjach) | WTP-2 (B) | — | bezpieczeństwo: RD-08 | — | 4 z 4 soczewek E1: brak dowodu potrzeby; RD-08 krytyczna. Powrót: ≥3 prośby o przeliczenie po blokowaniu |
| F-43 | Luz w obwodzie | BR-KAL-007 | NIE | H-05 (brak śladu) | WTP-2 (B), 1 soczewka WTP-X | — | — | — | H-05: brak dowodu potrzeby. Powrót: ≥3 prośby o luz odzieży |

## Ranking ([OCENA]: R = % użytkowników pętli w miesiącu, I według RICE, C bez telemetrii ≤ 80 przy dowodzie R, koszt = godziny właściciela na wersję 1 z soczewki opiekuna, ×0,5–2)
| ID | R | I | C | Koszt [h] | Metoda |
|---|---|---|---|---|---|
| F-01 | — | — | — | 0,5 | stała (podłoga albo WTP-0) |
| F-02 | — | — | — | 0,5 | stała (podłoga albo WTP-0) |
| F-03 | 20 | 1 | 50 | 0,25 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-04 | 50 | 2 | 80 | 0,25 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-05 | 30 | 2 | 80 | 0,5 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-06 | 40 | 2 | 80 | 1 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-08 | 40 | 1 | 50 | 0,25 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-09 | 10 | 0,5 | 50 | 0,25 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-10 | — | — | — | 0,25 | stała (podłoga albo WTP-0) |
| F-11 | 30 | 1 | 50 | 2 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-12 | — | — | — | 3,5 | stała (podłoga albo WTP-0) |
| F-13 | 15 | 1 | 50 | 1,5 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-14 | 60 | 2 | 80 | 0,5 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-15 | 50 | 1 | 80 | 0,25 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-16 | 30 | 0,5 | 80 | 0,5 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-17 | 30 | 0,5 | 50 | 0,25 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-18 | — | — | — | 0,25 | stała (podłoga albo WTP-0) |
| F-19 | — | — | — | 0,25 | stała (podłoga albo WTP-0) |
| F-20 | 10 | 1 | 50 | 0,25 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-21 | 25 | 1 | 80 | 1 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-22 | 20 | 0,5 | 50 | 0,5 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-24 | — | — | — | 1 | stała (podłoga albo WTP-0) |
| F-25 | — | — | — | 0,75 | stała (podłoga albo WTP-0) |
| F-26 | — | — | — | 0,75 | stała (podłoga albo WTP-0) |
| F-27 | — | — | — | 3,5 | stała (podłoga albo WTP-0) |
| F-28 | — | — | — | 2 | stała (podłoga albo WTP-0) |
| F-29 | 5 | 1 | 50 | 1,5 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-31 | — | — | — | 1 | stała (podłoga albo WTP-0) |
| F-32 | — | — | — | 0,75 | stała (podłoga albo WTP-0) |
| F-33 | — | — | — | 0,5 | stała (podłoga albo WTP-0) |
| F-34 | — | — | — | 0,25 | stała (podłoga albo WTP-0) |
| F-35 | — | — | — | 2,5 | stała (podłoga albo WTP-0) |
| F-36 | — | — | — | 1,5 | stała (podłoga albo WTP-0) |
| F-37 | — | — | — | 2,25 | stała (podłoga albo WTP-0) |
| F-38 | — | — | — | 2,5 | stała (podłoga albo WTP-0) |
| F-39 | — | — | — | 0,75 | stała (podłoga albo WTP-0) |
| F-40 | 5 | 1 | 50 | 0,5 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-42 | — | — | — | 1 | stała (podłoga albo WTP-0) |
| F-44 | — | — | — | 6 | stała (podłoga albo WTP-0) |
| F-45 | — | — | — | 0,5 | stała (podłoga albo WTP-0) |
| F-46 | 20 | 1 | 80 | 0,5 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-47 | — | — | — | 0,5 | stała (podłoga albo WTP-0) |
| F-48 | 40 | 0,5 | 50 | 0,5 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-49 | — | — | — | 0,5 | stała (podłoga albo WTP-0) |
| F-50 | — | — | — | 0,5 | stała (podłoga albo WTP-0) |
| F-51 | — | — | — | 0,5 | stała (podłoga albo WTP-0) |
| F-52 | 10 | 1 | 50 | 0,5 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-53 | — | — | — | 0,75 | stała (podłoga albo WTP-0) |
| F-54 | 15 | 0,5 | 80 | 0,25 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-55 | — | — | — | 1,5 | stała (podłoga albo WTP-0) |
| F-56 | — | — | — | 0,75 | stała (podłoga albo WTP-0) |
| F-57 | — | — | — | 1 | stała (podłoga albo WTP-0) |
| F-58 | — | — | — | 0,5 | stała (podłoga albo WTP-0) |
| F-59 | 20 | 0,5 | 50 | 1,5 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-60 | 30 | 1 | 80 | 0,5 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-61 | 10 | 1 | 50 | 1,25 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |
| F-62 | 5 | 0,5 | 50 | 0,5 | R, I, C: [OCENA] z dowodu w kolumnie „Dowód wartości” |

Wynik `zakres-oczko.mjs docs/scope-contract.md --brd docs/brd --apetyt 45` (wyjątek nazwany P-049 (5): obok D-nnn przyjmuje P-nnn; skrypt: `oczko-warsztat/03-zakres/2026-10-22-build/zakres-oczko.mjs`):
```
Ranking (R × I × C ÷ koszt [h]; stałe: podłoga albo WTP-0; „razem” liczy MVP i ten wiersz):
  1. F-01 stała · 0,5 h, razem 0,5 h · MVP
  2. F-02 stała · 0,5 h, razem 1 h · MVP
  3. F-10 stała · 0,25 h, razem 1,25 h · MVP
  4. F-12 stała · 3,5 h, razem 4,75 h · MVP
  5. F-18 stała · 0,25 h, razem 5 h · MVP
  6. F-19 stała · 0,25 h, razem 5,25 h · MVP
  7. F-24 stała · 1 h, razem 6,25 h · MVP
  8. F-25 stała · 0,75 h, razem 7 h · MVP
  9. F-26 stała · 0,75 h, razem 7,75 h · MVP
  10. F-27 stała · 3,5 h, razem 11,25 h · MVP
  11. F-28 stała · 2 h, razem 13,25 h · MVP
  12. F-31 stała · 1 h, razem 14,25 h · MVP
  13. F-32 stała · 0,75 h, razem 15 h · MVP
  14. F-33 stała · 0,5 h, razem 15,5 h · MVP
  15. F-34 stała · 0,25 h, razem 15,75 h · MVP
  16. F-35 stała · 2,5 h, razem 18,25 h · MVP
  17. F-36 stała · 1,5 h, razem 19,75 h · MVP
  18. F-37 stała · 2,25 h, razem 22 h · MVP
  19. F-38 stała · 2,5 h, razem 24,5 h · MVP
  20. F-39 stała · 0,75 h, razem 25,25 h · PÓŹNIEJ
  21. F-42 stała · 1 h, razem 25,5 h · PÓŹNIEJ
  22. F-44 stała · 6 h, razem 30,5 h · PÓŹNIEJ
  23. F-45 stała · 0,5 h, razem 25 h · MVP
  24. F-47 stała · 0,5 h, razem 25,5 h · MVP
  25. F-49 stała · 0,5 h, razem 26 h · MVP
  26. F-50 stała · 0,5 h, razem 26,5 h · MVP
  27. F-51 stała · 0,5 h, razem 27 h · MVP
  28. F-53 stała · 0,75 h, razem 27,75 h · MVP
  29. F-55 stała · 1,5 h, razem 29,25 h · MVP
  30. F-56 stała · 0,75 h, razem 30 h · MVP
  31. F-57 stała · 1 h, razem 31 h · MVP
  32. F-58 stała · 0,5 h, razem 31,5 h · MVP
  33. F-04 wynik 320 · 0,25 h, razem 31,75 h · MVP
  34. F-14 wynik 192 · 0,5 h, razem 32,25 h · MVP
  35. F-15 wynik 160 · 0,25 h, razem 32,5 h · MVP
  36. F-05 wynik 96 · 0,5 h, razem 33 h · MVP
  37. F-08 wynik 80 · 0,25 h, razem 33,25 h · MVP
  38. F-06 wynik 64 · 1 h, razem 34,25 h · MVP
  39. F-60 wynik 48 · 0,5 h, razem 34,75 h · MVP
  40. F-03 wynik 40 · 0,25 h, razem 35 h · MVP
  41. F-46 wynik 32 · 0,5 h, razem 35,5 h · MVP
  42. F-17 wynik 30 · 0,25 h, razem 35,75 h · MVP
  43. F-16 wynik 24 · 0,5 h, razem 36,25 h · MVP
  44. F-54 wynik 24 · 0,25 h, razem 36,5 h · MVP
  45. F-20 wynik 20 · 0,25 h, razem 36,75 h · MVP
  46. F-21 wynik 20 · 1 h, razem 37,75 h · MVP
  47. F-48 wynik 20 · 0,5 h, razem 38,25 h · MVP
  48. F-09 wynik 10 · 0,25 h, razem 38,5 h · MVP
  49. F-22 wynik 10 · 0,5 h, razem 39 h · PÓŹNIEJ
  50. F-52 wynik 10 · 0,5 h, razem 39 h · MVP
  51. F-11 wynik 7,5 · 2 h, razem 41 h · MVP
  52. F-13 wynik 5 · 1,5 h, razem 42,5 h · PÓŹNIEJ
  53. F-40 wynik 5 · 0,5 h, razem 41,5 h · PÓŹNIEJ
  54. F-61 wynik 4 · 1,25 h, razem 42,25 h · MVP
  55. F-59 wynik 3,33 · 1,5 h, razem 43,75 h · MVP
  56. F-62 wynik 2,5 · 0,5 h, razem 44,25 h · PÓŹNIEJ
  57. F-29 wynik 1,67 · 1,5 h, razem 45,25 h · PÓŹNIEJ · poza apetytem 45 h
Kolejność budowy MVP: F-31 → F-01 → F-02 → F-03 → F-04 → F-05 → F-06 → F-14 → F-08 → F-09 → F-10 → F-11 → F-35 → F-12 → F-15 → F-16 → F-17 → F-18 → F-19 → F-20 → F-21 → F-24 → F-25 → F-26 → F-27 → F-28 → F-32 → F-33 → F-34 → F-36 → F-37 → F-38 → F-45 → F-46 → F-47 → F-48 → F-49 → F-50 → F-51 → F-52 → F-53 → F-54 → F-55 → F-56 → F-57 → F-58 → F-59 → F-60 → F-61
61 funkcji (MVP 49, PÓŹNIEJ 8, TEST 0, NIE 4), 80 BR · 0 błędów, 0 uwag
kod wyjścia: 0
```

## Kolejność i przekazanie
- **Kolejność budowy MVP (wynik skryptu, zależności przed zależnymi):** F-31 → F-01 → F-02 → F-03 → F-04 → F-05 → F-06 → F-14 → F-08 → F-09 → F-10 → F-11 → F-35 → F-12 → F-15 → F-16 → F-17 → F-18 → F-19 → F-20 → F-21 → F-24 → F-25 → F-26 → F-27 → F-28 → F-32 → F-33 → F-34 → F-36 → F-37 → F-38 → F-45 → F-46 → F-47 → F-48 → F-49 → F-50 → F-51 → F-52 → F-53 → F-54 → F-55 → F-56 → F-57 → F-58 → F-59 → F-60 → F-61
- **04 Studio projektowe:**
  - Przepływy w zakresie: PR-01–PR-11, PR-13 (tylko przeniesienie trwającej robótki, BR-LIC-017; import od konkurencji PÓŹNIEJ), PR-14, PR-15, PR-16 (bez BR-DNI-007). PR-12 (słownik) poza zakresem. Kto, cel, kroki, częstość, kontekst: `docs/brd/wymagania.md`.
  - Kryteria intuicyjności: kolumna „Intuicyjność” (każde `wynik: czeka na 04`); przejście poznawcze (cztery pytania NN/g) na prototypie; wynik wraca do kolumny jako `wynik: <pozytywny|negatywny>, <data, plik>` przez bramkę `zmiany-zakresu`; wynik negatywny: przebudowa w 04 albo NIE.
  - Testy z ludźmi: nie (P-052 (2)). Intuicyjność sprawdza 04 przejściem poznawczym (cztery pytania NN/g) jako [OCENA], z niezależnymi subagentami w roli nowej osoby na zrzutach z Expo web; ryzyko szczątkowe: brak obserwacji ludzi (P-041), sprawdzenie po wydaniu przez F-57 i recenzje.
  - Zasada P-046 i uproszczenia U-1–U-12; NFR-PIE-001 (pierwsze +1 jednym stuknięciem, nic przed licznikiem); KP-10 (zakup nigdy w trakcie liczenia).
  - „NIE robimy” to czego nie projektować; PÓŹNIEJ bez miejsca w nawigacji na zapas (bez pustych zakładek).
  - Tekst ekranu ofert wybrany przez właściciela (wariant 1): `oczko-warsztat/03-zakres/2026-10-22-build/oferty-tekst-wlasciciela.md`; ostateczny kształt ekranu zakupu po kontrakcie płatności roli 02.
- **05 Architekt:** przepływy w zakresie jak wyżej; dane zapisują F-01, F-02, F-04–F-06, F-08, F-14–F-21, F-24–F-28, F-31–F-38, F-45–F-61 (każda z historią zmian tam, gdzie BR tego wymaga); wszystko bez sieci (NFR-OFF-001) z bazą na urządzeniu jako źródłem prawdy (OG-09); praca w tle i powierzchnie natywne: zegarek (F-12, NFR-ZEG-001, P-039, OP-22), ekran blokady i stoper (F-11, F-21, U-4), iCloud (F-27, NFR-DAN-003), PencilKit `pencilOnly` (F-28, P-042), rozszerzenie udostępniania dla PDF, zdjęć, stron WWW i Worda (F-24, F-55), wibracje (F-01, F-48); uprawnienia: aparat i zdjęcia (F-16, F-24), powiadomienia tylko jeśli 04 ich użyje; StoreKit według kontraktu płatności (P-036; przy P-051 data końca subskrypcji nieodnawialnej liczona przez aplikację). Funkcje PÓŹNIEJ (F-13, F-22, F-29, F-39, F-40, F-42, F-44, F-62) nazwane, bez tabel i zależności na zapas. OP-25, OP-26, NFR-SYS-001 (minimalne wersje systemu).
- **06 Treści:** potrzeby treści: F-38 (obliczenia: reguły krytyczne RD-01, RD-03, RD-04, RD-10, przegląd zastępczy D-027; OP-02, OP-03, OP-09 zgoda CYC), F-37 (RD-03, RD-10; pielęgnacja tekstem, OG-13), F-17 (RD-11), F-05 (RD-12), F-06 (RD-13, OP-06), F-60 (RD-14), F-61 (RD-15), F-59 (RD-16), F-47 (RD-17). Słownik (F-44) PÓŹNIEJ, więc bez treści terminologii w wersji 1.
- **07 Jakość:** BR w zakresie: kolumna „Wymagania” tabeli „Zakres” dla decyzji MVP (scenariusze w `docs/brd/wymagania-*.md`, nagłówek `### BR-…`); blokery wydania z `docs/brd/README.md` w zakresie: BR-LIC-001–003 (F-01, F-02), BR-DAN-001–006 (F-31, F-32, F-27), BR-ZAK-001–004 (F-35, F-36), NFR-PRY-001, NFR-ZEG-001 (F-12), BR-KAL-001, BR-KAL-003, BR-KAL-008 (F-38, przegląd 06), funkcje wzoru F-24–F-26, F-28, F-55, F-56 (porównanie z zastrzeżeniami patentów OG-07, P-024), OG-05; poza zakresem: BR-SLO-001, BR-KAL-006. Testy tylko automatyczne (P-041, metody NFR po ER-10); kryteria intuicyjności, których nie zautomatyzuje (np. odczucie wibracji F-48, rysik F-28), jako ryzyko szczątkowe; kryterium bez sprawdzalnego wyniku: ER do roli 01.
- **08 Programista:** kolejność budowy jak wyżej; zmiany kodu z trybów fix to zadania dla 08.
- **02 Monetyzacja:** model V4 (P-057) przyjęty po kontrakcie zakresu; podział darmowe/Pro nie dotyczy (limit dni dla całej aplikacji).
- **01 Odkrywanie:** ER-25: systemowa prośba o ocenę po ukończeniu projektu (w limitach API) i odnośnik „Oceń” (`action=write-review`) jako pętla opinii wersji 1 (kontrakt roli 03, E2 pkt 6; specyfikacja roli 11).

## Zmiany zakresu
| ID | Data | Prośba (kto, skąd) | Bramka: praca i dowód · intuicyjność · koszt · co wypada | Decyzja (ID, słowa właściciela) |
|---|---|---|---|---|

## Definicja ukończenia (build), z dowodem
| Punkt kontraktu | Stan | Dowód |
|---|---|---|
| każde BR ma dokładnie jedną decyzję; `zakres.mjs --brd` kod 0 | spełnione | wynik skryptu wyżej: 80 BR, 0 błędów; kontrola negatywna kod 1 (`oczko-warsztat/03-zakres/2026-10-22-build/e2-zakres-wynik.txt`) |
| pętla opisana pracą J i listą funkcji; każda MVP służy pętli albo podłodze albo ma decyzję właściciela | spełnione | „Pętla główna”; skrypt nie zgłasza MVP poza pętlą bez podłogi i decyzji |
| każda MVP: BR, dowód B/R/W, klasa WTP z roli 02, kryterium intuicyjności z `wynik:`; WTP-X nie w MVP; H tylko jako TEST albo wyjątek właściciela | spełnione z wyjątkiem nazwanym | F-61 (cel dzienny, H): wyjątek P-043, ZAL-027; WTP nowych funkcji F-45–F-62 to ocena roli 03 („ocena 03”), do potwierdzenia przez 02; żadnej funkcji TEST (F-07 scalone z F-06, U-3) |
| każde NIE i PÓŹNIEJ: powód i „Powrót:” | spełnione | kolumna „Uzasadnienie”; skrypt |
| podłogi funkcji w zakresie nie wycięte ani uproszczone bez źródła | spełnione | kolumna „Podłoga”; wycięte tylko całe funkcje (F-30, F-41) z własną podłogą |
| R, I, C, koszt i apetyt jako [OCENA] z metodą albo dane z datą | spełnione | „Ranking” (metoda w nagłówku); koszty z soczewki opiekuna |
| właściciel wybrał wariant spośród co najmniej dwóch, apetyt i podział; słowa i data w rejestrze | spełnione | P-049 (W1 z W1–W3, apetyt 45 h, jedna aplikacja); P-040–P-046 |
| przekazanie mówi, co dostaje każda z ról 04–08 | spełnione | „Kolejność i przekazanie” |
| otwarte | — | ER-25 (rola 01 razem z ER-26–ER-28 roli 02); WTP nowych funkcji traci znaczenie dla podziału przy V4 (P-057) |
