# Kontrakt danych karty atlasu i kroków rysunku — wersja 0 (robocza)

Właściciel kontraktu: rola 05 (ADR-0023, w przygotowaniu). Wypełnia: rola 06. Stan: **wersja 0.1, 2026-10-26** (0.1: `operacja.kolumna`) — wiąże po E2 roli 05 (JSON Schema `docs/atlas/katalog.schema.json` i walidator). Do tego czasu zmiany pól tylko przez ten plik: 06 dopisuje pytania w sekcji „Pytania 06”, 05 odpowiada zmianą wersji.

## Zasady (dlaczego tak)

1. **W danych nie ma tekstu do wyświetlenia**, tylko klucze `t()` (angielski jako baza, ADR-0017). *Dlaczego:* P-192 — rysunek jeden na wszystkie języki, tekst obok niego.
2. **Rysunek opisuje się tym, co pokazuje, nie współrzędnymi.** Krok wskazuje stan tkaniny, pętle i ruch ze słownika niżej; geometrię liczy silnik. *Dlaczego:* tak jak rodziny w Treningu — poza wynika z ograniczeń, więc błędnego przeplotu nie da się wpisać.
3. **Każda wartość, której atlas uczy (pochylenie, bilans oczek, kolejność warstw), ma ID twierdzenia roli 06.** Test porównuje geometrię rysunku z wartością twierdzenia (np. k2tog: górna pętla przesunięta w prawo ⇔ `pochylenie: "prawo"`). *Dlaczego:* rysunek, który przeczy źródłu, ma oblać test, a nie trafić na stronę.
4. **Liczba na rysunku tylko jako numer kroku** (cyfry arabskie, glif własny, P-192 (4)). Inne liczby wyłącznie w tekście obok, z ID twierdzenia.
5. **Glify symboli własne:** `origin: "own"` i opis z prymitywów; żadnego glifu przerysowanego z cudzej tabeli (P-081 P7a).
6. ID: ASCII, małe litery, kropki: `<rzemioslo>.<rodzaj>.<nazwa>` (np. `druty.ujecie.k2tog`). Klucze tekstu: `atlas.<id>.<pole>`.

## Karta (jeden obiekt na technikę)

| Pole | Typ | Wymagane | Znaczenie |
|---|---|---|---|
| `id` | string | tak | jak w zasadzie 6 |
| `rzemioslo` | `"druty"` \| `"szydelko"` | tak | |
| `rodzaj` | `"oczko"` \| `"scieg"` \| `"ujecie"` \| `"dodanie"` \| `"nabieranie"` \| `"zamykanie"` \| `"warkocz"` \| `"oczko_szydelkowe"` | tak | wybiera rodzinę rysunku |
| `klucze` | `{ nazwa, podpis, opis_alt }` | tak | klucze `t()`; `opis_alt` = tekst VoiceOver całego rysunku |
| `terminy` | `{ [tag BCP 47]: { skrot: string \| null, twierdzenie: ID } }` | tak (min. `en-US`) | skrót jako fakt ze źródła; `en-US` i `en-GB` osobno (US/UK przy jednym ID, test RYZ-03) |
| `twierdzenia` | `[{ id, wartosc }]` | tak | `wartosc` ze słownika „Wartości sprawdzane” niżej |
| `jezyki_gotowe` | tag[] | tak | języki z przeczytanym źródłem terminologii i przeglądem (P-095 D1); generator strony publikuje tylko te |
| `rysunek` | obiekt | tak, gdy karta ma rysunek | niżej |
| `kroki` | krok[] (1–8) | tak, gdy `rysunek` | niżej |
| `glif` | `{ id, origin: "own", rs, ws }` | nie | znaczenie po prawej (RS) i lewej (WS) stronie (test 7 z raportu B §5.4) |

### `rysunek`

| Pole | Typ | Znaczenie |
|---|---|---|
| `rodzina` | `"siatka-petli"` (druty: prawe, lewe, ujęcia, dodania) · `"graf-szydelkowy"` (szydełko) · `"nabieranie"` (planowana, poza prototypem) | silnik rodziny |
| `probka` | `{ kolumny: 2–8, rzedy: 1–4 }` | wielkość wycinka tkaniny przed operacją |
| `tlo` | `"prawe"` \| `"lewe"` | ścieg otoczenia (dżersej prawy / lewy) |
| `operacja` | obiekt albo `null` | co robi technika, niżej |

`operacja` (druty, rodzina `siatka-petli`):

| `typ` | Pola | Przykład |
|---|---|---|
| `"oczko"` | `strona`: `"prawe"`\|`"lewe"`, `kolumna` | oczko prawe / lewe |
| `"scal"` | `zuzywa` (2–3), `strona`, `na_wierzchu`: `"lewe"`\|`"prawe"`\|`"srodkowe"`, `kolumna` | k2tog: `zuzywa 2, strona prawe, na_wierzchu lewe, kolumna 1` |
| `"narzut"` | — | yo (+1, kolumna bez rodzica) |
| `"z_nitki_poziomej"` | `skret`: `"lewy"`\|`"prawy"` | M1L / M1R |

`kolumna` (od 0.1, opcjonalne): pierwsza kolumna próbki, na której działa operacja; brak = środek próbki. Operacja działa w najwyższym rzędzie próbki (`rzedy − 1`).

Bilans oczek (`daje − zuzywa`) i kierunek pochylenia **wylicza silnik** z operacji; test porównuje je z twierdzeniami karty.

### `kroki[]` — co pokazuje każdy krok

| Pole | Typ | Znaczenie |
|---|---|---|
| `faza` | słownik niżej | stan pokazany na rysunku kroku |
| `petle` | `[{ rzad, kolumna }]` | pętle, których dotyczy krok; `rzad` 0 = najniższy rząd próbki, `kolumna` 0 = skrajnie lewa na stronie prawej |
| `wyroznij` | `[{ rzad, kolumna }]` | pętle podświetlone (token zakreślacza) |
| `kierunek` | `"od_przodu"` \| `"od_tylu"` \| `null` | kierunek wkłucia drutu albo przeciągania nitki (na prawo = od przodu, na lewo = od tyłu — wartość z twierdzenia) |
| `strzalka` | `null` \| `{ ruch: "drut"\|"nitka", od: kotwica, do: kotwica }` | kotwice: `"glowa:<r>:<k>"`, `"nozka_lewa:<r>:<k>"`, `"nozka_prawa:<r>:<k>"`, `"drut_prawy"`, `"drut_lewy"` |
| `klucz` | string | klucz `t()` podpisu kroku (`atlas.<id>.krok<n>`) |

Słownik `faza` (silnik rysuje tylko te; nowa faza = nowa wersja kontraktu):

| Faza | Co widać | Prototyp E1 |
|---|---|---|
| `"tkanina"` | próbka przed operacją | tak |
| `"wklucie"` | prawy drut wbity w `petle` w `kierunek` | E2 |
| `"narzut"` | nitka owinięta na prawym drucie | E2 |
| `"przeciagniecie"` | nowa pętla przeciągnięta przez `petle` | E2 |
| `"zdjecie"` | stare pętle zsunięte z lewego drutu | E2 |
| `"wynik"` | próbka po operacji, nowa pętla wyróżniona | tak |

### Wartości sprawdzane (`twierdzenia[].wartosc`)

| Klucz | Wartości | Test silnika |
|---|---|---|
| `pochylenie` | `"prawo"` \| `"lewo"` \| `"srodek"` \| `"brak"` | znak przesunięcia głowy górnej pętli |
| `bilans` | liczba całkowita | liczba kolumn po − przed |
| `na_wierzchu` | jak w `operacja` | kolejność warstw na skrzyżowaniu pętli |
| `kierunek` | `"od_przodu"` \| `"od_tylu"` | warstwa nóżek nowej pętli wobec głowy starej |

## Przykład (k2tog) — `[PRZYKŁAD]`, ID twierdzeń do nadania przez 06

Karty próbne przechodzące silnik i testy: `docs/atlas/prototyp/karty/` (oczko prawe, oczko lewe, k2tog; `probka.rzedy` 3).

```json
{
  "id": "druty.ujecie.k2tog",
  "rzemioslo": "druty",
  "rodzaj": "ujecie",
  "klucze": { "nazwa": "atlas.druty.ujecie.k2tog.nazwa", "podpis": "atlas.druty.ujecie.k2tog.podpis", "opis_alt": "atlas.druty.ujecie.k2tog.opis_alt" },
  "terminy": { "en-US": { "skrot": "k2tog", "twierdzenie": "TW-ATLAS-K2TOG-SKROT" } },
  "twierdzenia": [
    { "id": "TW-ATLAS-K2TOG-POCHYLENIE", "wartosc": { "pochylenie": "prawo", "bilans": -1 } }
  ],
  "jezyki_gotowe": ["en-US"],
  "rysunek": {
    "rodzina": "siatka-petli",
    "probka": { "kolumny": 4, "rzedy": 3 },
    "tlo": "prawe",
    "operacja": { "typ": "scal", "zuzywa": 2, "strona": "prawe", "na_wierzchu": "lewe", "kolumna": 1 }
  },
  "kroki": [
    { "faza": "tkanina", "petle": [{ "rzad": 1, "kolumna": 1 }, { "rzad": 1, "kolumna": 2 }], "wyroznij": [{ "rzad": 1, "kolumna": 1 }, { "rzad": 1, "kolumna": 2 }], "kierunek": null, "strzalka": null, "klucz": "atlas.druty.ujecie.k2tog.krok1" },
    { "faza": "wynik", "petle": [{ "rzad": 2, "kolumna": 1 }], "wyroznij": [{ "rzad": 2, "kolumna": 1 }], "kierunek": "od_przodu", "strzalka": null, "klucz": "atlas.druty.ujecie.k2tog.krok2" }
  ]
}
```

Źródło wartości w przykładzie: „k2tog — knit 2 stitches together; single right-leaning decrease” (CYC, Knitting Abbreviations Master List; kopia `oczko-warsztat/strona-katalog/2026-10-25-research/zrodla/B-cyc-knitting-abbreviations.txt:174–175`). ID twierdzeń w przykładzie są robocze.

## Nabieranie oczek (dane od 06 do oceny generatora)

Rodzina `"nabieranie"` nie istnieje jeszcze w silniku (raport B §5.2: wykonalność 1 z 3). Prośba do 06 na tę chwilę: dla każdej z 3 metod lista kroków w tym formacie z fazami opisanymi słownie w polu `faza_opis` (np. „nitka owinięta wokół kciuka, drut pod przednią nitką”) i ID twierdzenia procedury. Z tego 05 oceni, czy wystarczy słownik faz (np. `petla_na_kciuku`, `wklucie_pod_nitke`) i rodzina ścieżki nici wokół drutu, czy metoda zostaje poza MVP. Pole `faza_opis` zniknie, gdy fazy wejdą do słownika.

## Pytania 06

(06 dopisuje tutaj; 05 odpowiada nową wersją pliku.)
