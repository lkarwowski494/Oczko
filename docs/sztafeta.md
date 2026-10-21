# Stan sztafety
Ścieżka: greenfield z ponownym użyciem kodu (P-001, P-002) · Aktualizacja: 2026-10-21 (po roli 01)

| Rola | Tryb | Stan | Commit | Artefakty | Otwarte decyzje |
|---|---|---|---|---|---|
| koordynator | — | decyzje P-001–P-010, kwarantanna | b080940 | docs/decyzje.md, docs/pomysl.md, CLAUDE.md | — |
| 02 Monetyzacja, sesja 1 (bramka) | build, `--moduly oplacalnosc,cena-i-rachunek` | zakończona 2026-10-21: **budować** (P-013) | (ten commit) | docs/monetyzacja.md (Opłacalność), docs/monetyzacja/, docs/zalozenia.md, P-011–P-016; surowe dane: oczko-warsztat/02-monetyzacja/2026-10-21-bramka/ | OP-05, OP-06 (fakty od właściciela, niepilne) |
| 01 Odkrywanie | build | zakończona 2026-10-21 | (ten commit) | docs/brd/ (9 plików), tests/wektory/brd.json; P-017–P-026; ZAL-017–024 | OP-09 (e-mail do CYC), OP-03, OP-11, OP-15; OP źródłowe dla 06 |
| 02 Monetyzacja, sesja 2 | build (bez `--moduly`) | po 01 | — | docs/monetyzacja.md (model, kontrakt płatności) | — |

## Następny krok
### Przekazanie do następnej roli
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
