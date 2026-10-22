# 0011. Import wzorów: rozszerzenie udostępniania przekazuje plik przez App Group; wzór przechowywany jako PDF (strona WWW i Word zamieniane na PDF na urządzeniu), oryginał zachowany
Data: 2026-10-22 · Status: proponowana · Rola: 05 (E1) · Zależy od: F-24, F-25, F-26, F-28, F-55, F-56, OG-07, OG-08, ADR-0007, ADR-0012

## Kontekst i problem
Import z arkusza udostępniania do bieżącego projektu (F-24), strona z Safari zapisana offline, Word jak PDF, link do filmu (F-55); na wzorze znacznik rzędu, zakreślacz i rysik (F-26, F-28, F-56). Rozszerzenie działa w osobnym procesie z niskim limitem pamięci (rejestr Apple 7b); reguła aktywacji wymaga predykatów UTI, `TRUEPREDICATE` nie przechodzi do App Store (7a). `WKWebView.createPDF` (iOS 14+) tworzy PDF z zawartości widoku; `QLPreviewController` pokazuje m.in. dokumenty Microsoft Office (rejestr Apple 15a, 15c; render `.docx` w `WKWebView` niepotwierdzony, 15d).

## Czynniki decyzji
Jeden format dla znacznika, zakreśleń i rysika · offline · pamięć rozszerzenia · wierność dokumentu Word.

## Rozważane opcje
A. Rozszerzenie kopiuje załącznik (PDF, obraz, URL, `.docx`) do skrzynki w App Group i kończy; aplikacja przy uruchomieniu importuje: PDF bez zmian; obraz → strona PDF; URL → `WKWebView` ładuje stronę, `createPDF` zapisuje PDF (wymaga sieci w chwili importu), adres zachowany jako link; `.docx` → `WKWebView` renderuje dokument i `createPDF` [DO USTALENIA: czy `WKWebView` renderuje `.docx` — eksperyment na symulatorze w CI, E2/08], oryginał zachowany. Link do filmu: zapis URL w notatce, bez pobierania.
B. Przechowywanie w formacie źródłowym (PDF, HTML/archiwum WWW `createWebArchiveData`, `.docx`) i osobne widoki dla każdego; znacznik i rysunki tylko na PDF.
C. Bez rozszerzenia: tylko „Otwórz w Oczku” i wybór z Plików.

## Decyzja
Opcja A, z wariantem zastępczym dla Worda: jeśli eksperyment pokaże, że render `.docx` w `WKWebView` jest niewierny albo niedostępny, Word pokazywany przez `QLPreviewController` bez znacznika i rysika (decyzja właściciela Q5 w raporcie E1). App Group służy tylko skrzynce importu (kontener znika po usunięciu aplikacji — rejestr Apple 2a; skrzynka jest pusta po imporcie, więc brak kopii zapasowej App Group (9b) nie grozi utratą).

### Konsekwencje
- Dobre: jeden czytnik PDF (PDFKit) z jedną warstwą rysunków; rozszerzenie lekkie (tylko kopiuje).
- Złe: strona WWW jako PDF traci interaktywność; Word zależy od eksperymentu.
- Prawo: porównanie funkcji wzoru z zastrzeżeniami patentów (OG-07, P-024) przed kodem — rola 07/08, reguła w `design-spec.md`.

### Potwierdzenie
- Reguła aktywacji w `Info.plist` rozszerzenia bez `TRUEPREDICATE` (kontrola w CI po prebuild).
- Testy importu (07, symulator): PDF, JPEG, URL lokalnego serwera testowego, `.docx` z korpusu; każdy daje PDF z ≥ 1 stroną i zachowany oryginał; skrzynka pusta po imporcie.
- Pamięć rozszerzenia: rozszerzenie nie dekoduje pliku (kopiowanie strumieniowe), test z PDF 100 MB.

## Opcje: zalety i wady
### A — zalety: jeden format dla funkcji wzoru · wady: konwersja na urządzeniu, Word niepewny.
### B — zalety: wierność źródła · wady: trzy widoki, znacznik i rysik tylko na części formatów.
### C — zalety: brak celu natywnego · wady: łamie F-24 (import z arkusza udostępniania) i F-55.
