# Oczko — plan wejścia do App Store (stan 2026-10-25)

Autor: koordynator (sesja „Main: Oczko”), według P-002 (kolejność ról), P-087 (decyzje koordynatora) i wzorca Treningu (`trening/docs/48-zgloszenie-1-0.md`, gałąź `zgloszenie-1-0-materialy`, odczyt 25.10.2026).
Czasy to **[OCENA]**: „agent” = praca agentów, „kalendarz” = z czekaniem na CI, Apple i limit tygodniowy konta, „właściciel” = Twój czas.

## Stan wyjściowy
- Zrobione: bramka opłacalności, BRD (84 BR), model V4 (P-057), kontrakt zakresu (49 funkcji MVP), projekt UX i marka, architektura (ADR 0001–0021), mechanizm i18n, niezawodność E0–E1, treści (103/103 twierdzeń POPARTE, P-088).
- Testy na `claude/jolly-thompson-paz6d8`: `npx jest` 956/956 (25.10.2026).
- Konto Apple (wspólne z Treningiem, według `trening/docs/48`): zgłoszenie do Small Business Program 14.10.2026, status tradera (DSA) zweryfikowany 20.10.2026. Rekord Oczka w App Store Connect istnieje (stara wersja 0.1.0, build 1004 w TestFlight).

## Kroki do zgłoszenia

| # | Krok | Kto | Agent | Kalendarz | Właściciel |
|---|---|---|---|---|---|
| 1 | 07-jakość build: strategia testów, testy akceptacyjne czerwone przed kodem, CI (wzór Treningu: podział E2E, ponawianie macOS, podpis bez nowego certyfikatu) | rola 07 | 0,5–1 dnia | 1–2 dni | 0 |
| 2 | Porównanie z istniejącym kodem (03 audit, P-078): co z kodu 0.1.0 zostaje, co od nowa | rola 03 | 0,5 dnia | 1 dzień | 0 |
| 3 | **08 programista partiami**: 49 funkcji MVP, zegarek, widżet/Live Activity, synchronizacja iCloud, limit V4 i zakupy | rola 08 | 6–10 dni | **2–3 tygodnie** | 0 (decyzje: koordynator) |
| 4 | 04 audit (ekrany wobec wzorców) + poprawki | 04 → 08 | 1–1,5 dnia | 2–3 dni | 0 |
| 5 | 09 E2–E4: przekład na 35 języków (zestaw roli 06) | rola 09 | 1–2 dni | 2–4 dni | **zgoda na koszt**, jeśli przekład przez API jak w Treningu (tam limit 6 USD) |
| 6 | 12 E2–E3: kod strażnika startu, kopii i przywracania, ćwiczenia automatem | rola 12 | 1 dzień | 1–2 dni | 0 |
| 7 | 07 audit: jeden werdykt gotowości (próg: tylko KRYTYCZNE/WYSOKIE), naprawy blokerów; weryfikacja patentowa przed wydaniem (P-024) | 07 → 08 | 1–2 dni | 2–4 dni | 0 |
| 8 | 10 wydawca: metadane 35 języków, zrzuty, notatka dla recenzenta, workflow TestFlight (kopia z Treningu) | rola 10 | 1 dzień | 1–2 dni | wklejenie sekretów podpisu do repo Oczka (klucz API jak w Treningu) ok. 15 min |
| 9 | TestFlight wewnętrzny: build + lista kontrolna z telefonu + zakupy w piaskownicy | automat + Ty | — | 1 dzień | 45–75 min |
| 10 | TestFlight zewnętrzny: test gestu zegarka u ≥ 2 testerek z Apple Watch (nie masz zegarka) | testerki | — | przegląd bety ok. 1 dnia + ok. 1 tygodnia testów (równolegle z krokiem 11) | znalezienie 2 testerek |
| 11 | App Store Connect: produkty (3, Family Sharing — P-038), prywatność „Data Not Collected”, ocena wieku, kontakt dla recenzenta, build do wersji, „Submit for Review”, wydanie ręczne | Ty (agent przygotowuje każdy krok z adresem Apple) | 0,5 dnia | 1–2 dni | ok. 1–1,5 h w kilku podejściach |
| 12 | Przegląd Apple | Apple | — | **[OTWARTE]** (brak źródła na czas; ryzyko rundy przy 4.3(b)) | odpowiedź, jeśli Apple zapyta |
| — | Marketing (11): kręgi, ASO, plan startu — równolegle od kroku 3 | rola 11 | 1–2 dni | równolegle | zatwierdzenie szkiców |

**Razem: ok. 13–20 dni pracy agentów, 4–6 tygodni kalendarza.**
- Zgłoszenie do Apple: **realnie pierwsza połowa grudnia 2026**; optymistycznie ok. 20.11.2026; pesymistycznie druga połowa grudnia.
- Pierwszy TestFlight z nową wersją: po krokach 1–4, ok. 2,5–3,5 tygodnia od dziś (połowa listopada).

## Co może przesunąć termin (od największego)
1. **Limit tygodniowy konta Claude** (23.10 skończył się w 99%). Krok 3 to największe zużycie — kontrola limitu przed każdą partią.
2. **Zegarek i widżety w Expo** (niesprawdzony cel `watch` w narzędziu budowania, RYZ z ADR) — prototyp ryzyka na początku kroku 3; jeśli zawiedzie, zegarek przechodzi do 1.1 (decyzja koordynatora wg P-087, z zapisem).
3. **CI macOS** (kolejki wieczorami, E2E 30–40 min na przebieg).
4. **Przegląd Apple** (4.3(b), pierwsza runda pytań).
5. **Testerki z Apple Watch** — bez nich gest jest niesprawdzony; wtedy w opisie sklepu nie obiecujemy gestu.

## Co tylko Ty (wyjątki P-087)
- zgoda na koszt przekładu przez API (krok 5) albo wybór przekładu agentami (0 zł, dłużej);
- sekrety podpisu w repo Oczka (krok 8);
- testerki (krok 10);
- App Store Connect i „Submit for Review” (krok 11), wydanie po akceptacji;
- scalenie gałęzi roboczej do `main` przed buildem wydania.
