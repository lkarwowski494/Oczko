# 0014. Build i CI: testy i build symulatora na runnerze macOS GitHub Actions; buildy do TestFlight — decyzja właściciela (Q6)
Data: 2026-10-22 · Status: proponowana (część TestFlight czeka na Q6) · Rola: 05 (E1) · Zależy od: P-041, NFR-KOS-001, ADR-0007

## Kontekst i problem
Weryfikacja tylko automatem (P-041), w tym testy na symulatorze iOS i zegarka (NFR-SYS-001, NFR-ZEG-001, NFR-DOS-001). Standardowe runnery GitHub, w tym macOS, są „free and unlimited” w repozytoriach publicznych (rejestr Apple 12). EAS Free: 0 USD, 15 buildów iOS/mies., kolejka o niskim priorytecie, limit 45 min (rejestr Expo 12a). Oficjalnego przepisu Expo na GitHub Actions nie znaleziono (12b, [DO USTALENIA]); `eas build --local` i `prebuild` + Xcode są opisane.

## Czynniki decyzji
Koszt 0 zł · brak sekretów w publicznym repo · powtarzalność · liczba buildów.

## Rozważane opcje
A. Wszystko na GitHub Actions macOS: testy Node, `expo prebuild`, `xcodebuild test` na symulatorach, a build do TestFlight `xcodebuild archive` + wysyłka z kluczem App Store Connect w sekretach GitHub (repo publiczne: sekrety niewidoczne w logach, ale dostępne dla workflow — tylko na `main`/tagach, nie dla PR z forków).
B. Testy i symulatory na GitHub Actions; buildy do TestFlight w EAS Free (poświadczenia podpisu przechowuje Expo, 15 buildów/mies.).
C. Wszystko w EAS (testy jednostkowe też) — EAS nie uruchamia testów UI na symulatorze w darmowym planie [DO USTALENIA], więc odpada dla P-041.

## Decyzja
Testy: A (GitHub Actions macOS). Buildy do TestFlight: A albo B — **decyzja właściciela Q6**, rekomendacja B (podpis poza publicznym repo, mniej kodu).

### Konsekwencje
- Dobre: testy natywne bez kosztu; P-041 wykonalne.
- Złe: czas runnera macOS dłuższy niż Linux (testy Node na Linuksie, macOS tylko dla natywnych); w B zależność od konta Expo.

### Potwierdzenie
- Workflow (07/10): zadanie Linux `npm test` + `npm run verify`; zadanie macOS `prebuild` + `xcodebuild test` (iOS 18 i najnowszy symulator).
- Kontrola sekretów: `git diff --cached` przed commitem, skan sekretów w CI; brak plików `.p8`, `.mobileprovision`, `.env` w repo.

## Opcje: zalety i wady
### A — zalety: jedno miejsce, bez limitu buildów · wady: klucz App Store Connect w sekretach publicznego repo, własny skrypt podpisu.
### B — zalety: podpis zarządzany, mało kodu · wady: limit 15/mies., kolejka niskiego priorytetu, konto Expo.
### C — zalety: jedno narzędzie · wady: brak testów UI na symulatorze w darmowym planie.
