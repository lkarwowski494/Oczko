# Stan sztafety
Ścieżka: greenfield z ponownym użyciem kodu (P-001, P-002) · Aktualizacja: 2026-10-21

| Rola | Tryb | Stan | Commit | Artefakty | Otwarte decyzje |
|---|---|---|---|---|---|
| koordynator | — | decyzje P-001–P-010, kwarantanna | b080940 | docs/decyzje.md, docs/pomysl.md, CLAUDE.md | — |
| 02 Monetyzacja, sesja 1 (bramka) | build, `--moduly oplacalnosc,cena-i-rachunek` | zakończona 2026-10-21: **budować** (P-013) | (ten commit) | docs/monetyzacja.md (Opłacalność), docs/monetyzacja/, docs/zalozenia.md, P-011–P-016; surowe dane: oczko-warsztat/02-monetyzacja/2026-10-21-bramka/ | OP-05, OP-06 (fakty od właściciela, niepilne) |
| 01 Odkrywanie | build | w toku: STOP E2 (2026-10-21) | (ten commit) | docs/brd/ (README, odkrywanie, reguly, zrodla); P-017–P-023; ZAL-017–024 | decyzja E2: kontynuować / zmienić / zatrzymać |
| 02 Monetyzacja, sesja 2 | build (bez `--moduly`) | po 01 | — | docs/monetyzacja.md (model, kontrakt płatności) | — |

## Następny krok
### Przekazanie do następnej roli
- Zakończono: 02-monetyzacja, build, sesja 1 (krok 0: bramka opłacalności na podstawie opisu pomysłu i karty); werdykt „budować” przyjęty przez właściciela (P-013).
- Następny krok ścieżki: **01-odkrywanie Odkrywanie i BRD**, tryb `build`; nowa sesja: opus, wysiłek high; gałąź `claude/jolly-thompson-paz6d8`.
  - Polecenie: `node tools/assemble.mjs 01-odkrywanie --tryb build` (biblioteka `prompts`); Windows: `.\Get-Prompt.ps1 01-odkrywanie -Tryb build -CopyToClipboard`
- Paczka wejściowa: `CLAUDE.md` (karta, kwarantanna z P-015), `docs/pomysl.md`, `docs/decyzje.md` (P-001–P-016), `docs/monetyzacja.md` (sekcje E1 i „Opłacalność”: rynek, recenzje, przesiew, kolejność języków), `docs/zalozenia.md` (ZAL-001–016).
- Hipotezy do sprawdzenia przez 01: ZAL-002 (wartość stała), ZAL-008 (Oczko to narzędzie N), ZAL-009 (uczciwość jako wyróżnik), ZAL-014 (widoczność wśród zalewu nowych aplikacji); dowody R funkcji z E1: licznik wielu projektów, wzór PDF ze znacznikiem, zegarek, magazyn i projekty.
- Kwarantanna: 01 nie czyta `archiwum/`, kodu, historii git sprzed 2026-10-21, `oczko-warsztat/rozliczenie-2026-10-21/` ani karty portfela Oczka (P-003, P-015).
- Otwarte: OP-05 (podatek w cenach US/CA), OP-06 (instalacje na ocenę z App Analytics innej aplikacji właściciela); odświeżenie bramki 04.2027 (P-016).
