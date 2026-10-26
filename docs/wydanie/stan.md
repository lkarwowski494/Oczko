# Rola 10 (wydanie) — plik stanu
Aktualizacja: 2026-10-26 · tryb build · prompt `prompts@97ec212` (`10-wydanie --tryb build`, 57409 znaków, scratchpad, niecommitowany)

- **Etap:** STOP E2 przyjęty (P-206, koordynator wg P-087: klucz API Admin jak Trening; recenzent do zakupu przez Ustawienia → oferty — potwierdzi 08, dopisać do notatki po przeglądzie zakresu; zasada „push tylko po zielonym verify”). Sesja czeka na przegląd zakresu albo sygnał koordynatora. E0+E1: `e0-e1.md`, odpowiedź koordynatora P-196 (D3a–D9a; D1, D2 u właściciela).
- **Zrobione:** `site/` PL/EN; `adres-strony.json` (jedna stała, test z `ADRESY.polityka`); `testflight.yml` według ADR-0014; `scripts/wydanie/` (bramka, numer, API, kontrola `.ipa`, walidacja); `sklep.md` (sekrety, kroki App Store Connect, nazwy, formularze, notatka); `dziennik.md` (pusty); `metadane/nazwy.store.json`.
- **Nic nie uruchomiono** (P-187), nic nie wysłano, żadnych sekretów.
- **P-219:** D1 repo „oczko” (adres /oczko/ bez zmian), D2 Pages z gałęzi roboczej dozwolone; `pages.yml` jak Trening (v5/v4), kroki właściciela `sklep.md` §2a. Pages uruchamiam po potwierdzeniu nowej nazwy przez koordynatora, potem `curl` na adresy.
- **Pages (2026-10-26):** wdrożone (przebieg 40366704274), strona żyje pod `lkarwowski494.github.io/oczko/` (200); `apps4brew.com/oczko/` → 404, bo domena jest w repo `apps4brew-www` (Trening: `apps4brew-www/trening/`, w aplikacji `apps4brew.com/trening/privacy.html`). STOP: D10 do koordynatora.
- **Czeka:** przegląd zakresu 27–28.10 → opisy, zrzuty, ścieżki w notatce; raport 07 → E3; pierwszy przebieg dowodowy `bez_wysylki` za zgodą w oknie macOS.
- **Następny krok po akceptacji:** po D1/D2 — potwierdzenie adresu po wdrożeniu Pages; po przeglądzie zakresu — E2 metadane (opisy, słowa, zrzuty) i notatka ze ścieżkami.
