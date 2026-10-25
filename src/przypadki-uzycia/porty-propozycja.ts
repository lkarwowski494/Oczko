// Porty i typy, których moduly.md jeszcze nie ma (sygnatura: propozycja 07, do zatwierdzenia w sesji fix 05 (Z07-22)).
// Docelowo w src/domena/porty.ts; tu tymczasowo, bo rola 07 nie zmienia kopii sygnatur roli 05. Tylko typy.
import type { Wynik } from '../domena/bledy';
import type { PortBazy } from '../domena/porty';

export type Licznosci = Record<string, number>;           // tabela → liczba wierszy
export type Katalogi = { kopie: string; tymczasowy: string }; // Application Support/kopie (dane.md), katalog tymczasowy importu
/** manifest.json archiwum `.oczko` (dane.md „Kopie i eksport”, ADR-0004); nazwa pola liczności: propozycja 07. */
export type Manifest = {
  format: 'oczko';
  wersja_formatu: number;
  wersja_schematu: number;
  aplikacja: string;
  utworzono: number;
  licznosci: Licznosci;
  pliki: { sha256: string; bajty: number }[];
};
export type TrybImportu = 'scal' | 'zastap';
export type ArchiwumSprawdzone = { manifest: Manifest; katalog: string }; // rozpakowane i sprawdzone w katalogu tymczasowym
export type WynikImportu = { tryb: TrybImportu | 'anulowano'; kopiaPrzed: string | null; licznosci: Licznosci };
export type Migracja = { wersja: number; sql: string; przebudowa?: boolean };
export type Migruj = (baza: PortBazy) => Promise<Wynik<{ z: number; do: number }>>;

/** Archiwum `.oczko` po stronie danych (ADR-0004); implementacja: src/dane/archiwum.ts. */
export interface PortArchiwum {
  zapisz(katalogDocelowy: string): Promise<Wynik<{ sciezka: string; manifest: Manifest }>>; // VACUUM INTO + pliki + manifest
  sprawdz(sciezka: string): Promise<Wynik<ArchiwumSprawdzone>>;                              // manifest, wersje, SHA-256, miejsce; baza bez zmian
  kopiaPrzed(): Promise<Wynik<{ sciezka: string }>>;                                         // „kopia przed importem” (KOPIA_PRZED_IMPORTEM_DNI)
  wczytaj(a: ArchiwumSprawdzone, tryb: TrybImportu): Promise<Wynik<{ licznosci: Licznosci }>>;
}
