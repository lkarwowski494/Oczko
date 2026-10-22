# E1 Mechanizm (rola 09-lokalizacja, build, wejście wczesne) · 2026-10-22 · czeka na STOP E1
Decyzje wejściowe: P-075 (1a 2a 3b 4a 5b). ADR: [`0017`](../adr/0017-i18n-react-i18next-klucze-znaczeniowe-zrodlo-en.md) (proponowana), wiersz w [`0016`](../adr/0016-zaleznosci-wersji-1.md). Dowody: [`dowody/e1-czerwone.txt`](dowody/e1-czerwone.txt) (efe4ff8), [`dowody/e1-zielone.txt`](dowody/e1-zielone.txt).

## Co powstało
| Element | Plik |
|---|---|
| Zestaw 35 języków, dopasowanie języka systemu, łańcuch zastępczy, wybór (system/aplikacja) | `src/i18n/jezyki.ts` |
| Mechanizm: i18next + react-i18next, port `MagazynPreferencji`, zmiana języka w trakcie, odświeżenie po zmianie systemu | `src/i18n/i18n.ts` |
| Polyfille (`Intl.Locale`, `Intl.PluralRules` + dane 34 języków) i samosprawdzenie | `src/i18n/polyfille.ts`, `src/i18n/sprawdzIntl.ts` |
| Formaty (liczby, godzina 12/24, data w strefie urządzenia), układ miar | `src/i18n/format.ts` |
| Adapter `expo-localization` (jedyny import pakietu) | `src/platforma/lokalizacja.ts` |
| Słownik źródłowy `en` (9 kluczy z `design-spec.md`), kontekst, pseudolokalizacja, klucze typowane | `src/i18n/slowniki/en.json`, `en.kontekst.json`, `src/i18n/pseudo/en-XA.json`, `src/i18n/typy.d.ts` |
| Konfiguracja | `app.json` (plugin `expo-localization`, `locales`), `locales/systemowe/en.json`, `package.json` (skrypty `i18n`, `i18n:kod`, `i18n:pseudo`; 5 pakietów przypiętych), `jest.config.js` (transformacja `@formatjs/*`) |
| Skrypt kontroli | `scripts/sprawdz-i18n.mjs` (kod z promptu roli, bez zmian poza przykładem w nagłówku) |
| Testy | `tests/i18n/*.test.ts` (9 plików, 116 testów) |

## Dowody (definicja ukończenia E1)
| Wymóg | Wynik |
|---|---|
| Testy czerwone z właściwego powodu przed kodem | `e1-czerwone.txt`: 7 pakietów padło na brak modułów/skryptu (`Cannot find module`), commit `efe4ff8` przed kodem |
| Wektory liczby mnogiej ze wzorców (pl, ru, cs, lv, sl, ro, fr, en) | zielone na polyfillu formatjs (test sprawdza, że to nie implementacja natywna) |
| Wszystkie 35 języków mają reguły po polyfillu | zielone |
| Formaty, łańcuch zastępczy (brak klucza → `en`, nigdy klucz/pusty), samosprawdzenie `Intl` | zielone |
| `tsc --noEmit` | kod 0; klucze `t()` typowane |
| `npm run i18n` | kod 0: 0 błędów, 0 uwag, 9 kluczy (kontekst kompletny) |
| `npm run i18n:kod` | **kod 2: skan kodu niewykonany** (katalogów `src/ekrany`, `src/komponenty` jeszcze nie ma); to jest „nie sprawdzono”, nie „w porządku” |
| Cały zestaw jest nadal zielony | 100 zestawów, 882 testów (w tym stary kod 0.1.0) |
| Kontrola ADR | 17/17 OK, kod 0 |
Poprawki testów po commicie czerwonym (błędy w moich testach, nie dopasowanie do kodu): atrapa `PluralRules` miała postać obiektu zamiast funkcji; plik pseudo ze skryptu jest płaski (klucze z kropkami), nie zagnieżdżony; dynamiczny `import()` modułu ESM nie działa w Jest, więc zgodność pseudo sprawdza uruchomienie skryptu. Dodany przypadek: nieprawidłowy tag nie rzuca `RangeError` w `sprawdzIntl`.

## Czego nie sprawdzono
- **`Intl.PluralRules` z polyfillem na prawdziwym Hermes** (ZAL-033 nadal hipoteza): brak Xcode; `hermesc` w `node_modules` kompiluje, nie uruchamia. Sprawdzi to krok CI na macOS (rola 07), bo właściciel nie testuje ręcznie (P-041).
- Rozmiar polyfilla w pakiecie po minifikacji (zmierzone tylko źródła: ≈ 107 KB).
- Hermes `IntlAPIs.md`: wymienione w ADR ograniczenia `NumberFormat` pochodzą z wzorca roli (odczyt 2026-10-18); nie powtórzyłem odczytu `iOS`/`Android` szczegółów, tylko brak `PluralRules`.
- Teksty `en.json` pochodzą z `design-spec.md`; pięć kluczy `ustawienia.*` i `NSCameraUsageDescription` to **propozycje roli 09** (04 ich nie napisała) do zatwierdzenia przez 04.

## Do decyzji na STOP E1
1. **Akceptacja ADR-0017** (status „proponowana”). Opcje: (a) przyjąć — *rekomendacja*; (b) przyjąć z zmianą (np. Lingui zamiast i18next: wymaga odczytu dokumentacji i przeróbki skryptu, czas ok. +4 h agenta [OCENA]).
2. **Portugalia jako `pt-PT`, nie `pt`** (odchylenie od listy wzorca, uzasadnione regułami CLDR). (a) `pt-PT` — *rekomendacja*; (b) `pt` jak we wzorcu: 0 w portugalskim europejskim dostanie formę „one” (błąd gramatyczny).
3. **Teksty natywne Swift:** generowanie `Localizable.xcstrings` z tych samych JSON (ADR-0017) — (a) zostawić jako `[DO USTALENIA z 08]` do pierwszego tekstu natywnego — *rekomendacja*; (b) zrobić generator teraz (ok. 3 h [OCENA]), bez żadnego tekstu natywnego do sprawdzenia.
4. **Język `en` w `supportedLocales` teraz, reszta z falami E3** — (a) tak, *rekomendacja* (nie obiecujemy w Ustawieniach iOS języków bez przekładu); (b) zadeklarować od razu 35 (użytkownik wybierze język i zobaczy angielski).

## Przekazanie (wejście wczesne kończy się tu; E2–E4 po 08 i audycie 04)
Komenda dla wszystkich: `node scripts/sprawdz-i18n.mjs src/i18n/slowniki --zrodlo en --kod src/ekrany,src/komponenty,app` (`npm run i18n:kod`).
- **04:** zestaw 35 języków i kolejność przeglądów (`jezyki.md`); najdłuższy język do ustalenia w E2 (mierzony zrzutami; hipoteza: de, fi, el, hu, ru); plik pseudo `src/i18n/pseudo/en-XA.json` do audytu ekranów (`EXPO_PUBLIC_PSEUDO=1`); do zatwierdzenia: teksty `ustawienia.jezyk`, `jezyk_automatyczny`, `uklad_miar`, `jakosc_tlumaczenia`, `zglos_tlumaczenie`, tekst `NSCameraUsageDescription`; ekrany: lista języków i wiersz jakości przekładu w Ustawieniach (P-075 2a, 3b), przełącznik jednostek (4a); Libre Franklin nie pokrywa greki i CJK (P-064).
- **06:** języki treści = 35; treść krytyczna (F-37, F-38; RD-01, RD-03, RD-04, RD-10) tłumaczona po przeglądzie zastępczym D-027 w każdym języku (P-075 5b): rola 06 definiuje procedurę i zakres; jednostki kanoniczne (mm, m, g, °C), zaokrąglenia i rozmiary drutów US/UK po stronie 06; OP-12 (terminologia w 35 językach).
- **07:** komenda do CI; wektory liczby mnogiej jako testy akceptacyjne (`tests/i18n/liczba-mnoga.test.ts`); **krok na symulatorze iOS**: `sprawdzIntl(JEZYKI)` = `[]` i liczba mnoga `pl` (1, 2, 5, 22) w aplikacji; kontrola, że `supportedLocales` = słowniki = pliki systemowe; pseudolokalizacja jako zasób testów; rozmiar polyfilla.
- **08:** każdy tekst od pierwszego ekranu przez `t()` z kluczem znaczeniowym i wpisem w `en.kontekst.json` (DEV-12); `npm run i18n` przed commitem; adapter `MagazynPreferencji` na tabeli `ustawienie` (klucze `jezyk`, `uklad_miar`); wołanie `odswiezJezykSystemowy()` przy powrocie na pierwszy plan; import `src/i18n/polyfille` jako pierwszy import punktu wejścia; stary `src/core/i18n*.ts` i `check:i18n` usunąć razem ze starym kodem.
W `docs/sztafeta.md`: „09 E2–E4 po audycie 04”.
