# Dane atlasu technik — **przed weryfikacją E3**

Kopia z repo treści roli 06 (P-212, 2026-10-26): `katalog.json` (karty i kroki rysunku według `docs/atlas/kontrakt-krokow.md` w. 0.1) i `en.json` (teksty en-US pod kluczami `atlas.<id>.<pole>`). Źródłem prawdy jest repo treści; ten plik nadpisuje rola 06 po każdej zmianie. *Dlaczego kopia:* rola 05 testuje silnik rysunków na prawdziwych kartach przed weryfikacją E3.

- **Status: przed weryfikacją E3** — treść może się zmienić po werdyktach weryfikatora; nie publikować.
- ID twierdzeń (`ATL-*`, `TRM-*`) wskazują rejestr roli 06, który zostaje prywatny (P-108 (3)). Treści rejestru, cytatów i nazw źródeł tu nie ma; jedyna linia źródła to `atlas.tabela.linia_standardu` (P-112 (1)).
- Pola `rozszerzenie_06*` to dane spoza wersji 0.1 kontraktu (pytania 06 nr 1–6 w kontrakcie); `faza_opis` opisuje słownie ruch nici dla oceny 05.
- `publikacja: "po-generatorze"` — nabieranie oczek: dane gotowe, publikacja po ocenie generatora (P-200 Q1a).
