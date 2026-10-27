# Stan: słownik terminów × 35 języków (rola 09, P-271, P-272)
Aktualizacja: 2026-10-27 · sesja session_01T66VByqAL8puHu6nZh23xw · gałąź `claude/kopia-09`

## Co i po co
Słownik terminów dziewiarskich i szydełkowych przed przekładem interfejsu (lekcja L-030 repo `trening`: przekład zdanie po zdaniu bez słownika dał kalki w 33 językach). Nie zależy od tekstów UI, które zmieni audyt 04 (P-272): pojęcia dziedziny zostają. Kluczy `src/i18n` nie zmieniam.

## Pliki
- `docs/lokalizacja/slownik-terminow.json` — jedno źródło (44 pojęcia × 35 języków; termin zalecany, zakazane z powodem, pewność, źródła z cytatem).
- `docs/lokalizacja/slownik-terminow.md` — generowany: `node docs/lokalizacja/narzedzia/slownik.mjs --md`.
- `docs/lokalizacja/narzedzia/slownik.mjs` — kontrola (kompletność, źródła, cytat przy pewności wysokiej, wzorce, termin vs własny zakaz) i strażnik `--slowniki <katalog>` (termin zakazany w przekładzie tekstu, którego en zawiera pojęcie).
- Rejestr źródeł (tytuły, adresy) i kopie surowych tekstów: `oczko-warsztat/09-lokalizacja/2026-10-27-slownik/` (prywatne); w tym repo tylko ID źródła (koordynator 2026-10-27, bramka marek P-121 (5)). Commit 163317f na `claude/kopia-09` zawiera jeszcze tytuły i adresy źródeł oraz autora `Claude` (poprawka historii wymaga force-push — nie wykonano); na gałąź roboczą idzie tylko stan oczyszczony.

## Stan
- [x] Lista 44 pojęć z inwentarza `src/i18n/slowniki/en.json` (719 kluczy) i `docs/tresci` (28 w interfejsie, 16 technik spoza interfejsu 1.0: atlas, treści 06).
- [x] en (CYC szczebel 1, TKGA, Stylecraft UK) i pl (Kurto-Dzikielewska, Guzowska, 450 ściegów RM, Barnden, DROPS — pojedyncze terminy).
- [ ] 33 języki: research źródeł w toku (6 grup).
- [ ] Scalenie, kontrola, raport do koordynatora.

## Otwarte
- Polecenie dla 07/08 (nie wykonane tu, P-272): strażnik w `tests/` wywołujący `slownik.mjs --slowniki src/i18n/slowniki` po falach E3.
