# Testy akceptacyjne: stan przed kodem
Wygenerowano: 2026-10-26T15:12:38.389Z · `node scripts/jakosc/akceptacja-raport.mjs`

Razem 3: asercja 2, zielony-ok 1; błędy raportu: 0.

| Plik | Test | Stan | Fragment wyniku |
|---|---|---|---|
| tests/akceptacja/dane/niezawodnosc-migracja-ponowna.test.ts | P-080 ADR-0021: migracja z przebudową nieudana w wersji N, poprawka w buildzie N+1 → migracja przechodzi, kopia sprzed pierwszej próby nietknięta | asercja | Error: expect(received).toEqual(expected) // deep equality |
| tests/akceptacja/ekrany/niezawodnosc-kamien.test.tsx | P-080 ADR-0019: pierwszy ekran rysuje się poprawnie → kamień milowy zapisany [ZIELONY-OK: kontrola, że atrapa ekranu działa] | zielony-ok |  |
| tests/akceptacja/ekrany/niezawodnosc-kamien.test.tsx | P-080 ADR-0019: render pierwszego ekranu rzuca wyjątek → kamień milowy NIE zapisany (następny start liczy ten jako nieudany) | asercja | Error: expect(jest.fn()).not.toHaveBeenCalled() |
