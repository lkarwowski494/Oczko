// Wynik operacji domeny (docs/architektura/moduly.md, „bledy.ts”). Powody są kontraktem dla ekranów i testów.
export type Powod =
  | 'zablokowany'
  | 'limit'
  | 'zapis'
  | 'bledne_dane'
  | 'niedozwolone_przejscie'
  | 'brak_miejsca'
  | 'wersja_nowsza'
  | 'uszkodzony'
  | 'za_duze'
  | 'konflikt';
export type Wynik<T> = { ok: true; wartosc: T } | { ok: false; powod: Powod };

/** Błąd danych wejściowych funkcji domeny rzucającej wyjątek (sygnatury 05/07 bez `Wynik`; wzorzec `BladDanych` z docs/monetyzacja/limit.mjs, Z07-07, R-178).
 * Wołający rozpoznaje go po `kod`, nie po dowolnym wyjątku. */
export class BladDanych extends Error {
  readonly kod = 'BLAD_DANYCH' as const;
  constructor(komunikat: string) {
    super(komunikat);
    this.name = 'BladDanych';
  }
}
