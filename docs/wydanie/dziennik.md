# Dziennik wydań Oczka (rola 10)
Każdy build i każde działanie zewnętrzne: wiersz ze słowami zgody właściciela i datą. Konfiguracja niczego nie wysyła sama.

| Data | Wersja | Build | SHA | Werdykt 07 | Kanał | Decyzje | Zgody właściciela (słowa, data) | Wynik |
|---|---|---|---|---|---|---|---|---|
| 2026-10-26 | — | — | b7fe657 | brak (strona, nie build) | GitHub Pages repo `oczko` | P-219 D1, D2 | koordynator wg P-087: „Uruchom Pages ręcznie na claude/jolly-thompson-paz6d8” (2026-10-26, po potwierdzeniu właściciela kroków §2a) | przebieg 40366704274: success. `curl`: `lkarwowski494.github.io/oczko/`, `/oczko/privacy.html` → 200; `apps4brew.com/oczko/`, `privacy.html`, `support.html` → 404. Przyczyna: apps4brew.com to osobne repo `apps4brew-www` z katalogami aplikacji (`trening/`), nie domena stron projektów — założenie E0 obalone |
| 2026-10-26 | — | — | f1b1e04 (apps4brew-www) | brak (strona, nie build) | apps4brew.com (repo apps4brew-www, projekt strony) | P-226, P-228, P-239 | właściciel: „ogarnijmy tą stronę” (2026-10-26); publikację wykonał projekt strony | `curl` 18:53:54 (projekt strony) i ponownie koordynator: `apps4brew.com/oczko/privacy.html`, `support.html` → 200. `ADRESY.polityka` i `adres-strony.json` przełączone na apps4brew.com/oczko/ |
