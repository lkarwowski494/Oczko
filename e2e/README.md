# Scenariusze E2E wersji 1 (Maestro) — kontrakt dla roli 08

Stan: rola 07, E3 (testy akceptacyjne przed kodem), 2026-10-25. Scenariusze **nie biegły** na symulatorze (brak aplikacji, Maestro i macOS w kontenerze). Czerwień i pierwsze poprawki pokaże pierwszy przebieg `jakosc-ios.yml` na macOS (pierwszy przebieg informacyjny, strategia §5). Stary katalog `.maestro/` należy do wersji 0.1.0 i nie jest częścią tego zestawu.

- Scenariusze: `e2e/scenariusze/NN-<id-kryterium>-<opis>.yaml`, podprzepływy `e2e/scenariusze/subflows/`, lista dla przebiegu lokalnego `e2e/scenariusze/config.yaml`.
- Podział na części (LPT, wagi): `scripts/ci/e2e-czesci.mjs` + `e2e/czesci.json`; test `tests/jakosc/e2e-czesci.test.ts`.
- Interpreter i kontrola statyczna: `tests/jakosc/maestro-runner.ts`, test `tests/jakosc/maestro-scenariusze.test.ts` (główny zestaw).
- appId: `com.apps4brew.knitting` (`app.json` → `ios.bundleIdentifier`). Język symulatora: angielski (en-US) — teksty z `docs/design/design-spec.md`.

## Zasady pisania (pilnuje `tests/jakosc/maestro-scenariusze.test.ts`)
1. `name:` zaczyna się od ID kryterium (`docs/jakosc/e0/kryteria.json` albo decyzji), tag z tym ID (ukośnik → myślnik: `BR-LIC-001/S1` → `BR-LIC-001-S1`), numer i ID w nazwie pliku.
2. Selektory po stałym `id:` (testID z tabeli niżej) albo po etykiecie VoiceOver z `design-spec.md`. Każde `id` ma wiersz w tabeli. `id` to wyrażenie regularne Maestro — tylko `[a-z0-9-]`, alternatywa `a|b` dozwolona.
3. Po każdej akcji zmieniającej stan (`launchApp`, `stopApp`, `tapOn`, `inputText`, `eraseText`, `pressKey`, `swipe`, `setOrientation`…) asercja (`assertVisible`, `assertNotVisible`, `extendedWaitUntil`, `assertTrue`). Wyjątki — łańcuchy: fokus pola → `eraseText` → `inputText` (znak po znaku) → asercja wartości pola; `stopApp` → `launchApp`; `pressKey: Home` → `launchApp: { stopApp: false }`.
4. Po stuknięciu zmieniającym licznik (`licznik-plus`, `licznik-minus`, `baner-serii-cofnij`, „+1 row…”, „−1 row”, „Undo N rows”) pierwsza asercja to `assertVisible: { id: "licznik-wartosc", text: "<wartość>" }`. Takie stuknięcie nigdy w bloku `retry`.
5. Scenariusz z asercją wartości licznika (także przez podprzepływ) ma tag **`stan-licznika`** — nie jest ponawiany (P-091 9a); status „w ponowieniu” liczy się osobno tylko dla pozostałych.
6. Klawiatura symulatora (Trening `.maestro/04-plank-stoper.yaml:13-29`, `32:79-96`, docs/38:112, L-013): wpis w `retry` (`tapOn` pola → `waitForAnimationToEnd` → `eraseText` → `inputText` po jednym znaku → `assertVisible` wartości pola); pole tekstowe chowa klawiaturę `pressKey: Enter`; **`hideKeyboard` zakazany** na polach z kolumną „liczbowa” — zapis przyciskiem arkusza (`formularz-zapisz`), pole tekstowe ostatnie w formularzu.
7. Zwykłe kolejne +1 rozdziela `runFlow: subflows/odstep.yaml` (> 2 s): okno strażnika serii RD-17 to 3 dodania w 2 s; seria celowo: `tapOn: { id: "licznik-plus", repeat: 3, delay: 150 }`.
8. `takeScreenshot` w punktach kontrolnych (nazwa `NN-opis`); zrzuty idą do artefaktu części i do logu (Trening: base64 przy porażce).

## Tagi
| Tag | Znaczenie |
|---|---|
| `podstawowy` | pakiet bramki TestFlight (P-091 9a): pierwsze +1 świeżej instalacji offline (01–03), +1/−1/cofnij (04), limit zawczasu (05), zakup i przywrócenie na sztucznym sklepie (06), okno „Uczciwe zasady” (07), eksport/import (08), start awaryjny ADR-0019 (09) |
| `podstawowy` w pakiecie pełnym | porażka scenariusza z tagiem `podstawowy` czerwieni zadanie także przy `[e2e-pelny]`; porażka pozostałych to „czerwony-informacyjnie” w podsumowaniu (wyjście `bramka` planu części; F07-15, P-198 Q1a) |
| `stan-licznika` | asercja wartości licznika — bez ponowień (P-091 9a) |
| `osobny-krok` | workflow uruchamia scenariusz w osobnym kroku swojej części (30: rozmiar tekstu AX5 przez `simctl ui … content_size`) |
| `wzor`, `zegarek`, `pomiar` | grupy informacyjne (filtr `--include-tags`); `pomiar` = wynik informacyjny bez progu (OP-17) |
| ID kryterium | np. `NFR-PIE-001`, `BR-LIC-001-S1`, `P-089-3a`, `ADR-0019` |

## Build E2E (dla 08 i workflowu `jakosc-ios.yml`)
Build Release na symulator bez podpisu (`CODE_SIGNING_ALLOWED=NO`, DS-07). Przełączniki ustawiane **tylko** w kroku buildu E2E (kontrola repo: poza tym krokiem nie występują; `sprawdz-ipa.mjs`: brak w buildzie wydania):
| Zmienna buildu | Co włącza |
|---|---|
| `EXPO_PUBLIC_E2E=1` | odczyt argumentów startu `oczkoE2e*` (niżej), panele `e2e-*` (bez `t()`, jak „Test store” Treningu `app/paywall.tsx:108-113`), plik `e2e-sha-bazy` w Ustawieniach i na ekranie awaryjnym |
| `EXPO_PUBLIC_STORE_FAKE=1` | sztuczny sklep (wzór Treningu `lib/store-fake.ts`): ceny testowe, zakup bez okna Apple, `e2e-sklep-wygas`; transakcje zapisane w pliku buildu E2E, żeby przeżyły restart [DO USTALENIA 08: Trening trzyma je w pamięci] |
| `EXPO_PUBLIC_WATCH_FAKE=1` | udawany zegarek: `Zegarek.wyslijStan` zapisuje stan do panelu `e2e-zegarek-stan` (transferUserInfo nie działa w symulatorze, ADR-0009) |
Przełączniki czyta wyłącznie `src/platforma/tryb-e2e.ts` (E2E, zegarek) i adapter sklepu `src/platforma/sklep*.ts` (sztuczny sklep); kontrole `TRYB-E2E` i `SZTUCZNY-SKLEP` w `scripts/jakosc/kontrole-repo.mjs`, a workflow wydania nie może ich ustawiać (`sprawdz-workflowy.mjs`).

Argumenty startu (`launchApp: arguments:`; na iOS Maestro przekazuje je jako argumenty procesu — w RN czytelne przez `Settings.get(klucz)` z domeny argumentów `NSUserDefaults` [DO USTALENIA: potwierdzić w pierwszym przebiegu]); bez `EXPO_PUBLIC_E2E=1` ignorowane:
| Argument | Wartość | Kontrakt |
|---|---|---|
| `oczkoE2eTeraz` | czas lokalny ISO bez strefy, np. `2026-11-07T20:00:00` | port `Zegar` (Z07-18): `teraz()` = podana chwila + czas, który upłynął od startu procesu (zegar **biegnie**: RD-17 liczy odstępy); `strefa` = strefa symulatora; `dzien` z podanej daty |
| `oczkoE2eSiec` | `brak` | adapter sieci zwraca „brak połączenia”, każde wywołanie sieci = błąd w logu (NFR-OFF-001) |
| `oczkoE2eAwariaStartu` | `przed-kamieniem` | wymuszona awaria procesu przed kamieniem milowym ADR-0019 (start liczony jako nieudany); po zapisie stanu startu pusty ekran z `testID` `e2e-awaria-startu` |

## testID (propozycja 07 dla 08; zmiana nazwy = zmiana scenariuszy)
Wiersze `projekt-*`, `kosz-*`, `co-dalej-*`, `projekty-kosz`, `projekty-ostatnia-praca`, `licznik-nastepna-czesc`, `menu-znaczenie` i `formularz-*` arkuszy projektu dopisała rola 08 w partii 5 według propozycji 04 fix-5 („Dla 08”, P-183) — do przeglądu 07. Potwierdzenia usuwania to alerty systemowe (bez testID; scenariusz stuka w tekst przycisku).

Kolumna „tekst / etykieta”: tekst albo etykieta VoiceOver z `design-spec.md`; „—” = tekst ustala 04 (Z07-05), scenariusz używa tylko id. Kolumna ostatnia: klawiatura pola (`liczbowa`, `tekstowa`) albo puste.

| id | ekran | element | tekst / etykieta | klawiatura |
|---|---|---|---|---|
| `licznik-plus` | licznik | przycisk +1 (strefa ≥ 168 pt) | „+1 row…”, z instrukcją: „+1 row, when row 12 is done. Row 12: decrease at both ends” | |
| `licznik-minus` | licznik | przycisk −1 (72 × 72 pt) | „−1 row” | |
| `licznik-wartosc` | licznik | duża liczba rzędów skończonych (sam numer, z separatorem tysięcy regionu) | „47” | |
| `licznik-teraz-rzad` | licznik | podpis pod tytułem | „Now knitting row 48” | |
| `licznik-projekt` | licznik | nazwa projektu nad tytułem części | nazwa użytkownika | |
| `licznik-menu` | licznik | menu ••• | „Project options: name, goal, reminder, lock, finish” | |
| `licznik-historia` | licznik | przycisk historii | „History” | |
| `kreski-podpis` | licznik | podpis nad kreskami sesji | „Marks this session: 14 rows since 19:52” (godzina w formacie regionu; P-176) | |
| `baner-serii` | licznik | baner strażnika RD-17 | „Added 3 rows in 1 s. Undo?” | |
| `baner-serii-cofnij` | licznik | przycisk w banerze | „Undo 3 rows” | |
| `pasek-blokady-odblokuj` | licznik | „Unlock” w pasku „Counter locked · Unlock” | „Unlock” | |
| `blad-zapisu` | licznik | komunikat błędu zapisu | „Couldn’t save that row. It’s still on screen; try again.” | |
| `blad-sieci` | dowolny | jakikolwiek komunikat o braku sieci (nie powinien istnieć) | — | |
| `limit-zawczasu` | licznik | komunikat zamiast +1/−1 | „No free knitting days left in {month}. Counting is paused until {date}. Your {n} rows and everything else are kept.” | |
| `limit-oferta-link` | licznik | odnośnik pod liczbą | „Oczko Pro removes the limit” | |
| `arkusz-zamknij` | arkusze (historia, menu) | przycisk zamknięcia arkusza | „Close” | |
| `historia-lista` | historia | lista zmian z godziną | — | |
| `historia-cofnij-ostatnia` | historia | „Undo” przy ostatniej zmianie (P-091 3a) | „Undo” | |
| `menu-nazwa` | menu ••• | pozycja | „Name project and part” | |
| `menu-cel` | menu ••• | pozycja (nieużywana jeszcze w scenariuszach) | „Set a goal for this part” | |
| `menu-wpisz-wartosc` | menu ••• | pozycja wpisania wartości (F-45) | — | |
| `menu-przypomnienie` | menu ••• | pozycja | „Add a reminder (“every N rows”)” | |
| `menu-wzor` | menu ••• | wzór projektu | — | |
| `menu-zdjecia` | menu ••• | zdjęcia projektu | — | |
| `menu-sesja` | menu ••• | start stopera sesji (F-21) | — | |
| `menu-ukoncz` | menu ••• | ukończenie | „Mark project as finished” | |
| `formularz-nazwa-projektu` | formularz nazwy | pole nazwy | etykieta „Project” | tekstowa |
| `formularz-zapisz` | formularze w arkuszach | przycisk zapisu (zawsze widoczny) | „Save” | |
| `wpisz-wartosc-pole` | wpisanie wartości | pole numeru rzędu | „Rows already finished” | liczbowa |
| `przypomnienie-od-rzedu` | przypomnienie | pole | „Starting on row” | liczbowa |
| `przypomnienie-co-ile` | przypomnienie | pole | „Every … rows” | liczbowa |
| `przypomnienie-ile-razy` | przypomnienie | pole | „How many times” | liczbowa |
| `przypomnienie-co-robic` | przypomnienie | pole (ostatnie w formularzu) | „What to do” | tekstowa |
| `przypomnienie-podglad` | przypomnienie | podgląd planu rzędów | „You’ll be reminded on rows: …” | |
| `przypomnienie-zapisz` | przypomnienie | przycisk | „Save reminder” | |
| `sesja-trwa` | licznik | wskaźnik trwającej sesji | — | |
| `sesja-zakoncz` | licznik | zakończenie sesji | — | |
| `ukonczenie-potwierdz` | ukończenie | potwierdzenie | „Mark as finished” | |
| `ukonczenie-karta` | ukończenie | karta z pytaniem o włóczkę (U-9) | — | |
| `ukonczenie-gotowe` | ukończenie | „Done” | „Done” | |
| `nav-projekty` | licznik | powrót do listy projektów | „Projects” | |
| `nav-ustawienia` | lista projektów | wejście do Ustawień | — | |
| `nav-zapas` | lista projektów | wejście do zapasu | — | |
| `nav-wstecz` | ekrany wtórne | systemowy „Back” | „Back” | |
| `projekty-lista` | lista projektów | lista | „Projects” | |
| `projekty-wiersz` | lista projektów | wiersz projektu (powtarzalny, `index`) | nazwa · część · rząd | |
| `projekty-nowy` | lista projektów | nowy projekt | „New project” | |
| `projekty-dni-darmowe` | lista projektów | licznik dni (tylko bez Pro) | „3 of 5 free knitting days left in November” | |
| `projekty-ostatnia-praca` | lista projektów | etykieta ostatniej pracy w wierszu projektu w toku (powtarzalna; bez progu, P-182, P-183 (1a) — zastępuje `projekty-uspione`) | „last worked 41 days ago” | |
| `projekty-kosz` | lista projektów | wejście do „Recently deleted” (tylko gdy kosz niepusty, P-183 (2a)) | „Recently deleted” | |
| `projekty-ukonczone` | lista projektów | sekcja ukończonych | „Finished” | |
| `projekt-dodaj` | ekran projektu | „+”: Add part / Add counter | — | |
| `projekt-dodaj-czesc` | ekran projektu (menu „+”) | Add part | „Add part” | |
| `projekt-dodaj-licznik` | ekran projektu (menu „+”) | Add counter | „Add counter” | |
| `projekt-menu` | ekran projektu | menu ••• | — | |
| `projekt-edytuj` | ekran projektu (menu •••) | tryb Edit części i liczników | „Edit parts and counters” | |
| `projekt-gotowe` | ekran projektu (tryb Edit) | koniec trybu Edit | „Done” | |
| `projekt-usun-czesc` | ekran projektu (tryb Edit) | ⊖ przy części (powtarzalny) | — | |
| `projekt-usun-licznik` | ekran projektu (tryb Edit) | ⊖ przy liczniku (powtarzalny) | — | |
| `projekt-zrob-taka-sama` | ekran projektu (menu •••) | Make another like this | „Make another like this” | |
| `projekt-usun` | ekran projektu (menu •••) | Delete project… | „Delete project…” | |
| `projekt-wznow` | ekran projektu (menu •••, ukończony) | Resume knitting | „Resume knitting” | |
| `projekt-linia-terminu` | ekran projektu | linia terminu (tylko z terminem) | „Done by Oct 31 · today 3 of 10 rows” | |
| `projekt-notatka` | ekran projektu | notatka (otwiera arkusz) | tekst notatki albo „Add a note” | |
| `projekt-narzedzie` | ekran projektu | druty albo szydełko (otwiera arkusz) | „4 mm (US 6)” | |
| `projekt-termin` | ekran projektu | termin „Done by” (otwiera arkusz) | krótka data albo „None” | |
| `licznik-nastepna-czesc` | licznik | „Next part” przy osiągniętym celu (BR-LIC-011/S1) | „Next part” | |
| `co-dalej-druga` | arkusz „What’s next?” | druga część pary | „A second {część}” | |
| `co-dalej-nowa` | arkusz „What’s next?” | nowa część | „New part” | |
| `kosz-lista` | Recently deleted | lista pozycji kosza | — | |
| `kosz-przywroc` | Recently deleted | „Restore” (powtarzalny) | „Restore” | |
| `formularz-nazwa-czesci` | arkusz części / nowego projektu | nazwa części (08 partia 5) | „Part” | tekstowa |
| `formularz-cel-czesci` | arkusz części | cel części (08 partia 5) | „Rows in this part (optional)” | liczbowa |
| `formularz-dodaj-czesc` | arkusz nowego projektu | dodanie pola części | „Add part” | |
| `formularz-nazwa-licznika` | arkusz licznika | nazwa licznika (08 partia 5) | „Name” | tekstowa |
| `formularz-notatka` | arkusz notatki | pole notatki, wielowierszowe (08 partia 5) | „Note for {projekt}” | tekstowa |
| `formularz-rozmiar-mm` | arkusz narzędzia | rozmiar w mm, dziesiętna (08 partia 5) | „Size in mm” | liczbowa |
| `formularz-wyczysc` | arkusz narzędzia | Clear | „Clear” | |
| `formularz-termin-data` | arkusz terminu | systemowy wybór daty (inline) | — | |
| `formularz-termin-brak` | arkusz terminu | No date | „No date” | |
| `menu-znaczenie` | menu ••• licznika | What the number shows (F-09) | „What the number shows” | |
| `ustawienia-dni-darmowe` | Ustawienia | licznik dni (tylko bez Pro) | „4 of 5 free knitting days left in November” | |
| `ustawienia-oczko-pro` | Ustawienia | wejście do ofert (KP-13) | „Oczko Pro” | |
| `ustawienia-eksport` | Ustawienia | eksport wszystkich danych | — | |
| `ustawienia-import` | Ustawienia | import archiwum | — | |
| `ustawienia-usun-wszystko` | Ustawienia | usunięcie wszystkich danych (BR-DAN-009) | — | |
| `potwierdz-usun-wszystko` | Ustawienia | potwierdzenie usunięcia | — | |
| `oferty-ekran` | oferty | kontener ekranu ofert | nagłówek „Oczko Pro” | |
| `oferty-plan-miesieczny` | oferty | plan (rola radio) | „Monthly · $0.99 / month” (cena ze sklepu) | |
| `oferty-plan-roczny` | oferty | plan (rola radio) | „Yearly · $6.99 / year” | |
| `oferty-plan-dozywotni` | oferty | plan (rola radio) | „Lifetime · $14.99 once” | |
| `oferty-kup` | oferty | zakup wybranego planu | — | |
| `oferty-przywroc` | oferty | przywrócenie zakupów | „Restore purchases” | |
| `oferty-nie-teraz` | oferty | neutralna odmowa | „Not now” | |
| `oferty-zamknij` | oferty | zamknięcie po zakupie | „Close” | |
| `oferty-stan-pro` | oferty | stan „masz Pro” (KP-03) | — | |
| `okno-uczciwe-zasady` | okno „Uczciwe zasady” (P-089 3a) | kontener okna | — (04, Z07-05) | |
| `uczciwe-zasady-zamknij` | okno „Uczciwe zasady” | główny przycisk (zamyka) | — | |
| `uczciwe-zasady-plany-pro` | okno „Uczciwe zasady” | link do planów Pro | — | |
| `eksport-wynik` | eksport | wynik eksportu | — | |
| `eksport-licznosci` | eksport | liczności archiwum | „1 project, 1 counter, 2 changes…” (propozycja) | |
| `import-gotowy` | import | stan „gotowy” maszyny importu | — | |
| `import-licznosci` | import | liczności pliku przed decyzją | jak `eksport-licznosci` | |
| `import-scal` | import | wybór „scal” (P-091 6a) | — | |
| `import-wynik` | import | wynik (`… 0 new …` przy powtórnym imporcie) | — | |
| `karta-pro-po-imporcie` | import | karta z planami Pro — w 1.0 nie występuje; scenariusz 08 sprawdza jej brak po imporcie własnej kopii (P-113 Q2a, P-117 Q1a) | — | |
| `tryb-awaryjny` | ekran awaryjny (ADR-0019) | kontener | — (04, 09) | |
| `awaryjny-zapisz-kopie` | ekran awaryjny | „Zapisz kopię danych” | — | |
| `awaryjny-sprobuj-normalnie` | ekran awaryjny | „Spróbuj normalnie” | — | |
| `awaryjny-zglos-problem` | ekran awaryjny | „Zgłoś problem” (F-57) | — | |
| `awaryjny-licznosci` | ekran awaryjny | liczności zapisanej kopii | jak `eksport-licznosci` | |
| `zapas-lista` | zapas | lista włóczek | — | |
| `zapas-dodaj` | zapas | dodanie włóczki | — | |
| `zapas-nazwa` | formularz włóczki | pole nazwy | — | tekstowa |
| `zapas-szukaj` | zapas | wyszukiwarka | — | tekstowa |
| `zapas-wynik` | zapas | wiersz wyniku | nazwa włóczki | |
| `zapas-brak-wynikow` | zapas | pusty wynik | — | |
| `zdjecia-dodaj` | zdjęcia projektu | dodanie zdjęcia | — | |
| `zdjecia-miniatura` | zdjęcia projektu | miniatura | — | |
| `zdjecia-licznik` | zdjęcia projektu | liczba zdjęć | „1 photo” | |
| `wzor-dodaj` | wzór | dodanie wzoru | — | |
| `wzor-widok` | wzór | widok dokumentu (jeden naraz, OG-07) | — | |
| `wzor-zrodlo` | wzór | rodzaj źródła | „PDF”, „Photo”, „Web page”, „Word document” | |
| `wzor-strona` | wzór | numer strony | „Page 1 of 3” | |
| `wzor-zakreslacz` | wzór | przełącznik zakreślacza (`accessibilityState.selected`) | — | |
| `wzor-zakreslenia` | wzór | liczba zakreśleń | „1 highlight”, „0 highlights” | |
| `wprowadzenie` | — | ekran wprowadzenia (NIE może istnieć przed pierwszym +1) | — | |
| `e2e-nigdy` | — | element, którego nie ma (podprzepływ `odstep.yaml`) | — | |
| `e2e-sklep-wygas` | oferty (build E2E) | „Test store: expire access” | bez `t()` | |
| `e2e-sha-bazy` | Ustawienia i ekran awaryjny (build E2E) | SHA-256 pliku bazy (64 znaki hex) | bez `t()` | |
| `e2e-awaria-startu` | pusty ekran wymuszonej awarii startu (build E2E, `oczkoE2eAwariaStartu`) | tło papieru po zapisie „start w toku” (ADR-0019) | bez tekstu | |
| `e2e-pliki-zachowaj-eksport` | Ustawienia (build E2E) | zachowanie ostatniego eksportu w katalogu testowym | bez `t()` | |
| `e2e-pliki-stan` | Ustawienia (build E2E) | „Saved: N file” | bez `t()` | |
| `e2e-pliki-importuj-ostatni` | Ustawienia (build E2E) | import ostatniego eksportu bez okna Pliki | bez `t()` | |
| `e2e-zegarek-stan` | licznik (build E2E, `EXPO_PUBLIC_WATCH_FAKE`) | ostatni `StanZegarka` jako tekst | bez `t()` | |
| `e2e-pomiar-plus` | licznik (build E2E) | „p95 … ms, n = 20” (NFR-WYD-001) | bez `t()` | |
| `e2e-wzor-pdf` | dodanie wzoru (build E2E) | plik PDF testowy (strategia §4) | bez `t()` | |
| `e2e-wzor-zdjecie` | dodanie wzoru (build E2E) | zdjęcie strony testowe | bez `t()` | |
| `e2e-wzor-www` | dodanie wzoru (build E2E) | zapisana strona testowa | bez `t()` | |
| `e2e-wzor-word` | dodanie wzoru (build E2E) | plik .docx testowy | bez `t()` | |
| `e2e-zdjecie-testowe` | dodanie zdjęcia (build E2E) | zdjęcie testowe (EXIF GPS celowo) | bez `t()` | |

## Kryterium → scenariusz
| Kryterium (poziom E2E-symulator, `kryteria.json`) | Scenariusz |
|---|---|
| NFR-PIE-001 | `01-nfr-pie-001-pierwsze-liczenie.yaml` |
| BR-LIC-001/S1 | `02-br-lic-001-s1-pierwsze-uruchomienie.yaml` |
| BR-LIC-001/S2 | `03-br-lic-001-s2-pierwszy-rzad-jednym-stuknieciem.yaml` |
| NFR-DAN-002 | `10-nfr-dan-002-kazda-zmiana-trwala.yaml` |
| BR-DAN-001/S1 | `11-br-dan-001-s1-baza-bez-sieci.yaml` |
| BR-ZAK-006/S4 | `12-br-zak-006-s4-bez-oferty-w-pracy.yaml` |
| KP-10 | `13-kp-10-zakup-tylko-po-dzialaniu.yaml` |
| BR-LIC-004/S4 | `14-br-lic-004-s4-gest-od-krawedzi.yaml` |
| BR-LIC-015/S2 | `15-br-lic-015-s2-przypomnienie-zegarek.yaml` |
| BR-ZAP-004/S2 | `16-br-zap-004-s2-zapas-bez-zasiegu.yaml` |
| BR-PRJ-003/S1 | `17-br-prj-003-s1-zdjecie-etykiety.yaml` |
| BR-PRJ-011/S1 | `18-br-prj-011-s1-start-po-zamknieciu.yaml` |
| BR-PRJ-011/S2 | `19-br-prj-011-s2-powrot-z-innej-aplikacji.yaml` |
| BR-PRJ-016/S2 | `20-br-prj-016-s2-powrot-po-przerwie.yaml` |
| BR-WZR-001/S1 | `21-br-wzr-001-s1-pdf-z-plikow.yaml` |
| BR-WZR-002/S1 | `22-br-wzr-002-s1-zdjecie-strony.yaml` |
| BR-WZR-005/S1 | `23-br-wzr-005-s1-poziomo-na-stojaku.yaml` |
| BR-WZR-007/S1 | `24-br-wzr-007-s1-strona-www-bez-sieci.yaml` |
| BR-WZR-007/S2 | `25-br-wzr-007-s2-plik-word.yaml` |
| BR-WZR-008/S1 | `26-br-wzr-008-s1-zakreslenie.yaml` |
| BR-WZR-008/S3 | `27-br-wzr-008-s3-przewijanie-bez-zakreslacza.yaml` |
| NFR-OFF-001 | `28-nfr-off-001-bez-sieci.yaml` |
| NFR-DOS-001 | `29-nfr-dos-001-voiceover.yaml` |
| NFR-DOS-002 | `30-nfr-dos-002-duzy-tekst.yaml` |
| NFR-WYD-001 | `31-nfr-wyd-001-reakcja-licznika.yaml` |
| NFR-SYS-001 | `32-nfr-sys-001-nowy-ios.yaml` |
| (przepływy pakietu podstawowego spoza poziomu E2E) BR-LIC-002/S1–S3, BR-LIC-019/S1, BR-LIC-003/S2 · BR-ZAK-006/S1, KP-13 · BR-ZAK-001/S1, PR-09 · P-089 (3a) · BR-DAN-005/S1, BR-DAN-006/S1, P-113 Q2a (bez karty) · ADR-0019 | `04`, `05`, `06`, `07`, `08`, `09` |

Kryteria „tylko-urządzenie” (18, `kryteria.json`) nie mają scenariusza — lista telefonu (strategia §8, TT-01–TT-09) albo „Nie sprawdzono”.
