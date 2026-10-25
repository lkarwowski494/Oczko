# 0009. Zegarek: zdarzenia przez `transferUserInfo`, stan przez kontekst aplikacji, Pro i limit z ostatniego stanu od telefonu oraz z StoreKit na zegarku
Data: 2026-10-22 · Status: **przyjęta** (P-071; uzupełniona 2026-10-25) · Rola: 05 (E1) · Zależy od: P-039, P-067, OP-22, F-12, F-58, NFR-ZEG-001, ADR-0005, ADR-0007

## Kontekst i problem
Ten sam licznik na zegarku i telefonie (F-12), zgodność po synchronizacji (NFR-ZEG-001), Pro na zegarku bez telefonu, gdy telefon wcześniej potwierdził zakup (P-039), a +1 z zegarka zaczyna dzień limitu (P-067). `transferUserInfo` kolejkuje i dostarcza wszystko po kolei, także przy zawieszonej aplikacji (symulator nie obsługuje); `updateApplicationContext` przekazuje tylko ostatni stan; `sendMessage` wymaga osiągalności (rejestr Apple 4a–4c). `expo-iap` nie wspiera watchOS (rejestr Expo 5b). `Transaction.currentEntitlements` jest na watchOS 8+ (Apple 4d), a czy zakup z iPhone'a jest tam widoczny bez telefonu, dokumentacja nie mówi (4e).

## Czynniki decyzji
Zero utraconych stuknięć z zegarka · konflikt pokazany, nie zsumowany po cichu (NFR-DAN-003) · Pro bez telefonu (P-039) · testowalność bez prawdziwego zegarka (P-041).

## Rozważane opcje
Transport: A. zdarzenia +1/−1 z zegarka jako `transferUserInfo` (kolejka, idempotencja po UUID), stan telefonu → zegarek przez `updateApplicationContext` (`{licznik, wartosc, glowa, nazwa, dzienDozwolony, pro, proWaznoscDo}`). B. Zegarek z własną bazą synchronizowaną tylko przez CloudKit (ADR-0005). C. `sendMessage` na żywo.
Pro na zegarku: D. ostatni stan Pro z kontekstu telefonu (z datą ważności subskrypcji) + własny `Transaction.currentEntitlements` na zegarku, gdy dostępny; wygrywa „ma Pro”, jeśli którekolwiek źródło je potwierdza i data nie minęła. E. Tylko stan z telefonu. F. Tylko StoreKit na zegarku.

## Decyzja
A + D. Zegarek trzyma mały plik stanu i kolejkę wysłanych zdarzeń; telefon scala je funkcją `scal` (ADR-0005), a wynik wraca kontekstem. Limit na zegarku: reguła `mozeZaczacDzien` w Swift na stanie z kontekstu (wspólne wektory, ADR-0007); po północy bez kontaktu z telefonem zegarek liczy nowy dzień sam według L-04 i dni z ostatniego kontekstu. Zamyka OP-22 (sposób odczytu Pro na zegarku).

### Konsekwencje
- Dobre: działa bez telefonu w pobliżu (P-039); jedna funkcja scalania dla trzech źródeł; test na symulowanym transporcie.
- Złe: logika limitu w Swift (koszt wspólnych wektorów); `transferUserInfo` nie działa w symulatorze, więc test transportu tylko na atrapie (ryzyko szczątkowe NFR-ZEG-001).

### Potwierdzenie
- Test domeny: wektory M-* plus scenariusze zegarka (telefon poza zasięgiem, powrót, zmiany na obu stronach) w `scal-wektory.json` (E2).
- Test Swift celu zegarka: te same `wektory-limitu.json` (L-04, S-*) dają te same wyniki co `limit.mjs`.
- Test „Pro bez telefonu”: kontekst z `pro=true, proWaznoscDo` w przyszłości, brak telefonu → +1 w nowym dniu ponad limit dozwolone (W-10, P-039).

## Uzupełnienie 2026-10-25 (fix 05: Z07-12, P-109, P-110 Q8a)
- **Stan dla zegarka** = `StanZegarkaV2` = `StanEkranuBlokadyV2` (moduly.md, „Stan Live Activity i zegarka, wersja 2”) przez `updateApplicationContext`; pole `wersja` w ładunku, dekoder odrzuca wersję nowszą niż znana i zostaje przy ostatnim poprawnym stanie.
- **Skrzynka zdarzeń po stronie telefonu** (P-110 Q8a): `transferUserInfo` odebrane, gdy JS nie działa, moduł natywny (`WCSessionDelegate`) dopisuje jako linie `ZdarzenieWejsciowe` z `zrodlo: 'zegarek'` do tego samego dziennika `.jsonl` co intencja ekranu blokady (ADR-0008), przez tę samą kolejkę szeregową `DziennikPlus`; scalanie, idempotencja po UUID, zatrute linie i skracanie jak w ADR-0008 (3). Odbiór działa w procesie aplikacji, więc App Group nie jest potrzebna; skrzynka nie jest kasowana przed `COMMIT` scalenia.
- **Zegarek:** własny plik stanu i lista wysłanych, jeszcze niepotwierdzonych zdarzeń (do wyświetlenia wartości bez telefonu); potwierdzeniem jest `glowa` z kolejnego kontekstu telefonu.

## Opcje: zalety i wady
### A — zalety: kolejka bez utraty, idempotencja · wady: brak w symulatorze.
### B — zalety: brak WatchConnectivity · wady: zegarek bez sieci i bez telefonu nie synchronizuje; CloudKit na zegarku opóźniony.
### C — zalety: natychmiast · wady: wymaga osiągalności, gubi stuknięcia poza zasięgiem.
### D — zalety: P-039 spełnione nawet przy 4e nierozstrzygniętym · wady: dwa źródła do pogodzenia (reguła „ma Pro, jeśli ważne”).
### E — zalety: prosto · wady: zakup zrobiony na innym urządzeniu nie dotrze bez telefonu.
### F — zalety: źródło Apple · wady: 4e niepotwierdzone; StoreKit na zegarku to osobny kod.
