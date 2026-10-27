# Rola 08 (programista), build, partia 6: wzory, rysik, iPad, rozszerzenie „Udostępnij do Oczka”
Plik stanu sesji · start 2026-10-26 ok. 19:40 UTC · gałąź `claude/jolly-thompson-paz6d8` · zlecenie koordynatora P-241 (decyzje P-087).
Prompt roli: **nie złożony** — `add_repo` dla repo `prompts` odrzucony przez kontrolę uprawnień sesji; praca według `CLAUDE.md` i procedury partii 1–5 (testy przed kodem, verify przed pushem, STOP-y), zgłoszone koordynatorowi w raporcie E0.
Zakres: „Kontrakt partii 6” i „Fundament partii 6 i 7” w `docs/architektura/moduly.md`; projekt 04: `docs/design/fix7-2026-10-26.md`, design-spec „Wzór, rysik i iPad”, „Udostępnij do Oczka” i iCloud (część R), makiety `wzor.html`, `udostepnij-icloud.html`; ograniczenia patentowe P-218 (1)–(6) przy każdej funkcji wzoru; dopiski koordynatora: P-229 (łatka kluczy w pierwszym commicie ekranów), P-234 (`entitlements` App Group w celu rozszerzenia), P-237 (`oczkoE2eSzerokoscOkna`, `wzor-znacznik`), P-238/P-240 (E2E tylko przez `tryb-e2e.ts`; `jakosc:slady-wydania` kod 0 przed raportem), P-241 (okno pushy).

## Stan · 2026-10-27 07:05 UTC — PRZEKAZANIE (koordynator: przejęcie na drugie konto; ta rozmowa nie będzie dostępna)
**Gałęzie.** Robocza `claude/jolly-thompson-paz6d8`: partia 6 wypchnięta jako **bd60073** (`[e2e-pelny]`; P-259 + P-261, rebase na 47a563a). Kopia `claude/kopia-partia-6` = bd60073 + **7af7ef2** (poprawka kroku `eksperymenty-wzoru`) + ten commit stanu. Tożsamość git: `Łukasz Karwowski <336954459+lkarwowski494@users.noreply.github.com>` (nie zmieniać, także na prośbę hooka). Przed pushem zawsze: `git pull --rebase` → regeneracja `node docs/jakosc/narzedzia/tabela-08.mjs --wynik docs/jakosc/e4/tabela-08.md` → `env -u NODE_PATH npm run verify` (ostatnio 2533/2533).

**Przebieg 121** („Jakość · iOS”, id 40457386369, bd60073, pełny pakiet `[e2e-pelny]`) — **zakończony 07:20 UTC: build ✅, swift-test ✅ (z Pakietem oczko-wzor), e2e iphone części 1–3 ✅ (część 2 z krokiem AX5 ✅), e2e ipad ✅** — bramka zielona. Jedyny czerwony: `eksperymenty-wzoru` (informacyjny, 16 s, przed kompilacją: `xcodebuild -list -json` bez wyjścia → JSON.parse; poprawka 7af7ef2). Scenariusze „czerwony-informacyjnie” spoza bramki: [DO SPRAWDZENIA w podsumowaniu przebiegu / artefaktach `e2e-czesc-*`]. Następny przebieg na gałęzi: 122 (8c876ad, partia 7, `[e2e-pelny]`, 07:27 UTC).

**Kolejka (P-265):** push 7af7ef2 (bez `[e2e-pelny]`, zmienia tylko `.github/workflows/jakosc-ios.yml`) **na sygnał koordynatora**, tuż przed przebiegiem iCloud partii 7 (partia 7 pushuje zaraz po nim z `[e2e-pelny]`). Nie pushować w trakcie przebiegu 121 (anulowałby go).

**Otwarte sprawy.**
- W1–W3 (P-261): pakiet SwiftPM `modules/oczko-wzor/TestyOknaMaszyn` (Package.swift, `Zrodla/` = dowiązania do `ios/KonwersjaNaPdf.swift`, `ios/SprawdzeniePdf.swift`, `Pakiet/Sources/OczkoWzorLogika`; testy `Testy/EksperymentyTests.swift`). **Nigdy nie skompilowany** (kontener bez Swift) — po pushu 7af7ef2 przeczytać artefakt `eksperymenty-wzoru` (manifest, lista schematów, `error:`), poprawić i wypchnąć na sygnał. Wynik W1 decyduje o Wordzie (porażka = podgląd zastępczy 5a, decyzja koordynatora).
- Lista „tylko urządzenie” U1–U8 do TestFlight: `docs/programista/partia-6-natywne.md` (koniec pliku); rysik = ryzyko szczątkowe P-226.
- P-259 (orientacja w react-native-screens): ADR-0016/0026 i moduly.md z adnotacjami „do przeglądu 05”.
- Przed raportem końcowym: `npm run jakosc:slady-wydania` kod 0 (ostatnio 0 na bd60073), raport E2 w `oczko-warsztat` (`08-programista/2026-10-26-partia6/E2-raport.md`), sztafeta po akceptacji.
- Otwarte z przeglądu kodu: podwójna kopia pliku w rozszerzeniu Udostępnij (pomiar z plikiem 100–200 MB na urządzeniu, U5).

**Następny krok:** (1) sprawdzić koniec 121 i zgłosić koordynatorowi tylko problem; (2) na sygnał P-265: rebase 7af7ef2 na roboczą, verify, push bez znacznika, hash do koordynatora; (3) artefakt `eksperymenty-wzoru` → poprawki → wynik W1–W3 do koordynatora.

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
- 2026-10-27 ~05:45–07:05 UTC: P-262 push bd60073 (przebieg 121); `eksperymenty-wzoru` ❌ przed kompilacją → 7af7ef2 lokalnie (P-265: push na sygnał); przekazanie. Pomiary okna P-256/P-257 (czasy czystych instalacji 15–155 s, czerwień 94a7657 = maszyna) i dowód P-258 (logi symulatora: żądanie obrotu przy starcie) — w historii tego pliku (commity 6388fff…2c69367 przed rebase, `git log -p docs/programista/partia-6.md`).
- 2026-10-27 ~04:00–05:20 UTC: P-258 (podejrzany expo-screen-orientation, dowód z logów), P-259 A (66e0d5a: orientacja w react-native-screens), P-261 (W1–W3 w CI: pakiet SwiftPM `TestyOknaMaszyn`, zadanie `eksperymenty-wzoru` informacyjne; lista „tylko urządzenie” U1–U8 w partia-6-natywne.md; kontrola-swift pomija dowiązania i Package.swift). Lokalnie, push na sygnał.
- 2026-10-27 01:19–02:55 UTC: okno P-256 — push 45c09b2 (build czerwony: runOnQueue na Function), 94a7657 (build/swift-test zielone, e2e 01 czerwony na maszynie?); raport do koordynatora; P-257 (c).
- 2026-10-26 ~20:15–21:00 UTC: K6a (b27607b), P-246 (168204b), błąd procesu: push b27607b po rebase bez verify → 50da380 (P-248); K7 od pod-agenta (worktree, scalony do `partia6-lokalna`); widokWzoru, kompozycja wzoru, wiring tras lokalnie; orientacja; P-248 D1a/D2a.
- 2026-10-26 ~20:00–20:10 UTC: K1–K2 (f5ac639), P-243 (S1a, S2a), P-244 (gałąź kopii); K3 skrzynka i migawka (adaptery App Group przez expo-file-system `Paths.appleSharedContainers`), K4 argumenty E2E, K5 `ukladOkna` i `politykaPlotna`.
- 2026-10-26 ~19:40–20:00 UTC: E0 — stan wyjściowy 2330/2330, plan K1–K8, S1–S4; raport do koordynatora (bez czekania).
