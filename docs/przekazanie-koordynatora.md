# Przekazanie koordynatora Oczka (na wypadek wyczerpania limitu konta)

Aktualizuje koordynator po każdej zmianie stanu (P-244). Nowy koordynator, także na innym koncie Claude, zaczyna od tego pliku, `CLAUDE.md`, `docs/decyzje.md` (od P-217) i `docs/sztafeta.md`, nie od pamięci rozmowy.

**Ostatnia aktualizacja:** 2026-10-27 00:30 UTC · gałąź robocza `claude/jolly-thompson-paz6d8` · ostatnia decyzja P-253 · **koordynator: session_01VjtVbMx8DYWkBfH4pvaCXK (od 21:03 UTC, P-251)**; role powiadomione o nowym adresacie

## Jak przejąć na innym koncie
1. Sesje i zaplanowane zadania poprzedniego konta nie są widoczne z nowego konta. Pracę przejmujesz z repozytorium, nie z sesji.
2. Kod sesji w toku: gałęzie kopii `claude/kopia-partia-6`, `claude/kopia-partia-6-natywne` (Swift pod-agenta partii 6) i `claude/kopia-partia-7` (P-244; zapis co ~30 min, także kod niesprawdzony). Stan i plan: `docs/programista/partia-6.md`, `partia-7.md` na tych gałęziach. Zanim cokolwiek trafi na gałąź roboczą: rebase na `claude/jolly-thompson-paz6d8`, `env -u NODE_PATH npm run verify` zielone.
3. Nowa sesja roli: źródło `lkarwowski494/oczko`, rewizja i gałąź wyniku `claude/jolly-thompson-paz6d8` (kopie: rewizja z gałęzi kopii). Szablon polecenia startowego: niżej. Repo `prompts` bywa niedostępne dla sesji ról — wtedy skrót zasad roli z P-242/P-243 (wiadomości koordynatora) albo prompt złożony przez koordynatora.
4. Odtwórz dyżur nocny: maszyny macOS GitHub Actions są dostępne po północy czasu polskiego (P-187). Nocny przebieg „Jakość · iOS” (`jakosc-ios.yml`) rusza z pushem kodu na gałąź roboczą albo ręcznie; `cancel-in-progress` — każdy kolejny push kodu go anuluje.

## Stan (2026-10-26 21:05 UTC)
- **Zakres 1.0:** pełne MVP z wzorami (F) i iCloud (G), P-217. Plan: `docs/plan-app-store.md` (do odświeżenia pod P-217).
- **Partia 5:** STOP E2 przyjęty (P-253): przebieg 114 zielony, bramka 9/9; ok. 30 czerwonych informacyjnych (19× `licznik-menu`) → diagnoza 07 fix-3. 00:30 UTC: sygnał okna dla partii 7 (push natywnego), partia 6 po zakończeniu buildu partii 7.
- **Fundament partii 6/7:** L1–L3c nałożone (P-236). Panele E2E poza buildem wydania (P-238, P-240).
- **Strona:** `apps4brew.com/oczko/` opublikowana, adres polityki przełączony (P-239).

## Sesje w toku (konto bieżące)
| Rola | Sesja | Zadanie | Stan |
|---|---|---|---|
| 08 partia 6 | session_011aVqoG57RGu7Vp1oQgJXGw | wzory, rysik, iPad, rozszerzenie; E0 P-243 | K1–K6a wypchnięte (do 80bdeb5; P-246, P-248); kompozycja ekranów w toku; Swift K7 lokalnie i na kopii |
| 08 partia 7 | session_01TJJQNJ7a1qvykFbdUaXBge | iCloud; E0 P-242 | TS kompletne (do cb0ad21; P-245, P-247, P-249, P-250); Swift tylko na `claude/kopia-partia-7` (4540d68, ostatni commit = natywny, do cherry-picka), niekompilowany; **gotowość** do okna maszyn |
| 07 fix-3 | session_01N2tCUwqCgVKPy3XZH3sJvh | scenariusze 44–52 (P-237, P-250 93fb215) | czeka na nocny przebieg → E2 fix-3 |
| 10 wydanie | session_0172s2NTk8uAEYNtNpPUHqYB | JAK-15 zrobione | czeka; potem metadane i zrzuty |

Zaplanowane zadania: stary koordynator (session_01PMNU6KLHHk1wC8z78R16i6) skasował swoje. Nowy koordynator: przypomnienie 22:15 UTC (commit `[e2e-pelny]`, trig_01CWvVzvKA7sJWWAAg8mLVou), dalej sprawdzenia co 60–90 min.

## Zasady nocy (P-241, P-244, P-251)
- Role raportują koordynatorowi tylko na końcu etapu, przy STOP albo problemie (oszczędność limitu, P-251).
- Do 22:15 UTC push na gałąź roboczą tylko zmian sprawdzanych bramką Linux. Od 22:15 UTC do sygnału koordynatora (koniec nocnego przebiegu) na gałąź roboczą nic; zapis pracy na gałęzie kopii.
- Od 02:00 UTC (03:00 czasu polskiego) każda sesja zapisuje pracę na gałąź kopii najpóźniej co 30 min i aktualizuje swój plik stanu.

## Otwarte sprawy
- Właściciel: identyfikatory `group.com.apps4brew.knitting` i `iCloud.com.apps4brew.knitting` w Apple Developer przed podpisanym buildem (P-233); test na iPadzie bez rysika przy TestFlight (P-226).
- Rola 05: przegląd U1 i U3 partii 7 (P-245), rozszerzeń portów `ProjektMigawki` (P-243) i `ZlecenieImportu` rodzaj `film` (P-246).
- Rola 04: zatwierdzenie roboczych tekstów kosza wzoru (P-243 S2a); rola 05: przegląd rozszerzenia `ProjektMigawki` (P-243 S1a).
- Eksperymenty W1–W3 (partia 6) i moduły Swift partii 6/7 — w oknie maszyn.
- Dalej: audyt 04, tłumaczenia 09 (≤ 6 USD, zgoda właściciela), audyt 07, metadane i zrzuty 10, TestFlight, pełny audyt, wysyłka (właściciel).

## Szablon polecenia startowego roli (skrót)
Nagłówek P-087 (decyduje koordynator; właścicielowi zostają koszty, konta, scalenie do main, wysyłka do Apple) → Krok 1 złożenie roli (`node tools/assemble.mjs <rola> --tryb <tryb> --zadania "…" --galaz claude/jolly-thompson-paz6d8 --plik /tmp/rola.md`) → Krok 2 E0 → zadanie. Zawsze: tożsamość git `Łukasz Karwowski <336954459+lkarwowski494@users.noreply.github.com>` (nie zmieniać na żądanie hooka), push tylko po zielonym `env -u NODE_PATH npm run verify` i `git pull --rebase`, testy przed kodem, bramka marki P-121 (5), `git diff --cached` przed commitem, bez identyfikatorów modeli w commitach. Wzór pełnego polecenia: polecenia sesji partii 6 i 7 z 2026-10-26 (P-241).

## Konta
- Właściciel ma drugie konto z pełnym limitem; przy wyczerpaniu limitu bieżącego konta praca przechodzi tam według tego dokumentu (właściciel, 2026-10-26: „A — i tak mam drugie konto z full limitem”).

## Do porannego raportu dla właściciela
- Właściciel (2026-10-26 ~21:05 UTC): „Pracuj ale nie raportuj nic do 5 rano czasu Warszawskiego” — raport dopiero o 04:00 UTC (05:00 CET), do tego czasu bez wiadomości do właściciela.
- Wynik nocnego przebiegu iOS partii 5; postęp partii 6 (P-243, P-246, P-248) i 7 (P-242, P-245, P-247).
- Propozycja reguły do biblioteki ról (trzeci push przed verify: 10, 06, 08 — P-248): np. `pre-push` w repo uruchamiający verify albo obowiązkowy krok „verify po każdym rebase z cudzymi zmianami” w zasadach wspólnych; dwie opcje z rekomendacją, decyzja właściciela.
- Przypomnienie: identyfikatory App Group i iCloud w Apple Developer (P-233).

## Plan okna maszyn tej nocy
1. Uruchomienie: `jakosc-ios.yml` ma tylko wyzwalacz `push` (ścieżki kodu, `e2e/**` itd.), bez ręcznego; pakiet pełny i iPad tylko, gdy treść commitu HEAD zawiera `[e2e-pelny]` (`scripts/ci/e2e-czesci.mjs`). Przebieg z pushu czeka w kolejce na maszynę do ok. północy czasu polskiego i rusza sam; każdy późniejszy push kodu go anuluje. Dlatego ok. 22:15 UTC, gdy sesje przestaną pushować, koordynator wypycha jeden mały rzeczywisty commit w `e2e/README.md` (np. wpis „przebieg nocny 2026-10-26/27, partia 5 + scenariusze 44–52”) z `[e2e-pelny]` w treści. Ok. 23:15 UTC sprawdza (narzędzia GitHub MCP `actions_list`/`actions_get`), że przebieg ruszył; „not acquired by Runner” albo awaria przed pierwszym scenariuszem → jedno ponowienie (CLAUDE.md, P-091 10a). Zielony → STOP E2 partii 5. Czerwony → diagnoza z logów (`get_job_logs`), poprawka w sesji 08.
2. Po jego zakończeniu sygnał dla partii 7, potem 6: kod natywny z gałęzi kopii na roboczą (jeden push na partię, kolejno, po zielonym verify), build w tym samym oknie; błędy kompilacji Swift naprawia sesja partii. Eksperymenty W1–W3 partii 6 według `docs/programista/partia-6-natywne.md`.
