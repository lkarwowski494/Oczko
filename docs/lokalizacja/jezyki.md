# Rejestr języków (rola 09, build, wejście wczesne E0–E1)
Decyzja: **P-075** (2026-10-22, „1a2a3b4a5b”; polityka „szeroka”: D-026, P-009) · Źródło: en · Utrzymanie: nowy tekst = klucz + kontekst + wszystkie języki albo wyjątek z datą (reguła obowiązuje od STOP E4; do wydania w danym sklepie 100%, NFR-JEZ-001)
Aktualizacja: 2026-10-22 · Zestaw: 35 lokalizacji ze wzorca „Trening”, `locales/`, odczyt 19.10.2026 (tej listy 09 nie otworzyła w źródle, tylko w prompcie; zob. ZAL-032).

Kolejność przeglądów rodzimych (przesiew 02, `docs/monetyzacja.md` „Przesiew storefrontów”): 1) en, 2) ja, 3) nb, 4) de, 5) fr, 6) nl, 7) sv, 8) da, 9) ko, es, ru, it, fi; pozostałe po nich.

| Język | Stan | Powód (dowód) | Metadane w App Store Connect (odczyt 2026-10-22) | Tłumaczenie | Drugi przegląd AI | Przegląd człowieka | Treści krytyczne | Zrzuty |
|---|---|---|---|---|---|---|---|---|
| en | planowany | język makiet 04 i listingu `en-US` (`monetyzacja.md`); rynek główny US | English (U.S.), (U.K.), (Canada), (Australia) | źródło albo maszynowe (pyt. 1) | — | — | — | — |
| ja, nb, de, fr, nl, sv, da, ko, es, ru, it, fi | planowany | kolejność przesiewu 02; wszystkie są w ASC | tak (nb = „Norwegian”; es = „Spanish (Spain)”) | maszynowe (E3) | — | — | — | — |
| pl | planowany | język właściciela | tak | maszynowe albo źródło (pyt. 1) | — | właściciel | — | — |
| cs, el, hr, hu, id, ms, pt, pt-BR, ro, sk, sl, tr, uk, vi, zh-Hant | planowany | „szeroka” | tak (pt-BR = „Portuguese (Brazil)”, pt = „Portuguese (Portugal)”, sl = „Slovenia”) | maszynowe (E3) | — | — | — | — |
| es-419 | planowany | „szeroka” | tylko „Spanish (Mexico)” (kod sklepu ≠ kod interfejsu) | maszynowe (E3) | — | — | — | — |
| bg, et, lt, lv, sr | planowany | „szeroka” | **brak** w liście ASC: tylko interfejs; strona sklepu po angielsku (kontrola (c)) | maszynowe (E3) | — | — | — | — |

Kontrole polityki „szeroka” ((a)–(e)) zostaną rozliczone w E3 i E4; w E0–E1 żaden język nie jest „w wydaniu”.
Wyjątki: `wyjatki.json` powstaje przy pierwszej uwadze skryptu (E1).

Stan na STOP E1: słownik źródłowy `en` (9 kluczy), `supportedLocales` = `CFBundleLocalizations` = `locales` = `en`; pozostałe języki dochodzą z falami E3. `pt` = Portugalia, `pt-BR` = Brazylia (nakładka na `pt`), jak w Treningu (P-076).
