# Monetyzacja: Oczko
Stan: E1 (sesja 1, bramka opłacalności, krok 0) · Aktualizacja: 2026-10-21 · Wejście: `docs/pomysl.md`, karta „Stan projektu” (`CLAUDE.md`), `docs/decyzje.md` P-001–P-009; BRD jeszcze nie ma (krok 0)

Rola 02-monetyzacja, tryb build, moduły `oplacalnosc,cena-i-rachunek` (prompt z biblioteki `prompts` @97ec212, 65 593 znaków). Kwarantanna P-003: nie czytano `archiwum/`, kodu ani historii git sprzed 2026-10-21. Niezależność D-023: nie otwierano repo `portfel-aplikacji`; `find` po nazwach `monetyzacja*`, `prognoz*`, `rachunek*`, `portfel*`, `wycena*`, `*forecast*`, `*oplacalnosc*` w repo Oczko (bez `node_modules`): brak trafień.

## E0: Rama

### Środowisko (2026-10-21)
| Sprawdzenie | Wynik |
|---|---|
| System, Node, git | Linux x86_64 (chmura, `CLAUDE_CODE_REMOTE=true`), Node v22.22.0, git 2.43.0 |
| GitHub | push na gałąź roboczą przez git; narzędzia MCP GitHub dostępne |
| Sieć | 200: `itunes.apple.com/search`, `developer.apple.com`, `api.nbp.pl`, `gs.statcounter.com`, `play.google.com`; 403: `reddit.com/…/about.json` (sygnał społeczności trzeba wziąć inaczej); Google Trends wymaga JS (301) |
| Mac z Xcode, symulator iOS | brak w chmurze; testy StoreKit to krok właściciela (dotyczy sesji 2) |
| App Store Connect, umowa Paid Apps, Small Business Program | [DO USTALENIA] u właściciela (OP-01) |
| Widoczność repo | publiczne: dane z App Store Connect poza gitem (P-006; `oczko-warsztat` jeszcze nie istnieje) |

### Wejście jako hipotezy (ZAL)
Nie ma jeszcze BRD ani rejestru założeń; to założenia z opisu pomysłu i karty, na których stoi bramka. Rejestr `docs/zalozenia.md` założę w E1b z wynikami.

| ID | Założenie | Źródło | Status po E0 | Sprawdzenie |
|---|---|---|---|---|
| ZAL-001 | Osoby dziergające na iPhonie płacą za aplikacje-pomocników (licznik, wzory, magazyn) | pomysł | hipoteza | E1.1 ceny i modele konkurencji |
| ZAL-002 | Wartość jest stała (kolejne robótki, praca codzienna), nie jednorazowa | pomysł („towarzysz pracy przy robótce”) | hipoteza | E1.2 recenzje, warianty w E1b |
| ZAL-003 | Bez konta, sieci i usług: koszt pieniężny samej aplikacji 0 zł/rok (Apple Developer to koszt portfela, D-024) | pomysł, karta | hipoteza | obszar 11 (Garmin) może dodać koszt: E1b |
| ZAL-004 | Platforma: tylko iOS (iPhone, opcjonalnie zegarek) | pomysł; decyzja P-011 (2026-10-21) | potwierdzone decyzją | — |
| ZAL-005 | Nikt poza właścicielem nie zapłacił za poprzednią wersję (tylko TestFlight), więc 3.1.2(a) „should not take away the primary functionality existing users have already paid for” nie wiąże modelu | karta; właściciel 2026-10-21 (OP-02: „nie”) | potwierdzone | — |
| ZAL-006 | Popyt jest globalny; kolejność storefrontów wynika z sygnałów popytu, nie z lokalnej podaży | karta, P-009 | hipoteza | przesiew w E1b |
| ZAL-007 | Obszary 1–12 to mapa fraz do wyszukania konkurentów, nie wymagania; klasy WTP dopiero w sesji 2 na BRD | pomysł, prompt roli (E1.3 w sesji 2) | ustalenie procesu | — |

### Reguły sklepu i stawki na dziś
Cytaty w tabeli „Źródła” (MS-01–MS-12). Najważniejsze dla bramki:
- **Wytyczne App Review „Last Updated: October 16, 2026”** (MS-01): bez zmian wobec kalibracji biblioteki z 18.10.2026 w 3.1.1 (okres próbny „XX-day Trial” za Price Tier 0, napiwek), 3.1.2(a), 3.2.2(x), 4.2, 4.3(b), 5.6.
- **4.3(b)** wymienia „simple timers” jako nasycone; sam licznik rzędów to ryzyko podobne (wniosek, nie cytat): wartość musi wykraczać poza licznik.
- **Subskrypcja** wymaga „ongoing value” (3.1.2(a)); plan rozwoju z aktualizacjami ją spełnia (D-028 biblioteki), więc warianty subskrypcyjne wchodzą do macierzy.
- **Prowizja:** 15% w Small Business Program (MS-03), w sklepach UE także 15% dla uczestników programu (MS-05); bez programu 30% poza UE (Schedule 2 DPLA, [DO SPRAWDZENIA dosłownie w E1b]) i 26% w UE (MS-05). Liczę oba warianty, dopóki zapis do programu jest niepewny (OP-01).
- **Kurs NBP USD/PLN 3,8889** (tabela 205/A/NBP/2026 z 2026-10-21, MS-07). Próg z karty: 500 USD netto/rok = **1944,45 zł** (rachunek: 500 × 3,8889).
- **VAT:** rachunek globalny wymaga stawek kraju kupującego dla rynku głównego i listy krótkiej; źródło zbiorcze dla UE: Your Europe („Last checked: 13/07/2026”, MS-08); USA i Kanada: ceny w App Store bez podatku (do potwierdzenia w E1b), pozostałe kraje listy krótkiej ze źródeł urzędowych.

### Plan sesji 1 (zasada 9)
| Krok | Co | Czas agenta | Na co się czeka |
|---|---|---|---|
| E1.1 Konkurencja | wyszukiwanie fraz (dzierganie, szydełko, licznik rzędów, wzory, magazyn włóczek) w języku storefrontu i po angielsku; model, cena pobrania, ceny zakupów w aplikacji z datą; 8–12 aplikacji kategorii i 2–3 spoza niej (np. ogólne liczniki, czytniki PDF z adnotacją) | 45–70 min | limit iTunes ok. 20 zapytań/min |
| E1.2 Recenzje o cenie | RSS recenzji 6–8 wiodących aplikacji (us, gb, pl; inne przy pustej próbce), cytaty z adresem, „n z m w próbce” | 25–40 min | jw. |
| STOP E1 | tabele z datami, hipotezy ZAL ze statusem | — | odpowiedź właściciela (ok. 10 min) |
| E1b Przesiew | wszystkie storefronty × języki: oceny na rok wiodących aplikacji, udział iOS (StatCounter), luka lokalizacji; rynek główny + 5–8 par | 40–60 min | — |
| E1b Rachunek | `rachunek.mjs`, `oplacalnosc.mjs`, JSON dla każdego wariantu D-028 (jednorazowy w ≥3 cenach, mies., roczna, mies.+roczna, mies.+roczna+dożywotni, płatna z góry, napiwek, wariant właściciela 0,99/6,99/14,99 USD); reklamy pominięte: standard marki wysoki | 60–90 min | — |
| STOP E1b | werdykt budować / odłożyć / porzucić, wrażliwość, model optymalny | — | decyzja właściciela (ok. 15 min) |

Razem: ok. 3–4,5 h pracy agenta; od właściciela 3 odpowiedzi (E0, E1, E1b), łącznie ok. 30–40 min.

## E1: Dowody (odczyt 2026-10-21)

Metoda: `itunes.apple.com/search` (22 frazy po angielsku, storefront US, po 25 wyników), `lookup` (oceny, wydanie, języki), strona `apps.apple.com/<kraj>/app/id<id>` (ceny zakupów w aplikacji: Apple pokazuje najwyżej 10 pozycji, bez okresu, więc okres biorę z nazwy produktu albo opisu), RSS recenzji (do 500 najnowszych na sklep). Odrzucone z wyników: gry „yarn puzzle” (inna praca), kalkulatory ogólne, haft i sklepy z włóczką (poza jedną aplikacją spoza kategorii). Surowe dane: scratchpad sesji (pliki `e1/*.json`); zapiszę je w `oczko-warsztat` razem z danymi bramki.

### Rynek: aplikacje kategorii i spoza niej (US, ceny w USD)
Oceny/rok = oceny ÷ lata od wydania (min. 1). Kolumna „Typ”: N narzędzie do własnych robótek (licznik, wzór, projekty, magazyn), W wzory i nauka z treścią od twórcy (często generowaną AI), S spoza kategorii.

| Aplikacja (id) | Typ | Model | Pobranie | Zakupy w aplikacji (nazwa: cena) | Oceny US (śr.) | Oceny/rok | Języki |
|---|---|---|---|---|---|---|---|
| My Row Counter (1342608792) | N | subskrypcja + reklamy | darmowa | Premium 1 Month 2,99; Premium 1 Year 12,99; Row Counter Premium – Yearly 9,99 / 12,99 / 14,99; No Ads 2,99; Restore Backup 9,99 | 3863 (4,83) | 443 | 14 |
| knitCompanion (1058142783) | N | subskrypcja roczna | darmowa | Essentials 29,99; Setup + Essentials 29,99 (roczna: recenzja id12156949431 „renewed my essentials subscription”) | 6899 (4,83) | 801 | 1 |
| YarnBuddy (1267678125) | N | subskrypcja albo dożywotni | darmowa (do 10 projektów) | Pro Monthly 1,99; Pro Annual 14,99; Pro No Expiration 44,99 | 793 (4,46) | 126 | 1 |
| Knitting Chart (1251317736) | N | jednorazowy | darmowa | Knitting Chart Pro 19,99 („Pay only once … no subscriptions!”) | 1298 (4,35) | 140 | 2 |
| Crochet row & stitch counter (1545599414) | N+W | subskrypcja albo dożywotni | darmowa | Monthly 1,49–4,99; Three months 5,49; One Year 17,99 / 29,99; Lifetime 39,99 | 1208 (4,66) | 207 | 1 |
| StitchTally (6738016114) | N | subskrypcja albo dożywotni | darmowa | Weekly 0,99; Monthly 1,99; Annual 9,99; Lifetime 24,99 | 286 (4,85) | 148 | 3 |
| Easy Knitty Row Counter (1557552992) | N | jednorazowy | darmowa | Unlimited Version 3,99 | 420 (4,12) | 75 | 11 |
| Crochet and Knit Counter (1103338573) | N | płatna + napiwek | 1,99 | „Support for less then a yarn.” 0,99 | 326 (4,79) | 31 | 2 |
| StashBot (928131718) | N (kalkulator włóczki) | płatna | 4,99 | — | 325 (4,76) | 27 | 12 |
| Ravit (1234214894) | N (klient Ravelry) | płatna | 6,99 | — | 6023 (4,83) | 650 | 1 |
| kntd:discover (1572271760) | N (klient Ravelry) | reklamy + subskrypcja bez reklam | darmowa | AdFree Monthly 2,29; AdFree Annually 6,49 | 5224 (4,79) | 1005 | 5 |
| Crochet Studio (1619485014) | N | subskrypcja | darmowa | Plus Monthly 2,99; Plus Annual 29,49 | 579 (4,65) | 142 | 1 |
| YarnPal (6738537088) | W | subskrypcja | darmowa | Yarnpal/Knitpal Premium 3,99; 29,99; 39,99; 49,99 (okres z nazwy niejasny; recenzja id14637433694: „$40 yearly subscription”) | 34 254 (4,71) | 18 643 | 18 |
| Loopsy (6745416564) | N+W | subskrypcja | darmowa | Loopsy Pro 4,99; 9,99; 19,99; 29,99; 39,99; 49,99; 99,99 | 16 787 (4,75) | 11 881 | 11 |
| LoopCraft (6752294439) | W | subskrypcja | darmowa | Weekly Premium 3,99; Yearly Pro 39,99; Yearly Premium 49,99; „7-Day Trial” 34,99 | 5390 (4,70) | 5390 | 10 |
| Woolsy (6759599166) | W | subskrypcja | darmowa | Weekly 3,99; Monthly 8,99; Yearly 39,99; Annual Pro (Special Offer) 19,99 | 230 (4,59) | 230 | 1 |
| Loopy (6756133891) | W | subskrypcja | darmowa | Weekly 3,99; Monthly 9,99; Yearly 39,99 | 286 (4,58) | 286 | 9 |
| CraftBook (6759407166) | W | subskrypcja | darmowa | Unlimited 9,99–49,99; Pro 19,99–59,99 | 945 (4,70) | 945 | 1 |
| Cozyarn (6756036357) | W | subskrypcja | darmowa | Pro 3,99; 5,99; 7,99; 39,99 | 896 (4,72) | 896 | 1 |
| Knitandnote (1634163608) | N | subskrypcja | darmowa | Premium 11,90; 14,99; 107,99 | 181 (3,88) | 48 | 2 |
| Ribblr (1529605339) | W (sklep wzorów) | sprzedaż wzorów | darmowa | — | 552 (4,22) | 91 | 1 |
| Amigurumi Today (1139466041) | W | reklamy | darmowa | Turn off ads 1,99 | 752 (4,39) | 74 | 1 |
| LooseLoop (6756404492) | N+W | subskrypcja + kredyty | darmowa | Premium 4,99 / 49,99 / 99,99; 5–20 Credits 9,99–19,99 | 240 (4,50) | 240 | 7 |
| Counter Tally Count (1144352844) | S (licznik ogólny) | reklamy | darmowa | Remove Ads 19,99 | 14 009 (4,80) | 1385 | 30 |
| Stitchly: Cross stitch (1467867656) | S (haft) | jednorazowy | darmowa | Full Version 75,00; Special Offer 39,99 | 2291 (4,78) | 312 | 33 |

**Ceny regionalne (próbka 13 aplikacji N/W):** GB w funtach w tych samych liczbach co US (np. YarnBuddy £1,99 / £12,99 / £44,99; Knitting Chart £19,99). PL: My Row Counter 9,99–14,99 zł/mies., 49,99 zł/rok; YarnBuddy 9,99 / 72,99 / 199,99 zł; Knitting Chart 99,99 zł; StitchTally 9,99 / 49,99 / 99,99 zł; Easy Knitty 14,99–19,99 zł; płatne z góry: Ravit 29,99 zł, StashBot 24,99 zł, Crochet and Knit Counter 9,99 zł. DE: liczby ocen odczytane, ceny nie (inna etykieta strony, „In-App-Käufe”); uzupełnię w E1b, jeśli DE wejdzie na listę krótką.

**Oceny w storefrontach (ta sama próbka):** US i GB mają setki do tysięcy ocen na aplikację (GB: My Row Counter 502, YarnBuddy 92, Knitting Chart 200). PL: 0–47 ocen dla narzędzi (My Row Counter 41, Knitting Chart 12, YarnBuddy 2), więc w bramce PL wymaga interpretacji B (< 50 ocen). DE: My Row Counter (jako „Zähl Mich”) 364, knitCompanion 141, Knitting Chart 115.

**Przedziały cen narzędzi N (US):** subskrypcja miesięczna 1,49–4,99, mediana 2,52 (n = 6: My Row Counter, YarnBuddy, Crochet counter, StitchTally, Crochet Studio, kntd); roczna 9,99–29,99, mediana 19,49 (n = 6: bez kntd, które sprzedaje tylko brak reklam); dożywotni / jednorazowy pełnego narzędzia 19,99–44,99, mediana 32,49 (n = 4); małe narzędzia jednorazowe albo płatne z góry 1,99–6,99. Aplikacje W: roczna zwykle 39,99, tygodniowa 3,99. (Rachunek: aplikacja z kilkoma cenami jednego okresu wchodzi medianą swoich cen; okresy z nazw produktów.)

### Recenzje o cenie i modelu
Próbka: 2026-10-21, do 500 najnowszych recenzji na sklep, US i GB, 11 aplikacji (razem 2818 recenzji). Liczby to automatyczna klasyfikacja słowami kluczowymi: przybliżenie, które łapie też wpisy nie na temat. Cytaty sprawdziłem ręcznie; adres: `itunes.apple.com/us/rss/customerreviews/id=<aplikacja>/sortby=mostrecent/json`, id recenzji w nawiasie.

| Motyw | Wynik (n z m) | Cytaty |
|---|---|---|
| Płacący chwalą narzędzie do własnych robótek | knitCompanion US: 36 z 342 recenzji w motywie „jednorazowy/warto”; YarnBuddy US: 21 z 243; My Row Counter US: 12 z 500 | „the $10/year for premium is so well worth it!” (My Row Counter, 5★, id14685334270); „I’ve been using the paid version for over four years and find it’s worth every penny.” (knitCompanion, 5★, id13111866440); „Just switched to lifetime subscription because I can’t live without it.” (YarnBuddy, 5★, id14628479189); „I bought the full version because it is SO worth the money.” (Knitting Chart, 5★, id13583431468) |
| Skarga na cenę subskrypcji | YarnPal US 19 z 500; Loopsy US 17 z 388; LoopCraft GB 5 z 27 | „YarnPal is really good at teaching, but the subscription is very expensive” (4★, id14617296521); „Too expensive most of this you can find on you tube” (LoopCraft GB, 2★, id13616625627) |
| Okres próbny zamieniony w opłatę, opłata od razu | Loopsy US 20 z 388; YarnPal US 12 z 500; w aplikacjach N 0–3 | „Literally charged me $20 for a "free 7 day trial" ???” (YarnPal, 2★, id14369060598); „This app charged me as soon as I started the 7 day trial.” (Loopsy, 1★, id14686498977); „Loopsy is free forever with no indication of conditions. Then at the end of the set up it forces you into trying the 7 day free trial” (3★, id14666887433) |
| Zakup dożywotni odebrany albo funkcja zabrana po zapłacie | pojedyncze, ale 1★ | „I paid for the lifetime version, and now they’ve made enough changes where that version isn’t available anymore.” (knitCompanion, 1★, id14338808883); „Purchased the annual subscription for the Smart Pattern feature … The update took out that tool.” (Loopsy, 1★, id14598505817) |
| Utracony zakup albo dane po ponownej instalacji | Easy Knitty US: 22 z 115 recenzji (część nie na temat) | „now I see ads, and there is no option to restore my purchase. All notes on completed projects gone!” (1★, id13952013102); „it didn’t register that I had purchased the premium version. With deleting it I lost all my previously logged projects data.” (3★, id13590518451) |
| Reklamy | My Row Counter US 18 z 500, głównie neutralne | „There are ads but they are not distracting.” (5★, id14412297462); „not full of ads or stuff you don’t really need” (5★, id14610525135) |

### Wnioski E1 jako hipotezy
| ID | Wniosek | Status | Dowód |
|---|---|---|---|
| ZAL-001 | Dziergający płacą za narzędzie do własnych robótek | **potwierdzone (R)** dla US/GB | 12 płatnych narzędzi N z cenami; cytaty płacących wyżej |
| ZAL-002 | Wartość stała | **częściowo potwierdzone (R):** płacący używają „every day, on every project” (knitCompanion, id12420374408) i odnawiają subskrypcje roczne 10–30 USD; jednocześnie rynek ma jednorazowe 4–45 USD i prośby o zakup jednorazowy („I’d like to change my subscription to the one time payment”, YarnBuddy, id13777337543). Rozstrzyga macierz wariantów w E1b | jw. |
| ZAL-008 (nowe) | Rynek dzieli się na narzędzia N (setki ocen/rok, ceny 10–30 USD/rok albo 20–45 USD raz) i aplikacje W z treścią i reklamą płatną (tysiące–dziesiątki tysięcy ocen/rok, 40 USD/rok, agresywne okresy próbne). Oczko to N; do bramki biorę oceny konkurentów N, nie W | hipoteza (ocena roli 02) | tabela rynku |
| ZAL-009 (nowe) | Przewaga uczciwości jest realna: najczęstsze skargi płacących dotyczą okresu próbnego, zabranej funkcji i utraty zakupu albo danych, czyli tego, czego zasady 6–7 roli zabraniają | hipoteza (R) | tabela recenzji |
| ZAL-010 (nowe) | PL to rynek z małą liczbą ocen (< 50 dla narzędzi): w bramce interpretacja A (mały popyt) i B (nisza bez lokalizacji) | hipoteza | oceny PL |

Sprzeczności z rolą 01: brak (roli 01 jeszcze nie było). Klasy WTP funkcji: w sesji 2 na BRD (ZAL-007); już teraz widać dowody R dla obszarów: licznik wielu projektów, wzór PDF ze znacznikiem, zegarek, magazyn i projekty (płatne funkcje u My Row Counter, knitCompanion, YarnBuddy).

## Źródła
| ID | Adres | Miejsce | Cytat | Odczyt | Szczebel |
|---|---|---|---|---|---|
| MS-01 | developer.apple.com/app-store/review/guidelines/ | nagłówek; 3.1.1 | „Last Updated: October 16, 2026”; „Non-subscription apps may offer a free time-based trial period before presenting a full unlock option by setting up a Non-Consumable IAP item at Price Tier 0 that follows the naming convention: “XX-day Trial.”” | 2026-10-21 | 1 |
| MS-01a | jw. | 3.1.1 | „Apps may use in-app purchase currencies to enable customers to “tip” the developer or digital content providers in the app.” | 2026-10-21 | 1 |
| MS-01b | jw. | 3.1.2(a) | „you must provide ongoing value to the customer, and the subscription period must last at least seven days and be available across all of the user’s devices” | 2026-10-21 | 1 |
| MS-01c | jw. | 3.2.2(x) | „Apps must not force users to rate the app, review the app, download other apps, or other store-related actions in order to access functionality” | 2026-10-21 | 1 |
| MS-01d | jw. | 4.2 | „If your App doesn’t provide some sort of lasting entertainment value or adequate utility, it may not be accepted.” | 2026-10-21 | 1 |
| MS-01e | jw. | 4.3(b) | „Certain kinds of apps, such as dating, flashlight, sound effects, wallpaper, simple timers, and fortune telling, are well established on the App Store” | 2026-10-21 | 1 |
| MS-01f | jw. | 5.6 | „Apps should never prey on users or attempt to rip off customers, trick them into making unwanted purchases” | 2026-10-21 | 1 |
| MS-02 | developer.apple.com/app-store/subscriptions/ | wymagania ekranu zakupu (surowy tekst strony, l. 199–204) | „In the purchase flow for a free trial, clearly indicate how long the free trial lasts and the price billed once the free trial is over.”; „the amount that will be billed must be the most prominent pricing element in the layout” | 2026-10-21 | 1 |
| MS-03 | developer.apple.com/app-store/small-business-program/ | opis programu | „a reduced commission rate of 15% on paid apps and Apple In-App Purchases”; „developers who made up to 1 million USD in proceeds in the prior calendar year … as well as developers new to the App Store, can qualify” | 2026-10-21 | 1 |
| MS-04 | developer.apple.com/programs/enroll/ | członkostwo | „The Apple Developer Program is 99 USD per membership year.” (koszt portfela, poza rachunkiem aplikacji, D-024) | 2026-10-21 | 1 |
| MS-05 | developer.apple.com/support/dma-and-apps-in-the-eu/ | „Business terms for the App Store in the EU” | 26%: „Sales processed by Apple In-App Purchase.”; 15%: „Sales processed by Apple In-App Purchase from participants in the App Store Small Business Program … and sales of auto-renewable subscriptions after their first year.” | 2026-10-21 | 1 |
| MS-07 | api.nbp.pl/api/exchangerates/rates/a/usd/?format=json | tabela A | „205/A/NBP/2026”, „2026-10-21”, „mid”: 3.8889 | 2026-10-21 | 1 |
| MS-08 | europa.eu/youreurope/business/taxation/vat/vat-rules-rates/index_en.htm | stawki VAT UE | „Last checked: 13/07/2026” (stawki krajów wypiszę w E1b) | 2026-10-21 | 3 |
| MS-10 | itunes.apple.com/search, /lookup; apps.apple.com/{us,gb,pl,de}/app/id… | tabela rynku E1 | liczby i ceny jak w tabeli | 2026-10-21 | 1 (dane sklepu) |
| MS-11 | itunes.apple.com/{us,gb}/rss/customerreviews/…/json | recenzje E1 (id w tabeli) | cytaty jak w tabeli | 2026-10-21 | 5 (opinie: dowód R płacenia, nie fakt) |
| MS-09 | biblioteka `prompts`, `role/09-lokalizacja/wzorce.md:27` | 35 lokalizacji (D-026) | „bg, cs, da, de, el, en, es-419, es, et, fi, fr, hr, hu, id, it, ja, ko, lt, lv, ms, nb, nl, pl, pt-BR, pt, ro, ru, sk, sl, sr, sv, tr, uk, vi, zh-Hant” | 2026-10-21 | decyzja portfela |

## Otwarte pytania
| ID | Pytanie | Rozstrzyga | Dotyczy |
|---|---|---|---|
| OP-01 | Small Business Program i umowa Paid Apps: **tak** (właściciel, 2026-10-21). Prowizja bazowa 15% (MS-03, MS-05); 26–30% tylko jako wrażliwość | zamknięte | prowizja |
| OP-02 | Inni użytkownicy TestFlight: **nie** (właściciel, 2026-10-21) | zamknięte | ZAL-005 |
| OP-03 | Mac z Xcode: **nie** (właściciel, 2026-10-21). Testy zakupów w sesji 2 trzeba zaplanować bez Xcode (np. build w chmurze, piaskownica na telefonie przez TestFlight) [DO SPRAWDZENIA w sesji 2] | 02 sesja 2, 05 | kontrakt płatności |
| OP-04 | [DO SPRAWDZENIA] 30% poza UE: cytat z Schedule 2 pkt 3.4(a) DPLA | 02, E1b | wariant bez programu |
