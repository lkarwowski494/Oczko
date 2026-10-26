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
Kierunek zależności: `ekrany → przypadki-uzycia → domena ← dane, platforma`; `konfiguracja.ts` importują wszyscy, sam nie importuje nic. Swift w `targets/` i `modules/` nie importuje `SQLite3` (ADR-0008). Kontrola: `docs/architektura/narzedzia/granice.mjs` (fix 2026-10-25, Z07-16: importy rozwiązywane kompilatorem TS z `tsconfig.json`; reguły DOMENA, KONFIGURACJA, SQLITE, EKRANY, IOS, SWIFT, ROZMIAR, CYKL, PUSTO; fikstury negatywne `granice-test/obejscia/` w `jakosc:kontrole`). Na `src` jest bramką dopiero po usunięciu kodu 0.1.0 (partia porządkowa 08, P-099 D1a); dziś informacyjnie w `jakosc:info` (14 naruszeń, wszystkie w `core/`, `components/`, `screens/`).

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
  odczytaj(): Promise<ZdarzenieWejsciowe[]>;  // linie po ostatnim skróceniu; uszkodzona linia → pominięta + błąd w diagnostyce; zdarzenie ze sklejonej linii odzyskane (ADR-0008 (8R))
  skroc(doId: string): Promise<void>;         // do doId włącznie (także w linii sklejonej) + ucięty ogon bez \n za doId (ADR-0008 (8S)); zapis linii: (8A), tylko Swift
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
export type ZdarzenieWejsciowe = { id: string; licznikId: string; rodzaj: 'plus' | 'minus'; rodzice: string[]; czasMs: number; strefa: string; dzien: string; zrodlo: 'ekran_blokady' | 'zegarek'; urzadzenie: string; pro: boolean }; // pro: uprawnienie urządzenia w chwili stuknięcia (P-111 (2), ADR-0008 (6))

// Typy pomocnicze portów (zaproponowane przez 07 w E3, zatwierdzone w fix 05 2026-10-25, Z07-22).
export type StanSynchronizacji = 'wylaczona' | 'aktywna' | 'blad' | 'brak_konta' | 'konto_zmienione'; // konto_zmienione: ADR-0005, P-110 Q9a
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

## Funkcje domeny (sygnatury)
Zatwierdzone w fix-2 05 2026-10-25 (NZ-08-P1-05, P-118 S1): sygnatury dopisane przez 08 w partii 1 (P-114 Q2a). Nazwy i kształt wejścia funkcji limitu i dostępu = prototypy roli 02 (`docs/monetyzacja/limit.mjs`, `dostep.mjs`; wyrocznia: ich wektory); pozostałe = reguły BRD (RD-13, RD-15, RD-20). Kolumna „Błąd” mówi, jak funkcja zgłasza złe wejście.
| Funkcja (plik w `src/domena`) | Sygnatura | Błąd | Wyrocznia |
|---|---|---|---|
| `limit.ts` | `wznowienieLimitu(w: { dzis: string }): string` | `BladDanych` | wektory `wznowienieLimitu` (02), R-105 |
| `limit.ts` | `cofniecieSerii(w: { dni: DzienLimitu[]; dzienSerii: string; seriaZaczelaDzien: boolean; inneDodaniaDnia: number; zrodlo: 'pytanie-serii' \| 'historia' }): { dni: DzienLimitu[]; zwrocono: boolean }` | `BladDanych` | wektory `cofniecieSerii` (02), L-19 |
| `limit.ts` | `scalDni(w: { a: DzienLimitu[]; b: DzienLimitu[] }): DzienLimitu[]` | `BladDanych` | wektory `scalDni` (02), L-20 |
| `limit.ts` | `oknoUczciweZasady(w: { dni: DzienLimitu[]; dzis: string; widziane: boolean; poziom: 'darmowa' \| 'pro' \| 'niepewny'; ekran: string }): boolean` | `BladDanych` | wektory `oknoUczciweZasady` (02), KP-16 |
| `dostep.ts` | `komunikatZakupu(status: string): 'sukces' \| 'czeka' \| 'blad' \| null` | `BladDanych` (nieznany status) | wektory K-* (02) |
| `przypomnienia.ts` | `przypomnienieWpisania(a: number, b: number, plan: PlanPrzypomnienia): Wynik<number \| null>` | `Wynik` (`bledne_dane`) | RD-13-W6–W10 |
| `przypomnienia.ts` | `planPrzypomnien(plan: PlanPrzypomnienia): Wynik<number[]>` | `Wynik` (`bledne_dane`) | RD-13-W1–W5 (F-06) |
| `postep.ts` | `dniDoTerminu(dzis: string, termin: string): Wynik<number>` | `Wynik` (`bledne_dane`) | RD-15-W8–W10 |
| `postep.ts` | `poczatekTygodnia(dzien: string): Wynik<string>` | `Wynik` (`bledne_dane`) | RD-20 |

**Zasada błędów (P-118 Q1a, polityka: `e3-tlo-bledy-prywatnosc-wydajnosc.md` §2):** wejście, które może być złe w normalnym działaniu → wartość; wejście z kontraktu poprawne → `BladDanych`. Przypisanie funkcji domeny partii 1:
| Funkcja | Skąd wejście | Styl |
|---|---|---|
| `startDnia`, `mozeZaczacDzien`, `wolaStraznika`, `rodzajStraznika`, `wznowienieLimitu`, `cofniecieSerii`, `scalDni`, `oknoUczciweZasady` | wiersze `dzien_limitu` i `zdarzenie` pod CHECK, `Zegar`, rodzaj zdarzenia z listy `stany.json` | `BladDanych` (bez zmian) |
| `komunikatZakupu` | status zmapowany przez adapter sklepu z wyliczenia biblioteki | `BladDanych` (bez zmian) |
| `odczytajPamiec` | plik pamięci uprawnień (może być uszkodzony) | wartość: `null` = brak ważnej pamięci (bez zmian) |
| `scal` | zdarzenia z synchronizacji, importu i dziennika | wariant `blad` (W1: także `zla_wartosc` zamiast wyjątku) |
| `klasyfikujGrubosc` | próbka wpisana przez użytkowniczkę | wariant `blad_danych` (bez zmian) |
| `przelicz`, `rozmiarUS` | liczba wpisana w kalkulatorze F-38 | **`Wynik<number>` / `Wynik<string \| null>` z `bledne_dane`** — zmiana kontraktu: 08 z 07 w partii ekranu narzędzi (dziś `BladDanych`) |
| funkcje z `Wynik` (`przypomnienia.ts`, `postep.ts`, `licznik.ts`, `obliczenia/oczka.ts`, maszyny stanów) | wpis użytkowniczki albo dane z bazy | `Wynik` (bez zmian; dopuszczalne także przy wejściu z bazy) |

**Informowanie o Pro (fix-2, P-118 I1; P-113 Q2a, P-117 Q1a):**
- `pokazOknoUczciweZasady` (`src/domena/informacje-pro.ts`) dubluje `oknoUczciweZasady` z `limit.ts` (dwie implementacje jednej odpowiedzialności, ARCH-02): w 1.0 zostaje jedna funkcja `oknoUczciweZasady` (wyrocznia: wektory `oknoUczciweZasady` roli 02, KP-16); „dzień ukończony” liczy ona sama z listy dni.
- `pokazKartePoImporcie` i ekran `KartaPoImporcie` (`src/ekrany/InformacjePro.tsx`): **poza 1.0** — karta planów Pro tylko po imporcie z innej aplikacji (BR-DAN-007, F-29 PÓŹNIEJ), nie po przywróceniu własnej kopii; w 1.0 nie ma wywołującego, więc funkcja byłaby atrapą (zasada 18). 08 usuwa `informacje-pro.ts` i `KartaPoImporcie` w partii 2, 07 przenosi testy karty na listę „poza 1.0 (F-29)”. Kontrakt na F-29 (po decyzji o imporcie z innych aplikacji): `pokazKartePoImporcie(w: { pro: boolean; importUdany: boolean; zrodlo: 'inna_aplikacja' | 'kopia_oczka' }): boolean` = `!pro && importUdany && zrodlo === 'inna_aplikacja'`.

`BladDanych` (`src/domena/bledy.ts`): klasa wyjątku z polem `kod = 'BLAD_DANYCH'`; wołający rozpoznaje ją po `kod`, nie po dowolnym wyjątku. Wariant `blad` w `WynikScalenia` (P-111 (4)) — sekcja „Scalanie”.

## Scalanie (`scal`, fix 2026-10-25, Z07-13)
Prototyp i wyrocznia: `eksperymenty/e1/scal.mjs`, `scal-wektory.json` (M-01–M-17), `scal-test.mjs` (każda permutacja wejścia, 150 000 zdarzeń), `mutanty-scal.mjs` (w `jakosc:kontrole`).
- Iteracyjnie (kolejność topologiczna), bez rekurencji; budżet: łańcuch 150 000 zdarzeń (szacunek 3 lat, ADR-0005) w jednym wywołaniu.
- Wynik: `zgodny { wartosc, glowy }` | `konflikt { glowy, kandydaci: [{ glowa, wartosc }] }` | `czeka { brakujacy }` | `blad { powod, id }`. Typ TS dostaje wariant `blad` w commicie 08, który wdraża `scal.ts` (razem z dopasowaniem pomocnika testów 07).
- `blad` (dane, których nie da się scalić bez zgadywania; zawsze ten sam wynik dla każdej kolejności wejścia, `id` = najmniejsze winne): `kolizja_id` (to samo `id`, inna treść; identyczny duplikat = idempotencja, M-02), `nieznany_rodzaj` (M-15), `wiele_rodzicow` (zmiana inna niż `rozstrzygniecie` z > 1 rodzicem, M-09; tylko rozstrzygnięcie łączy gałęzie), `cykl` (M-12, M-13), `zla_wartosc` (fix-2, P-118 W1, M-18–M-20 w `eksperymenty/e1/scal-wektory-fix2.json` (08 przenosi je do `scal-wektory.json` razem ze zmianą `scal.ts`): zdarzenie łamiące niezmiennik `schemat.sql` — ustawienie bez nieujemnej liczby całkowitej, ±1 albo zerowanie z wartością; rekord z synchronizacji lub importu, więc wynik zamiast wyjątku, zasada błędów §2 E3). Kolejność kontroli: `kolizja_id` → `nieznany_rodzaj` → `zla_wartosc` → `wiele_rodzicow` → `czeka` → `cykl`. Przypadek użycia: licznik pokazuje ostatnią zapisaną wartość (`licznik.wartosc`), wpis w `blad` (F-57), bez zapisu wyniku.
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

## Czas w przypadkach użycia (fix 2026-10-25, Z07-18)
- **Jedno źródło czasu:** port `Zegar` (`teraz(): { ms, strefa, dzien }`); domena i przypadki użycia nie wołają `Date.now()` ani `new Date()` bez argumentu. Adapter produkcyjny: zegar systemu i strefa urządzenia. Build E2E (`EXPO_PUBLIC_E2E=1`): adapter z `src/platforma/tryb-e2e.ts` czyta argument startu `oczkoE2eTeraz` (e2e/README.md) i zwraca podaną chwilę plus czas, który upłynął od startu procesu (zegar biegnie, RD-17 liczy odstępy); w buildzie wydania argument jest ignorowany (kontrola `TRYB-E2E`, `sprawdz-workflowy.mjs`). Dzięki temu granica miesiąca, północ i nowy dzień limitu są scenariuszami E2E bez zmiany zegara symulatora.
- **Przeliczenie przy zmianie daty:** przy `AppState → active` i przy powiadomieniu o istotnej zmianie czasu (`significantTimeChange`: północ, zmiana strefy, ręczna zmiana zegara) aplikacja liczy od nowa: dzień (RD-16), stan limitu i strażnika (`mozeZaczacDzien`), cel dzienny i postęp (F-61), bieżący tydzień i miesiąc (F-59, BR-DNI-003), stan Live Activity (ADR-0008 (7)) i stan zegarka. Nic nie odlicza czasu `setInterval`; aplikacja otwarta przez północ przelicza się na tym powiadomieniu.
- **Zimny start:** kolejność `migruj → scalDziennik → domknięcie zapomnianych sesji → sprzatnijKosz` (start.ts), a pierwsze +1 czeka na odczyt pamięci uprawnień Pro z pliku (KP-06; synchronicznie przy starcie, bez sieci) — bez niego strażnik nie wie, czy dzień zaczyna się z Pro. Odczyt sklepu (sieć) aktualizuje stan później, nie blokuje +1.
- **Tydzień od poniedziałku dla wszystkich języków** (P-110 Q7, jak Trening): `PIERWSZY_DZIEN_TYGODNIA = 1`; podsumowanie tygodnia i kalendarz pokazują podpis „Weeks start on Monday” (tekst i tłumaczenia: 04, 09); bez modułu natywnego i bez danych CLDR o tygodniu. Parametr `pierwszyDzienTygodnia` w `podsumowanieTygodnia` (`src/dane/repozytoria/kalendarz.ts`) jest zawsze tą stałą.
- **Ukończone w tygodniu liczone po dacie lokalnej (fix-3 2026-10-26, P-123 pkt 4, P-124 Q5a; wdraża 08 w partii 3):** `podsumowanieTygodnia` liczy dziś `ukonczono_ms` w granicach dni UTC (`src/dane/repozytoria/kalendarz.ts:63-64`), więc w strefie ≠ UTC ukończenie blisko północy trafia do złego tygodnia (np. poniedziałek 01:30 w UTC+3 = niedziela 22:30 UTC → liczone w tygodniu poprzednim). Kontrakt: nowa kolumna `projekt.ukonczono_dzien TEXT` (data lokalna z `Zegar.teraz().dzien` w chwili ukończenia, jak `zdarzenie.dzien`, RD-16 — nie przeliczana później), SQL w `dane.md` „Data ukończenia”; zapytanie: `… AND ukonczono_dzien >= ? AND ukonczono_dzien < ?` z `[od, doWyl]`. `zmienDateUkonczenia` przyjmuje `ukonczonoDzien` obok `ukonczonoMs` (ekran wybiera datę lokalną; 04). Wyrocznia testu: poniedziałek 01:30 w UTC+3 (`ukonczono_dzien` = ten poniedziałek) → tydzień od tego poniedziałku; niedziela 23:30 w UTC−5 (poniedziałek 04:30 UTC) → tydzień tej niedzieli.

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
| dowolny, nieusunięty | usun | (ten sam) + `usunieto_ms` | widoczny w „Ostatnio usunięte” 30 dni (`KOSZ_DNI`) |
| usunięty | przywroc | (ten sam), `usunieto_ms = NULL` | |
| usunięty, `teraz − usunieto_ms ≥ KOSZ_DNI` i `ostatni_start_ms − usunieto_ms ≥ KOSZ_DNI` (poprzedni start też po terminie; zegar cofnięty, `teraz < usunieto_ms`, niczego nie usuwa) | sprzatanie przy starcie | — (DELETE, kaskada) | dwa kolejne starty potwierdzają datę, więc jednorazowy skok zegara w przód nie kasuje (P-110 Q5a, Z07-15); `ostatni_start_ms` (ustawienie) zapisywany na końcu każdego startu; pliki bez odwołań usuwane w tej samej operacji kolejki (niżej) |
Niedozwolone (błąd domeny): `ukoncz` z `ukonczony`, `wznow` z `w_toku`, każda zmiana licznika w projekcie usuniętym. Projekt w koszu: `ukoncz`, `wznow` i ponowne `usun` niedozwolone (`niedozwolone_przejscie`), jedyne dozwolone przejście to `przywroc`; ponowne `usun` nie przesuwa terminu `usunieto_ms`, a trwałego usunięcia z kosza w 1.0 nie ma (BR-DAN-008) (fix-2, P-118 W8).

**Funkcja sprzątania kosza** (fix-2 2026-10-25, P-118 W2): warunek dwóch startów należy do domeny, bo chroni przed utratą danych i ma być testowany w Node (ARCH-03). Sygnatura: `doSprzatniecia(p, terazMs, ostatniStartMs: number | null, koszDni): boolean`; przypadek użycia startu czyta `ostatni_start_ms` z `ustawienie` (dane.md) **przed** sprzątaniem i zapisuje nowy na końcu startu. `true` tylko, gdy wszystkie warunki: projekt usunięty, `usunietoMs ≤ ostatniStartMs ≤ terazMs`, `terazMs − usunietoMs ≥ koszDni × 86 400 000` i `ostatniStartMs − usunietoMs ≥ koszDni × 86 400 000`. Wyrocznia (D = `koszDni × 86 400 000`, `u` = `usunietoMs`):
| Przypadek | `terazMs` | `ostatniStartMs` | Wynik |
|---|---|---|---|
| projekt nieusunięty | dowolny | dowolny | `false` |
| pierwszy start po aktualizacji / brak klucza | `u + 2D` | `null` | `false` (czeka na następny start) |
| dwa starty po terminie | `u + D + 1` | `u + D` | `true` (granica: równość daje `true`) |
| jednorazowy skok zegara w przód | `u + 60 dni` | `u + 1 dzień` | `false` |
| zegar cofnięty między startami | `u + D` | `u + 2D` (> `terazMs`) | `false` |
| zegar cofnięty przed usunięcie | `u − 1` | `u + D` | `false` |

**Sprzątanie plików** (ADR-0001, fix 2026-10-25, Z07-15): plik bez odwołań usuwa ta sama operacja kolejki zapisów, która usunęła ostatnie odwołanie (po `COMMIT`, przed następną operacją kolejki); sprzątanie przy starcie pomija pliki z `plik.utworzono_ms` młodszym niż `PLIKI_OCHRONA_MIN` i nie działa, gdy maszyna importu jest w stanie innym niż bezczynny (plik zapisany do magazynu przed wierszem, który go wskaże — import archiwum, import wzoru).

**Powrót do miejsca** (F-49): gdy `ostatnie_miejsce` wskazuje obiekt usunięty albo w koszu, aplikacja otwiera listę projektów i usuwa klucz `ostatnie_miejsce` (bez komunikatu; fix 2026-10-25, Z07-15).

### Sesja stopera (F-21, F-51)
| Stan | Zdarzenie | Nowy stan | Skutek |
|---|---|---|---|
| (brak) | start | trwa | `start_ms`; Live Activity z `sesjaStartMs`; jedna otwarta sesja (UNIQUE) |
| trwa | wstrzymaj | wstrzymana | `wstrzymano_ms` |
| wstrzymana | wznow | trwa | `przerwy_ms += teraz − wstrzymano_ms`, `wstrzymano_ms = NULL` |
| trwa / wstrzymana | zakoncz | zakonczona | `koniec_ms`; czas = `koniec − start − przerwy` |
| wstrzymana | zakoncz | zakonczona | jak wyżej, a najpierw `przerwy_ms += teraz − wstrzymano_ms`, `wstrzymano_ms = NULL`: koniec w pauzie dolicza bieżącą przerwę, bo czas pauzy nie jest dzierganiem (fix-2, P-118 W6; jedyna reguła zgodna z formułą P-072) |
| zakonczona | koryguj | zakonczona | `skorygowano = 1`, nowe `start_ms`/`koniec_ms` (`koniec ≥ start`) |
| trwa, `teraz − start_ms ≥ SESJA_MAKS_H` | start aplikacji | zakonczona | `koniec_ms = start + SESJA_MAKS_H`, `do_korekty = 1` (zapomniany stoper) |
| trwa / wstrzymana | scalenie przynosi otwartą sesję z wcześniejszym `start_ms` | zakonczona | `koniec_ms = start_ms`, `do_korekty = 1` (ADR-0005, uzupełnienie) |
Po zabiciu procesu sesja „trwa” odtwarza się ze znacznika (zasada 4 modułu tła).

### Synchronizacja iCloud (F-27, F-58)
| Stan | Zdarzenie | Nowy stan |
|---|---|---|
| wylaczona | wlacz (przełącznik) | aktywna albo brak_konta |
| aktywna | błąd sieci / limit iCloud | blad (komunikat jednym zdaniem, ponowienie systemowe) |
| aktywna | konto wylogowane | brak_konta |
| blad / brak_konta | ustąpienie przyczyny | aktywna |
| dowolny ≠ wylaczona | wylacz | wylaczona (dane lokalne zostają) |
| aktywna / blad / brak_konta | zmiana konta (`switchAccounts` albo `signIn` innego użytkownika, rejestr Apple 21c) | konto_zmienione (wysyłka zatrzymana, pytanie; ADR-0005, P-110 Q9a) |
| konto_zmienione | polacz | aktywna (pełne ponowne wysłanie lokalnych rekordów, scalenie przez `scal`) |
| konto_zmienione | nie_synchronizuj | wylaczona (dane lokalne zostają) |
Stany tej maszyny nie są w bazie (stan modułu natywnego), więc nie mają CHECK. Zdarzenie spoza tabeli → stan bez zmian (fix-2 2026-10-25, P-118 W5): zdarzenia przychodzą z modułu natywnego i mogą się powtarzać (np. drugie „ustąpienie przyczyny”), więc idempotentny brak zmiany, a nie błąd — inaczej niż w maszynach projektu i importu, gdzie przejście wywołuje użytkowniczka.

### Import archiwum (ADR-0004)
`sprawdzanie` (manifest, wersja, SHA-256, miejsce) → `odrzucony` (powód) | `gotowy` → wybór `scal` / `zastap` → `kopia_przed` (`VACUUM INTO`) → `wczytywanie` (krótkie transakcje w kolejce) → `gotowe` | `wycofany` (przywrócenie kopii przed). Na każdym etapie przed `wczytywanie` baza bez zmian. `blad` przed `wczytywanie` (np. `VACUUM INTO` bez miejsca w `kopia_przed`) → `odrzucony` z powodem; ten sam krok usuwa niepełny plik kopii przed (fix-2 2026-10-25, P-118 W3). `bazaZmieniona(s)` = „ta operacja zmieniała bazę”: `false` przed `wczytywanie`, `true` w `wczytywanie`, `gotowe` i `wycofany` — po wycofaniu dane równe kopii przed, ale przypadek użycia i tak odświeża odczyty ekranów, stan Live Activity i zegarka (P-118 W4).

## Konfiguracja (`src/konfiguracja.ts`)
| Nazwa (jednostka) | Wartość | Źródło |
|---|---|---|
| `LIMIT_DNI_W_MIESIACU` (dni) | 5 | P-057 (D2), `limit.mjs` |
| `PRZERWA_NOWEGO_DNIA_MS` (ms) | 3 600 000 | P-057 (D3), `limit.mjs` |
| `OKNO_OFFLINE_PRO_MS` (ms) | 604 800 000 (7 dni) | P-103 (3a), `dostep.mjs` `LASKA_OFFLINE_MS` (jak Trening `OFFLINE_GRACE_DAYS = 7`): pamięć Pro przy błędzie sklepu działa do `wygasa` + ta wartość; ta sama liczba w stałych Swift `proZegarka` (KP-17, generator stałych z JSON, Z07-12) |
| `STRAZNIK_SERIA_ZDARZEN` (liczba dodań) | 3 | RD-17, P-047 |
| `STRAZNIK_OKNO_S` (s) | 2 | RD-17, P-047 |
| `KOSZ_DNI` (dni) | 30 | P-026 |
| `KOPIA_PRZED_IMPORTEM_DNI` (dni) | 30 | ADR-0004 (jak F-33) |
| `STAN_NAZWA_MAKS_ZNAKOW` (znaki) | 60 | [OCENA] roli 05 (Z07-12): nazwa na ekranie blokady i zegarku; ładunek < 4 KB (rejestr Apple 1b) |
| `STAN_PRZYPOMNIENIA_MAKS` (liczba) / `STAN_PRZYPOMNIENIE_TEKST_MAKS` (znaki) | 3 / 40 | [OCENA] roli 05 (Z07-12): plan przypomnień w stanie Live Activity i zegarka |
| `SESJA_MAKS_H` (h) | 8 | P-072 (7a); limit Live Activity 8 h (rejestr Apple 1a) |
| `PROG_NIEUDANYCH_STARTOW` (starty) | 2 | P-080 (interpretacja do weta), ADR-0019 (strażnik startu, rola 12) |
| `KOPIE_RATUNKOWE_DNI` (dni) | 30 | P-080, ADR-0020 (kopia ratunkowa, rola 12) |
| `WERSJA_SCHEMATU` (-) | 1 | `schemat.sql` |
| `WERSJA_FORMATU_ARCHIWUM` (-) | 1 | ADR-0004 |
| `ROZSZERZENIE_ARCHIWUM` | `.oczko` | ADR-0004 |
| `ZAPAS_MIEJSCA_EKSPORTU` (×rozmiar) | 2 | [OCENA] roli 05: archiwum + plik tymczasowy; do korekty po pomiarze |
| `BLEDY_MAKS_WIERSZY` (wiersze) | 200 | [OCENA] roli 05 (F-57: ostatnie błędy bez treści) |
| `PLIKI_OCHRONA_MIN` (min) | 10 | [OCENA] roli 05 (Z07-15): plik młodszy niż to nie jest sprzątany przy starcie (zapis pliku przed wierszem odwołania) |
| `RYSUNEK_ZAPIS_MS` (ms) | 1000 | ADR-0012 (uzupełnienie, Z07-17): najdłuższe opóźnienie zapisu rysunku |
| `WZOR_MAKS_MB` (MB) | 200 | [OCENA] roli 05 (Z07-17): największy plik przyjmowany przez rozszerzenie udostępniania; do korekty po pomiarze |
| `PIERWSZY_DZIEN_TYGODNIA` (1 = poniedziałek) | 1 | P-110 (Q7): tydzień od poniedziałku dla wszystkich języków, jak Trening |
| `POCZEKALNIA_DNI` (dni) | 7 | P-110 (Q1a): po tym czasie „niepełna historia” w Stanie danych, rekord zostaje |
| `PARTIA_SYNCHRONIZACJI` (wiersze na transakcję) | 200 | [OCENA] roli 05: krótkie transakcje przy scalaniu iCloud i importu (E3 §1); do korekty po pomiarze |
| `MIN_IOS` / `MIN_WATCHOS` | 18.0 / 11.0 | P-070, ADR-0006 |
| `PRODUKTY_PRO` (ID) | [DO USTALENIA] | P-038 (przy konfiguracji App Store Connect) |
| `CENY` | z App Store (StoreKit), nie z kodu | P-057, KP-* |
| Liczby obliczeń F-38, tabele drutów i szydełek RD-11/RD-19, kategorie grubości RD-10 | `docs/tresci/parametry.json` (rola 06) → kopia `src/domena/obliczenia/parametry.ts` | rejestr merytoryczny roli 06 (D-027); kopię tworzy `node scripts/domena/generuj-parametry.mjs` (ręcznie nie edytować), zgodność pilnuje `tests/domena/obliczenia/parametry-kopia.test.ts` w `verify` (P-118 S4) |
