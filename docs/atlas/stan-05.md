# Stan: atlas technik 1.1 — rola 05, build

- Rola i tryb: 05-architekt, build (atlas technik 1.1; P-093 (2), P-095, P-178, P-179, P-192, P-201, P-207)
- Prompt: `prompts` @97ec212, `node tools/assemble.mjs 05-architekt --tryb build --galaz claude/jolly-thompson-paz6d8` (70 691 znaków; nie w repo)
- Sesja: „Oczko 1.1 · 05-architekt build (silnik rysunków SVG atlasu i model danych)”; koordynator: sesja „Main: Oczko”
- Plik `docs/atlas/stan.md` należy do roli 06 (treść); ten plik to stan roli 05.
- Etap: **STOP E2** (2026-10-26) — `docs/atlas/e2-moduly-dane.md`; E0: P-201 (Q1a; Q2, Q3 u właściciela, domyślnie (a)); E1: P-207 (E1-Q1a, E1-Q2 po danych 06)
- ADR: 0022 (proponowana), 0023 (proponowana), 0024 (przyjęta, P-201), 0025 (proponowana, warunkowa Q2/Q3); ADR-0016 uzupełnienie
- Kod: `scripts/atlas/` (silnik: geometria, typy, siatka-petli, kontrakt, katalog, svg, sprawdz, strona; CLI: generuj, waliduj, strona; testy 86/86), `docs/atlas/prototyp/` (3 karty z ID 06, 5 SVG, 2 PNG), `docs/atlas/katalog.schema.json`, `docs/atlas/eksperymenty/`
- Kontrakt dla 06: `docs/atlas/kontrakt-krokow.md` (**wersja 1, wiąże**; odpowiedzi na pytania 06 nr 1–6)
- Kopie źródeł: `oczko-warsztat/05-architekt/2026-10-26-atlas/zrodla/`
- Następny krok: po odpowiedzi na E2-Q1 → E3 (błędy, prywatność — brak danych, budżety: rozmiar paczki i strony, czas modelu na urządzeniu z metodą; lista kontroli dla 07), potem E4 (README atlasu, przekazanie)
- Kwarantanna (CLAUDE.md): `app/`, `src/` bez zmian
