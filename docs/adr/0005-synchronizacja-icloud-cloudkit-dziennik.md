# 0005. Synchronizacja iCloud: prywatna baza CloudKit przez `CKSyncEngine`, rekordy jako dziennik zdarzeń, konflikt pokazywany użytkownikowi
Data: 2026-10-22 · Status: **przyjęta** (P-071) · Rola: 05 (E1) · Zależy od: P-021, P-031, P-070 (iOS 18), F-27, F-58, NFR-DAN-003, ADR-0006

## Kontekst i problem
Synchronizacja jest opcjonalna i darmowa (P-021, P-031), działa bez naszego serwera, a po niej licznik nie może mieć wartości innej niż ostatnio ustawiona na którymkolwiek urządzeniu bez pokazania konfliktu (NFR-DAN-003, RYZ-02). Prywatna baza CloudKit liczy się do iCloud użytkownika (rejestr Apple 8a), `CKSyncEngine` wymaga iOS 17 / watchOS 10 (8c) — przy iOS 18 (P-070) dostępny. Oficjalnego modułu Expo dla CloudKit nie ma (rejestr Expo 10).

## Czynniki decyzji
NFR-DAN-003 · koszt 0 zł (NFR-KOS-001) · lokalna baza jedynym źródłem prawdy (OG-09, NFR-OFF-001) · testowalność automatem (P-041) · utrzymanie.

## Rozważane opcje
A. Własny moduł natywny (Expo Modules API, Swift) z `CKSyncEngine` na prywatnej bazie; rekordy: wiersze encji (projekt, część, licznik, …) z polem `zmieniono` oraz zdarzenia licznika jako niezmienne rekordy z `rodzice`; scalanie wartości w domenie funkcją `scal` (prototyp `docs/architektura/eksperymenty/e1/scal.mjs`, wektory M-01–M-07 7/7, mutant „suma gałęzi” 6/7).
B. Plik archiwum (ADR-0004) w kontenerze iCloud Drive, nadpisywany co jakiś czas; ostatni zapis wygrywa.
C. Bez synchronizacji w wersji 1 (warunek powrotu P-021: „ograniczenie Apple, które przesądza o niemożności”).
D. Biblioteka społeczności (`expo-cloudkit` 0.20.8, `react-native-cloud-store` ostatnio 2024-04-11; rejestr Expo 10).

## Decyzja
Opcja A. Zdarzenia licznika są tylko dopisywane, więc scalanie jest deterministyczne i idempotentne (M-02); równoległa praca na dwóch urządzeniach od tej samej wartości daje `konflikt` z kandydatami (M-04) i stan F-58 „Licznik ma dwie wersje — wybierz” (tekst: rola 04), a wybór zapisuje zdarzenie `rozstrzygniecie` (M-05). Encje bez liczby (nazwa, notatka) scalane według `zmieniono` z zachowaniem poprzedniej wersji w historii (szczegóły w E2). Pliki jako `CKAsset` (liczą się do iCloud użytkownika). Usunięcia jako rekordy-nagrobki 30 dni (F-33). Wyłączenie przełącznika zatrzymuje wysyłkę, dane lokalne zostają.

### Konsekwencje
- Dobre: koszt 0 zł; spełnia NFR-DAN-003 z dowodem na wektorach; ta sama funkcja `scal` obsługuje zegarek (ADR-0009) i dziennik ekranu blokady (ADR-0008).
- Złe: najdroższy moduł natywny wersji 1 (kontrakt: F-27 3,5 h); zachowanie między prawdziwymi urządzeniami to ryzyko szczątkowe (NFR-DAN-003, P-041); historia rośnie o rekordy zdarzeń w iCloud użytkownika (ok. 150 000 po 3 latach intensywnego używania).

### Potwierdzenie
- Wektory `scal-wektory.json` w testach domeny (07), rozszerzone o encje i nagrobki w E2; test właściwości: dowolna permutacja i powtórzenie dostarczeń daje ten sam wynik.
- Test adaptera z atrapą `CKSyncEngine` (dwie instancje magazynu, opóźnienie, przerwana sieć, odwrócona kolejność; metoda NFR-DAN-003).
- Kontrola: moduł synchronizacji nie zapisuje do bazy poza kolejką ADR-0002.

## Opcje: zalety i wady
### A — zalety: spełnia NFR-DAN-003, darmowe, system planuje synchronizację · wady: kod Swift, harmonogram „nieokreślony” (rejestr Apple 8c), test tylko na atrapie.
### B — zalety: mało kodu · wady: „ostatni wygrywa” nadpisuje rzędy z drugiego urządzenia bez pokazania konfliktu — łamie NFR-DAN-003.
### C — zalety: zero ryzyka konfliktów · wady: łamie decyzję P-021/P-031 bez spełnionego warunku powrotu.
### D — zalety: gotowy kod · wady: młode albo nieutrzymywane paczki bez `CKSyncEngine`; zależność w najbardziej ryzykownym miejscu.
