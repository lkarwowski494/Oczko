# Reguły dziedzinowe i obliczeniowe (RD)
Stan: STOP E2 · Aktualizacja: 2026-10-21 · Hierarchia: P-017 · Wektory policzone skryptem (Python), nie przepisane z przewodników: przykład w S-25 ma błąd rachunkowy (soczewka ekspercka, `oczko-warsztat/01-odkrywanie/soczewki/ekspert.md`).

Zasady wspólne reguł:
- Wynik obliczenia pokazuje dane wejściowe i założenia; tabele CYC to „GUIDELINES ONLY” [FAKT S-19], więc aplikacja nie przedstawia ich jako normy.
- Zaokrąglanie liczby oczek do całości (w górę, w dół, do krotności motywu, do parzystości) nie jest rozstrzygnięte: [DO USTALENIA] (OP-02). Reguły RD-01, RD-02 i RD-07 zwracają wartość niezaokrągloną.
- Reguły krytyczne (błąd = zmarnowana włóczka albo pieniądze) idą do przeglądu roli 06; przegląd zastępczy (D-027).
- Zapis w tabelach wektorów (ER-39, P-097): `{a, b}` to zbiór (kolejność bez znaczenia), `a; b` to lista w kolejności, `tak`/`nie` to wartość logiczna, `—` to brak wartości; pozostałe słowa (`błąd danych`, `brak`, `poza tabelą`, `między kategoriami`) to wynik nazwany. Generator `docs/brd/narzedzia/kontrola-brd.mjs` zamienia je na typy JSON według `docs/brd/wektory.schema.json` i sprawdza, że zapis md → json → md nie traci informacji (`--zgodnosc=tests/wektory/brd.json`).

### RD-01: Liczba oczek na szerokość z próbki
- Wzór: `N = W × P / 10`
- Jednostki: N [o.], W [cm], P [o./10 cm]
- Granica: W > 0 i P > 0 (ostre); wartości ≤ 0 albo brak to błąd danych
- Podstawa: rachunek; próbka na 10 cm jako standard branżowy S-25; zakres typowych próbek S-19
- Krytyczna: tak
- Uproszczenie: próbka jednolita w całej dzianinie; próbka różni się przed i po blokowaniu (RD-08).

| ID | W [cm] | P [o./10 cm] | Oczekiwane: N [o.] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|
| RD-01-W1 | 50 | 22 | 110 | 0,001 | typowy | rachunek: 50 × 22 / 10 |
| RD-01-W2 | 0 | 22 | błąd danych | — | granica | rachunek: W = 0 poza W > 0 |
| RD-01-W3 | -1 | 22 | błąd danych | — | poniżej | rachunek |
| RD-01-W4 | 0,1 | 22 | 0,22 | 0,001 | powyżej | rachunek: 0,1 × 22 / 10 |
| RD-01-W5 | 50 | brak | błąd danych | — | błąd | rachunek: brak próbki |

### RD-02: Przeliczenie liczby oczek wzoru na własną próbkę
- Wzór: `N' = N × P_u / P_w`
- Jednostki: N, N' [o.]; P_u, P_w [o./10 cm]
- Granica: P_u > 0 i P_w > 0 (ostre); N ≥ 0
- Podstawa: rachunek; S-25
- Krytyczna: tak
- Uproszczenie: tylko wymiary liniowe; krotność motywu nie jest zachowana (OP-02).

| ID | N [o.] | P_w [o./10 cm] | P_u [o./10 cm] | Oczekiwane: N' [o.] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|---|
| RD-02-W1 | 100 | 20 | 22 | 110 | 0,001 | typowy | rachunek: 100 × 22 / 20 |
| RD-02-W2 | 100 | 20 | 18 | 90 | 0,001 | typowy | rachunek |
| RD-02-W3 | 100 | 20 | 0 | błąd danych | — | granica | rachunek: P_u = 0 poza P_u > 0 |
| RD-02-W4 | 100 | 20 | -2 | błąd danych | — | poniżej | rachunek |
| RD-02-W5 | 100 | 20 | 0,1 | 0,5 | 0,001 | powyżej | rachunek: 100 × 0,1 / 20 |
| RD-02-W6 | 100 | 0 | 22 | błąd danych | — | błąd | rachunek: dzielenie przez zero |

### RD-03: Przeliczenia jednostek długości i masy
- Wzór: `cm = in × 2,54`; `m = yd × 0,9144`; `g = oz × 28,34952`
- Jednostki: wejście i wyjście jak we wzorze
- Granica: wartość ≥ 0 (włączna)
- Podstawa: S-27 (2,54 i 0,9144 dokładne; 28,34952 to wartość tabeli zaokrąglona do 7 cyfr)
- Krytyczna: tak

| ID | Przelicznik [-] | Wartość [jedn. wejścia] | Oczekiwane: wynik [jedn. wyjścia] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|
| RD-03-W1 | yd→m | 437 | 399,5928 | 0,0001 | typowy | S-27: 437 × 0,9144 |
| RD-03-W2 | in→cm | 4 | 10,16 | 0,0001 | typowy | S-27: 4 × 2,54 |
| RD-03-W3 | oz→g | 3,5 | 99,22332 | 0,0001 | typowy | S-27: 3,5 × 28,34952 |
| RD-03-W4 | yd→m | 0 | 0 | 0 | granica | rachunek |
| RD-03-W5 | in→cm | -1 | błąd danych | — | poniżej | rachunek |
| RD-03-W6 | in→cm | 0,01 | 0,0254 | 0,0001 | powyżej | S-27 |
| RD-03-W7 | oz→g | brak | błąd danych | — | błąd | rachunek |

### RD-04: Próbka podana na 4 cale przeliczona na 10 cm
- Wzór: `P10 = P4 × 10 / 10,16`
- Jednostki: P10 [o./10 cm], P4 [o./4 in]
- Granica: P4 > 0 (ostre)
- Podstawa: rachunek z S-27 (4 in = 10,16 cm dokładnie); S-25 i S-19 zrównują „4"/10 cm”, czyli przybliżają z błędem 1,6%
- Krytyczna: tak
- Uproszczenie: brak; reguła usuwa uproszczenie źródeł. Czy aplikacja ma je stosować, czy pokazywać obie wartości: [DO WYJAŚNIENIA] (OP-03).

| ID | P4 [o./4 in] | Oczekiwane: P10 [o./10 cm] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|
| RD-04-W1 | 20 | 19,685 | 0,001 | typowy | rachunek: 20 × 10 / 10,16 |
| RD-04-W2 | 22 | 21,654 | 0,001 | typowy | rachunek |
| RD-04-W3 | 0 | błąd danych | — | granica | rachunek |
| RD-04-W4 | -5 | błąd danych | — | poniżej | rachunek |
| RD-04-W5 | 0,1 | 0,098 | 0,001 | powyżej | rachunek |
| RD-04-W6 | brak | błąd danych | — | błąd | rachunek |

### RD-05: Równomierne dodawanie k oczek na N oczkach (okrążenie)
- Wzór: `q = ⌊N / k⌋`, `r = N mod k`; r odcinków po q+1 oczek i k−r odcinków po q oczek, po każdym odcinku jeden przyrost
- Jednostki: N, k, q [o.]; r [-] (liczba dłuższych odcinków)
- Granica: 1 ≤ k ≤ N (włączne)
- Podstawa: rachunek (dzielenie z resztą). Rząd płaski (k+1 odcinków) nie jest objęty: konwencja bez źródła, [DO USTALENIA] (OP-04)
- Krytyczna: nie

| ID | N [o.] | k [o.] | Oczekiwane: q [o.] | Oczekiwane: r [-] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|---|
| RD-05-W1 | 100 | 8 | 12 | 4 | 0 | typowy | rachunek: 4×13 + 4×12 = 100 |
| RD-05-W2 | 96 | 12 | 8 | 0 | 0 | typowy | rachunek |
| RD-05-W3 | 100 | 100 | 1 | 0 | 0 | granica | rachunek: k = N |
| RD-05-W4 | 100 | 101 | błąd danych | błąd danych | — | powyżej | rachunek: k > N |
| RD-05-W5 | 100 | 0 | błąd danych | błąd danych | — | poniżej | rachunek: k < 1 |
| RD-05-W6 | brak | 8 | błąd danych | błąd danych | — | błąd | rachunek |

### RD-06: Równomierne ujmowanie k oczek na N oczkach (okrążenie)
- Wzór: jak RD-05; każdy odcinek kończy się przerobieniem 2 oczek razem
- Jednostki: N, k, q [o.]; r [-]
- Granica: 1 ≤ k ≤ N/2 (włączne), bo odcinek musi mieć co najmniej 2 oczka
- Podstawa: rachunek
- Krytyczna: nie

| ID | N [o.] | k [o.] | Oczekiwane: q [o.] | Oczekiwane: r [-] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|---|
| RD-06-W1 | 100 | 8 | 12 | 4 | 0 | typowy | rachunek: wynik 92 o. |
| RD-06-W2 | 100 | 50 | 2 | 0 | 0 | granica | rachunek: k = N/2, wynik 50 o. |
| RD-06-W3 | 100 | 51 | błąd danych | błąd danych | — | powyżej | rachunek |
| RD-06-W4 | 100 | 0 | błąd danych | błąd danych | — | poniżej | rachunek |
| RD-06-W5 | 0 | 1 | błąd danych | błąd danych | — | błąd | rachunek: brak oczek |

### RD-07: Zużycie włóczki z wagi próbki
- Wzór: `M = m_p × A / A_p`; `motki = ⌈M × (1 + z) / m_m⌉`
- Jednostki: M, m_p, m_m [g]; A, A_p [cm²]; z [-] (zapas wybrany przez użytkownika); motki [-]
- Granica: A_p > 0, m_p > 0, A > 0, m_m > 0 (ostre), z ≥ 0; zaokrąglenie motków w górę ma próg przy całkowitym ilorazie
- Podstawa: rachunek; pomiar próbki według S-25; zmiana wymiarów po praniu S-26
- Krytyczna: tak
- Uproszczenie: stała gęstość dzianiny w całym projekcie (ściągacze, warkocze i szwy łamią to założenie). Domyślnego zapasu z nie podaje żadne przeczytane źródło szczebla 1–3: [DO USTALENIA] (OP-05).

| ID | m_p [g] | A_p [cm²] | A [cm²] | z [-] | m_m [g] | Oczekiwane: M [g] | Oczekiwane: motki [-] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|---|---|---|---|
| RD-07-W1 | 6 | 225 | 6000 | 0,1 | 50 | 160 | 4 | 0,001 | typowy | rachunek: 176 / 50 = 3,52 |
| RD-07-W2 | 5,625 | 225 | 6000 | 0 | 50 | 150 | 3 | 0,001 | granica | rachunek: 150 / 50 = 3 |
| RD-07-W3 | 5,62875 | 225 | 6000 | 0 | 50 | 150,1 | 4 | 0,001 | powyżej | rachunek |
| RD-07-W4 | 5,62125 | 225 | 6000 | 0 | 50 | 149,9 | 3 | 0,001 | poniżej | rachunek |
| RD-07-W5 | 6 | 0 | 6000 | 0,1 | 50 | błąd danych | błąd danych | — | błąd | rachunek: A_p = 0 |

### RD-08: Długość na drutach przy zmianie po blokowaniu
- Wzór: `rzędy = R_po × L / 10`; `L_druty = rzędy × 10 / R_przed`
- Jednostki: R_po, R_przed [rz./10 cm]; L, L_druty [cm]; rzędy [rz.]
- Granica: R_po > 0, R_przed > 0, L > 0 (ostre)
- Podstawa: rachunek na próbce użytkownika; S-25 (pomiar), S-26 (dzianina może urosnąć po praniu)
- Krytyczna: tak

| ID | R_przed [rz./10 cm] | R_po [rz./10 cm] | L [cm] | Oczekiwane: rzędy [rz.] | Oczekiwane: L_druty [cm] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|---|---|
| RD-08-W1 | 24 | 22 | 35 | 77 | 32,083 | 0,001 | typowy | rachunek: 22 × 35 / 10; 77 × 10 / 24 |
| RD-08-W2 | 22 | 22 | 35 | 77 | 35 | 0,001 | granica | rachunek: brak zmiany |
| RD-08-W3 | 24 | 0 | 35 | błąd danych | błąd danych | — | poniżej | rachunek |
| RD-08-W4 | 24 | 0,1 | 35 | 0,35 | 0,146 | 0,001 | powyżej | rachunek |
| RD-08-W5 | brak | 22 | 35 | błąd danych | błąd danych | — | błąd | rachunek |

### RD-09: Kategoria dopasowania z luzu w obwodzie klatki
- Wzór: `luz = obwód gotowy − obwód ciała`; kategorie S-23: bardzo dopasowany −10…−5 cm, dopasowany 0, klasyczny +5…+10, luźny +10…+15, oversize ≥ +15; wynik to rodzaj (`kategorie`, `między kategoriami`, `poza tabelą`) i zbiór kategorii: przy stykających się granicach zbiór ma dwie kategorie, a luz między przedziałami daje „między kategoriami” ze zbiorem dwóch sąsiednich kategorii (ER-39)
- Jednostki: luz [cm]
- Granica: −10 cm (włączna, dół tabeli); poniżej to „poza tabelą”
- Podstawa: S-23 („Approximately”, więc przybliżenie)
- Krytyczna: nie (opis, nie obliczenie oczek)

| ID | luz [cm] | Oczekiwane: wynik [-] | Oczekiwane: kategorie [-] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|
| RD-09-W1 | 7,5 | kategorie | {klasyczny} | — | typowy | S-23 |
| RD-09-W2 | -10 | kategorie | {bardzo dopasowany} | — | granica | S-23 |
| RD-09-W3 | -11 | poza tabelą | — | — | poniżej | S-23 |
| RD-09-W4 | 10 | kategorie | {klasyczny, luźny} | — | powyżej | S-23: styk przedziałów |
| RD-09-W5 | 2 | między kategoriami | {dopasowany, klasyczny} | — | typowy | S-23: luka 0…5 |
| RD-09-W6 | brak | błąd danych | — | — | błąd | rachunek |

### RD-10: Kategoria grubości włóczki z próbki dżersejowej
- Wzór: kategorie c ∈ {0…7}, dla których P mieści się w zakresie S-19 (na 4 in): 0: 33–40, 1: 27–32, 2: 23–26, 3: 21–24, 4: 16–20, 5: 12–15, 6: 7–11, 7: ≤ 6; wynik to zbiór
- Jednostki: P [o./4 in]
- Granica: zakresy włączne; P > 40 albo luka (np. 25,5) daje „poza tabelą”
- Podstawa: S-19; zbiór nie oznacza zamienności włóczek S-20
- Krytyczna: tak (wybór włóczki do zakupu)

| ID | P [o./4 in] | Oczekiwane: kategorie [-] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|
| RD-10-W1 | 18 | {4} | — | typowy | S-19 |
| RD-10-W2 | 23 | {2, 3} | — | granica | S-19: nakładanie 23–24 |
| RD-10-W3 | 26 | {2} | — | granica | S-19 |
| RD-10-W4 | 41 | poza tabelą | — | powyżej | S-19 |
| RD-10-W5 | 6 | {7} | — | poniżej | S-19: „6 sts and fewer” |
| RD-10-W6 | 0 | błąd danych | — | błąd | rachunek |

### RD-11: Rozmiar drutu w mm na numer US
- Wzór: wyszukanie w tabeli S-18; klucz główny to mm; brak odpowiednika daje „brak”, nie najbliższą wartość
- Jednostki: d [mm], numer US [-]
- Granica: brak
- Podstawa: S-18
- Krytyczna: nie

| ID | d [mm] | Oczekiwane: US [-] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|
| RD-11-W1 | 4 | 6 | — | typowy | S-18 |
| RD-11-W2 | 3,25 | 3 | — | typowy | S-18 |
| RD-11-W3 | 3 | brak | — | typowy | S-18: brak odpowiednika |
| RD-11-W4 | -1 | błąd danych | — | błąd | rachunek |

### RD-12: Numer powtórzenia i rząd w powtórzeniu
- Wzór: `powtórzenie = ⌊(r − 1) / n⌋ + 1`; `rząd_w = ((r − 1) mod n) + 1`
- Jednostki: r, n, rząd_w [rz.]; powtórzenie [-]
- Granica: r ≥ 1, n ≥ 1 (włączne)
- Podstawa: rachunek; potrzeba J-02
- Krytyczna: nie

| ID | r [rz.] | n [rz.] | Oczekiwane: powtórzenie [-] | Oczekiwane: rząd_w [rz.] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|---|
| RD-12-W1 | 17 | 8 | 3 | 1 | 0 | typowy | rachunek |
| RD-12-W2 | 8 | 8 | 1 | 8 | 0 | granica | rachunek: koniec powtórzenia |
| RD-12-W3 | 9 | 8 | 2 | 1 | 0 | powyżej | rachunek |
| RD-12-W4 | 0 | 8 | błąd danych | błąd danych | — | poniżej | rachunek: r < 1 |
| RD-12-W5 | 5 | 0 | błąd danych | błąd danych | — | błąd | rachunek: n < 1 |

### RD-13: Przypomnienie „co N rzędów, M razy, od rzędu s”
- Wzór: rząd r wyzwala przypomnienie, gdy `r ≥ s`, `(r − s) mod N = 0` i `(r − s) / N < M`
- Jednostki: r, s, N [rz.]; M [-]
- Granica: ostatnie wyzwolenie w rzędzie `s + (M − 1) × N` (włączne)
- Podstawa: rachunek; potrzeba J-03. Odczyt instrukcji wzoru („co 6 rzędów” liczone od rzędu 6 czy od 1) zależy od wzoru: aplikacja pyta o s, nie zgaduje (OP-06)
- Krytyczna: nie

| ID | r [rz.] | s [rz.] | N [rz.] | M [-] | Oczekiwane: przypomnienie [-] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|---|---|
| RD-13-W1 | 12 | 6 | 6 | 5 | tak | — | typowy | rachunek |
| RD-13-W2 | 30 | 6 | 6 | 5 | tak | — | granica | rachunek: 6 + 4 × 6 |
| RD-13-W3 | 36 | 6 | 6 | 5 | nie | — | powyżej | rachunek: szóste wyzwolenie |
| RD-13-W4 | 5 | 6 | 6 | 5 | nie | — | poniżej | rachunek: przed s |
| RD-13-W5 | 12 | 6 | 0 | 5 | błąd danych | — | błąd | rachunek: N < 1 |

**Bez reguły (OP):** karczek raglanowy i czapka. Rachunek jest prosty, ale głębokość karczka, ujemny luz czapki i średnie zużycie na rodzaj odzieży nie mają przeczytanego źródła szczebla 1–3, a recenzje nie dają dowodu potrzeby (soczewka zaawansowana: 2 trafienia). OP-07.

### RD-14: Postęp projektu w procentach
- Wzór: `p = ⌊100 × Σ min(r_i, c_i) / Σ c_i⌋` po częściach i z celem c_i > 0 (BR-LIC-011); części bez celu nie wchodzą do sumy
- Jednostki: r_i, c_i [rz.]; p [%]
- Granica: Σ c_i > 0 (ostre); p = 100 tylko, gdy każda część z celem osiągnęła cel
- Podstawa: rachunek; potrzeba J-11 (P-043, ER-11). Zaokrąglenie w dół, żeby 100% znaczyło „skończone”; część ponad cel nie podnosi postępu innych części
- Krytyczna: nie
- Uproszczenie: rzędy nie są równą pracą (rękaw a korpus, ujmowanie w karczku), więc p to przybliżenie postępu, nie czasu ani włóczki; cel podany długością („do 40 cm”) wymaga rzędów z próbki rzędów (RD-04) przed użyciem w tej regule.

| ID | r_i [rz.] | c_i [rz.] | Oczekiwane: p [%] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|
| RD-14-W1 | 100; 40; 0; 0 | 100; 100; 60; 60 | 43 | 0 | typowy | rachunek: ⌊100 × 140 / 320⌋ = ⌊43,75⌋ |
| RD-14-W2 | 100; 100; 60; 60 | 100; 100; 60; 60 | 100 | 0 | granica | rachunek: wszystkie cele osiągnięte |
| RD-14-W3 | 99 | 100 | 99 | 0 | poniżej | rachunek: ⌊99⌋, brak 100% przed końcem |
| RD-14-W4 | 120; 0; 0; 0 | 100; 100; 60; 60 | 31 | 0 | powyżej | rachunek: min(120, 100) = 100; ⌊31,25⌋ |
| RD-14-W5 | 40 | 100 | 40 | 0 | typowy | rachunek: zgodnie z BR-PRJ-009 |
| RD-14-W6 | 0; 0 | brak; brak | błąd danych | — | błąd | rachunek: Σ c_i = 0, postęp nieokreślony |

### RD-15: Cel dzienny do terminu i wykonanie dnia
- Wzór: `d = (termin − dziś) + 1` [dni, daty lokalne RD-16]; `R = C − Z_przed`; cel dnia `g = ⌈R / d⌉` dla d ≥ 1 i R > 0; `g = 0` dla R ≤ 0 („cel osiągnięty”); dla d < 1 brak celu i komunikat „termin minął, zostało R rzędów”. C = Σ c_i, Z_przed = Σ min(r_i, c_i) na koniec wczoraj (jak RD-14). Wykonanie dnia = suma zmian +1 i −1 liczników rzędów z dniem zmiany = dziś (RD-16), bez zmian cofniętych z historii (BR-LIC-003) i bez wpisań wartości (BR-LIC-017); prucie zmniejsza wykonanie
- Jednostki: C, Z_przed, R, g [rz.]; d [dni]
- Granica: d = 1 (termin dziś, włącznie); d < 1 po terminie; C > 0 (ostre)
- Podstawa: decyzja P-047 (cel stały w ciągu dnia), rachunek; potrzeba J-11 (P-043, ZAL-027: cel dzienny to hipoteza)
- Krytyczna: nie
- Uproszczenie: równy podział rzędów na dni, bez dni wolnych i bez różnicy pracy między rzędami (RD-14).

| ID | C [rz.] | Z_przed [rz.] | d [dni] | Oczekiwane: g [rz.] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|---|
| RD-15-W1 | 320 | 140 | 14 | 13 | 0 | typowy | rachunek: ⌈180 / 14⌉ = ⌈12,86⌉; d dla 2026-10-22 → 2026-11-04 |
| RD-15-W2 | 320 | 140 | 12 | 15 | 0 | typowy | rachunek: 180 / 12 = 15 bez zaokrąglenia |
| RD-15-W3 | 320 | 300 | 1 | 20 | 0 | granica | rachunek: termin dziś, całe R dziś |
| RD-15-W4 | 320 | 300 | 0 | brak celu, zostało 20 | — | poniżej | rachunek: d < 1; zasada po terminie z P-047 |
| RD-15-W5 | 320 | 300 | 2 | 10 | 0 | powyżej | rachunek: ⌈20 / 2⌉ |
| RD-15-W6 | 320 | 320 | 5 | 0 | 0 | granica | rachunek: R = 0, cel osiągnięty |
| RD-15-W7 | 0 | 0 | 5 | błąd danych | — | błąd | rachunek: brak celów części |

### RD-16: Dzień zmiany w strefie czasowej urządzenia
- Wzór: dzień zmiany = data lokalna w strefie czasowej urządzenia w chwili zmiany, zapisanej razem ze zmianą; późniejsza zmiana strefy nie przenosi dawnych zmian między dniami
- Jednostki: chwila [UTC, ISO 8601]; strefa [IANA]; dzień [data]
- Granica: 00:00:00 czasu lokalnego należy do nowego dnia (włącznie)
- Podstawa: rachunek (baza stref IANA); potrzeba: „I worked about 20 rows Sunday and the counter says they were all Saturday” (Easy Knitty, id10008576789), ER-24
- Krytyczna: nie

| ID | chwila [UTC] | strefa [IANA] | Oczekiwane: dzień [data] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|
| RD-16-W1 | 2023-06-04T01:30:00Z | America/New_York | 2023-06-03 | 0 | typowy | rachunek: UTC−4 (czas letni), 21:30 lokalnie |
| RD-16-W2 | 2023-06-04T01:30:00Z | Europe/Warsaw | 2023-06-04 | 0 | typowy | rachunek: UTC+2, 03:30 lokalnie |
| RD-16-W3 | 2026-10-22T22:00:00Z | Europe/Warsaw | 2026-10-23 | 0 | granica | rachunek: 00:00:00 lokalnie |
| RD-16-W4 | 2026-10-22T21:59:59Z | Europe/Warsaw | 2026-10-22 | 0 | poniżej | rachunek: 23:59:59 lokalnie |
| RD-16-W5 | 2026-10-22T22:00:01Z | Europe/Warsaw | 2026-10-23 | 0 | powyżej | rachunek: 00:00:01 lokalnie |
| RD-16-W6 | brak | Europe/Warsaw | błąd danych | — | błąd | rachunek: zmiana bez chwili |

### RD-17: Strażnik stuknięć: seria dodań do sprawdzenia
- Wzór: pytanie „Dodano n rzędów w t s. Cofnąć?” pojawia się, gdy w liczniku rzędów istnieją 3 kolejne dodania z `t_(i+2) − t_i ≤ T`; T = 2 s; seria obejmuje wszystkie dodania z odstępem ≤ T od poprzedniego
- Jednostki: t [s]; T [s]; n [-]
- Granica: `t_(i+2) − t_i = 2 s` wyzwala (włącznie)
- Podstawa: rachunek; parametr T i próg 3 dodań z decyzji P-047 (parametr produktowy, ocena roli 01 do korekty po wydaniu); potrzeba J-01 (P-044, I-1); tylko liczniki rzędów, nie oczek (ER-24)
- Krytyczna: nie

| ID | chwile dodań [s] | Oczekiwane: pytanie [-] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|
| RD-17-W1 | 0; 0,4; 0,8; 1,2; 1,6 | tak | — | typowy | rachunek: 0,8 − 0 ≤ 2 |
| RD-17-W2 | 0; 1; 2 | tak | — | granica | rachunek: 2 − 0 = 2, włącznie |
| RD-17-W3 | 0; 1; 2,01 | nie | — | powyżej | rachunek: 2,01 > 2 |
| RD-17-W4 | 0; 0,5 | nie | — | poniżej | rachunek: tylko 2 dodania (nadrobienie zapomnianego rzędu) |
| RD-17-W5 | 0; 60; 120 | nie | — | typowy | rachunek: zwykłe dzierganie |
| RD-17-W6 | 0; 1; 0,5 | błąd danych | — | błąd | rachunek: chwile nie rosną |

### RD-18: Szacunek „zdążę?” z własnego tempa
- Wzór: `h = C × H / R`; `dni = ⌈h / h_d⌉`; R i H z ukończonych projektów z sesjami stopera; h_d = średni czas stopera na dzień z robótką
- Jednostki: C, R [rz.]; H, h, h_d [h]; dni [dni]
- Granica: R > 0 i H > 0 (ostre); bez historii brak szacunku
- Podstawa: rachunek; potrzeba J-11 (P-044, I-4; w zakresie PÓŹNIEJ, P-046)
- Krytyczna: nie
- Uproszczenie: tempo z poprzednich projektów nie uwzględnia innej techniki, włóczki ani grubości drutów; wynik oznaczony jako szacunek.

| ID | C [rz.] | R [rz.] | H [h] | h_d [h] | Oczekiwane: h [h] | Oczekiwane: dni [dni] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|---|---|---|
| RD-18-W1 | 320 | 600 | 20 | 1 | 10,67 | 11 | 0,01 | typowy | rachunek: 320 × 20 / 600; ⌈10,67 / 1⌉ |
| RD-18-W2 | 320 | 600 | 20 | 2 | 10,67 | 6 | 0,01 | typowy | rachunek: ⌈10,67 / 2⌉ |
| RD-18-W3 | 320 | 0 | 0 | 0 | brak szacunku | brak szacunku | — | granica | rachunek: R = 0, pierwszy projekt |
| RD-18-W4 | 320 | 600 | 0 | 0 | brak szacunku | brak szacunku | — | poniżej | rachunek: H = 0, brak sesji stopera |
| RD-18-W5 | 100 | 100 | 10 | 1 | 10 | 10 | 0,01 | powyżej | rachunek: tempo 10 rz./h |
| RD-18-W6 | -5 | 600 | 20 | 1 | błąd danych | błąd danych | — | błąd | rachunek: C < 0 |
