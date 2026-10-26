# Atlas technik — pola danych kroków (uzgodnienie 06 ↔ 05)

Status: **propozycja roli 06 z 2026-10-26** (P-200: pola kroków uzgadniamy przez ten plik). Rola 05 dopisuje odpowiedź w sekcji „Odpowiedź 05” albo zmienia pola. Rola 06 wypełnia dane według ostatniej wersji tego pliku.
Zasady wiążące: P-192 (w SVG brak tekstu, liter i skrótów; numery kroków jako cyfry arabskie; podpis, opis kroków i tekst dla VoiceOver przez `t()`), P-093 (jedno źródło danych JSON z ID twierdzeń), P-108 (pole źródła niewyświetlane).

## Podział pracy
- **06** daje *co* rysunek ma pokazać: kroki z ruchem nici i narzędzia, skutek techniki (bilans oczek, pochylenie, znaczenie na prawej i lewej stronie), klucze tekstu, ID twierdzeń. Wartości tylko z enumów niżej, bez współrzędnych.
- **05** daje *jak*: rodzina rysunku, geometria, warstwy, kolory z tokenów, testy geometrii. Pola, których 05 potrzebuje, a których tu nie ma, dopisuje 05; 06 uzupełnia je ze źródeł albo zgłasza jako [DO USTALENIA].

## Pozycja (karta albo tabela)
| Pole | Typ | Znaczenie |
|---|---|---|
| `id` | string | stałe, ASCII, np. `knit.dec.k2tog`, `crochet.st.sc`, `table.us-uk.crochet` |
| `rzemioslo` | `knit` \| `crochet` | |
| `rodzaj` | `stitch` \| `fabric` \| `decrease` \| `increase` \| `cable` \| `bind-off` \| `cast-on` \| `chart` \| `table` | |
| `publikacja` | `mvp` \| `po-generatorze` \| `po-zrodle` | `po-generatorze`: dane gotowe, karta czeka na ocenę rysunku przez 05 (nabieranie, P-200 Q1a) |
| `terminy` | `{ [jezyk]: [{ nazwa, skrot, twierdzenie, status }] }` | kilka nazw przy jednym ID (np. dwie polskie nazwy jednego oczka szydełkowego); `status`: `publikowany` \| `zapisany` (język bez publikacji, OP-12) |
| `skutek` | obiekt | `bilans` (liczba całkowita: zmiana liczby oczek w rzędzie, np. −1), `pochylenie` (`prawo` \| `lewo` \| `srodek` \| `null`), `znaczenie_ws` (ID pozycji, którą ten sam znak oznacza na lewej stronie, albo `null`), `wysokosc` (szydełko: liczba narzutów przed wkłuciem), `twierdzenia` |
| `rysunek` | obiekt \| `null` | `null` dla tabel; inaczej `kroki` i `alt` |
| `rysunek.alt` | klucz tekstu | tekst dla VoiceOver dla całego rysunku |
| `twierdzenia` | `string[]` | ID wszystkich twierdzeń karty (kontrola: twierdzenie bez źródła nie trafia do danych) |

## Krok (`rysunek.kroki[]`)
| Pole | Typ | Znaczenie |
|---|---|---|
| `n` | 1…N | numer kroku (rysowany cyfrą, P-192 (4)); N = liczba ruchów w procedurze źródła |
| `narzedzie` | `prawy-drut` \| `lewy-drut` \| `drut-pomocniczy` \| `szydelko` | narzędzie, które w tym kroku się rusza |
| `akcja` | `wklucie` \| `owiniecie` \| `przeciagniecie` \| `zsuniecie` \| `przelozenie` \| `zdjecie` \| `przeciagniecie-zdjetego` \| `odlozenie-na-pomocniczy` \| `narzut` | jedna akcja na krok |
| `cel` | `{ petla: 'biezaca' \| 'nastepna' \| 'dwie-nastepne' \| 'trzy-nastepne' \| 'zdjeta' \| 'nitka-poprzeczna' \| 'na-pomocniczym' \| 'na-kciuku' \| 'nowa', indeks?: number }` | której pętli dotyczy akcja; `indeks` 0 = pierwsza na lewym drucie |
| `kierunek` | `od-przodu` \| `od-tylu` \| `od-lewej` \| `od-prawej` \| `null` | kierunek wkłucia względem robótki |
| `scianka` | `przednia` \| `tylna` \| `null` | |
| `nitka` | `przod` \| `tyl` \| `null` | położenie nitki roboczej względem robótki |
| `owiniecie` | `przeciwnie-do-wskazowek` \| `zgodnie-z-wskazowkami` \| `null` | patrząc od czubka drutu, jak w źródle |
| `pomocniczy` | `przod` \| `tyl` \| `null` | położenie drutu pomocniczego (warkocze) |
| `petle_na_szydelku` | number \| `null` | szydełko: ile pętli jest na szydełku po kroku |
| `podpis`, `opis` | klucze tekstu | `atlas.<id>.krok.<n>.podpis`, `atlas.<id>.krok.<n>.opis`; tekst bazowy en |
| `twierdzenia` | `string[]` | ID twierdzeń, z których wynika krok |

Wartość spoza enumu albo pole, którego źródło nie podaje, ma `null` i wpis w otwartych pytaniach roli 06, nie wartość domyślną.

## Przykład (kształt, nie treść)
```json
{ "n": 2, "narzedzie": "prawy-drut", "akcja": "owiniecie", "cel": { "petla": "biezaca", "indeks": 0 },
  "kierunek": null, "scianka": null, "nitka": "tyl", "owiniecie": "przeciwnie-do-wskazowek",
  "pomocniczy": null, "petle_na_szydelku": null,
  "podpis": "atlas.knit.st.k.krok.2.podpis", "opis": "atlas.knit.st.k.krok.2.opis", "twierdzenia": ["ATL-K-…"] }
```

## Pytania 06 do 05
1. Czy rodzina rysunku (`loop-grid`, `crochet-graph`, glif schematu, nabieranie) ma być polem danych 06, czy wynika w generatorze z `rodzaj`?
2. Czy `skutek.pochylenie` i `bilans` wystarczą do testów kierunku i bilansu, czy potrzebna jest też kolejność warstw (która pętla na wierzchu)?
3. Czy krok ma pokazywać stan przed akcją, czy po niej?

## Odpowiedź 05
(do wpisania przez 05)
