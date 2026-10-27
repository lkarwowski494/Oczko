# Rola 08 (programista), build, partia 6: wzory, rysik, iPad, rozszerzenie „Udostępnij do Oczka”
Plik stanu sesji · start 2026-10-26 ok. 19:40 UTC · gałąź `claude/jolly-thompson-paz6d8` · zlecenie koordynatora P-241 (decyzje P-087).
Prompt roli: **nie złożony** — `add_repo` dla repo `prompts` odrzucony przez kontrolę uprawnień sesji; praca według `CLAUDE.md` i procedury partii 1–5 (testy przed kodem, verify przed pushem, STOP-y), zgłoszone koordynatorowi w raporcie E0.
Zakres: „Kontrakt partii 6” i „Fundament partii 6 i 7” w `docs/architektura/moduly.md`; projekt 04: `docs/design/fix7-2026-10-26.md`, design-spec „Wzór, rysik i iPad”, „Udostępnij do Oczka” i iCloud (część R), makiety `wzor.html`, `udostepnij-icloud.html`; ograniczenia patentowe P-218 (1)–(6) przy każdej funkcji wzoru; dopiski koordynatora: P-229 (łatka kluczy w pierwszym commicie ekranów), P-234 (`entitlements` App Group w celu rozszerzenia), P-237 (`oczkoE2eSzerokoscOkna`, `wzor-znacznik`), P-238/P-240 (E2E tylko przez `tryb-e2e.ts`; `jakosc:slady-wydania` kod 0 przed raportem), P-241 (okno pushy).

## Stan · 2026-10-27 ok. 02:55 UTC
Gałąź robocza = 94a7657 (45c09b2 + naprawa kompilacji `skanerDostepny`: `runOnQueue` tylko dla AsyncFunction), verify 2522/2522. „Jakość · iOS” 40435750666: build i swift-test (z Pakietem) zielone; e2e część 1 iphone zielona; część 2 iphone czerwona — 01-nfr-pie-001 przy 3. czystej instalacji: `DeviceUnreachableException` (sterownik nie widzi SpringBoard, launchApp 57 s; brak awarii Oczko). P-257: bez ponowienia (9a); pomiarem przebieg z pushem partii 7 — 01 znów czerwony → przyczyna w partii 6 (reinstalacja z appex), zielony → partia 6 przyjęta. Do sygnału bez pushy na roboczą; zapis na kopii co ≤30 min. W1–W3 czekają na macOS.

**Okno maszyn — kolejność:** (1) rebase `partia6-lokalna` na roboczą, verify; (2) push (build iOS z nowym modułem i celem); (3) poprawki kompilacji Swift; (4) W1–W3 według `partia-6-natywne.md`; (5) E2E iPhone (21, 22, 26, 27, 45, 52) i iPad (44, 46, 47) informacyjnie; (6) `npm run jakosc:slady-wydania` kod 0 → raport E2.

**Otwarte:** Swift celu share i `Pakiet` na D1a (`sciezki`) i D2a (`jezyk` w migawce) — w lokalnej gałęzi; liczba stron wzoru nie jest w schemacie (opis wiersza bez „· N pages”) — do 05/04; e2e-wzor-www i e2e-wzor-word (scenariusze 24, 25) bez paneli; notatka wzoru bez znacznika (design-spec) — przepływ jeszcze nie podpięty; wiersz zegarka w Stanie danych na iPadzie (plik partii 7).

## E0.1 Środowisko
| Sprawdzenie | Wynik |
|---|---|
| System, Node, git | Linux 6.18, Node 22.22.0; tożsamość git „Łukasz Karwowski <336954459+lkarwowski494@users.noreply.github.com>” |
| GitHub | push na gałąź roboczą; `oczko-warsztat` dołączony (49299cb); `prompts` niedostępny (odmowa uprawnień) |
| Xcode / Swift / symulator | brak — Swift, prebuild, build i E2E tylko w CI „Jakość · iOS” (`macos-26`) i w oknie maszyn (P-187) |
| Repo | publiczne: bez sekretów, danych osobowych i nazw innych firm/aplikacji (P-121 (5)) |

## E0.2 Stan wyjściowy (HEAD eef6c9e, `npm ci`, `env -u NODE_PATH npm run verify`)
Kod 0, 187 zestawów, **2330/2330**.

## E0.3 Co jest w kodzie (sprawdzone)
- Schemat v1 po L1: `wzor` (wiele wierszy na projekt, `zrodlo` ∈ pdf/obraz/www/word, `usunieto_ms`), `rysunek` (PK wzor_id, strona). Brak kolumny obrotu strony.
- `src/przypadki-uzycia/wzor.ts`: `importujWzor` (tylko PDF, kontrola nagłówka i `%%EOF`), `ustawZnacznik`, `dodajNotatkeWzoru`; `src/ekrany/Wzor.tsx` = tylko `LinkFilmu`. Ekranu wzoru, modułu `oczko-wzor`, celu `targets/share` i adapterów skrzynki/migawki/orientacji nie ma.
- Porty v2 w `src/domena/porty.ts` (SkrzynkaImportu, MigawkaProjektow, KonwersjaWzoru, SkanerStron, Orientacja) — zamrożone.
- CI: zadanie iPada w `jakosc-ios.yml` (macierz `urzadzenie: [iphone, ipad]`, pakiet `ipad`, informacyjnie) i podpis `.appex` plikiem celu w `testflight.yml:157` (`uprawnienia-celow.mjs`) — zrobione przez 07 i 10, zgodne z kontraktem; partia 6 ich nie zmienia.
- `tests/akceptacja/` pusty: testy oczekujące z kontraktu piszę sam (testy przed kodem) w `tests/dane/` i `tests/ekrany/`.

## E0.4 Plan (każdy krok: test czerwony z właściwego powodu → kod → zielony)
| Krok | Zachowanie → test | Pliki | Push |
|---|---|---|---|
| K1 | łatka kluczy 04 fix-7 (150 en), powody `brak_sieci`, `odmowa`, `pusty`, `anulowano`, stałe `WZOR_MAKS_MB`, `RYSUNEK_ZAPIS_MS`, `SKRZYNKA_PORZUCONE_H`, `MIGAWKA_WERSJA` | `src/i18n/`, `bledy.ts`, `konfiguracja.ts` | Linux |
| K2 | `dodajWzor` (pdf, word z oryginałem, obrazy → 1 wzór, adres; konwersja i `sprawdzPdf` poza transakcją), `listaWzorow`, `wzorDoOtwarcia`/`zapamietajWzor`, `usunWzor`/`przywrocWzor` (kosz), `zapiszRysunek`, warunek kosza w znaczniku i notatce; kosz i sprzątanie znają `wzor` → `tests/dane/wzor-dodaj.test.ts`, `wzor-usun.test.ts`, `tests/ekrany/kompozycja-projektu.test.ts` | `src/przypadki-uzycia/wzor.ts`, `kosz.ts`, `src/dane/repozytoria/kosz.ts`, `src/kompozycja/projekt.ts`, `app/kosz.tsx` | Linux |
| K3 | skrzynka importu: `przetworzSkrzynke` (manifest, porzucone po `SKRZYNKA_PORZUCONE_H`, projekt niedostępny → do wyboru, błąd zostawia zlecenie), krok startu po `sprzatnijKosz`; migawka projektów (koperta, zapis atomowy, po COMMIT operacji listy, „Usuń wszystkie dane” → pusta) — adapter plikowy na App Group z katalogiem z modułu natywnego | `src/przypadki-uzycia/skrzynka.ts`, `src/platforma/{skrzynka,migawka}.ts`, `start.ts`, `kontener.ts`, `zaleznosci.ts` | Linux (adapter bez modułu natywnego → no-op) |
| K4 | `tryb-e2e.ts`: `oczkoE2eSkrzynka=pdf` (zlecenie z manifestem przed pierwszym ekranem), `oczkoE2eSzerokoscOkna=<pt>` (kontener tej szerokości); tylko przy `EXPO_PUBLIC_E2E=1`; `jakosc:slady-wydania` kod 0 | `src/platforma/tryb-e2e.ts`, `src/kompozycja/e2e/` | Linux |
| K5 | czyste funkcje: układ według szerokości okna (compact → telefon, regular → kolumna 640 pt, wzór poziomo obok licznika — W4b) i polityka rysika (`pencilOnly` po pierwszym rysiku, P-218 Q2a) → testy jednostkowe | `src/domena/uklad.ts`, `src/domena/rysik.ts` | Linux |
| K6 | ekrany: przeglądarka wzoru (pasek licznika W1a, poziomo W3, iPad W4b, narzędzia W5a, przełączanie W9b, menu, usunięcie do kosza, znacznik `wzor-znacznik`), grupa wzorów na projekcie (W8), dodanie (W7a, stany W11), ikona „Pattern” na liczniku (W2a), arkusz skrzynki (R2), kolumna 640 pt na iPadzie → testy RNTL | `src/ekrany/Wzor*.tsx`, `app/wzor*`, `Licznik.tsx`, `Projekt.tsx`, `ListaProjektow.tsx` | po oknie maszyn (wymaga modułu natywnego w buildzie) |
| K7 | natywne: moduł `modules/oczko-wzor` (WidokWzoru: PDFView + PencilKit na stronach, konwersja WKWebView/druk, skaner VisionKit, `sprawdzPdf`, migawka i skrzynka App Group), cel `targets/share` (reguła aktywacji bez TRUEPREDICATE, kopia strumieniowa, manifest na końcu, `entitlements` App Group — P-234), `expo-screen-orientation` 57.0.3 (wiersz ADR-0016) | `modules/oczko-wzor/**`, `targets/share/**`, `package.json`, `app.json` | tylko w oknie maszyn (P-187, P-241) |
| K8 | eksperymenty W1–W3 przygotowane (XCTest, korpus `.docx`, PDF 100 MB/300 stron) i opisane do uruchomienia przez koordynatora | `modules/oczko-wzor/ios/Tests/`, ten plik | z K7 |

## E0.5 Sprzeczności i luki (zgłoszone; praca idzie dalej)
- **S1 → P-243 S1a:** `ProjektMigawki` z `ostatniaPracaMs` i `wzory` (porty.ts, moduly.md, prywatnosc.md).
- **S2 → P-243 S2a:** kosz wzoru; teksty robocze `usun.wzor_opis`, `kosz.wzor` do zatwierdzenia przez 04.
- **S3 (P2, 05):** obrót strony (04: „zapamiętuje dla strony”) nie ma miejsca w schemacie v1 — do decyzji (kolumna JSON we `wzor`, ustawienie urządzenia albo obrót tylko na czas oglądania).
- **S4 (P2, 04/05):** link do filmu — `[DO USTALENIA 08 z 04]` w kontrakcie (bez nowej tabeli) — do decyzji przed ekranem grupy wzorów.

## Odstępstwa nazwane
- Krok „skrzynka importu” nie jest w `uruchomDane` (`start.ts`), tylko w kompozycji po nim: `dodajWzor` czeka na sieć poza transakcją i sam wchodzi do kolejki, więc w pozycji kolejki startu by się zakleszczył. Kolejność bez zmian: po `sprzatnijKosz`, przed krokiem partii 7.
- Błąd importu ze skrzynki (uszkodzony, typ, strona pusta): zlecenie zostaje do potwierdzenia alertu `skrzynka.nie_dodano`, potem `odrzucZlecenie` (kontrakt: „zlecenie zostaje”; 04 R2: „pozycja znika” — oba spełnione: nic nie ginie po cichu). Strona bez sieci czeka bez błędu (`czekaSiec`).
- Migawka: podmiana pliku = usunięcie + przeniesienie (expo-file-system nie ma atomowego `rename` z nadpisaniem); w krótkiej chwili bez pliku rozszerzenie pokazuje stan zastępczy — bez utraty danych.
- `ostatnie_miejsce` dla wzoru: `{ ekran: 'licznik', id, wzor }` zamiast `{ ekran: 'wzor', id }` z kontraktu — wpis `ekran: 'wzor'` zgubiłby ostatni licznik startu (F-49, `biezacyLicznik` czyta tylko `ekran: 'licznik'`); wzór i tak otwiera się z licznika (pasek licznika pod wzorem).
- `sprawdzPdf` nie należy do portu `KonwersjaWzoru` (kontrakt: funkcja modułu `oczko-wzor`) — w przypadkach użycia typ `KonwersjaPlatformy = KonwersjaWzoru & { sprawdzPdf }`, port bez zmian.

## Czas (zasada 9)
Agent: K1–K5 ok. 6–8 h, K6 ok. 8–10 h, K7–K8 ok. 8–12 h (bez kompilacji tutaj — poprawki w oknie maszyn). Czekanie: okno maszyn (K7, W1–W3, E2E iPada), odpowiedzi na S1–S4. Właściciel: identyfikatory App Group i iCloud w portalu (P-233), iPad przy TestFlight (P-226).

## Dziennik sesji
- 2026-10-27 01:19–02:55 UTC: okno P-256 — push 45c09b2 (build czerwony: runOnQueue na Function), 94a7657 (build/swift-test zielone, e2e 01 czerwony na maszynie?); raport do koordynatora; P-257 (c).
- 2026-10-26 ~20:15–21:00 UTC: K6a (b27607b), P-246 (168204b), błąd procesu: push b27607b po rebase bez verify → 50da380 (P-248); K7 od pod-agenta (worktree, scalony do `partia6-lokalna`); widokWzoru, kompozycja wzoru, wiring tras lokalnie; orientacja; P-248 D1a/D2a.
- 2026-10-26 ~20:00–20:10 UTC: K1–K2 (f5ac639), P-243 (S1a, S2a), P-244 (gałąź kopii); K3 skrzynka i migawka (adaptery App Group przez expo-file-system `Paths.appleSharedContainers`), K4 argumenty E2E, K5 `ukladOkna` i `politykaPlotna`.
- 2026-10-26 ~19:40–20:00 UTC: E0 — stan wyjściowy 2330/2330, plan K1–K8, S1–S4; raport do koordynatora (bez czekania).
