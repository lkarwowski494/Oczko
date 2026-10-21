# Odkrywanie: prace, persony, zasady, rynek
Stan: STOP E1 · Aktualizacja: 2026-10-21 · Notatki z wywiadu: `oczko-warsztat/01-odkrywanie/wywiad-2026-10-21.md` (prywatne)

## Źródło wiedzy o użytkownikach
Właściciel nie dzierga i nie szydełkuje (wywiad 2026-10-21, odp. 1); Oczko wybrał z analizy portfela. Wywiad z właścicielem daje zasady produktu, nie dowody o pracy użytkownika. Właściciel nie ma osób do rozmów (odp. 3: „wybieram A”), więc prace J i persony P powstają tylko z recenzji konkurencji i źródeł społeczności. Ograniczenie: recenzje pokazują, co chwalą i na co skarżą się użytkownicy aplikacji, a nie przebieg pracy przy robótce; persony są oznaczone „z recenzji”, a funkcje bez odpowiednika u konkurencji to hipotezy H do sprawdzenia po wydaniu.

## Zasady produktu (słowa właściciela, 2026-10-21, wywiad odp. 1)
### ZP-01: Małe, dopracowane aplikacje
- „Robimy małe, dopracowane aplikacje na iPhone’a.”
### ZP-02: Miesiąc tańszy niż espresso
- „Miesięczna subskrypcja każdej aplikacji kosztuje mniej niż jedno espresso.” „Raz w roku sprawdzamy, ile kosztuje espresso w kawiarniach na różnych kontynentach.” Dla roli 02 (model i cena, sesja 2); rola 01 nie rozstrzyga ceny ani tego, czy model to subskrypcja.
### ZP-03: Bez reklam i śledzenia
- „Nie sprzedajemy danych. Każda aplikacja zbiera tylko to, czego potrzebuje do działania.”
### ZP-04: Ta sama czynność wszędzie tak samo
- „ta sama czynność wszędzie działa, wygląda i nazywa się tak samo — także dla VoiceOver i w 35 językach.”
### ZP-05: Głos użytkownika zmienia aplikację
- „Czytamy każdą opinię, a AI pomaga je porządkować, żeby żadna prośba nie zginęła.”
### ZP-06: Research zamiast zgadywania
- „Funkcje projektujemy na podstawie badań rynku, a to, czego aplikacja uczy, na podstawie badań naukowych.”
### ZP-07: Najlepsza w klasie przy agresywnej cenie
- „Chce zrobic best in class aplikacje w duchu mojego studia i bijaca funcjonalnosciami liderow ryynku, przy jednoczesnie bardzo agresywnej polityce cenowej.”
- Napięcie do rozstrzygnięcia przez rolę 03 z właścicielem: „bijąca funkcjonalnościami” a zasada wspólna 18 („najlepsza w klasie to nie najwięcej funkcji”, bez kombajnu) i ZP-01 („małe”). Rola 01 spisze pełną listę funkcji z dowodami; przewagę nad liderami pokaże macierz funkcji w E2, a cięcie należy do roli 03.
### ZP-08: Cel to zysk przez świetną aplikację
- „moim celem jest maksymalziacja zysku ale do tego potrzeba swietnej aplikacji w cenie tanszej niz inni z efektem wow i funkcjami ktorych inni nie maja.” (wywiad 2026-10-21, odp. 2)
- Dla E2: macierz funkcji liderów pokaże luki (funkcje, których nikt nie ma albo nikt nie robi dobrze); każda taka funkcja wchodzi jako kandydat z dowodem potrzeby, nie z samej nowości (zasada wspólna 18).
### ZP-09: Bez błędów, także tych, na które skarżą się użytkownicy konkurencji
- „I brakiem bledow nowych jak i tych na ktore w innych aplikacjach sie narzeka.” (wywiad 2026-10-21, odp. 2)
- Dla E2: skargi z recenzji konkurencji (utrata danych, zakupu, zabrane funkcje, awarie) stają się dowodami potrzeby wymagań i kandydatami na blokery wydania.

## Materiał dowodowy E1 (odczyt 2026-10-21)
- **Recenzje:** 4682 recenzje z 23 aplikacji (18 globalnych: 15 narzędzi N i 3 aplikacje W, sklepy US, GB, CA, AU; 5 lokalnych liderów: JP 2, NO 2, NL 1), kanał RSS App Store, do 500 najnowszych na sklep. Oceny: 1★ 986, 2★ 367, 3★ 433, 4★ 541, 5★ 2355. Dane i skrypt klasyfikacji: `oczko-warsztat/01-odkrywanie/recenzje/` (prywatne).
- **Metoda:** klasyfikacja słowami kluczowymi (przybliżenie; tylko angielski, łapie też wpisy nie na temat) i lektura ok. 480 recenzji: 294 z prośbami o funkcje w narzędziach N, 70 skarg na utratę danych, kopię i przypadkowe stuknięcia (≤3★), próbki aplikacji W i rynku JP. Cytaty sprawdzone ręcznie; id recenzji w nawiasie, adres: `itunes.apple.com/<sklep>/rss/customerreviews/id=<aplikacja>/sortby=mostrecent/json`.
- **Opisy aplikacji:** 23 listingi (`lookup`, 2026-10-21) do macierzy funkcji w E2.
- **Ograniczenie:** recenzje piszą użytkownicy aplikacji, głównie zadowoleni (50% to 5★) albo rozczarowani; brak obserwacji pracy. Persony P są oznaczone „z recenzji”.

| Motyw (słowa kluczowe, przybliżenie) | Recenzji | w tym ≤3★ |
|---|---|---|
| cena, subskrypcja, okres próbny | 907 | 650 |
| nauka, skróty, filmy | 587 | 294 |
| awarie i błędy | 267 | 187 |
| wzór PDF, znacznik miejsca | 263 | 68 |
| projekty, notatki, zdjęcia | 261 | 83 |
| Ravelry | 249 | 72 |
| reklamy | 207 | 149 |
| zegarek | 192 | 84 |
| schemat (chart) | 191 | 60 |
| magazyn włóczki | 186 | 46 |
| kopia, synchronizacja, nowy telefon | 160 | 72 |
| iPad | 131 | 52 |
| czas i tempo | 109 | 29 |
| utrata danych | 87 | 59 |
| kilka liczników, powtórzenia | 61 | 7 |
| przypomnienia w rzędzie | 56 | 16 |
| kalkulatory | 55 | 15 |
| przypadkowe stuknięcie | 47 | 24 |
| sterowanie głosem | 34 | 15 |
| dostępność (niewidomi, artretyzm) | 19 | 6 |

## Prace do wykonania (J)
### J-01: Wiedzieć, w którym rzędzie jestem, i ufać tej liczbie
- Kiedy przerabiam rząd za rzędem, chcę jednym ruchem zaznaczyć skończony rząd i nie stracić liczby przez przypadkowe dotknięcie, żeby nie pruć robótki.
- Siły zmiany: pcha gubienie rachuby na papierze i liczniku na palec („my cat kept stealing my small finger stitch counter”, Easy Knitty, id9389714363); przyciąga telefon pod ręką; obawa: przypadkowe stuknięcie zmienia liczbę („Sat on phone and added 100 plus rows”, Easy Knitty GB, id8099185238; 24 z 47 recenzji o przypadkowym stuknięciu ma ≤3★); nawyk: kartka i ołówek.
- Dziś: licznik w aplikacji, kartka, licznik mechaniczny. Częstość: każdy rząd, przy każdej sesji.
- Sygnał rozwiązania z JP: historia stuknięć z godziną („いつカウンターを押したのか履歴を確認できるので押したかどうか忘れた際に非常に助かりました” — pomaga, gdy zapomnę, czy stuknąłem, 編み物カウンター２, id13252701149).
### J-02: Śledzić kilka rzeczy naraz: powtórzenia, części, oczka w rzędzie
- Kiedy wzór każe powtarzać rzędy 1–8 kilka razy albo robić kilka części, chcę liczników powiązanych ze sobą, żeby wiedzieć jednocześnie, który to rząd motywu i które powtórzenie.
- Dowody: „I wish it had a repeat counter for those pattern where you repeat rows 1-8 several times” (My Row Counter, id14113087501); „「1〜5段階を8回繰り替えし」のようなカウントも可能になると嬉しい” (編み物カウンター２, id13468821169); „The individual sections, when you update the row count, should automatically update the global counter” (My Row Counter, id13712427204); „The linked counters alone have saved my knitting life” (knitCompanion CA, id3998353222).
- Częstość: każdy projekt ze wzorem powtarzalnym albo z kilkoma częściami.
### J-03: Nie przegapić instrukcji „w tym samym czasie” i „co N rzędów”
- Kiedy wzór każe dodawać oczka co 6 rzędów i jednocześnie zmieniać kolor, chcę wyraźnego przypomnienia w odpowiednim rzędzie, żeby nie przegapić zmiany.
- Dowody: „REMINDERS for "at the same time" instructions” (opis knitCompanion); skarga, że przypomnienie jest za mało widoczne: „リマインドの表示がもう少し目立つとよいと思います” (編み物カウンター２, id13310860035; także id13857588972: „画面の色が変わるなど”, id13750930817); „the reminder needs an audio queue” (My Row Counter, id11943122526).
### J-04: Czytać wzór i nie gubić w nim miejsca
- Kiedy przerabiam według wzoru z PDF, książki albo schematu, chcę mieć wzór obok licznika ze znacznikiem bieżącego rzędu i własnymi notatkami, żeby nie przeskakiwać między kartką, telefonem i notatkami.
- Dowody: „For years I have struggled to remember where I am in a pattern” (My Row Counter GB, id8441435364); obejście: zdjęcie wzoru i linijka w aplikacji Zdjęcia („写真落書き機能を開いて定規を出して”, 編み物カウンター２, id14499518985); „it’s easier just to print offa pattern and use Post-It notes” (knitCompanion, id6372630590); wzory z książek: „add patterns from photos which is just what I needed for patterns I'm knitting from books” (My Row Counter GB, id6082188639).
- Siły: pcha papier i drukarka („I don't own a printer”, knitCompanion, id7258242294); obawa: trudna konfiguracja („it's not intuitive, I've spent so much time watching videos”, knitCompanion CA, id7603461841).
### J-05: Wrócić do robótki po przerwie i wiedzieć, gdzie byłem
- Kiedy wracam do projektu po tygodniach albo latach, chcę zastać licznik, miejsce we wzorze, notatki, włóczkę i druty, żeby od razu dziergać dalej.
- Dowody: „when you come back to finish that blanket you started three years ago, you can pick up exactly where you left off” (opis YarnBuddy); przerwy w trakcie rzędu: „I have two little ones so I stop and start constantly … I'd like to be able to write in a note that my Next Sti[tch]” (Crochet and Knit Counter, id3713410970); archiwum i kopia projektu, żeby zrobić drugi egzemplarz (編み物カウンター２, id13404291551, id13818579399).
### J-06: Liczyć bez sięgania po telefon
- Kiedy mam w rękach druty albo szydełko, chcę dodać rząd z zegarka, ekranu blokady albo bez dotyku, żeby nie odkładać robótki i nie odblokowywać telefonu.
- Dowody: zegarek (192 recenzje w motywie): „I like being able to use my watch as a counter without having to use my phone” (YarnBuddy, id13211255784); ekran blokady i widżet: „hate that I have to unlock my phone to use it. Would love a screen widget” (YarnBuddy, id11419908994), także Knitandnote id10767596259, 編み物カウンター２ id13488534767; ekran nie gaśnie: „it stays on so you don’t have to wake up the screen & put your passcode in” (Crochet and Knit Counter, id1843073711); głos: opis My Row Counter („just speak to it”).
### J-07: Nie stracić projektów ani zakupu
- Kiedy zmieniam telefon, aktualizuję aplikację albo używam iPada, chcę mieć wszystkie projekty i liczniki, a płatną wersję bez kłopotu, żeby nie zgadywać, gdzie skończyłem.
- Dowody (najostrzejsze skargi w próbce): „EVERYTHING is gone” (YarnBuddy, id7848574459); „There are two projects where I don’t know where I left off and will have to rip one out” (YarnBuddy, id9382276000); „ALL of the started projects I had, close to 20 are just GONE” (knitCompanion, id9354492354); „I got a new iPhone … This app wants $10 just to see my patterns on my new phone” (My Row Counter, id10843107781); utrata zakupu po reinstalacji: Easy Knitty id13590518451, id13021392496, id10295338079; „would love for all my devices to sync (so when … my iPad runs out of battery, my phone can tell me what row I am on)” (My Row Counter CA, id3172873446).
- Związek: ZP-09, P-021.
### J-08: Wiedzieć, co mam w zapasach i czy starczy włóczki
- Kiedy kupuję włóczkę albo zaczynam projekt, chcę wiedzieć, co już mam i ile potrzeba, żeby nie kupić za mało ani za dużo.
- Dowody: „so that I would not need to keep searching through every cubby and drawer before heading to the yarn shop” (YarnBuddy, id12624251861); „StashBot will pay for itself … saves you from buying more yarn than you need” (opis StashBot); słaba baza włóczek i skaner kodów: YarnBuddy id12704692319, id12420660919; Crochet Studio id9776888896.
### J-09: Policzyć to, czego wzór nie podaje
- Kiedy moja próbka, włóczka albo rozmiar różni się od wzoru, chcę przeliczyć oczka, rzędy, zużycie i równomierne dodawanie, żeby rzecz pasowała.
- Dowody słabsze (55 recenzji w motywie): „the tension is available in fractions!!!!! Knit handy only offers whole numbers” (StashBot CA, id1176543796); „Please add centimeter conversion” (YarnBuddy, id11586030925); obszar 5 i 7 z `docs/pomysl.md`. Reguły RD w E2.
### J-10: Zrozumieć instrukcję i nauczyć się techniki
- Kiedy wzór używa skrótu, symbolu albo techniki, której nie znam, chcę szybko sprawdzić znaczenie, żeby dziergać dalej bez szukania w sieci.
- Dowody: 587 recenzji w motywie nauki, głównie aplikacje W; „even though everything is abbreviated there’s a chart and vids u can look at to see what everything means” (Crochet row & stitch counter, id11523926078); słownik skrótów u StitchTally (opis); skrajne skargi na treści AI w aplikacjach W („the math is always wrong”, YarnPal, id14445075971).
- Uwaga: tę pracę obsługują głównie aplikacje W z treścią (ZAL-008); Oczko jako N może ją obsłużyć słownikiem i odnośnikami, bez kursów. Rozstrzyga rola 03.
### J-11: Widzieć postęp i czas pracy
- Kiedy kończę sesję albo projekt, chcę widzieć postęp, czas i tempo, żeby planować i mieć satysfakcję z ukończenia.
- Dowody: 109 recenzji w motywie; „time tracking is only accurate if you leave your phone unlocked” (Easy Knitty, id11473397244); stoper zapomniany w tle (YarnBuddy, id13781286092); radość z ukończenia: „編み終えた時に紙吹雪が出るのが地味に嬉しい” (konfetti przy ukończeniu, 編み物カウンター２, id13632559947).

**Sprawdzone, brak dowodu w próbce:** przekazanie projektu innej osobie (obszar 10 z `docs/pomysl.md`): 0 trafień w lekturze; zostaje hipotezą bez dowodu.

## Persony (z recenzji, nie z obserwacji)
### P-1: Początkująca osoba w pierwszych tygodniach
- Często szydełko i amigurumi albo pierwszy szalik; uczy się z YouTube i aplikacji W; gubi rachubę, myli przypadkowe stuknięcia; chce prostoty i przycisku „cofnij”. Prace: J-01, J-10, J-06. Dowód: „I just started to learn crochet … nice for keeping track of my rows” (Crochet and Knit Counter, id4482031491); „棒針初心者で何段目編んでるのかすぐ迷子になってしまう” (編み物カウンター２, id13750930817).
### P-2: Regularna osoba z kilkoma projektami naraz
- Kilka robótek w toku (WIP), wzory PDF z Ravelry, Etsy i książek; wraca do projektów po przerwach; płaci 10–30 USD/rok i odnawia; boi się utraty danych. Prace: J-02, J-03, J-04, J-05, J-07. Dowód: „I tend to have several projects on the go at any one time” (My Row Counter GB, id3271101703); „I use it daily and cant even imagine my knitting projects without it” (knitCompanion, id11822668631).
### P-3: Zaawansowana osoba od schematów i kolorów
- Żakard, mozaika, C2C, koronka, własne projekty; pracuje na iPadzie z dużym schematem; potrzebuje znacznika w schemacie i liczenia oczek w rzędzie. Prace: J-04, J-02, J-09. Dowód: „following intarsia charts is so easy” (Knitting Chart AU, id8940483554); „Magic Marker feature that counts the stitches is the best…when it works” (knitCompanion, id13955117737).
### P-4: Osoba z dużym zapasem włóczki
- Zapas („death pile”) w kilku miejscach; chce wiedzieć, co ma przed zakupem; wpisuje włóczkę ze zdjęciem etykiety. Prace: J-08, J-05. Dowód: „Let’s face it I have too much yarn” (YarnBuddy, id12255847816); „to keep track of what I own in different places” (YarnBuddy GB, id11026147292).

## Kontekst użycia
| Praca | Miejsce | Ręce i oczy | Uwaga | Łączność | Sesja |
|---|---|---|---|---|---|
| J-01, J-02, J-03, J-06 | kanapa, fotel, podróż („knit on the go”) | obie ręce zajęte robótką; oczy na robótce, zerknięcie na ekran; telefon na stojaku albo na kolanach | podzielona: podcast, TV, dzieci („I stop and start constantly”) | zbędna | od kilku minut do kilku godzin; ekran ma nie gasnąć |
| J-04 | jw., często iPad | jak wyżej; czytanie drobnego tekstu i schematu, wieczorne światło | skupiona przy schemacie | zbędna po imporcie wzoru | długa |
| J-05, J-07 | dom, nowy telefon | wolne ręce | pełna | przy przenoszeniu danych potrzebna (iCloud, P-021) | krótka |
| J-08 | sklep z włóczką, dom | wolne ręce | pełna | sklep bywa bez zasięgu („No wireless or cell signal in your yarn store?”, opis Ravit) | krótka |
| J-09, J-10 | dom | wolne ręce | pełna | zbędna | krótka |

Kontekst ryzykowny (pojazd, maszyna): brak. Dostępność: niewidoma osoba dziergająca z VoiceOver (cytat w opisie Crochet and Knit Counter: „I am a totally blind knitter and use voiceover”; to cytat dobrany przez twórcę, nie recenzja) oraz 19 recenzji w motywie dostępności; wymagania dla roli 04 w E3.

## Sprawdzenie założeń wejścia (E1)
| ZAL | Wynik E1 | Dowód |
|---|---|---|
| ZAL-002 wartość stała | wspiera | wieloletnie użycie: „using this app for over 5 years” (My Row Counter GB, id14373701670); J-05 |
| ZAL-008 Oczko to N | wspiera z zastrzeżeniem | prace J-01–J-09 to narzędzie; J-10 (nauka) obsługują W treścią |
| ZAL-009 uczciwość jako wyróżnik | wspiera mocno | J-07: utrata danych i zakupu, reklamy po zapłacie („I paid for the full version and it takes me away from the app to an Amazon fake survey”, Easy Knitty, id10578656875) |
| ZAL-014 widoczność | bez nowych dowodów | — |

## Napięcia dla ról 02 i 03 (bez rozstrzygnięcia)
- **Ravelry a P-021:** 249 recenzji wspomina Ravelry; liderzy łączą się z biblioteką wzorów. P-021 wyklucza usługi zewnętrzne. Import pliku wzoru przez arkusz udostępniania lub Pliki nie wymaga API (do sprawdzenia w E2).
- **Prostota a zakres (ZP-07, zasada wspólna 18):** recenzje chwalą prostotę (560 w motywie, 65 ≤3★) i karzą zagracenie, np. funkcje społecznościowe w liczniku JP („SNSのような機能をどんどん拡張していて正直気が散る”, id13771088681).
