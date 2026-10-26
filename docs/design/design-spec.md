# Oczko: system projektowy (kierunek A „Kreski na wzorze”)
Stan: E4 (przekazanie) · 2026-10-22 · Rola 04, build · Decyzje: P-061 (E0), P-062 (metafory), P-063 (kierunek A), P-064 (Libre Franklin), P-065 (E3: limit zawczasu, licznik dni, oferty, ikona, cofanie serii). Programista (08) używa wyłącznie tokenów i komponentów stąd; zmiany wyglądu tylko przez rolę 04.

## Pliki
| Co | Plik |
|---|---|
| Tokeny (moduł motywu, propozycja) | `tokeny.json` |
| Tabela kontrastu (44 pary, kod 0) | `kontrast-tabela.txt` (z `narzedzia/tokeny-kontrast.mjs` + `narzedzia/kontrast.mjs`) |
| Kluczowe ekrany (7 stanów) | `ekrany.html`; zrzuty wzorcowe 320/390/430 pt × jasny/ciemny × domyślny/AX5: `wzorce-zrzuty/` (84 pliki, linia bazowa SP-13) |
| Klikalny prototyp i przejście poznawcze | `prototyp.html`, scenorys `przejscie/` (`narzedzia/scenorys.mjs`) |
| Ikona | `ikona/` (warstwy SVG, `icon.png`, `ios-dark.png`, `watch.png`, `android-foreground.png`, `android-monochrome.png`, `splash-icon.png`, `arkusz.png`) |
| Kroje (OFL) | `fonty/LibreFranklin.ttf` + licencja; treść: krój systemowy |
| Historia kierunków | `01-swiat.md`, `kierunki/`, `porownanie.html`, `kroje.html` |

## Limit dni na ekranach (P-065, warunkowo do potwierdzenia przez 02)
- **Nowy dzień ponad limit (`limit-zawczasu`):** zamiast przycisków +1 i −1 komunikat „No free knitting days left in {month}. Counting is paused until {date}. Your {n} rows and everything else are kept.”; pod liczbą odnośnik „Oczko Pro removes the limit” (poza strefą +1). Historia, menu, wzór, eksport działają.
- **Przypadek brzegowy (`limit`):** nowy dzień zaczął się przy otwartej aplikacji (po przerwie ≥ 60 min, D3): stuknięcie zatrzymane, arkusz „Row {n} wasn’t added” z definicją dnia; potem ekran przechodzi w stan zawczasu.
- **Licznik darmowych dni:** lista projektów („3 of 5 free knitting days left in November”) i Ustawienia; na ekranie licznika tylko w ostatnim darmowym dniu cicha linia „1 free knitting day left in November” pod liczbą (wyjątek nazwany od P-046).
- Ekran ofert tylko z odnośnika na limicie i z Ustawień (KP-13); przy Pro żadnej z tych linii.

## Element firmowy
- **Kreski sesji:** rzędy dodane dziś w projekcie, w piątkach (piąta przekreśla cztery), grafitem na papierze; najwyżej 25 widocznych, liczba zawsze w podpisie nad kreskami („Tonight’s marks: 14 rows since 19:52”). Grafika `aria-hidden`; dane niesie podpis (soczewka VoiceOver, E2).
- **Zakreślenie instrukcji:** rząd z przypomnieniem (F-06) jako pas zakreślacza z krawędzią; treść instrukcji powtórzona w podpisie przycisku +1 i ogłaszana raz przy wejściu w ten rząd (nie przy każdym +1).
- **Linijka celu (z C):** „Goal 96 rows · 49 to go” pod liczbą, tylko gdy część ma cel (U-8).
- **Kolor włóczki (z B, wariant):** kropka przy nazwie projektu; nigdy jedyny nośnik informacji.

## Komponenty
| Komponent | Systemowy czy własny | Uwagi |
|---|---|---|
| Pasek nawigacji, wstecz, duży tytuł | systemowy | nad tytułem części nazwa projektu; pod tytułem „Now knitting row 48” (20 pt): duża liczba to rzędy skończone; stuknięcie w tytuł otwiera menu projektu |
| Przycisk +1: podpis | własny | „tap when row 48 is done” (soczewki: niejasne, czy +1 zaczyna, czy kończy rząd) |
| Przycisk +1 (strefa na dole, ≥ 168 pt wysokości) i −1 (72 × 72 pt, 28 pt odstępu) | własny kształt, zachowanie przycisku systemowego | etykieta zawiera widoczny tekst („+1 row …”, WCAG 2.5.3) |
| Kreski sesji, zakreślenie instrukcji | własne (SVG → `react-native-svg`) | opis tekstowy w podpisie |
| Blokada licznika | pozycja w menu ••• („Lock counter (ignore taps)”); w stanie zablokowanym pasek „Counter locked · Unlock” pod paskiem nawigacji | przeniesiona z paska: kłódka czytała się jak znak płatnej funkcji (przejście poznawcze, nowa osoba); stuknięcie w zablokowany licznik: „Counter is locked. Unlock it at the top.” (BR-LIC-004) |
| Baner strażnika „Added 3 rows in 1 s. Undo?” | własny, w układzie pod tytułem (z dala od +1, rośnie z tekstem) | F-47, RD-17; nie znika po czasie (WCAG 2.2.1), znika przy kolejnym zwykłym +1; po Undo potwierdzenie „Removed 3 rows. Back to 30.” |
| Arkusze (historia, menu •••, formularze, limit, oferty, ukończenie) | systemowe arkusze | przy dużym tekście sięgają pod pasek stanu, treść się przewija, przyciski zawsze widoczne |
| Listy (projekty, ustawienia) | systemowe listy grupowane | nagłówki sekcji zwykłą wielką literą na początku (nie wersalikami) |
| Symbole | SF Symbols, waga jak sąsiedni tekst | skalują się z tekstem |

## Słownik interakcji (domyślny studia, z decyzjami projektu)
| Termin | Kiedy |
|---|---|
| **+1 row / −1** | główne działanie; −1 to korekta, nie cofnięcie |
| **Undo** | baner strażnika i ostatnia zmiana w historii (BR-LIC-003) |
| **Save / Cancel** | formularze w arkuszach |
| **Mark as finished** | ukończenie (U-9), potem karta i pytanie o włóczkę |
| **Delete {object}** | z potwierdzeniem; trafia do „Recently deleted” na 30 dni (P-026, BR-DAN-008) |
| **Not now** | neutralna odmowa na komunikacie limitu |
Rutynowe usuwanie: potwierdzenie i „Recently deleted” 30 dni (P-026); cofnięcie serii stuknięć bez pytania (baner, P-065 (5a)).

## Macierz stanów kluczowych ekranów
| Ekran | Stany (wzorcowe zrzuty albo prototyp) |
|---|---|
| Licznik | pierwsze uruchomienie (`licznik-start`); typowy z instrukcją (`licznik-w-toku`); zablokowany (prototyp); seria stuknięć z banerem (prototyp, z2); na limicie (`limit`); błąd zapisu: „Couldn’t save that row. It’s still on screen; try again.” (do E4); offline: bez zmian (wszystko lokalne, NFR-OFF-001) |
| Projekty | typowy z sekcjami i uśpionymi (`projekty`); pusty: „No projects yet. Your first row starts one.” (prototyp); brak wyników: „No project called “…”.” |
| Oferty | typowy (`oferty`); aktywna subskrypcja: stan Pro + „Manage subscription” (KP-03, KP-14; do E4); brak sieci: ceny niedostępne, „Restore purchases” działa po powrocie sieci |
| Ukończenie | karta z pytaniem o włóczkę (`ukonczenie`, prototyp z5); bez włóczki w zapasie: pytanie pominięte |
| Okno „Uczciwe zasady” | raz nad dozwolonym ekranem (`uczciwe-zasady`); zamknięte dowolnie = widziane; przy Pro, stanie niepewnym albo na niedozwolonym ekranie: brak |

## VoiceOver: komunikaty i zachowanie (dla 08; z przejścia poznawczego E3)
| Chwila | Ogłoszenie (`announceForAccessibility`) | Zachowanie |
|---|---|---|
| +1 | „47 done. Now row 48.” | fokus zostaje na +1; Magic Tap (`onMagicTap`) = +1 |
| wejście w rząd z instrukcją | „Row 48: decrease at both ends, 7 of 8.” (raz, po +1, które w niego wprowadza) | etykieta +1 zawiera instrukcję |
| seria stuknięć (F-47) | „Added 3 rows in 1 second. Undo is available.” | przycisk „Undo 3 rows”; baner bez limitu czasu |
| limit (BR-ZAK-006) | „Row 48 wasn’t added. Free knitting days for November are used. Nothing is lost.” | arkusz jako modal (`accessibilityViewIsModal`), fokus na nagłówku |
| ukończenie | „Harbor Sweater moved to Finished.” | — |
| arkusze i formularze | — | fokus na nagłówku; każde pole z `accessibilityLabel` (nie sam tekst obok); podgląd planu rzędów dołączony do etykiety „Save reminder” |
| oferty | — | plany: `accessibilityRole="radio"` + `accessibilityState.selected`; Privacy Policy i Terms of Use: rola link |
| grafika | — | kreski i zakreślenie `accessibilityElementsHidden`; dane w podpisach |

## Głos
- Słowa dziergających: row, part, decrease, skein; nie „item”, „entry”, „session data”.
- Zdania zwykłe, strona czynna, bez wykrzykników i sprzedawania. Błąd: co się stało i co zrobić. Pusty ekran: jedno zaproszenie do działania.
- Zakazane: „Oops”, „Upgrade now”, „Unlock”, „free trial”, procenty i porównania cen (P-054), straszenie utratą danych.
- Teksty dziedzinowe (instrukcje, nazwy ściegów) pisze użytkownik; aplikacja ich nie uczy.

## Teksty ofert (P-065 (3a): wariant 1)
- Wariant 1 (w makiecie): nazwy planów „Monthly · $0.99 / month”, „Yearly · $6.99 / year”, „Lifetime · $14.99 once”; nagłówek „Oczko Pro”, „Knit on as many days as you like. Everything else stays the same.”; pod planami: „Without Pro: 5 knitting days every month, and all your projects and data, always.”
- Odrzucony wariant 2: podpisy właściciela przy planach (P-065).
- Ujawnienia (1)–(7) z `docs/monetyzacja.md` „Sesja 3, E3”: nazwa, okres, cena ze sklepu (KP-09); odnawianie i anulowanie w ustawieniach Apple ID; „Restore purchases”; Privacy Policy, Terms of Use; co daje Pro i co zostaje; zamknięcie i „Not now”; Family Sharing tylko, gdy włączone.

## Okno „Uczciwe zasady” (KP-16, P-103 (5a), P-109, P-126 (4); wzór Treningu)
- **Kiedy:** `oknoUczciweZasady()` = prawda (dzień bez Pro z ≥ 1 +1 minął, pewny stan darmowy, flaga „widziane” = fałsz). Pokazuje się raz, jako arkusz systemowy, nad pierwszym **dozwolonym** ekranem po otwarciu aplikacji: lista projektów, kalendarz i historia, Ustawienia, zapas, narzędzia. **Nigdy** nad licznikiem, nie nad wzorem (liczenie z oczami na wzorze, SP-17), ofertami, kartą ukończenia ani innym otwartym arkuszem; wtedy czeka do następnego dozwolonego ekranu.
- **Układ:** uchwyt, w nagłówku „Zamknij” (✕, prawy górny róg, słownik studia), nagłówek, trzy zdania, przycisk główny zamyka, przycisk tekstowy zamyka i otwiera ofertę (KP-13: wejście z Ustawień). Każde zamknięcie (✕, przycisk, gest w dół, tło) ustawia flagę „widziane” — jak Trening `markFairRulesSeen`. Bez cen, procentów i wykrzykników (P-054, Głos).
- **VoiceOver:** `accessibilityViewIsModal`, fokus na nagłówku; ✕ z etykietą „Close”.
- **Karta planów po imporcie: poza 1.0** (P-113 Q2a, P-117 Q1a) — w 1.0 nie ma tego ekranu ani miejsca na niego; wraca z F-29.

| Klucz | en (źródło, ADR-0017) |
|---|---|
| `uczciwe.tytul` | Your first knitting day is done |
| `uczciwe.wszystko` | Everything in Oczko works from the first day, with no account and no ads. |
| `uczciwe.darmowe_one` / `_other` | Knit {{count}} day every month for free, for as long as you like. Your projects and data always stay yours. / Knit {{count}} days every month for free, … |
| `uczciwe.pro` | Want more days? Oczko Pro removes the limit, as a subscription or a one-time purchase. |
| `uczciwe.dalej` | Keep knitting |
| `uczciwe.plany` | See Oczko Pro |
| `wspolne.zamknij` | Close |
`{{count}}` = `LIMIT_DNI_W_MIESIACU` z konfiguracji (dziś 5), nie wpisane na stałe.

## Ekrany wzoru a patenty (OG-07, P-024)
Reguła projektowa: w projekcie wyświetla się jeden dokument wzoru naraz (PDF, zdjęcie, strona, Word), w całości i bez zmian; aplikacja nie wycina ani nie łączy fragmentów kilku wzorów w jeden widok instrukcji. Znacznik rzędu, zakreślenia i notatki (F-26, F-28, F-56) to adnotacje na tym jednym dokumencie. Wtedy funkcje wzoru nie zawierają elementów „treść z kilku instrukcji” i „edycja i złożenie w jeden zestaw” z niezależnych zastrzeżeń 1, 9, 13 (tabela w `docs/brd/odkrywanie.md` OG-07, źródła S-10, S-32, odczyt 2026-10-21). Ocena projektu, nie opinia prawna; makieta wzoru poziomo (F-25) w E4 przechodzi tę tabelę ponownie.

## Ikona: wpisy konfiguracji (dla 08)
```json
{ "icon": "./assets/icon.png",
  "ios": { "icon": { "light": "./assets/icon.png", "dark": "./assets/ios-dark.png" } },
  "android": { "adaptiveIcon": { "foregroundImage": "./assets/android-foreground.png", "monochromeImage": "./assets/android-monochrome.png", "backgroundColor": "#FCFCFA" } },
  "plugins": [["expo-splash-screen", { "image": "./assets/splash-icon.png", "backgroundColor": "#FCFCFA", "dark": { "backgroundColor": "#1B1C1F" } }]] }
```
Zegarek: `ikona/watch.png` (1088 × 1088). Ikona warstwowa `.icon` (Liquid Glass) wymaga Icon Composer na macOS: warstwy `ikona/tlo.svg` i `ikona/pierwszy-plan*.svg` to paczka dla kroku właściciela; PNG działają bez `.icon`.

## Poza tym etapem (dla audytu roli 04 po roli 08 albo osobnej sesji)
Makiety nienarysowane w build: wzór i licznik poziomo (F-25, F-26, F-56; przed nimi tabela patentowa OG-07), zegarek (F-12), sesja na ekranie blokady (F-11, F-21), kalendarz i podsumowanie (F-59), Ustawienia (eksport, kopia, polityka, „Oceń”, „Zgłoś problem”), test długości tekstu po polsku i niemiecku (P-061 (2a)). System (tokeny, komponenty, głos) je obejmuje; rola 08 buduje je z tokenów, a rola 04 sprawdza je w audycie wobec tego dokumentu.

## Propozycja wpisu do pamięci portfolio (repo `prompts`, dopisuje właściciel)
| Aplikacja | Metafora / element firmowy | Paleta (rdzeń) | Kroje | Uwagi właściciela |
|---|---|---|---|---|
| Oczko („Kreski na wzorze”) | Wydruk wzoru z ołówkiem: kreski rzędów sesji w piątkach, zakreślacz na rzędzie z instrukcją, linijka celu; ikona: cztery kreski z przekreśleniem na pasie zakreślacza | papier `#FCFCFA`, grafit `#26282C`, ołówek HB `#5E626A`, zakreślacz `#F6E04A` (nocą `#38351F` z krawędzią `#E2CB3A`); kolor włóczki projektu tylko jako kropka | Libre Franklin (tytuły, liczba, przyciski), treść systemowa | 2026-10-22: „Zgodnie z rekomendacja” (kierunek A z linijką celu z C i kolorem włóczki z B); Libre Franklin wybrany zamiast rekomendowanego Archivo wąskiego; ikona zatwierdzona. Kreski + zakreślacz należą do Oczka. |
