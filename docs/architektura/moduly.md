# Moduły, porty, maszyny stanów i konfiguracja (rola 05, E2, 2026-10-22)
Źródło decyzji: ADR-0002 (kolejka zapisów), ADR-0003 (granice), ADR-0007 (cele natywne), ADR-0008 (dziennik +1), ADR-0013 (maszyny stanów). Sygnatury są kontraktem dla roli 07 (testy) i 08 (kod); nie są kodem.

## Drzewo katalogów
```
src/
  domena/                 czysty TS: bez react, react-native, expo-*, src/dane, src/platforma (granice.mjs)
    limit.ts              startDnia, wolaStraznika, mozeZaczacDzien (z docs/monetyzacja/limit.mjs, wektory L-*, S-*, Z-*)
    dostep.ts             uprawnienia Pro z bieżących transakcji (z docs/monetyzacja/dostep.mjs, wektory W-*)
    scal.ts               scalanie zdarzeń licznika (z eksperymenty/e1/scal.mjs, iteracyjnie; wektory M-01–M-17; wynik zgodny | konflikt | czeka | blad)
    licznik.ts            wartość wyświetlana (skończone / w trakcie, RD-12 powtórzenia, licznik całości BR-LIC-018)
    straznik-tempa.ts     seria dodań RD-17
    przypomnienia.ts      plan rzędów i wyzwolenie RD-13 (F-06)
    postep.ts             procent F-60 (RD-14), termin i cel dzienny F-61 (RD-15), kalendarz F-59 (RD-16)
    obliczenia/           F-38: reguły z rejestru roli 06 (RD-01, RD-03, RD-04, RD-10), rozmiar drutu RD-11
    maszyny/              projekt.ts, sesja.ts, synchronizacja.ts, import.ts (tabele przejść niżej)
    stany.ts              typy z docs/architektura/stany.json (jedna definicja z CHECK bazy)
    porty.ts              interfejsy portów (niżej), tylko typy
    bledy.ts              Wynik<T> = { ok: true, wartosc: T } | { ok: false, powod: Powod }
  przypadki-uzycia/       dodajRzad, cofnijSerie, wpiszWartosc, zakonczProjekt, importuj, eksportuj, … (domena + porty)
  konfiguracja.ts         jedyne miejsce liczb (tabela „Konfiguracja”)
  dane/
    baza/                 jedyne miejsce importu expo-sqlite: polaczenie.ts (pragma, migracje), kolejka.ts (ADR-0002), adapter-node.ts (testy)
    migracje/             0001.sql (= docs/architektura/schemat.sql v1), runner migruj.ts
    repozytoria/          projekty, liczniki, zdarzenia, sesje, wzory, zapas, dni-limitu, ustawienia (przyjmują PortBazy)
    pliki.ts              magazyn plików po SHA-256 (ADR-0001)
    archiwum.ts           eksport/import .oczko (ADR-0004)
  platforma/              adaptery: sklep (expo-iap 5.8.1), haptyka, ekran-aktywny, live-activity, zegarek, icloud, dziennik-plus, udostepnianie, czas-w-tle, zegar
  ekrany/, komponenty/    interfejs (04 projekt, 08 kod); wołają przypadki użycia lub hooki nad nimi
modules/                  moduły Expo (Swift): oczko-dziennik-plus, oczko-icloud, oczko-pencilkit, oczko-zegarek, oczko-czas-w-tle
targets/                  cele @bacons/apple-targets: widget (Live Activity + LiveActivityIntent), watch, share
```
Kierunek zależności: `ekrany → przypadki-uzycia → domena ← dane, platforma`; `konfiguracja.ts` importują wszyscy, sam nie importuje nic. Swift w `targets/` i `modules/` nie importuje `SQLite3` (ADR-0008). Kontrola: `docs/architektura/narzedzia/granice.mjs` (E3) i grep w CI.

## Porty domeny (sygnatury)
Zatwierdzone w fix 05 2026-10-25 (Z07-22) razem z sygnaturami przypadków użycia, danych i ekranów zaproponowanymi przez 07 w E3 (`src/przypadki-uzycia/**`, `src/dane/**`, `src/ekrany/**`). Ten blok jest równy deklaracjom `src/domena/porty.ts`; kontrola: `node docs/architektura/narzedzia/sprawdz-porty.mjs` (w `jakosc:kontrole`).
```ts
// src/domena/porty.ts — tylko typy
export interface PortBazy {                       // ADR-0002; adaptery: expo-sqlite (kolejka) i node:sqlite (testy)
  run(sql: string, params?: unknown[]): Promise<{ zmiany: number }>;
  all<T>(sql: string, params?: unknown[]): Promise<T[]>;
  transakcja<T>(fn: (tx: PortBazy) => Promise<T>): Promise<T>;   // wchodzi do kolejki; BEGIN IMMEDIATE … COMMIT na połączeniu z foreign_keys = ON
}
export interface Zegar { teraz(): { ms: number; strefa: string; dzien: string } }  // RD-16: dzień = data lokalna w strefie urządzenia
export interface Identyfikatory { nowy(): string }                                // UUID v4
export interface MagazynPlikow {                                                  // ADR-0001
  zapisz(zrodlo: string, rozszerzenie: string): Promise<Wynik<{ sha256: string; bajty: number }>>;
  sciezka(sha256: string): string;
  usun(sha256: string): Promise<void>;
  wolneMiejsce(): Promise<number>;            // required reason E174.1 (rejestr Apple 11d)
}
export interface DziennikPlus {                                                   // ADR-0008 (moduł Swift)
  odczytaj(): Promise<ZdarzenieWejsciowe[]>;  // linie po ostatnim skróceniu; uszkodzona linia → pominięta + błąd w diagnostyce
  skroc(doId: string): Promise<void>;
}
export interface LiveActivity { start(s: StanEkranuBlokady): Promise<Wynik<void>>; aktualizuj(s: StanEkranuBlokady): Promise<void>; zakoncz(): Promise<void> }
export interface Zegarek { wyslijStan(s: StanZegarka): Promise<void>; odbieraj(fn: (z: ZdarzenieWejsciowe[]) => void): () => void }
export interface Synchronizacja { wlacz(): Promise<Wynik<void>>; wylacz(): Promise<void>; stan(): StanSynchronizacji; zglosZmiane(encja: string, id: string): void }
export interface Sklep { produkty(): Promise<Produkt[]>; kup(id: string): Promise<Wynik<void>>; przywroc(): Promise<Wynik<void>>; transakcje(): Promise<Transakcja[]>; obserwuj(fn: () => void): () => void } // ADR-0010
export interface Haptyka { rzad(): void; przypomnienie(): void }               // dwa wzorce F-48; brak dźwięku (BR-LIC-005)
export interface EkranAktywny { wlacz(tag: string): void; wylacz(tag: string): void } // F-10, każdy tag wyłączany (rejestr Expo 7)
export interface CzasWTle { chron<T>(nazwa: string, fn: () => Promise<T>): Promise<T> } // beginBackgroundTask (rejestr Apple 17)
export interface SkrzynkaImportu { pobierz(): Promise<PlikWejsciowy[]>; usun(id: string): Promise<void> } // ADR-0011

export type StanEkranuBlokady = { licznikId: string; nazwa: string; wartosc: number; glowa: string | null; dzien: string; dzienDozwolony: boolean; sesjaStartMs: number | null }; // < 4 KB (rejestr Apple 1b)
export type StanZegarka = StanEkranuBlokady & { pro: boolean; proWaznoscDo: number | null; dniWMiesiacu: { dzien: string; pro: boolean }[] }; // ADR-0009
export type ZdarzenieWejsciowe = { id: string; licznikId: string; rodzaj: 'plus' | 'minus'; rodzice: string[]; czasMs: number; strefa: string; dzien: string; zrodlo: 'ekran_blokady' | 'zegarek'; urzadzenie: string };

// Typy pomocnicze portów (zaproponowane przez 07 w E3, zatwierdzone w fix 05 2026-10-25, Z07-22).
export type StanSynchronizacji = 'wylaczona' | 'aktywna' | 'blad' | 'brak_konta';
export type Produkt = { id: string; cenaWyswietlana: string; okres: 'miesiac' | 'rok' | 'dozywotni' };
export type Transakcja = { produkt: string; wygasa: number | null; odebrane: boolean; karencjaDo?: number | null }; // = Uprawnienie z docs/monetyzacja/dostep.mjs; karencjaDo: ADR-0010, KP-06
export type PlikWejsciowy = { id: string; nazwa: string; sciezka: string; typ: string };

// Archiwum, migracje i katalogi (ADR-0004, dane.md; przeniesione z src/przypadki-uzycia/porty-propozycja.ts, Z07-22).
export interface Licznosci { [tabela: string]: number }    // tabela → liczba wierszy
export interface Katalogi { kopie: string; tymczasowy: string } // Application Support/kopie (dane.md), katalog tymczasowy importu
export interface Manifest { format: 'oczko'; wersja_formatu: number; wersja_schematu: number; aplikacja: string; utworzono: number; licznosci: Licznosci; pliki: { sha256: string; bajty: number }[] } // manifest.json archiwum `.oczko`
export type TrybImportu = 'scal' | 'zastap';
export interface ArchiwumSprawdzone { manifest: Manifest; katalog: string } // rozpakowane i sprawdzone w katalogu tymczasowym
export interface WynikImportu { tryb: TrybImportu | 'anulowano'; kopiaPrzed: string | null; licznosci: Licznosci }
export type Migracja = { wersja: number; sql: string; przebudowa?: boolean };
export interface Migruj { (baza: PortBazy): Promise<Wynik<{ z: number; do: number }>> }
export interface PortArchiwum {                                                   // implementacja: src/dane/archiwum.ts
  zapisz(katalogDocelowy: string): Promise<Wynik<{ sciezka: string; manifest: Manifest }>>; // VACUUM INTO + pliki + manifest
  sprawdz(sciezka: string): Promise<Wynik<ArchiwumSprawdzone>>;                              // manifest, wersje, SHA-256, miejsce; baza bez zmian
  kopiaPrzed(): Promise<Wynik<{ sciezka: string }>>;                                         // „kopia przed importem” (KOPIA_PRZED_IMPORTEM_DNI)
  wczytaj(a: ArchiwumSprawdzone, tryb: TrybImportu): Promise<Wynik<{ licznosci: Licznosci }>>;
}
```

## Scalanie (`scal`, fix 2026-10-25, Z07-13)
Prototyp i wyrocznia: `eksperymenty/e1/scal.mjs`, `scal-wektory.json` (M-01–M-17), `scal-test.mjs` (każda permutacja wejścia, 150 000 zdarzeń), `mutanty-scal.mjs` (w `jakosc:kontrole`).
- Iteracyjnie (kolejność topologiczna), bez rekurencji; budżet: łańcuch 150 000 zdarzeń (szacunek 3 lat, ADR-0005) w jednym wywołaniu.
- Wynik: `zgodny { wartosc, glowy }` | `konflikt { glowy, kandydaci: [{ glowa, wartosc }] }` | `czeka { brakujacy }` | `blad { powod, id }`. Typ TS dostaje wariant `blad` w commicie 08, który wdraża `scal.ts` (razem z dopasowaniem pomocnika testów 07).
- `blad` (dane, których nie da się scalić bez zgadywania; zawsze ten sam wynik dla każdej kolejności wejścia, `id` = najmniejsze winne): `kolizja_id` (to samo `id`, inna treść; identyczny duplikat = idempotencja, M-02), `nieznany_rodzaj` (M-15), `wiele_rodzicow` (zmiana inna niż `rozstrzygniecie` z > 1 rodzicem, M-09; tylko rozstrzygnięcie łączy gałęzie), `cykl` (M-12, M-13). Przypadek użycia: licznik pokazuje ostatnią zapisaną wartość (`licznik.wartosc`), wpis w `blad` (F-57), bez zapisu wyniku.
- `czeka`: przypadek użycia nie woła `scal` z niekompletną historią. Zdarzenia bez rodzica (albo bez encji licznika) trafiają do poczekalni (ADR-0005, uzupełnienie), a `scal` dostaje tylko zdarzenia z kompletnymi przodkami (P-110 Q1a).
- Cofnięcie (P-091 (3a), ER-41): `cofniecie` dotyczy ostatniej zmiany albo serii na końcu historii; pomyłkę ze środka historii poprawia się wpisaniem wartości (M-08b).
- Import „scal” (ER-42): zdarzenia z archiwum to kolejne dostarczenia — ten sam `id` = jedno zdarzenie, rozbieżna gałąź = konflikt jak przy iCloud, drugi import tego samego pliku nic nie zmienia (M-16).

## Stan Live Activity i zegarka, wersja 2 (fix 2026-10-25, Z07-12)
Wersja 1 (`StanEkranuBlokady`, `StanZegarka` w „Porty domeny”) nie wystarcza intencji i zegarkowi bez JS: brak dni limitu i Pro na ekranie blokady (po północy intencja liczy nowy dzień sama, ADR-0008 (6)), brak czasu ostatniego +1 (przerwa nowego dnia, `PRZERWA_NOWEGO_DNIA_MS`), znaczenia licznika (RD-12), przypomnień (RD-13) i wersji ładunku. Wersja 2 (jeden ładunek dla obu celów, jeden dekoder Swift):
```ts
export type PrzypomnienieStanu = { od: number; co: number; razy: number; tekst: string }; // plan RD-13; tekst ucięty do STAN_PRZYPOMNIENIE_TEKST_MAKS znaków
export type StanEkranuBlokadyV2 = { wersja: number; licznikId: string; nazwa: string; wartosc: number; znaczenie: 'skonczone' | 'w_trakcie'; glowa: string | null; ostatniPlusMs: number | null; dzien: string; dzienDozwolony: boolean; sesjaStartMs: number | null; pro: boolean; proWaznoscDo: number | null; dniWMiesiacu: { dzien: string; pro: boolean }[]; przypomnienia: PrzypomnienieStanu[] }; // wersja = 2
export type StanZegarkaV2 = StanEkranuBlokadyV2;
```
- `pro`, `proWaznoscDo`: dostęp z `docs/monetyzacja/dostep.mjs` w chwili wysłania; `proWaznoscDo` = koniec uprawnienia (późniejsza z dat `wygasa` i `karencjaDo`, ADR-0010), `null` = bez końca (dożywotni), nie „wygasło” (R-031). Na zegarku i w intencji ocenia je `proZegarka` (KP-17) w pakiecie Swift reguł (ADR-0007, uzupełnienie).
- `dniWMiesiacu`: wiersze `dzien_limitu` z miesiąca dnia `dzien`, rosnąco (wejście `mozeZaczacDzien` w Swift); `ostatniPlusMs`: czas ostatniej zmiany licznika (intencja aktualizuje go sama, ADR-0008 (1)).
- `nazwa` ucięta do `STAN_NAZWA_MAKS_ZNAKOW` znaków, najwyżej `STAN_PRZYPOMNIENIA_MAKS` przypomnień: ładunek < 4 KB (rejestr Apple 1b) także dla nazwy z 3-bajtowych znaków UTF-8.
- Czytelnik pomija nieznane pola (vN czyta vN+1); dekoder Swift odrzuca ładunek z `wersja` większą niż znana i bez wymaganego pola (bez wartości domyślnych, X-ST-01), a Live Activity pokazuje wtedy ostatni poprawny stan.
- **Przełączenie v1 → v2** (jeden commit 07 + 08, kolejność z `tests/wspolne/README.md`): typy v2 zastępują v1 w „Porty domeny” (`porty.ts`), pliki `tests/wspolne/stan-*.json` i `wzorce.json` (`wersja_kontraktu: 2`, pliki v1 jako `*-v1.json` dla zgodności) uzupełnione, listy pól w `tests/jakosc/zlote-pliki.test.ts` i wejście `stanZegarka` w `tests/akceptacja/domena/luki/zegarek.test.ts` dopasowane; złote pliki stanu od tej chwili tworzy generator z kodu TS (`stanZegarka`, jak generator tekstów Swift w ADR-0017), a test pilnuje, że generator i pliki się zgadzają.

## Ścieżka zapisu +1 (przypadek użycia `dodajRzad`)
Jedna transakcja w kolejce (ADR-0002), bez `await` na nic poza bazą:
1. odczyt licznika (`wartosc`, `glowa`, `zablokowany`, `konflikt`) i dni limitu miesiąca;
2. `zablokowany` → `{ ok: false, powod: 'zablokowany' }` (F-03); `wolaStraznika({ rodzaj })` → jeśli `true`, `startDnia(...)`; niedozwolone → `{ ok: false, powod: 'limit' }` (ekran pokazuje limit zawczasu, więc w praktyce dotyczy wyścigu o północy, L-04);
3. `INSERT zdarzenie` (rodzice = `[glowa]`), `UPDATE licznik SET wartosc, glowa`, zapis `dzien_limitu` instrukcją `zapis-dnia-limitu.sql` z `dane.md` (gdy dzień się zaczął; UPSERT z `pro = max(pro, excluded.pro)`, P-109), `UPDATE projekt SET ostatnia_praca_ms`;
4. `COMMIT`; dopiero potem haptyka, odświeżenie ekranu, `LiveActivity.aktualizuj`, `Zegarek.wyslijStan`.
Błąd w kroku 3: `ROLLBACK`, `{ ok: false, powod: 'zapis' }`, ekran pokazuje „Couldn’t save that row…” z ponowieniem (design-spec), wpis w `blad`.

Mapowanie rodzaju zdarzenia na `wolaStraznika` (P-067): `plus` → `plus`; `wpisanie` → `wpisanie`; `minus` → `minus`; `zerowanie` → `zerowanie`; `cofniecie`, `rozstrzygniecie` → `edycja-historii` (nie zaczynają dnia).

## Maszyny stanów (tabele przejść; stany z `stany.json`)
### Projekt (F-19, F-33)
| Stan | Zdarzenie | Nowy stan | Warunek / skutek |
|---|---|---|---|
| w_toku | ukoncz | ukonczony | `ukonczono_ms = teraz`; pytanie o zużycie włóczki (U-9); karta (F-53) |
| ukonczony | wznow | w_toku | `ukonczono_ms = NULL` |
| dowolny | usun | (ten sam) + `usunieto_ms` | widoczny w „Ostatnio usunięte” 30 dni (`KOSZ_DNI`) |
| usunięty | przywroc | (ten sam), `usunieto_ms = NULL` | |
| usunięty, `teraz − usunieto_ms ≥ KOSZ_DNI` | sprzatanie przy starcie | — (DELETE, kaskada) | pliki bez odwołań usuwane po COMMIT |
Niedozwolone (błąd domeny): `ukoncz` z `ukonczony`, `wznow` z `w_toku`, każda zmiana licznika w projekcie usuniętym.

### Sesja stopera (F-21, F-51)
| Stan | Zdarzenie | Nowy stan | Skutek |
|---|---|---|---|
| (brak) | start | trwa | `start_ms`; Live Activity z `sesjaStartMs`; jedna otwarta sesja (UNIQUE) |
| trwa | wstrzymaj | wstrzymana | `wstrzymano_ms` |
| wstrzymana | wznow | trwa | `przerwy_ms += teraz − wstrzymano_ms`, `wstrzymano_ms = NULL` |
| trwa / wstrzymana | zakoncz | zakonczona | `koniec_ms`; czas = `koniec − start − przerwy` |
| zakonczona | koryguj | zakonczona | `skorygowano = 1`, nowe `start_ms`/`koniec_ms` (`koniec ≥ start`) |
| trwa, `teraz − start_ms ≥ SESJA_MAKS_H` | start aplikacji | zakonczona | `koniec_ms = start + SESJA_MAKS_H`, oznaczona do korekty (zapomniany stoper) |
Po zabiciu procesu sesja „trwa” odtwarza się ze znacznika (zasada 4 modułu tła).

### Synchronizacja iCloud (F-27, F-58)
| Stan | Zdarzenie | Nowy stan |
|---|---|---|
| wylaczona | wlacz (przełącznik) | aktywna albo brak_konta |
| aktywna | błąd sieci / limit iCloud | blad (komunikat jednym zdaniem, ponowienie systemowe) |
| aktywna | konto wylogowane | brak_konta |
| blad / brak_konta | ustąpienie przyczyny | aktywna |
| dowolny ≠ wylaczona | wylacz | wylaczona (dane lokalne zostają) |
Stany tej maszyny nie są w bazie (stan modułu natywnego), więc nie mają CHECK.

### Import archiwum (ADR-0004)
`sprawdzanie` (manifest, wersja, SHA-256, miejsce) → `odrzucony` (powód) | `gotowy` → wybór `scal` / `zastap` → `kopia_przed` (`VACUUM INTO`) → `wczytywanie` (krótkie transakcje w kolejce) → `gotowe` | `wycofany` (przywrócenie kopii przed). Na każdym etapie przed `wczytywanie` baza bez zmian.

## Konfiguracja (`src/konfiguracja.ts`)
| Nazwa (jednostka) | Wartość | Źródło |
|---|---|---|
| `LIMIT_DNI_W_MIESIACU` (dni) | 5 | P-057 (D2), `limit.mjs` |
| `PRZERWA_NOWEGO_DNIA_MS` (ms) | 3 600 000 | P-057 (D3), `limit.mjs` |
| `STRAZNIK_SERIA_ZDARZEN` (liczba dodań) | 3 | RD-17, P-047 |
| `STRAZNIK_OKNO_S` (s) | 2 | RD-17, P-047 |
| `KOSZ_DNI` (dni) | 30 | P-026 |
| `KOPIA_PRZED_IMPORTEM_DNI` (dni) | 30 | ADR-0004 (jak F-33) |
| `STAN_NAZWA_MAKS_ZNAKOW` (znaki) | 60 | [OCENA] roli 05 (Z07-12): nazwa na ekranie blokady i zegarku; ładunek < 4 KB (rejestr Apple 1b) |
| `STAN_PRZYPOMNIENIA_MAKS` (liczba) / `STAN_PRZYPOMNIENIE_TEKST_MAKS` (znaki) | 3 / 40 | [OCENA] roli 05 (Z07-12): plan przypomnień w stanie Live Activity i zegarka |
| `SESJA_MAKS_H` (h) | 8 | P-072 (7a); limit Live Activity 8 h (rejestr Apple 1a) |
| `WERSJA_SCHEMATU` (-) | 1 | `schemat.sql` |
| `WERSJA_FORMATU_ARCHIWUM` (-) | 1 | ADR-0004 |
| `ROZSZERZENIE_ARCHIWUM` | `.oczko` | ADR-0004 |
| `ZAPAS_MIEJSCA_EKSPORTU` (×rozmiar) | 2 | [OCENA] roli 05: archiwum + plik tymczasowy; do korekty po pomiarze |
| `BLEDY_MAKS_WIERSZY` (wiersze) | 200 | [OCENA] roli 05 (F-57: ostatnie błędy bez treści) |
| `PARTIA_SYNCHRONIZACJI` (wiersze na transakcję) | 200 | [OCENA] roli 05: krótkie transakcje przy scalaniu iCloud i importu (E3 §1); do korekty po pomiarze |
| `MIN_IOS` / `MIN_WATCHOS` | 18.0 / 11.0 | P-070, ADR-0006 |
| `PRODUKTY_PRO` (ID) | [DO USTALENIA] | P-038 (przy konfiguracji App Store Connect) |
| `CENY` | z App Store (StoreKit), nie z kodu | P-057, KP-* |
| Liczby obliczeń F-38, tabela drutów RD-11 | [DO USTALENIA] | rejestr merytoryczny roli 06 (D-027) |
