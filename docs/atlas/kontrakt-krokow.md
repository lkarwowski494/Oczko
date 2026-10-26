# Kontrakt danych karty atlasu i kroków rysunku — wersja 1

Właściciel kontraktu: rola 05 (ADR-0023). Wypełnia: rola 06. Stan: **wersja 1 (`format: 1`), 2026-10-26, E2 — wiąże.** Źródło prawdy: `scripts/atlas/silnik/kontrakt.ts` (`SCHEMAT`) → `docs/atlas/katalog.schema.json` (JSON Schema 2020-12; zgodność pliku z kodem sprawdza `verify`). Walidator dla 06:

```
node --experimental-strip-types --no-warnings scripts/atlas/waliduj.mjs <katalog-kart|plik.json> [--bez-rysunku]
```

Kod 0 = poprawne; każdy błąd: kod, ścieżka pola (np. `$.kroki[1].drut`), opis. Zmiana pól = nowy `format` i wpis w „Historia”. Pytania 06 — sekcja na końcu.

## Zasady (dlaczego tak)

1. **W danych nie ma tekstu do wyświetlenia**, tylko klucze `t()` (angielski jako baza, ADR-0017). Wyjątki: `terminy[].nazwa` i `skrot` (fakty ze źródła, nie tekst interfejsu) oraz tymczasowe `faza_opis` (tylko rodzina `nabieranie`). *Dlaczego:* P-192 — rysunek jeden na wszystkie języki.
2. **Rysunek opisuje się tym, co pokazuje, nie współrzędnymi**; geometrię i przeplot liczy silnik (ADR-0022). *Dlaczego:* błędnego przeplotu nie da się wpisać.
3. **Wartość, której atlas uczy, ma ID twierdzenia roli 06**; jeśli karta ją ma, rysunek musi się z nią zgadzać (pochylenie, bilans, kierunek wkłucia). Bilans i pochylenie silnik liczy z `operacja` — twierdzenie nie jest wymagane, gdy źródło nie mówi tego zdaniem (odpowiedź na pytanie 5).
4. **Liczba na rysunku tylko jako numer kroku** — glif własny, nie font (P-192 (4)); silnik dodaje go, gdy karta ma > 1 krok.
5. **Glify symboli własne:** `glif.origin` przyjmuje tylko `"own"` (P-081 P7a).
6. **ID i klucze:** `id` = `<prefiks>.<…>` (1–3 człony po prefiksie, małe litery, cyfry, `_`, `-`); prefiks = `rzemioslo` albo — dla `tabela`, `schemat`, `skrot` — sam rodzaj (`tabela.us-uk.szydelko`, `schemat.powtorzenia`, `skrot.druty.sl`). Klucze: `atlas.<id>.<pole>`, krok n: `atlas.<id>.krok<n>`. ID twierdzeń: `^[A-Z]{2,4}(-[A-Z0-9]+)+$` (`ATL-K-001`, `TRM-EN-006`).

## Karta

| Pole | Typ | Wymagane | Znaczenie |
|---|---|---|---|
| `format` | `1` | tak | nowszy niż obsługiwany → karta pominięta w aplikacji, błąd w walidatorze |
| `id` | string | tak | zasada 6 |
| `rzemioslo` | `druty` \| `szydelko` \| `oba` | tak | `oba` dla konwencji wspólnych (np. `schemat.powtorzenia`) |
| `rodzaj` | `oczko`, `scieg`, `ujecie`, `dodanie`, `nabieranie`, `zamykanie`, `warkocz`, `oczko_szydelkowe`, `tabela`, `schemat`, `skrot` | tak | `skrot` = hasło skrótu: bez rysunku i bez własnej strony (P-095), pokazuje je tabela |
| `pozycje` | ID[] | tylko i zawsze przy `tabela` | wiersze tabeli = karty (zwykle `skrot.*`) w tej kolejności |
| `klucze` | `{ nazwa, podpis, opis_alt }` | tak | `opis_alt` = tekst VoiceOver rysunku |
| `terminy` | `{ [tag BCP 47]: [{ nazwa?, skrot, twierdzenie }] }` (1–4 wpisy na język) | tak, z `en-US` | kilka nazw przy jednym ID (P-106; pytanie 4); `en-US` i `en-GB` osobno |
| `twierdzenia` | `[{ id, wartosc }]` (1–16) | tak | bez powtórzeń ID |
| `jezyki_gotowe` | tag[] (≥ 1), ⊆ klucze `terminy` | tak | strona publikuje tylko te; aplikacja: ADR-0025 (przełącznik Q3) |
| `glif` | `{ id: "glif.…", origin: "own", rs, ws }` | nie | |
| `rysunek` + `kroki` | obiekt + krok[] (1–8) | razem albo wcale | |

### `rysunek`

| Pole | Wartości |
|---|---|
| `rodzina` | `siatka-petli` (druty; rysowana) · `graf-szydelkowy`, `nabieranie` (kontrakt przyjmuje, silnik nie rysuje → `rysunek-nieobslugiwany`) |
| `probka` | `{ kolumny: 2–8, rzedy: 2–4 }`; operacja działa w rzędzie `rzedy − 1` |
| `tlo` | `prawe` \| `lewe` |
| `operacja` | niżej; `kolumna` = pierwsza kolumna operacji (brak = środek próbki) |

| `operacja.typ` | Pola | Silnik |
|---|---|---|
| `oczko` | `strona`, `kolumna?` | rysuje |
| `scal` | `zuzywa` 2–3, `strona`, `na_wierzchu` `lewe`\|`prawe`, `kolumna?` | rysuje |
| `narzut` | `kolumna?` | w kontrakcie (pytanie 2) |
| `z_nitki_poziomej` | `scianka` `przednia`\|`tylna`, `pochylenie` `prawo`\|`lewo`, `kolumna?` | w kontrakcie |
| `scieg` | `wzor`: rzędy × kolumny (`prawe`\|`lewe`) **tak, jak wyglądają na stronie prawej** (karta podaje twierdzenie o przeliczeniu rzędu lewej strony) | w kontrakcie |
| `warkocz` | `zuzywa` 2–8, `przekladane` 1–4, `pomocniczy` `przod`\|`tyl`, `kolumna?` | w kontrakcie |
| `zamknij` | `ile` 1–6 | w kontrakcie |
| `oczko_szydelkowe` | `narzuty` 0–3 | w kontrakcie (rodzina `graf-szydelkowy`) |

### `kroki[]`

| Pole | Typ | Znaczenie |
|---|---|---|
| `faza` | `tkanina`, `wklucie`, `wynik` (rysowane) · `narzut`, `przeciagniecie`, `zdjecie` (w kontrakcie) | |
| `petle`, `wyroznij` | `[{ rzad 0–7, kolumna 0–11 }]` | `rzad` 0 = najniższy, `kolumna` 0 = lewa na stronie prawej |
| `kierunek` | `od_przodu` \| `od_tylu` \| `null` | kierunek wkłucia narzędzia z `drut`; wymagany w `wklucie` |
| `drut` | `{ ktory: prawy\|lewy\|pomocniczy\|szydelko, grot: w_lewo\|w_prawo }` | tylko i zawsze w `wklucie`; silnik rysuje dziś `prawy` (pytanie 3) |
| `nitka` | `przod` \| `tyl` (opcjonalne) | położenie nitki roboczej (pytanie 3; ATL-K-003, ATL-K-005) |
| `scianka` | `przednia` \| `tylna` (opcjonalne) | za którą ściankę (M1R/M1L) |
| `petle_na_narzedziu` | 0–6 (opcjonalne) | pętle na szydełku po kroku |
| `faza_opis` | string ≤ 300 (tymczasowe) | tylko rodzina `nabieranie` (pytanie 6) |
| `strzalka` | `null` \| `{ ruch: drut\|nitka, od, do }` | kotwice: `glowa:<r>:<k>`, `nozka_lewa:<r>:<k>`, `nozka_prawa:<r>:<k>`, `drut_prawy` |
| `klucz` | string | `atlas.<id>.krok<n>` |

Faza `wklucie`: rysunek przed operacją + drut przez każdą pętlę z `petle`, po 2 skrzyżowania; `od_przodu` → bliżej ogona drut na wierzchu, bliżej grotu pętla; drut nie dotyka innych pętli.

### Wartości sprawdzane (`twierdzenia[].wartosc`, ≥ 1 pole)

| Klucz | Wartości | Sprawdzenie |
|---|---|---|
| `pochylenie` | `prawo`, `lewo`, `srodek`, `brak` | znak przesunięcia głowy pętli na wierzchu ujęcia |
| `bilans` | −4…4 | kolumny po − przed |
| `kierunek` | `od_przodu`, `od_tylu` | zgodność z `strona` operacji przez założenie silnika **A-1** (nowa pętla przechodzi przez starą przeciwnie do wkłucia: od przodu → oczko prawe) i z `kierunek` kroków |
| `na_wierzchu` | `lewe`, `prawe`, `srodkowe` | zapis (silnik bierze wartość z `operacja`) |

## Katalog (manifest `atlas.json`, ADR-0025)

```json
{ "format": 1, "wersja": "2026-10-26.1", "karty": [{ "plik": "druty.ujecie.k2tog.json", "bajty": 2048, "sha256": "…" }] }
```

Plik `^[a-z0-9][a-z0-9._-]*\.json$`; SHA-256 z bajtów pliku (przed parsowaniem). Manifest nowszego formatu → cały katalog odrzucony; zła karta → pominięta, reszta działa (`scripts/atlas/silnik/katalog.ts`).

## Przykład

`docs/atlas/prototyp/karty/` — `druty.oczko.k`, `druty.oczko.p`, `druty.ujecie.k2tog` z ID twierdzeń z rejestru 06 (ATL-K-001, -002, -005, -006, -040, -041; TRM-EN-001, -002, -006). Wartość nieobjęta twierdzeniem: `drut.grot` w k2tog (`w_lewo`) — `[DO USTALENIA: 06]`.

## Odpowiedzi 05 na pytania 06 (2026-10-26, E2)

1. Rodzaje `tabela`, `schemat`, `skrot` dodane; ID z prefiksem rodzaju (zasada 6), `rzemioslo: oba` dla konwencji wspólnych; tabela wskazuje wiersze polem `pozycje`; `skrot` bez rysunku i bez strony.
2. Typy operacji `narzut`, `z_nitki_poziomej`, `scieg`, `warkocz`, `zamknij`, `oczko_szydelkowe` w kontrakcie (pola jak w tabeli; `pomocniczy` jak w danych 06, `narzuty` zamiast `wysokosc`); silnik ich jeszcze nie rysuje — walidator zgłasza `rysunek-nieobslugiwany`, `--bez-rysunku` sprawdza resztę.
3. Pola kroku `nitka`, `scianka`, `petle_na_narzedziu`; `drut.ktory` (`prawy`, `lewy`, `pomocniczy`, `szydelko`) — `kierunek` dotyczy narzędzia z `drut`.
4. `terminy` jako lista `[{ nazwa?, skrot, twierdzenie }]` na język (do 4).
5. Silnik liczy bilans i pochylenie z operacji; twierdzenie, jeśli jest, musi się zgadzać; `null` w danych 06 = brak twierdzenia (nie wpisywać do `wartosc`).
6. `faza_opis` dopuszczone tymczasowo tylko w rodzinie `nabieranie`.
- Z-06-01: kierunek przeciągania nie jest twierdzeniem atlasu — to założenie silnika A-1 (e2-moduly-dane.md §3), wiązane testem z twierdzeniami o kierunku wkłucia.

## Historia

- 0 (E0), 0.1 (E1: `operacja.kolumna`).
- **1 (E2):** `format`; ID twierdzeń w postaci rejestru 06; ID z prefiksem rodzaju; `rzemioslo: oba`; rodzaje `tabela`, `schemat`, `skrot` i pole `pozycje`; `terminy` jako lista z `nazwa`; operacje z pytania 2; pola kroku `drut {ktory, grot}`, `nitka`, `scianka`, `petle_na_narzedziu`, `faza_opis`; granice liczb; manifest katalogu.

## Pytania 06

(06 dopisuje tutaj; 05 odpowiada nową wersją pliku.)

**2026-10-26, 06 (E1).** 06 przyjmuje wersję 0 i jej ID (`druty.ujecie.k2tog`); propozycja `kroki-pola.md` wycofana na rzecz tego pliku. Rejestr i dane 06 już używają tych ID. Pytania:
1. **Rodzaje spoza słownika.** MVP ma 5 tabel słownikowych i 3 karty konwencji schematu (pole „brak oczka”, powtórzenia `*`/`[ ]`, czytanie prawej i lewej strony), których `rodzaj` nie ma w wersji 0. 06 używa roboczo `schemat.<nazwa>` (np. `schemat.powtorzenia`) i `tabela.<nazwa>` (np. `tabela.us-uk.szydelko`), a dla haseł samych skrótów (sl, kwise, tbl, RS, rep…) `skrot.<rzemioslo>.<nazwa>`. Czy 05 dopisze rodzaje `schemat`, `tabela`, `skrot`, czy woli inny podział?
2. **Ściegi i warkocze w `operacja`.** Wersja 0 ma typy dla oczek, ujęć i dodań. Brakuje: ścieg (wzór rzędów, np. pończoszniczy = rząd prawy + rząd lewy, francuski, ściągacz), warkocz (`zuzywa` 4, drut pomocniczy `przod`/`tyl`, w danych 06: `pomocniczy`), zakańczanie (przeciągnięcie oczka przez oczko, 1 oczko zostaje) i szydełko (graf: `narzuty` 0–2 przed wkłuciem, liczba pętli na szydełku po każdym kroku). 06 ma dla nich twierdzenia: parametry w `oczko-warsztat/06-tresci/atlas/parametry.json` (pola `pomocniczy`, `wysokosc` = liczba narzutów, `petle_po_wyciagnieciu`, `pozostaje_na_drucie`).
3. **Pola kroku, których źródła wymagają, a wersja 0 nie ma:** położenie nitki roboczej (`przod`/`tyl` — przy oczku prawym zawsze z tyłu, ATL-K-003), ścianka (`przednia`/`tylna` — M1R za przednią, M1L za tylną, ATL-K-053/054), wkłucie lewego drutu (ssk, zakańczanie, M1 — `kierunek` w wersji 0 dotyczy prawego drutu), pętle na szydełku po kroku. Czy dodać pola `nitka`, `scianka`, `drut` (`prawy`/`lewy`/`pomocniczy`/`szydelko`)?
4. **`terminy`:** 06 ma też `nazwa` (pełną nazwę jako fakt ze źródła, nie tylko skrót) i kilka nazw w jednym języku przy jednym ID (pl: dwie nazwy oczka ścisłego, P-106). Proponuje `{ [tag]: [{ nazwa, skrot, twierdzenie }] }`. Nazwa wyświetlana nadal przez klucz `t()`.
5. **Bilans warkocza i narzutu** (`null` w danych 06): źródła nie mówią tego zdaniem (narzut: dział dodawania bez zdania „+1”, O-A-05). Czy silnik liczy bilans z `operacja` (wtedy test nie potrzebuje twierdzenia), czy wartość ma pochodzić z twierdzenia?
6. **Nabieranie:** kroki 3 metod z `faza_opis` dostarczy 06 w E2 razem z kartami (dane procedury: ATL-N-001…009).

**2026-10-26, 06 — odpowiedź na Z-06-01 (`docs/atlas/e1-decyzje.md`).** ID twierdzeń do kart próbnych zamiast `TW-ATLAS-PRZYKLAD-*`: k2tog pochylenie i bilans → `ATL-K-040` (standard, szczebel 1, + dwa podręczniki); skrót en-US „k2tog” → `TRM-EN-006`. **Kierunek wkłucia:** oczko prawe `od_przodu` → `ATL-K-001` („Insert the right needle from front to back…”), oczko lewe `od_tylu` → `ATL-K-005` („…the right needle is inserted into the stitch from back to front”); nitka przy prawym z tyłu `ATL-K-003`, przy lewym z przodu `ATL-K-005`. **Kierunek przeciągania nowej pętli** (przez oczko ku przodowi przy prawym, ku tyłowi przy lewym) — żadne przeczytane źródło nie mówi tego zdaniem; źródła mówią tylko „pull it through the stitch” (`ATL-K-002`, `ATL-K-006`). Jeśli reguła przeplotu w silniku potrzebuje kierunku przeciągania, niech wynika z geometrii (przeciwnie do wkłucia) jako założenie silnika, nie jako twierdzenie atlasu [DO USTALENIA dla 06: szukam zdania w E2]. Pełna lista ID: `oczko-warsztat/06-tresci/atlas/pozycje.json`, `parametry.json`.

**2026-10-26, 06 — do wersji 1 (P-213).** 06 przyjmuje wersję 1; katalog 06 przejdzie na nią po werdyktach E3 (karty `skrot.*` jako wiersze tabel przez `pozycje`, `terminy` jako listy, operacje z pytania 2, `drut {ktory, grot}`, teksty szydełka także en-GB).
1. **`twierdzenia` (minItems 1, `wartosc` minProperties 1 z kluczy `pochylenie|bilans|na_wierzchu|kierunek`)** — tabele, skróty, karty `schemat.*`, ściegi i część oczek szydełkowych nie mają żadnej takiej wartości; 06 nie wpisze wartości bez twierdzenia. Prośba: `twierdzenia` opcjonalne (albo `minItems: 0`) dla rodzajów `tabela`, `skrot`, `schemat`, `scieg` i dla kart bez `rysunek`; albo nowy klucz `wartosc` dla ściegu (`wzor`) i szydełka (`narzuty`, ATL-C-004…007) — 06 ma dla nich twierdzenia.
2. **`klucze.podpis` i `klucze.opis_alt` wymagane zawsze** — karta bez rysunku (skrót, tabela) nie ma tekstu dla VoiceOver; 06 da klucze z pustą treścią albo prosi o `opis_alt` opcjonalne przy braku `rysunek`. Które wolisz?
3. **`terminy.en-US` wymagane zawsze** — tabela i karta konwencji schematu nie są terminem; 06 wpisze `{ nazwa: null, skrot: null, twierdzenie: <twierdzenie podstawowe karty> }` (schemat to dopuszcza). Czy to zgodne z intencją?
- **Z-06-02 (`drut.grot` w k2tog):** źródła mówią o kierunku wkłucia w poziomie: oczko prawe „Wkłuwamy czubek prawego drutu od lewej do prawej (od przodu do tyłu)” (podręcznik PL s. 47), lewe „od prawej do lewej (od tyłu do przodu)” (s. 48); podręcznik EN s. 37: „To knit into front loop, insert right needle left to right into stitch”, „To purl into front loop, insert needle from right to left”. 06 dopisze twierdzenie ATL-K-011 (prawe: od lewej do prawej, lewe: od prawej do lewej). Przełożenie „ruch od lewej do prawej” na `grot` (`w_lewo`/`w_prawo`) to geometria silnika — jeśli 05 uzna, że grot to kierunek ruchu, prawe = `w_prawo`; jeśli to kierunek, w który patrzy czubek po wkłuciu, decyzja 05 jako założenie silnika (jak A-1).
