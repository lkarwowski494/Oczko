# 0006. Minimalne wersje systemu: iOS 18, iPadOS 18, watchOS 11
Data: 2026-10-22 · Status: **przyjęta** (P-070 (1a)) · Rola: 05 (E1) · Zamyka OP-26 w części wersji

## Kontekst i problem
Expo SDK 57 wymaga iOS 16.4+ (rejestr Expo 1a). Przycisk Live Activity (`LiveActivityIntent`) wymaga iOS 17.0 (rejestr Apple 1e), `CKSyncEngine` iOS 17 / watchOS 10 (8c). Udział systemów na iPhone'ach 7.06.2026: iOS 26 79%, iOS 18 14%, wcześniejsze 7% (rejestr Apple 14).

## Czynniki decyzji
Jedna ścieżka kodu dla F-11, F-21, F-27 · zasięg urządzeń · liczba symulatorów w CI (NFR-SYS-001).

## Rozważane opcje
A. iOS 18 / watchOS 11. B. iOS 17 / watchOS 10. C. iOS 16.4 (minimum Expo) z wariantami zastępczymi.

## Decyzja
Opcja A (właściciel: „1a”, 2026-10-22). watchOS 11 jako wersja odpowiadająca iOS 18 [DO USTALENIA: potwierdzenie par w dokumentacji watchOS przy ADR-0009 w E2; zależność niekrytyczna, bo `CKSyncEngine` i `WatchConnectivity` są w watchOS 10].

### Konsekwencje
- Dobre: brak wariantów kodu na stare systemy; CI na najnowszym symulatorze + iOS 18.
- Złe: tracimy do 7% iPhone'ów (dokładny udział iOS 17 nieznany).
- Czas od premiery nowego systemu do poprawki (druga część OP-26) zostaje otwarty: decyzja procesu roli 07/10.

### Potwierdzenie
- `app.json` / plugin: `ios.deploymentTarget` = `18.0` (sprawdzenie w CI po `expo prebuild`: `IPHONEOS_DEPLOYMENT_TARGET = 18.0` w projekcie Xcode).
- Kod nie zawiera `@available(iOS 17` ani `if #available(iOS 16` gałęzi zastępczych (grep).

## Opcje: zalety i wady
### A — zalety: wszystkie API, najmniej testów · wady: ≤ 7% urządzeń poza zasięgiem.
### B — zalety: część z 7% wraca · wady: jeden system więcej w testach; udział nieznany.
### C — zalety: największy zasięg · wady: dwie ścieżki dla ekranu blokady i iCloud.
