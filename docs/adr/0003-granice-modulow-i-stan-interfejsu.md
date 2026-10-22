# 0003. Domena w czystym TypeScript z portami; stan interfejsu w komponentach i kontekście, baza jedynym źródłem prawdy
Data: 2026-10-22 · Status: **przyjęta** (P-071) · Rola: 05 (E1)

## Kontekst i problem
Reguły (limit dni `startDnia`/`wolaStraznika`/`mozeZaczacDzien`, strażnik tempa F-47, plan „co N rzędów” F-06, scalanie zdarzeń, procent postępu, obliczenia F-38) muszą być testowane w Node przed kodem (zasada architekta 6, P-041: tylko testy automatyczne). Poprzednia wersja miała logikę w ekranach (`app/(tabs)/settings.tsx` 40 KB, `stash.tsx` 41 KB; materiał P-004).

## Czynniki decyzji
Testowalność bez telefonu · pliki do ok. 20 KB · brak cykli · jedno źródło prawdy dla stanu trwałego.

## Rozważane opcje
Granice: A. `src/domena/` (czysty TS, bez importów frameworka) + porty implementowane w `src/dane/` i `src/platforma/`; ekrany wołają przypadki użycia. B. Logika w hookach i komponentach.
Stan interfejsu: C. stan komponentów + kontekst React; trwały stan tylko w bazie, odczyt przez przypadki użycia po zapisie. D. zewnętrzny magazyn stanu (np. Zustand/Redux) z kopią danych z bazy.

## Decyzja
A + C. Kierunek zależności: `ekrany → przypadki-uzycia → domena ← dane, platforma`; `konfiguracja.ts` czytają wszyscy, sam nie importuje nic. Szczegóły drzewa i porty w E2.

### Konsekwencje
- Dobre: wektory (`wektory-limitu.json`, `scal-wektory.json`) uruchamiane w Node; ekran nie trzyma drugiej kopii licznika, więc nie ma rozjazdu po zapisie z zegarka lub ekranu blokady.
- Złe: więcej plików i interfejsów; po każdym zapisie odczyt z bazy (koszt mierzony w E1-1 jako pomijalny).

### Potwierdzenie
- `docs/architektura/narzedzia/granice.mjs` (E3) w CI: `src/domena/**` nie importuje `react`, `react-native`, `expo-*`, `src/dane`, `src/platforma`; brak cykli; plik > 20 KB to błąd.
- Testy domeny bez jsdom i bez atrap natywnych.

## Opcje: zalety i wady
### A — zalety: testy przed kodem, wymiana adapterów · wady: dyscyplina granic.
### B — zalety: mniej plików · wady: testy wymagają renderowania; poprzednia wersja pokazała pliki 30–46 KB.
### C — zalety: brak drugiego źródła prawdy · wady: przekazywanie odświeżenia przez kontekst.
### D — zalety: wygodne subskrypcje · wady: kopia stanu trwałego w pamięci rozjeżdża się z bazą po zapisach spoza JS (dziennik ekranu blokady, zegarek); dodatkowa zależność.
