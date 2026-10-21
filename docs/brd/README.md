# BRD: Oczko
Stan: E1 (wywiad: odp. 1, ZP-01–ZP-07 w `odkrywanie.md`) · Aktualizacja: 2026-10-21 · Rola 01-odkrywanie, tryb build (prompt `prompts` @97ec212, moduły kontrola-brd, rynek-i-polityki, wywiad; 59 458 znaków) · Hierarchia źródeł: P-017

BRD powstaje od zera: z wywiadu i przeczytanych źródeł. Kwarantanna P-003 i P-015 (wyjątek nazwany od rdzenia roli, który każe czytać istniejące BRD i kod): nie czytano `archiwum/`, `app/`, `src/`, `lib/`, `tests/`, `scripts/`, `site/`, `.maestro/`, `assets/`, historii git sprzed 2026-10-21, `oczko-warsztat/rozliczenie-2026-10-21/` ani karty portfela Oczka. Obszary z `docs/pomysl.md` to hipotezy.

## E0: Rama i ograniczenia

### Środowisko (sprawdzone 2026-10-21)
| Sprawdzenie | Wynik | Skutek |
|---|---|---|
| System, Node, git | Linux x86_64 w chmurze (`CLAUDE_CODE_REMOTE=true`), Node v22.22.0 | — |
| GitHub | push przez git na `claude/jolly-thompson-paz6d8` (Oczko) i na `main` (`oczko-warsztat`, P-010); narzędzia MCP GitHub | repo nie zakładam (moduł `repozytorium` pominięty: oba repo istnieją) |
| Autor commitów | `noreply@anthropic.com` (jak role 01–02) | adres właściciela nie trafia do publicznej historii |
| Sieć | 200: `itunes.apple.com/search`, `developer.apple.com` (wytyczne), `craftyarncouncil.com` (standardy), `tkga.org`; 403: `iso.org` (ochrona przed botami) | normy ISO czytam tylko z dostępnych streszczeń; tekst normy jest płatny, więc fakty z ISO trafią do OP, jeśli nie znajdę wolnego źródła |
| Przeglądarka | Chromium w obrazie (Playwright); nie dotyczy roli 01 | — |
| Xcode, symulator | brak (OP-03 roli 02: właściciel też nie ma Maca) | dotyczy ról 05, 07, 08 |
| Dysk Google („Biblioteka zasad i ról”) | brak dostępu z tej sesji | biblioteką ról jest repo `prompts`; prompt złożony z niego |
| Wysiłek sesji | nie da się sprawdzić narzędziem (sesja podaje tylko model) | właściciel może wpisać `/effort high` |

### Wejście jako hipotezy (rejestr `docs/zalozenia.md`)
Opieram się na: ZAL-001 (płacą za narzędzie N), ZAL-002 (wartość stała), ZAL-003 (koszt 0 zł bez konta i sieci), ZAL-008 (Oczko to narzędzie N), ZAL-009 (uczciwość jako wyróżnik), ZAL-014 (pierwsze ryzyko to widoczność). Sprawdzam je w E1–E2 (wywiad, recenzje o funkcjach, nie o cenie). Wynik bramki (`docs/monetyzacja.md`, P-013) jest aktualny (dziś); jeśli E1–E2 zmienią docelowych użytkowników albo rynek, zgłoszę „odśwież bramkę”.

### Pomysł w dwóch zdaniach (`docs/pomysl.md`, 2026-10-21)
„Aplikacja na iPhone'a dla osób, które dziergają na drutach i szydełkują: towarzysz pracy przy robótce. […] Działa bez konta i bez sieci; dane zostają na urządzeniu.” Ma robić to, co poprzednia wersja, i więcej, jeśli wykaże to research, bez atrap i bez kombajnu.

### Hierarchia źródeł dziedziny: P-017 (decyzja merytoryczna roli 01, do weta)
Kierunek z `CLAUDE.md` (rachunek → normy → podręczniki → organizacje → praktyka) w szczeblach biblioteki:
| Szczebel | Co | Przykłady (do przeczytania w E2) |
|---|---|---|
| rachunek | arytmetyka i geometria kalkulatorów (próbka, równomierne dodawanie, zużycie) | metoda i dane wejściowe obok wyniku; nie wymaga źródła (zasada wspólna 3) |
| 1 | normy i standardy; dokumentacja platformy | Craft Yarn Council „Standards & Guidelines” (rozmiary drutów i szydełek, system grubości włóczki, lista skrótów, wymiary ciała), normy ISO (np. etykiety pielęgnacji, system tex), Apple |
| 2 | monografie i literatura recenzowana | podręczniki referencyjne dziewiarstwa i szydełkowania, publikacje o dzianinach (nauka o tekstyliach) |
| 3 | organizacje i instytucje | TKGA, Crochet Guild of America, muzea tekstyliów, producenci włóczek (etykiety) |
| 4 | przewodniki z podanymi źródłami | magazyny i serwisy wydawnicze (Interweave, Knitty) |
| 5 | fora, blogi, filmy, Ravelry (opisy użytkowników) | tylko wskazówka, gdzie szukać |

Ryzyko: podręczniki szczebla 2 są głównie drukowane; czego nie przeczytam w sieci, trafi do OP z propozycją, kto i jak może to sprawdzić.

### Wielkość BRD i moduły
- **BRD dzielony** (`README.md`, `odkrywanie.md`, `wymagania*.md`, `reguly.md`, `zrodla.md`, `errata.md`): obszarów jest 12, kalkulatory dają więcej niż trzy reguły RD, więc progi „mały BRD” zostaną przekroczone.
- **Moduły:** `wywiad` (E1), `rynek-i-polityki` (E2: dane rynku i cen biorę od roli 02, dokładam macierz funkcji i recenzje o funkcjach i utracie danych), `kontrola-brd` (E3). `repozytorium` pominięty (repo istnieją).
- **Wektory:** `tests/wektory/brd.json` generowany skryptem w E3. Katalog `tests/` jest w kwarantannie do czytania; zapisuję tylko ten jeden plik, bez czytania sąsiednich (wyjątek do potwierdzenia, OP w E3, jeśli plik już istnieje).
- **Subagenci (zasada 19):** w E2 cztery soczewki z kontraktu (początkujący, zaawansowany, ekspert, analityk konkurencji) niezależnie, każdy bez wglądu w pozostałe; model i wysiłek jak ta sesja.

### Plan i czas (zasada 9)
| Etap | Co | Czas agenta | Czekanie | Właściciel |
|---|---|---|---|---|
| E1 | wywiad: 10–15 pytań, jedno naraz; prace J, persony, konteksty, zasady ZP | 1–1,5 h | — | 10–15 odpowiedzi, ok. 45–75 min |
| E2 | macierz funkcji konkurencji, recenzje o funkcjach, polityki (OG), źródła dziedzinowe, reguły RD, hipotezy H, propozycja podziału; 4 soczewki | 4–6 h | limit iTunes ok. 20 zapytań/min | decyzja: kontynuować / zmienić / zatrzymać, ok. 15 min |
| E3 | przepływy PR, wymagania BR i NFR, wektory, `kontrola-brd.mjs` z kodem 0 | 4–6 h | — | przegląd, ok. 20–30 min |
| E4 | definicja ukończenia z dowodami, przekazanie do 02 i 03 | 0,5–1 h | — | akceptacja, ok. 10 min |

Razem: 10–15 h pracy agenta (kilka sesji z punktami czyszczenia); od właściciela ok. 1,5–2,5 h, głównie wywiad.

## Otwarte pytania
| ID | Pytanie | Rozstrzyga | Dotyczy |
|---|---|---|---|
| OP-01 | Kolizja ID decyzji `P-nnn` z personami `P-n`: **zamknięte** decyzją P-018 (opcja a, poprawka skryptu) | właściciel | `kontrola-brd.mjs` |
