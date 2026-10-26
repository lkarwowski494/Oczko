# Partia 6 — kod natywny (K7): moduł `oczko-wzor` i cel `targets/share`
Stan 2026-10-26 ok. 20:30 UTC · gałąź lokalna `partia6-natywne` (od d817ce1) · **nic nie wypchnięte** (P-241: kod natywny do okna maszyn). Zakres: moduly.md „Kontrakt partii 6” (moduł Swift `modules/oczko-wzor`, cel `targets/share`, eksperymenty W1–W3), P-218 (1)–(6), P-220 R1a, P-234, P-237 (2), P-243.

## Co jest
| Część | Pliki | Sprawdzone tutaj (Linux) |
|---|---|---|
| Logika czysta (polityka płótna, papier Letter US/CA i A4, źródło konwersji z JSON, wynik JSON z powodami `Powod`, kod HTTP → `odmowa`/`pusty`, migawka P-243, dni od pracy, rodzaj z UTI, zapis zlecenia z manifestem na końcu, limit WZOR_MAKS_MB) | `modules/oczko-wzor/Pakiet/` (SwiftPM `OczkoWzorLogika`), stałe z `src/konfiguracja.ts` przez `scripts/natywne/generuj-stale.mjs` (`StaleWzoru.swift`, `Pakiet/stale.json`) | `swift test` (Swift 6.2 Linux): czerwone przed kodem (brak symboli), potem **15/15** |
| Most JS | `modules/oczko-wzor/index.ts` (`requireOptionalNativeModule` — build bez modułu dostaje `null`; `WidokWzoruNatywny` przez `requireNativeViewManager`) | `tsc --strict` kod 0 |
| Moduł Expo | `ios/OczkoWzorModule.swift` (`naPdf`, `sprawdzPdf`, `skanerDostepny`, `skanuj`, widok `OczkoWzor`), `ios/WidokWzoru.swift` (PDFView + `PDFPageOverlayViewProvider` z PKCanvasView na stronę, znacznik `wzor-znacznik`, detektor pierwszego rysika, zapis po `RYSUNEK_ZAPIS_MS`, przy zmianie strony, zamknięciu i tle, `onZakreslenia`), `ios/KonwersjaNaPdf.swift` (WKWebView → `UIPrintPageRenderer`, obrazy → PDF), `ios/SprawdzeniePdf.swift`, `ios/Skaner.swift` (VisionKit), `OczkoWzor.podspec` (źródła `ios/**` + pakiet logiki wprost) | tylko `swiftc -parse` (UIKit/PDFKit/PencilKit nie istnieją na Linuksie) — **kompilacja nieweryfikowana** |
| Cel share | `targets/share/expo-target.config.js` (`entitlements` App Group — P-234), `Info.plist` (reguła aktywacji SUBQUERY, bez TRUEPREDICATE: PDF ≤ 1, Word ≤ 1, obrazy ≤ 20, adres ≤ 1, każdy załącznik w tych typach), `ShareViewController.swift`, `Arkusz.swift` (SwiftUI, stany R1a), `Teksty.swift` (generator), `Wspolne/` (kopie pakietu: `scripts/natywne/kopie.json`) | `swiftc -typecheck` Teksty + Wspolne; reszta `-parse` |
| Teksty celu share | generator w `tests/adaptery/teksty-natywne.test.ts` (tabela `udostepnij.*` + wybrane `wspolne`, `projekty`, `wzor`) i test „każdy klucz Teksty.t/tl w Swift celu share jest w tabeli” | jest: 7/7 |
| Eksperymenty W1–W3 | `modules/oczko-wzor/TestyOknaMaszyn/EksperymentyTests.swift`, korpus `TestyOknaMaszyn/korpus/{tekst,tabela,obraz}.docx` (`generuj-korpus.mjs`), test spec `Testy` w podspecu | korpus: ZIP poprawny (`zipfile.testzip`) |

`env -u NODE_PATH npm run verify` w worktree: kod 0, **2436/2436** (kontrola Swift 0 błędów: znaleziono i poprawiono kolizję nazw `Konwersja.swift` w module → `ios/KonwersjaNaPdf.swift`).

## Okno maszyn — kolejność (koordynator)
1. Wcześniej w repo (08, nie ten commit): `app.json` — plugin celów zna `targets/share` (już jest `@bacons/apple-targets`: cele z katalogu `targets/`), `expo-screen-orientation` 57.0.3 (K7 partii, wiersz ADR-0016), adapter `src/platforma/wzor.ts` na `modules/oczko-wzor`.
2. `npx expo prebuild --platform ios --clean`, potem `node scripts/wydanie/uprawnienia-celow.mjs ios/Oczko.xcodeproj/project.pbxproj` — oczekiwany wiersz `OczkoUdostepnij\t…generated.entitlements` z `group.com.apps4brew.knitting` (P-234).
3. Build symulatora (`xcodebuild -workspace ios/Oczko.xcworkspace -scheme Oczko -sdk iphonesimulator -configuration Debug build`) — pierwsza prawdziwa kompilacja Swift modułu i celu; błędy typów spodziewane do poprawki na miejscu.
4. **W1–W3:** w `ios/Podfile` po `use_expo_modules!` włączyć test spec (`pod 'OczkoWzor', :path => '../modules/oczko-wzor', :testspecs => ['Testy']`), `node modules/oczko-wzor/TestyOknaMaszyn/korpus/generuj-korpus.mjs`, `pod install`, potem
   `xcodebuild test -workspace ios/Oczko.xcworkspace -scheme OczkoWzor-Unit-Testy -destination 'platform=iOS Simulator,name=iPhone 17'` [DO USTALENIA: nazwa schematu test specu po `pod install`].
   - W1 (`testW1WordNaPdf`): 3 × `.docx` → PDF, ≥ 1 strona, tekst w `tekst`/`tabela`; log „W1 …: strony, znaki”. Porażka = Word w podglądzie zastępczym 5a (`pdf_sha256 = NULL`) — decyzja koordynatora.
   - W2 (`testW2DuzyPdf`): tworzy PDF 300 stron ≈ 100 MB i otwiera go w `WidokWzoru` na ostatniej stronie; pamięć i płynność przewijania: Instruments (Allocations, Animation Hitches) na symulatorze i na iPadzie właściciela [DO ZMIERZENIA].
   - W3 (`testW3PolitykaPoPierwszymRysiku`): XCTest nie wytwarza syntetycznego dotyku palcem w PKCanvasView, więc test sprawdza politykę (`drawingPolicy == .pencilOnly`, `isUserInteractionEnabled == false` bez narzędzia); „palec nie rysuje po rysiku” zostaje na liście urządzenia (ryzyko szczątkowe P-226: właściciel nie ma Apple Pencil).
5. `swift test` pakietu logiki w CI: `jakosc-ios.yml` uruchamia dziś tylko `modules/oczko-reguly` — dopisanie kroku `cd modules/oczko-wzor/Pakiet && swift test` należy do 07/08 (poza zakresem tego commita).

## [DO USTALENIA] i ryzyka
- **Kompilacja nieweryfikowana:** cały kod UIKit/PDFKit/PencilKit/WebKit/VisionKit sprawdzony tylko parserem. Miejsca najbardziej ryzykowne: układ współrzędnych nakładki strony (`PDFPageOverlayViewProvider` — czy nakładka nie jest odwrócona; znacznik liczony od góry strony), przewijanie palcem przy `.pencilOnly` (gesty przodka PDFView), `minimumNumberOfTouches = 2` dla trybu zakreślacza (wewnętrzny UIScrollView PDFView), `viewPrintFormatter` WKWebView poza oknem (może wymagać dołączenia do okna), sygnatura `decidePolicyFor … decisionHandler` w SDK iOS 26.
- **Kilka zdjęć z arkusza = kilka zleceń** (manifest ma jedną `sciezka`), więc aplikacja zrobi kilka wzorów, a „Choose photos” w aplikacji robi jeden (P-218 Q6a, ograniczenie 1 nie jest naruszone, ale zachowanie się różni). Propozycja: pole `sciezki` w manifeście (zmiana kontraktu ZlecenieImportu — 05).
- **„Video link” z arkusza (S4):** zlecenie `rodzaj: 'adres'`, `typ: 'film'`. `src/przypadki-uzycia/skrzynka.ts` (`zrodloZlecenia`) dziś traktuje każdy adres jako wzór — musi rozpoznać `typ === 'film'` i zapisać link filmu (miejsce zapisu: S4) zamiast zamiany strony na PDF.
- **„New project” w arkuszu** = `projektId: null` (aplikacja zapyta o projekt w arkuszu skrzynki) — bez tworzenia projektu w rozszerzeniu.
- **Język arkusza:** rozszerzenie nie czyta preferencji języka z bazy (P-190) — bierze pierwszy obsługiwany język systemu. Propozycja: pole `jezyk` w kopercie migawki (05).
- Liczba stron w podglądzie arkusza (`wzor.wiersz_opis` „PDF · 6 pages”) pominięta: rozszerzenie nie dekoduje pliku (kontrakt) — pokazuje sam rodzaj.
- Reguła aktywacji (predykat SUBQUERY) do sprawdzenia na urządzeniu: Safari (strona), Pliki (PDF, .docx), Zdjęcia (1 i 20), poczta (załącznik PDF).
- Teksty celu share: przy nowych językach generator wpisze je sam (test porówna plik); klucze spoza tabeli wykrywa test.
