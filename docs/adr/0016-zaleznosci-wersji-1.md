# 0016. Zależności wersji 1: tylko pakiety Expo SDK 57 dla przepływów z kontraktu, `expo-iap` 5.8.1, `@bacons/apple-targets`; resztę piszemy jako moduły Swift
Data: 2026-10-22 · Status: proponowana · Rola: 05 (E3) · Zależy od: ADR-0001–0015, P-036, NFR-PRY-001, NFR-KOS-001

## Kontekst i problem
Każda biblioteka natywna to utrzymanie, rozmiar i manifest prywatności (obszar „Zależności zewnętrzne”). Poprzednia wersja miała m.in. `qrcode`, `react-native-svg`, `expo-router` (`package.json`, materiał P-004). Manifesty kandydatów odczytane 2026-10-22 (`docs/architektura/prywatnosc.md`): żaden nie deklaruje śledzenia ani zbierania danych.

## Czynniki decyzji
Każda zależność wynika z przepływu kontraktu · pakiety Expo w wersji z tagiem `sdk-57` · przypięcie dokładne · reguła wieku ≥ 14 dni (P-036) · brak SDK analitycznych i reklamowych.

## Rozważane opcje
A. Lista minimalna (niżej) + własne moduły Swift dla CloudKit, PencilKit, dziennika +1, zegarka, ochrony czasu w tle.
B. Biblioteki społeczności zamiast modułów Swift (np. `expo-cloudkit`, `react-native-pdf`, biblioteki rysowania).
C. Szeroki zestaw jak poprzednia wersja (router, SVG, QR).

## Decyzja
Opcja A.
| Pakiet (wersja 2026-10-22) | Przepływ | Alternatywa odrzucona |
|---|---|---|
| `expo` 57.0.31, `react-native` 0.86.3, `react` 19.2.3 | podstawa (stos `CLAUDE.md`) | — |
| `expo-sqlite` 57.0.4 | F-31 (ADR-0001, ADR-0002) | `op-sqlite` (poza Expo, bez potrzeby) |
| `expo-file-system` 57.0.7 | pliki (ADR-0001), archiwum (ADR-0004) | — |
| `expo-crypto` 57.0.4 | SHA-256 plików, UUID | własny moduł |
| `expo-haptics` 57.0.3 | F-01, F-48 | Core Haptics w Swift |
| `expo-keep-awake` 57.0.2 | F-10 | `isIdleTimerDisabled` w Swift |
| `expo-image-picker` 57.0.20 | F-16, F-24 (aparat, zdjęcia) | `expo-camera` (własny ekran aparatu — niepotrzebny) |
| `expo-document-picker` 57.0.3 | F-24 (Pliki), F-32 (import archiwum) | — |
| `expo-sharing` 57.0.24 | F-32 eksport, F-53 karta, F-57 zgłoszenie | — |
| `expo-store-review` 57.0.3 | BR-DAN-012 (prośba o ocenę) | własny `SKStoreReview` w Swift |
| `expo-localization` 57.0.2 | 35 lokalizacji (NFR-JEZ-001; mechanizm i18n wybiera rola 09) | — |
| `expo-iap` 5.8.1 | F-35 (ADR-0010) | 6.x, własny StoreKit |
| `@bacons/apple-targets` 5.0.0 (narzędzie buildu) | cele Live Activity, zegarek, rozszerzenie (ADR-0007) | `expo-widgets` (bez intencji, rejestr Expo 6d) |
| Moduły Swift w `modules/` | CloudKit (ADR-0005), PencilKit + PDFKit (ADR-0011, ADR-0012), dziennik +1 (ADR-0008), WatchConnectivity (ADR-0009), `beginBackgroundTask` (ADR-0004) | biblioteki społeczności (opcja B) |
| Archiwum ZIP | ADR-0004 | **[DO USTALENIA, rola 08 z 05]**: kryteria — zapis i odczyt strumieniowy (archiwum do ok. 415 MB, E0 §3), bez wczytania całości do pamięci, manifest prywatności; kandydaci: moduł Swift na API systemu albo biblioteka natywna; wybór po próbie na symulatorze z plikiem 400 MB |
Nawigacja (np. `expo-router`) i `react-native-svg`: decyzja roli 08 przy ekranach, jeśli projekt 04 ich wymaga (nowy wiersz tej tabeli). Bez `qrcode`, bez SDK analityki, raportowania awarii (rola 12 decyduje osobno) i reklam.

### Konsekwencje
- Dobre: 14 pakietów runtime, wszystkie z Expo SDK albo P-036; manifesty znane.
- Złe: pięć modułów Swift do utrzymania; ZIP nierozstrzygnięty do próby.

### Potwierdzenie
- CI (07): `package.json` bez `^`/`~` dla `expo-iap` i `@bacons/apple-targets`; pakiety `expo-*` zgodne z `npx expo install --check`; każda nowa zależność wymaga wiersza w tej tabeli (kontrola listy w CI); ponowne `find node_modules -name PrivacyInfo.xcprivacy` porównane z `docs/architektura/narzedzia/privacy-pliki-e3.txt`.
- Grep: brak pakietów z listy zakazanej (analityka, reklamy, `IAPKit`).

## Opcje: zalety i wady
### A — zalety: mało zależności, znane manifesty · wady: kod Swift.
### B — zalety: mniej własnego kodu · wady: młode lub nieutrzymywane paczki w krytycznych miejscach (rejestr Expo 10).
### C — zalety: kod poprzedniej wersji do ponownego użycia · wady: zależności bez przepływu w kontrakcie (zasada architekta 1).
