# Stan sztafety
Ścieżka: greenfield z ponownym użyciem kodu (P-001, P-002) · Aktualizacja: 2026-10-25 (koordynator: P-087, P-088; rola 07: STOP E4; rola 03 audit: STOP E3)

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
| 04 Studio projektowe | build | zakończona 2026-10-22 (STOP E4; E0: P-061, E1: P-062, E2: P-063 kierunek A, P-064 Libre Franklin, E3: P-065; ta sama sesja co fix 01, wyjątek zasady 19) | (ten commit) | docs/design/ (design-spec.md, tokeny.json, kontrast-tabela.txt 44/44, ekrany.html + wzorce-zrzuty/ 84, prototyp.html + przejscie/, ikona/, fonty/, narzedzia/, porownanie, kroje) | P-065 (1a) do potwierdzenia przez 02; makiety wzoru, zegarka, ekranu blokady, kalendarza i Ustawień w audycie 04 |
| 01 Odkrywanie, fix ER-29 | fix (P-065) | zakończona 2026-10-22 (STOP E2 przyjęty, P-066): ER-29 naprawione-do-weryfikacji, **warunkowe** do potwierdzenia przez 02 | 3d64639 | BR-ZAK-006, BR-ZAK-005, errata ER-29; oczko-warsztat `01-odkrywanie/fix-2026-10-22-er29/` | potwierdzenie P-065 (1a) przez 02 |
| 02 Monetyzacja, fix NZ-01, NZ-02, P-065 | fix (P-060 (5b), P-065) | zakończona 2026-10-22 (E0: P-067, E2: P-068): naprawione-do-weryfikacji; P-065 (1a) potwierdzone, warunek P-066 spełniony | 90b2272 | `limit.mjs` (`wolaStraznika`, `mozeZaczacDzien`), wektory S, L-16–L-18, Z (35/35), KP-12, KP-13, KP-15; oczko-warsztat `02-monetyzacja/2026-10-22-fix-nz/` | ER-30 do 01 |
| 01 Odkrywanie, fix ER-30 | fix (P-068) | zakończona 2026-10-22 (STOP E2 przyjęty, P-069): ER-30 naprawione-do-weryfikacji | 28a488b | BR-ZAK-005, BR-ZAK-006, BR-LIC-017, OP-32 zamknięte, errata; oczko-warsztat `01-odkrywanie/fix-2026-10-22-er30/` | — |
| 05 Architekt | build | **zakończona 2026-10-22** (E0 P-070, E1 P-071, E2 P-072, E3 P-073, E4 P-074; 2026-10-22; ta sama sesja, wyjątek zasady 19) | (ten commit) | docs/architektura/e0-rozpoznanie.md, docs/architektura/rejestr/ (apple, expo, sqlite), docs/architektura/eksperymenty/e0/, docs/architektura/e1-decyzje.md, docs/adr/0001–0015, eksperymenty/e1/, docs/architektura/e2-moduly-dane.md, moduly.md, dane.md, schemat.sql, stany.json, narzedzia/sprawdz-schemat.mjs, e3-tlo-bledy-prywatnosc-wydajnosc.md, prywatnosc.md, ADR-0016, narzedzia/granice.mjs, README.md, e4-przekazanie.md; ZAL-030 | dla 10: rola klucza ASC API, wariant podpisu, OP-25, „collected” dla CloudKit |
| 12 Niezawodność, wejście wczesne | build, tylko E0–E1 (P-005) | **E0–E1 zakończone 2026-10-22** (E0: P-079, E1: P-080); E2–E3 po roli 08 | (ten commit) | docs/niezawodnosc/ (e0-rozpoznanie.md, e1-decyzje.md, eksperymenty/wal-kopia.*), ADR-0018–0021; kopie źródeł: oczko-warsztat/12-niezawodnosc/2026-10-22-build/zrodla/ | interpretacje P-080 do weta (próg 2, kopie 30 dni, „6a”, integralność po błędzie); ekran awaryjny do 04 |
| 06 Treści | build | **zakończona 2026-10-23** (E0 P-081, E1 P-082, E2 P-083, E3 P-084–P-086; przegląd zastępczy D-027; ta sama sesja, wyjątek zasady 19) | (ten commit) | docs/tresci/ (README.md, parametry.json, wektory.json, nazwy-zrodel.json, stan.md), scripts/sprawdz-nazwy-zrodel.mjs, tests/tresci/nazwy-zrodel.test.ts; rejestr 103 twierdzeń, treści en, kopie źródeł, 3 weryfikacje: oczko-warsztat/06-tresci/2026-10-22-build/ | ER-31–ER-33 do 01; warunki wyświetlania i rozdzielczość wpisu próbki do 04/05; zestaw przekładu do 09 (po 08 i audycie 04); kategoria 8 CYC: ponowny odczyt do 2027-01-23 |
| 07 Jakość | build (moduły e2e-mobilne, wlasnosci-i-domena, wydanie; geo-slady nie dotyczy) | **zakończona 2026-10-25** (E0 P-090, E1 P-091, E2 P-092, E3 P-096, E4 przyjęte przez koordynatora wg P-087) | (ten commit) | docs/jakosc/ (strategia.md, e0–e4, e1-ryzyka.md 185 ryzyk, zgloszenia.md, e4/tabela-08.md, narzedzia/), tests/akceptacja/ (980 testów przed kodem), tests/jakosc/, tests/narzedzia/, tests/wspolne/, tests/dane/, e2e/ (32 scenariusze), zaślepki src/domena, src/dane, src/przypadki-uzycia, src/ekrany, scripts/jakosc/, scripts/ci/, .github/workflows/jakosc-{linux,ios}.yml | sygnatury Z07-22 i zgłoszenia ER-34–ER-44, Z07-01–Z07-23 do sesji fix 01/02/05 (przed 08); lista „tylko telefon” TT-01–TT-11 przy TestFlight |
| 03 Zakres, krok porównania z kodem | audit, `--moduly inwentarz-funkcji` (P-078) | **STOP E3 2026-10-25** (E0: P-098) | (ten commit) | docs/porownanie-kodu.md (lista zadań dla 08: werdykt per F i per plik 0.1.0); raport z dowodami: oczko-warsztat/03-zakres/2026-10-25-audit/ (6 znalezisk: 4 × P1, 2 × P2; `sprawdz-raport` kod 0) | D1 partia porządkowa 08 (rekomendacja a); D2 fix 03 przed 08 (001, 005, 006; rekomendacja a) |
| 01 Odkrywanie, fix ER-31–ER-44 | fix (P-090 Q3a, P-091, P-097) | **STOP E2 2026-10-25**: ER-31–ER-44 i NZ-05 naprawione-do-weryfikacji (E0: P-097) | d87ea8b | docs/brd/ (RD-03, RD-04, RD-09–RD-17, nowa RD-19, BR-LIC-003/004/005/007/009/012/017/018/019/020, BR-DAN-006, BR-DNI-002/005/006, BR-KAL-001/003, BR-ZAP-003, BR-PRJ-004, BR-WZR-007, S-40, S-41, OP-03, OP-09), `docs/brd/narzedzia/kontrola-brd.mjs` (generator + `--zgodnosc`), `docs/brd/wektory.schema.json`, `tests/wektory/brd.json` (160 wektorów, typowany); dowody: oczko-warsztat `01-odkrywanie/fix-2026-10-25-er34-44/` (przed 0/65, po 65/65) | polecenia dla 07/08 (zgodność `brd.json` w `verify`, 8 plików testów), 05, 02 (L-19), 04 (NZ-06), 09; status „zweryfikowane” nadaje reaudit |
| 02 Monetyzacja, fix Z07-07–Z07-09, L-19, Z07-01, Z07-02 | fix (P-091 11a, P-100, P-103) | **STOP E2 2026-10-25**: naprawione-do-weryfikacji (E0: P-103) | 872ca55 | docs/monetyzacja/ (limit.mjs, dostep.mjs, wektory 77 + 56, testy z własnościami), docs/monetyzacja.md (KP-06/07/12/15, KP-16, KP-17, krok właściciela 6, tabela „tylko telefon” V4); dowody: oczko-warsztat `02-monetyzacja/2026-10-25-fix-z07/E2-dowody.md` | polecenia dla 05 (`scal` pro = OR, flaga okna, `karencjaDo`, `proZegarka` w Swift), 07 (`mutanty-e1.mjs`: 5 wzorców sprzed poprawki), 08, 04; właściciel: Billing Grace Period przy konfiguracji ASC |
| 03 Zakres, fix 001, 005, 006 | fix, `--moduly zmiany-zakresu` (P-099 D2a) | **STOP E2 2026-10-25**: 03-zakres-001, -005, -006 naprawione-do-weryfikacji (E0: P-102) | 39bbecf | docs/scope-contract.md: F-63 (limit dni i strażnik, BR-ZAK-005–007), F-64 (prośba o ocenę, BR-DAN-012), ZM-01–ZM-07, kolumna „Intuicyjność” (14 wyników, 37 × „brak”); `zakres-oczko.mjs` kod 1 → 0 (84 BR, uwaga apetytu 46 h: P-102); dowody: oczko-warsztat `03-zakres/2026-10-25-fix/` | ER-45, ER-46 do 01; koszt ZM 1,25 h [OCENA] ponad ranking; status „zweryfikowane” nadaje reaudit |
| 05 Architekt, fix Z07-11–Z07-19, Z07-22 (+ ER-40–42, polecenia 02 i 03) | fix (P-091 11a, P-100, P-109, P-099) | **STOP E0 2026-10-25**: plan i klasyfikacja, pytania Q1–Q9 do koordynatora | (ten commit) | docs/architektura/fix-2026-10-25.md | Q1–Q9 (koordynator wg P-087) |

## Następny krok
### Przekazanie roli 02, fix Z07-07–Z07-09, L-19, Z07-01, Z07-02 (2026-10-25, STOP E2)
- Zakończono E0–E2 (P-103); commity cb9f702, 3bc0a14, 33b830c, b8d7cd6, bfc1689, 872ca55, 9071049; dowody `oczko-warsztat/02-monetyzacja/2026-10-25-fix-z07/E2-dowody.md`.
- Wektory: limit 77 (`node docs/monetyzacja/limit-test.mjs`), dostęp 56 (`node docs/monetyzacja/dostep-test.mjs`); mutanty limit/dostęp: 0 przeżywa. `npx jest` 1080/1080.
- Dla 05: `scal` dni po dacie, `pro` = OR (L-20); flaga okna „Uczciwe zasady” w danych i kopii (KP-16); `karencjaDo` w adapterze (KP-06); `proZegarka` w Swift na PZ-* (KP-17). Dla 07: zastąpić 5 wzorców „BRAK WZORCA” w `mutanty-e1.mjs`. Właściciel: krok 6 w `docs/monetyzacja.md`.

### Przekazanie roli 03, fix 001, 005, 006 (2026-10-25, STOP E2)
- Zakończono: jeden commit na ID (99bdc4d, a3adcc6, 39bbecf); dowody: `oczko-warsztat/03-zakres/2026-10-25-fix/E2-dowody.md`.
- Kolejność budowy dla 08: F-35 → F-63 → F-11 → F-12 (strażnik przed zegarkiem i ekranem blokady); F-64 na końcu (po F-53).
- Dla 01: ER-45 (kryteria: język w aplikacji, „Translation quality”, jednostki, „Źródła wiedzy”), ER-46 (BR-ZAK-006: okno „Uczciwe zasady”, karta po imporcie). Dla 02: ZM-05 a KP-10, KP-14. Dla 04: okna i ekrany z ZM-03–ZM-05; 37 MVP bez wyniku przejścia do audytu 04. Dla 07: testy BR-ZAK-005–007 i BR-DAN-012 z F-63, F-64 (Z07-03).
- STOP E2 przyjęty (P-105). NZ-04: nazwy aplikacji i serwisów w `docs/scope-contract.md` zastąpione opisem (jak NZ-08); nazwy zostają w oczko-warsztat `03-zakres/2026-10-22-build/`. **Dla 07:** test marek `tests/brands.contract.test.ts` nie obejmuje `docs/` — rozszerzyć (dziś nazwy zostają m.in. w `docs/scope-contract-historia.md`, 11 wierszy).
- Następny krok bez zmian: sesje fix 02 i 05, potem 08-programista.

### Przekazanie roli 01, fix ER-31–ER-44 (2026-10-25, STOP E2)
- Zakończono: 01-odkrywanie, fix (P-097), jeden commit na ID (71b755c…d87ea8b); dowody i polecenia dla ról: `oczko-warsztat/01-odkrywanie/fix-2026-10-25-er34-44/E2-dowody.md`.
- `brd.json` ma nowy kształt (zbiory i listy jako tablice, `true`/`false`, `null`): zgodność `node docs/brd/narzedzia/kontrola-brd.mjs docs/brd --zgodnosc=tests/wektory/brd.json` (do `jakosc:kontrole` przez 07/08).
- `npm run verify` na HEAD: jedyna czerwień `tests/brands.contract.test.ts` przez `docs/porownanie-kodu.md` (6badc4b, 03 audit) — nie z fixu 01.
- Następny krok bez zmian: sesje fix 02 i 05 (Z07-…), potem 08-programista.

### Przekazanie roli 03, audit — krok porównania z kodem (2026-10-25, STOP E3)
- Zakończono E0–E3 (P-098); lista zadań dla 08: `docs/porownanie-kodu.md`. Kod 0.1.0: z 49 funkcji MVP 1 zostaje (rachunek F-06), 7 do przepisania, 41 nowe; ok. 60 plików do usunięcia. Kurs zakresu bez zmian (linia bazowa 2026-10-25: YarnPal, Loopsy, knitCompanion).
- Znaleziska: 03-zakres-001 (BR-ZAK-005–007, BR-DAN-012 bez F; `zakres-oczko.mjs` kod 1; = Z07-03), 002 (warstwa danych 0.1.0 łamie podłogi — nie przenosić), 003 (okno startowe i funkcje spoza kontraktu), 004 (liczby 0.1.0 niezgodne z `parametry.json`), 005 (decyzje po P-052 bez ZM), 006 (kolumna „Intuicyjność” bez wyników 04).
- Decyzje dla koordynatora: D1 (a) partia porządkowa 08 przed pierwszą funkcją; D2 (a) fix 03 przed 08, równolegle z fixem 05:
  - `node tools/assemble.mjs 03-zakres --tryb fix --zadania 03-zakres-001,03-zakres-005,03-zakres-006 --moduly zmiany-zakresu --galaz claude/jolly-thompson-paz6d8`
- Dla 05 (fix): tabela `wloczka` bez kategorii grubości a BR-ZAP-004. Dla 07: brak kontroli „każda zależność ma wiersz ADR-0016”. Dla 08: zadania 1–6 w `docs/porownanie-kodu.md`.

### Przekazanie roli 07, build (2026-10-25, STOP E4)
- Zakończono: 07-jakosc, build, E0–E4 (P-090, P-091, P-092, P-096), gałąź `claude/jolly-thompson-paz6d8`; definicja ukończenia z dowodami i paczka dla 08: `docs/jakosc/e4-przekazanie.md`; strategia testów i definicja ukończenia funkcji: `docs/jakosc/strategia.md`; testy przed kodem: `npm run test:akceptacja` (980: 974 na znaczniku, 6 `[ZIELONY-OK]`); CI: „Jakość · Linux” (bramka), „Jakość · iOS” (build zielony, E2E informacyjnie do ekranów 08).
- Następne kroki (P-002, P-078, P-091 11a, P-096): **krok porównania z kodem: 03-zakres, tryb `audit`, moduł `inwentarz-funkcji`** oraz **sesja fix ról 01, 02 i 05** (zgłoszenia ER-34–ER-44, Z07-07–Z07-09, Z07-11–Z07-19, Z07-22; testy zależne: `docs/jakosc/e4/tabela-08.md`), potem **08-programista**, tryb `build`; nowa sesja: sonnet, wysiłek medium; opus, gdy zadanie dotyka migracji danych, schematu albo architektury.
  - `node tools/assemble.mjs 08-programista --tryb build --galaz claude/jolly-thompson-paz6d8`
  - `.\Get-Prompt.ps1 08-programista -Tryb build -CopyToClipboard`
- Paczka wejściowa 08: `docs/jakosc/e4-przekazanie.md`, `docs/jakosc/e4/tabela-08.md`, `docs/jakosc/strategia.md` (§6 definicja ukończenia, §3 zasady testów), `e2e/README.md` (testID, build E2E), `tests/wspolne/` (złote pliki, specyfikacja XCTest), `docs/architektura/` (05).
- Otwarte decyzje: brak w roli 07; [DO USTALENIA] w zgłoszeniach dla 01/02/04/05/09/10/12 (`docs/jakosc/zgloszenia.md`).

### Koordynacja (2026-10-25)
- Koordynator: sesja „Main: Oczko” (nowe konto). **P-087:** decyzje podejmuje koordynator (najpierw jak w Treningu, potem własna rekomendacja); na STOP-y ról odpowiada koordynator; wyjątki u właściciela: koszty, jego konta, scalenie do `main`, wysłanie do Apple.
- **P-089:** monetyzacja zbieżna z Treningiem (ceny PL/EUR/GBP, Family Sharing, okno „Uczciwe zasady”, karta po imporcie) — dla 07, 04, 08, 10.
- **P-088:** STOP E3 roli 06 przyjęty. Następny krok: **07-jakosc build** (nowa sesja).

### Koordynacja (2026-10-23)
- Sesja koordynująca przeszła na inne konto Claude (limit tygodniowy). Sposób koordynacji, szablon startu roli i otwarte sprawy: `oczko-warsztat/koordynacja/przekazanie-koordynatora-2026-10-23.md`.
- Otwarte przed rolą 07: akceptacja STOP E3 roli 06 przez właściciela.

### Przekazanie roli 06, build (2026-10-23, STOP E3)
- Zakończono: 06-tresci, build, E0–E3 (P-081–P-086), gałąź `claude/jolly-thompson-paz6d8`; publiczne: `docs/tresci/README.md` (reguły i warunki wyświetlania), `parametry.json`, `wektory.json`, `nazwy-zrodel.json`, strażnik nazw źródeł (P-085); prywatne: `oczko-warsztat/06-tresci/2026-10-22-build/` (rejestr 103 twierdzeń, wszystkie POPARTE w weryfikacji 3; kontrola z `--przeglad zastępczy` kod 0).
- Następny krok (P-002): **07-jakosc**, tryb `build` (wektory `docs/tresci/wektory.json`, `tests/wektory/brd.json`, „Dla roli 07” w `docs/niezawodnosc/e1-decyzje.md`); nowa sesja.
  - `node tools/assemble.mjs 07-jakosc --tryb build --galaz claude/jolly-thompson-paz6d8`
- Potem: porównanie z kodem (03 audit, P-078) → 08 → 04 audit → 09 E2–E4 (z zestawem przekładu roli 06).
- Dla 05/08: `parametry.json` zamyka „[DO USTALENIA]” liczb F-38 i tabeli RD-11 w `docs/architektura/moduly.md`.

### Przekazanie roli 12, wejście wczesne E0–E1 (2026-10-22)
- Zakończono: 12-niezawodnosc, build, E0–E1 (P-079, P-080), gałąź `claude/jolly-thompson-paz6d8`; artefakty: `docs/niezawodnosc/e0-rozpoznanie.md`, `docs/niezawodnosc/e1-decyzje.md` (progi, zgłoszenia do 04, 05, 07, 08, 09, 10), `docs/niezawodnosc/eksperymenty/wal-kopia.*`, ADR-0018 (sygnał bez SDK, MetricKit lokalnie), ADR-0019 (strażnik startu, tryb awaryjny), ADR-0020 (kopia ratunkowa, ZIP, przywracanie), ADR-0021 (bez OTA); P-079, P-080 w `docs/decyzje.md`.
- Następny krok (P-002): **06-tresci**, tryb `build`; nowa sesja: opus, wysiłek high.
  - `node tools/assemble.mjs 06-tresci --tryb build --galaz claude/jolly-thompson-paz6d8`
  - `.\Get-Prompt.ps1 06-tresci -Tryb build -CopyToClipboard`
- Potem: 07 build (czyta `docs/niezawodnosc/e1-decyzje.md`, „Dla roli 07”: kontrole CI, testy na symulatorze zamiast ćwiczeń, lista „Nie sprawdzono”) → porównanie z kodem (03 audit, P-078) → 08 → 04 audit (ekran awaryjny) → 09 E2–E4 → **12 E2–E3** (testy czerwone i kod strażnika, kopii, sprawdzenia i przywrócenia; ćwiczenia automatem; runbook).
- Dla 06: rola 12 nie dotyka treści; brak pakietów treści (moduł `pakiety-tresci` nie dotyczy).
- Otwarte: interpretacje P-080 do weta; [DO USTALENIA] w ADR-0018 (awarie w `diagnosticSignatures`), ADR-0019 (montowanie korzenia przy starcie w tle, koszt `integrity_check`), ADR-0020 (wybór ZIP w ADR-0016).

### Przekazanie roli 09, wejście wczesne E0–E1 (2026-10-22)
- Zakończono: 09-lokalizacja, build, E0–E1 (P-075, P-076, P-077), gałąź `claude/jolly-thompson-paz6d8`; artefakty: `docs/lokalizacja/` (`e0-rozpoznanie.md`, `e1-mechanizm.md`, `jezyki.md`, `dowody/`), ADR-0017 (przyjęta), `src/i18n/`, `src/platforma/lokalizacja.ts`, `scripts/sprawdz-i18n.mjs`, `tests/i18n/` (186 testów; cały zestaw 952/952), `locales/systemowe/en.json`, ZAL-031–ZAL-034.
- Następny krok (P-002, P-005): **12-niezawodnosc E0–E1**, potem 06 build → 07 build → porównanie z kodem → 08 → 04 audit → **09 E2–E4 po audycie 04**.
- Paczka dla następców: `docs/lokalizacja/e1-mechanizm.md` („Przekazanie”: 04, 06, 07, 08); komenda `npm run i18n:kod`. Dla 12: teksty ekranu awaryjnego w każdym języku (E4 roli 09). Dla 10: bg, et, lt, lv, sr bez metadanych w App Store Connect; es-419 → „Spanish (Mexico)”.
- Nie sprawdzono: `Intl.NumberFormat`/`DateTimeFormat` na Hermes (CI macOS, rola 07); zachowanie iOS dla `CFBundleLocalizations` względem `supportedLocales`.

### Przekazanie roli 05 (2026-10-22, STOP E4)
- Zakończono (P-074): 05-architekt, build; `docs/architektura/README.md`, definicja ukończenia z dowodami i przekazanie dla 09, 12, 06, 07, 08, 10: `docs/architektura/e4-przekazanie.md`; ADR 0001–0016 przyjęte (P-070–P-073).
- Następny krok (P-002): **09-lokalizacja**, tryb `build`, tylko E0–E1; nowa sesja: sonnet, wysiłek medium.
  - `node tools/assemble.mjs 09-lokalizacja --tryb build --galaz claude/jolly-thompson-paz6d8`
  - `.\Get-Prompt.ps1 09-lokalizacja -Tryb build -CopyToClipboard`
- Potem: 12 E0–E1 (P-005) → 06 build → 07 build → porównanie z istniejącym kodem → 08.

### Stan po fixie roli 02 (2026-10-22)
- Zakończono (STOP E2): 02-monetyzacja, fix NZ-01, NZ-02, P-065 (P-067); P-065 (1a) potwierdzone, więc P-066 (BR-ZAK-006) obowiązuje bez warunku. Dowody: `oczko-warsztat/02-monetyzacja/2026-10-22-fix-nz/E2-dowody.md`.
- ER-30 zrobione (28a488b, STOP E2). Następny krok: **05-architekt**, build; nowa sesja: opus, wysiłek high; `node tools/assemble.mjs 05-architekt --tryb build --galaz claude/jolly-thompson-paz6d8` (paczka niżej w przekazaniu roli 04 plus `limit.mjs` z `mozeZaczacDzien` i KP-15).

### Przekazanie roli 04 (2026-10-22)
- Zakończono: 04-studio-projektowe, build (E0–E4: P-061–P-065), gałąź `claude/jolly-thompson-paz6d8`; artefakty w `docs/design/`: `design-spec.md` (system, komponenty, VoiceOver, limit, teksty ofert, reguła wzoru wobec OG-07, konfiguracja ikony, wpis do pamięci portfolio), `tokeny.json` + `kontrast-tabela.txt` (44/44, kod 0), `ekrany.html` + `wzorce-zrzuty/` (7 stanów × 12 wariantów, linia bazowa SP-13), `prototyp.html` + `przejscie/` (scenorys, `wynik.md` dla kolumny „Intuicyjność”), `ikona/` (pliki dla iOS, zegarka, Androida, ekranu startowego; `ikona.mjs` kod 0), `fonty/` (OFL), `narzedzia/`.
- Najpierw (P-060 (5b), P-065 (1a)): **02-monetyzacja, tryb `fix`**: NZ-01 i NZ-02 (OP-32: zerowanie, −1, liczniki oczek i powtórzeń, zegarek; dni na nowym urządzeniu) oraz potwierdzenie, że limit pokazany zawczasu (komunikat zamiast +1 przed pierwszym rzędem nowego dnia, bez ekranu zakupu) jest zgodny z KP-12, KP-13; nowa sesja: opus, wysiłek high.
  - `node tools/assemble.mjs 02-monetyzacja --tryb fix --zadania NZ-01,NZ-02,P-065 --galaz claude/jolly-thompson-paz6d8`
- ER-29 (BR-ZAK-006 według P-065) zrobione wcześniej przez rolę 01 na prośbę właściciela, warunkowo (3d64639); 02 je potwierdza albo rola 01 cofa commit.
- Potem: **05-architekt**, tryb `build`.
  - `node tools/assemble.mjs 05-architekt --tryb build --galaz claude/jolly-thompson-paz6d8`
  - `.\Get-Prompt.ps1 05-architekt -Tryb build -CopyToClipboard`
- Paczka dla 05: `docs/design/design-spec.md` (komponenty systemowe a własne, `react-native-svg`, VoiceOver, Magic Tap, arkusze modalne, Dynamic Type z limitem ×1,3 dla liczby), `tokeny.json`, `ikona/` (wpisy konfiguracji), `prototyp.html` (zachowanie strażnika, limitu, przypomnienia).
- Dla 03: wyniki intuicyjności `docs/design/przejscie/wynik.md` do kolumny „Intuicyjność” (bramka `zmiany-zakresu`). Dla 07: zrzuty wzorcowe jako linia bazowa; scenorys jako scenariusze E2E. Dla 08: tylko tokeny i komponenty z `docs/design/`. Dla 11: OP-33 (chwila prośby o ocenę). Właściciel: wpis do pamięci portfolio w repo `prompts` (`design-spec.md`, ostatnia sekcja).
- Kwarantanna (P-003, P-015) obowiązuje role 01–04.

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
