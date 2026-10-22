# 0002. Jedna kolejka zapisów na jednym połączeniu z `foreign_keys = ON`
Data: 2026-10-22 · Status: proponowana · Rola: 05 (E1) · Zależy od: ADR-0001

## Kontekst i problem
`expo-sqlite` 57 daje dwa rodzaje transakcji. `withTransactionAsync`: „not exclusive and can be interrupted by other async queries”, a każde zapytanie wykonane w tym czasie wchodzi do transakcji (rejestr Expo 2a). `withExclusiveTransactionAsync` otwiera nowe połączenie (`useNewConnection: true`, `src/SQLiteDatabase.ts:789` w `expo-sqlite@57.0.4`, sprawdzone 2026-10-22), na którym klucze obce są wyłączone (rejestr SQLite 1a), więc kaskady nie działają (G-07).

## Czynniki decyzji
Kaskady i klucze obce zawsze włączone · brak przeplatania zapisów (+1, cofnięcie, scalenie dziennika, import) · zapis krótki przed zawieszeniem (`0xdead10cc`).

## Rozważane opcje
A. Jedno połączenie zapisu otwarte przy starcie, `PRAGMA foreign_keys = ON` przed pierwszą transakcją, wszystkie zapisy przez kolejkę FIFO w porcie bazy (`zapisz(fn)`), każda pozycja to `BEGIN IMMEDIATE … COMMIT` z `withTransactionAsync` na tym połączeniu, bez równoległych zapytań.
B. `withTransactionAsync` wywoływane bezpośrednio z ekranów, bez kolejki.
C. `withExclusiveTransactionAsync` dla zapisów wielowierszowych.

## Decyzja
Opcja A. Odczyty idą przez to samo połączenie poza kolejką tylko wtedy, gdy kolejka jest pusta; ekrany czytają po zakończeniu zapisu (port zwraca wynik zapisu). Długie operacje (import, eksport, scalanie dużego pliku) dzielone na krótkie transakcje w kolejce.

### Konsekwencje
- Dobre: kaskady działają; brak przypadkowego wciągnięcia obcego zapytania do transakcji; jedno miejsce do pomiaru i obsługi błędu zapisu (stan „Couldn’t save that row…”, design-spec).
- Złe: zapisy nie są równoległe (przy E1-1 zapis +1 trwa ułamek ms, więc bez znaczenia); port bazy musi pilnować, żeby nikt nie użył natywnego obiektu z pominięciem kolejki (`granice.mjs`).

### Potwierdzenie
- Test (07): `PRAGMA foreign_keys` odczytane wewnątrz transakcji zapisu przez port bazy = 1.
- Test: dwa równoległe wywołania `zapisz` wykonują się po kolei (atrapa portu z opóźnieniem); błąd w pierwszym nie blokuje drugiego.
- `granice.mjs`: import `expo-sqlite` tylko w `src/dane/baza/`; zakaz `withExclusiveTransactionAsync` (grep w CI).

## Opcje: zalety i wady
### A — zalety: poprawne kaskady, przewidywalna kolejność · wady: własny mały kod kolejki.
### B — zalety: zero kodu · wady: dokumentacja Expo sama ostrzega przed przeplataniem; ryzyko częściowego zapisu przy dwóch równoległych akcjach (np. +1 i scalanie dziennika).
### C — zalety: izolacja · wady: klucze obce wyłączone na nowym połączeniu, a inne zapisy kończą się `database is locked` (rejestr Expo 2b).
