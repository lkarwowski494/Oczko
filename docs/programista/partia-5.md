# Rola 08 (programista), build, partia 5: zaległości P-180, grupa A (projekt i części), grupa C (kosz)
Plik stanu sesji · start 2026-10-26 · gałąź `claude/jolly-thompson-paz6d8` · prompt: biblioteka `prompts` 97ec212, `08-programista --tryb build --moduly sqlite-expo` (47510 znaków — zgodny; nie w repo)
Zakres: P-181 (partia 5 = A + C + zaległości P-180; tylko grupy wspólne dla wariantów zakresu, bez wzorów, iCloud, sesji i narzędzi), P-180 (PLIK_BAZY, krok CI członkostwa `_shared/Stuknij.swift`, zdjęcie `continue-on-error` pakietu podstawowego E2E, pas przypomnienia po stronie Swift). Wejście: inwentaryzacja koordynatora `oczko-warsztat/koordynacja/2026-10-26-inwentaryzacja-mvp.md` (6575a46), `docs/scope-contract.md` (F-04, F-08, F-09, F-14, F-15, F-17, F-18, F-20, F-33, F-46, F-52, F-54, F-60, F-61), BRD (BR-PRJ-001/002/004/005/007/014/016, BR-LIC-006/011/012/018, BR-DNI-004/005/006, BR-DAN-008), `docs/architektura/moduly.md` „Projekt”, design-spec.

## Stan: E1 grup B, D, E w toku (sesja 2, 2026-10-26)
Potwierdzenie stanu (bez nowego E0): prompt 97ec212 złożony ponownie, 47510 znaków; `npm ci` + `env -u NODE_PATH npm run verify` na 71f8ae3 kod 0, **1875/1875** (jak 1f6ed79). E0/E1 A i C przyjęte (P-182–P-189); P-190 (język), P-191 (04 fix-6 E0), P-192 przeczytane.

**Zrobione w tej sesji** (każdy commit: test czerwony z właściwego powodu → kod → zielony):
- E: 0a1c4ed (P-190 `ustawienie.jezyk`, NAZWY_JEZYKOW z CLDR 47), d013fd7 (Ustawienia › Język, „Translation quality”, „Źródła wiedzy”, język w zgłoszeniu, /stan-danych).
- D: acbd108 (F-37 krokowiec zużycia na karcie, parsujLiczbe P-097 (5a)), 9eb02db (F-16 dane zdjęć), 76d9118 (adapter wyboru zdjęcia + plugin expo-image-picker — **natywne**).
- B: 7cb914a (kreski od startu stopera i do następnego +1, design-spec:242–244).
- Decyzje z P-193–P-199: 1d767db (łatki 12, P-194 Q1a–Q3a; testy oczekujące przeniesione), 81ae30f (korekta zeruje przerwy, P-195 Q2a/P-199 Q4a), a2e6149 (P-195 Q3b, Q4a, Q5), 57f0849 (F-58 `zegarek_ostatnia_partia_ms`, P-199 Q5a), 06c9ff8 (N12-12 kontrola kopii przed archiwum).
- `env -u NODE_PATH npm run verify` kod 0, jest **2108/2108** (06c9ff8 po rebase, 2026-10-26 16:05 UTC).

**Następny krok:**
1. Odpowiedzi koordynatora: Q-D1 (F-53 zrzut karty: react-native-view-shot 5.1.0; EXIF zdjęć: expo-image-manipulator ~57.0.21) — wysłane; fałszywy alarm bramki (fe309c7) — już naprawiony przez 10.
2. Po przyjęciu STOP E2 05 fix-6: łatki 08 z `oczko-warsztat` 46f8b19 (P-199 Q1a usunięcie `licznik.sekcja`, Q2a cel pary, `zrobPonownie` z `para_z`); kosz z etykietą projektu roboczego (05 fix-6 1a, P2); N12-07, N12-08 (zdania dane.md).
3. Po przekazaniu łatki 04 fix-6 (STOP E2 9379051): UI B (stoper w pasku P1a–P3a, sesje i korekta w „Time” P4a–P5a, Historia P6a), D (Narzędzia/„Swatch” P7a + kontrakt `przelicz` → Wynik, zapas P8a, Photos P9a, karta P10a), linia „ostatni kontakt z zegarkiem” w Stanie danych, R1–R8; e2e 33–43 (07) na testID 04.
4. Przed TestFlight (P-194 Q4a): globalna obsługa błędów JS i „Zgłoś problem” w trybie awaryjnym.
5. Przed 23:30 PL push natywnych (zegarek: linia kolejki Q6a w Swift, Smart Stack R3a wg P-158, pas przypomnienia już jest); CI iOS w oknie maszyn → STOP E2.

### Sesja 1: STOP (kontekst) po B1 dane i F-51 (1f6ed79)
Zrobione wtedy w B: przypadki użycia stopera (72e4ade), F-51 (610f011); verify 1875/1875.

### Poprzedni stan: STOP E1 grup A i C na bramce Linux (P-187, przyjęty P-188)
P-187: od ok. 15:00 do północy (czas polski) brak maszyn macOS — CI iOS (build, swift-test, E2E) do STOP E2 sprawdzamy w oknie maszyn; zmiany natywne zbierane, ostatni push przed nocą zawiera wszystko natywne. Przebiegi 40335206513 i 40338452515 (próby 1–2) anulowane bez runnera — wg P-187 to nie awaria. Raport (szkic E2, wyniki Linux): `oczko-warsztat/08-programista/2026-10-26-partia5/E2-raport.md` (a825c38).
E0 przyjęty: P-182 (Q1a+b, Q2a → P-184, Q3a, Q4a; uśpione bez progu). 04 fix-5 E2: P-183, P-185 (łatka kluczy nałożona w c387b3d). Wybór daty: P-186.
- (1) 1.1 `PLIK_BAZY` (a429c2f); 1.2–1.3 krok CI członkostwa `Stuknij.swift` + `continue-on-error` tylko dla [e2e-pelny] (22643f9); 1.4 pas przypomnienia Swift + naprawa `rzadWRobocie` w trybie „w trakcie” (ed9f60d; `swift test` lokalnie 45/45).
- Dane: A2 (c73b8fe), `projekt.narzedzie` w 0001.sql bez migracji (P-184, 1ba505a), A1 `widokProjektu` (d1b98c1), `dzienProjektu` (1c4d8e0, struktura), A3/A4/C1 (0b32827).
- Ekrany: C3 + A4 (c387b3d: klucze 04, lista, kosz), A5 + A3 + C2 (b148d6b: ekran projektu, arkusze, „Next part”, usuwanie), termin + A6 (a51f4b1: datetimepicker 9.1.0, testID, scenariusz 20).
- `env -u NODE_PATH npm run verify` kod 0, **1866/1866** (a51f4b1).
- CI: 40331271484 i 40333370146 bez runnera, zastąpione kolejnym pushem; 40335206513 (30a636e) anulowany po 15 min bez przydzielonego runnera (`runner_id` 0) — maszyna, P-091: jedno ponowienie = przebieg 40338452515 na a51f4b1 (w kolejce).
- STOP E1 w trakcie: Q2 szydełko → P-184; Q5 wybór daty → P-186.

## E0.1 Środowisko
| Sprawdzenie | Wynik |
|---|---|
| System, Node, git | Linux 6.18 x86_64, Node v22.22.0, chmura; tożsamość git „Łukasz Karwowski <336954459+lkarwowski494@users.noreply.github.com>” |
| GitHub | push na gałąź roboczą; `oczko-warsztat` z zapisem (P-010), HEAD 6575a46; `prompts` 97ec212 |
| Xcode / Swift / symulator | brak — Swift, build i E2E tylko w CI „Jakość · iOS” (`macos-26`) |
| Repo | publiczne: bez sekretów, danych osobowych i nowych nazw innych firm/aplikacji (P-121 (5)) |

## E0.2 Stan wyjściowy (HEAD 5df94e9, `npm ci`, `env -u NODE_PATH npm run verify`)
Kod 0, 113 zestawów, **1801/1801** (typecheck, typecheck:testy, lint, jakosc:kontrole, jest).

## E0.3 Co jest w kodzie (sprawdzone, nie z dokumentów)
- Schemat 0001 ma już kolumny grupy A: `projekt.notatka`, `drut_mm`, `termin_dzien`, `ostatnia_praca_ms`, `kopia_z`; `czesc.cel_rzedow`, `para_z`, `usunieto_ms`; `licznik.znaczenie`, `usunieto_ms`. Migracja potrzebna tylko przy Q2 (szydełko).
- Przypadki użycia są, bez UI: `utworzProjekt`, `zapiszNotatke`, `zrobPonownie`, `dodajCzescPara`, `wznowProjekt`, `usun*`/`przywroc*` (projekt, część, licznik), `dodajLicznik` (`src/przypadki-uzycia/licznik.ts:108`), domena `licznikCalosci`, `postepProcent`, `celDzienny`, `rozmiarUS`, repozytorium `kolejnoscProjektow`.
- Brak przypadków użycia: dodanie części (dziś tylko prywatne `dodajCzesc` w `projekt.ts`), zmiana znaczenia liczby (BR-LIC-012), drut (`drut_mm`), termin (`termin_dzien`); brak modeli odczytu ekranu projektu i kosza.
- `src/ekrany/Projekt.tsx` (56 linii) tylko odczyt, teksty robocze 08; `naNowy` w `app/projekty.tsx` = no-op; `naNastepnaCzesc` w `Aplikacja.tsx:108` = `nic`.
- Swift: `StanAktywnosci.przypomnienia` jest w stanie v3 i w dekoderze (`Stan.swift:34`), klucze `aktywnosc.przypomnienie*` są w `Teksty.swift`; brak reguły RD-13 (`przypomnienieChwili`) w pakiecie `OczkoReguly` i brak pasa w widokach.
- CI: `continue-on-error: true` jest na poziomie zadania `e2e` (wszystkie części macierzy, oba pakiety) — `jakosc-ios.yml:128`.

## E0.4 Plan (każdy push: `npx jest`, `typecheck`, `lint`, `jakosc:kontrole` zielone; krok natywny czeka na zielone „Jakość · iOS”)
Procedura DS-02 jak w partiach 1–4: test czerwony z właściwego powodu → kod → zielony; Swift: `XCTExpectFailure(strict: true)` → kod (P-140 Q2a).

**(1) Zaległości P-180 — najpierw (mały, niezależny od Q1–Q3)**
| Krok | Zachowanie → test | Pliki |
|---|---|---|
| 1.1 | stała `PLIK_BAZY = 'oczko.db'` w `sciezki.ts`, użyta w `sciezkiDanych`, archiwum, kopii ratunkowej i panelu SHA; test jednego źródła: literał `oczko.db` tylko w `sciezki.ts` (dziś 4 pliki) — czerwony przed zmianą | `src/dane/baza/sciezki.ts`, `archiwum.ts`, `kopia-ratunkowa.ts`, `app/ustawienia.tsx`, `tests/jakosc/sciezka-bazy-jedna.test.ts` (zmiana oczekiwania z powodem: P-180) |
| 1.2 | krok CI po prebuild: `_shared/Stuknij.swift` w fazie Sources celu aplikacji w `project.pbxproj` (obok „Cele natywne podłączone”); dowód czerwieni: przebieg na gałęzi z celowo usuniętym członkostwem nie wchodzi do historii — zamiast tego test kontroli w `sprawdz-workflowy.mjs` (krok istnieje) | `.github/workflows/jakosc-ios.yml`, `scripts/jakosc/sprawdz-workflowy.mjs` |
| 1.3 | `continue-on-error` tylko dla pakietu pełnego: `${{ contains(…, '[e2e-pelny]') }}` w miejscu `true`; komentarz z P-180 | `jakosc-ios.yml` |
| 1.4 | Swift: `przypomnienieChwili` (RD-13) w `OczkoReguly` na wektorach RD-13 z `tests/wektory/brd.json` (te same co TS), kolejność przypomnień jak w stanie; pas w Live Activity (karta, rozwinięta wyspa, Smart Stack w wersji krótkiej), linia „+N more”, etykiety VoiceOver; zegarek: pas pod liczbą i linia pod pasem; kopie źródeł (`kopiuj-zrodla.mjs`) | `modules/oczko-reguly/Sources/OczkoReguly/Przypomnienia.swift` (nowy), testy, `targets/widget/Aktywnosc.swift`, `targets/watch/Aplikacja.swift` |

**(2) Grupa A — warstwa danych, potem ekrany**
| Krok | Zachowanie → test | Pliki |
|---|---|---|
| A1 | model odczytu ekranu projektu `widokProjektu`: części w kolejności, liczniki części, licznik całości (F-46, BR-LIC-018), notatka, drut z „(US n)” (RD-11/RD-19), termin i cel na dziś (RD-15), postęp % albo „bez celów” (RD-14), para (BR-PRJ-014), ostatnia zmiana; usunięte pominięte → `tests/dane/widok-projektu.test.ts` (node:sqlite) | `src/przypadki-uzycia/widok-projektu.ts` |
| A2 | zapisy: `dodajCzesc` (publiczny, BR-PRJ-001), `ustawZnaczenie` (BR-LIC-012, UPDATE jednej kolumny, stan ekranu blokady odświeżony — `znaczenie` jest w stanie v3), `ustawDrut` (mm > 0 albo null), `ustawTermin` (dzień albo null) → testy zapisu: liczności dzieci i pola spoza formularza bez zmian | `src/przypadki-uzycia/projekt.ts`, `czesc.ts`, `licznik.ts` |
| A3 | „Następna część” (U-11, BR-LIC-011/S1): przejście do następnej nieusuniętej części projektu (pierwszy licznik), a gdy jej nie ma — arkusz „Następna część / Druga taka sama” (`utworzenie części` / `dodajCzescPara`) → test przypadku użycia + test ekranu | `src/przypadki-uzycia/czesc.ts`, `src/kompozycja/`, `Aplikacja.tsx` |
| A4 | lista projektów: „ostatnia praca N dni temu”, sekcja uśpionych (`projekty-uspione`, e2e 20; próg — Q1), kolejność „który projekt dziś” z terminem (BR-DNI-006, `kolejnoscProjektow`), postęp %; ukończone: „Wznów” (`wznowProjekt`, F-19) → testy modelu i `lista-projektow.test.tsx` | `widok-projektow.ts`, `src/kompozycja/projekty.ts`, `ListaProjektow.tsx` |
| A5 | trasa `app/projekt/[id].tsx` z `Projekt.tsx` (rozbudowa: akcje części i licznika, notatka edytowalna, znaczenie, drut, „Gotowe do”, „Zrób taką samą”); „Nowy projekt” = `utworzProjekt` z formularzem nazwy (+ opcjonalne części) → test ekranu i skutku w danych | `app/`, `src/ekrany/Projekt.tsx`, `Formularze.tsx`, `app/projekty.tsx` |
| A6 | testID z `e2e/README.md` (`projekty-uspione` i nowe wiersze tabeli, jeśli 04/07 je dodadzą); scenariusz 20 [e2e-pelny] jeden przebieg informacyjny | `e2e/README.md` (tylko dopisanie wierszy) |

**(3) Grupa C — kosz (F-33, BR-DAN-008)**
| Krok | Zachowanie → test | Pliki |
|---|---|---|
| C1 | model odczytu `widokKosza`: projekty, części i liczniki w koszu z terminem `usunieto_ms + KOSZ_DNI` (część/licznik tylko, gdy rodzic nie w koszu) → test node:sqlite | `src/przypadki-uzycia/widok-kosza.ts` |
| C2 | akcje „Usuń {obiekt}” z potwierdzeniem z terminem (design-spec:48) w projekcie (część, licznik) i na liście/menu (projekt); usunięcie bieżącego licznika przełącza licznik ekranu (pierwszy dostępny) i odświeża ekran blokady → testy ekranów + skutek w danych | `Projekt.tsx`, `MenuProjektu.tsx`, kompozycja |
| C3 | ekran „Recently deleted” z „Przywróć” (`przywroc*`) → test ekranu i danych (BR-DAN-008/S1, S3, S4) | `src/ekrany/Kosz.tsx`, `app/kosz.tsx` |

**(4) STOP E2:** `env -u NODE_PATH npm run verify` kod 0, zielone „Jakość · iOS” z pakietem podstawowym jako bramką (jeden pełny przebieg bez anulowania), zrzuty Expo web jasny/ciemny zmienionych ekranów (lub lista dla właściciela), raport w `oczko-warsztat/08-programista/2026-10-26-partia5/`.

## E0.5 Luki i pytania (STOP E0)
- **Q1 Teksty i makiety grupy A i C.** W `docs/design/` nie ma makiet ani kluczy dla: ekranu projektu z akcjami (dodaj część, dodaj licznik, edycja notatki, znaczenie liczby, drut, „Gotowe do”, „Zrób taką samą”, „Usuń”), formularza nowego projektu, arkusza „Następna część / Druga taka sama” (jest tylko `licznik.nastepna_czesc` „Next part”), „last worked N days ago” i nagłówka sekcji uśpionych (tekst jest tylko w makiecie listy `ekrany.html:220`, bez klucza i bez progu), „Wznów”, potwierdzeń usunięcia z terminem i ekranu „Recently deleted” (design-spec:48 podaje tylko nazwę), miejsca wejścia do kosza. Szacunek: 35–45 kluczy. BR-PRJ-016 mówi „bez progu dni (P-047)”, a e2e 20 i design-spec wymagają sekcji uśpionych — próg sekcji potrzebny od 04/03.
  - (a) 04 fix-5 (klucze + makiety + miejsce kosza + próg sekcji) równolegle teraz; 08 robi w tym czasie (1) i warstwę danych A1–A4, C1 (bez tekstów), ekrany A5, C2–C3 po E2 04. Jeśli 04 nie zdąży przed ekranami — STOP z listą.
  - (b) 08 pisze teksty robocze w `en.kontekst.json` z dopiskiem „do zatwierdzenia przez 04” (precedens partii 3–4: `Projekt.tsx`, Dni, Z07-05), lista kluczy w raporcie, 04 akceptuje w audycie po 08.
  - (c) Grupa A i C tylko do warstwy danych w tej partii; ekrany w partii 6 po przeglądzie zakresu (27–28.10).
  - **Rekomendacja: (a)** — kolejność pracy 08 nie czeka (warstwa danych i (1) to ok. połowa partii), a ekrany dostaną teksty 04 zamiast roboczych; (b) jako zapas, gdy 04 nie zdąży, z pełną listą w STOP.
- **Q2 Szydełko w projekcie (BR-PRJ-004/S3, RD-19-W3: „6,5 mm (US K-10 ½)”).** Schemat ma tylko `drut_mm`, bez rodzaju narzędzia, a `rozmiarUS(mm, 'druty' | 'szydelko')` wymaga rodzaju.
  - (a) Migracja 0002: `ALTER TABLE projekt ADD COLUMN narzedzie TEXT NOT NULL DEFAULT 'druty' CHECK (narzedzie IN ('druty', 'szydelko'))` (bez przebudowy tabeli), w transakcji, test na kopii bazy schematu 1; kontrakt kolumny w `dane.md`/`schemat.sql` pisze 05 (mały aneks).
  - (b) W 1.0 tylko druty (RD-11); szydełko przez Narzędzia (F-38, grupa D). BR-PRJ-004/S3 nazwane odstępstwem do 01/03.
  - **Rekomendacja: (a)** — scenariusz BRD w MVP; koszt: aneks 05 (ok. 1 h) + migracja z testem (ok. 1 h 08).
- **Q3 Kontrakt nowych przypadków użycia** (`dodajCzesc`, `ustawZnaczenie`, `ustawDrut`, `ustawTermin`, `widokProjektu`, `widokKosza`, „następna część”). `moduly.md` ich nie wymienia.
  - (a) 08 pisze sygnatury według istniejącego wzorca (`Wynik`, `operacjaZapisu`, UPDATE jednej kolumny, odczyt z parsowaniem) i wypisuje je w raporcie do przeglądu 05 — precedens partii 4 (`ustawBlokade`, przypadki użycia menu •••).
  - (b) aneks 05 przed A2.
  - **Rekomendacja: (a)** — wzorzec jest ustalony, sygnatury bez nowych granic; (b) tylko dla Q2a (schemat).
- **Q4 Semantyka „Następna część” (U-11).** BR-LIC-011/S1: „proponuje przejście do następnej części”. Propozycja w A3: następna istniejąca część → jej pierwszy licznik; brak następnej → arkusz „Nowa część” / „Druga taka sama”. (a) jak wyżej; (b) zawsze arkusz z trzema wyborami. **Rekomendacja: (a)** — jedno stuknięcie w typowym przypadku (sweter z częściami założonymi wcześniej). Do potwierdzenia przez 04 razem z Q1.
- **Uwaga (bez decyzji):** nowe scenariusze Maestro dla A i C nie powstają (należą do 07); testy ekranów RNTL piszę z kryteriów BRD, bo 07 ich nie dało dla tych ekranów. Zmiana istniejących scenariuszy = pytanie.

## Czas (zasada 9)
Agent: (1) 1.1–1.3 ok. 1,5 h, 1.4 ok. 4–6 h; (2) A1–A4 ok. 6–8 h, A5–A6 ok. 6–9 h; (3) ok. 3–4 h; E2 ok. 2 h. Razem ok. 23–30 h. Czekanie: CI iOS 4–8 przebiegów (15–40 min każdy), 04 fix-5 (Q1a), 05 aneks (Q2a), odpowiedzi koordynatora. Właściciel: nic (przegląd zakresu 27–28.10 może zmienić kolejność, nie tę partię).
Podział: jedna sesja wystarczy (partia 4 miała ok. 40 h w jednej sesji); punkt kontrolny po (1) i A1–A4/C1 z wypchniętym plikiem stanu. Jeśli koordynator woli krótsze sesje: 5a = (1) + A1–A4 + C1, 5b = ekrany A5–A6 + C2–C3 (granica = E2 04 fix-5).

## Dziennik sesji
- 2026-10-26: E0 — prompt złożony (47510 znaków), stan wyjściowy verify 1801/1801, plan (1)–(4), Q1–Q4; STOP do koordynatora. Odpowiedź: P-182.
- 2026-10-26: E1 (1) zaległości P-180; A2 (STOP E1 Q2 → P-184); A1; A3/A4/C1. Swift 6.2 zainstalowany lokalnie w /opt/swift (poza repo) — `swift test` przed CI.
- 2026-10-26: ekrany C3/A4, A5/A3/C2, termin (pytanie Q5 → P-186) i A6; push a51f4b1; czekam na CI iOS.
- 2026-10-26: CI iOS bez runnera (P-187: okno 15–24 bez macOS); STOP E1 A+C → P-188. Lista luk B/D/E → P-189 (04 fix-6, karta Pro po imporcie poza 1.0). B: dane stopera, F-51. STOP z powodu długości kontekstu.
- 2026-10-26 (sesja 2): potwierdzenie stanu 1875/1875; E (język P-190, ustawienia, źródła, stan danych); D (F-37 karta, F-16 dane i adapter). Q-E1 → P-193. Łatki 12 (P-194), P-195, P-199 Q4a/Q5a, N12-12.
### Do raportu E2 (zbierane w trakcie)
- Sesja 2 — zgłoszenia: (04) klucz `ukonczenie.zapas_juz_zero` przemianowany na `ukonczenie.zapas_juz_pusty` (`_zero` = kategoria liczby mnogiej, typ Klucz obcina); brak klucza komunikatu „zły zapis liczby” (P-097 (5a)) — pole odrzuca wpis po cichu; wiersz „Translation quality” bez zdania „przekład maszynowy” (BR-DAN-010 S1 mówi o informacji — jest tylko etykieta i odnośnik); „Edit stash” ukryty, dopóki nie ma ekranu zapasu (D2). (06/07) `docs/tresci/nazwy-zrodel.json`: dopuszczone klucze `zrodla` (design-spec nadaje kluczom ekranu prefiks `zrodla.*`). (05) aneks dane.md `jezyk`; sygnatury: `magazynJezyka`, `i18n.preferencja`, `zapiszZuzycie`, `dodajZdjecie`/`usunZdjecie`/`zdjecia`, `wybieraczZdjec`, `parsujLiczbe`, `liniaZapasu`/`krokMotkow`, KROK_MOTKA; `KartaUkonczenia.wloczka` z `motki`/`zuzyto`. (09) NAZWY_JEZYKOW z CLDR (aneks 08). Ryzyko: zdjęcie udostępnione z podglądu (P9a Share) niesie EXIF/GPS z aparatu — kopia w magazynie to oryginał (bez przekodowania); P10a usuwa EXIF tylko z obrazu karty → pytanie do 05/koordynatora razem z Q-D1.
- Zmiany istniejących testów (sesja 2): `tests/ekrany/ukonczenie.test.tsx` (przycisk „Enter yarn left over…” → krokowiec, P-126 (2a)); `tests/dane/czesc-menu.test.ts:48` (model włóczki z `motki`, `zuzyto`).
- Sygnatury nowych przypadków użycia do przeglądu 05 (P-182 Q3a): `dodajCzescProjektu`, `ustawZnaczenie`, `ustawDrut` (z `narzedzie`), `ustawTermin`, `widokProjektu`, `widokKosza`, `nastepnaCzesc`; repozytoria `elementyKosza`, `dzienProjektu`, `rzedyCzesci`, `celCzesci`.
- Cel części pary liczony dynamicznie z rzędów pierwszej (BR-PRJ-014 S1, S3) w `widokProjektu`, `widokLicznika`, `nastepnaCzesc`; `dodajCzescPara` nadal kopiuje `cel_rzedow` pierwszej (własny cel wygrywa) — do przeglądu 05.
- `zrobPonownie` nie kopiuje drutu ani narzędzia (BR-PRJ-007 nie rozstrzyga) — pytanie do 01/05.
- Licznik całości: flaga `licznik.sekcja` (N2 → 05; propozycja 04: każdy licznik rzędów części to sekcja, całość widać przy ≥ 2).
- Swift: Smart Stack (`supplementalActivityFamilies`) nie istnieje w celu widżetu — pas krótki (`aktywnosc.przypomnienie_krotkie`) poza partią; etykieta VoiceOver „Add row. ” + `przypomnienie_a11y` wymaga klucza (sklejanie napisów) — zgłoszenie do 04; dziś pas ma własną etykietę, przycisk +1 bez zmian.
- Błąd naprawiony: `rzadWRobocie` w widżecie i zegarku w trybie „rząd w trakcie” (o 1 za mało wobec aplikacji).
- N1 (nazwa kopii „Make another”, decyzja 08): **ta sama nazwa co oryginał** (`zrobPonownie` bez zmian; BR-PRJ-007 „nowy projekt z tymi samymi częściami”; lista odróżnia je linią „last worked …”; dopisek do nazwy wymagałby nowego klucza 04).
- Odstępstwa: przesunięcie wiersza („swipe to delete”) na liście i na ekranie projektu niezbudowane — w RN bez biblioteki gestów; alternatywa z makiety (••• → Delete project…, tryb Edit z ⊖) jest (SP-15); dodanie biblioteki = decyzja 05/koordynatora. Menu „+” i ••• projektu jako lista w ekranie (testID z „Dla 08”), nie systemowy arkusz akcji.
- Stan nieaktywny przycisku: tokeny nie mają „disabled” → `linia` (tło) + `olowek` (tekst); zgłoszenie do 04.
- Licznik oczek na ekranie projektu: opis = sama liczba (klucz „{n} stitches” poza partią, design-spec).
- Linia listy „{część} · row {n} of {cel}”: klucza nie ma — zostaje `licznik.teraz` (jak w partii 4).
- Podgląd terminu przy „cel osiągnięty” pokazuje 0 rzędów (klucze mają tylko cel albo „bez celów”) — do 04.
- Nowy projekt otwiera licznik pierwszej części (U-5: liczenie od razu); „Add part” z ekranu projektu wraca na ekran projektu; „New part” z „What’s next?” otwiera licznik nowej części; druga część pary dostaje tę samą nazwę co pierwsza.
- Zrzuty: projekt bez `react-native-web` (Expo web niedostępne), symulator tylko w CI — lista zrzutów dla właściciela w raporcie E2 (stany z `wzorce-zrzuty/projekt-kosz-*`).
