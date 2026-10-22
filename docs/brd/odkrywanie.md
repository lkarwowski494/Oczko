# Odkrywanie: prace, persony, zasady, rynek
Stan: STOP E2 · Aktualizacja: 2026-10-21 · Notatki z wywiadu: `oczko-warsztat/01-odkrywanie/wywiad-2026-10-21.md` (prywatne)

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

## Rynek (E2, odczyt 2026-10-21)
Macierz 14 aplikacji × 36 funkcji z pochodzeniem każdej komórki (opis, strona sklepu, id recenzji): `oczko-warsztat/01-odkrywanie/soczewki/konkurencja.md`. Ceny i modele: `docs/monetyzacja.md` (rola 02). Opisy funkcji to deklaracje twórców [FAKT S-17], nie test działania.

| Funkcja | Ile z 14 ma (potwierdzone) | Najczęstsza skarga |
|---|---|---|
| wiele liczników | 13 | — |
| liczniki powiązane i powtórzenia | 7 | konfiguracja („All I want is for the main counter to do a four-row repeat”, My Row Counter, id12586379913) |
| przypomnienie w rzędzie | 5 | słabo widoczne (編み物カウンター２, 4 recenzje) |
| blokada przed stuknięciem | 2 (jedna tylko dla schematu) | przypadkowe dodanie rzędów (J-01) |
| historia stuknięć albo cofanie | 3 | — (funkcja chwalona) |
| Apple Watch | 7 | zawiesza się, gubi liczbę: YarnBuddy 17 z 301, My Row Counter 6 z 917 |
| ekran blokady (Live Activity) | 2 | brak („hate that I have to unlock my phone”, J-06) |
| głos, Siri | 3 | „it doesn’t always response” (knitCompanion, id8988040462, pisownia oryginału) |
| wzór PDF i znacznik miejsca | 9 | adnotacje Apple Pencil zawodne (Knitting Chart, id13583431468) |
| magazyn włóczki | 5 | baza włóczek i skaner (YarnBuddy 10 z 301) |
| eksport albo kopia | 3 (u My Row Counter płatna, 9,99 USD) | utrata danych u każdego lidera (J-07) |
| synchronizacja | 10 | gubi postęp, także przez iCloud (Loopsy 16 z 437; knitCompanion id13110653811) |
| słownik skrótów | 1 | — |
| deklaracja dostępności w sklepie | 0 | — |
| „Data Not Collected” w App Privacy | 6 | — |

**Motywy recenzji płacących (≤3★):**
- Utrata danych i rozjazd synchronizacji: YarnBuddy 26 z 301, Easy Knitty 20 z 156, Loopsy 16 + 16 z 437, knitCompanion 14 z 348.
- Nieuczciwe płacenie: wymuszona „darmowa” próba (Loopsy 43 z 437), funkcje przeniesione za paywall (My Row Counter 18 z 917), odebrana opłacona funkcja AI „Smart Pattern” (Loopsy 15 z 437, wrzesień 2026), aplikacja zapomina o zakupie (Easy Knitty 14 z 156), reklamy po zapłacie (Easy Knitty 9).
- Złożoność: knitCompanion 28 z 348, Knitting Chart 27 z 195 („you have to watch videos to figure out how to use it”, knitCompanion, id9511649618).
- Niechęć do generatywnego AI i „kradzieży” wzorów: Loopsy 14 z 437.

**Luki (praca, której nikt nie robi dobrze):** zaufanie do danych (J-07); uczciwe płacenie; niezawodne liczenie bez odblokowania telefonu (J-06); widoczne przypomnienia i zamiana instrukcji „co N rzędów M razy” na plan rzędów (J-03, nikt tego nie robi); ochrona przed przypadkowym stuknięciem (J-01); prosty start z opcjonalną głębią (nikt nie łączy obu); deklarowana dostępność.

**Funkcje „wow” obecne tylko u jednej aplikacji:** historia stuknięć z godziną i konfetti przy celu (編み物カウンター２); reguły automatycznego przybierania, dziennik zmian z cofaniem, szacowany czas do celu, odejmowanie zużytej włóczki z magazynu (CozyKnit); licznik w Live Activity (Loopsy); sprawdzanie kontrastu kolorów do żakardu (Strikketeller); VoiceOver w całej aplikacji (Crochet and Knit Counter).

**Tempo:** szybcy (Loopsy ≥ 25 wersji w 7 mies., CozyKnit 25 w 11 mies., My Row Counter ok. 2 na miesiąc) i zastygli (YarnBuddy 19 mies. bez wersji, Knitting Chart prawie 4 lata). Płacący zastygłych to grupa do przejęcia przez import danych (H-08).

## Ograniczenia (OG)
### OG-01: Więcej niż prosty licznik
- Aplikacja nieodróżnialna od powszechnie dostępnych albo bez trwałej użyteczności może zostać odrzucona [FAKT S-01] [FAKT S-02]; sam licznik rzędów jest w kategorii powszechny (13 z 14 w macierzy). Dotyczy H-04.
### OG-02: Przywracanie zakupów
- Aplikacja powinna mieć mechanizm przywracania zakupów [FAKT S-03]. Dotyczy J-07 (skargi Easy Knitty).
### OG-03: Subskrypcja na wszystkich urządzeniach
- Subskrypcja ma być dostępna na wszystkich urządzeniach użytkownika [FAKT S-04]. Po P-029 (2026-10-22: jeden zakup nieodnawialny Pro, bez subskrypcji) dotyczy tylko powrotu do modelu A albo C (warunek testu P-029, `docs/monetyzacja.md`); przy jednym zakupie ten sam wynik dla użytkownika daje przywracanie na każdym urządzeniu (OG-02, BR-ZAK-001, S-33).
### OG-04: Polityka prywatności w aplikacji
- Link do polityki prywatności w metadanych i w aplikacji [FAKT S-05].
### OG-05: Opis w sklepie tylko o istniejących funkcjach
- Reklamowanie funkcji, których aplikacja nie ma, grozi usunięciem [FAKT S-06]. Zakaz atrap (ZP-09, zasada wspólna 18) jest więc także wymogiem sklepu.
### OG-06: Bez nazw konkurentów w metadanych
- Słowa kluczowe i opis bez cudzych znaków towarowych i nazw popularnych aplikacji [FAKT S-07] (np. „Ravelry”, „knitCompanion”).
### OG-07: Patenty
- Zakaz użycia opatentowanych rozwiązań bez zgody [FAKT S-08]. Patent US8506303 (knitCompanion) obejmuje m.in. śledzenie postępu w rzędach instrukcji złożonej z kilku źródeł; status według Google Patents „Active”, wygaśnięcie przewidywane 2032-07-13 [FAKT S-10]. Drugi patent US8529263 ma ten sam status i dodatkowo „companion instructions” zależne od postępu [FAKT S-32]. RYZ-01.
- **Weryfikacja własna (P-024), stan 2026-10-21:** wszystkie niezależne zastrzeżenia (1, 9, 13 obu patentów) zawierają łącznie: pobranie treści z kilku instrukcji („a plurality of instructional manuals”), wybór części, ich edycję, złożenie w jeden zintegrowany zestaw instrukcji, prezentację i śledzenie postępu [FAKT S-10] [FAKT S-32].

| Funkcja Oczka | Treść z kilku instrukcji | Edycja i złożenie w jeden zestaw | Śledzenie postępu | Uwaga |
|---|---|---|---|---|
| BR-WZR-001, BR-WZR-002 (jeden wzór w projekcie) | nie | nie | — | — |
| BR-WZR-003 (znacznik rzędu) | nie | nie | tak | brak dwóch elementów |
| BR-WZR-004 (pisanie po wzorze) | nie | nie (adnotacja, nie złożenie części) | — | — |
| BR-LIC-009, BR-LIC-010 (przypomnienia, plan rzędów) | nie | nie | tak | brak dwóch elementów |

- **Ograniczenie projektowe (kandydat dla 03 i 04):** Oczko nie łączy fragmentów kilku wzorów w jeden zestaw instrukcji (jak „JOIN CHARTS or WRITTEN” w opisie knitCompanion). Każda nowa funkcja wzoru przechodzi tę tabelę przed projektem i przed wydaniem. To ocena projektu, nie opinia prawna.
### OG-08: Usługi zewnętrzne tylko zgodnie z ich warunkami
- Korzystanie z usługi zewnętrznej wymaga zgody jej warunków [FAKT S-09]; P-021 i tak wyklucza usługi. Import pliku, który użytkownik sam pobrał (PDF, arkusz zapasu z Ravelry [FAKT S-31]), nie korzysta z API.
### OG-09: CloudKit: koszt i sieć
- Dane prywatne są w iCloud użytkownika [FAKT S-12], a członkostwo daje do 1 PB darmowego miejsca na aplikację [FAKT S-11]: warunek kosztowy P-021 spełniony (0 zł). CloudKit ma minimalną pamięć podręczną offline i wymaga sieci [FAKT S-13], więc źródłem prawdy musi być baza na urządzeniu, a synchronizacja dodatkiem.
### OG-10: Kopia iCloud obejmuje dane aplikacji
- Kopia urządzenia obejmuje dane pobranych aplikacji [FAKT S-14]. Utrata danych po zmianie telefonu u konkurencji wynika z ich implementacji, nie z iOS.
### OG-11: AI na urządzeniu: urządzenia i języki
- Apple Intelligence działa na iPhone 15 Pro i nowszych oraz w 16 językach, bez m.in. polskiego, rosyjskiego, czeskiego i ukraińskiego [FAKT S-15]. Modele w Private Cloud Compute są bez kosztu API dla uczestników Small Business Program poniżej 2 mln pobrań [FAKT S-16]. Dotyczy P-023, H-09.
### OG-12: Materiały Craft Yarn Council
- CYC prosi o e-mail o zamiarze użycia i linię ze źródłem [FAKT S-24]; tabele to „GUIDELINES ONLY” [FAKT S-19]. Czy dotyczy tabel liczbowych: [DO USTALENIA] (OP-09).
### OG-13: Symbole pielęgnacji
- Pięć symboli pielęgnacji to chronione znaki towarowe [FAKT S-28]; bez licencji aplikacja ich nie rysuje (OP-11).

## Ryzyka produktu (RYZ)
### RYZ-01: Patent na śledzenie postępu we wzorze (brzegowy)
- OG-07. Weryfikacja własna zamiast konsultacji prawnej (P-024); ryzyko szczątkowe: błędna interpretacja zastrzeżeń bez prawnika. Tańsza kontrola: tabela elementów zastrzeżeń przy każdej funkcji wzoru.
### RYZ-02: Synchronizacja myli liczbę rzędów (realny)
- Najczęstsza skarga zaawansowanych, także przy iCloud (Loopsy). Dotyczy P-021, J-07; projektuje rola 12, testy konfliktów przed wydaniem.
### RYZ-03: Terminologia US/UK w szydełku (realny, mienie)
- Ta sama nazwa oznacza inny ścieg w US i UK; CYC opisuje terminologię US [FAKT S-21]. Skarga: „Started the same project about 6 times before realising why it was going wrong” (YarnPal GB, id13435430165). Dotyczy J-10.
### RYZ-04: Fałszywa precyzja kalkulatorów (realny, mienie)
- Tabele CYC to wytyczne [FAKT S-19]; próbka zmienia się po praniu [FAKT S-26]; źródła zrównują 4 in z 10 cm (RD-04). Dotyczy RD-01–RD-10.
### RYZ-05: Stos Expo/React Native a funkcje natywne (realny)
- CloudKit, Watch, widżety, Live Activities i Foundation Models wymagają kodu natywnego. Ocenia rola 05.
### RYZ-06: Widoczność i tempo konkurencji (realny)
- ZAL-014; Loopsy i CozyKnit dokładają funkcje co 2 tygodnie. Dotyczy H-03.
### RYZ-07: Wsparcie w 35 językach przez jedną osobę (realny)
- ZP-05 („czytamy każdą opinię”) w 35 językach; skargi na brak odpowiedzi u konkurencji (YarnBuddy 24 z 301).
### RYZ-08: Zdrowie: przeciążenie rąk (teoretyczny)
- RSI wynika z powtarzanych ruchów [FAKT S-30], ale źródło nie wymienia dziergania; brak badania o dziergających. Aplikacja nie składa obietnic zdrowotnych; przerwa to najwyżej opcjonalne przypomnienie (OP-15).

## Hipotezy dla ról 02 i 03 (H)
### H-01: Darmowy pierwszy projekt bez okresu próbnego
- Rodzaj: monetyzacja · Rejestr: ZAL-017 · Za: początkujący odpadają przy zaporze płatności i próbie do pamiętania (soczewka początkująca; My Row Counter id10952769045); wymuszona próba to najczęstsza 1★ Loopsy (43 z 437). Przeciw: hojna wersja darmowa obniża konwersję [OCENA].
- Opcje: (a) licznik z cofaniem i historią dla co najmniej jednego projektu za darmo, płatna głębia; (b) wszystko płatne z próbą. Rekomendacja: (a). Sprawdzenie: konwersja w pierwszych 3 miesiącach. Rozstrzyga: 02.
- Status: rozstrzygnięta (2026-10-22, rola 02): darmowy rdzeń bez limitu projektów (P-030) i bez okresu próbnego (P-033); forma „jeden projekt za darmo” zastąpiona.
### H-02: Zakup jednorazowy i nienaruszalność danych
- Rodzaj: monetyzacja · Rejestr: ZAL-018 · Za: „I HATE subscription models so the fact that this is a one time purchase” (Ravit, id13490236648); skargi na odebrane funkcje i dane za paywallem (Knitandnote id13238171721). Przeciw: subskrypcja daje przychód stały (ZAL-002).
- Opcje (stan 2026-10-21): trzy produkty z P-019 albo sam zakup jednorazowy; reguła: dane i eksport nigdy za paywallem, opłacona funkcja nie znika. Rozstrzyga: 02.
- Status: rozstrzygnięta (2026-10-22, rola 02): jedno odblokowanie Pro 14,99 USD jako jedyny produkt, bez subskrypcji, test modelu (P-029); dane i eksport poza zaporą, opłacona i darmowa funkcja nie znika (KP-01, KP-02 w `docs/monetyzacja.md`).
### H-03: Zaufanie jako widoczny wyróżnik
- Rodzaj: wartość · Rejestr: ZAL-009 · Za: luki rynku (dane, płacenie), 6 z 14 ma „Data Not Collected”, 0 z 14 deklaruje dostępność. Przeciw: obietnicę trzeba udowodnić, a jedna utrata danych ją przekreśla.
- Opcje: (a) „bez utraty danych, bez reklam, bez śledzenia, 35 języków, dostępność” jako główny przekaz; (b) przekaz funkcyjny („najwięcej funkcji”). Rekomendacja: (a). Rozstrzyga: 02, 11.
### H-04: Kandydaci na rdzeń według siły dowodu
- Rodzaj: zakres · Rejestr: ZAL-019 · Mocne dowody: J-01, J-02, J-06, J-07, J-04; średnie: J-03, J-05, J-08, J-10; słabe: J-09, J-11. OG-01: sam licznik nie wystarczy.
- Opcje: (a) rdzeń J-01, J-02, J-03, J-05, J-06, J-07, potem J-04 (po ocenie RYZ-01), J-08, J-10, J-09; (b) od razu wszystko. Rekomendacja: (a). Rozstrzyga: 03.
### H-05: Kalkulatory swetrowe bez dowodu potrzeby
- Rodzaj: zakres · Rejestr: ZAL-020 · Za odcięciem: 2 trafienia w recenzjach zaawansowanych, brak źródeł dla głębokości karczka i luzu czapki (OP-07). Przeciw: obszar 5 w `docs/pomysl.md` i kalkulatory u 8 z 14 konkurentów.
- Opcje: (a) kalkulatory proste (RD-01–RD-08, RD-10) w pierwszej wersji, swetrowe po dowodzie; (b) wszystkie. Rekomendacja: (a). Rozstrzyga: 03.
### H-06: Funkcje „wow” z luk
- Rodzaj: wartość · Rejestr: ZAL-021 · Kandydaci: historia stuknięć z cofaniem (J-01), wyraźne przypomnienie z numerem powtórzenia (J-03, RD-13), plan rzędów z instrukcji „co N rzędów M razy” (J-03; nikt tego nie robi), licznik na ekranie blokady i zegarku bez telefonu (J-06), konfetti przy celu (J-11). Dowód zakupu (macierz w `oczko-warsztat/01-odkrywanie/soczewki/konkurencja.md`, korekta ER-07, 2026-10-22): zegarek ✓$ 3 (My Row Counter z opisu, Crochet row & stitch counter i StitchTally z recenzji), płacący: „Worth every penny!” (My Row Counter, id14675500870); przypomnienie w rzędzie ✓$ 2 (knitCompanion, YarnBuddy, z opisów); historia stuknięć ✓$ 1 i ekran blokady ✓$ 1 (oba Strikketeller, dowód słaby); plan rzędów i konfetti bez dowodu zakupu. Przeciw: opłacony zegarek, który nie działa, daje 1★ („I paid for unlimited access specifically to access the Apple Watch counter feature. However, it does not work”, StitchTally, id14375427685); Live Activity ma 1 pośredni ślad.
- Rozstrzyga: 03 z właścicielem.
### H-07: Podział na aplikacje
- Rodzaj: podział · Rejestr: ZAL-022 · Opcje:
  - (a) Jedna aplikacja z warstwami: prosty licznik od pierwszego uruchomienia, głębia (wzór, magazyn, kalkulatory) opcjonalna. Za: dane łączą się (magazyn → projekt, CozyKnit); „I don’t want a million knitting apps on my phone, I just want yours!” (Ravit, id7070443311); luka „prosty start z opcjonalną głębią”. Przeciw: ryzyko kombajnu (ZP-01, zasada 18).
  - (b) Oczko (licznik, wzór, projekty) i osobna aplikacja portfela „magazyn i kalkulatory”. Za: dwie mniejsze aplikacje, dwa wejścia w wyszukiwaniu. Przeciw: dane magazynu i projektu w dwóch aplikacjach; 4.3 dopuszcza różne aplikacje, ale nie warianty tej samej [FAKT S-01].
  - (c) Rodzina: licznik, wzory, magazyn. Przeciw: trzy razy utrzymanie w 35 językach (RYZ-07).
- Rekomendacja: (a). Rozstrzyga: 03 z właścicielem.
### H-08: Import danych od konkurencji
- Rodzaj: zakres · Rejestr: ZAL-023 · Za: płacący zastygłych liderów odchodzą (YarnBuddy id13993192426); przejście hamują dane u konkurenta (`docs/monetyzacja.md`). Arkusz zapasu z Ravelry [FAKT S-31], PDF przez Pliki. Przeciw: każdy format to utrzymanie.
- Rozstrzyga: 03.
### H-09: AI na urządzeniu bez dowodu potrzeby
- Rodzaj: wartość · Rejestr: ZAL-024 · Za: odczyt danych z PDF (KNIT, opis); kandydaci „wow” (ZP-08). Przeciw: brak dowodu potrzeby u początkujących i zaawansowanych; niechęć do AI (Loopsy 14 z 437); OG-11 wyklucza część języków i starszych iPhone’ów.
- Opcje: (a) AI tylko w funkcjach pomocniczych (np. wypełnienie danych wzoru z PDF), zawsze z możliwością pominięcia; (b) bez AI w pierwszej wersji. Rekomendacja: (a) po dowodzie z roli 03. Private Cloud Compute: nie (P-025). Rozstrzyga: 03 (zakres AI na urządzeniu).

## Sprawdzenie założeń (E2)
| ZAL | Wynik E2 | Dowód |
|---|---|---|
| ZAL-003 koszt 0 zł | potwierdzone dla synchronizacji | OG-09 |
| ZAL-009 uczciwość jako wyróżnik | potwierdzone (R) | motywy recenzji płacących, H-03 |
| ZAL-008 Oczko to N | wspiera | macierz: luki leżą w narzędziach, nie w treści |
