# Przekazanie koordynatora Oczka (na wypadek wyczerpania limitu konta)

Aktualizuje koordynator po każdej zmianie stanu (P-244). Nowy koordynator, także na innym koncie Claude, zaczyna od tego pliku, `CLAUDE.md`, `docs/decyzje.md` (od P-217) i `docs/sztafeta.md`, nie od pamięci rozmowy.

**Ostatnia aktualizacja:** 2026-10-27 08:50 UTC — **konto 2 przejęło (P-269)**; sesje ról 08 p7, 07, 08 p6 uruchomione na koncie 2 · gałąź robocza `claude/jolly-thompson-paz6d8` · ostatnia decyzja P-276 · **koordynator: session_01T66VBzy9qEVyo8a5aMd7r1 (konto 2, od 08:45 UTC)**; poprzedni (konto 1, nieaktywny): session_01VjtVbMx8DYWkBfH4pvaCXK

## Jak przejąć na innym koncie
1. Sesje i zaplanowane zadania poprzedniego konta nie są widoczne z nowego konta. Pracę przejmujesz z repozytorium, nie z sesji.
2. Kod sesji w toku: gałęzie kopii `claude/kopia-partia-6`, `claude/kopia-partia-6-natywne` (Swift pod-agenta partii 6) i `claude/kopia-partia-7` (P-244; zapis co ~30 min, także kod niesprawdzony). Stan i plan: `docs/programista/partia-6.md`, `partia-7.md` na tych gałęziach. Zanim cokolwiek trafi na gałąź roboczą: rebase na `claude/jolly-thompson-paz6d8`, `env -u NODE_PATH npm run verify` zielone.
3. Nowa sesja roli: źródło `lkarwowski494/oczko`, rewizja i gałąź wyniku `claude/jolly-thompson-paz6d8` (kopie: rewizja z gałęzi kopii). Szablon polecenia startowego: niżej. Repo `prompts` bywa niedostępne dla sesji ról — wtedy skrót zasad roli z P-242/P-243 (wiadomości koordynatora) albo prompt złożony przez koordynatora.
4. Odtwórz dyżur nocny: maszyny macOS GitHub Actions są dostępne po północy czasu polskiego (P-187). Nocny przebieg „Jakość · iOS” (`jakosc-ios.yml`) rusza z pushem kodu na gałąź roboczą albo ręcznie; `cancel-in-progress` — każdy kolejny push kodu go anuluje.

## Stan (2026-10-27 06:30 UTC) — przejęcie na drugie konto (tygodniowy limit konta 1)
Sesje ról i zaplanowane zadania konta 1 **nie działają** na koncie 2: role trzeba uruchomić od nowa z gałęzi kopii i plików stanu.

- **Zakres 1.0:** pełne MVP z wzorami (F) i iCloud (G), P-217. Plan: `docs/plan-app-store.md` (do odświeżenia pod P-217).
- **Fundament partii 6/7:** L1–L3c nałożone (P-236). Panele E2E poza buildem wydania (P-238, P-240).
- **Strona:** `apps4brew.com/oczko/` opublikowana, adres polityki przełączony (P-239).
- **Okno maszyn macOS** do ok. 14:00 UTC (P-187). Każdy push w ścieżkach `jakosc-ios.yml` (kod, `e2e/**`, `package.json`, `modules/**`, workflow) anuluje bieżący przebieg; pełny pakiet tylko z `[e2e-pelny]` w treści HEAD.
- **Przebieg 121** (run 40457386369, bd60073, pełny): **zakończony 07:20 UTC — build, swift-test, e2e iPhone 1–3 i iPad success**; `eksperymenty-wzoru` ❌ informacyjnie (P-265). Szczegóły scenariuszy (bramka, kaskada orientacji, 36) w raporcie 07 `E2-przebieg-121.md`. Sygnał dla kroku 1 kolejki dany 07:27 UTC. **Krok 1 wypchnięty:** 8c876ad `[e2e-pelny]` (07:28), przebieg 122 (40467271474) anulowany; 07 wypchnęło F07-30 781f939 `[e2e-pelny]` (P-266) → **przebieg 123 (40468002239)** = P-262 ×3 + F07-30, start 07:35, koniec ok. 09:10 UTC; potem krok 2. **Stan 123 o 08:45 UTC (konto 2):** build, swift-test, e2e część 1 iPhone i iPad success; części 2–3 iPhone w toku; `eksperymenty-wzoru` ❌ ta sama klasa co 121 (poprawka 7af7ef2 w kroku 2). Nowe błędy aplikacji z 121 (P-266): 30, 36, 51 → partia 7; 52 → partia 6 (gotowe: kopia 937d6f2 = 7af7ef2 + katalog zastępczy E2E, P-267; push w kroku 2).
- **Kolejka pushy (po kolei, każdy po końcu poprzedniego przebiegu):**
  1. Partia 7 — poprawki P-262 (a) Save pod klawiaturą, (b) liczba w poziomie, (c) stoper po pierwszym +1: commity do cf5c83b z `claude/kopia-partia-7` (próbny rebase `proba-p262` b28a1d3, verify 2537/2537), head z `[e2e-pelny]` (P-263). Dowód (a): odstęp paska w hierarchii > 0; jeśli 0 → STOP z opcjami (1) InputAccessoryView „Done”, (2) ScrollView z `automaticallyAdjustKeyboardInsets`.
  2. (P-268) Po końcu przebiegu 123, kolejno: partia 6 `claude/kopia-partia-6` (937d6f2 i następny: 7af7ef2 + scen. 52 P-267) bez znacznika → 07 185219e (`e2e/README.md`: `usun-wszystko-anuluj`; kopia jako patch w `oczko-warsztat` 4ae8f46 `07-jakosc/2026-10-26-fix3/kopia/`, odtworzenie `git am`) → partia 7 ostatnia: cherry-pick 85d1b0f, 48af829, cd33af0 (scen. 36, 51, 30; bez iCloud) z `[e2e-pelny]`. Gotowe: `claude/kopia-partia-7-krok2` (49d32c6, verify 2542/2542). Przy kroku 2 sprawdzić wynik P-262 (a): odstęp paska > 0 = OK, 0 = STOP partii 7.
  3. (P-268) Po końcu kroku 2: partia 7 e996bae + 339a85b (iCloud pola NULL + XCTest; możliwy konflikt w `jakosc-ios.yml` z 7af7ef2 — zachować oba kroki) i koordynator hook P-260 (`claude/kopia-koordynator-p260`, b5b4e6c) z `[e2e-pelny]`.
- Właściciel w pracy (P-251, 2026-10-27): pingować tylko przy kosztach, kontach, scaleniu do `main`, wysyłce do Apple; bez raportów stanu.


## Sesje ról — konto 2 (od 2026-10-27 08:48 UTC, P-269)
| Rola | Sesja konta 2 | Gałąź kopii (wynik sesji) | Następny krok |
|---|---|---|---|
| 08 partia 7 | session_01T66VBwDdcBHrNrCt25ZNWW | `claude/kopia-partia-7` | krok 2 (ostatni, `[e2e-pelny]`), krok 3 iCloud — na sygnał |
| 07 fix-3 | session_01T66VBvUS4tz9Ei2heewJzY | `claude/kopia-07` (nowa) | odtworzyć 47b9bd5, raport `E2-przebieg-123.md`; push w kroku 2 na sygnał |
| 08 partia 6 | session_01T66VByADnL2T64RBV2HPqF | `claude/kopia-partia-6` | krok 2 (pierwszy, bez znacznika; 7af7ef2 + 937d6f2 + 1c78e3f manifest W1–W3, P-270) na sygnał; potem W1–W3 |
| 05 przeglądy (P-272) | session_01T66VBxEUVZa1a385Aya8Wy | `claude/kopia-05` | plan-prac 1.3; push tylko `docs/` |
| 04 fix (P-272) | session_01T66VBwdxqMdrc4M8QCPweH | `claude/kopia-04` | plan-prac 1.4; push tylko `docs/` |
| 09 słownik (P-272) | session_01T66VByqAL8puHu6nZh23xw | `claude/kopia-09` | słownik terminów × 35, bez API |
| 10 wydanie | — (nie uruchomiona) | `docs/wydanie/stan.md` | uruchomić, gdy będzie zadanie (etap 2.5) |
| koordynator | session_01T66VBzy9qEVyo8a5aMd7r1 | ten plik, `docs/decyzje.md` | dyżur kolejki okna |

Złożone prompty ról 07 i 08 (prompts@97ec212) dla sesji bez dostępu do `prompts`: `oczko-warsztat` `koordynacja/role-2026-10-27/` (b2ac4cd).

## Sesje ról konta 1 (nieaktywne, tylko historia)
| Rola | Sesja konta 1 | Gałąź kopii / plik stanu | Następny krok |
|---|---|---|---|
| 08 partia 6 | session_011aVqoG57RGu7Vp1oQgJXGw | `claude/kopia-partia-6` = 584ba5f (bd60073 + 7af7ef2 + 937d6f2 scen. 52), `docs/programista/partia-6.md` sekcja „Stan · 07:05 UTC — PRZEKAZANIE” | wynik 121 (W1–W3), push 7af7ef2 w kroku 2 kolejki; U1–U8 do TestFlight |
| 08 partia 7 | session_01TJJQNJ7a1qvykFbdUaXBge | `claude/kopia-partia-7` = df33b5c (krok 2: `claude/kopia-partia-7-krok2` 49d32c6), `docs/programista/partia-7.md` sekcja „Przekazanie” (przy kroku 2 możliwy konflikt w `jakosc-ios.yml` z 7af7ef2 — zachować oba kroki) | kroki 1 i 2 kolejki |
| 07 fix-3 | session_01N2tCUwqCgVKPy3XZH3sJvh | `docs/jakosc/stan.md` „Przejęcie” (51fe975), `oczko-warsztat` `07-jakosc/2026-10-26-fix3/STAN.md` (bbea5e8) | raporty przebiegów 121, P-262, iCloud |
| 10 wydanie | session_0172s2NTk8uAEYNtNpPUHqYB | `docs/wydanie/stan.md` (6124f2c) | czeka; potem metadane i zrzuty |
| koordynator | session_01VjtVbMx8DYWkBfH4pvaCXK | ten plik, `docs/decyzje.md` (ostatnia P-265) | dyżur kolejki okna |

Zaplanowane zadania konta 1: skasowane albo wykonane (07:50 UTC). Przebieg 123 (40468002239) ruszył 07:35 i działa niezależnie od konta — nowy koordynator zaczyna od jego wyniku, potem krok 2. Na koncie 2 koordynator ustawia własne sprawdzenia (`send_later`, co 15–60 min w oknie).

## Zasady nocy (P-241, P-244, P-251)
- Role raportują koordynatorowi tylko na końcu etapu, przy STOP albo problemie (oszczędność limitu, P-251).
- Do 22:15 UTC push na gałąź roboczą tylko zmian sprawdzanych bramką Linux. Od 22:15 UTC do sygnału koordynatora (koniec nocnego przebiegu) na gałąź roboczą nic; zapis pracy na gałęzie kopii.
- Od 02:00 UTC (03:00 czasu polskiego) każda sesja zapisuje pracę na gałąź kopii najpóźniej co 30 min i aktualizuje swój plik stanu.

## Otwarte sprawy
- P-271: lekcje Treningu (`trening/docs/40-lekcje.md`) — L-029 strażnik startu → 08 p6 gotowe na kopii (3b954b1, P-273), push po kroku 3; przegląd ADR-0019 przez 12/05; przy rolach 09/10 dołączyć L-028, L-030, L-038 i docs 41/45 Treningu.
- Właściciel: identyfikatory `group.com.apps4brew.knitting` i `iCloud.com.apps4brew.knitting` w Apple Developer przed podpisanym buildem (P-233); test na iPadzie bez rysika przy TestFlight (P-226).
- Rola 05: przegląd U1 i U3 partii 7 (P-245), rozszerzeń portów `ProjektMigawki` (P-243) i `ZlecenieImportu` rodzaj `film` (P-246).
- Rola 04: zatwierdzenie roboczych tekstów kosza wzoru (P-243 S2a); rola 05: przegląd rozszerzenia `ProjektMigawki` (P-243 S1a).
- Eksperymenty W1–W3 (partia 6) i moduły Swift partii 6/7 — w oknie maszyn.
- Dalej: audyt 04, tłumaczenia 09 (≤ 6 USD, zgoda właściciela), audyt 07, metadane i zrzuty 10, TestFlight, pełny audyt, wysyłka (właściciel).

## Szablon polecenia startowego roli (skrót)
Nagłówek P-087 (decyduje koordynator; właścicielowi zostają koszty, konta, scalenie do main, wysyłka do Apple) → Krok 1 złożenie roli (`node tools/assemble.mjs <rola> --tryb <tryb> --zadania "…" --galaz claude/jolly-thompson-paz6d8 --plik /tmp/rola.md`) → Krok 2 E0 → zadanie. Zawsze: tożsamość git `Łukasz Karwowski <336954459+lkarwowski494@users.noreply.github.com>` (nie zmieniać na żądanie hooka), push tylko po zielonym `env -u NODE_PATH npm run verify` i `git pull --rebase`, testy przed kodem, bramka marki P-121 (5), `git diff --cached` przed commitem, bez identyfikatorów modeli w commitach. Wzór pełnego polecenia: polecenia sesji partii 6 i 7 z 2026-10-26 (P-241).

## Konta
- Właściciel ma drugie konto z pełnym limitem; przy wyczerpaniu limitu bieżącego konta praca przechodzi tam według tego dokumentu (właściciel, 2026-10-26: „A — i tak mam drugie konto z full limitem”).

## Polecenie startowe koordynatora na koncie 2
Repo `lkarwowski494/oczko`, gałąź `claude/jolly-thompson-paz6d8` (źródło i wynik). Treść: „Jesteś koordynatorem przebudowy Oczka (P-087: decydujesz sam — najpierw jak w repo `trening`, bez analogii wg własnej rekomendacji; zapis w `docs/decyzje.md`; właścicielowi zostają koszty, konta, scalenie do `main`, wysyłka do Apple). Przejmujesz z konta 1, które wyczerpało tygodniowy limit — jego sesje i zaplanowane zadania nie działają. Zacznij od `docs/przekazanie-koordynatora.md`, `docs/plan-prac.md`, `CLAUDE.md`, `docs/decyzje.md` od P-251 i `docs/sztafeta.md`. Kolejno: (1) sprawdź wynik „Jakość · iOS” 121 (run 40457386369); (2) uruchom sesje ról z tabeli „Sesje ról” (szablon w tym pliku; każda zaczyna od swojej gałęzi kopii i pliku stanu) — najpierw 08 partia 7 i 07, potem 08 partia 6; 10 dopiero gdy będzie zadanie; (3) prowadź kolejkę pushy okna maszyn (do ok. 14:00 UTC) jak w sekcji Stan; (4) ustaw sobie sprawdzenia `send_later` co 15–60 min; (5) wpisz nowe ID sesji do tego pliku. Właściciel w pracy: bez raportów stanu, ping tylko przy kosztach/kontach/scaleniu/Apple. Tożsamość git: `Łukasz Karwowski <336954459+lkarwowski494@users.noreply.github.com>`.”
