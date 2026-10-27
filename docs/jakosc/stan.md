# Stan roli 07-jakosc — fix-3 NZ-P5-07 (2026-10-26)
## Przejęcie (P-244: inna sesja, także na innym koncie, startuje tylko z tego pliku) — stan 2026-10-26 ~20:00 UTC
- **Rola i tryb:** 07-jakosc, `fix`, zadanie NZ-P5-07 (+ przekazania P-197, P-202, P-224–P-237). Prompt: sklonuj prywatne `lkarwowski494/prompts` (add_repo), `git checkout 97ec212`, `node tools/assemble.mjs 07-jakosc --tryb fix --zadania NZ-P5-07 --galaz claude/jolly-thompson-paz6d8 --plik <scratchpad>/07-fix3.md` (64 343 znaków); przeczytaj w całości. Decyzje: koordynator (P-087); **od P-251 koordynator to sesja `session_01VjtVbMx8DYWkBfH4pvaCXK`** — raporty tylko tam i tylko na końcu etapu, przy STOP albo problemie; odpowiedzi zapisuj „koordynator wg P-087”.
- **Gotowe i wypchnięte (E1):** F07-14…F07-25, P-250 93fb215 (scenariusz 49: wybór wersji po testID `icloud-konflikt-wybor-0|1` + etykieta „Keep … rows from …”) (commity w wierszach niżej i w `docs/jakosc/fix-3-2026-10-26.md` §6); ostatnie `verify` 2481/2481 na 93fb215. Kod aplikacji nietknięty przez 07.
- **Blokada P-241:** od 22:15 UTC do sygnału koordynatora **nie pushuj kodu** (`e2e/**`, `scripts/ci/**`, `.github/**`, `tests/**`) — push anuluje nocny przebieg „Jakość · iOS”. Wolno pushować tylko `docs/` (P-244: nie uruchamia CI iOS).
- **E2 fix-3: STOP (2026-10-27)** — przebieg 40411351211: bramka 9/9; dowody `oczko-warsztat/07-jakosc/2026-10-26-fix3/E2-dowody.md` (79129a9, `sprawdz-raport` OK): 23 porażki = scenariusz (menu/nazwa/stoper przed pierwszym +1, design-spec:138), 33/39/51/16/28/43 = scenariusz, **10, 40, 41, 31 = kod 08** (Save pod klawiaturą numeryczną; crash `NumberFormat.formatToParts` w Hermesie; brak panelu `e2e-pomiar-plus`). Poprawki scenariuszy: **F07-26 fa109b0 — commit lokalny, push `e2e/**` po sygnale koordynatora** (jeśli sesja padnie: odtwórz z opisu w E2-dowody §2 albo `git cherry-pick` z lokalnej kopii, jeśli istnieje). **STOP E2 przyjęty (P-255).** Lokalnie dwa commity do pushu po sygnale (kolejność okna: partia 7 → partia 6 → 07, treść commitu z `[e2e-pelny]`): F07-26 i P-255 (ukończenie bez potwierdzenia: 28, 43, wiersz `ukonczenie-potwierdz` usunięty). Błędy kodu P1 → 08 partia 7. 33 i 36 → `podstawowy` po pierwszym zielonym.
- **Poprzedni plan kroku E2 (zrobione):** gdy koordynator poda wynik nocnego przebiegu „Jakość · iOS” (pakiet pełny z `[e2e-pelny]`, macierz iphone 1–3 + ipad 1):
  1. pobierz artefakty `e2e-czesc-<n>-<urzadzenie>` (zip) i podsumowanie kroków; każdą porażkę sklasyfikuj: aplikacja / scenariusz / maszyna (strategia „Polityka niestabilnych testów”; awaria przed pierwszym scenariuszem albo brak runnera = maszyna, jedno ponowienie ręczne; scenariuszy `stan-licznika` nie ponawiamy);
  2. bramka: tylko scenariusze `podstawowy` (01–09) na iPhonie muszą być zielone (F07-15); 09 ma nową własność N12-11 (F07-19, niepusty WAL) — fałszywa czerwień z zapisu przy wejściu do Ustawień = „scenariusz”;
  3. 16, 17, 28, 33–52: czerwień oczekiwana do kodu 08 (B, D, W, R, I) — wypisz krok, który padł, dla 08;
  4. raport `oczko-warsztat/07-jakosc/2026-10-26-fix3/E2-dowody.md` (repo prywatne, zapis na `main`, P-010): dla każdego F07-nn test, wynik przed/po, commit; kontrola dowodów `sprawdz-raport.mjs` z promptu (kopia w scratchpadzie); STOP E2 wiadomością do koordynatora.
- **Po STOP E2 (osobne commity, poza blokadą):** 33 i 36 → tag `podstawowy` po ich pierwszym zielonym przebiegu (P-198 Q3a); po `wzor-znacznik` od 08 (P-237) — znacznik w scenariuszu 45; partia 7: testy wg `plan-partia-7-icloud.md` po kodzie 05/08.
- **Zasady środowiska:** przed pushem `git pull --rebase origin claude/jolly-thompson-paz6d8`, `npm ci` (08 dodaje pakiety), `env -u NODE_PATH npm run verify` kod 0; tożsamość git „Łukasz Karwowski <336954459+lkarwowski494@users.noreply.github.com>”; nowa nazwa innej firmy zatrzymuje `verify` (P-121 (5)); repo publiczne — bez sekretów.

Prompt: `prompts` @97ec212 (`node tools/assemble.mjs 07-jakosc --tryb fix --zadania NZ-P5-07 --galaz claude/jolly-thompson-paz6d8`; 64 343 znaków). Plan i pytania: `docs/jakosc/fix-3-2026-10-26.md`.
- E0 plan (przyjęty P-198, P-203) — przegląd wyjątków P-176, P-177, P-183, `WYLACZONE` (rola 12, c1d3a51), `test:akceptacja` (P-180): przyjęte, poprawki F07-16, F07-17; „Źródła wiedzy” zgodne z P-108/P-112, luka strażnika F07-14; bramka `[e2e-pelny]` F07-15 (P1); scenariusze 33–43 F07-18. Pytania Q1–Q7 do koordynatora (Q6, Q7 z P-197: N12-11 → F07-19, N-03 → F07-20).
- Wejście 855230e: `env -u NODE_PATH npm run verify` kod 0, 1974/1974; `test:akceptacja` kod 0 (3 testy).
- E0 przyjęty: **P-198** (koordynator wg P-087): Q1a–Q5a; push wszystkich commitów (także `e2e/**`, `jakosc-ios.yml`, `scripts/ci/**`) najpóźniej 22:30 UTC; listę testID grupy D wysłać koordynatorowi (dla 04). Q6, Q7 (P-197) — czekają.
- Przekazanie 01 (P-202): F07-21 31324a9 (granica dnia ze stoperem), F07-22 cca1ca9 (testy oczekujące BR-DAN-011/S3, BR-PRJ-013/S4; S2 zegarka w §9 strategii).
- Przekazanie 01 fix-6 (P-224): plan testów iPada i przeglądu OG-07 na partię 6 — `docs/jakosc/plan-partia-6-ipad.md`, decyzja P-225 (Q1a, Q2 a+c, Q3c); scenariusze po „Dla 08” 04 fix-7.
- P-229: testID grup R i I w `e2e/README.md`; plan partii 7 (iCloud, „Udostępnij do Oczka”) — `docs/jakosc/plan-partia-7-icloud.md`, Q1–Q2 do koordynatora.
- Partie 6 i 7 (P-229, P-230, P-233): F07-23 d4c19b1 (kontrola ATRAPA-ICLOUD), F07-24 + F07-25 0956131 (macierz e2e iphone/ipad, scenariusze 44–52 w pełnym pakiecie). Zgłoszenia rozstrzygnięte P-237: `oczkoE2eSzerokoscOkna` i testID `wzor-znacznik` — 08 w partii 6 (wtedy 07 dopisuje znacznik do scenariusza 45); JAK-15 .ipa — rola 10; arkusz rozszerzenia — lista urządzenia.
- E1: F07-15 (bramka w pakiecie pełnym), F07-14 (strażnik nazw źródeł: tylko klucz `zrodla.linia_standardow`), F07-16 (pusty `test:akceptacja` tylko przy katalogu bez plików testów), F07-17 (kontrakt testID B i D z 04 fix-6; scenariusze 16, 17, 28), F07-18 (scenariusze 33–43 w pakiecie pełnym) — zrobione. F07-20 (linie inwentarza kryteriów, `--check` w `jakosc:kontrole`) — zrobione (P-203 Q7a). F07-19 (P-203 Q6a) nałożone po kodzie 08 bd0b1f0 („Zapisz kopię” tylko do odczytu, panel SHA ukryty w trakcie liczenia); bez niego scenariusz 09 zostaje na poranne okno. E2 po nocnym przebiegu iOS.

# Stan roli 07-jakosc — fix-2 NZ-08-P2-07 (2026-10-26)
Prompt: `prompts` @97ec212 (`node tools/assemble.mjs 07-jakosc --tryb fix --zadania NZ-08-P2-07 --galaz claude/jolly-thompson-paz6d8`; 64 346 znaków). Plan i pytania: `docs/jakosc/fix-2-2026-10-26.md`.
- E0 plan: przyjęty (P-125: Q1a–Q3a; F07-11 i F07-12 w tej sesji). Przegląd 12 zmian i 5 testów 08: zgodne, 2 luki (F07-11, F07-12).
- E1: F07-10…F07-13 naprawione-do-weryfikacji, commity 5ab8a12, f1ad9c7, 5928b7a, d99245e (jeden na ID).
- E2 dowody: **STOP** — `oczko-warsztat/07-jakosc/2026-10-26-fix2/E2-dowody.md`. Wejście a33d1fb: verify 1445/1445; wyjście d99245e: verify 1449/1449.
- Następny krok: decyzja koordynatora o E2; zgłoszenia dla 05, 08, 07 audit w E2-dowody §4.

# Stan roli 07-jakosc — fix NZ-08-P1-07 (2026-10-25)
Prompt: `prompts` @97ec212 (`node tools/assemble.mjs 07-jakosc --tryb fix --zadania NZ-08-P1-07 --galaz claude/jolly-thompson-paz6d8`; 64 346 znaków). Plan i pytania: `docs/jakosc/fix-2026-10-25.md`.
- E0 plan: przyjęty (P-117: Q1a–Q6a). E1: F07-01…F07-09 naprawione-do-weryfikacji, commity dcb3d2e…91f7e64 (jeden na ID; F07-06 w dwóch: skrypt, potem bramka po zielonym CI).
- E2 dowody: **STOP** — `oczko-warsztat/07-jakosc/2026-10-25-fix/E2-dowody.md` (`sprawdz-raport` OK). Wejście 9ea0b80: verify 1278/1278; wyjście 91f7e64: verify 1323/1323.
- Nowe kontrole w `jakosc:kontrole`: `licencje.mjs`, `mutanty-e1.mjs`, `tabela-08.mjs --check`; w testach: `tests/jakosc/marki.test.ts` (zapadka nazw, P-107), `tests/wydanie/repo-wydanie.test.ts` (wyjątek roli 10).
- Następny krok: decyzja koordynatora o E2; zgłoszenia dla 05, 08, 10, 07 audit w E2-dowody §„Zgłoszenia”.

# Stan roli 07-jakosc (build)
Aktualizacja: 2026-10-25 · Gałąź `claude/jolly-thompson-paz6d8` · Prompt: `prompts` @97ec212 (`node tools/assemble.mjs 07-jakosc --tryb build --galaz claude/jolly-thompson-paz6d8`; moduły e2e-mobilne, geo-slady, wlasnosci-i-domena, wydanie; 64 487 znaków)

| Etap | Stan | Artefakt |
|---|---|---|
| E0 rozpoznanie | przyjęte (P-090: Q1a, Q2a, Q3a) | `docs/jakosc/e0-rozpoznanie.md`, `docs/jakosc/e0/` |
| E1 rejestr ryzyk | przyjęte (P-091) | `docs/jakosc/e1-raport.md`, `e1-ryzyka.md`, `e1/` |
| E2 plan testów | przyjęte (P-092) | `docs/jakosc/strategia.md` |
| E3 testy akceptacyjne, CI | przyjęte (P-096) | `docs/jakosc/e3-raport.md`, `strategia.md` §9 |
| E4 przekazanie do 08 | przyjęte (koordynator wg P-087, 2026-10-25) — rola 07 build zakończona | `docs/jakosc/e4-przekazanie.md`, `e4/tabela-08.md` |

Następny krok: krok porównania z kodem (03 audit, P-078) i sesja fix 01/02/05 (P-091 11a, P-096), potem 08 build. Paczka: `docs/jakosc/e4-przekazanie.md`.
Stan testów na wejściu: `npx jest` 956/956 (kod 0), typecheck kod 0, `granice.mjs src` kod 1 (13 naruszeń w kodzie 0.1.0).
