# Monetyzacja: Oczko
Stan: E0 (sesja 1, bramka opłacalności, krok 0) · Aktualizacja: 2026-10-21 · Wejście: `docs/pomysl.md`, karta „Stan projektu” (`CLAUDE.md`), `docs/decyzje.md` P-001–P-009; BRD jeszcze nie ma (krok 0)

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
| ZAL-004 | Platforma: tylko iOS (iPhone, opcjonalnie zegarek) | pomysł | hipoteza | decyzja właściciela (STOP E0, decyzja 1) |
| ZAL-005 | Nikt poza właścicielem nie zapłacił za poprzednią wersję (tylko TestFlight), więc 3.1.2(a) „should not take away the primary functionality existing users have already paid for” nie wiąże modelu | karta („dane użytkowników: prawdopodobnie tylko właściciel”) | hipoteza | OP-02 |
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
| MS-09 | biblioteka `prompts`, `role/09-lokalizacja/wzorce.md:27` | 35 lokalizacji (D-026) | „bg, cs, da, de, el, en, es-419, es, et, fi, fr, hr, hu, id, it, ja, ko, lt, lv, ms, nb, nl, pl, pt-BR, pt, ro, ru, sk, sl, sr, sv, tr, uk, vi, zh-Hant” | 2026-10-21 | decyzja portfela |

## Otwarte pytania
| ID | Pytanie | Rozstrzyga | Dotyczy |
|---|---|---|---|
| OP-01 | [DO USTALENIA] Czy konto jest zapisane do App Store Small Business Program i czy umowa Paid Apps jest podpisana? | właściciel | prowizja 15% / 26–30%; możliwość sprzedaży |
| OP-02 | [DO USTALENIA] Czy ktoś poza właścicielem używał wersji z TestFlight (build 1004)? | właściciel | ZAL-005 |
| OP-03 | [DO USTALENIA] Mac z Xcode dostępny do testów StoreKit (sesja 2)? | właściciel | kontrakt płatności |
| OP-04 | [DO SPRAWDZENIA] 30% poza UE: cytat z Schedule 2 pkt 3.4(a) DPLA | 02, E1b | wariant bez programu |
