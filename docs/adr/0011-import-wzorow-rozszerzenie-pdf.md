# 0011. Import wzorów: rozszerzenie udostępniania przekazuje plik przez App Group; wzór przechowywany jako PDF (strona WWW i Word zamieniane na PDF na urządzeniu), oryginał zachowany
Data: 2026-10-22 · Status: **przyjęta** (P-071) · Rola: 05 (E1) · Zależy od: F-24, F-25, F-26, F-28, F-55, F-56, OG-07, OG-08, ADR-0007, ADR-0012

## Kontekst i problem
Import z arkusza udostępniania do bieżącego projektu (F-24), strona z Safari zapisana offline, Word jak PDF, link do filmu (F-55); na wzorze znacznik rzędu, zakreślacz i rysik (F-26, F-28, F-56). Rozszerzenie działa w osobnym procesie z niskim limitem pamięci (rejestr Apple 7b); reguła aktywacji wymaga predykatów UTI, `TRUEPREDICATE` nie przechodzi do App Store (7a). `WKWebView.createPDF` (iOS 14+) tworzy PDF z zawartości widoku; `QLPreviewController` pokazuje m.in. dokumenty Microsoft Office (rejestr Apple 15a, 15c; render `.docx` w `WKWebView` niepotwierdzony, 15d).

## Czynniki decyzji
Jeden format dla znacznika, zakreśleń i rysika · offline · pamięć rozszerzenia · wierność dokumentu Word.

## Rozważane opcje
A. Rozszerzenie kopiuje załącznik (PDF, obraz, URL, `.docx`) do skrzynki w App Group i kończy; aplikacja przy uruchomieniu importuje: PDF bez zmian; obraz → strona PDF; URL → `WKWebView` ładuje stronę, `createPDF` zapisuje PDF (wymaga sieci w chwili importu), adres zachowany jako link; `.docx` → `WKWebView` renderuje dokument i `createPDF` [DO USTALENIA: czy `WKWebView` renderuje `.docx` — eksperyment na symulatorze w CI, E2/08], oryginał zachowany. Link do filmu: zapis URL w notatce, bez pobierania.
B. Przechowywanie w formacie źródłowym (PDF, HTML/archiwum WWW `createWebArchiveData`, `.docx`) i osobne widoki dla każdego; znacznik i rysunki tylko na PDF.
C. Bez rozszerzenia: tylko „Otwórz w Oczku” i wybór z Plików.

## Decyzja
Opcja A, z wariantem zastępczym dla Worda: jeśli eksperyment pokaże, że render `.docx` w `WKWebView` jest niewierny albo niedostępny, Word pokazywany przez `QLPreviewController` bez znacznika i rysika (właściciel: „5a”, P-071). App Group służy tylko skrzynce importu (kontener znika po usunięciu aplikacji — rejestr Apple 2a; skrzynka jest pusta po imporcie, więc brak kopii zapasowej App Group (9b) nie grozi utratą).

### Konsekwencje
- Dobre: jeden czytnik PDF (PDFKit) z jedną warstwą rysunków; rozszerzenie lekkie (tylko kopiuje).
- Złe: strona WWW jako PDF traci interaktywność; Word zależy od eksperymentu.
- Prawo: porównanie funkcji wzoru z zastrzeżeniami patentów (OG-07, P-024) przed kodem — rola 07/08, reguła w `design-spec.md`.

### Potwierdzenie
- Reguła aktywacji w `Info.plist` rozszerzenia bez `TRUEPREDICATE` (kontrola w CI po prebuild).
- Testy importu (07, symulator): PDF, JPEG, URL lokalnego serwera testowego, `.docx` z korpusu; każdy daje PDF z ≥ 1 stroną i zachowany oryginał; skrzynka pusta po imporcie.
- Pamięć rozszerzenia: rozszerzenie nie dekoduje pliku (kopiowanie strumieniowe), test z PDF 100 MB.

## Uzupełnienie 2026-10-25 (fix 05: Z07-17; decyzja A bez zmian)
- **Znacznik bieżącego rzędu** (BR-WZR-003, pole `wzor.znacznik`): współrzędne względne strony PDF, nie punkty ekranu — `y` i `wysokosc_rzedu` jako ułamek wysokości strony 0–1 (od góry strony w jej układzie bez obrotu), `strona` od 0. Wektor dla 07: ten sam znacznik po obrocie urządzenia, zmianie powiększenia i na innym rozmiarze ekranu wskazuje ten sam rząd (przeliczenie tylko w widoku, dane bez zmian); strona obrócona w PDF (`/Rotate`) — współrzędne w układzie strony przed obrotem.
- **Rozszerzenie udostępniania:** plik kopiowany do skrzynki strumieniowo (kopiowanie pliku przez system plików albo strumień, bez wczytywania całego pliku do pamięci); plik większy niż `WZOR_MAKS_MB` nie jest kopiowany, a rozszerzenie pokazuje jedno zdanie (tekst: 04). Limit pamięci rozszerzenia nie jest liczbą podaną w dokumentacji przeczytanej w tej sesji [DO USTALENIA: pomiar na urządzeniu przy TestFlight], stąd kopiowanie bez wczytywania.

## Opcje: zalety i wady
### A — zalety: jeden format dla funkcji wzoru · wady: konwersja na urządzeniu, Word niepewny.
### B — zalety: wierność źródła · wady: trzy widoki, znacznik i rysik tylko na części formatów.
### C — zalety: brak celu natywnego · wady: łamie F-24 (import z arkusza udostępniania) i F-55.

## Uzupełnienie 2026-10-25 (fix-2, NZ-08-P1-05 W7, P-118 Q2a): kierunek znacznika i koniec strony
Kontekst: schematy czyta się od dołu do góry („schemat czyta się od dołu do góry”, podręcznik szczebla 3, s. 48; kopia `oczko-warsztat/06-tresci/zrodla-uk/ranok-trudove-7.md`, jedno źródło), a opis słowny i wiele plików PDF — od góry do dołu, więc kierunek jest daną znacznika, nie stałą. Rozważane: (a) kierunek w znaczniku i zatrzymanie na krawędzi strony — **wybrane**; (b) tylko w dół (łamie BR-WZR-003 dla schematów); (c) jak (a) z automatycznym przejściem strony (zgaduje marginesy i miejsce pierwszego rzędu na nowej stronie).
- **Pola** `wzor.znacznik` (JSON, `schemat.sql`): `licznik_id`; `strona` (od 0); `y` — górna krawędź pasa rzędu, ułamek wysokości strony 0–1 od góry; `wysokosc_rzedu` (0–1, > 0); `rzad_bazowy` — rząd wzoru wskazany przy ustawieniu znacznika (≥ 1); `wartosc_przy_ustawieniu` — wartość licznika w tej chwili; `kierunek` — `1` (następny rząd niżej) albo `-1` (następny rząd wyżej), wybierany przy ustawieniu (gest i wartość domyślna: rola 04; propozycja: w górę dla schematu, BR-WZR-003 mówi o „rzędzie schematu”).
- **Funkcja domeny** (`src/domena/znacznik-wzoru.ts`, zmiana sygnatury: 08): `polozenieZnacznika(z, wartoscLicznika): { strona; rzad; y; pozaStrona: boolean }`, gdzie `krok = wartoscLicznika − wartoscPrzyUstawieniu`, `rzad = rzadBazowy + krok`, `y' = y + kierunek × krok × wysokoscRzedu`. Gdy `y' ≥ −ε` i `y' + wysokoscRzedu ≤ 1 + ε` (ε = 1e-9, liczby zmiennoprzecinkowe) oraz `rzad ≥ 1`: `y = y'`, `pozaStrona = false`. W przeciwnym razie znacznik **staje na krawędzi** (`y` przycięte do `[0, 1 − wysokoscRzedu]`), `strona` bez zmian, `rzad` liczony dalej, `pozaStrona = true` — ekran prosi o ustawienie znacznika na następnej stronie (projekt komunikatu: 04); ponowne ustawienie zapisuje nowe `strona`, `y`, `rzad_bazowy = rzad`, `wartosc_przy_ustawieniu = wartość licznika`.
- **Wyrocznia** (porównanie `y` z tolerancją 1e-9): znacznik `{ strona: 2, y: 0.5, wysokoscRzedu: 0.1, kierunek: -1, rzadBazowy: 12, wartoscPrzyUstawieniu: 12 }`: licznik 13 → `{ strona: 2, rzad: 13, y: 0.4, pozaStrona: false }` (BR-WZR-003/S1); licznik 17 → `y: 0`, `pozaStrona: false`; licznik 18 → `rzad: 18, y: 0, pozaStrona: true`; licznik 11 (cofnięcie) → `rzad: 11, y: 0.6`; ten sam znacznik z `kierunek: 1`, licznik 16 → `y: 0.9`, licznik 17 → `y: 0.9, pozaStrona: true`; znacznik z `kierunek: -1`, licznik 0 → `rzad: 0, y: 0.9, pozaStrona: true` (cofnięcie przed rząd 1). Wyrocznię przeliczono w Node z ε = 1e-9 (dowody fix-2).
- Potwierdzenie: test 07 z wyroczni; kontrola pól `schemat.sql` = pola typu `ZnacznikWzoru` (po zmianie typu przez 08).
