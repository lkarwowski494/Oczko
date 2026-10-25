// Porty domeny: kopia sygnatur z docs/architektura/moduly.md („Porty domeny”), tylko typy. Zmiana = zmiana dokumentu roli 05
// (kontrola zgodności: docs/architektura/narzedzia/sprawdz-porty.mjs w `jakosc:kontrole`).
import type { Wynik } from './bledy';
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
