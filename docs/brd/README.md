# BRD: Oczko
Stan: STOP E3 (PR-01–14, 59 wymagań BR w 7 modułach, 11 NFR, RD-01–13, blokery wydania) · Aktualizacja: 2026-10-21 · Rola 01-odkrywanie, tryb build (prompt `prompts` @97ec212, moduły kontrola-brd, rynek-i-polityki, wywiad; 59 458 znaków) · Hierarchia źródeł: P-017

BRD powstaje od zera: z wywiadu i przeczytanych źródeł. Kwarantanna P-003 i P-015 (wyjątek nazwany od rdzenia roli, który każe czytać istniejące BRD i kod): nie czytano `archiwum/`, `app/`, `src/`, `lib/`, `tests/`, `scripts/`, `site/`, `.maestro/`, `assets/`, historii git sprzed 2026-10-21, `oczko-warsztat/rozliczenie-2026-10-21/` ani karty portfela Oczka. Obszary z `docs/pomysl.md` to hipotezy.

## Spis
| Plik | Zawartość |
|---|---|
| `README.md` | stan, streszczenie, rama E0, otwarte pytania, blokery wydania |
| `odkrywanie.md` | zasady ZP, prace J, persony P, kontekst, rynek, OG, RYZ, hipotezy H |
| `reguly.md` | reguły RD z wektorami |
| `zrodla.md` | źródła S |
| `wymagania.md` | przepływy PR-01–PR-14, wymagania NFR |
| `wymagania-licznik.md`, `wymagania-projekt.md`, `wymagania-dane.md`, `wymagania-narzedzia.md` | wymagania BR według modułów: LIC, PRJ, WZR, DAN, ZAK, ZAP, KAL, SLO |
| `tests/wektory/brd.json` (repo) | wektory RD do testów, generowane skryptem; tylko do odczytu dla ról 07 i 08 |

Materiały prywatne (wywiad, 4682 recenzje, cztery soczewki E2, kopie źródeł): `oczko-warsztat/01-odkrywanie/`.

## Streszczenie
Oczko to narzędzie do własnych robótek (typ N, ZAL-008), nie aplikacja z kursami. Dowody (4682 recenzje 23 aplikacji, cztery soczewki, wytyczne Apple, CYC) wskazują dwie luki rynku: zaufanie do danych i uczciwe płacenie (H-03), oraz funkcje, których nikt nie robi dobrze: liczenie bez telefonu, widoczne przypomnienia z planem rzędów, ochrona przed przypadkowym stuknięciem (H-06). Zakres, kolejność i podział rozstrzyga rola 03 (H-04, H-05, H-07); model i ceny rola 02 (P-019, H-01, H-02).

## Blokery wydania
Wejście dla roli 07 (werdykt gotowości). Niespełnienie któregokolwiek blokuje wydanie.
- NFR-DAN-001, BR-DAN-003: utrata danych przy aktualizacji.
- NFR-DAN-002, BR-DAN-001: utrata zmian licznika (główny przepływ, offline).
- NFR-DAN-003, BR-DAN-002: synchronizacja zmienia liczbę bez wiedzy użytkownika (RYZ-02).
- BR-DAN-004, BR-DAN-005, BR-DAN-006: brak drogi przeniesienia danych na nowy telefon.
- BR-LIC-001, BR-LIC-002, BR-LIC-003: główny przepływ liczenia.
- BR-ZAK-001: utrata zakupu (OG-02).
- BR-ZAK-002, NFR-PRY-001, BR-ZAK-004: obietnica prywatności i polityka sklepu (OG-04).
- NFR-ZEG-001: rozbieżność zegarka (jeśli zegarek jest w wydaniu).
- BR-KAL-001–BR-KAL-008, BR-SLO-001: reguły krytyczne i treść krytyczna bez przeglądu roli 06 (RD-01–RD-04, RD-07, RD-08, RD-10; RYZ-03).
- BR-WZR-003: funkcja wzoru bez rozstrzygnięcia OP-08 (patent).
- OG-05: opis w sklepie wymienia tylko funkcje obecne w wydaniu.

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
| OP-01 | Kolizja ID decyzji `P-nnn` z personami `P-n`: zamknięte decyzją P-018 | właściciel | `kontrola-brd.mjs` |
| OP-02 | [DO USTALENIA] Reguła zaokrąglania liczby oczek (w górę, w dół, do krotności motywu, do parzystości) i jej źródło | źródła szczebla 1–3, rola 06 | RD-01, RD-02, RD-07 |
| OP-03 | [DO WYJAŚNIENIA] Próbka na 4 in: przeliczać dokładnie (10,16 cm) czy jak źródła (10 cm), czy pokazać obie | właściciel, 03 | RD-04 |
| OP-04 | [DO USTALENIA] Konwencja równomiernego dodawania w rzędzie płaskim (k+1 odcinków) | źródła szczebla 1–3 | RD-05 |
| OP-05 | [DO USTALENIA] Domyślny zapas włóczki i jego źródło; czy użytkownik wybiera go zawsze sam | źródła (producenci, szczebel 3) | RD-07 |
| OP-06 | [DO USTALENIA] Jak wzory zapisują „co N rzędów” (od rzędu N czy od 1); japońska notacja 2-1-5 | źródła szczebla 1–3 | RD-13 |
| OP-07 | [DO USTALENIA] Głębokość karczka, ujemny luz czapki, średnie zużycie na rodzaj odzieży | źródła szczebla 1–3 | H-05 |
| OP-08 | [DO WYJAŚNIENIA] Konsultacja prawna patentu US8506303 (i odczyt US8529263) przed funkcją wzoru | właściciel | OG-07, RYZ-01 |
| OP-09 | [DO WYJAŚNIENIA] E-mail do Craft Yarn Council o użyciu tabel i symboli (krok właściciela) | właściciel | OG-12 |
| OP-10 | [DO USTALENIA] Kategoria 1 szydełko: strona CYC 2,25–3,5 mm, PDF 2018 2,25–3,25 mm | źródła | RD-10 |
| OP-11 | [DO WYJAŚNIENIA] Pielęgnacja włóczki: opis tekstem zamiast symboli (licencja GINETEX) | właściciel, 03 | OG-13 |
| OP-12 | [DO USTALENIA] Źródła terminologii i skrótów w 35 językach (CYC daje tylko US, UK, Kanadę) | źródła szczebla 1–3, rola 09 | RYZ-03 |
| OP-13 | [DO USTALENIA] Japońskie rozmiary drutów (号) na mm: źródło szczebla 1–3 | źródła | RD-11 |
| OP-14 | [DO WYJAŚNIENIA] Czy dopuścić modele Apple w Private Cloud Compute (bez kosztu, dane poza urządzeniem) | właściciel | P-023, H-09, OG-11 |
| OP-15 | [DO WYJAŚNIENIA] Czy aplikacja ma opcjonalne przypomnienie o przerwie (bez twierdzeń zdrowotnych) | właściciel, 03 | RYZ-08 |
| OP-16 | [DO WYJAŚNIENIA] Podłoga dużego tekstu (Dynamic Type) na ekranach głównych przepływów | rola 04 | NFR-DOS-002 |
| OP-17 | [DO WYJAŚNIENIA] Budżet czasu reakcji licznika | rola 05 | NFR-WYD-001 |
| OP-18 | [DO WYJAŚNIENIA] Okres przechowywania usuniętych projektów | właściciel, 03 | BR-DAN-008 |
