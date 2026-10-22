# 0010. Zakupy: `expo-iap` 5.8.1 przypięte dokładnie (jak Trening), adapter sklepu ze sztucznym sklepem, uprawnienia tylko z bieżących transakcji
Data: 2026-10-22 · Status: proponowana · Rola: 05 (E1) · Zależy od: P-036, P-038, P-057, KP-01–KP-15, F-35

## Kontekst i problem
P-036: StoreKit 2 przez `expo-iap`, wersja przypięta dokładnie, bez usługi weryfikacji, reguła wieku wersji ≥ 14 dni, wzorzec Treningu (`"expo-iap": "5.8.1"`). npm 2026-10-22: 5.8.1 z 2026-09-26, 6.0.0 z 2026-10-09, 6.1.1 z 2026-10-18 (rejestr Expo 5a); dokumentacja OpenIAP: „SDK 57 / React Native 0.86 is the validated baseline”. Model V4: subskrypcje miesięczna i roczna + dożywotni (P-057).

## Czynniki decyzji
Wspólna wersja z Treningiem (utrzymanie) · reguła wieku · zgodność z SDK 57 · brak sieci poza Apple.

## Rozważane opcje
A. `expo-iap` 5.8.1. B. `expo-iap` 6.1.1 (nowa wersja główna, 4 dni). C. Własny moduł StoreKit 2 (Swift, Expo Modules API).

## Decyzja
Opcja A. Port `Sklep` w domenie (`produkty()`, `kup(id)`, `przywroc()`, `uprawnienia()` → lista bieżących transakcji, `obserwuj(fn)`), adapter `expo-iap` w `src/platforma/sklep/`, sztuczny sklep do testów i E2E. Dostęp liczy czysta funkcja z `docs/monetyzacja/dostep.mjs` (wektory W-*). Przejście na 6.x: osobny ADR razem z Treningiem, nie wcześniej niż 14 dni po wydaniu (6.0.0: od 2026-10-23).

### Konsekwencje
- Dobre: jedna wersja w dwóch aplikacjach; testy dostępu bez sklepu.
- Złe: 5.x może nie dostać poprawek, gdy 6.x jest główną linią (ryzyko utrzymania, przegląd przy odświeżeniu 04.2027, P-016).

### Potwierdzenie
- `package.json`: `"expo-iap": "5.8.1"` bez `^`/`~` (kontrola w CI).
- Testy wektorów dostępu W-* na sztucznym sklepie; „Przywróć zakupy” dostępne w ofertach i ustawieniach (3.1.1, rejestr Apple 10b).
- Brak żądań sieciowych poza StoreKit (przegląd zależności, rola 10).

## Opcje: zalety i wady
### A — zalety: zgodność z P-036 i Treningiem, reguła wieku spełniona · wady: starsza linia.
### B — zalety: najnowsza linia · wady: nie spełnia reguły wieku; zmiana główna bez sprawdzenia w Treningu.
### C — zalety: brak zależności · wady: własny kod zakupów i testów, sprzeczne z P-036.
