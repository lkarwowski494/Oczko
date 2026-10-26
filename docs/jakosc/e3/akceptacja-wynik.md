# Testy akceptacyjne: stan przed kodem
Wygenerowano: 2026-10-26T16:36:02.572Z · `node scripts/jakosc/akceptacja-raport.mjs`

Razem 3: asercja 2, zielony-ok 1; błędy raportu: 0.

| Plik | Test | Stan | Fragment wyniku |
|---|---|---|---|
| tests/akceptacja/ekrany/p202-stan-danych-korekta.test.tsx | P-202: przekazanie 01 (BR-DAN-011/S3, BR-PRJ-013/S4) › BR-DAN-011/S3: ostatni kontakt z zegarkiem 2 godziny temu → czas kontaktu widoczny, bez liczby zmian na zegarku | asercja |  |
| tests/akceptacja/ekrany/p202-stan-danych-korekta.test.tsx | P-202: przekazanie 01 (BR-DAN-011/S3, BR-PRJ-013/S4) › BR-PRJ-013/S4: sesja z 15 min pauzy → arkusz korekty mówi przed zapisem, że czas liczy się od początku do końca | asercja |  |
| tests/akceptacja/ekrany/p202-stan-danych-korekta.test.tsx | P-202: przekazanie 01 (BR-DAN-011/S3, BR-PRJ-013/S4) › BR-PRJ-013/S4: sesja bez pauz → bez tej informacji [ZIELONY-OK: kontrola, że informacja nie jest stała] | zielony-ok |  |
