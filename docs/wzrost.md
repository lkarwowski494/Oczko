# Wzrost — Oczko — 2026-10-26

Rola 11-wzrost, tryb build (prompt `prompts` @97ec212). Stan: **STOP E3** (lista startowa, szkice, przekazanie); E0: P-145, E1: P-148, nazwa: P-149, E2: P-150; zmiany P-146, P-147. Szczegóły, nazwy miejsc i aplikacji, kopie źródeł: `oczko-warsztat/11-wzrost/2026-10-26-build/` (prywatne; P-107, P-121 (5)). Niczego nie publikujemy: szkice przygotowuje rola 11, publikuje właściciel ze swojego konta twórcy (jak Trening).

## Rama (E0)
- **Aplikacja niewydana:** poprzednia wersja tylko w TestFlight; zgłoszenie 1.0 realnie w 1. poł. grudnia 2026 (`docs/plan-app-store.md`). Danych App Analytics nie ma.
- **Rynek i język:** najpierw angielski (US, CA, GB, AU), potem ja, nb, de, fr według przesiewu 02 (ZAL-006). Wyjątek nazwany od „najpierw polski” z promptu roli: rynek główny globalny (`CLAUDE.md`), polski rynek narzędzi jest mały (przesiew 02).
- **Odczyt społeczności z kontenera:** jeden duży serwis dyskusyjny zwraca HTTP 403, grupy z logowaniem niedostępne; bez odczytu regulaminu kanał nie trafia na listę startową.
- **Ryzyko jawności:** właściciel nie dzierga (`docs/brd/odkrywanie.md`, „Źródło wiedzy”); szkice mówią „jestem autorem”, nigdy nie sugerują, że autor dzierga.
- **Twierdzenia:** tylko funkcje wydanej wersji 1.0 (OG-05, 2.3.1(a)); o zegarku i ekranie blokady dopiero po 07 audit i teście z testerkami.

## Reguły z dnia pracy (odczyt 2026-10-26)
| Reguła | Cytat (skrót) | Źródło |
|---|---|---|
| wytyczne | „Last Updated: October 16, 2026” | App Review Guidelines |
| 2.3.7 | nazwa do 30 znaków; bez „trademarked terms, popular app names, pricing information” w metadanych | j.w. |
| słowa kluczowe | „each greater than two characters”, „up to 100 bytes”, „Names of other apps or companies aren't allowed” | App Store Connect Help, Platform version information |
| podtytuł | „can’t be longer than 30 characters” | App Store Connect Help, App information |
| 4.5.4, 5.6.1, sekcja 3, 5.6.3 | powiadomienia nie są warunkiem działania; ocena tylko przez API; bez „paid, incentivized, filtered, or fake feedback”; bez manipulacji wyszukiwaniem i recenzjami | App Review Guidelines |
| nominacja „App Launch” | „minimum lead time of 3 weeks” | App Store Connect Help, nominate your app for featuring |

## Decyzje E0 (przyjęte: P-145 — D1a–D5a)
| ID | Pytanie | Opcje | Rekomendacja |
|---|---|---|---|
| D1 | budżet czasu właściciela | (a) 1 h/tydz. × 8 tygodni od premiery; (b) 2–3 h/tydz. z kontaktem z twórcami | (a) |
| D2 | ASO a rola 10 | (a) 11: pozycjonowanie i badanie fraz (en-US/en-GB, pl, ja, nb, de, fr) z propozycją nazwy, podtytułu i słów; 10: 35 lokalizacji po zamrożeniu funkcji (jak Trening); (b) 11: pełne 35 lokalizacji teraz | (a) |
| D3 | fora i grupy | (a) jak Trening: wpis tylko po pisemnej zgodzie administracji; (b) wątek autora bez zgody, gdy regulamin wprost pozwala | (a) |
| D4 | miejsca bez odczytu z kontenera | (a) „nie sprawdzono”, poza listą; (b) właściciel wkleja reguły 3–4 miejsc (ok. 15 min) | (a) |
| D5 | miejsce dokumentu | `docs/wzrost.md` + `docs/wzrost/dziennik.md` (kontrakt roli, jak Trening) albo `docs/marketing/` | `docs/wzrost.md` |

## Plan
E1 ludzie, kanały, pozycjonowanie i frazy (3–5 h agenta) → E2 powrót, prośba o ocenę (OP-33), pomiar (1,5–2,5 h) → E3 lista startowa i szkice (1–2 h; właściciel 20–30 min na zatwierdzenie). Po P-147: bez nominacji „App Launch”, premiera ok. 12–14.11 (wydanie ręczne po akceptacji Apple); w E3 szkic nominacji „App Enhancements” dla 1.1 (min. 3 tygodnie przed jej datą).

## Budżet i horyzont
Ok. 1 h tygodniowo przez 8 tygodni od premiery, czyli do ok. 7–9.01.2027 (P-145 D1a, do weta właściciela). Jednorazowy wpis metadanych i zrzutów w App Store Connect należy do kroku 11 planu i roli 10, nie do tego budżetu.

## Pozycjonowanie (E1; przyjęte P-148 E1-2a)
*For knitters and crocheters who lose count: one tap adds a row, undo takes it back, and your own pattern sits beside the counter. It opens where you stopped. No account, no ads, no tracking.*

| Twierdzenie | Dowód (kontrakt 1.0; potwierdza 07 audit) | Warunek |
|---|---|---|
| one tap adds a row, wibracja, ekran nie gaśnie | F-01, F-10 | — |
| undo, historia z godziną | F-02, F-45 | — |
| a warning when taps pile up; optional lock | F-47 (baner „Cofnąć?”), F-03 (domyślnie wyłączona) | nie pisać „protection” |
| your own pattern beside the counter | F-24–F-26, F-55, F-56, F-28 | OG-07 (weryfikacja patentowa, P-024); bez niej wariant bez wzoru |
| opens where you stopped | F-49, F-18, F-15 | — |
| reminders every N rows | F-06, F-48 | — |
| no account, no ads, no tracking; offline | F-36, NFR-PRY-001, P-021, `docs/architektura/prywatnosc.md` | „Data Not Collected” dopiero po decyzji roli 10 |
| export and import, recently deleted for 30 days | F-31–F-33, KP-02 | iCloud warunkowo (F-27, ZM-06) |
| free for 5 days a month, Pro removes the limit | P-057, `docs/monetyzacja.md` „Opis w sklepie” | E1-4: „knitting days” pomija szydełko — do 02/04 |
| 35 languages | D-026 | dopiero po 09 E2–E4 (P-144) |
| Apple Watch, ekran blokady | F-11, F-12 | warunkowo; bez obietnicy gestu podwójnego stuknięcia (P-146) |

Różnica wobec alternatyw: kartka i licznik mechaniczny gubią liczbę przy przerwie i nie mają historii ani wzoru obok; arkusz nie daje +1 jednym ruchem przy zajętych rękach; w recenzjach innych aplikacji najostrzejsze skargi to utrata danych i zakupu oraz przypadkowe stuknięcia (BRD, J-01, J-07). Ograniczenia jawne: iPhone i iPad (zegarek warunkowo), bez biblioteki wzorów, bez słownika i nauki w 1.0, limit 5 dni bez Pro, kalkulatory tylko podstawowe.

## Kanały (E1; przyjęte P-148 E1-1a)
Szczegóły z adresami, wątkami i cytatami regulaminów: `oczko-warsztat/11-wzrost/2026-10-26-build/e1/B-kanaly.md`.

| Kanał | Dowód niszy | Reguła (2026-10-26) | Forma | Godz./tydz. | Efekt × pewność ÷ godziny [OCENA] | Decyzja |
|---|---|---|---|---|---|---|
| sklep: ASO 7 lokalizacji | frazy licznika: słaba konkurencja (US: pierwsza dziesiątka 150–330 ocen; PL 0–7 wyników) | 2.3.7, limity ASC | metadane (rola 10) | 0 | 3 × 2 ÷ 0,25 = 24 | E1-1 |
| sklep: odpowiedzi na recenzje | linia bazowa: liderzy odpowiadają na 6–7 z 8 recenzji w próbce | 5.6.1 | odpowiedź (en, pl zawsze; inne ≤ 3★) | 0,25 | 2 × 2 ÷ 0,25 = 16 | E1-1 |
| prośba o ocenę w aplikacji | F-64 | requestReview (E2) | systemowa | 0 | funkcja produktu | E2 |
| forum EN o dzierganiu (wygasające) | wątki o liczniku na iPhone (2024) i zgubionym miejscu (2026) | zakaz „unwanted commercial content”; brak działu dla aplikacji | odpowiedź po zgodzie; kontakt wymaga konta | 0,25 | 1 × 1 ÷ 0,25 = 4 | poza startem (rekomendacja) |
| forum DE (aktywne) | dział dziergania aktywny (10.2026) | „keine Verkaufsplattform”; członkostwo tylko dla reklamy niedozwolone | jednorazowy wpis strony członka — tylko za zgodą | 0,25 | 1 × 0,5 ÷ 0,25 = 2 | poza startem |
| fora EN/NO z zakazem reklamy, portal wzorów | — | reklama zakazana albo tylko dla autorów wzorów | nic | — | 0 | poza listą |
| agregatory aplikacji | publiczność techniczna, nie dziergający | wpis autora bez próśb o głosy | — | 1 (dzień startu) | 0,5 × 1 ÷ 1 = 0,5 | poza listą |
| największe serwisy dyskusyjne i dziewiarskie, grupy społecznościowe, JA/FR/PL | — | **nie sprawdzono** (403, logowanie; P-145 D4a) | — | — | — | poza listą |

Skala [OCENA]: efekt 0–3 (zasięg wśród person), pewność 0–2 (przeczytana reguła i dowód niszy), godziny właściciela na tydzień. Heurystyka roli, nie norma.

## ASO — propozycja dla roli 10 (P-145 D2a; P-148 E1-3a)
Znaki i bajty UTF-8 policzone skryptem; nazwa ≤ 30, podtytuł ≤ 30, słowa ≤ 100 B, każde > 2 znaki, bez nazw innych firm i aplikacji.

| Lok. | Nazwa | Podtytuł | Słowa kluczowe | B |
|---|---|---|---|---|
| en-US | Oczko: Row Counter | Knit & crochet, no account | knitting,stitch,tracker,pattern,pdf,yarn,stash,needles,project,tally,gauge,notes,hook,reminder | 94 |
| en-GB | Oczko: Row Counter | Knit & crochet, no account | knitting,stitch,tracker,pattern,pdf,yarn,wool,stash,needles,project,tally,gauge,notes,hook,reminder | 99 |
| pl | Oczko: Licznik rzędów | Druty i szydełko, bez konta | dzierganie,włóczka,oczka,rzędy,wzór,pdf,projekt,robótki,szydełkowanie,drutach,notatki,zapas | 97 |
| ja | Oczko: 編み物カウンター | かぎ針・棒針の段数と編み図 | 棒針編み,かぎ針編み,あみぐるみ,目数計算,リマインド,PDF,メモ帳,毛糸管理 | 100 |
| nb | Oczko: Strikk og hekle | Teller for omganger og pinner | strikking,hekling,strikkeapp,omgangsteller,garn,oppskrift,prosjekter,masker,notater,strikkeprosjekt | 99 |
| de-DE | Oczko: Reihenzähler | Häkeln, Stricken, eigenes PDF | Strickzähler,Maschenzähler,Wolle,Garn,Nadeln,Strickmuster,Häkelmuster,Handarbeit,Projekte | 92 |
| fr-FR | Oczko: Compteur de rangs | Tricot & crochet, votre patron | tricoter,crocheter,laine,pelote,aiguilles,mailles,projet,modèle,amigurumi,PDF,notes | 84 |

Warunki: słowa o wzorze (pattern, pdf, wzór, 編み図, oppskrift, Strickmuster, eigenes PDF, modèle, votre patron) tylko po potwierdzeniu funkcji wzoru (OG-07); bez słów o zegarku, ekranie blokady i widżecie do potwierdzenia przez 07 (P-146); bez słów o dodawaniu i ujmowaniu oczek (F-40 PÓŹNIEJ). Do przeglądu native speakera: ja 目数計算 i あみぐるみ, nb omgang/pinne, de umlauty, fr patron/modèle, wymowa „Oczko” w ja. Kategoria: wyniki fraz to głównie Lifestyle (rekomendacja badania), decyduje rola 10. Nie wiemy: liczby wyszukań (bez płatnych narzędzi) ani tego, czy storefront z językiem dodatkowym indeksuje słowa tej lokalizacji.

## Linia bazowa najlepszych w niszy (E1)
Trzy najczęściej oceniane aplikacje tej samej pracy i jedna szybko rosnąca (strona produktu, wersje, odpowiedzi, recenzje; odczyt 2026-10-26, szczegóły w warsztacie): obietnica w pierwszej linii to licznik z własnym wzorem; rytm wersji nie tłumaczy oceny (4 wersje w roku przy ocenie 4,83); najlepsze odpowiedzi na recenzje podają konkret naprawy; recenzje karzą okna zakupu przy starcie, utratę danych i zabieranie opłaconych funkcji. Blogi i newslettery autorów zamarłe (ostatnie wpisy 2022–2024) — kanału własnego nie proponuję.

## Decyzje E1 (przyjęte: P-148 — E1-1a, E1-2a, E1-3a jako propozycja dla 10, E1-4a; nazwa w sklepie do decyzji właściciela, opcje w E2)
| ID | Pytanie | Opcje | Rekomendacja |
|---|---|---|---|
| E1-1 | kanały startu | (a) tylko sklep przez 8 tygodni (ASO, recenzje, prośba o ocenę, strona www); społeczności na punkcie kontrolnym albo z 1.1; (b) sklep + prośba o zgodę jednego forum EN albo DE | (a), jak Trening |
| E1-2 | pozycjonowanie | przyjąć zdanie i tabelę z warunkami; albo przekaz funkcyjny (H-03 (b)) | przyjąć |
| E1-3 | ASO | pola 7 lokalizacji dla roli 10 z warunkami; albo wariant pl z angielskimi frazami | przyjąć pola |
| E1-4 | „knitting days” w opisie sklepu | zgłoszenie do 02/04: „5 project days” (en) | przekazać do 02 |

## Powrót i opinie (E2)
### Rytm pracy i co daje powrót
- **Rytm:** praca J-01 to każda sesja przy robótce (od kilku minut do godzin), J-05 to powrót po tygodniach albo latach (`docs/brd/odkrywanie.md`, J-01, J-05, „Kontekst użycia”). Typ aplikacji: narzędzie na sesję — liczy się szybki start w ostatnim miejscu.
- **Co daje powrót (kontrakt 1.0):** otwarcie w ostatnim miejscu (F-49, F-18), notatka przy liczniku (F-15), historia zmian z cofnięciem (F-02), znacznik we wzorze (F-26, warunek OG-07), „ostatnia praca N dni temu” na liście (F-54), kalendarz dni i podsumowanie okresu (F-59), pełny eksport (F-32). Wniosek: powrót daje wartość bez żadnego mechanizmu nacisku; nowych funkcji powrotu nie proponuję (zasada wspólna 18).
- **Linia bazowa:** recenzje liderów chwalą „pick up where you left off” i karzą utratę danych; o seriach i powiadomieniach 0 z 32 wzmianek w próbce (brak wzmianki, nie dowód).

### Macierz powiadomień
| Powiadomienie | O co prosił użytkownik | Wyzwalacz | Poziom przerwania | Zgoda i wyłączenie | Focus | Anulowanie |
|---|---|---|---|---|---|---|
| **brak w 1.0** | — | — | — | — | — | — |

Wersja 1.0 nie ma powiadomień push ani lokalnych: przypomnienie „co N rzędów” (F-06, F-48) to wibracja i widok w trakcie liczenia, a BRD wprost wyklucza licznik serii i przypomnienia o niedzierganiu (`docs/brd/wymagania-dni.md:30`, P-043). Rekomendacja roli 11: **zostaje bez powiadomień**. Jeśli kiedyś wejdzie przypomnienie, to tylko o rzeczy zaplanowanej przez użytkownika (np. termin F-61), ze zgodą w kontekście i wyłączeniem w aplikacji (4.5.4, 5.1.2(i)), nigdy „dawno cię nie było”; ścieżka ZM → 03.

### Etyka powrotu (sprawdzenie kontraktu 1.0)
| Ryzyko z tabeli modułu | Stan w 1.0 | Wynik |
|---|---|---|
| seria dni zerowana przerwą | brak (BR-DNI, P-043) | zgodne |
| „Dawno cię nie było” | F-54 pokazuje fakt „ostatnia praca N dni temu” bez wezwania | zgodne; tekst neutralny według głosu 04 |
| fałszywy postęp | % tylko z celów części (F-60); część bez celu oznaczona | zgodne |
| poziomy, odznaki | brak | zgodne |
| koszt odejścia | pełny darmowy eksport zawsze, także przy limicie (KP-02) | zgodne |
| nagroda za ocenę, ocena jako warunek | brak; prośba tylko systemowa (OG-15) | zgodne (sekcja 3, 3.2.2(x)) |
| wina w tekstach | cel dzienny i „termin minął, zostało N rzędów” to fakty | zgodne; tekst przez 04 |
| filtrowanie opinii | „Oceń” i „Zgłoś problem” to dwa niezależne wejścia | **zasada:** nigdy pytanie o zadowolenie przed prośbą ani rozwidlenie „podoba się → oceń / nie → zgłoś” (sekcja 3: „filtered”, 5.6.3) |

### Prośba o ocenę — OP-33 (propozycja ZM do 03)
Stan: BR-DAN-012 (MVP, F-64) — systemowa prośba po zamknięciu karty ukończenia; test akceptacyjny woła ją przy każdym zamknięciu (`tests/akceptacja/ekrany/ukonczenie.test.tsx:38`). Otwarte: dokładna chwila i własny limit (OP-33).

Reguły z dnia pracy (odczyt 2026-10-26): „a maximum of three times within a 365-day period”, „don’t call it in response to a button tap or other user action”, w TestFlight „this method has no effect” (StoreKit, RequestReviewAction); „Avoid asking for a rating on first launch or during onboarding”, „Consider allowing at least a week or two between requests” (HIG, Ratings and reviews).

Wzorzec Treningu (`trening/docs/26-prosba-o-ocene.md`): czysta funkcja, odstęp 14 dni, najwyżej 1 na wersję, pole „kiedy i w której wersji ostatnio prosiliśmy” w ustawieniach bez podbicia schematu; Trening nie ma linku „Oceń” w Ustawieniach, Oczko ma (P-059 (3a), bez zmian).

**Propozycja (E2-1):** chwila bez zmian (zamknięcie karty ukończenia — naturalny koniec pracy; ukończenie projektu już jest dowodem zaangażowania, więc bez progu N); **własny limit jak Trening: odstęp ≥ 14 dni i najwyżej 1 na wersję aplikacji**; zapis `ostatniaProsba = { wersja, dzien }` w konfiguracji (05) w chwili wywołania (nie wiemy, czy system pokazał okno). Liczby w module konfiguracji (ARCH-05): `ODSTEP_PROSBY_DNI = 14`, `PROSB_NA_WERSJE = 1`.

Czysta funkcja `czyProsicOOcene({ zdarzenie, wersja, ostatniaProsba, dzis, dostepna })` → `true | false`. Wektory:
| ID | Stan | Oczekiwane |
|---|---|---|
| PO-01 | pierwsze uruchomienie, zdarzenie „start” | nie |
| PO-02 | zamknięto kartę ukończenia, brak wcześniejszej prośby, `dostepna` | tak |
| PO-03 | zamknięto kartę, ta sama wersja co przy ostatniej prośbie (odstęp 30 dni) | nie |
| PO-04 | inna wersja, 13 dni od ostatniej prośby | nie |
| PO-05 | inna wersja, dokładnie 14 dni | tak |
| PO-06 | liczenie, cofnięcie, komunikat limitu, okno „Uczciwe zasady”, ekran zakupu | nie |
| PO-07 | stuknięcie „Oceń” w Ustawieniach | nie (otwiera `action=write-review`) |
| PO-08 | `isAvailableAsync()` = false (TestFlight) | nie |
| PO-09 | `dzis` wcześniej niż `ostatniaProsba.dzien` (zegar cofnięty) | nie |
| PO-10 | drugi projekt ukończony tego samego dnia po prośbie | nie |
| PO-11 | brak albo uszkodzony zapis `ostatniaProsba` | jak brak prośby (PO-02), zapis po wywołaniu |

Koszt [OCENA]: 05 pole konfiguracji 0,25 h, 08 funkcja i wywołanie 0,5 h, 07 test z wektorów 0,25 h. Bez nowego tekstu (okno systemowe). Czy zapis `ostatniaProsba` wymaga zgody z PKE art. 399 (wyjątek usługi „żądanej”), `[DO USTALENIA]` jak w module; Trening przechowuje takie pole w ustawieniach.

### Opinie i recenzje
- **Pętla opinii wersji 1** (moduł, kontrakt 03): systemowa prośba (F-64), „Oceń” w Ustawieniach (BR-DAN-012), „Zgłoś problem” bez konta (F-57) — wszystkie MVP; sprawdzenie w wydanej wersji: po premierze (07 audit przed wydaniem, rola 11 w reaudycie).
- **Rytm odpowiedzi na recenzje** (w budżecie 1 h/tydz.): raz w tygodniu ok. 15–30 min; en i pl — każda recenzja z treścią; inne języki — tylko ≤ 3★; odpowiedź rzeczowa, z konkretem naprawy albo pytaniem o szczegóły, bez danych osobowych, spamu i marketingu (5.6.1); „When you respond to a customer review, the customer is notified and can update their review” (moduł). Każda odpowiedź to działanie zewnętrzne: w E3 szablony, zgoda właściciela na sposób pracy zapisana w dzienniku.
- **Droga zgłoszenia:** recenzja albo e-mail ze „Zgłoś problem” → błąd: ER do 01 / zgłoszenie do 07 i 08 (szybka poprawka, ADR-0021); prośba o funkcję: ZM do 03 z bramką zasady 18.

## Pomiar (E2)
Źródła bez SDK: App Analytics (odczyt właściciela; metryki sklepu „Available once you have at least five first-time downloads”, odczyt 2026-10-26), oceny i recenzje, zgłoszenia. Bez linków kampanii: `pt` dostępny dopiero, gdy aplikacja ma dane analityczne (moduł) — po premierze. Test modelu V4 (konwersja 4,53%) prowadzi rola 02 (`docs/monetyzacja.md`), nie liczy się do H roli 11.

Cel pobrań (rachunek, [OCENA]): tempo progu opłacalności ≈ 1944 zł/rok ÷ 26 477 zł/rok × ok. 22 500 instalacji/rok (wynik normalny V4 i jego instalacje, `docs/monetyzacja.md`) ≈ **1650 pobrań/rok, ok. 140 miesięcznie, ok. 250 w 8 tygodniach** (proporcja liniowa przy założeniach normalnych 02).

| H | Pytanie (decyzja) | Metryka i źródło | Mierzalność: oczekiwane n, zastępnik | Próg | Min. próba | Data oceny | Werdykt |
|---|---|---|---|---|---|---|---|
| H-11 | czy ASO działa (sam sklep czy powrót do społeczności) | pobrania z App Store Search ÷ wszystkie pobrania, App Analytics | ok. 250 [OCENA]; wyświetlenia z wyszukiwania | ≥ 50% (P-150) | 100 | 2027-01-09 | czeka na dane |
| H-12 | czy strona produktu przekonuje (zrzuty, podtytuł) | pobrania ÷ odsłony strony z App Store Search | ok. 400 odsłon [OCENA]; pobrania z wyszukiwania w tygodniu | ≥ 30% (P-150) | 100 | 2027-01-09 | czeka na dane |
| H-13 | czy metadane w języku kraju działają (kolejność 09, ASO kolejnych języków) | pobrania z wyszukiwania ÷ wszystkie w JP, NO, DE, FR | ok. 45 [OCENA]; wyświetlenia z wyszukiwania w JP | ≥ 40% (P-150) | 30 | 2027-01-09 | czeka na dane |

Pliki: `docs/wzrost/hipotezy.json` (progi), `docs/wzrost/hipotezy.mjs` (z modułu roli, przedział Wilsona, z = 1,645); `node docs/wzrost/hipotezy.mjs docs/wzrost/hipotezy.json` — kod 0 (2026-10-26). Dane zmierzone tylko w `oczko-warsztat/11-wzrost/`. Próba z opt-in i źródła ruchu nie są losowe — przedział to uproszczenie. Nazwa źródła „App Store Search” z Treningu (`docs/45`), dziś nieodczytana (strona pomocy ładuje treść skryptem) — sprawdzi właściciel przy pierwszym odczycie.

## Nazwa w sklepie (P-149: reguła jak Trening)
Reguła (Trening: `store/app-store-names.json`, `lib/i18n.ts` `APP_NAME`, `docs/16-jezyki-i-marka.md`): „<słowo marki>: <opis z badania fraz>”, słowo marki = lokalny termin dziewiarski na „oczko”, gdy brzmi podobnie, inaczej angielskie „Stitch”; pole Name ≤ 30 znaków; to samo słowo marki pod ikoną (`CFBundleDisplayName`) i przed dwukropkiem w sklepie.

**Kontrola (2) z P-149 — wynik: „Stitch” odpada, słowo zapasowe „Oczko” (odczyt 2026-10-26):**
- Znaki towarowe USA (USPTO, wyszukiwarka znaków, API publiczne): słowo „STITCH” ma **16 żywych rejestracji i zgłoszeń** w różnych klasach, w tym **klasa 9 (oprogramowanie) — 2** i **klasa 41 — 1** (numery rejestracji w warsztacie); do tego złożenia ze „STITCH” w klasie 9 dla programów do robótek. Ryzyko kolizji: realne [OCENA, bez porady prawnej].
- App Store (US): istnieje już aplikacja z nazwą zaczynającą się od „Stitch:” w tej samej niszy (licznik rzędów), oraz kilka innych „Stitch”. „Oczko”, „Očko”, „Očica”: żadnej aplikacji z nazwą zaczynającą się od tego słowa (US, PL, CZ, SK, HR, DE, JP); USPTO: „OCZKO” — 0 żywych znaków.
- **UE (EUIPO / TMview): nie sprawdzono** — z kontenera brak połączenia. Krok właściciela (ok. 10 min): https://www.tmdn.org/tmview/ → wyszukać „Oczko”, „Očko”, „Očica”, klasy 9 i 41, urzędy UE i krajowe (PL, CZ, SK, HR).
- Lokalne słowo podobne do „Oczko” mają tylko cs i sk („očko”) i hr („očica”); źródła to dziś szczebel 4–5 (encyklopedia otwarta, blog) — **[OTWARTE]: potwierdzenie przez rolę 06 w źródle terminologii** (P-149 (1)); bez potwierdzenia — „Oczko”. Podobieństwo „Očica” do „Oczko” jest brzegowe (wspólny rdzeń „oč-”, inne zakończenie) [OCENA].

| Język aplikacji | Lokalizacja App Store | Pod ikoną | Pełna nazwa w sklepie | Znaki | Słowo marki: źródło | Część opisowa |
|---|---|---|---|---|---|---|
| pl | pl | Oczko | Oczko: Licznik rzędów | 21 | termin PL (06, zrodla-pl) | badanie fraz E1 |
| en | en-US, en-GB, en-AU, en-CA | Oczko | Oczko: Row Counter | 18 | zapasowe: „Stitch” koliduje | badanie fraz E1 |
| cs | cs | Očko | Očko: počítadlo řad | 19 | cs.wikipedia „Pletení” („očka”) — szczebel 5, [OTWARTE] 06 | przekład roboczy — badanie fraz: rola 10 |
| sk | sk | Očko | Očko: počítadlo radov | 21 | blog o pletení („veľkosť očiek”) — szczebel 4–5, [OTWARTE] 06 | przekład roboczy — badanie fraz: rola 10 |
| hr | hr | Oczko | Oczko: brojač redova | 20 | „očica” (hr.wikipedia „Pletenje”) — podobieństwo brzegowe, P-153: „Oczko” | przekład roboczy — badanie fraz: rola 10 |
| sl | sl | Oczko | Oczko: števec vrst | 18 | termin „zanka” niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| sr | — (brak w ASC) | Oczko | — (strona w języku domyślnym storefrontu) | — | termin „петља” niepodobny (sr.wikipedia); zapasowe | przekład roboczy — badanie fraz: rola 10 |
| bg | — (brak w ASC) | Oczko | — (strona w języku domyślnym storefrontu) | — | termin niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| uk | uk | Oczko | Oczko: лічильник рядів | 22 | termin „петля” niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| ru | ru | Oczko | Oczko: счётчик рядов | 20 | termin „петля” niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| lt | — (brak w ASC) | Oczko | — (strona w języku domyślnym storefrontu) | — | termin niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| lv | — (brak w ASC) | Oczko | — (strona w języku domyślnym storefrontu) | — | termin niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| et | — (brak w ASC) | Oczko | — (strona w języku domyślnym storefrontu) | — | termin niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| hu | hu | Oczko | Oczko: sorszámláló | 18 | termin „szem” niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| ro | ro | Oczko | Oczko: numărător de rânduri | 27 | termin niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| de | de-DE | Oczko | Oczko: Reihenzähler | 19 | termin „Masche” niepodobny; zapasowe | badanie fraz E1 |
| fr | fr-FR | Oczko | Oczko: Compteur de rangs | 24 | termin „maille” niepodobny; zapasowe | badanie fraz E1 |
| it | it | Oczko | Oczko: contagiri per maglia | 27 | termin „maglia” niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| es | es-ES | Oczko | Oczko: contador de vueltas | 26 | termin „punto” niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| es-419 | es-MX | Oczko | Oczko: contador de vueltas | 26 | jw. | przekład roboczy — badanie fraz: rola 10 |
| pt | pt-PT | Oczko | Oczko: contador de carreiras | 28 | termin „ponto” niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| pt-BR | pt-BR | Oczko | Oczko: contador de carreiras | 28 | jw. | przekład roboczy — badanie fraz: rola 10 |
| nl | nl-NL | Oczko | Oczko: toerenteller | 19 | termin „steek” niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| sv | sv | Oczko | Oczko: varvräknare | 18 | termin „maska” niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| da | da | Oczko | Oczko: pindetæller | 18 | termin „maske” niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| nb | no | Oczko | Oczko: Strikk og hekle | 22 | termin „maske” niepodobny; zapasowe | badanie fraz E1 |
| fi | fi | Oczko | Oczko: kerroslaskuri | 20 | termin „silmukka” niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| tr | tr | Oczko | Oczko: sıra sayacı | 18 | termin „ilmek” niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| el | el | Oczko | Oczko: μετρητής σειρών | 22 | termin niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| id | id | Oczko | Oczko: penghitung baris rajut | 29 | termin niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| ms | ms | Oczko | Oczko: pembilang baris kait | 27 | termin niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| vi | vi | Oczko | Oczko: đếm hàng đan móc | 23 | termin niepodobny; zapasowe | przekład roboczy — badanie fraz: rola 10 |
| ja | ja | Oczko | Oczko: 編み物カウンター | 15 | pismo inne (目); zapasowe | badanie fraz E1 |
| ko | ko | Oczko | Oczko: 뜨개질 단수 카운터 | 17 | pismo inne (코); zapasowe | przekład roboczy — badanie fraz: rola 10 |
| zh-Hant | zh-Hant | Oczko | Oczko: 編織段數計數器 | 14 | pismo inne (針); zapasowe | przekład roboczy — badanie fraz: rola 10 |


Lokalizacje bez strony w App Store Connect (bg, et, lt, lv, sr) mają tylko nazwę pod ikoną. Części opisowe poza 7 lokalizacjami z badania fraz to przekład roboczy (rola 10 robi badanie fraz i przegląd tłumacza, P-145 D2a). Długości policzone skryptem (`oczko-warsztat/11-wzrost/2026-10-26-build/e2-nazwa/tabela-35.py`, kod 0). Do zrobienia przez 08/10: test zgodności słowa marki pod ikoną z nazwą w sklepie (jak Trening).

## Decyzje E2 (przyjęte: P-150 — E2-1a, E2-2a, E2-3a; nazwa: P-149, P-152; aneks: P-153 — E2-4a, E2-5a)
| ID | Pytanie | Opcje | Rekomendacja |
|---|---|---|---|
| E2-1 | prośba o ocenę (OP-33) | (a) chwila bez zmian + odstęp 14 dni i 1 na wersję, czysta funkcja z wektorami PO-01–PO-11 (jak Trening); (b) tylko limit systemowy (3 w 365 dni), bez własnego | (a) |
| E2-2 | progi H-11–H-13 | (a) jak Trening: 50% / 30% / 40%, ocena 2027-01-09; (b) bez progów, sam odczyt | (a) |
| E2-3 | powiadomienia | (a) brak w 1.0 i bez nowych; (b) przypomnienie o terminie projektu (F-61) jako ZM | (a) |
| E2-4 | słowo marki w cs, sk, hr | (a) „Očko” (cs, sk) i „Očica” (hr) po potwierdzeniu terminu przez 06, reszta „Oczko”; (b) „Oczko” we wszystkich 35 językach | (a) dla cs i sk; hr — (b) „Oczko” (podobieństwo brzegowe) |
| E2-5 | znaki towarowe UE | właściciel sprawdza TMview (ok. 10 min) przed wpisem nazwy w App Store Connect; albo bez sprawdzenia | sprawdzić |

## Lista startowa (E3; P-148 E1-1a: przez 8 tygodni tylko sklep)
Szkice poza publicznym repo: `oczko-warsztat/11-wzrost/2026-10-26-build/szkice/`. Każde działanie zewnętrzne osobno za zgodą właściciela, wpis w `docs/wzrost/dziennik.md` **przed** działaniem. Kampanie (`ct=`): brak — `pt` z App Store Connect dostępny dopiero po pierwszych danych.

| Krok | Kiedy | Kanał | Szkic / wejście | Kto | Zgoda (słowa, data) | Wynik |
|---|---|---|---|---|---|---|
| 1 | przed wpisem nazwy w ASC | rejestr znaków UE (TMview): „Oczko”, „Očko”, „Očica”, klasy 9 i 41 | link w sekcji „Nazwa w sklepie” | właściciel | — (odczyt, nie publikacja) | — |
| 2 | przy kroku 11 planu | App Store Connect: nazwa, podtytuł, słowa kluczowe, kategoria (35 lokalizacji) | pola 7 lokalizacji + tabela nazw (rola 10 robi resztę po zamrożeniu) | rola 10 przygotowuje, właściciel wpisuje | — (wydanie: P-087 wyjątek) | — |
| 3 | ok. 12–14.11.2026 | wydanie ręczne po akceptacji Apple (P-147) | — | właściciel | — | — |
| 4 | co tydzień, 8 tygodni | odpowiedzi na recenzje (en, pl zawsze; inne ≤ 3★) | `szkice/odpowiedzi-na-recenzje.md` (7 szablonów EN/PL) | właściciel | [czeka: zgoda na sposób pracy] | — |
| 5 | 2027-01-09 | odczyt App Analytics dla H-11–H-13 (ok. 20 min), dane do warsztatu | `docs/wzrost/hipotezy.json` | właściciel → rola 11 reaudit | — | — |
| 6 | punkt kontrolny (2027-01-09) | decyzja: społeczności (szkice próśb o zgodę administracji) albo dalej sam sklep | E1 kanały, wynik H-11 | koordynator / właściciel | — | — |
| 7 | ≥ 3 tygodnie przed 1.1 | nominacja „App Enhancements” (P-147) | `szkice/nominacja-app-enhancements-1-1.md` | właściciel | [czeka] | — |

Plan na złe przyjęcie: krytyczną recenzję zostawiamy i odpowiadamy rzeczowo (szablony 1–3, 5–6); błąd → zgłoszenie do 07/08 (szybka poprawka, ADR-0021) albo ER do 01; prośba o funkcję → ZM do 03. Utrata danych w recenzji = P0 od razu.

## Definicja ukończenia (build), punkt po punkcie
| Punkt | Wynik | Dowód |
|---|---|---|
| plan w budżecie godzin właściciela; płatne tylko jako decyzja | tak: 1 h/tydz. × 8 tyg. (recenzje 15–30 min/tydz., jeden odczyt Analytics); 0 zł; płatnych opcji brak | P-145 D1a; lista startowa |
| każdy kanał na liście startowej ma adres, dowód niszy i regułę z datą | tak: na liście tylko sklep (reguły Apple z odczytem 2026-10-26); fora poza listą, bo bez zgody administracji albo bez odczytu regulaminu | E1 „Kanały”; `oczko-warsztat/…/e1/B-kanaly.md` |
| każde twierdzenie w pozycjonowaniu i szkicach z dowodem; zero statystyk rynkowych bez źródła | tak: tabela dowodów z ID F/BR/P; szkice bez liczb rynkowych; liczby w ASO to odczyty iTunes Search z datą | „Pozycjonowanie”; szkice |
| funkcje powrotu, polecenia i opinii mają ZM w 03 i przeszły tabelę etyki | częściowo: nowych funkcji powrotu i polecenia brak (tabela etyki zgodna); **ZM dla OP-33 (P-150 E2-1a) do zapisania przez 03** | „Powrót i opinie”; przekazanie 03 |
| najwyżej 3 aktywne H z kontrolą mierzalności, progiem i próbą z ID decyzji, datą oceny; `hipotezy.mjs` kod 0 | tak: progi przyjęte w P-150 (E2-2a), `prog.decyzja` = P-150 | `node docs/wzrost/hipotezy.mjs docs/wzrost/hipotezy.json` kod 0 |
| linki kampanii tylko z `pt`; SDK analityki tylko z ADR | tak: bez linków kampanii; bez SDK (ADR-0016, `prywatnosc.md`) | „Pomiar” |
| działania zewnętrzne ze zgodą w dzienniku; nic nie opublikowano; `git diff --cached` bez danych osób i sekretów | tak: dziennik pusty, nic nie wysłano; kontrola `marki.mjs` i przegląd diffu przed każdym commitem | `docs/wzrost/dziennik.md` |

## Przekazanie (E3)
- **03 Zakres:** zapisać ZM dla OP-33 (P-150 E2-1a: odstęp ≥ 14 dni, 1 na wersję, `czyProsicOOcene`, PO-01–PO-11) i zamknąć OP-33 w BR-DAN-012 (z rolą 01); powiadomień w 1.0 brak (P-150 E2-3a).
- **05 Architekt:** pole `ostatniaProsba { wersja, dzien }` w konfiguracji, stałe `ODSTEP_PROSBY_DNI = 14`, `PROSB_NA_WERSJE = 1` (ARCH-05); PKE art. 399 — `[DO USTALENIA]` jak w module.
- **07 Jakość:** test akceptacyjny z wektorów PO-01–PO-11 (dziś `ukonczenie.test.tsx:38` woła prośbę przy każdym zamknięciu karty — zmiana wyroczni po decyzji 03).
- **08 Programista:** funkcja i wywołanie po decyzji 03; test zgodności słowa marki pod ikoną z nazwą w sklepie (jak Trening).
- **04 Studio:** brak nowych tekstów (okno systemowe); ton F-54 i celu dziennego neutralny; „knitting days” → przez 02 (P-148 E1-4a).
- **06 Treści:** potwierdzić terminy „očko” (cs, sk) i „očica” (hr) w źródle terminologii (P-149 (1)); nowych twierdzeń dziedzinowych w pozycjonowaniu brak.
- **09 Lokalizacja:** przegląd native speakera fraz ASO (ja 目数計算, あみぐるみ; nb omgang/pinne; de umlauty; fr patron/modèle) i wymowy „Oczko” w ja.
- **10 Wydawca:** pozycjonowanie (sekcja „Pozycjonowanie” z warunkami), pola ASO 7 lokalizacji, tabela nazw 35 lokalizacji, kategoria (rekomendacja badania: Lifestyle), badanie fraz dla pozostałych 28 lokalizacji po zamrożeniu funkcji; warunek OG-07 dla słów o wzorze.
- **Właściciel:** TMview przed wpisem nazwy (ok. 10 min); recenzje co tydzień (15–30 min); odczyt App Analytics 2027-01-09 (ok. 20 min); nominacja 1.1 ≥ 3 tygodnie przed jej datą. Po dacie oceny: `node tools/assemble.mjs 11-wzrost --tryb reaudit --baza <sha>`.
