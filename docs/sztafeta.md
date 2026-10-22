# Stan sztafety
Ścieżka: greenfield z ponownym użyciem kodu (P-001, P-002) · Aktualizacja: 2026-10-22 (rola 04, build, STOP E3)

| Rola | Tryb | Stan | Commit | Artefakty | Otwarte decyzje |
|---|---|---|---|---|---|
| koordynator | — | decyzje P-001–P-010, kwarantanna | b080940 | docs/decyzje.md, docs/pomysl.md, CLAUDE.md | — |
| 02 Monetyzacja, sesja 1 (bramka) | build, `--moduly oplacalnosc,cena-i-rachunek` | zakończona 2026-10-21: **budować** (P-013) | (ten commit) | docs/monetyzacja.md (Opłacalność), docs/monetyzacja/, docs/zalozenia.md, P-011–P-016; surowe dane: oczko-warsztat/02-monetyzacja/2026-10-21-bramka/ | OP-05, OP-06 (fakty od właściciela, niepilne) |
| 01 Odkrywanie | build | zakończona 2026-10-21 | (ten commit) | docs/brd/ (9 plików), tests/wektory/brd.json; P-017–P-026; ZAL-017–024 | OP-09 (e-mail do CYC), OP-03, OP-11, OP-15; OP źródłowe dla 06 |
| 02 Monetyzacja, sesja 2 | build (bez `--moduly`) | zakończona 2026-10-22: model B, Pro dożywotni 14,99 USD (P-029), płatności jak w Treningu (P-036) | (ten commit) | docs/monetyzacja.md („Sesja 2, E0–E3”: kontrakt płatności KP-01–KP-11, szkic ADR, przekazanie), docs/monetyzacja/dostep.mjs, wektory-dostepu.json, dostep-test.mjs, docs/zalozenia.md (ZAL-026); P-027–P-038; źródła: oczko-warsztat/02-monetyzacja/2026-10-21-sesja2/zrodla/2026-10-22/e3/ | ER-06–ER-08 do roli 01; OP-21 (07), OP-22, OP-23 (05); przy konfiguracji App Store Connect: Family Sharing (kierunek: włączamy) i ID produktu (OP-24, P-038); test P-029 w 04.2027 |
| 01 Odkrywanie, fix ER-06–ER-08 | fix | zakończona 2026-10-22 (STOP E2): ER-06–ER-08 naprawione-do-weryfikacji | d5b08b8 (gałąź `claude/bold-meitner-5psv0z`) | docs/brd/errata.md (nowy), BR-ZAK-001, PR-09, OG-03, H-01, H-02, H-06, S-33–S-35, OP-22, P-039; oczko-warsztat `01-odkrywanie/fix-2026-10-22/`, macierz `soczewki/konkurencja.md` | ER-09 (otwarte, rola 01); status „zweryfikowane” nadaje reaudit |
| 01 Odkrywanie, fix ER-09–ER-24 | fix (P-045) | zakończona 2026-10-22 (STOP E2 przyjęty, P-048): ER-09–ER-24 naprawione-do-weryfikacji | 8ffe2b6 | 80 BR (+21: BR-LIC-017–020, BR-PRJ-011–016, BR-WZR-007–008, BR-DAN-010–011, BR-DNI-001–007), NFR-PIE-001, NFR-SYS-001, PR-15, PR-16, RD-14–RD-18 (+31 wektorów w `tests/wektory/brd.json`), OG-14, S-36, S-37, OP-25, OP-26, P-047; oczko-warsztat `01-odkrywanie/fix-2026-10-22-er09-24/` | OP-25 (10, 05), OP-26 (05); status „zweryfikowane” nadaje reaudit |
| 03 Zakres | build | zakończona 2026-10-22 (P-052): kontrakt W1 (61 funkcji, 49 MVP, 80 BR, `zakres-oczko.mjs` kod 0); P-040–P-046, P-049, P-052; model P-051 w badaniu roli 02 | 2679029 | docs/scope-contract.md, docs/scope-contract-historia.md; oczko-warsztat `03-zakres/2026-10-22-build/` (soczewki, mapa przepływów U-1–U-12, teksty ofert) | P-051 (02, sesja 3), ER-25 (01), WTP nowych funkcji (02) |
| 02 Monetyzacja, sesja 3 | build, `--moduly cena-i-rachunek,storekit-expo` | zakończona 2026-10-22 (STOP E3 przyjęty, P-058): **model V4 bez próby** (P-057): cała aplikacja darmowa, limit 5 dni z robótką/mies., Pro 0,99 / 6,99 USD (subskrypcja bez oferty wprowadzającej) i 14,99 USD dożywotnio | (ten commit) | docs/monetyzacja.md („Sesja 3, E0–E3”: kontrakt KP-01–KP-15, test modelu), docs/monetyzacja/limit.mjs, wektory-limitu.json, limit-test.mjs, warianty-s3/, dostep.mjs (W-15–W-18); P-054–P-057; ZAL-028, ZAL-029; dowody: oczko-warsztat/02-monetyzacja/2026-10-22-sesja3/ | ER-26–ER-28 do roli 01; D6 Family Sharing i ID produktów przy konfiguracji App Store Connect (P-038, OP-24); czy Trening liczy D5 tak samo (05) |
| 01 Odkrywanie, fix ER-25–ER-28 | fix (P-058) | zakończona 2026-10-22 (STOP E2 przyjęty, P-060): ER-25–ER-28 naprawione-do-weryfikacji (STOP E0: P-059) | 95a69eb | 84 BR (+4: BR-ZAK-005–007, BR-DAN-012), zmienione BR-ZAK-001–003, BR-DAN-005, BR-LIC-017, BR-DNI-001, NFR-PIE-001, PR-09, PR-15, OG-03, OG-15, H-01, H-02, S-38, S-39, OP-32, OP-33; `tests/wektory/brd.json` bez zmian; oczko-warsztat `01-odkrywanie/fix-2026-10-22-er25-28/` | OP-32 (02), OP-33 (11), NZ-01–NZ-04; status „zweryfikowane” nadaje reaudit |
| 04 Studio projektowe | build | STOP E3 2026-10-22 (E0: P-061, E1: P-062, E2: P-063 kierunek A, P-064 Libre Franklin; ta sama sesja co fix 01, wyjątek zasady 19) | (ten commit) | docs/design/ (00-rozpoznanie, 01-swiat, kierunki/, porownanie.html + .png, fonty/, narzedzia/) | decyzje E3 1–5 (limit zawczasu, licznik dni, teksty ofert, ikona, cofanie serii) |

## Następny krok
### Przekazanie roli 01, fix ER-25–ER-28 (2026-10-22)
- Zakończono: 01-odkrywanie, fix ER-25–ER-28 (P-058; STOP E0: P-059; STOP E2: P-060), jeden commit na ID na `claude/jolly-thompson-paz6d8` (a09acc4..95a69eb). Dowody: `oczko-warsztat/01-odkrywanie/fix-2026-10-22-er25-28/` (E0-plan, kontrola-er.mjs, przed.txt 0/21, po.txt 21/21, kontrola-brd-po.txt, E2-dowody.md, sprawdz-raport.txt).
- Następny krok (P-002): **04-studio-projektowe**, tryb `build`; nowa sesja: opus, wysiłek high.
  - `node tools/assemble.mjs 04-studio-projektowe --tryb build --galaz claude/jolly-thompson-paz6d8`
  - `.\Get-Prompt.ps1 04-studio-projektowe -Tryb build -CopyToClipboard`
- Paczka 04: jak w przekazaniu roli 03 i roli 02, sesja 3 (niżej), plus BR-ZAK-005–007 i BR-DAN-012 (`docs/brd/wymagania-dane.md`), „dzień limitu” a „dzień z robótką” (P-059 (2a): licznik dni bez sprzeczności z kalendarzem), miejsce „Oceń” w Ustawieniach, NZ-03 (blokada na zegarku).
- Dla innych ról (E2-dowody, „Polecenia dla ról”): 07 nowe i zmienione scenariusze, bloker BR-ZAK-005–007; 05 prośba o ocenę w Expo, NZ-02, NZ-03; 11 OP-33; 02 NZ-01 (OP-32), NZ-02; 03 NZ-04 (BR-ZAK-005–007 i BR-DAN-012 bez F w kontrakcie, lista blokerów dla 07).
- Potem, przed rolą 05 (P-060 (5b)): **02-monetyzacja, tryb `fix`** dla NZ-01 i NZ-02 (OP-32: zerowanie, −1, liczniki oczek i powtórzeń, zegarek; synchronizacja dni na nowym urządzeniu); rola 04 przyjmuje te przypadki jako założenia z odsyłaczem do OP-32.
- Kwarantanna (P-003, P-015) obowiązuje role 01–04.

### Przekazanie roli 02, sesja 3 (archiwalne, 2026-10-22)
- Zakończono: 02-monetyzacja, build, sesja 3 (P-051 → P-053, P-055 → wybór P-057: **V4 bez próby**), gałąź `claude/jolly-thompson-paz6d8`; artefakty: `docs/monetyzacja.md` („Sesja 3, E0–E3”), `docs/monetyzacja/limit.mjs` + `wektory-limitu.json` + `limit-test.mjs` (14/14, kod 0), `dostep.mjs` + `wektory-dostepu.json` (24/24, kod 0), `warianty-s3/`, `dowody/s3-*`; `docs/decyzje.md` P-054–P-057; `docs/zalozenia.md` ZAL-028, ZAL-029; prywatne: `oczko-warsztat/02-monetyzacja/2026-10-22-sesja3/` (soczewki: recenzent, analityk, v3; StoreKit).
- Najpierw: **01-odkrywanie, tryb `fix`** dla ER-26–ER-28 (model V4 w BRD, limit dni, rozdzielenie „pracy” w statystykach i „startu dnia” w limicie) i ER-25 (od roli 03); nowa sesja: opus, wysiłek high.
  - `node tools/assemble.mjs 01-odkrywanie --tryb fix --zadania ER-25,ER-26,ER-27,ER-28 --galaz claude/jolly-thompson-paz6d8`
  - `.\Get-Prompt.ps1 01-odkrywanie -Tryb fix -Zadania ER-25,ER-26,ER-27,ER-28 -CopyToClipboard`
- Potem (P-002): **04-studio-projektowe**, tryb `build` (paczka z przekazania roli 03 plus `docs/monetyzacja.md` „Sesja 3, E3”: ujawnienia, KP-12–KP-14, licznik dni).
- Dla 03: kolumna „Dostęp” kontraktu zakresu: wszystko darmowe w limicie (uwaga w „Sesja 3, E3”). Dla 05: ADR `expo-iap` z subskrypcjami bez oferty wprowadzającej, KP-15. Dla 07/08: wektory L i W.
- Otwarte: Family Sharing i ID produktów przy konfiguracji App Store Connect (P-038, OP-24); spójność D5 z Treningiem [DO USTALENIA].
- Kwarantanna (P-003, P-015) obowiązuje role 01–04.

### Przekazanie roli 03 (archiwalne, 2026-10-22)
- Zakończono: 03-zakres, build (E0–E3, P-040–P-046, P-049, P-052), gałąź `claude/jolly-thompson-paz6d8` (2679029 i ten commit); artefakty: `docs/scope-contract.md` (kontrakt W1, wynik `zakres-oczko.mjs` kod 0, przekazanie 04–08), `docs/scope-contract-historia.md` (E0–E2), `docs/zalozenia.md` (ZAL-019–024, ZAL-027); materiały prywatne `oczko-warsztat/03-zakres/2026-10-22-build/` (soczewki E1, mapa przepływów U-1–U-12, teksty ofert, kalendarz, pomysły, skrypty).
- Najpierw: **wynik roli 02, sesja 3** (model P-051: próba 14 dni, zakupy nieodnawialne, blokada z podłogą danych; trwa w osobnej sesji „Oczko · 02-monetyzacja sesja 3 (model P-051)”). Rola 04 startuje po nim (P-052 (3)).
- Następny krok ścieżki (P-002): **04-studio-projektowe Studio Projektowe (UX, marka, przepływy)**, tryb `build`; nowa sesja: opus, wysiłek high.
  - `node tools/assemble.mjs 04-studio-projektowe --tryb build --galaz claude/jolly-thompson-paz6d8`
  - `.\Get-Prompt.ps1 04-studio-projektowe -Tryb build -CopyToClipboard`
- Paczka wejściowa 04: `CLAUDE.md`, `docs/scope-contract.md` („Kolejność i przekazanie”, kolumna „Intuicyjność”, „NIE robimy”), `docs/brd/wymagania.md` (PR-01–PR-16, NFR-PIE-001, NFR-DOS-001/002), `docs/monetyzacja.md` (kontrakt płatności po sesji 3, ujawnienia, KP-10), `docs/decyzje.md` (P-041, P-046, P-051, P-052), `oczko-warsztat/03-zakres/2026-10-22-build/przeplywy-mapa-szkic.md` i `oferty-tekst-wlasciciela.md`.
- Dla 05–08 i 01: sekcja „Kolejność i przekazanie” w `docs/scope-contract.md`; dla 01: ER-25 (prośba o ocenę i odnośnik „Oceń”) przy następnej poprawce BRD.
- Otwarte decyzje: model (rola 02, sesja 3); WTP nowych funkcji (02); ER-25 (01).
- Kwarantanna (P-003, P-015) obowiązuje role 02–04.

### Przekazanie roli 01, fix ER-09–ER-24 (archiwalne, 2026-10-22)
- Zakończono: 01-odkrywanie, fix ER-09–ER-24 (P-045, decyzje STOP E0: P-047), jeden commit na ID na `claude/jolly-thompson-paz6d8` (355fef1..8ffe2b6). Dowody: `oczko-warsztat/01-odkrywanie/fix-2026-10-22-er09-24/` (E0-plan, kontrola-er.mjs, przed.txt 0/33, po.txt 33/33, E2-dowody.md).
- Następny krok: **powrót do sesji roli 03-zakres** (E2: cięcie i warianty) z BRD po poprawce: nowe BR-DNI-001–007 (BR-DNI-007 „PÓŹNIEJ”, P-046), BR-LIC-017–020, BR-PRJ-011–016, BR-WZR-007–008, BR-DAN-010–011, NFR-PIE-001, NFR-SYS-001.
- Dla 02: podział darmowe/Pro dla nowych BR; tabela „Testy, których nie zrobi Node (krok właściciela)” w `docs/monetyzacja.md` potrzebuje zamiennika automatycznego (ER-10, P-041).
- Dla 04: P-046 (nic z K i I na ekranie licznika bez ustawienia użytkownika), BR-DNI-005 scenariusz „Bez terminu”, BR-LIC-019 „Brak nowego elementu”; mapa U-1–U-12 roli 03.
- Dla 05: OP-25 (z 10), OP-26; wykonalność BR-WZR-007 (Word, strona offline), RD-16 (zapis strefy ze zmianą), audyt dostępności S-36 w CI. Dla 07: nowe RD-14–RD-18 i zmienione kryteria BR-LIC-001, BR-LIC-004, BR-DAN-006, BR-DAN-008. Dla 06: brak nowych reguł krytycznych.
- Kwarantanna (P-003, P-015) obowiązuje role 01–04.

### Przekazanie roli 01, fix (archiwalne, 2026-10-22)
- Zakończono: 01-odkrywanie, fix ER-06, ER-07, ER-08 (P-028), commity na `claude/bold-meitner-5psv0z` (gałąź sesji); `claude/jolly-thompson-paz6d8` przewinięta do `fc88fcd` 2026-10-22 za zgodą właściciela (szybkie przewinięcie 92309ca..fc88fcd, bez scalania). Dowody: `oczko-warsztat/01-odkrywanie/fix-2026-10-22/` (E0-plan, kontrola-er.mjs, przed.txt 0/11, po.txt 11/11, E2-dowody.md).
- Następny krok (P-002): **03-zakres Zakres i kontrakt MVP**, tryb `build`; nowa sesja: opus, wysiłek high.
  - `node tools/assemble.mjs 03-zakres --tryb build --galaz claude/jolly-thompson-paz6d8`
  - `.\Get-Prompt.ps1 03-zakres -Tryb build -CopyToClipboard`
- Paczka wejściowa 03 bez zmian (niżej), BRD już po poprawce; dla 03 także P-039 (zegarek bez telefonu, warunkowa od 05) i H-06 z dowodem zakupu.
- Dla 05: OP-22 (zegarek) teraz też w BRD (BR-ZAK-001). Dla 07: nowe scenariusze BR-ZAK-001 (iPad, zegarek, Family Sharing, odebranie) zgodne z wektorami W-09, W-10, W-14 w `docs/monetyzacja/wektory-dostepu.json`. `tests/wektory/brd.json` bez zmian.
- Otwarte: ER-09 (rola 01, niepilne). Kwarantanna (P-003, P-015) obowiązuje role 02–04.

### Przekazanie roli 02, sesja 2 (archiwalne, 2026-10-22)
- Zakończono: 02-monetyzacja, build, sesja 2 (model i kontrakt płatności), gałąź `claude/jolly-thompson-paz6d8`; artefakty: `docs/monetyzacja.md` („Sesja 2, E0–E3”), `docs/monetyzacja/` (`rachunek.json`, `warianty-e2/`, `dostep.mjs`, `wektory-dostepu.json`, `dostep-test.mjs`, `dowody/`), `docs/decyzje.md` (P-027–P-038), `docs/zalozenia.md` (ZAL-025, ZAL-026); materiały prywatne `oczko-warsztat/02-monetyzacja/2026-10-21-sesja2/`.
- Najpierw (P-028): **01-odkrywanie, tryb `fix`**: poprawka zbiorcza BRD z ER-06, ER-07, ER-08 (`docs/monetyzacja.md`: „Zgłoszenia do roli 01” i „Zgłoszenie do roli 01” w E3); nowa sesja: opus, wysiłek high.
  - `node tools/assemble.mjs 01-odkrywanie --tryb fix --zadania ER-06,ER-07,ER-08 --galaz claude/jolly-thompson-paz6d8`
  - `.\Get-Prompt.ps1 01-odkrywanie -Tryb fix -Zadania ER-06,ER-07,ER-08 -CopyToClipboard`
- Potem (P-002): **03-zakres Zakres i kontrakt MVP**, tryb `build`; nowa sesja: opus, wysiłek high.
  - `node tools/assemble.mjs 03-zakres --tryb build --galaz claude/jolly-thompson-paz6d8`
  - `.\Get-Prompt.ps1 03-zakres -Tryb build -CopyToClipboard`
- Paczka wejściowa 03: `CLAUDE.md`, `docs/brd/` (po poprawce 01), `docs/monetyzacja.md` (E1 „Wartość funkcji”, E3 „Podział darmowe / Pro”, KP-01), `docs/decyzje.md` (P-027–P-038), `docs/zalozenia.md`.
- Dla kolejnych ról (`docs/monetyzacja.md`, E3 „Przekazanie”): 04 ekran zakupu, ujawnienia (1)–(7), KP-02, KP-03, KP-10; 05 ADR biblioteki według P-036 (wzorzec Treningu, wersja ≥ 14 dni), KP-06–KP-09, OP-22, OP-23; 07 wektory dostępu i scenariusze „tylko telefon”, OP-21; 08 `dostep.mjs` i KP-01–KP-11.
- Otwarte decyzje: brak w roli 02. Właściciel: kroki w App Store Connect po ADR roli 05 (`docs/monetyzacja.md`, E3), w tym sprawdzenie istniejącego produktu Oczka, ID i włączenie Family Sharing (P-038); dane do testu P-029 po wydaniu.
- Kwarantanna (P-003, P-015) obowiązuje role 01–04.

### Przekazanie roli 01 (archiwalne, 2026-10-21)
- Zakończono: 01-odkrywanie, build, commit na gałęzi `claude/jolly-thompson-paz6d8`; artefakty: `docs/brd/` (README z definicją ukończenia i blokerami, odkrywanie, wymagania + 4 moduły, reguly, zrodla), `tests/wektory/brd.json`, `docs/zalozenia.md` (ZAL-017–024), decyzje P-017–P-026; materiały prywatne `oczko-warsztat/01-odkrywanie/`.
- Następny krok ścieżki (P-002): **02-monetyzacja Monetyzacja, sesja 2**, tryb `build` (bez `--moduly`: model i kontrakt płatności); nowa sesja: opus, wysiłek high; gałąź `claude/jolly-thompson-paz6d8`.
- Polecenie:
  - `node tools/assemble.mjs 02-monetyzacja --tryb build --galaz claude/jolly-thompson-paz6d8`
  - `.\Get-Prompt.ps1 02-monetyzacja -Tryb build -CopyToClipboard`
- Paczka wejściowa: `CLAUDE.md`, `docs/brd/README.md`, `docs/brd/odkrywanie.md` (rynek, OG-02, OG-03, H-01–H-03, H-09), `docs/brd/wymagania-dane.md` (BR-ZAK-001–004, BR-DAN-005), `docs/monetyzacja.md`, `docs/decyzje.md` (P-019 ceny właściciela, P-025), `docs/zalozenia.md` (ZAL-016–018).
- Dla kolejnych ról:
  - 03: BR według modułów i PR-01–PR-14, H-04–H-08 (zakres, funkcje „wow”, podział: rekomendacja jedna aplikacja z warstwami), napięcie ZP-07 a zasada 18, blokery wydania, tabela patentowa OG-07 (P-024).
  - 04: ZP-04, NFR-DOS-001/002 (OP-16), kontekst użycia (ręce zajęte, telefon na stojaku), BR-LIC-004/009 (blokada, widoczne przypomnienie).
  - 05: RYZ-05 (Expo a CloudKit, Watch, widżety, Live Activities, Foundation Models), OG-09, OG-11, NFR-WYD-001 (OP-17), NFR-KOS-001.
  - 06: RD-01–RD-13 i S-18–S-31 do rejestru twierdzeń; krytyczne RD-01–RD-04, RD-07, RD-08, RD-10 i BR-SLO-001 (przegląd zastępczy D-027); OP-02, OP-04–OP-07, OP-10, OP-12, OP-13.
  - 07 i 08: `tests/wektory/brd.json` tylko do odczytu (zmiana przez ER do roli 01); blokery wydania z `docs/brd/README.md`.
  - 09: NFR-JEZ-001, OP-12 (terminologia w 35 językach), OG-11 (AI bez części języków).
  - 12: NFR-DAN-001–003, BR-DAN-001–009, RYZ-02 (synchronizacja iCloud myli liczbę także u Loopsy).
- Właściciel (kroki zewnętrzne): OP-09 e-mail do Craft Yarn Council o użyciu tabel i symboli; decyzje OP-03 (próbka 4 in), OP-11 (pielęgnacja tekstem), OP-15 (przypomnienie o przerwie) dla roli 03.
- Kwarantanna (P-003, P-015) obowiązuje role 02–04.
