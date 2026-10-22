# 0008. +1 z ekranu blokady: `LiveActivityIntent` dopisuje zdarzenie do dziennika w kontenerze aplikacji, aplikacja scala dziennik do bazy
Data: 2026-10-22 · Status: proponowana · Rola: 05 (E1) · Zależy od: P-070 (3a), ZAL-030, ADR-0002, ADR-0005, ADR-0007, F-11, F-21, U-4, KP-12, KP-13, P-067

## Kontekst i problem
`LiveActivityIntent.perform()` działa „in the app’s process”, a system uruchamia aplikację „without opening the app” (rejestr Apple 1e, 1f); JS może wtedy nie działać. `expo-sqlite` ma własną kopię SQLite (rejestr Expo 13), a dwie kopie SQLite w jednym procesie mogą uszkodzić bazę (rejestr SQLite 9c). Zapis musi się zamknąć przed zawieszeniem (`0xdead10cc`, rejestr Apple 2b). Live Activity: dane ≤ 4 KB, do 8 h aktywna, do 12 h na ekranie blokady (1a, 1b). Czy przycisk działa bez odblokowania: dokumentacja sprzeczna (1g, ZAL-030) — ryzyko przyjęte (P-070 (3a)). Strażnik limitu: +1 z każdego urządzenia zaczyna dzień (P-067), a w nowym dniu ponad limit +1 jest zastąpione komunikatem (P-065 (1a), KP-12, KP-13).

## Czynniki decyzji
Brak uszkodzenia bazy · zero utraty stuknięć (NFR-DAN-002) · limit dni przestrzegany także na ekranie blokady · zapis krótki.

## Rozważane opcje
A. Intencja (Swift) dopisuje zdarzenie `{id: UUID, licznik, rodzaj: plus, czas, rodzice: [ostatnie znane id]}` jedną linią JSON do pliku `Application Support/dziennik-plus.jsonl` (`O_APPEND`, `fsync`, z `ProcessInfo.beginActivity` na czas zapisu), aktualizuje stan Live Activity (wartość + 1), i kończy. Aplikacja przy każdym przejściu na pierwszy plan i przy starcie przenosi dziennik do bazy funkcją `scal` (idempotencja po UUID, M-02) w kolejce zapisów, potem skraca plik. Stan limitu na ekranie blokady: aplikacja przy starcie Live Activity i po każdym zapisie wpisuje do jej stanu `{wartosc, glowa, dzienDozwolony}` (wynik `mozeZaczacDzien` na dziś); gdy dzień niedozwolony albo po północy (L-04) intencja nie dopisuje +1, a Live Activity pokazuje komunikat limitu (P-065 (1a)).
B. Intencja zapisuje bezpośrednio do `oczko.db` przez natywną część `expo-sqlite` (ta sama kopia SQLite).
C. Przycisk otwiera aplikację (`openAppWhenRun`), Live Activity tylko pokazuje rząd i czas.

## Decyzja
Opcja A. Plik dziennika w kontenerze aplikacji (intencja działa w procesie aplikacji, więc App Group nie jest potrzebna dla dziennika). Jedna klasa Swift `DziennikPlus` z kolejką szeregową obsługuje zapis z intencji i odczyt dla JS (moduł Expo), więc nie ma wyścigu w procesie. Stoper (F-21) w Live Activity: system rysuje upływ czasu od zapisanego znacznika startu (zasada 4 modułu tła), bez odliczania w kodzie.

### Konsekwencje
- Dobre: żadnego drugiego klienta SQLite; zapis jednej linii trwa krótko; dziennik przeżywa zabicie procesu; scalanie testowane tymi samymi wektorami co zegarek i iCloud.
- Złe: między stuknięciem a scaleniem baza nie zna +1 (eksport w tym czasie musi najpierw scalić dziennik); decyzja limitu na ekranie blokady opiera się na stanie wpisanym przez aplikację (po północy intencja nie zna nowego dnia, dopóki aplikacja go nie policzy → bezpieczny domyślny: po zmianie daty intencja sama wylicza „nowy dzień” i stosuje regułę z wektorów L-04/S-*, zaimplementowaną w Swift i sprawdzaną wspólnymi wektorami, ADR-0007).
- Ryzyko szczątkowe: działanie bez odblokowania (ZAL-030); restart telefonu bez odblokowania — plik niedostępny (rejestr Apple 3a), intencja zwraca błąd, Live Activity pokazuje „Unlock to count” (tekst: 04).

### Potwierdzenie
- Wektory domeny: dziennik scalony dwa razy = brak duplikatów (M-02); +1 z dziennika po zerowaniu znanym (M-07); +1 z dziennika równoległe z +1 w aplikacji od tej samej głowy → `konflikt` (M-04).
- Test Swift (XCTest w CI): 1000 równoległych dopisań z dwóch wątków → 1000 poprawnych linii; uszkodzona ostatnia linia (przerwany zapis) pomijana i raportowana, poprzednie zachowane.
- Test UI na symulatorze (07): stuknięcie w Live Activity przy odblokowanym symulatorze dodaje rząd po powrocie do aplikacji; scenariusz zablokowanego telefonu — krok na urządzeniu niewykonywany (P-041), ryzyko w kontrakcie.
- Kontrola: brak `import SQLite3` w celach Swift (grep w CI).

## Opcje: zalety i wady
### A — zalety: brak drugiej kopii SQLite, krótki zapis, idempotencja · wady: opóźnione scalenie, logika limitu na ekranie blokady powielona w Swift.
### B — zalety: natychmiast w bazie · wady: natywne API `expo-sqlite` nie jest publicznym kontraktem; transakcja w procesie uruchomionym w tle zwiększa ryzyko `0xdead10cc`; klucze obce trzeba włączyć na kolejnym połączeniu.
### C — zalety: zero ryzyka zapisu · wady: F-11 traci +1 (odrzucone przez właściciela, P-070 (3b)).
