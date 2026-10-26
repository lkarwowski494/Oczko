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
- **Kreski sesji:** rzędy dodane w projekcie w bieżącym posiedzeniu (definicja niżej, „Kreski sesji przez północ”), w piątkach (piąta przekreśla cztery), grafitem na papierze; najwyżej 25 widocznych, liczba zawsze w podpisie nad kreskami („Marks this session: 14 rows since 19:52”, klucz `licznik.znaczniki_sesji_other`). Grafika `aria-hidden`; dane niesie podpis (soczewka VoiceOver, E2).
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
| Licznik przez północ | posiedzenie trwa po północy, podpis z godziną startu (`licznik-przez-polnoc`) |
| Projekty | typowy z sekcjami i uśpionymi (`projekty`); pusty: „No projects yet. Your first row starts one.” (prototyp); brak wyników: „No project called “…”.” |
| Oferty | typowy (`oferty`); aktywna subskrypcja: stan Pro + „Manage subscription” (KP-03, KP-14; do E4); brak sieci: ceny niedostępne, „Restore purchases” działa po powrocie sieci |
| Ukończenie | karta z pytaniem o zużycie włóczki w motkach (`ukonczenie`, prototyp z5); zużycie ponad zapas: linia informacji, zapas 0 (`ukonczenie-ponad-zapas`); bez włóczki w projekcie: pytanie pominięte |
| Wzór: znacznik | pierwsze ustawienie z wyborem kierunku (`wzor-kierunek`); ustawiony (`wzor-znacznik`); koniec strony (`wzor-koniec-strony`); Word w podglądzie zastępczym: bez znacznika |
| Projekt roboczy | lista z etykietą z daty (`projekty-robocze`); licznik nienazwany z arkuszem nazwy (`projekt-nazwij`); pusta nazwa przy Save: zostaje nienazwany |
| Źródła wiedzy | typowy (`zrodla-wiedzy`); offline bez zmian (treść w aplikacji) |
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

## Ekran „Źródła wiedzy” (ZM-04, BR-KAL-008, P-108, P-112, P-126 (5))
- **Wejście:** wiersz w Ustawieniach (lista grupowana, sekcja z polityką prywatności i językiem) → ekran z dużym tytułem i przyciskiem wstecz; działa bez sieci.
- **Treść:** jedno ogólne zdanie (P-108 (4)) i linia źródła wymagana warunkami użycia organizacji standardów (P-112 (2)), w stylu podpisu (ołówek, 15 pt). Nic więcej: bez listy książek, autorów, producentów, adresów i cytatów (P-108 (1), (2)). Linia nie jest odnośnikiem.
- **Przy tabelach** opartych na tych standardach (kategorie grubości włóczki, rozmiary drutów i szydełek): ta sama linia pod tabelą, tym samym stylem; w tekstach obok tabeli żadnych innych nazw źródeł (BR-KAL-008 S3).
- Jedna opcja: BR-KAL-008 nakazuje osobny ekran i jego treść.

| Klucz | en |
|---|---|
| `ustawienia.zrodla_wiedzy` | About our information |
| `zrodla.zdanie` | The tables and tips in Oczko are written in our own words, based on industry standards and knitting handbooks. |
| `zrodla.linia_standardow` | dosłownie linia z BR-KAL-008, scenariusz „Ekran «Źródła wiedzy»” (S-24); w `docs/design/` tylko odsyłacz, bo każde nowe wystąpienie nazwy organizacji zatrzymuje `verify` (P-121 (5)). W przekładzie (09) zmienia się tylko słowo „Source:”, nazwa i adres zostają. |

## Projekt roboczy: etykieta zamiast nazwy (BR-LIC-001, P-126 (1b), jak Trening)
- **Dane:** pierwszy +1 bez projektu tworzy projekt **nienazwany** (flaga „nienazwany” w wierszu projektu: SQL dopisuje 05 fix-3 w `dane.md`, P-124/P-126; wdraża 08 w partii 3). Data `RRRR-MM-DD` w kolumnie nazwy nie jest pokazywana nigdzie w interfejsie; jeśli 05 nie przyjmie flagi, obowiązuje (1a): przy pierwszym +1 zapis tekstu `projekty.nazwa_robocza` w bieżącym języku.
- **Wyświetlanie:** etykieta liczona przy każdym renderze z chwili startu projektu, w bieżącym języku i formacie regionu (ADR-0017): na liście „Counter from Oct 26, 18:40”, w wyszukiwaniu ta sama etykieta. Godzina odróżnia dwa liczniki z jednego dnia. Rok tylko, gdy inny niż bieżący.
- **Ekran licznika projektu nienazwanego:** duży tytuł „Counter”, pod nim „Started Oct 26, 18:40 · Name it”; „Name it” otwiera arkusz nazwy. W menu ••• pierwsza pozycja „Name project”. Przed pierwszym +1 (brak projektu) ekran jak `licznik-start` — nic nie pyta o nazwę (NFR-PIE-001).
- **Arkusz nazwy:** Cancel / „Name project” / Save (słownik); pole z klawiaturą od razu; Save przy pustym polu zostawia projekt nienazwany (nic nie znika); po zapisie flaga gaśnie, licznik i historia bez zmian (BR-LIC-001 S3). VoiceOver: pole z etykietą „Project name”, obrys `drugiPrzyciskObrys` (≥ 3:1 do arkusza w obu motywach).

| Klucz | en |
|---|---|
| `projekty.nazwa_robocza` | Counter from {{data}} (`{{data}}` = data i godzina startu, krótki format regionu) |
| `projekt.nazwij` | Name it |
| `licznik.tytul_roboczy` | Counter |
| `licznik.start_roboczy` | Started {{data}} |
| `projekt.menu_nazwij` | Name project |
| `projekt.nazwa_tytul` | Name project |
| `projekt.nazwa_pole` | Project name |
| `projekt.nazwa_zostaje` | The {{count}} rows and their history stay with this project. (`_one` / `_other`) |

## Zużycie włóczki przy ukończeniu (BR-ZAP-002, U-9, P-126 (2a))
- **Pytanie:** po „Mark as finished” karta ukończenia ma grupę „Yarn used”: każda włóczka przypisana do projektu jako wiersz z nazwą, podpisem „{n} skeins in your stash” i krokowcem − [pole] + (obrysy `drugiPrzyciskObrys`, ≥ 3:1; krok 0,5 motka; pole przyjmuje wpis liczby wg P-097 (5a)). Zapis do `projekt_wloczka.zuzyto_motki` (schemat), nie „ile zostało”. Brak włóczki w projekcie: grupy nie ma.
- **Zużycie ponad zapas (2a):** wartość większa niż zapas jest przyjmowana; pod grupą jedna linia informacji (ikona „i” + tekst, nie kolor błędu, bo nic nie jest źle): „That’s more than the 2 skeins in your stash. Your stash will show 0.” z odnośnikiem „Edit stash” (otwiera tę włóczkę w zapasie; karta zostaje). „Done” działa zawsze; zapas po zapisie = max(0, zapas − zużycie) — domena (zapas nie schodzi poniżej 0). Zapas już 0: linia „Your stash already shows 0 for this yarn.”
- **VoiceOver:** pole jako `adjustable` z etykietą „Skeins of {yarn} used” (akcje zwiększ/zmniejsz = krokowiec); linia informacji ogłaszana raz, gdy się pojawi (`role=status`).

| Klucz | en |
|---|---|
| `ukonczenie.wloczka_naglowek` | Yarn used |
| `ukonczenie.w_zapasie_one` / `_other` | {{count}} skein in your stash / {{count}} skeins in your stash |
| `ukonczenie.zuzycie_etykieta` | Skeins of {{nazwa}} used |
| `ukonczenie.zuzycie_mniej` / `ukonczenie.zuzycie_wiecej` | One skein less / One skein more (etykiety krokowca; krok 0,5: „Half a skein less/more” `[DO USTALENIA]` z 09) |
| `ukonczenie.zuzycie_ponad_zapas_one` / `ukonczenie.zuzycie_ponad_zapas_other` | That’s more than the {{count}} skein in your stash. Your stash will show 0. / That’s more than the {{count}} skeins in your stash. Your stash will show 0. |
| `ukonczenie.zapas_juz_zero` | Your stash already shows 0 for this yarn. |
| `ukonczenie.edytuj_zapas` | Edit stash |

## Znacznik rzędu na wzorze (BR-WZR-003, ADR-0011 uzupełnienie, P-118 Q2a, P-126 (3a))
Znacznik to „linijka” na jednym dokumencie wzoru (reguła OG-07 bez zmian): pas o wysokości rzędu z dwiema grafitowymi krawędziami (`kolor.wzor.znacznik`, 14,76:1 do strony) i etykietą „Row 48 ↑” (biały tekst na grafitowej zakładce, 14,37:1). Stałe kolory w obu motywach, bo strona to dokument użytkownika. Nie zakreślacz: żółty zostaje dla rzędu z instrukcją na liczniku (jeden kolor, jedno znaczenie).
- **Ustawienie (gest i przycisk):** przytrzymanie na stronie stawia pas w tym miejscu; przycisk „Mark row” w pasku nawigacji stawia go na środku widocznej strony (alternatywa gestu, SP-15). Pas przeciąga się w pionie; uchwyt dolnej krawędzi ustala wysokość rzędu (`wysokosc_rzedu`). Rząd znacznika: krokowiec w pasku, domyślnie rząd z „Now knitting row n” (= licznik + 1; potwierdzenie w BR-WZR-003: N3 → 01).
- **Kierunek (3a): bez wartości domyślnej.** Przy pierwszym ustawieniu w danym wzorze pasek pyta „Which way do rows go on this page?” dwoma przyciskami „↑ Up, like a chart” (`kierunek = −1`) i „↓ Down, like written steps” (`1`); „Done” pojawia się po wyborze. Wybór zapisany w znaczniku i proponowany przy każdym następnym ustawieniu w tym wzorze; zmiana: „Change” w pasku. Strzałka w etykiecie pokazuje kierunek.
- **Przy liczeniu:** pasek ustawień chowa się po „Done”; +1 przesuwa pas o rząd w wybranym kierunku (`polozenieZnacznika`), ruch tylko gdy nie ma „Ogranicz ruch” (inaczej skok).
- **Koniec strony (`pozaStrona: true`):** pas stoi na krawędzi, krawędź od strony wyjścia przerywana, etykieta „Row 61 · page end”; pasek: „Row 61 is past the top of page 2” (albo „bottom”), „Move the marker to row 61 on the next page.”, przycisk „Place on page 3” przewija do następnej strony i stawia pas przy krawędzi, od której zaczyna się kierunek (dół dla ↑, góra dla ↓), w trybie przeciągania; użytkownik dosuwa go do rzędu. Ostatnia strona: „Row 61 is past the end of the pattern.” i przycisk „Move marker”. Żadnego automatycznego przejścia (P-118 Q2c).
- **VoiceOver:** pas jako element `adjustable` z etykietą „Row marker, row 48, rows go up”; akcje zwiększ/zmniejsz przesuwają o rząd, akcja „Move to next page” przy końcu strony; zmiana stanu końca strony ogłaszana raz.
- Word w podglądzie zastępczym (`QLPreviewController`, P-071): bez znacznika — przycisk „Mark row” ukryty.

| Klucz | en |
|---|---|
| `wzor.zaznacz_rzad` | Mark row |
| `wzor.kierunek_pytanie` | Which way do rows go on this page? |
| `wzor.kierunek_gora` / `wzor.kierunek_gora_opis` | Up / like a chart |
| `wzor.kierunek_dol` / `wzor.kierunek_dol_opis` | Down / like written steps |
| `wzor.kierunek_stan_gora` / `wzor.kierunek_stan_dol` | Rows go up, like a chart / Rows go down, like written steps |
| `wzor.kierunek_zmien` | Change |
| `wzor.rzad_znacznika` | Marker row |
| `wzor.etykieta` | Row {{n}} (strzałka ↑/↓ dokładana jako symbol, nie tekst) |
| `wzor.etykieta_koniec` | Row {{n}} · page end |
| `wzor.gotowe` | Done |
| `wzor.koniec_strony_gora` / `wzor.koniec_strony_dol` | Row {{n}} is past the top of page {{strona}} / Row {{n}} is past the bottom of page {{strona}} |
| `wzor.koniec_strony_opis` | Move the marker to row {{n}} on the next page. |
| `wzor.poloz_na_stronie` | Place on page {{strona}} |
| `wzor.koniec_wzoru` / `wzor.przestaw` | Row {{n}} is past the end of the pattern. / Move marker |
| `wzor.znacznik_a11y_gora` / `wzor.znacznik_a11y_dol` | Row marker, row {{n}}, rows go up / Row marker, row {{n}}, rows go down |
| `wzor.nastepna_strona_a11y` | Move to next page |

## Kreski sesji przez północ (NZ-06, P-097 (4a), P-126 (6a), N2)
- **Posiedzenie** (dla kresek i podpisu): zaczyna je pierwsze +1 w projekcie po przerwie ≥ `PRZERWA_NOWEGO_DNIA_MS` (60 min) bez +1 w tym projekcie albo start stopera sesji (wtedy posiedzenie = sesja stopera); kończy je taka przerwa albo zatrzymanie stopera. **Północ go nie przerywa:** o 00:20 kreski i podpis „since 22:10” zostają — jak sesja stopera liczona do dnia startu (P-097 (4a)).
- Kalendarz, cel dzienny i limit liczą bez zmian po swojemu: rząd po północy należy do nowego dnia (BR-DNI-002, BR-DNI-005); kreski to widok posiedzenia, nie statystyka dnia, więc na ekranie licznika nie pokazujemy daty przy kreskach.
- **N2:** podpis neutralny wobec pory dnia (zamiast „wieczornych” znaczników): „Marks this session: {{count}} rows since {{godzina}}”. −1 zdejmuje ostatnią kreskę; po przerwie ≥ 60 min nowe posiedzenie zaczyna się od pustych kresek przy następnym +1 (do tego czasu widać kreski poprzedniego).
- Odczyt w danych: rzędy posiedzenia = zdarzenia +1/−1 projektu od początku posiedzenia; nic nowego nie trzeba zapisywać (liczone z `zdarzenie` i sesji stopera).

| Klucz | en |
|---|---|
| `licznik.znaczniki_sesji_one` / `licznik.znaczniki_sesji_other` | Marks this session: {{count}} row since {{godzina}} / Marks this session: {{count}} rows since {{godzina}} |

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
