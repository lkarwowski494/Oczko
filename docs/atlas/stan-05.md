# Stan: atlas technik 1.1 — rola 05, build

- Rola i tryb: 05-architekt, build (atlas technik 1.1; P-093 (2), P-095, P-178, P-179, P-192, P-201)
- Prompt: `prompts` @97ec212, `node tools/assemble.mjs 05-architekt --tryb build --galaz claude/jolly-thompson-paz6d8` (70 691 znaków; nie w repo)
- Sesja: „Oczko 1.1 · 05-architekt build (silnik rysunków SVG atlasu i model danych)”; koordynator: sesja „Main: Oczko”
- Plik `docs/atlas/stan.md` należy do roli 06 (treść); ten plik to stan roli 05.
- Etap: **STOP E1** (2026-10-26) — `docs/atlas/e1-decyzje.md`; E0: P-201 (Q1a; Q2, Q3 u właściciela, domyślnie (a))
- ADR: 0022 (proponowana), 0023 (proponowana), 0024 (przyjęta, P-201), 0025 (proponowana, warunkowa Q2/Q3); ADR-0016 uzupełnienie
- Prototyp: `scripts/atlas/` (silnik, generator, testy 29/29), `docs/atlas/prototyp/` (karty, SVG, PNG)
- Kontrakt dla 06: `docs/atlas/kontrakt-krokow.md` (wersja 0.1)
- Kopie źródeł: `oczko-warsztat/05-architekt/2026-10-26-atlas/zrodla/`
- Następny krok: po odpowiedzi na E1-Q1, E1-Q2 → E2 (walidator i schemat, fazy z drutem, glify cyfr, generator strony z testem hreflang, granice modułów, tabela ścieżek utraty danych)
- Kwarantanna (CLAUDE.md): `app/`, `src/` bez zmian
